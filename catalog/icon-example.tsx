import { useState } from 'react'
import { CodeBlock, Field, Icon, iconNames, Input, Stack, ToggleGroup, Typography, type IconName } from 'alpina-ui'

export function IconExample() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<IconName>('git-branch')
  const [size, setSize] = useState(24)
  const term = query.trim().toLowerCase().replace(/\s+/g, '-')
  const matches = iconNames.filter((name) => name.includes(term))
  const active = matches.includes(selected) ? selected : matches[0]

  return (
    <Stack gap={4}>
      <Field label="Find an icon">
        {(control) => (
          <Input {...control} type="search" value={query} placeholder="Search by name"
            onChange={(event) => setQuery(event.target.value)} />
        )}
      </Field>
      <Stack direction="row" justify="space-between">
        <Typography as="span" variant="label" role="status">
          {matches.length} {matches.length === 1 ? 'icon' : 'icons'}
        </Typography>
        <ToggleGroup
          label="Icon size"
          options={[16, 24, 32].map((value) => ({ value: String(value), label: value + ' px' }))}
          value={[String(size)]}
          onValueChange={([value]) => { if (value) setSize(Number(value)) }}
        />
      </Stack>
      {active ? (
        <>
          <CodeBlock
            label={active}
            code={`import { Icon } from 'alpina-ui'\n\n<Icon name="${active}" size={${size}} />`}
          />
          <ToggleGroup
            label="Choose an icon to copy"
            layout="grid"
            options={matches.map((name) => ({
              value: name,
              label: <><Icon name={name} size={size} />{name}</>,
            }))}
            value={[active]}
            onValueChange={([value]) => {
              const next = matches.find((name) => name === value)
              if (next) setSelected(next)
            }}
          />
        </>
      ) : <Typography>Try another icon name.</Typography>}
    </Stack>
  )
}
