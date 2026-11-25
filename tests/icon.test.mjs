import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Icon, iconNames } from 'alpina-ui/ui/icon'

test('every public icon name resolves to a distinct drawing on the common grid', () => {
  const drawings = iconNames.map((name) => {
    const markup = renderToStaticMarkup(createElement(Icon, { name }))
    assert.match(markup, /viewBox="0 0 24 24"/)
    assert.match(markup, /stroke="currentColor"/)
    assert.match(markup, /aria-hidden="true"/)
    assert.doesNotMatch(markup, /role="img"|aria-label=/)
    const path = /<path d="([^"]+)"/.exec(markup)
    assert.ok(path, name)
    return path[1]
  })
  assert.equal(new Set(drawings).size, iconNames.length)
})

test('standalone icons accept accessible names and scale with the surrounding type', () => {
  const named = renderToStaticMarkup(createElement(Icon, {
    name: 'git-branch', size: '1em', label: 'Branch history', className: 'history',
  }))
  assert.match(named, /role="img"/)
  assert.match(named, /aria-label="Branch history"/)
  assert.doesNotMatch(named, /aria-hidden=/)
  assert.match(named, /width="1em"/)
  assert.match(named, /height="1em"/)
  assert.match(named, /class="al-icon history"/)

  const referenced = renderToStaticMarkup(createElement(Icon, { name: 'info', 'aria-labelledby': 'notice' }))
  assert.match(referenced, /aria-labelledby="notice"/)
  assert.match(referenced, /role="img"/)
  assert.doesNotMatch(referenced, /aria-hidden=/)
})
