import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LocaleSelect, CantonSelect, Item, Stack } from 'alpina-ui'
test('locales may be restricted and ordered without duplicate choices', () => {
  const html = renderToStaticMarkup(
    createElement(LocaleSelect, { locales: ['fr-CH', 'de-CH', 'fr-CH'] }),
  )
  assert.equal((html.match(/<option/g) ?? []).length, 2)
  assert.match(html, /<option value="fr-CH"[^>]*selected/)
  assert.ok(html.indexOf('Français') < html.indexOf('Deutsch'))
  assert.equal(renderToStaticMarkup(createElement(LocaleSelect, {})).match(/<option/g).length, 4)
})
test('stack expresses layout in public rhythm tokens and forwards native props', () => {
  const html = renderToStaticMarkup(
    createElement(
      Stack,
      { direction: 'row', gap: 2, justify: 'space-between', role: 'group', 'aria-label': 'Azioni' },
      'Contatti',
    ),
  )
  assert.match(html, /var\(--al-space-2\)/)
  assert.match(html, /flex-wrap:wrap/)
  assert.match(html, /space-between/)
  assert.match(html, /aria-label="Azioni"/)
})
test('canton filter has a resettable option and the address placeholder remains disabled', () => {
  const filter = renderToStaticMarkup(
    createElement(CantonSelect, { allLabel: 'Alle Kantone', locale: 'de-CH' }),
  )
  assert.match(filter, /<option value="" selected="">Alle Kantone<\/option>/)
  const required = renderToStaticMarkup(
    createElement(CantonSelect, { placeholder: 'Scegli un cantone' }),
  )
  assert.match(required, /<option value="" disabled="" selected="">/)
})
test('current row exposes the current item while keeping the ordinary Item markup stable', () => {
  const current = renderToStaticMarkup(createElement(Item, { current: true, title: 'Atelier' }))
  assert.match(current, /aria-current="true"/)
  assert.match(current, /data-current="true"/)
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(Item, { title: 'Atelier' })),
    /data-current|aria-current/,
  )
})
