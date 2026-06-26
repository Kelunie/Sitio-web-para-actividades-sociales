import React from 'react'

export default function EventDetailsModal({ evento, onClose }) {
  if (!evento) return null


  const estadoLabel = evento.estado
    ? evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)
    : 'Disponible'


  let statusClass = 'status-disponible'
  if (evento.estado === 'reservado') statusClass = 'status-reservado'
  if (evento.estado === 'cancelado') statusClass = 'status-cancelado'

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-modal-top">
          <div className="auth-icon"></div>
        </div>

        <div className="auth-content">
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
                <strong style={{ color: '#dcd7ff', display: 'block', marginBottom: '0.25rem' }}>Organizador</strong>
                <span style={{ color: '#c8cbe4', fontSize: '0.95rem' }}> {evento.creado_por}</span>
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
