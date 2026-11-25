import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Button } from '../ui/button.js'
import './appearance-button.internal.css'

export interface AppearanceButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Accessible action labels for each data-al-theme mode on the document. */
  labels?: Readonly<Record<'auto' | 'light' | 'dark', string>>
}
const defaultLabels = { auto: 'Automatic theme. Switch to light', light: 'Light theme. Switch to dark', dark: 'Dark theme. Follow device appearance' }
export const AppearanceButton = forwardRef<HTMLButtonElement, AppearanceButtonProps>(function AppearanceButton(
  { labels = defaultLabels, className = '', ...props }, ref,
) {
  return <Button size="sm" variant="ghost" ref={ref} {...props} className={('al-appearance ' + className).trim()}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
      <path d="M8 1.5a6.5 6.5 0 0 0 0 13Z" fill="currentColor" />
    </svg>
    {(['auto', 'light', 'dark'] as const).map(mode => <span key={mode} data-mode={mode}>{labels[mode]}</span>)}
  </Button>
})
