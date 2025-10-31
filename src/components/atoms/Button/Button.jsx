import React from 'react'
import './Button.css'

/**
 * Button - Átomo básico
 * Componente de botón reutilizable con diferentes variantes
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  type = 'button',
  className = '',
  onClick,
  disabled = false,
  ...props 
}) => {
  const classes = `btn btn-${variant} btn-${size} ${className}`.trim()
  
  return (
    <button 
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

