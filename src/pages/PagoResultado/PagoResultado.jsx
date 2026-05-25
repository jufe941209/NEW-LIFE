import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import facturaService from '../../services/facturaService'
import './PagoResultado.css'

const POLL_INTERVAL = 3000
const POLL_MAX = 10

const PagoResultado = () => {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()

  const ref = searchParams.get('ref') || sessionStorage.getItem('wompi_ref') || ''
  const wompiId = searchParams.get('id') || ''

  const [estado, setEstado] = useState('verificando') // verificando | aprobado | rechazado | pendiente
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!ref) { setEstado('pendiente'); return }

    let cancelled = false
    let timer

    const verificar = async () => {
      try {
        const factura = await facturaService.getById(ref)
        if (cancelled) return

        const ep = (factura?.estado_pago || '').toLowerCase()
        if (ep === 'aprobado' || ep === 'pagado') {
          setEstado('aprobado')
          clearCart()
          sessionStorage.removeItem('wompi_ref')
          sessionStorage.removeItem('wompi_total')
        } else if (ep === 'rechazado' || ep === 'anulado') {
          setEstado('rechazado')
        } else {
          // Aún pendiente — seguir intentando
          setIntento(prev => {
            const next = prev + 1
            if (next < POLL_MAX) {
              timer = setTimeout(verificar, POLL_INTERVAL)
            } else {
              setEstado('pendiente')
            }
            return next
          })
        }
      } catch {
        if (!cancelled) setEstado('pendiente')
      }
    }

    verificar()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [ref])

  return (
    <div className="pago-resultado-page">
      <div className="pago-resultado-card">

        {estado === 'verificando' && (
          <div className="resultado-verificando">
            <div className="resultado-spinner"></div>
            <h2>Verificando tu pago...</h2>
            <p>Estamos confirmando el estado de tu transacción con Wompi.</p>
            <div className="resultado-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {estado === 'aprobado' && (
          <div className="resultado-aprobado">
            <div className="resultado-icon resultado-icon--ok">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>¡Pago exitoso!</h2>
            <p>Tu pedido <strong>{ref}</strong> fue confirmado. Recibirás una notificación cuando sea despachado.</p>
            <div className="resultado-actions">
              <Link to="/mis-compras" className="btn-resultado btn-resultado--primary">
                <i className="fas fa-box me-2"></i>Ver mis pedidos
              </Link>
              <Link to="/shop" className="btn-resultado btn-resultado--secondary">
                <i className="fas fa-shopping-bag me-2"></i>Seguir comprando
              </Link>
            </div>
          </div>
        )}

        {estado === 'rechazado' && (
          <div className="resultado-rechazado">
            <div className="resultado-icon resultado-icon--error">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Pago rechazado</h2>
            <p>Tu pago no fue procesado. Puedes intentarlo de nuevo con otro método de pago.</p>
            <div className="resultado-actions">
              <Link to="/checkout" className="btn-resultado btn-resultado--primary">
                <i className="fas fa-redo me-2"></i>Intentar de nuevo
              </Link>
              <Link to="/cart" className="btn-resultado btn-resultado--secondary">
                <i className="fas fa-shopping-cart me-2"></i>Volver al carrito
              </Link>
            </div>
          </div>
        )}

        {estado === 'pendiente' && (
          <div className="resultado-pendiente">
            <div className="resultado-icon resultado-icon--warn">
              <i className="fas fa-clock"></i>
            </div>
            <h2>Pago en proceso</h2>
            <p>
              Tu pedido <strong>{ref || 'en proceso'}</strong> fue creado. El pago puede tardar unos minutos en confirmarse.
              Revisa el estado en tus compras.
            </p>
            {wompiId && (
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>ID transacción Wompi: {wompiId}</p>
            )}
            <div className="resultado-actions">
              <Link to="/mis-compras" className="btn-resultado btn-resultado--primary">
                <i className="fas fa-box me-2"></i>Ver mis pedidos
              </Link>
              <Link to="/shop" className="btn-resultado btn-resultado--secondary">
                <i className="fas fa-home me-2"></i>Ir al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PagoResultado
