// Utilidad para obtener URLs de audios desde Cloudinary
// Uso: importar y llamar getCloudinaryAudioUrls()

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Busca archivos de audio en una carpeta específica de Cloudinary
 * @param {string} folder - Carpeta dentro de Cloudinary (ej: 'music/urbano')
 * @returns {Promise<Array<{title: string, src: string, cover: string}>>}
 */
async function getCloudinaryAudioUrls(folder) {
  try {
    console.log(`Buscando archivos en la carpeta: ${folder}`);
    
    // Buscar archivos de audio y videos por separado para mejor control
    let audioResults = [];
    let videoResults = [];
    
    try {
      // Buscar archivos de audio MP3
      const audioSearch = await cloudinary.search
        .expression(`resource_type:raw AND folder:${folder} AND format:mp3`)
        .sort_by('public_id', 'desc')
        .max_results(50)
        .execute();
      audioResults = audioSearch.resources || [];
    } catch (error) {
      console.error(`Error buscando archivos de audio en ${folder}:`, error);
    }
    
    try {
      // Buscar archivos de video
      const videoSearch = await cloudinary.search
        .expression(`resource_type:video AND folder:${folder}`)
        .sort_by('public_id', 'desc')
        .max_results(50)
        .execute();
      videoResults = videoSearch.resources || [];
    } catch (error) {
      console.error(`Error buscando archivos de video en ${folder}:`, error);
    }
    
    // Combinar resultados
    const result = {
      resources: [...audioResults, ...videoResults]
    };

    console.log(`Se encontraron ${result.resources?.length || 0} archivos en ${folder}`);
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    return result.resources.map(file => {
      const publicId = file.public_id;
      const isVideo = file.resource_type === 'video';
      const fileExt = isVideo ? 'mp4' : file.format || 'mp3';
      
      // Generar URL compatible con el elemento <audio>
      let audioUrl;
      if (isVideo) {
        // Para videos, usar la API de Cloudinary para extraer audio
        // Usar una transformación más simple para mayor compatibilidad
        audioUrl = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${publicId}.mp3`;
        console.log('Generated video-to-audio URL:', audioUrl);
      } else {
        // Para archivos de audio, usar la URL directa
        audioUrl = file.secure_url;
        console.log('Using direct audio URL:', audioUrl);
      }
      
      // Generar miniatura de portada
      const cover = file.thumbnail_url || 
                   (isVideo 
                     ? `https://res.cloudinary.com/${cloudName}/video/upload/c_fill,h_150,w_150/${publicId}.jpg`
                     : `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,h_150,w_150/${publicId}.jpg`);
      
      // Extraer título del nombre del archivo
      const title = publicId
        .split('/')
        .pop()
        .replace(/[-_]/g, ' ')
        .replace(/\.(mp3|mp4|wav|ogg|m4a)$/i, '')
        .replace(/\([^)]*\)/g, '') // Eliminar texto entre paréntesis
        .trim();
      
      return {
        id: `${folder.replace(/\//g, '-')}-${publicId}`,
        title: title || 'Canción sin título',
        artist: folder.split('/').pop().charAt(0).toUpperCase() + folder.split('/').pop().slice(1),
        audioUrl: audioUrl,
        cover: cover,
        isVideo: isVideo,
        format: isVideo ? 'mp3' : (file.format || 'mp3')
      };
    });
  } catch (error) {
    console.error(`Error al obtener archivos de audio de ${folder}:`, error);
    return [];
  }
}

module.exports = { getCloudinaryAudioUrls };
