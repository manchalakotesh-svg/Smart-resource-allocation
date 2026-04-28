import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

export type UserRole = 'volunteer' | 'ngo' | 'admin'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  demoLogin: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  demoLogin: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for demo login first
    const demoRole = localStorage.getItem('demo_role') as UserRole
    if (demoRole) {
      const demoUser = { uid: 'demo-id', email: `demo@${demoRole}.com` } as User
      setUser(demoUser)
      setRole(demoRole)
      setLoading(false)
      return
    }

    let roleUnsubscribe: (() => void) | null = null

    // Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (localStorage.getItem('demo_role')) return

      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Listen to role changes instantly
        roleUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            setRole(userDoc.data().role as UserRole)
          } else {
            setRole(null)
          }
          setLoading(false)
        }, (error) => {
          console.error('Error fetching user role:', error)
          setRole(null)
          setLoading(false)
        })
      } else {
        if (roleUnsubscribe) {
          roleUnsubscribe()
          roleUnsubscribe = null
        }
        setUser(null)
        setRole(null)
        setLoading(false)
      }
    })

    // Safety timeout to prevent infinite loading if Firebase/Supabase keys are missing
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth initialization timed out. Check your environment variables.");
          return false;
        }
        return prev;
      });
    }, 2000);

    return () => {
      unsubscribe()
      clearTimeout(timeout)
      if (roleUnsubscribe) {
        roleUnsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    localStorage.removeItem('demo_role')
    await firebaseSignOut(auth)
    setUser(null)
    setRole(null)
  }

  const demoLogin = (newRole: UserRole) => {
    const demoUser = { uid: 'demo-id', email: `demo@${newRole}.com` } as User
    localStorage.setItem('demo_role', newRole)
    setUser(demoUser)
    setRole(newRole)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
