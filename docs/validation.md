# Swiss validation on the client and server

Each factory returns a synchronous [Standard Schema v1](https://standardschema.dev/schema) validator. Import from `alpina-ui/swiss/schemas` or the package root. The validators use the same checks as the Swiss input components and work in a browser, a Node server or a React Server Component. They require no validation library.

| Factory | Successful output |
| --- | --- |
| `ibanSchema` | A compact uppercase CH or LI IBAN with a valid checksum. |
| `qrIbanSchema` | A valid IBAN with a QR institution identifier from 30000 to 31999. |
| `ahvSchema` | An EAN-13 checked number grouped as `756.xxxx.xxxx.xx`. |
| `uidSchema` | A modulo-11 checked UID grouped as `CHE-xxx.xxx.xxx`. |
| `phoneSchema` | A Swiss telephone number in international format, for example `+41791234567`. |
| `postalCodeSchema` | Four ASCII digits, as entered. Use `lookupSwissPostalCode` for directory lookup. |
| `qrrSchema` | A 27-digit, nonzero reference with its recursive modulo-10 check digit. |
| `scorSchema` | A compact uppercase ISO 11649 creditor reference with a valid check digit. |
| `echAddressSchema` | A checked eCH-0010 mail address, with nested issues attached to the original field paths. |

Pass `de-CH`, `fr-CH`, `it-CH` or `rm-CH` when constructing a schema. English is the default. Non-string input, including a missing FormData entry or an uploaded file, returns issues for every scalar schema. The validators never coerce those inputs into strings.

```ts
import { ibanSchema } from 'alpina-ui/swiss/schemas'

const result = ibanSchema('rm-CH')['~standard'].validate(formData.get('iban'))
if (result.issues) return { error: result.issues[0].message }
return { lastFour: result.value.slice(-4) }
```

## Format and check digits

The AHV, UID, IBAN, QR-IBAN, QRR and SCOR schemas check the structure first. An incomplete AHV number gets the expected prefix and length. The complete entry `756.1234.5678.90` gets a different correction in Italian, “Il formato è corretto. La cifra di controllo non corrisponde. Ricontrolla i dati sul documento originale.” Compare the entire entry with the source document because an error in any digit can cause a mismatch.

Alpina inputs, Server Actions using the schemas, and QR-bill validation use the same localized checksum wording. For a server that already distinguishes the cause, `swissValidationMessage('qrr', 'fr-CH', 'checksum')` returns the French correction. Omitting the third argument returns the format instruction. QR-bill errors retain their field codes and scanned-payload line numbers.

## Forms and Server Actions

The Next.js billing example validates on blur for immediate feedback, then calls the same IBAN schema in a Server Action. The action reads a supported locale from the saved preference, checks the submitted FormData and returns the account suffix on success. The server performs this check on every submission. [Server Action](https://github.com/stedbrown/alpina-ui/blob/main/integrations/next-app-router/app/actions.ts) · [Client form](https://github.com/stedbrown/alpina-ui/blob/main/integrations/next-app-router/app/payment-form.tsx)

TanStack Form accepts the schema directly as a field validator. React Hook Form’s `standardSchemaResolver` accepts an object schema such as `echAddressSchema('fr-CH')`. Nested issue paths map to the corresponding inputs. [TanStack Form](https://tanstack.com/form/latest/docs/framework/react/guides/validation) · [React Hook Form resolvers](https://github.com/react-hook-form/resolvers)

Zod, Valibot and ArkType also produce Standard Schemas. Their own object builders expect native child schemas. To compose an Alpina validator inside one, call `schema['~standard'].validate(value)` from a Zod transform, a Valibot raw transform or an ArkType pipe. Return the parsed value or forward the localized issue through the library’s context. The integration suite runs all three adapters with valid and invalid inputs. [Runnable adapters](https://github.com/stedbrown/alpina-ui/blob/main/integrations/schema-consumers.mjs)

## Postal interchange

The address schema validates the JavaScript representation of eCH-0010 8.1 `mailAddressType`. It accepts the output of `toEchMailAddress`, street or post-office-box delivery, and foreign postcodes. Use one recipient branch, `person` or `organisation`. Supply XML integer fields as numbers and civil dates as `YYYY-MM-DD`. The schema requires nonblank address strings and a Swiss postcode for Switzerland (ISO `CH` or FSO `8100`). When supplied, the Swiss postcode add-on has two digits. Address text lengths follow XML token whitespace rules. Postal delivery and current foreign register assignments require separate lookups. Unknown fields produce issues. Optional values can be omitted. A valid result keeps the original address and its text. [Official standard and XML schema](https://ech.ch/de/ech/ech-0010/8.1.0)
