import { Calendar, Users, MapPin, Zap } from 'lucide-react'

export default function StatsBar({ sessions }) {
  const today = sessions.length
  const openSpots = sessions.reduce((sum, s) => {
    const remaining = (s.capacity ?? 20) - (s.booked_count ?? 0)
    return sum + Math.max(0, remaining)
  }, 0)
  const cities = new Set(sessions.map((s) => s.city)).size
  const fillingFast = sessions.filter((s) => {
    const pct = (s.booked_count ?? 0) / (s.capacity ?? 20)
    return pct >= 0.7 && pct < 1
  }).length

  const stats = [
    { icon: Calendar, label: 'Sessions Today', value: today, color: 'text-lime-600' },
    { icon: Users, label: 'Open Spots', value: openSpots, color: 'text-green-600' },
    { icon: MapPin, label: 'Cities Covered', value: cities, color: 'text-court-600' },
    { icon: Zap, label: 'Filling Fast', value: fillingFast, color: 'text-amber-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="font-heading font-black text-2xl text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-500 font-body mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
