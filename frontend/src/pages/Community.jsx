import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import EventCard from '../components/EventCard'
import CreateEventModal from '../components/CreateEventModal'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const CITIES = ['All', 'Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa']

export default function Community() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  async function loadEvents() {
    setLoading(true)
    try {
      const params = city !== 'All' ? { city } : {}
      const data = await api.getEvents(params)
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEvents() }, [city])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-gray-900">
            COMMUNITY <span className="text-court-700">MEETUPS</span>
          </h1>
          <p className="text-gray-500 font-body mt-1">Player-organized sessions and events</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={16} />
            Create Event
          </button>
        )}
      </div>

      {/* City filter */}
      <div className="flex gap-2 flex-wrap">
        {CITIES.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors ${
              city === c
                ? 'bg-court-800 text-white border-court-800'
                : 'bg-white text-gray-600 border-gray-200 hover:border-court-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-heading font-bold text-xl text-gray-400">No events yet</p>
          <p className="text-sm text-gray-400 mt-1 font-body">Be the first to create one!</p>
          {user && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} onJoined={loadEvents} />
          ))}
        </div>
      )}

      {!user && (
        <p className="text-center text-sm text-gray-500 font-body">
          <a href="/login" className="text-court-700 underline">Log in</a> to create events and join meetups.
        </p>
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={loadEvents} />
      )}
    </main>
  )
}
