import React, { useState } from 'react'
import { BASE_URL } from './config'

export default function EditEventModal({ token, evento, onClose, onSuccess }) {
    const [nombre, setNombre] = useState(evento?.nombre ?? '')
    const [fecha, setFecha] = useState(evento?.fecha ?? '')
    const [lugar, setLugar] = useState(evento?.lugar ?? '')
    const [descripcion, setDescripcion] = useState(evento?.descripcion ?? '')
    const [capacidad, setCapacidad] = useState(evento?.capacidad ?? '')
    const [estado, setEstado] = useState(evento?.estado ?? 'disponible')
    const [imagenUrl, setImagenUrl] = useState(evento?.imagen_url ?? '')
    const [message, setMessage] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const hoy = new Date().toISOString().split('T')[0]

    function extraerMensajeError(data, text) {
        const detail = data?.detail
        if (Array.isArray(detail)) {
            return detail.map(e => e.msg || JSON.stringify(e)).join(' / ')
        }
        if (typeof detail === 'string') return detail
        return data?.message || text || 'Error al actualizar evento'
    }

    function handleImageChange(e) {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = function (event) {
            const img = new Image()
            img.onload = function () {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 600
                const MAX_HEIGHT = 400
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
                setImagenUrl(dataUrl)
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
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
                imagen_url: imagenUrl || null,
            }
            body.capacidad = capacidad ? Number(capacidad) : null

            const res = await fetch(`${BASE_URL}/actividades/eventos/${evento.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })
            const text = await res.text()
            const data = text ? JSON.parse(text) : {}
            if (!res.ok) throw new Error(extraerMensajeError(data, text))
            
            setMessage('Evento actualizado correctamente')
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess(data)
                }, 1000)
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
                    <div className="auth-icon">📝</div>
                </div>

                <div className="auth-content">
                    <h2>Editar evento</h2>
                    <p>Actualiza la información de tu evento</p>
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
                            Imagen del evento (opcional)
                            <div className="image-upload-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ padding: '0.5rem' }}
                                />
                                {imagenUrl && (
                                    <>
                                        <div className="image-preview-thumbnail">
                                            <img src={imagenUrl} alt="Vista previa" />
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-remove-image" 
                                            onClick={() => setImagenUrl('')}
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </div>
                        </label>

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
                            {submitting ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </form>
                    {message && <p className="auth-message">{message}</p>}
                </div>
            </div>
        </div>
    )
}
