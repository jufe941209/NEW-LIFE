import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedResponsableRoute = ({ children }) => {
  const { isResponsable } = useAuth()
  if (!isResponsable()) {
    return <Navigate to="/login-responsable" replace />
  }
  return children
}

export default ProtectedResponsableRoute
