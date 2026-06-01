import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const DEFAULT_PASSWORD = '111111'
const INACTIVITY_LIMIT = 30 * 60 * 1000   // 30 minutos en ms
const CHECK_INTERVAL   = 60 * 1000         // revisar cada 60 segundos

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
const ALL_KEYS = ['admin', 'cliente', 'responsable', 'domiciliario', 'needsPasswordChange', 'lastActivity', 'authToken']

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin')) } catch { return null }
  })
  const [cliente, setCliente] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cliente')) } catch { return null }
  })
  const [responsable, setResponsable] = useState(() => {
    try { return JSON.parse(localStorage.getItem('responsable')) } catch { return null }
  })
  const [domiciliario, setDomiciliario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('domiciliario')) } catch { return null }
  })
  const [needsPasswordChange, setNeedsPasswordChange] = useState(
    () => localStorage.getItem('needsPasswordChange') === 'true'
  )

  // ── Helpers internos ───────────────────────────────────────────────────
  const updateActivity = useCallback(() => {
    localStorage.setItem('lastActivity', Date.now().toString())
  }, [])

  const anyLoggedIn = () =>
    ['admin', 'cliente', 'responsable', 'domiciliario'].some(k => localStorage.getItem(k))

  // Limpia TODAS las sesiones (para logout o inactividad)
  const clearAll = useCallback(() => {
    ALL_KEYS.forEach(k => localStorage.removeItem(k))
    sessionStorage.removeItem('cart')
    setAdmin(null)
    setCliente(null)
    setResponsable(null)
    setDomiciliario(null)
    setNeedsPasswordChange(false)
  }, [])

  // ── Timer de inactividad ───────────────────────────────────────────────
  useEffect(() => {
    // Verificar inactividad al cargar la página (si el tab estuvo abierto)
    if (anyLoggedIn()) {
      const last = parseInt(localStorage.getItem('lastActivity') || '0', 10)
      if (last > 0 && Date.now() - last >= INACTIVITY_LIMIT) {
        clearAll()
        return
      }
    }

    // Listener: resetear timer ante cualquier actividad del usuario
    const handleActivity = () => {
      if (anyLoggedIn()) updateActivity()
    }
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))

    // Verificación periódica cada 60 segundos
    const interval = setInterval(() => {
      if (!anyLoggedIn()) return
      const last = parseInt(localStorage.getItem('lastActivity') || '0', 10)
      if (last > 0 && Date.now() - last >= INACTIVITY_LIMIT) {
        clearAll()
      }
    }, CHECK_INTERVAL)

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, handleActivity))
      clearInterval(interval)
    }
  }, [updateActivity, clearAll])

  // ── Admin ──────────────────────────────────────────────────────────────
  const loginAdmin = (adminData) => {
    // Sesión única: limpiar otros roles (no admin, para soportar actualización de perfil)
    localStorage.removeItem('cliente');      setCliente(null)
    localStorage.removeItem('responsable');  setResponsable(null)
    localStorage.removeItem('domiciliario'); setDomiciliario(null)
    localStorage.removeItem('needsPasswordChange'); setNeedsPasswordChange(false)
    sessionStorage.removeItem('cart')
    localStorage.setItem('admin', JSON.stringify(adminData))
    updateActivity()
    setAdmin(adminData)
  }
  const logoutAdmin = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('lastActivity')
    setAdmin(null)
  }

  // ── Cliente ────────────────────────────────────────────────────────────
  const loginCliente = (clienteData, passwordUsed = '') => {
    // Sesión única: limpiar otros roles
    localStorage.removeItem('admin');        setAdmin(null)
    localStorage.removeItem('responsable');  setResponsable(null)
    localStorage.removeItem('domiciliario'); setDomiciliario(null)
    sessionStorage.removeItem('cart')
    localStorage.setItem('cliente', JSON.stringify(clienteData))
    updateActivity()
    const mustChange = passwordUsed === DEFAULT_PASSWORD
    localStorage.setItem('needsPasswordChange', mustChange)
    setCliente(clienteData)
    setNeedsPasswordChange(mustChange)
  }
  const logoutCliente = () => {
    localStorage.removeItem('cliente')
    localStorage.removeItem('needsPasswordChange')
    localStorage.removeItem('lastActivity')
    setCliente(null)
    setNeedsPasswordChange(false)
  }

  // ── Responsable ────────────────────────────────────────────────────────
  const loginResponsable = (responsableData) => {
    // Sesión única: limpiar otros roles
    localStorage.removeItem('admin');        setAdmin(null)
    localStorage.removeItem('cliente');      setCliente(null)
    localStorage.removeItem('domiciliario'); setDomiciliario(null)
    localStorage.removeItem('needsPasswordChange'); setNeedsPasswordChange(false)
    sessionStorage.removeItem('cart')
    localStorage.setItem('responsable', JSON.stringify(responsableData))
    updateActivity()
    setResponsable(responsableData)
  }
  const logoutResponsable = () => {
    localStorage.removeItem('responsable')
    localStorage.removeItem('lastActivity')
    setResponsable(null)
  }

  // ── Domiciliario ───────────────────────────────────────────────────────
  const loginDomiciliario = (domiciliarioData) => {
    // Sesión única: limpiar otros roles
    localStorage.removeItem('admin');       setAdmin(null)
    localStorage.removeItem('cliente');     setCliente(null)
    localStorage.removeItem('responsable'); setResponsable(null)
    localStorage.removeItem('needsPasswordChange'); setNeedsPasswordChange(false)
    sessionStorage.removeItem('cart')
    localStorage.setItem('domiciliario', JSON.stringify(domiciliarioData))
    updateActivity()
    setDomiciliario(domiciliarioData)
  }
  const logoutDomiciliario = () => {
    localStorage.removeItem('domiciliario')
    localStorage.removeItem('lastActivity')
    setDomiciliario(null)
  }

  const clearPasswordChange = () => {
    localStorage.setItem('needsPasswordChange', 'false')
    setNeedsPasswordChange(false)
  }

  const logout = () => clearAll()

  const isAdmin        = () => !!admin
  const isCliente      = () => !!cliente
  const isResponsable  = () => !!responsable
  const isDomiciliario = () => !!domiciliario
  const isLoggedIn     = () => !!admin || !!cliente || !!responsable || !!domiciliario

  return (
    <AuthContext.Provider value={{
      admin, cliente, responsable, domiciliario,
      needsPasswordChange,
      loginAdmin,        logoutAdmin,
      loginCliente,      logoutCliente,
      loginResponsable,  logoutResponsable,
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
