# Dates, forms, and logs

## Calendar

`Calendar` uses Gregorian civil dates in `YYYY-MM-DD` format. Selecting a day gives the same value in Zurich, Honolulu, and Tokyo. Today's date is determined in Zurich. `min` and `max` are inclusive. `defaultMonth` accepts a month or date and sets the initial view. Updating a controlled value opens its month. An impossible date or inverted range throws a `RangeError`.

Tab enters on the active day. Horizontal arrows move one day and vertical arrows move one week. Home and End go to Monday and Sunday. Page Up and Page Down change months. Hold Shift to change years. Enter or Space confirms. Changing from the last day of January to February lands on the last available day of February. Screen readers receive the full day name and language, including Romansh. An underline marks today and reversed colors mark the selected day.

`DatePicker` combines `Dialog`, `Calendar`, and `SwissDate`. Its button reads the date in the language set by `locale`. In a form, `name` submits the ISO string. Escape closes the window and focus returns to the button. A form reset restores the initial date in uncontrolled mode.

## Controls

| Component | Use and behavior |
| --- | --- |
| `InputOTP` | A text input accepts between 1 and 32 digits with a configurable length. `autoComplete="one-time-code"` supports assisted entry on compatible devices. Paste accepts spaces or hyphens. Leading zeros remain in the value. Associate a `Field` and use `required` for form validation. |
| `NativeSelect` | HTML props, ref, option groups, multiple selection, and the system picker follow the `Select` API. `appearance="line"` draws a bottom rule. `outline` draws the full border. |
| `ToggleGroup` | Buttons have names, pressed states, and visible focus. `multiple` enables multiple choices. `name` submits one entry per selection. Pressing a selected button again clears it. |
| `Questionnaire` | Each question groups native radio buttons. Moving forward requires an answer. Users can go back to make corrections. Completion sends a map of IDs to values to `onComplete`. The application supplies localized navigation labels. |
| `MessageScroller` | A named `log` region follows the latest message. Reading earlier messages preserves the scroll position. A button returns to the bottom. `--al-log-height` sets the maximum height. |
| `Trace` | An ordered list preserves the original event sequence. `dateTime` holds the structured value and `detail` opens a native disclosure. |

## Swiss components

`CurrencyCHF` and `SwissDate` set the language of their rendered text, including when a French-formatted amount appears on an Italian page. Their HTML elements retain machine-readable amount and date values.

`CantonSelect` and `LocaleSelect` share the outlined native select. The canton selector passes its language to the control. Language options retain their own names and `lang` attributes. The existing prop names, refs, and controlled behavior remain available.

`CantonCombobox` distinguishes the confirmed choice from the option reached with arrows. A screen reader receives both the active descendant and the current selection. The clear button uses the shared button component.

`SwissPostalCodeInput` accepts `locale`, retains left-to-right direction, and uses a text input to preserve leading zeros. It validates four digits. `SwissAddressForm` uses the system's type roles, associates the instructions with the form, and marks the form as busy while saving.
