import React, { useState, useEffect } from 'react'
import productoService from '../../../services/productoService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const EMPTY_FORM = {
  nombre: '', categoria: '', precio: '', stock: '', responsable: '',
  tipo: '', transporte: '', estado: 'Activo', descripcion: ''
}

const ProductoCrud = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [stockItem, setStockItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await productoService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.id_producto || item.id

  const filtered = data.filter(item =>
    (item.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.categoria || '').toLowerCase().includes(filter.toLowerCase()) ||
    (getId(item) || '').toString().includes(filter)
  )

  const columns = [
    { key: 'id_producto', label: 'ID', render: (_, row) => getId(row) },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'precio', label: 'Precio', render: (val) => val ? `$${Number(val).toLocaleString('es-CO')}` : '-' },
    { key: 'stock', label: 'Stock' },
    { key: 'estado', label: 'Estado', render: (val) => <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span> }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => { setEditingItem(row); setForm({ nombre: row.nombre || '', categoria: row.categoria || '', precio: row.precio || '', stock: row.stock || '', responsable: row.responsable || '', tipo: row.tipo || '', transporte: row.transporte || '', estado: row.estado || 'Activo', descripcion: row.descripcion || '' }); setFormError(''); setShowModal(true) }
  const closeModal = () => setShowModal(false)
  const openStock = (row) => { setStockItem(row); setShowStockModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.precio) { setFormError('Nombre y precio son requeridos'); return }
    setIsSaving(true)
    try {
      if (editingItem) await productoService.update(getId(editingItem), form)
      else await productoService.create(form)
      await load(); closeModal()
    } catch (e) { setFormError('Error al guardar. Intenta nuevamente.') } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await productoService.remove(getId(deleteTarget))
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
    if (!window.confirm(`¿Deseas ${accion} el producto "${row.nombre}"?`)) return
    try {
      await productoService.update(getId(row), { ...row, estado: isActive ? 'Inactivo' : 'Activo' })
      await load()
    } catch (e) { alert('Error al cambiar el estado') }
  }

  return (
    <div className="crud-section">
      <CrudTable title="Productos" columns={columns} data={filtered} onEdit={openEdit} onToggleStatus={handleToggleStatus} onDelete={(row) => setDeleteTarget(row)} onCreate={openCreate} filterValue={filter} onFilterChange={setFilter} isLoading={isLoading} />
      <ConfirmDeleteModal show={!!deleteTarget} itemName={deleteTarget?.nombre} isDeleting={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* Extra: Stock info links per row */}
      {data.length > 0 && !isLoading && (
        <div className="stock-section mt-4">
          <h5 className="stock-title"><i className="fas fa-boxes me-2"></i>Información de Stock</h5>
          <div className="stock-grid">
            {filtered.map(item => (
              <div key={getId(item)} className="stock-card" onClick={() => openStock(item)}>
                <div className="stock-card-name">{item.nombre}</div>
                <div className="stock-card-info">
                  <span className="stock-badge"><i className="fas fa-cubes me-1"></i>{item.stock || 0} uds</span>
                  <span className="stock-price">${Number(item.precio || 0).toLocaleString('es-CO')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal crud-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Producto' : 'Crear Producto'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Nombre *</label>
                    <input className="form-control" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del producto" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Categoría</label>
                    <input className="form-control" value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} placeholder="Cubiertos, Platos..." />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Precio *</label>
                    <input type="number" className="form-control" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} placeholder="15000" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-control" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="100" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Responsable</label>
                    <input className="form-control" value={form.responsable} onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))} placeholder="Nombre del responsable" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Tipo de Producto</label>
                    <input className="form-control" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} placeholder="Biodegradable, Germinable..." />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Tipo de Transporte</label>
                    <input className="form-control" value={form.transporte} onChange={e => setForm(p => ({ ...p, transporte: e.target.value }))} placeholder="Domicilio, Recogida..." />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Estado</label>
                    <select className="form-select" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group mb-4">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción del producto..." rows="2" />
                  </div>
                </div>
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

      {showStockModal && stockItem && (
        <div className="crud-modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4><i className="fas fa-boxes me-2"></i>Detalle de Stock</h4>
              <button className="crud-modal-close" onClick={() => setShowStockModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="crud-modal-body">
              <div className="stock-detail-grid">
                <div className="stock-detail-item"><span className="stock-detail-label">Producto</span><span className="stock-detail-value">{stockItem.nombre}</span></div>
                <div className="stock-detail-item"><span className="stock-detail-label">Cantidad Actual</span><span className="stock-detail-value stock-amount">{stockItem.stock || 0} unidades</span></div>
                <div className="stock-detail-item"><span className="stock-detail-label">Precio</span><span className="stock-detail-value">${Number(stockItem.precio || 0).toLocaleString('es-CO')}</span></div>
                <div className="stock-detail-item"><span className="stock-detail-label">Responsable</span><span className="stock-detail-value">{stockItem.responsable || 'No asignado'}</span></div>
                <div className="stock-detail-item"><span className="stock-detail-label">Tipo de Producto</span><span className="stock-detail-value">{stockItem.tipo || 'N/A'}</span></div>
                <div className="stock-detail-item"><span className="stock-detail-label">Tipo de Transporte</span><span className="stock-detail-value">{stockItem.transporte || 'N/A'}</span></div>
                <div className="stock-detail-item"><span className="stock-detail-label">Estado</span><span className={`status-badge ${stockItem.estado === 'Activo' ? 'active' : 'inactive'}`}>{stockItem.estado}</span></div>
              </div>
            </div>
            <div className="crud-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Cerrar</button>
              <button className="btn btn-success" onClick={() => { setShowStockModal(false); openEdit(stockItem) }}><i className="fas fa-edit me-2"></i>Editar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductoCrud
