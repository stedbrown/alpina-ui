import { build } from 'esbuild'
import { dirname } from 'node:path'
import { readFile, writeFile, copyFile } from 'node:fs/promises'

export const scannerNotices = [
  ['node_modules/pdfjs-dist/LICENSE', 'PDFJS-LICENSE.txt'],
  ['node_modules/jsqr/LICENSE', 'JSQR-LICENSE.txt'],
  ...['LICENSE_JBIG2', 'LICENSE_PDFJS_JBIG2', 'LICENSE_OPENJPEG', 'LICENSE_PDFJS_OPENJPEG']
    .map(name => ['node_modules/pdfjs-dist/wasm/' + name, name + '.txt']),
]

// Upstream marks these URLs to bypass Webpack and Vite. Bind those two imports
// to this copy of PDF.js before minification so Turbopack also sees only local assets.
const localPdfImports = {
  name: 'local-pdf-decoders',
  setup(context) {
    context.onLoad({ filter: /pdfjs-dist[\\/]build[\\/]pdf(?:\.worker)?\.mjs$/ }, async ({ path }) => {
      const source = await readFile(path, 'utf8')
      const worker = path.endsWith('pdf.worker.mjs')
      const expression = /import\(\s*\/\*webpackIgnore: true\*\/\s*\/\*@vite-ignore\*\/\s*(?:this\.workerSrc|.\$\{WasmImage\.#wasmUrl\}\$\{this\._noWasmFilename\}.)\)/
      if (!expression.test(source)) throw new Error('Review PDF.js local decoder imports after upgrading: ' + path)
      const replacement = worker
        ? '(this._noWasmFilename === "jbig2_nowasm_fallback.js" ? import("pdfjs-dist/wasm/jbig2_nowasm_fallback.js") : import("pdfjs-dist/wasm/openjpeg_nowasm_fallback.js"))'
        : 'Promise.resolve(globalThis.pdfjsWorker)'
      return { contents: source.replace(expression, replacement), loader: 'js', resolveDir: dirname(path) }
    })
  },
}

// Distribute browser codecs with the scanner. The package has no runtime PDF.js or jsQR
// installation requirement. Fallback esbuild imports stay pure until a file is actually read.
export async function buildScannerCodecs() {
  const dir = 'dist/swiss/'
  const entries = [['image', 'readQrPixels'], ['pdf', 'readQrPdf']]
  for (const [kind, fn] of entries) {
    const module = 'qr-reader-' + kind + '.internal.js'
    const result = await build({ entryPoints: [dir + module], write: false, bundle: true,
      minify: true, platform: 'browser', format: 'iife', globalName: 'decoder', target: 'es2022',
      loader: { '.wasm': 'binary' }, legalComments: 'inline', logOverride: { 'empty-import-meta': 'silent' },
      // Keep the scoped copy of PDF.js independent of a host application's own viewer.
      plugins: kind === 'pdf' ? [localPdfImports] : [],
      define: { __ALPINA_PDF_FALLBACKS__: 'true', 'globalThis.pdfjsWorker': 'workerExports', 'globalThis.pdfjsLib': 'displayExports' },
    })
    await writeFile(dir + module,
      'let implementation;\nexport function ' + fn + '(...args) {\n' +
      '  if (!implementation) {\n    let workerExports, displayExports;\n' +
      result.outputFiles[0].text + '\n    implementation = decoder.' + fn + ';\n  }\n  return implementation(...args);\n}\n')
  }
  const reader = dir + 'qr-reader.internal.js'
  await writeFile(reader, (await readFile(reader, 'utf8')).replace('./qr-reader-loader.internal.js', '#qr-reader-loader'))
  await writeFile(dir + 'qr-reader-inline.js', [
    "import * as image from './qr-reader-image.internal.js'",
    "import * as pdf from './qr-reader-pdf.internal.js'",
    'export const loadQrImageReader = () => Promise.resolve(image)',
    'export const loadQrPdfReader = () => Promise.resolve(pdf)', '',
  ].join('\n'))
  for (const [source, name] of scannerNotices) await copyFile(source, dir + name)
}
