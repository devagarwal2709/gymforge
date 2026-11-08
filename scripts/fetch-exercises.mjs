// Downloads the free-exercise-db dataset (Unlicense) and saves a slim copy at src/data/exercises.json
// Run from the project root:  node scripts/fetch-exercises.mjs
import { writeFile, mkdir } from 'node:fs/promises'

const URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const res = await fetch(URL)
if (!res.ok) throw new Error(`Download failed: ${res.status}`)
const raw = await res.json()

const out = raw.map(e => ({
  slug: e.id,
  name: e.name,
  level: e.level || 'beginner',
  force: e.force || null,
  mechanic: e.mechanic || null,
  category: e.category || 'strength',
  equipment: e.equipment || 'none',
  primary: e.primaryMuscles || [],
  secondary: e.secondaryMuscles || [],
  instructions: e.instructions || [],
  images: e.images || [],
}))

await mkdir('src/data', { recursive: true })
await writeFile('src/data/exercises.json', JSON.stringify(out))
console.log(`Saved ${out.length} exercises to src/data/exercises.json`)
