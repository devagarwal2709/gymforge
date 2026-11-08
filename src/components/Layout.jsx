import { Link } from 'react-router-dom'

// back + backLabel => "← back" link on the right. right => any custom node.
export default function Layout({ back, backLabel, right, children }) {
  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo">Gym<span>Forge</span></Link>
          {back ? <Link to={back} className="nav-back">← {backLabel}</Link> : right}
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
