import { useState } from 'react'
import { Grid, GridItem, Typography, Switch } from 'alpina-ui'

export function GridExample() {
  const [guides, setGuides] = useState(true)
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBlockEnd: 16 }}>
        <Switch checked={guides} onChange={(e) => setGuides(e.target.checked)} /> Mostra griglia
      </label>
      <Grid guides={guides}>
        <GridItem small={4} medium={2} large={3}>
          <Typography variant="label">09.30</Typography>
        </GridItem>
        <GridItem small={4} medium={6} large={9}>
          <Typography as="h3" variant="heading">
            Leggere un manifesto
          </Typography>
          <Typography>Laboratorio di composizione tipografica</Typography>
        </GridItem>
      </Grid>
    </div>
  )
}
export function TypographyExample() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Typography as="p" variant="caption">
        Didascalia · 12/16
      </Typography>
      <Typography variant="label">Etichetta · 14/20</Typography>
      <Typography>Testo corrente · 16/24</Typography>
      <Typography as="h3" variant="heading">
        Titolo · 24/28
      </Typography>
      <Typography as="p" variant="display">
        Alpina · 48/48
      </Typography>
    </div>
  )
}