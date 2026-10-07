import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseGhJsonGraph, layoutGraph } from '../src/index.js'

// Golden fixtures pin the layout contract for this and every future port:
// same GhJSON in → same positions out. Regenerate deliberately with
// UPDATE_GOLDEN=1; an unexpected diff is a regression.
const dir = fileURLToPath(new URL('./fixtures/', import.meta.url))
const cases = readdirSync(dir).filter(f => f.endsWith('.ghjson.json')).map(f => f.replace(/\.ghjson\.json$/, ''))

describe('golden layout fixtures', () => {
  for (const name of cases) {
    it(name, () => {
      const doc = JSON.parse(readFileSync(`${dir}${name}.ghjson.json`, 'utf8'))
      const l = layoutGraph(parseGhJsonGraph(doc))
      const actual = {
        positions: Object.fromEntries([...l.positions].map(([k, v]) => [k, v])),
        layers: l.layers,
        depth: l.depth,
        height: l.height,
      }
      const file = `${dir}${name}.layout.json`
      if (process.env.UPDATE_GOLDEN) {
        writeFileSync(file, `${JSON.stringify(actual, null, 1)}\n`)
      }
      assert.deepEqual(actual, JSON.parse(readFileSync(file, 'utf8')))
    })
  }
})
