export interface SwissSchemaIssue {
  readonly message: string
  readonly path?: readonly (string | number)[]
}
export type SwissSchemaResult<T> = { readonly value: T; readonly issues?: undefined } | { readonly issues: readonly SwissSchemaIssue[] }

/** Structurally compatible with Standard Schema v1. Every Alpina validator is synchronous. */
export interface SwissStandardSchema<Input, Output = Input> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: 'alpina-ui'
    readonly types?: { readonly input: Input; readonly output: Output }
    readonly validate: (value: unknown) => SwissSchemaResult<Output>
  }
}

export function standardSchema<Input, Output>(validate: (value: unknown) => SwissSchemaResult<Output>): SwissStandardSchema<Input, Output> {
  return { '~standard': { version: 1, vendor: 'alpina-ui', validate } }
}
