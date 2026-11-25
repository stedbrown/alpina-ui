import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { chromium } from 'playwright-core'

// macOS uses the pinned Linux browser environment so native rasterizers do not
// turn font substitution into an apparent design regression.
if (process.platform === 'darwin' || process.argv.includes('--linux-container')) {
  const { version } = createRequire(import.meta.url)('playwright-core/package.json')
  const entry = process.argv[1].split(/[\\/]/).pop()
  const root = fileURLToPath(new URL('../', import.meta.url))
  const args = process.argv.slice(2).filter(arg => arg !== '--linux-container')
  const result = spawnSync('docker', [
    'run', '--rm', '--init', '--platform', 'linux/amd64', '--shm-size', '1g',
    '--mount', 'type=bind,source=' + root + ',target=/workspace',
    '--mount', 'type=tmpfs,target=/workspace/node_modules', '--workdir', '/workspace',
    'mcr.microsoft.com/playwright:v' + version + '-noble',
    'sh', '-ec', 'npm ci --no-audit --no-fund && node "tests/$0" "$@"', entry, ...args,
  ], { stdio: 'inherit' })
  if (result.error) throw new Error('Start Docker to run the pinned Linux visual suite. See docs/visual-testing.md.', { cause: result.error })
  process.exit(result.status ?? 1)
}
export const platform = process.platform === 'win32' ? 'windows' : 'linux'
export function difference(expectedBytes, actualBytes) {
  if (expectedBytes.equals(actualBytes)) return
  const expected = PNG.sync.read(expectedBytes), actual = PNG.sync.read(actualBytes)
  if (actual.width !== expected.width || actual.height !== expected.height) {
    return { reason: `expected ${expected.width}×${expected.height}, received ${actual.width}×${actual.height}` }
  }
  const { width, height } = actual
  const diff = new PNG({ width, height })
  const changed = pixelmatch(expected.data, actual.data, diff.data, width, height, {
    threshold: 0.14, includeAA: false, alpha: 0.3,
  })
  const allowed = Math.max(5, Math.min(128, Math.floor(width * height * 0.001)))
  if (changed > allowed) return { reason: `${changed} pixels differ (limit ${allowed})`, image: PNG.sync.write(diff) }
}

export const launchVisualBrowser = () => chromium.launch({
  args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'],
  // Inter comes from Alpina itself. Limit native fallback to the same DejaVu
  // families across Linux distributions, including the QR slip and mono code.
  env: platform === 'linux' ? { ...process.env, FONTCONFIG_FILE: fileURLToPath(new URL('./visual-fonts.conf', import.meta.url)) } : process.env,
})
