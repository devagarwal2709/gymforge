import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import Video from '../components/Video.jsx'
import { EXERCISES, WORKOUT } from '../data.js'
import { fetchExercise, IMG_BASE, titleCase } from '../lib/library.js'
import { read, write } from '../lib/storage.js'

// For the workout exercises that don't have a hand-written guide yet
const FIND = { bench: 'bench press', row: 'bent over row', ohp: 'shoulder press', rdl: 'romanian deadlift' }
const LEVEL_TAG = { beginner: 'amber', intermediate: 'blue', expert: 'muted' }

export default function Exercise() {
  const { slug } = useParams()
  const curated = EXERCISES[slug]
  const meta = WORKOUT.find(e => e.id === slug)
  const isCurated = !!(curated && meta)
  const [ex, setEx] = useState(null)
  const [error, setError] = useState('')
  const [favs, setFavs] = useState(() => read('gf_favorites', []))

  // Library exercises come from the API. The hand-written guides need no request.
  useEffect(() => {
    if (isCurated) return
    let cancelled = false
    setEx(null)
    setError('')
    fetchExercise(slug)
      .then(d => { if (!cancelled) setEx(d) })
      .catch(e => { if (!cancelled) setError(e.status === 404 ? 'notfound' : e.message) })
    return () => { cancelled = true }
  }, [slug, isCurated])

  const isFav = favs.includes(slug)
  const toggleFav = () => {
    const next = isFav ? favs.filter(f => f !== slug) : [...favs, slug]
    setFavs(next)
    write('gf_favorites', next)
  }

  // Build one "view" object, from either the hand-written guide or the API
  let view = null
  if (isCurated) {
    view = { curated: true, name: meta.name, eyebrow: curated.eyebrow, tags: curated.tags, primary: curated.primary, secondary: curated.secondary }
  } else if (ex) {
    view = {
      name: ex.name,
      eyebrow: [titleCase(ex.category), titleCase(ex.mechanic)].filter(Boolean).join(' · '),
      tags: [[LEVEL_TAG[ex.level] || 'muted', ex.level], ['green', titleCase(ex.equipment)], ...(ex.force ? [['muted', ex.force]] : [])],
      primary: ex.primary.map(titleCase),
      secondary: ex.secondary.map(titleCase),
      plain: ex.instructions,
      images: ex.images,
      similar: ex.similar,
    }
  }
  const back = isCurated ? ['/workout', 'Back to workout'] : ['/exercises', 'Library']

  if (!view) {
    return (
      <Layout back={back[0]} backLabel={back[1]}>
        <div className="page-header">
          <h1>{error === 'notfound' ? 'Exercise not found' : error ? "Couldn't load" : 'Loading…'}</h1>
          {error && error !== 'notfound' && <p className="muted">{error}. Make sure the API is running.</p>}
          {error && <Link to="/exercises" className="amber-link">Browse the library →</Link>}
        </div>
      </Layout>
    )
  }

  return (
    <Layout back={back[0]} backLabel={back[1]}>
      <div className="page-header">
        <div className="between top">
          <div><div className="eyebrow muted-eyebrow">{view.eyebrow}</div><h1>{view.name}</h1></div>
          <button className={'fav-btn' + (isFav ? ' on' : '')} onClick={toggleFav}>{isFav ? '★ Saved' : '☆ Save'}</button>
        </div>
        <div className="tag-row">{view.tags.map(([c, t]) => <span key={t} className={'tag ' + c}>{t}</span>)}</div>
      </div>

      {view.curated && (
        <>
          <div className="card in-plan">
            <span className="dot amber" />
            <p className="muted grow"><strong>In today's session</strong> — Full Body A · 3 sets · 10 reps each</p>
            <Link to="/workout" className="amber-link small">Go to session →</Link>
          </div>
          <div className="hairline-grid three spaced">
            {[['3 × 10', 'Sets × Reps'], ['2–3 min', 'Rest'], ['Moderate', 'Intensity']].map(([v, l]) => (
              <div key={l}><div className="cell-num">{v}</div><div className="cell-label">{l}</div></div>
            ))}
          </div>
        </>
      )}

      {view.images?.length > 0 && (
        <div className="ex-imgs">
          {view.images.slice(0, 2).map(p => <img key={p} src={IMG_BASE + p} alt={view.name} loading="lazy" />)}
        </div>
      )}

      <Video slug={slug} />

      <div className="mono-label">Muscles worked</div>
      <div className="grid-2 tight-top">
        {[['Primary', view.primary, 'amber'], ['Secondary', view.secondary, 'grey']].map(([t, list, c]) => (
          <div className="card" key={t}>
            <div className="mono-label tight">{t}</div>
            {list.length ? list.map(m => <div className="muscle" key={m}><span className={'dot ' + c} />{m}</div>) : <p className="muted small">None listed</p>}
          </div>
        ))}
      </div>

      <hr className="divider" />

      {view.plain && (
        <>
          <h3 className="section-heading">How to do it</h3>
          <div className="stack">
            {view.plain.map((t, i) => (
              <div className="card step-item" key={i}><span className="step-n">{i + 1}</span><p className="muted">{t}</p></div>
            ))}
          </div>
          {view.similar.length > 0 && (
            <>
              <h3 className="section-heading">Similar exercises</h3>
              <div className="stack">
                {view.similar.map(s => (
                  <Link key={s.slug} to={`/exercises/${encodeURIComponent(s.slug)}`} className="card row-link">
                    <div className="grow"><div className="row-name">{s.name}</div></div><span className="muted">→</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {view.curated && curated.steps && (
        <>
          <h3 className="section-heading">How to do it</h3>
          <div className="stack">
            {curated.steps.map(([b, t], i) => (
              <div className="card step-item" key={b}><span className="step-n">{i + 1}</span><p className="muted"><strong>{b}</strong>{t}</p></div>
            ))}
          </div>
          <div className="cues">
            <div className="mono-label tight amber-text">Coaching cues — say these in your head</div>
            {curated.cues.map(c => <div key={c}>→ {c}</div>)}
          </div>
          <h3 className="section-heading">Common mistakes</h3>
          <div className="stack">
            {curated.mistakes.map(m => (
              <div className="card mistake" key={m.title}>
                <div className="mistake-icon">!</div>
                <div><div className="row-name">{m.title}</div><p className="muted small">{m.desc}</p><p className="fix">✓ Fix: {m.fix}</p></div>
              </div>
            ))}
          </div>
          <h3 className="section-heading">Can't do this? Try instead</h3>
          <div className="card"><div className="row-name">{curated.alt.name}</div><p className="muted small">{curated.alt.reason}</p></div>
        </>
      )}

      {view.curated && !curated.steps && (
        <div className="card">
          <p className="muted">Step-by-step instructions for this lift are in the exercise library.</p>
          <Link to={`/exercises?q=${encodeURIComponent(FIND[slug] || meta.name)}`} className="amber-link">Find it in the library →</Link>
        </div>
      )}

      <div className="btn-row spaced">
        <Link to={isCurated ? '/workout' : '/exercises'} className="btn-primary">{isCurated ? 'Back to workout' : 'Back to library'} →</Link>
        <Link to="/plan" className="btn-ghost">My plan</Link>
      </div>
    </Layout>
  )
}