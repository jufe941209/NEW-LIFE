import axios from 'axios'

const BASE_URL = 'https://newlife-api-agfzb6a7bdb5b7bq.eastus-01.azurewebsites.net/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000,
})

// Retry on network errors or 5xx (Azure cold start / transient failures)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (!config || config.__retryCount >= 2) {
      console.error('API Error:', error.response?.data || error.message)
      return Promise.reject(error)
    }

    const isTransient =
      !error.response ||                          // network / timeout
      error.response.status === 503 ||            // service unavailable
      error.response.status === 502 ||            // bad gateway
      error.response.status === 504               // gateway timeout

    if (!isTransient) {
      console.error('API Error:', error.response?.data || error.message)
      return Promise.reject(error)
    }

    config.__retryCount = (config.__retryCount || 0) + 1
    const delay = config.__retryCount * 1500
    await new Promise(res => setTimeout(res, delay))
    return api(config)
  }
)

export default api
