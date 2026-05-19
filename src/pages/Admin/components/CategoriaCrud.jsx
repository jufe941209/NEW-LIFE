import React, { useState, useEffect } from 'react'
import categoriaService from '../../../services/categoriaService'
import CrudTable from './CrudTable'

const EMPTY_FORM = { nombre: '', descripcion: '', estado: 'Activo' }

const CategoriaCrud = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await categoriaService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.id_categoria || item.id

  const filtered = data.filter(item =>
    (item.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.descripcion || '').toLowerCase().includes(filter.toLowerCase())
  )

  const columns = [
    { key: 'id_categoria', label: 'ID', render: (_, row) => getId(row) },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado', render: (val) => <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span> }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => { setEditingItem(row); setForm({ nombre: row.nombre || '', descripcion: row.descripcion || '', estado: row.estado || 'Activo' }); setFormError(''); setShowModal(true) }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombre) { setFormError('El nombre es requerido'); return }
    setIsSaving(true)
    try {
      if (editingItem) await categoriaService.update(getId(editingItem), form)
      else await categoriaService.create(form)
      await load()
      closeModal()
    } catch (e) { setFormError('Error al guardar. Intenta nuevamente.') } finally { setIsSaving(false) }
  }

  const handleToggleStatus = async (row) => {
    const isActive = row.estado === 'Activo'
    const accion = isActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Deseas ${accion} la categoría "${row.nombre}"?`)) return
    try {
      await categoriaService.update(getId(row), { ...row, estado: isActive ? 'Inactivo' : 'Activo' })
      await load()
    } catch (e) { alert('Error al cambiar el estado') }
  }

  return (
    <div className="crud-section">
      <CrudTable title="Categorías" columns={columns} data={filtered} onEdit={openEdit} onToggleStatus={handleToggleStatus} onCreate={openCreate} filterValue={filter} onFilterChange={setFilter} isLoading={isLoading} />
      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Categoría' : 'Crear Categoría'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="form-group mb-3">
                <label className="form-label">Nombre *</label>
                <input className="form-control" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre de la categoría" required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción de la categoría" rows="3" />
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

export default CategoriaCrud
