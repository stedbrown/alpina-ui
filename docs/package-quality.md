# Package quality

The [component status directory](https://alpina-ui.vercel.app/status/) lists the API maturity and last implementation change for every registry entry. Stable components have an established API. Beta marks a public API that may still change as consumers exercise it. New entries start in Beta. Maintainers review the stage when changing the documented API.

Dates cover the registry entry and its transitive source files, including the individual component styles. The global theme and license texts are excluded. The checked-in dates survive shallow or source-only builds. After editing source, run `npm run build` and `npm run status:update`. The updater reads committed dates from Git, uses the current Swiss civil date for pending changes, and preserves the dates of unchanged source fingerprints.

## Transfer budgets

Run `npm run test:package-quality` after building. Each public subpath has a ceiling for initial JavaScript, deferred JavaScript, and component CSS. Figures are gzip bytes after esbuild minification, with React and React DOM external. Initial JS includes static chunk imports. Deferred JS counts the remaining chunks, including optional datasets. CSS is the individual compiled component sheet; the shared theme is loaded separately. The Button check also builds a named import from the root barrel and inspects the modules contributing bytes to every output.

CI builds a Button-only Vite application against the packed library, verifies every emitted asset, and records Chromium’s requests through activation. It produces one HTML document and one JavaScript asset. The single-file esbuild root import and the split esbuild component subpath both emit one JavaScript file. With chunk splitting enabled, esbuild 0.25 also treats the root barrel’s postal dynamic import as an independent entry point. Its unreferenced postal file stays on disk. The Button entry has no import edge to it. For an esbuild project deploying all files in its output directory, use `alpina-ui/ui/button` to avoid emitting that file. [esbuild's code-splitting model](https://github.com/evanw/esbuild/blob/main/docs/architecture.md#code-splitting)

The ceilings live in `scripts/component-budgets.json`. Investigate unexpected changes before increasing them. For an intentional change, `npm run size:record -- component-slug` records only the named component, allowing 10% headroom rounded up to 64 bytes. An entry with no deferred code has a zero-byte deferred budget.

## React Server Components

The integration job builds and tests the packed library in three production applications. It then runs `node integrations/rsc-contract.mjs` to generate a temporary Next.js App Router fixture. An actual production build prerenders a server page that imports each public entry through its subpath and the root barrel. The page checks client references and server values before rendering; CI requires the completed static HTML. Interactive leaves retain their client directives in the published ESM. Components accepting render props or event callbacks can be composed inside an application client component. [Integration setup](https://github.com/stedbrown/alpina-ui/tree/main/integrations)
