import axios from 'axios'

const BASE_URL = 'https://newlife-api-agfzb6a7bdb5b7bq.eastus-01.azurewebsites.net/api'

const imageService = {
  /**
   * Sube una imagen al backend y devuelve la URL pública.
   * @param {File} file - Objeto File del input
   * @returns {Promise<string>} URL pública de la imagen guardada
   */
  upload: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(`${BASE_URL}/imagenes/producto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
    return response.data.url
  },

  /**
   * Elimina una imagen del servidor dado su nombre de archivo.
   * @param {string} nombreArchivo - Solo el nombre del archivo (sin ruta)
   */
  delete: async (nombreArchivo) => {
    if (!nombreArchivo) return
    await axios.delete(`${BASE_URL}/imagenes/producto/${nombreArchivo}`, { timeout: 10000 })
  },

  /**
   * Extrae el nombre de archivo de una URL de imagen subida por nosotros.
   * Devuelve null si la URL no es del backend propio.
   */
  extraerNombre: (url) => {
    if (!url || !url.includes('/Uploads/productos/')) return null
    return url.split('/Uploads/productos/').pop()
  },
}

export default imageService
