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
    try {
      const response = await api.post(`${ENDPOINT}/login`, { correo, contrasena })
      const data = response.data
      if (data?.token) localStorage.setItem('authToken', data.token)
      return data
    } catch (err) {
      if (err?.response?.status === 401) return null
      throw err
    }
  },

  cambiarContrasena: async (correo, contrasenaActual, contrasenaNueva) => {
    const response = await api.post(`${ENDPOINT}/cambiar-contrasena`, { correo, contrasenaActual, contrasenaNueva })
    return response.data
  }
}

export default administradorService
