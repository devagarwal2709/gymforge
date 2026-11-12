import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { fetchExercises, fetchExerciseMeta, titleCase } from '../lib/library.js'
import { read } from '../lib/storage.js'

const PAGE = 30

// Wait until the user stops typing before searching
function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function Exercises() {
  const [params] = useSearchParams()
  const [f, setF] = useState({ q: params.get('q') || '', muscle: '', equipment: '', level: '', favOnly: false })
  const q = useDebounced(f.q, 250)
  const [meta, setMeta] = useState(null)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const favs = useMemo(() => read('gf_favorites', []), [])

  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const query = { q, muscle: f.muscle, equipment: f.equipment, level: f.level, slugs: f.favOnly ? favs.join(',') : '' }
  const noFavs = f.favOnly && favs.length === 0

  useEffect(() => { fetchExerciseMeta().then(setMeta).catch(() => {}) }, [])

  // Every time the search or a filter changes, fetch page 1 again from the API
  useEffect(() => {
    if (noFavs) { setItems([]); setTotal(0); setLoading(false); setError(''); return }
    let cancelled = false
    setLoading(true)
    setError('')
    fetchExercises({ ...query, limit: PAGE, offset: 0 })
      .then(d => { if (!cancelled) { setItems(d.items); setTotal(d.total) } })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [q, f.muscle, f.equipment, f.level, f.favOnly])

  async function more() {
    setLoading(true)
    try {
      const d = await fetchExercises({ ...query, limit: PAGE, offset: items.length })
      setItems(prev => [...prev, ...d.items])
      setTotal(d.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => setF({ q: '', muscle: '', equipment: '', level: '', favOnly: false })

  return (
    <Layout back="/plan" backLabel="My plan">
      <div className="page-header">
        <div className="eyebrow">Exercise library</div>
        <h1>Find the<br /><em>Movement.</em></h1>
        <p className="muted">{meta ? `${meta.total} exercises` : 'Loading…'} — search by name, or filter by muscle, equipment and level.</p>
      </div>

      <input className="search-input" type="search" placeholder="Search exercises…" value={f.q} onChange={e => set('q', e.target.value)} />
      {meta && (
        <div className="filters">
          <select className="select" value={f.muscle} onChange={e => set('muscle', e.target.value)}>
            <option value="">All muscles</option>{meta.muscles.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
          </select>
          <select className="select" value={f.equipment} onChange={e => set('equipment', e.target.value)}>
            <option value="">All equipment</option>{meta.equipment.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
          </select>
          <select className="select" value={f.level} onChange={e => set('level', e.target.value)}>
            <option value="">All levels</option>{meta.levels.map(m => <option key={m} value={m}>{titleCase(m)}</option>)}
          </select>
          <button className={'chip' + (f.favOnly ? ' on' : '')} onClick={() => set('favOnly', !f.favOnly)}>★ Favorites</button>
        </div>
      )}

      {error && (
        <div className="card spaced">
          <p className="muted"><strong>Couldn't load exercises.</strong> {error}. Make sure the API is running — <code>npm run dev</code> starts both the site and the API.</p>
        </div>
      )}

      {!error && <div className="mono-label">{loading && items.length === 0 ? '…' : total} result{total === 1 ? '' : 's'}</div>}
      <div className="stack">
        {items.map(e => (
          <Link key={e.slug} to={`/exercises/${encodeURIComponent(e.slug)}`} className="card row-link">
            <div className="grow">
              <div className="row-name">{e.name}</div>
              <div className="muted small">{e.primary.map(titleCase).join(', ') || '—'} · {titleCase(e.equipment)}</div>
            </div>
            <span className={'tag ' + (e.level === 'beginner' ? 'amber' : e.level === 'intermediate' ? 'blue' : 'muted')}>{e.level}</span>
          </Link>
        ))}
      </div>

      {!loading && !error && items.length === 0 && (
        <div className="card"><p className="muted">No exercises match. <button className="amber-link" onClick={clear}>Clear filters</button></p></div>
      )}
      {!error && items.length < total && (
        <div className="btn-row center spaced">
          <button className="btn-ghost" onClick={more} disabled={loading}>{loading ? 'Loading…' : 'Show more'}</button>
        </div>
      )}
    </Layout>
  )
}