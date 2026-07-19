import React, { useState, useEffect } from 'react'
import { BASE_URL } from './config'

export default function EventDetailsModal({ evento, token, user, onClose, onJoinSuccess }) {
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [asistentes, setAsistentes] = useState([])
  const [cargandoAsistentes, setCargandoAsistentes] = useState(false)

  useEffect(() => {
    if (!evento) return

    setCargandoAsistentes(true)
    fetch(`${BASE_URL}/actividades/eventos/${evento.id}/asistentes`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setAsistentes(data))
      .catch(() => setAsistentes([]))
      .finally(() => setCargandoAsistentes(false))
  }, [evento?.id])

  if (!evento) return null

  const isAttending = user && evento.asistentes && evento.asistentes.includes(user.id)
  const isCreator = user && (evento.creado_por === user.id)

  const estadoLabel = evento.estado
    ? evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)
    : 'Disponible'

  let statusClass = 'status-disponible'
  if (evento.estado === 'reservado') statusClass = 'status-reservado'
  if (evento.estado === 'cancelado') statusClass = 'status-cancelado'

  async function handleJoin() {
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch(`${BASE_URL}/actividades/eventos/${evento.id}/unirse`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data.detail || data.message || 'Error al unirse')
      
      setMessage('¡Te has unido con éxito a este evento!')
      if (onJoinSuccess) {
        setTimeout(() => {
          onJoinSuccess()
        }, 1200)
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-modal-top">
          <div className="auth-icon">🎉</div>
        </div>

        <div className="auth-content">
          {evento.imagen_url && (
            <div className="event-details-image">
              <img src={evento.imagen_url} alt={evento.nombre ?? evento.titulo} />
            </div>
          )}

          <span className="event-chip">{evento.categoria ?? 'Evento'}</span>
          <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            {evento.nombre ?? evento.titulo ?? 'Evento sin título'}
          </h2>

          <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Descripción</strong>
              <p style={{ margin: 0, color: '#c8cbe4', lineHeight: '1.6' }}>
                {evento.descripcion ?? 'Sin descripción disponible.'}
              </p>
            </div>

            <div className="form-row">
              <div>
                <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Fecha</strong>
                <span style={{ color: '#f5f7ff' }}>{evento.fecha ?? 'No especificada'}</span>
              </div>
              <div>
                <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Lugar</strong>
                <span style={{ color: '#f5f7ff' }}> {evento.lugar ?? 'No especificado'}</span>
              </div>
            </div>

            <div className="form-row">
              <div>
                <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Capacidad</strong>
                <span style={{ color: '#f5f7ff' }}>
                  {evento.capacidad ? `${evento.capacidad} personas` : 'Sin límite / No especificada'}
                </span>
              </div>
              <div>
                <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Estado</strong>
                <span className={`event-chip ${statusClass}`} style={{ textTransform: 'none', letterSpacing: 'normal', display: 'inline-flex' }}>
                  {estadoLabel}
                </span>
              </div>
            </div>

            {evento.creado_por && (
              <div>
                <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Organizador ID</strong>
                <span style={{ color: '#c8cbe4', fontSize: '0.95rem' }}> {evento.creado_por}</span>
              </div>
            )}

            <div>
              <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>
                Asistentes {asistentes.length > 0 ? `(${asistentes.length})` : ''}
              </strong>
              {cargandoAsistentes ? (
                <span style={{ color: '#c8cbe4' }}>Cargando asistentes...</span>
              ) : asistentes.length === 0 ? (
                <span style={{ color: '#c8cbe4' }}>Todavía nadie se unió a este evento.</span>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c8cbe4' }}>
                  {asistentes.map(asistente => (
                    <li key={asistente.id}>{asistente.nombre}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {message && <p className="auth-message" style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>{message}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
            {user ? (
              isCreator ? (
                <div className="event-chip status-disponible" style={{ justifyContent: 'center', width: '100%', padding: '0.75rem', letterSpacing: 'normal', textTransform: 'none', alignSelf: 'stretch' }}>
                  👑 Eres el organizador de este evento
                </div>
              ) : isAttending ? (
                <div className="event-chip status-disponible" style={{ justifyContent: 'center', width: '100%', padding: '0.75rem', letterSpacing: 'normal', textTransform: 'none', alignSelf: 'stretch' }}>
                  ✅ ¡Estás registrado para asistir!
                </div>
              ) : evento.estado === 'disponible' ? (
                <button 
                  className="btn-primary" 
                  onClick={handleJoin} 
                  disabled={submitting}
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Uniéndote...' : 'Unirse al evento'}
                </button>
              ) : (
                <div className="event-chip status-cancelado" style={{ justifyContent: 'center', width: '100%', padding: '0.75rem', letterSpacing: 'normal', textTransform: 'none', alignSelf: 'stretch' }}>
                  El evento no acepta más registros ({estadoLabel})
                </div>
              )
            ) : (
              <div className="auth-message" style={{ textAlign: 'center', fontSize: '0.95rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
                Inicia sesión para registrarte en este evento.
              </div>
            )}

            <button className="btn-secondary" onClick={onClose} style={{ width: '100%' }}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
