import { useState } from 'react'
import { X, MapPin, Clock, Users, Star } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import SkillBadge from './SkillBadge'
import { getAvailability } from './AvailabilityBadge'
import { format } from 'date-fns'

export default function BookingModal({ session, date, onClose, onBooked }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [waitlistPos, setWaitlistPos] = useState(null)

  const { label, color, spots } = getAvailability(session.capacity, session.booked_count ?? 0)
  const isFull = color === 'red'

  async function handleBook() {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.createBooking({
        session_id: session.id,
        session_date: date || new Date().toISOString().split('T')[0],
      })
      if (res.status === 'waitlisted') setWaitlistPos(res.waitlist_position)
      setSuccess(true)
      onBooked?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-court-800 text-white rounded-t-2xl px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl">{session.location_name}</h2>
            <p className="text-gray-300 text-sm mt-0.5">{session.city}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="text-lime-600 fill-lime-400" />
              </div>
              {waitlistPos ? (
                <>
                  <h3 className="font-heading font-bold text-xl text-gray-900">Added to Waitlist!</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    You're #{waitlistPos} on the waitlist. We'll notify you if a spot opens.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-heading font-bold text-xl text-gray-900">Spot Reserved!</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Check your bookings tab for details.
                  </p>
                </>
              )}
              <button onClick={onClose} className="btn-primary mt-5 w-full">
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-court-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Time</p>
                    <p className="font-medium text-gray-900">
                      {session.start_time} – {session.end_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users size={16} className="text-court-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Availability</p>
                    <p className={`font-medium ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
                      {isFull ? 'Full' : `${spots} spots left`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 col-span-2">
                  <MapPin size={16} className="text-court-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Address</p>
                    <p className="font-medium text-gray-900">{session.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <SkillBadge level={session.skill_level} />
                <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {session.age_group || 'All ages'}
                </span>
                {session.day_of_week && (
                  <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                    {session.day_of_week}
                  </span>
                )}
              </div>

              {session.avg_rating && (
                <div className="flex items-center gap-1.5 text-sm text-amber-600">
                  <Star size={14} className="fill-amber-400" />
                  <span className="font-medium">{session.avg_rating.toFixed(1)}</span>
                  <span className="text-gray-400">avg rating</span>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {!user && (
                <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  You must be logged in to book a session.
                </p>
              )}

              <button
                onClick={handleBook}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-colors ${
                  isFull
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'btn-primary w-full'
                } disabled:opacity-60`}
              >
                {loading
                  ? 'Processing...'
                  : isFull
                  ? 'Join Waitlist'
                  : user
                  ? 'Reserve My Spot'
                  : 'Log In to Book'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
