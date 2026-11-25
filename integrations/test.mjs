import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { launchBrowser } from '../tests/launch-browser.mjs'

async function openPort() {
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const { port } = socket.address()
  await new Promise(resolve => socket.close(resolve))
  return port
}

const browser = await launchBrowser()

async function exercise(project, executable, args, test) {
  const port = await openPort()
  const url = 'http://127.0.0.1:' + port
  const cwd = fileURLToPath(new URL('./' + project + '/', import.meta.url))
  const cli = fileURLToPath(new URL('./node_modules/' + executable, import.meta.url))
  const child = spawn(process.execPath, [cli, ...args, '--port', String(port)], {
    cwd, windowsHide: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { output += data })
  const exited = once(child, 'exit')
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    const deadline = Date.now() + 45_000
    while (true) {
      if (child.exitCode !== null || Date.now() > deadline) throw Error('Server startup failed. ' + output)
      const response = await fetch(url).catch(() => null)
      if (response) {
        await response.body?.cancel()
        assert.equal(response.status, 200, output)
        break
      }
      await delay(125)
    }
    await page.goto(url)
    await test(page, url)
    assert.deepEqual(errors, [], project)
    console.log(project + ' passed against its production build.')
  } finally {
    await page.close()
    if (child.exitCode === null) child.kill()
    await exited
  }
}

try {
  await exercise('next-app-router', 'next/dist/bin/next', ['start', '--hostname', '127.0.0.1'], async page => {
    const locale = page.getByLabel('Billing language')
    assert.equal(await locale.inputValue(), 'de-CH')
    await locale.selectOption('fr-CH')
    const action = page.waitForResponse(r => r.request().method() === 'POST' && r.status() === 200)
    await page.getByRole('button', { name: 'Save language' }).click()
    await action
    await page.getByText('Billing language saved.', { exact: true }).waitFor()
    await page.reload()
    assert.equal(await locale.inputValue(), 'fr-CH')
    assert.equal(await page.locator('data[value="1250"]').getAttribute('lang'), 'fr-CH')
    await locale.evaluate(select => select.add(new Option('Unsupported', 'xx')))
    await locale.selectOption('xx')
    await page.getByRole('button', { name: 'Save language' }).click()
    await page.getByText('Choose one of the four billing languages.').waitFor()
    await page.reload()
    assert.equal(await locale.inputValue(), 'fr-CH')
  })
  const preview = ['preview', '--host', '127.0.0.1', '--strictPort']
  await exercise('vite-react-router', 'vite/bin/vite.js', preview, async (page, url) => {
    await page.evaluate(() => { window.navigationProbe = 'same document' })
    await page.getByRole('link', { name: /A-105/ }).click()
    await page.getByRole('heading', { name: 'Invoice A-105' }).waitFor()
    assert.equal(await page.evaluate(() => window.navigationProbe), 'same document')
    assert.equal(new URL(page.url()).pathname, '/invoices/A-105')
    await page.reload()
    assert.equal(await page.locator('data').getAttribute('value'), '483.6')
    await page.getByRole('link', { name: 'Back to register' }).click()
    await page.getByRole('heading', { name: 'Invoice register' }).waitFor()
    await page.goBack()
    await page.getByRole('heading', { name: 'Invoice A-105' }).waitFor()
    await page.goto(url + '/invoices/missing')
    await page.getByRole('heading', { name: 'Invoice unavailable' }).waitFor()
  })
  await exercise('swiss-form', 'vite/bin/vite.js', preview, async page => {
    const uid = page.getByLabel('Business UID')
    const iban = page.getByLabel('IBAN', { exact: true })
    const submit = page.getByRole('button', { name: 'Check supplier' })
    await uid.fill('CHE109322552')
    await iban.fill('CH9300762011623852950')
    await submit.click()
    await page.getByText('Enter a Swiss UID with a valid check digit.').waitFor()
    await page.getByText('Enter a Swiss or Liechtenstein IBAN with a valid checksum.').waitFor()
    assert.equal(await uid.getAttribute('aria-invalid'), 'true')
    assert.equal(await uid.evaluate(node => node === document.activeElement), true)
    await uid.fill('che109322551')
    await iban.fill('ch9300762011623852957')
    await submit.click()
    await page.getByText('CHE-109.322.551 · Account ending in 2957').waitFor()
    assert.equal(await iban.inputValue(), 'CH93 0076 2011 6238 5295 7')
    assert.equal(await uid.getAttribute('aria-invalid'), null)
  })
} finally {
  await browser.close()
}
