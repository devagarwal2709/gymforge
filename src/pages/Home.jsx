import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'

const PROBLEMS = [
  ['Without GymForge', 'Walk in. Look around. Copy someone who looks like they know what they\'re doing. Do random machines. Leave unsure if it even counted. Don\'t come back.'],
  ['With GymForge', 'Open your plan. See today\'s session. Know exactly which exercises, how many sets, and why. Leave having done something that compounds.', true],
  ['The industry\'s answer', '500-exercise libraries. Conflicting advice. 12-week challenges that assume you already know what you\'re doing.'],
  ['Our answer', 'One plan. Built for you. Enough information to execute it well. Nothing more until you need it.'],
]
const STEPS = [
  ['Answer 6 questions', 'Your goal, experience, available days, equipment, bodyweight, and any injuries.'],
  ['Get your plan', 'A workout split built for where you are right now, with a clear explanation of why it works.'],
  ['See today\'s workout', 'Every exercise, set, and rep. Tap any exercise to learn how to do it properly.'],
  ['Show up. Execute. Return.', 'Day 1 becomes Day 7 becomes Day 90. The plan grows with you.'],
]
const FEATURES = [
  ['Personalized Split', 'PPL, Upper/Lower, or Full Body — matched to how many days you can actually commit to.'],
  ['Exercise Library', 'Instructions, muscles worked, the most common mistake, and a beginner alternative.'],
  ['Calorie Target', 'Your daily calorie and protein target, calculated from your body weight and goal.'],
]

export default function Home() {
  return (
    <Layout right={<Link to="/onboarding" className="nav-cta">Build My Plan</Link>}>
      <section className="hero">
        <span className="eyebrow">Day 1 → Day 90</span>
        <h1>Stop Guessing.<br /><em>Start Forging.</em></h1>
        <p className="hero-sub">Answer 6 questions. Get a personalized workout plan, calorie target, and the exact exercises to do tomorrow.</p>
        <div className="btn-row center">
          <Link to="/onboarding" className="btn-primary">Build My Plan →</Link>
          <Link to="/exercises" className="btn-ghost">Browse Exercises</Link>
        </div>
        <div className="stat-strip">
          {[['6', 'Questions to get started'], ['90', 'Days to build the habit'], ['0', 'Guesswork required']].map(([n, l]) => (
            <div key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="mono-label">The Real Problem</div>
        <h2>The gym isn't hard.<br />Knowing what to do is.</h2>
        <div className="grid-2">
          {PROBLEMS.map(([t, d, hl]) => (
            <div key={t} className={'card' + (hl ? ' highlight' : '')}>
              <div className="mono-label">{t}</div><p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="mono-label">How It Works</div>
        <h2>From zero to first<br />workout in 2 minutes.</h2>
        {STEPS.map(([t, d], i) => (
          <div className="step" key={t}>
            <div className="step-dot">0{i + 1}</div>
            <div><h3>{t}</h3><p className="muted">{d}</p></div>
          </div>
        ))}
      </section>

      <section className="block">
        <div className="mono-label">What You Get</div>
        <h2>Everything a beginner<br />actually needs.</h2>
        <div className="grid-2">
          {FEATURES.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      <section className="block">
        <div className="cta-box">
          <h2>Your first workout<br />is <em>tomorrow.</em></h2>
          <p className="muted">It takes two minutes to set up.</p>
          <Link to="/onboarding" className="btn-primary">Build My Plan →</Link>
        </div>
      </section>
    </Layout>
  )
}
