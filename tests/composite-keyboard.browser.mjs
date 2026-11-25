import assert from 'node:assert/strict'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await launchBrowser()
try {
  const page = await openPublicPage(browser, { viewport: { width: 1280, height: 900 } })
  // Exercise the public, hydrated examples. The shell fires this event after installing its handlers.
  await page.addInitScript(() => {
    document.addEventListener('alpina-index-ready', () => { window.catalogReady = true }, { capture: true, once: true })
  })
  page.setDefaultTimeout(5000)
  const preview = page.locator('.al-preview-content')
  const role = (name, label) => preview.getByRole(name, label ? { name: label, exact: true } : {})
  const checked = new Set()
  async function visit(slug) {
    await page.goto(siteOrigin + '/docs/components/' + slug + '/')
    await page.waitForFunction(() => window.catalogReady)
    await preview.locator(':scope > *').first().waitFor()
    checked.add(slug)
  }
  async function focused(locator) {
    await locator.waitFor()
    const handle = await locator.elementHandle()
    try {
      await page.waitForFunction(node => node === document.activeElement, handle, { timeout: 3000 })
    } finally { await handle.dispose() }
  }

  for (const [slug, triggerName] of [
    ['alert-dialog', 'Archive draft'], ['dialog', 'Review proof'], ['drawer', 'Rename draft'], ['sheet', 'Filter'],
    ['command', 'Find a collection'], ['popover', 'Print run · 1'],
  ]) {
    await visit(slug)
    const trigger = role('button', triggerName)
    await trigger.press('Enter')
    const panel = role(slug === 'alert-dialog' ? 'alertdialog' : 'dialog')
    await panel.waitFor()
    if (slug === 'alert-dialog') await focused(panel.getByRole('button', { name: 'Keep in queue' }))
    if (slug === 'command') {
      const search = panel.getByRole('combobox')
      await focused(search)
      await search.press('ArrowDown')
      assert.ok(await search.getAttribute('aria-activedescendant'), 'Command highlights a result')
    }
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })
    await focused(trigger)
  }

  for (const slug of ['accordion', 'tabs', 'multilingual-field', 'toggle-group']) {
    await visit(slug)
    const accordion = slug === 'accordion'
    const choices = role(accordion || slug === 'toggle-group' ? 'button' : 'tab')
    const target = choices.nth(1)
    await choices.first().press(accordion ? 'ArrowDown' : 'ArrowRight')
    await focused(target)
    if (accordion || slug === 'toggle-group') await target.press('Space')
    const state = accordion ? 'aria-expanded' : slug === 'toggle-group' ? 'aria-pressed' : 'aria-selected'
    assert.equal(await target.getAttribute(state), 'true', slug)
  }

  for (const slug of ['canton-combobox', 'combobox']) {
    await visit(slug)
    const input = role('combobox')
    await input.press('ArrowDown')
    await role('listbox').waitFor()
    await input.press('Enter')
    assert.ok(await input.inputValue(), slug + ' commits an option')
    assert.equal(await input.getAttribute('aria-expanded'), 'false')
  }

  for (const slug of ['dropdown-menu', 'menubar', 'context-menu']) {
    await visit(slug)
    const trigger = slug === 'context-menu' ? role('group', 'Proof actions') : role(slug === 'menubar' ? 'menuitem' : 'button').first()
    await trigger.press(slug === 'context-menu' ? 'Shift+F10' : 'ArrowDown')
    const options = role('menu').getByRole('menuitem')
    await focused(options.first())
    await page.keyboard.press('End')
    await focused(options.last())
    await page.keyboard.press('Escape')
    await role('menu').waitFor({ state: 'hidden' })
    await focused(trigger)
  }

  for (const slug of ['calendar', 'date-picker']) {
    await visit(slug)
    if (slug === 'date-picker') await role('button').first().press('Enter')
    const active = preview.locator('[data-day][tabindex="0"]')
    const initial = await active.getAttribute('data-day')
    await active.press('ArrowRight')
    const next = await active.getAttribute('data-day')
    assert.notEqual(next, initial, slug)
    await active.press('Enter')
    if (slug === 'calendar') assert.equal(await preview.locator('[aria-selected="true"] [data-day]').getAttribute('data-day'), next)
    else {
      await role('dialog').waitFor({ state: 'hidden' })
      assert.equal(await preview.locator('time').getAttribute('datetime'), next)
      await focused(role('button').first())
    }
  }

  for (const slug of ['collapsible', 'trace', 'chart', 'bar-chart', 'line-chart', 'sparkline']) {
    await visit(slug)
    const details = preview.locator('details').first()
    const wasOpen = await details.evaluate(el => el.open)
    await details.locator('summary').press('Space')
    assert.notEqual(await details.evaluate(el => el.open), wasOpen, slug)
  }

  for (const [slug, detail, name] of [['tooltip', 'tooltip', 'Definition of bleed'], ['hover-card', 'region', 'Type size']]) {
    await visit(slug)
    const trigger = role('button', name)
    await trigger.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await role(detail).waitFor()
    await page.keyboard.press('Escape')
    await role(detail).waitFor({ state: 'hidden' })
    await focused(trigger)
  }

  await visit('data-table')
  const sort = role('columnheader').getByRole('button').first()
  await sort.press('Enter')
  assert.ok(await preview.locator('th[aria-sort]').count())
  await focused(sort)

  await visit('carousel')
  const carousel = role('region')
  await carousel.press('End')
  await role('group', 'Format').waitFor()
  await carousel.press('Home')
  await role('group', 'Paper').waitFor()

  await visit('resizable')
  const divider = role('separator')
  await divider.press('End')
  assert.equal(await divider.getAttribute('aria-valuenow'), await divider.getAttribute('aria-valuemax'))
  await divider.press('Home')
  assert.equal(await divider.getAttribute('aria-valuenow'), await divider.getAttribute('aria-valuemin'))

  await visit('radio-group')
  const radios = role('radio')
  await radios.first().press('ArrowRight')
  assert.ok(await radios.nth(1).isChecked())

  await visit('questionnaire')
  await role('radio').first().press('Space')
  await role('button', 'Next').press('Enter')
  await focused(role('heading'))

  await visit('button-group')
  const last = role('button').last()
  await role('button').first().press('Tab')
  await focused(last)
  await last.press('Space')
  assert.equal(await last.getAttribute('aria-pressed'), 'true')

  await visit('input-otp')
  const otp = role('textbox')
  await otp.press('End')
  await otp.press('5')
  assert.equal(await otp.inputValue(), '045')
  await otp.press('Backspace')
  assert.equal(await otp.inputValue(), '04')

  for (const [slug, label] of [
    ['canton-select', 'Canton'], ['locale-select', 'Correspondence language'],
    ['native-select', 'Print format'], ['select', 'Paper size'],
  ]) {
    await visit(slug)
    const select = role('combobox', label)
    const options = await select.evaluate(el => [...el.options].filter(o => !o.matches(':disabled')).map(o => o.value))
    assert.ok(options.length > 1, slug)
    const original = await select.inputValue()
    await select.press('Space')
    await page.keyboard.press('Home')
    assert.equal(await select.inputValue(), original, slug + ' keeps its value until confirmation')
    await page.keyboard.press('Enter')
    assert.equal(await select.inputValue(), options[0], slug)
    await focused(select)
    await select.press('ArrowDown')
    await page.keyboard.press('End')
    await page.keyboard.press('Escape')
    assert.equal(await select.inputValue(), options[0], slug + ' cancels the highlighted option')
    await focused(select)
    await select.press('Space')
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    assert.equal(await select.inputValue(), options.at(-1), slug)
    await focused(select)
  }

  await visit('swiss-address-form')
  await role('button').last().press('Enter')
  const errorLink = preview.locator('a[href^="#"]').first()
  await errorLink.waitFor()
  const id = (await errorLink.getAttribute('href')).slice(1)
  await errorLink.press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.id), id)

  await visit('toast')
  const save = role('button', 'Save preferences')
  await save.press('Enter')
  const dismiss = preview.locator('.al-toast-dismiss')
  await dismiss.waitFor()
  await save.press('Tab')
  await focused(dismiss)
  await page.keyboard.press('Escape')
  await dismiss.waitFor({ state: 'hidden' })
  await focused(save)

  await visit('app-shell')
  const skip = role('link', 'Skip to content')
  await skip.press('Enter')
  await focused(preview.locator('.al-app-main'))

  await visit('navigation-menu')
  const destinations = role('navigation').getByRole('link')
  await destinations.first().press('Tab')
  await focused(destinations.nth(1))

  await visit('pagination')
  await role('link', 'Page 2').press('Enter')
  assert.equal(await role('link', 'Page 2').getAttribute('aria-current'), 'page')

  await visit('breadcrumb')
  await role('link', 'Editions').press('Enter')
  await role('heading', 'Editions').waitFor()

  await visit('code-block')
  const copy = role('button', 'Copy')
  await copy.press('Enter')
  await role('status').filter({ hasText: /copied|copy/i }).waitFor()

  await visit('scroll-area')
  const scrolling = role('region', 'Subject index')
  await scrolling.press('PageDown')
  const region = await scrolling.elementHandle()
  await page.waitForFunction(el => el.scrollTop > 0, region)
  await region.dispose()

  await visit('message-scroller')
  const log = role('log')
  await log.focus()
  await page.keyboard.press('Tab')
  await focused(role('button', 'Record a proof'))
  await page.keyboard.press('Enter')
  assert.match(await log.innerText(), /Print run 2/)

  console.log('Verified keyboard operations on ' + checked.size + ' published component examples.')
} finally { await browser.close() }
