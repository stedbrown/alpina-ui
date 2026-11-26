import { hydrateRoot } from 'react-dom/client'
import { ThemeBuilder } from './theme-builder.js'

// The identifier prefix matches the server rendering in scripts/site.mjs.
hydrateRoot(document.getElementById('theme-builder')!, <ThemeBuilder />, { identifierPrefix: 'theme-' })
