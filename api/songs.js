// Next.js API route compatible con Vercel para servir playlists desde Google Drive

const { getCloudinaryAudioUrls } = require('./cloudinary_audio');

// Lista de categorías a buscar en Cloudinary
const categories = ['urbano', 'latino', 'rock', 'pop', 'reggaeton', 'trap', 'romanticas', 'rancheras', 'vallenato', 'salsa', 'bachata', 'merengue', 'electronica', 'crossover'];

export default async function handler(req, res) {
  try {
    const playlists = {};
    for (const cat of categories) {
      try {
        const result = await getCloudinaryAudioUrls(cat);
        playlists[cat] = Array.isArray(result) ? result : [];
      } catch (e) {
        console.error(`Error obteniendo ${cat}:`, e);
        playlists[cat] = [];
      }
    }
    res.status(200).json(playlists);
  } catch (err) {
    console.error('Error in /api/songs:', err);
    res.status(500).json({ error: 'Internal Server Error', detail: err.message, stack: err.stack });
  }
}
