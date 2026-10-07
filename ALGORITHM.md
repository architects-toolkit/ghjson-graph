# ghjson-graph layout algorithm

The layered left-to-right layout (`src/layout.ts`) arranges a GhJSON wiring
graph so sources sit leftmost, sinks rightmost, and parallel branches stack
vertically — the Grasshopper-independent part of the ghjson-dotnet tidy-up
(Sugiyama-style layering, no Rhino canvas concepts).

It is deliberately small (~150 lines) and deterministic: the same document
always produces the same positions. `test/golden.test.ts` pins that with
golden fixtures so ports to other languages can verify parity against the
same expected outputs.

## Steps

1. **Back-edge neutralization.** DFS from every node; an edge that points
   back into an ancestor on the DFS stack (a cycle) is marked `back` and
   excluded from ranking and ordering — the drawing still renders it, it just
   does not participate in layering. Boundary edges (endpoints outside the
   document) are drawn dashed; that is the only edge styling.
2. **Rank assignment (columns).** `rank(v) = 0` for sources, else
   `1 + max(rank(u))` over incoming non-reversed edges. Longest-path ranking:
   a node sits one column right of its deepest upstream dependency.
3. **Within-layer ordering.** Alternating median-barycenter sweeps
   (down-sweep orders each layer by the median position of its nodes'
   predecessors, up-sweep by successors), 4 passes, stable ties on the
   initial document order. Classic Sugiyama crossing reduction without the
   crossing-count passes — sufficient at thumbnail density.
4. **Positioning.** `x = rank * CELL_X`, `y = row * CELL_Y`; rows are assigned
   compactly top-down per layer. `RenderOptions` maps these grid coordinates
   to pixels; `renderGraphSvg` scales the result to fit `width` while
   preserving aspect, so the rendered span is proportional to graph width —
   a wider thumbnail = a wider definition.

## Output contract

`layoutGraph(graph) → { positions: Map<id,{col,row}>, layers: number[][],
depth: number, height: number }`. `positions` are grid cells (integers),
`layers` orders node ids within each column for rendering, `depth`/`height`
are the grid extents. Back edges are not reported — they are an internal
detail of the layering pass.

## Fixtures

`test/fixtures/*.ghjson.json` — real documents reduced to their wiring
section. `test/fixtures/*.layout.json` — the golden `{positions, depth,
height}` for each, generated once and reviewed. Regenerate intentionally with
`UPDATE_GOLDEN=1 pnpm test`; an unexpected diff is a regression, not a
refresh.
