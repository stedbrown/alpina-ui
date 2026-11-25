import { useEffect, useLayoutEffect, useState } from 'react'

const useMountedLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

// A native field already accepts input while the nearby React sample is downloading.
// Adopt its live value on mount, before another field's render can restore the server defaults.
function usePrerenderedSetting<T>(id: string, initial: T, fromControl: (control: HTMLInputElement | HTMLSelectElement) => T) {
  const setting = useState(initial)
  const setValue = setting[1]
  useMountedLayoutEffect(() => {
    const control = document.getElementById(id)
    if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) setValue(fromControl(control))
  }, [id, fromControl, setValue])
  return setting
}

const numberValue = (control: HTMLInputElement | HTMLSelectElement) => Number(control.value)
const checkedValue = (control: HTMLInputElement | HTMLSelectElement) => control instanceof HTMLInputElement && control.checked

export function useNumericSetting(id: string, initial: number) {
  return usePrerenderedSetting(id, initial, numberValue)
}

export function useSwitchSetting(id: string, initial: boolean) {
  return usePrerenderedSetting(id, initial, checkedValue)
}
