import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseGhJsonGraph, graphStats, renderGraphSvg, ghJsonCard, GhJsonParseError } from '../src/index.js'

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
    assert.equal(stats.connections, 4)
    assert.equal(stats.groups, 1)
    assert.equal(stats.sources, 2)
    assert.equal(stats.sinks, 1)
    assert.equal(stats.longestPath, 2)
    assert.equal(stats.boundaryEdges, 1)
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

describe('renderGraphSvg', () => {
  it('renders a self-contained svg with nodes and edges', () => {
    const svg = renderGraphSvg(parseGhJsonGraph(sample))
    assert.ok(svg.startsWith('<svg'))
    assert.ok(svg.includes('<circle'))
    assert.ok(svg.includes('<line'))
    assert.ok(svg.includes('stroke-dasharray')) // boundary edge
  })

  it('falls back to a grid when pivots are missing', () => {
    const svg = renderGraphSvg(parseGhJsonGraph({ components: [{ name: 'A' }, { name: 'B' }] }))
    assert.ok(svg.includes('<circle'))
  })
})

describe('ghJsonCard', () => {
  it('combines stats + thumbnail', () => {
    const card = ghJsonCard(sample)
    assert.equal(card.stats.components, 4)
    assert.ok(card.svg.startsWith('<svg'))
  })
})
