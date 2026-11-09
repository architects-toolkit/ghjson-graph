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

/* ---------- connection resolution (spec §4) ---------- */

/**
 * `id` MUST be a positive integer (§3.5) — that is the only coercion the
 * parser performs. The one accepted extension: an `id` string matching a
 * component's `instanceGuid` resolves through it, because spec §4.4
 * acknowledges instanceGuid-keyed references as the mechanism for wiring
 * canvas-bound objects. Every other spelling (numeric strings, `component`
 * keys, flat pairs, `wires` lists, …) is non-spec — it counts under
 * `skippedConnections` here and is reported by `validateGhJsonDocument`.
 */
function coerceComponentId(value: unknown, idByInstanceGuid?: Map<string, number>): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) return value
  if (idByInstanceGuid && typeof value === 'string' && value) {
    return idByInstanceGuid.get(value.toLowerCase())
  }
  return undefined
}

/** The wire list is `connections[]` — spec §4.1. No aliases. */
function connectionEntries(doc: GhJsonDocument): unknown[] {
  return Array.isArray(doc.connections) ? doc.connections : []
}

interface ResolvedEndpoint {
  id: number
  paramIndex: number | null
  paramName: string | null
}

/**
 * Resolve one endpoint per spec §4.3: an object carrying `id` (integer, or
 * the accepted instanceGuid string) plus `paramIndex`/`paramName`. Anything
 * else returns null — the caller counts it as a skipped connection.
 */
function resolveEndpoint(endpoint: unknown, idByInstanceGuid: Map<string, number>): ResolvedEndpoint | null {
  if (!endpoint || typeof endpoint !== 'object') return null
  const o = endpoint as Record<string, unknown>
  const id = coerceComponentId(o.id, idByInstanceGuid)
  if (id === undefined) return null
  const paramIndex = typeof o.paramIndex === 'number' && Number.isFinite(o.paramIndex) ? o.paramIndex : null
  const paramName = typeof o.paramName === 'string' && o.paramName !== '' ? o.paramName : null
  return { id, paramIndex, paramName }
}

/** Extract the from/to pair — `from`/`to` are the only spec keys. */
function resolveEndpoints(conn: unknown, idByInstanceGuid: Map<string, number>): { from: number; to: number; fromParam: number | string | null; toParam: number | string | null; boundary: boolean | undefined } | null {
  if (!conn || typeof conn !== 'object') return null
  const c = conn as Record<string, unknown>
  const from = resolveEndpoint(c.from, idByInstanceGuid)
  const to = resolveEndpoint(c.to, idByInstanceGuid)
  if (!from || !to) return null
  return {
    from: from.id, to: to.id,
    fromParam: from.paramIndex ?? from.paramName,
    toParam: to.paramIndex ?? to.paramName,
    boundary: c.boundary === true,
  }
}
