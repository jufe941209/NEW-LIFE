import React from 'react'
import './Input.css'

/**
 * Input - Átomo básico
 * Componente de input reutilizable
 */
const Input = ({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  const classes = `form-control ${className}`.trim()
  
  if (icon) {
    return (
      <div className={`input-with-icon input-icon-${iconPosition}`}>
        {iconPosition === 'left' && (
          <i className={icon} />
        )}
        <input 
          type={type}
          className={classes}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        {iconPosition === 'right' && (
          <i className={icon} />
        )}
      </div>
    )
  }
  
  return (
    <input 
      type={type}
      className={classes}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}

export default Input

