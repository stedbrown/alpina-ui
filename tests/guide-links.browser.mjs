import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { siteUrl } from '../scripts/site-config.mjs'
import { publicRoutes } from './public-pages.mjs'

const { redirects } = JSON.parse(await readFile('vercel.json', 'utf8'))
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
assert.ok(redirects.some(r => r.source === '/releases/0.11/' && r.statusCode === 301 && paths.has(r.destination)))
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
