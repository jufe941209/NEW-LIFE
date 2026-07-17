import React, { useState, useEffect } from 'react'
import despachoService from '../../../services/despachoService'
import domiciliarioService from '../../../services/domiciliarioService'
import responsableService from '../../../services/responsableService'
import facturaService from '../../../services/facturaService'
import clienteService from '../../../services/clienteService'
import detalleFacturaService from '../../../services/detalleFacturaService'
import productoService from '../../../services/productoService'
import transporteService from '../../../services/transporteService'
import { imprimirFactura } from '../../../utils/imprimirFactura'
import '../../Responsable/ResponsableDashboard.css'

const ESTADOS = ['Pendiente', 'En camino', 'Enviado', 'Entregado', 'Cancelado']

const estadoMeta = {
  Pendiente:   { color: '#6b7280', bg: '#f3f4f6', icon: 'fa-clock' },
  'En camino': { color: '#3b82f6', bg: '#eff6ff', icon: 'fa-truck' },
  Enviado:     { color: '#f59e0b', bg: '#fffbeb', icon: 'fa-paper-plane' },
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

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDT   = (v) => v ? new Date(v).toLocaleString('es-CO',  { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

const DespachoView = () => {
  const [despachos, setDespachos]       = useState([])
  const [domiciliarios, setDomiciliarios] = useState([])
  const [responsables, setResponsables]  = useState([])
  const [facturas, setFacturas]          = useState([])
  const [clientesMap, setClientesMap]    = useState({})
  const [productosMap, setProductosMap]  = useState({})
  const [transporteMap, setTransporteMap] = useState({})
  const [loading, setLoading]            = useState(true)
  const [filter, setFilter]              = useState('')
  const [filterEstado, setFilterEstado]  = useState('')
  const [printingFac, setPrintingFac]    = useState(null)
  const [deletingId, setDeletingId]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [assignModal, setAssignModal]    = useState(null)
  const [selectedDomi, setSelectedDomi]  = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [d, dom, resp, fac, clis, prods, transList] = await Promise.all([
        despachoService.getAll().catch(() => []),
        domiciliarioService.getAll().catch(() => []),
        responsableService.getAll().catch(() => []),
        facturaService.getAll().catch(() => []),
        clienteService.getAll().catch(() => []),
        productoService.getAll().catch(() => []),
        transporteService.getAll().catch(() => []),
      ])
      setDespachos(Array.isArray(d) ? d : [])
      setDomiciliarios(Array.isArray(dom) ? dom : [])
      setResponsables(Array.isArray(resp) ? resp : [])
      setFacturas(Array.isArray(fac) ? fac : [])
      const cm = {}; if (Array.isArray(clis))  clis.forEach(c  => { cm[c.numero_identificacion] = c })
      setClientesMap(cm)
      const pm = {}; if (Array.isArray(prods)) prods.forEach(p  => { pm[p.codigo_prod] = p })
      setProductosMap(pm)
      const tm = {}; if (Array.isArray(transList)) transList.forEach(t => { tm[t.cedula_domi] = t })
      setTransporteMap(tm)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getNombreDomi = (cc) => domiciliarios.find(d => d.cedula_domi === cc)?.nombres || cc || '—'
  const getNombreResp = (cc) => responsables.find(r => r.cedula_resp === cc)?.nombres || cc || '—'
  const getFactura    = (num) => facturas.find(f => f.numero_factura === num)
  const domiDisponibles = domiciliarios.filter(d => d.disponibilidad === 'Disponible' && d.estado !== 'Inactivo')

  const handleImprimirFactura = async (factura) => {
    setPrintingFac(factura.numero_factura)
    try {
      const detalles = await detalleFacturaService.getByFactura(factura.numero_factura).catch(() => [])
      const clienteData = clientesMap[factura.cedula_cli] || null
      imprimirFactura(factura, Array.isArray(detalles) ? detalles : [], productosMap, clienteData)
    } finally { setPrintingFac(null) }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await despachoService.remove(id)
      setDespachos(prev => prev.filter(d => d.numero_despacho !== id))
    } catch {
      alert('No se pudo eliminar el despacho.')
    } finally { setDeletingId(null); setConfirmDelete(null) }
  }

  const changeEstado = async (despacho, nuevoEstado, domiOverride = null) => {
    const domiCC = domiOverride || despacho.cc_domiciliario || ''
    if ((nuevoEstado === 'En camino' || nuevoEstado === 'Entregado') && !domiCC) {
      const domiList = nuevoEstado === 'Entregado'
        ? domiciliarios.filter(d => d.estado !== 'Inactivo')
        : domiDisponibles
      setAssignModal({ despacho, nuevoEstado })
      setSelectedDomi(domiList[0]?.cedula_domi || '')
      return
    }
    setActionLoading(despacho.numero_despacho)
    try {
      const now = new Date().toISOString().slice(0, -1)
      await despachoService.update(despacho.numero_despacho, {
        ...despacho,
        cc_domiciliario: domiCC,
        estado: nuevoEstado,
        fecha_aprobacion: nuevoEstado === 'En camino' ? (despacho.fecha_aprobacion || now) : despacho.fecha_aprobacion,
        fecha_entrega:    nuevoEstado === 'Entregado'  ? now : despacho.fecha_entrega,
      })
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'Error al actualizar el despacho')
    } finally { setActionLoading(null) }
  }

  const confirmAssign = async () => {
    if (!selectedDomi || !assignModal) return
    const { despacho, nuevoEstado } = assignModal
    setAssignModal(null)
    await changeEstado(despacho, nuevoEstado, selectedDomi)
  }

  const counts = {
    Pendiente:   despachos.filter(d => !d.estado || d.estado === 'Pendiente').length,
    'En camino': despachos.filter(d => d.estado === 'En camino').length,
    Enviado:     despachos.filter(d => d.estado === 'Enviado').length,
    Entregado:   despachos.filter(d => d.estado === 'Entregado').length,
    Cancelado:   despachos.filter(d => d.estado === 'Cancelado').length,
  }

  const filtered = despachos.filter(d => {
    const mf = !filter ||
      String(d.numero_despacho).includes(filter) ||
      (d.numero_factura || '').toLowerCase().includes(filter.toLowerCase()) ||
      (d.cc_responsable  || '').toLowerCase().includes(filter.toLowerCase()) ||
      (d.cc_domiciliario || '').toLowerCase().includes(filter.toLowerCase())
    const me = !filterEstado || (d.estado || 'Pendiente') === filterEstado
    return mf && me
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.85rem' }}>
        {Object.entries(counts).map(([estado, count]) => {
          const m = estadoMeta[estado]
          return (
            <div
              key={estado}
              onClick={() => setFilterEstado(prev => prev === estado ? '' : estado)}
              style={{
                background: '#fff', borderRadius: 12, padding: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                borderLeft: `4px solid ${m.color}`, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                outline: filterEstado === estado ? `2px solid ${m.color}` : 'none',
                outlineOffset: 2,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: m.bg, color: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0
              }}>
                <i className={`fas ${m.icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: 2 }}>{estado}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Filters ── */}
      <div className="resp-filters">
        <div className="resp-search-wrap">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por # despacho, factura, responsable..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="resp-search-input"
          />
        </div>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="resp-filter-select"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button className="resp-refresh-btn" onClick={load}>
          <i className="fas fa-sync-alt me-1"></i>Actualizar
        </button>
        <span style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {filtered.length} despacho{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Card grid ── */}
      {loading ? (
        <div className="resp-loading">
          <div className="spinner-border text-primary"></div>
          <p>Cargando despachos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="resp-empty"><i className="fas fa-box-open me-2"></i>No hay despachos que coincidan.</p>
      ) : (
        <div className="resp-despacho-grid">
          {filtered.map(d => {
            const m        = estadoMeta[d.estado || 'Pendiente']
            const factura  = getFactura(d.numero_factura)
            const cliente  = factura ? clientesMap[factura.cedula_cli] : null
            const busy     = actionLoading === d.numero_despacho
            const isTerminal = d.estado === 'Entregado' || d.estado === 'Cancelado'
            const sinDomi  = !d.cc_domiciliario

            return (
              <div key={d.numero_despacho} className="resp-despacho-card">

                {/* Header */}
                <div className="resp-desp-header" style={{ borderColor: m.color }}>
                  <div className="resp-desp-num">
                    <span>Despacho</span>
                    <strong>#{d.numero_despacho}</strong>
                  </div>
                  <EstadoBadge estado={d.estado || 'Pendiente'} />
                  {/* Delete */}
                  {confirmDelete === d.numero_despacho ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
                      <button
                        onClick={() => handleDelete(d.numero_despacho)}
                        disabled={deletingId === d.numero_despacho}
                        style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {deletingId === d.numero_despacho ? <span className="spinner-border spinner-border-sm"></span> : '✓ Sí'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(d.numero_despacho)}
                      title="Eliminar despacho"
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px', borderRadius: 6, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="resp-desp-body">
                  <div className="resp-desp-row">
                    <i className="fas fa-file-invoice me-2 text-muted"></i>
                    <span>Factura: <strong>{d.numero_factura || '—'}</strong></span>
                  </div>
                  {cliente && (
                    <div className="resp-desp-row">
                      <i className="fas fa-user me-2 text-muted"></i>
                      <span>Cliente: <strong>{cliente.nombres}</strong></span>
                    </div>
                  )}
                  {factura?.metodo_pago && (
                    <div className="resp-desp-row">
                      <i className="fas fa-credit-card me-2 text-muted"></i>
                      <span>Pago: <strong>{factura.metodo_pago}</strong></span>
                    </div>
                  )}
                  <div className="resp-desp-row">
                    <i className="fas fa-user-tie me-2 text-muted"></i>
                    <span>Responsable: <strong>{d.cc_responsable ? getNombreResp(d.cc_responsable) : <span style={{ color: '#94a3b8' }}>Sin asignar</span>}</strong></span>
                  </div>
                  <div className="resp-desp-row">
                    <i className="fas fa-motorcycle me-2 text-muted"></i>
                    {sinDomi
                      ? <span style={{ color: '#f59e0b', fontWeight: 600 }}><i className="fas fa-exclamation-triangle me-1"></i>Sin domiciliario asignado</span>
                      : <span>Domiciliario: <strong>{getNombreDomi(d.cc_domiciliario)}</strong></span>
                    }
                  </div>
                  <div className="resp-desp-dates">
                    <div className="resp-desp-date-item">
                      <span className="resp-desp-date-lbl">Despacho</span>
                      <span className="resp-desp-date-val">{fmtDate(d.fecha_despacho)}</span>
                    </div>
                    <div className="resp-desp-date-item">
                      <span className="resp-desp-date-lbl">Aprobación</span>
                      <span className="resp-desp-date-val">{fmtDT(d.fecha_aprobacion)}</span>
                    </div>
                    {d.fecha_entrega && (
                      <div className="resp-desp-date-item">
                        <span className="resp-desp-date-lbl">Entregado</span>
                        <span className="resp-desp-date-val" style={{ color: '#22c55e' }}>{fmtDT(d.fecha_entrega)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isTerminal && (
                  <div className="resp-desp-actions">
                    {d.estado === 'En camino' && sinDomi && (
                      <button
                        className="resp-action-btn"
                        style={{ background: '#f59e0b', color: '#fff' }}
                        onClick={() => { setAssignModal({ despacho: d, nuevoEstado: 'En camino' }); setSelectedDomi(domiDisponibles[0]?.cedula_domi || '') }}
                        disabled={busy}
                      >
                        <i className="fas fa-exclamation-triangle me-1"></i>Asignar domiciliario
                      </button>
                    )}
                    {(!d.estado || d.estado === 'Pendiente') && (
                      <button
                        className="resp-action-btn resp-btn-aprobar"
                        onClick={() => changeEstado(d, 'En camino')}
                        disabled={busy}
                      >
                        {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-truck me-1"></i>Aprobar y despachar</>}
                      </button>
                    )}
                    {d.estado === 'En camino' && (
                      <button
                        className="resp-action-btn"
                        style={{ background: '#f59e0b', color: '#fff' }}
                        onClick={() => changeEstado(d, 'Enviado')}
                        disabled={busy}
                      >
                        {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-paper-plane me-1"></i>Enviado</>}
                      </button>
                    )}
                    {d.estado === 'Enviado' && (
                      <button
                        className="resp-action-btn resp-btn-entregar"
                        onClick={() => changeEstado(d, 'Entregado')}
                        disabled={busy}
                      >
                        {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check me-1"></i>Confirmar entrega</>}
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

                {/* Terminal state */}
                {isTerminal && (
                  <div className="resp-desp-terminal">
                    <i className={`fas ${d.estado === 'Entregado' ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} me-2`}></i>
                    <span>{d.estado === 'Entregado' ? 'Pedido completado' : 'Despacho cancelado'}</span>
                  </div>
                )}

                {/* Print factura */}
                {factura && (
                  <div style={{ padding: '0.5rem 1rem 0.75rem', borderTop: isTerminal ? 'none' : '1px solid #f1f5f9' }}>
                    <button
                      className="resp-pdf-btn"
                      style={{ width: '100%', justifyContent: 'center', gap: 6 }}
                      onClick={() => handleImprimirFactura(factura)}
                      disabled={printingFac === factura.numero_factura}
                    >
                      {printingFac === factura.numero_factura
                        ? <><span className="spinner-border spinner-border-sm"></span> Preparando...</>
                        : <><i className="fas fa-print me-1"></i>Imprimir factura {factura.numero_factura}</>
                      }
                    </button>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal asignar domiciliario ── */}
      {assignModal && (
        <div className="resp-assign-overlay" onClick={() => setAssignModal(null)}>
          <div className="resp-assign-modal" onClick={e => e.stopPropagation()}>
            <div className="resp-assign-header">
              <div className="resp-assign-icon"><i className="fas fa-motorcycle"></i></div>
              <div>
                <h3>Asignar domiciliario</h3>
                <p>Despacho <strong>#{assignModal.despacho.numero_despacho}</strong></p>
              </div>
              <button className="resp-assign-close" onClick={() => setAssignModal(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="resp-assign-body">
              {assignModal.nuevoEstado === 'Entregado' ? (
                <div className="resp-assign-alert" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#15803d' }}>
                  <i className="fas fa-check-circle me-2"></i>
                  Selecciona el domiciliario que realizó la entrega para registrar el pedido como completado.
                </div>
              ) : (
                <div className="resp-assign-alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Para aprobar y despachar es obligatorio asignar un domiciliario.
                </div>
              )}
              <label className="resp-assign-label">
                {assignModal.nuevoEstado === 'Entregado' ? 'Confirmar domiciliario de entrega' : 'Seleccionar domiciliario disponible'}
              </label>
              {(() => {
                const domiList = assignModal.nuevoEstado === 'Entregado'
                  ? domiciliarios.filter(d => d.estado !== 'Inactivo')
                  : domiDisponibles
                if (domiList.length === 0) return (
                  <p className="resp-assign-empty"><i className="fas fa-times-circle me-2"></i>No hay domiciliarios disponibles.</p>
                )
                return (
                  <>
                    <select
                      className="resp-assign-select"
                      value={selectedDomi}
                      onChange={e => setSelectedDomi(e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {domiList.map(d => {
                        const t = transporteMap[d.cedula_domi]
                        return (
                          <option key={d.cedula_domi} value={d.cedula_domi}>
                            {d.nombres}{t ? ` — ${t.tipo} ${t.placa}` : ' — Sin vehículo'}{d.disponibilidad !== 'Disponible' ? ' (ocupado)' : ''}
                          </option>
                        )
                      })}
                    </select>
                    {selectedDomi && (() => {
                      const domi = domiList.find(d => d.cedula_domi === selectedDomi)
                      const t = transporteMap[selectedDomi]
                      if (!domi) return null
                      return (
                        <div style={{ marginTop: '0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                            <i className="fas fa-user me-2"></i>{domi.nombres}
                          </div>
                          {t ? (
                            <div style={{ color: '#374151', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <span><i className="fas fa-truck me-1 text-success"></i><strong>{t.tipo}</strong> — Placa: <strong>{t.placa}</strong></span>
                              {t.descripcion && <span style={{ color: '#6b7280' }}>{t.descripcion}</span>}
                            </div>
                          ) : (
                            <div style={{ color: '#f59e0b' }}><i className="fas fa-exclamation-triangle me-1"></i>Sin vehículo registrado</div>
                          )}
                        </div>
                      )
                    })()}
                  </>
                )
              })()}
            </div>
            <div className="resp-assign-footer">
              <button className="resp-assign-btn-cancel" onClick={() => setAssignModal(null)}>Cancelar</button>
              <button
                className="resp-assign-btn-confirm"
                onClick={confirmAssign}
                disabled={!selectedDomi}
              >
                <i className={`fas ${assignModal.nuevoEstado === 'Entregado' ? 'fa-check' : 'fa-truck'} me-1`}></i>
                {assignModal.nuevoEstado === 'Entregado' ? 'Marcar entregado' : 'Aprobar y despachar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DespachoView
