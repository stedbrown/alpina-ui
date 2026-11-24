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
        <Table aria-label={'Proprietà di ' + entry.name}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Proprietà</TableHead>
              <TableHead scope="col">Tipo TypeScript</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.props.map((prop) => (
              <TableRow key={prop.name}>
                <TableHead scope="row">
                  <code>{prop.name}</code>
                  <small>{prop.required ? 'Obbligatoria' : 'Facoltativa'}</small>
                </TableHead>
                <TableCell>
                  <code>{prop.type}</code>
                  {prop.defaultValue !== undefined && (
                    <small>
                      Predefinito <code>{prop.defaultValue}</code>
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
              <dt>Attributi HTML ereditati</dt>
              <dd>
                <code>{type}</code>
              </dd>
            </div>
          ))}
          {entry.ref && (
            <div>
              <dt>Tipo del riferimento React</dt>
              <dd>
                <code>{entry.ref}</code>
              </dd>
            </div>
          )}
        </dl>
      )}
      {entry.types.length > 0 && (
        <Collapsible summary={'Tipi usati da ' + entry.name}>
          <CodeBlock
            label="Definizioni TypeScript"
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
        Riferimento API
      </Typography>
      <CodeBlock
        label="Importazione"
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
