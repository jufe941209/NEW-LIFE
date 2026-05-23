import React, { useState, useEffect } from 'react'
import despachoService from '../../../services/despachoService'
import domiciliarioService from '../../../services/domiciliarioService'
import responsableService from '../../../services/responsableService'
import facturaService from '../../../services/facturaService'
import clienteService from '../../../services/clienteService'
import detalleFacturaService from '../../../services/detalleFacturaService'
import productoService from '../../../services/productoService'
import { imprimirFactura } from '../../../utils/imprimirFactura'

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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontWeight: 600,
      fontSize: '0.78rem', color: m.color, background: m.bg
    }}>
      <i className={`fas ${m.icon}`}></i> {estado}
    </span>
  )
}

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDT = (v) => v ? new Date(v).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

const DespachoView = () => {
  const [despachos, setDespachos] = useState([])
  const [domiciliarios, setDomiciliarios] = useState([])
  const [responsables, setResponsables] = useState([])
  const [facturas, setFacturas] = useState([])
  const [clientesMap, setClientesMap] = useState({})
  const [productosMap, setProductosMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [printingFac, setPrintingFac] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Action state
  const [actionLoading, setActionLoading] = useState(null)
  const [approveModal, setApproveModal] = useState(null) // { despacho, nuevoEstado }
  const [selectedDomi, setSelectedDomi] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [d, dom, resp, fac, clis, prods] = await Promise.all([
        despachoService.getAll().catch(() => []),
        domiciliarioService.getAll().catch(() => []),
        responsableService.getAll().catch(() => []),
        facturaService.getAll().catch(() => []),
        clienteService.getAll().catch(() => []),
        productoService.getAll().catch(() => []),
      ])
      setDespachos(Array.isArray(d) ? d : [])
      setDomiciliarios(Array.isArray(dom) ? dom : [])
      setResponsables(Array.isArray(resp) ? resp : [])
      setFacturas(Array.isArray(fac) ? fac : [])
      const cm = {}
      if (Array.isArray(clis)) clis.forEach(c => { cm[c.numero_identificacion] = c })
      setClientesMap(cm)
      const pm = {}
      if (Array.isArray(prods)) prods.forEach(p => { pm[p.codigo_prod] = p })
      setProductosMap(pm)
    } finally { setLoading(false) }
  }

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
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const changeEstado = async (despacho, nuevoEstado, domiOverride = null) => {
    const domiCC = domiOverride || despacho.cc_domiciliario || ''
    if ((nuevoEstado === 'En camino' || nuevoEstado === 'Entregado') && !domiCC) {
      setApproveModal({ despacho, nuevoEstado })
      const domiList = nuevoEstado === 'Entregado'
        ? domiciliarios.filter(d => d.estado !== 'Inactivo')
        : domiciliarios.filter(d => d.disponibilidad === 'Disponible' && d.estado !== 'Inactivo')
      setSelectedDomi(domiList[0]?.cedula_domi || '')
      return
    }
    setActionLoading(despacho.numero_despacho)
    try {
      const now = new Date().toISOString()
      await despachoService.update(despacho.numero_despacho, {
        ...despacho,
        cc_domiciliario: domiCC,
        estado: nuevoEstado,
        fecha_aprobacion: nuevoEstado === 'En camino' ? (despacho.fecha_aprobacion || now) : despacho.fecha_aprobacion,
        fecha_entrega: nuevoEstado === 'Entregado' ? now : despacho.fecha_entrega,
      })
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'Error al actualizar el despacho')
    } finally { setActionLoading(null) }
  }

  const confirmApprove = async () => {
    if (!selectedDomi || !approveModal) return
    const { despacho, nuevoEstado } = approveModal
    setApproveModal(null)
    await changeEstado(despacho, nuevoEstado, selectedDomi)
  }

  useEffect(() => { load() }, [])

  const getNombre = (arr, key, val) => arr.find(x => x[key] === val)?.nombres || val || '—'

  const counts = {
    Pendiente: despachos.filter(d => !d.estado || d.estado === 'Pendiente').length,
    'En camino': despachos.filter(d => d.estado === 'En camino').length,
    Entregado: despachos.filter(d => d.estado === 'Entregado').length,
    Cancelado: despachos.filter(d => d.estado === 'Cancelado').length,
  }

  const filtered = despachos.filter(d => {
    const mf = !filter ||
      String(d.numero_despacho).includes(filter) ||
      (d.numero_factura || '').toLowerCase().includes(filter.toLowerCase()) ||
      (d.cc_responsable || '').includes(filter) ||
      (d.cc_domiciliario || '').includes(filter)
    const me = !filterEstado || (d.estado || 'Pendiente') === filterEstado
    return mf && me
  })

  const domiDisponibles = domiciliarios.filter(d => d.disponibilidad === 'Disponible' && d.estado !== 'Inactivo')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {Object.entries(counts).map(([estado, count]) => {
          const m = estadoMeta[estado]
          return (
            <div
              key={estado}
              onClick={() => setFilterEstado(prev => prev === estado ? '' : estado)}
              style={{
                background: '#fff', borderRadius: 12, padding: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.85rem',
                borderLeft: `4px solid ${m.color}`, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                outline: filterEstado === estado ? `2px solid ${m.color}` : 'none',
                outlineOffset: 2,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: m.bg, color: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0
              }}>
                <i className={`fas ${m.icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{estado}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '1rem 1.25rem',
        display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <i className="fas fa-search" style={{
            position: 'absolute', left: '0.8rem', top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem'
          }}></i>
          <input
            type="text"
            placeholder="Buscar por # despacho, factura, responsable..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.2rem',
              border: '1.5px solid #e2e8f0', borderRadius: 8,
              fontSize: '0.88rem', color: '#0f172a', outline: 'none'
            }}
          />
        </div>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          style={{
            padding: '0.6rem 0.9rem', border: '1.5px solid #e2e8f0',
            borderRadius: 8, fontSize: '0.88rem', color: '#0f172a',
            outline: 'none', background: '#fff', cursor: 'pointer'
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button
          onClick={load}
          style={{
            padding: '0.6rem 1rem', background: '#f1f5f9',
            border: '1.5px solid #e2e8f0', borderRadius: 8,
            fontSize: '0.85rem', fontWeight: 600, color: '#475569',
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          <i className="fas fa-sync-alt me-1"></i>Actualizar
        </button>
        <span style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {filtered.length} despacho{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div className="spinner-border text-primary me-2"></div>Cargando despachos...
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              <i className="fas fa-shipping-fast me-2 text-primary"></i>Todos los despachos
            </h4>
            <span style={{
              background: '#1e40af', color: '#fff', fontSize: '0.78rem',
              fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20
            }}>{despachos.length}</span>
          </div>

          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', margin: 0 }}>
              <i className="fas fa-box-open me-2"></i>No hay despachos que coincidan.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['#', 'Factura / Cliente', 'Estado', 'Responsable', 'Domiciliario', 'F. Despacho', 'F. Aprobación', 'F. Entrega', 'Acciones', ''].map(h => (
                      <th key={h} style={{
                        padding: '0.75rem 1rem', textAlign: 'left',
                        fontSize: '0.75rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        color: '#64748b', borderBottom: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    const factura = facturas.find(f => f.numero_factura === d.numero_factura)
                    const cliente = factura ? clientesMap[factura.cedula_cli] : null
                    const estado = d.estado || 'Pendiente'
                    const busy = actionLoading === d.numero_despacho
                    const isTerminal = estado === 'Entregado' || estado === 'Cancelado'
                    return (
                      <tr key={d.numero_despacho} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '0.75rem 1rem' }}><strong>#{d.numero_despacho}</strong></td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.numero_factura || '—'}</div>
                          {cliente && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{cliente.nombres}</div>}
                          {factura && !cliente && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{factura.cedula_cli}</div>}
                          {factura?.metodo_pago && <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{factura.metodo_pago}</div>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}><EstadoBadge estado={estado} /></td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                          {getNombre(responsables, 'cedula_resp', d.cc_responsable)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                          {d.cc_domiciliario
                            ? getNombre(domiciliarios, 'cedula_domi', d.cc_domiciliario)
                            : <span style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600 }}><i className="fas fa-exclamation-triangle me-1"></i>Sin asignar</span>
                          }
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{fmtDate(d.fecha_despacho)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{fmtDT(d.fecha_aprobacion)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: d.fecha_entrega ? '#22c55e' : '#64748b', fontWeight: d.fecha_entrega ? 600 : 400 }}>
                          {fmtDT(d.fecha_entrega)}
                        </td>
                        {/* Actions column */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {!isTerminal && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {factura && (
                                <button
                                  onClick={() => handleImprimirFactura(factura)}
                                  disabled={printingFac === factura.numero_factura}
                                  title="Imprimir PDF"
                                  style={{
                                    background: 'linear-gradient(135deg,#28a745,#20c997)', color: '#fff',
                                    border: 'none', padding: '4px 8px', borderRadius: 6,
                                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                                  }}
                                >
                                  {printingFac === factura.numero_factura
                                    ? <span className="spinner-border spinner-border-sm"></span>
                                    : <i className="fas fa-print"></i>
                                  }
                                </button>
                              )}
                              {(estado === 'Pendiente') && (
                                <button
                                  onClick={() => changeEstado(d, 'En camino')}
                                  disabled={busy}
                                  title="Aprobar y despachar"
                                  style={{
                                    background: '#3b82f6', color: '#fff',
                                    border: 'none', padding: '4px 8px', borderRadius: 6,
                                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-truck me-1"></i>Despachar</>}
                                </button>
                              )}
                              {estado === 'En camino' && (
                                <button
                                  onClick={() => changeEstado(d, 'Entregado')}
                                  disabled={busy}
                                  title="Marcar como entregado"
                                  style={{
                                    background: '#22c55e', color: '#fff',
                                    border: 'none', padding: '4px 8px', borderRadius: 6,
                                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check me-1"></i>Entregado</>}
                                </button>
                              )}
                              <button
                                onClick={() => changeEstado(d, 'Cancelado')}
                                disabled={busy}
                                title="Cancelar despacho"
                                style={{
                                  background: '#fff5f5', color: '#dc2626',
                                  border: '1px solid #fecaca', padding: '4px 8px', borderRadius: 6,
                                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <i className="fas fa-times me-1"></i>Cancelar
                              </button>
                            </div>
                          )}
                          {isTerminal && factura && (
                            <button
                              onClick={() => handleImprimirFactura(factura)}
                              disabled={printingFac === factura.numero_factura}
                              style={{
                                background: 'linear-gradient(135deg,#28a745,#20c997)', color: '#fff',
                                border: 'none', padding: '4px 8px', borderRadius: 6,
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              {printingFac === factura.numero_factura
                                ? <span className="spinner-border spinner-border-sm"></span>
                                : <i className="fas fa-print"></i>
                              }
                            </button>
                          )}
                        </td>
                        {/* Delete column */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {confirmDelete === d.numero_despacho ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <button
                                onClick={() => handleDelete(d.numero_despacho)}
                                disabled={deletingId === d.numero_despacho}
                                style={{
                                  background: '#dc2626', color: '#fff', border: 'none',
                                  padding: '3px 8px', borderRadius: 6, fontSize: '0.73rem',
                                  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                              >
                                {deletingId === d.numero_despacho
                                  ? <span className="spinner-border spinner-border-sm"></span>
                                  : '✓ Sí'}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                style={{
                                  background: '#e2e8f0', color: '#475569', border: 'none',
                                  padding: '3px 8px', borderRadius: 6, fontSize: '0.73rem',
                                  fontWeight: 700, cursor: 'pointer'
                                }}
                              >No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(d.numero_despacho)}
                              title="Eliminar despacho"
                              style={{
                                background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca',
                                padding: '4px 8px', borderRadius: 6, fontSize: '0.78rem',
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: seleccionar domiciliario para aprobar/entregar */}
      {approveModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setApproveModal(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.2rem' }}>
                <i className="fas fa-motorcycle"></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Asignar domiciliario</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Despacho #{approveModal.despacho.numero_despacho}</p>
              </div>
              <button onClick={() => setApproveModal(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.6rem 0.85rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#1d4ed8' }}>
              <i className="fas fa-info-circle me-2"></i>
              {approveModal.nuevoEstado === 'Entregado'
                ? 'Selecciona el domiciliario que realizó la entrega.'
                : 'Para despachar es necesario asignar un domiciliario.'}
            </div>

            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              {approveModal.nuevoEstado === 'Entregado' ? 'Domiciliario de entrega' : 'Domiciliario disponible'}
            </label>
            {(() => {
              const domiList = approveModal.nuevoEstado === 'Entregado'
                ? domiciliarios.filter(d => d.estado !== 'Inactivo')
                : domiDisponibles
              if (domiList.length === 0) return (
                <p style={{ color: '#dc2626', fontSize: '0.85rem' }}><i className="fas fa-times-circle me-1"></i>No hay domiciliarios disponibles.</p>
              )
              return (
                <select
                  value={selectedDomi}
                  onChange={e => setSelectedDomi(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem', marginBottom: '1rem' }}
                >
                  <option value="">Seleccionar...</option>
                  {domiList.map(d => (
                    <option key={d.cedula_domi} value={d.cedula_domi}>{d.nombres}</option>
                  ))}
                </select>
              )
            })()}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setApproveModal(null)} style={{ padding: '0.5rem 1.1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                Cancelar
              </button>
              <button
                onClick={confirmApprove}
                disabled={!selectedDomi}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', borderRadius: 8,
                  background: selectedDomi ? '#3b82f6' : '#94a3b8', color: '#fff',
                  fontWeight: 700, cursor: selectedDomi ? 'pointer' : 'not-allowed', fontSize: '0.88rem'
                }}
              >
                <i className={`fas ${approveModal.nuevoEstado === 'Entregado' ? 'fa-check' : 'fa-truck'} me-1`}></i>
                {approveModal.nuevoEstado === 'Entregado' ? 'Marcar entregado' : 'Despachar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DespachoView
