import { createRef, forwardRef, useState, type ComponentPropsWithoutRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '../src/ui/button.js'
import { Badge } from '../src/ui/badge.js'
import { Breadcrumb } from '../src/ui/breadcrumb.js'
import { TextLink } from '../src/portal/text-link.js'
import { NavigationMenu } from '../src/portal/navigation-menu.js'
import { DropdownMenu } from '../src/interactive/dropdown-menu.js'

const log = (message: string) => document.querySelector('output')?.append(message + '|')
const anchor = createRef<HTMLAnchorElement>()
const outer = createRef<HTMLAnchorElement>()
const inner = (node: HTMLAnchorElement | null) => {
  if (node) {
    node.dataset.childRef = 'attached'
    return () => { log('cleanup') }
  }
}
const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'> & { to: string }>(
  function RouterLink({ to, onClick, ...props }, ref) {
    return <a {...props} href={to} ref={ref} onClick={event => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        event.preventDefault()
        log('route ' + to)
      }
    }} />
  },
)

function Fixture() {
  const [mounted, setMounted] = useState(true)
  return <>
    <output />
    <Button onClick={() => setMounted(!mounted)}>Mount link</Button>
    {mounted && <Button asChild ref={outer} className="outer" style={{ padding: 8, color: 'red' }}
      onClick={() => log('button')}>
      <RouterLink to="#work" ref={inner} className="child" style={{ color: 'black' }}
        onClick={() => log('child')}>Work</RouterLink>
    </Button>}
    <Button onClick={() => log(outer.current?.tagName ?? 'detached')}>Read ref</Button>
    <Button asChild onClick={() => log('unexpected')}><a href="#cancel"
      onClick={event => { log('cancel'); event.preventDefault() }}>Cancel navigation</a></Button>
    <Button asChild disabled onClick={() => log('unexpected')}>
      <RouterLink to="#disabled" onClick={() => log('unexpected')}>Disabled route</RouterLink>
    </Button>
    <Button asChild busy><a href="#busy">Busy route</a></Button>
    <form onSubmit={e => { e.preventDefault(); log('submit') }}>
      <Button asChild><button>Neutral child</button></Button>
    </form>
    <Badge asChild tone="accent"><RouterLink to="#label">Label</RouterLink></Badge>
    <TextLink asChild variant="action"><RouterLink to="#guide" ref={anchor}>Guide</RouterLink></TextLink>
    <Breadcrumb label="Path" items={[{ label: 'Home', href: '/' },
      { asChild: true, label: <RouterLink to="#work">Current</RouterLink> }]} />
    <NavigationMenu label="Sections" onNavigate={log} sections={[{ links: [
      { href: '/index', asChild: true, label: <RouterLink to="#index">Index</RouterLink> },
    ] }]} />
    <DropdownMenu label="Actions" onValueSelect={log} items={[
      { value: 'first', label: 'First' },
      { value: 'closed', disabled: true, asChild: true, label: <RouterLink to="#closed">Closed</RouterLink> },
      { value: 'edit', asChild: true, shortcut: 'E', label: <RouterLink to="#edit">Edit</RouterLink> },
    ]} />
  </>
}

createRoot(document.getElementById('app')!).render(<Fixture />)
