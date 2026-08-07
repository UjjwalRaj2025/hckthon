import { useEffect, useState, useCallback } from 'react'
import { fetchIncidents } from '../services/apiService'

/**
 * Polls the Express/MongoDB API every 5 seconds for real-time updates.
 * Features state preservation to prevent UI count fluctuations during serverless cold starts.
 */
export const useIncidents = () => {
  const [incidents, setIncidents] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchIncidents()
      if (Array.isArray(data)) {
        setIncidents((prev) => {
          // If a transient empty response is received while active items exist, retain state
          if (data.length === 0 && prev.length > 0) {
            return prev
          }
          return data
        })
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  return { incidents, setIncidents, loading, error, refresh: load }
}
