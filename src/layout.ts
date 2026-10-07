import type { Graph } from './graph.js'

export interface LayoutResult {
  /** Node id → cell position (column, row) in the layered layout. */
  positions: Map<number, { col: number; row: number }>
  /** Layer index → node ids in display order (top to bottom). */
  layers: number[][]
  /** Number of layers (columns). */
  depth: number
  /** Height of the tallest layer (rows). */
  height: number
}

/**
 * Left-to-right layered layout — the canvas-independent core of the
 * ghjson-tidyup placement (Sugiyama-style):
 *
 *  1. Cycles are neutralized by dropping edges that point to a DFS ancestor
 *     (back edges) for ranking purposes; they are still drawn.
 *  2. Rank = longest path from a source, so inputs sit at the left and
 *     results at the right, matching Grasshopper reading direction.
 *  3. Within a layer, nodes are ordered by the barycenter (median) of their
 *     predecessors' positions, iterated a few alternating sweeps to reduce
 *     edge crossings.
 */
export function layoutGraph(graph: Graph): LayoutResult {
  const ids = [...graph.nodes.keys()]
  if (ids.length === 0) return { positions: new Map(), layers: [], depth: 0, height: 0 }

  const internal = graph.edges.filter(e => graph.nodes.has(e.from) && graph.nodes.has(e.to) && e.from !== e.to)
  const successors = new Map<number, number[]>()
  const predecessors = new Map<number, number[]>()
  for (const id of ids) { successors.set(id, []); predecessors.set(id, []) }

  // Neutralize cycles: DFS, ignore edges leading to an ancestor on the stack.
  const state = new Map<number, 'white' | 'gray' | 'black'>(ids.map(id => [id, 'white']))
  const allEdges = internal.map(e => ({ ...e, back: false }))
  const dfs = (start: number) => {
    const stack: { id: number; next: number }[] = [{ id: start, next: 0 }]
    state.set(start, 'gray')
    while (stack.length) {
      const top = stack[stack.length - 1]
      const outs = allEdges.filter(e => e.from === top.id)
      if (top.next < outs.length) {
        const edge = outs[top.next++]
        if (state.get(edge.to) === 'gray') edge.back = true
        else if (state.get(edge.to) === 'white') {
          state.set(edge.to, 'gray')
          stack.push({ id: edge.to, next: 0 })
        }
      } else {
        state.set(top.id, 'black')
        stack.pop()
      }
    }
  }
  for (const id of ids) if (state.get(id) === 'white') dfs(id)

  for (const e of allEdges) {
    if (e.back) continue
    successors.get(e.from)!.push(e.to)
    predecessors.get(e.to)!.push(e.from)
  }

  // Rank by longest path from a source (isolated nodes rank 0 = leftmost).
  const rank = new Map<number, number>()
  const indeg = new Map<number, number>()
  for (const id of ids) { indeg.set(id, predecessors.get(id)!.length); rank.set(id, 0) }
  const queue = ids.filter(id => indeg.get(id) === 0)
  while (queue.length) {
    const id = queue.shift()!
    for (const next of successors.get(id)!) {
      if (rank.get(id)! + 1 > rank.get(next)!) rank.set(next, rank.get(id)! + 1)
      indeg.set(next, indeg.get(next)! - 1)
      if (indeg.get(next) === 0) queue.push(next)
    }
  }

  const depth = Math.max(...rank.values()) + 1
  const layers: number[][] = Array.from({ length: depth }, () => [])
  for (const id of ids) layers[rank.get(id)!].push(id)
  // Stable initial order within each layer.
  for (const layer of layers) layer.sort((a, b) => a - b)

  // Barycenter sweeps: order each layer by the median position of its
  // neighbours in the adjacent layer (alternate down/up sweeps).
  const median = (values: number[]) => {
    if (!values.length) return -1
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }
  const orderPos = new Map<number, number>()
  const setPos = () => { for (const layer of layers) layer.forEach((id, i) => orderPos.set(id, i)) }
  setPos()
  for (let pass = 0; pass < 4; pass++) {
    const down = pass % 2 === 0
    const range = down
      ? Array.from({ length: depth - 1 }, (_, i) => i + 1)
      : Array.from({ length: depth - 1 }, (_, i) => depth - 2 - i)
    for (const li of range) {
      const layer = layers[li]
      const key = (id: number) => {
        const neighbours = (down ? predecessors : successors).get(id)!
          .map(n => orderPos.get(n))
          .filter((p): p is number => p != null)
        return median(neighbours)
      }
      layer.sort((a, b) => {
        const ka = key(a), kb = key(b)
        if (ka === -1 && kb === -1) return a - b
        if (ka === -1) return 1
        if (kb === -1) return -1
        return ka - kb || a - b
      })
    }
    setPos()
  }

  const positions = new Map<number, { col: number; row: number }>()
  layers.forEach((layer, col) => layer.forEach((id, row) => positions.set(id, { col, row })))
  return { positions, layers, depth, height: Math.max(...layers.map(l => l.length)) }
}
