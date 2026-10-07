import type { Graph } from './graph.js'

export interface RenderOptions {
  /** Output width; height follows the graph's aspect ratio (clamped). */
  width?: number
  /** Dark background (default) or light. */
  theme?: 'dark' | 'light'
  /** Padding inside the viewport. */
  padding?: number
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Render the graph's canvas topology as a compact self-contained SVG:
 * nodes at their pivot positions (scaled), connections as edges. When a
 * document carries no pivots, nodes fall back to a deterministic grid.
 */
export function renderGraphSvg(graph: Graph, options: RenderOptions = {}): string {
  const width = options.width ?? 320
  const padding = options.padding ?? 12
  const dark = options.theme !== 'light'

  const nodes = [...graph.nodes.values()]
  const positioned = nodes.filter(n => n.x != null && n.y != null)
  const usePivots = positioned.length > nodes.length / 2

  const xs = nodes.map((n, i) => usePivots ? (n.x ?? 0) : (i % 8) * 100)
  const ys = nodes.map((n, i) => usePivots ? (n.y ?? 0) : Math.floor(i / 8) * 60)
  const minX = Math.min(...xs, 0), maxX = Math.max(...xs, minX + 1)
  const minY = Math.min(...ys, 0), maxY = Math.max(...ys, minY + 1)
  const spanX = maxX - minX, spanY = maxY - minY
  const scale = (width - padding * 2) / Math.max(spanX, 1)
  const height = Math.min(Math.max(spanY * scale + padding * 2, 40), width * 1.6)

  const at = (id: number, i: number) => {
    const n = graph.nodes.get(id)
    const x = usePivots ? (n?.x ?? xs[i]) : xs[i]
    const y = usePivots ? (n?.y ?? ys[i]) : ys[i]
    return {
      x: padding + (x - minX) * scale,
      y: padding + (y - minY) * scale,
    }
  }

  const indexOf = new Map<number, number>(nodes.map((n, i) => [n.id, i]))
  const nodeR = Math.max(2, Math.min(5, scale * 8))
  const bg = dark ? '#101418' : '#ffffff'
  const edgeColor = dark ? '#3d4b5c' : '#b6c2cf'
  const nodeColor = dark ? '#7dd3fc' : '#0369a1'
  const boundaryColor = dark ? '#5b6470' : '#9aa5b1'

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${Math.round(height)}" role="img">`,
    `<rect width="${width}" height="${Math.round(height)}" fill="${bg}" rx="6"/>`,
  ]
  for (const edge of graph.edges) {
    const a = at(edge.from, indexOf.get(edge.from) ?? 0)
    const b = at(edge.to, indexOf.get(edge.to) ?? 0)
    const stroke = edge.boundary ? boundaryColor : edgeColor
    parts.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${stroke}" stroke-width="1" ${edge.boundary ? 'stroke-dasharray="2 3"' : ''}/>`)
  }
  for (const [i, node] of nodes.entries()) {
    const p = at(node.id, i)
    const title = escapeXml(node.nickName ?? node.name)
    parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${nodeR.toFixed(1)}" fill="${nodeColor}"><title>${title}</title></circle>`)
  }
  parts.push('</svg>')
  return parts.join('')
}
