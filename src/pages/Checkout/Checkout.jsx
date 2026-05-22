import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../../components/organisms'
import { Button } from '../../components/atoms'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import facturaService from '../../services/facturaService'
import detalleFacturaService from '../../services/detalleFacturaService'
import despachoService from '../../services/despachoService'
import responsableService from '../../services/responsableService'
import api from '../../services/api'
import './Checkout.css'

const METODOS_PAGO = [
  { value: 'Efectivo', label: 'Efectivo', icon: 'fa-money-bill-wave' },
  { value: 'Transferencia', label: 'Transferencia bancaria', icon: 'fa-university' },
  { value: 'PSE', label: 'PSE', icon: 'fa-credit-card' },
  { value: 'Tarjeta de crédito', label: 'Tarjeta de crédito', icon: 'fa-cc-visa' },
]

const generarNumeroFactura = () => {
  const year = new Date().getFullYear()
  const seq = String(Date.now()).slice(-6)
  return `FV-${year}-${seq}`
}

const Checkout = () => {
  const navigate = useNavigate()
  const { cliente } = useAuth()
  const { items, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [formData, setFormData] = useState({
    address: '', city: '', department: '', postalCode: '', notes: '',
    paymentMethod: 'Efectivo'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!cliente) { navigate('/login'); return }
    if (items.length === 0) { navigate('/cart') }
  }, [cliente, items, navigate])

  const getItemPrice = (item) =>
    item.discount && item.originalPrice
      ? item.originalPrice * (1 - item.discount / 100)
      : item.price

  const subtotal = items.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0)
  const shipping = subtotal >= 100000 ? 0 : 15000
  const total = subtotal + shipping

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.address.trim()) errs.address = 'La dirección es requerida'
    if (!formData.city.trim()) errs.city = 'La ciudad es requerida'
    if (!formData.department) errs.department = 'El departamento es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!cliente) { navigate('/login'); return }

    setIsLoading(true)
    setCheckoutError('')
    const numeroFactura = generarNumeroFactura()
    const direccion = `${formData.address}, ${formData.city}, ${formData.department}${formData.postalCode ? ' ' + formData.postalCode : ''}`

    try {
      // 1. Crear factura
      await facturaService.create({
        numero_factura: numeroFactura,
        fecha: new Date().toISOString(),
        metodo_pago: formData.paymentMethod,
        estado_pago: 'Pendiente',
        direccion_envio: direccion,
        cedula_cli: cliente.numero_identificacion,
      })

      // 2. Crear detalles por cada producto
      for (const item of items) {
        await detalleFacturaService.create({
          cantidad: item.quantity,
          descuento_porcentaje: item.discount || 0,
          numero_factura: numeroFactura,
          codigo_prod: item.id,
          precio_unitario: item.price,
        })
      }

      // 3. Reducir stock de cada producto
      for (const item of items) {
        await api.post(`/producto/reducir-stock/${item.id}/${item.quantity}`).catch(() => {})
      }

      // 4. Auto-crear despacho asignado al primer responsable activo
      const responsables = await responsableService.getAll().catch(() => [])
      const responsableAsignado = responsables.find(r => r.estado === 'Activo') || responsables[0]
      await despachoService.create({
        fecha_despacho: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
        numero_factura: numeroFactura,
        cc_responsable: responsableAsignado?.cedula_resp || null,
        cc_domiciliario: null,
      }).catch(() => {})

      // 5. Limpiar carrito
      clearCart()

      // 6. Ir a mis compras con mensaje de éxito
      navigate('/mis-compras', { state: { nuevaFactura: numeroFactura } })
    } catch (e) {
      setCheckoutError(e?.response?.data?.Message || 'Error al procesar el pedido. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!cliente || items.length === 0) return null

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
              {/* Formulario */}
              <div className="col-lg-8 mb-4">
                {checkoutError && (
                  <div className="alert alert-danger mb-4">
                    <i className="fas fa-exclamation-circle me-2"></i>{checkoutError}
                  </div>
                )}

                {/* Cliente identificado */}
                <div className="checkout-section mb-4" style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 38, height: 38, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <i className="fas fa-user-check"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#15803d' }}>{cliente.nombres}</div>
                      <div style={{ fontSize: '0.82rem', color: '#166534' }}>Cédula: {cliente.numero_identificacion} · {cliente.correo}</div>
                    </div>
                  </div>
                </div>

                {/* Dirección de envío */}
                <div className="checkout-section">
                  <h3 className="checkout-section-title"><i className="fas fa-truck me-2"></i>Dirección de Envío</h3>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Dirección *</label>
                      <input
                        type="text"
                        name="address"
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Calle 123 #45-67, Apto 201"
                      />
                      {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                    </div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label">Ciudad *</label>
                      <input
                        type="text"
                        name="city"
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Bogotá"
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Departamento *</label>
                      <select
                        name="department"
                        className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar...</option>
                        {['Bogotá D.C.','Antioquia','Valle del Cauca','Santander','Cundinamarca','Atlántico','Bolívar','Nariño','Córdoba','Norte de Santander','Tolima','Caldas','Meta','Risaralda','Quindío','Magdalena','Cauca','Huila','Cesar','Sucre'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Código Postal</label>
                      <input
                        type="text"
                        name="postalCode"
                        className="form-control"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="110111"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Notas del pedido (opcional)</label>
                      <textarea
                        name="notes"
                        className="form-control"
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Instrucciones especiales de entrega..."
                      />
                    </div>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="checkout-section mt-4">
                  <h3 className="checkout-section-title"><i className="fas fa-credit-card me-2"></i>Método de Pago</h3>
                  <div className="row g-3">
                    {METODOS_PAGO.map(m => (
                      <div key={m.value} className="col-6 col-md-3">
                        <label style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          padding: '1rem', border: `2px solid ${formData.paymentMethod === m.value ? '#16a34a' : '#e2e8f0'}`,
                          borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                          background: formData.paymentMethod === m.value ? '#f0fdf4' : '#fff'
                        }}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={m.value}
                            checked={formData.paymentMethod === m.value}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                          />
                          <i className={`fas ${m.icon}`} style={{ fontSize: '1.4rem', color: formData.paymentMethod === m.value ? '#16a34a' : '#94a3b8' }}></i>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', color: formData.paymentMethod === m.value ? '#15803d' : '#475569' }}>{m.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="col-lg-4">
                <div className="checkout-summary">
                  <h3 className="checkout-summary-title"><i className="fas fa-receipt me-2"></i>Resumen del Pedido</h3>
                  <div className="checkout-products">
                    {items.map(item => {
                      const fp = getItemPrice(item)
                      return (
                        <div key={item.id} className="checkout-product-item">
                          <div className="checkout-product-image">
                            <img src={item.image || '/img/Imagen1.png'} alt={item.name} onError={e => { e.target.src = '/img/Imagen1.png' }} />
                          </div>
                          <div className="checkout-product-info">
                            <div className="checkout-product-name">{item.name}</div>
                            <div className="checkout-product-details">
                              {item.quantity} × ${fp.toLocaleString('es-CO')}
                              {item.discount > 0 && <span style={{ color: '#16a34a', marginLeft: 4 }}>(-{item.discount}%)</span>}
                            </div>
                          </div>
                          <div className="checkout-product-price">${(fp * item.quantity).toLocaleString('es-CO')}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="checkout-totals">
                    <div className="checkout-total-row"><span>Subtotal</span><span>${subtotal.toLocaleString('es-CO')}</span></div>
                    <div className="checkout-total-row">
                      <span>Envío</span>
                      <span>{shipping === 0 ? <span className="text-success">Gratis</span> : `$${shipping.toLocaleString('es-CO')}`}</span>
                    </div>
                    <div className="checkout-total-row checkout-total-final">
                      <span>Total a pagar</span>
                      <span className="checkout-total-amount">${total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', padding: '0.5rem 0', borderTop: '1px solid #f1f5f9' }}>
                    <i className="fas fa-info-circle me-1"></i>
                    Pago: <strong>{formData.paymentMethod}</strong> · Estado inicial: <strong>Pendiente</strong>
                  </div>

                  <Button type="submit" variant="success" size="lg" className="checkout-submit-btn w-100" disabled={isLoading}>
                    {isLoading
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando pedido...</>
                      : <><i className="fas fa-lock me-2"></i>Confirmar Pedido — ${total.toLocaleString('es-CO')}</>
                    }
                  </Button>
                  <Link to="/cart" className="checkout-back-link">
                    <i className="fas fa-arrow-left me-2"></i>Volver al Carrito
                  </Link>
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
