import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../components/atoms'
import { PageHeader } from '../components/organisms'
import './Register.css'

/**
 * Register - Página de Registro de Usuario
 * Módulo de registro para nuevos usuarios
 */
const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (formData.phone && formData.phone.length > 0) {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'El teléfono debe tener 10 dígitos'
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos una mayúscula y una minúscula'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones'
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
      // Aquí irá la lógica de registro con tu API
      console.log('Intentando registrar usuario:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: '***'
      })
      
      // Simulación de registro
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Después de registrar exitosamente:
      // - Guardar token en localStorage
      // - Redirigir al usuario
      // localStorage.setItem('token', 'token_aqui')
      
      // Por ahora redirigimos a login
      navigate('/login', { 
        state: { 
          message: 'Registro exitoso. Por favor inicia sesión.',
          registeredEmail: formData.email 
        } 
      })
      
      // Aquí puedes agregar notificaciones de éxito
      console.log('Registro exitoso')
      
    } catch (error) {
      console.error('Error al registrar:', error)
      setErrors({ 
        general: 'Error al registrar. Por favor, intenta nuevamente.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      {/* Page Header */}
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Registro', path: '/register' }
        ]}
        title="Crear Cuenta"
        subtitle="Únete a NEW LIFE y comienza tu experiencia sostenible"
      />

      {/* Register Section */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="register-card">
                {/* Logo */}
                <div className="register-header text-center mb-4">
                  <img 
                    src="/img/logoNewLife.png" 
                    alt="NEW LIFE Logo" 
                    className="register-logo mb-3"
                  />
                  <h2 className="register-title">Bienvenido a NEW LIFE</h2>
                  <p className="register-subtitle text-muted">
                    Crea tu cuenta y disfruta de productos biodegradables
                  </p>
                </div>

                {/* Error General */}
                {errors.general && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.general}
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="register-form">
                  {/* Full Name Field */}
                  <div className="form-group mb-3">
                    <label htmlFor="fullName" className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Nombre Completo
                    </label>
                    <Input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Juan Pérez"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? 'is-invalid' : ''}
                      icon="fas fa-user"
                      iconPosition="left"
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback d-block">
                        {errors.fullName}
                      </div>
                    )}
                  </div>

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

                  {/* Phone Field */}
                  <div className="form-group mb-3">
                    <label htmlFor="phone" className="form-label">
                      <i className="fas fa-phone me-2"></i>
                      Teléfono <span className="text-muted">(Opcional)</span>
                    </label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="3001234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'is-invalid' : ''}
                      icon="fas fa-phone"
                      iconPosition="left"
                    />
                    {errors.phone && (
                      <div className="invalid-feedback d-block">
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="form-group mb-3">
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
                    <small className="form-text text-muted">
                      Mínimo 6 caracteres, debe incluir mayúsculas y minúsculas
                    </small>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="form-group mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Confirmar Contraseña
                    </label>
                    <div className="password-input-wrapper">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'is-invalid' : ''}
                        icon="fas fa-lock"
                        iconPosition="left"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="form-group mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`}
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="acceptTerms">
                        Acepto los{' '}
                        <Link to="/terms" className="terms-link">
                          términos y condiciones
                        </Link>
                        {' '}y la{' '}
                        <Link to="/privacy" className="terms-link">
                          política de privacidad
                        </Link>
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <div className="invalid-feedback d-block">
                        {errors.acceptTerms}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="success"
                    className="register-button w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Crear Cuenta
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="divider">
                    <span>o</span>
                  </div>

                  {/* Social Register */}
                  <div className="social-register mb-4">
                    <button type="button" className="btn btn-outline-secondary w-100 mb-2 social-btn">
                      <i className="fab fa-google me-2"></i>
                      Registrarse con Google
                    </button>
                    <button type="button" className="btn btn-outline-primary w-100 social-btn">
                      <i className="fab fa-facebook-f me-2"></i>
                      Registrarse con Facebook
                    </button>
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      ¿Ya tienes una cuenta?{' '}
                      <Link to="/login" className="login-link">
                        Inicia sesión aquí
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

export default Register

