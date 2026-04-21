import { useState } from 'react'
import { Navigation, Loader } from 'lucide-react'
import { getUserLocation } from '../lib/geo'

const CITIES = ['All', 'Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa']
const AGE_GROUPS = ['All', '19+', '60+']
const SKILLS = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function FilterBar({ filters, onChange, onLocationChange }) {
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState(null)

  async function handleNearMe() {
    setGpsLoading(true)
    setGpsError(null)
    try {
      const loc = await getUserLocation()
      onLocationChange(loc)
    } catch (e) {
      setGpsError('Location unavailable')
    } finally {
      setGpsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Main filters row */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wide">City</label>
          <select
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-court-600 min-w-[140px]"
          >
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onChange({ ...filters, date: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-court-600"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wide">Age Group</label>
          <select
            value={filters.age}
            onChange={(e) => onChange({ ...filters, age: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-court-600"
          >
            {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wide opacity-0 select-none">.</label>
          <button
            onClick={handleNearMe}
            disabled={gpsLoading}
            className="flex items-center gap-2 border border-gray-200 hover:border-court-600 rounded-lg px-4 py-2 text-sm font-body text-gray-700 hover:text-court-800 bg-white transition-colors disabled:opacity-50"
          >
            {gpsLoading ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            Near Me
          </button>
          {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
        </div>
      </div>

      {/* Skill pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-body font-semibold text-gray-500 uppercase tracking-wide mr-1">
          Skill:
        </span>
        {SKILLS.map((s) => {
          const active = filters.skill === s
          const colorMap = {
            All: active ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            Beginner: active ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
            Intermediate: active ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
            Advanced: active ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
          }
          return (
            <button
              key={s}
              onClick={() => onChange({ ...filters, skill: s })}
              className={`px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors ${
                colorMap[s]
              } ${active ? 'border-transparent' : 'border-transparent'}`}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
