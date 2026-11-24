import { useState } from 'react'
import { Grid, GridItem, Typography, Switch } from 'alpina-ui'

export function GridExample() {
  const [guides, setGuides] = useState(true)
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBlockEnd: 16 }}>
        <Switch checked={guides} onChange={(e) => setGuides(e.target.checked)} /> Show grid
      </label>
      <Grid guides={guides}>
        <GridItem small={4} medium={2} large={3}>
          <Typography variant="label">09.30</Typography>
        </GridItem>
        <GridItem small={4} medium={6} large={9}>
          <Typography as="h3" variant="heading">
            Reading a poster
          </Typography>
          <Typography>Typography workshop</Typography>
        </GridItem>
      </Grid>
    </div>
  )
}
export function TypographyExample() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Typography as="p" variant="caption">
        Caption · 12/16
      </Typography>
      <Typography variant="label">Label · 14/20</Typography>
      <Typography>Body text · 16/24</Typography>
      <Typography as="h3" variant="heading">
        Heading · 24/28
      </Typography>
      <Typography as="p" variant="display">
        Alpina · 48/48
      </Typography>
    </div>
  )
}