'use client'
import {
  cloneElement, Fragment, forwardRef, isValidElement, useMemo,
  type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type Ref, type SyntheticEvent,
} from 'react'

/** A slotted root can receive a ref to the element rendered by the child. */
export type SlottedSignature<Props> = <Node extends HTMLElement>(
  props: Omit<Props, keyof HTMLAttributes<HTMLElement>> & HTMLAttributes<Node> &
    { asChild: true; children: ReactElement; ref?: Ref<Node> },
) => ReactElement | null

interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  before?: ReactNode
  after?: ReactNode
  inactive?: boolean
  buttonType?: 'button' | 'submit' | 'reset'
}

type ChildProps = Record<string, unknown> & {
  className?: string
  children?: ReactNode
  style?: CSSProperties
}

function assignRef(ref: NonNullable<Ref<HTMLElement>>, node: HTMLElement | null): void | (() => void) {
  if (typeof ref === 'function') return ref(node)
  const object = ref as { current: HTMLElement | null }
  object.current = node
}

function composeRefs(outer: Ref<HTMLElement> | null, inner: Ref<HTMLElement> | null) {
  if (!outer || outer === inner) return inner
  if (!inner) return outer
  const refs = [outer, inner]
  return (node: HTMLElement | null) => {
    const cleanups = refs.map(ref => assignRef(ref, node))
    if (cleanups.some(cleanup => typeof cleanup === 'function')) {
      return () => {
        refs.forEach((ref, i) => {
          const cleanup = cleanups[i]
          if (typeof cleanup === 'function') cleanup()
          else assignRef(ref, null)
        })
      }
    }
  }
}

function blockActivation(event: SyntheticEvent) {
  event.preventDefault()
  event.stopPropagation()
}

export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, before, after, inactive, buttonType, ...outer }, ref,
) {
  if (!isValidElement<ChildProps>(children) || children.type === Fragment)
    throw new TypeError('asChild requires one element that forwards its props and ref.')
  const child = children.props
  // React 18 stores refs on the element. React 19 stores them in props.
  // Read only data descriptors so neither version invokes a deprecated getter.
  const childRef: Ref<HTMLElement> | null = Object.getOwnPropertyDescriptor(child, 'ref')?.value
    ?? Object.getOwnPropertyDescriptor(children, 'ref')?.value ?? null
  const mergedRef = useMemo(() => composeRefs(ref, childRef), [ref, childRef])
  const props: ChildProps = { ...outer, ...child }
  for (const [key, handler] of Object.entries(outer)) {
    const childHandler = child[key]
    if (/^on[A-Z]/.test(key) && typeof handler === 'function' && typeof childHandler === 'function') {
      props[key] = (event: SyntheticEvent) => {
        childHandler(event)
        if (!event.defaultPrevented) handler(event)
      }
    }
  }
  if (outer.className) props.className = [outer.className, child.className].filter(Boolean).join(' ')
  if (outer.style) props.style = { ...outer.style, ...child.style }
  if (mergedRef) props.ref = mergedRef
  if (before || after) props.children = <>{before}{child.children}{after}</>
  if (buttonType && children.type === 'button') props.type ??= buttonType
  if (inactive) {
    props['aria-disabled'] = true
    props.tabIndex = -1
    props.onClickCapture = blockActivation
    props.onAuxClickCapture = blockActivation
    props.onContextMenuCapture = blockActivation
    const previousKeyDown = props.onKeyDownCapture
    props.onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') blockActivation(event)
      else if (typeof previousKeyDown === 'function') previousKeyDown(event)
    }
    if (children.type === 'a') {
      props.href = undefined
      props.role ??= 'link'
    } else if (children.type === 'button' && props.role !== 'menuitem') props.disabled = true
  }
  return cloneElement(children, props)
})
