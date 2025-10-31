import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/organisms'
import { Button } from '../components/atoms'
import './Cart.css'

/**
 * Cart - Página del Carrito de Compras
 * Permite ver, editar y gestionar los productos en el carrito
 */
const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])

  // Cargar carrito del localStorage al montar el componente
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error al cargar el carrito:', error)
        setCartItems([])
      }
    } else {
      // Si no hay carrito guardado, mostrar algunos productos de ejemplo
      // En producción esto vendría del estado global o API
      setCartItems([])
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } else {
      localStorage.removeItem('cart')
    }
  }, [cartItems])

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.discount && item.originalPrice
      ? item.originalPrice - (item.originalPrice * item.discount / 100)
      : item.price
    return sum + (itemPrice * item.quantity)
  }, 0)

  const discount = cartItems.reduce((sum, item) => {
    if (item.discount && item.originalPrice) {
      const discountAmount = item.originalPrice * item.discount / 100
      return sum + (discountAmount * item.quantity)
    }
    return sum
  }, 0)

  const shipping = subtotal > 100000 ? 0 : 15000 // Envío gratis sobre $100.000
  const total = subtotal - discount + shipping

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }
    setCartItems(items =>
      items.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(items => items.filter(item => item.id !== productId))
  }

  // Incrementar cantidad
  const incrementQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    if (item) {
      updateQuantity(productId, item.quantity + 1)
    }
  }

  // Decrementar cantidad
  const decrementQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1)
    }
  }

  // Procesar checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return
    }
    navigate('/checkout')
  }

  // Continuar comprando
  const handleContinueShopping = () => {
    navigate('/shop')
  }

  return (
    <div className="cart-page">
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Carrito', path: '/cart' }
        ]}
        title="Carrito de Compras"
        subtitle="Revisa tus productos antes de finalizar tu compra"
      />

      <div className="container-fluid py-5">
        <div className="container">
          {cartItems.length === 0 ? (
            /* Carrito Vacío */
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <h2 className="cart-empty-title">Tu carrito está vacío</h2>
              <p className="cart-empty-text">
                Parece que aún no has agregado productos a tu carrito.
                ¡Explora nuestro catálogo y encuentra productos biodegradables increíbles!
              </p>
              <Link to="/shop">
                <Button variant="success" size="lg">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            /* Carrito con Productos */
            <div className="row">
              {/* Lista de Productos */}
              <div className="col-lg-8 mb-4">
                <div className="cart-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="cart-section-title mb-0">
                    <i className="fas fa-shopping-cart me-2"></i>
                    Productos ({cartItems.length})
                  </h3>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleContinueShopping}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Seguir Comprando
                  </Button>
                </div>

                <div className="cart-items">
                  {cartItems.map((item) => {
                    const finalPrice = item.discount && item.originalPrice
                      ? item.originalPrice - (item.originalPrice * item.discount / 100)
                      : item.price

                    return (
                      <div key={item.id} className="cart-item">
                        {/* Imagen del Producto */}
                        <div className="cart-item-image">
                          <Link to={`/shop/${item.id}`}>
                            <img
                              src={item.image || '/img/Imagen1.png'}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = '/img/Imagen1.png'
                              }}
                            />
                          </Link>
                        </div>

                        {/* Información del Producto */}
                        <div className="cart-item-info">
                          <Link to={`/shop/${item.id}`} className="cart-item-name">
                            {item.name}
                          </Link>
                          {item.description && (
                            <p className="cart-item-description">{item.description}</p>
                          )}

                          {/* Precio */}
                          <div className="cart-item-price">
                            {item.discount && item.originalPrice && (
                              <span className="cart-item-price-original">
                                ${item.originalPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="cart-item-price-current">
                              ${finalPrice.toLocaleString()}
                            </span>
                            {item.discount && (
                              <span className="cart-item-discount">
                                -{item.discount}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controles de Cantidad */}
                        <div className="cart-item-quantity">
                          <label className="quantity-label">Cantidad</label>
                          <div className="quantity-controls">
                            <button
                              type="button"
                              className="quantity-btn"
                              onClick={() => decrementQuantity(item.id)}
                              aria-label="Disminuir cantidad"
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="quantity-input"
                              value={item.quantity}
                              min="1"
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                updateQuantity(item.id, value)
                              }}
                            />
                            <button
                              type="button"
                              className="quantity-btn"
                              onClick={() => incrementQuantity(item.id)}
                              aria-label="Aumentar cantidad"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <div className="cart-item-subtotal">
                            Subtotal: <strong>${(finalPrice * item.quantity).toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* Botón Eliminar */}
                        <div className="cart-item-actions">
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Eliminar producto"
                            title="Eliminar del carrito"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Resumen del Pedido */}
              <div className="col-lg-4">
                <div className="cart-summary">
                  <h3 className="cart-summary-title">
                    <i className="fas fa-receipt me-2"></i>
                    Resumen del Pedido
                  </h3>

                  <div className="cart-summary-content">
                    {/* Subtotal */}
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>

                    {/* Descuento */}
                    {discount > 0 && (
                      <div className="summary-row summary-discount">
                        <span>
                          <i className="fas fa-tag me-2"></i>
                          Descuento
                        </span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Envío */}
                    <div className="summary-row">
                      <span>
                        <i className="fas fa-truck me-2"></i>
                        Envío
                      </span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Gratis
                          </span>
                        ) : (
                          `$${shipping.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    {/* Información de Envío Gratis */}
                    {subtotal < 100000 && (
                      <div className="summary-shipping-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Compra ${(100000 - subtotal).toLocaleString()} más para envío gratis
                      </div>
                    )}

                    {/* Total */}
                    <div className="summary-row summary-total">
                      <span>Total</span>
                      <span className="summary-total-amount">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="cart-summary-actions">
                    <Button
                      variant="success"
                      size="lg"
                      className="w-100 mb-3"
                      onClick={handleCheckout}
                    >
                      <i className="fas fa-credit-card me-2"></i>
                      Proceder al Checkout
                    </Button>

                    <Link to="/shop" className="continue-shopping-link">
                      <i className="fas fa-arrow-left me-2"></i>
                      Seguir Comprando
                    </Link>
                  </div>

                  {/* Información Adicional */}
                  <div className="cart-summary-info">
                    <div className="info-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>Compra 100% segura</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-undo"></i>
                      <span>Devoluciones fáciles</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-truck-fast"></i>
                      <span>Envío rápido</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart
