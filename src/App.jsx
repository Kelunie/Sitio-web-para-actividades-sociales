import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Index from './Index'
import AuthModal from './AuthModal'
import CreateEventModal from './Createeventmodal'
import EventDetailsModal from './EventDetailsModal'
import Perfil from './Perfil'
import { BASE_URL } from './config'

function decodificarToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return {
      email: decoded.sub ?? null,
      nombre: decoded.nombre ?? null
    }
  } catch {
    return null
  }
}

function AppShell() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('access_token')
    if (savedToken) {
      const decoded = decodificarToken(savedToken)
      if (decoded && decoded.email) {
        return decoded
      }
    }
    return null
  })
  const [eventosVersion, setEventosVersion] = useState(0)
  const [selectedEvento, setSelectedEvento] = useState(null)

  useEffect(() => {
    if (!token) return
    async function loadUserProfile() {
      try {
        const res = await fetch(`${BASE_URL}/usuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.usuario) {
            setUser(data.usuario)
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
      }
    }
    loadUserProfile()
  }, [token])

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
      setUser(decodificarToken(accessToken))
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

  function handleProfileUpdated(usuarioActualizado) {
    setUser(prev => ({ ...prev, ...usuarioActualizado }))
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
              <div className="header-avatar-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="user-avatar-badge" style={{ width: '36px', height: '36px', minWidth: '36px', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)' }}>
                  {user.imagen_url ? (
                    <img src={user.imagen_url} alt="Profile" className="user-avatar-img" />
                  ) : (
                    <span className="user-avatar-char" style={{ fontSize: '1rem' }}>
                      {(user.nombre || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span style={{ color: '#dcd7ff', fontWeight: 600 }}>Welcome {user.nombre ?? user.email}</span>
              </div>

              <Link to="/perfil" className="btn-secondary">
                Mi perfil
              </Link>
              <button className="btn-secondary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : null}
        </div>
      </header>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Index
                key={eventosVersion}
                user={user}
                token={token}
                onShow={openAuth}
                onCreateEvent={() => setCreateEventOpen(true)}
                onShowDetails={(evento) => setSelectedEvento(evento)}
              />
            }
          />
          <Route
            path="/perfil"
            element={<Perfil token={token} onUpdated={handleProfileUpdated} />}
          />
        </Routes>
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
          token={token}
          user={user}
          onClose={() => setSelectedEvento(null)}
          onJoinSuccess={() => {
            setSelectedEvento(null)
            setEventosVersion(v => v + 1)
          }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
