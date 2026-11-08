import { Component, useLayoutEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Plan from './pages/Plan.jsx'
import Workout from './pages/Workout.jsx'
import Exercise from './pages/Exercise.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Exercises from './pages/Exercises.jsx'

// Scroll to top on every page change
function ScrollTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// If a page crashes, show the error instead of a blank screen
class Boundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error(error, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#F0EFED', fontFamily: 'monospace' }}>
          <h2>Something broke on this page</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#E05A5A', margin: '16px 0' }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <a href="#/" onClick={() => window.location.reload()} style={{ color: '#F5A623' }}>Reload</a>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollTop />
      <Boundary key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercises/:slug" element={<Exercise />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Boundary>
    </>
  )
}