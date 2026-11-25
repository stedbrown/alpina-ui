'use client'
import { useState, type ComponentPropsWithoutRef, type ReactElement } from 'react'
import './avatar.css'
let graphemes: Intl.Segmenter | undefined
function initial(word: string) {
  if (!word) return ''
  if (typeof Intl.Segmenter !== 'function') return Array.from(word)[0]
  graphemes ??= new Intl.Segmenter()
  return graphemes.segment(word).containing(0)?.segment ?? ''
}
export interface AvatarProps extends ComponentPropsWithoutRef<'span'> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  decorative?: boolean
}
export function Avatar({
  name,
  src,
  size = 'md',
  decorative = false,
  className = '',
  ...props
}: AvatarProps): ReactElement {
  const [failed, setFailed] = useState<string>()
  const words = name.trim().split(/\s+/u).filter(Boolean)
  const initials =
    [words[0], words.length > 1 ? words[words.length - 1] : '']
      .map((word) => initial(word || ''))
      .join('')
      .toUpperCase() || '·'
  return (
    <span
      {...props}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      data-size={size}
      className={('al-avatar ' + className).trim()}
    >
      {src && failed !== src ? (
        <img src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  )
}
