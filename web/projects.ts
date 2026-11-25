export const projects = [
  {
    slug: 'workshop-registration', title: 'Workshop registration', action: 'Register for a workshop',
    description: 'Choose a print workshop, enter attendee details and review the reservation. Go back to change a choice before confirming.',
    source: '/blob/main/catalog/workshop-registration.tsx',
  },
  {
    slug: 'invoice-review', title: 'Invoice review', action: 'Review an invoice',
    description: 'Inspect line items and totals in Swiss francs. Approve an invoice or return it with a note, then reopen the decision.',
    source: '/blob/main/catalog/invoice-review.tsx',
  },
  {
    slug: 'bilingual-address-book', title: 'Studio address book', action: 'Open address book',
    description: 'Find a studio by canton, switch between Italian and German and edit its postal address without losing the draft.',
    source: '/tree/main/recipes/rubrica', report: '/blob/main/recipes/rubrica/PROVA.md',
  },
  {
    slug: 'client-directory', title: 'Client directory', action: 'Browse clients',
    description: 'Filter records by canton, sort orders by their total and edit a postal address in any of the four Swiss national languages.',
    source: '/blob/main/catalog/overview.tsx',
  },
]
