# Getting started

Alpina UI 0.6.0 includes 78 React components distributed as ESM modules with TypeScript declarations, stylesheets, and editable source. The catalog and guides are in English. The address form provides field labels and error messages in all four Swiss national languages. Other components accept strings from your application.

<!-- alpina-download -->

## Install the package

In a React 18.2 or 19 project with Node.js 20 or later, download the package from the portal, move `alpina-ui-0.6.0.tgz` to the project root, and install it.

```sh
npm install ./alpina-ui-0.6.0.tgz
```

Import the CSS once at your application entry point. The JavaScript modules can also run during server rendering. They leave stylesheet loading to your application.

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
npx --no-install alpina add button canton-select
npx --no-install alpina add dialog --dir src/components/alpina --dry-run
npx --no-install alpina add --all
```

With copied sources, import the theme from `./components/alpina/theme.css` and components from paths such as `./components/alpina/ui/button` or `./components/alpina/swiss/canton-select`. Adjust the paths relative to the importing file. Each TSX file imports its own CSS and needs a bundler with CSS and TypeScript support. Relative `.js` imports follow the NodeNext convention.

## Customize the theme

Library classes use the `al-` prefix. Apply the dark theme to an entire app or to one section. To customize the design, load your variables after the theme. The type stack starts with Helvetica Neue and Helvetica, followed by Arial and the system sans serif. The design guide explains the type roles and grid dimensions.

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

Form controls use native HTML elements. Interactive components use the browser after hydration. Modals use `HTMLDialogElement.showModal()`. In frameworks with React Server Components, place `"use client"` in application components that manage interactive state, callbacks, or render props. You can import `formatCHF` and `formatSwissDate` in server code.

Test complete application flows with your labels, translations, and theme colors. The project includes automated keyboard and focus tests for interactive components.
