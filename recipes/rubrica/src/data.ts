import type { SwissAddress } from 'alpina-ui'

export type Contact = SwissAddress & { id: string; number: number }

export const initialContacts: Contact[] = [
  {
    id: 'c01',
    number: 1,
    recipient: 'Atelier Argent',
    street: 'Rue du Passage 18',
    postalCode: '1201',
    locality: 'Genève',
    canton: 'GE',
  },
  {
    id: 'c02',
    number: 2,
    recipient: 'Atelier Limmat',
    street: 'Uferweg 42',
    postalCode: '8005',
    locality: 'Zürich',
    canton: 'ZH',
  },
  {
    id: 'c03',
    number: 3,
    recipient: 'Bureau Pli',
    street: 'Rue des Feuilles 7',
    postalCode: '1003',
    locality: 'Lausanne',
    canton: 'VD',
  },
  {
    id: 'c04',
    number: 4,
    recipient: 'Edizioni Riva',
    street: 'Via del Torchio 12',
    postalCode: '6900',
    locality: 'Lugano',
    canton: 'TI',
  },
  {
    id: 'c05',
    number: 5,
    recipient: 'Forma Nord',
    street: 'Papiergasse 9',
    postalCode: '4051',
    locality: 'Basel',
    canton: 'BS',
  },
  {
    id: 'c06',
    number: 6,
    recipient: 'Studio Arco',
    street: 'Via delle Carte 4',
    postalCode: '6600',
    locality: 'Locarno',
    canton: 'TI',
  },
  {
    id: 'c07',
    number: 7,
    recipient: 'Werkstatt Drei',
    street: 'Faltweg 21',
    postalCode: '3011',
    locality: 'Bern',
    canton: 'BE',
  },
]
export function fold(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase().replaceAll('\u00df', 'ss').trim()
}
