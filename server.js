require('dotenv').config({ path: '.env.local' });
const express = require('express');
const path = require('path');
const { getCloudinaryAudioUrls } = require('./api/cloudinary_audio');

const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // Servir archivos estáticos desde la raíz

// Configurar CORS para desarrollo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint para obtener canciones desde Cloudinary
app.get('/api/songs', async (req, res) => {
  try {
    const categories = ['music/urbano', 'music/latino', 'music/electro'];
    const playlists = {};

    for (const category of categories) {
      try {
        const songs = await getCloudinaryAudioUrls(category);
        playlists[category] = songs.map(song => ({
          title: song.title,
          artist: 'Artista',
          src: song.src,
          cover: song.cover || 'https://via.placeholder.com/150'
        }));
      } catch (error) {
        console.error(`Error obteniendo canciones para ${category}:`, error);
        playlists[category] = [];
      }
    }

    res.json(playlists);
  } catch (error) {
    console.error('Error en /api/songs:', error);
    res.status(500).json({ error: 'Error al obtener las canciones' });
  }
});

// Endpoint de diagnóstico
app.get('/api/diag', async (req, res) => {
  try {
    // Verificar variables de entorno
    const envVars = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Configurada' : 'No configurada',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Configurada' : 'No configurada',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Configurada' : 'No configurada'
    };

    res.json({
      status: 'Servidor funcionando',
      environment: process.env.NODE_ENV || 'development',
      port,
      envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    res.status(500).json({ error: 'Error en el diagnóstico' });
  }
});

// Servir el archivo index.html para cualquier otra ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
  console.log('📡 Endpoints disponibles:');
  console.log(`   - http://localhost:${port}/api/songs`);
  console.log(`   - http://localhost:${port}/api/diag`);
  console.log('\n🔍 Verifica que las variables de entorno de Cloudinary estén configuradas correctamente.');
});
