import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/atoms'
import { PageHeader } from '../../components/organisms'
import verificacionService from '../../services/verificacionService'
import clienteService from '../../services/clienteService'
import responsableService from '../../services/responsableService'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=correo, 2=código+nueva pass, 3=éxito
  const [correo, setCorreo] = useState('')
  const [rol, setRol] = useState('cliente')
  const [codigo, setCodigo] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [nombres, setNombres] = useState('')

  const startCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1: Verificar si el correo existe y enviar código
  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!correo || !/\S+@\S+\.\S+/.test(correo)) {
      setErrors({ correo: 'Ingresa un correo válido.' })
      return
    }
    setIsLoading(true)
    try {
      let existe = false
      let nombreUsuario = 'usuario'

      if (rol === 'cliente') {
        const clientes = await clienteService.getAll()
        const found = clientes.find(c => c.correo === correo)
        if (found) { existe = true; nombreUsuario = found.nombres }
      } else {
        const responsables = await responsableService.getAll()
        const found = responsables.find(r => r.correo === correo)
        if (found) { existe = true; nombreUsuario = found.nombres }
      }

      if (!existe) {
        setErrors({ correo: 'No existe una cuenta con ese correo.' })
        setIsLoading(false)
        return
      }

      setNombres(nombreUsuario)
      const res = await verificacionService.enviarCodigo(correo, nombreUsuario, 'recuperacion')
      if (!res.success) {
        setErrors({ correo: res.message || 'No se pudo enviar el código.' })
        setIsLoading(false)
        return
      }
      setStep(2)
      startCooldown()
    } catch {
      setErrors({ correo: 'Error al conectar con el servidor.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verificar código y cambiar contraseña
  const handleCambiar = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!codigo || codigo.length < 6) newErrors.codigo = 'Ingresa el código de 6 dígitos.'
    if (!nuevaContrasena || nuevaContrasena.length < 6) newErrors.nuevaContrasena = 'Mínimo 6 caracteres.'
    if (nuevaContrasena !== confirmarContrasena) newErrors.confirmarContrasena = 'Las contraseñas no coinciden.'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setIsLoading(true)
    try {
      const res = await verificacionService.recuperarPassword(correo, codigo, nuevaContrasena, rol)
      if (res.success) {
        setStep(3)
      } else {
        setErrors({ codigo: res.message || 'Código incorrecto o expirado.' })
      }
    } catch {
      setErrors({ codigo: 'Error al conectar con el servidor.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setIsLoading(true)
    try {
      await verificacionService.enviarCodigo(correo, nombres, 'recuperacion')
      startCooldown()
      setErrors({})
    } catch {
      setErrors({ codigo: 'No se pudo reenviar el código.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fp-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Recuperar contraseña', path: '/forgot-password' }]}
        title="Recuperar Contraseña"
        subtitle="Te enviaremos un código a tu correo registrado"
      />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="fp-card">

                {/* ====== STEP 1: CORREO ====== */}
                {step === 1 && (
                  <>
                    <div className="fp-header text-center mb-4">
                      <div className="fp-icon mb-3"><i className="fas fa-lock-open"></i></div>
                      <h2 className="fp-title">¿Olvidaste tu contraseña?</h2>
                      <p className="text-muted">Ingresa tu correo y te enviaremos un código para restablecerla.</p>
                    </div>

                    {errors.correo && (
                      <div className="alert alert-danger"><i className="fas fa-exclamation-circle me-2"></i>{errors.correo}</div>
                    )}

                    <form onSubmit={handleEnviar}>
                      <div className="mb-3">
                        <label className="form-label"><i className="fas fa-user-circle me-2"></i>Tipo de cuenta</label>
                        <div className="d-flex gap-2">
                          <button type="button"
                            className={`btn flex-fill ${rol === 'cliente' ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => setRol('cliente')}>
                            <i className="fas fa-user me-2"></i>Cliente
                          </button>
                          <button type="button"
                            className={`btn flex-fill ${rol === 'responsable' ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => setRol('responsable')}>
                            <i className="fas fa-user-tie me-2"></i>Responsable
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label"><i className="fas fa-envelope me-2"></i>Correo electrónico</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="tu@correo.com"
                          value={correo}
                          onChange={e => { setCorreo(e.target.value); setErrors({}) }}
                        />
                      </div>

                      <Button type="submit" variant="success" className="w-100 fp-btn" disabled={isLoading}>
                        {isLoading
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando código...</>
                          : <><i className="fas fa-paper-plane me-2"></i>Enviar código</>
                        }
                      </Button>

                      <div className="text-center mt-3">
                        <Link to="/login" className="fp-back-link"><i className="fas fa-arrow-left me-1"></i>Volver al inicio de sesión</Link>
                      </div>
                    </form>
                  </>
                )}

                {/* ====== STEP 2: CÓDIGO + NUEVA CONTRASEÑA ====== */}
                {step === 2 && (
                  <>
                    <div className="fp-header text-center mb-4">
                      <div className="fp-icon orange mb-3"><i className="fas fa-key"></i></div>
                      <h2 className="fp-title">Restablecer contraseña</h2>
                      <p className="text-muted mb-1">Código enviado a:</p>
                      <strong className="text-warning">{correo}</strong>
                    </div>

                    {errors.general && (
                      <div className="alert alert-danger"><i className="fas fa-exclamation-circle me-2"></i>{errors.general}</div>
                    )}

                    <form onSubmit={handleCambiar}>
                      <div className="mb-3">
                        <label className="form-label text-center d-block"><i className="fas fa-shield-alt me-2"></i>Código de verificación</label>
                        <input
                          type="text"
                          className={`form-control fp-code-input text-center ${errors.codigo ? 'is-invalid' : ''}`}
                          placeholder="_ _ _ _ _ _"
                          maxLength={6}
                          value={codigo}
                          onChange={e => { setCodigo(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, codigo: '' })) }}
                        />
                        {errors.codigo && <div className="invalid-feedback d-block text-center">{errors.codigo}</div>}
                      </div>

                      <div className="mb-3">
                        <label className="form-label"><i className="fas fa-lock me-2"></i>Nueva contraseña</label>
                        <div className="position-relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            className={`form-control ${errors.nuevaContrasena ? 'is-invalid' : ''}`}
                            placeholder="Mínimo 6 caracteres"
                            value={nuevaContrasena}
                            onChange={e => { setNuevaContrasena(e.target.value); setErrors(p => ({ ...p, nuevaContrasena: '' })) }}
                          />
                          <button type="button" className="fp-eye-btn" onClick={() => setShowPass(!showPass)}>
                            <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.nuevaContrasena && <div className="invalid-feedback d-block">{errors.nuevaContrasena}</div>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label"><i className="fas fa-lock me-2"></i>Confirmar contraseña</label>
                        <div className="position-relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            className={`form-control ${errors.confirmarContrasena ? 'is-invalid' : ''}`}
                            placeholder="Repite la contraseña"
                            value={confirmarContrasena}
                            onChange={e => { setConfirmarContrasena(e.target.value); setErrors(p => ({ ...p, confirmarContrasena: '' })) }}
                          />
                          <button type="button" className="fp-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                            <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.confirmarContrasena && <div className="invalid-feedback d-block">{errors.confirmarContrasena}</div>}
                      </div>

                      <Button type="submit" variant="success" className="w-100 fp-btn" disabled={isLoading}>
                        {isLoading
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                          : <><i className="fas fa-check-circle me-2"></i>Cambiar contraseña</>
                        }
                      </Button>

                      <div className="text-center mt-3">
                        <button type="button" className="btn btn-link text-muted" onClick={handleResend}
                          disabled={resendCooldown > 0 || isLoading} style={{ fontSize: '0.9rem' }}>
                          {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : <><i className="fas fa-redo me-1"></i>Reenviar código</>}
                        </button>
                      </div>
                      <div className="text-center">
                        <button type="button" className="btn btn-link text-muted" onClick={() => { setStep(1); setCodigo(''); setErrors({}) }} style={{ fontSize: '0.85rem' }}>
                          <i className="fas fa-arrow-left me-1"></i>Cambiar correo
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* ====== STEP 3: ÉXITO ====== */}
                {step === 3 && (
                  <div className="text-center py-3">
                    <div className="fp-success-icon mb-3"><i className="fas fa-check-circle"></i></div>
                    <h2 className="fp-title text-success">¡Contraseña actualizada!</h2>
                    <p className="text-muted mb-4">Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
                    <Button variant="success" className="fp-btn" onClick={() => navigate('/login')}>
                      <i className="fas fa-sign-in-alt me-2"></i>Ir a iniciar sesión
                    </Button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
