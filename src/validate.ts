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
 * Connection-shape spellings the schema tolerates but the spec does not
 * name are additionally linted into actionable issues.
 */
export function validateGhJsonDocument(doc: unknown): ValidationIssue[] {
  const issues = lintGhJsonConnections(doc)
  const validate = compile()
  if (!validate(doc)) issues.push(...(validate.errors ?? []).map(toIssue))
  return issues
}

/* ---------- connection shape lint (spec §4) ---------- */

const WIRE_LIST_KEYS = ['wires', 'links', 'edges'] as const
const ENDPOINT_SIDE_KEYS = ['source', 'src', 'output', 'target', 'dst', 'input'] as const
const ENDPOINT_REF_KEYS = ['component', 'componentId', 'component_id', 'componentIndex', 'component_index', 'instanceGuid', 'instance_guid', 'guid'] as const
const FLAT_ID_KEYS = ['from_id', 'to_id', 'source_id', 'target_id', 'src_id', 'dst_id'] as const

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * Spellings producers emit that the schema's additionalProperties lets
 * through but the spec does not define — each gets an actionable issue so
 * callers can reject with a message that teaches the canonical shape.
 */
function lintGhJsonConnections(doc: unknown): ValidationIssue[] {
  if (!isObj(doc)) return []
  const issues: ValidationIssue[] = []
  for (const key of WIRE_LIST_KEYS) {
    if (doc[key] !== undefined) issues.push({ path: `/${key}`, message: `/${key} is not a spec key — the wire list must be named "connections"` })
  }
  if (doc.connections !== undefined && !Array.isArray(doc.connections)) {
    issues.push({ path: '/connections', message: '/connections must be an array' })
  }
  const components = Array.isArray(doc.components) ? doc.components.filter(isObj) : []
  const guids = new Set(
    components
      .map(c => c.instanceGuid)
      .filter((g): g is string => typeof g === 'string')
      .map(g => g.toLowerCase()),
  )
  const ids = new Set(
    components
      .map(c => c.id)
      .filter((v): v is number => typeof v === 'number'),
  )
  for (const [i, conn] of (Array.isArray(doc.connections) ? doc.connections : []).entries()) {
    const p = `/connections/${i}`
    if (!isObj(conn)) { issues.push({ path: p, message: `${p} must be an object { from, to }` }); continue }
    for (const flat of FLAT_ID_KEYS) {
      if (conn[flat] !== undefined) issues.push({ path: `${p}/${flat}`, message: `${p}/${flat} is not the spec shape — use ${flat.startsWith('from') || flat.startsWith('source') || flat.startsWith('src') ? 'from' : 'to'}: { "id": … }` })
    }
    for (const side of ['from', 'to'] as const) {
      const ep = conn[side]
      const epPath = `${p}/${side}`
      if (ep === undefined) {
        const alias = [...ENDPOINT_SIDE_KEYS, ...FLAT_ID_KEYS].find(k => conn[k] !== undefined)
        issues.push({ path: epPath, message: `${epPath} is required${alias ? ` — "${alias}" is not a spec key` : ''}` })
        continue
      }
      if (!isObj(ep)) { issues.push({ path: epPath, message: `${epPath} must be an endpoint object { "id": integer, "paramIndex"|"paramName" }` }); continue }
      const refAlias = ENDPOINT_REF_KEYS.find(k => ep[k] !== undefined)
      if (ep.id === undefined) {
        issues.push({ path: `${epPath}/id`, message: `${epPath}/id is required${refAlias ? ` — "${refAlias}" is not a spec key` : ''}` })
      } else if (typeof ep.id === 'number') {
        if (!Number.isInteger(ep.id) || ep.id < 1) issues.push({ path: `${epPath}/id`, message: `${epPath}/id must be a positive integer` })
        else if (!ids.has(ep.id) && conn.boundary !== true) issues.push({ path: `${epPath}/id`, message: `${epPath}/id references no component in this document — declare it or mark the connection "boundary": true` })
      } else if (typeof ep.id === 'string') {
        // Numeric strings coerce deterministically (spec §4.3); any other
        // string must resolve a component instanceGuid.
        if (!/^\d+$/.test(ep.id) && !guids.has(ep.id.toLowerCase())) {
          issues.push({ path: `${epPath}/id`, message: `${epPath}/id references no component instanceGuid in this document` })
        }
      } else {
        issues.push({ path: `${epPath}/id`, message: `${epPath}/id must be a positive integer` })
      }
      if (ep.paramIndex === undefined && ep.paramName === undefined) {
        issues.push({ path: epPath, message: `${epPath} needs "paramIndex" or "paramName" (spec §4.3)` })
      }
    }
  }
  for (const [i, comp] of components.entries()) {
    if (!isObj(comp)) continue
    for (const key of ['inputs', 'sources'] as const) {
      const list = comp[key]
      if (Array.isArray(list) && list.some(e => isObj(e) && (e.from !== undefined || e.source !== undefined))) {
        issues.push({ path: `/components/${i}/${key}`, message: `/components/${i}/${key} carries connection entries — connections belong in the top-level "connections" array` })
      }
    }
  }
  return issues
}
