import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { join } from 'node:path'
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

const [workspace = fileURLToPath(new URL('./', import.meta.url)), expectedRuntime] = process.argv.slice(2)
const browser = await launchBrowser()

async function exercise(project, executable, args, test, initialPath = '/') {
  const port = await openPort()
  const url = 'http://127.0.0.1:' + port
  const cwd = join(workspace, project)
  const cli = join(workspace, 'node_modules', executable)
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
      const response = await fetch(url + initialPath).catch(() => null)
      if (response) {
        await response.body?.cancel()
        assert.equal(response.status, 200, output)
        break
      }
      await delay(125)
    }
    await page.goto(url + initialPath)
    if (expectedRuntime) {
      await page.waitForFunction(() => document.documentElement.dataset.reactPeers)
      assert.equal(await page.locator('html').getAttribute('data-react-peers'), expectedRuntime, project + ' browser runtime')
    }
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
  await exercise('next-app-router', 'next/dist/bin/next', ['start', '--hostname', '127.0.0.1'], async (page, url) => {
    if (expectedRuntime) {
      const response = await fetch(url + '/peer')
      assert.ok(response.ok)
      assert.ok((await response.text()).includes('data-server-peers="' + expectedRuntime + '"'), 'Next SSR peer versions')
      await page.getByRole('button', { name: 'Record payment' }).click()
      await page.getByRole('status').filter({ hasText: 'Payment recorded.' }).waitFor()
      await page.goto(url)
    }
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
    const account = page.getByRole('textbox', { name: 'Payment account' })
    await account.fill('CH00')
    await account.press('Tab')
    assert.equal(await account.getAttribute('aria-invalid'), 'true')
    assert.equal(await account.getAttribute('lang'), 'fr-CH')
    assert.ok(await account.evaluate(el => el.validationMessage.length > 0 && el.validationMessage === document.getElementById(el.getAttribute('aria-describedby'))?.textContent))
    const check = page.getByRole('button', { name: 'Check payment account' })
    const invalid = page.waitForResponse(r => r.request().method() === 'POST' && r.status() === 200)
    await check.click()
    await invalid
    assert.equal(await account.getAttribute('aria-invalid'), 'true')
    await account.fill('CH9400762011623852957')
    // Submit from the input so the Server Action supplies the error without a blur handler.
    const checksum = page.waitForResponse(r => r.request().method() === 'POST' && r.status() === 200)
    await account.press('Enter')
    await checksum
    await page.getByText(/Les chiffres de contrôle ne correspondent pas.*document original/).waitFor()
    await account.fill('ch93 0076 2011 6238 5295 7')
    await check.click()
    await page.getByText('Account verified · 2957').waitFor()
    await locale.evaluate(select => select.add(new Option('Unsupported', 'xx')))
    await locale.selectOption('xx')
    await page.getByRole('button', { name: 'Save language' }).click()
    await page.getByText('Choose one of the four billing languages.').waitFor()
    await page.reload()
    assert.equal(await locale.inputValue(), 'fr-CH')
    await page.getByRole('link', { name: 'Open sample invoice' }).click()
    await page.getByRole('heading', { name: 'Invoice AP-104', exact: true }).waitFor()
    const print = page.getByRole('button', { name: 'Print invoice' })
    await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printed = 'yes' } })
    await print.click()
    assert.equal(await page.locator('html').getAttribute('data-printed'), 'yes')
    const invoice = await fetch(url + '/invoices/AP-105')
    assert.equal(invoice.status, 200)
    const html = await invoice.text()
    assert.ok(html.includes('Bench repair') && html.includes('AP-105') && html.includes('al-bill-slip'), 'Invoice HTML must contain its lines and QR slip before hydration')
    assert.ok(!html.includes('Oak shelving'), 'Each route renders its own invoice')
  }, expectedRuntime ? '/peer' : '/')
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
    await page.getByText(/The check digit does not match.*original document/).waitFor()
    await page.getByText(/The check digits do not match.*original document/).waitFor()
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
