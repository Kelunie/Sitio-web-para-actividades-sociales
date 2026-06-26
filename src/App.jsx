import React, { useState } from 'react'
import Index from './Index'
import AuthModal from './AuthModal'
import CreateEventModal from './Createeventmodal'
import EventDetailsModal from './EventDetailsModal'

function decodificarEmailDeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.sub ?? null
  } catch {
    return null
  }
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('access_token')
    if (savedToken) {
      const email = decodificarEmailDeToken(savedToken)
      if (email) {
        return { email }
      }
    }
    return null
  })
  const [eventosVersion, setEventosVersion] = useState(0)
  const [selectedEvento, setSelectedEvento] = useState(null)

  function openAuth(mode) {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function closeAuth() {
    setAuthOpen(false)
  }

  function handleLoginSuccess(authData) {
    const accessToken = authData?.access_token
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
      setToken(accessToken)
      setUser({ email: decodificarEmailDeToken(accessToken) })
      setAuthOpen(false)
    } else {
      // Si el registro fue exitoso pero no devolvió token, cambiamos a la pestaña de login
      setAuthMode('login')
    }
  }

  function handleLogout() {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  function handleEventCreated() {
    setCreateEventOpen(false)
    setEventosVersion(v => v + 1)
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
        <Index
          key={eventosVersion}
          user={user}
          token={token}
          onShow={openAuth}
          onCreateEvent={() => setCreateEventOpen(true)}
          onShowDetails={(evento) => setSelectedEvento(evento)}
        />
      </main>
      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onSwitch={openAuth}
          onSuccess={handleLoginSuccess}
        />
      )}
      {createEventOpen && (
        <CreateEventModal
          token={token}
          onClose={() => setCreateEventOpen(false)}
          onSuccess={handleEventCreated}
        />
      )}
      {selectedEvento && (
        <EventDetailsModal
          evento={selectedEvento}
          onClose={() => setSelectedEvento(null)}
        />
      )}
    </div>
  )
}