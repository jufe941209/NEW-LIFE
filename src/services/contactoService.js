import api from './api'

const ENDPOINT = '/contacto'

const contactoService = {
  enviar: async ({ nombre, correo, telefono, asunto, mensaje }) => {
    const response = await api.post(ENDPOINT, { nombre, correo, telefono, asunto, mensaje })
    return response.data
  }
}

export default contactoService
