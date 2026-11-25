import type { SwissLocale } from './locales.js'

const english = {
  omitted: "Additional information omitted", scan: 'Scan a payment slip', file: 'Choose an image or PDF', hint: 'PNG, JPEG, WebP or PDF. The file stays on this device.',
  camera: 'Use camera', stop: 'Cancel scan', reading: 'Reading payment slip…', aiming: 'Point the camera at the Swiss QR Code.',
  unavailable: 'Camera scanning is unavailable. Choose an image or PDF.', denied: 'Camera access failed. Allow access or choose a file.',
  missing: 'No Swiss QR Code was found. Choose a sharper image or a different PDF.', invalid: 'The file could not be read. Choose another file.',
  large: 'Choose a file of 64 MiB or less.', encrypted: 'Choose a PDF without password protection.', preview: 'Review payment details',
  creditor: 'Payable to', debtor: 'Payable by', amount: 'Amount', open: 'To be entered', reference: 'Reference', message: 'Message',
  billing: 'Billing information', alternatives: 'Alternative procedures', page: 'PDF page', confirm: 'Confirm details',
  again: 'Scan another slip', done: 'Payment details confirmed.', nonpayable: 'Notification only. No payment is due.',
}
type Labels = typeof english
export const scannerLabels = {
  en: english,
  'de-CH': {
    omitted: "Ausgelassene Zusatzangaben", scan: 'Zahlteil einlesen', file: 'Bild oder PDF auswählen', hint: 'PNG, JPEG, WebP oder PDF. Die Datei bleibt auf diesem Gerät.',
    camera: 'Kamera verwenden', stop: 'Scan abbrechen', reading: 'Zahlteil wird gelesen…', aiming: 'Die Kamera auf den Swiss QR Code richten.',
    unavailable: 'Scannen mit der Kamera ist nicht verfügbar. Ein Bild oder PDF auswählen.', denied: 'Kein Kamerazugriff. Zugriff erlauben oder eine Datei auswählen.',
    missing: 'Kein Swiss QR Code gefunden. Ein schärferes Bild oder ein anderes PDF auswählen.', invalid: 'Die Datei konnte nicht gelesen werden. Eine andere Datei auswählen.',
    large: 'Eine Datei bis 64 MiB auswählen.', encrypted: 'Ein PDF ohne Passwortschutz auswählen.', preview: 'Zahlungsangaben prüfen',
    creditor: 'Zahlbar an', debtor: 'Zahlbar durch', amount: 'Betrag', open: 'Noch einzutragen', reference: 'Referenz', message: 'Mitteilung',
    billing: 'Rechnungsinformationen', alternatives: 'Alternative Verfahren', page: 'PDF-Seite', confirm: 'Angaben bestätigen',
    again: 'Weiteren Zahlteil einlesen', done: 'Zahlungsangaben bestätigt.', nonpayable: 'Nur eine Mitteilung. Es ist keine Zahlung geschuldet.',
  },
  'fr-CH': {
    omitted: "Informations supplémentaires omises", scan: 'Scanner une section paiement', file: 'Choisir une image ou un PDF', hint: 'PNG, JPEG, WebP ou PDF. Le fichier reste sur cet appareil.',
    camera: 'Utiliser la caméra', stop: 'Annuler la lecture', reading: 'Lecture de la section paiement…', aiming: 'Pointez la caméra vers le Swiss QR Code.',
    unavailable: 'La lecture par caméra est indisponible. Choisissez une image ou un PDF.', denied: 'Accès à la caméra impossible. Autorisez l’accès ou choisissez un fichier.',
    missing: 'Aucun Swiss QR Code trouvé. Choisissez une image plus nette ou un autre PDF.', invalid: 'Lecture impossible. Choisissez un autre fichier.',
    large: 'Choisissez un fichier de 64 Mio au maximum.', encrypted: 'Choisissez un PDF sans mot de passe.', preview: 'Vérifier les données du paiement',
    creditor: 'Payable à', debtor: 'Payable par', amount: 'Montant', open: 'À compléter', reference: 'Référence', message: 'Message',
    billing: 'Informations de facturation', alternatives: 'Procédures alternatives', page: 'Page du PDF', confirm: 'Confirmer les données',
    again: 'Scanner une autre section', done: 'Données du paiement confirmées.', nonpayable: 'Avis uniquement. Aucun paiement dû.',
  },
  'it-CH': {
    omitted: "Informazioni supplementari omesse", scan: 'Leggi la sezione pagamento', file: 'Scegli un’immagine o un PDF', hint: 'PNG, JPEG, WebP o PDF. Il file rimane su questo dispositivo.',
    camera: 'Usa la fotocamera', stop: 'Annulla scansione', reading: 'Lettura della sezione pagamento…', aiming: 'Inquadra lo Swiss QR Code con la fotocamera.',
    unavailable: 'Scansione con la fotocamera non disponibile. Scegli un’immagine o un PDF.', denied: 'Accesso alla fotocamera non riuscito. Consenti l’accesso o scegli un file.',
    missing: 'Nessuno Swiss QR Code trovato. Scegli un’immagine più nitida o un altro PDF.', invalid: 'Impossibile leggere il file. Scegli un altro file.',
    large: 'Scegli un file di massimo 64 MiB.', encrypted: 'Scegli un PDF senza password.', preview: 'Verifica i dati di pagamento',
    creditor: 'Pagabile a', debtor: 'Pagabile da', amount: 'Importo', open: 'Da compilare', reference: 'Riferimento', message: 'Messaggio',
    billing: 'Informazioni sulla fatturazione', alternatives: 'Procedure alternative', page: 'Pagina del PDF', confirm: 'Conferma i dati',
    again: 'Leggi un’altra sezione', done: 'Dati di pagamento confermati.', nonpayable: 'Solo una comunicazione. Nessun pagamento dovuto.',
  },
  'rm-CH': {
    omitted: "Infurmaziuns supplementaras omessas", scan: 'Leger ina part da pajament', file: 'Tscherner in maletg u in PDF', hint: 'PNG, JPEG, WebP u PDF. La datoteca resta sin quest apparat.',
    camera: 'Duvrar la camera', stop: 'Interrumper la lectura', reading: 'La part da pajament vegn legida…', aiming: 'Drizzai la camera sin il Swiss QR Code.',
    unavailable: 'La camera n’è betg disponibla. Tscherni in maletg u in PDF.', denied: 'Nagin access a la camera. Permettai l’access u tschernì ina datoteca.',
    missing: 'Nagin Swiss QR Code chattà. Tscherni in maletg pli cler u in auter PDF.', invalid: 'Impussibel da leger la datoteca. Tscherni in’autra datoteca.',
    large: 'Tscherni ina datoteca da maximalmain 64 MiB.', encrypted: 'Tscherni in PDF senza pled-clav.', preview: 'Controllar las datas da pajament',
    creditor: 'Da pajar a', debtor: 'Da pajar da', amount: 'Import', open: 'Da cumplettar', reference: 'Referenza', message: 'Communicaziun',
    billing: 'Infurmaziuns davart il quint', alternatives: 'Proceduras alternativas', page: 'Pagina dal PDF', confirm: 'Confermar las datas',
    again: 'Leger in’autra part da pajament', done: 'Las datas da pajament èn confermadas.', nonpayable: 'Mo in avis. Nagin pajament necessari.',
  },
} satisfies Record<SwissLocale | 'en', Labels>
