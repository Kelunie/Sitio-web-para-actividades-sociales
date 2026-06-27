import React, { useState } from 'react'

export default function CreateEventModal({ token, onClose, onSuccess }) {
    const [nombre, setNombre] = useState('')
    const [fecha, setFecha] = useState('')
    const [lugar, setLugar] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [capacidad, setCapacidad] = useState('')
    const [estado, setEstado] = useState('disponible')
    const [message, setMessage] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const hoy = new Date().toISOString().split('T')[0]

    function extraerMensajeError(data, text) {
        const detail = data?.detail
        if (Array.isArray(detail)) {
            return detail.map(e => e.msg || JSON.stringify(e)).join(' / ')
        }
        if (typeof detail === 'string') return detail
        return data?.message || text || 'Error al crear evento'
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setMessage(null)
        try {
            const body = {
                nombre,
                fecha,
                lugar,
                descripcion,
                estado,
            }
            if (capacidad) body.capacidad = Number(capacidad)

            const res = await fetch('/actividades/eventos/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })
            const text = await res.text()
            const data = text ? JSON.parse(text) : {}
            if (!res.ok) throw new Error(extraerMensajeError(data, text))
            setMessage('Evento creado correctamente')
            if (onSuccess) onSuccess(data)
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
                    <div className="auth-icon">📅</div>
                </div>

                <div className="auth-content">
                    <h2>Crear evento</h2>
                    <p>Comparte un nuevo evento con la comunidad</p>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Nombre del evento
                            <input
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                                placeholder="Ej. Neon Jungle"
                            />
                        </label>
                        <div className="form-row">
                            <label>
                                Fecha
                                <input
                                    type="date"
                                    value={fecha}
                                    min={hoy}
                                    onChange={e => setFecha(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Capacidad (opcional)
                                <input
                                    type="number"
                                    min="1"
                                    value={capacidad}
                                    onChange={e => setCapacidad(e.target.value)}
                                    placeholder="Ej. 100"
                                />
                            </label>
                        </div>
                        <div className="form-row">
                            <label>
                                Lugar
                                <input
                                    value={lugar}
                                    onChange={e => setLugar(e.target.value)}
                                    required
                                    placeholder="Ej. San José, Costa Rica"
                                />
                            </label>
                            <label>
                                Estado
                                <select value={estado} onChange={e => setEstado(e.target.value)}>
                                    <option value="disponible">Disponible</option>
                                    <option value="reservado">Reservado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </label>
                        </div>
                        <label>
                            Descripción
                            <input
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                required
                                placeholder="Cuéntale a la gente de qué se trata"
                            />
                        </label>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Creando...' : 'Crear evento'}
                        </button>
                    </form>
                    {message && <p className="auth-message">{message}</p>}
                </div>
            </div>
        </div>
    )
}