import React, { useState, useEffect } from 'react'
import responsableService from '../../../services/responsableService'
import CrudTable from './CrudTable'

const ESTADOS = ['Activo', 'Inactivo']
const EMPTY_FORM = { cedula_resp: '', nombres: '', telefono: '', correo: '', estado: 'Activo' }

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

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      cedula_resp: row.cedula_resp || '',
      nombres: row.nombres || '',
      telefono: row.telefono || '',
      correo: row.correo || '',
      estado: row.estado || 'Activo'
    })
    setFormError('')
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.cedula_resp) { setFormError('La cédula es requerida'); return }
    if (!form.nombres) { setFormError('El nombre es requerido'); return }
    if (!form.correo) { setFormError('El correo es requerido'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
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
    try {
      await responsableService.update(getId(item), {
        ...item,
        estado: item.estado === 'Activo' ? 'Inactivo' : 'Activo'
      })
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
    <div className="crud-container">
      <CrudTable
        title="Responsables"
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        filter={filter}
        onFilterChange={setFilter}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(item) => setDeleteTarget(item)}
        onToggleStatus={handleToggleStatus}
        getId={getId}
        statusField="estado"
        activeValue="Activo"
        filterPlaceholder="Buscar por nombre, cédula o correo..."
      />

      {/* Modal crear / editar */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? 'Editar Responsable' : 'Nuevo Responsable'}</h3>
              <button className="modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              {formError && (
                <div className="form-error-msg">
                  <i className="fas fa-exclamation-circle me-2"></i>{formError}
                </div>
              )}

              <div className="form-group">
                <label>Cédula *</label>
                <input
                  type="text"
                  value={form.cedula_resp}
                  onChange={e => setForm(p => ({ ...p, cedula_resp: e.target.value }))}
                  disabled={!!editingItem}
                  placeholder="Número de cédula"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombres *</label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="form-group">
                <label>Correo *</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={e => setForm(p => ({ ...p, correo: e.target.value }))}
                  placeholder="correo@empresa.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Responsable</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}><i className="fas fa-times"></i></button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <p style={{ color: '#475569', marginBottom: '0.5rem' }}>
                ¿Estás seguro de que deseas eliminar al responsable
              </p>
              <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                {deleteTarget.nombres} ({deleteTarget.cedula_resp})?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '1.5rem' }}>
                <i className="fas fa-exclamation-triangle me-1"></i>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
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
