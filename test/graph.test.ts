import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseGhJsonGraph, graphStats, renderGraphSvg, ghJsonCard, GhJsonParseError, layoutGraph, validateGhJsonDocument } from '../src/index.js'

const sample = {
  schema: '1.0',
  metadata: { description: 'Tower generator', author: 'Jane', dependencies: ['Kangaroo2'] },
  components: [
    { id: 1, name: 'Slider', nickName: 'Length', library: 'Params', pivot: '10,10', outputSettings: [{}] },
    { id: 2, name: 'Slider', nickName: 'Height', library: 'Params', pivot: '10,80', outputSettings: [{}] },
    { id: 3, name: 'Addition', library: 'Maths', pivot: '120,40', inputSettings: [{}, {}], outputSettings: [{}] },
    { id: 4, name: 'Panel', library: 'Params', pivot: '240,40', inputSettings: [{}] },
  ],
  connections: [
    { from: { id: 1, paramIndex: 0 }, to: { id: 3, paramIndex: 0 } },
    { from: { id: 2, paramIndex: 0 }, to: { id: 3, paramIndex: 1 } },
    { from: { id: 3, paramIndex: 0 }, to: { id: 4, paramIndex: 0 } },
    { from: { id: 99, paramIndex: 0 }, to: { id: 4, paramIndex: 0 }, boundary: true },
  ],
  groups: [{ name: 'Inputs', color: 'argb:255,200,220,255', members: [1, 2] }],
}

describe('parseGhJsonGraph', () => {
  it('parses nodes, edges, groups and pivot positions', () => {
    const graph = parseGhJsonGraph(sample)
    assert.equal(graph.nodes.size, 4)
    assert.equal(graph.edges.length, 4)
    assert.equal(graph.edges[3].boundary, true)
    assert.equal(graph.nodes.get(3)?.x, 120)
    assert.equal(graph.nodes.get(1)?.group, 'Inputs')
  })

  it('parses JSON strings and rejects non-documents', () => {
    const graph = parseGhJsonGraph(JSON.stringify(sample))
    assert.equal(graph.nodes.size, 4)
    assert.throws(() => parseGhJsonGraph({} as never), GhJsonParseError)
  })

  it('assigns sequential ids when components omit id', () => {
    const graph = parseGhJsonGraph({ components: [{ name: 'A' }, { name: 'B' }], connections: [{ from: { id: 1 }, to: { id: 2 } }] })
    assert.equal(graph.nodes.get(1)?.name, 'A')
    assert.equal(graph.edges.length, 1)
    assert.equal(graph.edges[0].boundary, false)
  })
})

describe('graphStats', () => {
  it('computes topology stats', () => {
    const stats = graphStats(parseGhJsonGraph(sample))
    assert.equal(stats.components, 4)
    assert.equal(stats.connections, 3) // drawable edges only — the boundary ref is not a wire
    assert.equal(stats.groups, 1)
    assert.equal(stats.sources, 2)
    assert.equal(stats.sinks, 1)
    assert.equal(stats.longestPath, 2)
    assert.equal(stats.boundaryEdges, 1)
    assert.equal(stats.skippedConnections, 0)
    assert.deepEqual(stats.dependencies, ['Kangaroo2'])
    assert.deepEqual(stats.libraries, ['Maths', 'Params'])
  })

  it('tolerates cycles', () => {
    const graph = parseGhJsonGraph({
      components: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
      connections: [{ from: { id: 1 }, to: { id: 2 } }, { from: { id: 2 }, to: { id: 1 } }],
    })
    const stats = graphStats(graph)
    assert.equal(stats.longestPath, 0)
  })
})

describe('layoutGraph', () => {
  it('layers sources left and sinks right in reading order', () => {
    const layout = layoutGraph(parseGhJsonGraph(sample))
    // 1, 2 (sliders) → col 0; 3 (Addition) → col 1; 4 (Panel) → col 2
    assert.equal(layout.depth, 3)
    assert.deepEqual(layout.positions.get(1), { col: 0, row: 0 })
    assert.deepEqual(layout.positions.get(2), { col: 0, row: 1 })
    assert.deepEqual(layout.positions.get(3), { col: 1, row: 0 })
    assert.deepEqual(layout.positions.get(4), { col: 2, row: 0 })
  })

  it('tolerates cycles and isolates unconnected nodes at the left', () => {
    const layout = layoutGraph(parseGhJsonGraph({
      components: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }],
      connections: [{ from: { id: 1 }, to: { id: 2 } }, { from: { id: 2 }, to: { id: 1 } }],
    }))
    assert.equal(layout.positions.size, 3)
    assert.ok(layout.depth >= 2)
    assert.equal(layout.positions.get(3)!.col, 0)
  })
})

describe('renderGraphSvg', () => {
  it('renders a transparent layered svg with nodes and edges', () => {
    const svg = renderGraphSvg(parseGhJsonGraph(sample))
    assert.ok(svg.startsWith('<svg'))
    assert.ok(svg.includes('<circle'))
    assert.ok(svg.includes('<line'))
    assert.ok(!svg.includes('<rect')) // transparent by default
    assert.ok(!svg.includes('fill="#101418"'))
  })

  it('paints a themed background rect when asked', () => {
    const svg = renderGraphSvg(parseGhJsonGraph(sample), { theme: 'light', background: '#f8fafc' })
    assert.ok(svg.includes('<rect width="320"'))
    assert.ok(svg.includes('fill="#f8fafc"'))
    assert.ok(svg.indexOf('<rect') < svg.indexOf('<line')) // background sits under the wires
  })

  it('renders edgeless components in a single column', () => {
    const svg = renderGraphSvg(parseGhJsonGraph({ components: [{ name: 'A' }, { name: 'B' }] }))
    assert.ok(svg.includes('<circle'))
  })

  it('renders an empty transparent svg for an empty graph', () => {
    const svg = renderGraphSvg(parseGhJsonGraph({ components: [] }))
    assert.ok(svg.startsWith('<svg'))
    assert.ok(!svg.includes('<circle'))
  })
})

describe('schema validation', () => {
  it('rejects schema-invalid documents in strict mode and stays tolerant by default', () => {
    const invalid = { components: [{ bogus: true }], connections: 'nope' }
    assert.throws(() => parseGhJsonGraph(invalid as never, { strict: true }), GhJsonParseError)
    // Tolerant mode parses what it can.
    const graph = parseGhJsonGraph(invalid as never)
    assert.equal(graph.nodes.size, 1)
  })

  it('validates a conforming document and reports issues with paths', () => {
    const doc = {
      schema: '1.0',
      components: [{ id: 1, name: 'Addition' }],
      connections: [
        {
          from: { id: 1, paramName: 'Result', paramIndex: 0 },
          to: { id: 2, paramName: 'A', paramIndex: 0 },
          boundary: true,
        },
      ],
    }
    assert.equal(validateGhJsonDocument(doc).length, 0)
    const issues = validateGhJsonDocument({ components: 'x' })
    assert.ok(issues.length > 0)
    assert.ok(issues[0].path.length > 0)
  })
})

describe('spec-strict connection parsing', () => {
  /** Canonical doc with ids 1-3 + instanceGuids; each case mutates only the connection shape. */
  const withConns = (conns: unknown) => ({
    components: [
      { id: 1, name: 'A', instanceGuid: '11111111-1111-1111-1111-111111111111' },
      { id: 2, name: 'B', instanceGuid: '22222222-2222-2222-2222-222222222222' },
      { id: 3, name: 'C', instanceGuid: '33333333-3333-3333-3333-333333333333' },
    ],
    connections: conns,
  })
  const conn = (from: number, to: number) => ({ from: { id: from, paramIndex: 0 }, to: { id: to, paramIndex: 0 } })
  const parsedEdges = (doc: unknown) => parseGhJsonGraph(doc as never).edges.map(e => `${e.from}>${e.to}`)

  it('parses the spec endpoint shape and the accepted instanceGuid-in-id reference', () => {
    const variants: [string, unknown][] = [
      ['canonical paramIndex', [conn(1, 3)]],
      ['paramName', [{ from: { id: 1, paramName: 'Out' }, to: { id: 3, paramName: 'A' } }]],
      ['guid in id key', [{ from: { id: '11111111-1111-1111-1111-111111111111', paramIndex: 0 }, to: { id: '33333333-3333-3333-3333-333333333333', paramIndex: 0 } }]],
      ['numeric-string ids coerce', [{ from: { id: '1', paramIndex: 0 }, to: { id: '3', paramIndex: 0 } }]],
    ]
    for (const [name, conns] of variants) {
      assert.deepEqual(parsedEdges(withConns(conns)), ['1>3'], name)
      // …and validate clean: all are accepted spec shapes.
      assert.equal(validateGhJsonDocument(withConns(conns)).length, 0, name)
    }
  })

  it('skips non-spec endpoint spellings — validation names the canonical fix', () => {
    const variants: [string, unknown, RegExp][] = [
      ['component key', [{ from: { component: 1, paramIndex: 0 }, to: { component: 3, paramIndex: 0 } }], /"component" is not a spec key/],
      ['componentId key', [{ from: { componentId: 1, paramIndex: 0 }, to: { componentId: 3, paramIndex: 0 } }], /"componentId" is not a spec key/],
      ['instanceGuid endpoint key', [{ from: { instanceGuid: '11111111-1111-1111-1111-111111111111', paramIndex: 0 }, to: { id: 3, paramIndex: 0 } }], /"instanceGuid" is not a spec key/],
      ['bare endpoint values', [{ from: 1, to: 3 }], /must be an endpoint object/],
      ['flat id pairs', [{ from_id: 1, to_id: 3 }], /not the spec shape/],
      ['source/target keys', [{ source: { id: 1, paramIndex: 0 }, target: { id: 3, paramIndex: 0 } }], /"source" is not a spec key/],
    ]
    for (const [name, conns] of variants) {
      const doc = withConns(conns)
      const graph = parseGhJsonGraph(doc as never)
      assert.equal(graph.edges.length, 0, name)
      assert.equal(graph.skippedConnections, 1, name)
      assert.match(validateGhJsonDocument(doc).map(i => i.message).join('\n'), variants.find(v => v[0] === name)![2], name)
    }
  })

  it('flags non-canonical wire containers in validation', () => {
    for (const key of ['wires', 'links', 'edges']) {
      const doc = { ...withConns(undefined), [key]: [conn(1, 3)] }
      assert.equal(parsedEdges(doc).length, 0, key)
      assert.match(validateGhJsonDocument(doc).map(i => i.message).join('\n'), /must be named "connections"/, key)
    }
    const objMap = withConns({ '0': conn(1, 3) })
    assert.equal(parsedEdges(objMap).length, 0)
    assert.match(validateGhJsonDocument(objMap).map(i => i.message).join('\n'), /must be an array/)
    const embedded = { components: [{ id: 1, name: 'A' }, { id: 2, name: 'B', inputs: [{ from: { id: 1 } }] }] }
    assert.equal(parsedEdges(embedded).length, 0)
    assert.match(validateGhJsonDocument(embedded).map(i => i.message).join('\n'), /top-level "connections"/)
  })

  it('flags endpoints referencing missing components unless marked boundary', () => {
    const missing = withConns([conn(1, 99)])
    assert.match(validateGhJsonDocument(missing).map(i => i.message).join('\n'), /references no component/)
    const flagged = withConns([{ ...conn(1, 99), boundary: true }])
    assert.equal(validateGhJsonDocument(flagged).filter(i => /references no component/.test(i.message)).length, 0)
  })

  it('requires paramIndex or paramName per spec §4.3', () => {
    const doc = withConns([{ from: { id: 1 }, to: { id: 3 } }])
    assert.match(validateGhJsonDocument(doc).map(i => i.message).join('\n'), /paramIndex.*paramName/)
    assert.deepEqual(parsedEdges(doc), ['1>3']) // still drawable — validation, not parser, owns the rule
  })

  it('counts unresolvable entries as skippedConnections instead of dropping them silently', () => {
    const graph = parseGhJsonGraph(withConns([
      conn(1, 3),                      // good
      { from: { foo: 1, paramIndex: 0 }, to: { id: 3, paramIndex: 0 } },   // unrecognised endpoint shape
      { to: { id: 3, paramIndex: 0 } },               // missing from
      'not-a-connection',              // garbage entry
      { from: { id: '99999999-9999-9999-9999-999999999999', paramIndex: 0 }, to: { id: 3, paramIndex: 0 } }, // guid resolves nothing
    ]) as never)
    assert.equal(graph.edges.length, 1)
    assert.equal(graph.skippedConnections, 4)
    assert.equal(graphStats(graph).skippedConnections, 4)
  })

  it('keeps out-of-document endpoints as boundary edges, not skipped', () => {
    const graph = parseGhJsonGraph(withConns([{ ...conn(1, 99), boundary: true }]) as never)
    assert.equal(graph.edges.length, 1)
    assert.equal(graph.edges[0].boundary, true)
    assert.equal(graph.skippedConnections, 0)
    const stats = graphStats(graph)
    assert.equal(stats.connections, 0)   // not drawable
    assert.equal(stats.boundaryEdges, 1)
  })
})

describe('ghJsonCard', () => {
  it('combines stats + thumbnail', () => {
    const card = ghJsonCard(sample)
    assert.equal(card.stats.components, 4)
    assert.ok(card.svg.startsWith('<svg'))
  })
})
