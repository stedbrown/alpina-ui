import type { KeyboardEvent } from 'react'
import { navigationIndex } from './navigation.js'

export function moveButton(
  event: KeyboardEvent<HTMLElement>,
  orientation: 'horizontal' | 'vertical',
): HTMLButtonElement | undefined {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !(event.target instanceof HTMLButtonElement)
  )
    return
  const root = event.currentTarget
  if (
    event.target.closest('[data-al-roving]') !== root ||
    !event.target.hasAttribute('data-al-choice')
  )
    return
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('button[data-al-choice]:enabled'),
  ).filter((button) => button.closest('[data-al-roving]') === root)
  const index = navigationIndex(
    event.key,
    buttons.indexOf(event.target),
    buttons.length,
    orientation,
    getComputedStyle(root).direction === 'rtl',
  )
  if (index === undefined) return
  event.preventDefault()
  const next = buttons[index]
  next?.focus()
  return next
}
