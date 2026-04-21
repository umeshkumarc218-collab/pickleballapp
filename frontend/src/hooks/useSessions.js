import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { haversineKm } from '../lib/geo'

export function useSessions(filters, userLocation) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.city && filters.city !== 'All') params.city = filters.city
      if (filters.date) params.date = filters.date
      if (filters.skill && filters.skill !== 'All') params.skill = filters.skill
      if (filters.age && filters.age !== 'All') params.age = filters.age

      let data = await api.getSessions(params)

      if (userLocation) {
        data = data
          .map((s) => ({
            ...s,
            distance:
              s.lat && s.lng
                ? haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng)
                : null,
          }))
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      }

      setSessions(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filters, userLocation])

  useEffect(() => { fetch() }, [fetch])

  return { sessions, loading, error, refetch: fetch }
}
