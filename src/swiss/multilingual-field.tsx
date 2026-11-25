'use client'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { Button } from '../ui/button.js'
import { Field } from '../ui/field.js'
import { Input } from '../ui/input.js'
import { Stack } from '../ui/stack.js'
import { Textarea } from '../ui/textarea.js'
import { Tabs } from '../interactive/tabs.js'
import type { SwissMessageLocale } from './locales.js'
import { localeNames } from './locales.js'
import './multilingual-field.css'

const national = ['de', 'fr', 'it', 'rm'] as const
export type TranslationLanguage = typeof national[number] | 'en'
export type Translations = Partial<Record<TranslationLanguage, string>>
const languages = [...national, 'en'] as const
const names = { de: localeNames['de-CH'], fr: localeNames['fr-CH'], it: localeNames['it-CH'], rm: localeNames['rm-CH'], en: 'English' }
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : undefined

export interface MultilingualFieldLabels {
  complete: string
  empty: string
  count: (characters: number) => string
  copyFrom: (source: string) => string
}
const english: MultilingualFieldLabels = {
  complete: 'Complete', empty: 'Empty',
  count: n => n + (n === 1 ? ' character' : ' characters'),
  copyFrom: source => 'Copy from ' + source,
}

const labelsByLocale: Record<SwissMessageLocale, MultilingualFieldLabels> = {
  en: english,
  'de-CH': { complete: 'Vollständig', empty: 'Leer', count: n => n + ' Zeichen', copyFrom: source => 'Aus ' + source + ' kopieren' },
  'fr-CH': { complete: 'Complet', empty: 'Vide', count: n => n + (n > 1 ? ' caractères' : ' caractère'), copyFrom: source => 'Copier depuis « ' + source + ' »' },
  'it-CH': { complete: 'Completo', empty: 'Vuoto', count: n => n + (n === 1 ? ' carattere' : ' caratteri'), copyFrom: source => 'Copia da ' + source },
  'rm-CH': { complete: 'Cumplet', empty: 'Vid', count: n => n + (n === 1 ? ' segn' : ' segns'), copyFrom: source => 'Copiar la versiun «' + source + '»' },
}

export interface MultilingualFieldProps extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'name' | 'children' | 'defaultValue'> {
  name: string
  label: string
  includeEnglish?: boolean
  /** Language of status, character counts and copy actions, independent of the text being edited. */
  locale?: SwissMessageLocale
  layout?: 'tabs' | 'columns'
  variant?: 'input' | 'textarea'
  sourceLanguage?: TranslationLanguage
  value?: Translations
  defaultValue?: Translations
  onValueChange?: (translations: Translations) => void
  labels?: Partial<MultilingualFieldLabels>
}

export const MultilingualField = forwardRef<HTMLFieldSetElement, MultilingualFieldProps>(function MultilingualField(
  { name, label, includeEnglish = false, layout = 'tabs', variant = 'input', sourceLanguage = 'de',
    value, defaultValue, onValueChange, labels, locale = 'en', className = '', form, ...props }, ref,
) {
  const group = useRef<HTMLFieldSetElement>(null)
  useImperativeHandle(ref, () => group.current!, [])
  const [local, setLocal] = useState<Translations>(defaultValue ?? {})
  const values = value ?? local
  const visible = includeEnglish ? languages : national
  const source = sourceLanguage === 'en' && !includeEnglish ? 'de' : sourceLanguage
  const messages = { ...labelsByLocale[locale], ...labels }
  useEffect(() => {
    const owner = group.current?.form
    if (!owner || value !== undefined) return
    function reset(event: Event) {
      queueMicrotask(() => { if (!event.defaultPrevented) setLocal(defaultValue ?? {}) })
    }
    owner.addEventListener('reset', reset)
    return () => owner.removeEventListener('reset', reset)
  }, [defaultValue, value, form])
  function update(language: TranslationLanguage, text: string) {
    const next = { ...values, [language]: text }
    if (value === undefined) setLocal(next)
    onValueChange?.(next)
  }
  const items = visible.map(language => {
    const text = values[language] ?? ''
    const complete = Boolean(text.trim())
    const count = segmenter ? Array.from(segmenter.segment(text)).length : Array.from(text).length
    const status = complete ? messages.complete : messages.empty
    const tag = language === 'en' ? 'en' : language + '-CH'
    const content = <Stack gap={2} key={language}>
      <Field label={<span lang={tag}>{names[language]}</span>} description={messages.count(count) + ' · ' + status}>
        {control => {
          const attributes = { ...control, name: name + '[' + language + ']', lang: tag, value: text, form }
          return variant === 'textarea'
            ? <Textarea {...attributes} onChange={e => update(language, e.target.value)} />
            : <Input {...attributes} onChange={e => update(language, e.target.value)} />
        }}
      </Field>
      {language !== source && <Stack align="start"><Button size="sm" variant="outline"
        disabled={Boolean(text) || !values[source]?.trim()} onClick={() => update(language, values[source] ?? '')}>
        {messages.copyFrom(names[source])}
      </Button></Stack>}
    </Stack>
    return { value: language, label: <span>
      <span aria-hidden="true">{language.toUpperCase()} {complete ? '✓' : '–'}</span>
      <span className="al-translations-status"><span lang={tag}>{names[language]}</span> · {status}</span>
    </span>, content }
  })
  return <fieldset lang={locale} {...props} form={form} ref={group} className={('al-translations ' + className).trim()}>
    <legend>{label}</legend>
    {layout === 'tabs' ? <Tabs label={label} items={items} defaultValue={source} />
      : <div className="al-translations-columns">{items.map(item => item.content)}</div>}
  </fieldset>
})
