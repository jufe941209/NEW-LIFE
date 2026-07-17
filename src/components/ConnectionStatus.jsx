import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const HEALTH_URL = 'https://newlife-backend.onrender.com/api/health'
const CHECK_INTERVAL = 2 * 60 * 1000  // ping cada 2 min
const RETRY_INTERVAL = 10 * 1000      // si hay error, reintenta cada 10s

export default function ConnectionStatus() {
  const [offline, setOffline] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const timerRef = useRef(null)

  const ping = async () => {
    try {
      await axios.get(HEALTH_URL, { timeout: 20000 })
      if (offline || recovering) {
        setOffline(false)
        setRecovering(false)
        // Recargar datos automáticamente al recuperar conexión
        window.dispatchEvent(new CustomEvent('api-reconnected'))
      }
      scheduleNext(CHECK_INTERVAL)
    } catch {
      if (!offline) {
        setOffline(true)
        setRecovering(true)
      }
      scheduleNext(RETRY_INTERVAL)
    }
  }

  const scheduleNext = (ms) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(ping, ms)
  }

  useEffect(() => {
    // Primer ping inmediato al montar
    ping()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!offline) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      background: recovering ? '#f59e0b' : '#dc2626',
      color: '#fff', padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '10px', fontSize: '0.9rem', fontWeight: 600,
      boxShadow: '0 2px 12px rgba(0,0,0,0.25)'
    }}>
      <span className="spinner-border spinner-border-sm" style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }}></span>
      {recovering
        ? 'Reconectando con el servidor... espera un momento'
        : 'Sin conexión con el servidor. Reintentando...'}
    </div>
  )
}
