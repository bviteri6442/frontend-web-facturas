// Servicio de subida de imagenes a Cloudinary
const CLOUD_NAME = 'dotoxykvr'
const UPLOAD_PRESET = 'ml_default'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * Sube un File a Cloudinary y retorna la URL segura.
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<string>} URL segura de Cloudinary
 */
export async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    let detail = ''
    try {
      detail = (await response.json()).error?.message || ''
    } catch (_) {
      /* ignore */
    }
    throw new Error(`Cloudinary ${response.status}: ${detail}`)
  }

  const data = await response.json()
  return data.secure_url
}
