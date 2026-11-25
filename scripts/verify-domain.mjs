import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const root = fileURLToPath(new URL('../', import.meta.url))
const sha512 = bytes => createHash('sha512').update(bytes).digest()
const probe = '?from=domain%2Fverification&sort=a%2Bb&view=1&view=2'

async function eachBatch(items, inspect, size = 6) {
  for (let first = 0; first < items.length; first += size)
    await Promise.all(items.slice(first, first + size).map(inspect))
}

async function installArchive(origin, name, version, digest) {
  const directory = await mkdtemp(join(tmpdir(), 'alpina-domain-consumer-'))
  const url = new URL('/' + name, origin).href
  try {
    const manifest = { name: 'alpina-domain-consumer', private: true, dependencies: { 'alpina-ui': url } }
    await writeFile(join(directory, 'package.json'), JSON.stringify(manifest))
    // Omit peer installation so the download, checksums and metadata can also be tested offline on loopback.
    const args = ['install', '--legacy-peer-deps', '--ignore-scripts', '--no-audit', '--no-fund',
      '--package-lock=true', '--fetch-retries=1', '--fetch-timeout=15000', '--cache', join(directory, 'cache')]
    const npm = process.env.npm_execpath || (process.platform === 'win32' ? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js') : null)
    await exec(npm ? process.execPath : 'npm', npm ? [npm, ...args] : args, { cwd: directory, timeout: 60000 })
    const lock = JSON.parse(await readFile(join(directory, 'package-lock.json'), 'utf8'))
    assert.equal(lock.packages[''].dependencies['alpina-ui'], url)
    const installed = lock.packages['node_modules/alpina-ui']
    assert.equal(installed.version, version, url)
    assert.equal(installed.integrity, 'sha512-' + digest.toString('base64'), url)
    const pkg = JSON.parse(await readFile(join(directory, 'node_modules/alpina-ui/package.json'), 'utf8'))
    assert.equal(pkg.name, 'alpina-ui')
    assert.equal(pkg.version, version)
    return installed.integrity
  } finally {
    await rm(directory, { recursive: true, force: true, maxRetries: 4 })
  }
}

function alternateLanguages(head) {
  return new Map([...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map(([, language, href]) => [language, href]))
}

/** Check the first HTTP hop, the canonical pages themselves, and fresh installs from both download origins. */
export async function verifyDomain({ origin, previous, www, version, archives }) {
  const deadline = AbortSignal.timeout(180000)
  const request = (url, options = {}) => fetch(url, {
    redirect: 'manual', ...options, signal: AbortSignal.any([deadline, AbortSignal.timeout(12000)]),
  })
  async function ok(url, options = {}) {
    const res = await request(url, options)
    assert.equal(res.status, 200, 'Expected 200 immediately from ' + url + ', got ' + res.status)
    return res
  }
  async function redirect(alias, path, method) {
    const from = new URL(path, alias), expected = new URL(path, origin)
    const res = await request(from, { method })
    await res.body?.cancel()
    assert.equal(res.status, 308, from.href + ' returned ' + res.status)
    assert.equal(res.headers.get('location'), expected.href, 'First redirect from ' + from.href + ' must preserve path and query')
  }

  const xml = await (await ok(new URL('/sitemap.xml', origin))).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url))
  assert.ok(urls.some(url => url.pathname === '/'), 'Sitemap must contain the homepage')
  assert.equal(new Set(urls.map(url => url.href)).size, urls.length)
  for (const url of urls) assert.equal(url.origin, origin, url.href)
  const robots = await (await ok(new URL('/robots.txt', origin))).text()
  assert.ok(robots.includes('Sitemap: ' + origin + '/sitemap.xml'))
  const llms = await (await ok(new URL('/llms.txt', origin))).text()
  assert.ok(llms.includes(origin + '/') && !llms.includes(previous), 'llms.txt must advertise the primary origin')

  const paths = new Set(urls.map(url => url.pathname + url.search))
  const translated = new Map()
  await eachBatch(urls, async url => {
    const html = await (await ok(url)).text()
    const head = html.slice(0, html.indexOf('</head>'))
    assert.ok(head.includes('<link rel="canonical" href="' + url.href + '"'), 'Incorrect canonical on ' + url.href)
    assert.ok(head.includes('<meta property="og:url" content="' + url.href + '"'), 'Incorrect Open Graph URL on ' + url.href)
    const alternates = alternateLanguages(head)
    if (alternates.size) translated.set(url.href, alternates)

    for (const href of alternates.values()) {
      const destination = new URL(href)
      assert.ok(destination.origin === origin && paths.has(destination.pathname), 'Unlisted hreflang on ' + url.href + ': ' + href)
    }
  })
  for (const guide of ['start', 'swiss']) {
    const en = new URL('/docs/guides/' + guide + '/', origin).href
    const group = new Map([['en', en], ['it', en + 'it/'], ['de', en + 'de/'], ['fr', en + 'fr/'], ['x-default', en]])
    for (const href of group.values()) assert.deepEqual(translated.get(href), group, 'Missing or incorrect guide links on ' + href)
  }
  for (const [url, alternates] of translated) {
    for (const href of alternates.values()) {
      assert.deepEqual(translated.get(href), alternates, 'Nonreciprocal language links on ' + url)
    }
  }

  const release = 'alpina-ui-' + version + '.tgz'
  assert.ok(archives.has(release), 'Missing tracked release archive ' + release)
  for (const name of archives.keys()) {
    paths.add('/' + name)
    paths.add('/' + name + '.sha512')
  }
  for (const path of ['/sitemap.xml', '/robots.txt', '/llms.txt', '/catalog.html', '/favicon.svg',
    '/favicon.svg/', '/docs/guides/start', '/docs/components/button', '/releases/0.11', '/releases/0.11/']) paths.add(path)
  await eachBatch([...paths], async path => {
    for (const alias of [previous, www]) {
      await redirect(alias, path, 'HEAD')
      await redirect(alias, path + probe, 'GET')
    }
  })

  await eachBatch([...archives], async ([name, expected]) => {
    for (const base of [origin, previous]) {
      const url = new URL('/' + name, base)
      const options = base === origin ? {} : { redirect: 'follow' }
      const archive = await ok(url, options)
      assert.equal(archive.url, origin + '/' + name, 'Unexpected final download URL')
      assert.ok(sha512(Buffer.from(await archive.arrayBuffer())).equals(expected), 'Archive bytes changed at ' + url)
      const sidecar = await ok(url.href + '.sha512', options)
      assert.equal(sidecar.url, archive.url + '.sha512', 'Unexpected final checksum URL')
      assert.equal((await sidecar.text()).trim(), expected.toString('hex') + '  ' + name, 'Checksum file differs at ' + url)
    }
  }, 3)
  const integrity = await installArchive(origin, release, version, archives.get(release))
  assert.equal(await installArchive(previous, release, version, archives.get(release)), integrity)
  return { pages: urls.length, translated: translated.size, paths: paths.size, archives: archives.size, integrity }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  const origin = new URL(pkg.homepage).origin
  const previous = 'https://' + ['alpina-ui', 'vercel', 'app'].join('.')
  const www = 'https://www.' + new URL(origin).hostname
  const { stdout } = await exec('git', ['ls-files', '-z', '--', 'recipes/rubrica/vendor/*.tgz'], { cwd: root, timeout: 10000 })
  const archives = new Map()
  for (const path of stdout.split('\0').filter(Boolean)) {
    const name = path.split('/').pop()
    archives.set(name, sha512(await readFile(join(root, path))))
  }
  const lock = JSON.parse(await readFile(join(root, 'recipes/rubrica/package-lock.json'), 'utf8'))
  const pinned = lock.packages['node_modules/alpina-ui']
  const current = archives.get('alpina-ui-' + pkg.version + '.tgz')
  assert.ok(current, 'Current archive must be in the tracked distribution')
  assert.equal(pinned.version, pkg.version)
  assert.equal(pinned.integrity, 'sha512-' + current.toString('base64'), 'Recipe integrity must match the public release')
  const result = await verifyDomain({ origin, previous, www, version: pkg.version, archives })
  console.log(`Verified ${result.pages} canonical pages, ${result.translated} translated pages, ${result.paths} legacy paths on both aliases, ${result.archives} archives and two fresh npm installs.\n${result.integrity}`)
}
