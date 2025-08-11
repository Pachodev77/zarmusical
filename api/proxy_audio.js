// Proxy endpoint para servir archivos de audio de Cloudinary con CORS
// Uso: /api/proxy_audio?url=https://res.cloudinary.com/...

import { pipeline } from 'stream';

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    console.error('Missing url parameter in request');
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }
  
  console.log('Incoming proxy request for URL:', url);
  console.log('Request headers:', req.headers);
  
  try {
    // Add a user agent and accept headers to mimic a browser request
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    headers.set('Accept', 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5');
    
    console.log('Fetching from Cloudinary with headers:', Object.fromEntries(headers.entries()));
    
    // Fetch the audio with streaming
    const response = await fetch(url, { 
      headers,
      // Important: Don't follow redirects automatically
      redirect: 'manual',
      // Don't automatically decompress the response
      compress: false
    });
    
    console.log('Cloudinary response status:', response.status, response.statusText);
    
    // Handle redirects manually
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.log('Redirecting to:', location);
      if (location) {
        // Follow the redirect
        const redirectResponse = await fetch(location, { headers });
        return handleAudioResponse(redirectResponse, res);
      }
    }
    
    return handleAudioResponse(response, res);
  } catch (error) {
    console.error('Error in proxy handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleAudioResponse(response, res) {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error details');
    console.error('Error from Cloudinary:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText
    });
    
    res.status(response.status).json({
      error: 'Failed to fetch audio',
      status: response.status,
      statusText: response.statusText,
      details: errorText
    });
    return false;
  }

  // Log response details
  let contentType = response.headers.get('content-type');
  
  // Force audio/mp3 for .mp3 files if content-type is not set or is generic
  if (!contentType || contentType === 'application/octet-stream') {
    if (url.includes('.mp3')) {
      contentType = 'audio/mp3';
    } else if (url.includes('.wav')) {
      contentType = 'audio/wav';
    } else if (url.includes('.ogg')) {
      contentType = 'audio/ogg';
    } else {
      contentType = 'audio/mpeg'; // Default fallback
    }
    console.log('Forced content-type to:', contentType);
  }
  const contentLength = response.headers.get('content-length');
  const contentRange = response.headers.get('content-range');
  const acceptRanges = response.headers.get('accept-ranges');
  const contentDisposition = response.headers.get('content-disposition');
  const etag = response.headers.get('etag');
  const lastModified = response.headers.get('last-modified');
  
  console.log('Cloudinary response headers:', {
    status: response.status,
    statusText: response.statusText,
    'content-type': contentType,
    'content-length': contentLength,
    'content-range': contentRange,
    'accept-ranges': acceptRanges,
    'content-disposition': contentDisposition,
    'etag': etag,
    'last-modified': lastModified
  });
  
  // Set response headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', contentType);
  
  // Important headers for streaming audio
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=0');
  
  // If this is a range request, handle it
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });
  }
  
  // Copy over important headers
  const headersToCopy = [
    'content-length',
    'content-range',
    'accept-ranges',
    'content-disposition',
    'etag',
    'last-modified',
    'cache-control',
    'expires'
  ];
  
  headersToCopy.forEach(header => {
    const value = response.headers.get(header);
    if (value) {
      res.setHeader(header, value);
    }
  });
  
  // Handle streaming with proper error handling
  if (response.body && pipeline) {
    console.log('Starting stream pipeline...');
    
    // Handle errors in the pipeline
    const onError = (err) => {
      console.error('Pipeline error:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Stream error',
          details: err.message 
        });
      }
    };
    
    // Handle successful finish
    const onFinish = () => {
      console.log('Stream finished successfully');
    };
    
    // Create the pipeline
    const pipelinePromise = pipeline(
      response.body,
      res,
      { end: true },
      (err) => err ? onError(err) : onFinish()
    );
    
    // Handle pipeline promise if it returns one (Node.js 15+)
    if (pipelinePromise && typeof pipelinePromise.catch === 'function') {
      pipelinePromise.catch(onError);
    }
  } else {
    // Fallback to buffering if stream.pipeline is not available
    console.log('Using buffered response fallback');
    try {
      const buffer = await response.arrayBuffer();
      console.log(`Received ${buffer.byteLength} bytes of audio data`);
      
      // Log first few bytes for debugging
      const bytes = new Uint8Array(buffer.slice(0, 16));
      console.log('First 16 bytes:', Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
      
      res.send(Buffer.from(buffer));
    } catch (bufferError) {
      console.error('Error buffering response:', bufferError);
      res.status(500).json({ 
        error: 'Error buffering audio',
        details: bufferError.message 
      });
    }
  }
  
  return true;
}
