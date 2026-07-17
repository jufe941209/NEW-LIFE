import React, { useState, useEffect } from 'react'
import domiciliarioService from '../../../services/domiciliarioService'
import CrudTable from './CrudTable'

const DISPONIBILIDAD = ['Disponible', 'No disponible']
const EMPTY_FORM = { cedula_domi: '', nombres: '', telefono: '', disponibilidad: 'Disponible', estado: 'Activo', contrasena: '' }

const DomiciliarioCrud = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const result = await domiciliarioService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.cedula_domi

  const filtered = data.filter(item =>
    (item.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.disponibilidad || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.cedula_domi || '').toString().includes(filter)
  )

  const columns = [
    { key: 'cedula_domi', label: 'Cédula' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'telefono', label: 'Teléfono' },
    {
      key: 'disponibilidad', label: 'Disponibilidad',
      render: (val) => (
        <span className={`status-badge ${val === 'Disponible' ? 'active' : 'inactive'}`}>{val}</span>
      )
    },
    {
      key: 'fecha_registro', label: 'Desde',
      render: (val) => val ? new Date(val).toLocaleDateString('es-CO') : '-'
    },
    {
      key: 'estado', label: 'Estado',
      render: (val) => <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span>
    }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowPass(false); setShowModal(true) }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      cedula_domi: row.cedula_domi || '',
      nombres: row.nombres || '',
      telefono: row.telefono || '',
      disponibilidad: row.disponibilidad || 'Disponible',
      estado: row.estado || 'Activo',
      contrasena: ''
    })
    setFormError('')
    setShowPass(false)
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres) { setFormError('El nombre es requerido'); return }
    if (!editingItem && !form.contrasena) { setFormError('La contraseña es requerida para nuevos domiciliarios'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
        await domiciliarioService.update(getId(editingItem), form)
      } else {
        await domiciliarioService.create(form)
      }
      await load()
      closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.Message || 'Error al guardar. Intenta nuevamente.')
    } finally { setIsSaving(false) }
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
      <CrudTable
        title="Domiciliarios"
        columns={columns}
        data={filtered}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        onCreate={openCreate}
        filterValue={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
      />

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
                <input
                  className="form-control"
                  value={form.cedula_domi}
                  onChange={e => setForm(p => ({ ...p, cedula_domi: e.target.value }))}
                  disabled={!!editingItem}
                  placeholder="1070809001"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Nombres *</label>
                <input
                  className="form-control"
                  value={form.nombres}
                  onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))}
                  placeholder="Carlos Ramírez"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="3201112233"
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
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Disponibilidad</label>
                <select className="form-select" value={form.disponibilidad} onChange={e => setForm(p => ({ ...p, disponibilidad: e.target.value }))}>
                  {DISPONIBILIDAD.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
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

export default DomiciliarioCrud
