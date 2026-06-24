import React, { useState } from 'react'
import Index from './Index'
import AuthModal from './AuthModal'

export default function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)

  function openAuth(mode) {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function closeAuth() {
    setAuthOpen(false)
  }

  function handleLoginSuccess(userData) {
    setUser(userData)
    setAuthOpen(false)
  }

  function handleLogout() {
    setUser(null)
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>Sitio para Actividades Sociales</h1>
        </div>
        <div className="header-user">
          {user ? (
            <>
              <span>Welcome {user.nombre ?? user.email}</span>
              <button className="btn-secondary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : null}
        </div>
      </header>
      <main>
        <Index user={user} onShow={openAuth} />
      </main>
      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onSwitch={openAuth}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  )
}
