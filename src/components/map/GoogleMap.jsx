import { useEffect, useRef, useCallback } from 'react'
import { useGoogleMaps } from '../../hooks/useMaps'
import { MARKER_COLORS } from '../../utils/constants'
import { markerSVG } from '../../utils/helpers'
import { Spinner } from '../ui/Spinner'

export const GoogleMap = ({ incidents, onMarkerClick, center }) => {
  const { loaded, error } = useGoogleMaps()
  const mapRef     = useRef(null)
  const mapObj     = useRef(null)
  const markers    = useRef([])

  // Default center: India
  const defaultCenter = center || { lat: 20.5937, lng: 78.9629 }

  // Initialize map once Google Maps is loaded
  useEffect(() => {
    if (!loaded || !mapRef.current || mapObj.current) return

    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center:    defaultCenter,
      zoom:      5,
      mapTypeId: 'roadmap',
      styles:    DARK_MAP_STYLE,
      disableDefaultUI: false,
      zoomControl:      true,
      mapTypeControl:   false,
      streetViewControl:false,
      fullscreenControl:true,
    })
  }, [loaded])

  // Sync markers with incidents
  useEffect(() => {
    if (!loaded || !mapObj.current) return

    // Clear old markers
    markers.current.forEach((m) => m.setMap(null))
    markers.current = []

    incidents.forEach((incident) => {
      if (!incident.lat || !incident.lng) return

      const color = MARKER_COLORS[incident.aiPriority] || MARKER_COLORS.default
      const icon  = {
        url: `data:image/svg+xml,${markerSVG(color)}`,
        scaledSize: new window.google.maps.Size(36, 44),
        anchor: new window.google.maps.Point(18, 44),
      }

      const marker = new window.google.maps.Marker({
        position: { lat: incident.lat, lng: incident.lng },
        map:      mapObj.current,
        icon,
        title:    `${incident.emergencyType} — ${incident.aiPriority}`,
        animation: window.google.maps.Animation.DROP,
      })

      // Info window
      const iw = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:system-ui;padding:4px;min-width:200px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${incident.emergencyType}</div>
            <div style="display:flex;gap:6px;margin-bottom:6px;">
              <span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">${incident.aiPriority || 'Unknown'}</span>
              <span style="background:#ffffff11;color:#94a3b8;border:1px solid #ffffff11;padding:2px 8px;border-radius:999px;font-size:11px;">${incident.status}</span>
            </div>
            <div style="font-size:12px;color:#64748b;">${(incident.description || '').slice(0, 80)}…</div>
            <div style="font-size:11px;color:#475569;margin-top:4px;">👤 ${incident.userName || 'Anonymous'}</div>
          </div>
        `,
      })

      marker.addListener('click', () => {
        iw.open(mapObj.current, marker)
        onMarkerClick?.(incident)
      })

      markers.current.push(marker)
    })

    // Auto-fit bounds if multiple markers
    if (incidents.length > 1) {
      const bounds = new window.google.maps.LatLngBounds()
      incidents.forEach((i) => {
        if (i.lat && i.lng) bounds.extend({ lat: i.lat, lng: i.lng })
      })
      mapObj.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
    }
  }, [incidents, loaded, onMarkerClick])

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-900/50 rounded-2xl border border-white/[0.07]">
        <p className="text-red-400 text-sm">⚠️ {error}</p>
        <p className="text-slate-500 text-xs">Add VITE_GOOGLE_MAPS_KEY to your .env file</p>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-2xl border border-white/[0.07]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-slate-500 text-sm">Loading Google Maps…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      aria-label="Live rescue map"
    />
  )
}

// Dark map style matching the app's aesthetic
const DARK_MAP_STYLE = [
  { elementType: 'geometry',           stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#475569' }] },
  { featureType: 'road',               elementType: 'geometry',       stylers: [{ color: '#1e293b' }] },
  { featureType: 'road',               elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road',               elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'water',              elementType: 'geometry',         stylers: [{ color: '#0c1526' }] },
  { featureType: 'water',              elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'poi',                stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',            stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',     elementType: 'geometry',         stylers: [{ color: '#1e293b' }] },
  { featureType: 'administrative',     elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
]
