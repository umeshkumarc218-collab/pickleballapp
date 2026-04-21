import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'

const CITIES = ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa']
const SKILLS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    skill_level: 'All Levels',
    city: 'Toronto',
    address: '',
    event_date: '',
    is_recurring: false,
    recurrence_rule: '',
    max_participants: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.createEvent({
        ...form,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      })
      onCreated?.()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-court-800 text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl">Create Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              placeholder="Tuesday Pickleball Meetup"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Skill Level
              </label>
              <select
                value={form.skill_level}
                onChange={(e) => set('skill_level', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              >
                {SKILLS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                City *
              </label>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Address *
            </label>
            <input
              required
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              placeholder="123 Court St, Toronto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={form.event_date}
                onChange={(e) => set('event_date', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Max Participants
              </label>
              <input
                type="number"
                min="2"
                max="200"
                value={form.max_participants}
                onChange={(e) => set('max_participants', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
                placeholder="20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              checked={form.is_recurring}
              onChange={(e) => set('is_recurring', e.target.checked)}
              className="w-4 h-4 rounded accent-court-700"
            />
            <label htmlFor="recurring" className="text-sm font-body text-gray-700">
              Recurring event
            </label>
          </div>

          {form.is_recurring && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Recurrence (e.g. "Every Tuesday")
              </label>
              <input
                value={form.recurrence_rule}
                onChange={(e) => set('recurrence_rule', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
                placeholder="Every Tuesday at 6pm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600 resize-none"
              placeholder="Tell people what to expect…"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
