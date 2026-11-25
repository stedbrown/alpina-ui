import { forwardRef, type ComponentPropsWithoutRef, type ReactNode, type Ref, type RefAttributes, type ForwardRefExoticComponent } from 'react'
import { FileInput, type FileInputProps } from './file-input.js'
import './attachment.css'
export interface AttachmentProps extends Omit<ComponentPropsWithoutRef<'a'>, 'children'> {
  mode?: 'link'
  href: string
  filename: string
  detail?: ReactNode
}
export interface AttachmentUploadProps extends FileInputProps {
  mode: 'upload'
}
export const Attachment = forwardRef<HTMLAnchorElement | HTMLInputElement, AttachmentProps | AttachmentUploadProps>(function Attachment(options, ref) {
  if (options.mode === 'upload') {
    const { mode: _mode, ...input } = options
    return <FileInput ref={ref as Ref<HTMLInputElement>} {...input} />
  }
  const { mode: _mode, filename, detail, className = '', ...props } = options
  return (
    <a ref={ref as Ref<HTMLAnchorElement>} {...props} className={('al-attachment ' + className).trim()}>
      <svg aria-hidden="true" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 1.5h9l5 5v16H3z M12 2v5h5 M6 13h8 M6 17h6" />
      </svg>
      <bdi className="al-attachment-name">{filename}</bdi>
      {detail != null && <span className="al-attachment-detail">{detail}</span>}
    </a>
  )
}) as ForwardRefExoticComponent<AttachmentUploadProps & RefAttributes<HTMLInputElement>> &
  ForwardRefExoticComponent<AttachmentProps & RefAttributes<HTMLAnchorElement>>
