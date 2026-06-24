import React, { useState } from 'react'

export default function Login({ onBack, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch('/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data?.detail || data?.message || text || 'Error en login')
      setMessage('Login correcto')
      console.log('Login response:', data)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div>
      <h2>Bienvenido de vuelta</h2>
      <p>Accede a tus eventos y comunidad</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" />
        </label>
        <button type="submit" className="btn-primary">Entrar</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <div className="auth-footer">
        ¿No tienes cuenta?
        <button type="button" onClick={() => onBack('register')}>
          Regístrate
        </button>
      </div>
    </div>
  )
}
