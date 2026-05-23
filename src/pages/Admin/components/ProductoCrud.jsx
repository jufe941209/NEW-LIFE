import React, { useState, useEffect, useRef } from 'react'
import productoService from '../../../services/productoService'
import categoriaService from '../../../services/categoriaService'
import tipoProductoService from '../../../services/tipoProductoService'
import imageService from '../../../services/imageService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const TEMP_OPTS = ['', 'Caliente', 'Frio', 'Ambos']

const EMPTY_FORM = {
  codigo_prod: '',
  nombres: '',
  descripcion: '',
  precio: '',
  descuento: '0',
  stock_min: '',
  stock_real: '',
  img_url: '',
  capacidad: '',
  temperatura_uso: '',
  numero_categoria: '',
  id_tipo_producto: '',
  estado: 'Activo'
}

const ProductoCrud = () => {
  const [data, setData] = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos, setTipos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [imgPreview, setImgPreview] = useState('')
  const fileInputRef = useRef(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const [prods, cats, tps] = await Promise.all([
        productoService.getAll().catch(() => []),
        categoriaService.getAll().catch(() => []),
        tipoProductoService.getAll().catch(() => [])
      ])
      setData(Array.isArray(prods) ? prods : [])
      setCategorias(Array.isArray(cats) ? cats : [])
      setTipos(Array.isArray(tps) ? tps : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.codigo_prod

  const filtered = data.filter(item =>
    (item.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.codigo_prod || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.estado || '').toLowerCase().includes(filter.toLowerCase())
  )

  const getStockLevel = (prod) => {
    if (prod.stock_real === undefined || prod.stock_real === null) return 'unknown'
    if (prod.stock_real <= prod.stock_min) return 'critical'
    if (prod.stock_real <= prod.stock_min * 1.5) return 'warning'
    return 'ok'
  }

  const categoriaNombre = (id) => {
    const c = categorias.find(c => c.numero_categoria === id)
    return c ? c.nombre : id
  }

  const tipoNombre = (id) => {
    const t = tipos.find(t => t.id_tipo_producto === id)
    return t ? t.nombre : id
  }

  const columns = [
    { key: 'codigo_prod', label: 'Código' },
    { key: 'nombres', label: 'Nombre' },
    {
      key: 'precio', label: 'Precio',
      render: (val) => val !== undefined ? `$${Number(val).toLocaleString('es-CO')}` : '-'
    },
    {
      key: 'stock_real', label: 'Stock Real / Mín',
      render: (val, row) => {
        const level = getStockLevel(row)
        const colorMap = { critical: '#dc3545', warning: '#f59e0b', ok: '#28a745', unknown: '#6c757d' }
        const color = colorMap[level]
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: 700, color, fontSize: '1rem' }}>{val ?? '—'}</span>
            <span style={{ color: '#999', fontSize: '0.8rem' }}>/ {row.stock_min}</span>
            {level === 'critical' && <i className="fas fa-exclamation-circle" style={{ color: '#dc3545', fontSize: '0.85rem' }} title="Stock crítico" />}
            {level === 'warning' && <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b', fontSize: '0.85rem' }} title="Stock bajo" />}
          </span>
        )
      }
    },
    {
      key: 'numero_categoria', label: 'Categoría',
      render: (val) => categoriaNombre(val)
    },
    {
      key: 'estado', label: 'Estado',
      render: (val) => <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span>
    }
  ]

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...EMPTY_FORM, numero_categoria: categorias[0]?.numero_categoria || '', id_tipo_producto: tipos[0]?.id_tipo_producto || '' })
    setImgPreview('')
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      codigo_prod: row.codigo_prod || '',
      nombres: row.nombres || '',
      descripcion: row.descripcion || '',
      precio: row.precio !== undefined ? String(row.precio) : '',
      descuento: row.descuento !== undefined ? String(row.descuento) : '0',
      stock_min: row.stock_min !== undefined ? String(row.stock_min) : '',
      stock_real: row.stock_real !== undefined ? String(row.stock_real) : '',
      img_url: row.img_url || '',
      capacidad: row.capacidad || '',
      temperatura_uso: row.temperatura_uso || '',
      numero_categoria: row.numero_categoria !== undefined ? String(row.numero_categoria) : '',
      id_tipo_producto: row.id_tipo_producto !== undefined ? String(row.id_tipo_producto) : '',
      estado: row.estado || 'Activo'
    })
    setImgPreview(row.img_url || '')
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setImgPreview('') }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      setFormError('Solo se permiten imágenes JPG, PNG, WebP o GIF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('La imagen no puede superar 5 MB.')
      return
    }

    // Preview inmediato con URL local
    const localUrl = URL.createObjectURL(file)
    setImgPreview(localUrl)
    setFormError('')
    setUploadingImg(true)
    try {
      const url = await imageService.upload(file)
      setForm(p => ({ ...p, img_url: url }))
      setImgPreview(url)
    } catch {
      setFormError('Error al subir la imagen. Inténtalo de nuevo.')
      setImgPreview(form.img_url || '')
    } finally {
      setUploadingImg(false)
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setImgPreview('')
    setForm(p => ({ ...p, img_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres || !form.precio) { setFormError('Nombre y precio son requeridos'); return }
    if (!form.codigo_prod) { setFormError('El código del producto es requerido'); return }
    setIsSaving(true)
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        descuento: parseFloat(form.descuento) || 0,
        stock_min: parseInt(form.stock_min) || 0,
        stock_real: parseInt(form.stock_real) || 0,
        numero_categoria: parseInt(form.numero_categoria) || 0,
        id_tipo_producto: parseInt(form.id_tipo_producto) || 0,
        temperatura_uso: form.temperatura_uso || null,
        capacidad: form.capacidad || null
      }
      if (editingItem) {
        await productoService.update(getId(editingItem), payload)
      } else {
        await productoService.create(payload)
      }
      await load()
      closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.Message || 'Error al guardar. Intenta nuevamente.')
    } finally { setIsSaving(false) }
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
    } finally { setIsDeleting(false) }
  }

  const handleToggleStatus = async (row) => {
    const isActive = row.estado === 'Activo'
    if (!window.confirm(`¿Deseas ${isActive ? 'desactivar' : 'reactivar'} el producto "${row.nombres}"?`)) return
    try {
      await productoService.update(getId(row), {
        ...row,
        estado: isActive ? 'Inactivo' : 'Activo',
        temperatura_uso: row.temperatura_uso || null,
        capacidad: row.capacidad || null
      })
      await load()
    } catch (e) { alert('Error al cambiar el estado') }
  }

  const alertas = filtered.filter(p => getStockLevel(p) === 'critical' || getStockLevel(p) === 'warning')

  return (
    <div className="crud-section">
      {/* Alertas de inventario */}
      {alertas.length > 0 && (
        <div className="stock-alertas-banner">
          <div className="stock-alertas-title">
            <i className="fas fa-bell"></i>
            <span>{alertas.length} producto{alertas.length !== 1 ? 's' : ''} con stock bajo</span>
          </div>
          <div className="stock-alertas-list">
            {alertas.map(p => {
              const level = getStockLevel(p)
              return (
                <div key={p.codigo_prod} className={`stock-alerta-item stock-alerta-${level}`}>
                  <span className="stock-alerta-nombre">{p.nombres}</span>
                  <span className="stock-alerta-nums">
                    <strong>{p.stock_real}</strong> / {p.stock_min} mín
                  </span>
                  {level === 'critical'
                    ? <i className="fas fa-exclamation-circle" style={{ color: '#dc3545' }} />
                    : <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }} />
                  }
                </div>
              )
            })}
          </div>
        </div>
      )}

      <CrudTable
        title="Productos"
        columns={columns}
        data={filtered}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={(row) => setDeleteTarget(row)}
        onCreate={openCreate}
        filterValue={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
      />

      <ConfirmDeleteModal
        show={!!deleteTarget}
        itemName={deleteTarget?.nombres}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal crear / editar */}
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
                <div className="col-md-6 mb-3">
                  <label className="form-label">Código *</label>
                  <input className="form-control" value={form.codigo_prod} onChange={e => setForm(p => ({ ...p, codigo_prod: e.target.value }))} disabled={!!editingItem} placeholder="BOWL-BIO-16OZ" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre *</label>
                  <input className="form-control" value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Bowl Biodegradable 16oz" required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Precio *</label>
                  <input type="number" step="0.01" className="form-control" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} placeholder="680" required />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Descuento %</label>
                  <input type="number" min="0" max="100" step="0.1" className="form-control" value={form.descuento} onChange={e => setForm(p => ({ ...p, descuento: e.target.value }))} placeholder="0" />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Stock Mínimo</label>
                  <input type="number" className="form-control" value={form.stock_min} onChange={e => setForm(p => ({ ...p, stock_min: e.target.value }))} placeholder="90" />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Stock Real</label>
                  <input type="number" className="form-control" value={form.stock_real} onChange={e => setForm(p => ({ ...p, stock_real: e.target.value }))} placeholder="0" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Categoría</label>
                  <select className="form-select" value={form.numero_categoria} onChange={e => setForm(p => ({ ...p, numero_categoria: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {categorias.map(c => <option key={c.numero_categoria} value={c.numero_categoria}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo de Producto</label>
                  <select className="form-select" value={form.id_tipo_producto} onChange={e => setForm(p => ({ ...p, id_tipo_producto: e.target.value }))}>
                    <option value="">— Seleccionar —</option>
                    {tipos.map(t => <option key={t.id_tipo_producto} value={t.id_tipo_producto}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Capacidad</label>
                  <input className="form-control" value={form.capacidad} onChange={e => setForm(p => ({ ...p, capacidad: e.target.value }))} placeholder="16oz, 500ml..." />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Temperatura de Uso</label>
                  <select className="form-select" value={form.temperatura_uso} onChange={e => setForm(p => ({ ...p, temperatura_uso: e.target.value }))}>
                    {TEMP_OPTS.map(t => <option key={t} value={t}>{t || '— Ninguna —'}</option>)}
                  </select>
                </div>
                {/* ── Imagen del producto ── */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">Imagen del producto</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />

                  {imgPreview ? (
                    /* Preview con imagen ya cargada */
                    <div style={{
                      border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '1rem',
                      display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc'
                    }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={imgPreview}
                          alt="Preview"
                          style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }}
                        />
                        {uploadingImg && (
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10
                          }}>
                            <span className="spinner-border spinner-border-sm text-primary"></span>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {uploadingImg
                          ? <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}><i className="fas fa-cloud-upload-alt me-1"></i>Subiendo imagen...</p>
                          : <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}><i className="fas fa-check-circle me-1"></i>Imagen cargada</p>
                        }
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImg}
                          >
                            <i className="fas fa-sync-alt me-1"></i>Cambiar imagen
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleRemoveImage}
                            disabled={uploadingImg}
                          >
                            <i className="fas fa-trash me-1"></i>Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Zona de subida vacía */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #cbd5e1', borderRadius: 12, padding: '2rem 1rem',
                        textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
                        transition: 'border-color 0.2s, background 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc' }}
                    >
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}></i>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Haz clic para subir una imagen</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>JPG, PNG, WebP o GIF · Máx 5 MB</p>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción del producto..." rows="2" />
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
    </div>
  )
}

export default ProductoCrud
