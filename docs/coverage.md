# Component coverage compared with shadcn/ui

On November 24, 2026, the **All Components** section of shadcn/ui listed 66 families. The Alpina UI 0.5.0 registry had 78 installable entries, including a dedicated entry for each of those 66 names. This comparison covers that public index. AI Elements, Blocks, Charts, and community registries have separate inventories. [Official shadcn/ui component index](https://ui.shadcn.com/docs/components)

## Differences to consider

| Family | Documented behavior |
| --- | --- |
| Attachment | Alpina links to a file and displays its name and metadata. shadcn/ui also composes media previews, upload progress, and independent actions. [shadcn/ui Attachment](https://ui.shadcn.com/docs/components/base/attachment) |
| Bubble | Alpina places content at the start or end of a conversation row. shadcn/ui also documents bubble groups, reactions, and collapsible text. [shadcn/ui Bubble](https://ui.shadcn.com/docs/components/base/bubble) |
| Marker | Alpina places a sign beside text to distinguish three states. shadcn/ui also uses this family for system notes, bordered rows, and labeled separators in a conversation. [shadcn/ui Marker](https://ui.shadcn.com/docs/components/base/marker) |
| Message | Alpina composes an article with an author, optional time, and bubble. shadcn/ui provides dedicated parts for the avatar, header, footer, and alignment. [shadcn/ui Message](https://ui.shadcn.com/docs/components/base/message) |
| Message Scroller | Alpina follows new messages and offers a return to the bottom for readers browsing earlier messages. shadcn/ui also documents per-turn anchoring, transcript restoration, prepending history, and jumping to a specific message. [shadcn/ui Message Scroller](https://ui.shadcn.com/docs/components/base/message-scroller) |
| Questionnaire | Alpina handles a sequence of required single-choice questions with review and submission. shadcn/ui also offers multiple selection, free-form answers, and skippable questions. [shadcn/ui Questionnaire](https://ui.shadcn.com/docs/components/base/questionnaire) |
| Trace | Alpina presents an ordered timeline with times and expandable details. shadcn/ui Trace parts also compose tool calls, sources, and incremental agent updates. [shadcn/ui Trace](https://ui.shadcn.com/docs/components/base/trace) |
| Code Block | Alpina displays and copies a string with a header. shadcn/ui also documents line numbers, diffs, and terminal output. [shadcn/ui Code Block](https://ui.shadcn.com/docs/components/base/code-block) |
| Chart | Alpina plots bars for positive and negative values and includes the underlying data table. The shadcn/ui Recharts integration offers additional chart families. [shadcn/ui Chart](https://ui.shadcn.com/docs/components/base/chart) |
| Data Table | Alpina sorts rows and accepts custom cells. The shadcn/ui guide builds on TanStack Table and also covers filtering, pagination, and column visibility. [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/base/data-table) |
| Calendar and Date Picker | Alpina selects one civil date at a time in the four Swiss national languages and returns an ISO date value. The shadcn/ui documentation also covers date ranges. [shadcn/ui Calendar](https://ui.shadcn.com/docs/components/base/calendar) |
| Select and Native Select | Both Alpina entries use the HTML `select` and the device picker. The shadcn/ui Select family describes a composite control with a trigger and list. [shadcn/ui Select](https://ui.shadcn.com/docs/components/base/select) |
| Slider | Alpina uses a single-value HTML slider. shadcn/ui also documents a slider with multiple thumbs. [shadcn/ui Slider](https://ui.shadcn.com/docs/components/base/slider) |

Each library defines its own APIs. To estimate migration work, compare the props, states, and rendered behavior your product relies on.

## Index of the 66 names

“Alpina entry” is the identifier accepted by `alpina add`. “Export” is the name you can import from `alpina-ui`.

| shadcn/ui component | Alpina entry | Export | Directory |
| --- | --- | --- | --- |
| Accordion | `accordion` | `Accordion` | interactive |
| Alert | `alert` | `Alert` | ui |
| Alert Dialog | `alert-dialog` | `AlertDialog` | interactive |
| Aspect Ratio | `aspect-ratio` | `AspectRatio` | ui |
| Attachment | `attachment` | `Attachment` | ui |
| Avatar | `avatar` | `Avatar` | ui |
| Badge | `badge` | `Badge` | ui |
| Breadcrumb | `breadcrumb` | `Breadcrumb` | ui |
| Bubble | `bubble` | `Bubble` | ui |
| Button | `button` | `Button` | ui |
| Button Group | `button-group` | `ButtonGroup` | ui |
| Calendar | `calendar` | `Calendar` | swiss |
| Card | `card` | `Card` | ui |
| Carousel | `carousel` | `Carousel` | interactive |
| Chart | `chart` | `Chart` | ui |
| Checkbox | `checkbox` | `Checkbox` | ui |
| Code Block | `code-block` | `CodeBlock` | portal |
| Collapsible | `collapsible` | `Collapsible` | ui |
| Combobox | `combobox` | `Combobox` | interactive |
| Command | `command` | `Command` | interactive |
| Context Menu | `context-menu` | `ContextMenu` | interactive |
| Data Table | `data-table` | `DataTable` | ui |
| Date Picker | `date-picker` | `DatePicker` | swiss |
| Dialog | `dialog` | `Dialog` | interactive |
| Direction | `direction` | `Direction` | ui |
| Drawer | `drawer` | `Drawer` | interactive |
| Dropdown Menu | `dropdown-menu` | `DropdownMenu` | interactive |
| Empty | `empty` | `Empty` | ui |
| Field | `field` | `Field` | ui |
| Hover Card | `hover-card` | `HoverCard` | interactive |
| Input | `input` | `Input` | ui |
| Input Group | `input-group` | `InputGroup` | ui |
| Input OTP | `input-otp` | `InputOTP` | interactive |
| Item | `item` | `Item` | ui |
| Kbd | `kbd` | `Kbd` | ui |
| Label | `label` | `Label` | ui |
| Marker | `marker` | `Marker` | ui |
| Menubar | `menubar` | `Menubar` | interactive |
| Message | `message` | `Message` | ui |
| Message Scroller | `message-scroller` | `MessageScroller` | interactive |
| Native Select | `native-select` | `NativeSelect` | interactive |
| Navigation Menu | `navigation-menu` | `NavigationMenu` | portal |
| Pagination | `pagination` | `Pagination` | ui |
| Popover | `popover` | `Popover` | interactive |
| Progress | `progress` | `Progress` | ui |
| Questionnaire | `questionnaire` | `Questionnaire` | interactive |
| Radio Group | `radio-group` | `RadioGroup` | ui |
| Resizable | `resizable` | `Resizable` | interactive |
| Scroll Area | `scroll-area` | `ScrollArea` | ui |
| Select | `select` | `Select` | ui |
| Separator | `separator` | `Separator` | ui |
| Sheet | `sheet` | `Sheet` | interactive |
| Sidebar | `sidebar` | `Sidebar` | portal |
| Skeleton | `skeleton` | `Skeleton` | ui |
| Slider | `slider` | `Slider` | ui |
| Spinner | `spinner` | `Spinner` | ui |
| Switch | `switch` | `Switch` | ui |
| Table | `table` | `Table` | ui |
| Tabs | `tabs` | `Tabs` | interactive |
| Textarea | `textarea` | `Textarea` | ui |
| Toast | `toast` | `Toast` | interactive |
| Toggle | `toggle` | `Toggle` | ui |
| Toggle Group | `toggle-group` | `ToggleGroup` | interactive |
| Tooltip | `tooltip` | `Tooltip` | interactive |
| Trace | `trace` | `Trace` | interactive |
| Typography | `typography` | `Typography` | ui |

## The 15 additional entries in Alpina 0.7

| Purpose | Alpina entries |
| --- | --- |
| Layout and portal | `app-shell`, `figure`, `grid`, `stack`, `prose`, `text-link` |
| Read-only summaries and workflows | `description-list`, `steps` |
| Language, cantons, and addresses | `canton-combobox`, `canton-select`, `locale-select`, `swiss-address-form`, `swiss-postal-code-input` |
| Formatting | `currency-chf`, `swiss-date` |

Run `node --test tests/coverage.test.mjs` to compare this documented snapshot with the registry entries and the compiled package exports. A fresh comparison requires a new count of the published shadcn/ui index.
