import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import facturaService from '../../services/facturaService'
import detalleFacturaService from '../../services/detalleFacturaService'
import productoService from '../../services/productoService'
import { imprimirFactura } from '../../utils/imprimirFactura'
import { PageHeader } from '../../components/organisms'
import './MisCompras.css'

const estadoConfig = {
  Pagado:    { class: 'pagado',    icon: 'fa-check-circle',  label: 'Pagado',    color: '#16a34a' },
  Pendiente: { class: 'pendiente', icon: 'fa-clock',         label: 'Pendiente', color: '#f59e0b' },
  Cancelado: { class: 'cancelado', icon: 'fa-times-circle',  label: 'Cancelado', color: '#ef4444' }
}

const fmtCOP = (n) => Number(n || 0).toLocaleString('es-CO')

const MisCompras = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const nuevaFactura = location.state?.nuevaFactura

  const [facturas, setFacturas] = useState([])
  const [detallesMap, setDetallesMap] = useState({})
  const [productosMap, setProductosMap] = useState({})
  const [expandedFactura, setExpandedFactura] = useState(nuevaFactura || null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('todos')
  const [printingFac, setPrintingFac] = useState(null)

  useEffect(() => {
    if (!cliente) { navigate('/login'); return }
    const load = async () => {
      setIsLoading(true)
      try {
        const [facts, prods] = await Promise.all([
          facturaService.getByCliente(cliente.numero_identificacion).catch(() => []),
          productoService.getAll().catch(() => []),
        ])
        const facList = Array.isArray(facts) ? facts : []
        const prodList = Array.isArray(prods) ? prods : []
        setFacturas(facList)

        const prodMap = {}
        prodList.forEach(p => { prodMap[p.codigo_prod] = p })
        setProductosMap(prodMap)

        // Cargar detalles de todas las facturas
        const detMap = {}
        await Promise.all(
          facList.map(async f => {
            const dets = await detalleFacturaService.getByFactura(f.numero_factura).catch(() => [])
            detMap[f.numero_factura] = Array.isArray(dets) ? dets : []
          })
        )
        setDetallesMap(detMap)
      } finally { setIsLoading(false) }
    }
    load()
  }, [cliente, navigate])

  const handleImprimirFactura = async (factura) => {
    setPrintingFac(factura.numero_factura)
    try {
      const dets = detallesMap[factura.numero_factura] || []
      imprimirFactura(factura, dets, productosMap, cliente)
    } finally { setPrintingFac(null) }
  }

  if (!cliente) return null

  const filtered = filter === 'todos'
    ? facturas
    : facturas.filter(f => (f.estado_pago || 'Pendiente').toLowerCase() === filter)

  const stats = {
    total: facturas.length,
    pagadas: facturas.filter(f => f.estado_pago === 'Pagado').length,
    pendientes: facturas.filter(f => f.estado_pago === 'Pendiente').length,
    canceladas: facturas.filter(f => f.estado_pago === 'Cancelado').length
  }

  const getFacturaTotal = (numero_factura) => {
    const dets = detallesMap[numero_factura] || []
    return dets.reduce((sum, d) => {
      const precio = Number(d.precio_unitario || 0)
      const desc = Number(d.descuento_porcentaje || 0)
      return sum + (precio * (1 - desc / 100) * d.cantidad)
    }, 0)
  }

  return (
    <div className="mis-compras-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Mis Compras', path: '/mis-compras' }]}
        title="Mis Compras"
        subtitle="Historial de tus pedidos y facturas"
      />

      <div className="container py-5">
        {/* Alerta nueva factura */}
        {nuevaFactura && (
          <div className="alert alert-success mb-4 d-flex align-items-center gap-3" style={{ borderRadius: 12 }}>
            <i className="fas fa-check-circle fa-2x text-success"></i>
            <div>
              <strong>¡Pedido realizado con éxito!</strong>
              <div style={{ fontSize: '0.88rem' }}>Tu factura <strong>{nuevaFactura}</strong> ha sido creada. Estado inicial: <strong>Pendiente</strong>.</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="compras-stats">
          {[
            { label: 'Total Pedidos', value: stats.total, icon: 'fa-shopping-bag', color: '#6366f1' },
            { label: 'Pagados', value: stats.pagadas, icon: 'fa-check-circle', color: '#16a34a' },
            { label: 'Pendientes', value: stats.pendientes, icon: 'fa-clock', color: '#f59e0b' },
            { label: 'Cancelados', value: stats.canceladas, icon: 'fa-times-circle', color: '#ef4444' }
          ].map(s => (
            <div key={s.label} className="compra-stat-card">
              <div className="compra-stat-icon" style={{ background: s.color }}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <div>
                <div className="compra-stat-value">{s.value}</div>
                <div className="compra-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="compras-filters">
          {['todos', 'pagado', 'pendiente', 'cancelado'].map(f => (
            <button
              key={f}
              className={`compra-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="compras-loading">
            <div className="spinner-border text-success"></div>
            <p className="mt-3 text-muted">Cargando tus compras...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="compras-empty">
            <i className="fas fa-shopping-bag"></i>
            <h4>{filter === 'todos' ? 'Aún no tienes compras' : `No hay pedidos ${filter}s`}</h4>
            <p className="text-muted">Cuando realices una compra aparecerá aquí.</p>
            <Link to="/shop" className="btn btn-success mt-2">
              <i className="fas fa-store me-2"></i>Ir a la Tienda
            </Link>
          </div>
        ) : (
          <div className="compras-list">
            {filtered.map(factura => {
              const cfg = estadoConfig[factura.estado_pago] || estadoConfig.Pendiente
              const dets = detallesMap[factura.numero_factura] || []
              const isExpanded = expandedFactura === factura.numero_factura
              const totalFactura = getFacturaTotal(factura.numero_factura) + (getFacturaTotal(factura.numero_factura) >= 100000 ? 0 : 15000)

              return (
                <div key={factura.numero_factura} className={`compra-card ${cfg.class} ${factura.numero_factura === nuevaFactura ? 'compra-card-new' : ''}`}>
                  <div
                    className="compra-card-header"
                    onClick={() => setExpandedFactura(isExpanded ? null : factura.numero_factura)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="compra-numero">
                      <i className="fas fa-file-invoice me-2"></i>
                      <span>{factura.numero_factura}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                      {totalFactura > 0 && (
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                          ${fmtCOP(totalFactura)}
                        </span>
                      )}
                      <span className={`compra-estado ${cfg.class}`}>
                        <i className={`fas ${cfg.icon} me-1`}></i>{cfg.label}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImprimirFactura(factura) }}
                        disabled={printingFac === factura.numero_factura}
                        title="Descargar PDF"
                        style={{
                          background: 'linear-gradient(135deg,#28a745,#20c997)', color: '#fff', border: 'none',
                          padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0
                        }}
                      >
                        {printingFac === factura.numero_factura
                          ? <span className="spinner-border spinner-border-sm"></span>
                          : <><i className="fas fa-file-pdf"></i> PDF</>
                        }
                      </button>
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: '#94a3b8', fontSize: '0.85rem' }}></i>
                    </div>
                  </div>

                  <div className="compra-card-body">
                    <div className="compra-detail">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{factura.fecha ? new Date(factura.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}</span>
                    </div>
                    <div className="compra-detail">
                      <i className="fas fa-credit-card"></i>
                      <span>{factura.metodo_pago || 'No especificado'}</span>
                    </div>
                    <div className="compra-detail">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{factura.direccion_envio || 'Sin dirección'}</span>
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem' }}>
                        <i className="fas fa-list-ul me-2 text-muted"></i>Productos del pedido
                      </h5>
                      {dets.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No hay detalles disponibles.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {dets.map((det, idx) => {
                            const prod = productosMap[det.codigo_prod]
                            const precioUnit = Number(det.precio_unitario || 0)
                            const desc = Number(det.descuento_porcentaje || 0)
                            const precioConDesc = precioUnit * (1 - desc / 100)
                            const subtotalLinea = precioConDesc * det.cantidad
                            return (
                              <div key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: '#f8fafc', borderRadius: 10, padding: '0.65rem 0.85rem'
                              }}>
                                <img
                                  src={prod?.img_url || '/img/Imagen1.png'}
                                  alt={prod?.nombres || det.codigo_prod}
                                  onError={e => { e.target.src = '/img/Imagen1.png' }}
                                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {prod?.nombres || det.codigo_prod}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    ${fmtCOP(precioUnit)} c/u
                                    {desc > 0 && <span style={{ color: '#16a34a', marginLeft: 4 }}>(-{desc}%)</span>}
                                    {' · '}{det.cantidad} und.
                                  </div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', flexShrink: 0 }}>
                                  ${fmtCOP(subtotalLinea)}
                                </div>
                              </div>
                            )
                          })}

                          {/* Totales de la factura */}
                          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem', marginTop: '0.25rem' }}>
                            {(() => {
                              const sub = dets.reduce((s, d) => s + Number(d.precio_unitario || 0) * (1 - Number(d.descuento_porcentaje || 0) / 100) * d.cantidad, 0)
                              const env = sub >= 100000 ? 0 : 15000
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Subtotal: ${fmtCOP(sub)}</span>
                                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Envío: {env === 0 ? <span style={{ color: '#16a34a' }}>Gratis</span> : `$${fmtCOP(env)}`}
                                  </span>
                                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                                    Total: ${fmtCOP(sub + env)}
                                  </span>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="compras-actions">
          <Link to="/shop" className="btn btn-success">
            <i className="fas fa-plus me-2"></i>Hacer Nueva Compra
          </Link>
          <Link to="/mi-perfil" className="btn btn-outline-secondary ms-2">
            <i className="fas fa-user me-2"></i>Volver a Mi Perfil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MisCompras
