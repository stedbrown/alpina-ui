import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AlertDialog,
  Button,
  Card,
  CardFooter,
  CardTitle,
  DropdownMenu,
  Empty,
  Field,
  Grid,
  GridItem,
  Input,
  Item,
  Select,
  Separator,
  Sheet,
  Stack,
  SwissAddressForm,
  TextLink,
  ToggleGroup,
  Typography,
  cantons,
  type SwissAddress,
} from 'alpina-ui'
import { copy, type Language } from './copy'
import { fold, initialContacts, type Contact } from './data'

type Editor = { kind: 'create' } | { kind: 'edit'; contact: Contact }
type Notice = 'added' | 'updated' | 'deleted'
function LanguageSwitch({
  language,
  onChange,
}: {
  language: Language
  onChange: (value: Language) => void
}) {
  return (
    <ToggleGroup
      label={copy[language].language}
      value={[language]}
      options={[
        {
          value: 'it',
          label: (
            <span lang="it" aria-label="Italiano">
              IT
            </span>
          ),
        },
        {
          value: 'de',
          label: (
            <span lang="de" aria-label="Deutsch">
              DE
            </span>
          ),
        },
      ]}
      onValueChange={(values) => {
        const lang = values[0]
        if (lang === 'it' || lang === 'de') onChange(lang)
      }}
    />
  )
}
export function AtelierDirectory() {
  const [language, setLanguage] = useState<Language>('it')
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selected, setSelected] = useState('c04')
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')
  const [sort, setSort] = useState<'recipient' | 'locality'>('recipient')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [removal, setRemoval] = useState<Contact | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const nextNumber = useRef(Math.max(...initialContacts.map((c) => c.number)) + 1)
  const detailTitle = useRef<HTMLHeadingElement>(null)
  const addTrigger = useRef<HTMLButtonElement>(null)
  const actionTriggers = useRef(new Map<string, HTMLButtonElement>())
  const opener = useRef<HTMLElement | null>(null)
  const t = copy[language]
  const locale = language === 'it' ? 'it-CH' : 'de-CH'
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  const searchTerms = fold(query).split(/\s+/).filter(Boolean)
  const available = cantons
    .filter((canton) => contacts.some((c) => c.canton === canton.code))
    .sort((a, b) => collator.compare(a.names[locale], b.names[locale]))
  function matches(contact: Contact) {
    const canton = cantons.find((c) => c.code === contact.canton)!
    const text = fold(
      [
        contact.recipient,
        contact.street,
        contact.locality,
        contact.postalCode,
        contact.canton,
        canton.names['it-CH'],
        canton.names['de-CH'],
      ].join(' '),
    )
    return (!region || region === contact.canton) && searchTerms.every((word) => text.includes(word))
  }
  const visible = contacts
    .filter(matches)
    .sort(
      (a, b) =>
        collator.compare(a[sort], b[sort]) ||
        collator.compare(a.recipient, b.recipient) ||
        a.number - b.number,
    )
  const active = visible.find((c) => c.id === selected) ?? visible[0]
  useEffect(() => {
    const previousLanguage = document.documentElement.lang
    const previousTitle = document.title
    document.documentElement.lang = locale
    document.title = t.title
    return () => {
      document.documentElement.lang = previousLanguage
      document.title = previousTitle
    }
  }, [locale, t.title])
  function resetFilters() {
    setRegion('')
    setQuery('')
  }
  useLayoutEffect(() => {
    if (editor || removal || !opener.current) return
    const trigger = opener.current.isConnected ? opener.current : addTrigger.current
    opener.current = null
    trigger?.focus({ preventScroll: true })
  }, [editor, removal])
  function save(address: SwissAddress) {
    if (!editor) return
    const contact: Contact =
      editor.kind === 'edit'
        ? { ...editor.contact, ...address }
        : { ...address, id: crypto.randomUUID(), number: nextNumber.current++ }
    setContacts((old) =>
      editor.kind === 'edit' ? old.map((c) => (c.id === contact.id ? contact : c)) : [...old, contact],
    )
    setSelected(contact.id)
    if (!matches(contact)) resetFilters()
    setNotice(editor.kind === 'edit' ? 'updated' : 'added')
    setEditor(null)
  }
  function remove() {
    if (!removal) return
    const remaining = contacts.filter((c) => c.id !== removal.id)
    setContacts(remaining)
    if (region && !remaining.some((c) => c.canton === region)) setRegion('')
    setRemoval(null)
    setNotice('deleted')
  }
  function select(contact: Contact) {
    setSelected(contact.id)
    requestAnimationFrame(() => {
      detailTitle.current?.focus({ preventScroll: true })
      detailTitle.current?.scrollIntoView({ block: 'nearest' })
    })
  }
  function openAction(contact: Contact, action: string) {
    opener.current = actionTriggers.current.get(contact.id) ?? addTrigger.current
    setSelected(contact.id)
    setNotice(null)
    if (action === 'edit') setEditor({ kind: 'edit', contact })
    if (action === 'delete') setRemoval(contact)
  }
  return (
    <>
      <Grid as="main" width="site" space="compact" aria-label={t.title} lang={locale}>
        <GridItem asChild>
          <header>
            <Stack gap={6}>
              <Separator weight="section" />
              <Stack
                direction="row"
                wrap
                justify="space-between"
                align="baseline"
                gap={3}
                columnGap={4}
              >
                <Typography as="span" variant="label">
                  {t.brand}
                </Typography>
                <LanguageSwitch language={language} onChange={setLanguage} />
              </Stack>
              <Stack
                direction="row"
                wrap
                justify="space-between"
                align="baseline"
                gap={3}
                columnGap={4}
              >
                <Stack gap={3}>
                  <Typography as="h1" variant="title">
                    {t.title}
                  </Typography>
                  <Typography>{t.subtitle}</Typography>
                </Stack>
                <Button
                  ref={addTrigger}
                  size="lg"
                  onClick={() => {
                    opener.current = addTrigger.current
                    setNotice(null)
                    setEditor({ kind: 'create' })
                  }}
                >
                  {t.add}
                </Button>
              </Stack>
            </Stack>
          </header>
        </GridItem>
        <GridItem medium={8} large={8}>
          <Stack role="region" aria-labelledby="index-heading" gap={4}>
            <Separator weight="section" />
            <Stack
              direction="row"
              wrap
              justify="space-between"
              align="baseline"
              gap={3}
              columnGap={4}
            >
              <Typography as="h2" variant="heading" id="index-heading">
                {t.list}
              </Typography>
              <Typography variant="label" numeric aria-live="polite">
                {visible.length} {visible.length === 1 ? t.contact : t.contacts}
              </Typography>
            </Stack>
            <Separator />
            <Stack direction="row" align="end" gap={3}>
              <Field label={t.search}>
                {(attrs) => (
                  <Input
                    {...attrs}
                    type="search"
                    placeholder={t.placeholder}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setNotice(null)
                    }}
                  />
                )}
              </Field>
              <Field label={t.filter}>
                {(attrs) => (
                  <Select
                    {...attrs}
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value)
                      setNotice(null)
                    }}
                  >
                    <option value="">{t.all}</option>
                    {available.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.names[locale]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t.sort}>
                {(attrs) => (
                  <Select
                    {...attrs}
                    value={sort}
                    onChange={(e) => setSort(e.target.value === 'locality' ? 'locality' : 'recipient')}
                  >
                    <option value="recipient">{t.name}</option>
                    <option value="locality">{t.town}</option>
                  </Select>
                )}
              </Field>
            </Stack>
            {visible.length > 0 ? (
              <Stack role="list" aria-labelledby="index-heading" gap={0}>
                {visible.map((c) => (
                  <Item key={c.id} role="listitem"
                    current={active?.id === c.id}
                    leading={<Typography as="span" variant="caption" numeric>{String(c.number).padStart(2, '0')}</Typography>}
                    title={
                      <TextLink
                        href="#contact-card"
                        aria-label={t.openCard + ' ' + c.recipient}
                        aria-current={active?.id === c.id ? 'true' : undefined}
                        onClick={(e) => {
                          e.preventDefault()
                          select(c)
                        }}
                      >
                        {c.recipient}
                      </TextLink>
                    }
                    description={c.locality + ' · ' + c.canton}
                    trailing={
                      <DropdownMenu
                        label={t.actions}
                        triggerLabel={t.actionFor + ' ' + c.recipient}
                        size="compact"
                        align="end"
                        triggerRef={(node) => {
                          if (node) actionTriggers.current.set(c.id, node)
                          else actionTriggers.current.delete(c.id)
                        }}
                        items={[
                          { value: 'edit', label: t.edit },
                          { value: 'delete', label: t.remove, tone: 'danger', separatorBefore: true },
                        ]}
                        onValueSelect={(value) => openAction(c, value)}
                      />
                    }
                  />
                ))}
              </Stack>
            ) : (
              <Empty
                title={contacts.length ? t.empty : t.zero}
                description={contacts.length ? t.emptyText : t.zeroText}
                action={
                  contacts.length ? (
                    <Button variant="outline" onClick={resetFilters}>
                      {t.reset}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        opener.current = addTrigger.current
                        setEditor({ kind: 'create' })
                      }}
                    >
                      {t.add}
                    </Button>
                  )
                }
              />
            )}
          </Stack>
        </GridItem>
        <GridItem medium={8} large={4}>
          {active && (
            <Stack role="complementary" id="contact-card" aria-labelledby="record-title" gap={3}>
              <Separator weight="section" />
              <Stack
                direction="row"
                wrap
                justify="space-between"
                align="baseline"
                gap={3}
                columnGap={4}
              >
                <Typography variant="heading" as="h2">
                  {t.card}
                </Typography>
                <Typography variant="label">{active.canton}</Typography>
              </Stack>
              <Card>
                <Stack gap={1}>
                  <Typography variant="caption">{t.id}</Typography>
                  <Typography tone="accent" variant="display" numeric>
                    {String(active.number).padStart(2, '0')}
                  </Typography>
                </Stack>
                <CardTitle as="h3" id="record-title" ref={detailTitle} tabIndex={-1}>
                  {active.recipient}
                </CardTitle>
                <address>
                  {active.street}
                  <br />
                  {active.postalCode} {active.locality}
                </address>
                <CardFooter>
                  <Stack gap={1}>
                    <Typography variant="caption">{t.canton}</Typography>
                    <Typography variant="label">
                      {cantons.find((c) => c.code === active.canton)?.names[locale]}
                    </Typography>
                  </Stack>
                </CardFooter>
              </Card>
            </Stack>
          )}
        </GridItem>
        <GridItem asChild>
          <footer>
            <Stack gap={3}>
              <Separator />
              <Typography variant="caption">{t.foot}</Typography>
              <Typography role="status" variant="label">
                {notice ? t[notice] : ''}
              </Typography>
            </Stack>
          </footer>
        </GridItem>
      </Grid>
      <Sheet
        open={!!editor}
        onOpenChange={(open) => {
          if (!open) setEditor(null)
        }}
        title={editor?.kind === 'edit' ? t.editTitle : t.createTitle}
        closeLabel={t.close}
      >
        {editor && (
          <Stack align="stretch" gap={4}>
            <LanguageSwitch language={language} onChange={setLanguage} />
            <SwissAddressForm
              key={editor.kind === 'edit' ? editor.contact.id : 'new'}
              locale={locale}
              initialValue={editor.kind === 'edit' ? editor.contact : undefined}
              labels={{ submit: t.save }}
              onSave={save}
            />
          </Stack>
        )}
      </Sheet>
      <AlertDialog
        open={!!removal}
        onOpenChange={(open) => {
          if (!open) setRemoval(null)
        }}
        title={t.removeTitle}
        description={removal ? t.removeBody(removal.recipient) : ''}
        cancelLabel={t.cancel}
        confirmLabel={t.remove}
        onConfirm={remove}
      />
    </>
  )
}
