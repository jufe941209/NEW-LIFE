import React, { useState, useEffect } from 'react'
import facturaService from '../../../services/facturaService'
import CrudTable from './CrudTable'

const EMPTY_FORM = { fecha: '', cliente: '', total: '', estado: 'Pendiente' }

const FacturaCrud = () => {
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
      const result = await facturaService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.id_factura || item.id

  const filtered = data.filter(item =>
    (item.cliente || '').toLowerCase().includes(filter.toLowerCase()) ||
    (getId(item) || '').toString().includes(filter)
  )

  const columns = [
    { key: 'id_factura', label: 'ID', render: (_, row) => getId(row) },
    { key: 'fecha', label: 'Fecha', render: (val) => val ? new Date(val).toLocaleDateString('es-CO') : '-' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'total', label: 'Total', render: (val) => val ? `$${Number(val).toLocaleString('es-CO')}` : '-' },
    { key: 'estado', label: 'Estado', render: (val) => <span className={`status-badge ${val === 'Pagado' ? 'active' : val === 'Pendiente' ? 'pending' : 'inactive'}`}>{val}</span> }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => { setEditingItem(row); setForm({ fecha: row.fecha || '', cliente: row.cliente || '', total: row.total || '', estado: row.estado || 'Pendiente' }); setFormError(''); setShowModal(true) }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.cliente || !form.total) { setFormError('Cliente y total son requeridos'); return }
    setIsSaving(true)
    try {
      if (editingItem) await facturaService.update(getId(editingItem), form)
      else await facturaService.create(form)
      await load(); closeModal()
    } catch (e) { setFormError('Error al guardar. Intenta nuevamente.') } finally { setIsSaving(false) }
  }

  const handleToggleStatus = async (row) => {
    const isCancelled = row.estado === 'Cancelado'
    const accion = isCancelled ? 'reactivar (Pendiente)' : 'cancelar'
    if (!window.confirm(`¿Deseas ${accion} la factura #${getId(row)}?`)) return
    try {
      await facturaService.update(getId(row), { ...row, estado: isCancelled ? 'Pendiente' : 'Cancelado' })
      await load()
    } catch (e) { alert('Error al cambiar el estado') }
  }

  return (
    <div className="crud-section">
      <CrudTable title="Facturas de Venta" columns={columns} data={filtered} onEdit={openEdit} onToggleStatus={handleToggleStatus} onCreate={openCreate} filterValue={filter} onFilterChange={setFilter} isLoading={isLoading} activeValue="Pagado" />
      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Factura' : 'Crear Factura'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="form-group mb-3">
                <label className="form-label">Fecha</label>
                <input type="date" className="form-control" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Cliente *</label>
                <input className="form-control" value={form.cliente} onChange={e => setForm(p => ({ ...p, cliente: e.target.value }))} placeholder="Nombre del cliente" required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Total *</label>
                <input type="number" className="form-control" value={form.total} onChange={e => setForm(p => ({ ...p, total: e.target.value }))} placeholder="150000" required />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Cancelado">Cancelado</option>
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

export default FacturaCrud
