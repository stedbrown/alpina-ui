import assert from 'node:assert/strict'
import test from 'node:test'
import jsQR from 'jsqr'
import { qrMatrix } from '../dist/swiss/qr-matrix.js'

// ISO/IEC 18004 Model 2, error correction M, byte-mode limits. The change
// from an 8-bit to a 16-bit length field is visible at the v9/v10 boundary.
const capacities = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287,
  331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997]
const mediumFormat = [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0]

function verifyFormat(matrix) {
  const n = matrix.length
  let format = 0
  for (let i = 0; i < 15; i++) {
    const value = i < 8 ? matrix[8][n - 1 - i] : matrix[n - 15 + i][8]
    if (value) format |= 1 << i
  }
  assert.ok(mediumFormat.includes(format), 'format declares level M and a valid mask')
}

function scan(matrix, withCross) {
  const side = matrix.length
  const pixelsPerModule = 5
  // Use 5 mm of white space around the 46 mm symbol.
  const pad = Math.max(4, Math.ceil(5 * side / 46))
  const size = pixelsPerModule * (side + 2 * pad)
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const row = Math.floor(y / pixelsPerModule) - pad
      const column = Math.floor(x / pixelsPerModule) - pad
      let dark = matrix[row]?.[column] ?? false
      if (withCross) {
        const dx = 46 * Math.abs(x + 0.5 - size / 2) / (side * pixelsPerModule)
        const dy = 46 * Math.abs(y + 0.5 - size / 2) / (side * pixelsPerModule)
        // 7 mm square, white keyline and a centered white cross.
        if (Math.max(dx, dy) <= 3.5)
          dark = Math.max(dx, dy) < 3.1 && !(Math.min(dx, dy) < 0.65 && Math.max(dx, dy) < 2.0)
      }
      if (!dark) continue
      const p = 4 * (y * size + x)
      pixels[p] = pixels[p + 1] = pixels[p + 2] = 0
    }
  }
  return jsQR(pixels, size, size, { inversionAttempts: 'dontInvert' })
}

function verifyRoundTrip(payload, version) {
  const bytes = Buffer.from(payload, 'utf8')
  const matrix = qrMatrix(payload)
  assert.equal(matrix.length, 17 + 4 * version)
  assert.ok(matrix.every(row => row.length === matrix.length && row.every(value => typeof value === 'boolean')))
  verifyFormat(matrix)
  for (const cross of [false, true]) {
    const decoded = scan(matrix, cross)
    assert.ok(decoded, 'scan with cross=' + cross + ', version=' + version)
    assert.equal(decoded.version, version)
    assert.equal(decoded.data, payload)
    assert.deepEqual(Buffer.from(decoded.binaryData), bytes)
    assert.deepEqual(decoded.chunks.map(chunk => chunk.type), ['byte'])
  }
}

test('every byte-mode size is minimal and independently decodes at both capacity boundaries', () => {
  const characters = 'ALPINA/0123456789abcdefghijklmnopqrstuvwxyz.-:'
  for (const [i, maximum] of capacities.entries()) {
    const minimum = i === 0 ? 1 : capacities[i - 1] + 1
    for (const length of [minimum, maximum]) {
      const payload = characters.repeat(Math.ceil(length / characters.length)).slice(0, length)
      verifyRoundTrip(payload, i + 1)
    }
  }
})

test('Swiss payment fields preserve line endings, accents, blank fields and byte counts', () => {
  const lines = [
    'SPC', '0200', '1', 'CH5800791123000889012',
    'S', 'Atelier Étude', 'Rue du Lac', '3', '1003', 'Lausanne', 'CH',
    '', '', '', '', '', '', '', '211.00', 'CHF',
    'S', 'Büro Süd', 'Brunnenweg', '4', '3000', 'Bern', 'CH', 'NON', '', 'Édition 42', 'EPD',
  ]
  for (const separator of ['\n', '\r\n']) {
    const payload = lines.join(separator)
    const version = 1 + capacities.findIndex(limit => limit >= Buffer.byteLength(payload))
    verifyRoundTrip(payload, version)
  }
  verifyRoundTrip('é'.repeat(498) + 'x', 25)
  assert.throws(() => qrMatrix('é'.repeat(499)), RangeError)
  assert.throws(() => qrMatrix('x'.repeat(998)), RangeError)
})
