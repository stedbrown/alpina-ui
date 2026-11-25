import { useId, useState } from 'react'
import { CodeBlock, Field, InlineCode, PageRegion, Select, Stack, TextLink, Typography } from 'alpina-ui'
import { bilingualProject, guideHref } from './paths.js'

export interface DirectoryFile {
  path: string
  content: string
}
export function DirectorySource({ files, hosted }: { files: readonly DirectoryFile[]; hosted: boolean }) {
  const headingId = useId()
  const [selected, setSelected] = useState('src/app.tsx')
  const file = files.find((entry) => entry.path === selected) ?? files[0]
  return (
    <PageRegion as="section" aria-labelledby={headingId}>
      <Stack gap={4}>
        <TextLink href={hosted ? bilingualProject : '#bilingual-address-book'}>Open the IT / DE address book</TextLink>
        <Typography as="h2" variant="heading" id={headingId}>
          Address book source files
        </Typography>
        <Typography>
          To build the project, save the <TextLink href={guideHref('start', hosted)}>Alpina package</TextLink>{' '}
          in the address book’s <InlineCode>vendor/</InlineCode> directory.
        </Typography>
        <Field label="Project file">
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
    </PageRegion>
  )
}
