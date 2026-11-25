# Build a portal with Alpina

The catalog imports its components from `alpina-ui` and the stylesheet from `alpina-ui/styles.css`. Each entry corresponds to an installable module. To copy a group of source files, run a command such as `npx --no-install alpina add app-shell sidebar navigation-menu` in your application.

| Component | API and behavior |
| --- | --- |
| AppShell | Accepts `brand`, `sidebar`, `toolbar`, and `children`. Control the mobile index with `open` and `onOpenChange`. Use `mainId` to link directly to the main content from site navigation. |
| Sidebar | Accepts `masthead`, `tools`, `footer`, and `children`. Its ref points to the scrolling region so you can bring the current entry into view. |
| NavigationMenu | Takes `label` and `sections`. Each section contains `links` with `href`, `label`, and `current`. Set `orientation` to `vertical` or `horizontal`. Set `collapseLabel` for a narrow-screen menu with native keyboard and touch dismissal. `surface` accepts `paper`, `ink` and `accent`. The current link keeps a three-pixel rule and heavier text. |
| CodeBlock | Accepts `code`, `label`, and copy-related labels. It uses the clipboard when available and selects the code for manual copying when needed. |
| TextLink | Accepts native anchor attributes and a ref. An underline identifies the link even without color. |
| Prose | Lays out semantic children in an `article`. The portal passes it local Markdown compiled at build time. |

The portal application manages search and routing. The public components provide layout, native navigation, and responsive controls. Every catalog entry offers the source files shipped with the library.

## A site header

Pass the home link through `brand` and utilities through `actions`. `NavigationBrand` accepts a logo URL and visible name. `NavigationAction` keeps its accessible label when an icon is shown on its own at phone widths.

```tsx
import { Icon, NavigationAction, NavigationBrand, NavigationMenu, ThemeToggle } from 'alpina-ui'

<NavigationMenu label="Primary" collapseLabel="Menu"
  brand={<NavigationBrand href="/" logo="/studio.svg">Studio</NavigationBrand>}
  actions={<>
    <NavigationAction href="/releases/">v2.0</NavigationAction>
    <NavigationAction href="https://github.com/example/studio" icon={<Icon name="github" size={18} />}>GitHub</NavigationAction>
    <ThemeToggle />
  </>}
  sections={[{ links: [
    { href: "/work/", label: "Work", current: true },
    { href: "/contact/", label: "Contact" },
  ] }]}
/>
```

ThemeToggle starts in automatic mode, follows the device preference and cycles to light and dark. Its icon and accessible action label change together. The choice persists in local storage and synchronizes across tabs. Supply translated `labels` for the three modes. For server-rendered pages, put `themeInitializationScript` in a script in the document head to apply the saved preference before paint. Apply your site's script nonce when required. A page with scripting disabled keeps the system preference and the navigation links.

The GitHub symbol reproduces the GitHub Invertocat from Primer Octicons. Use it to link to a project on GitHub. [GitHub brand guidelines](https://brand.github.com/foundations/logo) · [Octicons MIT license](https://github.com/primer/octicons/blob/main/LICENSE)

## A sidebar with router links

Supply the brand once. The shell keeps it above the index on desktop and beside its disclosure on mobile. `SideNav` provides a named navigation landmark and list. Set `active` on the current link to show its rule and expose `aria-current="page"`. With `asChild`, the router owns the anchor and its URL.

```tsx
import Link from 'next/link'
import { AppShell, Sidebar, SideNav, SideNavLink } from 'alpina-ui'

export function AccountsPage() {
  return <AppShell brand="Atelier" openLabel="Open navigation" closeLabel="Close navigation"
    sidebar={<Sidebar><SideNav label="Accounts">
      <SideNavLink asChild active><Link href="/invoices">Invoices</Link></SideNavLink>
      <SideNavLink asChild><Link href="/clients">Clients</Link></SideNavLink>
    </SideNav></Sidebar>}>
    <h1>Invoices</h1>
  </AppShell>
}
```

## Accessibility checks

The Swiss eCH-0059 accessibility standard, version 3.0, uses WCAG 2.1 AA. Alpina also targets WCAG 2.2 AA, including target size, focus visibility when content overlaps, and accessible authentication. These are separate versioned references. [eCH-0059 v3.0](https://www.ech.ch/fr/ech/ech-0059/3.0) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

The browser suite runs axe on every canonical public route and the standalone catalog. It focuses the controls on each page and checks that some of the focused control or its label is visible. The sign-in block exposes username and password autocomplete hints for password managers, accepts pasted credentials, and lets the user reveal the password. Its controls have targets of at least 24 × 24 CSS px. If an application adds a sticky header, set `--al-focus-scroll-margin` on its AppShell to the header’s height plus space for the focus indicator. Review custom content, screen reader workflows, and integrations as part of the application’s own accessibility assessment.
