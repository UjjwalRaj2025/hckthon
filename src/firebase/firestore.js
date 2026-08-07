import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'incidents'

/**
 * Add a new incident document.
 * @param {object} data - incident fields
 * @returns {string} - new document ID
 */
export const addIncident = async (data) => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    timestamp: serverTimestamp(),
    status: 'pending',
  })
  return ref.id
}

/**
 * Fetch all incidents once (sorted by timestamp desc).
 */
export const fetchIncidents = async () => {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Subscribe to real-time incident updates.
 * @param {function} callback - called with array of incidents
 * @returns unsubscribe function
 */
export const subscribeIncidents = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => {
    const incidents = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(incidents)
  })
}

/**
 * Update the status (and optionally assignedUnit) of an incident.
 */
export const updateIncidentStatus = (id, status, assignedUnit = null) => {
  const ref = doc(db, COLLECTION, id)
  const patch = { status }
  if (assignedUnit) patch.assignedUnit = assignedUnit
  return updateDoc(ref, patch)
}

/**
 * Attach the AI verdict to an existing incident.
 */
export const setAIPriority = (id, verdict) =>
  updateDoc(doc(db, COLLECTION, id), {
    aiPriority:        verdict.priority,
    aiReason:          verdict.reason,
    aiRecommendedTeam: verdict.recommendedTeam,
  })
