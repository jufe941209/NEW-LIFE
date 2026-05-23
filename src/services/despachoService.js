import api from './api'

const ENDPOINT = '/despacho'

const despachoService = {
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
    const response = await api.put(ENDPOINT, { ...data, numero_despacho: id })
    return response.data
  },
  remove: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`)
    return response.data
  }
}

export default despachoService
