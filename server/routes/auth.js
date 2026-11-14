import { Router } from 'express'
import argon2 from 'argon2'
import { z } from 'zod'
import { prisma } from '../db.js'
import { sha256, randomToken, signAccess, setAuthCookies, clearAuthCookies, REFRESH_DAYS } from '../auth/tokens.js'

const router = Router()
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)
const fail = (res, status, code, message) => res.status(status).json({ error: { code, message } })
const hashPassword = pw => argon2.hash(pw, { type: argon2.argon2id })

const email = z.string().trim().toLowerCase().email('Enter a valid email').max(254)
const newPassword = z.string().min(8, 'Use at least 8 characters').max(128)

// Used so a wrong email takes as long to reject as a wrong password (no account-guessing by timing)
const DUMMY_HASH = await hashPassword('not-a-real-password')

// Creates a refresh token in the database and sets both cookies
async function startSession(res, userId) {
  const refresh = randomToken()
  await prisma.refreshToken.create({
    data: { userId, tokenHash: sha256(refresh), expiresAt: new Date(Date.now() + REFRESH_DAYS * 86400000) },
  })
  setAuthCookies(res, signAccess(userId), refresh)
}

// POST /api/v1/auth/register   { email, password }
router.post('/register', wrap(async (req, res) => {
  const body = z.object({ email, password: newPassword }).parse(req.body)
  if (await prisma.user.findUnique({ where: { email: body.email } })) {
    return fail(res, 409, 'EMAIL_TAKEN', 'An account with this email already exists')
  }
  const user = await prisma.user.create({ data: { email: body.email, passwordHash: await hashPassword(body.password) } })
  await startSession(res, user.id)
  res.status(201).json({ user: { id: user.id, email: user.email } })
}))

// POST /api/v1/auth/login   { email, password }
router.post('/login', wrap(async (req, res) => {
  const body = z.object({ email, password: z.string().min(1).max(128) }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  const ok = await argon2.verify(user ? user.passwordHash : DUMMY_HASH, body.password)
  if (!user || !ok) return fail(res, 401, 'INVALID_CREDENTIALS', 'Wrong email or password')
  await startSession(res, user.id)
  res.json({ user: { id: user.id, email: user.email } })
}))

// POST /api/v1/auth/refresh   (uses the refresh cookie)
// Every refresh token works once: using it swaps it for a brand-new one ("rotation").
router.post('/refresh', wrap(async (req, res) => {
  const raw = req.cookies.gf_refresh
  if (!raw) return fail(res, 401, 'UNAUTHORIZED', 'Please log in')

  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(raw) } })
  if (!record || record.expiresAt < new Date()) {
    clearAuthCookies(res)
    return fail(res, 401, 'UNAUTHORIZED', 'Please log in')
  }
  if (record.revokedAt) {
    // An already-used token came back. A few seconds late = two tabs racing, so just refuse.
    // Much later = possibly stolen, so end every session for this user.
    if (Date.now() - record.revokedAt.getTime() > 10000) {
      await prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } })
      clearAuthCookies(res)
    }
    return fail(res, 401, 'UNAUTHORIZED', 'Please log in')
  }

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } })
  await startSession(res, record.userId)
  res.json({ ok: true })
}))

// POST /api/v1/auth/logout
router.post('/logout', wrap(async (req, res) => {
  const raw = req.cookies.gf_refresh
  if (raw) {
    await prisma.refreshToken.updateMany({ where: { tokenHash: sha256(raw), revokedAt: null }, data: { revokedAt: new Date() } })
  }
  clearAuthCookies(res)
  res.json({ ok: true })
}))

// POST /api/v1/auth/forgot   { email }
router.post('/forgot', wrap(async (req, res) => {
  const body = z.object({ email }).parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (user) {
    const token = randomToken()
    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    })
    // There is no email service yet, so in development the link is printed in this terminal.
    if (process.env.NODE_ENV !== 'production') {
      const link = `${process.env.APP_URL || 'http://localhost:5173'}/#/reset-password?token=${token}`
      console.log(`\n[password reset] ${user.email}\n${link}\n`)
    }
  }
  // Same answer whether or not the account exists, so nobody can check who has an account
  res.json({ ok: true })
}))

// POST /api/v1/auth/reset   { token, password }
router.post('/reset', wrap(async (req, res) => {
  const body = z.object({ token: z.string().min(10).max(200), password: newPassword }).parse(req.body)
  const record = await prisma.passwordReset.findUnique({ where: { tokenHash: sha256(body.token) } })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return fail(res, 400, 'INVALID_TOKEN', 'This reset link is invalid or has expired')
  }
  const passwordHash = await hashPassword(body.password)
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // changing your password logs you out everywhere
    prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ])
  res.json({ ok: true })
}))

export default router