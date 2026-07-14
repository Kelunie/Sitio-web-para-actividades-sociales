import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BASE_URL } from './config'

export default function Perfil({ token, onUpdated }) {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState(null)

    function extraerMensajeError(data, text) {
        const detail = data?.detail
        if (Array.isArray(detail)) {
            return detail.map(e => e.msg || JSON.stringify(e)).join(' / ')
        }
        if (typeof detail === 'string') return detail
        return data?.message || text || 'Error al cargar el perfil'
    }

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        async function cargarPerfil() {
            try {
                const res = await fetch(`${BASE_URL}/usuarios/perfil`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const text = await res.text()
                const data = text ? JSON.parse(text) : {}
                if (!res.ok) throw new Error(extraerMensajeError(data, text))
                setNombre(data.nombre ?? '')
                setEmail(data.email ?? '')
            } catch (err) {
                setMessage(err.message)
            } finally {
                setLoading(false)
            }
        }
        cargarPerfil()
    }, [token])

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setMessage(null)
        try {
            const res = await fetch(`${BASE_URL}/usuarios/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nombre, email }),
            })
            const text = await res.text()
            const data = text ? JSON.parse(text) : {}
            if (!res.ok) throw new Error(extraerMensajeError(data, text))
            setMessage('Perfil actualizado correctamente')
            if (onUpdated) onUpdated(data)
        } catch (err) {
            setMessage(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (!token) {
        return (
            <div className="profile-page">
                <div className="auth-modal">
                    <p>Inicia sesión para ver tu perfil.</p>
                    <Link to="/" className="btn-secondary">Volver al inicio</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page">
            <div className="auth-modal">
                <Link to="/" className="btn-secondary">← Volver</Link>
                <div className="auth-content">
                    <h2>Mi perfil</h2>
                    <p>Consulta y actualiza tu información</p>

                    {loading ? (
                        <p className="auth-message">Cargando perfil...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <label>
                                Nombre
                                <input
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    required
                                    placeholder="Tu nombre"
                                />
                            </label>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@email.com"
                                />
                            </label>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </form>
                    )}
                    {message && <p className="auth-message">{message}</p>}
                </div>
            </div>
        </div>
    )
}
