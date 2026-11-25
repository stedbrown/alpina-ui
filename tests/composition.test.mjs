import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement as h, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Badge, Button, TextLink } from 'alpina-ui'

test('slotted roots keep real links and preserve names, classes and style overrides during SSR', () => {
  for (const Component of [Button, Badge, TextLink]) {
    const html = renderToStaticMarkup(h(Component, { asChild: true, className: 'wrapper', style: { color: 'red', padding: 8 } },
      h('a', { href: '/work', className: 'route', style: { color: 'black' } }, 'Work')))
    assert.match(html, /^<a\b/)
    assert.match(html, /href="\/work"/)
    assert.match(html, /class="al-[\w-]+ wrapper route"/)
    assert.match(html, /style="color:black;padding:8px"/)
    assert.doesNotMatch(html, /type="button"|asChild|<button/)
  }
})

test('a slot rejects text, fragments and multiple roots with a clear error', () => {
  for (const content of ['Work', h(Fragment, null, 'Work'), [h('a', { key: 1 }), h('a', { key: 2 })]]) {
    assert.throws(() => renderToStaticMarkup(h(Button, { asChild: true }, content)), /asChild requires one element/)
  }
})
