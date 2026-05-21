import api from './api'

const ENDPOINT = '/detallefactura'

const detalleFacturaService = {
  getAll: async () => {
    const response = await api.get(ENDPOINT)
    return response.data
  },
  getByFactura: async (numeroFactura) => {
    try {
      const response = await api.get(`${ENDPOINT}/porfactura/${numeroFactura}`)
      return response.data
    } catch (e) {
      if (e?.response?.status === 404) return []
      throw e
    }
  },
  create: async (data) => {
    const response = await api.post(ENDPOINT, data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(ENDPOINT, data)
    return response.data
  },
  remove: async (id) => {
    const response = await api.delete(`${ENDPOINT}/${id}`)
    return response.data
  }
}

export default detalleFacturaService
