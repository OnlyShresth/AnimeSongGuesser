export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    const decodedUrl = decodeURIComponent(url);
    
    // Validate URL to prevent abuse
    if (!decodedUrl.includes('animethemes.moe')) {
      return res.status(403).json({ error: 'Only AnimeThemes URLs allowed' });
    }

    console.log('Proxying:', decodedUrl);

    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'AnimeSongGuesser/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    
    // Set proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Length', response.headers.get('content-length') || '0');
    
    // Stream the response
    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy audio', 
      details: error.message 
    });
  }
}
