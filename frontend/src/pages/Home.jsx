import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import FilterBar from '../components/FilterBar'
import StatsBar from '../components/StatsBar'
import SessionTable from '../components/SessionTable'
import { useSessions } from '../hooks/useSessions'

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [filters, setFilters] = useState({ city: 'All', date: today, skill: 'All', age: 'All' })
  const [userLocation, setUserLocation] = useState(null)

  const { sessions, loading, error, refetch } = useSessions(filters, userLocation)

  const handleLocationChange = useCallback((loc) => {
    setUserLocation(loc)
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-court-800 rounded-2xl px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-lime-500" />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-lime-300" />
        </div>
        <div className="relative">
          <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight leading-tight">
            FIND YOUR NEXT<br />
            <span className="text-lime-400">PICKLEBALL SESSION</span>
          </h1>
          <p className="mt-2 text-gray-300 font-body max-w-lg">
            Drop-in sessions, courts, and meetups across Canada — updated daily.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onLocationChange={handleLocationChange}
        />
      </div>

      {/* Stats */}
      <StatsBar sessions={sessions} />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-body">
          {error}
        </div>
      )}

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-xl text-gray-900">
            {loading ? 'Loading sessions…' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} found`}
          </h2>
          {userLocation && (
            <span className="text-xs text-court-600 bg-court-800/10 px-3 py-1 rounded-full font-body">
              Sorted by distance
            </span>
          )}
        </div>
        <SessionTable
          sessions={sessions}
          loading={loading}
          filterDate={filters.date}
          onBooked={refetch}
        />
      </div>
    </main>
  )
}
