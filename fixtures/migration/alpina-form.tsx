"use client"
import { useState } from "react"
import { Button, Field, Input, Stack, Typography } from "alpina-ui"
import "alpina-ui/styles.css"

export function EditionLabel() {
  const [proof, setProof] = useState("Studio proofs")
  return <Stack asChild gap={4}>
    <form onSubmit={event => {
      event.preventDefault()
      setProof(String(new FormData(event.currentTarget).get("edition")).trim() || "Untitled")
    }}>
      <Field label="Edition name">{field =>
        <Input {...field} name="edition" defaultValue="Studio proofs" />}</Field>
      <Stack align="start"><Button type="submit">Set label</Button></Stack>
      <Typography as="output" aria-live="polite">Label: {proof}</Typography>
    </form>
  </Stack>
}
