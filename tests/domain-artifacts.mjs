import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { gunzipSync } from 'node:zlib'

const retired = ['alpina-ui', 'vercel', 'app'].join('.')
// Catch literal hostnames and equivalent escaped dots in JavaScript, JSON and regular expressions.
const pattern = retired.split('.').join(String.raw`\\*\.`)
const oldHostname = new RegExp(pattern, 'i')

function clean(bytes, file) {
  // Latin-1 retains every byte, including ASCII hostnames in binary files and embedded metadata.
  assert.ok(!oldHostname.test(bytes.toString('latin1')), file + ' contains the retired hostname')
}

function cleanPackage(bytes, label) {
  // npm creates gzip-compressed tar archives. Scan every member, including files with no extension.
  const tar = gunzipSync(bytes)
  let count = 0
  for (let offset = 0; offset + 512 <= tar.length; ) {
    const header = tar.subarray(offset, offset + 512)
    if (header.every(byte => byte === 0)) break
    const name = header.subarray(0, 100).toString().split('\0')[0]
    const size = parseInt(header.subarray(124, 136).toString(), 8)
    assert.ok(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= tar.length, label + ': invalid tar member ' + name)
    clean(header, label + ' header for ' + name)
    clean(tar.subarray(offset + 512, offset + 512 + size), label + ':' + name)
    offset += 512 + Math.ceil(size / 512) * 512
    count++
  }
  assert.ok(count > 0, label + ' has no package entries')
}

export async function checkSourceDomain(root, pkg) {
  // Match tracked source, tests, docs and config, including staged content in the working tree.
  const search = spawnSync('git', ['grep', '-Il', '-i', '-E', pattern, '--', '.', ':(exclude)vercel.json'], {
    cwd: root, encoding: 'utf8', timeout: 15000,
  })
  if (search.error) throw search.error
  assert.ok([0, 1].includes(search.status), search.stderr)
  assert.equal(search.stdout.trim(), '', 'Retired hostname in tracked files:\n' + search.stdout)

  const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'))
  const [first] = config.redirects
  const host = retired.replaceAll('.', '\\.')
  assert.deepEqual(first, {
    source: '/:path(.*)', has: [{ type: 'host', value: host }],
    destination: new URL('/:path', pkg.homepage).href, statusCode: 308,
  }, 'The only permitted use of the old hostname is the exact first-hop host redirect')
  delete first.has[0].value
  clean(Buffer.from(JSON.stringify(config)), 'vercel.json outside the old-host redirect condition')
}

export async function checkBuiltDomain(root, site, pkg) {
  const current = pkg.name + '-' + pkg.version + '.tgz'
  const archive = join(site, current)
  // The metadata test builds a fresh site, so its bundled tarball is npm's actual current pack.
  // Also check the immutable bytes used by the production catalog and pinned by the example.
  const packed = await readFile(archive)
  cleanPackage(packed, current + ' (fresh pack)')
  const offline = await readFile(join(site, 'catalog.html'), 'utf8')
  const inline = offline.match(/data:application\/gzip;base64,([A-Za-z0-9+/=]+)/)
  assert.ok(inline && Buffer.from(inline[1], 'base64').equals(packed), 'Offline catalog embeds the same checked archive')
  cleanPackage(await readFile(join(root, 'recipes/rubrica/vendor', current)), current + ' (public download)')
  async function scan(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name)
      if (entry.isDirectory()) await scan(file)
      else if (file !== archive) clean(await readFile(file), relative(site, file))
    }
  }
  await scan(site)
}
