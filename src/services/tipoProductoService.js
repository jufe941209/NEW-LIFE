import api from './api'

const ENDPOINT = '/tipoProducto'

const tipoProductoService = {
  getAll: async () => {
    const response = await api.get(ENDPOINT)
    return response.data
  }
}

export default tipoProductoService
