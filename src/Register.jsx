import React, { useState } from 'react'
import { BASE_URL } from './config'

export default function Register({ onBack, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${BASE_URL}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, email, password })
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (res.status !== 201) throw new Error(data?.detail || data?.message || text || 'Error en registro')
      setMessage('Registro completado')
      console.log('Registro response:', data)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div>
      <h2>Únete a Eventura</h2>
      <p>Crea tu cuenta y empieza a conectar</p>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" />
        </label>
        <button type="submit" className="btn-primary">Crear cuenta</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <div className="auth-footer">
        ¿Ya tienes cuenta?
        <button type="button" onClick={() => onBack('login')}>
          Inicia sesión
        </button>
      </div>
    </div>
  )
}
