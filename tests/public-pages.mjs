import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const site = new URL('../site/', import.meta.url)
export const siteOrigin = 'https://alpina.test'

export async function publicRoutes() {
  const xml = await readFile(new URL('sitemap.xml', site), 'utf8')
  return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, url]) => new URL(url).pathname).concat('/catalog.html'))]
}

export async function openPublicPage(browser, options = {}) {
  const page = await browser.newPage(options)
  await page.route(siteOrigin + '/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    const file = pathname.endsWith('/') ? pathname + 'index.html' : pathname
    await route.fulfill({ path: fileURLToPath(new URL('.' + file, site)) })
  })
  return page
}
