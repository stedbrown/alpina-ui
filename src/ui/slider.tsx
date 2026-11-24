import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './slider.css'
export type SliderProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { className = '', ...props },
  ref,
) {
  return <input {...props} ref={ref} type="range" className={('al-slider ' + className).trim()} />
})
