import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SearchBar } from '../../molecules'
import './Navbar.css'

/**
 * Navbar - Organismo
 * Barra de navegación principal con menú, búsqueda, carrito y usuario
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 55)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cart-dropdown-container')) {
        setIsCartDropdownOpen(false)
      }
    }

    if (isCartDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isCartDropdownOpen])

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleSearch = (term) => {
    console.log('Buscando:', term)
    // Aquí puedes agregar la lógica de búsqueda
    setIsSearchModalOpen(false)
    navigate(`/shop?search=${encodeURIComponent(term)}`)
  }

  const handleSearchClick = () => {
    setIsSearchModalOpen(true)
  }

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false)
  }

  const toggleCartDropdown = (e) => {
    e.preventDefault()
    setIsCartDropdownOpen(!isCartDropdownOpen)
  }

  return (
    <>
      <nav 
        className={`navbar navbar-expand-xl bg-success fixed-top ${isScrolled ? 'shadow' : ''}`}
        id="mainNavbar"
      >
        <div className="container-fluid px-4 px-lg-5">
          {/* Logo y Brand */}
          <Link 
            to="/" 
            className="navbar-brand d-flex align-items-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img 
              src="/img/logoNewLife.png" 
              alt="NEW LIFE Logo" 
              className="navbar-logo me-2" 
            />
            <h1 className="navbar-brand-text text-white mb-0">NEW LIFE</h1>
          </Link>
          
          {/* Toggle Button Mobile */}
          <button 
            className={`navbar-toggler ${isMobileMenuOpen ? 'active' : ''}`}
            type="button" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          
          {/* Navbar Collapse */}
          <div 
            className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} 
            id="navbarCollapse"
          >
            {/* Navigation Links */}
            <div className="navbar-nav mx-auto">
              <Link 
                to="/" 
                className={`nav-item nav-link ${isActive('/')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-home me-2"></i>
                Inicio
              </Link>
              <Link 
                to="/about" 
                className={`nav-item nav-link ${isActive('/about')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-info-circle me-2"></i>
                Quienes Somos
              </Link>
              <Link 
                to="/shop" 
                className={`nav-item nav-link ${isActive('/shop')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-shopping-bag me-2"></i>
                Productos
              </Link>
              <Link 
                to="/contact" 
                className={`nav-item nav-link ${isActive('/contact')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-envelope me-2"></i>
                Contacto
              </Link>
              <Link 
                to="/testimonials" 
                className={`nav-item nav-link ${isActive('/testimonials')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-star me-2"></i>
                Testimonios
              </Link>
            </div>

            {/* Right Actions */}
            <div className="navbar-actions d-flex align-items-center">
              {/* Search Button */}
              <button 
                className="navbar-action-btn search-btn" 
                onClick={handleSearchClick}
                aria-label="Buscar"
              >
                <i className="fas fa-search"></i>
                <span className="d-none d-lg-inline ms-2">Buscar</span>
              </button>
              
              {/* Cart Dropdown */}
              <div className="cart-dropdown-container position-relative">
                <button 
                  className="navbar-action-btn cart-btn"
                  onClick={toggleCartDropdown}
                  aria-label="Carrito"
                >
                  <i className="fa fa-shopping-bag"></i>
                  <span className="cart-badge">0</span>
                </button>
                
                <div className={`dropdown-menu cart-dropdown ${isCartDropdownOpen ? 'show' : ''}`}>
                  <div className="dropdown-header">
                    <h6 className="mb-0">Tu Carrito</h6>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-body">
                    <p className="text-muted text-center py-3 mb-0">
                      <i className="fas fa-shopping-cart fa-2x mb-2 d-block"></i>
                      Tu carrito está vacío
                    </p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-footer">
                    <Link 
                      to="/cart" 
                      className="btn btn-success w-100 mb-2"
                      onClick={() => setIsCartDropdownOpen(false)}
                    >
                      Ver Carrito
                    </Link>
                    <Link 
                      to="/checkout" 
                      className="btn btn-outline-success w-100"
                      onClick={() => setIsCartDropdownOpen(false)}
                    >
                      Finalizar Compra
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Login Button */}
              <Link 
                to="/login" 
                className="navbar-action-btn login-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Iniciar Sesión"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span className="d-none d-lg-inline ms-2">Iniciar Sesión</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="search-modal-overlay" onClick={handleCloseSearchModal}>
          <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h5 className="search-modal-title">
                <i className="fas fa-search me-2"></i>
                Buscar productos biodegradables
              </h5>
              <button 
                className="search-modal-close" 
                onClick={handleCloseSearchModal}
                aria-label="Cerrar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="search-modal-body">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Buscar productos..."
                className="search-modal-bar"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
