import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import domiciliarioService from '../../services/domiciliarioService'
import './DomiciliarioLogin.css'

const DomiciliarioLogin = () => {
  const [form, setForm] = useState({ cedula: '', contrasena: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginDomiciliario } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula || !form.contrasena) { setError('Todos los campos son requeridos'); return }
    setLoading(true)
    setError('')
    try {
      const domi = await domiciliarioService.login(form.cedula.trim(), form.contrasena.trim())
      if (domi) {
        loginDomiciliario(domi)
        navigate('/domiciliario')
      } else {
        setError('Cédula o contraseña incorrecta, o cuenta inactiva.')
      }
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="domi-login-page">
      <div className="domi-login-card">
        <div className="domi-login-brand">
          <div className="domi-login-logo"><i className="fas fa-motorcycle"></i></div>
          <h1>NEW LIFE</h1>
          <p>Portal de Domiciliarios</p>
        </div>

        <form onSubmit={handleSubmit} className="domi-login-form">
          <h2 className="domi-login-title">Iniciar sesión</h2>
          <p className="domi-login-sub">Ingresa tu cédula y contraseña</p>

          {error && (
            <div className="domi-login-error">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <div className="domi-login-field">
            <label>Cédula</label>
            <div className="domi-login-input-wrap">
              <i className="fas fa-id-card"></i>
              <input
                type="text"
                placeholder="Número de cédula"
                value={form.cedula}
                onChange={e => setForm(p => ({ ...p, cedula: e.target.value }))}
                autoFocus
              />
            </div>
          </div>

          <div className="domi-login-field">
            <label>Contraseña</label>
            <div className="domi-login-input-wrap">
              <i className="fas fa-lock"></i>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={form.contrasena}
                onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))}
              />
              <button type="button" className="domi-login-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="domi-login-btn" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Verificando...</>
              : <><i className="fas fa-sign-in-alt me-2"></i>Ingresar</>
            }
          </button>

          <a href="/login" className="domi-login-back">
            <i className="fas fa-arrow-left me-1"></i>Volver al inicio
          </a>
        </form>
      </div>
    </div>
  )
}

export default DomiciliarioLogin
