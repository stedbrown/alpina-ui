export const bilingualProject = '/examples/bilingual-address-book/'
export const clientProject = '/examples/client-directory/'

export function guideHref(key: string, hosted: boolean) {
  return hosted ? '/docs/guides/' + key + '/' : '#guide/' + key
}

export function componentHref(id: string, hosted: boolean) {
  return hosted ? '/docs/components/' + id + '/' : '#' + id
}
