/**
 * ConfirmDeleteModal - Modal de confirmación para eliminación definitiva
 * Props:
 *   show: boolean
 *   itemName: string — nombre del registro a mostrar en el mensaje
 *   isDeleting: boolean — deshabilita botón mientras elimina
 *   onConfirm: () => void
 *   onCancel: () => void
 */
const ConfirmDeleteModal = ({ show, itemName, isDeleting, onConfirm, onCancel }) => {
  if (!show) return null

  return (
    <div className="crud-modal-overlay" onClick={onCancel}>
      <div className="crud-modal confirm-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="crud-modal-header confirm-delete-header">
          <h4><i className="fas fa-exclamation-triangle me-2"></i>Eliminar definitivamente</h4>
          <button className="crud-modal-close" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="crud-modal-body confirm-delete-body">
          <div className="confirm-delete-icon">
            <i className="fas fa-trash-alt"></i>
          </div>
          <p className="confirm-delete-title">¿Estás completamente seguro?</p>
          <p className="confirm-delete-text">
            Vas a eliminar <strong>"{itemName}"</strong> de forma permanente.
            <br />
            <span className="confirm-delete-warning">
              Esta acción es irreversible y eliminará el registro definitivamente de la base de datos.
            </span>
          </p>
        </div>

        <div className="crud-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger confirm-delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Eliminando...</>
              : <><i className="fas fa-trash-alt me-2"></i>Sí, eliminar definitivamente</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
