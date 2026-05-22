import api from './api'

const ENDPOINT = '/facturaventa'

const facturaService = {
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

  // Facturas de un cliente específico
  getByCliente: async (cedula_cli) => {
    const all = await facturaService.getAll()
    return all.filter(f => String(f.cedula_cli) === String(cedula_cli))
  }
}

export default facturaService
