import { Typography, Button, Input, Label, Stack } from 'alpina-ui'
import { useId, useState } from 'react'

export function StackExample() {
  const id = useId()
  const [query, setQuery] = useState('')
  const names = ['Atelier Seefeld', 'Studio Limmat', 'Bottega al Ponte']
  const count = names.filter((name) =>
    name.toLocaleLowerCase('en').includes(query.trim().toLocaleLowerCase('en')),
  ).length
  return (
    <Stack gap={3}>
      <Label htmlFor={id}>Find a contact</Label>
      <Input id={id} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <Stack direction="row" gap={2} justify="space-between">
        <Button variant="outline" disabled={!query} onClick={() => setQuery('')}>
          Clear search
        </Button>
        <Typography as="output">{count} {count === 1 ? 'contact' : 'contacts'}</Typography>
      </Stack>
    </Stack>
  )
}
