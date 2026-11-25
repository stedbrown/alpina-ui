import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('./', import.meta.url))
const repo = fileURLToPath(new URL('../', import.meta.url))
const endpoint = process.argv[2]
assert.ok(['minimum', 'latest'].includes(endpoint), 'Choose minimum or latest.')
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const manifest = await readJson(join(repo, 'package.json'))

function npm(args, cwd, capture = false) {
  return execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd, stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit', encoding: 'utf8',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  })
}

// npm applies the public semver range and excludes prereleases. Resolve both peers to the same release.
const range = manifest.peerDependencies.react
assert.equal(range, manifest.peerDependencies['react-dom'])
const releases = name => [].concat(JSON.parse(npm(['view', name + '@' + range, 'version', '--json'], repo, true)))
const dom = new Set(releases('react-dom'))
const supported = releases('react').filter(version => /^\d+\.\d+\.\d+$/.test(version) && dom.has(version))
supported.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
const version = supported.at(endpoint === 'minimum' ? 0 : -1)
assert.ok(version, 'No shared stable React and React DOM release in ' + range)
const is18 = version.startsWith('18.')
const scratch = await mkdtemp(join(tmpdir(), 'alpina-react-' + endpoint + '-'))

try {
  const [{ filename, integrity }] = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', scratch], repo, true))
  await rename(join(scratch, filename), join(scratch, 'alpina-ui.tgz'))
  console.log(`${filename} (${integrity}), React and React DOM ${version} (${endpoint})`)

  const workspace = await readJson(join(source, 'package.json'))
  const lock = await readJson(join(source, 'package-lock.json'))
  // The normal examples link to an extracted archive. This install must resolve the tarball itself.
  for (const key of Object.keys(lock.packages)) {
    if (key.startsWith('.alpina') ||
      /^node_modules\/(?:alpina-ui|react|react-dom|scheduler|react-router|@types\/react(?:-dom)?)$/.test(key)) {
      delete lock.packages[key]
    }
  }
  workspace.dependencies = { react: version, 'react-dom': version, 'alpina-ui': 'file:./alpina-ui.tgz' }
  await writeFile(join(scratch, 'package.json'), JSON.stringify(workspace))
  for (const project of workspace.workspaces) {
    const dest = join(scratch, project)
    await mkdir(dest)
    const next = project === 'next-app-router'
    const files = next ? ['next.config.mjs', 'pages', 'app'] : ['index.html', 'src']
    for (const file of [...files, 'tsconfig.json']) {
      await cp(join(source, project, file), join(dest, file), { recursive: true })
    }
    const app = await readJson(join(source, project, 'package.json'))
    Object.assign(app.dependencies, { react: version, 'react-dom': version, 'alpina-ui': 'file:../alpina-ui.tgz' })
    if (is18) {
      Object.assign(app.devDependencies, { '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0' })
      if (project === 'vite-react-router') app.dependencies['react-router'] = '7.18.7'
    }
    Object.assign(lock.packages[project], { dependencies: app.dependencies, devDependencies: app.devDependencies })
    await writeFile(join(dest, 'package.json'), JSON.stringify(app))
    if (!next) {
      // Read the modules the Vite bundler actually selected in the running production page.
      const entry = join(dest, 'src/main.tsx')
      await writeFile(entry, await readFile(entry, 'utf8') +
        "\nimport { version as reactVersion } from 'react'\nimport { version as domVersion } from 'react-dom'\n" +
        "document.documentElement.dataset.reactPeers = reactVersion + '/' + domVersion\n")
    }
  }

  lock.packages[''].dependencies = workspace.dependencies
  await writeFile(join(scratch, 'package-lock.json'), JSON.stringify(lock))
  npm(['install', '--strict-peer-deps', '--no-audit', '--no-fund'], scratch)
  npm(['ls', 'react', 'react-dom', '--all', '--json'], scratch, true)
  const installed = await readJson(join(scratch, 'package-lock.json'))
  const library = installed.packages['node_modules/alpina-ui']
  assert.equal(library.integrity, integrity, 'Installed tarball integrity')
  assert.equal((await lstat(join(scratch, 'node_modules/alpina-ui'))).isSymbolicLink(), false)
  const dependency = createRequire(join(scratch, 'node_modules/alpina-ui/package.json'))
  for (const project of workspace.workspaces) {
    const consumer = createRequire(join(scratch, project, 'package.json'))
    for (const name of ['react', 'react-dom']) {
      assert.equal(consumer(name + '/package.json').version, version, project + ' ' + name)
      assert.equal(dependency.resolve(name), consumer.resolve(name), 'Shared peer instance in ' + project)
    }
  }
  // React DOM 18.2.0 ships an internal renderer version containing its upstream build hash.
  const expectedRuntime = execFileSync(process.execPath, ['-p', "require('react').version + '/' + require('react-dom').version"], {
    cwd: scratch, env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8',
  }).trim()
  console.log('Installed runtime exports: ' + expectedRuntime)
  // Compile exactly the examples delivered to an agent in the installed archive.
  const skill = await readFile(join(scratch, 'node_modules/alpina-ui/skills/alpina-ui/SKILL.md'), 'utf8')
  const examples = [...skill.matchAll(/^```tsx\r?\n([\s\S]*?)^```/gm)]
  assert.equal(examples.length, 4, 'Four copyable Alpina workflow examples')
  for (const [i, match] of examples.entries()) {
    await writeFile(join(scratch, 'swiss-form/src/agent-example-' + i + '.tsx'), match[1])
  }
  npm(['run', 'build', '--workspaces'], scratch)
  execFileSync(process.execPath, [join(source, 'test.mjs'), scratch, expectedRuntime], { stdio: 'inherit' })
} finally {
  await rm(scratch, { recursive: true, force: true, maxRetries: 4 })
}
