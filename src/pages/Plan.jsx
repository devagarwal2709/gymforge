import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { SPLITS, DAYS } from '../data.js'
import { getProfile, getStreak, calcNutrition, dateKey } from '../lib/storage.js'

const GOALS = { lose_fat: 'losing fat', build_muscle: 'building muscle', get_stronger: 'getting stronger' }
const EQUIP = { full_gym: 'a full gym', home_gym: 'a home gym setup', bodyweight: 'bodyweight only' }
const RULES = [
  ['Progressive overload is the only rule that matters.', " Add a small amount of weight or one extra rep each session. If you do that, you're doing it right."],
  ['Rest 2–3 minutes between sets.', ' You need the rest to perform the next set well — the rest is part of the training.'],
  ['Technique before weight.', ' For the first two weeks, use weights that feel almost too easy. Build the movement pattern before you load it.'],
  ['Hit your protein target every day,', ' including rest days. Muscle is built during recovery, not during the session.'],
]

export default function Plan() {
  const p = getProfile()
  const S = SPLITS[p?.days || 3]
  const n = p?.nutrition || calcNutrition(75, 'build_muscle')
  const { streak, done, todayDone } = getStreak()
  const todayIdx = (new Date().getDay() + 6) % 7
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return dateKey(d) })

  const streakIcon = streak === 0 ? '💪' : streak >= 7 ? '🔥' : '⚡'
  const streakSub = streak === 0 ? "Complete today's workout to start your streak" : todayDone ? 'Trained today — keep it going' : 'Train today to keep your streak alive'

  return (
        <Layout right={
      <div className="nav-links">
        <Link to="/onboarding" className="nav-link">Edit answers</Link>
        <Link to="/exercises" className="nav-link">Exercises</Link>
        <Link to="/nutrition" className="nav-cta">Nutrition</Link>
      </div>
    }>
      <div className="page-header">
        <div className="eyebrow">Your Plan — Week 1 of 12</div>
        <h1>{S.h1[0]}<br /><em>{S.h1[1]}</em></h1>
        <p className="muted">Built for someone focused on {GOALS[p?.goal] || 'building muscle'} with access to {EQUIP[p?.equipment] || 'a full gym'}.</p>
      </div>

      <div className={'streak-card' + (streak >= 7 ? ' fire' : '')}>
        <div className="streak-icon">{streakIcon}</div>
        <div className="grow">
          <div className="mono-label tight">Current streak</div>
          <div className="streak-num">{streak} {streak === 1 ? 'day' : 'days'}</div>
          <div className="muted small">{streakSub}</div>
        </div>
        <div className="streak-dots">{last7.map(d => <span key={d} className={done.includes(d) ? (d === dateKey() ? 'today' : 'done') : ''} />)}</div>
      </div>

      <div className="plan-card">
        <div className="between">
          <div><div className="plan-name">{S.name}</div><div className="muted">{S.days}</div></div>
          <span className="badge amber">{p?.experience === 'over_6mo' ? 'Intermediate' : 'Beginner'}</span>
        </div>
        <div className="hairline-grid three">
          {[[p?.days || 3, 'Days / week'], ['45–60', 'Min / session'], [12, 'Week program']].map(([v, l]) => (
            <div key={l}><div className="cell-num">{v}</div><div className="cell-label">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="mono-label">Why this plan</div>
        <h3 className="lg">{S.whyTitle}</h3>
        {S.why.map(t => <p className="muted para" key={t}>{t}</p>)}
      </div>

      <h3 className="section-heading">Your week</h3>
      <div className="week-grid">
        {DAYS.map((d, i) => {
          const rest = S.schedule[i] === 'Rest'
          return <div key={d} className={'day-cell' + (rest ? ' rest' : ' active') + (i === todayIdx ? ' today' : '')}><div className="day-name">{d}</div><div className="day-type">{S.schedule[i]}</div></div>
        })}
      </div>

      <h3 className="section-heading">Sessions</h3>
      <div className="stack">
        {S.sessions.map(([label, name, ex], i) => (
          <Link to="/workout" key={label} className={'card row-link' + (i === 0 ? ' hot' : '')}>
            <div className="grow"><div className="mono-label tight">{label}</div><div className="row-name">{name}</div><div className="muted small">{ex}</div></div>
            {i === 0 && <span className="badge amber">Up next</span>}<span className="muted">→</span>
          </Link>
        ))}
      </div>

      <div className="card spaced">
        <div className="between"><h3 className="lg">Nutrition targets</h3><Link to="/nutrition" className="amber-link">Full breakdown →</Link></div>
        <div className="macro-row">
          {[['calories', n.calories.toLocaleString(), 'Calories', 'kcal / day'], ['protein', n.protein, 'Protein', 'g / day'], ['carbs', n.carbs, 'Carbs', 'g / day'], ['fat', n.fat, 'Fat', 'g / day']].map(([c, v, l, u]) => (
            <div className="macro-cell" key={l}><div className={'macro-num ' + c}>{v}</div><div className="cell-label">{l}</div><div className="muted small">{u}</div></div>
          ))}
        </div>
      </div>

      <h3 className="section-heading">Rules for week 1</h3>
      <div className="stack">
        {RULES.map(([b, t]) => <div className="card rule" key={b}><p className="muted"><strong>{b}</strong>{t}</p></div>)}
      </div>

      <div className="btn-row spaced">
        <Link to="/workout" className="btn-primary">Start today's workout →</Link>
        <Link to="/nutrition" className="btn-ghost">View nutrition plan</Link>
      </div>
    </Layout>
  )
}
