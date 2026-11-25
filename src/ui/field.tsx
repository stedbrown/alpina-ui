import { useId, type ComponentPropsWithoutRef, type ReactNode, type ReactElement } from 'react'
import './field.css'

export interface FieldControlProps {
  id: string
  'aria-describedby'?: string | undefined
  'aria-invalid'?: true | undefined
}
export interface FieldProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  describedBy?: string
  children: (control: FieldControlProps) => ReactNode
}

export function Field({
  id,
  label,
  description,
  error,
  describedBy,
  children,
  className = '',
  ...props
}: FieldProps): ReactElement {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const hasDescription =
    description !== null && description !== undefined && description !== false && description !== ''
  const hasError = error !== null && error !== undefined && error !== false && error !== ''
  const descriptionId = hasDescription ? `${controlId}-hint` : undefined
  const errorId = hasError ? `${controlId}-error` : undefined
  const references = [
    ...new Set([errorId, descriptionId, ...(describedBy?.trim().split(/\s+/) ?? [])].filter(Boolean)),
  ].join(' ')

  return (
    <div {...props} data-invalid={hasError || undefined} className={`al-field ${className}`.trim()}>
      <label className="al-field-label" htmlFor={controlId}>
        {label}
      </label>
      {hasDescription && (
        <div className="al-field-hint" id={descriptionId}>
          {description}
        </div>
      )}
      {hasError && (
        <div className="al-field-error" id={errorId}>
          {error}
        </div>
      )}
      {children({
        id: controlId,
        'aria-describedby': references || undefined,
        'aria-invalid': hasError || undefined,
      })}
    </div>
  )
}
