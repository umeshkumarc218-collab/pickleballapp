import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const CITIES = ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa', 'Other']
const SKILLS = ['Beginner', 'Intermediate', 'Advanced']

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', skill: 'Beginner', city: 'Toronto',
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
      await signUp(form.email, form.password, form.name, form.skill, form.city)
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-court-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-lime-400 font-heading font-black text-lg">PB</span>
          </div>
          <h1 className="font-heading font-black text-3xl text-gray-900">JOIN THE COMMUNITY</h1>
          <p className="text-gray-500 font-body text-sm mt-1">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Full Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              placeholder="Alex Smith"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              placeholder="Min 6 characters"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Skill Level
              </label>
              <select
                value={form.skill}
                onChange={(e) => set('skill', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              >
                {SKILLS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                City
              </label>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-court-600"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 font-body mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-court-700 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
