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
import productoService from '../../services/productoService'
import './AdminDashboard.css'

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

  useEffect(() => {
    productoService.getAll()
      .then(d => setProductos(Array.isArray(d) ? d : []))
      .catch(() => setProductos([]))
      .finally(() => setLoadingStock(false))
  }, [])

  const stats = [
    { label: 'Administradores', icon: 'fas fa-user-shield', color: '#6366f1', section: 'administradores' },
    { label: 'Categorías', icon: 'fas fa-tags', color: '#f59e0b', section: 'categorias' },
    { label: 'Clientes', icon: 'fas fa-users', color: '#10b981', section: 'clientes' },
    { label: 'Facturas', icon: 'fas fa-file-invoice-dollar', color: '#3b82f6', section: 'facturas' },
    { label: 'Domiciliarios', icon: 'fas fa-motorcycle', color: '#ef4444', section: 'domiciliarios' },
    { label: 'Productos', icon: 'fas fa-box', color: '#8b5cf6', section: 'productos' },
  ]

  const criticos = productos.filter(p => getStockLevel(p) === 'critical')
  const alertas  = productos.filter(p => getStockLevel(p) === 'warning')
  const ok       = productos.filter(p => getStockLevel(p) === 'ok')

  const productosSorted = [...productos].sort((a, b) => {
    const order = { critical: 0, warning: 1, ok: 2 }
    return order[getStockLevel(a)] - order[getStockLevel(b)]
  })

  return (
    <div className="dashboard-home">
      <div className="dashboard-welcome">
        <h1 className="dashboard-title">
          <i className="fas fa-tachometer-alt me-3"></i>
          Panel de Administración
        </h1>
        <p className="dashboard-subtitle">
          Bienvenido de nuevo, <strong>{admin?.nombres || 'Administrador'}</strong>.
          Gestiona todos los recursos de NEW LIFE desde aquí.
        </p>
      </div>

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
              <p className="stat-card-action">Gestionar <i className="fas fa-arrow-right ms-1"></i></p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== INVENTARIO ===== */}
      <div className="inv-section">
        <div className="inv-section-header">
          <h3 className="inv-title"><i className="fas fa-boxes me-2"></i>Inventario de Productos</h3>
          <button className="inv-link-btn" onClick={() => setActiveSection('productos')}>
            <i className="fas fa-arrow-right me-1"></i>Ver productos
          </button>
        </div>

        {/* Resumen de stock */}
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

        {/* Gráfica de barras: todos los productos */}
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
                      <div
                        className="inv-bar-fill"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                      {prod.stock_min > 0 && (
                        <div className="inv-bar-min-line" title={`Mínimo: ${prod.stock_min}`} />
                      )}
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

        {/* Cards de productos críticos / alerta */}
        {!loadingStock && (criticos.length > 0 || alertas.length > 0) && (
          <div className="inv-alert-section">
            <h4 className="inv-alert-title">
              <i className="fas fa-bell me-2"></i>
              Productos que necesitan reabastecimiento
            </h4>
            <div className="inv-alert-grid">
              {[...criticos, ...alertas].map(prod => {
                const level = getStockLevel(prod)
                const pct = prod.stock_min > 0
                  ? Math.min(100, Math.round((prod.stock_real / prod.stock_min) * 100))
                  : 0
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
                        <span className="inv-stock-val" style={{ color: level === 'critical' ? '#ef4444' : '#f59e0b' }}>
                          {prod.stock_real}
                        </span>
                      </div>
                      <div className="inv-stock-divider" />
                      <div className="inv-stock-item">
                        <span className="inv-stock-lbl">Mínimo</span>
                        <span className="inv-stock-val">{prod.stock_min}</span>
                      </div>
                      <div className="inv-stock-divider" />
                      <div className="inv-stock-item">
                        <span className="inv-stock-lbl">Faltan</span>
                        <span className="inv-stock-val inv-stock-falta">
                          {Math.max(0, prod.stock_min - prod.stock_real)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="inv-alert-btn"
                      onClick={() => setActiveSection('productos')}
                    >
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

/**
 * AdminDashboard - Panel principal de administración
 */
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
      default: return <DashboardHome admin={admin} setActiveSection={setActiveSection} />
    }
  }

  const getSectionTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      administradores: 'Administradores',
      categorias: 'Categorías',
      clientes: 'Clientes',
      facturas: 'Facturas de Venta',
      domiciliarios: 'Domiciliarios',
      productos: 'Productos',
      despachos: 'Despachos',
      responsables: 'Responsables',
    }
    return titles[activeSection] || 'Dashboard'
  }

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
            <div className="admin-topbar-user">
              <i className="fas fa-user-circle me-2"></i>
              <span>{admin?.nombres || 'Administrador'}</span>
            </div>
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
