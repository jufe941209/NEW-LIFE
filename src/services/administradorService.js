import api from './api'

const ENDPOINT = '/administrador'

const administradorService = {
  getAll: async () => {
    const response = await api.get(ENDPOINT)
    return response.data
  },

  getById: async (cedula) => {
    const response = await api.get(`${ENDPOINT}/${cedula}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post(ENDPOINT, data)
    return response.data
  },

  update: async (cedula, data) => {
    const response = await api.put(`${ENDPOINT}/${cedula}`, data)
    return response.data
  },

  remove: async (cedula) => {
    const response = await api.delete(`${ENDPOINT}/${cedula}`)
    return response.data
  },

  login: async (correo, contrasena) => {
    const admins = await administradorService.getAll()
    const found = admins.find(
      (admin) =>
        admin.correo === correo &&
        admin.contrasena === contrasena &&
        admin.estado === 'Activo'
    )
    return found || null
  }
}

export default administradorService
