import api from './api'

const ENDPOINT = '/transporte'

const transporteService = {
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
  update: async (placa, data) => {
    // PUT /transporte — ID va en el body como placa
    const response = await api.put(ENDPOINT, data)
    return response.data
  },
  remove: async (placa) => {
    const response = await api.delete(`${ENDPOINT}/${placa}`)
    return response.data
  }
}

export default transporteService
