import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const packageOrigin = new URL(pkg.homepage).origin

export function resolveSiteUrl(value) {
  const parsed = new URL(value)
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password ||
      parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw Error('SITE_URL must be an HTTP(S) origin without credentials, path, query or fragment.')
  }
  return parsed.origin
}

export const siteUrl = resolveSiteUrl(process.env.SITE_URL || packageOrigin)
export const siteMetadata = {
  name: 'Alpina UI',
  title: 'Alpina UI — Swiss design for React',
  description: 'Build React interfaces with the International Typographic Style. Try the responsive grid, live type scale and accessible components, then install the open-source library.',
  language: 'en',
  imagePath: '/assets/alpina-preview.png',
  imageAlt: 'The Alpina peak above “Swiss design for React.” in white on a red twelve-column grid. Four figures describe the library.',
  repository: pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
}

// Markdown in the repository links to the published package homepage for readers on GitHub.
export function deploymentLinks(markdown) {
  return markdown.replaceAll(packageOrigin + '/', siteUrl + '/')
}
