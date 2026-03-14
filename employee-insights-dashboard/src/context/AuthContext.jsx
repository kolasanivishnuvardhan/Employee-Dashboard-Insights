/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const AUTH_STORAGE_KEY = 'employee_dashboard_auth'

const AuthContext = createContext(null)

function readPersistedAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return { isAuthenticated: false, username: '' }
    const parsed = JSON.parse(raw)
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      username: parsed.username ?? '',
    }
  } catch {
    return { isAuthenticated: false, username: '' }
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readPersistedAuth)

  const login = (username, password) => {
    const isValid = username === 'testuser' && password === 'Test123'
    if (!isValid) return false

    const nextState = { isAuthenticated: true, username }
    setAuthState(nextState)
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState))
    return true
  }

  const logout = () => {
    const nextState = { isAuthenticated: false, username: '' }
    setAuthState(nextState)
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState))
  }

  const value = useMemo(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      username: authState.username,
      login,
      logout,
    }),
    [authState.isAuthenticated, authState.username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
