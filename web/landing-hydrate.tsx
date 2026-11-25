import { hydrateRoot } from 'react-dom/client'
import { AccessProof } from './access-proof.js'
import { InstallCommand, PressQueue } from './landing-samples.js'

export function hydrateLandingSample(node: HTMLElement) {
  const name = node.dataset.landingIsland
  const sample = name === 'install' ? <InstallCommand command={node.dataset.command!} /> : name === 'access' ? <AccessProof /> : <PressQueue />
  hydrateRoot(node, sample, { identifierPrefix: 'landing-' + name + '-' })
}
