import React, { useEffect, useState } from 'react'

export default function Index({ user, onShow }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEventos() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/actividades')
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setEventos(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEventos()
  }, [])

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="hero-badge">Bienvenido a Eventura</span>
          <h2>Explora eventos, regístrate y accede rápido.</h2>
          <p>
            Esta vista es un diseño de referencia para el equipo. Actualmente nos
            concentramos en la US de registro e inicio de sesión.
          </p>
          {!user ? (
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onShow('login')}>
                Iniciar sesión
              </button>
              <button className="btn-secondary" onClick={() => onShow('register')}>
                Registrarse
              </button>
            </div>
          ) : (
            <div className="hero-user-info">
              <strong>Welcome {user.nombre ?? user.email}</strong>
              <p>Ya estás conectado. Explora tus eventos.</p>
            </div>
          )}
        </div>

        <div className="hero-panel">
          <div className="hero-card">
            <div className="hero-card-header">
              <span>Evento destacado</span>
              <strong>Neon Jungle</strong>
            </div>
            <p>
              Un diseño de referencia para la pantalla principal mientras avanzamos
              con login y registro.
            </p>
            <div className="hero-stat-row">
              <span>312 asistentes</span>
              <span>88 libres</span>
            </div>
          </div>
        </div>
      </section>

      <section className="events-section">
        <div className="section-title-row">
          <div>
            <span className="section-label">Todos los eventos</span>
            <h3>Explora lo disponible</h3>
          </div>
        </div>

        {loading ? (
          <p>Cargando eventos...</p>
        ) : error ? (
          <p className="error-message">No se pudieron cargar los eventos: {error}</p>
        ) : eventos.length === 0 ? (
          <p>No hay eventos disponibles por el momento.</p>
        ) : (
          <div className="events-grid">
            {eventos.map(evento => (
              <article key={evento.id || evento._id || evento.titulo} className="event-card">
                <div className="event-card-top">
                  <span className="event-chip">{evento.categoria ?? 'Evento'}</span>
                  <strong>{evento.titulo ?? evento.nombre ?? 'Evento sin título'}</strong>
                </div>
                <p className="event-description">{evento.descripcion ?? 'Sin descripción disponible.'}</p>
                <div className="event-meta">
                  {evento.fecha && <span>📅 {evento.fecha}</span>}
                  {evento.lugar && <span>📍 {evento.lugar}</span>}
                </div>
                <button className="btn-secondary">Ver detalles</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
