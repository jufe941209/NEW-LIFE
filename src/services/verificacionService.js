import api from './api'

const verificacionService = {
  enviarCodigo: async (correo, nombres, tipo) => {
    const response = await api.post('/Verificacion/Enviar', { correo, nombres, tipo })
    return response.data
  },

  confirmarCodigo: async (correo, codigo, tipo) => {
    const response = await api.post('/Verificacion/Confirmar', { correo, codigo, tipo })
    return response.data
  },

  recuperarPassword: async (correo, codigo, nuevaContrasena, rol = 'cliente') => {
    const response = await api.post('/Verificacion/RecuperarPassword', { correo, codigo, nuevaContrasena, rol })
    return response.data
  }
}

export default verificacionService
