/**
 * GhJSON → dependency graph.
 *
 * Models the parts of the format that describe topology: components (nodes
 * keyed by their integer `id`), connections (directed edges between
 * component parameters), and groups. Tolerant of partial documents —
 * connections marked `boundary` or referencing missing components are kept
 * as boundary edges, not dropped.
 */

import type { ComponentData, ConnectionData, GhJSONDocument, GroupData } from './schema-types.js'
import { validateGhJsonDocument } from './validate.js'

// Wire types are generated from the vendored spec schema (schema-types.ts);
// the aliases below keep the parser's public names stable.
export type GhJsonComponentWire = ComponentData
export type GhJsonConnectionWire = ConnectionData
export type GhJsonGroupWire = GroupData
export type GhJsonDocument = GhJSONDocument

export interface GraphNode {
  id: number
  name: string
  nickName: string | null
  library: string | null
  componentGuid: string | null
  /** Canvas position from `pivot`; undefined when the document omits it. */
  x: number | undefined
  y: number | undefined
  inputCount: number
  outputCount: number
  group: string | null
}

export interface GraphEdge {
  from: number
  to: number
  fromParam: number | string | null
  toParam: number | string | null
  /** True when an endpoint references a component outside this document. */
  boundary: boolean
}

export interface Graph {
  nodes: Map<number, GraphNode>
  edges: GraphEdge[]
  groups: { name: string; color: string | null; members: number[] }[]
  metadata: GhJsonDocument['metadata']
  /**
   * Connection entries dropped before they could become edges — endpoints
   * whose component reference matched no recognised key or component. These
   * never reach `edges`/`stats`; callers that validate uploads should reject
   * documents with `skippedConnections > 0` so producers learn the canonical
   * `connections[].from.id`/`to.id` shape instead of silently losing wires.
   */
  skippedConnections: number
}

export class GhJsonParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GhJsonParseError'
  }
}

function parsePivot(pivot: GhJsonComponentWire['pivot']): { x?: number; y?: number } {
  if (pivot == null) return {}
  if (typeof pivot === 'string') {
    const [x, y] = pivot.split(',').map(v => Number(v.trim()))
    return { x: Number.isFinite(x) ? x : undefined, y: Number.isFinite(y) ? y : undefined }
  }
  if (typeof pivot === 'object') {
    return {
      x: Number.isFinite(pivot.x) ? pivot.x : undefined,
      y: Number.isFinite(pivot.y) ? pivot.y : undefined,
    }
  }
  return {}
}

/**
 * Parse a GhJSON document (object or JSON string) into a dependency graph.
 * Throws GhJsonParseError when the document is not a components array.
 * `options.strict` additionally validates the document against the vendored
 * GhJSON JSON Schema before parsing (tolerant by default — real-world
 * documents can be partial).
 */
export function parseGhJsonGraph(input: GhJsonDocument | string, options?: { strict?: boolean }): Graph {
  const doc: GhJsonDocument = typeof input === 'string' ? JSON.parse(input) : input
  if (!doc || !Array.isArray(doc.components)) {
    throw new GhJsonParseError('GhJSON document must have a components array')
  }
  if (options?.strict) {
    const issues = validateGhJsonDocument(doc)
    if (issues.length) {
      throw new GhJsonParseError(`GhJSON document failed schema validation: ${issues[0].message}${issues.length > 1 ? ` (+${issues.length - 1} more)` : ''}`)
    }
  }

  const nodes = new Map<number, GraphNode>()
  const nameById = new Map<number, string>()
  const idByInstanceGuid = new Map<string, number>()
  doc.components.forEach((component, index) => {
    const id = coerceComponentId(component.id) ?? index + 1
    const { x, y } = parsePivot(component.pivot)
    const name = component.name ?? component.componentGuid ?? `component-${id}`
    nodes.set(id, {
      id,
      name,
      nickName: component.nickName ?? null,
      library: component.library ?? null,
      componentGuid: component.componentGuid ?? null,
      x,
      y,
      inputCount: component.inputSettings?.length ?? 0,
      outputCount: component.outputSettings?.length ?? 0,
      group: null,
    })
    nameById.set(id, component.nickName ?? component.name ?? `#${id}`)
    if (typeof component.instanceGuid === 'string' && component.instanceGuid) {
      idByInstanceGuid.set(component.instanceGuid.toLowerCase(), id)
    }
  })

  const edges: GraphEdge[] = []
  let skippedConnections = 0
  for (const conn of connectionEntries(doc)) {
    const endpoints = resolveEndpoints(conn, idByInstanceGuid)
    if (!endpoints) { skippedConnections++; continue }
    const { from, to, fromParam, toParam, boundary } = endpoints
    edges.push({
      from, to, fromParam, toParam,
      boundary: boundary === true || !nodes.has(from) || !nodes.has(to),
    })
  }

  const groups = (doc.groups ?? []).map(group => ({
    name: group.name ?? 'Group',
    color: group.color ?? null,
    members: (group.members ?? []).filter(id => nodes.has(id)),
  }))
  for (const group of groups) {
    for (const member of group.members) {
      const node = nodes.get(member)
      if (node) node.group = group.name
    }
  }

  return { nodes, edges, groups, metadata: doc.metadata, skippedConnections }
}

/* ---------- tolerant connection resolution ---------- */

/** Top-level keys producers have been seen to use for the wire list. */
const CONNECTION_KEYS = ['connections', 'wires', 'links', 'edges'] as const
/** Endpoint-pair key spellings (from side, then to side). */
const FROM_KEYS = ['from', 'source', 'src', 'output'] as const
const TO_KEYS = ['to', 'target', 'dst', 'input'] as const
/** Component-reference keys on an endpoint, in preference order. */
const ENDPOINT_ID_KEYS = ['id', 'component', 'componentId', 'component_id', 'componentIndex', 'component_index'] as const
/** Instance-guid keys — resolved through the components' instanceGuid → integer id. */
const ENDPOINT_GUID_KEYS = ['instanceGuid', 'instance_guid', 'guid'] as const
const PARAM_INDEX_KEYS = ['paramIndex', 'param_index', 'param', 'index'] as const
const PARAM_NAME_KEYS = ['paramName', 'param_name', 'name'] as const

/** Numbers pass through; numeric strings coerce (AI writers quote ids often). */
function coerceComponentId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/**
 * Every connection entry the document declares, from whichever container the
 * producer used: canonical `connections[]`, alias arrays (`wires`/`links`/`edges`),
 * object maps (`{ "0": {...} }` heals via values), or — when no top-level list
 * exists at all — per-component `inputs[]` entries carrying a `from`/`source`.
 */
function connectionEntries(doc: GhJsonDocument): unknown[] {
  const record = doc as unknown as Record<string, unknown>
  for (const key of CONNECTION_KEYS) {
    const value = record[key]
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') return Object.values(value)
  }
  const embedded: unknown[] = []
  for (const component of doc.components) {
    const c = component as Record<string, unknown>
    const componentId = coerceComponentId(c.id)
    if (componentId === undefined) continue
    for (const key of ['inputs', 'sources', 'connections'] as const) {
      const list = c[key]
      if (!Array.isArray(list)) continue
      for (const entry of list) {
        if (entry && typeof entry === 'object' &&
          FROM_KEYS.some(k => (entry as Record<string, unknown>)[k] !== undefined)) {
          embedded.push({ ...entry as object, to: { id: componentId } })
        }
      }
    }
  }
  return embedded
}

interface ResolvedEndpoint {
  id: number
  paramIndex: number | null
  paramName: string | null
}

/**
 * Resolve one endpoint to an integer component id. Accepts the canonical
 * `{ id }` plus the spellings AI writers and exporters actually emit:
 * `{ component|componentId|component_id|componentIndex }`, bare numbers,
 * `{ instanceGuid|instance_guid|guid }` (mapped through the components'
 * instanceGuid → id), and numeric strings. Returns null when nothing usable
 * is found — the caller counts it as a skipped connection.
 */
function resolveEndpoint(endpoint: unknown, idByInstanceGuid: Map<string, number>): ResolvedEndpoint | null {
  if (typeof endpoint === 'number' && Number.isFinite(endpoint)) {
    return { id: endpoint, paramIndex: null, paramName: null }
  }
  if (!endpoint || typeof endpoint !== 'object') return null
  const o = endpoint as Record<string, unknown>
  const paramIndex = PARAM_INDEX_KEYS.map(k => o[k]).find(v => typeof v === 'number' && Number.isFinite(v)) as number | undefined
  const paramName = PARAM_NAME_KEYS.map(k => o[k]).find(v => typeof v === 'string' && v !== '') as string | undefined
  for (const key of ENDPOINT_ID_KEYS) {
    const id = coerceComponentId(o[key])
    if (id !== undefined) return { id, paramIndex: paramIndex ?? null, paramName: paramName ?? null }
  }
  for (const key of ENDPOINT_GUID_KEYS) {
    const guid = o[key]
    if (typeof guid === 'string' && guid) {
      const id = idByInstanceGuid.get(guid.toLowerCase())
      return id === undefined ? null : { id, paramIndex: paramIndex ?? null, paramName: paramName ?? null }
    }
  }
  return null
}

/** Extract the from/to pair whatever spelling the producer used. */
function resolveEndpoints(conn: unknown, idByInstanceGuid: Map<string, number>): { from: number; to: number; fromParam: number | string | null; toParam: number | string | null; boundary: boolean | undefined } | null {
  if (!conn || typeof conn !== 'object') return null
  const c = conn as Record<string, unknown>
  // Flat spellings ({ from_id, to_id } / { source, target } with scalar values).
  if (c.from === undefined && c.source === undefined && c.src === undefined && c.output === undefined) {
    const flatFrom = coerceComponentId(c.from_id ?? c.source_id ?? c.src_id)
    const flatTo = coerceComponentId(c.to_id ?? c.target_id ?? c.dst_id)
    if (flatFrom !== undefined && flatTo !== undefined) {
      return { from: flatFrom, to: flatTo, fromParam: null, toParam: null, boundary: c.boundary === true }
    }
  }
  const fromEp = FROM_KEYS.map(k => c[k]).find(v => v !== undefined)
  const toEp = TO_KEYS.map(k => c[k]).find(v => v !== undefined)
  const from = resolveEndpoint(fromEp, idByInstanceGuid)
  const to = resolveEndpoint(toEp, idByInstanceGuid)
  if (!from || !to) return null
  return {
    from: from.id, to: to.id,
    fromParam: from.paramIndex ?? from.paramName,
    toParam: to.paramIndex ?? to.paramName,
    boundary: c.boundary === true,
  }
}
