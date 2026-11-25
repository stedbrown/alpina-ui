import type { SwissMessageLocale } from './locales.js'

const english = {
  characterSet: '{field} contains a character outside the Swiss QR character set.',
  required: '{field} is required.',
  length: '{field} exceeds {max} characters.',
  country: 'Use an ISO 3166-1 alpha-2 country code.',
  nonPayableAmount: 'A non-payable notification requires amount 0.00.',
  amount: 'Enter an amount from 0.01 to 999999999.99 with at most two decimal places.',
  currency: 'Choose CHF or EUR.',
  iban: 'Enter a valid Swiss or Liechtenstein IBAN.',
  referenceCharacters: 'References contain ASCII letters and digits only.',
  referenceType: 'Choose NON, QRR or SCOR.',
  referencePair: 'Use a QR-IBAN and a QRR reference together.',
  qrr: 'QRR requires CHF and a valid 27-digit QR reference.',
  scor: 'Enter a valid ISO 11649 creditor reference.',
  non: 'Leave the reference empty for NON.',
  billingSyntax: 'Start the billing information with // and a registered two-character identifier.',
  combinedLength: 'Keep the message and billing information within 140 characters in total.',
  alternatives: 'Enter at most two alternative procedures.',
  capacity: 'The payment data exceeds Swiss QR version 25 capacity.',
}

export type SwissQrErrorCode = keyof typeof english
const messages: Record<SwissMessageLocale, Record<SwissQrErrorCode, string>> = {
  en: english,
  'de-CH': {
    characterSet: '{field} enthält ein Zeichen ausserhalb des Swiss-QR-Zeichensatzes.',
    required: 'Bitte ausfüllen: {field}.', length: '{field} darf höchstens {max} Zeichen enthalten.',
    country: 'Verwenden Sie einen zweistelligen Ländercode nach ISO 3166-1.',
    nonPayableAmount: 'Eine Mitteilung ohne Zahlungsaufforderung erfordert den Betrag 0.00.',
    amount: 'Geben Sie einen Betrag von 0.01 bis 999999999.99 mit höchstens zwei Nachkommastellen ein.',
    currency: 'Wählen Sie CHF oder EUR.', iban: 'Geben Sie eine gültige IBAN aus der Schweiz oder Liechtenstein ein.',
    referenceCharacters: 'Verwenden Sie für die Referenz nur ASCII-Buchstaben und Ziffern.',
    referenceType: 'Wählen Sie NON, QRR oder SCOR.', referencePair: 'Verwenden Sie die QR-IBAN zusammen mit einer QR-Referenz.',
    qrr: 'QRR erfordert CHF und eine gültige 27-stellige QR-Referenz.',
    scor: 'Geben Sie eine gültige Creditor Reference nach ISO 11649 ein.', non: 'Lassen Sie die Referenz bei NON leer.',
    billingSyntax: 'Beginnen Sie die Rechnungsinformationen mit // und einer registrierten zweistelligen Kennung.',
    combinedLength: 'Mitteilung und Rechnungsinformationen dürfen zusammen höchstens 140 Zeichen enthalten.',
    alternatives: 'Geben Sie höchstens zwei alternative Verfahren an.', capacity: 'Die Zahlungsdaten überschreiten die Kapazität der Swiss-QR-Version 25.',
  },
  'fr-CH': {
    characterSet: 'Le champ « {field} » contient un caractère interdit dans le code QR suisse.',
    required: 'Remplissez le champ « {field} ».', length: 'Limitez le champ « {field} » à {max} caractères.',
    country: 'Utilisez un code pays ISO 3166-1 à deux lettres.',
    nonPayableAmount: 'Un avis sans paiement exige un montant de 0.00.',
    amount: 'Saisissez un montant de 0.01 à 999999999.99 avec deux décimales au maximum.',
    currency: 'Choisissez CHF ou EUR.', iban: 'Saisissez un IBAN suisse ou liechtensteinois valide.',
    referenceCharacters: 'Utilisez uniquement des lettres ASCII et des chiffres pour la référence.',
    referenceType: 'Choisissez NON, QRR ou SCOR.', referencePair: 'Utilisez le QR-IBAN avec une référence QR.',
    qrr: 'QRR exige des CHF et une référence QR valide à 27 chiffres.',
    scor: 'Saisissez une référence créancier ISO 11649 valide.', non: 'Laissez la référence vide pour NON.',
    billingSyntax: 'Commencez les informations de facture par // et un identifiant enregistré de deux caractères.',
    combinedLength: 'Limitez le message et les informations de facture à 140 caractères au total.',
    alternatives: 'Indiquez au maximum deux procédures alternatives.', capacity: 'Les données de paiement dépassent la capacité du code QR suisse version 25.',
  },
  'it-CH': {
    characterSet: 'Il campo «{field}» contiene un carattere non ammesso nel codice QR svizzero.',
    required: 'Compila il campo «{field}».', length: 'Limita il campo «{field}» a {max} caratteri.',
    country: 'Usa un codice Paese ISO 3166-1 di due lettere.',
    nonPayableAmount: 'Un avviso senza richiesta di pagamento richiede un importo di 0.00.',
    amount: 'Inserisci un importo da 0.01 a 999999999.99 con al massimo due decimali.',
    currency: 'Scegli CHF o EUR.', iban: 'Inserisci un IBAN svizzero o del Liechtenstein valido.',
    referenceCharacters: 'Per il riferimento usa soltanto lettere ASCII e cifre.',
    referenceType: 'Scegli NON, QRR o SCOR.', referencePair: 'Usa il QR-IBAN insieme a un riferimento QR.',
    qrr: 'QRR richiede CHF e un riferimento QR valido di 27 cifre.',
    scor: 'Inserisci un riferimento del creditore ISO 11649 valido.', non: 'Lascia vuoto il riferimento per NON.',
    billingSyntax: 'Inizia le informazioni per la fattura con // e un identificativo registrato di due caratteri.',
    combinedLength: 'Limita il messaggio e le informazioni per la fattura a 140 caratteri complessivi.',
    alternatives: 'Indica al massimo due procedure alternative.', capacity: 'I dati di pagamento superano la capacità del codice QR svizzero versione 25.',
  },
  'rm-CH': {
    characterSet: 'Il champ «{field}» cuntegna in segn betg admess en il code QR svizzer.',
    required: 'Empleni il champ «{field}».', length: 'Limitai il champ «{field}» a {max} segns.',
    country: 'Duvrai in code dal pajais tenor ISO 3166-1 cun dus bustabs.',
    nonPayableAmount: 'Ina communicaziun senza dumonda da pajament pretenda in import da 0.00.',
    amount: 'Endatai in import da 0.01 fin 999999999.99 cun maximal duas cifras suenter la comma.',
    currency: 'Tscherni CHF u EUR.', iban: 'Endatai in IBAN valaivel da la Svizra u dal Principadi da Liechtenstein.',
    referenceCharacters: 'Duvrai mo bustabs ASCII e cifras per la referenza.',
    referenceType: 'Tscherni NON, QRR u SCOR.', referencePair: 'Duvrai il QR-IBAN ensemen cun ina referenza QR.',
    qrr: 'QRR pretenda CHF ed ina referenza QR valaivla da 27 cifras.',
    scor: 'Endatai ina referenza dal creditur valaivla tenor ISO 11649.', non: 'Laschai vid il champ da referenza per NON.',
    billingSyntax: 'Cumenzai las infurmaziuns davart il quint cun // ed in identificatur registrà da dus segns.',
    combinedLength: 'Limitai la communicaziun e las infurmaziuns davart il quint a totalmain 140 segns.',
    alternatives: 'Inditgai maximalmain duas proceduras alternativas.', capacity: 'Las datas da pajament surpassan la capacitad dal code QR svizzer da la versiun 25.',
  },
}

const fieldNames = {
  en: ['Name', 'Street', 'Building number', 'Postal code', 'Town', 'Country', 'Message', 'Billing information', 'Alternative procedure'],
  'de-CH': ['Name', 'Strasse', 'Hausnummer', 'Postleitzahl', 'Ort', 'Land', 'Mitteilung', 'Rechnungsinformationen', 'Alternatives Verfahren'],
  'fr-CH': ['Nom', 'Rue', 'Numéro de maison', 'Numéro postal', 'Localité', 'Pays', 'Message', 'Informations de facture', 'Procédure alternative'],
  'it-CH': ['Nome', 'Via', 'Numero civico', 'Numero postale', 'Località', 'Paese', 'Messaggio', 'Informazioni per la fattura', 'Procedura alternativa'],
  'rm-CH': ['Num', 'Via', 'Numer da chasa', 'Numer postal', 'Lieu', 'Pajais', 'Communicaziun', 'Infurmaziuns davart il quint', 'Procedura alternativa'],
} as const
const fields = ['name', 'street', 'buildingNumber', 'postalCode', 'town', 'country', 'message', 'billingInformation', 'alternativeProcedures']

export function qrErrorMessage(locale: SwissMessageLocale, code: SwissQrErrorCode, path: string, max?: number): string {
  const name = path.startsWith('alternativeProcedures.') ? 'alternativeProcedures' : path.split('.').at(-1)!
  return messages[locale][code].replace('{field}', fieldNames[locale][fields.indexOf(name)] ?? name).replace('{max}', String(max ?? ''))
}
