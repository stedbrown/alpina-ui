import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = fileURLToPath(new URL('../recipes/rubrica/', import.meta.url))
const generated = new Set(['node_modules', 'dist', 'vendor', 'coverage', 'test-results'])
const textFile = /\.(?:[cm]?[jt]sx?|css|html|json|md)$/i

export async function readDirectorySources(root = project) {
  async function list(relative) {
    const entries = await readdir(path.join(root, relative), { withFileTypes: true })
    const paths = []
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const name = path.posix.join(relative, entry.name)
      if (entry.isDirectory() && !generated.has(entry.name)) paths.push(...(await list(name)))
      if (entry.isFile() && textFile.test(entry.name)) paths.push(name)
    }
    return paths
  }
  const paths = (await list('')).sort()
  for (const name of [
    'src/app.tsx',
    'src/copy.ts',
    'src/data.ts',
    'scripts/build.mjs',
    'tsconfig.json',
    'package.json',
  ]) {
    if (!paths.includes(name)) throw new Error('Missing address book source file: ' + name)
  }
  const ordered = [
    ...paths.filter((name) => name.startsWith('src/')),
    ...paths.filter((name) => !name.startsWith('src/')),
  ]
  return Promise.all(
    ordered.map(async (name) => ({
      path: name,
      content: await readFile(path.join(root, name), 'utf8'),
    })),
  )
}
