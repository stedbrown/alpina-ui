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

export const checkDigitMessages = {
  'en': 'The format is correct. The check digit does not match. Check the entry against the original document.',
  'de-CH': 'Das Format ist korrekt. Die Prüfziffer stimmt nicht überein. Vergleichen Sie die Eingabe mit dem Originaldokument.',
  'fr-CH': 'Le format est correct. Le chiffre de contrôle ne correspond pas. Vérifiez la saisie sur le document original.',
  'it-CH': 'Il formato è corretto. La cifra di controllo non corrisponde. Ricontrolla i dati sul documento originale.',
  'rm-CH': 'Il format è correct. La cifra da controlla na correspunda betg. Cumparegliai las datas cun il document original.',
} satisfies Record<SwissMessageLocale, string>

export const checkDigitPairMessages = {
  'en': 'The format is correct. The check digits do not match. Check the entry against the original document.',
  'de-CH': 'Das Format ist korrekt. Die Prüfziffern stimmen nicht überein. Vergleichen Sie die Eingabe mit dem Originaldokument.',
  'fr-CH': 'Le format est correct. Les chiffres de contrôle ne correspondent pas. Vérifiez la saisie sur le document original.',
  'it-CH': 'Il formato è corretto. Le cifre di controllo non corrispondono. Ricontrolla i dati sul documento originale.',
  'rm-CH': 'Il format è correct. Las cifras da controlla na correspundan betg. Cumparegliai las datas cun il document original.',
} satisfies Record<SwissMessageLocale, string>
