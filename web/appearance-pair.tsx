import { Badge, Grid, GridItem, Separator, Stack, Typography } from 'alpina-ui'

export function AppearancePair() {
  return <Grid aria-label="Reading-room proofs" id="appearance-proof">
    {(['paper', 'ink'] as const).map(surface => <GridItem key={surface} small={2} medium={4} large={6}>
      <Stack surface={surface} inset={2} gap={4} data-appearance-sheet="">
        <Separator weight="section" />
        <Stack direction="row" justify="space-between" gap={2}>
          <Typography variant="label" data-proof-name="">{surface === 'paper' ? 'Paper' : 'Ink'}</Typography>
          <Badge>Open</Badge>
        </Stack>
        <Typography as="h3" variant="display" responsive>Desk A</Typography>
        <Separator />
        <Stack gap={0}>
          <Typography variant="caption">Reading room</Typography>
          <Typography variant="label">Level two</Typography>
        </Stack>
      </Stack>
    </GridItem>)}
  </Grid>
}
