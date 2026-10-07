// Regenerates src/schema-types.ts from schema/ghjson.schema.json.
// Update flow: bump the vendored schema file (from
// https://architects-toolkit.github.io/ghjson-spec/schema/<version>/ghjson.schema.json),
// then run `pnpm codegen` and commit both files.
import { compileFromFile } from 'json-schema-to-typescript'
import { readFile, writeFile } from 'node:fs/promises'

const types = await compileFromFile(new URL('../schema/ghjson.schema.json', import.meta.url).pathname, {
  bannerComment: '// GENERATED from schema/ghjson.schema.json — do not edit by hand; run `pnpm codegen`.',
  additionalProperties: false,
  unknownAny: true,
})

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const schemaRoot = new URL('../schema/', import.meta.url)
const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) files.push(...await walk(p))
    else if (e.name.endsWith('.json')) files.push(p)
  }
  return files
}
const files = await walk(schemaRoot.pathname)
const schemas = []
for (const f of files.sort()) {
  const doc = JSON.parse(await readFile(f, 'utf8'))
  schemas.push({ rel: f.slice(schemaRoot.pathname.length), doc })
}
const main = schemas.find(s => s.rel === 'ghjson.schema.json').doc

const out = `${types.trimEnd()}

/** The vendored GhJSON JSON Schema (v1.0), embedded so consumers need no file access. */
export const ghJsonSchema = ${JSON.stringify(main, null, 2)} as const

/**
 * Every vendored schema file keyed by its $id (extension schemas included —
 * ajv resolves cross-file $refs by $id when they are all registered).
 */
export const ghJsonSchemaSet: ReadonlyArray<Record<string, unknown>> = ${JSON.stringify(schemas.map(s => s.doc))} as const
`

await writeFile(new URL('../src/schema-types.ts', import.meta.url), out)
console.log(`wrote src/schema-types.ts (${out.length} bytes)`)
