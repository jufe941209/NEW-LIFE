import api from './api'

const ENDPOINT = '/cliente'

const clienteService = {
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

  // Login: busca por correo (el API no devuelve contrasena en GET por seguridad)
  login: async (correo) => {
    const clientes = await clienteService.getAll()
    const found = clientes.find(
      (c) => c.correo === correo && c.estado === 'Activo'
    )
    return found || null
  }
}

export default clienteService
