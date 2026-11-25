import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { siteUrl } from '../scripts/site-config.mjs'
import { publicRoutes } from './public-pages.mjs'

const config = JSON.parse(await readFile('vercel.json', 'utf8'))
// Vercel runs its global slash normalizer before custom redirects. It treats 0.11 as a file.
assert.equal(config.trailingSlash, undefined, 'A global slash rule preempts the dotted release URL')
const redirects = config.redirects.filter(rule => rule.statusCode === 301)
assert.deepEqual(config.redirects.slice(0, redirects.length), redirects, 'Retired URLs must match before slash normalization')
const paths = new Set(await publicRoutes())
const retired = new Set(redirects.map(rule => rule.source.replace(/\/$/, '')))
const expected = { core: 'build', interactive: 'build', actions: 'build', elements: 'build', workflows: 'build', research: 'design', coverage: 'migration', portal: 'build', directory: '/examples/' }
for (const [slug, successor] of Object.entries(expected)) {
  const target = successor.startsWith('/') ? successor : '/docs/guides/' + successor + '/'
  for (const [source, destination] of [
    ['/docs/guides/' + slug + '/', target],
    ['/reference/' + slug + '.md', successor.startsWith('/') ? successor : '/reference/' + successor + '.md'],
  ]) {
    assert.ok(redirects.some(r => r.source === source && r.destination === destination && r.statusCode === 301), source)
    assert.ok(!paths.has(source), source + ' appears in the sitemap')
    const oldFile = 'site' + source + (source.endsWith('/') ? 'index.html' : '')
    await assert.rejects(readFile(oldFile), { code: 'ENOENT' }, oldFile + ' is still served by the static build')
    if (destination.endsWith('/')) assert.ok(paths.has(destination), destination)
    else await readFile('site' + destination, 'utf8')
  }
}
for (const source of ['/releases/0.11/', '/releases/0.11']) {
  assert.ok(redirects.some(r => r.source === source && r.destination === '/docs/guides/design/'), source)
}
const failures = []
function check(route, href) {
  const url = new URL(href.replaceAll('&amp;', '&'), siteUrl + route)
  if (url.origin !== siteUrl) return
  if (retired.has(url.pathname.replace(/\/$/, '')) || (url.hash.startsWith('#guide/') && Object.hasOwn(expected, url.hash.slice(7))))
    failures.push(route + ' links to ' + href)
}
for (const route of paths) {
  const html = await readFile('site' + route + (route.endsWith('/') ? 'index.html' : ''), 'utf8')
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) check(route, href)
}
const index = await readFile('site/llms.txt', 'utf8')
for (const [, href] of index.matchAll(/\]\(([^)]+)\)/g)) check('/llms.txt', href)
assert.deepEqual(failures, [], 'Published links must use canonical destinations')
console.log('Verified permanent guide redirects and canonical links on ' + paths.size + ' public pages.')

if (process.argv.includes('--deployed')) {
  const requests = [
    ...redirects,
    { source: '/docs/guides/start', destination: '/docs/guides/start/', statusCode: 308 },
    { source: '/favicon.svg/', destination: '/favicon.svg', statusCode: 308 },
    { source: '/docs/guides/design/', statusCode: 200 },
    { source: '/favicon.svg', statusCode: 200 },
  ]
  for (const { source, destination, statusCode } of requests) {
    const response = await fetch(new URL(source, siteUrl), { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(30000) })
    assert.equal(response.status, statusCode, source + ' returned ' + response.status)
    if (destination) assert.equal(new URL(response.headers.get('location'), siteUrl).href, new URL(destination, siteUrl).href, source)
  }
  console.log('Verified the first HTTP response for all retired URLs and representative canonical routes on ' + siteUrl)
}
