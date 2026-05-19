import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/organisms'
import './Testimonial.css'

/**
 * Testimonial - Página de Testimonios
 */
const Testimonial = () => {
  const [filter, setFilter] = useState('all')

  const testimonials = [
    { id: 1, name: 'María González', role: 'Dueña de Restaurante', company: 'Restaurante El Buen Sabor', image: '/img/testimonial-1.jpg', rating: 5, category: 'restaurante', comment: 'Excelente calidad en los productos. Nos ayudó mucho a reducir nuestro impacto ambiental. Nuestros clientes están muy contentos con la iniciativa ecológica.', date: 'Hace 2 semanas' },
    { id: 2, name: 'Carlos Ramírez', role: 'Organizador de Eventos', company: 'Eventos Sostenibles SAS', image: '/img/testimonial-2.jpg', rating: 5, category: 'eventos', comment: 'Productos de alta calidad y servicio excepcional. La mejor alternativa al icopor. Recomendado 100% para empresas comprometidas con el medio ambiente.', date: 'Hace 1 mes' },
    { id: 3, name: 'Ana Martínez', role: 'Gerente de Restaurante', company: 'Cafetería Verde', image: '/img/testimonial-3.jpg', rating: 5, category: 'restaurante', comment: 'La mejor alternativa al icopor. Nuestros clientes están muy contentos con la calidad y el compromiso ambiental. Los productos se ven elegantes y profesionales.', date: 'Hace 3 semanas' },
    { id: 4, name: 'David Morales', role: 'Director General', company: 'Catering Premium', image: '/img/testimonial-3.jpg', rating: 5, category: 'catering', comment: 'Hemos cambiado completamente nuestro servicio de catering a productos biodegradables de NEW LIFE. La respuesta de nuestros clientes ha sido increíble.', date: 'Hace 3 semanas' },
    { id: 5, name: 'Laura Sánchez', role: 'Empresaria', company: 'Fiestas Eco', image: '/img/testimonial-2.jpg', rating: 4, category: 'eventos', comment: 'Me encantó la idea de poder plantar los platos después de usarlos. Mis clientes están fascinados viendo crecer las plantas. Altamente recomendado.', date: 'Hace 2 meses' },
    { id: 6, name: 'Miguel Torres', role: 'Gerente de Operaciones', company: 'Food Truck Ecológico', image: '/img/testimonial-1.jpg', rating: 5, category: 'foodtruck', comment: 'Para nuestro food truck, necesitábamos productos que fueran prácticos, resistentes y ecológicos. NEW LIFE superó todas nuestras expectativas.', date: 'Hace 1 mes' },
  ]

  const stats = [
    { number: '500+', label: 'Clientes Satisfechos', icon: 'fas fa-smile' },
    { number: '4.9', label: 'Calificación Promedio', icon: 'fas fa-star' },
    { number: '98%', label: 'Clientes que Recomiendan', icon: 'fas fa-thumbs-up' },
    { number: '2000+', label: 'Productos Vendidos', icon: 'fas fa-box' }
  ]

  const filteredTestimonials = filter === 'all' ? testimonials : testimonials.filter(t => t.category === filter)

  const renderStars = (rating) => Array.from({ length: 5 }, (_, index) => (
    <i key={index} className={`fas fa-star ${index < rating ? 'text-warning' : 'text-muted'}`}></i>
  ))

  return (
    <div className="testimonial-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Testimonios', path: '/testimonials' }]}
        title="Testimonios"
        subtitle="Descubre lo que dicen nuestros clientes sobre nuestros productos biodegradables"
      />

      <section className="testimonials-stats py-5">
        <div className="container">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="stat-card">
                  <div className="stat-icon"><i className={stat.icon}></i></div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-filters py-4 bg-light">
        <div className="container">
          <div className="filters-wrapper">
            <span className="filter-label">Filtrar por:</span>
            <div className="filter-buttons">
              {['all', 'restaurante', 'eventos', 'catering', 'foodtruck'].map(f => (
                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-grid py-5">
        <div className="container">
          <div className="row g-4">
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="col-lg-4 col-md-6">
                <div className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      <img src={testimonial.image} alt={testimonial.name} onError={(e) => { e.target.src = '/img/testimonial-1.jpg' }} />
                    </div>
                    <div className="testimonial-info">
                      <h5 className="testimonial-name">{testimonial.name}</h5>
                      <p className="testimonial-role">{testimonial.role}</p>
                      <p className="testimonial-company">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="testimonial-rating">{renderStars(testimonial.rating)}</div>
                  <div className="testimonial-body"><p className="testimonial-comment">"{testimonial.comment}"</p></div>
                  <div className="testimonial-footer">
                    <span className="testimonial-date"><i className="fas fa-clock me-1"></i>{testimonial.date}</span>
                    <span className="testimonial-category"><i className="fas fa-tag me-1"></i>{testimonial.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredTestimonials.length === 0 && (
            <div className="no-results text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <p className="text-muted">No se encontraron testimonios para esta categoría</p>
            </div>
          )}
        </div>
      </section>

      <section className="testimonials-cta py-5 bg-light">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="cta-title mb-3">¿Listo para ser nuestro próximo caso de éxito?</h2>
            <p className="cta-text mb-4">Únete a cientos de empresas que ya están haciendo la diferencia con nuestros productos biodegradables</p>
            <div className="cta-buttons">
              <Link to="/shop" className="btn btn-success btn-lg me-3"><i className="fas fa-shopping-bag me-2"></i>Ver Productos</Link>
              <Link to="/contact" className="btn btn-outline-success btn-lg"><i className="fas fa-envelope me-2"></i>Contáctanos</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonial
