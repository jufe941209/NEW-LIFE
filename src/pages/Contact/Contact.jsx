import React, { useState } from 'react'
import { Button, Input } from '../../components/atoms'
import { PageHeader } from '../../components/organisms'
import contactoService from '../../services/contactoService'
import './Contact.css'

/**
 * Contact - Página de Contacto
 */
const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.email.trim()) newErrors.email = 'El correo electrónico es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'El correo electrónico no es válido'
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido'
    if (!formData.subject.trim()) newErrors.subject = 'El asunto es requerido'
    if (!formData.message.trim()) newErrors.message = 'El mensaje es requerido'
    else if (formData.message.trim().length < 10) newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    setSubmitStatus(null)
    try {
      await contactoService.enviar({
        nombre: formData.name,
        correo: formData.email,
        telefono: formData.phone,
        asunto: formData.subject,
        mensaje: formData.message
      })
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Contacto', path: '/contact' }]}
        title="Contáctanos"
        subtitle="Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto."
      />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="contact-info-section">
                <h2 className="section-title mb-4"><i className="fas fa-map-marker-alt text-success me-2"></i>Información de Contacto</h2>
                <div className="contact-info-card">
                  <div className="info-item">
                    <div className="info-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <div className="info-content"><h5>Dirección</h5><p>Colombia</p></div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon"><i className="fas fa-phone"></i></div>
                    <div className="info-content"><h5>Teléfono</h5><p><a href="tel:+573001234567">+57 300 123 4567</a></p></div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon"><i className="fas fa-envelope"></i></div>
                    <div className="info-content"><h5>Correo Electrónico</h5><p><a href="mailto:info@newlife.com">info@newlife.com</a></p></div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon"><i className="fas fa-clock"></i></div>
                    <div className="info-content"><h5>Horarios de Atención</h5><p>Lunes - Viernes: 8:00 AM - 6:00 PM</p><p>Sábados: 9:00 AM - 2:00 PM</p></div>
                  </div>
                </div>
                <div className="social-media-section mt-4">
                  <h5 className="mb-3"><i className="fas fa-share-alt text-success me-2"></i>Síguenos en Redes Sociales</h5>
                  <div className="social-links">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="contact-form-section">
                <h2 className="section-title mb-4"><i className="fas fa-paper-plane text-success me-2"></i>Envíanos un Mensaje</h2>
                {submitStatus === 'success' && <div className="alert alert-success"><i className="fas fa-check-circle me-2"></i>¡Mensaje enviado exitosamente!</div>}
                {submitStatus === 'error' && <div className="alert alert-danger"><i className="fas fa-exclamation-circle me-2"></i>Hubo un error al enviar el mensaje.</div>}
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Nombre Completo <span className="text-danger">*</span></label>
                        <Input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'is-invalid' : ''} placeholder="Tu nombre completo" icon="fas fa-user" iconPosition="left" />
                        {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Correo Electrónico <span className="text-danger">*</span></label>
                        <Input type="email" name="email" value={formData.email} onChange={handleChange} className={errors.email ? 'is-invalid' : ''} placeholder="tu@correo.com" icon="fas fa-envelope" iconPosition="left" />
                        {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Teléfono <span className="text-danger">*</span></label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'is-invalid' : ''} placeholder="+57 300 123 4567" icon="fas fa-phone" iconPosition="left" />
                        {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Asunto <span className="text-danger">*</span></label>
                        <Input type="text" name="subject" value={formData.subject} onChange={handleChange} className={errors.subject ? 'is-invalid' : ''} placeholder="¿Sobre qué deseas contactarnos?" icon="fas fa-tag" iconPosition="left" />
                        {errors.subject && <div className="invalid-feedback d-block">{errors.subject}</div>}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label">Mensaje <span className="text-danger">*</span></label>
                        <textarea name="message" value={formData.message} onChange={handleChange} className={`form-control ${errors.message ? 'is-invalid' : ''}`} placeholder="Escribe tu mensaje aquí..." rows="6"></textarea>
                        {errors.message && <div className="invalid-feedback d-block">{errors.message}</div>}
                      </div>
                    </div>
                    <div className="col-12">
                      <Button type="submit" variant="success" size="lg" className="submit-btn w-100" disabled={isSubmitting}>
                        {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</> : <><i className="fas fa-paper-plane me-2"></i>Enviar Mensaje</>}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-12">
              <div className="map-section">
                <h2 className="section-title mb-4"><i className="fas fa-map text-success me-2"></i>Nuestra Ubicación</h2>
                <div className="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.9857665529464!2d-74.07714548524066!3d4.609390996639991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a7d03f02b5%3A0x5c89635e3a3b2b8c!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2s!4v1234567890123!5m2!1ses!2s"
                    width="100%" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Ubicación de NEW LIFE"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
