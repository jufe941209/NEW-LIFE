import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import despachoService from '../../services/despachoService'
import domiciliarioService from '../../services/domiciliarioService'
import facturaService from '../../services/facturaService'
import detalleFacturaService from '../../services/detalleFacturaService'
import productoService from '../../services/productoService'
import transporteService from '../../services/transporteService'
import responsableService from '../../services/responsableService'
import clienteService from '../../services/clienteService'
import ProductoCrud from '../Admin/components/ProductoCrud'
import DescuentoCrud from '../Admin/components/DescuentoCrud'
import { imprimirFactura } from '../../utils/imprimirFactura'
import './ResponsableDashboard.css'
import '../MiPerfil/MiPerfil.css'

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

const estadoPagoBadge = (val) => {
  const cfg = { Pagado: '#16a34a', Pendiente: '#ca8a04', Cancelado: '#dc2626' }
  const color = cfg[val] || '#6b7280'
  return <span style={{ background: color + '18', color, fontWeight: 700, fontSize: '0.78rem', padding: '3px 10px', borderRadius: 20 }}>{val || '—'}</span>
}

const EyeBtnR = ({ show, onToggle }) => (
  <button type="button" className="btn btn-outline-secondary" onClick={onToggle} tabIndex={-1}>
    <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  </button>
)

const RespPerfilSection = ({ responsable, loginResponsable }) => {
  const [editMode, setEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirm: false })

  const [form, setForm] = useState({
    nombres: responsable?.nombres || '',
    correo: responsable?.correo || '',
    telefono: responsable?.telefono || '',
    contrasenaActual: '',
    contrasenaNew: '',
    contrasenaNew2: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const togglePass = (field) => setShowPass(prev => ({ ...prev, [field]: !prev[field] }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres || !form.correo) { setErrorMsg('Nombres y correo son requeridos'); return }

    const wantsPassword = form.contrasenaActual || form.contrasenaNew || form.contrasenaNew2
    let newPassword = undefined
    if (wantsPassword) {
      if (!form.contrasenaActual) { setErrorMsg('Debes ingresar tu contraseña actual'); return }
      if (!form.contrasenaNew)    { setErrorMsg('Debes ingresar la nueva contraseña'); return }
      if (!form.contrasenaNew2)   { setErrorMsg('Debes confirmar la nueva contraseña'); return }
      if (form.contrasenaActual !== (responsable.contrasena || '')) {
        setErrorMsg('La contraseña actual no es correcta'); return
      }
      if (form.contrasenaNew.length < 6) { setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres'); return }
      if (form.contrasenaNew !== form.contrasenaNew2) { setErrorMsg('Las contraseñas nuevas no coinciden'); return }
      newPassword = form.contrasenaNew
    }

    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const payload = { ...responsable, nombres: form.nombres, correo: form.correo, telefono: form.telefono }
      if (newPassword) payload.contrasena = newPassword
      await responsableService.update(responsable.cedula_resp, payload)
      loginResponsable({ ...responsable, ...payload })
      setSuccessMsg('¡Perfil actualizado correctamente!')
      setEditMode(false)
      setForm(prev => ({ ...prev, contrasenaActual: '', contrasenaNew: '', contrasenaNew2: '' }))
    } catch (err) {
      setErrorMsg(err?.response?.data?.Message || 'Error al actualizar el perfil.')
    } finally { setIsSaving(false) }
  }

  const cancelEdit = () => {
    setEditMode(false)
    setErrorMsg('')
    setSuccessMsg('')
    setForm({
      nombres: responsable?.nombres || '',
      correo: responsable?.correo || '',
      telefono: responsable?.telefono || '',
      contrasenaActual: '',
      contrasenaNew: '',
      contrasenaNew2: ''
    })
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        background: 'linear-gradient(135deg, #1e3a5f, #7c3aed)', borderRadius: 20,
        padding: '2rem', color: 'white', marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '4rem', lineHeight: 1 }}><i className="fas fa-user-tie"></i></div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{responsable?.nombres}</h2>
          <p style={{ margin: '0 0 0.5rem', opacity: 0.9, fontSize: '0.95rem' }}>{responsable?.correo}</p>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Responsable
          </span>
        </div>
        <div>
          {!editMode && (
            <button className="btn btn-light" onClick={() => setEditMode(true)}>
              <i className="fas fa-edit me-2"></i>Editar Perfil
            </button>
          )}
        </div>
      </div>

      {successMsg && <div className="alert alert-success"><i className="fas fa-check-circle me-2"></i>{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger"><i className="fas fa-exclamation-circle me-2"></i>{errorMsg}</div>}

      {!editMode && (
        <div className="perfil-info-card">
          <h4 className="perfil-section-title"><i className="fas fa-info-circle me-2"></i>Información Personal</h4>
          <div className="perfil-info-grid">
            {[
              { icon: 'fas fa-id-card', label: 'Cédula', value: responsable?.cedula_resp },
              { icon: 'fas fa-envelope', label: 'Correo', value: responsable?.correo },
              { icon: 'fas fa-phone', label: 'Teléfono', value: responsable?.telefono || 'No registrado' },
              { icon: 'fas fa-calendar', label: 'Fecha de Registro', value: responsable?.fecha_registro ? new Date(responsable.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { icon: 'fas fa-circle', label: 'Estado', value: responsable?.estado, badge: true },
            ].map(item => (
              <div key={item.label} className="perfil-info-item">
                <div className="perfil-info-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                  <i className={item.icon}></i>
                </div>
                <div className="perfil-info-content">
                  <span className="perfil-info-label">{item.label}</span>
                  {item.badge
                    ? <span className={`perfil-badge ${item.value === 'Activo' ? 'active' : 'inactive'}`} style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}>{item.value}</span>
                    : <span className="perfil-info-value">{item.value}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editMode && (
        <div className="perfil-edit-card">
          <h4 className="perfil-section-title"><i className="fas fa-edit me-2"></i>Editar Información</h4>
          <form onSubmit={handleSave}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Cédula (no editable)</label>
                <input className="form-control" value={responsable?.cedula_resp || ''} disabled />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Rol</label>
                <input className="form-control" value="Responsable" disabled />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Nombres Completos *</label>
                <input name="nombres" className="form-control" value={form.nombres} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Correo Electrónico *</label>
                <input type="email" name="correo" className="form-control" value={form.correo} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono</label>
                <input name="telefono" className="form-control" value={form.telefono} onChange={handleChange} placeholder="3001234567" />
              </div>
            </div>

            <div className="perfil-pass-section">
              <h5 className="perfil-pass-title">
                <i className="fas fa-lock me-2"></i>Cambiar Contraseña
                <span className="perfil-pass-hint">opcional — deja los campos vacíos si no quieres cambiarla</span>
              </h5>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Contraseña Actual</label>
                  <div className="input-group">
                    <input type={showPass.actual ? 'text' : 'password'} name="contrasenaActual" className="form-control"
                      value={form.contrasenaActual} onChange={handleChange} placeholder="Ingresa tu contraseña actual" autoComplete="current-password" />
                    <EyeBtnR show={showPass.actual} onToggle={() => togglePass('actual')} />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nueva Contraseña</label>
                  <div className="input-group">
                    <input type={showPass.nueva ? 'text' : 'password'} name="contrasenaNew" className="form-control"
                      value={form.contrasenaNew} onChange={handleChange} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                    <EyeBtnR show={showPass.nueva} onToggle={() => togglePass('nueva')} />
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <div className="input-group">
                    <input type={showPass.confirm ? 'text' : 'password'} name="contrasenaNew2" className="form-control"
                      value={form.contrasenaNew2} onChange={handleChange} placeholder="Repite la nueva contraseña" autoComplete="new-password" />
                    <EyeBtnR show={showPass.confirm} onToggle={() => togglePass('confirm')} />
                  </div>
                  {form.contrasenaNew && form.contrasenaNew2 && (
                    <div className={`form-text mt-1 ${form.contrasenaNew === form.contrasenaNew2 ? 'text-success' : 'text-danger'}`}>
                      <i className={`fas ${form.contrasenaNew === form.contrasenaNew2 ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                      {form.contrasenaNew === form.contrasenaNew2 ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success flex-grow-1" disabled={isSaving}>
                {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="fas fa-save me-2"></i>Guardar Cambios</>}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const ResponsableDashboard = () => {
  const { responsable, loginResponsable, logoutResponsable } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState('dashboard')

  // Data
  const [despachos, setDespachos] = useState([])
  const [domiciliarios, setDomiciliarios] = useState([])
  const [facturas, setFacturas] = useState([])
  const [productosMap, setProductosMap] = useState({})
  const [transporteMap, setTransporteMap] = useState({})
  const [loading, setLoading] = useState(true)

  // Despacho actions
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedDomi, setSelectedDomi] = useState('')

  // Facturas
  const [filterFac, setFilterFac] = useState('')
  const [printingFac, setPrintingFac] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [d, dom, fac, prods, transportes] = await Promise.all([
        despachoService.getAll().catch(() => []),
        domiciliarioService.getAll().catch(() => []),
        facturaService.getAll().catch(() => []),
        productoService.getAll().catch(() => []),
        transporteService.getAll().catch(() => []),
      ])
      const dlist = Array.isArray(d) ? d : []
      const domList = Array.isArray(dom) ? dom : []
      const facList = Array.isArray(fac) ? fac : []
      const prodList = Array.isArray(prods) ? prods : []
      const transList = Array.isArray(transportes) ? transportes : []

      const pm = {}
      prodList.forEach(p => { pm[p.codigo_prod] = p })
      setProductosMap(pm)

      const tm = {}
      transList.forEach(t => { tm[t.cedula_domi] = t })
      setTransporteMap(tm)

      // Auto-fix: despachos "En camino"/"Entregado" sin domiciliario
      const sinDomi = dlist.filter(x =>
        (x.estado === 'En camino' || x.estado === 'Entregado') && !x.cc_domiciliario
      )
      if (sinDomi.length > 0) {
        const primerDomi = domList.find(x => x.disponibilidad === 'Disponible' && x.estado !== 'Inactivo')
          || domList.find(x => x.estado !== 'Inactivo')
        if (primerDomi) {
          await Promise.all(
            sinDomi.map(x =>
              despachoService.update(x.numero_despacho, { ...x, cc_domiciliario: primerDomi.cedula_domi }).catch(() => {})
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

  const handleLogout = () => { logoutResponsable(); navigate('/login') }
  const getNombreDomi = (cc) => domiciliarios.find(d => d.cedula_domi === cc)?.nombres || cc || '—'
  const getFactura = (num) => facturas.find(f => f.numero_factura === num)
  const domiDisponibles = domiciliarios.filter(d => d.disponibilidad === 'Disponible' && d.estado !== 'Inactivo')

  const changeEstado = async (despacho, nuevoEstado, domiOverride = null) => {
    const domiCC = domiOverride || despacho.cc_domiciliario
    if (nuevoEstado === 'En camino' && !domiCC) {
      setAssignModal({ despacho, nuevoEstado })
      setSelectedDomi(domiDisponibles[0]?.cedula_domi || '')
      return
    }
    if (nuevoEstado === 'Entregado' && !domiCC) {
      const allActive = domiciliarios.filter(d => d.estado !== 'Inactivo')
      setAssignModal({ despacho, nuevoEstado })
      setSelectedDomi(allActive[0]?.cedula_domi || '')
      return
    }
    setActionLoading(despacho.numero_despacho)
    try {
      const now = new Date().toISOString()
      const isApproving = nuevoEstado === 'En camino' && (!despacho.cc_responsable || despacho.cc_responsable === '')
      await despachoService.update(despacho.numero_despacho, {
        ...despacho,
        cc_responsable: isApproving ? (responsable?.cedula_resp || despacho.cc_responsable) : despacho.cc_responsable,
        cc_domiciliario: domiCC,
        estado: nuevoEstado,
        fecha_aprobacion: nuevoEstado === 'En camino' ? (despacho.fecha_aprobacion || now) : despacho.fecha_aprobacion,
        fecha_entrega: nuevoEstado === 'Entregado' ? now : despacho.fecha_entrega,
      })
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'Error al actualizar el estado')
    } finally { setActionLoading(null) }
  }

  const confirmAssignAndApprove = async () => {
    if (!selectedDomi || !assignModal) return
    const { despacho, nuevoEstado } = assignModal
    setAssignModal(null)
    if (despacho.estado === nuevoEstado) {
      setActionLoading(despacho.numero_despacho)
      try {
        await despachoService.update(despacho.numero_despacho, { ...despacho, cc_domiciliario: selectedDomi })
        await load()
      } catch (e) {
        alert(e?.response?.data?.Message || 'Error al asignar el domiciliario')
      } finally { setActionLoading(null) }
    } else {
      await changeEstado(despacho, nuevoEstado, selectedDomi)
    }
  }

  const handleImprimirFactura = async (factura) => {
    setPrintingFac(factura.numero_factura)
    try {
      const [detalles, clienteData] = await Promise.all([
        detalleFacturaService.getByFactura(factura.numero_factura).catch(() => []),
        clienteService.getById(factura.cedula_cli).catch(() => null),
      ])
      imprimirFactura(factura, Array.isArray(detalles) ? detalles : [], productosMap, clienteData)
    } finally { setPrintingFac(null) }
  }

  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const fmtDateTime = (val) => val ? new Date(val).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  const counts = {
    Pendiente:   despachos.filter(d => !d.estado || d.estado === 'Pendiente').length,
    'En camino': despachos.filter(d => d.estado === 'En camino').length,
    Enviado:     despachos.filter(d => d.estado === 'Enviado').length,
    Entregado:   despachos.filter(d => d.estado === 'Entregado').length,
    Cancelado:   despachos.filter(d => d.estado === 'Cancelado').length,
  }
  const misDespachos = despachos.filter(d => d.cc_responsable === responsable?.cedula_resp)

  const filteredDespachos = despachos.filter(d => {
    const matchFilter = !filter || (d.numero_factura || '').includes(filter) || String(d.numero_despacho).includes(filter)
    const matchEstado = !filterEstado || (d.estado || 'Pendiente') === filterEstado
    return matchFilter && matchEstado
  })

  const filteredFacturas = facturas.filter(f =>
    !filterFac ||
    (f.numero_factura || '').toLowerCase().includes(filterFac.toLowerCase()) ||
    (f.cedula_cli || '').toString().includes(filterFac) ||
    (f.estado_pago || '').toLowerCase().includes(filterFac.toLowerCase())
  )

  const navItems = [
    { key: 'dashboard',  label: 'Dashboard',   icon: 'fas fa-tachometer-alt' },
    { key: 'despachos',  label: 'Despachos',   icon: 'fas fa-shipping-fast' },
    { key: 'facturas',   label: 'Facturas',    icon: 'fas fa-file-invoice-dollar' },
    { key: 'inventario', label: 'Inventario',  icon: 'fas fa-boxes' },
    { key: 'descuentos', label: 'Descuentos',  icon: 'fas fa-percent' },
    { key: 'perfil',     label: 'Mi Perfil',   icon: 'fas fa-user-circle' },
  ]

  const getSectionTitle = () => ({
    dashboard: 'Dashboard',
    despachos: 'Gestión de Despachos',
    facturas: 'Facturas de Venta',
    inventario: 'Inventario de Productos',
    descuentos: 'Gestión de Descuentos',
    perfil: 'Mi Perfil',
  }[section] || 'Dashboard')

  return (
    <div className="resp-layout">
      {/* ── HAMBURGER TOGGLE (mobile) ── */}
      <button
        className="resp-sidebar-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Abrir menú"
      >
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* ── OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div className="resp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`resp-sidebar${sidebarOpen ? ' open' : ''}`}>
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
              onClick={() => { setSection(item.key); setSidebarOpen(false) }}
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

      {/* ── MAIN CONTENT ── */}
      <div className="resp-content">
        <header className="resp-topbar">
          <div>
            <h2 className="resp-page-title">{getSectionTitle()}</h2>
            <nav className="resp-breadcrumb">
              <span className="resp-breadcrumb-home" onClick={() => setSection('dashboard')}>Dashboard</span>
              {section !== 'dashboard' && (
                <><span className="resp-breadcrumb-sep">/</span><span className="resp-breadcrumb-cur">{getSectionTitle()}</span></>
              )}
            </nav>
          </div>
          <div className="resp-topbar-date">
            <i className="fas fa-calendar-alt me-2"></i>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main className="resp-main">

          {/* ══════════════ DASHBOARD ══════════════ */}
          {section === 'dashboard' && (
            <div className="resp-dashboard-home">
              <div className="resp-welcome-banner">
                <div>
                  <h3>Bienvenido, <strong>{responsable?.nombres}</strong> 👋</h3>
                  <p>Desde aquí puedes gestionar despachos, facturas e inventario.</p>
                </div>
                <button className="resp-refresh-btn" onClick={load}>
                  <i className="fas fa-sync-alt me-1"></i>Actualizar
                </button>
              </div>

              {/* Shortcuts */}
              <div className="resp-shortcuts">
                {navItems.filter(n => n.key !== 'dashboard').map(item => (
                  <button
                    key={item.key}
                    className="resp-shortcut-card"
                    onClick={() => setSection(item.key)}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                    <i className="fas fa-arrow-right resp-shortcut-arrow"></i>
                  </button>
                ))}
              </div>

              {/* Stats despachos */}
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

              {/* Mis despachos */}
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
                        <tr><th>#</th><th>Factura</th><th>Estado</th><th>Domiciliario</th><th>Fecha</th></tr>
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

              {/* Facturas recientes */}
              <div className="resp-section-card">
                <div className="resp-section-card-header">
                  <h4><i className="fas fa-file-invoice-dollar me-2"></i>Facturas recientes</h4>
                  <span className="resp-badge-count">{facturas.length}</span>
                </div>
                {loading ? (
                  <div className="resp-loading"><div className="spinner-border text-primary"></div></div>
                ) : facturas.length === 0 ? (
                  <p className="resp-empty"><i className="fas fa-inbox me-2"></i>No hay facturas.</p>
                ) : (
                  <div className="resp-mini-table-wrap">
                    <table className="resp-mini-table">
                      <thead>
                        <tr><th>N° Factura</th><th>Cliente</th><th>Fecha</th><th>Método</th><th>Estado</th><th>PDF</th></tr>
                      </thead>
                      <tbody>
                        {facturas.slice(0, 5).map(f => (
                          <tr key={f.numero_factura}>
                            <td><strong>{f.numero_factura}</strong></td>
                            <td>{f.cedula_cli}</td>
                            <td>{fmtDate(f.fecha)}</td>
                            <td>{f.metodo_pago}</td>
                            <td>{estadoPagoBadge(f.estado_pago)}</td>
                            <td>
                              <button
                                className="resp-pdf-btn"
                                onClick={() => handleImprimirFactura(f)}
                                disabled={printingFac === f.numero_factura}
                                title="Imprimir PDF"
                              >
                                {printingFac === f.numero_factura
                                  ? <span className="spinner-border spinner-border-sm"></span>
                                  : <i className="fas fa-print"></i>
                                }
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button className="resp-ver-todos" onClick={() => setSection('facturas')}>
                  Ver todas las facturas <i className="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ DESPACHOS ══════════════ */}
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
                <select className="resp-filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
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
                            <div className="resp-desp-num"><span>Despacho</span><strong>#{d.numero_despacho}</strong></div>
                            <EstadoBadge estado={d.estado || 'Pendiente'} />
                            {isMe && <span className="resp-desp-mine-tag"><i className="fas fa-star me-1"></i>Mío</span>}
                          </div>

                          <div className="resp-desp-body">
                            <div className="resp-desp-row"><i className="fas fa-file-invoice me-2 text-muted"></i><span>Factura: <strong>{d.numero_factura}</strong></span></div>
                            {factura && <div className="resp-desp-row"><i className="fas fa-user me-2 text-muted"></i><span>Cliente: <strong>{factura.cedula_cli}</strong></span></div>}
                            {factura?.metodo_pago && <div className="resp-desp-row"><i className="fas fa-credit-card me-2 text-muted"></i><span>Pago: <strong>{factura.metodo_pago}</strong></span></div>}
                            <div className="resp-desp-row">
                              <i className="fas fa-motorcycle me-2 text-muted"></i>
                              {sinDomiciliario
                                ? <span style={{ color: '#f59e0b', fontWeight: 600 }}><i className="fas fa-exclamation-triangle me-1"></i>Sin domiciliario asignado</span>
                                : <span>Domiciliario: <strong>{getNombreDomi(d.cc_domiciliario)}</strong></span>
                              }
                            </div>
                            <div className="resp-desp-dates">
                              <div className="resp-desp-date-item"><span className="resp-desp-date-lbl">Despacho</span><span className="resp-desp-date-val">{fmtDate(d.fecha_despacho)}</span></div>
                              <div className="resp-desp-date-item"><span className="resp-desp-date-lbl">Aprobación</span><span className="resp-desp-date-val">{fmtDateTime(d.fecha_aprobacion)}</span></div>
                              {d.fecha_entrega && <div className="resp-desp-date-item"><span className="resp-desp-date-lbl">Entregado</span><span className="resp-desp-date-val" style={{ color: '#22c55e' }}>{fmtDateTime(d.fecha_entrega)}</span></div>}
                            </div>
                          </div>

                          {d.estado !== 'Entregado' && d.estado !== 'Cancelado' && (
                            <div className="resp-desp-actions">
                              {d.estado === 'En camino' && sinDomiciliario && (
                                <button className="resp-action-btn" style={{ background: '#f59e0b', color: '#fff' }}
                                  onClick={() => { setAssignModal({ despacho: d, nuevoEstado: 'En camino' }); setSelectedDomi(domiDisponibles[0]?.cedula_domi || '') }}
                                  disabled={busy}
                                >
                                  <i className="fas fa-exclamation-triangle me-1"></i>Asignar domiciliario
                                </button>
                              )}
                              {(!d.estado || d.estado === 'Pendiente') && (
                                <button className="resp-action-btn resp-btn-aprobar" onClick={() => changeEstado(d, 'En camino')} disabled={busy}>
                                  {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-truck me-1"></i>Aprobar y despachar</>}
                                </button>
                              )}
                              {d.estado === 'En camino' && (
                                <button className="resp-action-btn" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => changeEstado(d, 'Enviado')} disabled={busy}>
                                  {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-paper-plane me-1"></i>Enviado</>}
                                </button>
                              )}
                              {d.estado === 'Enviado' && (
                                <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <i className="fas fa-clock"></i> Esperando confirmación del domiciliario
                                </div>
                              )}
                              <button className="resp-action-btn resp-btn-cancelar" onClick={() => changeEstado(d, 'Cancelado')} disabled={busy}>
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
                          {/* Botón imprimir factura asociada */}
                          {factura && (
                            <div style={{ padding: '0.5rem 1rem 0.75rem', borderTop: '1px solid #f1f5f9' }}>
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
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ FACTURAS ══════════════ */}
          {section === 'facturas' && (
            <div className="resp-facturas-section">
              <div className="resp-filters">
                <div className="resp-search-wrap">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Buscar por N° factura, cédula, estado..."
                    value={filterFac}
                    onChange={e => setFilterFac(e.target.value)}
                    className="resp-search-input"
                  />
                </div>
                <button className="resp-refresh-btn" onClick={load}>
                  <i className="fas fa-sync-alt me-1"></i>Actualizar
                </button>
              </div>

              {loading ? (
                <div className="resp-loading"><div className="spinner-border text-primary"></div><p>Cargando facturas...</p></div>
              ) : filteredFacturas.length === 0 ? (
                <p className="resp-empty"><i className="fas fa-file-invoice me-2"></i>No hay facturas que coincidan.</p>
              ) : (
                <div className="resp-table-card">
                  <div className="resp-table-wrap">
                    <table className="resp-data-table">
                      <thead>
                        <tr>
                          <th>N° Factura</th>
                          <th>Cédula Cliente</th>
                          <th>Fecha</th>
                          <th>Método Pago</th>
                          <th>Dirección Envío</th>
                          <th>Estado</th>
                          <th>PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFacturas.map(f => (
                          <tr key={f.numero_factura}>
                            <td><strong>{f.numero_factura}</strong></td>
                            <td>{f.cedula_cli}</td>
                            <td>{fmtDate(f.fecha)}</td>
                            <td>{f.metodo_pago || '—'}</td>
                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.direccion_envio || '—'}</td>
                            <td>{estadoPagoBadge(f.estado_pago)}</td>
                            <td>
                              <button
                                className="resp-pdf-btn"
                                onClick={() => handleImprimirFactura(f)}
                                disabled={printingFac === f.numero_factura}
                                title="Imprimir / Descargar PDF"
                              >
                                {printingFac === f.numero_factura
                                  ? <span className="spinner-border spinner-border-sm"></span>
                                  : <><i className="fas fa-file-pdf me-1"></i>PDF</>
                                }
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#9ca3af', borderTop: '1px solid #f1f5f9' }}>
                    {filteredFacturas.length} factura{filteredFacturas.length !== 1 ? 's' : ''} encontrada{filteredFacturas.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ INVENTARIO ══════════════ */}
          {section === 'inventario' && (
            <div className="resp-inventario-section">
              <ProductoCrud />
            </div>
          )}

          {/* ══════════════ DESCUENTOS ══════════════ */}
          {section === 'descuentos' && (
            <div className="resp-inventario-section">
              <DescuentoCrud />
            </div>
          )}

          {/* ══════════════ MI PERFIL ══════════════ */}
          {section === 'perfil' && (
            <RespPerfilSection responsable={responsable} loginResponsable={loginResponsable} />
          )}

        </main>
      </div>

      {/* ── MODAL ASIGNAR DOMICILIARIO ── */}
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
              {assignModal?.nuevoEstado === 'Entregado' ? (
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
                {assignModal?.nuevoEstado === 'Entregado' ? 'Confirmar domiciliario de entrega' : 'Seleccionar domiciliario disponible'}
              </label>
              {(() => {
                const domiList = assignModal?.nuevoEstado === 'Entregado'
                  ? domiciliarios.filter(d => d.estado !== 'Inactivo')
                  : domiDisponibles
                if (domiList.length === 0) return (
                  <p className="resp-assign-empty"><i className="fas fa-times-circle me-2"></i>No hay domiciliarios disponibles.</p>
                )
                return (
                  <>
                    <select className="resp-assign-select" value={selectedDomi} onChange={e => setSelectedDomi(e.target.value)}>
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
              <button className="resp-assign-btn-confirm" onClick={confirmAssignAndApprove} disabled={!selectedDomi}>
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
