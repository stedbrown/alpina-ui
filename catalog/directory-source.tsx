import { useId, useState } from 'react'
import { CodeBlock, Field, Select, Stack, TextLink, Typography } from 'alpina-ui'

export interface DirectoryFile {
  path: string
  content: string
}
export function DirectorySource({ files }: { files: readonly DirectoryFile[] }) {
  const headingId = useId()
  const [selected, setSelected] = useState('src/app.tsx')
  const file = files.find((entry) => entry.path === selected) ?? files[0]
  return (
    <section aria-labelledby={headingId}>
      <Stack gap={4}>
        <TextLink href="#rubrica-bilingue">Apri la rubrica IT / DE</TextLink>
        <Typography as="h2" variant="heading" id={headingId}>
          Sorgenti della rubrica
        </Typography>
        <Typography>
          Per compilare il progetto, salva il <TextLink href="#guide/start">pacchetto Alpina</TextLink>{' '}
          nella cartella <code>vendor/</code> della rubrica.
        </Typography>
        <Field label="File del progetto">
          {(control) => (
            <Select {...control} value={file.path} onChange={(event) => setSelected(event.target.value)}>
              {files.map((entry) => (
                <option key={entry.path} value={entry.path}>
                  {entry.path}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <CodeBlock label={file.path} code={file.content} />
      </Stack>
    </section>
  )
}
