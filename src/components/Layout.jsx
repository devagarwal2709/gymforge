import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthProvider.jsx'

// back + backLabel => "← back" link on the right. right => any custom node.
export default function Layout({ back, backLabel, right, children }) {
  const { user, logout } = useAuth()
  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo">Gym<span>Forge</span></Link>
          <div className="nav-right">
            {back ? <Link to={back} className="nav-back">← {backLabel}</Link> : right}
            {user
              ? <button className="nav-link" onClick={logout} title={user.email}>Log out</button>
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
    </>
  )
}