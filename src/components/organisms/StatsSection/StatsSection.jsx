import React from 'react'
import './StatsSection.css'

/**
 * StatsSection - Organismo
 * Sección de estadísticas del negocio
 */
const StatsSection = () => {
  const stats = [
    {
      number: '127',
      label: 'Clientes satisfechos',
      icon: 'fas fa-smile'
    },
    {
      number: '95%',
      label: 'Calidad de servicio',
      icon: 'fas fa-star'
    },
    {
      number: '5',
      label: 'Certificados de calidad',
      icon: 'fas fa-certificate'
    },
    {
      number: '24',
      label: 'Productos Disponibles',
      icon: 'fas fa-box'
    }
  ]

  return (
    <div className="stats-section">
      <div className="container">
        <div className="row g-4">
          {stats.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsSection

