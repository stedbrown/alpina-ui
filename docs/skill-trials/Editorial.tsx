'use client'

import { useEffect } from 'react'
import { AlpinaProvider, Grid, GridItem, Separator, Stack, Typography } from 'alpina-ui'
import 'alpina-ui/styles.css'

const openingDay = '2027-04-16'
const programme = [
  { at: '17:00', de: 'Eröffnung und Begrüssung', fr: 'Ouverture et mot de bienvenue' },
  { at: '17:30', de: 'Rundgang mit den Architektinnen', fr: 'Visite avec les architectes' },
  { at: '18:30', de: 'Gespräch am Stadtmodell', fr: 'Discussion autour de la maquette de la ville' },
]

export default function Editorial() {
  useEffect(() => { document.documentElement.lang = 'de-CH' }, [])

  return (
    <AlpinaProvider locale="de-CH">
      <main lang="de-CH">
        <Grid as="header" width="site" space="chapter" surface="accent">
          <GridItem>
            <Typography variant="label">
              Architekturausstellung · <span lang="fr-CH">Exposition d’architecture</span>
            </Typography>
          </GridItem>
          <GridItem medium={7} large={9}>
            <Typography as="h1" variant="masthead" tracking="optical">
              Neue Ufer<br /><span lang="fr-CH">Rives neuves</span>
            </Typography>
          </GridItem>
          <GridItem medium={4} large={5}>
            <Typography variant="lead" measure="reading">
              Wie lebt eine Fabrik nach der letzten Schicht weiter? Sechs Entwürfe zeigen,
              wie die Werkhallen am Bieler Seeufer zu Wohnraum und Werkstätten werden könnten.
            </Typography>
          </GridItem>
          <GridItem medium={4} large={5} start={{ large: 7 }}>
            <Typography lang="fr-CH" variant="lead" measure="reading">
              Que devient une usine après la dernière relève ? Six projets imaginent des logements
              et des ateliers dans les anciennes halles industrielles au bord du lac de Bienne.
            </Typography>
          </GridItem>
        </Grid>

        <Grid as="section" width="site" space="section" align="baseline" aria-labelledby="opening">
          <GridItem medium={4} large={5}>
            <Stack gap={2}>
              <Typography as="h2" variant="label" id="opening">
                Eröffnung · <span lang="fr-CH">Vernissage</span>
              </Typography>
              <Typography variant="display" numeric><time dateTime={openingDay}>16.04.2027</time></Typography>
            </Stack>
          </GridItem>
          <GridItem medium={4} large={5} start={{ large: 7 }}>
            <Stack gap={2}>
              <Typography as="h2" variant="label">Ort · <span lang="fr-CH">Lieu</span></Typography>
              <Typography variant="heading">Halle Nord · Biel/Bienne</Typography>
              <Typography as="address" variant="body">Uferweg 12 · <span lang="fr-CH">Chemin de la Rive 12</span><br />2503 Biel/Bienne</Typography>
            </Stack>
          </GridItem>
        </Grid>

        <section aria-labelledby="programme">
          <Grid width="site" space="compact">
            <GridItem>
              <Separator />
              <Typography as="h2" id="programme" variant="display" responsive style={{ marginBlockStart: '1rem' }}>
                Programm · <span lang="fr-CH">Programme</span>
              </Typography>
            </GridItem>
          </Grid>
          <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem' }}>
            {programme.map(item => (
              <li key={item.at}>
                <Grid width="site" space="compact" align="baseline">
                  <GridItem small={4} medium={2} large={2}>
                    <Typography variant="heading" numeric tone="accent"><time dateTime={openingDay + 'T' + item.at}>{item.at}</time></Typography>
                  </GridItem>
                  <GridItem small={4} medium={3} large={4}><Typography variant="body">{item.de}</Typography></GridItem>
                  <GridItem small={4} medium={3} large={5} start={{ large: 7 }}><Typography lang="fr-CH" variant="body">{item.fr}</Typography></GridItem>
                </Grid>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </AlpinaProvider>
  )
}
