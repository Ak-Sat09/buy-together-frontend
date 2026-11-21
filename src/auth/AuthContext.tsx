import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { configureApi } from '../lib/api'
import type { LoginResponse, User } from '../lib/types'

const STORAGE_KEY = 'buy-together.session'

interface Session {
  token: string
  expiresAt: string
  user: User
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  signIn: (response: LoginResponse) => void
  signOut: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    return new Date(session.expiresAt).getTime() > Date.now() ? session : null
  } catch {
    return null
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private mode or storage disabled: the session simply lasts until the tab closes
  }
}

// The API client reads the token on every request, so keep it outside React state as well.
// Configured at module load so even the very first query carries the token.
let currentToken: string | null = loadSession()?.token ?? null
let handleUnauthorized = () => {}

configureApi({ readToken: () => currentToken, onUnauthorized: () => handleUnauthorized() })

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(loadSession)

  const signOut = useCallback(() => {
    currentToken = null
    saveSession(null)
    setSession(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    handleUnauthorized = signOut
  }, [signOut])

  const signIn = useCallback(
    (response: LoginResponse) => {
      const next = { token: response.token, expiresAt: response.expiresAt, user: response.user }
      currentToken = next.token
      saveSession(next)
      setSession(next)
      // Lists show "joined" flags per user, so drop anything fetched while logged out
      queryClient.invalidateQueries()
    },
    [queryClient],
  )

  const updateUser = useCallback((user: User) => {
    setSession((previous) => {
      if (!previous) return previous
      const next = { ...previous, user }
      saveSession(next)
      return next
    })
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user: session?.user ?? null, isLoggedIn: session !== null, signIn, signOut, updateUser }),
    [session, signIn, signOut, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
