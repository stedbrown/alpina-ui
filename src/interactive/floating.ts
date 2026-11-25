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
      const gap = 4
      // A zoomed page or an onscreen keyboard can leave only part of the layout viewport visible.
      const viewport = view.visualViewport
      const viewportWidth = Math.min(viewport?.width ?? Infinity, anchor.ownerDocument.documentElement.clientWidth)
      const viewportHeight = viewport?.height ?? view.innerHeight
      const originX = viewport?.offsetLeft ?? 0
      const originY = viewport?.offsetTop ?? 0
      panel.style.setProperty('--al-visible-width', viewportWidth + 'px')
      const bounds = anchor.getBoundingClientRect()
      const spaceAbove = Math.max(0, bounds.top - originY - margin - gap)
      const spaceBelow = Math.max(0, originY + viewportHeight - bounds.bottom - margin - gap)
      const availableHeight = Math.min(viewportHeight - margin * 2, Math.max(spaceAbove, spaceBelow, 48))
      if (position === 'combobox') {
        panel.style.width = Math.min(bounds.width, viewportWidth - margin * 2) + 'px'
        panel.style.maxHeight = 'round(down, min(18rem, ' + availableHeight + 'px), var(--al-unit))'
      } else {
        panel.style.maxHeight = 'round(down, ' + availableHeight + 'px, var(--al-unit))'
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
      const left = Math.max(originX + margin, Math.min(naturalLeft, originX + viewportWidth - box.width - margin))
      const top = Math.max(
        originY + margin,
        Math.min(
          above ? bounds.top - box.height - gap : bounds.bottom + gap,
          originY + viewportHeight - box.height - margin,
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
    view.visualViewport?.addEventListener('resize', place)
    view.visualViewport?.addEventListener('scroll', place)
    return () => {
      observer?.disconnect()
      view.removeEventListener('resize', place)
      view.removeEventListener('scroll', place, true)
      view.visualViewport?.removeEventListener('resize', place)
      view.visualViewport?.removeEventListener('scroll', place)
      if (panel.matches('[popover]') && panel.isConnected) panel.hidePopover()
    }
  }, [open, anchorRef, panelRef, position, align])
}
