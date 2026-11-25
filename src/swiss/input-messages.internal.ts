import type { SwissMessageLocale } from './locales.js'

export const ibanMessages = {
  'en': 'Enter a valid Swiss or Liechtenstein IBAN.',
  'de-CH': 'Geben Sie eine gültige IBAN aus der Schweiz oder Liechtenstein ein.',
  'fr-CH': 'Saisissez un IBAN suisse ou liechtensteinois valide.',
  'it-CH': 'Inserisci un IBAN svizzero o del Liechtenstein valido.',
  'rm-CH': 'Endatai in IBAN valaivel da la Svizra u dal Principadi da Liechtenstein.',
} satisfies Record<SwissMessageLocale, string>

export const ahvMessages = {
  'en': 'Enter a valid 13-digit AHV number beginning with 756.',
  'de-CH': 'Geben Sie eine gültige 13-stellige AHV-Nummer ein, die mit 756 beginnt.',
  'fr-CH': 'Saisissez un numéro AVS valide à 13 chiffres commençant par 756.',
  'it-CH': 'Inserisci un numero AVS valido di 13 cifre che inizi con 756.',
  'rm-CH': 'Endatai in numer AVS valaivel da 13 cifras che cumenza cun 756.',
} satisfies Record<SwissMessageLocale, string>

export const uidMessages = {
  'en': 'Enter a valid nine-digit Swiss business identifier beginning with CHE.',
  'de-CH': 'Geben Sie eine gültige UID mit CHE und neun Ziffern ein.',
  'fr-CH': 'Saisissez un IDE valide composé de CHE et de neuf chiffres.',
  'it-CH': 'Inserisci un IDI valido composto da CHE e nove cifre.',
  'rm-CH': 'Endatai in numer d’identificaziun da l’interpresa valaivel cun CHE e nov cifras.',
} satisfies Record<SwissMessageLocale, string>

export const phoneMessages = {
  'en': 'Enter a Swiss phone number with nine digits after +41.',
  'de-CH': 'Geben Sie eine Schweizer Telefonnummer mit neun Ziffern nach +41 ein.',
  'fr-CH': 'Saisissez un numéro de téléphone suisse avec neuf chiffres après +41.',
  'it-CH': 'Inserisci un numero di telefono svizzero con nove cifre dopo +41.',
  'rm-CH': 'Endatai in numer da telefon svizzer cun nov cifras suenter +41.',
} satisfies Record<SwissMessageLocale, string>

export const postalCodeMessages = {
  'en': 'Enter a four-digit postal code.',
  'de-CH': 'Geben Sie eine vierstellige Postleitzahl ein.',
  'fr-CH': 'Saisissez un numéro postal à quatre chiffres.',
  'it-CH': 'Inserisci un numero postale di quattro cifre.',
  'rm-CH': 'Endatai in numer postal da quatter cifras.',
} satisfies Record<SwissMessageLocale, string>

export const requiredMessages = {
  'en': 'Complete this field.',
  'de-CH': 'Füllen Sie dieses Feld aus.',
  'fr-CH': 'Remplissez ce champ.',
  'it-CH': 'Compila questo campo.',
  'rm-CH': 'Empleni quest champ.',
} satisfies Record<SwissMessageLocale, string>
