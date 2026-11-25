import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'

export function launchBrowser() {
  const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  if (executablePath) return chromium.launch({ executablePath })
  return chromium.launch(existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
}
