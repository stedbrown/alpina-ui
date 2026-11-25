import { flushSync } from 'react-dom'
import { hydrateRoot } from 'react-dom/client'
import { ComparisonCode } from './comparison-code.js'
import { homeIsland } from './home-sections.js'

export function hydrateLandingSample(node: HTMLElement) {
  const name = node.dataset.landingIsland ?? ''
  const sample = name === 'comparison-code'
    ? <ComparisonCode library={node.dataset.name!} code={node.querySelector('code')?.textContent ?? ''} />
    : homeIsland(name, { command: node.dataset.command })
  if (!sample) return
  flushSync(() => { hydrateRoot(node, sample, { identifierPrefix: 'landing-' + name + '-' }) })
  node.dataset.landingReady = ''
}
