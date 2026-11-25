import { useEffect, useState } from 'react'
import { TextLink, Typography } from 'alpina-ui'
import { componentGuidance } from 'alpina:content'
import { ComponentGuidance, type Guidance } from '../web/component-guidance.js'

function initialEntry(slug: string): Guidance | undefined {
  if (componentGuidance[slug]) return componentGuidance[slug]
  if (typeof document === 'undefined') return undefined
  const json = document.getElementById('component-guidance-data')?.textContent
  if (!json) return undefined
  const inline: { slug: string; entry: Guidance } = JSON.parse(json)
  return inline.slug === slug ? inline.entry : undefined
}

// Canonical pages carry their own record. Bookmarks on /docs/#slug can change component in place.
export function ReferenceGuidance({ slug }: { slug: string }) {
  const [entry, setEntry] = useState(() => initialEntry(slug))
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (entry) return
    const request = new AbortController()
    async function load() {
      try {
        const response = await fetch('/reference/components/' + slug + '.json', { signal: request.signal })
        if (!response.ok) throw new Error(String(response.status))
        const data: Guidance = await response.json()
        if (!request.signal.aborted) setEntry(data)
      } catch {
        if (!request.signal.aborted) setFailed(true)
      }
    }
    void load()
    return () => request.abort()
  }, [entry, slug])

  if (entry) return <ComponentGuidance slug={slug} entry={entry} />
  if (failed) return <TextLink href={'/docs/components/' + slug + '/'}>Open the full component reference</TextLink>
  return <Typography role="status">Loading component guidance…</Typography>
}
