// Helpers for tokens and cookies. Nothing here touches the database.
import jwt from 'jsonwebtoken'
import { randomBytes, createHash } from 'node:crypto'

const SECRET = process.env.JWT_SECRET
if (!SECRET) throw new Error('JWT_SECRET is missing. Add it to your .env file, then restart npm run dev.')

export const ACCESS_MINUTES = 15 // short-lived: proves who you are on each request
export const REFRESH_DAYS = 30   // long-lived: lets you get a new access token without logging in again

export const sha256 = s => createHash('sha256').update(s).digest('hex')
export const randomToken = () => randomBytes(32).toString('hex')

export const signAccess = userId => jwt.sign({ sub: userId }, SECRET, { expiresIn: `${ACCESS_MINUTES}m` })
export const verifyAccess = token => jwt.verify(token, SECRET) // throws if missing, tampered or expired

// httpOnly = JavaScript in the page can never read these cookies (protects against stolen tokens)
const base = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('gf_access', accessToken, { ...base, path: '/', maxAge: ACCESS_MINUTES * 60 * 1000 })
  // The refresh cookie is only ever sent to the auth routes
  res.cookie('gf_refresh', refreshToken, { ...base, path: '/api/v1/auth', maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000 })
}

export function clearAuthCookies(res) {
  res.clearCookie('gf_access', { ...base, path: '/' })
  res.clearCookie('gf_refresh', { ...base, path: '/api/v1/auth' })
}