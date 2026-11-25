import { useEffect } from 'react'
import { Icon, Stack, TextLink } from 'alpina-ui'
import { AtelierDirectory } from 'alpina:atelier'

export function DirectoryLive({ standalone = false }: { standalone?: boolean }) {
  useEffect(() => {
    window.scrollTo(0, 0)
    return () => { document.documentElement.lang = 'en' }
  }, [])
  return <>
    {!standalone && <Stack role="navigation" lang="en" aria-label="Alpina UI" align="start" inset={4}>
      <TextLink href="#guide/directory"><Icon name="arrow-left" /> Alpina UI</TextLink>
    </Stack>}
    <AtelierDirectory />
  </>
}
