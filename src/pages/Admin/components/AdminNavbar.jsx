import React from 'react'
import './AdminNavbar.css'

const AdminNavbar = ({ admin, activeSection, setActiveSection, onLogout, isOpen }) => {
  const navGroups = [
    {
      label: 'Principal',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
      ]
    },
    {
      label: 'Catálogo',
      items: [
        { key: 'productos', label: 'Productos', icon: 'fas fa-box' },
        { key: 'descuentos', label: 'Descuentos', icon: 'fas fa-percent' },
        { key: 'categorias', label: 'Categorías', icon: 'fas fa-tags' },
        { key: 'tipoProducto', label: 'Tipos de Producto', icon: 'fas fa-cubes' },
      ]
    },
    {
      label: 'Operaciones',
      items: [
        { key: 'facturas', label: 'Facturas', icon: 'fas fa-file-invoice-dollar' },
        { key: 'despachos', label: 'Despachos', icon: 'fas fa-shipping-fast' },
        { key: 'domiciliarios', label: 'Domiciliarios', icon: 'fas fa-motorcycle' },
        { key: 'transporte', label: 'Transportes', icon: 'fas fa-truck' },
      ]
    },
    {
      label: 'Personas',
      items: [
        { key: 'clientes', label: 'Clientes', icon: 'fas fa-users' },
        { key: 'responsables', label: 'Responsables', icon: 'fas fa-user-tie' },
        { key: 'administradores', label: 'Administradores', icon: 'fas fa-user-shield' },
      ]
    },
  ]

  return (
    <aside className={`admin-sidebar${isOpen ? ' open' : ''}`}>
      <div className="admin-sidebar-header">
        <img src="/img/logoNewLife.png" alt="NEW LIFE" className="admin-logo" />
        <h2 className="admin-brand">NEW LIFE</h2>
        <p className="admin-brand-sub">Panel Admin</p>
      </div>

      <nav className="admin-nav">
        {navGroups.map(group => (
          <div key={group.label} className="admin-nav-group">
            <span className="admin-nav-group-label">{group.label}</span>
            {group.items.map(item => (
              <button
                key={item.key}
                className={`admin-nav-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => setActiveSection(item.key)}
              >
                <i className={`${item.icon} admin-nav-icon`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="admin-user-details">
            <span className="admin-user-name">{admin?.nombres || 'Administrador'}</span>
            <span className="admin-user-role">Administrador</span>
          </div>
        </div>
        <button className="admin-logout-btn" onClick={onLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default AdminNavbar
