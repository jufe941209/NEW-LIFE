import React from 'react'
import { Link } from 'react-router-dom'
import { NewsletterForm } from '../../molecules'
import { Button } from '../../atoms'
import './Footer.css'

/**
 * Footer - Organismo
 * Pie de página moderno con información, enlaces y newsletter
 */
const Footer = () => {
  const handleSubscribe = (email) => {
    console.log('Subscribing email:', email)
    // Aquí puedes agregar la lógica para suscribir al newsletter
  }

  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* Footer Main */}
      <footer className="footer-main">
        <div className="container">
          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <div className="row align-items-center">
              <div className="col-lg-4 text-center text-lg-start mb-4 mb-lg-0">
                <div className="newsletter-header">
                  <i className="fas fa-envelope-open-text newsletter-icon"></i>
                  <h3 className="newsletter-title">Newsletter</h3>
                  <p className="newsletter-subtitle">
                    Suscríbete y recibe ofertas exclusivas
                  </p>
                </div>
              </div>
              <div className="col-lg-8">
                <NewsletterForm onSubscribe={handleSubscribe} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider"></div>

          {/* Footer Content */}
          <div className="footer-content">
            <div className="row g-4">
              {/* Brand Column */}
              <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
                <div className="footer-brand">
                  <Link to="/" className="brand-link">
                    <img 
                      src="/img/logoNewLife.png" 
                      alt="NEW LIFE Logo" 
                      className="footer-logo mb-3"
                    />
                    <h4 className="brand-name">NEW LIFE</h4>
                  </Link>
                  <p className="brand-description">
                    Distribuidora y Comercializadora de productos biodegradables 
                    fabricados con fibras naturales. Alternativa eco-friendly al icopor 
                    que ayuda a conservar nuestro planeta.
                  </p>
                  <div className="brand-tags">
                    <span className="tag tag-eco">
                      <i className="fas fa-leaf me-1"></i>
                      100% Ecológico
                    </span>
                    <span className="tag tag-biodegradable">
                      <i className="fas fa-recycle me-1"></i>
                      Biodegradable
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links Column */}
              <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
                <div className="footer-column">
                  <h5 className="footer-column-title">
                    <i className="fas fa-link me-2"></i>
                    Enlaces Rápidos
                  </h5>
                  <ul className="footer-links">
                    <li>
                      <Link to="/">
                        <i className="fas fa-home me-2"></i>
                        Inicio
                      </Link>
                    </li>
                    <li>
                      <Link to="/about">
                        <i className="fas fa-info-circle me-2"></i>
                        Quienes Somos
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop">
                        <i className="fas fa-shopping-bag me-2"></i>
                        Productos
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact">
                        <i className="fas fa-envelope me-2"></i>
                        Contacto
                      </Link>
                    </li>
                    <li>
                      <Link to="/testimonials">
                        <i className="fas fa-star me-2"></i>
                        Testimonios
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Información Column */}
              <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                <div className="footer-column">
                  <h5 className="footer-column-title">
                    <i className="fas fa-info-circle me-2"></i>
                    Información
                  </h5>
                  <ul className="footer-links">
                    <li>
                      <Link to="/about">
                        <i className="fas fa-building me-2"></i>
                        Sobre Nosotros
                      </Link>
                    </li>
                    <li>
                      <a href="#privacy">
                        <i className="fas fa-shield-alt me-2"></i>
                        Política de Privacidad
                      </a>
                    </li>
                    <li>
                      <a href="#terms">
                        <i className="fas fa-file-contract me-2"></i>
                        Términos y Condiciones
                      </a>
                    </li>
                    <li>
                      <a href="#return">
                        <i className="fas fa-undo me-2"></i>
                        Política de Devolución
                      </a>
                    </li>
                    <li>
                      <a href="#faq">
                        <i className="fas fa-question-circle me-2"></i>
                        Preguntas Frecuentes
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Column */}
              <div className="col-lg-3 col-md-6">
                <div className="footer-column">
                  <h5 className="footer-column-title">
                    <i className="fas fa-phone me-2"></i>
                    Contacto
                  </h5>
                  <ul className="footer-contact">
                    <li>
                      <i className="fas fa-map-marker-alt contact-icon"></i>
                      <span>Colombia</span>
                    </li>
                    <li>
                      <i className="fas fa-envelope contact-icon"></i>
                      <a href="mailto:info@newlife.com">info@newlife.com</a>
                    </li>
                    <li>
                      <i className="fas fa-phone contact-icon"></i>
                      <a href="tel:+573001234567">+57 300 123 4567</a>
                    </li>
                  </ul>

                  {/* Payment Methods */}
                  <div className="payment-methods mt-4">
                    <p className="payment-title">
                      <i className="fas fa-credit-card me-2"></i>
                      Métodos de Pago
                    </p>
                    <img 
                      src="/img/payment.png" 
                      alt="Métodos de pago aceptados" 
                      className="payment-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="footer-social">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-3 mb-lg-0">
                <p className="social-text mb-0">
                  Síguenos en nuestras redes sociales
                </p>
              </div>
              <div className="col-lg-6 text-lg-end">
                <div className="social-links">
                  <a 
                    href="https://twitter.com" 
                    className="social-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a 
                    href="https://facebook.com" 
                    className="social-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a 
                    href="https://instagram.com" 
                    className="social-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a 
                    href="https://youtube.com" 
                    className="social-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    className="social-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Footer Copyright */}
      <div className="footer-copyright">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p className="copyright-text mb-0">
                <i className="fas fa-copyright me-2"></i>
                {currentYear} <Link to="/" className="copyright-link">NEW LIFE</Link>. 
                Todos los derechos reservados.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="designer-text mb-0">
                Diseñado por{' '}
                <a href="#" className="designer-link">HENRY JULIAN FUENTES</a>
                {' '}• Distribuido por{' '}
                <a href="#" className="designer-link">NEW LIFE SAS</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer
