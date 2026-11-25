# Build a portal with Alpina

The catalog imports its components from `alpina-ui` and the stylesheet from `alpina-ui/styles.css`. Each entry corresponds to an installable module. To copy a group of source files, run a command such as `npx --no-install alpina add app-shell sidebar navigation-menu` in your application.

| Component | API and behavior |
| --- | --- |
| AppShell | Accepts `brand`, `sidebar`, `toolbar`, and `children`. Control the mobile index with `open` and `onOpenChange`. Use `mainId` to link directly to the main content from site navigation. |
| Sidebar | Accepts `masthead`, `tools`, `footer`, and `children`. Its ref points to the scrolling region so you can bring the current entry into view. |
| NavigationMenu | Takes `label` and `sections`. Each section contains `links` with `href`, `label`, and `current`. Set `orientation` to `vertical` or `horizontal`. Native links support opening in a new tab. |
| CodeBlock | Accepts `code`, `label`, and copy-related labels. It uses the clipboard when available and selects the code for manual copying when needed. |
| TextLink | Accepts native anchor attributes and a ref. An underline identifies the link even without color. |
| Prose | Lays out semantic children in an `article`. The portal passes it local Markdown compiled at build time. |

The portal application manages search and routing. The public components provide layout, native navigation, and responsive controls. Every catalog entry offers the source files shipped with the library.

## Accessibility checks

The Swiss eCH-0059 accessibility standard, version 3.0, uses WCAG 2.1 AA. Alpina also targets WCAG 2.2 AA, including target size, focus visibility when content overlaps, and accessible authentication. These are separate versioned references. [eCH-0059 v3.0](https://www.ech.ch/fr/ech/ech-0059/3.0) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

The browser suite runs axe on every canonical public route and the standalone catalog. It focuses the controls on each page and checks that some of the focused control or its label is visible. The sign-in block exposes username and password autocomplete hints for password managers, accepts pasted credentials, and lets the user reveal the password. Its controls have targets of at least 24 × 24 CSS px. If an application adds a sticky header, set `--al-focus-scroll-margin` on its AppShell to the header’s height plus space for the focus indicator. Review custom content, screen reader workflows, and integrations as part of the application’s own accessibility assessment.
