// Loads the exercise dataset on demand (kept out of the main bundle).
export const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises/'

let cache
export const loadLibrary = () => (cache ??= import('../data/exercises.json').then(m => m.default))

export const titleCase = s => (s || '').replace(/\b\w/g, c => c.toUpperCase())