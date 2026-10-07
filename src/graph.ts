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
  doc.components.forEach((component, index) => {
    const id = component.id ?? index + 1
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
  })

  const edges: GraphEdge[] = []
  for (const conn of doc.connections ?? []) {
    const from = conn.from?.id
    const to = conn.to?.id
    if (typeof from !== 'number' || typeof to !== 'number') continue
    edges.push({
      from,
      to,
      fromParam: conn.from.paramIndex ?? conn.from.paramName ?? null,
      toParam: conn.to.paramIndex ?? conn.to.paramName ?? null,
      boundary: conn.boundary === true || !nodes.has(from) || !nodes.has(to),
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

  return { nodes, edges, groups, metadata: doc.metadata }
}
