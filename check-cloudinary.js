const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkCloudinary() {
  try {
    console.log('🔍 Verificando configuración de Cloudinary...');
    
    // Verificar credenciales básicas
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Faltan variables de entorno de Cloudinary');
      console.log('Por favor, asegúrate de configurar las siguientes variables de entorno:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
      return;
    }

    console.log('✅ Variables de entorno configuradas correctamente');
    
    // Verificar conexión con Cloudinary
    console.log('\n🔌 Probando conexión con Cloudinary...');
    const ping = await cloudinary.api.ping();
    console.log('✅ Conexión exitosa con Cloudinary');
    
    // Verificar carpetas
    console.log('\n📂 Verificando carpetas en Cloudinary...');
    const folders = ['urbano', 'latino', 'electro'];
    
    for (const folder of folders) {
      try {
        const result = await cloudinary.search
          .expression(`resource_type:video AND folder:${folder}`)
          .max_results(1)
          .execute();
        
        const count = result.resources ? result.resources.length : 0;
        console.log(`📁 ${folder}: ${count > 0 ? '✅ Encontrados archivos' : '⚠️  Carpeta vacía o no encontrada'}`);
        
        if (count > 0) {
          console.log(`   Ejemplo de archivo: ${result.resources[0].public_id}`);
        }
      } catch (error) {
        console.error(`❌ Error al verificar la carpeta ${folder}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al verificar Cloudinary:', error.message);
    console.error('Detalles:', error);
  }
}

// Ejecutar diagnóstico
checkCloudinary();
