import { Badge, Bubble, DescriptionList, Kbd, Stack, Typography } from 'alpina-ui'

const locales = {
  'de-CH': 'German',
  'fr-CH': 'French',
  'it-CH': 'Italian',
  'rm-CH': 'Romansh',
} as const

export interface Guidance {
  use: string
  avoid: string
  access: string
  content: string
  example: { good: string; poor: string }
  copy: Record<keyof typeof locales, string>
}

// Use the actual typographic treatment where the specimen needs no interactive behaviour.
function CopySpecimen({ slug, value }: { slug: string; value: string }) {
  if (slug === 'badge') return <Badge>{value}</Badge>
  if (slug === 'bubble') return <Bubble>{value}</Bubble>
  if (slug === 'kbd' && value.includes(' · ')) {
    const [action, keys] = value.split(' · ')
    return <>{action} · <Kbd>{keys}</Kbd></>
  }
  if (slug === 'label') return <Typography as="span" variant="label">{value}</Typography>
  return <>{value}</>
}

export function ComponentGuidance({ slug, entry }: { slug: string; entry: Guidance }) {
  const sections = [
    ['When to use', entry.use],
    ['When to avoid', entry.avoid],
    ['Accessibility', entry.access],
    ['Content', entry.content],
  ] as const

  return <Stack gap={6} data-component-guidance={slug}>
    {sections.map(([title, detail]) => <Stack gap={1} key={title}>
      <Typography as="h2" variant="heading">{title}</Typography>
      <Typography measure="reading">{detail}</Typography>
      {title === 'Content' && <Stack gap={4}>
        <DescriptionList aria-label="Editorial comparison" items={[
          { term: 'Use', detail: <CopySpecimen slug={slug} value={entry.example.good} /> },
          { term: 'Avoid', detail: <CopySpecimen slug={slug} value={entry.example.poor} /> },
        ]} />
        <Stack gap={1}>
          <Typography as="h3" variant="label">Copy in four languages</Typography>
          <DescriptionList aria-label="Localised copy and length" items={Object.entries(entry.copy).map(([tag, value]) => ({
            term: locales[tag as keyof typeof locales],
            detail: <Stack direction="row" gap={2} align="baseline">
              <span lang={tag}>{value}</span>
              <Typography as="span" numeric variant="caption">{Array.from(value.normalize('NFC')).length} characters</Typography>
            </Stack>,
          }))} />
        </Stack>
      </Stack>}
    </Stack>)}
  </Stack>
}
