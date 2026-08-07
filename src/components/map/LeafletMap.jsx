import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MARKER_COLORS } from '../../utils/constants'
import { timeAgo } from '../../utils/helpers'
import { Badge } from '../ui/Badge'

// Fix Leaflet's default icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/** Build a coloured SVG pin icon for the given priority */
const buildIcon = (priority) => {
  const color = MARKER_COLORS[priority] || MARKER_COLORS.default
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
      <defs>
        <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path fill="${color}" filter="url(#shadow)"
        d="M18 0C8.059 0 0 8.059 0 18c0 12 18 30 18 30S36 30 36 18C36 8.059 27.941 0 18 0z"/>
      <circle cx="18" cy="18" r="7" fill="white" opacity="0.9"/>
      <circle cx="18" cy="18" r="4" fill="${color}"/>
    </svg>
  `)
  return L.divIcon({
    html: `<img src="data:image/svg+xml,${svg}" width="36" height="48" style="filter:drop-shadow(0 2px 6px ${color}88)"/>`,
    iconSize:   [36, 48],
    iconAnchor: [18, 48],
    popupAnchor:[0, -50],
    className:  '',
  })
}

/** Auto-fit map bounds when incidents change */
const BoundsFitter = ({ incidents }) => {
  const map = useMap()
  useEffect(() => {
    if (incidents.length === 0) return
    const valid = incidents.filter((i) => i.lat && i.lng)
    if (valid.length === 0) return
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 10)
    } else {
      const bounds = L.latLngBounds(valid.map((i) => [i.lat, i.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [incidents, map])
  return null
}

export const LeafletMap = ({ incidents, onMarkerClick }) => {
  // Default center — India
  const center = [20.5937, 78.9629]

  return (
    <MapContainer
      center={center}
      zoom={5}
      className="w-full h-full rounded-2xl z-0"
      style={{ background: '#0f172a' }}
    >
      {/* Dark OpenStreetMap tile layer (free, no API key) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      <BoundsFitter incidents={incidents} />

      {incidents.map((incident) => {
        if (!incident.lat || !incident.lng) return null
        return (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lng]}
            icon={buildIcon(incident.aiPriority)}
            eventHandlers={{ click: () => onMarkerClick?.(incident) }}
          >
            <Popup
              className="resq-popup"
              maxWidth={260}
            >
              <div className="resq-popup-inner">
                <div className="resq-popup-title">{incident.emergencyType}</div>
                <div className="resq-popup-badges">
                  <span
                    className="resq-popup-badge"
                    style={{ color: MARKER_COLORS[incident.aiPriority], border: `1px solid ${MARKER_COLORS[incident.aiPriority]}44`, background: `${MARKER_COLORS[incident.aiPriority]}18` }}
                  >
                    {incident.aiPriority || 'Unknown'}
                  </span>
                  <span className="resq-popup-status">{incident.status}</span>
                </div>
                <p className="resq-popup-desc">{(incident.description || '').slice(0, 90)}{incident.description?.length > 90 ? '…' : ''}</p>
                <p className="resq-popup-meta">👤 {incident.userName || 'Citizen'} {incident.userEmail ? `(${incident.userEmail})` : ''} · {timeAgo(incident.timestamp || incident.createdAt)}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
