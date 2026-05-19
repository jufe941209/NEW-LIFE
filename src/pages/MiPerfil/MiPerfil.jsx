import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import clienteService from '../../services/clienteService'
import { PageHeader } from '../../components/organisms'
import './MiPerfil.css'

const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI']
const TIPOS_CLIENTE = ['Natural', 'Juridico']

const MiPerfil = () => {
  const { cliente, loginCliente, logoutCliente } = useAuth()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    nombres: cliente?.nombres || '',
    correo: cliente?.correo || '',
    telefono: cliente?.telefono || '',
    direccion: cliente?.direccion || '',
    tipo_documento: cliente?.tipo_documento || 'CC',
    tipo_cliente: cliente?.tipo_cliente || 'Natural',
    contrasena: ''
  })

  if (!cliente) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres || !form.correo) { setErrorMsg('Nombres y correo son requeridos'); return }
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const payload = {
        ...cliente,
        nombres: form.nombres,
        correo: form.correo,
        telefono: form.telefono,
        direccion: form.direccion,
        tipo_documento: form.tipo_documento,
        tipo_cliente: form.tipo_cliente
      }
      if (form.contrasena) payload.contrasena = form.contrasena

      await clienteService.update(cliente.numero_identificacion, payload)

      // Actualizar sesión local
      loginCliente({ ...cliente, ...payload })
      setSuccessMsg('¡Perfil actualizado correctamente!')
      setEditMode(false)
      setForm(prev => ({ ...prev, contrasena: '' }))
    } catch (e) {
      setErrorMsg(e?.response?.data?.Message || 'Error al actualizar el perfil.')
    } finally { setIsSaving(false) }
  }

  const handleLogout = () => {
    logoutCliente()
    navigate('/login')
  }

  const infoItems = [
    { icon: 'fas fa-id-card', label: 'Número de Identificación', value: cliente.numero_identificacion },
    { icon: 'fas fa-file-alt', label: 'Tipo de Documento', value: cliente.tipo_documento },
    { icon: 'fas fa-user-tag', label: 'Tipo de Cliente', value: cliente.tipo_cliente },
    { icon: 'fas fa-envelope', label: 'Correo', value: cliente.correo },
    { icon: 'fas fa-phone', label: 'Teléfono', value: cliente.telefono || 'No registrado' },
    { icon: 'fas fa-map-marker-alt', label: 'Dirección', value: cliente.direccion || 'No registrada' },
    { icon: 'fas fa-calendar', label: 'Fecha de Registro', value: cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' },
    { icon: 'fas fa-circle', label: 'Estado', value: cliente.estado, badge: true }
  ]

  return (
    <div className="mi-perfil-page">
      <PageHeader
        items={[{ label: 'Inicio', path: '/' }, { label: 'Mi Perfil', path: '/mi-perfil' }]}
        title="Mi Perfil"
        subtitle="Administra tu información personal"
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Avatar + nombre */}
            <div className="perfil-hero">
              <div className="perfil-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="perfil-hero-info">
                <h2 className="perfil-nombre">{cliente.nombres}</h2>
                <p className="perfil-correo">{cliente.correo}</p>
                <span className={`perfil-badge ${cliente.estado === 'Activo' ? 'active' : 'inactive'}`}>
                  <i className="fas fa-circle me-1" style={{ fontSize: '0.5rem' }}></i>
                  {cliente.estado}
                </span>
              </div>
              <div className="perfil-hero-actions">
                {!editMode && (
                  <button className="btn btn-success" onClick={() => setEditMode(true)}>
                    <i className="fas fa-edit me-2"></i>Editar Perfil
                  </button>
                )}
                <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                </button>
              </div>
            </div>

            {successMsg && (
              <div className="alert alert-success"><i className="fas fa-check-circle me-2"></i>{successMsg}</div>
            )}
            {errorMsg && (
              <div className="alert alert-danger"><i className="fas fa-exclamation-circle me-2"></i>{errorMsg}</div>
            )}

            {/* Vista de datos */}
            {!editMode && (
              <div className="perfil-info-card">
                <h4 className="perfil-section-title"><i className="fas fa-info-circle me-2"></i>Información Personal</h4>
                <div className="perfil-info-grid">
                  {infoItems.map(item => (
                    <div key={item.label} className="perfil-info-item">
                      <div className="perfil-info-icon"><i className={item.icon}></i></div>
                      <div className="perfil-info-content">
                        <span className="perfil-info-label">{item.label}</span>
                        {item.badge
                          ? <span className={`perfil-badge ${item.value === 'Activo' ? 'active' : 'inactive'}`}>{item.value}</span>
                          : <span className="perfil-info-value">{item.value}</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <div className="perfil-quick-links">
                  <button className="perfil-quick-btn" onClick={() => navigate('/mis-compras')}>
                    <i className="fas fa-shopping-bag"></i>
                    <span>Mis Compras</span>
                  </button>
                  <button className="perfil-quick-btn" onClick={() => navigate('/cart')}>
                    <i className="fas fa-shopping-cart"></i>
                    <span>Mi Carrito</span>
                  </button>
                  <button className="perfil-quick-btn" onClick={() => navigate('/shop')}>
                    <i className="fas fa-store"></i>
                    <span>Ver Tienda</span>
                  </button>
                  <button className="perfil-quick-btn" onClick={() => navigate('/contact')}>
                    <i className="fas fa-headset"></i>
                    <span>Soporte</span>
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de edición */}
            {editMode && (
              <div className="perfil-edit-card">
                <h4 className="perfil-section-title"><i className="fas fa-edit me-2"></i>Editar Información</h4>
                <form onSubmit={handleSave}>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Tipo de Documento</label>
                      <select name="tipo_documento" className="form-select" value={form.tipo_documento} onChange={handleChange}>
                        {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Tipo de Cliente</label>
                      <select name="tipo_cliente" className="form-select" value={form.tipo_cliente} onChange={handleChange}>
                        {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">N° Identificación</label>
                      <input className="form-control" value={cliente.numero_identificacion} disabled />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Nombres Completos *</label>
                      <input name="nombres" className="form-control" value={form.nombres} onChange={handleChange} required />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Correo Electrónico *</label>
                      <input type="email" name="correo" className="form-control" value={form.correo} onChange={handleChange} required />
                    </div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input name="telefono" className="form-control" value={form.telefono} onChange={handleChange} placeholder="3001234567" />
                    </div>
                    <div className="col-md-7 mb-3">
                      <label className="form-label">Dirección</label>
                      <input name="direccion" className="form-control" value={form.direccion} onChange={handleChange} placeholder="Calle 45 #10-20, Bogotá" />
                    </div>
                    <div className="col-12 mb-4">
                      <label className="form-label">Nueva Contraseña <span className="text-muted">(déjalo vacío para no cambiarla)</span></label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="contrasena"
                          className="form-control"
                          value={form.contrasena}
                          onChange={handleChange}
                          placeholder="••••••••"
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success flex-grow-1" disabled={isSaving}>
                      {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="fas fa-save me-2"></i>Guardar Cambios</>}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditMode(false); setErrorMsg(''); setSuccessMsg('') }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiPerfil
