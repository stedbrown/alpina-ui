import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { measureInteractions } from './interaction-vitals.mjs'
import { chromium } from 'playwright-core'

const site = resolve('site')
const reports = resolve('test-results/lighthouse')
await mkdir(reports, { recursive: true })
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.json': 'application/json' }
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'
    const file = resolve(site, '.' + pathname)
    if (!file.startsWith(site + sep)) throw Error('Unknown path')
    const body = await readFile(file)
    const type = mime[extname(file)] ?? 'application/octet-stream'
    const compress = /^(text\/|application\/json)/.test(type) && /gzip/.test(request.headers['accept-encoding'] ?? '')
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': pathname.startsWith('/assets/') ? 'public,max-age=31536000,immutable' : 'no-cache',
      ...(compress ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}) })
    response.end(compress ? gzipSync(body) : body)
  } catch { response.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = 'http://127.0.0.1:' + server.address().port
const cli = fileURLToPath(import.meta.resolve('lighthouse/cli/index.js'))
const chrome = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  (existsSync(chromium.executablePath()) ? chromium.executablePath() : undefined)
const routes = { home: '/', button: '/docs/components/button/', login: '/blocks/login/' }
async function audit(name, route, profile) {
  const output = resolve(reports, profile + '-' + name + '.json')
  const flags = [cli, origin + route, '--only-categories=performance,accessibility', '--output=json', '--output-path=' + output,
    ...(profile === 'desktop' ? ['--preset=desktop'] : []),
    '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage', '--quiet']
  const child = spawn(process.execPath, flags, { stdio: 'inherit', env: { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) } })
  const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve) })
  assert.equal(code, 0, 'Lighthouse could not audit ' + route)
  const report = JSON.parse(await readFile(output, 'utf8'))
  assert.ok(!report.runtimeError, report.runtimeError?.message)
  const performance = report.categories.performance.score * 100
  const accessibility = report.categories.accessibility.score * 100
  const cls = report.audits['cumulative-layout-shift'].numericValue
  const lcp = report.audits['largest-contentful-paint'].numericValue
  const tbt = report.audits['total-blocking-time'].numericValue
  console.log(profile, route, 'Performance', performance, 'Accessibility', accessibility, 'CLS', cls, 'LCP', Math.round(lcp) + ' ms', 'TBT', Math.round(tbt) + ' ms')
  const fonts = report.audits['network-requests'].details.items.filter(item => item.url.includes('/inter-latin-standard-normal-'))
  assert.equal(fonts.length, 1, 'The preloaded Latin font should make one request')
  assert.equal(fonts[0].statusCode, 200, 'Inter must be available from this deployment')
  return performance >= 95 && accessibility === 100 && cls === 0
}
const failures = []
try {
  for (const profile of ['mobile', 'desktop']) {
    for (const [name, route] of Object.entries(routes)) {
      if (!await audit(name, route, profile)) failures.push(profile + ' ' + route)
    }
  }
  await measureInteractions(origin, routes, reports)
  assert.deepEqual(failures, [], 'Lighthouse thresholds failed. Inspect test-results/lighthouse for full reports.')
} finally { await new Promise(resolve => server.close(resolve)) }
