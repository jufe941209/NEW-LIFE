import { createContext, useContext, useState } from 'react'

const DEFAULT_PASSWORD = '111111'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  })

  const [cliente, setCliente] = useState(() => {
    const stored = localStorage.getItem('cliente')
    return stored ? JSON.parse(stored) : null
  })

  const [responsable, setResponsable] = useState(() => {
    const stored = localStorage.getItem('responsable')
    return stored ? JSON.parse(stored) : null
  })

  const [domiciliario, setDomiciliario] = useState(() => {
    const stored = localStorage.getItem('domiciliario')
    return stored ? JSON.parse(stored) : null
  })

  const [needsPasswordChange, setNeedsPasswordChange] = useState(
    () => localStorage.getItem('needsPasswordChange') === 'true'
  )

  // --- Admin ---
  const loginAdmin = (adminData) => {
    localStorage.setItem('admin', JSON.stringify(adminData))
    setAdmin(adminData)
  }
  const logoutAdmin = () => {
    localStorage.removeItem('admin')
    setAdmin(null)
  }

  // --- Cliente ---
  const loginCliente = (clienteData, passwordUsed = '') => {
    localStorage.setItem('cliente', JSON.stringify(clienteData))
    setCliente(clienteData)
    const mustChange = passwordUsed === DEFAULT_PASSWORD
    localStorage.setItem('needsPasswordChange', mustChange)
    setNeedsPasswordChange(mustChange)
  }
  const logoutCliente = () => {
    localStorage.removeItem('cliente')
    localStorage.removeItem('needsPasswordChange')
    setCliente(null)
    setNeedsPasswordChange(false)
  }

  // --- Responsable ---
  const loginResponsable = (responsableData) => {
    localStorage.setItem('responsable', JSON.stringify(responsableData))
    setResponsable(responsableData)
  }
  const logoutResponsable = () => {
    localStorage.removeItem('responsable')
    setResponsable(null)
  }

  // --- Domiciliario ---
  const loginDomiciliario = (domiciliarioData) => {
    localStorage.setItem('domiciliario', JSON.stringify(domiciliarioData))
    setDomiciliario(domiciliarioData)
  }
  const logoutDomiciliario = () => {
    localStorage.removeItem('domiciliario')
    setDomiciliario(null)
  }

  const clearPasswordChange = () => {
    localStorage.setItem('needsPasswordChange', 'false')
    setNeedsPasswordChange(false)
  }

  const logout = () => {
    logoutAdmin()
    logoutCliente()
    logoutResponsable()
    logoutDomiciliario()
    sessionStorage.removeItem('cart')
  }

  const isAdmin = () => !!admin
  const isCliente = () => !!cliente
  const isResponsable = () => !!responsable
  const isDomiciliario = () => !!domiciliario
  const isLoggedIn = () => !!admin || !!cliente || !!responsable || !!domiciliario

  return (
    <AuthContext.Provider value={{
      admin, cliente, responsable, domiciliario,
      needsPasswordChange,
      loginAdmin, logoutAdmin,
      loginCliente, logoutCliente,
      loginResponsable, logoutResponsable,
      loginDomiciliario, logoutDomiciliario,
      clearPasswordChange,
      logout,
      isAdmin, isCliente, isResponsable, isDomiciliario, isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
