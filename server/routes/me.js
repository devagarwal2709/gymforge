import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../auth/middleware.js'

const router = Router()

// GET /api/v1/me  -> the logged-in user, or 401
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    })
    if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please log in' } })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

export default router