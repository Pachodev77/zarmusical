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
      { title: "Dimitri Vegas, MOGUAI & Like Mike - Mammoth (Original Mix)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754616379/Dimitri_Vegas_MOGUAI_Like_Mike_-_Mammoth_Original_Mix_ziitob.mp3", cover: "https://via.placeholder.com/150" }
    ]
  };

  res.status(200).json(playlists);
}

