import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          if (user && user.id) {
            setIsAuthenticated(true)
            setUser(user)
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('user')
            setIsAuthenticated(false)
            setUser(null)
          }
        } catch (error) {
          // Corrupted data, clear it
          localStorage.removeItem('user')
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      setLoading(false)
    }
    
    checkAuth()
    
    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        // Don't show loading during storage changes to prevent flashing
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            const user = JSON.parse(userData)
            if (user && user.id) {
              setIsAuthenticated(true)
              setUser(user)
            } else {
              localStorage.removeItem('user')
              setIsAuthenticated(false)
              setUser(null)
            }
          } catch (error) {
            localStorage.removeItem('user')
            setIsAuthenticated(false)
            setUser(null)
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    // Clear URL path when logging out
    window.history.replaceState({}, '', '/')
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
