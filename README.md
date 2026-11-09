# ghjson-graph

Standalone dependency-graph parser, stats, and SVG thumbnail renderer for
[GhJSON](https://github.com/architects-toolkit/ghjson-spec) documents
(the JSON format for Grasshopper definitions).

Zero runtime dependencies. Node ≥ 20, ESM, TypeScript.

```ts
import { parseGhJsonGraph, graphStats, renderGraphSvg, ghJsonCard } from '@architects-toolkit/ghjson-graph'

const graph = parseGhJsonGraph(document)       // nodes keyed by integer id, directed param edges, groups
const stats = graphStats(graph)                // components, connections, libraries, sources/sinks, longest path, boundary edges
const svg = renderGraphSvg(graph, { width: 320 })   // self-contained topology thumbnail at pivot positions
const card = ghJsonCard(document)              // { stats, svg } in one call
```

## Model

- **Nodes** — GhJSON `components`, keyed by their integer `id` (sequential
  fallback when omitted). Carry `name`, `nickName`, `library`,
  `componentGuid`, pivot position, input/output counts, and group.
- **Edges** — `connections` entries: `from`/`to` component ids plus the
  parameter index or name. The parser is tolerant: endpoint spellings like
  `component`, `componentId`, `instanceGuid` (resolved through the
  components' instanceGuid → id), bare numbers, numeric strings, flat
  `from_id`/`to_id` pairs, `source`/`target` keys and `wires`/`links`/`edges`
  list aliases all resolve — entries that still match nothing count under
  `graph.skippedConnections` instead of vanishing silently. Edges marked
  `boundary` (or referencing missing components) are kept and flagged,
  never dropped — paginated documents stay honest.
- **Stats** — `graphStats` reports component/connection/group counts,
  distinct libraries, declared plugin dependencies, source/sink counts,
  longest directed path (cycle-tolerant), boundary-edge count and skipped
  connections. `connections` counts drawable edges only (both endpoints
  resolve to a component); undrawable out-of-document refs count under
  `boundaryEdges`.
- **SVG** — `renderGraphSvg` draws the real canvas topology from pivots
  (deterministic grid fallback when positions are missing). Pure string
  output — render server-side, embed anywhere; no DOM needed. Options:
  `width`, `padding`, `theme` (`'dark'`|`'light'`) and `background` (opaque
  fill behind the topology — transparent when omitted).

## Develop

```bash
npm install
npm test        # node:test via tsx
npm run build   # tsc → dist/
```

## License

LGPL-3.0-only, matching the architects-toolkit projects.
