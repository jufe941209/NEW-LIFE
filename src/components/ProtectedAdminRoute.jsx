import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedAdminRoute - Ruta protegida que requiere autenticación de admin
 * Redirige al login si no hay sesión activa
 */
const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin } = useAuth()
  if (!isAdmin()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedAdminRoute
