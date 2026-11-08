import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { WARMUP, WORKOUT } from '../data.js'
import { read, write, dateKey } from '../lib/storage.js'

const KEY = 'gf_session_' + dateKey()
const ALL = [WARMUP, ...WORKOUT]
const fresh = () => Object.fromEntries(ALL.map(e => [e.id, { sets: Array.from({ length: e.sets }, () => ({ done: false, weight: null })) }]))

function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)()
    const o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.3, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6)
    o.start(); o.stop(c.currentTime + 0.6)
  } catch {}
  navigator.vibrate?.([200, 100, 200])
}

function Card({ ex, data, active, onTap }) {
  const all = data.sets.every(s => s.done), any = data.sets.some(s => s.done)
  return (
    <div className={'exercise-card' + (all ? ' done' : active || any ? ' active' : '')}>
      <div className="exercise-top">
        <div className="grow"><div className="exercise-name">{ex.name}</div><div className="muted small">{ex.muscles}</div></div>
        {ex.tip && <Link to={`/exercises/${ex.id}`} className="amber-link small">How to →</Link>}
      </div>
      <div className="sets-row">
        {data.sets.map((s, i) => {
          const next = !s.done && !all && (i === 0 || data.sets[i - 1].done)
          return (
            <button key={i} className={'set-box' + (s.done ? ' done-set' : next ? ' active-set' : '')} onClick={() => onTap(ex.id, i)}>
              <div className="set-num">{ex.label || `Set ${i + 1}`}</div>
              <div className="set-reps">{ex.reps}</div>
              <div className="set-weight">{s.weight ? `${s.weight} kg` : '—'}</div>
            </button>
          )
        })}
      </div>
      {ex.tip && <div className="tip"><strong>Focus today:</strong> {ex.tip}</div>}
      {all && <div className="done-check">✓ Done</div>}
    </div>
  )
}

export default function Workout() {
  const [session, setSession] = useState(() => read(KEY) || fresh())
  const [pending, setPending] = useState(null)
  const [weight, setWeight] = useState('')
  const [timer, setTimer] = useState({ show: false, left: 0, next: '' })

  useEffect(() => write(KEY, session), [session])

  // countdown tick
  useEffect(() => {
    if (!timer.show || timer.left <= 0) return
    const t = setTimeout(() => setTimer(s => ({ ...s, left: s.left - 1 })), 1000)
    return () => clearTimeout(t)
  }, [timer.show, timer.left])

  // at zero: beep, then hide after 3s
  useEffect(() => {
    if (!timer.show || timer.left !== 0) return
    beep()
    const t = setTimeout(() => setTimer(s => ({ ...s, show: false })), 3000)
    return () => clearTimeout(t)
  }, [timer.show, timer.left])

  const isDone = id => session[id].sets.every(s => s.done)
  const doneCount = WORKOUT.filter(e => isDone(e.id)).length
  const firstUndone = ALL.find(e => !isDone(e.id))?.id

  const update = (id, idx, patch) =>
    setSession(s => ({ ...s, [id]: { sets: s[id].sets.map((x, i) => (i === idx ? { ...x, ...patch } : x)) } }))

  function tap(id, idx) {
    const s = session[id].sets[idx]
    if (s.done) return update(id, idx, { done: false, weight: null })
    if (id === 'warmup') return update(id, idx, { done: true })
    const last = [...session[id].sets].reverse().find(x => x.weight)
    setWeight(last ? String(last.weight) : '')
    setPending({ id, idx })
  }

  function nextLabel(id, idx) {
    const ex = ALL.find(e => e.id === id)
    if (idx + 1 < ex.sets) return `${ex.name} · Set ${idx + 2}`
    const later = ALL.slice(ALL.indexOf(ex) + 1).find(e => !isDone(e.id))
    return later ? `${later.name} · Set 1` : 'Session complete'
  }

  function finishSet(skip) {
    const { id, idx } = pending
    const w = skip ? NaN : parseFloat(weight)
    update(id, idx, { done: true, weight: isNaN(w) ? null : w })
    setTimer({ show: true, left: 120, next: nextLabel(id, idx) })
    setPending(null)
  }

  const pendingName = pending ? ALL.find(e => e.id === pending.id).name : ''

  return (
    <Layout back="/plan" backLabel="My plan">
      <div className="page-header">
        <div className="eyebrow">Monday · Full Body A · Week 1</div>
        <h1>Today's Session</h1>
        <div className="mono-label tight">45–55 min · 5 exercises · Full gym</div>
      </div>

      <div className="card progress-card">
        <div className="grow">
          <div className="mono-label tight">Session progress</div>
          <div className="track"><div className="fill" style={{ width: `${(doneCount / WORKOUT.length) * 100}%` }} /></div>
        </div>
        <div className="progress-count"><span>{doneCount}</span> / {WORKOUT.length}</div>
      </div>

      <div className="mono-label">Warm up — 5 min</div>
      <div className="exercise-list">
        <Card ex={WARMUP} data={session.warmup} active={firstUndone === 'warmup'} onTap={tap} />
      </div>

      <div className="mono-label gap-top">Main work</div>
      <div className="exercise-list" style={{ '--fill': doneCount / WORKOUT.length }}>
        {WORKOUT.map((ex, i) => (
          <div key={ex.id} className="contents">
            {i > 0 && <div className="rest-row"><span>Rest</span><i /><span>2–3 min</span></div>}
            <Card ex={ex} data={session[ex.id]} active={firstUndone === ex.id} onTap={tap} />
          </div>
        ))}
      </div>

      {doneCount === WORKOUT.length && (
        <div className="cta-box">
          <h2>Session <em>Complete.</em></h2>
          <p className="muted">Full Body A done. Rest tomorrow. Wednesday is Full Body B — different exercises, same effort.</p>
          <div className="btn-row center">
            <Link to="/plan" className="btn-primary">Back to my plan →</Link>
            <Link to="/nutrition" className="btn-ghost">Check nutrition</Link>
          </div>
        </div>
      )}
      <div style={{ height: 70 }} />

      <div className={'timer-bar' + (timer.show ? ' visible' : '')}>
        <div className="nav-inner">
          <div>
            <div className="mono-label tight">Rest timer</div>
            <div className={'timer-value' + (timer.left <= 10 && timer.left > 0 ? ' urgent' : '')}>{Math.floor(timer.left / 60)}:{String(timer.left % 60).padStart(2, '0')}</div>
          </div>
          <div className="timer-next muted small">Up next<strong>{timer.next}</strong></div>
          <button className="btn-ghost sm" onClick={() => setTimer(s => ({ ...s, show: false }))}>Skip →</button>
        </div>
      </div>

      <div className={'modal-overlay' + (pending ? ' open' : '')} onClick={e => e.target === e.currentTarget && setPending(null)}>
        <div className="modal">
          <h3 className="lg">{pendingName} · Set {pending ? pending.idx + 1 : ''}</h3>
          <p className="muted small">How much did you lift? Skip if you're not tracking yet.</p>
          <div className="input-row">
            <input className="input-field" type="number" inputMode="decimal" min="0" placeholder="0" value={weight}
              onChange={e => setWeight(e.target.value)} onKeyDown={e => e.key === 'Enter' && finishSet(false)} />
            <div className="unit-badge">kg</div>
          </div>
          <div className="btn-row">
            <button className="btn-primary grow" onClick={() => finishSet(false)}>Done</button>
            <button className="btn-ghost" onClick={() => finishSet(true)}>Skip</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
