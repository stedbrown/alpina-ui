# From shadcn/ui to Alpina

Start with one screen that already has a keyboard or form-submission test. A button, a labeled field and a table of amounts make a good first slice. Port their behavior while keeping the rest of the application on its existing components.

## Install alongside shadcn/ui

Install Alpina UI 0.13.0 from the portal's versioned package archive in your React project. To upgrade later, install the archive for the version you want to use. If your team edits component source, the CLI can copy selected TypeScript, CSS and dependencies into `components/alpina`. Your existing shadcn/ui source can stay in `components/ui`. [Installation guide](https://alpina-ui.vercel.app/docs/guides/start/)

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-0.13.0.tgz
# Optional editable source for the first screen
npx --no-install alpina add button field input
```

With package imports, load `alpina-ui/styles.css` once. A screen can import a local shadcn/ui component and an Alpina component under different names. With copied files, use their local module paths and import the copied theme. [Source-copy workflow](https://alpina-ui.vercel.app/docs/guides/cli/)

## Reuse Tailwind v4 utilities

Add the theme bridge when you are ready to switch the appearance of semantic utility classes across the application. In the global CSS compiled by Tailwind v4, use this order.

```css
@import "tailwindcss";
@import "alpina-ui/styles.css";
@import "alpina-ui/tailwind.css";
```

An existing `bg-background text-foreground` surface now reads Alpina's paper and ink. `bg-primary text-primary-foreground` uses the action color and its foreground. A `gap-3` spans three grid units, 12 px with Alpina's default of 4 px. Use `text-body` and `text-heading` for the body and section-heading scales. Add `alpina-ui/fonts.css` if the project should serve the optional Inter family itself. [Tailwind v4 theme variables](https://tailwindcss.com/docs/theme) · [Alpina type and grid measurements](https://alpina-ui.vercel.app/docs/guides/design/)

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

These 66 families follow the project's recorded shadcn/ui component index. Each Alpina reference includes the actual preview, prop types and editable source. The porting column highlights the API or interaction to check first. [Original component index](https://ui.shadcn.com/docs/components) · [Differences in supported features](https://alpina-ui.vercel.app/docs/guides/coverage/)

| shadcn/ui family | Alpina reference | What to change or verify |
| --- | --- | --- |
| Accordion | [Accordion](https://alpina-ui.vercel.app/docs/components/accordion/) | Supply an array of stable values, headings and panels through `items`. Track the open section as one string or `null`. |
| Alert | [Alert](https://alpina-ui.vercel.app/docs/components/alert/) | Pass the heading as `title`, the body as children and the intended severity as `tone`. |
| Alert Dialog | [AlertDialog](https://alpina-ui.vercel.app/docs/components/alert-dialog/) | Move the prompt, description, cancel label and confirm label onto `AlertDialog`. Keep the mutation in `onConfirm`. |
| Aspect Ratio | [AspectRatio](https://alpina-ui.vercel.app/docs/components/aspect-ratio/) | Pass a numeric width-to-height `ratio` and choose `fit="contain"` for images that must remain fully visible. |
| Attachment | [Attachment](https://alpina-ui.vercel.app/docs/components/attachment/) | Provide `href`, `filename` and an optional `detail`. Keep upload progress and file-management actions in the application. |
| Avatar | [Avatar](https://alpina-ui.vercel.app/docs/components/avatar/) | Supply a person’s `name` and optional image `src`. Alpina derives the fallback initials. |
| Badge | [Badge](https://alpina-ui.vercel.app/docs/components/badge/) | Map the semantic state to `tone`. Set `asChild` when the badge itself is a link. |
| Breadcrumb | [Breadcrumb](https://alpina-ui.vercel.app/docs/components/breadcrumb/) | Build an `items` array with labels and destinations. Use an item’s `asChild` flag for a router link and `currentIndex` for the active crumb. |
| Bubble | [Bubble](https://alpina-ui.vercel.app/docs/components/bubble/) | Put message content in children and choose the logical `side` for the speaker. |
| Button | [Button](https://alpina-ui.vercel.app/docs/components/button/) | Use `primary` for the main action and `danger` for destructive actions. A router link can be the root through `asChild`. |
| Button Group | [ButtonGroup](https://alpina-ui.vercel.app/docs/components/button-group/) | Wrap the existing actions in `ButtonGroup`, supply a group `label` and set `orientation` when they run vertically. |
| Calendar | [Calendar](https://alpina-ui.vercel.app/docs/components/calendar/) | Keep the chosen civil date as an ISO `YYYY-MM-DD` string. Map a single selected day and its allowed bounds to `value`, `min` and `max`. |
| Card | [Card](https://alpina-ui.vercel.app/docs/components/card/) | Compose `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` and `CardFooter`. Choose the heading level with `CardTitle as`. |
| Carousel | [Carousel](https://alpina-ui.vercel.app/docs/components/carousel/) | Pass slides as `items` with stable values and content. Supply localized previous and next button labels. |
| Chart | [Chart](https://alpina-ui.vercel.app/docs/components/chart/) | Pass labeled numeric values to the bar chart. Keep a specialist chart renderer for series, axes or chart types your screen requires. |
| Checkbox | [Checkbox](https://alpina-ui.vercel.app/docs/components/checkbox/) | Read the boolean from `event.currentTarget.checked` in `onChange`. Use the `indeterminate` prop for mixed selection. |
| Code Block | [CodeBlock](https://alpina-ui.vercel.app/docs/components/code-block/) | Pass the snippet as `code` and the header as `label`. Keep syntax highlighting, line selection and diffing with the existing editor when needed. |
| Collapsible | [Collapsible](https://alpina-ui.vercel.app/docs/components/collapsible/) | Move the trigger label to `summary` and keep the panel in children. Native `details` exposes open state through the `toggle` event. |
| Combobox | [Combobox](https://alpina-ui.vercel.app/docs/components/combobox/) | Pass searchable `options`, a `label` and an `empty` message. Store the selected option’s string value with `onValueChange`. |
| Command | [Command](https://alpina-ui.vercel.app/docs/components/command/) | Describe commands in `items`. Translate the dialog title, search label, empty state and close action. |
| Context Menu | [ContextMenu](https://alpina-ui.vercel.app/docs/components/context-menu/) | Wrap the invocation region in `ContextMenu`. Configure each action in `items` and handle the chosen value in `onValueSelect`. |
| Data Table | [DataTable](https://alpina-ui.vercel.app/docs/components/data-table/) | Supply `rows`, typed `columns`, `rowKey`, `caption` and `empty`. Use `format: 'chf'`, `'decimal'` or `'swiss-date'` for built-in sorting. Custom cells accept a `compare` function. Keep app filtering and paging in the parent. |
| Date Picker | [DatePicker](https://alpina-ui.vercel.app/docs/components/date-picker/) | Use the calendar’s single ISO-date value. Pass `name` for form submission and `clearable` when a date is optional. |
| Dialog | [Dialog](https://alpina-ui.vercel.app/docs/components/dialog/) | Move the title, trigger, close label and footer onto the dialog. Pass the panel body as children and retain `open` / `onOpenChange` for controlled state. |
| Direction | [Direction](https://alpina-ui.vercel.app/docs/components/direction/) | Wrap the text region with `dir="rtl"`, `"ltr"` or `"auto"`. Logical layout then follows the chosen writing direction. |
| Drawer | [Drawer](https://alpina-ui.vercel.app/docs/components/drawer/) | Supply the modal title, body and close label. Use `swipeToClose` to configure the bottom drawer gesture. |
| Dropdown Menu | [DropdownMenu](https://alpina-ui.vercel.app/docs/components/dropdown-menu/) | Move actions into `items`. Compose a router link as a slotted item and add `textValue` when its accessible content needs a shorter typeahead label. |
| Empty | [Empty](https://alpina-ui.vercel.app/docs/components/empty/) | Pass a short `title`, optional description and recovery action. Use `titleAs` to match the page outline. |
| Field | [Field](https://alpina-ui.vercel.app/docs/components/field/) | Use the field’s child function to spread its generated ID and description attributes onto the actual control. |
| Hover Card | [HoverCard](https://alpina-ui.vercel.app/docs/components/hover-card/) | Supply the trigger and card title as props and place the preview in children. Keep essential destinations reachable through an ordinary link. |
| Input | [Input](https://alpina-ui.vercel.app/docs/components/input/) | Keep native `type`, `value`, `onChange`, `name` and validation props. `numeric` aligns numeric input. |
| Input Group | [InputGroup](https://alpina-ui.vercel.app/docs/components/input-group/) | Place the input in children and put affixes or actions in `leading` and `trailing`. |
| Input OTP | [InputOTP](https://alpina-ui.vercel.app/docs/components/input-otp/) | Store the entire code as a string. Set `length` and use `onValueChange` to preserve leading zeroes and native paste. |
| Item | [Item](https://alpina-ui.vercel.app/docs/components/item/) | Put the primary label in `title` and use `description`, `leading` and `trailing` for supporting content. |
| Kbd | [Kbd](https://alpina-ui.vercel.app/docs/components/kbd/) | Place the literal key or shortcut text in `Kbd`. Implement the actual shortcut in the application. |
| Label | [Label](https://alpina-ui.vercel.app/docs/components/label/) | Set `htmlFor` to the native control ID. Use `Field` if the control also needs help or error text. |
| Marker | [Marker](https://alpina-ui.vercel.app/docs/components/marker/) | Map the state to `open`, `closed` or `attention`, and supply text describing what the sign means. |
| Menubar | [Menubar](https://alpina-ui.vercel.app/docs/components/menubar/) | Describe each top-level group in `menus` and its commands in `items`. Keep application actions in the selection callbacks. |
| Message | [Message](https://alpina-ui.vercel.app/docs/components/message/) | Pass `author`, `timestamp` and `dateTime` to identify the sender and time. Put the message body in children. |
| Message Scroller | [MessageScroller](https://alpina-ui.vercel.app/docs/components/message-scroller/) | Place messages in the scrolling log and provide `jumpLabel` for returning to the latest message. Test any retained transcript-loading behavior separately. |
| Native Select | [NativeSelect](https://alpina-ui.vercel.app/docs/components/native-select/) | Pass ordinary HTML options and native selection events. `appearance="line"` selects the underlined presentation. |
| Navigation Menu | [NavigationMenu](https://alpina-ui.vercel.app/docs/components/navigation-menu/) | Use labeled `sections` of links. Give router entries their route identity in `href` and their link element in `label` with `asChild`. |
| Pagination | [Pagination](https://alpina-ui.vercel.app/docs/components/pagination/) | Build numbered `items` with real URLs. Set `currentPage` and provide `pageLabel` for translated accessible names. |
| Popover | [Popover](https://alpina-ui.vercel.app/docs/components/popover/) | Supply a title, trigger, close label and panel children. Use `onOpenChange` to synchronize controlled state. |
| Progress | [Progress](https://alpina-ui.vercel.app/docs/components/progress/) | Pass a numeric `value` and optional `max`. Omit `value` for indeterminate progress and supply the accessible `label`. |
| Questionnaire | [Questionnaire](https://alpina-ui.vercel.app/docs/components/questionnaire/) | Build `questions` with IDs and single-choice options. Consume reviewed answers in `onComplete`; keep multi-select and free text in a different form. |
| Radio Group | [RadioGroup](https://alpina-ui.vercel.app/docs/components/radio-group/) | Pass the group label and option array. Use `onValueChange` for its single value and `name` for native form submission. |
| Resizable | [Resizable](https://alpina-ui.vercel.app/docs/components/resizable/) | Provide two panes through `first` and `second`. Configure the split with `orientation`, `min`, `max` and `step`. |
| Scroll Area | [ScrollArea](https://alpina-ui.vercel.app/docs/components/scroll-area/) | Give the region a label and set its `maxHeight`. Put the scrollable content directly in children. |
| Select | [Select](https://alpina-ui.vercel.app/docs/components/select/) | Use native `<option>` children and read the selected value in `onChange`. Use `Combobox` for type-to-search selection. |
| Separator | [Separator](https://alpina-ui.vercel.app/docs/components/separator/) | Use `orientation` for the axis and `weight="section"` for a stronger rule. Set `decorative={false}` when the boundary conveys structure. |
| Sheet | [Sheet](https://alpina-ui.vercel.app/docs/components/sheet/) | Pass a logical `side` of `start` or `end`, a modal title and a close label. Put editing controls in children. |
| Sidebar | [Sidebar](https://alpina-ui.vercel.app/docs/components/sidebar/) | Supply the `masthead`, `tools`, scrollable children and optional `footer`. Pair it with `AppShell` for a collapsible mobile index. |
| Skeleton | [Skeleton](https://alpina-ui.vercel.app/docs/components/skeleton/) | Choose the `text`, `block` or `avatar` placeholder shape and reserve space close to the incoming content. |
| Slider | [Slider](https://alpina-ui.vercel.app/docs/components/slider/) | Use the native range input’s numeric `min`, `max` and `step`. Read one value with `event.currentTarget.valueAsNumber`. |
| Spinner | [Spinner](https://alpina-ui.vercel.app/docs/components/spinner/) | Supply a `label` when loading should be announced; use `showLabel` to display that text beside the spinner. |
| Switch | [Switch](https://alpina-ui.vercel.app/docs/components/switch/) | Use a native checked boolean and `onChange`. Add `stateLabels` to show translated on/off text. |
| Table | [Table](https://alpina-ui.vercel.app/docs/components/table/) | Compose the table parts directly and mark comparable amount cells `numeric` for end alignment and tabular figures. |
| Tabs | [Tabs](https://alpina-ui.vercel.app/docs/components/tabs/) | Describe each panel in `items`. Choose automatic or manual `activation` and manage the active tab through `value` and `onValueChange`. |
| Textarea | [Textarea](https://alpina-ui.vercel.app/docs/components/textarea/) | Keep native textarea props for editing, submission and form reset. Opt in to `autoGrow` where height should follow content. |
| Toast | [Toast](https://alpina-ui.vercel.app/docs/components/toast/) | Render a controlled notification with `open`, `onOpenChange` and `closeLabel`. Keep queues and application-wide dispatch in the owning layer. |
| Toggle | [Toggle](https://alpina-ui.vercel.app/docs/components/toggle/) | Use `pressed` and `onPressedChange`. Keep the action’s label stable so its pressed state identifies the change. |
| Toggle Group | [ToggleGroup](https://alpina-ui.vercel.app/docs/components/toggle-group/) | Describe choices in `options` and store selected values in an array. Use `multiple` for independent choices or `layout="grid"` for a tile picker. |
| Tooltip | [Tooltip](https://alpina-ui.vercel.app/docs/components/tooltip/) | Pass a focusable child element and short `content` text. Keep the existing control’s accessible name. |
| Trace | [Trace](https://alpina-ui.vercel.app/docs/components/trace/) | Pass ordered `events` with IDs, titles and optional detail. Use the detail disclosure for an event’s expanded explanation. |
| Typography | [Typography](https://alpina-ui.vercel.app/docs/components/typography/) | Use `as` for the semantic element and `variant` for the visual role. Apply `numeric` to comparable figures. |
