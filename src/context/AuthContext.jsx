import { createContext, useContext } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
}

/**
 * Real Clerk Authentication Hook
 * Returns { user, loading, signOut }
 */
export const useAuth = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()

  const user = isSignedIn && clerkUser
    ? {
        uid:         clerkUser.id,
        displayName: clerkUser.fullName || clerkUser.username || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress || 'Citizen',
        email:       clerkUser.primaryEmailAddress?.emailAddress || '',
        phone:       clerkUser.primaryPhoneNumber?.phoneNumber || '',
        photoURL:    clerkUser.imageUrl || '',
      }
    : null

  return {
    user,
    loading: !isLoaded,
    signOut,
  }
}
