import { Button } from 'alpina-ui'

export function AppearanceButton() {
  return <Button size="sm" variant="ghost" data-site-appearance="" title="Change appearance">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
      <path d="M8 1.5a6.5 6.5 0 0 0 0 13Z" fill="currentColor" />
    </svg>
    <span data-mode="auto">Automatic theme. Switch to light</span>
    <span data-mode="light">Light theme. Switch to dark</span>
    <span data-mode="dark">Dark theme. Follow device appearance</span>
  </Button>
}
