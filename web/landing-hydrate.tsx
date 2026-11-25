import { hydrateRoot } from 'react-dom/client'
import { TypeProof } from './type-proof.js'
import { AccessProof } from './access-proof.js'
import { InstallCommand, PressQueue } from './landing-samples.js'

export function hydrateLandingSample(node: HTMLElement) {
  const name = node.dataset.landingIsland
  const samples: Record<string, import('react').ReactElement> = {
    install: <InstallCommand command={node.dataset.command!} />,
    queue: <PressQueue />,
    access: <AccessProof />,
    type: <TypeProof />,
  }
  const sample = samples[name ?? '']
  if (!sample) return
  hydrateRoot(node, sample, { identifierPrefix: 'landing-' + name + '-' })
}
