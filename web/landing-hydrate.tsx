import { hydrateRoot } from 'react-dom/client'
import { InstallCommand, PressQueue } from './landing-samples.js'

export function hydrateLandingSample(node: HTMLElement) {
  const name = node.dataset.landingIsland
  const sample = name === 'install' ? <InstallCommand command={node.dataset.command!} /> : <PressQueue />
  hydrateRoot(node, sample, { identifierPrefix: 'landing-' + name + '-' })
}
