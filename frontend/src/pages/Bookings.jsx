import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, Star, X, AlertCircle } from 'lucide-react'
import SkillBadge from '../components/SkillBadge'
import ReviewModal from '../components/ReviewModal'

function BookingCard({ booking, onCancelled, onReview }) {
  const [cancelling, setCancelling] = useState(false)
  const isPast = new Date(booking.session_date) < new Date()
  const isWaitlisted = booking.status === 'waitlisted'

  async function handleCancel() {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    try {
      await api.cancelBooking(booking.id)
      onCancelled?.()
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-start">
      <div className={`w-1 self-stretch rounded-full shrink-0 ${
        isWaitlisted ? 'bg-amber-400' : isPast ? 'bg-gray-200' : 'bg-lime-500'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading font-bold text-gray-900">{booking.session?.location_name}</p>
            <p className="text-xs text-gray-400">{booking.session?.city}</p>
          </div>
          <SkillBadge level={booking.session?.skill_level} size="sm" />
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 font-body">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {booking.session_date ? format(new Date(booking.session_date), 'EEE, MMM d yyyy') : '—'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {booking.session?.start_time} – {booking.session?.end_time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {booking.session?.address}
          </span>
        </div>

        {isWaitlisted && (
          <div className="mt-2 flex items-center gap-1.5 text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 text-xs font-body">
            <AlertCircle size={12} />
            Waitlist position #{booking.waitlist_position}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        {!isPast && booking.status !== 'cancelled' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-body"
          >
            <X size={12} />
            {cancelling ? 'Cancelling…' : 'Cancel'}
          </button>
        )}
        {isPast && !booking.has_review && (
          <button
            onClick={() => onReview(booking)}
            className="text-xs text-court-700 hover:text-court-800 flex items-center gap-1 font-body"
          >
            <Star size={12} />
            Review
          </button>
        )}
        {isPast && booking.has_review && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            Reviewed
          </span>
        )}
      </div>
    </div>
  )
}

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewBooking, setReviewBooking] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getMyBookings()
      setBookings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) load() }, [user])

  const upcoming = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.session_date) >= new Date()
  )
  const waitlisted = bookings.filter((b) => b.status === 'waitlisted')
  const past = bookings.filter((b) => new Date(b.session_date) < new Date())

  const Section = ({ title, items, empty }) => (
    <div>
      <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 font-body py-6 text-center bg-gray-50 rounded-xl">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancelled={load}
              onReview={setReviewBooking}
            />
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-gray-900">MY BOOKINGS</h1>
        <p className="text-gray-500 font-body mt-1">Your upcoming sessions and history</p>
      </div>

      <Section
        title="Upcoming Sessions"
        items={upcoming}
        empty="No upcoming bookings. Find a session to book!"
      />
      {waitlisted.length > 0 && (
        <Section
          title="Waitlist"
          items={waitlisted}
          empty="Not on any waitlists."
        />
      )}
      <Section
        title="Past Sessions"
        items={past}
        empty="No past sessions yet."
      />

      {reviewBooking && (
        <ReviewModal
          session={reviewBooking.session}
          onClose={() => setReviewBooking(null)}
          onSubmitted={load}
        />
      )}
    </main>
  )
}
