import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Wrap the app in this once. Any component can then call useAuth() to get { user, login, register, logout }.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On every page load, ask the server who we are (the cookie answers it)
  useEffect(() => {
    api('GET', '/me')
      .then(d => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const d = await api('POST', '/auth/login', { email, password })
    setUser(d.user)
  }
  const register = async (email, password) => {
    const d = await api('POST', '/auth/register', { email, password })
    setUser(d.user)
  }
  const logout = async () => {
    try { await api('POST', '/auth/logout') } finally { setUser(null) }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}