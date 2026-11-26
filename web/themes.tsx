import { PageRegion, Stack } from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'

/** The builder is rendered to `html` with the default theme by the site build, then hydrated by theme-controls. */
export function Themes({ html }: { html: string }) {
  return <>
    <Masthead current="themes" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <PageHeading title="Theme builder" summary="Choose an accent for light and dark, set the grid unit, check the contrast and copy the CSS." />
      <Stack id="theme-builder" dangerouslySetInnerHTML={{ __html: html }} />
    </PageRegion>
    <Footer />
  </>
}
