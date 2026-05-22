import React, { useState, useEffect } from 'react'
import responsableService from '../../../services/responsableService'
import CrudTable from './CrudTable'

const ESTADOS = ['Activo', 'Inactivo']
const EMPTY_FORM = { cedula_resp: '', nombres: '', telefono: '', correo: '', contrasena: '', estado: 'Activo' }

const ResponsableCrud = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await responsableService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.cedula_resp

  const filtered = data.filter(item =>
    (item.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.correo || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.cedula_resp || '').toString().includes(filter)
  )

  const columns = [
    { key: 'cedula_resp', label: 'Cédula' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    {
      key: 'fecha_registro', label: 'Desde',
      render: (val) => val ? new Date(val).toLocaleDateString('es-CO') : '—'
    },
    {
      key: 'estado', label: 'Estado',
      render: (val) => (
        <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span>
      )
    }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowPass(false); setShowModal(true) }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      cedula_resp: row.cedula_resp || '',
      nombres: row.nombres || '',
      telefono: row.telefono || '',
      correo: row.correo || '',
      contrasena: '',
      estado: row.estado || 'Activo'
    })
    setFormError('')
    setShowPass(false)
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.cedula_resp) { setFormError('La cédula es requerida'); return }
    if (!form.nombres) { setFormError('El nombre es requerido'); return }
    if (!form.correo) { setFormError('El correo es requerido'); return }
    if (!editingItem && !form.contrasena) { setFormError('La contraseña es requerida para nuevos responsables'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
        // Si no se escribe nueva contraseña, enviar vacío (backend no la actualiza)
        await responsableService.update(getId(editingItem), form)
      } else {
        await responsableService.create(form)
      }
      closeModal()
      await load()
    } catch (e) {
      setFormError(e?.response?.data?.Message || 'Error al guardar')
    } finally { setIsSaving(false) }
  }

  const handleToggleStatus = async (item) => {
    const isActive = item.estado === 'Activo'
    if (!window.confirm(`¿Deseas ${isActive ? 'desactivar' : 'reactivar'} a "${item.nombres}"?`)) return
    try {
      await responsableService.update(getId(item), { ...item, estado: isActive ? 'Inactivo' : 'Activo', contrasena: '' })
      await load()
    } catch { alert('Error al cambiar estado') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await responsableService.remove(getId(deleteTarget))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'Error al eliminar')
    } finally { setIsDeleting(false) }
  }

  return (
    <div className="crud-section">
      <CrudTable
        title="Responsables"
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        filterValue={filter}
        onFilterChange={setFilter}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(item) => setDeleteTarget(item)}
        onToggleStatus={handleToggleStatus}
        statusField="estado"
        activeValue="Activo"
      />

      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Responsable' : 'Nuevo Responsable'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="fas fa-exclamation-circle me-2"></i>{formError}
                </div>
              )}

              <div className="form-group mb-3">
                <label className="form-label">Cédula *</label>
                <input
                  className="form-control"
                  type="text"
                  value={form.cedula_resp}
                  onChange={e => setForm(p => ({ ...p, cedula_resp: e.target.value }))}
                  disabled={!!editingItem}
                  placeholder="Número de cédula"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Nombres *</label>
                <input
                  className="form-control"
                  type="text"
                  value={form.nombres}
                  onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  type="text"
                  value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Correo *</label>
                <input
                  className="form-control"
                  type="email"
                  value={form.correo}
                  onChange={e => setForm(p => ({ ...p, correo: e.target.value }))}
                  placeholder="correo@empresa.com"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">
                  Contraseña {editingItem ? <span className="text-muted" style={{ fontSize: '0.8rem' }}>(dejar vacío para no cambiar)</span> : '*'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={showPass ? 'text' : 'password'}
                    value={form.contrasena}
                    onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))}
                    placeholder={editingItem ? 'Nueva contraseña (opcional)' : 'Contraseña de acceso'}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {!editingItem && (
                  <div className="form-text text-muted" style={{ fontSize: '0.8rem' }}>
                    <i className="fas fa-info-circle me-1"></i>El responsable usará este correo + contraseña para iniciar sesión
                  </div>
                )}
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={form.estado}
                  onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                >
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="crud-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-success" disabled={isSaving}>
                  {isSaving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                    : <><i className="fas fa-save me-2"></i>Guardar</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="crud-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="crud-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4><i className="fas fa-trash-alt me-2 text-danger"></i>Eliminar Responsable</h4>
              <button className="crud-modal-close" onClick={() => setDeleteTarget(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="crud-modal-body">
              <p className="mb-1" style={{ color: '#475569' }}>¿Estás seguro de eliminar al responsable</p>
              <p className="mb-3" style={{ fontWeight: 700, color: '#0f172a' }}>
                {deleteTarget.nombres} ({deleteTarget.cedula_resp})?
              </p>
              <div className="alert alert-warning py-2 mb-4" style={{ fontSize: '0.85rem' }}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Esta acción no se puede deshacer.
              </div>
              <div className="crud-modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Eliminando...</>
                    : <><i className="fas fa-trash me-1"></i>Eliminar</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponsableCrud
