import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router'
import { Button } from 'alpina-ui/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'alpina-ui/ui/card'
import { Stack } from 'alpina-ui/ui/stack'
import { CurrencyCHF } from 'alpina-ui/swiss/currency-chf'
import { SwissDate } from 'alpina-ui/swiss/swiss-date'
import { TextLink } from 'alpina-ui/portal/text-link'
import 'alpina-ui/styles.css'

const invoices = [
  { id: 'A-104', customer: 'Atelier Limmat', amount: 1250, due: '2027-05-18' },
  { id: 'A-105', customer: 'Studio Surselva', amount: 483.6, due: '2027-05-26' },
]

function InvoiceRegister() {
  return (
    <Card>
      <CardHeader><CardTitle as="h1">Invoice register</CardTitle></CardHeader>
      <CardContent>
        <ul>
          {invoices.map(invoice => (
            <li key={invoice.id}>
              <TextLink asChild><Link to={'/invoices/' + invoice.id}>{invoice.id} · {invoice.customer}</Link></TextLink>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function InvoiceDetail() {
  const { id } = useParams()
  const invoice = invoices.find(record => record.id === id)
  return (
    <Card>
      <CardHeader><CardTitle as="h1">{invoice ? 'Invoice ' + invoice.id : 'Invoice unavailable'}</CardTitle></CardHeader>
      <CardContent>
        <Stack align="start">
          {invoice && <>
            <p>{invoice.customer}</p>
            <p>Amount due: <CurrencyCHF locale="de-CH" amount={invoice.amount} /></p>
            <p>Due on <SwissDate value={invoice.due} /></p>
          </>}
          <Button asChild variant="outline"><Link to="/">Back to register</Link></Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <main><Stack inset={6}><Routes>
      <Route path="/" element={<InvoiceRegister />} />
      <Route path="/invoices/:id" element={<InvoiceDetail />} />
      <Route path="*" element={<InvoiceDetail />} />
    </Routes></Stack></main>
  </BrowserRouter>,
)
