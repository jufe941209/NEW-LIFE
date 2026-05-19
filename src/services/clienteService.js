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

  // Login: busca por correo activo. Retorna { cliente, inactivo } para distinguir casos
  login: async (correo) => {
    const clientes = await clienteService.getAll()
    const activo = clientes.find((c) => c.correo === correo && c.estado === 'Activo')
    if (activo) return { cliente: activo, inactivo: false }
    const inactivo = clientes.find((c) => c.correo === correo && c.estado === 'Inactivo')
    if (inactivo) return { cliente: null, inactivo: true }
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
