'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { ResponsiveNavigation } from '../interactive/responsive-navigation.js'
import { Steps } from './steps.js'
import { Typography } from './typography.js'

export interface FormStepsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  label: string
  items: readonly { id: string; label: string }[]
  current: string
  /** Localized compact label containing {current} and {total}. */
  compactLabel?: string
}

export const FormSteps = forwardRef<HTMLDivElement, FormStepsProps>(function FormSteps(
  { label, items, current, compactLabel = 'Step {current} of {total}', ...props }, ref,
) {
  const index = items.findIndex(item => item.id === current)
  if (index < 0) return null
  return <ResponsiveNavigation ref={ref} {...props} layoutKey={JSON.stringify([items, current])} compact={
    <Typography variant="label" numeric aria-current="step">{compactLabel.replace('{current}', String(index + 1))
      .replace('{total}', String(items.length))}</Typography>
  }><Steps className="al-steps-fit" label={label} items={items} current={current} /></ResponsiveNavigation>
})
