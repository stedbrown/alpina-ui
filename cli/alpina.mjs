#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { lstat, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const usage = [
  'alpina list',
  'alpina mcp',
  'alpina init [--dir components/alpina] [--dry-run]',
  'alpina add button block/login … [--dir components/alpina] [--dry-run]',
  'alpina add --all [--dir components/alpina] [--dry-run]',
  'alpina diff [components and blocks | --all] [--dir components/alpina] [--patch]',
].join('\n')
const root = fileURLToPath(new URL('../', import.meta.url))
const licenseFile = 'ALPINA-LICENSE.txt'
const registry = JSON.parse(await readFile(path.join(root, 'registry.json'), 'utf8'))

async function blockEntries() {
  const files = await readdir(path.join(root, 'blocks'), { withFileTypes: true })
  const entries = files.filter(file => file.isFile() && /^[a-z0-9]+(?:-[a-z0-9]+)*\.tsx$/.test(file.name))
    .map(file => file.name).sort()
  return Promise.all(entries.map(async filename => {
      const name = filename.slice(0, -4)
      const entry = 'blocks/' + filename
      const directory = 'blocks/' + name
      const companions = files.some(file => file.isDirectory() && file.name === name)
        ? (await readdir(path.join(root, directory), { withFileTypes: true }))
          .filter(file => file.isFile() && /^[a-z0-9-]+\.tsx?$/.test(file.name)).map(file => directory + '/' + file.name).sort()
        : []
      return { group: 'blocks', name: 'block/' + name, entry, files: [entry, ...companions] }
    }))
}

async function stat(file) {
  try {
    return await lstat(file)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

async function checkPath(base, file) {
  let current = base
  for (const part of path.relative(base, file).split(path.sep)) {
    current = path.join(current, part)
    const info = await stat(current)
    if (info?.isSymbolicLink()) throw new Error('Cannot follow symbolic link: ' + current)
    if (info && current !== file && !info.isDirectory()) throw new Error('Path already in use: ' + current)
    if (current === file) {
      if (info && !info.isFile()) throw new Error('Expected a regular file at: ' + current)
      return info
    }
  }
}

function printPatch(localFile, sourceFile) {
  // The copy is the old side, the installed package is the new side. Git only reads both paths.
  const result = spawnSync(
    'git',
    [
      '--no-pager',
      'diff',
      '--no-index',
      '--no-color',
      '--no-ext-diff',
      '--no-textconv',
      '--',
      localFile,
      sourceFile,
    ],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  )
  if (result.error?.code === 'ENOENT')
    throw new Error('Install Git to use --patch, or run alpina diff without --patch.')
  if (result.error) throw result.error
  // Git reports exit code 1 for a successful comparison with differences.
  if (result.status !== 0 && result.status !== 1)
    throw new Error('Git comparison failed: ' + localFile)
}

async function run([command, ...args]) {
  if (!command || command === '--help' || command === '-h') return console.log(usage)
  if (command === '--version') return console.log(registry.version)
  if (command === 'mcp' && !args.length) {
    const { serveCatalog } = await import('./mcp.mjs')
    return serveCatalog(root, registry)
  }
  const entries = [...registry.items, ...await blockEntries()]
  if (command === 'list' && !args.length) {
    for (const group of new Set(entries.map((item) => item.group))) {
      console.log(
        group +
          '\n  ' +
          entries
            .filter((i) => i.group === group)
            .map((i) => i.name)
            .join(', '),
      )
    }
    return
  }
  if (!['init', 'add', 'diff'].includes(command)) throw new Error(usage)
  let dir = 'components/alpina'
  let dry = false
  let all = false
  let patch = false
  const names = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run' && command !== 'diff') dry = true
    else if (arg === '--patch' && command === 'diff') patch = true
    else if (arg === '--all') all = true
    else if (arg === '--dir' && args[i + 1] && !args[i + 1].startsWith('-')) dir = args[++i]
    else if (arg.startsWith('-')) throw new Error('Unknown option: ' + arg)
    else names.push(arg)
  }
  if (command === 'init' && (names.length || all)) throw new Error(usage)
  if (command === 'add' && !names.length && !all) throw new Error(usage)
  if (command === 'diff' && all && names.length) throw new Error(usage)
  for (const name of names)
    if (!entries.some((item) => item.name === name))
      throw new Error('Unknown component or block: ' + name)
  const cwd = process.cwd()
  const target = path.resolve(cwd, dir)
  const relative = path.relative(cwd, target)
  if (
    !relative ||
    relative === '..' ||
    relative.startsWith('..' + path.sep) ||
    path.isAbsolute(relative)
  ) {
    throw new Error('Choose a project subdirectory for --dir.')
  }
  const detect = command === 'diff' && !all && !names.length
  const files = new Set()
  if (command === 'init' || (detect && await checkPath(cwd, path.join(target, 'theme.css'))))
    files.add('theme.css')
  for (const item of entries) {
    if (
      (all && item.group !== 'blocks') ||
      names.includes(item.name) ||
      (detect && (await checkPath(cwd, path.join(target, item.entry))))
    ) {
      for (const file of item.files) files.add(file)
    }
  }
  if (detect && !files.size) {
    console.log(
      'No Alpina source files found in ' + relative + '. Specify a component or block name to compare its files.',
    )
    return
  }
  files.add(licenseFile)
  const counts = { aligned: 0, modified: 0, missing: 0 }
  if (command === 'diff') console.log('Comparing with Alpina UI ' + registry.version)
  const additions = []
  for (const file of files) {
    const dest = path.join(target, file)
    const exists = await checkPath(cwd, dest)
    const sourceDirectory = file.startsWith('blocks/') ? root : path.join(root, 'src')
    const source = file === licenseFile ? path.join(root, 'LICENSE') : path.join(sourceDirectory, file)
    const content = await readFile(source)
    const same = exists && (await readFile(dest)).equals(content)
    const displayPath = path.relative(cwd, dest)
    if (command === 'diff') {
      const state = !exists ? 'missing' : same ? 'aligned' : 'modified'
      counts[state]++
      console.log(state.padEnd(11) + displayPath)
      if (patch && state === 'modified') printPatch(dest, source)
    } else if (exists) {
      console.log((same ? 'present  ' : 'keep  ') + displayPath)
    } else additions.push({ dest, content })
  }
  if (command === 'diff') {
    console.log(
      `Files aligned ${counts.aligned} · modified ${counts.modified} · missing ${counts.missing}`,
    )
    return
  }
  if (command === 'add' && (all || names.includes('qr-bill-scanner'))) {
    console.log('For the copied scanner source, install jsqr@1.4.0 and pdfjs-dist@6.5.438 in your project.')
  }
  if (dry) {
    for (const { dest } of additions) console.log('planned  ' + path.relative(cwd, dest))
    return
  }
  const written = []
  try {
    for (const { dest, content } of additions) {
      await mkdir(path.dirname(dest), { recursive: true })
      await writeFile(dest, content, { flag: 'wx' })
      written.push(dest)
      console.log('added  ' + path.relative(cwd, dest))
    }
  } catch (error) {
    for (const dest of written.reverse()) await unlink(dest).catch(() => {})
    throw error
  }
}

run(process.argv.slice(2)).catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
