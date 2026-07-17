import React, { useState, useEffect } from 'react'
import administradorService from '../../../services/administradorService'
import clienteService from '../../../services/clienteService'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const EMPTY_FORM = { cedula_adm: '', nombres: '', correo: '', contrasena: '', estado: 'Activo' }

const AdministradorCrud = () => {
  const [data, setData] = useState([])
  const [clientes, setClientes] = useState([])
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
      const [admins, clis] = await Promise.all([
        administradorService.getAll(),
        clienteService.getAll().catch(() => [])
      ])
      setData(Array.isArray(admins) ? admins : [])
      setClientes(Array.isArray(clis) ? clis : [])
    } catch (e) {
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

  const getClientesDeAdmin = (admin) =>
    clientes.filter(c => c.cedula_adm === admin.cedula_adm)

  const columns = [
    { key: 'cedula_adm', label: 'Cédula' },
    { key: 'nombres', label: 'Nombre' },
    { key: 'correo', label: 'Correo' },
    {
      key: 'clientes_count', label: 'Clientes',
      render: (_, row) => {
        const count = getClientesDeAdmin(row).length
        return (
          <span className={`badge ${count > 0 ? 'bg-primary' : 'bg-secondary'}`}>
            {count} {count === 1 ? 'cliente' : 'clientes'}
          </span>
        )
      }
    },
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
        await administradorService.create({ ...form, fecha_registro: new Date().toISOString().slice(0, -1) })
      }
      await load()
      closeModal()
    } catch (e) {
      setFormError('Error al guardar. Verifica los datos e intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const initiateDelete = (row) => {
    const afectados = getClientesDeAdmin(row)
    setDeleteTarget({ ...row, afectados })
    if (afectados.length > 0) {
      setNeedsReassign(true)
      const otroActivo = data.find(a => a.cedula_adm !== row.cedula_adm && a.estado === 'Activo')
      setReassignTo(otroActivo?.cedula_adm || '')
    } else {
      setNeedsReassign(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (needsReassign && deleteTarget.afectados?.length > 0 && reassignTo) {
        for (const cli of deleteTarget.afectados) {
          await clienteService.update(cli.numero_identificacion, { ...cli, cedula_adm: reassignTo })
        }
      }
      await administradorService.remove(deleteTarget.cedula_adm)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      const msg = e?.response?.data?.Message || 'No se pudo completar la operación.'
      alert(msg)
    } finally {
      setIsDeleting(false)
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

  const otrosAdmins = data.filter(a =>
    deleteTarget && a.cedula_adm !== deleteTarget.cedula_adm && a.estado === 'Activo'
  )

  return (
    <div className="crud-section">
      <CrudTable
        title="Administradores"
        columns={columns}
        data={filtered}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={initiateDelete}
        onCreate={openCreate}
        filterValue={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
      />

      {/* Modal normal — sin clientes asociados */}
      {!needsReassign && (
        <ConfirmDeleteModal
          show={!!deleteTarget}
          itemName={deleteTarget?.nombres}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Modal de reasignación — admin tiene clientes */}
      {needsReassign && deleteTarget && (
        <div className="crud-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="crud-modal confirm-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header confirm-delete-header">
              <h4><i className="fas fa-exchange-alt me-2"></i>Administrador con clientes</h4>
              <button className="crud-modal-close" onClick={() => setDeleteTarget(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="reassign-modal-body">
              <div className="reassign-modal-icon">
                <i className="fas fa-users"></i>
              </div>
              <p className="reassign-modal-title">Reasignar y eliminar</p>
              <p className="reassign-modal-desc">
                El administrador <strong>"{deleteTarget.nombres}"</strong> tiene{' '}
                <strong>{deleteTarget.afectados.length} cliente{deleteTarget.afectados.length !== 1 ? 's' : ''}</strong> asignado{deleteTarget.afectados.length !== 1 ? 's' : ''}.
                Debes reasignarlos antes de eliminar este administrador.
              </p>

              <div className="reassign-badges-list">
                {deleteTarget.afectados.slice(0, 6).map(c => (
                  <span key={c.numero_identificacion} className="badge bg-white text-dark border" style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}>
                    <i className="fas fa-user me-1 text-primary"></i>
                    {c.nombres}
                  </span>
                ))}
                {deleteTarget.afectados.length > 6 && (
                  <span className="badge bg-secondary" style={{ fontSize: '0.8rem' }}>+{deleteTarget.afectados.length - 6} más</span>
                )}
              </div>

              {otrosAdmins.length > 0 ? (
                <>
                  <p className="reassign-select-label">Reasignar clientes a:</p>
                  <select
                    className="form-select"
                    value={reassignTo}
                    onChange={e => setReassignTo(e.target.value)}
                    disabled={isDeleting}
                  >
                    {otrosAdmins.map(a => (
                      <option key={a.cedula_adm} value={a.cedula_adm}>
                        {a.nombres} — {a.cedula_adm}
                      </option>
                    ))}
                  </select>
                  <div className="reassign-warning">
                    <i className="fas fa-triangle-exclamation"></i>
                    <span>Los clientes serán reasignados al administrador seleccionado y este administrador se eliminará definitivamente.</span>
                  </div>
                </>
              ) : (
                <div className="reassign-no-target">
                  <i className="fas fa-ban me-2"></i>
                  No hay otros administradores activos. Activa o crea otro admin primero.
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
              {otrosAdmins.length > 0 && (
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

      {/* Modal crear / editar */}
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
