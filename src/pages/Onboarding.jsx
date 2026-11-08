import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { SPLITS } from '../data.js'
import { getProfile, write, calcNutrition } from '../lib/storage.js'

const QUESTIONS = [
  { key: 'goal', title: "What's your main goal right now?", hint: 'Pick the one that matters most. You can change this later.', opts: [['lose_fat', 'Lose fat', 'Burn fat while keeping muscle'], ['build_muscle', 'Build muscle', 'Get stronger and add size'], ['get_stronger', 'Get stronger', 'Improve lifts and performance']] },
  { key: 'experience', title: 'How long have you been training?', hint: 'Be honest — a beginner plan for an intermediate is worse than the other way around.', opts: [['never', 'Never', 'This is my first time in a gym'], ['under_6mo', 'Under 6 months', "I've been a few times but no real routine"], ['over_6mo', '6+ months', 'I have a base but need structure']] },
  { key: 'days', title: 'How many days can you train per week?', hint: 'Pick what you can actually commit to — not the ideal.', opts: [['3', '3 days', 'Full body — most effective for beginners'], ['4', '4 days', 'Upper / Lower split'], ['5', '5 days', 'Push / Pull / Legs']] },
  { key: 'equipment', title: 'What equipment do you have access to?', hint: 'Your plan will only include exercises you can actually do.', opts: [['full_gym', 'Full gym', 'Barbells, cables, machines — everything'], ['home_gym', 'Home gym', 'Dumbbells and a bench'], ['bodyweight', 'Bodyweight', 'No equipment — just my body']] },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const saved = getProfile()
  const [form, setForm] = useState({
    goal: saved?.goal || '', experience: saved?.experience || '', days: saved?.days || '', equipment: saved?.equipment || '',
    bodyweight: saved?.bodyweight || '', unit: saved?.unit || 'kg', injuries: saved?.injuries || '',
  })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function submit() {
    const errs = {}
    QUESTIONS.forEach(q => { if (!form[q.key]) errs[q.key] = true })
    const bw = parseFloat(form.bodyweight)
    if (!bw || bw < 20) errs.bodyweight = true
    setErrors(errs)
    if (Object.keys(errs).length) return
    const bodyweightKg = form.unit === 'lbs' ? Math.round(bw / 2.205) : bw
    write('gf_profile', {
      ...form, bodyweight: bw, bodyweightKg, split: SPLITS[form.days].name,
      nutrition: calcNutrition(bodyweightKg, form.goal),
    })
    navigate('/plan')
  }

  return (
    <Layout back="/" backLabel="Back">
      <div className="page-header">
        <div className="eyebrow">6 questions</div>
        <h1>Build Your<br />First Plan</h1>
        <p className="muted">Six honest answers. A plan built around you — not someone else's ideal schedule.</p>
      </div>

      {QUESTIONS.map(q => (
        <div className="question" key={q.key}>
          <h2>{q.title}</h2>
          <p className="hint">{q.hint}</p>
          <div className="radio-group">
            {q.opts.map(([v, t, d]) => (
              <button type="button" key={v} className={'radio-card' + (form[q.key] === v ? ' selected' : '')} onClick={() => set(q.key, v)}>
                <span className="radio-title">{t}</span><span className="radio-desc">{d}</span>
              </button>
            ))}
          </div>
          {errors[q.key] && <div className="error">Pick one to continue.</div>}
        </div>
      ))}

      <div className="question">
        <h2>What's your current bodyweight?</h2>
        <p className="hint">Used to calculate your calorie and protein targets. Nobody else sees this.</p>
        <div className="input-row">
          <input className="input-field" type="number" inputMode="decimal" placeholder="75" value={form.bodyweight} onChange={e => set('bodyweight', e.target.value)} />
          <div className="unit-toggle">
            {['kg', 'lbs'].map(u => <button type="button" key={u} className={form.unit === u ? 'on' : ''} onClick={() => set('unit', u)}>{u}</button>)}
          </div>
        </div>
        {errors.bodyweight && <div className="error">Enter your bodyweight to continue.</div>}
      </div>

      <div className="question">
        <h2>Any injuries or areas to avoid? <span className="badge">Optional</span></h2>
        <p className="hint">Bad shoulder, knee pain, lower back issues — anything that should shape your plan.</p>
        <textarea className="textarea-field" rows="3" placeholder="e.g. Bad left knee — avoid heavy squats and lunges" value={form.injuries} onChange={e => set('injuries', e.target.value)} />
      </div>

      <button className="btn-primary" onClick={submit}>Build My Plan →</button>
    </Layout>
  )
}
