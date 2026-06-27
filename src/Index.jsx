import React, { useEffect, useState } from 'react'

export default function Index({ user, onShow, onCreateEvent, onShowDetails }) {
  const [eventos, setEventos] = useState([])
  const [destacado, setDestacado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEventos() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/actividades/eventos/')
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setEventos(data)
        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length)
          setDestacado(data[randomIndex])
        }
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
            Conéctate con tu comunidad, descubre actividades increíbles a tu alrededor
            y organiza momentos inolvidables. La aventura de compartir pasiones empieza aquí.
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
              <div className="user-avatar-badge">
                <span className="user-avatar-char">
                  {(user.nombre || user.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="user-online-status"></span>
              </div>
              <div className="user-info-text">
                <strong>¡Hola, {user.nombre ?? user.email}! 👋</strong>
                <p>Qué bueno tenerte aquí. Todo listo para descubrir tu próximo evento social.</p>
              </div>
            </div>
          )}
        </div>

        <div className="hero-panel">
          <div className="hero-card">
            <div className="hero-card-header">
              <span>Evento destacado</span>
              <strong>{destacado ? (destacado.nombre || destacado.titulo) : 'Neon Jungle'}</strong>
            </div>
            <p>
              {destacado ? destacado.descripcion : 'Adéntrate en una noche llena de luces fluorescentes, música electrónica envolvente y una atmósfera electrizante. ¡Asegura tu lugar en la fiesta del año!'}
            </p>
            <div className="hero-stat-row">
              {destacado ? (
                <>
                  <span>📅 {destacado.fecha}</span>
                  <span>📍 {destacado.lugar}</span>
                </>
              ) : (
                <>
                  <span>312 asistentes</span>
                  <span>88 libres</span>
                </>
              )}
            </div>
            {destacado && (
              <button 
                className="btn-secondary" 
                style={{ marginTop: '1rem', width: '100%', padding: '0.6rem' }}
                onClick={() => onShowDetails(destacado)}
              >
                Ver detalles
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="events-section">
        <div className="section-title-row">
          <div>
            <span className="section-label">Todos los eventos</span>
            <h3>Explora lo disponible</h3>
          </div>
          {user && (
            <button className="btn-primary" onClick={onCreateEvent}>
              Crear evento
            </button>
          )}
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
                  {evento.fecha && <span> {evento.fecha}</span>}
                  {evento.lugar && <span>{evento.lugar}</span>}
                </div>
                <button className="btn-secondary" onClick={() => onShowDetails(evento)}>Ver detalles</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}