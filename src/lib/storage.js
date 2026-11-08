import { MAIN } from '../data.js'

export const read = (k, fallback = null) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
export const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// Local date (not UTC) so the day changes at your midnight
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const getProfile = () => read('gf_profile')

// Same simple formula as Phase 2. Checkpoint 6 replaces this with a proper BMR engine.
export function calcNutrition(kg, goal) {
  const tdee = Math.round(kg * 22 * 1.55)
  const [adj, mult] = goal === 'lose_fat' ? [-300, 2.4] : goal === 'build_muscle' ? [200, 2.2] : [100, 2.2]
  const calories = Math.round((tdee + adj) / 50) * 50
  const protein = Math.round(kg * mult)
  const fat = Math.round((calories * 0.28) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  return { calories, protein, carbs, fat }
}

export function getStreak() {
  const done = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('gf_session_')) continue
    const d = read(k)
    if (d && MAIN.every(id => d[id]?.sets?.every(s => s.done))) done.push(k.slice(11))
  }
  const todayDone = done.includes(dateKey())
  const c = new Date()
  if (!todayDone) c.setDate(c.getDate() - 1)
  let streak = 0
  while (done.includes(dateKey(c))) { streak++; c.setDate(c.getDate() - 1) }
  return { streak, done, todayDone }
}
