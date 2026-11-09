const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || '/'

export function cdnUrl(path) {
  return `${CDN_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body?.error?.message || res.statusText)
  }
  return res.status === 204 ? null : res.json()
}

export { API_BASE }

export const api = {
  info: () => request('/v1/info'),
  login: (username) =>
    request('/v1/session/login', { method: 'POST', body: JSON.stringify({ username }) }),
  session: () => request('/v1/session'),
  logout: () => request('/v1/session/logout', { method: 'POST' }),
}
