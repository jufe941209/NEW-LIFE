import { createContext, useContext, useState } from 'react'

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
  const loginCliente = (clienteData) => {
    localStorage.setItem('cliente', JSON.stringify(clienteData))
    setCliente(clienteData)
  }

  const logoutCliente = () => {
    localStorage.removeItem('cliente')
    setCliente(null)
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
      loginAdmin, logoutAdmin,
      loginCliente, logoutCliente,
      logout,
      isAdmin, isCliente, isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
