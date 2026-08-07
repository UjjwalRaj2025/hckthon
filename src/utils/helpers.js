import { format, formatDistanceToNow } from 'date-fns'

/** Format a Firestore timestamp or Date to a readable string */
export const formatTimestamp = (ts) => {
  if (!ts) return '—'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return format(date, 'dd MMM yyyy, hh:mm a')
}

/** Relative time string e.g. "3 minutes ago" */
export const timeAgo = (ts) => {
  if (!ts) return '—'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return formatDistanceToNow(date, { addSuffix: true })
}

/** Generate a unique temporary ID */
export const tempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

/** Capitalize first letter */
export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

/** Truncate long text */
export const truncate = (text, max = 80) =>
  text && text.length > max ? text.slice(0, max) + '…' : text

/** Compute dashboard statistics from incidents array */
export const computeStats = (incidents) => ({
  total:    incidents.length,
  active:   incidents.filter((i) => ['assigned', 'in_progress'].includes(i.status)).length,
  resolved: incidents.filter((i) => i.status === 'resolved').length,
  critical: incidents.filter((i) => i.aiPriority === 'Critical').length,
})

/**
 * Calculate distance in kilometers between two GPS coordinates using Haversine formula
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Return Google Maps marker SVG path for a given priority color */
export const markerSVG = (color) =>
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.6"/>
      </filter>
      <path fill="${color}" filter="url(#shadow)"
        d="M20 0C12.28 0 6 6.28 6 14c0 10 14 36 14 36s14-26 14-36c0-7.72-6.28-14-14-14z"/>
      <circle cx="20" cy="14" r="6" fill="white"/>
    </svg>
  `)
