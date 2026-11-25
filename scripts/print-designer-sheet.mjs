// Regenerate with the pinned Playwright Chromium after editing the grid, font or typographic scale.
import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { kitTokens, tokenPixels } from './designer-kit.mjs'

export async function gridSheet() {
  const { tokens, grids } = await kitTokens('light')
  const red = '#eb0000', ink = '#000000', pale = '#f7dddd'
  // A4 in CSS pixels at 96 dpi. The type samples therefore print at the size shown.
  const width = 210 * 96 / 25.4, height = 297 * 96 / 25.4
  const inset = 40, right = width - inset
  const rect = (x, y, w, h, fill) => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>'
  const type = (x, y, size, text, weight = 400, fill = ink) => '<text x="'+x+'" y="'+y+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'">'+text+'</text>'
  const nodes = [rect(0,0,width,height,'#ffffff'), type(inset,65,18,'Alpina UI',650),type(inset,145,72,'Grid and type',700,red)]
  nodes.push(type(inset,184,18,'A4 working sheet  /  Four-pixel baseline  /  Print at 100%'))
  grids.forEach(({columns, gutter, margin, minimum}, i) => {
    const y = 220 + i * 106
    const track = (right - inset - 2*margin - (columns-1)*gutter) / columns
    nodes.push('<g id="grid-'+columns+'">',rect(inset,y,right-inset,1,ink),
      type(inset,y+24,18,columns+' columns',650),
      type(212,y+24,14,'Container '+minimum+' px and up  /  Margin '+margin+' px  /  Gutter '+gutter+' px'))
    for (let j=0; j<columns; j++) {
      const x = inset + margin + j*(track+gutter)
      nodes.push(rect(x,y+36,track,48,pale),rect(x,y+36,1,48,red))
    }
    nodes.push('</g>')
  })
  nodes.push(rect(inset,554,right-inset,1,ink),type(inset,591,30,'Type scale',650),
    type(inset,621,14,'Role'),type(205,621,14,'Size / leading (px)'),type(417,621,14,'Specimen'))
  const roles = [['caption','Caption'],['label','Label'],['body','Body'],['heading','Heading'],['display','Display'],['display-lg','Display large']]
  let y = 640
  for (const [role, name] of roles) {
    const size = tokenPixels(tokens, 'type-'+role), leading = tokenPixels(tokens, 'leading-'+role)
    const baseline = Math.ceil((y + Math.max(24, size)) / 4) * 4
    nodes.push('<g id="type-'+role+'">',rect(inset,y,right-inset,0.6,'#aaa'),
      type(inset,baseline,14,name),type(205,baseline,14,size+' / '+leading),
      type(417,baseline,size,'Aa 0123',role==='caption'||role==='body'?400:650),'</g>')
    y = baseline + 16
  }
  nodes.push('<g id="baseline-4">', type(inset,1008,14,'4 px baseline'))
  for (let n=0; n<=8; n++) nodes.push(rect(205, 984+n*4, right-205, n%4===0 ? 1 : 0.5, n%4===0 ? red : '#aaa'))
  nodes.push('</g>')
  nodes.push(rect(inset,1044,right-inset,2,ink),type(inset,1072,14,'Alpina UI  /  Inter Variable'),type(417,1072,14,'alpina-ui.vercel.app/kit/'))
  return '<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 '+width+' '+height+'" font-family="Inter Variable, Inter, Helvetica, Arial, sans-serif" role="img" aria-labelledby="sheet-title sheet-desc">\n<title id="sheet-title">Alpina grid and type sheet</title>\n<desc id="sheet-desc">Three editable column grids and six type specimens. Positions use CSS pixels at 96 dpi.</desc>\n'+nodes.join('\n')+'\n</svg>\n'
}

if (process.argv[1]?.endsWith('print-designer-sheet.mjs')) {
  const svg = await gridSheet()
  const font = await readFile(new URL('../src/fonts/inter-latin-wght-normal.woff2', import.meta.url))
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent('<!doctype html><html lang="en"><title>Alpina grid and type sheet</title><style>@font-face{font-family:"Inter Variable";src:url(data:font/woff2;base64,'+font.toString('base64')+') format("woff2");font-weight:100 900}@page{size:A4;margin:0}*{margin:0}svg{display:block;width:210mm;height:297mm}</style>'+svg+'</html>')
    await page.evaluate(() => document.fonts.ready)
    await writeFile(new URL('../web/assets/alpina-grid.svg', import.meta.url), svg)
    await writeFile(new URL('../web/assets/alpina-grid.pdf', import.meta.url), await page.pdf({ preferCSSPageSize:true, printBackground:true, tagged:true }))
  } finally { await browser.close() }
}
