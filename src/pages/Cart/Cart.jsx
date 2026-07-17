import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/organisms'
import { Button } from '../../components/atoms'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const { cliente } = useAuth()
  const { items, removeItem, updateQuantity } = useCart()

  const getItemPrice = (item) =>
    item.discount && item.originalPrice
      ? item.originalPrice * (1 - item.discount / 100)
      : item.price

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  const discountTotal = items.reduce((sum, item) => {
    if (item.discount && item.originalPrice) return sum + (item.originalPrice * item.discount / 100) * item.quantity
    return sum
  }, 0)
  const shipping = subtotal >= 100000 ? 0 : 15000
  const total = subtotal + shipping

  const incrementQty = (item) => updateQuantity(item.id, Math.min(item.quantity + 1, item.stock || 999))
  const decrementQty = (item) => updateQuantity(item.id, item.quantity - 1)

  return (
    <div className="cart-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Carrito', path: '/cart' }]}
        title="Carrito de Compras"
        subtitle="Revisa tus productos antes de finalizar tu compra"
      />

      <div className="container-fluid py-5">
        <div className="container">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon"><i className="fas fa-shopping-cart"></i></div>
              <h2 className="cart-empty-title">Tu carrito está vacío</h2>
              <p className="cart-empty-text">Parece que aún no has agregado productos. ¡Explora nuestro catálogo!</p>
              <Link to="/shop"><Button variant="success" size="lg"><i className="fas fa-shopping-bag me-2"></i>Explorar Productos</Button></Link>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8 mb-4">
                <div className="cart-header d-flex justify-content-between align-items-center mb-4">
                  <h3 className="cart-section-title mb-0"><i className="fas fa-shopping-cart me-2"></i>Productos ({items.length})</h3>
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/shop')}>
                    <i className="fas fa-arrow-left me-2"></i>Seguir Comprando
                  </Button>
                </div>

                <div className="cart-items">
                  {items.map(item => {
                    const finalPrice = getItemPrice(item)
                    return (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          <img src={item.image || '/img/Imagen1.png'} alt={item.name} onError={e => { e.target.src = '/img/Imagen1.png' }} />
                        </div>
                        <div className="cart-item-info">
                          <span className="cart-item-name">{item.name}</span>
                          {item.description && <p className="cart-item-description">{item.description}</p>}
                          <div className="cart-item-price">
                            {item.discount > 0 && item.originalPrice && (
                              <span className="cart-item-price-original">${item.originalPrice.toLocaleString('es-CO')}</span>
                            )}
                            <span className="cart-item-price-current">${finalPrice.toLocaleString('es-CO')}</span>
                            {item.discount > 0 && <span className="cart-item-discount">-{item.discount}%</span>}
                          </div>
                          {item.stock <= 5 && (
                            <small style={{ color: '#f59e0b', fontSize: '0.78rem' }}>
                              <i className="fas fa-exclamation-triangle me-1"></i>Solo {item.stock} disponibles
                            </small>
                          )}
                        </div>
                        <div className="cart-item-quantity">
                          <label className="quantity-label">Cantidad</label>
                          <div className="quantity-controls">
                            <button type="button" className="quantity-btn" onClick={() => decrementQty(item)}>
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="quantity-input"
                              value={item.quantity}
                              min="1"
                              max={item.stock || 999}
                              onChange={e => updateQuantity(item.id, Math.max(1, Math.min(parseInt(e.target.value) || 1, item.stock || 999)))}
                            />
                            <button type="button" className="quantity-btn" onClick={() => incrementQty(item)}>
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <div className="cart-item-subtotal">
                            Subtotal: <strong>${(finalPrice * item.quantity).toLocaleString('es-CO')}</strong>
                          </div>
                        </div>
                        <div className="cart-item-actions">
                          <button type="button" className="remove-btn" onClick={() => removeItem(item.id)}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="cart-summary">
                  <h3 className="cart-summary-title"><i className="fas fa-receipt me-2"></i>Resumen del Pedido</h3>
                  <div className="cart-summary-content">
                    <div className="summary-row"><span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${subtotal.toLocaleString('es-CO')}</span></div>
                    {discountTotal > 0 && (
                      <div className="summary-row summary-discount">
                        <span><i className="fas fa-tag me-2"></i>Descuento</span>
                        <span>-${discountTotal.toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span><i className="fas fa-truck me-2"></i>Envío</span>
                      <span>{shipping === 0 ? <span className="text-success">Gratis</span> : `$${shipping.toLocaleString('es-CO')}`}</span>
                    </div>
                    {subtotal < 100000 && (
                      <div className="summary-shipping-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Compra ${(100000 - subtotal).toLocaleString('es-CO')} más para envío gratis
                      </div>
                    )}
                    <div className="summary-row summary-total">
                      <span>Total</span>
                      <span className="summary-total-amount">${total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  <div className="cart-summary-actions">
                    <Button variant="success" size="lg" className="w-100 mb-3" onClick={() => cliente ? navigate('/checkout') : navigate('/login', { state: { returnTo: '/checkout' } })}>
                      <i className="fas fa-credit-card me-2"></i>Proceder al Pago
                    </Button>
                    <Link to="/shop" className="continue-shopping-link">
                      <i className="fas fa-arrow-left me-2"></i>Seguir Comprando
                    </Link>
                  </div>
                  <div className="cart-summary-info">
                    <div className="info-item"><i className="fas fa-shield-alt"></i><span>Compra 100% segura</span></div>
                    <div className="info-item"><i className="fas fa-undo"></i><span>Devoluciones fáciles</span></div>
                    <div className="info-item"><i className="fas fa-truck-fast"></i><span>Envío rápido</span></div>
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
