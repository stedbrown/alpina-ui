import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { launchBrowser } from '../tests/launch-browser.mjs'

export async function measureInteractions(origin, routes, reports) {
  const browser = await launchBrowser()
  const samples = {}
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
    const observer = await readFile(new URL('web-vitals.iife.js', import.meta.resolve('web-vitals')), 'utf8')
    await context.addInitScript({ content: observer +
      ';webVitals.onINP(metric => { window.interactionLatency = metric.value }, { reportAllChanges: true, durationThreshold: 16 })' })
    for (const [name, route] of Object.entries(routes)) {
      const page = await context.newPage()
      await page.goto(origin + route)
      if (name === 'home') {
        await page.locator('[data-site-appearance]').tap()
        await page.waitForFunction(() => document.documentElement.dataset.alTheme === 'light')
      } else if (name === 'button') {
        await page.getByRole('button', { name: 'Code', exact: true }).tap()
        await page.getByText('Example.tsx', { exact: true }).waitFor()
      } else {
        await page.getByRole('button', { name: 'Show password', exact: true }).tap()
        await page.getByRole('button', { name: 'Hide password', exact: true }).waitFor()
      }
      await page.waitForFunction(() => Number.isFinite(window.interactionLatency))
      samples[route] = await page.evaluate(() => window.interactionLatency)
      assert.ok(samples[route] >= 0)
      console.log(route, 'scripted interaction INP', samples[route] + ' ms')
      await page.close()
    }
    await writeFile(join(reports, 'scripted-inp.json'), JSON.stringify(samples, null, 2) + '\n')
  } finally { await browser.close() }
}
