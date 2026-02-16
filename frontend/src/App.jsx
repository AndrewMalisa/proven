import './App.css'
import { useState } from 'react'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('login')

  return (
    <div className="app">
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
      
      {currentPage === 'login' && <Login />}
      {currentPage === 'register' && <Register />}
    </div>
  )
}

export default App
