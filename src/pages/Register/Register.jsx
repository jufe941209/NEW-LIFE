import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/atoms'
import { PageHeader } from '../../components/organisms'
import clienteService from '../../services/clienteService'
import administradorService from '../../services/administradorService'

import './Register.css'

const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI']
const TIPOS_CLIENTE = ['Natural', 'Juridico']

const Register = () => {
  const navigate = useNavigate()
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
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      // Verificar si ya existe un cliente con ese correo o identificación (activo o inactivo)
      const [porCorreo, porId] = await Promise.all([
        clienteService.existsByCorreo(formData.correo),
        clienteService.existsByIdentificacion(formData.numero_identificacion)
      ])
      if (porCorreo || porId) {
        const estaInactivo = (porCorreo?.estado === 'Inactivo') || (porId?.estado === 'Inactivo')
        if (estaInactivo) {
          setErrors({ general: 'Esta cuenta fue desactivada por un administrador. Contacta al administrador para reactivarla.' })
        } else {
          setErrors({ general: 'Ya existe una cuenta con ese correo o número de identificación. Inicia sesión.' })
        }
        setIsLoading(false)
        return
      }

      // Buscar cualquier admin activo para asociar el registro
      let cedula_adm = '1001234567' // fallback
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
        fecha_registro: new Date().toISOString(),
        cedula_adm
      })
      navigate('/login', { state: { message: '¡Cuenta creada! Ya puedes iniciar sesión.', registeredEmail: formData.correo } })
    } catch (error) {
      const msg = error?.response?.data?.Message || 'Error al registrar. Verifica los datos e intenta nuevamente.'
      setErrors({ general: msg })
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
                  <h2 className="register-title">Crea tu cuenta</h2>
                  <p className="register-subtitle text-muted">Completa tus datos para registrarte como cliente</p>
                </div>

                {errors.general && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>{errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                  {/* Fila 1: Tipo documento + Número */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label"><i className="fas fa-id-card me-2"></i>Tipo de Documento</label>
                      <select
                        name="tipo_documento"
                        className="form-select"
                        value={formData.tipo_documento}
                        onChange={handleChange}
                      >
                        {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-8 mb-3">
                      <label className="form-label"><i className="fas fa-hashtag me-2"></i>Número de Identificación *</label>
                      <Input
                        type="text"
                        name="numero_identificacion"
                        placeholder="1234567890"
                        value={formData.numero_identificacion}
                        onChange={handleChange}
                        className={errors.numero_identificacion ? 'is-invalid' : ''}
                        icon="fas fa-id-badge"
                        iconPosition="left"
                      />
                      {errors.numero_identificacion && <div className="invalid-feedback d-block">{errors.numero_identificacion}</div>}
                    </div>
                  </div>

                  {/* Tipo cliente + Nombres */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label"><i className="fas fa-user-tag me-2"></i>Tipo de Cliente</label>
                      <select
                        name="tipo_cliente"
                        className="form-select"
                        value={formData.tipo_cliente}
                        onChange={handleChange}
                      >
                        {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-8 mb-3">
                      <label className="form-label"><i className="fas fa-user me-2"></i>Nombres Completos *</label>
                      <Input
                        type="text"
                        name="nombres"
                        placeholder="Ana Martínez"
                        value={formData.nombres}
                        onChange={handleChange}
                        className={errors.nombres ? 'is-invalid' : ''}
                        icon="fas fa-user"
                        iconPosition="left"
                      />
                      {errors.nombres && <div className="invalid-feedback d-block">{errors.nombres}</div>}
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="form-group mb-3">
                    <label className="form-label"><i className="fas fa-envelope me-2"></i>Correo Electrónico *</label>
                    <Input
                      type="email"
                      name="correo"
                      placeholder="tu@correo.com"
                      value={formData.correo}
                      onChange={handleChange}
                      className={errors.correo ? 'is-invalid' : ''}
                      icon="fas fa-envelope"
                      iconPosition="left"
                    />
                    {errors.correo && <div className="invalid-feedback d-block">{errors.correo}</div>}
                  </div>

                  {/* Teléfono + Dirección */}
                  <div className="row">
                    <div className="col-md-5 mb-3">
                      <label className="form-label"><i className="fas fa-phone me-2"></i>Teléfono *</label>
                      <Input
                        type="tel"
                        name="telefono"
                        placeholder="3001234567"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={errors.telefono ? 'is-invalid' : ''}
                        icon="fas fa-phone"
                        iconPosition="left"
                      />
                      {errors.telefono && <div className="invalid-feedback d-block">{errors.telefono}</div>}
                    </div>
                    <div className="col-md-7 mb-3">
                      <label className="form-label"><i className="fas fa-map-marker-alt me-2"></i>Dirección *</label>
                      <Input
                        type="text"
                        name="direccion"
                        placeholder="Calle 45 #10-20, Bogotá"
                        value={formData.direccion}
                        onChange={handleChange}
                        className={errors.direccion ? 'is-invalid' : ''}
                        icon="fas fa-map-marker-alt"
                        iconPosition="left"
                      />
                      {errors.direccion && <div className="invalid-feedback d-block">{errors.direccion}</div>}
                    </div>
                  </div>

                  {/* Contraseñas */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><i className="fas fa-lock me-2"></i>Contraseña *</label>
                      <div className="password-input-wrapper">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="contrasena"
                          placeholder="••••••••"
                          value={formData.contrasena}
                          onChange={handleChange}
                          className={errors.contrasena ? 'is-invalid' : ''}
                          icon="fas fa-lock"
                          iconPosition="left"
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      {errors.contrasena && <div className="invalid-feedback d-block">{errors.contrasena}</div>}
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label"><i className="fas fa-lock me-2"></i>Confirmar Contraseña *</label>
                      <div className="password-input-wrapper">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={errors.confirmPassword ? 'is-invalid' : ''}
                          icon="fas fa-lock"
                          iconPosition="left"
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                          <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                    </div>
                  </div>

                  <Button type="submit" variant="success" className="register-button w-100 mb-3" disabled={isLoading}>
                    {isLoading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Creando cuenta...</>
                      : <><i className="fas fa-user-plus me-2"></i>Crear Cuenta</>
                    }
                  </Button>

                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      ¿Ya tienes cuenta?{' '}
                      <Link to="/login" className="login-link">Inicia sesión aquí</Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
