import React from 'react'
import Login from './Login'
import Register from './Register'

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-modal-top">
          <div className="auth-icon">⚡</div>
          <div className="auth-tab-list">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => onSwitch('login')}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => onSwitch('register')}
              type="button"
            >
              Registrarse
            </button>
          </div>
        </div>

        <div className="auth-content">
          {mode === 'login' ? (
            <Login onBack={onSwitch} onSuccess={onSuccess} />
          ) : (
            <Register onBack={onSwitch} onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  )
}
