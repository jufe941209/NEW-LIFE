import React, { useState, useEffect } from 'react'
import administradorService from '../../../services/administradorService'
import CrudTable from './CrudTable'

const EMPTY_FORM = { cedula_adm: '', nombres: '', correo: '', contrasena: '', estado: 'Activo' }

const AdministradorCrud = () => {
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
      const result = await administradorService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) {
      console.error('Error al cargar administradores:', e)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = data.filter(item =>
    (item.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.correo || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.cedula_adm || '').toString().includes(filter)
  )

  const columns = [
    { key: 'cedula_adm', label: 'Cédula' },
    { key: 'nombres', label: 'Nombre' },
    { key: 'correo', label: 'Correo' },
    {
      key: 'estado', label: 'Estado',
      render: (val) => (
        <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span>
      )
    },
    {
      key: 'fecha_registro', label: 'Fecha Registro',
      render: (val) => val ? new Date(val).toLocaleDateString('es-CO') : '-'
    }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => { setEditingItem(row); setForm({ ...EMPTY_FORM, ...row, contrasena: '' }); setFormError(''); setShowModal(true) }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.cedula_adm || !form.nombres || !form.correo) { setFormError('Todos los campos obligatorios deben ser llenados'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
        const payload = { ...form }
        if (!form.contrasena) delete payload.contrasena
        await administradorService.update(editingItem.cedula_adm, payload)
      } else {
        if (!form.contrasena) { setFormError('La contraseña es requerida'); setIsSaving(false); return }
        await administradorService.create({ ...form, fecha_registro: new Date().toISOString() })
      }
      await load()
      closeModal()
    } catch (e) {
      setFormError('Error al guardar. Verifica los datos e intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (row) => {
    const isActive = row.estado === 'Activo'
    const accion = isActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Deseas ${accion} al administrador "${row.nombres}"?\nEl registro se conservará en la base de datos.`)) return
    try {
      await administradorService.update(row.cedula_adm, { ...row, estado: isActive ? 'Inactivo' : 'Activo' })
      await load()
    } catch (e) {
      const msg = e?.response?.data?.Message || 'Error al cambiar el estado'
      alert(msg)
    }
  }

  return (
    <div className="crud-section">
      <CrudTable
        title="Administradores"
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
              <h4>{editingItem ? 'Editar Administrador' : 'Crear Administrador'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="form-group mb-3">
                <label className="form-label">Cédula *</label>
                <input className="form-control" value={form.cedula_adm} onChange={e => setForm(p => ({ ...p, cedula_adm: e.target.value }))} disabled={!!editingItem} placeholder="12345678" required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Nombres *</label>
                <input className="form-control" value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Juan Pérez" required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Correo *</label>
                <input type="email" className="form-control" value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} placeholder="admin@newlife.com" required />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Contraseña {editingItem ? '(dejar vacío para no cambiar)' : '*'}</label>
                <input type="password" className="form-control" value={form.contrasena} onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))} placeholder="••••••••" />
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

export default AdministradorCrud
