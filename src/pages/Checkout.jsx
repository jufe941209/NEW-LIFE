import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/organisms'
import { Button, Input } from '../components/atoms'
import './Checkout.css'

/**
 * Checkout - Página de Finalizar Compra
 * Formulario completo para procesar el pedido
 */
const Checkout = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Datos de envío
    shippingFirstName: '',
    shippingLastName: '',
    shippingEmail: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingDepartment: '',
    shippingPostalCode: '',
    shippingNotes: '',
    
    // Datos de facturación
    billingFirstName: '',
    billingLastName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingDepartment: '',
    billingPostalCode: '',
    
    // Método de pago
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: '',
    cardType: 'visa'
  })

  const [errors, setErrors] = useState({})

  // Cargar carrito del localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart)
        setCartItems(items)
        if (items.length === 0) {
          navigate('/cart')
        }
      } catch (error) {
        console.error('Error al cargar el carrito:', error)
        navigate('/cart')
      }
    } else {
      navigate('/cart')
    }
  }, [navigate])

  // Copiar datos de envío a facturación si está activado
  useEffect(() => {
    if (sameAsShipping) {
      setFormData(prev => ({
        ...prev,
        billingFirstName: prev.shippingFirstName,
        billingLastName: prev.shippingLastName,
        billingEmail: prev.shippingEmail,
        billingPhone: prev.shippingPhone,
        billingAddress: prev.shippingAddress,
        billingCity: prev.shippingCity,
        billingDepartment: prev.shippingDepartment,
        billingPostalCode: prev.shippingPostalCode
      }))
    }
  }, [sameAsShipping, formData.shippingFirstName, formData.shippingLastName, 
      formData.shippingEmail, formData.shippingPhone, formData.shippingAddress,
      formData.shippingCity, formData.shippingDepartment, formData.shippingPostalCode])

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

  const shipping = subtotal > 100000 ? 0 : 15000
  const total = subtotal - discount + shipping

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulario
  const validate = () => {
    const newErrors = {}

    // Validar datos de envío
    if (!formData.shippingFirstName.trim()) {
      newErrors.shippingFirstName = 'El nombre es requerido'
    }
    if (!formData.shippingLastName.trim()) {
      newErrors.shippingLastName = 'El apellido es requerido'
    }
    if (!formData.shippingEmail) {
      newErrors.shippingEmail = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.shippingEmail)) {
      newErrors.shippingEmail = 'El email no es válido'
    }
    if (!formData.shippingPhone) {
      newErrors.shippingPhone = 'El teléfono es requerido'
    }
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'La dirección es requerida'
    }
    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = 'La ciudad es requerida'
    }
    if (!formData.shippingDepartment) {
      newErrors.shippingDepartment = 'El departamento es requerido'
    }
    if (!formData.shippingPostalCode) {
      newErrors.shippingPostalCode = 'El código postal es requerido'
    }

    // Validar datos de facturación solo si no es igual a envío
    if (!sameAsShipping) {
      if (!formData.billingFirstName.trim()) {
        newErrors.billingFirstName = 'El nombre es requerido'
      }
      if (!formData.billingLastName.trim()) {
        newErrors.billingLastName = 'El apellido es requerido'
      }
      if (!formData.billingEmail) {
        newErrors.billingEmail = 'El email es requerido'
      } else if (!/\S+@\S+\.\S+/.test(formData.billingEmail)) {
        newErrors.billingEmail = 'El email no es válido'
      }
      if (!formData.billingAddress.trim()) {
        newErrors.billingAddress = 'La dirección es requerida'
      }
      if (!formData.billingCity.trim()) {
        newErrors.billingCity = 'La ciudad es requerida'
      }
    }

    // Validar método de pago
    if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') {
      if (!formData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'El número de tarjeta es requerido'
      } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos'
      }
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'El nombre en la tarjeta es requerido'
      }
      if (!formData.cardExpiry) {
        newErrors.cardExpiry = 'La fecha de expiración es requerida'
      }
      if (!formData.cardCVV) {
        newErrors.cardCVV = 'El CVV es requerido'
      } else if (formData.cardCVV.length < 3) {
        newErrors.cardCVV = 'El CVV debe tener al menos 3 dígitos'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Procesar pedido
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      // Aquí irá la lógica de procesamiento del pedido con tu API
      const orderData = {
        items: cartItems,
        shipping: {
          firstName: formData.shippingFirstName,
          lastName: formData.shippingLastName,
          email: formData.shippingEmail,
          phone: formData.shippingPhone,
          address: formData.shippingAddress,
          city: formData.shippingCity,
          department: formData.shippingDepartment,
          postalCode: formData.shippingPostalCode,
          notes: formData.shippingNotes
        },
        billing: sameAsShipping ? null : {
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          email: formData.billingEmail,
          phone: formData.billingPhone,
          address: formData.billingAddress,
          city: formData.billingCity,
          department: formData.billingDepartment,
          postalCode: formData.billingPostalCode
        },
        payment: {
          method: formData.paymentMethod,
          ...(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card' ? {
            cardType: formData.cardType,
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            cardName: formData.cardName,
            cardExpiry: formData.cardExpiry,
            cardCVV: formData.cardCVV
          } : {})
        },
        totals: {
          subtotal,
          discount,
          shipping,
          total
        }
      }

      console.log('Procesando pedido:', orderData)
      
      // Simulación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Limpiar carrito después de procesar
      localStorage.removeItem('cart')
      
      // Redirigir a página de confirmación
      navigate('/order-confirmation', {
        state: {
          orderId: `ORD-${Date.now()}`,
          orderData
        }
      })
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error)
      setErrors({
        general: 'Error al procesar el pedido. Por favor, intenta nuevamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }))
    
    // Detectar tipo de tarjeta
    const firstDigit = formatted.replace(/\s/g, '')[0]
    if (firstDigit === '4') {
      setFormData(prev => ({ ...prev, cardType: 'visa' }))
    } else if (firstDigit === '5') {
      setFormData(prev => ({ ...prev, cardType: 'mastercard' }))
    } else if (firstDigit === '3') {
      setFormData(prev => ({ ...prev, cardType: 'amex' }))
    }
  }

  if (cartItems.length === 0) {
    return null // Redirigiendo...
  }

  return (
    <div className="checkout-page">
      <PageHeader
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Carrito', path: '/cart' },
          { label: 'Finalizar Compra', path: '/checkout' }
        ]}
        title="Finalizar Compra"
        subtitle="Completa tu información para procesar tu pedido"
      />

      <div className="container-fluid py-5">
        <div className="container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="row">
              {/* Formulario */}
              <div className="col-lg-8 mb-4">
                {/* Error General */}
                {errors.general && (
                  <div className="alert alert-danger mb-4">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.general}
                  </div>
                )}

                {/* Información de Envío */}
                <div className="checkout-section">
                  <h3 className="checkout-section-title">
                    <i className="fas fa-truck me-2"></i>
                    Información de Envío
                  </h3>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingFirstName" className="form-label">
                        Nombre *
                      </label>
                      <Input
                        type="text"
                        id="shippingFirstName"
                        name="shippingFirstName"
                        value={formData.shippingFirstName}
                        onChange={handleChange}
                        className={errors.shippingFirstName ? 'is-invalid' : ''}
                        placeholder="Juan"
                      />
                      {errors.shippingFirstName && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingFirstName}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingLastName" className="form-label">
                        Apellido *
                      </label>
                      <Input
                        type="text"
                        id="shippingLastName"
                        name="shippingLastName"
                        value={formData.shippingLastName}
                        onChange={handleChange}
                        className={errors.shippingLastName ? 'is-invalid' : ''}
                        placeholder="Pérez"
                      />
                      {errors.shippingLastName && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingLastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingEmail" className="form-label">
                        Email *
                      </label>
                      <Input
                        type="email"
                        id="shippingEmail"
                        name="shippingEmail"
                        value={formData.shippingEmail}
                        onChange={handleChange}
                        className={errors.shippingEmail ? 'is-invalid' : ''}
                        placeholder="juan@email.com"
                        icon="fas fa-envelope"
                        iconPosition="left"
                      />
                      {errors.shippingEmail && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingEmail}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingPhone" className="form-label">
                        Teléfono *
                      </label>
                      <Input
                        type="tel"
                        id="shippingPhone"
                        name="shippingPhone"
                        value={formData.shippingPhone}
                        onChange={handleChange}
                        className={errors.shippingPhone ? 'is-invalid' : ''}
                        placeholder="3001234567"
                        icon="fas fa-phone"
                        iconPosition="left"
                      />
                      {errors.shippingPhone && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="shippingAddress" className="form-label">
                      Dirección *
                    </label>
                    <Input
                      type="text"
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      className={errors.shippingAddress ? 'is-invalid' : ''}
                      placeholder="Calle 123 #45-67"
                      icon="fas fa-map-marker-alt"
                      iconPosition="left"
                    />
                    {errors.shippingAddress && (
                      <div className="invalid-feedback d-block">
                        {errors.shippingAddress}
                      </div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingCity" className="form-label">
                        Ciudad *
                      </label>
                      <Input
                        type="text"
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleChange}
                        className={errors.shippingCity ? 'is-invalid' : ''}
                        placeholder="Bogotá"
                      />
                      {errors.shippingCity && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingCity}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-3 mb-3">
                      <label htmlFor="shippingDepartment" className="form-label">
                        Departamento *
                      </label>
                      <select
                        id="shippingDepartment"
                        name="shippingDepartment"
                        value={formData.shippingDepartment}
                        onChange={handleChange}
                        className={`form-select ${errors.shippingDepartment ? 'is-invalid' : ''}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="antioquia">Antioquia</option>
                        <option value="atlantico">Atlántico</option>
                        <option value="bogota">Bogotá D.C.</option>
                        <option value="bolivar">Bolívar</option>
                        <option value="boyaca">Boyacá</option>
                        <option value="caldas">Caldas</option>
                        <option value="caqueta">Caquetá</option>
                        <option value="cauca">Cauca</option>
                        <option value="cesar">Cesar</option>
                        <option value="cordoba">Córdoba</option>
                        <option value="cundinamarca">Cundinamarca</option>
                        <option value="huila">Huila</option>
                        <option value="magdalena">Magdalena</option>
                        <option value="meta">Meta</option>
                        <option value="nariño">Nariño</option>
                        <option value="norte_santander">Norte de Santander</option>
                        <option value="quindio">Quindío</option>
                        <option value="risaralda">Risaralda</option>
                        <option value="santander">Santander</option>
                        <option value="sucre">Sucre</option>
                        <option value="tolima">Tolima</option>
                        <option value="valle_cauca">Valle del Cauca</option>
                      </select>
                      {errors.shippingDepartment && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingDepartment}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-3 mb-3">
                      <label htmlFor="shippingPostalCode" className="form-label">
                        Código Postal *
                      </label>
                      <Input
                        type="text"
                        id="shippingPostalCode"
                        name="shippingPostalCode"
                        value={formData.shippingPostalCode}
                        onChange={handleChange}
                        className={errors.shippingPostalCode ? 'is-invalid' : ''}
                        placeholder="110111"
                      />
                      {errors.shippingPostalCode && (
                        <div className="invalid-feedback d-block">
                          {errors.shippingPostalCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="shippingNotes" className="form-label">
                      Notas de Entrega (Opcional)
                    </label>
                    <textarea
                      id="shippingNotes"
                      name="shippingNotes"
                      value={formData.shippingNotes}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Instrucciones especiales para la entrega..."
                    />
                  </div>
                </div>

                {/* Información de Facturación */}
                <div className="checkout-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="checkout-section-title mb-0">
                      <i className="fas fa-file-invoice me-2"></i>
                      Información de Facturación
                    </h3>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="sameAsShipping">
                        Igual que la dirección de envío
                      </label>
                    </div>
                  </div>

                  {!sameAsShipping && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="billingFirstName" className="form-label">
                          Nombre *
                        </label>
                        <Input
                          type="text"
                          id="billingFirstName"
                          name="billingFirstName"
                          value={formData.billingFirstName}
                          onChange={handleChange}
                          className={errors.billingFirstName ? 'is-invalid' : ''}
                          placeholder="Juan"
                        />
                        {errors.billingFirstName && (
                          <div className="invalid-feedback d-block">
                            {errors.billingFirstName}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="billingLastName" className="form-label">
                          Apellido *
                        </label>
                        <Input
                          type="text"
                          id="billingLastName"
                          name="billingLastName"
                          value={formData.billingLastName}
                          onChange={handleChange}
                          className={errors.billingLastName ? 'is-invalid' : ''}
                          placeholder="Pérez"
                        />
                        {errors.billingLastName && (
                          <div className="invalid-feedback d-block">
                            {errors.billingLastName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Método de Pago */}
                <div className="checkout-section">
                  <h3 className="checkout-section-title">
                    <i className="fas fa-credit-card me-2"></i>
                    Método de Pago
                  </h3>

                  <div className="payment-methods mb-4">
                    <div className="payment-method-option">
                      <input
                        type="radio"
                        id="payment-credit"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleChange}
                      />
                      <label htmlFor="payment-credit">
                        <i className="fab fa-cc-visa me-2"></i>
                        Tarjeta de Crédito
                      </label>
                    </div>
                    
                    <div className="payment-method-option">
                      <input
                        type="radio"
                        id="payment-debit"
                        name="paymentMethod"
                        value="debit_card"
                        checked={formData.paymentMethod === 'debit_card'}
                        onChange={handleChange}
                      />
                      <label htmlFor="payment-debit">
                        <i className="fas fa-credit-card me-2"></i>
                        Tarjeta de Débito
                      </label>
                    </div>
                    
                    <div className="payment-method-option">
                      <input
                        type="radio"
                        id="payment-transfer"
                        name="paymentMethod"
                        value="transfer"
                        checked={formData.paymentMethod === 'transfer'}
                        onChange={handleChange}
                      />
                      <label htmlFor="payment-transfer">
                        <i className="fas fa-university me-2"></i>
                        Transferencia Bancaria
                      </label>
                    </div>
                    
                    <div className="payment-method-option">
                      <input
                        type="radio"
                        id="payment-cash"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                      />
                      <label htmlFor="payment-cash">
                        <i className="fas fa-money-bill-wave me-2"></i>
                        Contra Entrega (Efectivo)
                      </label>
                    </div>
                  </div>

                  {/* Formulario de Tarjeta */}
                  {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
                    <div className="payment-card-form">
                      <div className="mb-3">
                        <label htmlFor="cardNumber" className="form-label">
                          Número de Tarjeta *
                        </label>
                        <Input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          className={errors.cardNumber ? 'is-invalid' : ''}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          icon={`fab fa-cc-${formData.cardType === 'amex' ? 'amex' : formData.cardType === 'mastercard' ? 'mastercard' : 'visa'}`}
                          iconPosition="left"
                        />
                        {errors.cardNumber && (
                          <div className="invalid-feedback d-block">
                            {errors.cardNumber}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="cardName" className="form-label">
                          Nombre en la Tarjeta *
                        </label>
                        <Input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          className={errors.cardName ? 'is-invalid' : ''}
                          placeholder="JUAN PÉREZ"
                        />
                        {errors.cardName && (
                          <div className="invalid-feedback d-block">
                            {errors.cardName}
                          </div>
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="cardExpiry" className="form-label">
                            Fecha de Expiración *
                          </label>
                          <Input
                            type="text"
                            id="cardExpiry"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            className={errors.cardExpiry ? 'is-invalid' : ''}
                            placeholder="MM/AA"
                            maxLength="5"
                          />
                          {errors.cardExpiry && (
                            <div className="invalid-feedback d-block">
                              {errors.cardExpiry}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="cardCVV" className="form-label">
                            CVV *
                          </label>
                          <Input
                            type="text"
                            id="cardCVV"
                            name="cardCVV"
                            value={formData.cardCVV}
                            onChange={handleChange}
                            className={errors.cardCVV ? 'is-invalid' : ''}
                            placeholder="123"
                            maxLength="4"
                          />
                          {errors.cardCVV && (
                            <div className="invalid-feedback d-block">
                              {errors.cardCVV}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información de otros métodos de pago */}
                  {formData.paymentMethod === 'transfer' && (
                    <div className="payment-info-box">
                      <p><strong>Transferencia Bancaria</strong></p>
                      <p>Realiza la transferencia a:</p>
                      <p>Banco: Banco de Colombia<br />
                      Cuenta: 123456789<br />
                      Titular: NEW LIFE S.A.S.<br />
                      Tipo: Cuenta Corriente</p>
                      <p className="text-muted small">
                        Enviaremos los detalles completos después de confirmar tu pedido.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === 'cash' && (
                    <div className="payment-info-box">
                      <p><strong>Pago Contra Entrega</strong></p>
                      <p>Pagarás en efectivo cuando recibas tu pedido.</p>
                      <p className="text-muted small">
                        El repartidor recibirá el pago al momento de la entrega.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen del Pedido */}
              <div className="col-lg-4">
                <div className="checkout-summary">
                  <h3 className="checkout-summary-title">
                    <i className="fas fa-receipt me-2"></i>
                    Resumen del Pedido
                  </h3>

                  {/* Productos */}
                  <div className="checkout-products">
                    {cartItems.map((item) => {
                      const finalPrice = item.discount && item.originalPrice
                        ? item.originalPrice - (item.originalPrice * item.discount / 100)
                        : item.price

                      return (
                        <div key={item.id} className="checkout-product-item">
                          <div className="checkout-product-image">
                            <img
                              src={item.image || '/img/Imagen1.png'}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = '/img/Imagen1.png'
                              }}
                            />
                          </div>
                          <div className="checkout-product-info">
                            <div className="checkout-product-name">{item.name}</div>
                            <div className="checkout-product-details">
                              Cantidad: {item.quantity} × ${finalPrice.toLocaleString()}
                            </div>
                          </div>
                          <div className="checkout-product-price">
                            ${(finalPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Totales */}
                  <div className="checkout-totals">
                    <div className="checkout-total-row">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="checkout-total-row checkout-discount">
                        <span>Descuento</span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="checkout-total-row">
                      <span>Envío</span>
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
                    <div className="checkout-total-row checkout-total-final">
                      <span>Total</span>
                      <span className="checkout-total-amount">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Botón de Confirmar */}
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="checkout-submit-btn w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock me-2"></i>
                        Confirmar Pedido
                      </>
                    )}
                  </Button>

                  <Link to="/cart" className="checkout-back-link">
                    <i className="fas fa-arrow-left me-2"></i>
                    Volver al Carrito
                  </Link>

                  {/* Seguridad */}
                  <div className="checkout-security">
                    <div className="security-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>Compra 100% segura y encriptada</span>
                    </div>
                    <div className="security-item">
                      <i className="fas fa-lock"></i>
                      <span>Datos protegidos SSL</span>
                    </div>
                  </div>
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
