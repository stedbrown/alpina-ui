import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { build } from 'esbuild'
import { launchBrowser } from './launch-browser.mjs'

const source = await build({
  stdin: { loader: 'tsx', resolveDir: process.cwd(), contents: `
    import { createRoot } from 'react-dom/client'
    import { Calendar, DatePicker } from 'alpina-ui'
    import 'alpina-ui/styles.css'
    const booking = {
      defaultMonth: '2027-08', locale: 'it-CH', canton: 'TI', disableHolidays: true,
      isDateDisabled: day => day === '2027-08-03',
      dayStatus: day => day === '2027-08-04' ? 'full' : day === '2027-08-05' ? 'closed' : 'available',
      onValueChange: day => window.chosen.push(day),
      ...window.initialBooking,
    }
    window.chosen = []
    createRoot(document.querySelector('main')).render(<><Calendar {...booking} />
      <DatePicker {...booking} label="Booking" name="appointment" showWeekNumbers /></>)
  ` }, bundle: true, write: false, outfile: 'app.js', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
})
const browser = await launchBrowser()
try {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } })
  page.setDefaultTimeout(10_000)
  await page.setContent('<!doctype html><html lang="it"><main></main></html>')
  await page.addStyleTag({ content: source.outputFiles.find(file => file.path.endsWith('.css')).text })
  await page.addScriptTag({ content: source.outputFiles.find(file => file.path.endsWith('.js')).text })
  async function exercise(calendar) {
    const day = date => calendar.locator('[data-day="2027-08-' + date + '"]')
    const before = await page.evaluate(() => window.chosen.length)
    for (const [date, label] of [['01', 'Chiuso'], ['03', 'Chiuso'], ['04', 'Al completo'], ['05', 'Chiuso']]) {
      assert.ok(await day(date).isDisabled())
      assert.ok((await day(date).getAttribute('aria-label')).includes(label))
      await day(date).press('Enter')
      await day(date).dispatchEvent('click')
    }
    assert.equal(await page.evaluate(() => window.chosen.length), before)
    await day('03').press('ArrowRight')
    assert.equal(await calendar.locator('[data-day]:focus').getAttribute('data-day'), '2027-08-04')
    const weekend = await day('07').evaluate(el => getComputedStyle(el.parentElement).backgroundColor)
    const weekday = await day('06').evaluate(el => getComputedStyle(el.parentElement).backgroundColor)
    assert.notEqual(weekend, weekday)
    assert.equal(await day('06').getAttribute('data-status'), 'available')
    assert.match(await day('06').getAttribute('aria-label'), /Disponibile/)
    await day('06').press('Space')
    assert.equal(await page.evaluate(() => window.chosen.at(-1)), '2027-08-06')
  }
  await exercise(page.locator('main > .al-calendar'))
  await page.getByRole('button', { name: 'Booking' }).click()
  const picker = page.getByRole('dialog')
  assert.equal(await picker.getByRole('columnheader').count(), 8)
  await exercise(picker.locator('.al-calendar'))
  assert.equal(await picker.count(), 0)
  assert.equal(await page.locator('input[name=appointment]').inputValue(), '2027-08-06')
  console.log('Verified booking status, holiday closures, weekends and keyboard selection in both calendars.')
} finally { await browser.close() }

function luminance(rgb) {
  const linear = rgb.map(n => n / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722
}

async function checkPaintedSelection(day, closed) {
  assert.equal(await day.getAttribute('data-status'), closed ? 'closed' : 'available')
  assert.ok((await day.getAttribute('aria-label')).includes(closed ? 'Chiuso' : 'Disponibile'))
  const measure = await day.evaluate(el => {
    const box = el.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(el)
    const text = range.getBoundingClientRect()
    const style = getComputedStyle(el)
    const rgb = css => css.match(/\d+/g).slice(0, 3).map(Number)
    return {
      x: Math.ceil(text.left - box.left), y: Math.ceil(text.top - box.top),
      right: Math.floor(text.right - box.left), bottom: Math.floor(text.bottom - box.top),
      fg: rgb(style.color), bg: rgb(style.backgroundColor), strike: style.textDecorationLine,
      border: style.borderBottomStyle, marker: getComputedStyle(el, '::after').borderBottomColor,
      color: style.color, holiday: el.hasAttribute('data-holiday'),
    }
  })
  assert.ok(measure.holiday)
  assert.equal(measure.marker, measure.color, 'Holiday marker follows the selected ink')
  assert.equal(measure.border, closed ? 'dashed' : 'solid', 'Booking status survives selection')
  assert.equal(measure.strike.includes('line-through'), closed)
  const [lo, hi] = [measure.fg, measure.bg].map(luminance).sort((a, b) => a - b)
  assert.ok((hi + .05) / (lo + .05) >= 4.5, 'Selected date needs contrasting text and paper')
  const png = PNG.sync.read(await day.screenshot())
  // The hard-to-see failure was a single solid backplate in place of both digits.
  // Find two separate runs of painted foreground inside the text box for “15”.
  let distinctDigits = false
  for (let y = measure.y; y < measure.bottom; y++) {
    let runs = 0, last = false
    for (let x = measure.x; x < measure.right; x++) {
      const at = 4 * (y * png.width + x)
      const ink = measure.fg.every((n, i) => Math.abs(png.data[at + i] - n) < 48)
      if (ink && !last) runs++
      last = ink
    }
    if (runs > 1) distinctDigits = true
  }
  assert.ok(distinctDigits, 'Both digits must be painted, with a gap between them')
}

for (const theme of ['light', 'dark']) {
  const browser = await launchBrowser(theme)
  try {
    for (const closed of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 360, height: 800 }, colorScheme: theme, forcedColors: 'active' })
      await page.setContent('<!doctype html><html lang="it" data-al-theme="' + theme + '"><main></main></html>')
      await page.evaluate(closed => { window.initialBooking = { defaultValue: '2027-08-15', disableHolidays: closed } }, closed)
      await page.addStyleTag({ content: source.outputFiles.find(f => f.path.endsWith('.css')).text })
      await page.addScriptTag({ content: source.outputFiles.find(f => f.path.endsWith('.js')).text })
      const selected = page.locator('main > .al-calendar [aria-selected="true"] button')
      await selected.hover({ force: true })
      await checkPaintedSelection(selected, closed)
      await page.getByRole('button', { name: /^Booking/ }).click()
      await checkPaintedSelection(page.getByRole('dialog').locator('[aria-selected="true"] button'), closed)
      await page.close()
    }
  } finally { await browser.close() }
}
console.log('Verified selected holiday dates and booking status in both native high-contrast palettes.')
