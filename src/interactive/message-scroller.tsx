'use client'

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
import './message-scroller.css'

export interface MessageScrollerProps {
  label: string
  children: ReactNode
  jumpLabel?: string
  className?: string
}

export function MessageScroller({
  label,
  children,
  jumpLabel = 'Jump to the latest message',
  className = '',
}: MessageScrollerProps): ReactElement {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const following = useRef(true)
  const [away, setAway] = useState(false)

  useEffect(() => {
    const node = viewport.current
    const body = content.current
    if (!node || !body) return
    function follow() {
      if (following.current && node) node.scrollTop = node.scrollHeight
    }
    follow()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(follow)
    observer.observe(body)
    observer.observe(node)
    return () => observer.disconnect()
  }, [children])

  return (
    <div className={('al-message-scroller ' + className).trim()}>
      <div
        ref={viewport}
        role="log"
        tabIndex={0}
        aria-label={label}
        aria-relevant="additions text"
        onScroll={(event) => {
          const node = event.currentTarget
          following.current = node.scrollHeight - node.clientHeight - node.scrollTop <= 4
          setAway(!following.current)
        }}
      >
        <div ref={content}>{children}</div>
      </div>
      {away && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            following.current = true
            const node = viewport.current
            if (node) {
              node.scrollTop = node.scrollHeight
              node.focus({ preventScroll: true })
            }
            setAway(false)
          }}
        >
          {jumpLabel}
        </Button>
      )}
    </div>
  )
}
