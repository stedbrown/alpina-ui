# Build an interface

Start with the action a person needs to complete. Each workflow below links to a working example and the component reference. Use the Preview, Code, API and Source tabs to try an interaction and take the implementation into your application.

## Collect information in a form

For an application form, give each input a visible label with [Field](https://alpinaui.com/docs/components/field/). Place instructions beside the decision they explain. On submission, keep entered values and link each error in the summary to its field. Use [SwissAddressForm](https://alpinaui.com/docs/components/swiss-address-form/) for a complete postal address, or its exported SwissAddressFields for part of a larger form. Let [MultilingualField](https://alpinaui.com/docs/components/multilingual-field/) collect several translations of the same content. The [public service block](https://alpinaui.com/blocks/public-service/) demonstrates draft recovery, attachments and server validation.

## Compare table rows and amounts

Use [Table](https://alpinaui.com/docs/components/table/) for a straightforward comparison. Choose [DataTable](https://alpinaui.com/docs/components/data-table/) when someone will sort, group or inspect records. Identify the currency in the column heading and supply amounts as numbers so sorting still works. Short text links and document numbers such as `2026-0141` stay together automatically. If a custom link contains an icon or nested markup, set `nowrap: true` on its column. Use `nowrap: false` to allow wrapping. Reserve [CurrencyCHF](https://alpinaui.com/docs/components/currency-chf/) for amounts that need their own currency label. In the [invoice review project](https://alpinaui.com/examples/invoice-review/), try a revision and inspect the result.

## Open a window or a menu

Place a single frequent action in a [Button](https://alpinaui.com/docs/components/button/). Group additional actions on the same record in a [DropdownMenu](https://alpinaui.com/docs/components/dropdown-menu/) whose name identifies that record. Use [Dialog](https://alpinaui.com/docs/components/dialog/) when an action needs inputs, or [AlertDialog](https://alpinaui.com/docs/components/alert-dialog/) before an irreversible change. Check the initial focus, Escape and focus after the window closes. If the action removes the trigger, choose a surviving row or heading as the next focus target.

## Pick a date and offer appointments

For a spare field in a form use [DatePicker](https://alpinaui.com/docs/components/date-picker/). Keep [Calendar](https://alpinaui.com/docs/components/calendar/) visible when comparing several days is the task. Store the selected civil date as an ISO date string. Supply a workplace canton and booking constraints where they apply. The [Swiss guide](https://alpinaui.com/docs/guides/swiss/) describes public holidays and regional observance.

## Lay out a page on a grid

Choose the heading, reading column and primary action before deciding how many columns to use. Align them with [Grid](https://alpinaui.com/docs/components/grid/); use [Stack](https://alpinaui.com/docs/components/stack/) for the smaller groups within each region. [Typography](https://alpinaui.com/docs/components/typography/) supplies the display scale and reading measure. Try a long label, keyboard navigation and 200% text zoom in the narrowest column. See the [design principles](https://alpinaui.com/principles/) for paired layout examples.
