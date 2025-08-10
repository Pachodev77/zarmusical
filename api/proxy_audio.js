// Proxy endpoint para servir archivos de audio de Cloudinary con CORS
// Uso: /api/proxy_audio?url=https://res.cloudinary.com/...

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  try {
    // Fetch el archivo remoto y retransmitirlo
    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: 'Error fetching remote file' });
      return;
    }
    // Pasar headers apropiados
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type'));
    // Stream the response
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
