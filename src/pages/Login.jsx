import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../components/atoms'
import { PageHeader } from '../components/organisms'
import './Login.css'

/**
 * Login - Página de Inicio de Sesión
 * Módulo de autenticación para usuarios
 */
const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      // Aquí irá la lógica de autenticación con tu API
      console.log('Intentando iniciar sesión:', formData)
      
      // Simulación de autenticación
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Después de autenticar exitosamente:
      // - Guardar token en localStorage
      // - Redirigir al usuario
      // localStorage.setItem('token', 'token_aqui')
      
      // Por ahora solo redirigimos a home
      navigate('/')
      
      // Aquí puedes agregar notificaciones de éxito
      console.log('Login exitoso')
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setErrors({ 
        general: 'Error al iniciar sesión. Por favor, verifica tus credenciales.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Page Header */}
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Iniciar Sesión', path: '/login' }
        ]}
        title="Iniciar Sesión"
        subtitle="Accede a tu cuenta para continuar"
      />

      {/* Login Section */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="login-card">
                {/* Logo */}
                <div className="login-header text-center mb-4">
                  <img 
                    src="/img/logoNewLife.png" 
                    alt="NEW LIFE Logo" 
                    className="login-logo mb-3"
                  />
                  <h2 className="login-title">Bienvenido de Nuevo</h2>
                  <p className="login-subtitle text-muted">
                    Inicia sesión para acceder a tu cuenta
                  </p>
                </div>

                {/* Error General */}
                {errors.general && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.general}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                  {/* Email Field */}
                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'is-invalid' : ''}
                      icon="fas fa-envelope"
                      iconPosition="left"
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="form-group mb-4">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Contraseña
                    </label>
                    <div className="password-input-wrapper">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? 'is-invalid' : ''}
                        icon="fas fa-lock"
                        iconPosition="left"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* Remember & Forgot */}
                  <div className="login-options d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Recordarme
                      </label>
                    </div>
                    <Link to="/forgot-password" className="forgot-password-link">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="success"
                    className="login-button w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="divider">
                    <span>o</span>
                  </div>

                  {/* Social Login */}
                  <div className="social-login mb-4">
                    <button type="button" className="btn btn-outline-secondary w-100 mb-2 social-btn">
                      <i className="fab fa-google me-2"></i>
                      Continuar con Google
                    </button>
                    <button type="button" className="btn btn-outline-primary w-100 social-btn">
                      <i className="fab fa-facebook-f me-2"></i>
                      Continuar con Facebook
                    </button>
                  </div>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      ¿No tienes una cuenta?{' '}
                      <Link to="/register" className="register-link">
                        Regístrate aquí
                      </Link>
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

