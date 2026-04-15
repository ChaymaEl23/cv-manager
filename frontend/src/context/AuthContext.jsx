import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

  const persistSession = (session) => {
    localStorage.setItem('token', session.token)
    localStorage.setItem('user', JSON.stringify(session.user))
    setToken(session.token)
    setUser(session.user)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    persistSession(res.data)
    return res.data
  }

  const register = async (nom, prenom, email, password) => {
    const res = await api.post('/auth/register', { nom, prenom, email, password })
    persistSession(res.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    api.get('/auth/me')
      .then((res) => {
        if (cancelled) return
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .catch(() => {
        if (cancelled) return
        logout()
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
