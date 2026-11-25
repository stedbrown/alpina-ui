"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function EditionLabel() {
  const [proof, setProof] = useState("Studio proofs")
  return <form className="grid gap-4" onSubmit={event => {
    event.preventDefault()
    setProof(String(new FormData(event.currentTarget).get("edition")).trim() || "Untitled")
  }}>
    <label className="grid gap-2 text-sm font-medium">
      Edition name
      <Input name="edition" defaultValue="Studio proofs" />
    </label>
    <Button type="submit" className="justify-self-start">Set label</Button>
    <output className="text-sm" aria-live="polite">Label: {proof}</output>
  </form>
}
