import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'
import { verifyDomain } from '../scripts/verify-domain.mjs'

test('domain verification checks the first redirect, every sitemap page and both archive URLs in fresh installs', { timeout: 75000 }, async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'alpina-domain-origin-'))
  const servers = []
  async function serve(handle) {
    const server = createServer(handle)
    await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve))
    servers.push(server)
    return 'http://127.0.0.1:' + server.address().port
  }
  try {
    const version = '9.0.0', name = 'alpina-ui-' + version + '.tgz'
    await mkdir(join(scratch, 'package'))
    await writeFile(join(scratch, 'package/package.json'), JSON.stringify({ name: 'alpina-ui', version }))
    await promisify(execFile)('tar', ['-czf', name, 'package'], { cwd: scratch, timeout: 10000 })
    const bytes = await readFile(join(scratch, name)), digest = createHash('sha512').update(bytes).digest()
    const languages = ['en', 'it', 'de', 'fr']
    const guide = (slug, language) => '/docs/guides/' + slug + '/' + (language === 'en' ? '' : language + '/')
    const paths = ['/', ...['start', 'swiss'].flatMap(slug => languages.map(language => guide(slug, language)))]
    let corrupt = false
    const origin = await serve((req, res) => {
      const path = new URL(req.url, origin).pathname
      if (path === '/sitemap.xml') return res.end('<urlset>' + paths.map(p => '<url><loc>' + origin + p + '</loc></url>').join('') + '</urlset>')
      if (path === '/robots.txt') return res.end('Sitemap: ' + origin + '/sitemap.xml')
      if (path === '/llms.txt') return res.end('[Library](' + origin + '/)')
      if (path === '/' + name) return res.end(corrupt ? Buffer.from('broken archive') : bytes)
      if (path === '/' + name + '.sha512') return res.end(digest.toString('hex') + '  ' + name + '\n')
      if (!paths.includes(path)) { res.writeHead(404); return res.end() }
      const alternates = path === '/' ? '' : [...languages, 'x-default'].map(lang =>
        '<link rel="alternate" hreflang="' + lang + '" href="' + origin + guide(path.split('/')[3], lang === 'x-default' ? 'en' : lang) + '">').join('')
      res.end('<html><head><link rel="canonical" href="' + origin + path + '"><meta property="og:url" content="' + origin + path + '">' + alternates + '</head><body></body></html>')
    })
    let dropQuery = false
    const requests = new Set()
    const alias = (req, res) => {
      requests.add(req.method + ' ' + req.url)
      res.writeHead(308, { Location: origin + (dropQuery ? req.url.split('?')[0] : req.url) })
      res.end()
    }
    const previous = await serve(alias), www = await serve(alias)
    const options = { origin, previous, www, version, archives: new Map([[name, digest]]) }
    const result = await verifyDomain(options)
    assert.equal(result.pages, paths.length)
    assert.equal(result.translated, 8)
    assert.equal(result.integrity, 'sha512-' + digest.toString('base64'))
    assert.ok(requests.has('GET /' + name), 'The legacy address also serves the archive')
    assert.ok([...requests].some(path => path.startsWith('GET /favicon.svg/?from=')))
    corrupt = true
    await assert.rejects(verifyDomain(options), /Archive bytes changed/)
    corrupt = false
    dropQuery = true
    await assert.rejects(verifyDomain(options), /preserve path and query/)
  } finally {
    for (const server of servers) {
      server.closeAllConnections()
      await new Promise(resolve => server.close(resolve))
    }
    await rm(scratch, { recursive: true, force: true, maxRetries: 4 })
  }
})
