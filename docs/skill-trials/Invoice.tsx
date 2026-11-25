'use client'

import { useEffect, useRef } from 'react'
import {
  AlpinaProvider, Button, InvoiceDocument, Stack, Typography, createCreditorReference,
  printSwissDocument, type InvoiceDocumentProps,
} from 'alpina-ui'
import 'alpina-ui/styles.css'

const invoiceNumber = 'RIVE-2026-041'
const payment: InvoiceDocumentProps['payment'] = {
  iban: 'CH58 0079 1123 0008 8901 2',
  reference: { type: 'SCOR', value: createCreditorReference(invoiceNumber, { stripSeparators: true }) },
  creditor: {
    name: 'Atelier Rive Claire', street: 'Rue des Ateliers', buildingNumber: '8',
    postalCode: '2000', town: 'Neuchâtel', country: 'CH',
  },
  debtor: {
    name: 'Camille Florin', street: 'Rue des Ormes', buildingNumber: '14',
    postalCode: '2034', town: 'Peseux', country: 'CH',
  },
}
const lines: InvoiceDocumentProps['lines'] = [
  { description: 'Composition graphique de l’affiche', quantity: '2.5', unit: 'h', unitPrice: '96.00', vatRate: 8.1 },
  { description: 'Affiche A2 imprimée sur papier mat', quantity: '1', unit: 'ex.', unitPrice: '32.00', vatRate: 8.1 },
]

export default function Invoice() {
  const article = useRef<HTMLElement>(null)
  useEffect(() => { document.documentElement.lang = 'fr-CH' }, [])

  return (
    <AlpinaProvider locale="fr-CH">
      <main lang="fr-CH" style={{ maxWidth: '52rem', margin: '0 auto' }}>
        <Stack direction="row" align="baseline" justify="space-between" inset={4} data-al-print="hide">
          <Typography as="h1" variant="heading">Facturation de l’atelier</Typography>
          <Button onClick={() => { if (article.current) printSwissDocument(article.current) }}>
            Imprimer la facture
          </Button>
        </Stack>
        <InvoiceDocument ref={article} locale="fr-CH" invoiceNumber={invoiceNumber}
          issueDate="2026-11-25" supplyDate="2026-11-24" dueDate="2026-12-25"
          vatNumber="CHE-109.322.551" lines={lines} payment={payment}
          intro="Création et tirage de votre affiche pour les portes ouvertes de décembre."
          paymentTerms="Merci de régler cette facture à l’aide de la section paiement ci-dessous."
        />
      </main>
    </AlpinaProvider>
  )
}
