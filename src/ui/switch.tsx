import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './switch.css'

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'input'>, 'role' | 'type'> {
  stateLabels?: { on: string; off: string }
}
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className = '', stateLabels, ...props },
  ref,
) {
  const control = (
    <input
      {...props}
      ref={ref}
      type="checkbox"
      role="switch"
      className={`al-switch ${className}`.trim()}
    />
  )
  if (!stateLabels) return control
  return (
    <span className="al-switch-state">
      {control}
      <span className="al-switch-on" aria-hidden="true">
        {stateLabels.on}
      </span>
      <span className="al-switch-off" aria-hidden="true">
        {stateLabels.off}
      </span>
    </span>
  )
})
