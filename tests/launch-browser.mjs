import { existsSync } from 'node:fs'
import { forcedPaletteArgs } from './display-profile.mjs'
import { chromium } from 'playwright-core'

export function launchBrowser(forcedPalette) {
  const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  const args = forcedPaletteArgs(forcedPalette)
  if (executablePath) return chromium.launch({ executablePath, args })
  return chromium.launch({ args, ...(existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }) })
}
