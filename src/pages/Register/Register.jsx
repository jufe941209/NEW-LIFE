import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/atoms'
import { PageHeader } from '../../components/organisms'
import clienteService from '../../services/clienteService'
import administradorService from '../../services/administradorService'
import verificacionService from '../../services/verificacionService'

import './Register.css'

const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI']
const TIPOS_CLIENTE = ['Natural', 'Juridico']

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = form, 2 = código verificación
  const [formData, setFormData] = useState({
    numero_identificacion: '',
    tipo_documento: 'CC',
    tipo_cliente: 'Natural',
    nombres: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    confirmPassword: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [codigoInput, setCodigoInput] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.numero_identificacion.trim()) newErrors.numero_identificacion = 'El número de identificación es requerido'
    if (!formData.nombres.trim() || formData.nombres.trim().length < 3) newErrors.nombres = 'El nombre debe tener al menos 3 caracteres'
    if (!formData.correo || !/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Ingresa un correo válido'
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida'
    if (!formData.contrasena || formData.contrasena.length < 6) newErrors.contrasena = 'Mínimo 6 caracteres'
    if (formData.contrasena !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos y condiciones para continuar'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const startCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1: Validar form y enviar código
  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const clientes = await clienteService.getAll()
      const porCorreo = clientes.find(c => c.correo === formData.correo) || null
      const porId = clientes.find(c => c.numero_identificacion === formData.numero_identificacion) || null
      if (porCorreo || porId) {
        const estaInactivo = (porCorreo?.estado === 'Inactivo') || (porId?.estado === 'Inactivo')
        setErrors({
          general: estaInactivo
            ? 'Esta cuenta fue desactivada. Contacta al administrador para reactivarla.'
            : 'Ya existe una cuenta con ese correo o número de identificación. Inicia sesión.'
        })
        setIsLoading(false)
        return
      }

      const res = await verificacionService.enviarCodigo(formData.correo, formData.nombres, 'registro')
      if (!res.success) {
        setErrors({ general: res.message || 'No se pudo enviar el código.' })
        setIsLoading(false)
        return
      }
      setStep(2)
      startCooldown()
    } catch {
      setErrors({ general: 'Error al conectar con el servidor. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verificar código y crear cuenta
  const handleVerifyAndCreate = async (e) => {
    e.preventDefault()
    if (!codigoInput.trim() || codigoInput.length < 6) {
      setErrors({ codigo: 'Ingresa el código de 6 dígitos.' })
      return
    }
    setIsLoading(true)
    try {
      const verificacion = await verificacionService.confirmarCodigo(formData.correo, codigoInput, 'registro')
      if (!verificacion.success) {
        setErrors({ codigo: verificacion.message || 'Código incorrecto o expirado.' })
        setIsLoading(false)
        return
      }

      let cedula_adm = '1001234567'
      try {
        const admins = await administradorService.getAll()
        const activo = admins.find(a => a.estado === 'Activo')
        if (activo) cedula_adm = activo.cedula_adm
      } catch { /* usa el fallback */ }

      await clienteService.create({
        numero_identificacion: formData.numero_identificacion,
        tipo_documento: formData.tipo_documento,
        tipo_cliente: formData.tipo_cliente,
        nombres: formData.nombres,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        contrasena: formData.contrasena,
        estado: 'Activo',
        fecha_registro: new Date().toISOString().slice(0, -1),
        cedula_adm
      })
      navigate('/login', { state: { message: '¡Cuenta verificada y creada! Ya puedes iniciar sesión.', registeredEmail: formData.correo } })
    } catch (error) {
      const msg = error?.response?.data?.Message || 'Error al crear la cuenta. Intenta nuevamente.'
      setErrors({ general: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setIsLoading(true)
    try {
      await verificacionService.enviarCodigo(formData.correo, formData.nombres, 'registro')
      startCooldown()
      setErrors({})
    } catch {
      setErrors({ general: 'No se pudo reenviar el código.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Registro', path: '/register' }]}
        title="Crear Cuenta"
        subtitle="Únete a NEW LIFE y empieza a comprar productos biodegradables"
      />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-9">
              <div className="register-card">
                <div className="register-header text-center mb-4">
                  <img src="/img/logoNewLife.png" alt="NEW LIFE Logo" className="register-logo mb-3" />
                  <h2 className="register-title">
                    {step === 1 ? 'Crea tu cuenta' : 'Verifica tu correo'}
                  </h2>
                  <p className="register-subtitle text-muted">
                    {step === 1
                      ? 'Completa tus datos para registrarte como cliente'
                      : `Ingresa el código que enviamos a ${formData.correo}`}
                  </p>
                  {step === 2 && (
                    <div className="step-indicator mt-2">
                      <span className="step-dot done"></span>
                      <span className="step-line"></span>
                      <span className="step-dot active"></span>
                    </div>
                  )}
                </div>

                {errors.general && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>{errors.general}
                  </div>
                )}

                {/* ====== STEP 1: FORMULARIO ====== */}
                {step === 1 && (
                  <form onSubmit={handleSendCode} className="register-form">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label"><i className="fas fa-id-card me-2"></i>Tipo de Documento</label>
                        <select name="tipo_documento" className="form-select" value={formData.tipo_documento} onChange={handleChange}>
                          {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="col-md-8 mb-3">
                        <label className="form-label"><i className="fas fa-hashtag me-2"></i>Número de Identificación *</label>
                        <Input type="text" name="numero_identificacion" placeholder="1234567890"
                          value={formData.numero_identificacion} onChange={handleChange}
                          className={errors.numero_identificacion ? 'is-invalid' : ''} icon="fas fa-id-badge" iconPosition="left" />
                        {errors.numero_identificacion && <div className="invalid-feedback d-block">{errors.numero_identificacion}</div>}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label"><i className="fas fa-user-tag me-2"></i>Tipo de Cliente</label>
                        <select name="tipo_cliente" className="form-select" value={formData.tipo_cliente} onChange={handleChange}>
                          {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="col-md-8 mb-3">
                        <label className="form-label"><i className="fas fa-user me-2"></i>Nombres Completos *</label>
                        <Input type="text" name="nombres" placeholder="Ana Martínez"
                          value={formData.nombres} onChange={handleChange}
                          className={errors.nombres ? 'is-invalid' : ''} icon="fas fa-user" iconPosition="left" />
                        {errors.nombres && <div className="invalid-feedback d-block">{errors.nombres}</div>}
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label"><i className="fas fa-envelope me-2"></i>Correo Electrónico *</label>
                      <Input type="email" name="correo" placeholder="tu@correo.com"
                        value={formData.correo} onChange={handleChange}
                        className={errors.correo ? 'is-invalid' : ''} icon="fas fa-envelope" iconPosition="left" />
                      {errors.correo && <div className="invalid-feedback d-block">{errors.correo}</div>}
                    </div>

                    <div className="row">
                      <div className="col-md-5 mb-3">
                        <label className="form-label"><i className="fas fa-phone me-2"></i>Teléfono *</label>
                        <Input type="tel" name="telefono" placeholder="3001234567"
                          value={formData.telefono} onChange={handleChange}
                          className={errors.telefono ? 'is-invalid' : ''} icon="fas fa-phone" iconPosition="left" />
                        {errors.telefono && <div className="invalid-feedback d-block">{errors.telefono}</div>}
                      </div>
                      <div className="col-md-7 mb-3">
                        <label className="form-label"><i className="fas fa-map-marker-alt me-2"></i>Dirección *</label>
                        <Input type="text" name="direccion" placeholder="Calle 45 #10-20, Bogotá"
                          value={formData.direccion} onChange={handleChange}
                          className={errors.direccion ? 'is-invalid' : ''} icon="fas fa-map-marker-alt" iconPosition="left" />
                        {errors.direccion && <div className="invalid-feedback d-block">{errors.direccion}</div>}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label"><i className="fas fa-lock me-2"></i>Contraseña *</label>
                        <div className="password-input-wrapper">
                          <Input type={showPassword ? 'text' : 'password'} name="contrasena" placeholder="••••••••"
                            value={formData.contrasena} onChange={handleChange}
                            className={errors.contrasena ? 'is-invalid' : ''} icon="fas fa-lock" iconPosition="left" />
                          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.contrasena && <div className="invalid-feedback d-block">{errors.contrasena}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label"><i className="fas fa-lock me-2"></i>Confirmar Contraseña *</label>
                        <div className="password-input-wrapper">
                          <Input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="••••••••"
                            value={formData.confirmPassword} onChange={handleChange}
                            className={errors.confirmPassword ? 'is-invalid' : ''} icon="fas fa-lock" iconPosition="left" />
                          <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                            <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                      </div>
                    </div>

                    {/* Términos y condiciones */}
                    <div className={`form-check mb-4 ${errors.terms ? 'terms-error' : ''}`}>
                      <input
                        type="checkbox"
                        className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={e => { setAcceptTerms(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: '' })) }}
                      />
                      <label className="form-check-label" htmlFor="acceptTerms">
                        He leído y acepto los{' '}
                        <Link to="/terminos" target="_blank" className="terms-link">
                          Términos y Condiciones
                        </Link>
                        {' '}y la Política de Privacidad de NEW LIFE
                      </label>
                      {errors.terms && <div className="invalid-feedback d-block">{errors.terms}</div>}
                    </div>

                    <Button type="submit" variant="success" className="register-button w-100 mb-3" disabled={isLoading}>
                      {isLoading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando código...</>
                        : <><i className="fas fa-paper-plane me-2"></i>Continuar y verificar correo</>
                      }
                    </Button>

                    <div className="text-center">
                      <p className="mb-0 text-muted">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="login-link">Inicia sesión aquí</Link>
                      </p>
                    </div>
                  </form>
                )}

                {/* ====== STEP 2: CÓDIGO DE VERIFICACIÓN ====== */}
                {step === 2 && (
                  <form onSubmit={handleVerifyAndCreate} className="register-form">
                    <div className="verify-code-box text-center mb-4">
                      <div className="verify-icon mb-3">
                        <i className="fas fa-envelope-open-text"></i>
                      </div>
                      <p className="text-muted mb-1">Te enviamos un código de 6 dígitos a:</p>
                      <strong className="text-success">{formData.correo}</strong>
                      <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                        Revisa tu bandeja de entrada y carpeta de spam. El código expira en 15 minutos.
                      </p>
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label text-center d-block">
                        <i className="fas fa-key me-2"></i>Código de verificación
                      </label>
                      <input
                        type="text"
                        className={`form-control code-input text-center ${errors.codigo ? 'is-invalid' : ''}`}
                        placeholder="_ _ _ _ _ _"
                        value={codigoInput}
                        maxLength={6}
                        onChange={e => { setCodigoInput(e.target.value.replace(/\D/g, '')); if (errors.codigo) setErrors(p => ({ ...p, codigo: '' })) }}
                      />
                      {errors.codigo && <div className="invalid-feedback d-block text-center">{errors.codigo}</div>}
                    </div>

                    <Button type="submit" variant="success" className="register-button w-100 mb-3" disabled={isLoading}>
                      {isLoading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Creando cuenta...</>
                        : <><i className="fas fa-check-circle me-2"></i>Verificar y crear cuenta</>
                      }
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-muted"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isLoading}
                        style={{ fontSize: '0.9rem' }}
                      >
                        {resendCooldown > 0
                          ? `Reenviar código en ${resendCooldown}s`
                          : <><i className="fas fa-redo me-1"></i>Reenviar código</>
                        }
                      </button>
                    </div>

                    <div className="text-center mt-2">
                      <button type="button" className="btn btn-link text-muted" onClick={() => { setStep(1); setCodigoInput(''); setErrors({}) }} style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-arrow-left me-1"></i>Volver y editar datos
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
