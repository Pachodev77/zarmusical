# Sonido Callejero

Reproductor de música web con integración a Cloudinary.

## Configuración del Entorno

### Variables de Entorno Requeridas

Para que la aplicación funcione correctamente, necesitas configurar las siguientes variables de entorno:

```bash
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Configuración Local

1. Crea un archivo `.env.local` en la raíz del proyecto con las variables de entorno mencionadas.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Despliegue en Vercel

1. Ve a la configuración de tu proyecto en Vercel.
2. Navega a la sección "Environment Variables".
3. Agrega las siguientes variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Configuración de Cloudinary

Asegúrate de que en tu cuenta de Cloudinary tengas configuradas las siguientes carpetas:
- `urbano`
- `latino`
- `electro`

Dentro de cada carpeta, sube los archivos de audio (mp3) que deseas que aparezcan en cada categoría.

## Estructura del Proyecto

- `/api` - Endpoints de la API
- `/public` - Archivos estáticos
- `/styles` - Hojas de estilo CSS
- `/pages` - Páginas de la aplicación

## Solución de Problemas

Si las canciones no se cargan:
1. Verifica que las variables de entorno estén configuradas correctamente.
2. Asegúrate de que los archivos de audio estén en las carpetas correctas en Cloudinary.
3. Revisa la consola del navegador para ver mensajes de error.
