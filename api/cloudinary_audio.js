// Utilidad para obtener URLs de audios desde Cloudinary
// Uso: importar y llamar getCloudinaryAudioUrls()

import cloudinaryPkg from 'cloudinary';
const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Busca archivos de audio en una carpeta específica de Cloudinary
 * @param {string} folder - Carpeta dentro de Cloudinary (ej: 'urbano')
 * @returns {Promise<Array<{title: string, src: string, cover: string}>>}
 */
async function getCloudinaryAudioUrls(folder) {
  const result = await cloudinary.search
    .expression(`resource_type:video AND folder:${folder}`)
    .sort_by('public_id','desc')
    .max_results(50)
    .execute();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return result.resources.map(file => ({
    title: file.public_id.split('/').pop().replace(/_/g, ' '),
    src: file.secure_url,
    manual_url: `https://res.cloudinary.com/${cloudName}/video/upload/${file.public_id}.mp3`,
    cover: file.thumbnail_url || 'https://via.placeholder.com/150',
  }));
}

export { getCloudinaryAudioUrls };
