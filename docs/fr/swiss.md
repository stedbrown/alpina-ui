# Interfaces suisses

Alpina fournit des composants React et des fonctions pures pour les données suisses. Réglez la langue sur le composant ou son fournisseur de contexte. Les interfaces suisses prennent en charge it-CH, de-CH, fr-CH et rm-CH.

| Composant | Props principales | HTML ou résultat |
| --- | --- | --- |
| `CurrencyCHF` | `amount: number \| bigint`, `locale?` | `data` avec une valeur numérique lisible par un logiciel |
| `SwissDate` | `value: string \| Date`, `locale?`, `dateStyle?`, `timeZone?` | `time` avec attribut `datetime` |
| `LocaleSelect` | `value?`, `defaultValue?`, `onLocaleChange?(locale)` | `select` avec les quatre langues nommées dans leur propre langue |
| `CantonSelect` | `locale?`, `value?`, `defaultValue?`, `placeholder?`, `onCantonChange?(code)` | `select` avec les noms localisés et abréviations des 26 cantons |
| `CantonCombobox` | `locale?`, `value?`, `defaultValue?`, `onCantonChange?(code)`, `name?`, `required?` | Champ de recherche avec libellé et liste des cantons |
| `SwissPostalCodeInput` | `value?` et `defaultValue?` sous forme de chaînes, `required?`, `onChange?` | Champ de texte avec clavier numérique |
| `SwissAddressForm` | `onSave`, `initialValue?`, `locale?`, `labels?`, `className?` | Formulaire postal à cinq champs obligatoires |
| `UidInput` | `value?`, `defaultValue?`, `validationMessage?` | Identifiant des entreprises avec contrôle modulo 11 |
| `Calendar` | `value?`, `defaultValue?`, `onValueChange?`, `defaultMonth?`, `min?`, `max?` | Grille mensuelle de dates civiles |
| `DatePicker` | `label`, `name?`, `value?`, `defaultValue?`, `onValueChange?` | Sélecteur renvoyant une date civile ISO |

Les sélecteurs natifs et le champ NPA transmettent `ref`, `id`, `name`, `disabled`, `required`, les attributs ARIA et les événements natifs. Donnez-leur un libellé visible. Pour une sélection contrôlée, fournissez `value` et le rappel typé. Avec `defaultValue` le navigateur gère la sélection.

## Rumantsch grischun

Utilisez `rm-CH` pour la langue écrite standard des publications fédérales. Le menu indique «Rumantsch» pour les adresses, cantons, dates, jours fériés, montants et bulletins QR. Les traductions gardent les noms `title[de]`, `title[fr]`, `title[it]` et `title[rm]` à l’envoi. Avec `<MultilingualField locale="rm-CH" … />`, l’éditeur affiche les états, décomptes et actions de copie en romanche, indépendamment de la langue du texte. [Lia Rumantscha](https://www.liarumantscha.ch/de/raetoromanisch/rumantsch-grischun) · [Chancellerie fédérale et Pledari Grond](https://www.bk.admin.ch/rm/rumantsch)

Passez `locale="rm-CH"` à `IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` et `SwissPostalCodeInput` pour localiser les erreurs. Changer de langue conserve la valeur et actualise la correction. `validationMessage` personnalise le message. Sur le serveur, `swissValidationMessage('postalCode', 'rm-CH')` fournit le même texte. [Formulaire d’adresse](https://alpina-ui.vercel.app/docs/components/swiss-address-form/)

| Exemple | Affichage romanche |
| --- | --- |
| Quantité | 1 234,50 |
| Montant négatif | CHF −1 234,50 |
| Date complète | venderdi, ils 19 da favrer 2027 |

```ts
const locale = 'rm-CH'
formatSwissNumber('1234.50', locale, { minimumFractionDigits: 2 })
formatCHF(-1234.5, locale)
formatSwissDate('2027-02-19', locale, { dateStyle: 'full' })
```

Les langues ICU disponibles dépendent du moteur JavaScript. Une étiquette BCP 47 valide peut aboutir à une autre langue sans avertissement. Vérifiez `Intl.NumberFormat.supportedLocalesOf(['rm-CH'], { localeMatcher: 'lookup' })` et `Intl.DateTimeFormat.supportedLocalesOf(…)` séparément. Alpina inclut les formes de dates, mois, jours et séparateurs romanches de CLDR 48. Le moteur convertit les fuseaux horaires et arrondit les montants. Prévoyez des données complémentaires pour `Intl.DisplayNames`, les durées relatives et les nombres en lettres si nécessaire. [CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Sélection de langue ECMA‑402](https://tc39.es/ecma402/#sec-supportedlocales)

## Saisir une adresse postale

```tsx
import { SwissAddressForm, type SwissAddress } from 'alpina-ui/swiss/swiss-address-form'

export function PostalAddress({ save }: { save: (value: SwissAddress) => Promise<void> }) {
  return <SwissAddressForm locale="it-CH" initialValue={{ canton: 'TI' }} onSave={save} />
}
```

`onSave(address)` reçoit `recipient`, `street`, `postalCode`, `locality` et `canton` sans espaces en début ni en fin. Les quatre premiers sont des chaînes, le canton est de type `CantonCode`. Ces cinq champs sont obligatoires. Le formulaire vérifie les quatre chiffres du NPA et le canton, puis place le focus sur le premier champ à corriger.

Si plusieurs champs nécessitent une correction, le récapitulatif les présente dans l’ordre du formulaire. Chaque lien cible le contrôle sans modifier l’URL. Le message explique le problème. La liste s’actualise pendant la saisie et disparaît lorsqu’il ne reste qu’une erreur, toujours visible près du champ.

Le rappel peut ne rien renvoyer ou renvoyer une promesse. Le formulaire suspend les modifications et les nouveaux envois pendant la sauvegarde. Une exception ou un rejet affiche une erreur générale, conserve les valeurs et réactive le bouton. L’application choisit où enregistrer. Les cinq champs restent dans le DOM pendant la correction.

### Proposer une localité

`SwissAddressFields` ajoute à un formulaire existant un groupe de champs natifs nommés et des suggestions de localité. Utilisez `value` et `onValueChange` en mode contrôlé, ou `defaultValue` avec FormData en mode non contrôlé.

```tsx
import { SwissAddressFields } from 'alpina-ui/swiss/swiss-address-form'

export function DeliveryFields() {
  return <SwissAddressFields locale="fr-CH" fields={['street', 'postalCode', 'locality', 'canton']}
    names={{ locality: 'town' }} />
}
```

Après quatre chiffres, `SwissAddressForm` propose la localité officielle et son canton. Le 6900 comprend Lugano, Massagno et Paradiso; Vulliens (1085) figure en FR et VD. Choisir une option remplit les deux champs. La saisie manuelle et les adresses existantes restent possibles, y compris pour les NPA administratifs absents du répertoire résidentiel.

`await lookupSwissPostalCode('6900')` renvoie des paires `{ locality, canton }`, ou une liste vide pour un NPA inconnu ou incomplet. La première recherche valide importe les données à la demande. Le portail les charge depuis la même origine sans transmettre d’adresse à un tiers. Le catalogue téléchargeable les inclut hors ligne.

L’édition du 1er novembre 2026 contient 3 177 NPA résidentiels suisses et 4 233 couples localité/canton. Alpina conserve les noms postaux, élimine les lignes communales en double et préserve les cantons aux frontières. Le sélecteur exclut le Liechtenstein. Le répertoire est mis à jour chaque mois. [Répertoire officiel des localités](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

**Source ©swisstopo.** Les conditions fédérales OGD autorisent l’adaptation, la redistribution et l’usage commercial avec attribution. Indiquez la source lors de l’affichage ou de la redistribution des suggestions dans une interface personnalisée. [Conditions d’utilisation](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices)

À la racine du dépôt, exécutez `python3 scripts/generate-postal-localities.py` pour régénérer le répertoire hors ligne avec la bibliothèque standard de Python. Le script vérifie le SHA‑256 du ZIP et produit un UTF‑8 reproductible. Pour une mise à jour, téléchargez l’archive CSV LV95, notez sa date et son empreinte, puis examinez les différences après génération. [CSV officiel](https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_2056.csv.zip) · [Fiche STAC](https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo-vd.ortschaftenverzeichnis_plz/items/ortschaftenverzeichnis_plz)

### Relier les erreurs d’un service

Renvoyez `{ fieldErrors }` depuis `onSave` de façon synchrone ou asynchrone. Les clés sont les champs de `SwissAddress` et les valeurs les messages dans la langue du formulaire. Les saisies restent visibles avec les messages associés. Modifier un champ efface uniquement son erreur. Si le focus a quitté le formulaire entre-temps, la réponse respecte sa nouvelle position.

```tsx
import { SwissAddressForm, type SwissAddress, type SwissAddressValidationResult } from 'alpina-ui'

type AddressService = {
  save: (address: SwissAddress) => Promise<void | SwissAddressValidationResult>
}

export function ShippingForm({ save }: AddressService) {
  return <SwissAddressForm locale="it-CH" onSave={save} />
}
```

Un service de livraison peut renvoyer `{ fieldErrors: { postalCode: 'La livraison est indisponible pour ce NPA.' } }` avec un texte traduit par l’application. Le formulaire vérifie déjà le format localement.

`initialValue?: Partial<SwissAddress>` est lu au montage initial. Pour une autre adresse, changez la `key` React. Modifier `locale` retraduit libellés et erreurs en conservant la saisie. Personnalisez les textes avec `labels?: Partial<SwissAddressLabels>`, par exemple `labels={{ submit: 'Confirmer l’adresse' }}`. `swissAddressLabels` couvre les quatre langues; la terminologie romanche suit celle des Grisons. [Formulaire cantonal en romanche](https://www.gr.ch/RM/instituziuns/administraziun/diem/hba/vender-dar-en-locaziun/tagungsraeume/Seiten/Reservationsanfrage.aspx)

### Échanger une adresse selon eCH-0010

Utilisez `format="ech-person"` ou `format="ech-organisation"` pour les adresses de rue selon eCH-0010 8.1.0. L’exemple utilise une organisation. Rue et numéro sont séparés, deux lignes complémentaires sont facultatives et le NPA suisse doit être compris entre 1000 et 9999 inclus. Le formulaire compact conserve cinq champs avec la rue sur une ligne. L’application décide du contrôle dans le répertoire postal. [Norme et schémas XML](https://www.ech.ch/de/ech/ech-0010/8.1.0)

| Champ | Maximum de caractères Unicode |
| --- | ---: |
| Prénom ou nom | 30 chacun |
| Nom de l’organisation | 60 |
| Lignes complémentaires 1 et 2 | 150 chacune |
| Rue | 150 |
| Numéro de bâtiment | 30 |
| Localité | 40 |

Pour une personne, `recipient` est le nom de famille et `firstName` est facultatif. Pour une organisation, `recipient` contient sa raison sociale. La première ligne peut désigner un destinataire chez un tiers et la deuxième un bâtiment. `locality` correspond à `town` dans le schéma. Le formulaire conserve le canton; l’objet d’échange inclut le code et le nom du pays. Les cases postales et adresses étrangères relèvent d’autres profils.

```tsx
<SwissAddressForm format="ech-organisation" locale="de-CH" onSave={address => {
  const payload = toEchMailAddress(address, 'ech-organisation')
  return savePostalRecord(payload)
}} />
```

`UidInput` accepte CHE suivi de neuf chiffres, groupés ou compacts. Le dernier suit le modulo 11 d’eCH-0108: 10 est inattribuable et un multiple de 11 donne 0. `CHE109322551` s’affiche `CHE-109.322.551`. Pour vérifier l’attribution, consultez le registre IDE. [eCH-0108](https://www.ech.ch/de/ech/ech-0108/6.0.0) · [Registre IDE de l’OFS](https://www.bfs.admin.ch/de/unternehmensidentifikation-uid)

## Assembler des champs

```tsx
import { CantonSelect, SwissPostalCodeInput } from "alpina-ui"

export function Address() {
  return (
    <fieldset>
      <legend>Adresse postale</legend>
      <label htmlFor="canton">Canton</label>
      <CantonSelect id="canton" name="canton" locale="it-CH" defaultValue="TI" />
      <label htmlFor="postal-code">NPA</label>
      <SwissPostalCodeInput id="postal-code" name="postalCode" required />
    </fieldset>
  )
}
```

`CantonSelect` soumet l’abréviation, par exemple `TI`, même après un changement de langue. Pour exiger un choix, utilisez `placeholder="Choisir un canton"` et `required`. `cantons` contient les noms en quatre langues dans l’ordre de la statistique fédérale. Chaque entrée expose `code` et `names[locale]`. [Atlas statistique](https://datavis.bfs.admin.ch/statatlas/maps/md-13.40/core/projects/13.40/xshared/pdf/134_131.pdf) · [Constitution fédérale](https://www.fedlex.admin.ch/eli/cc/1999/404/it) · [Carte des cantons en romanche](https://www.bk.admin.ch/dam/bk/de/dokumente/komm-ue/Buku2025/BUKU_2025_RM.pdf.download.pdf/BUKU_2025_RM.pdf)

`SwissPostalCodeInput` vérifie les quatre chiffres, y compris à l’envoi. `isSwissPostalCode(value)` applique la même règle à une chaîne. Le répertoire officiel permet de vérifier l’existence du NPA et sa concordance avec la localité. [Répertoire des localités](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

## Rechercher un canton en quatre langues

```tsx
import { CantonCombobox } from 'alpina-ui/swiss/canton-combobox'

export function CantonOfResidence() {
  return <CantonCombobox name="canton" label="Canton de domicile" locale="it-CH" required />
}
```

`CantonCombobox` recherche les abréviations et les noms dans les quatre langues, sans tenir compte des accents, de la casse ni des traits d’union. «Graubunden» renvoie «Grigioni», GR, dans une interface italienne. La langue détermine les libellés et noms proposés. Personnalisez `label`, `description`, `error`, `placeholder`, `noResults`, `clearLabel` et `requiredMessage`.

Les flèches parcourent la liste; Entrée ou un clic confirme. Échap, Tab et la perte de focus ferment la liste et rétablissent le choix confirmé. Effacer renvoie une chaîne vide. Le focus reste sur le champ et `aria-activedescendant` identifie l’option active. [Modèle WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

En mode contrôlé, fournissez `value` et `onCantonChange`, sinon `defaultValue`. Le type est `CantonCode | ''`. Avec `name`, `FormData` reçoit l’abréviation confirmée. `required` active la validation native du champ visible et `disabled` l’exclut de l’envoi. Une réinitialisation native rétablit la valeur initiale en mode non contrôlé.

## Monnaie et dates

```ts
import { formatCHF } from "alpina-ui/swiss/format-chf"
import { formatSwissDate } from "alpina-ui/swiss/format-swiss-date"

formatCHF(1250.50, "fr-CH")
formatSwissDate("2026-11-24", "rm-CH", { dateStyle: "long" })
formatSwissDate(new Date("2026-03-29T22:30:00Z"), "it-CH")  // 30 mars à Zurich
```

`formatCHF(amount, locale?)` prend un montant fini en francs et affiche deux décimales avec CHF à la position propre à la langue. L’allemand et l’italien groupent avec U+2019, le français avec l’espace fine insécable U+202F. Utilisez `bigint` pour les francs entiers dépassant la précision de `number`.

Par défaut, le montant est arrondi au centime. Pour les espèces, activez `cashRounding` sur `CurrencyCHF` ou passez `{ cashRounding: true }` en troisième argument de `formatCHF`. Les valeurs exactement à mi-chemin s’éloignent de zéro. Appliquez cet arrondi à cinq centimes une seule fois sur le total à payer. La valeur HTML conserve le montant initial. [Données Unicode](https://github.com/unicode-org/cldr/blob/release-48/common/supplemental/supplementalData.xml)

`formatSwissDate(value, locale?, options?)` accepte les dates grégoriennes `YYYY-MM-DD` (années 0001–9999) et les objets `Date`. Une date civile conserve son jour dans tous les fuseaux. Un instant utilise `Europe/Zurich` avec ses changements d’heure; spécifiez un autre fuseau IANA via `timeZone`. `dateStyle` accepte `short` (DD.MM.YYYY), `medium`, `long` et `full`. `formatSwissTime(instant, timeZone?)` utilise 24 heures; minuit s’écrit 00:00. Les dates invalides et les montants infinis lèvent `RangeError`.

La semaine commence le lundi. Activez `showWeekNumbers` pour afficher les numéros ISO. La grille de sept colonnes et le sélecteur tiennent dans 180 pixels CSS. Les abréviations des jours gardent leur nom complet pour les aides techniques. `isoWeek(day)` fournit le numéro et l’année ISO de la semaine, parfois différents de l’année civile autour du Nouvel An.

Pour les réservations, `dayStatus(date)` reçoit la date ISO et renvoie `available`, `full` ou `closed`. Les week-ends ont un fond distinct. Un trait continu, pointillé ou discontinu accompagne l’état annoncé dans la langue choisie. Les flèches atteignent les jours indisponibles sans changer la sélection à l’activation. `isDateDisabled(date)` et `disableHolidays` priment sur la disponibilité. Les jours fériés suivent le canton, la région et le régime choisis, demi-journées comprises.

```tsx
<DatePicker locale="fr-CH" canton="VD" disableHolidays name="appointment"
  isDateDisabled={date => clinicClosures.has(date)}
  dayStatus={date => capacity.get(date) === 0 ? 'full' : 'available'} />
```

## Planifier le travail autour des jours fériés

`swissHolidays(year, canton, options?)` renvoie les dates dans l’ordre chronologique. Les règles des 26 cantons vérifiées en novembre 2026 sont projetées sur l’année grégorienne demandée. Le droit historique, les salaires, les vacances scolaires et les fermetures propres à l’employeur nécessitent d’autres calendriers. Seul le 1er août est férié au niveau fédéral. Pâques, Pentecôte et Jeûne fédéral figurent comme dimanches nommés, avec le Jeûne genevois en septembre. [SECO](https://www.seco.admin.ch/dam/de/sd-web/x5LtHPJdNis5/Anhang-Feiertage-Schweiz-Auszug-ArG-ArGV1-5-SECO-SB-2024-DE.pdf) · [DFAE, fêtes de septembre](https://www.aboutswitzerland.eda.admin.ch/en/summer-festivals-and-customs)

```tsx
import { Calendar, DatePicker, addBusinessDays, swissHolidays } from 'alpina-ui'

const holidays = swissHolidays(2026, 'FR', { region: 'FR-reformed', locale: 'fr-CH' })
const collection = addBusinessDays('2026-04-02', 1, 'FR', { region: 'FR-reformed' })
// Le retrait a lieu le 7 avril 2026 après Vendredi saint, le week-end et le lundi de Pâques.

export function CollectionForm() {
  return <form>
    <Calendar canton="FR" holidayRegion="FR-reformed" locale="fr-CH" />
    <DatePicker canton="FR" holidayRegion="FR-reformed" locale="fr-CH" name="collection" defaultValue={collection} />
  </form>
}
```

Chaque entrée a un `id` stable, une `date` ISO, un `name` localisé, un `scope` et une `duration`. Le calendrier marque le jour, annonce la fête et indique son nom sous le mois. Ces jours restent sélectionnables. Plusieurs fêtes peuvent coïncider.

`addBusinessDays(start, amount, canton, options?)` compte du lundi au vendredi à partir du lendemain, ou à rebours depuis la veille pour une valeur négative. Zéro conserve la date. Les jours fériés entiers sont sautés; le 1er mai à Soleure, dont seul l’après-midi est férié, compte comme ouvrable. Le régime genevois de remplacement du dimanche pour les employeurs hors loi fédérale sur le travail n’est pas inclus. [Inspection de Soleure](https://so.ch/verwaltung/volkswirtschaftsdepartement/amt-fuer-wirtschaft-und-arbeit/arbeitsbedingungen/arbeitsinspektorat/feiertage) · [Loi genevoise, art. 1](https://silgeneve.ch/legis/data/rsg_j1_45.htm)

### Choisir entre calendrier légal et usuel

| Option | Contenu du calendrier | Exemple en Argovie |
| --- | --- | --- |
| `observance: 'statutory'` (par défaut) | Fêtes légales cantonales et régionales et dimanches nommés. | Le lundi de Pâques figure à Aarau et reste disponible à Bremgarten. |
| `observance: 'common'` | Ajoute pour la planification les fermetures récurrentes et documentées d’une journée, avec `scope: 'customary'`. | Les lundis de Pâques et de Pentecôte ainsi que la Saint-Étienne couvrent tout le canton. Le classement légal régional prévaut. |

Utilisez la même option pour `Calendar`, `DatePicker` et `addBusinessDays`. Le régime usuel sert à la planification. Le contrat et le calendrier de l’employeur déterminent le congé effectif. Les fêtes locales, ponts facultatifs, demi-journées accordées et jours de remplacement propres à l’employeur sont exclus.

| Territoire | Fermetures documentées d’une journée ajoutées au profil légal |
| --- | --- |
| AG, FR | 2 janvier, lundis de Pâques et de Pentecôte, 26 décembre. L’Argovie publie son calendrier de travail; Fribourg désigne ces quatre jours comme les fermetures les plus courantes. [Calendrier argovien](https://www.ag.ch/media/kanton-aargau/portal/jobs-karriere/anstellungsbedingungen-dokumente/sollarbeits-und-betriebszeit-2026.pdf) · [Service fribourgeois](https://www.fr.ch/travail-et-entreprises/employes/jours-feries) |
| LU, NW, OW, SO, ZG | Ces quatre dates figurent dans les calendriers de travail ou règles administratives. [Lucerne](https://personal.lu.ch/-/media/Personal/Dokumente/down_load/offentliche_dokumente/Anstellungsbedingungen_fuer_das_Staatspersonal.pdf) · [Nidwald, art. 28](https://gesetze.nw.ch/app/de/texts_of_law/171.1) · [Obwald](https://www.ow.ch/_docn/6325/Feiertage.pdf) · [Soleure](https://so.ch/fileadmin/internet/fd/fd-pa/Personalamt/03_Anstellungsbedingungen-GAV/20_Arbeitszeit/Sollarbeitszeit_2026_ohne_Vorholzeit.pdf) · [Zoug, § 13](https://bgs.zg.ch/api/de/versions/62/pdf_file) |
| NE | Lundis de Pâques, de Pentecôte et du Jeûne fédéral: jours de fermeture des commerces, sous réserve d’exceptions. [Neuchâtel](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) |
| VS | Vendredi saint, lundis de Pâques et de Pentecôte, 26 décembre selon le calendrier du personnel de l’État. [Valais](https://lex.vs.ch/data/172.4/fr) |
| ZH | 2 janvier (Berchtoldstag), observé par l’administration cantonale. [Office du personnel de Zurich](https://www.zh.ch/de/arbeiten-beim-kanton/fuer-hr-profis/handbuch-personalrecht/definition/arbeitszeit/grundlagen-zur-arbeitszeit.html) |
| Autres cantons | Les deux régimes suivent le même calendrier légal documenté. |

### Choisir la région de travail

Le code cantonal seul donne les jours communs à tout le canton. Un profil ajoute les calendriers locaux officiels ci-dessous. Un profil d’un autre canton lève `RangeError`.

| Profil | Territoire |
| --- | --- |
| `AG-aarau` | Aarau, Brugg, Kulm, Lenzburg, Zofingen et la commune de Bergdietikon |
| `AG-baden` | District de Baden hors Bergdietikon |
| `AG-bremgarten` | District de Bremgarten |
| `AG-laufenburg` | Districts de Laufenburg et Muri, ainsi que Hellikon, Mumpf, Obermumpf, Schupfart, Stein et Wegenstetten |
| `AG-rheinfelden` | Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen et Zuzgen |
| `AG-zurzach` | District de Zurzach |
| `FR-catholic`, `FR-reformed` | Zone légale du lieu de travail définie par le canton, indépendamment de la religion personnelle |
| `SO-outside-bucheggberg` | Soleure hors Bucheggberg. Le Bucheggberg utilise le résultat cantonal seul |
| `NE-le-landeron` | Le Landeron ajoute la Fête-Dieu |
| `AI-inner` | Le pays intérieur d’Appenzell Rhodes-Intérieures ajoute la Saint-Maurice |
| `OW-engelberg` | Engelberg ajoute la Saint-Benoît |

Les limites proviennent de la [loi argovienne sur le travail, § 6](https://gesetzessammlungen.ag.ch/app/de/texts_of_law/961.200), du [service de l’emploi fribourgeois](https://www.fr.ch/travail-et-entreprises/employes/jours-feries), de [l’arrêté neuchâtelois](https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf) et des indications d’[Appenzell Rhodes-Intérieures](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/) et d’[Obwald](https://www.ow.ch/_docn/6325/Feiertage.pdf).

### Vérifier la portée d’un jour férié

Le Tessin et le Jura prévoient des jours de repos officiels supplémentaires, dont le 29 juin au Tessin et le 23 juin dans le Jura. Un jour de repos cantonal peut rester ouvrable selon la loi fédérale sur le travail. À Zurich, le Knabenschiessen dépend de l’employeur. [Tessin](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1) · [Jura](https://rsju.jura.ch/fr/viewdocument.html?Download=1&id=38948&idn=9554&v=2) · [Autorité zurichoise](https://www.zh.ch/de/wirtschaft-arbeit/arbeitsbedingungen/arbeitsssicherheit-gesundheitsschutz/arbeits-ruhezeiten/feiertage.html)

Glaris décale la Näfelser Fahrt d’une semaine si elle tombe le Jeudi saint. Neuchâtel ne retient les 2 janvier et 26 décembre que s’ils tombent un lundi. Le Jeûne vaudois tombe le lundi suivant le troisième dimanche de septembre. [Glaris](https://www.gl.ch/portrait/naefelser-fahrt.html/207) · [Neuchâtel](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) · [Vaud](https://www.vd.ch/formation/jours-feries-et-vacances-scolaires/jours-feries-et-vacances-scolaires-2026)

Les calendriers cantonaux précisent aussi les différences entre cantons voisins. [Lucerne](https://srl.lu.ch/app/de/texts_of_law/855) · [Uri](https://www.ur.ch/_docn/404812/%C3%9Cbersicht_Feiertage_Kanton_Uri_gem._ArG_und_LSG.pdf) · [Schwytz](https://www.sz.ch/public/upload/assets/71606/Kantonale_lokale_und_nationale_Feiertage.pdf) · [Nidwald](https://gesetze.nw.ch/app/de/texts_of_law/921.1) · [Zoug](https://zg.ch/de/migration-integration/neu-in-zug/gut-zu-wissen) · [Thurgovie](https://www.rechtsbuch.tg.ch/app/de/change_documents/80) · [Grisons](https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file)

## Données linguistiques des dates et des monnaies

Les formateurs réutilisés dans le navigateur et sur le serveur utilisent `Intl`. Pour l’allemand, le français et l’italien, la langue choisie précède les variantes suisses disponibles. La version des données peut influer sur la ponctuation. Les noms de cantons et de langues proviennent du jeu de données fourni. [API ECMAScript](https://tc39.es/ecma402/2026/#locale-and-parameter-negotiation)

Si le moteur manque de données romanches, Alpina utilise CLDR 48 pour le CHF et le calendrier grégorien. `2026-04-05` au format `full` donne *dumengia, ils 5 d’avrigl 2026*. `Intl` continue d’assurer l’arrondi et la conversion de la date dans le fuseau demandé. Importer uniquement le formateur CHF exclut les noms de mois et de jours. La licence Unicode-3.0 figure dans `UNICODE-LICENSE.txt`. [CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Licence Unicode](https://github.com/unicode-org/cldr/blob/release-48/LICENSE)

## Citer un texte suisse

Définissez la langue sur le conteneur le plus proche, par exemple `<p lang="fr-CH"><q>Bonjour</q></p>`. Le thème utilise des guillemets doubles à l’extérieur et simples pour un `q` imbriqué. Le français insère une espace fine insécable à l’intérieur des marques, contrairement aux trois autres langues. L’allemand suit l’orthographe suisse. [Instructions de la Chancellerie fédérale](https://www.bk.admin.ch/de/schreibweisungen)

## Limiter le sélecteur à deux langues

`<LocaleSelect locales={['it-CH', 'de-CH']} value={language} onLocaleChange={setLanguage} />` affiche les deux langues sous leur nom propre, dans l’ordre demandé. En mode contrôlé, `value` doit figurer parmi les choix. Le même état peut alimenter les composants et les textes de l’application. Pour trier des noms dans une table bilingue, utilisez `Intl.Collator(language)` dans le comparateur.

## Filtrer sur tous les cantons

`CantonSelect allLabel="Tous les cantons"` permet de revenir à tous les cantons après une sélection. En allemand, utilisez «Alle Kantone». `event.currentTarget.value` dans `onChange` fournit l’abréviation ou la chaîne vide. `onCantonChange` ne transmet que les codes cantonaux. `allLabel` prime sur `placeholder`. Sans `allLabel`, le texte indicatif garde son comportement habituel.
## Comptes bancaires, numéros AVS et téléphones

`IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` et `SwissPostalCodeInput` acceptent `onValueChange(value, { normalized, valid })`. Le premier argument suit le texte éditable, y compris le formatage à la sortie du champ. `onChange` signale toujours la frappe. Pour `0791234567`, la valeur normalisée est `+41791234567`; à la sortie, le texte devient `+41 79 123 45 67` avec la même valeur normalisée.

`normalized` correspond au résultat valide de Standard Schema. Une entrée vide ou invalide donne `null`. `valid` vérifie format, chiffre de contrôle et caractère obligatoire. Un champ facultatif vide est valide.

```tsx
<PhoneInput name="phone" defaultValue="0791234567" onValueChange={(display, details) => {
  setPhoneLabel(display)
  setContactNumber(details.normalized)
}} />
```

Utilisez `IbanInput` pour les comptes CH et LI de 21 caractères. `isSwissIban` contrôle le pays, la structure et les chiffres modulo 97. `compactIban` prépare la valeur validée pour le stockage. La clé confirme la structure; le titulaire du compte exige une vérification distincte. [Guide SIX](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html)

`AhvInput` vérifie le préfixe 756 et le chiffre EAN‑13 puis groupe les treize chiffres. `PhoneInput` accepte neuf chiffres nationaux, le préfixe national ou +41 et 0041. Les deux formatent les valeurs valides à la sortie et conservent les brouillons invalides. Utilisez `validationMessage` pour les erreurs traduites et les validateurs exportés à l’envoi. [Centrale de compensation](https://www.zas.admin.ch/de/ahv-nummer-identifikator) · [Numérotation de l’OFCOM](https://www.bakom.admin.ch/de/telefonnummern)

`SwissQrBill` affiche la section paiement et le récépissé. Le guide explique les références, les adresses structurées et l’impression. [Guide de la QR-facture](https://alpina-ui.vercel.app/docs/guides/qr-bill/)

## Éditer des traductions

`MultilingualField` rassemble les quatre langues nationales dans un formulaire. Une traduction est complète dès qu’elle contient autre chose que des espaces. Chaque éditeur indique sa langue pour l’orthographe et la prononciation. Les onglets restent montés; l’envoi natif comprend aussi les traductions vides.

```tsx
<MultilingualField name="title" label="Titre de l’exposition" sourceLanguage="de"
  defaultValue={{ de: 'Die neue Typografie' }} includeEnglish />
```

Lisez `formData.get('title[fr]')` dans le gestionnaire d’envoi ou une Server Action. Choisissez `layout="columns"` pour comparer ou `variant="textarea"` pour les textes longs. La copie remplit une destination vide. `value` et `onValueChange` contrôlent le formulaire; `labels` traduit décomptes, états et actions. Le comptage utilise les grappes de graphèmes si disponibles.

## Imprimer une lettre commerciale

`Letter` imprime en A4 et accepte expéditeur et destinataire sous forme de lignes, `SwissQrAddress` ou `EchMailAddress`. Réutilisez les lignes avec `addressLines(address, locale)`. Une adresse suisse se termine par le NPA et la localité. Les organisations, contacts eCH, appartements, cases postales et noms de pays étrangers fournis sont conservés. Une adresse QR étrangère utilise le nom localisé du pays ou, à défaut, son code ISO. [Exemples de la Poste](https://www.post.ch/en/sending-letters/addressing-and-designing/addressing-consignments-correctly)

Fournissez objet, date et corps de la lettre. Choisissez `windowPosition="left"` ou `"right"` selon l’enveloppe. Les mesures ci-dessous, en millimètres depuis le coin supérieur gauche, reprennent les profils historiques publics SN et SNleft de KOMA-Script. [KOMA-Script, tableau 4.19](https://mirrors.mit.edu/CTAN/macros/latex/contrib/koma-script/doc/scrguide-en.pdf) · [Gabarits de la Poste](https://www.post.ch/en/sending-letters/addressing-and-designing/designing-and-packaging-letters)

| Champ d’adresse | Gauche | Haut | Largeur | Hauteur |
| --- | --- | --- | --- | --- |
| Fenêtre à gauche | 20 | 35.5 | 100 | 45 |
| Fenêtre à droite | 112 | 45 | 90 | 45 |

Les repères de pli commencent à 3,5 mm du bord gauche, à 105 et 210 mm du haut. Utilisez `foldMarks={false}` pour d’autres plis. Limitez les lignes à la fenêtre et vérifiez une feuille dans l’enveloppe réelle. Les pages suivantes conservent la même colonne de texte.

SWITEC indique le retrait de SN 010130:2010 le 12 décembre 2016. SN 10130:2026-02 est une édition distincte. Les mesures ci-dessus identifient les profils historiques implémentés et testés par Alpina. [Programme suisse de normalisation](https://www.switec.info/media/2025-08_swiss_national_workprogram.pdf) · [Norme actuelle](https://www.dinmedia.de/en/standard/sn-10130/400500596)

Ouvrez le dialogue d’impression depuis une action utilisateur avec `printSwissDocument(articleRef.current)`. La fonction isole le document monté et restaure l’application après fermeture. Imprimez en A4 à taille réelle sans en-têtes ni pieds de page du navigateur. [Exemple de lettre](https://alpina-ui.vercel.app/docs/components/letter/)

### Quantités et montants CHF sur facture

Fournissez `quantity` et `unitPrice` hors TVA comme nombres ou chaînes avec point décimal, jusqu’à quatre décimales. `unit` suit la quantité localisée, par exemple `{ description: 'Relecture', quantity: '2.5', unit: 'h', unitPrice: '80.00', vatRate: 8.1 }`; pour une surface, utilisez `unit: 'm²'`. Prix unitaires, montants de ligne et totaux affichent deux décimales. Le calcul conserve le prix convenu en entier et arrondit une seule fois le produit au centime. L’attribut HTML `data` garde les décimales d’origine du prix. [Exemple de facture](https://alpina-ui.vercel.app/docs/components/invoice-document/)

## Valider côté serveur

Alpina expose neuf validateurs Standard Schema sans dépendances avec erreurs localisées et sorties typées. Le guide inclut les intégrations et une Server Action Next.js exécutable. [Validation suisse](https://alpina-ui.vercel.app/docs/guides/validation/)

### Afficher les totaux en centimes

Passez `calculateInvoiceTotals(lines).totalCents` directement à `formatCentimes(cents, locale)`. Par exemple, `formatCentimes(8005, 'it-CH')` affiche CHF 80.05. La fonction accepte les entiers sûrs et les entiers de précision arbitraire (`bigint`). Utilisez `formatCHF` lorsque le montant de départ est déjà en francs.
