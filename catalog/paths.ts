export const bilingualProject = '/examples/bilingual-address-book/'
export const clientProject = '/examples/client-directory/'
export const workflowProjects = [
  {
    slug: 'workshop-registration',
    title: 'Workshop registration',
    source: 'catalog/workshop-registration.tsx',
    component: 'steps',
  },
  {
    slug: 'invoice-review',
    title: 'Invoice review',
    source: 'catalog/invoice-review.tsx',
    component: 'description-list',
  },
] as const
export type WorkflowProject = (typeof workflowProjects)[number]

export function guideHref(key: string, hosted: boolean) {
  return hosted ? '/docs/guides/' + key + '/' : '#guide/' + key
}

export function componentHref(id: string, hosted: boolean) {
  return hosted ? '/docs/components/' + id + '/' : '#' + id
}
