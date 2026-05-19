import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import clienteService from '../../services/clienteService'
import './CambiarPassword.css'

const CambiarPassword = () => {
  const { cliente, loginCliente, clearPasswordChange, logoutCliente } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nueva: '', confirmar: '' })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  // Si no hay cliente logueado, redirigir
  if (!cliente) {
    navigate('/login')
    return null
  }

  const validate = () => {
    const e = {}
    if (!form.nueva || form.nueva.length < 6) e.nueva = 'La contraseña debe tener al menos 6 caracteres'
    else if (form.nueva === '111111') e.nueva = 'Debes elegir una contraseña diferente a la temporal'
    if (!form.confirmar) e.confirmar = 'Confirma tu nueva contraseña'
    else if (form.nueva !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsSaving(true)
    try {
      await clienteService.update(cliente.numero_identificacion, {
        ...cliente,
        contrasena: form.nueva
      })
      // Actualizar sesión y quitar la bandera
      loginCliente({ ...cliente }, form.nueva) // nueva contraseña → ya no es 111111
      clearPasswordChange()
      navigate('/')
    } catch (err) {
      setErrors({ general: err?.response?.data?.Message || 'Error al cambiar la contraseña. Intenta nuevamente.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    logoutCliente()
    navigate('/login')
  }

  return (
    <div className="cambiar-password-page">
      <div className="cambiar-password-container">
        <div className="cambiar-password-card">
          {/* Header */}
          <div className="cp-header">
            <div className="cp-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="cp-title">Cambia tu contraseña</h2>
            <p className="cp-subtitle">
              Hola <strong>{cliente.nombres?.split(' ')[0]}</strong>, tu cuenta fue creada con una contraseña temporal.
              <br />Por seguridad, debes establecer una contraseña personalizada antes de continuar.
            </p>
          </div>

          {/* Info banner */}
          <div className="cp-info-banner">
            <i className="fas fa-info-circle me-2"></i>
            Tu contraseña actual es temporal <strong>(111111)</strong>. Elige una nueva contraseña segura.
          </div>

          {errors.general && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>{errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="cp-form">
            {/* Nueva contraseña */}
            <div className="cp-field">
              <label className="cp-label">
                <i className="fas fa-lock me-2"></i>Nueva Contraseña
              </label>
              <div className="cp-input-wrapper">
                <input
                  type={showNueva ? 'text' : 'password'}
                  className={`cp-input ${errors.nueva ? 'is-invalid' : ''}`}
                  value={form.nueva}
                  onChange={e => { setForm(p => ({ ...p, nueva: e.target.value })); setErrors(p => ({ ...p, nueva: '' })) }}
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" className="cp-toggle" onClick={() => setShowNueva(!showNueva)}>
                  <i className={`fas ${showNueva ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.nueva && <div className="cp-error">{errors.nueva}</div>}
            </div>

            {/* Confirmar contraseña */}
            <div className="cp-field">
              <label className="cp-label">
                <i className="fas fa-lock me-2"></i>Confirmar Contraseña
              </label>
              <div className="cp-input-wrapper">
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  className={`cp-input ${errors.confirmar ? 'is-invalid' : ''}`}
                  value={form.confirmar}
                  onChange={e => { setForm(p => ({ ...p, confirmar: e.target.value })); setErrors(p => ({ ...p, confirmar: '' })) }}
                  placeholder="Repite la contraseña"
                />
                <button type="button" className="cp-toggle" onClick={() => setShowConfirmar(!showConfirmar)}>
                  <i className={`fas ${showConfirmar ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmar && <div className="cp-error">{errors.confirmar}</div>}
            </div>

            {/* Indicador de fortaleza */}
            {form.nueva.length > 0 && (
              <div className="cp-strength">
                <div className="cp-strength-bar">
                  <div
                    className={`cp-strength-fill ${form.nueva.length < 6 ? 'weak' : form.nueva.length < 10 ? 'medium' : 'strong'}`}
                    style={{ width: `${Math.min(100, (form.nueva.length / 12) * 100)}%` }}
                  ></div>
                </div>
                <span className="cp-strength-label">
                  {form.nueva.length < 6 ? 'Muy corta' : form.nueva.length < 10 ? 'Aceptable' : 'Segura'}
                </span>
              </div>
            )}

            <button type="submit" className="cp-submit-btn" disabled={isSaving}>
              {isSaving
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                : <><i className="fas fa-shield-alt me-2"></i>Establecer Nueva Contraseña</>
              }
            </button>
          </form>

          <div className="cp-footer">
            <button className="cp-logout-link" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-1"></i>Cerrar sesión y entrar con otra cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CambiarPassword
