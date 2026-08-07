/**
 * REST API client — all incident calls go here.
 * Frontend → /api/... → Vite proxy → Express server → MongoDB
 */

const BASE = '/api'

const req = async (method, path, body = null, isFormData = false) => {
  const opts = {
    method,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body:    body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  }
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ── Incidents ──────────────────────────────────────────────

/** Fetch all incidents (newest first) */
export const fetchIncidents = () => req('GET', '/incidents')

/** Create a new incident, returns { id, ...fields } */
export const createIncident = (data) => req('POST', '/incidents', data)

/** Update status / AI fields / assignedUnit */
export const patchIncident = (id, patch) => req('PATCH', `/incidents/${id}`, patch)

/** Delete an incident permanently */
export const deleteIncident = (id) => req('DELETE', `/incidents/${id}`)

/** Upload an image file for an incident (with automatic Base64 fallback) */
export const uploadIncidentImage = async (id, file) => {
  try {
    const form = new FormData()
    form.append('image', file)
    return await req('POST', `/incidents/${id}/image`, form, true)
  } catch (err) {
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
      return await req('PATCH', `/incidents/${id}`, { imageUrl: base64 })
    } catch (fallbackErr) {
      console.warn('Image upload fallback skipped:', fallbackErr)
      return { success: false }
    }
  }
}

// ── 50km Emergency Radius Broadcast ──────────────────────────

/** Create a new 50km emergency situation check broadcast */
export const createBroadcast = (data) => req('POST', '/broadcasts', data)

/** Fetch active broadcasts */
export const fetchActiveBroadcasts = () => req('GET', '/broadcasts/active')

/** Citizen responds to broadcast (safe or sos) */
export const respondToBroadcast = (id, responseData) => req('POST', `/broadcasts/${id}/respond`, responseData)
