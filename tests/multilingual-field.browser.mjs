import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { launchBrowser } from './launch-browser.mjs'

const fixture = await build({ bundle: true, write: false, outfile: 'fixture.js', jsx: 'automatic',
  stdin: { loader: 'tsx', resolveDir: process.cwd(), contents: `
    import { createRoot } from 'react-dom/client'
    import { useState } from 'react'
    import { MultilingualField } from 'alpina-ui'
    function Editor() {
      const [body, setBody] = useState({ fr: 'Bonjour' })
      return <form><MultilingualField name="title" label="Title" defaultValue={{ de: 'Zürich' }} />
        <MultilingualField name="body" label="Body" includeEnglish layout="columns" variant="textarea"
          value={body} onValueChange={setBody} sourceLanguage="fr" /><button type="reset">Reset</button></form>
    }
    createRoot(document.getElementById('root')).render(<Editor />)
  ` } })
const browser = await launchBrowser()
try {
  const page = await browser.newPage()
  await page.setContent('<main id="root"></main>')
  await page.addScriptTag({ content: fixture.outputFiles[0].text })
  const title = page.getByRole('group', { name: 'Title' })
  await title.getByRole('tab', { name: /Deutsch · Complete/ }).press('ArrowRight')
  await title.getByRole('button', { name: 'Copy from Deutsch' }).click()
  const fr = title.getByRole('textbox', { name: 'Français' })
  assert.equal(await fr.inputValue(), 'Zürich')
  assert.ok(await title.getByRole('button', { name: 'Copy from Deutsch' }).isDisabled())
  await fr.fill('e\u0301👩‍🔬')
  await title.getByText('2 characters · Complete', { exact: true }).waitFor()
  const body = page.getByRole('group', { name: 'Body' })
  const english = body.getByRole('textbox', { name: 'English' })
  assert.equal(await english.evaluate(el => el.tagName), 'TEXTAREA')
  await english.fill('First line\nSecond line')
  const formData = () => page.locator('form').evaluate(el => Object.fromEntries(new FormData(el)))
  assert.deepEqual(await formData(), {
    'title[de]': 'Zürich', 'title[fr]': 'e\u0301👩‍🔬', 'title[it]': '', 'title[rm]': '',
    'body[de]': '', 'body[fr]': 'Bonjour', 'body[it]': '', 'body[rm]': '', 'body[en]': 'First line\nSecond line',
  })
  await page.getByRole('button', { name: 'Reset' }).click()
  assert.equal(await fr.inputValue(), '')
  assert.equal(await english.inputValue(), 'First line\nSecond line')
  console.log('Multilingual tabs, completion, graphemes, copy, reset and native form payload verified.')
} finally { await browser.close() }
