import api from './api'

const ENDPOINT = '/domiciliario'

const domiciliarioService = {
  getAll: async () => {
    const response = await api.get(ENDPOINT)
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`${ENDPOINT}/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post(ENDPOINT, data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`${ENDPOINT}/${id}`, data)
    return response.data
  },

  remove: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`)
    return response.data
  },

  login: async (cedula, contrasena) => {
    try {
      const response = await api.post(`${ENDPOINT}/login`, { cedula, contrasena })
      return response.data
    } catch (err) {
      if (err?.response?.status === 401) return null
      throw err
    }
  }
}

export default domiciliarioService
