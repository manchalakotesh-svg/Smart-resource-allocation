import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, type UserRole } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  demoLogin: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
  demoLogin: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoRole = localStorage.getItem('demo_role') as UserRole
    if (demoRole) {
      const demoUser = { id: 'demo-id', email: `demo@${demoRole}.com` } as User
      setUser(demoUser)
      setRole(demoRole)
      setSession({ user: demoUser } as Session)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('demo_role')) return

      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchRole(userId: string) {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      setRole(data?.role as UserRole ?? null)
    } catch {
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    localStorage.removeItem('demo_role')
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    setSession(null)
  }

  const demoLogin = (newRole: UserRole) => {
    const demoUser = { id: 'demo-id', email: `demo@${newRole}.com` } as User
    localStorage.setItem('demo_role', newRole)
    setUser(demoUser)
    setRole(newRole)
    setSession({ user: demoUser } as Session)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
