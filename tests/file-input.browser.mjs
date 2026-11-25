import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Attachment, Dropzone, FileInput } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'

const css = await readFile(new URL(import.meta.resolve('alpina-ui/styles.css')), 'utf8')
const origin = 'https://files.alpina.test'
const app = await build({ stdin: { resolveDir: process.cwd(), contents: [
  'import {createElement as h, useState} from "react"',
  'import {createRoot} from "react-dom/client"',
  'import {Attachment, Dropzone} from "alpina-ui"',
  'function App() {',
  '  const [files,setFiles] = useState([])',
  '  const [locale,setLocale] = useState("fr-CH")',
  '  return h("form",{id:"evidence"},',
  '    h(Dropzone,{id:"proof",name:"proof",multiple:true,required:true,maxFiles:3,maxSize:1250,accept:".txt",locale}),',
  '    h("select",{"aria-label":"File language",value:locale,onChange:e=>setLocale(e.target.value)},["en","de-CH","fr-CH","it-CH","rm-CH"].map(lang=>h("option",{key:lang},lang))),',
  '    h(Attachment,{mode:"upload",id:"draft",name:"draft",files,onFilesChange:setFiles,locale:"rm-CH"}),',
  '    h("button",{type:"button",onClick:()=>setFiles([new File(["original bytes"],"draft.txt")])},"Restore"),',
  '    h("button",{type:"reset"},"Reset"), h("button",{type:"submit"},"Send"))',
  '}',
  'createRoot(document.querySelector("main")).render(h(App))',
].join('\n') }, minify: true, bundle: true, format: 'esm', write: false, define: { 'process.env.NODE_ENV': '"production"' } })

async function transfer(input, kind, names) {
  await input.evaluate((node, { kind, names }) => {
    const data = new DataTransfer()
    for (const name of names) data.items.add(new File([name + ' contents'], name, { type: 'text/plain' }))
    const event = kind === 'paste'
      ? new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
      : new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: data })
    node.dispatchEvent(event)
  }, { kind, names })
}

async function payload(input) {
  return input.evaluate(async node => Promise.all(new FormData(node.form).getAll(node.name)
    .filter(file => file.name).map(async file => [file.name, await file.text()])))
}

const browser = await launchBrowser()
try {
  assert.equal(Dropzone, FileInput)
  const existing = renderToStaticMarkup(h(Attachment, { filename: 'minutes.pdf', href: '/minutes.pdf' }))
  assert.match(existing, /<a[^>]+href="\/minutes.pdf"/)
  for (const [locale, action, empty] of [
    ['en', 'Choose file', 'No file selected'], ['de-CH', 'Datei auswählen', 'Keine Datei ausgewählt'],
    ['fr-CH', 'Choisir un fichier', 'Aucun fichier sélectionné'], ['it-CH', 'Scegli file', 'Nessun file selezionato'],
    ['rm-CH', 'Tscherner ina datoteca', 'Naginas datotecas tschernidas'],
  ]) {
    const markup = renderToStaticMarkup(h(FileInput, { locale }))
    assert.ok(markup.includes(action) && markup.includes(empty), locale)
  }

  const page = await browser.newPage({ locale: 'de-CH', forcedColors: 'active' })
  await page.route(origin + '/**', route => route.fulfill(new URL(route.request().url()).pathname === '/'
    ? { contentType: 'text/html', body: '<html lang="en"><style>' + css + '</style><main></main><script type="module" src="/app.js"></script></html>' }
    : { contentType: 'text/javascript', body: app.outputFiles[0].text }))
  await page.goto(origin)
  const input = page.locator('#proof'), draft = page.locator('#draft')
  await input.waitFor({ state: 'attached' })
  const zone = page.locator('.al-file-input').filter({ has: input })
  await page.getByRole('button', { name: 'Send' }).click()
  await zone.getByRole('alert').getByText('Choisissez un fichier pour continuer.').waitFor()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  // The genuine focus target is the native input. Its focus ring is visible on the label.
  assert.ok(await input.evaluate(node => node === document.activeElement && getComputedStyle(node.nextElementSibling).outlineStyle !== 'none'))
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), input.press('Space')])
  await chooser.setFiles({ name: 'first.txt', mimeType: 'text/plain', buffer: Buffer.alloc(1250, 'a') })
  await zone.getByText(/1,3\s+ko/).waitFor()
  assert.match(await zone.getByRole('status').textContent(), /Ajout.*first.txt/)
  await transfer(input, 'drop', ['second.txt'])
  await transfer(input, 'paste', ['clipboard.txt'])
  assert.deepEqual(await payload(input), [
    ['first.txt', 'a'.repeat(1250)], ['second.txt', 'second.txt contents'], ['clipboard.txt', 'clipboard.txt contents'],
  ])
  await transfer(input, 'drop', ['blocked.png'])
  await zone.getByRole('alert').getByText('Choisissez un type de fichier pris en charge.').waitFor()
  assert.equal((await payload(input)).length, 3)
  await transfer(input, 'paste', ['fourth.txt'])
  await zone.getByRole('alert').getByText('Nombre maximal de fichiers : 3.').waitFor()
  const pickerLanguage = page.getByRole('combobox', { name: 'File language' })
  for (const [locale, countLabel] of [['en', 'Maximum number'], ['de-CH', 'Anzahl Dateien'], ['it-CH', 'Numero massimo'], ['rm-CH', 'Dumber maximal']]) {
    await pickerLanguage.selectOption(locale)
    await zone.getByRole('alert').getByText(new RegExp(countLabel + '.*3')).waitFor()
  }
  await pickerLanguage.selectOption('fr-CH')
  await input.setInputFiles({ name: 'large.txt', mimeType: 'text/plain', buffer: Buffer.alloc(1251) })
  await zone.getByRole('alert').getByText(/Taille maximale par fichier/).waitFor()
  for (const [locale, sizeLabel] of [['en', 'Maximum size'], ['de-CH', 'Dateigrösse'], ['it-CH', 'Dimensione massima'], ['rm-CH', 'Grondezza maximala']]) {
    await pickerLanguage.selectOption(locale)
    await zone.getByRole('alert').getByText(new RegExp(sizeLabel)).waitFor()
  }
  await pickerLanguage.selectOption('fr-CH')
  assert.deepEqual((await payload(input)).map(([name]) => name), ['first.txt', 'second.txt', 'clipboard.txt'])
  await zone.getByRole('button', { name: 'Retirer second.txt' }).press('Enter')
  assert.ok(await input.evaluate(node => document.activeElement === node))
  await zone.getByRole('status').getByText(/Retrait.*second.txt/).waitFor()
  assert.deepEqual((await payload(input)).map(entry => entry[0]), ['first.txt', 'clipboard.txt'])

  await page.getByRole('button', { name: 'Restore' }).click()
  assert.deepEqual(await payload(draft), [['draft.txt', 'original bytes']])
  await transfer(draft, 'paste', ['a.txt', 'b.txt'])
  await page.getByRole('alert').getByText('Tscherni ina datoteca a la giada.').waitFor()
  assert.deepEqual(await payload(draft), [['draft.txt', 'original bytes']])
  await transfer(draft, 'paste', ['single.txt'])
  assert.deepEqual(await payload(draft), [['single.txt', 'single.txt contents']])
  await page.getByRole('button', { name: 'Reset' }).click()
  await zone.getByText('Aucun fichier sélectionné').waitFor()
  await page.getByText('Naginas datotecas tschernidas').waitFor()
  assert.deepEqual(await payload(input), [])
  assert.deepEqual(await payload(draft), [])
  await input.evaluate(node => { node.disabled = true })
  await transfer(input, 'paste', ['disabled.txt'])
  assert.deepEqual(await payload(input), [])
  await page.close()

  const fallback = await browser.newPage({ javaScriptEnabled: false, locale: 'de-CH' })
  const form = renderToStaticMarkup(h('form', { method: 'POST', action: '/submit', encType: 'multipart/form-data' },
    h(FileInput, { id: 'claim', name: 'claim', locale: 'rm-CH', required: true }), h(FileInput, { id: 'optional', name: 'optional', locale: 'en' }), h('button', null, 'Submit')))
  await fallback.route(origin + '/**', route => route.fulfill({ contentType: 'text/html', body:
    '<!doctype html><html lang="rm-CH"><style>' + css + '</style>' + (route.request().method() === 'POST' ? 'Received' : form) + '</html>' }))
  await fallback.goto(origin)
  const action = fallback.getByText('Tscherner ina datoteca', { exact: true })
  assert.ok(await action.isVisible())
  assert.equal(await fallback.locator('#claim').evaluate(el => getComputedStyle(el).clipPath), 'inset(50%)')
  assert.ok(await fallback.getByText('Naginas datotecas tschernidas').isVisible())
  assert.equal(await fallback.getByText('Selecziun pronta').isVisible(), false)
  assert.equal(await fallback.getByText('No file selected').isVisible(), false)
  const [fallbackChooser] = await Promise.all([fallback.waitForEvent('filechooser'), action.click()])
  await fallbackChooser.setFiles({ name: 'no-script.txt', mimeType: 'text/plain', buffer: Buffer.from('native file payload') })
  assert.ok(await fallback.getByText('Selecziun pronta').isVisible())
  assert.equal(await fallback.getByText('Naginas datotecas tschernidas').isVisible(), false)
  const [submitted] = await Promise.all([fallback.waitForRequest(req => req.method() === 'POST'), fallback.getByRole('button', { name: 'Submit' }).click()])
  assert.match(submitted.headers()['content-type'], /multipart\/form-data; boundary=/)
  assert.match(submitted.postDataBuffer().toString(), /name="claim"; filename="no-script.txt"[^]*native file payload/)
  console.log('Localized file selection, native keyboard and form submission, drop, paste, removal, validation, restoration and no-script multipart upload passed.')
} finally {
  await browser.close()
}
