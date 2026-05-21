import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FeaturesSection, StatsSection, PageHeader } from '../../components/organisms'
import { ProductCard, SearchBar } from '../../components/molecules'
import { Button } from '../../components/atoms'
import productoService from '../../services/productoService'
import { useCart } from '../../context/CartContext'
import './Home.css'

const CARDS_PER_PAGE = 3

const Home = () => {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [carouselPage, setCarouselPage] = useState(0)
  const [slideDir, setSlideDir] = useState('right')
  const autoRef = useRef(null)

  useEffect(() => {
    productoService.getAll()
      .then(data => {
        const list = (Array.isArray(data) ? data : [])
          .filter(p => p.estado?.toLowerCase() === 'activo')
          .map(p => ({
            id: p.codigo_prod,
            name: p.nombres,
            description: p.descripcion || '',
            price: Number(p.precio),
            image: p.img_url || '/img/Imagen1.png',
            stock: p.stock_real,
            badge: p.stock_real === 0 ? 'Agotado' : (p.stock_real > 0 && p.stock_min > 0 && p.stock_real <= p.stock_min) ? 'Stock bajo' : undefined,
          }))
        setProducts(list)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [])

  const totalPages = Math.ceil(products.length / CARDS_PER_PAGE)

  const goPage = (newPage, dir) => {
    setSlideDir(dir || (newPage >= carouselPage ? 'right' : 'left'))
    setCarouselPage(newPage)
  }

  useEffect(() => {
    if (totalPages <= 1) return
    autoRef.current = setInterval(() => {
      setSlideDir('right')
      setCarouselPage(p => (p + 1) % totalPages)
    }, 5000)
    return () => clearInterval(autoRef.current)
  }, [totalPages])

  const handleSearch = (term) => navigate(`/shop?search=${encodeURIComponent(term)}`)
  const handleAddToCart = (product) => addItem(product, 1)

  const visibleProducts = products.slice(carouselPage * CARDS_PER_PAGE, (carouselPage + 1) * CARDS_PER_PAGE)

  return (
    <div className="home-page">
      {/* Page Header */}
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' }
        ]}
        title="Productos Biodegradables"
        subtitle="Alternativa eco-friendly al icopor. Productos 100% biodegradables"
      />

      {/* Hero Section - Primera Sección */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-main-title text-success mb-4">
                  Productos Biodegradables
                </h1>
                <p className="hero-description lead mb-4">
                  Alternativa eco-friendly al icopor. Productos 100% biodegradables
                  fabricados con fibras naturales de piña y maíz.
                </p>
                <p className="hero-sub-description mb-4">
                  Nuestros productos se descomponen naturalmente en 90 días, convirtiéndose
                  en nutrientes para el suelo. Fabricados con materiales 100% naturales y
                  compostables, contribuimos activamente a la reducción de residuos plásticos
                  y la conservación de nuestros ecosistemas.
                </p>
                <p className="hero-sub-description mb-4">
                  Ideal para restaurantes, eventos, cafeterías y cualquier negocio comprometido
                  con la sostenibilidad ambiental.
                </p>

                {/* Search Bar */}
                <div className="hero-search-section mt-4">
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Buscar productos biodegradables..."
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image-wrapper">
                <img
                  src="/img/baner-1.jfif"
                  alt="Productos Biodegradables NEW LIFE"
                  className="hero-image img-fluid rounded shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Main Products Section - Nuestros Productos */}
      <section className="main-products-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-main-title text-success mb-3">
              Productos Biodegradables
            </h2>
            <p className="section-subtitle lead text-muted mb-4">
              Productos biodegradables para un futuro sostenible
            </p>
            <p className="products-intro mb-5">
              Descubre nuestra amplia gama de productos biodegradables diseñados para
              reemplazar completamente el icopor. Cada producto está fabricado con materias
              primas naturales como bagazo de caña de azúcar, cáscara de piña y maíz,
              garantizando una descomposición natural en 90 días.
            </p>
          </div>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="mt-3 text-muted fw-semibold">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-box-open fa-3x mb-3 d-block" style={{ color: '#cbd5e1' }}></i>
              No hay productos disponibles en este momento.
            </div>
          ) : (
            <div className="home-carousel-container">
              <div
                key={carouselPage}
                className={`row g-4 mb-4 carousel-page-${slideDir}`}
              >
                {visibleProducts.map(p => (
                  <div key={p.id} className="col-lg-4 col-md-6">
                    <ProductCard
                      id={p.id}
                      image={p.image}
                      name={p.name}
                      description={p.description}
                      price={p.price}
                      badge={p.badge}
                      onAddToCart={() => handleAddToCart(p)}
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="carousel-nav">
                  <button
                    className="carousel-nav-btn"
                    onClick={() => goPage(Math.max(0, carouselPage - 1), 'left')}
                    disabled={carouselPage === 0}
                    aria-label="Anterior"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <div className="carousel-dots">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`carousel-dot ${i === carouselPage ? 'active' : ''}`}
                        onClick={() => goPage(i)}
                        aria-label={`Página ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    className="carousel-nav-btn"
                    onClick={() => goPage(Math.min(totalPages - 1, carouselPage + 1), 'right')}
                    disabled={carouselPage === totalPages - 1}
                    aria-label="Siguiente"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-5">
            <Link to="/shop">
              <Button variant="success" size="lg">
                <i className="fas fa-shopping-bag me-2"></i>
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-home-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-content">
                <span className="section-badge">Sobre Nosotros</span>
                <h2 className="section-title">
                  <span className="text-success">Productos Biodegradables</span>
                  <br />
                  <span className="text-dark">NEW LIFE</span>
                </h2>
                <p className="lead text-muted mb-4">
                  Alternativa eco-friendly al icopor. Productos fabricados con fibras naturales
                  que se convierten en semillas germinables después de su uso. Contribuimos a
                  la conservación del medio ambiente con soluciones sostenibles.
                </p>
                <p className="text-muted mb-4">
                  Nuestros productos biodegradables están diseñados para descomponerse naturalmente
                  en el medio ambiente, contribuyendo significativamente a la reducción de residuos
                  plásticos. Cada producto que fabricamos está pensado para minimizar el impacto
                  ambiental y maximizar la sostenibilidad.
                </p>
                <ul className="about-features-list">
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Fabricados con materiales 100% naturales
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Se descomponen en 90 días naturalmente
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Incluyen semillas germinables
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Contribuyen a la reducción de residuos plásticos
                  </li>
                </ul>
                <div className="mt-4">
                  <Link to="/about">
                    <Button variant="success" size="lg">
                      <i className="fas fa-info-circle me-2"></i>
                      Conocer Más
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-images">
                <div className="about-image-main">
                  <img
                    src="/img/baner-2.jfif"
                    alt="Productos Biodegradables NEW LIFE"
                    className="img-fluid rounded shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Ventajas</span>
            <h2 className="section-title-large text-success mb-3">
              ¿Por qué elegir nuestros productos?
            </h2>
            <p className="lead text-muted">
              Descubre las múltiples ventajas de nuestros productos biodegradables
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="fas fa-leaf"></i>
                </div>
                <h4 className="benefit-title">100% Biodegradable</h4>
                <p className="benefit-description">
                  Nuestros productos se descomponen completamente en 90 días,
                  transformándose en nutrientes para el suelo sin dejar residuos tóxicos.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h4 className="benefit-title">Semillas Germinables</h4>
                <p className="benefit-description">
                  Cada producto contiene semillas que puedes plantar después de su uso,
                  dando vida a nuevas plantas y árboles.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="fas fa-thermometer-half"></i>
                </div>
                <h4 className="benefit-title">Resistente al Calor</h4>
                <p className="benefit-description">
                  Nuestros productos resisten altas temperaturas sin deformarse,
                  perfectos para comidas calientes y bebidas.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="fas fa-water"></i>
                </div>
                <h4 className="benefit-title">Resistente al Agua</h4>
                <p className="benefit-description">
                  Fabricados con tecnología especial que los hace impermeables,
                  ideales para líquidos y alimentos húmedos.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="fas fa-recycle"></i>
                </div>
                <h4 className="benefit-title">Compostable</h4>
                <p className="benefit-description">
                  Pueden ser compostados en casa o en instalaciones industriales,
                  cerrando el ciclo de vida de manera sostenible.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="fas fa-award"></i>
                </div>
                <h4 className="benefit-title">Certificados de Calidad</h4>
                <p className="benefit-description">
                  Cumplimos con los más altos estándares internacionales de calidad
                  y sostenibilidad ambiental.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Proceso</span>
            <h2 className="section-title-large text-success mb-3">
              ¿Cómo Funciona?
            </h2>
            <p className="lead text-muted">
              Un proceso simple y sostenible para un futuro mejor
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <h5 className="step-title">Compra</h5>
                <p className="step-description">
                  Adquiere nuestros productos biodegradables en nuestra tienda online
                  o puntos de venta autorizados.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-icon">
                  <i className="fas fa-utensils"></i>
                </div>
                <h5 className="step-title">Usa</h5>
                <p className="step-description">
                  Utiliza nuestros productos para tus comidas y eventos,
                  disfrutando de su calidad y resistencia.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h5 className="step-title">Planta</h5>
                <p className="step-description">
                  Después de usar el producto, siémbralo en una matera o jardín
                  y observa cómo germina una nueva planta.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-icon">
                  <i className="fas fa-leaf"></i>
                </div>
                <h5 className="step-title">Vida Nueva</h5>
                <p className="step-description">
                  Disfruta de la nueva planta que crece mientras contribuyes
                  al cuidado del medio ambiente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discount Banner */}
      <section className="discount-banner py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="discount-content">
                <span className="discount-badge">Oferta Especial</span>
                <h3 className="discount-title mb-3">
                  <i className="fas fa-tag me-2"></i>
                  Descuento Especial del 20%
                </h3>
                <p className="discount-text mb-4">
                  Aprovecha nuestra oferta especial. Obtén <strong>20.000$ de descuento</strong> en
                  productos seleccionados. ¡No dejes pasar esta oportunidad única!
                </p>
                <p className="discount-note">
                  <i className="fas fa-clock me-2"></i>
                  Oferta válida por tiempo limitado
                </p>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end text-center mt-4 mt-lg-0">
              <Link to="/shop">
                <Button variant="light" size="lg" className="discount-btn">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Comprar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Preview */}
      <section className="testimonials-preview py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Testimonios</span>
            <h2 className="section-title-large text-success mb-3">
              Nuestros Testimonios
            </h2>
            <p className="lead text-muted">
              ¡Lo que dicen nuestros clientes!
            </p>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4 col-md-6">
              <div className="testimonial-preview-card">
                <div className="testimonial-stars mb-3">
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                </div>
                <p className="testimonial-text">
                  "Excelente calidad en los productos. Nos ayudó mucho a reducir nuestro impacto
                  ambiental. Nuestros clientes están muy contentos con la iniciativa ecológica."
                </p>
                <div className="testimonial-author">
                  <strong>María González</strong>
                  <span className="author-role">Restaurante El Buen Sabor</span>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="testimonial-preview-card">
                <div className="testimonial-stars mb-3">
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                </div>
                <p className="testimonial-text">
                  "Productos de alta calidad y servicio excepcional. La mejor alternativa al icopor.
                  Recomendado 100% para empresas comprometidas con el medio ambiente."
                </p>
                <div className="testimonial-author">
                  <strong>Carlos Ramírez</strong>
                  <span className="author-role">Cafetería Sostenible</span>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="testimonial-preview-card">
                <div className="testimonial-stars mb-3">
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                  <i className="fas fa-star text-warning"></i>
                </div>
                <p className="testimonial-text">
                  "Me encantó la idea de poder plantar los platos después de usarlos. Mis hijos
                  están fascinados viendo crecer las plantas. ¡Increíble concepto!"
                </p>
                <div className="testimonial-author">
                  <strong>Ana Martínez</strong>
                  <span className="author-role">Cliente Satisfecha</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <Link to="/testimonials">
              <Button variant="outline-success" size="lg">
                <i className="fas fa-comments me-2"></i>
                Ver Todos los Testimonios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-card">
            <div className="row align-items-center">
              <div className="col-lg-8 text-center text-lg-start mb-4 mb-lg-0">
                <h2 className="cta-title mb-3">
                  ¿Listo para Contribuir al Medio Ambiente?
                </h2>
                <p className="cta-text">
                  Únete a miles de empresas y personas que ya están haciendo la diferencia.
                  Comienza a usar productos biodegradables hoy mismo.
                </p>
              </div>
              <div className="col-lg-4 text-center text-lg-end">
                <div className="cta-buttons">
                  <Link to="/shop" className="me-3 mb-3 mb-lg-0 d-inline-block">
                    <Button variant="success" size="lg" className="w-100 w-lg-auto">
                      <i className="fas fa-shopping-bag me-2"></i>
                      Ver Productos
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline-light" size="lg" className="w-100 w-lg-auto">
                      <i className="fas fa-envelope me-2"></i>
                      Contáctanos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
