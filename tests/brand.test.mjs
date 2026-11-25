import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PNG } from 'pngjs'

test('published brand assets have the dimensions advertised by browsers and sharing cards', async () => {
  const asset = name => readFile(new URL('../web/assets/' + name, import.meta.url))
  const manifest = JSON.parse(await asset('site.webmanifest'))
  for (const [file, width, height] of [
    ...manifest.icons.map(({ src, sizes }) => [src.split('/').pop(), ...sizes.split('x').map(Number)]),
    ['apple-touch-icon.png', 180, 180], ['alpina-preview.png', 1200, 630],
  ]) {
    const image = PNG.sync.read(await asset(file))
    assert.deepEqual([image.width, image.height], [width, height], file)
  }
  const icon = await asset('favicon.ico')
  assert.deepEqual([...icon.subarray(0, 8)], [0, 0, 1, 0, 1, 0, 32, 32])
  const pixels = PNG.sync.read(icon.subarray(icon.readUInt32LE(18)))
  assert.deepEqual([pixels.width, pixels.height], [32, 32])
  const mark = PNG.sync.read(await asset('alpina-mark.png'))
  function pixel(x, y) { return [...mark.data.slice((64 * y + x) * 4, (64 * y + x) * 4 + 3)] }
  for (const point of [[32, 11], [16, 44], [48, 44]]) assert.deepEqual(pixel(...point), [255, 255, 255])
  for (const point of [[32, 38], [32, 50], [2, 2]]) assert.deepEqual(pixel(...point), [235, 0, 0])
  assert.deepEqual(await asset('favicon.svg'), await asset('logo.svg'))
  assert.match(String(await asset('logo-mono.svg')), /currentColor/)
})
