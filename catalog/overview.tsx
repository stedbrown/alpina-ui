import { useState } from 'react'
import { componentHref, guideHref } from './paths.js'
import {
  Button,
  TextLink,
  CantonCombobox,
  cantons,
  CurrencyCHF,
  DataTable,
  localeNames,
  Sheet,
  SwissAddressForm,
  SwissDate,
  swissAddressLabels,
  type CantonCode,
  type SwissAddress,
  type SwissLocale,
} from 'alpina-ui'

const initialContacts: { id: string; address: SwissAddress; amount: number; date: string }[] = [
  {
    id: 'BA',
    address: {
      recipient: 'Bureau Arve',
      street: 'Rue des Ateliers 8',
      postalCode: '1201',
      locality: 'Genève',
      canton: 'GE',
    },
    amount: 1280.5,
    date: '2026-11-24',
  },
  {
    id: 'FT',
    address: {
      recipient: 'Forma Ticino',
      street: 'Via delle Officine 12',
      postalCode: '6500',
      locality: 'Bellinzona',
      canton: 'TI',
    },
    amount: 420,
    date: '2026-11-18',
  },
  {
    id: 'KN',
    address: {
      recipient: 'Kollektiv Nord',
      street: 'Werkstrasse 4',
      postalCode: '8004',
      locality: 'Zürich',
      canton: 'ZH',
    },
    amount: 96.5,
    date: '2026-11-21',
  },
  {
    id: 'SR',
    address: {
      recipient: 'Studio Rain',
      street: 'Via da la Staziun 6',
      postalCode: '7503',
      locality: 'Samedan',
      canton: 'GR',
    },
    amount: 875,
    date: '2026-11-09',
  },
]
const locales: SwissLocale[] = ['it-CH', 'de-CH', 'fr-CH', 'rm-CH']
const country: Record<SwissLocale, string> = {
  'it-CH': 'Svizzera',
  'de-CH': 'Schweiz',
  'fr-CH': 'Suisse',
  'rm-CH': 'Svizra',
}

export function Overview({ hosted = false }: { hosted?: boolean }) {
  const [contacts, setContacts] = useState(initialContacts)
  const [current, setCurrent] = useState('BA')
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [filter, setFilter] = useState<CantonCode | ''>('')
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const visible = contacts.filter((c) => !filter || c.address.canton === filter)
  const active = visible.find((c) => c.id === current) ?? visible[0]
  const labels = swissAddressLabels[locale]
  function save(address: SwissAddress) {
    if (!active) return
    setContacts((items) => items.map((c) => (c.id === active.id ? { ...c, address } : c)))
    if (filter && address.canton !== filter) setFilter('')
    setCurrent(active.id)
    setOpen(false)
    setNotice('Address updated.')
  }
  return (
    <>
      <section className="intro">
        <div>
          <h1>Client address book</h1>
          <p>
            Filter clients by canton, edit an address, or sort order totals. Any changes last for
            this session.
          </p>
        </div>
        <TextLink className="guide-cta" href={guideHref('start', hosted)}>
          Quick start <span aria-hidden="true">↗</span>
        </TextLink>
      </section>
      <section className="studio" aria-labelledby="studio-title">
        <div className="studio-top">
          <div>
            <h2 id="studio-title">Contacts</h2>
          </div>
          <div className="languages" role="group" aria-label="Data language">
            {locales.map((lang) => (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                lang={lang}
                aria-pressed={locale === lang}
                key={lang}
                onClick={() => setLocale(lang)}
              >
                {localeNames[lang]}
              </Button>
            ))}
          </div>
        </div>
        <div className="contacts-workspace">
          <div className="contact-list">
            <CantonCombobox
              id="client-canton-filter"
              locale={locale}
              value={filter}
              onCantonChange={(c) => {
                setFilter(c)
                setNotice('')
              }}
            />
            <ul aria-label="Clients">
              {visible.map((c) => (
                <li key={c.id}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    aria-pressed={active?.id === c.id}
                    onClick={() => {
                      setCurrent(c.id)
                      setNotice('')
                    }}
                  >
                    <span className="initials" aria-hidden="true">
                      {c.id}
                    </span>
                    <span className="contact-name">
                      <strong>{c.address.recipient}</strong>
                      <small>
                        {c.address.locality} · {c.address.canton}
                      </small>
                    </span>
                    <span className="contact-arrow" aria-hidden="true">
                      ›
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
            {!visible.length && (
              <div className="empty-list">
                <p>No clients in this canton.</p>
                <Button size="sm" variant="outline" onClick={() => setFilter('')}>
                  Clear filter
                </Button>
              </div>
            )}
          </div>
          <div className="contact-details">
            {active ? (
              <>
                <div className="address-card">
                  <div className="postal-data" lang={locale}>
                    <div className="postal-label">
                      <span>{labels.recipient}</span>
                      <span>CH</span>
                    </div>
                    <address>
                      <strong>{active.address.recipient}</strong>
                      <span>{active.address.street}</span>
                      <span>
                        {active.address.postalCode} {active.address.locality}
                      </span>
                    </address>
                    <div className="postal-place">
                      {cantons.find((c) => c.code === active.address.canton)?.names[locale]}
                      <span> / </span>
                      {country[locale]}
                    </div>
                  </div>
                </div>
                <div className="editor-actions">
                  <Button
                    size="sm"
                    onClick={() => {
                      setNotice('')
                      setOpen(true)
                    }}
                  >
                    Edit address
                  </Button>
                  <TextLink href={componentHref('swiss-address-form', hosted)}>
                    Component <span aria-hidden="true">↗</span>
                  </TextLink>
                </div>
                <Sheet
                  open={open}
                  onOpenChange={setOpen}
                  title={active.address.recipient}
                  closeLabel="Close"
                  className="address-drawer"
                >
                  {open && (
                    <SwissAddressForm
                      key={active.id}
                      locale={locale}
                      initialValue={active.address}
                      onSave={save}
                    />
                  )}
                </Sheet>
              </>
            ) : (
              <span className="empty-detail">Select a client to see their address.</span>
            )}
          </div>
        </div>
        <span className="sr-only" role="status">
          {notice}
        </span>
      </section>
      <section className="orders-section" aria-label="Client orders">
        <div className="section-lead">
          <h2>Order register</h2>
          <TextLink href={componentHref('data-table', hosted)}>
            Sortable table <span aria-hidden="true">↗</span>
          </TextLink>
        </div>
        <DataTable
          rows={visible}
          rowKey={(row) => row.id}
          caption="Orders for clients in the address book"
          empty="No orders for this canton."
          columns={[
            {
              id: 'client',
              header: 'Client',
              cell: (r) => r.address.recipient,
              compare: (a, b) => a.address.recipient.localeCompare(b.address.recipient, locale),
            },
            {
              id: 'date',
              header: 'Date',
              cell: (r) => <SwissDate value={r.date} locale={locale} />,
              compare: (a, b) => a.date.localeCompare(b.date),
            },
            {
              id: 'total',
              header: 'Total',
              align: 'end',
              cell: (r) => <CurrencyCHF amount={r.amount} locale={locale} />,
              compare: (a, b) => a.amount - b.amount,
            },
          ]}
        />
      </section>
    </>
  )
}
