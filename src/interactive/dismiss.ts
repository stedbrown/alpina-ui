import { useEffect, type RefObject } from 'react'

/** Retains focus in the user's destination on outside dismissal. */
export function useOutside(open: boolean, root: RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    const node = root.current
    if (!open || !node) return
    const owner = node.ownerDocument
    function outside(event: Event) {
      if (event.target instanceof Node && !node!.contains(event.target)) close()
    }
    owner.addEventListener('pointerdown', outside, true)
    owner.addEventListener('focusin', outside, true)
    return () => {
      owner.removeEventListener('pointerdown', outside, true)
      owner.removeEventListener('focusin', outside, true)
    }
  }, [open, root, close])
}
