import { hydrateRoot } from 'react-dom/client'
import { blockDemos } from './block-demos.js'

const mount = document.querySelector<HTMLElement>('[data-block-preview]')
const load = mount && blockDemos[mount.dataset.blockPreview ?? '']
if (mount && load) hydrateRoot(mount, await load())
