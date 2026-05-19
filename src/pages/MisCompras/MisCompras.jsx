import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import facturaService from '../../services/facturaService'
import { PageHeader } from '../../components/organisms'
import './MisCompras.css'

const estadoConfig = {
  Pagado:    { class: 'pagado',    icon: 'fa-check-circle',     label: 'Pagado' },
  Pendiente: { class: 'pendiente', icon: 'fa-clock',            label: 'Pendiente' },
  Cancelado: { class: 'cancelado', icon: 'fa-times-circle',     label: 'Cancelado' }
}

const MisCompras = () => {
  const { cliente } = useAuth()
  const navigate = useNavigate()
  const [facturas, setFacturas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    if (!cliente) { navigate('/login'); return }
    const load = async () => {
      setIsLoading(true)
      try {
        const result = await facturaService.getByCliente(cliente.numero_identificacion)
        setFacturas(result)
      } catch {
        setFacturas([])
      } finally { setIsLoading(false) }
    }
    load()
  }, [cliente, navigate])

  if (!cliente) return null

  const filtered = filter === 'todos'
    ? facturas
    : facturas.filter(f => f.estado_pago?.toLowerCase() === filter)

  const stats = {
    total: facturas.length,
    pagadas: facturas.filter(f => f.estado_pago === 'Pagado').length,
    pendientes: facturas.filter(f => f.estado_pago === 'Pendiente').length,
    canceladas: facturas.filter(f => f.estado_pago === 'Cancelado').length
  }

  return (
    <div className="mis-compras-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Mis Compras', path: '/mis-compras' }]}
        title="Mis Compras"
        subtitle="Historial de tus pedidos y facturas"
      />

      <div className="container py-5">

        {/* Stats */}
        <div className="compras-stats">
          {[
            { label: 'Total Pedidos', value: stats.total, icon: 'fa-shopping-bag', color: '#6366f1' },
            { label: 'Pagados', value: stats.pagadas, icon: 'fa-check-circle', color: '#28a745' },
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

        {/* Lista de facturas */}
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
              return (
                <div key={factura.numero_factura} className={`compra-card ${cfg.class}`}>
                  <div className="compra-card-header">
                    <div className="compra-numero">
                      <i className="fas fa-file-invoice me-2"></i>
                      <span>{factura.numero_factura}</span>
                    </div>
                    <span className={`compra-estado ${cfg.class}`}>
                      <i className={`fas ${cfg.icon} me-1`}></i>
                      {cfg.label}
                    </span>
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
