// Proxy endpoint para servir archivos de audio de Cloudinary con CORS
// Uso: /api/proxy_audio?url=https://res.cloudinary.com/...

import { pipeline } from 'stream';

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Proxy fetch error:', response.status, response.statusText);
      res.status(502).json({ error: 'Error fetching remote file', status: response.status, statusText: response.statusText });
      return;
    }
    // Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    res.setHeader('Content-Type', contentType);
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    // Streaming robusto
    if (response.body && pipeline) {
      pipeline(response.body, res, (err) => {
        if (err) {
          console.error('Streaming pipeline error:', err);
        }
      });
    } else if (response.body) {
      response.body.pipe(res);
    } else {
      res.status(500).json({ error: 'No response body from Cloudinary' });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}

