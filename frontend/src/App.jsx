import './App.css'
import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const { isAuthenticated, login, logout, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('login')

  console.log('App render:', { isAuthenticated, loading, currentPage })

  // Check URL path on mount
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/dashboard' && !isAuthenticated) {
      // Redirect to login if trying to access dashboard without auth
      window.history.replaceState({}, '', '/')
      setCurrentPage('login')
    }
  }, [isAuthenticated])

  // Session timeout setup
  useEffect(() => {
    if (!isAuthenticated) return

    let timeoutId
    
    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        logout()
        alert('Session expired due to inactivity. Please log in again.')
      }, 30 * 60 * 1000) // 30 minutes
    }

    // Setup initial timeout
    resetTimeout()

    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetTimeout)
    })

    return () => {
      clearTimeout(timeoutId)
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout)
      })
    }
  }, [isAuthenticated, logout])

  // Show loading while checking authentication
  if (loading) {
    return <div style={{ padding: '20px' }}>Loading authentication...</div>
  }

  if (isAuthenticated) {
    // Update URL to show /dashboard when authenticated
    if (window.location.pathname !== '/dashboard') {
      window.history.replaceState({}, '', '/dashboard')
    }
    return <Dashboard />
  }

  return (
    <div className="app">
      <div style={{ padding: '20px', background: 'lightgray', margin: '10px' }}>
        Debug: isAuthenticated={isAuthenticated.toString()}, currentPage={currentPage}
      </div>
      <nav className="nav-bar">
        <button 
          onClick={() => setCurrentPage('login')}
          className={currentPage === 'login' ? 'active' : ''}
        >
          Login
        </button>
        <button 
          onClick={() => setCurrentPage('register')}
          className={currentPage === 'register' ? 'active' : ''}
        >
          Register
        </button>
      </nav>
      
      <div style={{ padding: '20px', border: '1px solid red', margin: '10px' }}>
        {currentPage === 'login' ? (
          <div>Login Component Loading...</div>
        ) : currentPage === 'register' ? (
          <div>Register Component Loading...</div>
        ) : (
          <div>Unknown page</div>
        )}
      </div>
      
      {currentPage === 'login' && <Login />}
      {currentPage === 'register' && <Register />}
    </div>
  )
}

export default App
