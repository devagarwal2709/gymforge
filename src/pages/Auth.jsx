import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { useAuth } from '../lib/AuthProvider.jsx'
import { api } from '../lib/api.js'

const MODES = {
  login: { eyebrow: 'Your account', h1: ['Log in', 'and train.'], button: 'Log in', email: true, password: true },
  register: { eyebrow: 'Your account', h1: ['Create your', 'account.'], button: 'Create account', email: true, password: true },
  forgot: { eyebrow: 'Reset password', h1: ['Forgot', 'password?'], button: 'Send reset link', email: true, password: false },
  reset: { eyebrow: 'Reset password', h1: ['Choose a', 'new password.'], button: 'Save password', email: false, password: true },
}

// Must match the rules in server/routes/auth.js (the server has the final say)
const RULES = [
  ['At least 8 characters', p => p.length >= 8],
  ['An uppercase letter', p => /[A-Z]/.test(p)],
  ['A lowercase letter', p => /[a-z]/.test(p)],
  ['A number', p => /[0-9]/.test(p)],
  ['A symbol (like ! or @)', p => /[^A-Za-z0-9]/.test(p)],
]

export default function Auth({ mode }) {
  const m = MODES[mode]
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [busy, setBusy] = useState(false)

  const needsStrongPassword = m.password && mode !== 'login'
  const passwordOk = !needsStrongPassword || RULES.every(([, test]) => test(password))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/plan')
      } else if (mode === 'register') {
        await register(email, password)
        navigate('/onboarding')
      } else if (mode === 'forgot') {
        await api('POST', '/auth/forgot', { email })
        setNotice('If that email has an account, a reset link is on its way. (No email service yet — in development the link appears in the terminal running the API.)')
      } else {
        await api('POST', '/auth/reset', { token, password })
        navigate('/login', { state: { notice: 'Password updated. Log in with your new password.' } })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Already logged in? Don't show the login or register form again.
  if (user && (mode === 'login' || mode === 'register')) {
    return (
      <Layout back="/" backLabel="Home">
        <div className="page-header">
          <div className="eyebrow">Your account</div>
          <h1>You're<br /><em>logged in.</em></h1>
          <p className="muted">Signed in as <strong>{user.email}</strong>.</p>
        </div>
        <div className="btn-row">
          <Link to="/plan" className="btn-primary">Go to my plan →</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout back="/" backLabel="Home">
      <div className="page-header">
        <div className="eyebrow">{m.eyebrow}</div>
        <h1>{m.h1[0]}<br /><em>{m.h1[1]}</em></h1>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {notice && <div className="notice">{notice}</div>}

        {m.email && (
          <>
            <div className="mono-label tight">Email</div>
            <input className="search-input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </>
        )}
        {m.password && (
          <>
            <div className="mono-label tight">{mode === 'reset' ? 'New password' : 'Password'}</div>
            <input
              className="search-input" type="password" required value={password} onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {needsStrongPassword && (
              <ul className="pw-rules">
                {RULES.map(([label, test]) => (
                  <li key={label} className={test(password) ? 'ok' : ''}>{test(password) ? '✓' : '○'} {label}</li>
                ))}
              </ul>
            )}
          </>
        )}
        {mode === 'reset' && !token && <div className="error">This link is missing its token. Request a new one.</div>}
        {error && <div className="error">{error}</div>}

        <button className="btn-primary" disabled={busy || !passwordOk || (mode === 'reset' && !token)}>
          {busy ? 'One moment…' : m.button}
        </button>

        <div className="auth-links">
          {mode === 'login' && <><Link to="/register" className="amber-link">Create an account</Link><Link to="/forgot-password" className="amber-link">Forgot password?</Link></>}
          {mode === 'register' && <Link to="/login" className="amber-link">I already have an account</Link>}
          {mode === 'forgot' && <Link to="/login" className="amber-link">Back to log in</Link>}
          {mode === 'reset' && <Link to="/forgot-password" className="amber-link">Request a new link</Link>}
        </div>
      </form>
    </Layout>
  )
}