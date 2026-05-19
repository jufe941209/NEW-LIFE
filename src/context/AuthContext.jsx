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
  // passwordUsed: la contraseña que el cliente ingresó en el login
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

  const clearPasswordChange = () => {
    localStorage.setItem('needsPasswordChange', 'false')
    setNeedsPasswordChange(false)
  }

  const logout = () => {
    logoutAdmin()
    logoutCliente()
  }

  const isAdmin = () => !!admin
  const isCliente = () => !!cliente
  const isLoggedIn = () => !!admin || !!cliente

  return (
    <AuthContext.Provider value={{
      admin, cliente,
      needsPasswordChange,
      loginAdmin, logoutAdmin,
      loginCliente, logoutCliente,
      clearPasswordChange,
      logout,
      isAdmin, isCliente, isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
