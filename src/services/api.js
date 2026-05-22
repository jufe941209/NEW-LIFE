import axios from 'axios'

const BASE_URL = 'https://newlife-api-agfzb6a7bdb5b7bq.eastus-01.azurewebsites.net/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Connection': 'keep-alive',
  },
  timeout: 60000, // 60s — covers Azure cold-start wake-up
})

const TRANSIENT_CODES = new Set([0, 408, 429, 500, 502, 503, 504])
const MAX_RETRIES = 4

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (!config) return Promise.reject(error)

    config.__retryCount = (config.__retryCount || 0)

    const status = error.response?.status
    const isTransient = !error.response || TRANSIENT_CODES.has(status)

    if (!isTransient || config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(error)
    }

    config.__retryCount += 1
    // Exponential back-off: 2s, 4s, 8s, 16s — covers Azure cold-start (15-30s)
    const delay = Math.min(2000 * Math.pow(2, config.__retryCount - 1), 20000)
    await new Promise(res => setTimeout(res, delay))
    return api(config)
  }
)

// Ping the health endpoint to keep the backend alive (every 2 min)
let keepAliveTimer = null

export function startKeepAlive() {
  if (keepAliveTimer) return
  // Ping immediately on start, then every 2 minutes
  const ping = () => axios.get(`${BASE_URL}/health`, { timeout: 10000 }).catch(() => {})
  ping()
  keepAliveTimer = setInterval(ping, 2 * 60 * 1000)
}

export function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
  }
}

export default api
