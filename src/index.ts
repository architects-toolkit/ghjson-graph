export {
  parseGhJsonGraph,
  GhJsonParseError,
  type GhJsonDocument,
  type GhJsonComponentWire,
  type GhJsonConnectionWire,
  type GhJsonGroupWire,
  type Graph,
  type GraphNode,
  type GraphEdge,
} from './graph.js'
export { graphStats, type GraphStats } from './stats.js'
export { renderGraphSvg, type RenderOptions } from './svg.js'

import { parseGhJsonGraph, type GhJsonDocument } from './graph.js'
import { graphStats, type GraphStats } from './stats.js'
import { renderGraphSvg, type RenderOptions } from './svg.js'

/** One-call helper: parse + stats + SVG thumbnail for a GhJSON document. */
export function ghJsonCard(input: GhJsonDocument | string, options?: RenderOptions): {
  stats: GraphStats
  svg: string
} {
  const graph = parseGhJsonGraph(input)
  return { stats: graphStats(graph), svg: renderGraphSvg(graph, options) }
}
