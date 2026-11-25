import { Figure, Grid, GridItem, Separator, Stack, TextLink, Typography } from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'

export function DesignerKit() {
  return <>
    <Masthead current="kit" />
    <main id="content" tabIndex={-1}>
      <PageHeading title="Designer kit" summary="Take the same columns, type sizes and inks from the component library into your layout file." />
      <Grid as="section" width="site" space="compact" align="start" aria-labelledby="sheet-title">
        <GridItem><Separator weight="section" /></GridItem>
        <GridItem medium={4} large={5}><Stack gap={4} align="start">
          <Typography as="h2" variant="display" id="sheet-title">Grid and type</Typography>
          <Typography measure="reading">Open the SVG in Figma or Sketch to edit the individual columns and text. Install Inter for matching letterforms. Place the vector PDF in InDesign or print it at 100% on A4.</Typography>
          <Stack direction="row" gap={4}>
            <TextLink variant="action" download href="/kit/alpina-grid.svg">Download SVG</TextLink>
            <TextLink download href="/kit/alpina-grid.pdf">Download PDF</TextLink>
          </Stack>
          <TextLink href="https://rsms.me/inter/">Get Inter</TextLink>
          <Separator />
          <Typography as="h3" variant="heading">Screen templates</Typography>
          <Typography measure="reading">Place a template at its native width. When resizing a layout, keep the margin and gutter fixed within the active breakpoint and let the columns absorb the difference.</Typography>
          <Stack align="start" gap={2}>
            <TextLink download href="/kit/grid-4.svg">4 columns · 390 px</TextLink>
            <TextLink download href="/kit/grid-8.svg">8 columns · 768 px</TextLink>
            <TextLink download href="/kit/grid-12.svg">12 columns · 1440 px</TextLink>
          </Stack>
        </Stack></GridItem>
        <GridItem medium={4} large={5} start={{ large: 8 }}><Figure image={{ src:'/kit/alpina-grid.svg', alt:'A4 specimen of the four-, eight- and twelve-column layouts and six type sizes.', width:794, height:1123 }} /></GridItem>
      </Grid>
      <Grid as="section" width="site" space="section" align="start" aria-labelledby="tokens-title">
        <GridItem><Separator /></GridItem>
        <GridItem medium={4} large={5}><Stack gap={3}>
          <Typography as="h2" variant="display" id="tokens-title">Design tokens</Typography>
          <Typography measure="reading">Choose the appearance you are designing for. Each export includes the palette, spacing, type scale, grid dimensions, corner radius, shadows and motion.</Typography>
        </Stack></GridItem>
        <GridItem medium={4} large={5} start={{ large: 8 }}><Stack gap={6}>
          <Stack gap={2}>
            <Typography as="h3" variant="heading">Design Tokens Community Group</Typography>
            <Typography>Import the typed JSON into a tool that reads the 2025.10 format. Dimensions use CSS pixels at a 16 px root size.</Typography>
            <Stack direction="row" gap={4}><TextLink download href="/kit/alpina-light.tokens.json">Light tokens</TextLink><TextLink download href="/kit/alpina-dark.tokens.json">Dark tokens</TextLink></Stack>
            <TextLink href="https://www.designtokens.org/tr/2025.10/format/">Format specification</TextLink>
          </Stack>
          <Stack gap={2}>
            <Typography as="h3" variant="heading">Style Dictionary</Typography>
            <Typography>Each configuration includes its token source. Run <code>style-dictionary build --config alpina-light.style-dictionary.json</code> to write CSS variables to the build directory. Use the dark filename for dark mode.</Typography>
            <Stack direction="row" gap={4}><TextLink download href="/kit/alpina-light.style-dictionary.json">Light configuration</TextLink><TextLink download href="/kit/alpina-dark.style-dictionary.json">Dark configuration</TextLink></Stack>
            <TextLink href="https://styledictionary.com/info/tokens/">Style Dictionary token format</TextLink>
          </Stack>
        </Stack></GridItem>
      </Grid>
    </main>
    <Footer />
  </>
}
