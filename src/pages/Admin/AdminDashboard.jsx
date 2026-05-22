import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminNavbar from './components/AdminNavbar'
import AdministradorCrud from './components/AdministradorCrud'
import CategoriaCrud from './components/CategoriaCrud'
import ClienteCrud from './components/ClienteCrud'
import FacturaCrud from './components/FacturaCrud'
import DomiciliarioCrud from './components/DomiciliarioCrud'
import ProductoCrud from './components/ProductoCrud'
import DespachoView from './components/DespachoView'
import ResponsableCrud from './components/ResponsableCrud'
import TipoProductoCrud from './components/TipoProductoCrud'
import TransporteCrud from './components/TransporteCrud'
import administradorService from '../../services/administradorService'
import clienteService from '../../services/clienteService'
import productoService from '../../services/productoService'
import facturaService from '../../services/facturaService'
import domiciliarioService from '../../services/domiciliarioService'
import despachoService from '../../services/despachoService'
import responsableService from '../../services/responsableService'
import tipoProductoService from '../../services/tipoProductoService'
import transporteService from '../../services/transporteService'
import detalleFacturaService from '../../services/detalleFacturaService'
import { imprimirFactura } from '../../utils/imprimirFactura'
import './AdminDashboard.css'
import '../MiPerfil/MiPerfil.css'

const EyeBtnA = ({ show, onToggle }) => (
  <button type="button" className="btn btn-outline-secondary" onClick={onToggle} tabIndex={-1}>
    <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  </button>
)

const AdminPerfilSection = ({ admin, loginAdmin }) => {
  const [editMode, setEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirm: false })

  const [form, setForm] = useState({
    nombres: admin?.nombres || '',
    correo: admin?.correo || '',
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
      if (form.contrasenaActual !== (admin.contrasena || '')) {
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
      const payload = { ...admin, nombres: form.nombres, correo: form.correo }
      if (newPassword) payload.contrasena = newPassword
      await administradorService.update(admin.cedula_adm, payload)
      loginAdmin({ ...admin, ...payload })
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
    setForm({ nombres: admin?.nombres || '', correo: admin?.correo || '', contrasenaActual: '', contrasenaNew: '', contrasenaNew2: '' })
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="perfil-hero" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', marginBottom: '1.5rem' }}>
        <div className="perfil-avatar"><i className="fas fa-user-shield"></i></div>
        <div className="perfil-hero-info">
          <h2 className="perfil-nombre">{admin?.nombres}</h2>
          <p className="perfil-correo">{admin?.correo}</p>
          <span className="perfil-badge active" style={{ background: 'rgba(255,255,255,0.2)' }}>Administrador</span>
        </div>
        <div className="perfil-hero-actions">
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
              { icon: 'fas fa-id-badge', label: 'Cédula', value: admin?.cedula_adm },
              { icon: 'fas fa-envelope', label: 'Correo', value: admin?.correo },
              { icon: 'fas fa-user-shield', label: 'Rol', value: 'Administrador' },
              { icon: 'fas fa-circle', label: 'Estado', value: admin?.estado, badge: true },
            ].map(item => (
              <div key={item.label} className="perfil-info-item">
                <div className="perfil-info-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                  <i className={item.icon}></i>
                </div>
                <div className="perfil-info-content">
                  <span className="perfil-info-label">{item.label}</span>
                  {item.badge
                    ? <span className={`perfil-badge ${item.value === 'Activo' ? 'active' : 'inactive'}`} style={{ background: 'rgba(37,99,235,0.15)', color: '#2563eb' }}>{item.value}</span>
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
                <input className="form-control" value={admin?.cedula_adm || ''} disabled />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Rol</label>
                <input className="form-control" value="Administrador" disabled />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Nombres Completos *</label>
                <input name="nombres" className="form-control" value={form.nombres} onChange={handleChange} required />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Correo Electrónico *</label>
                <input type="email" name="correo" className="form-control" value={form.correo} onChange={handleChange} required />
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
                    <EyeBtnA show={showPass.actual} onToggle={() => togglePass('actual')} />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nueva Contraseña</label>
                  <div className="input-group">
                    <input type={showPass.nueva ? 'text' : 'password'} name="contrasenaNew" className="form-control"
                      value={form.contrasenaNew} onChange={handleChange} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                    <EyeBtnA show={showPass.nueva} onToggle={() => togglePass('nueva')} />
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label">Confirmar Nueva Contraseña</label>
                  <div className="input-group">
                    <input type={showPass.confirm ? 'text' : 'password'} name="contrasenaNew2" className="form-control"
                      value={form.contrasenaNew2} onChange={handleChange} placeholder="Repite la nueva contraseña" autoComplete="new-password" />
                    <EyeBtnA show={showPass.confirm} onToggle={() => togglePass('confirm')} />
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
              <button type="submit" className="btn btn-primary flex-grow-1" disabled={isSaving}>
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

const getStockLevel = (p) => {
  if (p.stock_real <= p.stock_min) return 'critical'
  if (p.stock_real <= p.stock_min * 1.5) return 'warning'
  return 'ok'
}

const StockRing = ({ pct, level }) => {
  const color = level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#22c55e'
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = Math.min(pct / 100, 1) * circ
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

const DashboardHome = ({ admin, setActiveSection }) => {
  const [productos, setProductos] = useState([])
  const [loadingStock, setLoadingStock] = useState(true)
  const [counts, setCounts] = useState({})
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [printingFac, setPrintingFac] = useState(null)
  const [productosMap, setProductosMap] = useState({})
  const [recentFacturas, setRecentFacturas] = useState([])

  useEffect(() => {
    productoService.getAll()
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setProductos(list)
        const pm = {}
        list.forEach(p => { pm[p.codigo_prod] = p })
        setProductosMap(pm)
      })
      .catch(() => setProductos([]))
      .finally(() => setLoadingStock(false))

    Promise.all([
      clienteService.getAll().catch(() => []),
      facturaService.getAll().catch(() => []),
      domiciliarioService.getAll().catch(() => []),
      despachoService.getAll().catch(() => []),
      responsableService.getAll().catch(() => []),
      tipoProductoService.getAll().catch(() => []),
      transporteService.getAll().catch(() => []),
    ]).then(([clis, facts, domis, desps, resps, tipos, transportes]) => {
      setCounts({
        clientes: Array.isArray(clis) ? clis.length : 0,
        facturas: Array.isArray(facts) ? facts.length : 0,
        domiciliarios: Array.isArray(domis) ? domis.length : 0,
        despachos: Array.isArray(desps) ? desps.length : 0,
        responsables: Array.isArray(resps) ? resps.length : 0,
        tipoProducto: Array.isArray(tipos) ? tipos.length : 0,
        transporte: Array.isArray(transportes) ? transportes.length : 0,
      })
      const sortedFacts = Array.isArray(facts)
        ? [...facts].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)
        : []
      setRecentFacturas(sortedFacts)
    }).finally(() => setLoadingCounts(false))
  }, [])

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

  const stats = [
    { label: 'Productos', icon: 'fas fa-box', color: '#8b5cf6', section: 'productos', count: productos.length },
    { label: 'Categorías', icon: 'fas fa-tags', color: '#f59e0b', section: 'categorias' },
    { label: 'Tipos Producto', icon: 'fas fa-cubes', color: '#06b6d4', section: 'tipoProducto', count: counts.tipoProducto },
    { label: 'Clientes', icon: 'fas fa-users', color: '#10b981', section: 'clientes', count: counts.clientes },
    { label: 'Facturas', icon: 'fas fa-file-invoice-dollar', color: '#3b82f6', section: 'facturas', count: counts.facturas },
    { label: 'Despachos', icon: 'fas fa-shipping-fast', color: '#f97316', section: 'despachos', count: counts.despachos },
    { label: 'Domiciliarios', icon: 'fas fa-motorcycle', color: '#ef4444', section: 'domiciliarios', count: counts.domiciliarios },
    { label: 'Transportes', icon: 'fas fa-truck', color: '#64748b', section: 'transporte', count: counts.transporte },
    { label: 'Responsables', icon: 'fas fa-user-tie', color: '#7c3aed', section: 'responsables', count: counts.responsables },
    { label: 'Administradores', icon: 'fas fa-user-shield', color: '#6366f1', section: 'administradores' },
  ]

  const criticos = productos.filter(p => getStockLevel(p) === 'critical')
  const alertas  = productos.filter(p => getStockLevel(p) === 'warning')
  const ok       = productos.filter(p => getStockLevel(p) === 'ok')

  const productosSorted = [...productos].sort((a, b) => {
    const order = { critical: 0, warning: 1, ok: 2 }
    return order[getStockLevel(a)] - order[getStockLevel(b)]
  })

  const fmtDate = (val) => val ? new Date(val).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="dashboard-home">
      <div className="dashboard-welcome">
        <h1 className="dashboard-title">
          <i className="fas fa-tachometer-alt me-3"></i>
          Panel de Administración
        </h1>
        <p className="dashboard-subtitle">
          Bienvenido, <strong>{admin?.nombres || 'Administrador'}</strong>.
          Gestiona todos los recursos de NEW LIFE desde aquí.
        </p>
      </div>

      {/* Cards de módulos */}
      <div className="dashboard-stats-grid">
        {stats.map(stat => (
          <div
            key={stat.section}
            className="dashboard-stat-card"
            onClick={() => setActiveSection(stat.section)}
            style={{ '--accent': stat.color }}
          >
            <div className="stat-card-icon" style={{ background: stat.color }}>
              <i className={stat.icon}></i>
            </div>
            <div className="stat-card-content">
              <h3 className="stat-card-label">{stat.label}</h3>
              {!loadingCounts && stat.count !== undefined && (
                <p className="stat-card-count" style={{ color: stat.color }}>{stat.count}</p>
              )}
              <p className="stat-card-action">Gestionar <i className="fas fa-arrow-right ms-1"></i></p>
            </div>
          </div>
        ))}
      </div>

      {/* Facturas recientes con PDF */}
      {recentFacturas.length > 0 && (
        <div className="inv-section">
          <div className="inv-section-header">
            <h3 className="inv-title"><i className="fas fa-file-invoice-dollar me-2"></i>Facturas Recientes</h3>
            <button className="inv-link-btn" onClick={() => setActiveSection('facturas')}>
              <i className="fas fa-arrow-right me-1"></i>Ver todas
            </button>
          </div>
          <div className="inv-chart-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['N° Factura', 'Cliente', 'Fecha', 'Método', 'Estado', 'PDF'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentFacturas.map(f => {
                  const estadoColor = { Pagado: '#16a34a', Pendiente: '#f59e0b', Cancelado: '#ef4444' }[f.estado_pago] || '#6b7280'
                  return (
                    <tr key={f.numero_factura} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{f.numero_factura}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{f.cedula_cli}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{fmtDate(f.fecha)}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{f.metodo_pago || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: estadoColor + '18', color: estadoColor, fontWeight: 700, fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}>
                          {f.estado_pago || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => handleImprimirFactura(f)}
                          disabled={printingFac === f.numero_factura}
                          style={{
                            background: 'linear-gradient(135deg,#28a745,#20c997)', color: '#fff', border: 'none',
                            padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                          }}
                          title="Imprimir / PDF"
                        >
                          {printingFac === f.numero_factura
                            ? <span className="spinner-border spinner-border-sm"></span>
                            : <><i className="fas fa-print"></i> PDF</>
                          }
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventario de Productos */}
      <div className="inv-section">
        <div className="inv-section-header">
          <h3 className="inv-title"><i className="fas fa-boxes me-2"></i>Inventario de Productos</h3>
          <button className="inv-link-btn" onClick={() => setActiveSection('productos')}>
            <i className="fas fa-arrow-right me-1"></i>Ver productos
          </button>
        </div>

        <div className="inv-summary-row">
          <div className="inv-summary-card inv-critical">
            <div className="inv-summary-icon"><i className="fas fa-exclamation-circle"></i></div>
            <div className="inv-summary-body">
              <span className="inv-summary-num">{loadingStock ? '—' : criticos.length}</span>
              <span className="inv-summary-label">Stock crítico</span>
              <span className="inv-summary-sub">Stock real ≤ mínimo</span>
            </div>
          </div>
          <div className="inv-summary-card inv-warning">
            <div className="inv-summary-icon"><i className="fas fa-exclamation-triangle"></i></div>
            <div className="inv-summary-body">
              <span className="inv-summary-num">{loadingStock ? '—' : alertas.length}</span>
              <span className="inv-summary-label">Stock bajo</span>
              <span className="inv-summary-sub">Cerca del mínimo</span>
            </div>
          </div>
          <div className="inv-summary-card inv-ok">
            <div className="inv-summary-icon"><i className="fas fa-check-circle"></i></div>
            <div className="inv-summary-body">
              <span className="inv-summary-num">{loadingStock ? '—' : ok.length}</span>
              <span className="inv-summary-label">Stock óptimo</span>
              <span className="inv-summary-sub">Sin alertas activas</span>
            </div>
          </div>
        </div>

        {!loadingStock && productos.length > 0 && (
          <div className="inv-chart-card">
            <h4 className="inv-chart-title">
              <i className="fas fa-chart-bar me-2"></i>Nivel de stock por producto
            </h4>
            <div className="inv-bar-list">
              {productosSorted.map(prod => {
                const level = getStockLevel(prod)
                const pct = prod.stock_min > 0
                  ? Math.min(100, Math.round((prod.stock_real / prod.stock_min) * 100))
                  : 100
                const barColor = level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#22c55e'
                return (
                  <div key={prod.codigo_prod} className="inv-bar-row">
                    <div className="inv-bar-info">
                      <span className="inv-bar-name">{prod.nombres}</span>
                      <span className="inv-bar-nums" style={{ color: barColor }}>
                        {prod.stock_real} / {prod.stock_min}
                      </span>
                    </div>
                    <div className="inv-bar-track">
                      <div className="inv-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                      {prod.stock_min > 0 && <div className="inv-bar-min-line" title={`Mínimo: ${prod.stock_min}`} />}
                    </div>
                    <div className="inv-bar-ring">
                      <StockRing pct={pct} level={level} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loadingStock && (criticos.length > 0 || alertas.length > 0) && (
          <div className="inv-alert-section">
            <h4 className="inv-alert-title">
              <i className="fas fa-bell me-2"></i>Productos que necesitan reabastecimiento
            </h4>
            <div className="inv-alert-grid">
              {[...criticos, ...alertas].map(prod => {
                const level = getStockLevel(prod)
                const pct = prod.stock_min > 0 ? Math.min(100, Math.round((prod.stock_real / prod.stock_min) * 100)) : 0
                return (
                  <div key={prod.codigo_prod} className={`inv-alert-card inv-alert-${level}`}>
                    <div className="inv-alert-card-top">
                      <div className={`inv-alert-badge inv-badge-${level}`}>
                        <i className={`fas ${level === 'critical' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}`}></i>
                        {level === 'critical' ? 'Crítico' : 'Alerta'}
                      </div>
                      <StockRing pct={pct} level={level} />
                    </div>
                    <p className="inv-alert-card-name">{prod.nombres}</p>
                    <p className="inv-alert-card-code">{prod.codigo_prod}</p>
                    <div className="inv-alert-card-stocks">
                      <div className="inv-stock-item">
                        <span className="inv-stock-lbl">Actual</span>
                        <span className="inv-stock-val" style={{ color: level === 'critical' ? '#ef4444' : '#f59e0b' }}>{prod.stock_real}</span>
                      </div>
                      <div className="inv-stock-divider" />
                      <div className="inv-stock-item">
                        <span className="inv-stock-lbl">Mínimo</span>
                        <span className="inv-stock-val">{prod.stock_min}</span>
                      </div>
                      <div className="inv-stock-divider" />
                      <div className="inv-stock-item">
                        <span className="inv-stock-lbl">Faltan</span>
                        <span className="inv-stock-val inv-stock-falta">{Math.max(0, prod.stock_min - prod.stock_real)}</span>
                      </div>
                    </div>
                    <button className="inv-alert-btn" onClick={() => setActiveSection('productos')}>
                      <i className="fas fa-shopping-cart me-2"></i>Actualizar stock
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loadingStock && productos.length === 0 && (
          <p className="inv-empty"><i className="fas fa-box-open me-2"></i>No hay productos registrados aún.</p>
        )}
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const { admin, loginAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const renderSection = () => {
    switch (activeSection) {
      case 'administradores': return <AdministradorCrud />
      case 'categorias': return <CategoriaCrud />
      case 'clientes': return <ClienteCrud />
      case 'facturas': return <FacturaCrud />
      case 'domiciliarios': return <DomiciliarioCrud />
      case 'productos': return <ProductoCrud />
      case 'despachos': return <DespachoView />
      case 'responsables': return <ResponsableCrud />
      case 'tipoProducto': return <TipoProductoCrud />
      case 'transporte': return <TransporteCrud />
      case 'perfil': return <AdminPerfilSection admin={admin} loginAdmin={loginAdmin} />
      default: return <DashboardHome admin={admin} setActiveSection={setActiveSection} />
    }
  }

  const getSectionTitle = () => ({
    dashboard: 'Dashboard',
    administradores: 'Administradores',
    categorias: 'Categorías',
    clientes: 'Clientes',
    facturas: 'Facturas de Venta',
    domiciliarios: 'Domiciliarios',
    productos: 'Productos',
    despachos: 'Despachos',
    responsables: 'Responsables',
    tipoProducto: 'Tipos de Producto',
    transporte: 'Transportes / Vehículos',
    perfil: 'Mi Perfil',
  }[activeSection] || 'Dashboard')

  return (
    <div className="admin-layout">
      <AdminNavbar
        admin={admin}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h2 className="admin-page-title">{getSectionTitle()}</h2>
            <nav className="admin-breadcrumb">
              <span onClick={() => setActiveSection('dashboard')} className="breadcrumb-home">Dashboard</span>
              {activeSection !== 'dashboard' && (
                <><span className="breadcrumb-sep">/</span><span className="breadcrumb-current">{getSectionTitle()}</span></>
              )}
            </nav>
          </div>
          <div className="admin-topbar-right">
            <button
              className="admin-topbar-user"
              onClick={() => setActiveSection('perfil')}
              title="Mi Perfil"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <i className="fas fa-user-circle me-2"></i>
              <span>{admin?.nombres || 'Administrador'}</span>
              <i className="fas fa-chevron-down ms-2" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>
            </button>
          </div>
        </header>

        <main className="admin-main">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
