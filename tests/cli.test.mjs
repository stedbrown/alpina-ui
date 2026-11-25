import assert from 'node:assert/strict'
import { execFile, spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const root = fileURLToPath(new URL('../', import.meta.url))
const executable = path.join(root, 'cli', 'alpina.mjs')
const registry = JSON.parse(await readFile(path.join(root, 'registry.json'), 'utf8'))
const licenseFile = 'ALPINA-LICENSE.txt'

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'alpina-cli-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const cwd = path.join(directory, 'app')
  await mkdir(cwd)
  return {
    cwd,
    destination: path.join(cwd, 'components', 'alpina'),
    run: (...args) => execute(process.execPath, [executable, ...args], { cwd }),
  }
}

async function listFiles(directory, relative = '') {
  const files = []
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(directory, name)))
    else files.push(name)
  }
  return files.sort()
}

async function assertCopies(directory, files) {
  assert.deepEqual(await listFiles(directory), [licenseFile, ...files].sort())
  assert.deepEqual(await readFile(path.join(directory, licenseFile)), await readFile(path.join(root, 'LICENSE')))
  for (const file of files) {
    const original = await readFile(path.join(root, file.startsWith('blocks/') ? '' : 'src', file))
    const copy = await readFile(path.join(directory, file))
    assert.deepEqual(copy, original, file)
  }
}

test('init copies the theme and its notice, preserves the project license and supports repeated calls', async (t) => {
  const { run, cwd, destination } = await fixture(t)
  const projectLicense = path.join(cwd, 'LICENSE')
  await writeFile(projectLicense, 'Project license\n')
  await run('init')
  await assertCopies(destination, ['theme.css'])
  assert.equal(await readFile(projectLicense, 'utf8'), 'Project license\n')
  const file = path.join(destination, 'theme.css')
  const originalTime = new Date('2005-01-01T12:00:00Z')
  await utimes(file, originalTime, originalTime)
  const { stdout } = await run('init')
  assert.match(stdout, /present\s+/)
  assert.equal((await stat(file)).mtimeMs, originalTime.getTime())
})

test('selective add copies only the requested entries, styles and transitive dependencies', async (t) => {
  const { run, cwd } = await fixture(t)
  await run('add', 'canton-select', 'dialog', '--dir', 'src/design')
  const files = [
    'theme.css',
    'swiss/canton-select.tsx',
    'swiss/cantons.ts',
    'swiss/locales.ts',
    'ui/select.tsx',
    'ui/select.css',
    'ui/select-picker.internal.ts',
    'ui/select-enhancement.internal.tsx',
    'interactive/dialog.tsx',
    'interactive/controllable.ts',
    'interactive/floating.ts',
    'interactive/native-select.tsx',
    'interactive/native-select.css',
    'interactive/modal-surface.tsx',
    'interactive/modal-surface.css',
  ]
  await assertCopies(path.join(cwd, 'src', 'design'), files)
  assert.deepEqual(await readdir(cwd), ['src'])
})

test('add --all copies the union of all registry entries once', async (t) => {
  const { run, destination } = await fixture(t)
  const files = new Set(registry.items.flatMap((item) => item.files))
  const first = await run('add', '--all')
  assert.equal(
    first.stdout.split(/\r?\n/).filter((line) => line.startsWith('added')).length,
    files.size + 1,
  )
  await assertCopies(destination, files)
  const second = await run('add', '--all')
  assert.doesNotMatch(second.stdout, /added|keep/)
  assert.equal(
    second.stdout.split(/\r?\n/).filter((line) => line.startsWith('present')).length,
    files.size + 1,
  )
})

test('list exposes the editable blocks and a block-only add copies the source and notice', async (t) => {
  const { run, destination } = await fixture(t)
  const names = ['account-settings', 'dashboard', 'login', 'pricing', 'public-service']
  const blockNames = names.map(name => 'block/' + name)
  const { stdout } = await run('list')
  assert.ok(stdout.includes('blocks\n  ' + blockNames.join(', ')))
  await run('add', ...blockNames)
  await assertCopies(destination, [...names.map(name => 'blocks/' + name + '.tsx'),
    ...['definition.ts', 'draft.ts', 'form.tsx', 'messages.ts'].map(name => 'blocks/public-service/' + name)])
})

test('mixed dry run, copy, detection and comparison preserve local block edits', async (t) => {
  const { run, cwd } = await fixture(t)
  const dir = 'src/design'
  const selection = ['button', 'block/login', '--dir', dir]
  const preview = await run('add', ...selection, '--dry-run')
  assert.match(preview.stdout, /planned\s+.*blocks[\\/]login\.tsx/)
  assert.deepEqual(await readdir(cwd), [])
  await run('add', ...selection)
  const files = registry.items.find(item => item.name === 'button').files
  const destination = path.join(cwd, dir)
  await assertCopies(destination, [...files, 'blocks/login.tsx'])

  const file = path.join(destination, 'blocks', 'login.tsx')
  const edit = (await readFile(file, 'utf8')) + '\n// Local sign-in action.\n'
  await writeFile(file, edit)
  assert.match((await run('add', ...selection)).stdout, /keep\s+.*blocks[\\/]login\.tsx/)
  const detected = await run('diff', '--dir', dir)
  assert.match(detected.stdout, /modified\s+.*blocks[\\/]login\.tsx/)
  assert.match(detected.stdout, /aligned\s+.*ui[\\/]button\.tsx/)
  assert.doesNotMatch(detected.stdout, /dashboard\.tsx/)
  const named = await run('diff', 'block/login', 'block/dashboard', '--dir', dir)
  assert.match(named.stdout, /missing\s+.*blocks[\\/]dashboard\.tsx/)
  assert.match(named.stdout, /Files aligned 1 · modified 1 · missing 1/)
  assert.equal(await readFile(file, 'utf8'), edit)
})

test('a block destination conflict leaves a mixed installation untouched', async (t) => {
  const { run, destination } = await fixture(t)
  await mkdir(destination, { recursive: true })
  await writeFile(path.join(destination, 'blocks'), 'Existing project file')
  await assert.rejects(run('add', 'button', 'block/login'), /Path already in use/)
  assert.deepEqual(await listFiles(destination), ['blocks'])
  assert.equal(await readFile(path.join(destination, 'blocks'), 'utf8'), 'Existing project file')
})

test('dry runs describe files without creating directories or changing edited sources', async (t) => {
  const { run, cwd, destination } = await fixture(t)
  assert.match((await run('init', '--dry-run')).stdout, /planned\s+.*theme\.css/)
  assert.match((await run('add', '--dry-run', 'dialog')).stdout, /planned\s+.*dialog\.tsx/)
  assert.deepEqual(await readdir(cwd), [])
  await run('init')
  const file = path.join(destination, 'theme.css')
  await writeFile(file, '/* Tema del progetto. */\n')
  const { stdout } = await run('add', 'button', '--dry-run')
  assert.match(stdout, /keep\s+.*theme\.css/)
  assert.match(stdout, /planned\s+.*button\.tsx/)
  assert.deepEqual(await listFiles(destination), [licenseFile, 'theme.css'])
  assert.equal(await readFile(file, 'utf8'), '/* Tema del progetto. */\n')
})

test('add preserves modified shared components while installing missing dependencies', async (t) => {
  const { run, destination } = await fixture(t)
  await run('add', 'select')
  const file = path.join(destination, 'ui', 'select.tsx')
  const changed = (await readFile(file, 'utf8')) + '\n// Modifica locale.\n'
  await writeFile(file, changed)
  const { stdout } = await run('add', 'canton-select')
  assert.match(stdout, /keep\s+.*select\.tsx/)
  assert.equal(await readFile(file, 'utf8'), changed)
  assert.ok((await stat(path.join(destination, 'swiss', 'canton-select.tsx'))).isFile())
})

test('diff detects installed entries, compares shared files once and preserves the local copy', async (t) => {
  const { run, destination } = await fixture(t)
  await run('add', 'dialog', 'sheet')
  const edited = path.join(destination, 'interactive', 'controllable.ts')
  const local = '// Modifica del progetto.\n' + (await readFile(edited, 'utf8'))
  await writeFile(edited, local)
  const time = new Date('2020-02-01T10:30:00Z')
  await utimes(edited, time, time)
  const missing = path.join(destination, 'interactive', 'modal-surface.css')
  await rm(missing)
  await writeFile(path.join(destination, 'note.txt'), 'Documento del progetto.')
  const { stdout } = await run('diff')
  const selected = registry.items.filter((item) => ['dialog', 'sheet'].includes(item.name))
  const uniqueFiles = new Set(selected.flatMap((item) => item.files))
  assert.ok(stdout.includes('Comparing with Alpina UI ' + registry.version))
  assert.match(stdout, /aligned\s+.*theme\.css/)
  assert.match(stdout, /missing\s+.*modal-surface\.css/)
  assert.match(stdout, /modified\s+.*controllable\.ts/)
  assert.equal(stdout.match(/controllable\.ts/g)?.length, 1)
  assert.ok(stdout.includes(`Files aligned ${uniqueFiles.size - 1} · modified 1 · missing 1`))
  assert.doesNotMatch(stdout, /note\.txt|canton-select/)
  assert.equal(await readFile(edited, 'utf8'), local)
  assert.equal((await stat(edited)).mtimeMs, time.getTime())
  await assert.rejects(stat(missing), { code: 'ENOENT' })
})

test('diff can inspect a new project, a named missing entry or the full registry without writing', async (t) => {
  const { run, cwd } = await fixture(t)
  const dir = 'src/alpina'
  assert.match((await run('diff', '--dir', dir)).stdout, /No Alpina source files/)
  const { stdout } = await run('diff', 'button', '--dir', dir)
  assert.match(stdout, /missing\s+src[\\/]alpina[\\/]ui[\\/]button\.tsx/)
  assert.match(stdout, /missing\s+src[\\/]alpina[\\/]ui[\\/]slot\.tsx/)
  assert.match(stdout, /Files aligned 0 · modified 0 · missing 5/)
  const all = await run('diff', '--all', '--dir', dir)
  const files = new Set(registry.items.flatMap((item) => item.files))
  assert.equal(all.stdout.split(/\r?\n/).filter((row) => row.startsWith('missing')).length, files.size + 1)
  assert.deepEqual(await readdir(cwd), [])
  await run('init', '--dir', dir)
  assert.match((await run('diff', '--dir', dir)).stdout, /Files aligned 2 · modified 0 · missing 0/)
})

test('diff stays offline without Git, and explains an unavailable optional patch', async (t) => {
  const { run, cwd, destination } = await fixture(t)
  await run('init')
  await writeFile(path.join(destination, 'theme.css'), '/* Tema dedicato */\n')
  const options = { cwd, env: { ...process.env, PATH: '' } }
  const status = await execute(process.execPath, [executable, 'diff'], options)
  assert.match(status.stdout, /modified\s+.*theme\.css/)
  await assert.rejects(
    execute(process.execPath, [executable, 'diff', '--patch'], options),
    (error) => error.code === 1 && error.stderr.includes('Install Git to use --patch'),
  )
})

test(
  'diff --patch shows local removals and distributed additions',
  { skip: spawnSync('git', ['--version']).status !== 0 },
  async (t) => {
    const { run, destination } = await fixture(t)
    await run('add', 'button')
    const entry = path.join(destination, 'ui', 'button.tsx')
    const original = await readFile(entry, 'utf8')
    const local = original.replace('export const Button =', 'export const LocalButton =')
    assert.notEqual(local, original)
    await writeFile(entry, local)
    const { stdout } = await run('diff', 'button', '--patch')
    assert.match(stdout, /^-export const LocalButton =/m)
    assert.match(stdout, /^\+export const Button =/m)
    assert.equal(await readFile(entry, 'utf8'), local)
  },
)

test('invalid arguments fail before any file is written', async (t) => {
  const { run, cwd } = await fixture(t)
  for (const args of [
    ['add'],
    ['add', 'button', 'missing-component'],
    ['add', 'button', 'block/unknown'],
    ['add', 'button', 'block/../theme.css'],
    ['add', 'button', '--unknown'],
    ['init', 'button'],
    ['init', '--dir'],
    ['init', '--dir', '.'],
    ['diff', '--dir', '..'],
    ['diff', 'missing-component'],
    ['diff', 'button', '--all'],
    ['add', 'button', '--patch'],
    ['unknown'],
  ]) {
    await assert.rejects(
      run(...args),
      (error) => error.code === 1 && Boolean(error.stderr.trim()),
      args.join(' '),
    )
  }
  assert.deepEqual(await readdir(cwd), [])
})

test('standalone React consumer typechecks copied components without the Alpina package', async (t) => {
  const { run, cwd } = await fixture(t)
  await run('add', 'dialog', 'canton-select', '--dir', 'src/ui')
  await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  // Stage the consumer's ordinary React peers and declarations offline.
  for (const dependency of ['react', 'react-dom', '@types/react', '@types/react-dom', 'csstype']) {
    const destination = path.join(cwd, 'node_modules', dependency)
    await mkdir(path.dirname(destination), { recursive: true })
    await cp(path.join(root, 'node_modules', dependency), destination, { recursive: true })
  }
  await writeFile(
    path.join(cwd, 'src', 'app.tsx'),
    [
      'import { CantonSelect } from "./ui/swiss/canton-select.js"',
      'import { Dialog } from "./ui/interactive/dialog.js"',
      'import "./ui/theme.css"',
      'export function App() {',
      '  return <Dialog title="Cantone" closeLabel="Chiudi" trigger="Apri">',
      '    <CantonSelect aria-label="Cantone" locale="it-CH" defaultValue="TI" />',
      '  </Dialog>',
      '}',
    ].join('\n'),
  )
  await writeFile(path.join(cwd, 'src', 'assets.d.ts'), 'declare module "*.css"\n')
  await writeFile(
    path.join(cwd, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        noUncheckedSideEffectImports: true,
      },
      include: ['src'],
    }),
  )
  await execute(
    process.execPath,
    [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', '.'],
    { cwd },
  )
})
