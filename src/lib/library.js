// Talks to the GymForge API. The exercise data now lives in the database.
export const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises/'

export const titleCase = s => (s || '').replace(/\b\w/g, c => c.toUpperCase())

async function api(path, params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false)
  const qs = new URLSearchParams(entries).toString()
  const res = await fetch(`/api/v1${path}${qs ? '?' + qs : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const err = new Error(body?.error?.message || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const fetchExercises = params => api('/exercises', params)
export const fetchExerciseMeta = () => api('/exercises/meta')
export const fetchExercise = slug => api(`/exercises/${encodeURIComponent(slug)}`)