# Public API stability

The component status directory records the maturity of each registry entry and the date its implementation last changed. A change of date alone does not require a migration. Check the release notes when upgrading a package or adopting new component source. [Component status](https://alpina-ui.vercel.app/status/) · [Upgrade guide](https://alpina-ui.vercel.app/docs/guides/release/)

| Stage | What a consumer can depend on | Examples |
| --- | --- | --- |
| Stable | Documented imports, prop meanings, defaults, ref targets, form values and keyboard behavior receive compatibility review. | Button and SwissAddressForm |
| Beta | Consumers can use the documented API in production, but a minor pre-1.0 release may revise it. The changelog explains how to migrate. | QrBillScanner and FileInput |
| Deprecated | An exported symbol or prop remains usable during its announced migration window. Its declaration carries an `@deprecated` tag with the replacement. | Consult the report for active deprecation tags. |

The support boundary covers root exports, documented component and Swiss helper subpaths, CSS entry points, named theme properties, component and block CLI names, and documented registry operations. Imported helper types that shape public props receive the same review as the props themselves. Internal files, generated chunk names, incidental DOM nesting, private selectors and individual screenshot pixels can change between versions. For copied components, `alpina diff` shows how the installed source differs from your edited files.

## Versioning and deprecation

During 0.x, patches fix defects and preserve documented signatures. A minor release can add functionality or make an announced incompatible change. For a stable API, the normal migration window is at least one complete minor release: introduce the replacement and mark the old name, let both work for that release, then announce the earliest removal. An urgent correctness or security fix can shorten the window. Document its impact and migration in the release notes.

Starting at 1.0, patches preserve the public contract, minor versions add backward-compatible features and deprecations, and a breaking change to the stable API requires a new major version. Deprecate a stable API in a minor release, keep it throughout that major version and remove it no earlier than the following major. A beta surface must be explicitly marked experimental at its entry point before a consumer adopts it. Changing the status of an established stable API does not waive its compatibility guarantee. [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)

## Reviewing a change

1. Run `npm run build` and `npm run api:check`. The checker reads emitted TypeScript declarations and their local type dependencies, including overloads, generic constraints, ref types and deprecation tags. It also records client boundaries, package entry points, CLI usage, registry names and theme property names.
2. For an intentional change, run `npm run api:update` and read the diff in `etc/alpina-ui.api.md`. Check both the named component subpath and the package root. When changing behavior behind a compatible signature, add a regression through a normal consumer entry point.
3. Add a new changelog bullet beginning with `- **Public API** ` and describe the effect on consumers. For a replacement, give the old name, new name and earliest removal version. During push and pull request checks, CI compares the report with the base commit and verifies that the changelog gained an API note.

The report captures the type and packaging contract. Localized wording, focus order, file submission, layout and print output also need runtime tests. [Reviewed declaration report](https://github.com/stedbrown/alpina-ui/blob/main/etc/alpina-ui.api.md) · [1.0 checklist](https://github.com/stedbrown/alpina-ui/blob/main/docs/1.0-checklist.md)
