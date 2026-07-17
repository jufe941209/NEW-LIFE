import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Input } from '../../components/atoms'
import { PageHeader } from '../../components/organisms'
import { useAuth } from '../../context/AuthContext'
import administradorService from '../../services/administradorService'
import clienteService from '../../services/clienteService'
import responsableService from '../../services/responsableService'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginAdmin, loginCliente, loginResponsable } = useAuth()
  const [formData, setFormData] = useState({ correo: location.state?.registeredEmail || '', contrasena: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const successMessage = location.state?.message || null
  const returnTo = location.state?.returnTo || null
  const errorRef = useRef(null)

  useEffect(() => {
    if (errors.general && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors.general])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.correo) newErrors.correo = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'El correo no es válido'
    if (!formData.contrasena) newErrors.contrasena = 'La contraseña es requerida'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      // 1) Intentar como administrador
      const adminData = await administradorService.login(formData.correo, formData.contrasena)
      if (adminData) {
        loginAdmin(adminData)
        navigate('/admin')
        return
      }

      // 2) Intentar como responsable (correo + contraseña)
      const respData = await responsableService.loginWithPassword(formData.correo, formData.contrasena)
      if (respData) {
        loginResponsable(respData)
        navigate('/responsable')
        return
      }

      // 3) Intentar como cliente
      const result = await clienteService.login(formData.correo, formData.contrasena)
      if (result?.cliente) {
        loginCliente(result.cliente, formData.contrasena)
        navigate(formData.contrasena === '111111' ? '/cambiar-password' : (returnTo || '/'))
        return
      }
      if (result?.inactivo) {
        setErrors({ general: 'Tu cuenta está desactivada. Contacta al administrador para reactivarla.' })
        return
      }

      setErrors({ general: 'Correo o contraseña incorrectos. Verifica tus datos.' })
    } catch (error) {
      setErrors({ general: 'Error al conectar con el servidor. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Iniciar Sesión', path: '/login' }]}
        title="Iniciar Sesión"
        subtitle="Accede a tu cuenta NEW LIFE"
      />

      <div className="container-fluid py-5">
        <div className="container">

          {/* Portal selector */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8 col-md-10">
              <p className="portal-selector-label text-center text-muted mb-3">
                <i className="fas fa-question-circle me-2"></i>¿Cómo deseas ingresar?
              </p>
              <div className="portal-selector-cards">
                <div className="portal-card portal-card--active">
                  <div className="portal-card__icon"><i className="fas fa-user"></i></div>
                  <div className="portal-card__title">Cliente</div>
                  <div className="portal-card__desc">Compras y pedidos</div>
                  <span className="portal-card__badge">Aquí</span>
                </div>
                <div className="portal-card portal-card--domiciliario" onClick={() => navigate('/login-domiciliario')} style={{ cursor: 'pointer' }}>
                  <div className="portal-card__icon"><i className="fas fa-motorcycle"></i></div>
                  <div className="portal-card__title">Domiciliario</div>
                  <div className="portal-card__desc">Gestión de entregas</div>
                </div>
                <div className="portal-card portal-card--responsable" onClick={() => navigate('/login-responsable')} style={{ cursor: 'pointer' }}>
                  <div className="portal-card__icon"><i className="fas fa-user-tie"></i></div>
                  <div className="portal-card__title">Responsable</div>
                  <div className="portal-card__desc">Gestión de despachos</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="login-card">
                <div className="login-header text-center mb-4">
                  <img src="/img/logoNewLife.png" alt="NEW LIFE Logo" className="login-logo mb-3" />
                  <h2 className="login-title">Bienvenido de Nuevo</h2>
                  <p className="login-subtitle text-muted">Administradores · Responsables · Clientes</p>
                </div>

                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {successMessage}
                  </div>
                )}

                {errors.general && (
                  <div ref={errorRef} className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group mb-3">
                    <label htmlFor="correo" className="form-label">
                      <i className="fas fa-envelope me-2"></i>Correo Electrónico
                    </label>
                    <Input
                      type="email"
                      id="correo"
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

                  <div className="form-group mb-4">
                    <label htmlFor="contrasena" className="form-label">
                      <i className="fas fa-lock me-2"></i>Contraseña
                    </label>
                    <div className="password-input-wrapper">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        id="contrasena"
                        name="contrasena"
                        placeholder="••••••••"
                        value={formData.contrasena}
                        onChange={handleChange}
                        className={errors.contrasena ? 'is-invalid' : ''}
                        icon="fas fa-lock"
                        iconPosition="left"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.contrasena && <div className="invalid-feedback d-block">{errors.contrasena}</div>}
                  </div>

                  <Button
                    type="submit"
                    variant="success"
                    className="login-button w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Verificando...</>
                      : <><i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión</>
                    }
                  </Button>

                  <div className="text-center mb-3">
                    <Link to="/forgot-password" className="register-link" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-key me-1"></i>¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      ¿No tienes cuenta?{' '}
                      <Link to="/register" className="register-link">Regístrate aquí</Link>
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

export default Login
