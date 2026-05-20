import React, { useState, useEffect } from 'react'
import categoriaService from '../../../services/categoriaService'
import productoService from '../../../services/productoService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const EMPTY_FORM = { nombre: '', descripcion: '' }

const CategoriaCrud = () => {
  const [data, setData] = useState([])
  const [productos, setProductos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete flow
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [needsReassign, setNeedsReassign] = useState(false)
  const [reassignTo, setReassignTo] = useState('')

  const load = async () => {
    setIsLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        categoriaService.getAll(),
        productoService.getAll().catch(() => [])
      ])
      setData(Array.isArray(cats) ? cats : [])
      setProductos(Array.isArray(prods) ? prods : [])
    } catch (e) {
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.numero_categoria

  const getProductosDeCategoria = (cat) =>
    productos.filter(p => p.numero_categoria === cat.numero_categoria)

  const filtered = data.filter(item =>
    (item.nombre || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.descripcion || '').toLowerCase().includes(filter.toLowerCase()) ||
    String(item.numero_categoria || '').includes(filter)
  )

  const columns = [
    { key: 'numero_categoria', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'productos_count', label: 'Productos',
      render: (_, row) => {
        const count = getProductosDeCategoria(row).length
        return (
          <span className={`badge ${count > 0 ? 'bg-success' : 'bg-secondary'}`}>
            {count} {count === 1 ? 'producto' : 'productos'}
          </span>
        )
      }
    }
  ]

  const openCreate = () => {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

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
        await categoriaService.update(getId(editingItem), {
          ...form,
          numero_categoria: getId(editingItem)
        })
      } else {
        await categoriaService.create(form)
      }
      await load()
      closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.Message || 'Error al guardar. Intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const initiateDelete = (row) => {
    const afectados = getProductosDeCategoria(row)
    setDeleteTarget({ ...row, afectados })
    if (afectados.length > 0) {
      setNeedsReassign(true)
      const otra = data.find(c => c.numero_categoria !== row.numero_categoria)
      setReassignTo(otra ? String(otra.numero_categoria) : '')
    } else {
      setNeedsReassign(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (needsReassign && deleteTarget.afectados?.length > 0) {
        const targetId = Number(reassignTo)
        for (const prod of deleteTarget.afectados) {
          await productoService.update(prod.codigo_prod, {
            ...prod,
            numero_categoria: targetId,
            temperatura_uso: prod.temperatura_uso || null,
            capacidad: prod.capacidad || null
          })
        }
      }
      await categoriaService.remove(getId(deleteTarget))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      const msg = e?.response?.data?.Message || 'No se pudo completar la operación.'
      alert(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const otrasCategories = data.filter(c =>
    deleteTarget && c.numero_categoria !== deleteTarget.numero_categoria
  )

  return (
    <div className="crud-section">
      <CrudTable
        title="Categorías"
        columns={columns}
        data={filtered}
        onEdit={openEdit}
        onDelete={initiateDelete}
        onCreate={openCreate}
        filterValue={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
      />

      {/* Modal normal sin productos asociados */}
      {!needsReassign && (
        <ConfirmDeleteModal
          show={!!deleteTarget}
          itemName={deleteTarget?.nombre}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Modal de reasignación cuando hay productos asociados */}
      {needsReassign && deleteTarget && (
        <div className="crud-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="crud-modal confirm-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header confirm-delete-header">
              <h4><i className="fas fa-exchange-alt me-2"></i>Categoría con productos</h4>
              <button className="crud-modal-close" onClick={() => setDeleteTarget(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="reassign-modal-body">
              <div className="reassign-modal-icon">
                <i className="fas fa-layer-group"></i>
              </div>
              <p className="reassign-modal-title">Reasignar y eliminar</p>
              <p className="reassign-modal-desc">
                La categoría <strong>"{deleteTarget.nombre}"</strong> tiene{' '}
                <strong>{deleteTarget.afectados.length} producto{deleteTarget.afectados.length !== 1 ? 's' : ''}</strong> asociado{deleteTarget.afectados.length !== 1 ? 's' : ''}.
                Debes reasignarlos antes de eliminarla.
              </p>

              <div className="reassign-badges-list">
                {deleteTarget.afectados.slice(0, 6).map(p => (
                  <span key={p.codigo_prod} className="badge bg-white text-dark border" style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}>
                    <i className="fas fa-box me-1 text-success"></i>
                    {p.nombres || p.codigo_prod}
                  </span>
                ))}
                {deleteTarget.afectados.length > 6 && (
                  <span className="badge bg-secondary" style={{ fontSize: '0.8rem' }}>+{deleteTarget.afectados.length - 6} más</span>
                )}
              </div>

              {otrasCategories.length > 0 ? (
                <>
                  <p className="reassign-select-label">Mover productos a:</p>
                  <select
                    className="form-select"
                    value={reassignTo}
                    onChange={e => setReassignTo(e.target.value)}
                    disabled={isDeleting}
                  >
                    {otrasCategories.map(c => (
                      <option key={c.numero_categoria} value={c.numero_categoria}>
                        #{c.numero_categoria} — {c.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="reassign-warning">
                    <i className="fas fa-triangle-exclamation"></i>
                    <span>Los productos serán movidos a la categoría seleccionada y esta categoría se eliminará definitivamente.</span>
                  </div>
                </>
              ) : (
                <div className="reassign-no-target">
                  <i className="fas fa-ban me-2"></i>
                  No hay otras categorías disponibles. Crea primero una categoría destino.
                </div>
              )}
            </div>

            <div className="reassign-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                <i className="fas fa-arrow-left me-2"></i>Cancelar
              </button>
              {otrasCategories.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting || !reassignTo}
                >
                  {isDeleting
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
                    : <><i className="fas fa-exchange-alt me-2"></i>Reasignar y eliminar</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CARD: Productos por categoría ===== */}
      {!isLoading && data.length > 0 && (
        <div className="cat-productos-section">
          <h5 className="cat-productos-title">
            <i className="fas fa-sitemap me-2"></i>
            Organización de Productos por Categoría
          </h5>
          <div className="cat-productos-grid">
            {data.map(cat => {
              const prods = getProductosDeCategoria(cat)
              return (
                <div key={cat.numero_categoria} className="cat-card">
                  <div className="cat-card-header">
                    <span className="cat-card-name">{cat.nombre}</span>
                    <span className="badge bg-success">{prods.length}</span>
                  </div>
                  {prods.length === 0 ? (
                    <p className="cat-card-empty">Sin productos</p>
                  ) : (
                    <ul className="cat-card-list">
                      {prods.map(prod => (
                        <li key={prod.codigo_prod} className="cat-card-item">
                          <span className="cat-prod-name">
                            <i className="fas fa-leaf me-1 text-success"></i>
                            {prod.nombres}
                          </span>
                          <select
                            className="cat-prod-move"
                            value={cat.numero_categoria}
                            onChange={async (e) => {
                              const targetId = Number(e.target.value)
                              if (targetId === cat.numero_categoria) return
                              try {
                                await productoService.update(prod.codigo_prod, {
                                  ...prod,
                                  numero_categoria: targetId,
                                  temperatura_uso: prod.temperatura_uso || null,
                                  capacidad: prod.capacidad || null
                                })
                                await load()
                              } catch {
                                alert('No se pudo mover el producto')
                              }
                            }}
                          >
                            {data.map(c => (
                              <option key={c.numero_categoria} value={c.numero_categoria}>
                                {c.numero_categoria === cat.numero_categoria ? '— Mover a —' : c.nombre}
                              </option>
                            ))}
                          </select>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal crear / editar */}
      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Categoría' : 'Crear Categoría'}</h4>
              <button className="crud-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="form-group mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  className="form-control"
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Descripción de la categoría"
                  rows="3"
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

export default CategoriaCrud
