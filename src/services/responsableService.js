import api from './api'

const ENDPOINT = '/responsable'

const responsableService = {
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
  login: async (cedula, correo) => {
    const todos = await responsableService.getAll()
    return todos.find(
      r => r.cedula_resp === cedula && r.correo === correo && r.estado === 'Activo'
    ) || null
  }
}

export default responsableService
