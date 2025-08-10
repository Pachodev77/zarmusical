// Script para validar todos los mp3 de Cloudinary y detectar archivos corruptos o no reproducibles
// Uso: node scripts/validate_cloudinary_mp3s.js

const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function checkMp3Url(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => { data = Buffer.concat([data, chunk]); });
      res.on('end', () => {
        // MP3 files should start with 'ID3' or 0xFFFB (frame sync)
        const isId3 = data.slice(0, 3).toString() === 'ID3';
        const isFrame = data[0] === 0xFF && (data[1] & 0xE0) === 0xE0;
        resolve({ url, ok: isId3 || isFrame });
      });
    }).on('error', () => resolve({ url, ok: false }));
  });
}

async function main() {
  // Buscar todos los mp3 en Cloudinary
  const result = await cloudinary.search
    .expression('resource_type:video AND format:mp3')
    .max_results(500)
    .execute();

  const urls = result.resources.map(r => r.secure_url);
  console.log(`Verificando ${urls.length} archivos mp3 en Cloudinary...`);
  let valid = 0, invalid = 0;

  for (const url of urls) {
    process.stdout.write('.');
    // Solo chequea los primeros bytes para no descargar todo
    const res = await checkMp3Url(url);
    if (!res.ok) {
      invalid++;
      console.log(`\nArchivo corrupto o inválido: ${url}`);
    } else {
      valid++;
    }
  }
  console.log(`\n\nValidos: ${valid}, Corruptos: ${invalid}`);
}

main();
