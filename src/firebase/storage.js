import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

/**
 * Upload a disaster image file to Firebase Storage.
 * Returns the public download URL.
 *
 * @param {File} file
 * @param {string} incidentId - used for path namespacing
 * @returns {Promise<string>} download URL
 */
export const uploadDisasterImage = async (file, incidentId) => {
  const ext      = file.name.split('.').pop()
  const path     = `incidents/${incidentId}/${Date.now()}.${ext}`
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}
