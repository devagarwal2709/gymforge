import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider.jsx'

// back + backLabel => "← back" link on the right. right => any custom node.
export default function Layout({ back, backLabel, right, children }) {
  const { user, logout } = useAuth()
  const [confirming, setConfirming] = useState(false)

  const doLogout = async () => {
    setConfirming(false)
    await logout()
  }

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo">Gym<span>Forge</span></Link>
          <div className="nav-right">
            {back ? <Link to={back} className="nav-back">← {backLabel}</Link> : right}
            {user
              ? <button className="nav-link" onClick={() => setConfirming(true)} title={user.email}>Log out</button>
              : <Link to="/login" className="nav-link">Log in</Link>}
          </div>
        </div>
      </nav>
      <main className="page">{children}</main>
      <footer>
        <div className="nav-inner">
          <span className="logo small">Gym<span>Forge</span></span>
          <span className="muted">Phase 3 · React</span>
        </div>
      </footer>

      <div className={'modal-overlay' + (confirming ? ' open' : '')} onClick={e => e.target === e.currentTarget && setConfirming(false)}>
        <div className="modal">
          <h3 className="lg">Log out?</h3>
          <p className="muted small">You'll need to log in again to get back to your account.</p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <button className="btn-primary grow" onClick={doLogout}>Yes, log out</button>
            <button className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  )
}