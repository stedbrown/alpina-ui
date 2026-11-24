'use client'
import type { ReactElement } from 'react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
import './app-shell.css'

export interface AppShellProps {
  brand: ReactNode
  sidebar: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (value: boolean) => void
  navigationLabel?: string
  openLabel?: string
  closeLabel?: string
  skipLabel?: string
  contentAs?: 'main' | 'section'
  mainId?: string
}
export function AppShell({
  brand,
  sidebar,
  toolbar,
  children,
  open,
  onOpenChange,
  openLabel = 'Sfoglia componenti',
  closeLabel = 'Chiudi indice',
  skipLabel = 'Vai al contenuto',
  mainId,
  navigationLabel = 'Navigazione mobile',
  contentAs: Content = 'main',
}: AppShellProps): ReactElement {
  const id = useId()
  const target = mainId ?? id + '-main'
  const [local, setLocal] = useState(false)
  const expanded = open ?? local
  const trigger = useRef<HTMLButtonElement>(null)
  function change(value: boolean) {
    setLocal(value)
    onOpenChange?.(value)
  }
  useEffect(() => {
    if (!expanded) return
    const escape = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        !e.defaultPrevented &&
        !document.querySelector('dialog[open]') &&
        trigger.current?.offsetWidth
      ) {
        e.preventDefault()
        setLocal(false)
        onOpenChange?.(false)
        trigger.current.focus()
      }
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [expanded, onOpenChange])
  return (
    <div className="al-app-shell" data-index-open={expanded}>
      <a
        className="al-skip"
        href={'#' + target}
        onClick={(e) => {
          e.preventDefault()
          document.getElementById(target)?.focus()
        }}
      >
        {skipLabel}
      </a>
      <nav className="al-app-mobile" aria-label={navigationLabel}>
        {brand}
        <Button
          ref={trigger}
          variant="outline"
          size="sm"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => change(!expanded)}
        >
          {expanded ? closeLabel : openLabel}
        </Button>
      </nav>
      <div className="al-app-index" id={id}>
        {sidebar}
      </div>
      <div className="al-app-page">
        {toolbar && <header className="al-app-bar">{toolbar}</header>}
        <Content id={target} tabIndex={-1} className="al-app-main">
          {children}
        </Content>
      </div>
    </div>
  )
}
