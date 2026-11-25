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
  title: 'Alpina UI — Swiss React components for forms and payments',
  description: 'Build multilingual Swiss forms, format CHF amounts and print QR bills with open-source React components. Explore working examples on a Swiss typographic grid.',
  language: 'en',
  imagePath: '/assets/alpina-preview.png',
  imageAlt: 'Alpina UI mountain A mark beside the words “Swiss UI for React.”',
  repository: pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
}

// Markdown in the repository links to the published package homepage for readers on GitHub.
export function deploymentLinks(markdown) {
  return markdown.replaceAll(packageOrigin + '/', siteUrl + '/')
}
