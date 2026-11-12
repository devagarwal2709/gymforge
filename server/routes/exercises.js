import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'

const router = Router()

// Express 4 doesn't catch errors from async routes, so we forward them ourselves.
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)

const toListItem = e => ({
  slug: e.slug, name: e.name, level: e.level, equipment: e.equipment, primary: e.primaryMuscles,
})
const toDetail = e => ({
  slug: e.slug, name: e.name, level: e.level, force: e.force, mechanic: e.mechanic,
  category: e.category, equipment: e.equipment, primary: e.primaryMuscles,
  secondary: e.secondaryMuscles, instructions: e.instructions, images: e.images,
})

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
  muscle: z.string().max(40).optional(),
  equipment: z.string().max(40).optional(),
  level: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  slugs: z.string().max(4000).optional(), // comma-separated, used by the Favorites filter
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
})

// GET /api/v1/exercises?q=squat&muscle=quadriceps&equipment=barbell&level=beginner&limit=30&offset=0
router.get('/', wrap(async (req, res) => {
  const { q, muscle, equipment, level, slugs, limit, offset } = listQuery.parse(req.query)
  const words = (q || '').toLowerCase().split(/\s+/).filter(Boolean)

  const where = {
    AND: [
      ...words.map(w => ({ name: { contains: w, mode: 'insensitive' } })),
      ...(muscle ? [{ primaryMuscles: { has: muscle } }] : []),
      ...(equipment ? [{ equipment }] : []),
      ...(level ? [{ level }] : []),
      ...(slugs ? [{ slug: { in: slugs.split(',').slice(0, 200) } }] : []),
    ],
  }

  const [rows, total] = await prisma.$transaction([
    prisma.exercise.findMany({ where, orderBy: { name: 'asc' }, skip: offset, take: limit }),
    prisma.exercise.count({ where }),
  ])
  res.json({ items: rows.map(toListItem), total, limit, offset })
}))

// GET /api/v1/exercises/meta  -> options for the filter dropdowns
// (must be defined before '/:slug' so "meta" isn't treated as a slug)
router.get('/meta', wrap(async (req, res) => {
  const [muscles, equipment, total] = await Promise.all([
    prisma.$queryRaw`SELECT DISTINCT unnest("primaryMuscles") AS muscle FROM exercises ORDER BY muscle`,
    prisma.exercise.findMany({ select: { equipment: true }, distinct: ['equipment'], orderBy: { equipment: 'asc' } }),
    prisma.exercise.count(),
  ])
  res.json({
    muscles: muscles.map(r => r.muscle),
    equipment: equipment.map(r => r.equipment),
    levels: ['beginner', 'intermediate', 'expert'],
    total,
  })
}))

// GET /api/v1/exercises/:slug  -> one exercise plus a few similar ones
router.get('/:slug', wrap(async (req, res) => {
  const e = await prisma.exercise.findUnique({ where: { slug: req.params.slug } })
  if (!e) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Exercise not found' } })
  }
  const similar = e.primaryMuscles[0]
    ? await prisma.exercise.findMany({
        where: { slug: { not: e.slug }, equipment: e.equipment, primaryMuscles: { has: e.primaryMuscles[0] } },
        select: { slug: true, name: true },
        orderBy: { name: 'asc' },
        take: 4,
      })
    : []
  res.json({ ...toDetail(e), similar })
}))

export default router