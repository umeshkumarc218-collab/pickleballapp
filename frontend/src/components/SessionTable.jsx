import { useState } from 'react'
import { MapPin, Star, ChevronUp, ChevronDown, Navigation } from 'lucide-react'
import SkillBadge from './SkillBadge'
import AvailabilityBadge, { getAvailability } from './AvailabilityBadge'
import BookingModal from './BookingModal'

function SortButton({ field, sortKey, direction, onSort }) {
  const active = sortKey === field
  return (
    <button
      onClick={() => onSort(field)}
      className="ml-1 inline-flex flex-col items-center gap-0"
    >
      <ChevronUp size={10} className={active && direction === 'asc' ? 'text-lime-500' : 'text-gray-300'} />
      <ChevronDown size={10} className={active && direction === 'desc' ? 'text-lime-500' : 'text-gray-300'} />
    </button>
  )
}

export default function SessionTable({ sessions, loading, filterDate, onBooked }) {
  const [sortKey, setSortKey] = useState('start_time')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedSession, setSelectedSession] = useState(null)

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...sessions].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (sortKey === 'distance') {
      av = av ?? Infinity; bv = bv ?? Infinity
    }
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!sessions.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin size={24} className="text-gray-400" />
        </div>
        <p className="font-heading font-bold text-lg text-gray-600">No sessions found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                { key: 'start_time', label: 'Time' },
                { key: 'location_name', label: 'Location' },
                { key: 'city', label: 'City' },
                { key: 'skill_level', label: 'Skill' },
                { key: 'age_group', label: 'Age Group' },
                { key: 'availability', label: 'Availability' },
                { key: 'avg_rating', label: 'Rating' },
                { key: 'distance', label: 'Distance' },
                { key: 'action', label: '' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider"
                >
                  <span className="flex items-center">
                    {label}
                    {['start_time', 'city', 'distance', 'avg_rating'].includes(key) && (
                      <SortButton field={key} sortKey={sortKey} direction={sortDir} onSort={handleSort} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((s) => {
              const { color } = getAvailability(s.capacity, s.booked_count ?? 0)
              const isFull = color === 'red'
              return (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-body font-medium text-gray-900 whitespace-nowrap">
                    {s.start_time} – {s.end_time}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.location_name}</p>
                    <p className="text-xs text-gray-400">{s.address}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.city}</td>
                  <td className="px-4 py-3">
                    <SkillBadge level={s.skill_level} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.age_group || 'All ages'}</td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge capacity={s.capacity ?? 20} booked={s.booked_count ?? 0} />
                  </td>
                  <td className="px-4 py-3">
                    {s.avg_rating ? (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star size={13} className="fill-amber-400" />
                        <span className="text-xs font-medium">{s.avg_rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.distance != null ? (
                      <span className="flex items-center gap-1">
                        <Navigation size={11} className="text-court-500" />
                        {s.distance.toFixed(1)} km
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedSession(s)}
                      className={`text-xs font-heading font-bold uppercase px-3 py-1.5 rounded-lg transition-colors ${
                        isFull
                          ? 'bg-gray-800 hover:bg-gray-700 text-white'
                          : 'bg-lime-500 hover:bg-lime-600 text-court-800'
                      }`}
                    >
                      {isFull ? 'Waitlist' : 'Book'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sorted.map((s) => {
          const { color } = getAvailability(s.capacity, s.booked_count ?? 0)
          const isFull = color === 'red'
          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-gray-900">{s.location_name}</p>
                  <p className="text-xs text-gray-400 truncate">{s.address}</p>
                </div>
                <SkillBadge level={s.skill_level} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                <span>{s.start_time} – {s.end_time}</span>
                <span>·</span>
                <span>{s.city}</span>
                {s.distance != null && (
                  <><span>·</span><span>{s.distance.toFixed(1)} km</span></>
                )}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <AvailabilityBadge capacity={s.capacity ?? 20} booked={s.booked_count ?? 0} />
                <button
                  onClick={() => setSelectedSession(s)}
                  className={`text-xs font-heading font-bold uppercase px-3 py-1.5 rounded-lg ${
                    isFull ? 'bg-gray-800 text-white' : 'bg-lime-500 text-court-800'
                  }`}
                >
                  {isFull ? 'Waitlist' : 'Book'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedSession && (
        <BookingModal
          session={selectedSession}
          date={filterDate}
          onClose={() => setSelectedSession(null)}
          onBooked={() => { onBooked?.(); setSelectedSession(null) }}
        />
      )}
    </>
  )
}
