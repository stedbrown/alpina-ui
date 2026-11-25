'use client'

import { forwardRef, useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './responsive-navigation.css'

interface ResponsiveRowProps extends ComponentPropsWithoutRef<'div'> {
  compact: ReactNode
  layoutKey: string
}

export const ResponsiveNavigation = forwardRef<HTMLDivElement, ResponsiveRowProps>(function ResponsiveNavigation(
  { children, compact, layoutKey, className = '', ...props }, ref,
) {
  const full = useRef<HTMLDivElement>(null)
  const short = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = full.current!, fallback = short.current!, column = row.parentElement!
    function measure() {
      const active = document.activeElement
      row.hidden = false
      const items = [...row.querySelectorAll<HTMLElement>('button, li')]
      const top = items[0]?.getBoundingClientRect().top
      const range = document.createRange()
      const fits = items.length > 0 && items.every(item => {
        range.selectNodeContents(item)
        return item.getBoundingClientRect().top === top &&
          range.getBoundingClientRect().height <= parseFloat(getComputedStyle(item).lineHeight) + 1
      })
      row.hidden = !fits
      fallback.hidden = fits
      if (active && (fits ? fallback : row).contains(active)) {
        const visible = fits ? row : fallback
        visible.querySelector<HTMLElement>('button[aria-pressed=true], select')?.focus({ preventScroll: true })
      }
    }
    let frame = 0
    function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    observer.observe(column)
    window.addEventListener('resize', schedule)
    document.fonts.addEventListener('loadingdone', schedule)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      document.fonts.removeEventListener('loadingdone', schedule)
    }
  }, [layoutKey])
  return <div ref={ref} className={('al-responsive-navigation ' + className).trim()} {...props}>
    <div ref={full} hidden>{children}</div><div ref={short}>{compact}</div>
  </div>
})
