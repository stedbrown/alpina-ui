import { readableLabelIssues } from './readable-labels.mjs'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await launchBrowser()
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await openPublicPage(context)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const route = siteOrigin + '/blocks/public-service/'
  const main = page.getByRole('main')
  const input = name => main.locator('input[name="' + name + '"]')
  const button = name => main.getByRole('button', { name, exact: true })
  const languageSelect = main.getByRole('combobox')
  const proceed = () => main.locator('button[type=submit]').click()
  const heading = name => main.getByRole('heading', { name, exact: true }).waitFor()
  const attachment = { name: 'residence.txt', mimeType: 'text/plain', buffer: Buffer.from('Fictional supporting document.') }

  async function fillPerson() {
    await input('firstName').fill('Ada')
    await input('lastName').fill('Roth')
    await input('ahv').fill('7561234567897')
    await proceed()
  }
  async function fillAddress() {
    await input('street').fill('Testweg')
    await input('houseNumber').fill('12a')
    await input('postalCode').fill('3000')
    await input('town').fill('Bern')
    await proceed()
  }

  await page.goto(route)
  await heading('Residence certificate')
  await page.setViewportSize({ width: 800, height: 900 })
  for (const [tag, title, step, count] of [
    ['de-CH', 'Wohnsitzbestätigung', 'Personalien', 'Schritt 1 von 4'],
    ['fr-CH', 'Attestation de domicile', 'Données personnelles', 'Étape 1 sur 4'],
    ['it-CH', 'Certificato di domicilio', 'Dati personali', 'Passo 1 di 4'],
    ['rm-CH', 'Attest da domicil', 'Indicaziuns persunalas', 'Pass 1 da 4'],
    ['en', 'Residence certificate', 'Personal details', 'Step 1 of 4'],
  ]) {
    await languageSelect.selectOption(tag)
    await heading(title)
    await heading(step)
    assert.equal(await main.getAttribute('lang'), tag)
    const status = main.locator('[aria-current=step]:visible')
    assert.equal(await status.count(), 1)
    // Shorter translations can use their full list if all four labels fit.
    if (await status.evaluate(el => el.tagName !== 'LI')) assert.equal(await status.innerText(), count)
    else assert.match(await status.innerText(), new RegExp(step))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  }
  await main.getByText('Step 1 of 4', { exact: true }).waitFor()
  await languageSelect.focus()
  await page.setViewportSize({ width: 1600, height: 900 })
  await button('English').waitFor()
  assert.match(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarGutter), /stable/)
  const widthBeforeScrollbar = await main.evaluate(el => el.clientWidth)
  await page.evaluate(() => { document.documentElement.style.overflowY = 'scroll' })
  await button('English').waitFor()
  assert.equal(await main.evaluate(el => el.clientWidth), widthBeforeScrollbar)
  await page.evaluate(() => { document.documentElement.style.overflowY = '' })
  assert.ok(await button('English').evaluate(node => node === document.activeElement))
  await main.getByRole('list', { name: 'Application steps' }).waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  await languageSelect.waitFor()
  assert.ok(await languageSelect.evaluate(node => node === document.activeElement))

  await proceed()
  const summary = main.getByRole('alert')
  assert.equal(await summary.getByRole('link').count(), 3)
  assert.ok(await summary.evaluate(node => node === document.activeElement))
  const beforeCorrection = page.url()
  await summary.getByRole('link', { name: /AHV/ }).click()
  assert.equal(page.url(), beforeCorrection)
  assert.ok(await input('ahv').evaluate(node => node === document.activeElement))
  await input('ahv').fill('756.1234.5678.90')
  await proceed()
  assert.ok(await input('ahv').getAttribute('aria-invalid'))
  assert.match(await summary.innerText(), /check digit does not match.*original document/)
  await input('firstName').fill('Unsaved')
  await page.reload()
  assert.equal(await input('firstName').inputValue(), '')

  await fillPerson()
  await main.getByText('Step 2 of 4', { exact: true }).waitFor()
  await proceed()
  assert.equal(await summary.getByRole('link').count(), 3)
  await input('postalCode').fill('6900')
  const suggestions = main.getByRole('combobox', { name: /Suggestions for 6900/ })
  await suggestions.selectOption({ label: 'Massagno (TI)' })
  assert.equal(await input('town').inputValue(), 'Massagno')
  assert.equal(await main.locator('form form').count(), 0)
  await fillAddress()
  await input('attachments').setInputFiles(attachment)
  await languageSelect.selectOption('rm-CH')
  await main.getByText('Pass 3 da 4', { exact: true }).waitFor()
  await button('Memorisar il sboz').click()
  await main.getByText('Il sboz è memorisà sin quest apparat.', { exact: true }).waitFor()
  await page.reload()
  await heading('In sboz memorisà è disponibel')
  assert.equal(await input('firstName').count(), 0)
  assert.ok(!await main.getByText('residence.txt', { exact: true }).count())
  await button('Cuntinuar cun il sboz').click()
  await heading('Documents cumprovants')
  const restored = await input('attachments').evaluate(async node => {
    const file = new FormData(node.form).get('attachments')
    return [file.name, file.type, await file.text()]
  })
  assert.deepEqual(restored, [attachment.name, attachment.mimeType, attachment.buffer.toString()])
  await proceed()
  await heading('Controllar la dumonda')
  await main.getByText('Pass 4 da 4', { exact: true }).waitFor()
  for (const text of ['Ada Roth', '756.1234.5678.97', 'Testweg 12a', '3000 Bern', 'Svizra', attachment.name])
    assert.ok((await main.locator('dl').allTextContents()).join(' ').includes(text), text)
  for (const width of [320, 360, 640, 768, 800, 960, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert.deepEqual(await main.evaluate(readableLabelIssues), [], 'Review summary at ' + width + 'px')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await languageSelect.selectOption('en')
  await button('Edit · Postal address').click()
  assert.equal(await input('town').inputValue(), 'Bern')
  await input('town').fill('Berne')
  await proceed()
  await proceed()
  assert.match(await main.innerText(), /3000 Berne/)
  const posted = []
  page.on('request', request => { if (request.method() === 'POST') posted.push(request.url()) })
  await proceed()
  await heading('Demo complete')
  assert.match(await main.locator('dd').innerText(), /^DEMO-[A-F0-9]{12}$/)
  assert.deepEqual(posted, [])
  await page.reload()
  await heading('Personal details')
  await input('firstName').fill('Temporary')
  await button('Save draft').click()
  await main.getByText('Draft saved on this device.', { exact: true }).waitFor()
  await page.reload()
  await heading('A saved draft is available')
  await button('Delete saved draft').click()
  await heading('Personal details')
  assert.equal(await input('firstName').inputValue(), '')
  await page.reload()
  await heading('Personal details')

  // Two tabs may edit the same saved revision. A stale save must preserve the newer one.
  await input('firstName').fill('First revision')
  await button('Save draft').click()
  await main.getByText('Draft saved on this device.', { exact: true }).waitFor()
  const second = await openPublicPage(context)
  await second.goto(route)
  await second.getByRole('button', { name: 'Resume draft' }).click()
  await second.getByLabel('First name').fill('Second revision')
  await second.getByRole('button', { name: 'Save draft' }).click()
  await second.getByText('Draft saved on this device.', { exact: true }).waitFor()
  await button('Save draft').click()
  await main.getByText(/The saved draft changed in another tab/).waitFor()
  assert.ok(await button('Save draft').isDisabled())
  await page.reload()
  await button('Resume draft').click()
  assert.equal(await input('firstName').inputValue(), 'Second revision')
  await button('Delete saved draft').click()
  await second.close()

  // A consuming application supplies the actual service callback and assigns the case number.
  const harness = await build({
    stdin: { contents: [
      'import React from "react"',
      'import {createRoot} from "react-dom/client"',
      'import {PublicServiceBlock} from "./blocks/public-service.tsx"',
      'window.requests = []',
      'async function submit({attachments, ...request}) {',
      '  window.requests.push({...request, files: await Promise.all(attachments.map(file => file.text()))})',
      '  if (window.requests.length === 1) throw new Error("Simulated temporary failure")',
      '  return "CASE-2042"',
      '}',
      'const service = {id:"visitor-pass",title:"Visitor pass",introduction:"Apply for a pass.",',
      '  steps:[{id:"contact",title:"Contact",fields:[{id:"email",label:"Contact email",required:true}]},',
      '    {id:"visit",title:"Visit",fields:[{id:"host",label:"Host name",required:true}]},{id:"review",title:"Check",content:"review"}],',
      '  copy:{en:{confirm:"Request pass"}}}',
      'const props = location.search ? {service,onSubmit: async ({values}) => values.host === "Roth" ? "PASS-1" :',
      '  {fieldErrors:{email:"Confirm your email address.",host:"Choose a registered host."}}} : {onSubmit:submit,draftKey:"application"}',
      'createRoot(document.querySelector("#app")).render(React.createElement(PublicServiceBlock, props))',
    ].join('\n'), resolveDir: process.cwd() },
    bundle: true, write: false, format: 'iife', logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
  })
  await page.route(url => url.origin === siteOrigin && url.pathname === '/service-test', response => response.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Form test</title><div id="app"></div><script src="/service-test.js"></script></html>',
  }))
  await page.route(siteOrigin + '/service-test.js', response => response.fulfill({
    contentType: 'text/javascript', body: harness.outputFiles[0].text,
  }))
  await page.goto(siteOrigin + '/service-test')
  await fillPerson()
  await fillAddress()
  await input('attachments').setInputFiles(attachment)
  await proceed()
  await proceed()
  await main.getByText('Your request could not be completed. Your details are still here. Try again.').waitFor()
  await proceed()
  await heading('Request confirmed')
  assert.equal(await main.locator('dd').innerText(), 'CASE-2042')
  const requests = await page.evaluate(() => window.requests)
  assert.equal(requests.length, 2)
  assert.match(requests[0].requestId, /^[a-f0-9-]{36}$/)
  assert.deepEqual(requests[0], requests[1])
  assert.deepEqual(requests[0], {
    requestId: requests[0].requestId, locale: 'en', ahv: '756.1234.5678.97',
    address: { person: { firstName: 'Ada', lastName: 'Roth' }, addressInformation: {
      street: 'Testweg', houseNumber: '12a', swissZipCode: 3000, town: 'Bern',
      country: { countryIdISO2: 'CH', countryNameShort: 'Switzerland' },
    } },
    files: [attachment.buffer.toString()],
  })
  assert.deepEqual(errors, [])
  await page.goto(siteOrigin + '/service-test?custom')
  await heading('Visitor pass')
  await input('email').fill('me@example.ch')
  await proceed()
  await input('host').fill('Unknown')
  await proceed()
  await button('Request pass').click()
  assert.equal(await summary.getByRole('link').count(), 2)
  assert.ok(await summary.evaluate(node => node === document.activeElement))
  const reviewUrl = page.url()
  await summary.getByRole('link', { name: /Choose a registered host/ }).click()
  await heading('Visit')
  assert.ok(await input('host').evaluate(node => node === document.activeElement))
  assert.equal(page.url(), reviewUrl)
  await input('host').fill('Roth')
  await summary.getByRole('link', { name: /Confirm your email/ }).click()
  await input('email').fill('corrected@example.ch')
  await proceed()
  await proceed()
  await button('Request pass').click()
  await heading('Request confirmed')
  assert.equal(await main.locator('dd').innerText(), 'PASS-1')
  console.log('Public service form passed five locales, validation, draft and file restoration, review, cleanup and idempotent submission.')
} finally {
  await browser.close()
}
