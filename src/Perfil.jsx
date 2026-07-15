import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BASE_URL } from './config'
import EditEventModal from './EditEventModal'

export default function Perfil({ token, onUpdated }) {
    const [activeTab, setActiveTab] = useState('attending') // 'attending', 'created', 'settings'
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [imagenUrl, setImagenUrl] = useState('')
    
    const [eventosCreados, setEventosCreados] = useState([])
    const [eventosAsistidos, setEventosAsistidos] = useState([])
    
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState(null)
    const [editingEvento, setEditingEvento] = useState(null)

    function extraerMensajeError(data, text) {
        const detail = data?.detail
        if (Array.isArray(detail)) {
            return detail.map(e => e.msg || JSON.stringify(e)).join(' / ')
        }
        if (typeof detail === 'string') return detail
        return data?.message || text || 'Error al cargar el perfil'
    }

    async function cargarPerfil() {
        if (!token) return
        try {
            setLoading(true)
            const res = await fetch(`${BASE_URL}/usuarios/perfil`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const text = await res.text()
            const data = text ? JSON.parse(text) : {}
            if (!res.ok) throw new Error(extraerMensajeError(data, text))
            
            setNombre(data.usuario?.nombre ?? '')
            setEmail(data.usuario?.email ?? '')
            setImagenUrl(data.usuario?.imagen_url ?? '')
            setEventosCreados(data.eventos_creados ?? [])
            setEventosAsistidos(data.eventos_asistidos ?? [])
        } catch (err) {
            setMessage(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        cargarPerfil()
    }, [token])

    function handleAvatarChange(e) {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = function (event) {
            const img = new Image()
            img.onload = function () {
                const canvas = document.createElement('canvas')
                const SIZE = 300
                canvas.width = SIZE
                canvas.height = SIZE
                const ctx = canvas.getContext('2d')
                
                const size = Math.min(img.width, img.height)
                const sx = (img.width - size) / 2
                const sy = (img.height - size) / 2
                
                ctx.drawImage(img, sx, sy, size, size, 0, 0, SIZE, SIZE)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
                setImagenUrl(dataUrl)
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }

    async function handleUpdateProfile(e) {
        e.preventDefault()
        setSubmitting(true)
        setMessage(null)
        try {
            const body = { nombre, email, imagen_url: imagenUrl || null }
            if (password.trim()) {
                body.password = password
            }

            const res = await fetch(`${BASE_URL}/usuarios/perfil`, {
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
            
            setMessage('Perfil actualizado correctamente')
            setPassword('')
            if (onUpdated) onUpdated(data)
        } catch (err) {
            setMessage(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDeleteEvent(eventoId) {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.')) return
        
        try {
            const res = await fetch(`${BASE_URL}/actividades/eventos/${eventoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || 'Error al eliminar el evento')
            alert('Evento eliminado exitosamente')
            cargarPerfil()
        } catch (err) {
            alert(err.message)
        }
    }

    if (!token) {
        return (
            <div className="profile-page" style={{ width: '100%' }}>
                <div className="auth-modal" style={{ margin: '3rem auto' }}>
                    <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Inicia sesión para acceder a tu perfil.</p>
                    <Link to="/" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>Volver al inicio</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page-wrapper" style={{ width: '100%' }}>
            <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
                ← Volver al inicio
            </Link>

            {loading && eventosCreados.length === 0 && eventosAsistidos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="auth-message">Cargando tablero de perfil...</p>
                </div>
            ) : (
                <div className="profile-container">
                    <aside className="profile-sidebar">
                        <div className="profile-avatar-container">
                            {imagenUrl ? (
                                <img src={imagenUrl} alt="Foto de perfil" className="user-avatar-img" />
                            ) : (
                                <span className="profile-avatar-placeholder">
                                    {(nombre || email || 'U').charAt(0).toUpperCase()}
                                </span>
                            )}
                            <label className="avatar-upload-hover">
                                📷
                                <span>Cambiar</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange} 
                                    style={{ display: 'none' }} 
                                />
                            </label>
                        </div>

                        <div className="profile-sidebar-info">
                            <h3>{nombre || 'Usuario'}</h3>
                            <p>{email}</p>
                        </div>

                        <nav className="profile-nav-tabs">
                            <button 
                                className={`profile-tab-btn ${activeTab === 'attending' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('attending'); setMessage(null); }}
                            >
                                📅 Eventos a Asistir
                            </button>
                            <button 
                                className={`profile-tab-btn ${activeTab === 'created' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('created'); setMessage(null); }}
                            >
                                🛠️ Mis Eventos Creados
                            </button>
                            <button 
                                className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('settings'); setMessage(null); }}
                            >
                                ⚙️ Ajustes de Cuenta
                            </button>
                        </nav>
                    </aside>

                    <main className="profile-main-content">
                        {activeTab === 'attending' && (
                            <>
                                <h2>Eventos a Asistir</h2>
                                <p>Descubre los eventos a los que has confirmado asistencia</p>

                                {eventosAsistidos.length === 0 ? (
                                    <div className="no-events-placeholder">
                                        <span>📅</span>
                                        <p>No tienes eventos agendados todavía. ¡Descubre nuevos eventos en la página principal!</p>
                                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '99px' }}>
                                            Explorar eventos
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="profile-events-grid">
                                        {eventosAsistidos.map(evento => (
                                            <article key={evento.id || evento._id} className="event-card">
                                                {evento.imagen_url && (
                                                    <div className="event-card-banner">
                                                        <img src={evento.imagen_url} alt={evento.nombre} />
                                                    </div>
                                                )}
                                                <div className="event-card-top">
                                                    <span className="event-chip">{evento.categoria ?? 'Asistiré'}</span>
                                                    <strong>{evento.nombre}</strong>
                                                </div>
                                                <p className="event-description">{evento.descripcion}</p>
                                                <div className="event-meta">
                                                    <span>📅 {evento.fecha}</span>
                                                    <span>📍 {evento.lugar}</span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'created' && (
                            <>
                                <h2>Mis Eventos Creados</h2>
                                <p>Administra y edita las actividades que has organizado</p>

                                {eventosCreados.length === 0 ? (
                                    <div className="no-events-placeholder">
                                        <span>🛠️</span>
                                        <p>Aún no has creado ningún evento. ¡Sé el alma de la comunidad y crea tu primera actividad!</p>
                                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '99px' }}>
                                            Crear un evento
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="profile-events-grid">
                                        {eventosCreados.map(evento => (
                                            <article key={evento.id || evento._id} className="event-card">
                                                {evento.imagen_url && (
                                                    <div className="event-card-banner">
                                                        <img src={evento.imagen_url} alt={evento.nombre} />
                                                    </div>
                                                )}
                                                <div className="event-card-top">
                                                    <span className="event-chip status-disponible">{evento.estado ?? 'Disponible'}</span>
                                                    <strong>{evento.nombre}</strong>
                                                </div>
                                                <p className="event-description">{evento.descripcion}</p>
                                                <div className="event-meta">
                                                    <span>📅 {evento.fecha}</span>
                                                    <span>📍 {evento.lugar}</span>
                                                </div>
                                                <div className="event-card-actions">
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => setEditingEvento(evento)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn-danger"
                                                        onClick={() => handleDeleteEvent(evento.id || evento._id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                <h2>Ajustes de Cuenta</h2>
                                <p>Actualiza la información de tu perfil y credenciales de acceso</p>

                                <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '1.25rem' }}>
                                    <label>
                                        Nombre Completo / Usuario
                                        <input
                                            value={nombre}
                                            onChange={e => setNombre(e.target.value)}
                                            required
                                            placeholder="Tu nombre"
                                            style={{
                                                width: '100%',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                borderRadius: '16px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                color: '#f8fafc',
                                                padding: '0.95rem 1rem'
                                            }}
                                        />
                                    </label>
                                    <label>
                                        Correo Electrónico
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            placeholder="tu@email.com"
                                            style={{
                                                width: '100%',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                borderRadius: '16px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                color: '#f8fafc',
                                                padding: '0.95rem 1rem'
                                            }}
                                        />
                                    </label>
                                    <label>
                                        Nueva Contraseña
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Dejar en blanco para mantener la actual"
                                            style={{
                                                width: '100%',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                borderRadius: '16px',
                                                background: 'rgba(255, 255, 255, 0.04)',
                                                color: '#f8fafc',
                                                padding: '0.95rem 1rem'
                                            }}
                                        />
                                    </label>

                                    <button 
                                        type="submit" 
                                        className="btn-primary" 
                                        disabled={submitting}
                                        style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                                    >
                                        {submitting ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </form>
                                {message && <p className="auth-message" style={{ textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
                            </>
                        )}
                    </main>
                </div>
            )}

            {editingEvento && (
                <EditEventModal
                    token={token}
                    evento={editingEvento}
                    onClose={() => setEditingEvento(null)}
                    onSuccess={() => {
                        setEditingEvento(null)
                        cargarPerfil()
                    }}
                />
            )}
        </div>
    )
}
