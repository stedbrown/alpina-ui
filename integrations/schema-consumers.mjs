import assert from 'node:assert/strict'
import { z } from 'zod'
import * as v from 'valibot'
import { type } from 'arktype'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { FormApi, FieldApi } from '@tanstack/form-core'
import { echAddressSchema, ibanSchema } from 'alpina-ui/swiss/schemas'

const schema = ibanSchema('rm-CH')
const check = schema['~standard'].validate
const input = 'ch93 0076 2011 6238 5295 7'
const canonical = 'CH9300762011623852957'
const message = check('invalid').issues[0].message

const zod = z.string().transform((value, ctx) => {
  const result = check(value)
  if (!result.issues) return result.value
  ctx.addIssue({ code: 'custom', message: result.issues[0].message })
  return z.NEVER
})
const valibot = v.pipe(v.string(), v.rawTransform(({ dataset, addIssue, NEVER }) => {
  const result = check(dataset.value)
  if (!result.issues) return result.value
  addIssue({ message: result.issues[0].message })
  return NEVER
}))
const ark = type('string').pipe((value, ctx) => {
  const result = check(value)
  return result.issues ? ctx.reject({ message: result.issues[0].message }) : result.value
})
for (const consumer of [zod, valibot, ark]) {
  assert.deepEqual((await consumer['~standard'].validate(input)).value, canonical)
  assert.equal((await consumer['~standard'].validate('invalid')).issues[0].message, message)
}

const resolver = standardSchemaResolver(echAddressSchema('it-CH'))
const { errors } = await resolver({ person: {}, addressInformation: {} }, {}, { fields: {}, names: [], shouldUseNativeValidation: false })
assert.ok(errors.person.lastName.message)
assert.ok(errors.addressInformation.country.message)
const form = new FormApi({ defaultValues: { iban: '' } })
const stopForm = form.mount()
const field = new FieldApi({ form, name: 'iban', validators: { onChange: schema } })
const stopField = field.mount()
try {
  field.handleChange('invalid')
  assert.equal(field.state.meta.errors[0].message, message)
  field.handleChange(input)
  assert.deepEqual(field.state.meta.errors, [])
} finally { stopField(); stopForm() }
console.log('Validated through Zod, Valibot, ArkType, React Hook Form and TanStack Form.')
