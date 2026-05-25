import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import despachoService from '../../services/despachoService'
import facturaService from '../../services/facturaService'
import transporteService from '../../services/transporteService'
import domiciliarioService from '../../services/domiciliarioService'
import '../Responsable/ResponsableDashboard.css'

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

const EyeBtn = ({ show, onToggle }) => (
  <button type="button" className="btn btn-outline-secondary" onClick={onToggle} tabIndex={-1}>
    <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  </button>
)

/* ── Sección perfil ────────────────────────────────────────────── */
const PerfilSection = ({ domiciliario, loginDomiciliario }) => {
  const [editMode, setEditMode]   = useState(false)
  const [isSaving, setIsSaving]   = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg]   = useState('')
  const [showPass, setShowPass]   = useState({ actual: false, nueva: false, confirm: false })
  const [form, setForm] = useState({
    nombres: domiciliario?.nombres || '',
    telefono: domiciliario?.telefono || '',
    contrasenaActual: '',
    contrasenaNew: '',
    contrasenaNew2: '',
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres) { setErrorMsg('El nombre es requerido'); return }
    const wantsPass = form.contrasenaActual || form.contrasenaNew || form.contrasenaNew2
    let newPassword = undefined
    if (wantsPass) {
      if (!form.contrasenaActual) { setErrorMsg('Ingresa tu contraseña actual'); return }
      if (!form.contrasenaNew || form.contrasenaNew.length < 6) { setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres'); return }
      if (form.contrasenaNew !== form.contrasenaNew2) { setErrorMsg('Las contraseñas no coinciden'); return }
      newPassword = form.contrasenaNew
    }
    setIsSaving(true); setErrorMsg(''); setSuccessMsg('')
    try {
      const payload = { ...domiciliario, nombres: form.nombres, telefono: form.telefono }
      if (newPassword) {
        // Verify current password via backend before updating
        const verified = await domiciliarioService.login(domiciliario.cedula_domi, form.contrasenaActual)
        if (!verified) { setErrorMsg('Contraseña actual incorrecta'); setIsSaving(false); return }
        payload.contrasena = newPassword
      }
      await domiciliarioService.update(domiciliario.cedula_domi, payload)
      loginDomiciliario({ ...domiciliario, nombres: form.nombres, telefono: form.telefono })
      setSuccessMsg('¡Perfil actualizado!')
      setEditMode(false)
      setForm(p => ({ ...p, contrasenaActual: '', contrasenaNew: '', contrasenaNew2: '' }))
    } catch (err) {
      const msg = err?.response?.data?.Message || err?.response?.data || 'Error al actualizar.'
      setErrorMsg(typeof msg === 'string' ? msg : 'Error al actualizar.')
    } finally { setIsSaving(false) }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        background: 'linear-gradient(135deg, #064e3b, #047857)', borderRadius: 20,
        padding: '2rem', color: 'white', marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '4rem', lineHeight: 1 }}><i className="fas fa-motorcycle"></i></div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{domiciliario?.nombres}</h2>
          <p style={{ margin: '0 0 0.5rem', opacity: 0.9 }}>{domiciliario?.telefono || 'Sin teléfono'}</p>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Domiciliario
          </span>
        </div>
        {!editMode && (
          <button className="btn btn-light" onClick={() => setEditMode(true)}>
            <i className="fas fa-edit me-2"></i>Editar
          </button>
        )}
      </div>

      {successMsg && <div className="alert alert-success"><i className="fas fa-check-circle me-2"></i>{successMsg}</div>}
      {errorMsg   && <div className="alert alert-danger"><i className="fas fa-exclamation-circle me-2"></i>{errorMsg}</div>}

      {!editMode && (
        <div className="perfil-info-card">
          <h4 className="perfil-section-title"><i className="fas fa-info-circle me-2"></i>Información</h4>
          <div className="perfil-info-grid">
            {[
              { icon: 'fas fa-id-card',   label: 'Cédula',          value: domiciliario?.cedula_domi },
              { icon: 'fas fa-phone',     label: 'Teléfono',        value: domiciliario?.telefono || 'No registrado' },
              { icon: 'fas fa-calendar',  label: 'Registro',        value: domiciliario?.fecha_registro ? new Date(domiciliario.fecha_registro).toLocaleDateString('es-CO') : '—' },
              { icon: 'fas fa-circle',    label: 'Disponibilidad',  value: domiciliario?.disponibilidad, badge: true },
            ].map(item => (
              <div key={item.label} className="perfil-info-item">
                <div className="perfil-info-icon" style={{ background: 'rgba(4,120,87,0.1)', color: '#047857' }}>
                  <i className={item.icon}></i>
                </div>
                <div className="perfil-info-content">
                  <span className="perfil-info-label">{item.label}</span>
                  {item.badge
                    ? <span className="perfil-badge active" style={{ background: 'rgba(4,120,87,0.15)', color: '#047857' }}>{item.value}</span>
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
                <input className="form-control" value={domiciliario?.cedula_domi || ''} disabled />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Rol</label>
                <input className="form-control" value="Domiciliario" disabled />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Nombres *</label>
                <input name="nombres" className="form-control" value={form.nombres} onChange={handleChange} required />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Teléfono</label>
                <input name="telefono" className="form-control" value={form.telefono} onChange={handleChange} placeholder="3001234567" />
              </div>
            </div>

            <div className="perfil-pass-section">
              <h5 className="perfil-pass-title">
                <i className="fas fa-lock me-2"></i>Cambiar Contraseña
                <span className="perfil-pass-hint">opcional</span>
              </h5>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Contraseña Actual</label>
                  <div className="input-group">
                    <input type={showPass.actual ? 'text' : 'password'} name="contrasenaActual" className="form-control"
                      value={form.contrasenaActual} onChange={handleChange} placeholder="Tu contraseña actual" autoComplete="current-password" />
                    <EyeBtn show={showPass.actual} onToggle={() => setShowPass(p => ({ ...p, actual: !p.actual }))} />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nueva Contraseña</label>
                  <div className="input-group">
                    <input type={showPass.nueva ? 'text' : 'password'} name="contrasenaNew" className="form-control"
                      value={form.contrasenaNew} onChange={handleChange} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                    <EyeBtn show={showPass.nueva} onToggle={() => setShowPass(p => ({ ...p, nueva: !p.nueva }))} />
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label">Confirmar Contraseña</label>
                  <div className="input-group">
                    <input type={showPass.confirm ? 'text' : 'password'} name="contrasenaNew2" className="form-control"
                      value={form.contrasenaNew2} onChange={handleChange} placeholder="Repite la nueva" autoComplete="new-password" />
                    <EyeBtn show={showPass.confirm} onToggle={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))} />
                  </div>
                  {form.contrasenaNew && form.contrasenaNew2 && (
                    <div className={`form-text mt-1 ${form.contrasenaNew === form.contrasenaNew2 ? 'text-success' : 'text-danger'}`}>
                      <i className={`fas ${form.contrasenaNew === form.contrasenaNew2 ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                      {form.contrasenaNew === form.contrasenaNew2 ? 'Coinciden' : 'No coinciden'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success flex-grow-1" disabled={isSaving} style={{ background: '#047857', borderColor: '#047857' }}>
                {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="fas fa-save me-2"></i>Guardar</>}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditMode(false); setErrorMsg(''); setSuccessMsg('') }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

/* ── Dashboard principal ───────────────────────────────────────── */
const DomiciliarioDashboard = () => {
  const { domiciliario, loginDomiciliario, logoutDomiciliario } = useAuth()
  const navigate = useNavigate()
  const [section, setSection]   = useState('dashboard')
  const [despachos, setDespachos] = useState([])
  const [facturas, setFacturas]   = useState([])
  const [transporte, setTransporte] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter]       = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [allDespachos, fac, transportes] = await Promise.all([
        despachoService.getAll().catch(() => []),
        facturaService.getAll().catch(() => []),
        transporteService.getAll().catch(() => []),
      ])
      const misDespachos = (Array.isArray(allDespachos) ? allDespachos : [])
        .filter(d => d.cc_domiciliario === domiciliario?.cedula_domi)
      setDespachos(misDespachos)
      setFacturas(Array.isArray(fac) ? fac : [])
      const miVehiculo = (Array.isArray(transportes) ? transportes : [])
        .find(t => t.cedula_domi === domiciliario?.cedula_domi) || null
      setTransporte(miVehiculo)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleLogout = () => { logoutDomiciliario(); navigate('/login-domiciliario') }

  const changeEstado = async (despacho, nuevoEstado) => {
    setActionLoading(despacho.numero_despacho)
    try {
      const now = new Date().toISOString()
      await despachoService.update(despacho.numero_despacho, {
        ...despacho,
        estado: nuevoEstado,
        fecha_entrega: nuevoEstado === 'Entregado' ? now : despacho.fecha_entrega,
      })
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'Error al actualizar el despacho')
    } finally { setActionLoading(null) }
  }

  const counts = {
    Enviado:   despachos.filter(d => d.estado === 'Enviado').length,
    'En camino': despachos.filter(d => d.estado === 'En camino').length,
    Entregado: despachos.filter(d => d.estado === 'Entregado').length,
    Cancelado: despachos.filter(d => d.estado === 'Cancelado').length,
  }

  const filtered = despachos.filter(d => {
    const mf = !filter || String(d.numero_despacho).includes(filter) || (d.numero_factura || '').toLowerCase().includes(filter.toLowerCase())
    const me = !filterEstado || d.estado === filterEstado
    return mf && me
  })

  const pendingAction = despachos.filter(d => d.estado === 'Enviado' || d.estado === 'En camino')

  const navItems = [
    { key: 'dashboard', label: 'Dashboard',      icon: 'fas fa-tachometer-alt' },
    { key: 'despachos', label: 'Mis Despachos',  icon: 'fas fa-shipping-fast' },
    { key: 'perfil',    label: 'Mi Perfil',       icon: 'fas fa-user-circle' },
  ]

  return (
    <div className="resp-layout">
      {/* ── SIDEBAR ── */}
      <aside className="resp-sidebar" style={{ background: 'linear-gradient(180deg, #064e3b 0%, #065f46 60%, #047857 100%)' }}>
        <div className="resp-sidebar-brand">
          <div className="resp-brand-logo"><i className="fas fa-motorcycle"></i></div>
          <h2>NEW LIFE</h2>
          <p>Portal Domiciliarios</p>
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
              {item.key === 'despachos' && pendingAction.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#f59e0b', color: '#fff', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px' }}>
                  {pendingAction.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="resp-sidebar-footer">
          <div className="resp-user-info">
            <div className="resp-user-avatar"><i className="fas fa-motorcycle"></i></div>
            <div className="resp-user-details">
              <span className="resp-user-name">{domiciliario?.nombres}</span>
              <span className="resp-user-role">Domiciliario</span>
            </div>
          </div>
          <button className="resp-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="resp-content">
        <header className="resp-topbar">
          <div>
            <h2 className="resp-page-title">
              {{ dashboard: 'Dashboard', despachos: 'Mis Despachos', perfil: 'Mi Perfil' }[section]}
            </h2>
            <nav className="resp-breadcrumb">
              <span className="resp-breadcrumb-home" onClick={() => setSection('dashboard')}>Dashboard</span>
              {section !== 'dashboard' && (
                <><span className="resp-breadcrumb-sep">/</span>
                <span className="resp-breadcrumb-cur">{{ despachos: 'Mis Despachos', perfil: 'Mi Perfil' }[section]}</span></>
              )}
            </nav>
          </div>
          <div className="resp-topbar-date">
            <i className="fas fa-calendar-alt me-2"></i>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main className="resp-main">

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            <div className="resp-dashboard-home">
              <div className="resp-welcome-banner" style={{ background: 'linear-gradient(135deg, #064e3b, #047857)' }}>
                <div>
                  <h3>Bienvenido, <strong>{domiciliario?.nombres}</strong></h3>
                  <p>Desde aquí puedes gestionar tus entregas.</p>
                </div>
                <button className="resp-refresh-btn" onClick={load}>
                  <i className="fas fa-sync-alt me-1"></i>Actualizar
                </button>
              </div>

              {/* Stats */}
              <div className="resp-stats-grid">
                {[
                  { label: 'Por entregar', count: counts.Enviado + counts['En camino'], color: '#f59e0b', bg: '#fffbeb', icon: 'fa-paper-plane' },
                  { label: 'Entregados',   count: counts.Entregado,  color: '#22c55e', bg: '#f0fdf4', icon: 'fa-check-circle' },
                  { label: 'Cancelados',   count: counts.Cancelado,  color: '#ef4444', bg: '#fff5f5', icon: 'fa-times-circle' },
                  { label: 'Total',        count: despachos.length,  color: '#3b82f6', bg: '#eff6ff', icon: 'fa-boxes' },
                ].map(s => (
                  <div key={s.label} className="resp-stat-card" style={{ borderColor: s.color }}>
                    <div className="resp-stat-icon" style={{ background: s.bg, color: s.color }}>
                      <i className={`fas ${s.icon}`}></i>
                    </div>
                    <div className="resp-stat-body">
                      <span className="resp-stat-num" style={{ color: s.color }}>{s.count}</span>
                      <span className="resp-stat-label">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vehículo asignado */}
              <div className="resp-section-card" style={{ marginBottom: '1.5rem' }}>
                <div className="resp-section-card-header">
                  <h4><i className="fas fa-truck me-2"></i>Mi Vehículo</h4>
                </div>
                {transporte ? (
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857', fontSize: '1.4rem' }}>
                      <i className="fas fa-motorcycle"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{transporte.tipo}</div>
                      <div style={{ fontSize: '0.88rem', color: '#64748b' }}>Placa: <strong>{transporte.placa}</strong></div>
                      {transporte.descripcion && <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{transporte.descripcion}</div>}
                    </div>
                  </div>
                ) : (
                  <p className="resp-empty"><i className="fas fa-exclamation-triangle me-2 text-warning"></i>No tienes vehículo asignado. Contacta al responsable.</p>
                )}
              </div>

              {/* Pendientes de acción */}
              <div className="resp-section-card">
                <div className="resp-section-card-header">
                  <h4><i className="fas fa-clock me-2 text-warning"></i>Pendientes de entrega</h4>
                  <span className="resp-badge-count">{pendingAction.length}</span>
                </div>
                {loading ? (
                  <div className="resp-loading"><div className="spinner-border text-success"></div></div>
                ) : pendingAction.length === 0 ? (
                  <p className="resp-empty"><i className="fas fa-check-circle me-2 text-success"></i>No tienes entregas pendientes.</p>
                ) : (
                  <div className="resp-mini-table-wrap">
                    <table className="resp-mini-table">
                      <thead><tr><th>#</th><th>Factura</th><th>Estado</th><th>Acción</th></tr></thead>
                      <tbody>
                        {pendingAction.map(d => {
                          const busy = actionLoading === d.numero_despacho
                          return (
                            <tr key={d.numero_despacho}>
                              <td><strong>#{d.numero_despacho}</strong></td>
                              <td>{d.numero_factura}</td>
                              <td><EstadoBadge estado={d.estado} /></td>
                              <td>
                                <button
                                  onClick={() => changeEstado(d, 'Entregado')}
                                  disabled={busy}
                                  style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check me-1"></i>Confirmar entrega</>}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <button className="resp-ver-todos" style={{ color: '#047857' }} onClick={() => setSection('despachos')}>
                  Ver todos mis despachos <i className="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}

          {/* ── DESPACHOS ── */}
          {section === 'despachos' && (
            <div className="resp-despachos-section">
              <div className="resp-filters">
                <div className="resp-search-wrap">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Buscar por # despacho o factura..." value={filter} onChange={e => setFilter(e.target.value)} className="resp-search-input" />
                </div>
                <select className="resp-filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {['Enviado','En camino','Entregado','Cancelado'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <button className="resp-refresh-btn" onClick={load}><i className="fas fa-sync-alt me-1"></i>Actualizar</button>
              </div>

              {loading ? (
                <div className="resp-loading"><div className="spinner-border text-success"></div><p>Cargando...</p></div>
              ) : (
                <div className="resp-despacho-grid">
                  {filtered.length === 0 ? (
                    <p className="resp-empty"><i className="fas fa-box-open me-2"></i>No hay despachos que coincidan.</p>
                  ) : (
                    filtered.map(d => {
                      const m = estadoMeta[d.estado] || estadoMeta['Pendiente']
                      const factura = facturas.find(f => f.numero_factura === d.numero_factura)
                      const busy = actionLoading === d.numero_despacho
                      const isTerminal = d.estado === 'Entregado' || d.estado === 'Cancelado'
                      return (
                        <div key={d.numero_despacho} className="resp-despacho-card">
                          <div className="resp-desp-header" style={{ borderColor: m.color }}>
                            <div className="resp-desp-num"><span>Despacho</span><strong>#{d.numero_despacho}</strong></div>
                            <EstadoBadge estado={d.estado} />
                          </div>

                          <div className="resp-desp-body">
                            <div className="resp-desp-row"><i className="fas fa-file-invoice me-2 text-muted"></i><span>Factura: <strong>{d.numero_factura}</strong></span></div>
                            {factura && <div className="resp-desp-row"><i className="fas fa-user me-2 text-muted"></i><span>Cliente: <strong>{factura.cedula_cli}</strong></span></div>}
                            {factura?.metodo_pago && <div className="resp-desp-row"><i className="fas fa-credit-card me-2 text-muted"></i><span>Pago: <strong>{factura.metodo_pago}</strong></span></div>}
                            {factura?.direccion_envio && <div className="resp-desp-row"><i className="fas fa-map-marker-alt me-2 text-muted"></i><span>{factura.direccion_envio}</span></div>}
                            <div className="resp-desp-dates">
                              <div className="resp-desp-date-item"><span className="resp-desp-date-lbl">Despacho</span><span className="resp-desp-date-val">{fmtDate(d.fecha_despacho)}</span></div>
                              <div className="resp-desp-date-item"><span className="resp-desp-date-lbl">Aprobación</span><span className="resp-desp-date-val">{fmtDT(d.fecha_aprobacion)}</span></div>
                              {d.fecha_entrega && <div className="resp-desp-date-item"><span className="resp-desp-date-lbl">Entregado</span><span className="resp-desp-date-val" style={{ color: '#22c55e' }}>{fmtDT(d.fecha_entrega)}</span></div>}
                            </div>
                          </div>

                          {!isTerminal && (
                            <div className="resp-desp-actions">
                              <button
                                className="resp-action-btn resp-btn-entregar"
                                onClick={() => changeEstado(d, 'Entregado')}
                                disabled={busy}
                                style={{ background: '#22c55e' }}
                              >
                                {busy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check me-1"></i>Confirmar entrega</>}
                              </button>
                            </div>
                          )}
                          {isTerminal && (
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

          {/* ── PERFIL ── */}
          {section === 'perfil' && (
            <PerfilSection domiciliario={domiciliario} loginDomiciliario={loginDomiciliario} />
          )}

        </main>
      </div>
    </div>
  )
}

export default DomiciliarioDashboard
