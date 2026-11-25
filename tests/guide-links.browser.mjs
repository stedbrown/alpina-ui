import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { siteUrl } from '../scripts/site-config.mjs'
import { publicRoutes } from './public-pages.mjs'

const config = JSON.parse(await readFile('vercel.json', 'utf8'))
const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const productionOrigin = new URL(pkg.homepage).origin
const previousHost = ['alpina-ui', 'vercel.app'].join('.')
const previousOrigin = 'https://' + previousHost
// Vercel runs its global slash normalizer before custom redirects. It treats 0.11 as a file.
assert.equal(config.trailingSlash, undefined, 'A global slash rule preempts the dotted release URL')
const [hostRedirect, ...pathRedirects] = config.redirects
assert.deepEqual(hostRedirect, {
  source: '/:path(.*)',
  has: [{ type: 'host', value: previousHost.replaceAll('.', '\\.') }],
  destination: productionOrigin + '/:path',
  statusCode: 308,
}, 'Only the former production host must redirect, before all path-specific rules')
assert.notEqual(productionOrigin, previousOrigin, 'The old host must not redirect to itself')
const redirects = pathRedirects.filter(rule => rule.statusCode === 301)
assert.deepEqual(pathRedirects.slice(0, redirects.length), redirects, 'Retired URLs must match before slash normalization')
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
const changelogEntry = 'https://github.com/stedbrown/alpina-ui/blob/main/CHANGELOG.md#release-0-11-0'
for (const source of ['/releases/0.11/', '/releases/0.11']) {
  assert.ok(redirects.some(r => r.source === source && r.destination === changelogEntry), source + ' must link to its changelog entry')
}
assert.match(await readFile('CHANGELOG.md', 'utf8'), /<a name="release-0-11-0"><\/a>\s*## 0\.11\.0\b/)
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
  async function assertFirstResponse(origin, source, statusCode, destination) {
    const request = new URL(source, origin)
    const response = await fetch(request, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(30000) })
    assert.equal(response.status, statusCode, request.href)
    if (destination) {
      const location = response.headers.get('location')
      assert.ok(location, request.href + ' has no Location header')
      assert.equal(new URL(location, request).href, new URL(destination, origin).href, request.href)
    }
  }

  const requests = [
    ...redirects,
    { source: '/docs/guides/start', destination: '/docs/guides/start/', statusCode: 308 },
    { source: '/favicon.svg/', destination: '/favicon.svg', statusCode: 308 },
    { source: '/docs/guides/design/', statusCode: 200 },
    { source: '/favicon.svg', statusCode: 200 },
  ]
  for (const { source, destination, statusCode } of requests) {
    await assertFirstResponse(siteUrl, source, statusCode, destination)
  }
  console.log('Verified the first HTTP response for all retired URLs and representative canonical routes on ' + siteUrl)

  const archives = new Set(['alpina-ui-0.11.0.tgz', pkg.name + '-' + pkg.version + '.tgz'])
  const formerPaths = [...new Set([
    ...paths, ...requests.map(request => request.source),
    '/?ref=home', '/docs/components/button/?ref=old%2Fdocs&tag=grid&tag=type',
    '/releases/0.11?ref=bookmark', '/previously-unlisted/page/?ref=archive',
    ...[...archives].flatMap(file => ['/' + file, '/' + file + '.sha512']),
  ])]
  for (let start = 0; start < formerPaths.length; start += 4) {
    await Promise.all(formerPaths.slice(start, start + 4).map(source =>
      assertFirstResponse(previousOrigin, source, 308, productionOrigin + source)))
  }
  for (const file of archives) {
    const expectedHash = createHash('sha512').update(await readFile('recipes/rubrica/vendor/' + file)).digest('hex')
    for (const origin of [previousOrigin, productionOrigin]) {
      const response = await fetch(origin + '/' + file, { signal: AbortSignal.timeout(30000) })
      assert.equal(response.status, 200, origin + '/' + file)
      assert.equal(response.url, productionOrigin + '/' + file)
      assert.equal(createHash('sha512').update(Buffer.from(await response.arrayBuffer())).digest('hex'), expectedHash, response.url)
      const checksum = await fetch(origin + '/' + file + '.sha512', { signal: AbortSignal.timeout(30000) })
      assert.equal(checksum.status, 200, origin + '/' + file + '.sha512')
      assert.equal(checksum.url, productionOrigin + '/' + file + '.sha512')
      assert.equal((await checksum.text()).trimEnd(), expectedHash + '  ' + file, checksum.url)
    }
  }
  console.log('Verified ' + formerPaths.length + ' hostname redirects and the release downloads from both origins.')
}
