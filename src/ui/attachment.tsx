import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './attachment.css'
export interface AttachmentProps extends Omit<ComponentPropsWithoutRef<'a'>, 'children'> {
  href: string
  filename: string
  detail?: ReactNode
}
export function Attachment({
  filename,
  detail,
  className = '',
  ...props
}: AttachmentProps): ReactElement {
  return (
    <a {...props} className={('al-attachment ' + className).trim()}>
      <svg aria-hidden="true" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 1.5h9l5 5v16H3z M12 2v5h5 M6 13h8 M6 17h6" />
      </svg>
      <span className="al-attachment-name">{filename}</span>
      {detail != null && <span className="al-attachment-detail">{detail}</span>}
    </a>
  )
}
