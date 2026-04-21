import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  getSessions: (params) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/sessions${qs ? '?' + qs : ''}`)
  },
  getSession: (id) => request(`/sessions/${id}`),

  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  cancelBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  getMyBookings: () => request('/bookings/me'),

  getEvents: (params) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/community/events${qs ? '?' + qs : ''}`)
  },
  createEvent: (body) => request('/community/events', { method: 'POST', body: JSON.stringify(body) }),
  joinEvent: (id) => request(`/community/events/${id}/join`, { method: 'POST' }),

  submitReview: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),

  triggerScrape: () => request('/admin/scrape', { method: 'POST' }),
  getScrapeLogs: () => request('/admin/scrape-logs'),
}
