// Proxy para servir archivos de Google Drive como audio streaming
// Next.js API Route compatible con Vercel

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Missing id parameter' });
    return;
  }

  const url = `https://drive.google.com/uc?export=download&id=${id}`;

  try {
    const response = await fetch(url, {
      headers: {
        // User-Agent para evitar bloqueos básicos
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Failed to fetch from Google Drive' });
      return;
    }

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Pipe the response body to the client
    response.body.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}
