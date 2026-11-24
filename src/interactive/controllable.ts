import { useCallback, useState } from 'react'

/** A supplied value remains authoritative. Uncontrolled changes are stored locally. */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [localValue, setLocalValue] = useState(defaultValue)
  const current = value === undefined ? localValue : value

  const change = useCallback(
    (next: T) => {
      if (Object.is(next, current)) return
      if (value === undefined) setLocalValue(next)
      onChange?.(next)
    },
    [current, value, onChange],
  )

  return [current, change]
}
