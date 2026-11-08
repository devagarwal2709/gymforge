import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { loadLibrary, titleCase } from '../lib/library.js'
import { read } from '../lib/storage.js'

const PAGE = 30
const uniq = (list, pick) => [...new Set(list.flatMap(pick).filter(Boolean))].sort()

export default function Exercises() {
  const [params] = useSearchParams()
  const [all, setAll] = useState(null)
  const [f, setF] = useState({ q: params.get('q') || '', muscle: '', equipment: '', level: '', favOnly: false })
  const [visible, setVisible] = useState(PAGE)
  const favs = useMemo(() => read('gf_favorites', []), [])

  useEffect(() => { loadLibrary().then(setAll) }, [])
  const set = (k, v) => { setF(s => ({ ...s, [k]: v })); setVisible(PAGE) }

  const options = useMemo(() => all && ({
    muscle: uniq(all, e => e.primary),
    equipment: uniq(all, e => [e.equipment]),
    level: ['beginner', 'intermediate', 'expert'],
  }), [all])

  const results = useMemo(() => {
    if (!all) return []
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean)
    return all.filter(e =>
      words.every(w => e.name.toLowerCase().includes(w)) &&
      (!f.muscle || e.primary.includes(f.muscle)) &&
      (!f.equipment || e.equipment === f.equipment) &&
      (!f.level || e.level === f.level) &&
      (!f.favOnly || favs.includes(e.slug))
    )
  }, [all, f, favs])

  const clear = () => { setF({ q: '', muscle: '', equipment: '', level: '', favOnly: false }); setVisible(PAGE) }

  return (
    <Layout back="/plan" backLabel="My plan">
      <div className="page-header">
        <div className="eyebrow">Exercise library</div>
        <h1>Find the<br /><em>Movement.</em></h1>
        <p className="muted">{all ? `${all.length} exercises` : 'Loading…'} — search by name, or filter by muscle, equipment and level.</p>
      </div>

      <input className="search-input" type="search" placeholder="Search exercises…" value={f.q} onChange={e => set('q', e.target.value)} />
      {options && (
        <div className="filters">
          <select className="select" value={f.muscle} onChange={e => set('muscle', e.target.value)}>
            <option value="">All muscles</option>{options.muscle.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
          </select>
          <select className="select" value={f.equipment} onChange={e => set('equipment', e.target.value)}>
            <option value="">All equipment</option>{options.equipment.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
          </select>
          <select className="select" value={f.level} onChange={e => set('level', e.target.value)}>
            <option value="">All levels</option>{options.level.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
          </select>
          <button className={'chip' + (f.favOnly ? ' on' : '')} onClick={() => set('favOnly', !f.favOnly)}>★ Favorites</button>
        </div>
      )}

      <div className="mono-label">{results.length} result{results.length === 1 ? '' : 's'}</div>
      <div className="stack">
        {results.slice(0, visible).map(e => (
          <Link key={e.slug} to={`/exercises/${encodeURIComponent(e.slug)}`} className="card row-link">
            <div className="grow">
              <div className="row-name">{e.name}</div>
              <div className="muted small">{e.primary.map(titleCase).join(', ') || '—'} · {titleCase(e.equipment)}</div>
            </div>
            <span className={'tag ' + (e.level === 'beginner' ? 'amber' : e.level === 'intermediate' ? 'blue' : 'muted')}>{e.level}</span>
          </Link>
        ))}
      </div>

      {all && results.length === 0 && (
        <div className="card"><p className="muted">No exercises match. <button className="amber-link" onClick={clear}>Clear filters</button></p></div>
      )}
      {results.length > visible && (
        <div className="btn-row center spaced"><button className="btn-ghost" onClick={() => setVisible(v => v + PAGE)}>Show more</button></div>
      )}
    </Layout>
  )
}