import { useEffect, useState, useCallback } from 'react'
import { fetchIncidents } from '../services/apiService'

/**
 * Polls the Express/MongoDB API every 6 seconds for real-time-like updates.
 * Returns { incidents, setIncidents, loading, error, refresh }
 */
export const useIncidents = () => {
  const [incidents, setIncidents] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchIncidents()
      setIncidents(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 6000) // poll every 6 s
    return () => clearInterval(interval)
  }, [load])

  return { incidents, setIncidents, loading, error, refresh: load }
}
