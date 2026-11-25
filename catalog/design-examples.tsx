import { useState } from 'react'
import { Label, Card, Field, Grid, GridItem, GridOverlay, Select, Typography, Switch, Stack } from 'alpina-ui'

export function GridExample() {
  const [guides, setGuides] = useState(true)
  const [fields, setFields] = useState<'thirds' | 'five-seven' | 'programme'>('thirds')
  return (
    <Stack>
      <Stack direction="row" align="end">
        <Field label="Field arrangement">
          {props => <Select {...props} value={fields} onChange={e => {
            const value = e.target.value
            if (value === 'thirds' || value === 'five-seven' || value === 'programme') setFields(value)
          }}>
            <option value="thirds">One third / two thirds</option>
            <option value="five-seven">Five twelfths / seven twelfths</option>
            <option value="programme">Named programme fields</option>
          </Select>}
        </Field>
        <Label><Switch checked={guides} onChange={e => setGuides(e.target.checked)} /> Show grid</Label>
      </Stack>
      {fields === 'programme' ? (
        <Grid fields={['date title title', 'date venue .']} guides={guides}>
          <GridItem field="date"><Typography numeric>12.03</Typography></GridItem>
          <GridItem field="title"><Typography as="h3" variant="heading">Press day</Typography></GridItem>
          <GridItem field="venue"><Typography>Basel</Typography></GridItem>
        </Grid>
      ) : <Grid fields={fields} rows={3} guides={guides}>
        <GridItem field="lead" subgrid="rows" asChild>
          <Card as="article">
            <Typography variant="label">Morning session</Typography>
            <Typography as="h3" variant="heading">Reading a poster</Typography>
            <Typography numeric>09.30–10.15</Typography>
          </Card>
        </GridItem>
        <GridItem field="detail" subgrid="rows" asChild>
          <Card as="article">
            <Typography variant="label">Afternoon session</Typography>
            <Typography as="h3" variant="heading">From letterpress to the concert programme</Typography>
            <Typography numeric>14.00–15.30</Typography>
          </Card>
        </GridItem>
      </Grid>}
    </Stack>
  )
}
export function GridOverlayExample() {
  const [visible, setVisible] = useState(true)
  return (
    <Stack>
      <Label><Switch checked={visible} onChange={e => setVisible(e.target.checked)} /> Show overlay</Label>
      <Grid space="section">
        <GridItem><Typography variant="heading">Proof sheet</Typography></GridItem>
        <GridItem><Typography>Inspect the columns, margins and baseline together.</Typography></GridItem>
        <GridOverlay placement="container" width="full" hidden={!visible} />
      </Grid>
    </Stack>
  )
}

export function TypographyExample() {
  return (
    <Stack gap={4}>
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
    </Stack>
  )
}
