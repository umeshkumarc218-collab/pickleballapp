import { Calendar, MapPin, Users } from 'lucide-react'
import SkillBadge from './SkillBadge'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AVATAR_COLORS = ['bg-lime-400', 'bg-court-600', 'bg-amber-400', 'bg-purple-400', 'bg-pink-400']

export default function EventCard({ event, onJoined }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(event.is_joined)

  const participantCount = event.participant_count ?? 0
  const isFull = event.max_participants && participantCount >= event.max_participants

  async function handleJoin() {
    if (!user) { navigate('/login'); return }
    setLoading(true)
    try {
      await api.joinEvent(event.id)
      setJoined(true)
      onJoined?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-lg text-gray-900 leading-tight">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-gray-500 mt-1 font-body line-clamp-2">{event.description}</p>
          )}
        </div>
        <SkillBadge level={event.skill_level} />
      </div>

      <div className="space-y-1.5 text-sm text-gray-600 font-body">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-court-600 shrink-0" />
          <span>
            {event.event_date
              ? format(new Date(event.event_date), 'EEE, MMM d · h:mm a')
              : 'TBD'}
            {event.is_recurring && (
              <span className="ml-2 text-xs bg-court-800/10 text-court-700 px-2 py-0.5 rounded-full">
                Recurring
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-court-600 shrink-0" />
          <span>{event.address || event.city}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-court-600 shrink-0" />
          <span>
            {participantCount}
            {event.max_participants ? ` / ${event.max_participants}` : ''} participants
          </span>
        </div>
      </div>

      {/* Avatar stack */}
      {participantCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(participantCount, 5) }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 border-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-xs font-bold text-white`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          {participantCount > 5 && (
            <span className="text-xs text-gray-500 font-body">+{participantCount - 5} more</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-1">
        <button
          onClick={handleJoin}
          disabled={loading || joined || isFull}
          className={`w-full py-2 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-colors ${
            joined
              ? 'bg-green-100 text-green-700 cursor-default'
              : isFull
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : 'bg-court-800 hover:bg-court-700 text-white'
          } disabled:opacity-70`}
        >
          {joined ? 'Joined ✓' : isFull ? 'Full' : loading ? 'Joining…' : 'Join'}
        </button>
      </div>
    </div>
  )
}
