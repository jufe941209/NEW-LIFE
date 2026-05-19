import { useState, useEffect } from 'react'
import clienteService from '../../../services/clienteService'
import CrudTable from './CrudTable'

const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI']
const TIPOS_CLIENTE = ['Natural', 'Juridico']
const EMPTY_FORM = {
  numero_identificacion: '', tipo_documento: 'CC', tipo_cliente: 'Natural',
  nombres: '', correo: '', telefono: '', direccion: '',
  contrasena: '', estado: 'Activo', cedula_adm: '10000001'
}

const ClienteCrud = () => {
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
      const result = await clienteService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.numero_identificacion

  const filtered = data.filter(item =>
    (item.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.correo || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.numero_identificacion || '').toString().includes(filter) ||
    (item.tipo_cliente || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.direccion || '').toLowerCase().includes(filter.toLowerCase())
  )

  const columns = [
    { key: 'numero_identificacion', label: 'N° Identificación' },
    { key: 'tipo_documento', label: 'Tipo Doc.' },
    { key: 'tipo_cliente', label: 'Tipo', render: (val) => (
      <span className={`status-badge ${val === 'Natural' ? 'active' : 'pending'}`}>{val}</span>
    )},
    { key: 'nombres', label: 'Nombres' },
    { key: 'correo', label: 'Correo' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'fecha_registro', label: 'Registro', render: (val) => val ? new Date(val).toLocaleDateString('es-CO') : '-' },
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val}</span>
    )}
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      numero_identificacion: row.numero_identificacion || '',
      tipo_documento: row.tipo_documento || 'CC',
      tipo_cliente: row.tipo_cliente || 'Natural',
      nombres: row.nombres || '',
      correo: row.correo || '',
      telefono: row.telefono || '',
      direccion: row.direccion || '',
      contrasena: '',
      estado: row.estado || 'Activo',
      cedula_adm: row.cedula_adm || '10000001'
    })
    setFormError('')
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.numero_identificacion || !form.nombres || !form.correo) {
      setFormError('Número de identificación, nombres y correo son requeridos')
      return
    }
    setIsSaving(true)
    try {
      if (editingItem) {
        const payload = { ...form }
        if (!form.contrasena) delete payload.contrasena
        await clienteService.update(getId(editingItem), payload)
      } else {
        await clienteService.create({ ...form, fecha_registro: new Date().toISOString() })
      }
      await load()
      closeModal()
    } catch (e) {
      const msg = e?.response?.data?.Message || 'Error al guardar. Verifica los datos.'
      setFormError(msg)
    } finally { setIsSaving(false) }
  }

  const handleToggleStatus = async (row) => {
    const isActive = row.estado === 'Activo'
    const accion = isActive ? 'desactivar' : 'reactivar'
    if (!window.confirm(`¿Deseas ${accion} al cliente "${row.nombres}"?`)) return
    try {
      await clienteService.update(getId(row), { ...row, estado: isActive ? 'Inactivo' : 'Activo' })
      await load()
    } catch (e) { alert('Error al cambiar el estado') }
  }

  return (
    <div className="crud-section">
      <CrudTable
        title="Clientes"
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
          <div className="crud-modal crud-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Cliente' : 'Crear Cliente'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tipo de Documento</label>
                  <select className="form-select" value={form.tipo_documento} onChange={e => setForm(p => ({ ...p, tipo_documento: e.target.value }))}>
                    {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Número de Identificación *</label>
                  <input className="form-control" value={form.numero_identificacion} onChange={e => setForm(p => ({ ...p, numero_identificacion: e.target.value }))} disabled={!!editingItem} placeholder="1234567890" required />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Tipo de Cliente</label>
                  <select className="form-select" value={form.tipo_cliente} onChange={e => setForm(p => ({ ...p, tipo_cliente: e.target.value }))}>
                    {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Nombres Completos *</label>
                  <input className="form-control" value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Ana Martínez" required />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Correo Electrónico *</label>
                  <input type="email" className="form-control" value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} placeholder="cliente@email.com" required />
                </div>

                <div className="col-md-5 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="3001234567" />
                </div>
                <div className="col-md-7 mb-3">
                  <label className="form-label">Dirección</label>
                  <input className="form-control" value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))} placeholder="Calle 45 #10-20, Bogotá" />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Contraseña {editingItem ? '(vacío = no cambiar)' : ''}</label>
                  <input type="password" className="form-control" value={form.contrasena} onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
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

export default ClienteCrud
