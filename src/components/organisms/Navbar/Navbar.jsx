import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SearchBar } from '../../molecules'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
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
  const [isClienteDropdownOpen, setIsClienteDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, cliente, logout, isAdmin, isCliente } = useAuth()
  const { itemCount, items, subtotal } = useCart()

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

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cart-dropdown-container')) setIsCartDropdownOpen(false)
      if (!event.target.closest('.navbar-cliente-section')) setIsClienteDropdownOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
            <span className="hamburger-lines">
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
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </button>
                
                <div className={`dropdown-menu cart-dropdown ${isCartDropdownOpen ? 'show' : ''}`}>
                  <div className="dropdown-header">
                    <h6 className="mb-0">Tu Carrito</h6>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-body">
                    {items.length === 0 ? (
                      <p className="text-muted text-center py-3 mb-0">
                        <i className="fas fa-shopping-cart fa-2x mb-2 d-block"></i>
                        Tu carrito está vacío
                      </p>
                    ) : (
                      <div>
                        {items.slice(0, 3).map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                            <img
                              src={item.image || '/img/Imagen1.png'}
                              alt={item.name}
                              onError={e => { e.target.src = '/img/Imagen1.png' }}
                              style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #e2e8f0' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                              <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{item.quantity} × ${Number(item.price).toLocaleString('es-CO')}</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                              ${(Number(item.price) * item.quantity).toLocaleString('es-CO')}
                            </div>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', padding: '0.35rem 0', margin: 0 }}>
                            +{items.length - 3} producto{items.length - 3 !== 1 ? 's' : ''} más
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderTop: '1px solid #e2e8f0', marginTop: '0.1rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Subtotal:</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>${subtotal.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    )}
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
              
              {/* Sección usuario: Admin */}
              {isAdmin() && (
                <div className="navbar-admin-section d-flex align-items-center gap-2">
                  <Link
                    to="/admin"
                    className="navbar-action-btn admin-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                    title="Panel de Administración"
                  >
                    <i className="fas fa-user-shield"></i>
                    <span className="d-none d-lg-inline ms-2">{admin?.nombres?.split(' ')[0] || 'Admin'}</span>
                  </Link>
                  <button
                    className="navbar-action-btn logout-btn"
                    onClick={() => { logout(); navigate('/') }}
                    title="Cerrar Sesión"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span className="d-none d-lg-inline ms-2">Salir</span>
                  </button>
                </div>
              )}

              {/* Sección usuario: Cliente logueado con dropdown */}
              {isCliente() && (
                <div className="navbar-cliente-section position-relative">
                  <button
                    className="navbar-action-btn cliente-trigger"
                    onClick={() => setIsClienteDropdownOpen(!isClienteDropdownOpen)}
                    title={cliente?.correo}
                  >
                    <i className="fas fa-user-circle"></i>
                    <span className="d-none d-lg-inline ms-2">{cliente?.nombres?.split(' ')[0] || 'Cliente'}</span>
                    <i className="fas fa-chevron-down ms-1" style={{ fontSize: '0.7rem' }}></i>
                  </button>

                  {isClienteDropdownOpen && (
                    <div className="cliente-dropdown">
                      <div className="cliente-dropdown-header">
                        <div className="cliente-dropdown-avatar">
                          <i className="fas fa-user-circle"></i>
                        </div>
                        <div>
                          <div className="cliente-dropdown-name">{cliente?.nombres}</div>
                          <div className="cliente-dropdown-email">{cliente?.correo}</div>
                        </div>
                      </div>
                      <div className="cliente-dropdown-divider"></div>
                      <Link to="/mi-perfil" className="cliente-dropdown-item" onClick={() => setIsClienteDropdownOpen(false)}>
                        <i className="fas fa-user"></i><span>Mi Perfil</span>
                      </Link>
                      <Link to="/mi-perfil" className="cliente-dropdown-item" onClick={() => { setIsClienteDropdownOpen(false) }}>
                        <i className="fas fa-edit"></i><span>Editar Perfil</span>
                      </Link>
                      <Link to="/mis-compras" className="cliente-dropdown-item" onClick={() => setIsClienteDropdownOpen(false)}>
                        <i className="fas fa-shopping-bag"></i><span>Mis Compras</span>
                      </Link>
                      <Link to="/cart" className="cliente-dropdown-item" onClick={() => setIsClienteDropdownOpen(false)}>
                        <i className="fas fa-shopping-cart"></i><span>Mi Carrito</span>
                      </Link>
                      <Link to="/shop" className="cliente-dropdown-item" onClick={() => setIsClienteDropdownOpen(false)}>
                        <i className="fas fa-store"></i><span>Ver Tienda</span>
                      </Link>
                      <Link to="/contact" className="cliente-dropdown-item" onClick={() => setIsClienteDropdownOpen(false)}>
                        <i className="fas fa-headset"></i><span>Soporte</span>
                      </Link>
                      <div className="cliente-dropdown-divider"></div>
                      <button
                        className="cliente-dropdown-item cliente-dropdown-logout"
                        onClick={() => { logout(); navigate('/login'); setIsClienteDropdownOpen(false) }}
                      >
                        <i className="fas fa-sign-out-alt"></i><span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sin sesión */}
              {!isAdmin() && !isCliente() && (
                <Link
                  to="/login"
                  className="navbar-action-btn login-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span className="d-none d-lg-inline ms-2">Iniciar Sesión</span>
                </Link>
              )}
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
