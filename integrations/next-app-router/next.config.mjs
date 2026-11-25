import { fileURLToPath } from 'node:url'

export default {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
}
