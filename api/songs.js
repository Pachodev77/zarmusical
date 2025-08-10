// Next.js API route compatible con Vercel para servir playlists desde Google Drive

import { getCloudinaryAudioUrls } from './cloudinary_audio';

// Lista de categorías a buscar en Cloudinary
const categories = ['urbano', 'latino', 'rock', 'pop', 'reggaeton', 'trap', 'romanticas', 'rancheras', 'vallenato', 'salsa', 'bachata', 'merengue', 'electronica', 'crossover'];

export default async function handler(req, res) {
  // Obtener canciones de Cloudinary dinámicamente para cada categoría
  const playlists = {};
  for (const cat of categories) {
    playlists[cat] = await getCloudinaryAudioUrls(cat);
  }
  res.status(200).json(playlists);
}
