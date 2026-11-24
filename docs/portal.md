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
