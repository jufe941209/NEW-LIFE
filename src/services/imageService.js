import axios from 'axios'

const CLOUD_NAME    = 'dux6dlfry'
const UPLOAD_PRESET = 'newlife_productos'
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

const imageService = {
  /**
   * Sube una imagen a Cloudinary y devuelve la URL pública CDN.
   * Sube directo desde el frontend — no pasa por el backend.
   * @param {File} file
   * @returns {Promise<string>} URL HTTPS del CDN de Cloudinary
   */
  upload: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', 'productos')

    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    })
    return response.data.secure_url
  },
}

export default imageService
