# Getting started

Alpina UI 0.10.0 includes 88 installable React component entries and four copyable pages. The package contains ESM modules, TypeScript declarations, stylesheets and editable source. The catalog and guides are in English. The address form provides field labels and error messages in all four Swiss national languages.

<!-- alpina-download -->

Find a component by name, copy a complete page, or try a working example before installing. The Italian–German address book lets you switch languages halfway through editing a contact. [Browse components](https://alpina-ui.vercel.app/docs/components/) · [Copyable blocks](https://alpina-ui.vercel.app/blocks/) · [Bilingual address book](https://alpina-ui.vercel.app/examples/bilingual-address-book/)

## Install the package

If your application uses shadcn/ui, the migration guide shows how to keep both libraries in one project, connect Tailwind v4, and port each component family. [From shadcn/ui to Alpina](https://alpina-ui.vercel.app/docs/guides/migration/)

In a React 18.2 or 19 project with Node.js 20 or later, install the versioned package directly from the portal.

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-0.10.0.tgz
```

If you downloaded the archive first, run `npm install ./alpina-ui-0.10.0.tgz` in the directory that contains it. Import the CSS once at your application entry point. The JavaScript modules can also run during server rendering.

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

## Include a single component

For a smaller bundle, import the component module and its stylesheet. Component CSS includes the rules for its dependencies. Import the theme once. Pure formatters work without stylesheets.

```tsx
import "alpina-ui/theme.css"
import "alpina-ui/styles/button.css"
import { Button } from "alpina-ui/ui/button"

export function Confirm() {
  return <Button type="submit">Confirm</Button>
}
```

## Copy source files into your project

Once you install the package, the CLI works offline. `list` shows registry names. `add` copies the selected files, their dependencies, the theme, and the license notice to `components/alpina`. It preserves files you have edited. The optional `init` command copies the theme and its license notice.

```sh
npx --no-install alpina list
npx --no-install alpina add button icon canton-select
npx --no-install alpina add dialog --dir src/components/alpina --dry-run
npx --no-install alpina add --all
```

With copied sources, import the theme from `./components/alpina/theme.css` and components from paths such as `./components/alpina/ui/button` or `./components/alpina/swiss/canton-select`. Adjust the paths relative to the importing file. Each TSX file imports its own CSS and needs a bundler with CSS and TypeScript support. Relative `.js` imports follow the NodeNext convention.

To copy a complete page, run `npx --no-install alpina add block/dashboard`. The resulting `components/alpina/blocks/dashboard.tsx` uses the public package imports and accepts your invoice data. Load `alpina-ui/styles.css` once in the application. [Dashboard preview](https://alpina-ui.vercel.app/blocks/dashboard/)

For a repository link, place `<Icon name="git-branch" size={18} />` beside the link text. The `iconNames` export lists every available name. [Browse icons](https://alpina-ui.vercel.app/icons/) · [Icon reference](https://alpina-ui.vercel.app/docs/components/icon/)

## Customize the theme

Library classes use the `al-` prefix. Apply the dark theme to an entire app or to one section. The default type stack starts with Helvetica Neue and Helvetica, followed by Arial and the system sans serif. Import `alpina-ui/fonts.css` to self-host Inter across platforms. Load custom variables after the theme. You can preview an accent, change the grid unit, check text contrast and copy the CSS in the theme builder. [Design guide](https://alpina-ui.vercel.app/docs/guides/design/) · [Theme builder](https://alpina-ui.vercel.app/themes/)

```tsx
<section data-al-theme="dark">
  <Button>Save</Button>
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

## Runtime and accessibility

Three runnable projects exercise this package with a Next.js Server Action, React Router links and a React Hook Form backed by a Zod schema. Each includes a production build and a browser test. [Integration projects and setup](https://github.com/stedbrown/alpina-ui/tree/main/integrations)

Form controls use native HTML elements. Interactive components use the browser after hydration. Modals use `HTMLDialogElement.showModal()`. In frameworks with React Server Components, place `"use client"` in application components that manage interactive state, callbacks, or render props. You can import `formatCHF` and `formatSwissDate` in server code.

Test complete application flows with your labels, translations, and theme colors. The project includes automated keyboard and focus tests for interactive components.
