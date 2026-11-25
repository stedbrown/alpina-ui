# Premiers pas

Alpina UI 1.0.0-rc.3 comprend 97 composants React installables et cinq pages à copier. Le paquet fournit les modules ESM, les déclarations TypeScript, les feuilles de style et les sources modifiables. Les guides de démarrage et des interfaces suisses existent aussi en français, allemand et italien. Le formulaire d’adresse fournit libellés et messages d’erreur dans les quatre langues nationales.

<!-- alpina-download -->

Avant l’installation, cherchez un composant, copiez une page ou essayez le carnet d’adresses bilingue. Vous pouvez changer de langue pendant la modification d’un contact. [Composants](https://alpina-ui.vercel.app/docs/components/) · [Pages à copier](https://alpina-ui.vercel.app/blocks/) · [Carnet d’adresses bilingue](https://alpina-ui.vercel.app/examples/bilingual-address-book/)

## Installer le paquet

Si votre application utilise shadcn/ui, le guide explique comment conserver les deux bibliothèques, intégrer Tailwind v4 et migrer chaque famille de composants. [Passer de shadcn/ui à Alpina](https://alpina-ui.vercel.app/docs/guides/migration/)

Dans un projet React 18.2 ou 19 utilisant Node.js 20 ou ultérieur, installez l’archive versionnée depuis le portail.

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-1.0.0-rc.3.tgz
```

Si vous avez téléchargé l’archive, exécutez `npm install ./alpina-ui-1.0.0-rc.3.tgz` dans son répertoire. Importez le CSS une seule fois au point d’entrée de l’application. Les modules JavaScript peuvent aussi s’exécuter côté serveur.

```tsx
import "alpina-ui/styles.css"
import { CurrencyCHF, SwissDate } from "alpina-ui"

export function Summary() {
  return (
    <p>
      <CurrencyCHF amount={1280.5} locale="fr-CH" />
      {" · "}
      <SwissDate value="2026-11-24" locale="fr-CH" />
    </p>
  )
}
```

## Inclure un seul composant

Pour réduire la taille du bundle, importez le module et la feuille de style du composant. Elle contient les règles de ses dépendances. Importez le thème une fois. Les fonctions de formatage pures fonctionnent sans CSS.

```tsx
import "alpina-ui/theme.css"
import "alpina-ui/styles/button.css"
import { Button } from "alpina-ui/ui/button"

export function Confirm() {
  return <Button type="submit">Confirmer</Button>
}
```

## Copier les sources dans le projet

Une fois le paquet installé, la CLI fonctionne hors ligne. `list` affiche les noms du registre. `add` copie dans `components/alpina` les fichiers choisis, leurs dépendances, le thème et sa licence, et conserve vos modifications. La commande facultative `init` copie le thème et sa licence.

```sh
npx --no-install alpina list
npx --no-install alpina add button icon canton-select
npx --no-install alpina add dialog --dir src/components/alpina --dry-run
npx --no-install alpina add --all
```

Importez le thème depuis `./components/alpina/theme.css` et les composants depuis des chemins comme `./components/alpina/ui/button` ou `./components/alpina/swiss/canton-select`, relatifs au fichier importateur. Chaque TSX importe son CSS et demande un outil de compilation compatible CSS et TypeScript. Les imports relatifs `.js` suivent la convention NodeNext.

Pour copier une page, exécutez `npx --no-install alpina add block/dashboard`. Le fichier `components/alpina/blocks/dashboard.tsx` utilise les imports publics et accepte vos données de facturation. Chargez `alpina-ui/styles.css` une seule fois dans l’application. [Aperçu du tableau de bord](https://alpina-ui.vercel.app/blocks/dashboard/)

Pour un lien vers le dépôt, placez `<Icon name="git-branch" size={18} />` à côté du texte. `iconNames` répertorie les noms disponibles. [Icônes](https://alpina-ui.vercel.app/icons/) · [Référence Icon](https://alpina-ui.vercel.app/docs/components/icon/)

## Personnaliser le thème

Les classes commencent par `al-`. Appliquez le thème sombre à toute l’application ou à une section. Les polices par défaut sont Helvetica Neue, Helvetica, Arial et la sans-sérif système. Importez `alpina-ui/fonts.css` pour héberger Inter localement. Chargez vos variables après le thème. L’éditeur permet de régler l’accent et la grille, vérifier le contraste et copier le CSS. [Design](https://alpina-ui.vercel.app/docs/guides/design/) · [Éditeur de thème](https://alpina-ui.vercel.app/themes/)

```tsx
<section data-al-theme="dark">
  <Button>Enregistrer</Button>
</section>
```

```css
.my-app {
  --al-accent: #eb0000;
  --al-on-accent: white;
  --al-radius: 0;
  --al-font: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

## Définir la langue de l’interface

Entourez un sous-arbre d’un `AlpinaProvider` pour en partager la langue. Une prop `locale` explicite prime sur le fournisseur le plus proche, et un fournisseur imbriqué prime sur son parent. Les composants disposant de textes anglais acceptent aussi `en`. Les fonctions pures, y compris dans les Server Actions, reçoivent toujours la langue en argument positionnel. Si vous copiez les sources avec la CLI, importez le fournisseur depuis `swiss/alpina-provider` dans le même répertoire de destination que les composants copiés.

```tsx
import { AlpinaProvider, FileInput } from "alpina-ui"

export function Attachments() {
  return <AlpinaProvider locale="it-CH"><FileInput name="attachments" /></AlpinaProvider>
}
```

## Exécution et accessibilité

L’exemple Next.js 16 affiche deux factures publiques sous `/invoices/[id]` avec Cache Components. La page fournit les identifiants via `generateStaticParams()`, attend les paramètres côté serveur et transmet les données à `InvoiceDocument`. Un petit composant client gère l’impression. Pour les factures privées, lisez et autorisez la requête côté serveur derrière une limite Suspense. [Route des factures](https://github.com/stedbrown/alpina-ui/tree/main/integrations/next-app-router/app/invoices) · [Routage Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

Trois projets exécutables vérifient une Server Action Next.js, des liens React Router et un formulaire React Hook Form avec schéma Zod. Chacun comprend une compilation de production et un test navigateur. [Projets et installation](https://github.com/stedbrown/alpina-ui/tree/main/integrations)

Les contrôles utilisent le HTML natif. Les composants interactifs accèdent au navigateur après hydratation. Les fenêtres modales utilisent `HTMLDialogElement.showModal()`. Avec les React Server Components, placez `"use client"` dans les composants qui gèrent un état interactif, des rappels ou des render props. Vous pouvez importer `formatCHF` et `formatSwissDate` sur le serveur.

Testez les parcours complets avec vos libellés, traductions et couleurs. Le projet comprend des tests automatiques du clavier et du focus pour les composants interactifs.
