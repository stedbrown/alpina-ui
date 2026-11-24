import { useEffect, useLayoutEffect, type RefObject } from 'react'

export const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Use the browser top layer where available, keeping the source element's theme and direction. */
export function useFloating(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  position: 'menu' | 'tooltip' | 'combobox',
  align: 'start' | 'end' = 'start',
) {
  useBrowserLayoutEffect(() => {
    const anchor = anchorRef.current
    const panel = panelRef.current
    const view = anchor?.ownerDocument.defaultView
    if (!open || !anchor || !panel || !view) return
    if (typeof panel.showPopover === 'function') {
      panel.setAttribute('popover', 'manual')
      panel.showPopover()
    }

    function place() {
      if (!anchor || !panel || !view) return
      const margin = 8
      const gap = 5
      const viewportWidth = anchor.ownerDocument.documentElement.clientWidth
      const viewportHeight = view.innerHeight
      const bounds = anchor.getBoundingClientRect()
      const spaceAbove = Math.max(0, bounds.top - margin - gap)
      const spaceBelow = Math.max(0, viewportHeight - bounds.bottom - margin - gap)
      const availableHeight = Math.max(spaceAbove, spaceBelow, 48)
      if (position === 'combobox') {
        panel.style.width = Math.min(bounds.width, viewportWidth - margin * 2) + 'px'
        panel.style.maxHeight = 'min(18rem, ' + availableHeight + 'px)'
      } else {
        panel.style.maxHeight = availableHeight + 'px'
      }
      const box = panel.getBoundingClientRect()
      const preferAbove = position === 'tooltip'
      const above = preferAbove
        ? spaceAbove >= box.height || spaceAbove > spaceBelow
        : spaceBelow < box.height && spaceAbove > spaceBelow
      const rtl = view.getComputedStyle(anchor).direction === 'rtl'
      const alignRight = rtl ? align === 'start' : align === 'end'
      const naturalLeft =
        position === 'tooltip'
          ? bounds.left + (bounds.width - box.width) / 2
          : alignRight
            ? bounds.right - box.width
            : bounds.left
      const left = Math.max(margin, Math.min(naturalLeft, viewportWidth - box.width - margin))
      const top = Math.max(
        margin,
        Math.min(
          above ? bounds.top - box.height - gap : bounds.bottom + gap,
          viewportHeight - box.height - margin,
        ),
      )
      panel.style.left = Math.round(left) + 'px'
      panel.style.top = Math.round(top) + 'px'
      panel.style.visibility = 'visible'
    }

    place()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : undefined
    observer?.observe(anchor)
    observer?.observe(panel)
    view.addEventListener('resize', place)
    view.addEventListener('scroll', place, true)
    return () => {
      observer?.disconnect()
      view.removeEventListener('resize', place)
      view.removeEventListener('scroll', place, true)
      if (panel.matches('[popover]') && panel.isConnected) panel.hidePopover()
    }
  }, [open, anchorRef, panelRef, position, align])
}
