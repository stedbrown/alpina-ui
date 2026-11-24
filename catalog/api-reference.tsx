import { useId } from 'react'
import {
  CodeBlock,
  Collapsible,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from 'alpina-ui'
import './api-reference.css'

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
    <div className="api-contract">
      {entry.props.length > 0 && (
        <Table aria-label={'Props for ' + entry.name}>
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
                  <code>{prop.name}</code>
                  <small>{prop.required ? 'Required' : 'Optional'}</small>
                </TableHead>
                <TableCell>
                  <code>{prop.type}</code>
                  {prop.defaultValue !== undefined && (
                    <small>
                      Default <code>{prop.defaultValue}</code>
                    </small>
                  )}
                  {prop.description && <p>{prop.description}</p>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {(entry.native.length > 0 || entry.ref) && (
        <dl className="api-native">
          {entry.native.map((type) => (
            <div key={type}>
              <dt>Inherited HTML attributes</dt>
              <dd>
                <code>{type}</code>
              </dd>
            </div>
          ))}
          {entry.ref && (
            <div>
              <dt>React ref type</dt>
              <dd>
                <code>{entry.ref}</code>
              </dd>
            </div>
          )}
        </dl>
      )}
      {entry.types.length > 0 && (
        <Collapsible summary={'Types used by ' + entry.name}>
          <CodeBlock
            label="TypeScript definitions"
            code={entry.types.map((type) => type.definition).join('\n\n')}
          />
        </Collapsible>
      )}
    </div>
  )
}

export function ApiReference({ entries }: { entries: readonly ApiEntry[] }) {
  const titleId = useId()
  const [primary, ...parts] = entries
  return (
    <section className="api-reference" aria-labelledby={titleId}>
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
    </section>
  )
}
