import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './config'

/** Register a new user and set their display name */
export const registerUser = async (email, password, displayName) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential.user
}

/** Sign in existing user */
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

/** Sign out current user */
export const logoutUser = () => signOut(auth)

/** Subscribe to auth state changes */
export const subscribeAuth = (callback) => onAuthStateChanged(auth, callback)
