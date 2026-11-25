# Dates, forms, and logs

## Calendar

`Calendar` uses Gregorian civil dates in `YYYY-MM-DD` format. Selecting a day gives the same value in Zurich, Honolulu, and Tokyo. Today's date is determined in Zurich. `min` and `max` are inclusive. `defaultMonth` accepts a month or date and sets the initial view. Updating a controlled value opens its month. An impossible date or inverted range throws a `RangeError`.

Tab enters on the active day. Horizontal arrows move one day and vertical arrows move one week. Home and End go to Monday and Sunday. Page Up and Page Down change months. Hold Shift to change years. Enter or Space confirms. Changing from the last day of January to February lands on the last available day of February. Screen readers receive the full day name and language, including Romansh. An underline marks today and reversed colors mark the selected day.

`DatePicker` combines `Dialog`, `Calendar`, and `SwissDate`. Its button reads the date in the language set by `locale`. In a form, `name` submits the ISO string. Escape closes the window and focus returns to the button. A form reset restores the initial date in uncontrolled mode.

## Controls

| Component | Use and behavior |
| --- | --- |
| `InputOTP` | A text input accepts between 1 and 32 digits with a configurable length. `autoComplete="one-time-code"` supports assisted entry on compatible devices. Paste accepts spaces or hyphens. Leading zeros remain in the value. Associate a `Field` and use `required` for form validation. |
| `NativeSelect` | HTML props, ref, option groups, multiple selection and the open picker follow the `Select` API. `appearance="line"` draws a bottom rule. `outline` draws the full border. |
| `ToggleGroup` | Buttons have names, pressed states, and visible focus. `multiple` enables multiple choices. `name` submits one entry per selection. Pressing a selected button again clears it. In a grid, the selected tile has a solid field. A disabled tile strikes through its label. Supply `disabledReason` on an option or the whole group to show and announce its explanation. |
| `Questionnaire` | Each question groups native radio buttons. Moving forward requires an answer. Users can go back to make corrections. Completion sends a map of IDs to values to `onComplete`. The application supplies localized navigation labels. |
| `MessageScroller` | A named `log` region follows the latest message. Reading earlier messages preserves the scroll position. A button returns to the bottom. `--al-log-height` sets the maximum height. |
| `Trace` | An ordered list preserves the original event sequence. `dateTime` holds the structured value and `detail` opens a native disclosure. |

## Control text and browser language

The document's `lang` and a browser's UI language can differ. HTML file buttons, calendar placeholders, color panels and validation bubbles can display strings from the browser's own translation resources. Alpina's examples use the following controls.

| Interaction | What the page renders |
| --- | --- |
| Files | `FileInput` supplies the visible trigger, file status and removal action in the component language. The real file field accepts the selection and participates in form submission. The operating system supplies the file browsing dialog. |
| Dates and times | `DatePicker` shows a date formatted in its Swiss locale and opens its labeled calendar. For time entry use a labeled text field with an example such as `14:30` and an inline format error. |
| Numbers and search | Number inputs retain their numeric role, constraints, and arrow-key stepping. Search keeps native text editing. Their visible fields omit the browser's stepper and clear decorations. |
| Options | A single-row `Select` uses the same type and palette for the field and its popup. Browsers supporting CSS `base-select` render both directly. Other engines with JavaScript use a styled inline listbox. Escape cancels, Enter commits, and the original select owns the value and fires its change event. Multiple selects and explicit listboxes stay inline. Without JavaScript older browsers open the platform picker with the supplied option labels. |
| Colors | The theme builder accepts a six-digit hex value. A partial entry keeps the last valid preview and displays a format hint when focus leaves the field. |
| Form feedback | Mark application-validated forms `noValidate`, inspect `validity` or the Swiss schemas on submit, set `Field.error` in the form language and focus the first invalid field. Browser-generated `validationMessage` is unsuitable as page copy. Validate again on the server. |

The `Input` primitive forwards HTML props. Passing `type="date"`, `type="time"`, `type="color"` or `type="file"` explicitly selects that browser widget. Browser permission prompts, system file dialogs and autofill suggestions use the user's device language.

The browser-language regression opens the hosted pages in German and French full Chromium and visits the offline scanner. It reads a native file input's user-agent shadow tree and exercises required validation to verify the installed UI language before auditing the examples. Use `ALPINA_LOCALE_CHROMIUM` to choose a full Chromium executable with its language resources installed.

## Swiss components

`CurrencyCHF` and `SwissDate` set the language of their rendered text, including when a French-formatted amount appears on an Italian page. Their HTML elements retain machine-readable amount and date values.

`CantonSelect` and `LocaleSelect` share the outlined native select. The canton selector passes its language to the control. Language options retain their own names and `lang` attributes. The existing prop names, refs, and controlled behavior remain available.

`CantonCombobox` distinguishes the confirmed choice from the option reached with arrows. A screen reader receives both the active descendant and the current selection. The clear button uses the shared button component.

`SwissPostalCodeInput` accepts `locale`, retains left-to-right direction, and uses a text input to preserve leading zeros. It validates four digits. `SwissAddressForm` uses the system's type roles, associates the instructions with the form, and marks the form as busy while saving.
