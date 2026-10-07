import type { Graph } from './graph.js'

export interface GraphStats {
  components: number
  connections: number
  groups: number
  /** Distinct component libraries used (e.g. "Maths", "Sets"). */
  libraries: string[]
  /** Plugin dependencies declared in document metadata. */
  dependencies: string[]
  /** Nodes with no incoming edge (definition inputs). */
  sources: number
  /** Nodes with no outgoing edge (definition outputs). */
  sinks: number
  /** Longest directed path length (edges); 0 for empty/cyclic-only graphs. */
  longestPath: number
  /** Edges referencing components outside this document. */
  boundaryEdges: number
}

export function graphStats(graph: Graph): GraphStats {
  const inDegree = new Map<number, number>()
  const outDegree = new Map<number, number>()
  for (const id of graph.nodes.keys()) { inDegree.set(id, 0); outDegree.set(id, 0) }
  let boundaryEdges = 0
  for (const edge of graph.edges) {
    if (edge.boundary) boundaryEdges++
    if (graph.nodes.has(edge.to)) inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
    if (graph.nodes.has(edge.from)) outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1)
  }

  // Longest path via topological order over internal edges; tolerates cycles
  // (Kahn's algorithm on remaining nodes simply stops).
  const internal = graph.edges.filter(e => graph.nodes.has(e.from) && graph.nodes.has(e.to))
  const adjacency = new Map<number, number[]>()
  const deg = new Map<number, number>()
  for (const id of graph.nodes.keys()) { deg.set(id, 0) }
  for (const e of internal) {
    adjacency.set(e.from, [...(adjacency.get(e.from) ?? []), e.to])
    deg.set(e.to, (deg.get(e.to) ?? 0) + 1)
  }
  const dist = new Map<number, number>()
  const queue: number[] = []
  for (const [id, d] of deg) if (d === 0) { queue.push(id); dist.set(id, 0) }
  while (queue.length) {
    const id = queue.shift()!
    const base = dist.get(id) ?? 0
    for (const next of adjacency.get(id) ?? []) {
      dist.set(next, Math.max(dist.get(next) ?? 0, base + 1))
      deg.set(next, (deg.get(next) ?? 0) - 1)
      if (deg.get(next) === 0) queue.push(next)
    }
  }
  const longestPath = Math.max(0, ...dist.values())

  const libraries = [...new Set([...graph.nodes.values()].map(n => n.library).filter((x): x is string => !!x))].sort()

  return {
    components: graph.nodes.size,
    connections: graph.edges.length,
    groups: graph.groups.length,
    libraries,
    dependencies: graph.metadata?.dependencies ?? [],
    sources: [...inDegree.values()].filter(d => d === 0).length,
    sinks: [...outDegree.values()].filter(d => d === 0).length,
    longestPath,
    boundaryEdges,
  }
}
