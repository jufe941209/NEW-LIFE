import React, { useState, useEffect } from 'react'
import productoService from '../../../services/productoService'

const fmtCOP = (n) => Number(n || 0).toLocaleString('es-CO')

const DescuentoCrud = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(null)
  const [successId, setSuccessId] = useState(null)
  const [viewMode, setViewMode] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await productoService.getAll()
      setProducts(Array.isArray(data) ? data : [])
    } catch { setProducts([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    const matchSearch = (p.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
                        (p.codigo_prod || '').toLowerCase().includes(filter.toLowerCase())
    if (viewMode === 'discount') return matchSearch && Number(p.descuento || 0) > 0
    return matchSearch
  })

  const handleEdit = (p) => {
    setEditingId(p.codigo_prod)
    setEditValue(String(Number(p.descuento || 0)))
  }

  const handleSave = async (p) => {
    const pct = parseFloat(editValue)
    if (isNaN(pct) || pct < 0 || pct > 100) return
    setSaving(p.codigo_prod)
    try {
      await productoService.update(p.codigo_prod, { ...p, descuento: pct })
      setProducts(prev => prev.map(x => x.codigo_prod === p.codigo_prod ? { ...x, descuento: pct } : x))
      setSuccessId(p.codigo_prod)
      setTimeout(() => setSuccessId(null), 2000)
    } catch { alert('Error al guardar el descuento') }
    finally { setSaving(null); setEditingId(null) }
  }

  const handleRemove = async (p) => {
    setSaving(p.codigo_prod)
    try {
      await productoService.update(p.codigo_prod, { ...p, descuento: 0 })
      setProducts(prev => prev.map(x => x.codigo_prod === p.codigo_prod ? { ...x, descuento: 0 } : x))
    } catch { alert('Error al quitar el descuento') }
    finally { setSaving(null) }
  }

  const withDiscount = products.filter(p => Number(p.descuento || 0) > 0).length

  return (
    <div className="crud-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            <i className="fas fa-percent me-2 text-success"></i>Gestión de Descuentos
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            {withDiscount} producto{withDiscount !== 1 ? 's' : ''} con descuento activo
          </p>
        </div>
        <button className="btn btn-outline-success btn-sm" onClick={load}>
          <i className="fas fa-sync-alt me-1"></i>Actualizar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Buscar producto..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div className="btn-group">
          <button className={`btn btn-sm ${viewMode === 'all' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setViewMode('all')}>
            Todos ({products.length})
          </button>
          <button className={`btn btn-sm ${viewMode === 'discount' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setViewMode('discount')}>
            <i className="fas fa-tag me-1"></i>En oferta ({withDiscount})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div className="spinner-border text-success me-2"></div>Cargando productos...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle" style={{ fontSize: '0.88rem' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ width: 90 }}>Código</th>
                <th>Nombre</th>
                <th style={{ width: 130 }}>Precio Base</th>
                <th style={{ width: 110 }}>Descuento</th>
                <th style={{ width: 150 }}>Precio Final</th>
                <th style={{ width: 200 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <i className="fas fa-box-open me-2"></i>No hay productos
                </td></tr>
              ) : filtered.map(p => {
                const pct = Number(p.descuento || 0)
                const precioFinal = Number(p.precio) * (1 - pct / 100)
                const isEditing = editingId === p.codigo_prod
                const isSaving = saving === p.codigo_prod
                const wasSuccess = successId === p.codigo_prod
                return (
                  <tr key={p.codigo_prod} style={{ background: wasSuccess ? '#f0fdf4' : undefined }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>{p.codigo_prod}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>
                      {p.nombres}
                      {pct > 0 && (
                        <span style={{ marginLeft: 6, background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: 8 }}>
                          -{pct}% OFF
                        </span>
                      )}
                    </td>
                    <td style={{ color: pct > 0 ? '#94a3b8' : '#0f172a', textDecoration: pct > 0 ? 'line-through' : 'none', fontWeight: 600 }}>
                      ${fmtCOP(p.precio)}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number" min="0" max="100" step="0.1"
                            className="form-control form-control-sm"
                            style={{ width: 70 }}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleSave(p); if (e.key === 'Escape') setEditingId(null) }}
                          />
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>%</span>
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 8, fontWeight: 700,
                          background: pct > 0 ? '#fef2f2' : '#f1f5f9',
                          color: pct > 0 ? '#ef4444' : '#94a3b8',
                          fontSize: '0.82rem'
                        }}>
                          {pct > 0 ? `${pct}%` : 'Sin oferta'}
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 800, color: '#16a34a' }}>
                      ${fmtCOP(precioFinal)}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleSave(p)} disabled={isSaving}>
                            {isSaving ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-check"></i>}
                          </button>
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(p)} title="Editar descuento">
                            <i className="fas fa-percent me-1"></i>Editar
                          </button>
                          {pct > 0 && (
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(p)} disabled={isSaving} title="Quitar oferta">
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DescuentoCrud
