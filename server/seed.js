// Loads the exercise dataset (src/data/exercises.json) into the database.
// Safe to re-run: it clears the table first, then inserts everything again.
//   npm run db:seed
import { readFile } from 'node:fs/promises'
import { prisma } from './db.js'

const raw = JSON.parse(await readFile(new URL('../src/data/exercises.json', import.meta.url), 'utf8'))

const data = raw.map(e => ({
  slug: e.slug,
  name: e.name,
  level: e.level,
  force: e.force,
  mechanic: e.mechanic,
  category: e.category,
  equipment: e.equipment,
  primaryMuscles: e.primary,
  secondaryMuscles: e.secondary,
  instructions: e.instructions,
  images: e.images,
}))

await prisma.$transaction([
  prisma.exercise.deleteMany(),
  prisma.exercise.createMany({ data, skipDuplicates: true }),
])
console.log(`Seeded ${await prisma.exercise.count()} exercises`)
await prisma.$disconnect()