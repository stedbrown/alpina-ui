export function navigationIndex(
  key: string,
  index: number,
  count: number,
  orientation: 'horizontal' | 'vertical',
  rtl = false,
): number | undefined {
  if (!count) return
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  const previous = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
  const next = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
  if (key === previous) return (index + count - 1) % count
  if (key === next) return (index + 1) % count
}
