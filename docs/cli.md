# Compare copied source files

`alpina add` copies editable source and the MIT notice, `ALPINA-LICENSE.txt`, to your component directory. After installing another package version, run `alpina diff` to compare the files in your project with the sources shipped in that version. The comparison reads local files and preserves your edits.

## Copy a block

Use `alpina list` to see the component groups and five blocks. Their CLI names are `block/login`, `block/dashboard`, `block/account-settings`, `block/pricing` and `block/public-service`.

```sh
npx --no-install alpina add block/login
npx --no-install alpina add block/account-settings button --dir src/design --dry-run
```

The first command creates `components/alpina/blocks/login.tsx` and the MIT notice. Import the copied block from that path and load `alpina-ui/styles.css` once in your app. Blocks import their controls from the installed `alpina-ui` package. Open the copied file to change copy, data or event handlers. [Block gallery](https://alpinaui.com/blocks/)

The second command previews a mixed selection. Its destination contains the block, the editable Button source and Button’s dependencies. Run the command again without `--dry-run` to write the missing files. The CLI reports locally edited files as `keep`. For source-only projects, `add --all` selects all standalone component entries. Add a block by name when your project also uses the package.

## Copy the public service form

`alpina add block/public-service` copies a service definition and the workflow, translated copy and draft storage it uses. The default definition collects personal details and a Swiss postal address for a residence certificate. Residents can attach files, revisit any step and review the complete request. [Try the public service form](https://alpinaui.com/blocks/public-service/)

Set `initialLocale` to `de-CH`, `fr-CH`, `it-CH`, `rm-CH` or `en`. Pass an `onSubmit` callback to receive a normalized AHV number, a structured eCH-0010 mail address, the original files, the selected locale and a request ID. Return the case number issued by your service. Use the request ID for idempotent retries and validate the data again at the server boundary.

The form keeps edits in memory until the resident chooses **Save draft**. A saved draft includes the current step and file contents. On returning to the same browser, the resident can resume it or delete it. Completion removes the saved draft. Supply a service- and account-specific `draftKey` when embedding the block in an authenticated application.

To configure a different service, supply steps, field definitions and copy. A title or label can be a string or a map with an English fallback and Swiss translations. The optional `validate(values, locale)` returns messages keyed by field ID. An application callback can also return `{ fieldErrors }`. The summary links each error to its step, places focus on the field and preserves the current URL.

```tsx
import { PublicServiceBlock, type PublicServiceDefinition } from './components/alpina/blocks/public-service'

const appointment: PublicServiceDefinition = {
  id: 'appointment', title: 'Book a visit', introduction: 'Tell us who will attend.',
  steps: [
    { id: 'contact', title: 'Contact', fields: [{ id: 'visitor', label: 'Visitor name', required: true }] },
    { id: 'review', title: 'Review the request', content: 'review' },
  ],
}

export function AppointmentPage() {
  return <PublicServiceBlock service={appointment} onSubmit={async request => {
    const response = await fetch('/appointments', { method: 'POST', body: JSON.stringify(request.values),
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': request.requestId } })
    if (response.status === 422) return { fieldErrors: (await response.json()).fieldErrors }
    if (!response.ok) throw new Error('Booking failed')
    return (await response.json()).caseNumber
  }} />
}
```

`FormSteps` and `LanguageSwitcher` are available from `alpina-ui` for other forms. Give `FormSteps` a stable current step ID, a list of `{ id, label }` items and a localized `compactLabel`, such as `Passo {current} di {total}`. Pass a controlled locale and `onLocaleChange` to `LanguageSwitcher`. Each step reserves the width of its full numbered label. Extra space is shared among steps. The compact count appears when the labels and their gaps exceed the column width. Both controls measure their own column and preserve keyboard focus when switching presentation.

## Find differences

Run the command from your project directory. If you originally used `--dir`, pass the same directory to the comparison.

```sh
npx --no-install alpina diff
npx --no-install alpina diff swiss-address-form --dir src/components/alpina
npx --no-install alpina diff block/login --patch
```

With no names, the CLI detects copied component and block entry files. It checks the MIT notice, the component dependencies and an installed theme. Shared paths appear once. After `init`, it checks the theme and MIT notice. To check a component or block whose entry file is missing, name it explicitly. Use `diff --all` to compare every standalone component entry with the project.

| Status | Meaning |
| --- | --- |
| `aligned` | The local file and the package source match byte for byte. |
| `modified` | The contents differ. Common causes include local edits, an updated package, or different line endings. |
| `missing` | The selected component or block uses this file, and the destination path is available. |

The first line identifies the installed version. The last line gives the count for each status. The CLI compares files known to the registry and can inspect copies installed with Alpina 0.3. It uses the current package as the reference, so it needs no installation history.

## Inspect changes line by line

```sh
npx --no-install alpina diff button --patch
```

For each changed file, `--patch` runs the local Git executable to compare the two copies. Lines beginning with `-` come from your project. Lines beginning with `+` come from the package. The directory can be outside a Git repository. The standard report requires only Node.js.

## Apply an update

1. Install the version of `alpina-ui` you want to use.
2. Run `diff` with the component name. For missing dependencies, run `add` with the same name and destination directory.
3. Review the patch for modified files and apply the changes you need in your editor. Running `add` again preserves existing customizations.
4. Try the component in your application, then repeat `diff` to see which local changes you retained.

A completed comparison exits with code 0 even when it finds differences. An unknown argument, invalid path, or read error produces exit code 1.

## Review a page against the design rules

```sh
npx --no-install alpina check src/app/page.tsx src/app/styles.css
```

The check reads React, CSS and HTML files and lists each line that uses a gradient, rounded corners, centered text, a hard-coded color, a floating shadow, another typeface, utility classes on an Alpina component, a card inside a card or more than one accent color. Each finding names the Alpina replacement. Add the comment `alpina-design-ignore` to a line that needs an exception. The command exits with code 1 when it finds something, so it can guard a pull request. Alignment, rhythm and hierarchy still need a person, guided by the [design guide](design.md).
