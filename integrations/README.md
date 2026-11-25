# Framework integration projects

These three applications consume the ESM and CSS inside the same npm tarball that ships to users. Each application has its own entry point, manifest, production build and browser scenario. The integration workspace shares one lockfile. Use Node 24, npm and Chromium.

From the repository root, run:

```sh
npm ci
npm run build
npx --no-install playwright-core install chromium
npm run test:integrations
```

The command packs the current build, unpacks it into the ignored `.alpina` directory, installs the locked framework dependencies, builds all three projects and tests their production servers on loopback. To run one interactively after this setup:

```sh
npm run dev --prefix integrations --workspace next-app-router
npm run dev --prefix integrations --workspace vite-react-router
npm run dev --prefix integrations --workspace swiss-form
```

To copy a project out of the repository, change its `alpina-ui` dependency from `file:../.alpina` to the path of a release tarball. For the Next.js example also remove the `turbopack.root` setting that identifies this workspace.

## Next.js App Router

The billing page reads a language cookie and renders the invoice amount on the server. A small client form uses React’s `useActionState` and Alpina’s native language selector. Its Server Action validates the submitted locale and stores the choice in an HTTP-only cookie. The browser test checks both successful submission and rejection of an unsupported locale, then reloads the page to verify persistence. [Next.js Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data)

## Vite and React Router

The invoice register uses real URLs and route parameters. Both `TextLink asChild` and `Button asChild` compose with the router’s `Link`. The browser test follows a link without reloading, refreshes the detail URL, navigates back and opens an unknown invoice. A deployed static host needs a fallback to `index.html` for client-side routes. [React Router routing](https://reactrouter.com/start/declarative/routing)

## React Hook Form and Zod

The supplier form connects controlled `UidInput` and `IbanInput` components to React Hook Form through `Controller`. The Zod schema uses Alpina's checksum validators and transforms accepted values into a formatted UID and compact IBAN. The form uses associated labels and error messages, focuses the first invalid field and shows only the account’s final four characters after validation. The browser test exercises the invalid and successful paths. [React Hook Form Controller](https://react-hook-form.com/docs/usecontroller/controller) · [Zod schemas](https://zod.dev/basics)

## React peer compatibility

Run either CI row locally after building the library and installing Chromium.

```sh
npm run test:react-matrix -- minimum
npm run test:react-matrix -- latest
```

Each row queries npm for the first or last stable version shared by React and React DOM in Alpina's declared peer range. It logs the exact version and package integrity, installs the tarball into a temporary copy of the three projects with strict peer resolution, and builds production bundles. Tests check that Alpina and its consumers resolve the same peer instances and read the running browser versions before exercising each application.

| Production scenario | Minimum (18.2.0) | Latest supported stable (19.x) |
| --- | --- | --- |
| Next Pages Router | Request-time SSR and hydrated payment interaction | Same |
| Next App Router | Server Components and Server Actions with Next's managed runtime | Same |
| Vite and React Router | Router 7.18.7, navigation and refresh | Router 8, navigation and refresh |
| React Hook Form and Zod | Field errors, focus and valid submission | Same |

The Next project includes a Pages Router payment route at `/peer`. The server response and hydrated page report the installed React and React DOM versions independently. The App Router uses a framework-managed React build, and the billing form uses `useActionState`. Both rows exercise its server-action tests in addition to the version-checked Pages Router scenario. React Router 8 requires React 19.2.7 or newer. The minimum row therefore installs the React 18-compatible router and React 18 type definitions. [Next.js React support](https://nextjs.org/blog/next-15#react-19) · [React Router 8 package requirements](https://registry.npmjs.org/react-router/8.5.3)
