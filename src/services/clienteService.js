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

  // Login: valida correo + contraseña en el backend
  login: async (correo, contrasena) => {
    const response = await api.post('/cliente/login', { correo, contrasena })
    const data = response.data
    if (data.success) return { cliente: data.cliente, inactivo: false }
    if (data.message && data.message.includes('desactivada')) return { cliente: null, inactivo: true }
    return null
  },

  // Verifica si un correo o número de identificación ya existe (activo o inactivo)
  existsByCorreo: async (correo) => {
    const clientes = await clienteService.getAll()
    return clientes.find((c) => c.correo === correo) || null
  },

  existsByIdentificacion: async (numero_identificacion) => {
    const clientes = await clienteService.getAll()
    return clientes.find((c) => c.numero_identificacion === numero_identificacion) || null
  }
}

export default clienteService
