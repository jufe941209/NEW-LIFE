import React from 'react'

/**
 * CrudTable - Tabla reutilizable para operaciones CRUD
 * onToggleStatus: cambia estado (soft-delete)
 * onDelete: eliminación definitiva de la base de datos
 */
const CrudTable = ({
  columns,
  data,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreate,
  filterValue,
  onFilterChange,
  title,
  isLoading,
  statusField = 'estado',
  activeValue = 'Activo'
}) => {
  return (
    <div className="crud-table-wrapper">
      <div className="crud-table-header">
        <h3 className="crud-title">{title}</h3>
        <div className="crud-actions">
          <div className="crud-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar..."
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="crud-search-input"
            />
          </div>
          <button className="crud-create-btn" onClick={onCreate}>
            <i className="fas fa-plus me-2"></i>
            Crear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="crud-loading">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando datos...</p>
        </div>
      ) : (
        <div className="crud-table-container">
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th className="crud-actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="crud-empty">
                    <i className="fas fa-inbox fa-2x mb-2 d-block text-muted"></i>
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const isActive = row[statusField] === activeValue
                  return (
                    <tr
                      key={row.id || row.cedula_adm || row.cedula_cli || row.cedula_dom || index}
                      className={!isActive ? 'row-inactive' : ''}
                    >
                      {columns.map(col => (
                        <td key={col.key}>
                          {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                        </td>
                      ))}
                      <td className="crud-row-actions">
                        <button
                          className="crud-edit-btn"
                          onClick={() => onEdit(row)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className={isActive ? 'crud-deactivate-btn' : 'crud-activate-btn'}
                          onClick={() => onToggleStatus(row)}
                          title={isActive ? 'Desactivar' : 'Reactivar'}
                        >
                          <i className={`fas ${isActive ? 'fa-ban' : 'fa-check-circle'}`}></i>
                        </button>
                        {onDelete && (
                          <button
                            className="crud-delete-btn"
                            onClick={() => onDelete(row)}
                            title="Eliminar definitivamente"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CrudTable
