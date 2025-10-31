import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/organisms'
import './Testimonial.css'

/**
 * Testimonial - Página de Testimonios
 * Página completa con testimonios de clientes satisfechos
 */
const Testimonial = () => {
  const [filter, setFilter] = useState('all')

  const testimonials = [
    {
      id: 1,
      name: 'María González',
      role: 'Dueña de Restaurante',
      company: 'Restaurante El Buen Sabor',
      image: '/img/testimonial-1.jpg',
      rating: 5,
      category: 'restaurante',
      comment: 'Excelente calidad en los productos. Nos ayudó mucho a reducir nuestro impacto ambiental y son muy duraderos. Nuestros clientes están muy contentos con la iniciativa ecológica. Los platos germinables son un éxito total.',
      date: 'Hace 2 semanas'
    },
    {
      id: 2,
      name: 'Carlos Ramírez',
      role: 'Organizador de Eventos',
      company: 'Eventos Sostenibles SAS',
      image: '/img/testimonial-2.jpg',
      rating: 5,
      category: 'eventos',
      comment: 'Productos de alta calidad y servicio excepcional. La mejor alternativa al icopor. Recomendado 100% para empresas comprometidas con el medio ambiente. Hemos usado estos productos en más de 50 eventos y nunca hemos tenido problemas.',
      date: 'Hace 1 mes'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      role: 'Gerente de Restaurante',
      company: 'Cafetería Verde',
      image: '/img/testimonial-3.jpg',
      rating: 5,
      category: 'restaurante',
      comment: 'La mejor alternativa al icopor. Nuestros clientes están muy contentos con la calidad y el compromiso ambiental. Los productos se ven elegantes y profesionales. Además, la opción de germinar los platos después de usarlos es increíble.',
      date: 'Hace 3 semanas'
    },
    {
      id: 4,
      name: 'Roberto Fernández',
      role: 'Chef Ejecutivo',
      company: 'Cocina Natura',
      image: '/img/testimonial-1.jpg',
      rating: 5,
      category: 'restaurante',
      comment: 'Como chef, la presentación es clave. Estos productos no solo son ecológicos sino que también se ven excelentes. Los platos resisten el calor sin deformarse y mantienen la comida perfectamente. Nuestros clientes adoran la propuesta eco-friendly.',
      date: 'Hace 1 semana'
    },
    {
      id: 5,
      name: 'Laura Sánchez',
      role: 'Empresaria',
      company: 'Fiestas Eco',
      image: '/img/testimonial-2.jpg',
      rating: 4,
      category: 'eventos',
      comment: 'Me encantó la idea de poder plantar los platos después de usarlos. Mis clientes están fascinados viendo crecer las plantas. Los productos son resistentes y funcionales. El precio es justo considerando la calidad y el impacto ambiental positivo.',
      date: 'Hace 2 meses'
    },
    {
      id: 6,
      name: 'David Morales',
      role: 'Director General',
      company: 'Catering Premium',
      image: '/img/testimonial-3.jpg',
      rating: 5,
      category: 'catering',
      comment: 'Hemos cambiado completamente nuestro servicio de catering a productos biodegradables de NEW LIFE. La respuesta de nuestros clientes ha sido increíble. La calidad es superior a lo que esperábamos y el servicio al cliente es excepcional.',
      date: 'Hace 3 semanas'
    },
    {
      id: 7,
      name: 'Patricia Herrera',
      role: 'Dueña de Cafetería',
      company: 'Café Sostenible',
      image: '/img/testimonial-1.jpg',
      rating: 5,
      category: 'restaurante',
      comment: 'Perfecto para nuestra cafetería. Los vasos biodegradables mantienen las bebidas a la temperatura correcta y se ven muy bien. Nuestros clientes aprecian mucho nuestro compromiso con el medio ambiente. Excelente servicio y entrega rápida.',
      date: 'Hace 1 mes'
    },
    {
      id: 8,
      name: 'Andrés Castillo',
      role: 'Event Planner',
      company: 'Eventos Exclusivos',
      image: '/img/testimonial-2.jpg',
      rating: 5,
      category: 'eventos',
      comment: 'Los cubiertos de madera y los platos germinables son un éxito en todos nuestros eventos. Los invitados siempre preguntan dónde conseguirlos. La presentación es impecable y el mensaje ecológico se transmite perfectamente. Altamente recomendado.',
      date: 'Hace 2 semanas'
    },
    {
      id: 9,
      name: 'Sofía Ramírez',
      role: 'Nutricionista',
      company: 'Consultoría Nutricional',
      image: '/img/testimonial-3.jpg',
      rating: 5,
      category: 'consultoria',
      comment: 'Como nutricionista, siempre busco productos que sean saludables y sostenibles. Los productos de NEW LIFE son perfectos porque no solo son ecológicos, sino que también son seguros para alimentos. Mis clientes aman la idea de productos biodegradables.',
      date: 'Hace 3 semanas'
    },
    {
      id: 10,
      name: 'Miguel Torres',
      role: 'Gerente de Operaciones',
      company: 'Food Truck Ecológico',
      image: '/img/testimonial-1.jpg',
      rating: 5,
      category: 'foodtruck',
      comment: 'Para nuestro food truck, necesitábamos productos que fueran prácticos, resistentes y ecológicos. NEW LIFE superó todas nuestras expectativas. Los productos soportan el calor y el movimiento del vehículo perfectamente. Los clientes adoran la iniciativa.',
      date: 'Hace 1 mes'
    },
    {
      id: 11,
      name: 'Carmen Vega',
      role: 'Coordinadora de Eventos',
      company: 'Eventos Corporativos SA',
      image: '/img/testimonial-2.jpg',
      rating: 4,
      category: 'eventos',
      comment: 'Hemos usado estos productos en varios eventos corporativos y la respuesta ha sido muy positiva. Los ejecutivos aprecian el compromiso con la sostenibilidad. La calidad es excelente y el servicio es profesional. Definitivamente seguiremos trabajando con ellos.',
      date: 'Hace 2 meses'
    },
    {
      id: 12,
      name: 'Juan Pablo Restrepo',
      role: 'Chef Propietario',
      company: 'Restaurante Orgánico',
      image: '/img/testimonial-3.jpg',
      rating: 5,
      category: 'restaurante',
      comment: 'Desde que usamos productos de NEW LIFE, hemos visto un aumento en clientes que buscan opciones sostenibles. Los productos son de primera calidad y se integran perfectamente con nuestro concepto de cocina orgánica. El impacto en nuestro negocio ha sido muy positivo.',
      date: 'Hace 2 semanas'
    }
  ]

  const stats = [
    { number: '500+', label: 'Clientes Satisfechos', icon: 'fas fa-smile' },
    { number: '4.9', label: 'Calificación Promedio', icon: 'fas fa-star' },
    { number: '98%', label: 'Clientes que Recomiendan', icon: 'fas fa-thumbs-up' },
    { number: '2000+', label: 'Productos Vendidos', icon: 'fas fa-box' }
  ]

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === filter)

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index} 
        className={`fas fa-star ${index < rating ? 'text-warning' : 'text-muted'}`}
      ></i>
    ))
  }

  return (
    <div className="testimonial-page">
      {/* Page Header */}
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Testimonios', path: '/testimonials' }
        ]}
        title="Testimonios"
        subtitle="Descubre lo que dicen nuestros clientes sobre nuestros productos biodegradables"
      />

      {/* Stats Section */}
      <section className="testimonials-stats py-5">
        <div className="container">
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="testimonials-filters py-4 bg-light">
        <div className="container">
          <div className="filters-wrapper">
            <span className="filter-label">Filtrar por:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todos
              </button>
              <button
                className={`filter-btn ${filter === 'restaurante' ? 'active' : ''}`}
                onClick={() => setFilter('restaurante')}
              >
                Restaurantes
              </button>
              <button
                className={`filter-btn ${filter === 'eventos' ? 'active' : ''}`}
                onClick={() => setFilter('eventos')}
              >
                Eventos
              </button>
              <button
                className={`filter-btn ${filter === 'catering' ? 'active' : ''}`}
                onClick={() => setFilter('catering')}
              >
                Catering
              </button>
              <button
                className={`filter-btn ${filter === 'foodtruck' ? 'active' : ''}`}
                onClick={() => setFilter('foodtruck')}
              >
                Food Trucks
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="testimonials-grid py-5">
        <div className="container">
          <div className="row g-4">
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="col-lg-4 col-md-6">
                <div className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        onError={(e) => {
                          e.target.src = '/img/testimonial-1.jpg'
                        }}
                      />
                    </div>
                    <div className="testimonial-info">
                      <h5 className="testimonial-name">{testimonial.name}</h5>
                      <p className="testimonial-role">{testimonial.role}</p>
                      <p className="testimonial-company">{testimonial.company}</p>
                    </div>
                  </div>

                  <div className="testimonial-rating">
                    {renderStars(testimonial.rating)}
                  </div>

                  <div className="testimonial-body">
                    <p className="testimonial-comment">
                      "{testimonial.comment}"
                    </p>
                  </div>

                  <div className="testimonial-footer">
                    <span className="testimonial-date">
                      <i className="fas fa-clock me-1"></i>
                      {testimonial.date}
                    </span>
                    <span className="testimonial-category">
                      <i className="fas fa-tag me-1"></i>
                      {testimonial.category}
                    </span>
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

      {/* CTA Section */}
      <section className="testimonials-cta py-5 bg-light">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="cta-title mb-3">
              ¿Listo para ser nuestro próximo caso de éxito?
            </h2>
            <p className="cta-text mb-4">
              Únete a cientos de empresas que ya están haciendo la diferencia con nuestros productos biodegradables
            </p>
            <div className="cta-buttons">
              <Link to="/shop" className="btn btn-success btn-lg me-3">
                <i className="fas fa-shopping-bag me-2"></i>
                Ver Productos
              </Link>
              <Link to="/contact" className="btn btn-outline-success btn-lg">
                <i className="fas fa-envelope me-2"></i>
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonial
