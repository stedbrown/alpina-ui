import { hydrateRoot } from 'react-dom/client'
import { forms } from './app'
const mount = document.getElementById('form')!
const Form = forms[mount.dataset.library as keyof typeof forms]
hydrateRoot(mount, <Form />)
