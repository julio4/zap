// pages/api/image-proxy.js
import fetch from 'node-fetch';

export default async function handler(req: any, res: any) {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send('No image URL provided');
  }

  try {
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();

    res.setHeader('Content-Type', response.headers.get('content-type'));
    res.setHeader('Access-Control-Allow-Origin', '*'); // set appropriate CORS headers
    res.send(imageBuffer);
  } catch (error) {
    console.error('Failed to fetch image:', error);
    res.status(500).send('Internal server error');
  }
}