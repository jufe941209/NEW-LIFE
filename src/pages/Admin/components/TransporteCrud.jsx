import React, { useState, useEffect } from 'react'
import transporteService from '../../../services/transporteService'
import domiciliarioService from '../../../services/domiciliarioService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const TIPOS_VEHICULO = ['Moto', 'Bicicleta', 'Carro', 'Camioneta', 'Furgón', 'Otro']
const EMPTY_FORM = { cedula_domi: '', placa: '', tipo: 'Moto', descripcion: '', estado: 'Activo' }

const TransporteCrud = () => {
  const [data, setData] = useState([])
  const [domiciliarios, setDomiciliarios] = useState([])
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
      const [transportes, domis] = await Promise.all([
        transporteService.getAll().catch(() => []),
        domiciliarioService.getAll().catch(() => []),
      ])
      setData(Array.isArray(transportes) ? transportes : [])
      setDomiciliarios(Array.isArray(domis) ? domis : [])
    } catch { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.placa

  const getNombreDomi = (cedula) => domiciliarios.find(d => d.cedula_domi === cedula)?.nombres || cedula || '—'

  const filtered = data.filter(item =>
    (item.placa || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.tipo || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.cedula_domi || '').toLowerCase().includes(filter.toLowerCase()) ||
    getNombreDomi(item.cedula_domi).toLowerCase().includes(filter.toLowerCase())
  )

  const columns = [
    { key: 'placa', label: 'Placa' },
    { key: 'tipo', label: 'Tipo Vehículo' },
    { key: 'cedula_domi', label: 'Domiciliario', render: (val) => getNombreDomi(val) },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'estado', label: 'Estado',
      render: (val) => (
        <span className={`status-badge ${val === 'Activo' ? 'active' : 'inactive'}`}>{val || 'Activo'}</span>
      )
    }
  ]

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...EMPTY_FORM, cedula_domi: domiciliarios[0]?.cedula_domi || '' })
    setFormError('')
    setShowModal(true)
  }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      cedula_domi: row.cedula_domi || '',
      placa: row.placa || '',
      tipo: row.tipo || 'Moto',
      descripcion: row.descripcion || '',
      estado: row.estado || 'Activo'
    })
    setFormError('')
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.placa.trim()) { setFormError('La placa es requerida'); return }
    if (!form.cedula_domi) { setFormError('Debe seleccionar un domiciliario'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
        await transporteService.update(getId(editingItem), form)
      } else {
        await transporteService.create(form)
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
      await transporteService.remove(getId(deleteTarget))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      alert(e?.response?.data?.Message || 'No se pudo eliminar')
    } finally { setIsDeleting(false) }
  }

  return (
    <div className="crud-section">
      <CrudTable
        title="Transportes / Vehículos"
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
        itemName={`Transporte ${deleteTarget?.placa}`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Transporte' : 'Nuevo Transporte'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Placa *</label>
                  <input
                    className="form-control"
                    type="text"
                    value={form.placa}
                    onChange={e => setForm(p => ({ ...p, placa: e.target.value.toUpperCase() }))}
                    disabled={!!editingItem}
                    placeholder="ABC-123"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo de Vehículo *</label>
                  <select
                    className="form-select"
                    value={form.tipo}
                    onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                  >
                    {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Domiciliario *</label>
                  <select
                    className="form-select"
                    value={form.cedula_domi}
                    onChange={e => setForm(p => ({ ...p, cedula_domi: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar domiciliario...</option>
                    {domiciliarios.filter(d => d.estado !== 'Inactivo').map(d => (
                      <option key={d.cedula_domi} value={d.cedula_domi}>
                        {d.nombres} — {d.cedula_domi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Descripción</label>
                  <input
                    className="form-control"
                    type="text"
                    value={form.descripcion}
                    onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                    placeholder="Modelo, color, detalles adicionales..."
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={form.estado}
                    onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="En mantenimiento">En mantenimiento</option>
                  </select>
                </div>
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

export default TransporteCrud
