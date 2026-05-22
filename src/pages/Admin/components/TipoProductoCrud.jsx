import React, { useState, useEffect } from 'react'
import tipoProductoService from '../../../services/tipoProductoService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const EMPTY_FORM = { nombre: '', descripcion: '' }

const TipoProductoCrud = () => {
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
      const result = await tipoProductoService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.id_tipo_producto

  const filtered = data.filter(item =>
    (item.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.descripcion || '').toLowerCase().includes(filter.toLowerCase())
  )

  const columns = [
    { key: 'id_tipo_producto', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({ nombre: row.nombre || '', descripcion: row.descripcion || '' })
    setFormError('')
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setFormError('El nombre es requerido'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
        await tipoProductoService.update(getId(editingItem), { ...form, id_tipo_producto: getId(editingItem) })
      } else {
        await tipoProductoService.create(form)
      }
      closeModal()
      await load()
    } catch (e) {
      setFormError(e?.response?.data?.Message || 'Error al guardar')
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await tipoProductoService.remove(getId(deleteTarget))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'No se pudo eliminar. Puede tener productos asociados.')
    } finally { setIsDeleting(false) }
  }

  return (
    <div className="crud-section">
      <CrudTable
        title="Tipos de Producto"
        columns={columns}
        data={filtered}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        onCreate={openCreate}
        filterValue={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
      />

      <ConfirmDeleteModal
        show={!!deleteTarget}
        itemName={`Tipo "${deleteTarget?.nombre}"`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}

              <div className="form-group mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  className="form-control"
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="ej. Biodegradable, Reutilizable..."
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Descripción del tipo de producto"
                />
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
    </div>
  )
}

export default TipoProductoCrud
