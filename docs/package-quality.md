# Package quality

The [component status directory](https://alpinaui.com/status/) lists the API maturity and last implementation change for every registry entry. Stable components have an established API. Beta marks a public API that may still change as consumers exercise it. New entries start in Beta. Maintainers review the stage when changing the documented API.

Dates cover the registry entry and its transitive source files, including the individual component styles. The global theme and license texts are excluded. The checked-in dates survive shallow or source-only builds. After editing source, run `npm run build` and `npm run status:update`. The updater reads committed dates from Git, uses the current Swiss civil date for pending changes, and preserves the dates of unchanged source fingerprints.

The declaration report tracks changes to the public package contract. Review the compatibility and deprecation policy before changing a component’s signature. [API stability](https://github.com/stedbrown/alpina-ui/blob/main/docs/api-stability.md)

## Transfer budgets

Run `npm run test:package-quality` after building. Each public subpath has a ceiling for initial JavaScript, deferred JavaScript, and component CSS. Figures are gzip bytes after esbuild minification, with React and React DOM external. Initial JS includes static chunk imports. Deferred JS counts the remaining chunks, including optional datasets. CSS is the individual compiled component sheet; the shared theme is loaded separately. The Button check also builds a named import from the root barrel and inspects the modules contributing bytes to every output.

CI builds Button from the package root in esbuild, Vite and Next.js. The split esbuild build emits exactly one JavaScript file. Vite emits one document and one JavaScript file. Chromium verifies the button works and records every request. Next prerenders the button and the check scans both server and client deployment assets for postal data.

Address autocompletion uses the packaged swisstopo directory offline. Vite, webpack and Turbopack load its separate module on the first four-digit lookup. Raw esbuild treats a dynamic import as an additional entry even when the importing component is discarded. Alpina therefore uses a tree-shakable static directory in its default resolution. A zero-config esbuild address app includes the data in its address bundle, while a Button-only app omits it entirely. To defer the directory in an esbuild entry that uses address lookup, set `conditions: ['alpina-postal-chunk', 'module']` and enable ES module splitting. The hosted portal uses this mode. [esbuild code splitting](https://github.com/evanw/esbuild/blob/main/docs/architecture.md#code-splitting)

The ceilings live in `scripts/component-budgets.json`. Investigate unexpected changes before increasing them. For an intentional change, `npm run size:record -- component-slug` records only the named component, allowing 10% headroom rounded up to 64 bytes. An entry with no deferred code has a zero-byte deferred budget.

## React Server Components

The integration job builds and tests the packed library in three production applications. It then runs `node integrations/rsc-contract.mjs` to generate a temporary Next.js App Router fixture. An actual production build prerenders a server page that imports each public entry through its subpath and the root barrel. The page checks client references and server values before rendering; CI requires the completed static HTML. Interactive leaves retain their client directives in the published ESM. Components accepting render props or event callbacks can be composed inside an application client component. [Integration setup](https://github.com/stedbrown/alpina-ui/tree/main/integrations)

## Portal performance

Use Node 22.19 or newer and install Chromium for the audit. Build the portal with `npm run catalog`, then run `npm run test:performance`. CI audits the homepage, Button reference and login block on Lighthouse's standard simulated mobile and desktop profiles. Each cold navigation must reach a performance score of at least 95, accessibility of 100 and an unrounded cumulative layout shift of exactly zero. The reports record LCP and total blocking time. A separate touch session measures INP with the official web-vitals library while changing appearance, opening the Code view and revealing a password. These scripted samples describe the tested interactions. A field percentile requires measurements from real visits. CI uploads the full Lighthouse reports and the interaction results. [Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) · [Interaction to Next Paint](https://web.dev/articles/inp)

The public portal preloads the self-hosted Latin Inter file with anonymous CORS before its stylesheet. An optional font display prevents a late swap when the connection is slow. The extended Latin subset remains available on demand. Component previews and page blocks ship their initial rendered markup and React hydrates it in place. [Preloading optional fonts](https://web.dev/articles/preload-optional-fonts)
