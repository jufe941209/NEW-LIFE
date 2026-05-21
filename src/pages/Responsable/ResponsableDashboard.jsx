import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import despachoService from '../../services/despachoService'
import domiciliarioService from '../../services/domiciliarioService'
import facturaService from '../../services/facturaService'
import './ResponsableDashboard.css'

const ESTADOS = ['Pendiente', 'En camino', 'Entregado', 'Cancelado']

const estadoMeta = {
  Pendiente:   { color: '#6b7280', bg: '#f3f4f6', icon: 'fa-clock' },
  'En camino': { color: '#3b82f6', bg: '#eff6ff', icon: 'fa-truck' },
  Entregado:   { color: '#22c55e', bg: '#f0fdf4', icon: 'fa-check-circle' },
  Cancelado:   { color: '#ef4444', bg: '#fff5f5', icon: 'fa-times-circle' },
}

const EstadoBadge = ({ estado }) => {
  const m = estadoMeta[estado] || estadoMeta['Pendiente']
  return (
    <span className="resp-estado-badge" style={{ color: m.color, background: m.bg }}>
      <i className={`fas ${m.icon} me-1`}></i>{estado}
    </span>
  )
}

const ResponsableDashboard = () => {
  const { responsable, logoutResponsable } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState('dashboard')
  const [despachos, setDespachos] = useState([])
  const [domiciliarios, setDomiciliarios] = useState([])
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  // Modal para asignar domiciliario obligatorio
  const [assignModal, setAssignModal] = useState(null) // { despacho, nuevoEstado }
  const [selectedDomi, setSelectedDomi] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [d, dom, fac] = await Promise.all([
        despachoService.getAll().catch(() => []),
        domiciliarioService.getAll().catch(() => []),
        facturaService.getAll().catch(() => []),
      ])
      const dlist = Array.isArray(d) ? d : []
      const domList = Array.isArray(dom) ? dom : []
      const facList = Array.isArray(fac) ? fac : []

      // Auto-fix: despachos "En camino"/"Entregado" sin domiciliario asignado
      const sinDomi = dlist.filter(x =>
        (x.estado === 'En camino' || x.estado === 'Entregado') && !x.cc_domiciliario
      )
      if (sinDomi.length > 0) {
        const primerDomi = domList.find(x => x.disponibilidad === 'Disponible' && x.estado !== 'Inactivo')
        if (primerDomi) {
          await Promise.all(
            sinDomi.map(x =>
              despachoService.update(x.numero_despacho, {
                ...x,
                cc_domiciliario: primerDomi.cedula_domi,
              }).catch(() => {})
            )
          )
          const fixed = await despachoService.getAll().catch(() => dlist)
          setDespachos(Array.isArray(fixed) ? fixed : dlist)
          setDomiciliarios(domList)
          setFacturas(facList)
          return
        }
      }

      setDespachos(dlist)
      setDomiciliarios(domList)
      setFacturas(facList)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleLogout = () => { logoutResponsable(); navigate('/login-responsable') }

  const getNombreDomi = (cc) => domiciliarios.find(d => d.cedula_domi === cc)?.nombres || cc || '—'
  const getFactura = (num) => facturas.find(f => f.numero_factura === num)

  const domiDisponibles = domiciliarios.filter(d => d.disponibilidad === 'Disponible' && d.estado !== 'Inactivo')

  const changeEstado = async (despacho, nuevoEstado, domiOverride = null) => {
    const domiCC = domiOverride || despacho.cc_domiciliario

    // Domiciliario obligatorio para En camino y Entregado
    if ((nuevoEstado === 'En camino' || nuevoEstado === 'Entregado') && !domiCC) {
      setAssignModal({ despacho, nuevoEstado })
      setSelectedDomi(domiDisponibles[0]?.cedula_domi || '')
      return
    }

    setActionLoading(despacho.numero_despacho)
    try {
      const now = new Date().toISOString()
      const payload = {
        ...despacho,
        cc_domiciliario: domiCC,
        estado: nuevoEstado,
        fecha_aprobacion: nuevoEstado === 'En camino'
          ? (despacho.fecha_aprobacion || now)
          : despacho.fecha_aprobacion,
        fecha_entrega: nuevoEstado === 'Entregado' ? now : despacho.fecha_entrega,
      }
      await despachoService.update(despacho.numero_despacho, payload)
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'Error al actualizar el estado')
    } finally { setActionLoading(null) }
  }

  const confirmAssignAndApprove = async () => {
    if (!selectedDomi || !assignModal) return
    const { despacho, nuevoEstado } = assignModal
    setAssignModal(null)
    await changeEstado(despacho, nuevoEstado, selectedDomi)
  }

  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const fmtDateTime = (val) => val ? new Date(val).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  const misDespachos = despachos.filter(d => d.cc_responsable === responsable?.cedula_resp)
  const counts = {
    Pendiente: despachos.filter(d => !d.estado || d.estado === 'Pendiente').length,
    'En camino': despachos.filter(d => d.estado === 'En camino').length,
    Entregado: despachos.filter(d => d.estado === 'Entregado').length,
    Cancelado: despachos.filter(d => d.estado === 'Cancelado').length,
  }

  const filteredDespachos = despachos.filter(d => {
    const matchFilter = !filter || (d.numero_factura || '').includes(filter) || String(d.numero_despacho).includes(filter)
    const matchEstado = !filterEstado || (d.estado || 'Pendiente') === filterEstado
    return matchFilter && matchEstado
  })

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { key: 'despachos', label: 'Despachos', icon: 'fas fa-shipping-fast' },
  ]

  return (
    <div className="resp-layout">
      {/* Sidebar */}
      <aside className="resp-sidebar">
        <div className="resp-sidebar-brand">
          <div className="resp-brand-logo"><i className="fas fa-leaf"></i></div>
          <h2>NEW LIFE</h2>
          <p>Portal Responsables</p>
        </div>
        <nav className="resp-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`resp-nav-item ${section === item.key ? 'active' : ''}`}
              onClick={() => setSection(item.key)}
            >
              <i className={`${item.icon} resp-nav-icon`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="resp-sidebar-footer">
          <div className="resp-user-info">
            <div className="resp-user-avatar"><i className="fas fa-user-tie"></i></div>
            <div className="resp-user-details">
              <span className="resp-user-name">{responsable?.nombres}</span>
              <span className="resp-user-role">Responsable</span>
            </div>
          </div>
          <button className="resp-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="resp-content">
        <header className="resp-topbar">
          <div>
            <h2 className="resp-page-title">
              {section === 'dashboard' ? 'Dashboard' : 'Gestión de Despachos'}
            </h2>
            <p className="resp-page-sub">
              Bienvenido, <strong>{responsable?.nombres}</strong>
            </p>
          </div>
          <div className="resp-topbar-date">
            <i className="fas fa-calendar-alt me-2"></i>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main className="resp-main">
          {section === 'dashboard' && (
            <div className="resp-dashboard-home">
              <div className="resp-stats-grid">
                {Object.entries(counts).map(([estado, count]) => {
                  const m = estadoMeta[estado]
                  return (
                    <div
                      key={estado}
                      className="resp-stat-card"
                      style={{ borderColor: m.color }}
                      onClick={() => { setSection('despachos'); setFilterEstado(estado) }}
                    >
                      <div className="resp-stat-icon" style={{ background: m.bg, color: m.color }}>
                        <i className={`fas ${m.icon}`}></i>
                      </div>
                      <div className="resp-stat-body">
                        <span className="resp-stat-num" style={{ color: m.color }}>{count}</span>
                        <span className="resp-stat-label">{estado}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="resp-section-card">
                <div className="resp-section-card-header">
                  <h4><i className="fas fa-user-check me-2"></i>Mis despachos asignados</h4>
                  <span className="resp-badge-count">{misDespachos.length}</span>
                </div>
                {loading ? (
                  <div className="resp-loading"><div className="spinner-border text-primary"></div></div>
                ) : misDespachos.length === 0 ? (
                  <p className="resp-empty"><i className="fas fa-inbox me-2"></i>No tienes despachos asignados.</p>
                ) : (
                  <div className="resp-mini-table-wrap">
                    <table className="resp-mini-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Factura</th><th>Estado</th><th>Domiciliario</th><th>Fecha despacho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {misDespachos.slice(0, 6).map(d => (
                          <tr key={d.numero_despacho}>
                            <td><strong>#{d.numero_despacho}</strong></td>
                            <td>{d.numero_factura}</td>
                            <td><EstadoBadge estado={d.estado || 'Pendiente'} /></td>
                            <td>{getNombreDomi(d.cc_domiciliario)}</td>
                            <td>{fmtDate(d.fecha_despacho)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button className="resp-ver-todos" onClick={() => setSection('despachos')}>
                  Ver todos los despachos <i className="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}

          {section === 'despachos' && (
            <div className="resp-despachos-section">
              <div className="resp-filters">
                <div className="resp-search-wrap">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Buscar por factura o número..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="resp-search-input"
                  />
                </div>
                <select
                  className="resp-filter-select"
                  value={filterEstado}
                  onChange={e => setFilterEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <button className="resp-refresh-btn" onClick={load}>
                  <i className="fas fa-sync-alt me-1"></i>Actualizar
                </button>
              </div>

              {loading ? (
                <div className="resp-loading"><div className="spinner-border text-primary"></div><p>Cargando despachos...</p></div>
              ) : (
                <div className="resp-despacho-grid">
                  {filteredDespachos.length === 0 ? (
                    <p className="resp-empty"><i className="fas fa-box-open me-2"></i>No hay despachos que coincidan.</p>
                  ) : (
                    filteredDespachos.map(d => {
                      const m = estadoMeta[d.estado || 'Pendiente']
                      const factura = getFactura(d.numero_factura)
                      const isMe = d.cc_responsable === responsable?.cedula_resp
                      const busy = actionLoading === d.numero_despacho
                      const sinDomiciliario = !d.cc_domiciliario
                      return (
                        <div key={d.numero_despacho} className={`resp-despacho-card ${isMe ? 'resp-despacho-mine' : ''}`}>
                          <div className="resp-desp-header" style={{ borderColor: m.color }}>
                            <div className="resp-desp-num">
                              <span>Despacho</span>
                              <strong>#{d.numero_despacho}</strong>
                            </div>
                            <EstadoBadge estado={d.estado || 'Pendiente'} />
                            {isMe && <span className="resp-desp-mine-tag"><i className="fas fa-star me-1"></i>Mío</span>}
                          </div>

                          <div className="resp-desp-body">
                            <div className="resp-desp-row">
                              <i className="fas fa-file-invoice me-2 text-muted"></i>
                              <span>Factura: <strong>{d.numero_factura}</strong></span>
                            </div>
                            {factura && (
                              <div className="resp-desp-row">
                                <i className="fas fa-user me-2 text-muted"></i>
                                <span>Cliente: <strong>{factura.cedula_cli}</strong></span>
                              </div>
                            )}
                            {factura?.metodo_pago && (
                              <div className="resp-desp-row">
                                <i className="fas fa-credit-card me-2 text-muted"></i>
                                <span>Pago: <strong>{factura.metodo_pago}</strong></span>
                              </div>
                            )}
                            <div className="resp-desp-row">
                              <i className="fas fa-motorcycle me-2 text-muted"></i>
                              {sinDomiciliario ? (
                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                                  <i className="fas fa-exclamation-triangle me-1"></i>Sin domiciliario asignado
                                </span>
                              ) : (
                                <span>Domiciliario: <strong>{getNombreDomi(d.cc_domiciliario)}</strong></span>
                              )}
                            </div>
                            <div className="resp-desp-dates">
                              <div className="resp-desp-date-item">
                                <span className="resp-desp-date-lbl">Despacho</span>
                                <span className="resp-desp-date-val">{fmtDate(d.fecha_despacho)}</span>
                              </div>
                              <div className="resp-desp-date-item">
                                <span className="resp-desp-date-lbl">Aprobación</span>
                                <span className="resp-desp-date-val">{fmtDateTime(d.fecha_aprobacion)}</span>
                              </div>
                              {d.fecha_entrega && (
                                <div className="resp-desp-date-item">
                                  <span className="resp-desp-date-lbl">Entregado</span>
                                  <span className="resp-desp-date-val" style={{ color: '#22c55e' }}>{fmtDateTime(d.fecha_entrega)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {d.estado !== 'Entregado' && d.estado !== 'Cancelado' && (
                            <div className="resp-desp-actions">
                              {(!d.estado || d.estado === 'Pendiente') && (
                                <button
                                  className="resp-action-btn resp-btn-aprobar"
                                  onClick={() => changeEstado(d, 'En camino')}
                                  disabled={busy}
                                >
                                  {busy
                                    ? <span className="spinner-border spinner-border-sm"></span>
                                    : <><i className="fas fa-truck me-1"></i>Aprobar y despachar</>
                                  }
                                </button>
                              )}
                              {d.estado === 'En camino' && (
                                <button
                                  className="resp-action-btn resp-btn-entregar"
                                  onClick={() => changeEstado(d, 'Entregado')}
                                  disabled={busy}
                                >
                                  {busy
                                    ? <span className="spinner-border spinner-border-sm"></span>
                                    : <><i className="fas fa-check me-1"></i>Marcar entregado</>
                                  }
                                </button>
                              )}
                              <button
                                className="resp-action-btn resp-btn-cancelar"
                                onClick={() => changeEstado(d, 'Cancelado')}
                                disabled={busy}
                              >
                                <i className="fas fa-times me-1"></i>Cancelar
                              </button>
                            </div>
                          )}

                          {(d.estado === 'Entregado' || d.estado === 'Cancelado') && (
                            <div className="resp-desp-terminal">
                              <i className={`fas ${d.estado === 'Entregado' ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} me-2`}></i>
                              <span>{d.estado === 'Entregado' ? 'Pedido completado' : 'Despacho cancelado'}</span>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal: asignar domiciliario obligatorio */}
      {assignModal && (
        <div className="resp-assign-overlay" onClick={() => setAssignModal(null)}>
          <div className="resp-assign-modal" onClick={e => e.stopPropagation()}>
            <div className="resp-assign-header">
              <div className="resp-assign-icon">
                <i className="fas fa-motorcycle"></i>
              </div>
              <div>
                <h3>Asignar domiciliario</h3>
                <p>Despacho <strong>#{assignModal.despacho.numero_despacho}</strong></p>
              </div>
              <button className="resp-assign-close" onClick={() => setAssignModal(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="resp-assign-body">
              <div className="resp-assign-alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Para aprobar y despachar es obligatorio asignar un domiciliario.
              </div>

              <label className="resp-assign-label">Seleccionar domiciliario disponible</label>
              {domiDisponibles.length === 0 ? (
                <p className="resp-assign-empty">
                  <i className="fas fa-times-circle me-2"></i>
                  No hay domiciliarios disponibles en este momento.
                </p>
              ) : (
                <select
                  className="resp-assign-select"
                  value={selectedDomi}
                  onChange={e => setSelectedDomi(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {domiDisponibles.map(d => (
                    <option key={d.cedula_domi} value={d.cedula_domi}>
                      {d.nombres} — Cédula: {d.cedula_domi}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="resp-assign-footer">
              <button className="resp-assign-btn-cancel" onClick={() => setAssignModal(null)}>
                Cancelar
              </button>
              <button
                className="resp-assign-btn-confirm"
                onClick={confirmAssignAndApprove}
                disabled={!selectedDomi}
              >
                <i className="fas fa-truck me-1"></i>
                {assignModal.nuevoEstado === 'En camino' ? 'Aprobar y despachar' : 'Marcar entregado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponsableDashboard
