import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const project = new URL('../', import.meta.url)
const recipe = new URL('recipes/rubrica/', project)
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable
    ? { executablePath: executable }
    : existsSync(chromium.executablePath())
      ? {}
      : { channel: 'chrome' },
)
try {
  const page = await browser.newPage({ offline: true, viewport: { width: 320, height: 780 } })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value) => {
          window.copiedRubricaSource = value
        },
      },
    })
  })
  await page.goto(new URL('site/index.html#guide/directory', project).href)
  const section = page.getByRole('region', { name: 'Address book source files' })
  const picker = section.getByRole('combobox', { name: 'Project file' })
  const paths = await picker.locator('option').allTextContents()
  const expectedSrc = (await readdir(new URL('src/', recipe), { recursive: true }))
    .map((name) => 'src/' + name.replaceAll('\\', '/'))
    .filter((name) => /\.(?:[cm]?[jt]sx?|css|html|json)$/i.test(name))
  for (const name of [...expectedSrc, 'scripts/build.mjs', 'package.json', 'tsconfig.json'])
    assert.ok(paths.includes(name), name)
  assert.equal(paths.length, new Set(paths).size)
  assert.ok(
    paths.every(
      (name) =>
        !name.includes('node_modules/') && !name.startsWith('dist/') && !name.startsWith('vendor/'),
    ),
  )
  assert.equal(await picker.inputValue(), 'src/app.tsx')
  for (const name of paths) {
    await picker.selectOption(name)
    const expected = await readFile(new URL(name, recipe))
    const pre = section.getByLabel(name, { exact: true })
    assert.deepEqual(Buffer.from(await pre.locator('code').textContent(), 'utf8'), expected, name)
    await section.getByRole('button', { name: 'Copy', exact: true }).click()
    await section.getByText('Copied', { exact: true }).waitFor()
    assert.deepEqual(
      Buffer.from(await page.evaluate(() => window.copiedRubricaSource), 'utf8'),
      expected,
      name + ' copied',
    )
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      name + ' on mobile',
    )
  }
  console.log(
    paths.length +
      ' address book source files matched the rendered and copied content at 320 px offline.',
  )
} finally {
  await browser.close()
}
