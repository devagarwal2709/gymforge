import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { FOODS } from '../data.js'
import { getProfile, calcNutrition } from '../lib/storage.js'

const GOALS = { lose_fat: 'losing fat', build_muscle: 'building muscle', get_stronger: 'getting stronger' }
const ADJ = { lose_fat: 'a 300 kcal deficit', build_muscle: 'a 200 kcal surplus', get_stronger: 'a 100 kcal surplus' }
const IGNORE = [
  ['Tracking carbs and fat precisely', "Save that for later. Right now it adds effort without meaningful return. Hit protein, eat mostly whole foods, and you'll be close enough."],
  ['Obsessive calorie counting', 'The target is a guide, not a hard ceiling. Within 100–150 kcal on most days is fine. Consistency over weeks matters more than daily precision.'],
  ['Supplements (except maybe protein powder)', "Creatine is legitimate. Most else is marketing. A shake is useful if you can't hit your protein from food."],
  ['Eating perfectly every day', "One bad day doesn't undo a good week. Get back on it the next meal."],
]

export default function Nutrition() {
  const p = getProfile()
  const kg = p?.bodyweightKg || 75
  const goal = p?.goal || 'build_muscle'
  const n = p?.nutrition || calcNutrition(kg, goal)
  const bw = p?.unit === 'lbs' ? `${Math.round(kg * 2.205)} lbs` : `${kg} kg`

  return (
    <Layout back="/plan" backLabel="My plan">
      <div className="page-header">
        <div className="eyebrow">Your Nutrition Targets</div>
        <h1>Fuel<br />the Work.</h1>
        <p className="muted">Calculated for a {kg}kg person focused on {GOALS[goal]}. One number matters more than all the others.</p>
      </div>

      <div className="plan-card">
        <div className="between top">
          <div><div className="mono-label amber-text tight">Daily calorie target</div><div className="big-num">{n.calories.toLocaleString()}</div><div className="muted small">kcal / day</div></div>
          <div className="card calc"><div className="mono-label tight">How this was calculated</div><p className="muted small">Body weight <strong>{bw}</strong> × activity multiplier (1.55), adjusted with {ADJ[goal]}.</p></div>
        </div>
        <p className="muted para">This is a starting point, not a verdict. If after two weeks you're gaining too fast, drop by 100–150 kcal. If nothing is changing, add the same.</p>
      </div>

      <div className="mono-label">Macro breakdown</div>
      <div className="hairline-grid three">
        {[['protein', n.protein, 'Protein'], ['carbs', n.carbs, 'Carbs'], ['fat', n.fat, 'Fat']].map(([c, v, l]) => (
          <div key={l}><div className={'macro-num ' + c}>{v}</div><div className="cell-label">g / day</div><div className="muted small">{l}</div></div>
        ))}
      </div>

      <div className="protein-card">
        <h3 className="lg">Protein is the only macro that matters right now</h3>
        <p className="muted para">Carbs and fat are flexible — your body handles them across a wide range without meaningful differences at this stage. Protein is the raw material for building and repairing muscle, and your body can't store it like fat or glycogen.</p>
        <p className="muted para">You're training and creating micro-damage in muscle fibres. Protein is what repairs that damage. Without enough, you're doing the work and leaving the adaptation on the table.</p>
        <div className="protein-cue">→ Hit {n.protein}g protein every day — including rest days.</div>
      </div>

      <h3 className="section-heading">High-protein foods to build around</h3>
      <div className="grid-2 tight-top">
        {FOODS.map(([emoji, name, amt, desc]) => (
          <div className="card food" key={name}>
            <div className="emoji">{emoji}</div>
            <div><div className="row-name">{name}</div><div className="food-amt">{amt}</div><p className="muted small">{desc}</p></div>
          </div>
        ))}
      </div>

      <div className="cues">
        <div className="mono-label tight amber-text">When to eat — keep it simple</div>
        <div>→ Eat a protein meal 1–2 hours before training if you can.</div>
        <div>→ Eat a protein-rich meal within 1–2 hours after training.</div>
        <div>→ Spread protein across 3–4 meals instead of one large one.</div>
      </div>

      <h3 className="section-heading">What to ignore for now</h3>
      <div className="stack">
        {IGNORE.map(([t, d]) => <div className="card" key={t}><div className="row-name">{t}</div><p className="muted small">{d}</p></div>)}
      </div>

      <div className="btn-row spaced">
        <Link to="/workout" className="btn-primary">Start today's workout →</Link>
        <Link to="/plan" className="btn-ghost">My plan</Link>
      </div>
    </Layout>
  )
}
