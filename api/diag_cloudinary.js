// Endpoint de diagnóstico para ver el estado de Cloudinary y variables de entorno
export default async function handler(req, res) {
  try {
    // Verificar variables de entorno
    const envVars = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? 'EXISTS' : 'MISSING',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'EXISTS' : 'MISSING'
    };

    // Intentar conectar a Cloudinary
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Probar la conexión
    const testResult = await cloudinary.api.resource_types();

    // Verificar si hay archivos en las carpetas
    const folders = ['urbano', 'latino', 'electro'];
    const folderChecks = {};
    for (const folder of folders) {
      try {
        const result = await cloudinary.search
          .expression(`resource_type:video AND folder:${folder}`)
          .max_results(1)
          .execute();
        folderChecks[folder] = result.resources.length > 0 ? 'HAS FILES' : 'EMPTY';
      } catch (e) {
        folderChecks[folder] = 'ERROR: ' + e.message;
      }
    }

    res.status(200).json({
      env: envVars,
      cloudinaryTest: testResult,
      folderChecks: folderChecks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Diag error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
