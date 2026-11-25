// ISO/IEC 18004 Model 2, byte mode, error correction M. Each row gives the
// data codewords, number of Reed–Solomon blocks and parity codewords per block.
const versions = [
  [16, 1, 10], [28, 1, 16], [44, 1, 26], [64, 2, 18], [86, 2, 24],
  [108, 4, 16], [124, 4, 18], [154, 4, 22], [182, 5, 22], [216, 5, 26],
  [254, 5, 30], [290, 8, 22], [334, 9, 22], [365, 9, 24], [415, 10, 24],
  [453, 10, 28], [507, 11, 28], [563, 13, 26], [627, 14, 26], [669, 16, 26],
  [714, 17, 26], [782, 17, 28], [860, 18, 28], [914, 20, 28], [1000, 21, 28],
] as const

function dataCodewords(payload: Uint8Array, capacity: number, countBits: number) {
  const words = new Uint8Array(capacity)
  let position = 0
  function append(value: number, length: number) {
    for (let bit = length - 1; bit >= 0; bit--, position++)
      words[position >>> 3] |= ((value >>> bit) & 1) << (7 - (position & 7))
  }
  append(4, 4) // Byte mode
  append(payload.length, countBits)
  for (const octet of payload) append(octet, 8)
  // The zero-initialized terminator completes the last octet.
  const firstPad = Math.ceil(Math.min(capacity * 8, position + 4) / 8)
  for (let i = firstPad; i < capacity; i++)
    words[i] = (i - firstPad) % 2 === 0 ? 0xec : 0x11
  return words
}

function multiply(a: number, b: number) {
  let result = 0
  while (b) {
    if (b & 1) result ^= a
    b >>>= 1
    a <<= 1
    if (a & 0x100) a ^= 0x11d
  }
  return result
}

function interleave(data: Uint8Array, blockCount: number, parityCount: number) {
  let generator = [1]
  let root = 1
  for (let i = 0; i < parityCount; i++) {
    const next = [...generator, 0]
    for (let j = 0; j < generator.length; j++) next[j + 1] ^= multiply(generator[j], root)
    generator = next
    root = multiply(root, 2)
  }

  const shortLength = Math.floor(data.length / blockCount)
  const shortBlocks = blockCount - data.length % blockCount
  const blocks: Uint8Array[] = []
  const parity: Uint8Array[] = []
  let offset = 0
  for (let i = 0; i < blockCount; i++) {
    const length = shortLength + Number(i >= shortBlocks)
    const block = data.subarray(offset, offset + length)
    offset += length
    const remainder = new Uint8Array(parityCount)
    for (const octet of block) {
      const factor = octet ^ remainder[0]
      for (let j = 0; j < parityCount; j++)
        remainder[j] = (remainder[j + 1] ?? 0) ^ multiply(generator[j + 1], factor)
    }
    blocks.push(block)
    parity.push(remainder)
  }

  const result: number[] = []
  for (const group of [blocks, parity]) {
    for (let i = 0; i < group[blockCount - 1].length; i++) {
      for (const block of group) {
        if (i < block.length) result.push(block[i])
      }
    }
  }
  return result
}

function bch(data: number, degree: number, generator: number) {
  let remainder = data
  for (let i = 0; i < degree; i++) {
    remainder <<= 1
    if (remainder & (1 << degree)) remainder ^= generator
  }
  return (data << degree) | remainder
}

type Draw = (x: number, y: number, dark: boolean) => void

function formatBits(size: number, mask: number, draw: Draw) {
  // Level M is binary 00 in the two high data bits.
  const format = bch(mask, 10, 0x537) ^ 0x5412
  const bit = (i: number) => Boolean(format & (1 << i))
  for (let i = 0; i < 6; i++) draw(8, i, bit(i))
  draw(8, 7, bit(6))
  draw(8, 8, bit(7))
  draw(7, 8, bit(8))
  for (let i = 9; i < 15; i++) draw(14 - i, 8, bit(i))
  for (let i = 0; i < 8; i++) draw(size - 1 - i, 8, bit(i))
  for (let i = 8; i < 15; i++) draw(8, size - 15 + i, bit(i))
  draw(8, size - 8, true)
}

function drawPatterns(version: number, size: number, draw: Draw) {
  for (let i = 0; i < size; i++) {
    draw(6, i, i % 2 === 0)
    draw(i, 6, i % 2 === 0)
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let y = Math.max(0, cy - 4); y <= Math.min(size - 1, cy + 4); y++)
      for (let x = Math.max(0, cx - 4); x <= Math.min(size - 1, cx + 4); x++) {
        const radius = Math.max(Math.abs(x - cx), Math.abs(y - cy))
        draw(x, y, radius === 3 || radius <= 1)
      }
  }
  if (version > 1) {
    const count = Math.floor(version / 7) + 2
    const step = 2 * Math.ceil((size - 13) / (2 * (count - 1)))
    const last = size - 7
    const centers = Array.from({ length: count }, (_, i) => i === 0 ? 6 : last - (count - 1 - i) * step)
    for (const cx of centers) {
      for (const cy of centers) {
        // Finder and separator patterns occupy three corners of this grid.
        if ((cx === 6 && (cy === 6 || cy === last)) || (cy === 6 && cx === last)) continue
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++)
            draw(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
        }
      }
    }
  }
  if (version >= 7) {
    const info = bch(version, 12, 0x1f25)
    for (let i = 0; i < 18; i++) {
      const x = size - 11 + i % 3
      const y = Math.floor(i / 3)
      const dark = Boolean(info & (1 << i))
      draw(x, y, dark)
      draw(y, x, dark)
    }
  }
  formatBits(size, 0, draw)
}

const masks = [
  (x: number, y: number) => (x + y) % 2 === 0,
  (_x: number, y: number) => y % 2 === 0,
  (x: number) => x % 3 === 0,
  (x: number, y: number) => (x + y) % 3 === 0,
  (x: number, y: number) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x: number, y: number) => (x * y) % 2 + (x * y) % 3 === 0,
  (x: number, y: number) => ((x * y) % 2 + (x * y) % 3) % 2 === 0,
  (x: number, y: number) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
]

function linePenalty(line: boolean[]) {
  const runs: number[] = []
  let dark = false
  let length = 0
  let penalty = 0
  for (const cell of line) {
    if (cell !== dark) {
      runs.push(length)
      dark = cell
      length = 0
    }
    length++
    if (length === 5) penalty += 3
    else if (length > 5) penalty++
  }
  runs.push(length)
  if (dark) runs.push(0)
  // Finder-like run ratios count in both directions, including the quiet zone.
  runs[0] += line.length
  runs[runs.length - 1] += line.length
  for (let i = 1; i + 5 < runs.length; i += 2) {
    const unit = runs[i]
    if (runs[i + 1] !== unit || runs[i + 2] !== 3 * unit || runs[i + 3] !== unit || runs[i + 4] !== unit) continue
    if (runs[i - 1] >= 4 * unit && runs[i + 5] >= unit) penalty += 40
    if (runs[i + 5] >= 4 * unit && runs[i - 1] >= unit) penalty += 40
  }
  return penalty
}

function score(matrix: boolean[][]) {
  const size = matrix.length
  let penalty = 0
  let dark = 0
  for (let y = 0; y < size; y++) {
    penalty += linePenalty(matrix[y]) + linePenalty(matrix.map(row => row[y]))
    for (let x = 0; x < size; x++) {
      const cell = matrix[y][x]
      if (cell) dark++
      if (x && y && cell === matrix[y - 1][x] && cell === matrix[y][x - 1] && cell === matrix[y - 1][x - 1])
        penalty += 3
    }
  }
  return penalty + 10 * Math.floor(Math.abs(20 * dark - 10 * size * size) / (size * size))
}

/** Encodes UTF-8 without a BOM in the smallest byte-mode QR symbol up to version 25. */
export function qrMatrix(text: string): boolean[][] {
  const payload = new TextEncoder().encode(text)
  // The byte-mode indicator and length occupy 12 bits through v9 and 20 thereafter.
  const index = versions.findIndex(([capacity], i) => payload.length <= capacity - (i < 9 ? 2 : 3))
  if (index < 0) throw new RangeError('The QR payload exceeds the 997-byte capacity of version 25-M.')
  const [capacity, blockCount, parityCount] = versions[index]
  const version = index + 1
  const words = interleave(dataCodewords(payload, capacity, version < 10 ? 8 : 16), blockCount, parityCount)
  const size = 17 + 4 * version
  const empty = (): boolean[][] => Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const base = empty()
  const fixed = empty()
  drawPatterns(version, size, (x, y, dark) => {
    base[y][x] = dark
    fixed[y][x] = true
  })

  let bit = 0
  let upward = true
  // Alternating two-column strips carry the interleaved bits around fixed patterns.
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--
    for (let row = 0; row < size; row++) {
      const y = upward ? size - 1 - row : row
      for (let x = right; x >= right - 1; x--) {
        if (fixed[y][x]) continue
        base[y][x] = Boolean((words[bit >>> 3] ?? 0) & (128 >>> (bit & 7)))
        bit++
      }
    }
    upward = !upward
  }
  let bestScore = Infinity
  let best = base
  for (const [mask, invert] of masks.entries()) {
    const candidate = base.map((row, y) => row.map((dark, x) =>
      !fixed[y][x] && invert(x, y) ? !dark : dark))
    formatBits(size, mask, (x, y, dark) => { candidate[y][x] = dark })
    const penalty = score(candidate)
    if (penalty < bestScore) {
      bestScore = penalty
      best = candidate
    }
  }
  return best
}
