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
import './AdminDashboard.css'

/**
 * DashboardHome - Vista inicial del dashboard con estadísticas
 */
const DashboardHome = ({ admin, setActiveSection }) => {
  const stats = [
    { label: 'Administradores', icon: 'fas fa-user-shield', color: '#6366f1', section: 'administradores' },
    { label: 'Categorías', icon: 'fas fa-tags', color: '#f59e0b', section: 'categorias' },
    { label: 'Clientes', icon: 'fas fa-users', color: '#10b981', section: 'clientes' },
    { label: 'Facturas', icon: 'fas fa-file-invoice-dollar', color: '#3b82f6', section: 'facturas' },
    { label: 'Domiciliarios', icon: 'fas fa-motorcycle', color: '#ef4444', section: 'domiciliarios' },
    { label: 'Productos', icon: 'fas fa-box', color: '#8b5cf6', section: 'productos' },
  ]

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

      <div className="dashboard-info-cards">
        <div className="info-card-admin">
          <div className="info-card-header">
            <i className="fas fa-leaf"></i>
            <h4>NEW LIFE - Sistema de Gestión</h4>
          </div>
          <p>Bienvenido al panel administrativo de NEW LIFE. Aquí puedes gestionar todos los recursos del sistema: administradores, categorías, clientes, facturas, domiciliarios y productos.</p>
          <div className="info-card-features">
            <span><i className="fas fa-check-circle me-2"></i>CRUD completo de entidades</span>
            <span><i className="fas fa-check-circle me-2"></i>Búsqueda y filtrado en tiempo real</span>
            <span><i className="fas fa-check-circle me-2"></i>Integración con API REST</span>
            <span><i className="fas fa-check-circle me-2"></i>Gestión de stock de productos</span>
          </div>
        </div>
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
      productos: 'Productos'
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
