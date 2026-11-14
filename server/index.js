import express from 'express'
import { z } from 'zod'
import { prisma } from './db.js'
import cookieParser from 'cookie-parser'
import exercises from './routes/exercises.js'
import auth from './routes/auth.js'
import me from './routes/me.js'

const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(cookieParser())

// Is the API up, and can it reach the database?
app.get('/api/v1/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'up' })
  } catch {
    res.status(503).json({ status: 'error', db: 'down' })
  }
})

app.use('/api/v1/exercises', exercises)
app.use('/api/v1/auth', auth)
app.use('/api/v1/me', me)

// Anything else under /api is an unknown endpoint
app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Unknown endpoint' } })
})

// One error format for the whole API: { error: { code, message } }
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Invalid request', details: err.flatten().fieldErrors },
    })
  }
  console.error(err)
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))