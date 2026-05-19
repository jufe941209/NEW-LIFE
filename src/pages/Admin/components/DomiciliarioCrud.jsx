import React, { useState, useEffect } from 'react'
import domiciliarioService from '../../../services/domiciliarioService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const EMPTY_FORM = { cedula_dom: '', nombres: '', telefono: '', zona: '', estado: 'Activo' }

const DomiciliarioCrud = () => {
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
      const result = await domiciliarioService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.cedula_dom || item.id

  const filtered = data.filter(item =>
    (item.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.zona || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.cedula_dom || '').toString().includes(filter)
  )

  const columns = [
    { key: 'cedula_dom', label: 'Cédula', render: (_, row) => getId(row) },
    { key: 'nombres', label: 'Nombres' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'zona', label: 'Zona' },
    { key: 'estado', label: 'Estado', render: (val) => <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span> }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => { setEditingItem(row); setForm({ cedula_dom: row.cedula_dom || '', nombres: row.nombres || '', telefono: row.telefono || '', zona: row.zona || '', estado: row.estado || 'Activo' }); setFormError(''); setShowModal(true) }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres) { setFormError('El nombre es requerido'); return }
    setIsSaving(true)
    try {
      if (editingItem) await domiciliarioService.update(getId(editingItem), form)
      else await domiciliarioService.create(form)
      await load(); closeModal()
    } catch (e) { setFormError('Error al guardar. Intenta nuevamente.') } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await domiciliarioService.remove(getId(deleteTarget))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      const msg = e?.response?.data?.Message || 'No se pudo eliminar. Puede tener registros asociados.'
      alert(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (row) => {
    const isActive = row.estado === 'Activo'
    const accion = isActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Deseas ${accion} al domiciliario "${row.nombres}"?`)) return
    try {
      await domiciliarioService.update(getId(row), { ...row, estado: isActive ? 'Inactivo' : 'Activo' })
      await load()
    } catch (e) { alert('Error al cambiar el estado') }
  }

  return (
    <div className="crud-section">
      <CrudTable title="Domiciliarios" columns={columns} data={filtered} onEdit={openEdit} onToggleStatus={handleToggleStatus} onDelete={(row) => setDeleteTarget(row)} onCreate={openCreate} filterValue={filter} onFilterChange={setFilter} isLoading={isLoading} />
      <ConfirmDeleteModal show={!!deleteTarget} itemName={deleteTarget?.nombres || deleteTarget?.cedula_dom} isDeleting={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Domiciliario' : 'Crear Domiciliario'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="form-group mb-3">
                <label className="form-label">Cédula</label>
                <input className="form-control" value={form.cedula_dom} onChange={e => setForm(p => ({ ...p, cedula_dom: e.target.value }))} disabled={!!editingItem} placeholder="12345678" />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Nombres *</label>
                <input className="form-control" value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Juan Pérez" required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="3001234567" />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Zona</label>
                <input className="form-control" value={form.zona} onChange={e => setForm(p => ({ ...p, zona: e.target.value }))} placeholder="Norte, Sur, Centro..." />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="crud-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-success" disabled={isSaving}>
                  {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</> : <><i className="fas fa-save me-2"></i>Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomiciliarioCrud
