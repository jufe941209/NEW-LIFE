import React from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.css'

/**
 * PageHeader - Organismo
 * Header de página con breadcrumb y título
 * 
 * @param {Array} items - Array de objetos con {label, path} para el breadcrumb
 * @param {string} title - Título de la página
 * @param {string} subtitle - Subtítulo opcional de la página
 * @param {string} className - Clases CSS adicionales
 */
const PageHeader = ({ 
  items = [{ label: 'Inicio', path: '/' }],
  title = '',
  subtitle = '',
  className = ''
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {items.map((item, index) => (
              <li 
                key={index} 
                className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
              >
                {index === items.length - 1 ? (
                  <span className="text-white">{item.label}</span>
                ) : (
                  <Link to={item.path} className="breadcrumb-link">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {title && (
          <h1 className="page-title text-white text-center">
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="page-subtitle text-white text-center">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default PageHeader

