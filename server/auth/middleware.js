import { verifyAccess } from './tokens.js'

// Put this in front of any route that needs a logged-in user.
// After it runs, req.userId is available.
export function requireAuth(req, res, next) {
  try {
    req.userId = verifyAccess(req.cookies.gf_access).sub
    next()
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please log in' } })
  }
}