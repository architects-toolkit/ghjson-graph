import { Ajv2020, type ErrorObject } from 'ajv/dist/2020.js'
import { ghJsonSchema, ghJsonSchemaSet } from './schema-types.js'

export interface ValidationIssue {
  path: string
  message: string
}

let validator: ReturnType<Ajv2020['compile']> | undefined

const compile = () => {
  if (!validator) {
    // strictSchema off: the spec uses draft-2020-12 features plus format
    // annotations (uuid) that need no plugin for validation purposes.
    const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false })
    // Register the extension schemas so cross-file $refs resolve by $id.
    for (const s of ghJsonSchemaSet) {
      if ((s as { $id?: string }).$id !== ghJsonSchema.$id) ajv.addSchema(s)
    }
    validator = ajv.compile(ghJsonSchema as object)
  }
  return validator
}

const toIssue = (e: ErrorObject): ValidationIssue => ({
  path: e.instancePath || '/',
  message: `${e.instancePath || '/'} ${e.message ?? 'invalid'}`,
})

/**
 * Validate a document against the vendored GhJSON JSON Schema.
 * Returns an empty array when valid; every issue found otherwise.
 */
export function validateGhJsonDocument(doc: unknown): ValidationIssue[] {
  const validate = compile()
  if (validate(doc)) return []
  return (validate.errors ?? []).map(toIssue)
}
