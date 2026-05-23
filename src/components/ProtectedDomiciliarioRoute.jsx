import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedDomiciliarioRoute = ({ children }) => {
  const { isDomiciliario } = useAuth()
  if (!isDomiciliario()) {
    return <Navigate to="/login-domiciliario" replace />
  }
  return children
}

export default ProtectedDomiciliarioRoute
