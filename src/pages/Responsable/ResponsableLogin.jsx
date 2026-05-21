import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import responsableService from '../../services/responsableService'
import './ResponsableLogin.css'

const ResponsableLogin = () => {
  const [form, setForm] = useState({ cedula: '', correo: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginResponsable } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.cedula || !form.correo) { setError('Todos los campos son requeridos'); return }
    setLoading(true)
    setError('')
    try {
      const resp = await responsableService.login(form.cedula.trim(), form.correo.trim())
      if (resp) {
        loginResponsable(resp)
        navigate('/responsable')
      } else {
        setError('Credenciales incorrectas o cuenta inactiva.')
      }
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resp-login-page">
      <div className="resp-login-card">
        <div className="resp-login-brand">
          <div className="resp-login-logo">
            <i className="fas fa-leaf"></i>
          </div>
          <h1>NEW LIFE</h1>
          <p>Portal de Responsables</p>
        </div>

        <form onSubmit={handleSubmit} className="resp-login-form">
          <h2 className="resp-login-title">Iniciar sesión</h2>
          <p className="resp-login-sub">Ingresa tus datos para acceder al portal</p>

          {error && (
            <div className="resp-login-error">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <div className="resp-login-field">
            <label>Cédula</label>
            <div className="resp-login-input-wrap">
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

          <div className="resp-login-field">
            <label>Correo electrónico</label>
            <div className="resp-login-input-wrap">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="correo@empresa.com"
                value={form.correo}
                onChange={e => setForm(p => ({ ...p, correo: e.target.value }))}
              />
            </div>
          </div>

          <button type="submit" className="resp-login-btn" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Verificando...</>
              : <><i className="fas fa-sign-in-alt me-2"></i>Ingresar</>
            }
          </button>

          <a href="/login" className="resp-login-back">
            <i className="fas fa-arrow-left me-1"></i>Volver al inicio
          </a>
        </form>
      </div>
    </div>
  )
}

export default ResponsableLogin
