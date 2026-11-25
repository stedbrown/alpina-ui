import { build } from 'esbuild'

export async function loadInventory() {
  const { outputFiles } = await build({
    entryPoints: ['catalog/inventory.ts'], bundle: true, platform: 'node', format: 'esm', write: false,
  })
  const { inventory } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].contents).toString('base64'))
  return inventory
}
