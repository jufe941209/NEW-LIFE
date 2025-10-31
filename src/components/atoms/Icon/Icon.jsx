import React from 'react'

/**
 * Icon - Átomo básico
 * Componente de ícono reutilizable
 */
const Icon = ({ 
  name, 
  className = '', 
  size = '1x',
  ...props 
}) => {
  const iconClass = `fa fa-${name} fa-${size} ${className}`.trim()
  
  return <i className={iconClass} {...props} />
}

export default Icon

