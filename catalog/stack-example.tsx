import { Button, Input, Label, Stack } from 'alpina-ui'
import { useId, useState } from 'react'

export function StackExample() {
  const id = useId()
  const [query, setQuery] = useState('')
  const names = ['Atelier Seefeld', 'Studio Limmat', 'Bottega al Ponte']
  return (
    <Stack gap={3}>
      <Label htmlFor={id}>Cerca un contatto</Label>
      <Input id={id} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <Stack direction="row" gap={2} justify="space-between">
        <Button variant="outline" disabled={!query} onClick={() => setQuery('')}>
          Azzera ricerca
        </Button>
        <output>
          {
            names.filter((name) =>
              name.toLocaleLowerCase('it').includes(query.trim().toLocaleLowerCase('it')),
            ).length
          }{' '}
          contatti
        </output>
      </Stack>
    </Stack>
  )
}
