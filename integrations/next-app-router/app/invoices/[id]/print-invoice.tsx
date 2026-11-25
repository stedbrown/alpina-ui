'use client'

import { Button } from 'alpina-ui'

export function PrintInvoice() {
  return <Button onClick={() => window.print()}>Print invoice</Button>
}
