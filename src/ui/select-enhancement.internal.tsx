'use client'

import { useEffect } from 'react'
import { installSelectPicker } from './select-picker.internal.js'

let users = 0
let dispose: (() => void) | undefined

export function SelectEnhancement() {
  useEffect(() => {
    if (++users === 1) dispose = installSelectPicker(document)
    return () => {
      if (--users === 0) dispose?.()
    }
  }, [])
  return null
}
