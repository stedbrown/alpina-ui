# From shadcn/ui to Alpina

Start with one screen that already has a keyboard or form-submission test. A button, a labeled field and a table of amounts make a good first slice. Port their behavior while keeping the rest of the application on its existing components.

The edition-label comparison on the homepage runs the same form in both libraries. Edit the name, submit it and compare the resulting label. Each code panel copies the source used to render its own preview. The shadcn example uses the New York registry's default native Button and Input. [Try the two forms](https://alpinaui.com/#migration-title) · [Upstream source](https://github.com/shadcn-ui/ui/tree/055aa6b7837b1808456a24beb4c97a677864aa82/apps/v4/registry/new-york-v4/ui).

## Install alongside shadcn/ui

Install Alpina UI 1.0.0-rc.6 from the portal's versioned package archive in your React project. To upgrade later, install the archive for the version you want to use. If your team edits component source, the CLI can copy selected TypeScript, CSS and dependencies into `components/alpina`. Your existing shadcn/ui source can stay in `components/ui`. [Installation guide](https://alpinaui.com/docs/guides/start/)

```sh
npm install https://alpinaui.com/alpina-ui-1.0.0-rc.6.tgz
# Optional editable source for the first screen
npx --no-install alpina add button field input
```

With package imports, load `alpina-ui/styles.css` once. A screen can import a local shadcn/ui component and an Alpina component under different names. With copied files, use their local module paths and import the copied theme. [Source-copy workflow](https://alpinaui.com/docs/guides/cli/)

## Reuse Tailwind v4 utilities

Add the theme bridge when you are ready to switch the appearance of semantic utility classes across the application. In the global CSS compiled by Tailwind v4, use this order.

```css
@import "tailwindcss";
@import "alpina-ui/styles.css";
@import "alpina-ui/tailwind.css";
```

An existing `bg-background text-foreground` surface now reads Alpina's paper and ink. `bg-primary text-primary-foreground` uses the action color and its foreground. A `gap-3` spans three grid units, 12 px with Alpina's default of 4 px. Use `text-body` and `text-heading` for the body and section-heading scales. Add `alpina-ui/fonts.css` if the project should serve the optional Inter family itself. [Tailwind v4 theme variables](https://tailwindcss.com/docs/theme) · [Alpina type and grid measurements](https://alpinaui.com/docs/guides/design/)

If the app already declares the same `--color-*` aliases in a shadcn/ui `@theme inline` block, choose which declarations should control those names. A later declaration of a shared alias can override the bridge. For a gradual visual rollout, import only the component styles initially and add the bridge after auditing utilities used on the remaining screens. Connect an existing dark-mode preference to `data-al-theme="dark"` on the root or the migrated subtree. [shadcn/ui theming](https://ui.shadcn.com/docs/theming)

## Port one interaction

Here the application keeps its router and native form controls. The link receives Alpina's button styling directly. Render these fields inside the existing form so its submit handler can continue reading `email` from the form data.

```tsx
import { Link } from "react-router"
import { Button, Field, Input, Stack } from "alpina-ui"

export function ContactFields() {
  return (
    <Stack gap={4} align="start">
      <Field label="Email address">
        {control => <Input {...control} name="email" type="email" autoComplete="email" required />}
      </Field>
      <Button asChild variant="outline">
        <Link to="/contacts">Back to contacts</Link>
      </Button>
    </Stack>
  )
}
```

For a Next.js application, import `Link` from `next/link` and pass `href="/contacts"` to it. For custom link components, forward received props, children and the ref to the actual anchor. Check that the destination still opens in a new tab, the label still focuses its input, and an empty submission still reaches the expected validation state.

## Component-by-component migration

These 66 families follow the project's recorded shadcn/ui component index. Each Alpina reference includes the actual preview, prop types and editable source. The porting column highlights the API or interaction to check first. [Original component index](https://ui.shadcn.com/docs/components)

| shadcn/ui family | Alpina reference | What to change or verify |
| --- | --- | --- |
| Accordion | [Accordion](https://alpinaui.com/docs/components/accordion/) | Supply an array of stable values, headings and panels through `items`. Track the open section as one string or `null`. |
| Alert | [Alert](https://alpinaui.com/docs/components/alert/) | Pass the heading as `title`, the body as children and the intended severity as `tone`. |
| Alert Dialog | [AlertDialog](https://alpinaui.com/docs/components/alert-dialog/) | Move the prompt, description, cancel label and confirm label onto `AlertDialog`. Keep the mutation in `onConfirm`. |
| Aspect Ratio | [AspectRatio](https://alpinaui.com/docs/components/aspect-ratio/) | Pass a numeric width-to-height `ratio` and choose `fit="contain"` for images that must remain fully visible. |
| Attachment | [Attachment](https://alpinaui.com/docs/components/attachment/) | Provide `href`, `filename` and an optional `detail`. Keep upload progress and file-management actions in the application. |
| Avatar | [Avatar](https://alpinaui.com/docs/components/avatar/) | Supply a person’s `name` and optional image `src`. Alpina derives the fallback initials. |
| Badge | [Badge](https://alpinaui.com/docs/components/badge/) | Map the semantic state to `tone`. Set `asChild` when the badge itself is a link. |
| Breadcrumb | [Breadcrumb](https://alpinaui.com/docs/components/breadcrumb/) | Build an `items` array with labels and destinations. Use an item’s `asChild` flag for a router link and `currentIndex` for the active crumb. |
| Bubble | [Bubble](https://alpinaui.com/docs/components/bubble/) | Put message content in children and choose the logical `side` for the speaker. |
| Button | [Button](https://alpinaui.com/docs/components/button/) | Use `primary` for the main action and `danger` for destructive actions. A router link can be the root through `asChild`. |
| Button Group | [ButtonGroup](https://alpinaui.com/docs/components/button-group/) | Wrap the existing actions in `ButtonGroup`, supply a group `label` and set `orientation` when they run vertically. |
| Calendar | [Calendar](https://alpinaui.com/docs/components/calendar/) | Keep the chosen civil date as an ISO `YYYY-MM-DD` string. Map a single selected day and its allowed bounds to `value`, `min` and `max`. |
| Card | [Card](https://alpinaui.com/docs/components/card/) | Compose `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` and `CardFooter`. Choose the heading level with `CardTitle as`. |
| Carousel | [Carousel](https://alpinaui.com/docs/components/carousel/) | Pass slides as `items` with stable values and content. Supply localized previous and next button labels. |
| Chart | [Chart](https://alpinaui.com/docs/components/chart/) | Pass labeled numeric values to the bar chart. Keep a specialist chart renderer for series, axes or chart types your screen requires. |
| Checkbox | [Checkbox](https://alpinaui.com/docs/components/checkbox/) | Read the boolean from `event.currentTarget.checked` in `onChange`. Use the `indeterminate` prop for mixed selection. |
| Code Block | [CodeBlock](https://alpinaui.com/docs/components/code-block/) | Pass the snippet as `code` and the header as `label`. Keep syntax highlighting, line selection and diffing with the existing editor when needed. |
| Collapsible | [Collapsible](https://alpinaui.com/docs/components/collapsible/) | Move the trigger label to `summary` and keep the panel in children. Native `details` exposes open state through the `toggle` event. |
| Combobox | [Combobox](https://alpinaui.com/docs/components/combobox/) | Pass searchable `options`, a `label` and an `empty` message. Store the selected option’s string value with `onValueChange`. |
| Command | [Command](https://alpinaui.com/docs/components/command/) | Describe commands in `items`. Translate the dialog title, search label, empty state and close action. |
| Context Menu | [ContextMenu](https://alpinaui.com/docs/components/context-menu/) | Wrap the invocation region in `ContextMenu`. Configure each action in `items` and handle the chosen value in `onValueSelect`. |
| Data Table | [DataTable](https://alpinaui.com/docs/components/data-table/) | Supply `rows`, typed `columns`, `rowKey`, `caption` and `empty`. Use `format: 'chf'`, `'decimal'` or `'swiss-date'` for built-in sorting. Custom cells accept a `compare` function. Keep app filtering and paging in the parent. |
| Date Picker | [DatePicker](https://alpinaui.com/docs/components/date-picker/) | Use the calendar’s single ISO-date value. Pass `name` for form submission and `clearable` when a date is optional. |
| Dialog | [Dialog](https://alpinaui.com/docs/components/dialog/) | Move the title, trigger, close label and footer onto the dialog. Pass the panel body as children and retain `open` / `onOpenChange` for controlled state. |
| Direction | [Direction](https://alpinaui.com/docs/components/direction/) | Wrap the text region with `dir="rtl"`, `"ltr"` or `"auto"`. Logical layout then follows the chosen writing direction. |
| Drawer | [Drawer](https://alpinaui.com/docs/components/drawer/) | Supply the modal title, body and close label. Use `swipeToClose` to configure the bottom drawer gesture. |
| Dropdown Menu | [DropdownMenu](https://alpinaui.com/docs/components/dropdown-menu/) | Move actions into `items`. Compose a router link as a slotted item and add `textValue` when its accessible content needs a shorter typeahead label. |
| Empty | [Empty](https://alpinaui.com/docs/components/empty/) | Pass a short `title`, optional description and recovery action. Use `titleAs` to match the page outline. |
| Field | [Field](https://alpinaui.com/docs/components/field/) | Use the field’s child function to spread its generated ID and description attributes onto the actual control. |
| Hover Card | [HoverCard](https://alpinaui.com/docs/components/hover-card/) | Supply the trigger and card title as props and place the preview in children. Keep essential destinations reachable through an ordinary link. |
| Input | [Input](https://alpinaui.com/docs/components/input/) | Keep native `type`, `value`, `onChange`, `name` and validation props. `numeric` aligns numeric input. |
| Input Group | [InputGroup](https://alpinaui.com/docs/components/input-group/) | Place the input in children and put affixes or actions in `leading` and `trailing`. |
| Input OTP | [InputOTP](https://alpinaui.com/docs/components/input-otp/) | Store the entire code as a string. Set `length` and use `onValueChange` to preserve leading zeroes and native paste. |
| Item | [Item](https://alpinaui.com/docs/components/item/) | Put the primary label in `title` and use `description`, `leading` and `trailing` for supporting content. |
| Kbd | [Kbd](https://alpinaui.com/docs/components/kbd/) | Place the literal key or shortcut text in `Kbd`. Implement the actual shortcut in the application. |
| Label | [Label](https://alpinaui.com/docs/components/label/) | Set `htmlFor` to the native control ID. Use `Field` if the control also needs help or error text. |
| Marker | [Marker](https://alpinaui.com/docs/components/marker/) | Map the state to `open`, `closed` or `attention`, and supply text describing what the sign means. |
| Menubar | [Menubar](https://alpinaui.com/docs/components/menubar/) | Describe each top-level group in `menus` and its commands in `items`. Keep application actions in the selection callbacks. |
| Message | [Message](https://alpinaui.com/docs/components/message/) | Pass `author`, `timestamp` and `dateTime` to identify the sender and time. Put the message body in children. |
| Message Scroller | [MessageScroller](https://alpinaui.com/docs/components/message-scroller/) | Place messages in the scrolling log and provide `jumpLabel` for returning to the latest message. Test any retained transcript-loading behavior separately. |
| Native Select | [NativeSelect](https://alpinaui.com/docs/components/native-select/) | Pass ordinary HTML options and native selection events. `appearance="line"` selects the underlined presentation. |
| Navigation Menu | [NavigationMenu](https://alpinaui.com/docs/components/navigation-menu/) | Use labeled `sections` of links. Give router entries their route identity in `href` and their link element in `label` with `asChild`. |
| Pagination | [Pagination](https://alpinaui.com/docs/components/pagination/) | Build numbered `items` with real URLs. Set `currentPage` and provide `pageLabel` for translated accessible names. |
| Popover | [Popover](https://alpinaui.com/docs/components/popover/) | Supply a title, trigger, close label and panel children. Use `onOpenChange` to synchronize controlled state. |
| Progress | [Progress](https://alpinaui.com/docs/components/progress/) | Pass a numeric `value` and optional `max`. Omit `value` for indeterminate progress and supply the accessible `label`. |
| Questionnaire | [Questionnaire](https://alpinaui.com/docs/components/questionnaire/) | Build `questions` with IDs and single-choice options. Consume reviewed answers in `onComplete`; keep multi-select and free text in a different form. |
| Radio Group | [RadioGroup](https://alpinaui.com/docs/components/radio-group/) | Pass the group label and option array. Use `onValueChange` for its single value and `name` for native form submission. |
| Resizable | [Resizable](https://alpinaui.com/docs/components/resizable/) | Provide two panes through `first` and `second`. Configure the split with `orientation`, `min`, `max` and `step`. |
| Scroll Area | [ScrollArea](https://alpinaui.com/docs/components/scroll-area/) | Give the region a label and set its `maxHeight`. Put the scrollable content directly in children. |
| Select | [Select](https://alpinaui.com/docs/components/select/) | Use native `<option>` children and read the selected value in `onChange`. Use `Combobox` for type-to-search selection. |
| Separator | [Separator](https://alpinaui.com/docs/components/separator/) | Use `orientation` for the axis and `weight="section"` for a stronger rule. Set `decorative={false}` when the boundary conveys structure. |
| Sheet | [Sheet](https://alpinaui.com/docs/components/sheet/) | Pass a logical `side` of `start` or `end`, a modal title and a close label. Put editing controls in children. |
| Sidebar | [Sidebar](https://alpinaui.com/docs/components/sidebar/) | Supply the `masthead`, `tools`, scrollable children and optional `footer`. Pair it with `AppShell` for a collapsible mobile index. |
| Skeleton | [Skeleton](https://alpinaui.com/docs/components/skeleton/) | Choose the `text`, `block` or `avatar` placeholder shape and reserve space close to the incoming content. |
| Slider | [Slider](https://alpinaui.com/docs/components/slider/) | Use the native range input’s numeric `min`, `max` and `step`. Read one value with `event.currentTarget.valueAsNumber`. |
| Spinner | [Spinner](https://alpinaui.com/docs/components/spinner/) | Supply a `label` when loading should be announced; use `showLabel` to display that text beside the spinner. |
| Switch | [Switch](https://alpinaui.com/docs/components/switch/) | Use a native checked boolean and `onChange`. Add `stateLabels` to show translated on/off text. |
| Table | [Table](https://alpinaui.com/docs/components/table/) | Compose the table parts directly and mark comparable amount cells `numeric` for end alignment and tabular figures. |
| Tabs | [Tabs](https://alpinaui.com/docs/components/tabs/) | Describe each panel in `items`. Choose automatic or manual `activation` and manage the active tab through `value` and `onValueChange`. |
| Textarea | [Textarea](https://alpinaui.com/docs/components/textarea/) | Keep native textarea props for editing, submission and form reset. Opt in to `autoGrow` where height should follow content. |
| Toast | [Toast](https://alpinaui.com/docs/components/toast/) | Render a controlled notification with `open`, `onOpenChange` and `closeLabel`. Mount one `Toaster` for app-wide messages sent with `toast(message)`. |
| Toggle | [Toggle](https://alpinaui.com/docs/components/toggle/) | Use `pressed` and `onPressedChange`. Keep the action’s label stable so its pressed state identifies the change. |
| Toggle Group | [ToggleGroup](https://alpinaui.com/docs/components/toggle-group/) | Describe choices in `options` and store selected values in an array. Use `multiple` for independent choices or `layout="grid"` for a tile picker. |
| Tooltip | [Tooltip](https://alpinaui.com/docs/components/tooltip/) | Pass a focusable child element and short `content` text. Keep the existing control’s accessible name. |
| Trace | [Trace](https://alpinaui.com/docs/components/trace/) | Pass ordered `events` with IDs, titles and optional detail. Use the detail disclosure for an event’s expanded explanation. |
| Typography | [Typography](https://alpinaui.com/docs/components/typography/) | Use `as` for the semantic element and `variant` for the visual role. Apply `numeric` to comparable figures. |

## Differences to consider

| Family | Documented behavior |
| --- | --- |
| Attachment | Alpina links to a file with its metadata or collects a local attachment in upload mode. shadcn/ui also composes media previews, upload progress, and independent actions. [shadcn/ui Attachment](https://ui.shadcn.com/docs/components/base/attachment) |
| Bubble | Alpina places content at the start or end of a conversation row. shadcn/ui also documents bubble groups, reactions, and collapsible text. [shadcn/ui Bubble](https://ui.shadcn.com/docs/components/base/bubble) |
| Marker | Alpina places a sign beside text to distinguish three states. shadcn/ui also uses this family for system notes, bordered rows, and labeled separators in a conversation. [shadcn/ui Marker](https://ui.shadcn.com/docs/components/base/marker) |
| Message | Alpina composes an article with an author, optional time, and bubble. shadcn/ui provides dedicated parts for the avatar, header, footer, and alignment. [shadcn/ui Message](https://ui.shadcn.com/docs/components/base/message) |
| Message Scroller | Alpina follows new messages and offers a return to the bottom for readers browsing earlier messages. shadcn/ui also documents per-turn anchoring, transcript restoration, prepending history, and jumping to a specific message. [shadcn/ui Message Scroller](https://ui.shadcn.com/docs/components/base/message-scroller) |
| Questionnaire | Alpina handles a sequence of required single-choice questions with review and submission. shadcn/ui also offers multiple selection, free-form answers, and skippable questions. [shadcn/ui Questionnaire](https://ui.shadcn.com/docs/components/base/questionnaire) |
| Trace | Alpina presents an ordered timeline with times and expandable details. shadcn/ui Trace parts also compose tool calls, sources, and incremental agent updates. [shadcn/ui Trace](https://ui.shadcn.com/docs/components/base/trace) |
| Code Block | Alpina displays and copies a string with a header. shadcn/ui also documents line numbers, diffs, and terminal output. [shadcn/ui Code Block](https://ui.shadcn.com/docs/components/base/code-block) |
| Chart | Alpina plots bars for positive and negative values and includes the underlying data table. The shadcn/ui Recharts integration offers additional chart families. [shadcn/ui Chart](https://ui.shadcn.com/docs/components/base/chart) |
| Data Table | Alpina sorts Swiss dates and amounts, groups rows with subtotals, prints repeated headings, and accepts custom cells. The shadcn/ui guide builds on TanStack Table and also covers filtering, pagination, and column visibility. [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/base/data-table) |
| Calendar and Date Picker | Alpina selects one civil date at a time in the four Swiss national languages and returns an ISO date value. The shadcn/ui documentation also covers date ranges. [shadcn/ui Calendar](https://ui.shadcn.com/docs/components/base/calendar) |
| Select and Native Select | Both Alpina entries use an HTML `select` with a styled popup and native keyboard navigation. The shadcn/ui Select family describes a composite control with a trigger and list. [shadcn/ui Select](https://ui.shadcn.com/docs/components/base/select) |
| Slider | Alpina uses a single-value HTML slider. shadcn/ui also documents a slider with multiple thumbs. [shadcn/ui Slider](https://ui.shadcn.com/docs/components/base/slider) |

## The 31 additional entries in Alpina 1.0.0-rc.6

| Purpose | Alpina entries |
| --- | --- |
| Layout and portal | `app-shell`, `figure`, `grid`, `grid-overlay`, `stack`, `prose`, `text-link` |
| SVG data graphics | `bar-chart`, `line-chart`, `sparkline`, `chart-table` |
| Interface symbols | `icon` |
| Read-only summaries and workflows | `description-list`, `steps` |
| Language, cantons, and addresses | `canton-combobox`, `canton-select`, `locale-select`, `multilingual-field`, `swiss-address-form`, `swiss-postal-code-input` |
| File selection | `file-input` |
| Formatting | `currency-chf`, `swiss-date` |
| Printable documents | `letter`, `invoice-document` |
| Payments and identifiers | `swiss-qr-bill`, `qr-bill-scanner`, `iban-input`, `ahv-input`, `phone-input`, `uid-input` |

The QR-bill checks its account, reference and currency combination before encoding a payment. The four identifier inputs check telephone number structure or the check digits of an IBAN, AHV or business UID. A checksum does not establish registration or ownership. The grid overlay provides visual inspection independently of the modular grid used to lay out an application. [QR-bill printing](https://alpinaui.com/docs/guides/qr-bill/) · [Swiss forms and formatting](https://alpinaui.com/docs/guides/swiss/)
