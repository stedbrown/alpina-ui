import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './attachment.css'
export interface AttachmentProps extends Omit<ComponentPropsWithoutRef<'a'>, 'children'> {
  href: string
  filename: string
  detail?: ReactNode
}
export const Attachment = forwardRef<HTMLAnchorElement, AttachmentProps>(function Attachment(
  {
    filename,
    detail,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <a ref={ref} {...props} className={('al-attachment ' + className).trim()}>
      <svg aria-hidden="true" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 1.5h9l5 5v16H3z M12 2v5h5 M6 13h8 M6 17h6" />
      </svg>
      <bdi className="al-attachment-name">{filename}</bdi>
      {detail != null && <span className="al-attachment-detail">{detail}</span>}
    </a>
  )
})
