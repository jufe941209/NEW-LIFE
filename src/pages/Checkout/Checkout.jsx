import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../../components/organisms'
import { Button, Input } from '../../components/atoms'
import './Checkout.css'

/**
 * Checkout - Página de Finalizar Compra
 */
const Checkout = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [formData, setFormData] = useState({
    shippingFirstName: '', shippingLastName: '', shippingEmail: '', shippingPhone: '',
    shippingAddress: '', shippingCity: '', shippingDepartment: '', shippingPostalCode: '', shippingNotes: '',
    billingFirstName: '', billingLastName: '', billingEmail: '', billingPhone: '',
    billingAddress: '', billingCity: '', billingDepartment: '', billingPostalCode: '',
    paymentMethod: 'credit_card', cardNumber: '', cardName: '', cardExpiry: '', cardCVV: '', cardType: 'visa'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart)
        setCartItems(items)
        if (items.length === 0) navigate('/cart')
      } catch (error) { navigate('/cart') }
    } else { navigate('/cart') }
  }, [navigate])

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.discount && item.originalPrice ? item.originalPrice - (item.originalPrice * item.discount / 100) : item.price
    return sum + (itemPrice * item.quantity)
  }, 0)
  const discount = cartItems.reduce((sum, item) => {
    if (item.discount && item.originalPrice) return sum + ((item.originalPrice * item.discount / 100) * item.quantity)
    return sum
  }, 0)
  const shipping = subtotal > 100000 ? 0 : 15000
  const total = subtotal - discount + shipping

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.shippingFirstName.trim()) newErrors.shippingFirstName = 'El nombre es requerido'
    if (!formData.shippingLastName.trim()) newErrors.shippingLastName = 'El apellido es requerido'
    if (!formData.shippingEmail) newErrors.shippingEmail = 'El email es requerido'
    if (!formData.shippingPhone) newErrors.shippingPhone = 'El teléfono es requerido'
    if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'La dirección es requerida'
    if (!formData.shippingCity.trim()) newErrors.shippingCity = 'La ciudad es requerida'
    if (!formData.shippingDepartment) newErrors.shippingDepartment = 'El departamento es requerido'
    if (!formData.shippingPostalCode) newErrors.shippingPostalCode = 'El código postal es requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      localStorage.removeItem('cart')
      navigate('/order-confirmation', { state: { orderId: `ORD-${Date.now()}` } })
    } catch (error) {
      setErrors({ general: 'Error al procesar el pedido. Por favor, intenta nuevamente.' })
    } finally { setIsLoading(false) }
  }

  if (cartItems.length === 0) return null

  return (
    <div className="checkout-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Carrito', path: '/cart' }, { label: 'Finalizar Compra', path: '/checkout' }]}
        title="Finalizar Compra"
        subtitle="Completa tu información para procesar tu pedido"
      />

      <div className="container-fluid py-5">
        <div className="container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="row">
              <div className="col-lg-8 mb-4">
                {errors.general && <div className="alert alert-danger mb-4"><i className="fas fa-exclamation-circle me-2"></i>{errors.general}</div>}

                <div className="checkout-section">
                  <h3 className="checkout-section-title"><i className="fas fa-truck me-2"></i>Información de Envío</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <Input type="text" name="shippingFirstName" value={formData.shippingFirstName} onChange={handleChange} className={errors.shippingFirstName ? 'is-invalid' : ''} placeholder="Juan" />
                      {errors.shippingFirstName && <div className="invalid-feedback d-block">{errors.shippingFirstName}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <Input type="text" name="shippingLastName" value={formData.shippingLastName} onChange={handleChange} className={errors.shippingLastName ? 'is-invalid' : ''} placeholder="Pérez" />
                      {errors.shippingLastName && <div className="invalid-feedback d-block">{errors.shippingLastName}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <Input type="email" name="shippingEmail" value={formData.shippingEmail} onChange={handleChange} className={errors.shippingEmail ? 'is-invalid' : ''} placeholder="juan@email.com" />
                      {errors.shippingEmail && <div className="invalid-feedback d-block">{errors.shippingEmail}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono *</label>
                      <Input type="tel" name="shippingPhone" value={formData.shippingPhone} onChange={handleChange} className={errors.shippingPhone ? 'is-invalid' : ''} placeholder="3001234567" />
                      {errors.shippingPhone && <div className="invalid-feedback d-block">{errors.shippingPhone}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Dirección *</label>
                      <Input type="text" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} className={errors.shippingAddress ? 'is-invalid' : ''} placeholder="Calle 123 #45-67" />
                      {errors.shippingAddress && <div className="invalid-feedback d-block">{errors.shippingAddress}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ciudad *</label>
                      <Input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleChange} className={errors.shippingCity ? 'is-invalid' : ''} placeholder="Bogotá" />
                      {errors.shippingCity && <div className="invalid-feedback d-block">{errors.shippingCity}</div>}
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Departamento *</label>
                      <select name="shippingDepartment" value={formData.shippingDepartment} onChange={handleChange} className={`form-select ${errors.shippingDepartment ? 'is-invalid' : ''}`}>
                        <option value="">Seleccionar...</option>
                        <option value="bogota">Bogotá D.C.</option>
                        <option value="antioquia">Antioquia</option>
                        <option value="valle_cauca">Valle del Cauca</option>
                        <option value="santander">Santander</option>
                        <option value="cundinamarca">Cundinamarca</option>
                      </select>
                      {errors.shippingDepartment && <div className="invalid-feedback d-block">{errors.shippingDepartment}</div>}
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Código Postal *</label>
                      <Input type="text" name="shippingPostalCode" value={formData.shippingPostalCode} onChange={handleChange} className={errors.shippingPostalCode ? 'is-invalid' : ''} placeholder="110111" />
                      {errors.shippingPostalCode && <div className="invalid-feedback d-block">{errors.shippingPostalCode}</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="checkout-summary">
                  <h3 className="checkout-summary-title"><i className="fas fa-receipt me-2"></i>Resumen del Pedido</h3>
                  <div className="checkout-products">
                    {cartItems.map((item) => {
                      const finalPrice = item.discount && item.originalPrice ? item.originalPrice - (item.originalPrice * item.discount / 100) : item.price
                      return (
                        <div key={item.id} className="checkout-product-item">
                          <div className="checkout-product-image"><img src={item.image || '/img/Imagen1.png'} alt={item.name} /></div>
                          <div className="checkout-product-info">
                            <div className="checkout-product-name">{item.name}</div>
                            <div className="checkout-product-details">Cantidad: {item.quantity} × ${finalPrice.toLocaleString()}</div>
                          </div>
                          <div className="checkout-product-price">${(finalPrice * item.quantity).toLocaleString()}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="checkout-totals">
                    <div className="checkout-total-row"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
                    {discount > 0 && <div className="checkout-total-row checkout-discount"><span>Descuento</span><span>-${discount.toLocaleString()}</span></div>}
                    <div className="checkout-total-row"><span>Envío</span><span>{shipping === 0 ? <span className="text-success">Gratis</span> : `$${shipping.toLocaleString()}`}</span></div>
                    <div className="checkout-total-row checkout-total-final"><span>Total</span><span className="checkout-total-amount">${total.toLocaleString()}</span></div>
                  </div>
                  <Button type="submit" variant="success" size="lg" className="checkout-submit-btn w-100" disabled={isLoading}>
                    {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</> : <><i className="fas fa-lock me-2"></i>Confirmar Pedido</>}
                  </Button>
                  <Link to="/cart" className="checkout-back-link"><i className="fas fa-arrow-left me-2"></i>Volver al Carrito</Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Checkout
