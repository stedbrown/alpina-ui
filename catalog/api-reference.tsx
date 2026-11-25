import { useId } from 'react'
import {
  CodeBlock, DescriptionList, InlineCode, Stack,
  Collapsible,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from 'alpina-ui'

export interface ApiEntry {
  name: string
  generic?: string
  props: {
    name: string
    type: string
    required: boolean
    defaultValue?: string
    description?: string
  }[]
  native: string[]
  ref?: string
  types: { name: string; definition: string }[]
}

function ComponentContract({ entry }: { entry: ApiEntry }) {
  return (
    <Stack gap={4}>
      {entry.props.length > 0 && (
        <Table layout="fixed" aria-label={'Props for ' + entry.name}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Prop</TableHead>
              <TableHead scope="col">TypeScript type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.props.map((prop) => (
              <TableRow key={prop.name}>
                <TableHead scope="row">
                  <InlineCode>{prop.name}</InlineCode>
                  <Typography variant="caption">{prop.required ? 'Required' : 'Optional'}</Typography>
                </TableHead>
                <TableCell>
                  <InlineCode>{prop.type}</InlineCode>
                  {prop.defaultValue !== undefined && (
                    <Typography variant="caption">
                      Default <InlineCode>{prop.defaultValue}</InlineCode>
                    </Typography>
                  )}
                  {prop.description && <Typography>{prop.description}</Typography>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {(entry.native.length > 0 || entry.ref) && (
        <DescriptionList items={[
          ...(entry.native.length ? [{ term: 'Inherited HTML attributes', detail: <InlineCode>{entry.native.join(', ')}</InlineCode> }] : []),
          ...(entry.ref ? [{ term: 'React ref type', detail: <InlineCode>{entry.ref}</InlineCode> }] : []),
        ]} />
      )}
      {entry.types.length > 0 && (
        <Stack gap={3}>
          <Typography as="h4" variant="heading">Types used by {entry.name}</Typography>
          {entry.types.map(type => <CodeBlock key={type.name} label={type.name} code={type.definition} />)}
        </Stack>
      )}
    </Stack>
  )
}

export function ApiReference({ entries }: { entries: readonly ApiEntry[] }) {
  const titleId = useId()
  const [primary, ...parts] = entries
  return (
    <Stack gap={4} role="region" aria-labelledby={titleId}>
      <Typography as="h2" variant="heading" id={titleId}>
        API reference
      </Typography>
      <CodeBlock
        label="Import"
        code={'import { ' + entries.map((entry) => entry.name).join(', ') + " } from 'alpina-ui'"}
      />
      <Typography as="h3" variant="heading">
        {primary.name}
        {primary.generic && '<' + primary.generic + '>'}
      </Typography>
      <ComponentContract entry={primary} />
      {parts.map((entry) => (
        <Collapsible key={entry.name} summary={entry.name}>
          <ComponentContract entry={entry} />
        </Collapsible>
      ))}
    </Stack>
  )
}
