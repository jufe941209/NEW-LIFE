import { useState, useEffect } from 'react'
import facturaService from '../../../services/facturaService'
import detalleFacturaService from '../../../services/detalleFacturaService'
import productoService from '../../../services/productoService'
import clienteService from '../../../services/clienteService'
import { imprimirFactura } from '../../../utils/imprimirFactura'
import CrudTable from './CrudTable'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'PSE', 'Tarjeta de crédito']
const EMPTY_FORM = { numero_factura: '', fecha: '', metodo_pago: 'Efectivo', estado_pago: 'Pendiente', direccion_envio: '', cedula_cli: '' }

const FacturaCrud = () => {
  const [data, setData] = useState([])
  const [productosMap, setProductosMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [printingFac, setPrintingFac] = useState(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const [result, prods] = await Promise.all([
        facturaService.getAll(),
        productoService.getAll().catch(() => []),
      ])
      setData(Array.isArray(result) ? result : [])
      const pm = {}
      if (Array.isArray(prods)) prods.forEach(p => { pm[p.codigo_prod] = p })
      setProductosMap(pm)
    } catch (e) { setData([]) } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const getId = (item) => item.numero_factura

  const filtered = data.filter(item =>
    (item.numero_factura || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.cedula_cli || '').toString().includes(filter) ||
    (item.metodo_pago || '').toLowerCase().includes(filter.toLowerCase()) ||
    (item.estado_pago || '').toLowerCase().includes(filter.toLowerCase())
  )

  const estadoClass = (val) => {
    if (val === 'Pagado') return 'active'
    if (val === 'Pendiente') return 'pending'
    return 'inactive'
  }

  const handleImprimirFactura = async (factura) => {
    setPrintingFac(factura.numero_factura)
    try {
      const [detalles, clienteData] = await Promise.all([
        detalleFacturaService.getByFactura(factura.numero_factura).catch(() => []),
        clienteService.getById(factura.cedula_cli).catch(() => null),
      ])
      imprimirFactura(factura, Array.isArray(detalles) ? detalles : [], productosMap, clienteData)
    } finally { setPrintingFac(null) }
  }

  const columns = [
    { key: 'numero_factura', label: 'N° Factura' },
    { key: 'cedula_cli', label: 'Cédula Cliente' },
    { key: 'fecha', label: 'Fecha', render: (val) => val ? new Date(val).toLocaleDateString('es-CO') : '-' },
    { key: 'metodo_pago', label: 'Método Pago' },
    { key: 'direccion_envio', label: 'Dirección Envío' },
    { key: 'estado_pago', label: 'Estado', render: (val) => (
      <span className={`status-badge ${estadoClass(val)}`}>{val}</span>
    )},
    {
      key: '_pdf', label: 'PDF',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleImprimirFactura(row) }}
          disabled={printingFac === row.numero_factura}
          style={{
            background: 'linear-gradient(135deg,#28a745,#20c997)', color: '#fff', border: 'none',
            padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
          }}
          title="Imprimir / PDF"
        >
          {printingFac === row.numero_factura
            ? <span className="spinner-border spinner-border-sm"></span>
            : <><i className="fas fa-print"></i> PDF</>
          }
        </button>
      )
    }
  ]

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true) }
  const openEdit = (row) => {
    setEditingItem(row)
    setForm({
      numero_factura: row.numero_factura || '',
      fecha: row.fecha ? row.fecha.split('T')[0] : '',
      metodo_pago: row.metodo_pago || 'Efectivo',
      estado_pago: row.estado_pago || 'Pendiente',
      direccion_envio: row.direccion_envio || '',
      cedula_cli: row.cedula_cli || ''
    })
    setFormError('')
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.cedula_cli) { setFormError('La cédula del cliente es requerida'); return }
    setIsSaving(true)
    try {
      if (editingItem) {
        await facturaService.update(getId(editingItem), form)
      } else {
        await facturaService.create({ ...form, fecha: form.fecha || new Date().toISOString().slice(0, -1) })
      }
      await load(); closeModal()
    } catch (e) {
      setFormError(e?.response?.data?.Message || 'Error al guardar.')
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await facturaService.remove(getId(deleteTarget))
      setDeleteTarget(null)
      await load()
    } catch (e) {
      const msg = e?.response?.data?.Message || 'No se pudo eliminar. Puede tener registros asociados.'
      alert(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="crud-section">
      <CrudTable
        title="Facturas de Venta"
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
        itemName={`Factura ${deleteTarget?.numero_factura}`}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <div className="crud-modal-overlay" onClick={closeModal}>
          <div className="crud-modal crud-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="crud-modal-header">
              <h4>{editingItem ? 'Editar Factura' : 'Crear Factura'}</h4>
              <button className="crud-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="crud-modal-body">
              {formError && <div className="alert alert-danger py-2">{formError}</div>}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">N° Factura</label>
                  <input className="form-control" value={form.numero_factura} onChange={e => setForm(p => ({ ...p, numero_factura: e.target.value }))} disabled={!!editingItem} placeholder="FAC-0001" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cédula Cliente *</label>
                  <input className="form-control" value={form.cedula_cli} onChange={e => setForm(p => ({ ...p, cedula_cli: e.target.value }))} placeholder="1030405060" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fecha</label>
                  <input type="date" className="form-control" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Método de Pago</label>
                  <select className="form-select" value={form.metodo_pago} onChange={e => setForm(p => ({ ...p, metodo_pago: e.target.value }))}>
                    {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Dirección de Envío</label>
                  <input className="form-control" value={form.direccion_envio} onChange={e => setForm(p => ({ ...p, direccion_envio: e.target.value }))} placeholder="Calle 45 #10-20, Bogotá" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Estado de Pago</label>
                  <select className="form-select" value={form.estado_pago} onChange={e => setForm(p => ({ ...p, estado_pago: e.target.value }))}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Cancelado">Cancelado</option>
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

export default FacturaCrud
