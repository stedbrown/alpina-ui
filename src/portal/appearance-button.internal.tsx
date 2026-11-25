'use client'

import { forwardRef, useEffect, type ComponentPropsWithoutRef } from 'react'
import { initializeTheme } from './theme-initialization.js'
import { Button } from '../ui/button.js'
import { Icon } from '../ui/icon.js'
import './appearance-button.internal.css'

export interface AppearanceButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Accessible action labels for each data-al-theme mode on the document. */
  labels?: Readonly<Record<'auto' | 'light' | 'dark', string>>
}
const defaultLabels = { auto: 'Automatic theme. Switch to light', light: 'Light theme. Switch to dark', dark: 'Dark theme. Follow device appearance' }
const signs = { auto: 'theme-auto', light: 'sun', dark: 'moon' } as const

export const AppearanceButton = forwardRef<HTMLButtonElement, AppearanceButtonProps>(function AppearanceButton(
  { labels = defaultLabels, className = '', ...props }, ref,
) {
  return <Button size="sm" variant="ghost" ref={ref} {...props} className={('al-appearance ' + className).trim()}>
    {(['auto', 'light', 'dark'] as const).map(mode => <span key={mode} data-mode={mode}>
      <Icon name={signs[mode]} size={18} /><span className="al-appearance-label">{labels[mode]}</span>
    </span>)}
  </Button>
})

/** Cycle between the system preference, light and dark. All toggles on the page share a preference. */
export const ThemeToggle = forwardRef<HTMLButtonElement, AppearanceButtonProps>(function ThemeToggle(props, ref) {
  useEffect(initializeTheme, [])
  return <AppearanceButton {...props} data-al-theme-toggle="" ref={ref} />
})
