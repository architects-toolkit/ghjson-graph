import type { Graph } from './graph.js'
import { layoutGraph } from './layout.js'

export interface RenderOptions {
  /** Output width; height follows the laid-out graph's aspect ratio. */
  width?: number
  /** Palette for strokes on a dark or light page. Background is always transparent. */
  theme?: 'dark' | 'light'
  /** Padding inside the viewport. */
  padding?: number
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Natural cell size in layout units before fitting to `width`. */
const CELL_X = 56
const CELL_Y = 30

/**
 * Render the graph's canvas topology as a subtle transparent SVG using the
 * layered tidy-up layout: sources at the left, results at the right, branches
 * stacked vertically. The whole left-to-right span is scaled to `width`, so
 * the rendered size reads as the definition's real size.
 */
export function renderGraphSvg(graph: Graph, options: RenderOptions = {}): string {
  const width = options.width ?? 320
  const padding = options.padding ?? 8
  const dark = options.theme !== 'light'
  const height0 = Math.round(width / 3.2)

  const layout = layoutGraph(graph)
  if (layout.depth === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height0}" width="${width}" height="${height0}" role="img"/>`
  }

  const naturalW = Math.max(layout.depth - 1, 0) * CELL_X + CELL_X
  const naturalH = Math.max(layout.height - 1, 0) * CELL_Y + CELL_Y
  const scale = (width - padding * 2) / naturalW
  const height = Math.max(Math.round(naturalH * scale + padding * 2), Math.round(width / 8))

  const at = (id: number) => {
    const p = layout.positions.get(id)
    if (!p) return null
    return {
      x: padding + (p.col * CELL_X + CELL_X / 2) * scale,
      y: padding + (p.row * CELL_Y + CELL_Y / 2) * scale,
    }
  }

  const edgeColor = dark ? '#5b6a7d' : '#94a3b8'
  const nodeColor = dark ? '#8fb8d8' : '#3b6d94'
  const boundaryColor = dark ? '#4b5563' : '#b6c2cf'
  const nodeR = Math.max(1.6, Math.min(4.5, 26 * scale / Math.max(layout.height, 1) ** 0.5))

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" preserveAspectRatio="xMidYMid meet">`,
  ]
  for (const edge of graph.edges) {
    const a = at(edge.from)
    const b = at(edge.to)
    if (!a || !b) continue
    const stroke = edge.boundary ? boundaryColor : edgeColor
    parts.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${stroke}" stroke-opacity="0.65" stroke-width="1" ${edge.boundary ? 'stroke-dasharray="2 3" ' : ''}/>`)
  }
  for (const [id] of layout.positions) {
    const p = at(id)
    const node = graph.nodes.get(id)
    if (!p || !node) continue
    const title = escapeXml(node.nickName ?? node.name)
    parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${nodeR.toFixed(1)}" fill="${nodeColor}"><title>${title}</title></circle>`)
  }
  parts.push('</svg>')
  return parts.join('')
}
