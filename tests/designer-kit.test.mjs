import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { kitTokens, screenGrid, tokenPixels } from '../scripts/designer-kit.mjs'
import { gridSheet } from '../scripts/print-designer-sheet.mjs'

test('both designer formats expose the same tokens, including dark ink and the grid breakpoints', async () => {
  for (const mode of ['light', 'dark']) {
    const { tokens, grids, config } = await kitTokens(mode)
    assert.deepEqual(Object.keys(tokens.al), Object.keys(config.tokens.al))
    assert.deepEqual(grids.map(g => [g.columns, g.minimum, g.gutter, g.margin]), [[4,0,12,16],[8,576,16,24],[12,864,24,32]])
    for (const [i, grid] of grids.entries()) {
      const width = [390,768,1440][i]
      const svg = screenGrid(grid, width, 900)
      const tracks = [...svg.matchAll(/<rect x="([^"]+)" width="([^"]+)"/g)]
      assert.equal(tracks.length, grid.columns)
      assert.equal(Number(tracks[0][1]), grid.margin)
      assert.ok(Math.abs(Number(tracks.at(-1)[1]) + Number(tracks.at(-1)[2]) - (width - grid.margin)) < 0.001)
    }
    assert.equal(tokenPixels(tokens, 'leading-heading'), 28)
    assert.equal(tokenPixels(tokens, 'type-label'), 14)
    assert.deepEqual(tokens.al.accent.$value.components, mode === 'light' ? [235/255,0,0] : [1,82/255,82/255])
    assert.equal(config.tokens.al.danger.value, '{al.accent}')
    assert.equal(config.platforms.css.files[0].destination, 'alpina-' + mode + '.css')
    assert.deepEqual(tokens.al.font.$value.slice(0, 2), ['Inter Variable', 'Helvetica Neue'])
  }
})

test('the editable A4 artboard matches the published type scale and printable asset', async () => {
  const svg = await gridSheet()
  const reference = await readFile(new URL('../web/assets/alpina-grid.svg', import.meta.url), 'utf8')
  assert.equal(reference.replaceAll('\r\n','\n'), svg)
  assert.match(svg, /width="210mm" height="297mm"/)
  for (const n of [4,8,12]) {
    const group = svg.split('<g id="grid-' + n + '">')[1].split('</g>')[0]
    assert.equal(group.match(/fill="#f7dddd"/g)?.length, n)
  }
  const baseline = svg.split('<g id="baseline-4">')[1].split('</g>')[0]
  assert.deepEqual([...baseline.matchAll(/<rect x="205" y="(\d+)"/g)].map(match => +match[1]), Array.from({ length: 9 }, (_, i) => 984 + i * 4))
  const pdf = await readFile(new URL('../web/assets/alpina-grid.pdf', import.meta.url), 'latin1')
  assert.match(pdf, /^%PDF-/)
  const [, w,h] = pdf.match(/\/MediaBox\s*\[0 0 ([\d.]+) ([\d.]+)\]/)
  assert.ok(Math.abs(+w - 210 * 72/25.4) < 1 && Math.abs(+h - 297 * 72/25.4) < 1)
  assert.equal(pdf.match(/\/Type\s*\/Page\b/g)?.length, 1)
})
