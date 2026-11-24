import type { SwissLocale } from './locales.js'

// Federal statistical order. See the language-specific sources in docs/swiss.md.
const cantonRows = [
  ['ZH', 'Zürich', 'Zurich', 'Zurigo', 'Turitg'],
  ['BE', 'Bern', 'Berne', 'Berna', 'Berna'],
  ['LU', 'Luzern', 'Lucerne', 'Lucerna', 'Lucerna'],
  ['UR', 'Uri', 'Uri', 'Uri', 'Uri'],
  ['SZ', 'Schwyz', 'Schwyz', 'Svitto', 'Sviz'],
  ['OW', 'Obwalden', 'Obwald', 'Obvaldo', 'Sursilvania'],
  ['NW', 'Nidwalden', 'Nidwald', 'Nidvaldo', 'Sutsilvania'],
  ['GL', 'Glarus', 'Glaris', 'Glarona', 'Glaruna'],
  ['ZG', 'Zug', 'Zoug', 'Zugo', 'Zug'],
  ['FR', 'Freiburg', 'Fribourg', 'Friburgo', 'Friburg'],
  ['SO', 'Solothurn', 'Soleure', 'Soletta', 'Soloturn'],
  ['BS', 'Basel-Stadt', 'Bâle-Ville', 'Basilea Città', 'Basilea-Citad'],
  ['BL', 'Basel-Landschaft', 'Bâle-Campagne', 'Basilea Campagna', 'Basilea-Champagna'],
  ['SH', 'Schaffhausen', 'Schaffhouse', 'Sciaffusa', 'Schaffusa'],
  [
    'AR',
    'Appenzell Ausserrhoden',
    'Appenzell Rhodes-Extérieures',
    'Appenzello Esterno',
    'Appenzell Dadora',
  ],
  [
    'AI',
    'Appenzell Innerrhoden',
    'Appenzell Rhodes-Intérieures',
    'Appenzello Interno',
    'Appenzell Dadens',
  ],
  ['SG', 'St. Gallen', 'Saint-Gall', 'San Gallo', 'Son Gagl'],
  ['GR', 'Graubünden', 'Grisons', 'Grigioni', 'Grischun'],
  ['AG', 'Aargau', 'Argovie', 'Argovia', 'Argovia'],
  ['TG', 'Thurgau', 'Thurgovie', 'Turgovia', 'Turgovia'],
  ['TI', 'Tessin', 'Tessin', 'Ticino', 'Tessin'],
  ['VD', 'Waadt', 'Vaud', 'Vaud', 'Vad'],
  ['VS', 'Wallis', 'Valais', 'Vallese', 'Vallais'],
  ['NE', 'Neuenburg', 'Neuchâtel', 'Neuchâtel', 'Neuchâtel'],
  ['GE', 'Genf', 'Genève', 'Ginevra', 'Genevra'],
  ['JU', 'Jura', 'Jura', 'Giura', 'Giura'],
] as const

export type CantonCode = (typeof cantonRows)[number][0]

export interface Canton {
  readonly code: CantonCode
  readonly names: Readonly<Record<SwissLocale, string>>
}

export const cantons: readonly Canton[] = cantonRows.map(([code, de, fr, it, rm]) => ({
  code,
  names: { 'de-CH': de, 'fr-CH': fr, 'it-CH': it, 'rm-CH': rm },
}))
