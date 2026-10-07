// Downloads the published GhJSON schema set into schema/ (vendored copy),
// regenerates src/schema-types.ts, and exits non-zero when nothing changed.
// Run manually or by .github/workflows/spec-sync.yml.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const BASE = process.env.GHJSON_SPEC_BASE ?? 'https://architects-toolkit.github.io/ghjson-spec/schema/v1.0'
const ROOT = new URL('../schema/', import.meta.url)

const fetchJson = async url => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return res.json()
}

const save = async (rel, obj) => {
  const file = new URL(rel, ROOT)
  await mkdir(new URL('.', file), { recursive: true })
  const next = `${JSON.stringify(obj, null, 2)}\n`
  const prev = await readFile(file, 'utf8').catch(() => null)
  if (prev !== next) await writeFile(file, next)
  return prev !== next
}

const collectRefs = (obj, refs = new Set()) => {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$ref' && typeof v === 'string' && !v.startsWith('#')) refs.add(v)
      else collectRefs(v, refs)
    }
  }
  return refs
}

let changed = false
const main = await fetchJson(`${BASE}/ghjson.schema.json`)
changed = (await save('ghjson.schema.json', main)) || changed

const seen = new Set()
const queue = [...collectRefs(main)]
while (queue.length) {
  const ref = queue.shift()
  const rel = ref.replace(/^\.\//, '')
  if (seen.has(rel)) continue
  seen.add(rel)
  const doc = await fetchJson(`${BASE}/${rel}`)
  changed = (await save(rel, doc)) || changed
  for (const inner of collectRefs(doc)) {
    const innerRel = inner.replace(/^\.\//, '')
    // Extension refs are relative to the extensions/ directory.
    const resolved = rel.startsWith('extensions/') ? `extensions/${innerRel}` : innerRel
    if (!seen.has(resolved)) queue.push(inner)
  }
}

execFileSync(process.env.PNPM ?? 'pnpm', ['codegen'], { stdio: 'inherit' })
const diff = execFileSync('git', ['status', '--porcelain', 'schema/', 'src/schema-types.ts'], { encoding: 'utf8' })
if (!diff.trim() && !changed) {
  console.log('schema set unchanged')
  process.exit(0)
}
console.log('schema set updated')
