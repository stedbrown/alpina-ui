import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { PNG } from 'pngjs'
import { resolveSiteUrl, siteMetadata } from '../scripts/site-config.mjs'
import { checkBuiltDomain, checkSourceDomain } from './domain-artifacts.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

test('deployment URL accepts a single HTTP(S) origin', () => {
  assert.equal(resolveSiteUrl('https://Example.org/'), 'https://example.org')
  for (const url of ['/docs', 'ftp://example.org', 'https://user@example.org/', 'https://example.org/docs',
    'https://example.org/?version=1', 'https://example.org/#home']) assert.throws(() => resolveSiteUrl(url))
})

test('an alternate-domain build shares and indexes each hosted page on that domain', async () => {
  const origin = 'https://design.example.test'
  const dir = await mkdtemp(path.join(tmpdir(), 'alpina-site-'))
  const read = file => readFile(path.join(dir, file), 'utf8')
  try {
    // Exercise the same offline bundler and static renderer as the production deployment.
    await promisify(execFile)(process.execPath, ['scripts/catalog.mjs'], {
      cwd: root, env: { ...process.env, SITE_URL: origin + '/', ALPINA_SITE_OUTPUT: dir },
    })
    const [home, sitemap, robots, index, start, markdown, offline, pkg] = await Promise.all([
      read('index.html'), read('sitemap.xml'), read('robots.txt'), read('llms.txt'),
      read('docs/guides/start/index.html'), read('reference/start.md'), read('catalog.html'),
      readFile(path.join(root, 'package.json'), 'utf8').then(JSON.parse),
    ])
    await checkSourceDomain(root, pkg)
    await checkBuiltDomain(root, dir, pkg)
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url)
    assert.equal(new Set(urls).size, urls.length)
    assert.ok(urls.includes(origin + '/') && urls.includes(origin + '/docs/components/button/'))
    assert.ok(!urls.includes(origin + '/catalog.html'))
    assert.equal(robots, 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n')
    for (const url of urls) {
      assert.equal(new URL(url).origin, origin)
      const head = (await read(new URL(url).pathname + 'index.html')).split('</head>')[0]
      const translation = /^\/docs\/guides\/(start|swiss)\/(?:(it|de|fr)\/)?$/.exec(new URL(url).pathname)
      assert.ok(head.includes('<html lang="' + (translation?.[2] ?? 'en') + '"'), url)
      assert.ok(head.includes('<link rel="canonical" href="' + url + '">'), url)
      assert.ok(head.includes('<meta property="og:url" content="' + url + '">'), url)
      if (translation) {
        const base = origin + '/docs/guides/' + translation[1] + '/'
        for (const tag of ['en', 'de', 'fr', 'it', 'x-default'])
          assert.ok(head.includes('hreflang="' + tag + '" href="' + base + (['en', 'x-default'].includes(tag) ? '' : tag + '/') + '"'), url)
      } else assert.doesNotMatch(head, /hreflang=/)
    }
    const metadata = (key, html = home) => html.match(new RegExp('<meta (?:name|property)="' + key + '" content="([^"]+)"'))?.[1]
    const image = new URL(metadata('og:image'))
    assert.equal(image.origin, origin)
    assert.equal(image.pathname, siteMetadata.imagePath)
    const { width, height } = PNG.sync.read(await readFile(path.join(dir, image.pathname)))
    assert.deepEqual([width, height], [1200, 630])
    assert.equal(metadata('og:image:width'), String(width))
    assert.equal(metadata('og:image:height'), String(height))
    assert.match(metadata('og:image:alt'), /Swiss design for React/)
    assert.equal(metadata('twitter:card'), 'summary_large_image')
    for (const key of ['title', 'description', 'image', 'image:alt']) {
      assert.equal(metadata('twitter:' + key), metadata('og:' + key))
    }
    assert.equal(metadata('description'), metadata('og:description'))
    assert.equal(metadata('og:title'), home.match(/<title>([^<]+)<\/title>/)[1])
    const source = JSON.parse(home.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1])
    assert.equal(source['@type'], 'SoftwareSourceCode')
    assert.equal(source.url, origin + '/')
    assert.equal(source.image, image.href)
    assert.equal(source.version, pkg.version)
    assert.equal(source.inLanguage, 'en')
    assert.equal(source.codeRepository, 'https://github.com/stedbrown/alpina-ui')
    const agentLinks = [...index.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(match => new URL(match[1]))
    assert.ok(agentLinks.length > 10 && agentLinks.every(url => url.origin === origin))
    for (const file of [start, markdown]) {
      assert.ok(file.includes(origin + '/docs/guides/migration/'))
      assert.ok(!file.includes(new URL(pkg.homepage).origin + '/'))
    }
    assert.ok(!offline.includes(new URL(pkg.homepage).origin + '/'))
    assert.ok(offline.includes('href="#guide/migration"'))
    assert.match(offline, /<meta name="robots" content="noindex">/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
