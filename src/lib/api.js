// Small fetch wrapper for the GymForge API: JSON in, JSON out. Cookies are sent automatically.
let refreshing = null

async function send(method, path, body) {
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const fieldErrors = data?.error?.details
    const firstFieldError = fieldErrors && Object.values(fieldErrors).flat()[0]
    const err = new Error(firstFieldError || data?.error?.message || `Request failed (${res.status})`)
    err.status = res.status
    err.code = data?.error?.code
    throw err
  }
  return data
}

export async function api(method, path, body) {
  try {
    return await send(method, path, body)
  } catch (err) {
    // Access token expired? Get a fresh one (once, even if several requests fail together), then retry.
    if (err.status === 401 && !path.startsWith('/auth/')) {
      refreshing ??= send('POST', '/auth/refresh').finally(() => { refreshing = null })
      await refreshing
      return send(method, path, body)
    }
    throw err
  }
}