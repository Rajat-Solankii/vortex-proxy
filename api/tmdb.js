const fetch = require('node-fetch');

export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!path) {
    return res.status(400).json({ error: "Missing 'path' parameter" });
  }

  // Build the TMDB URL
  const searchParams = new URLSearchParams({
    ...queryParams,
    api_key: TMDB_API_KEY
  });
  
  const url = `https://api.themoviedb.org/3/${path}?${searchParams.toString()}`;

  // CACHING LOGIC for 1,000 users
  let cacheSeconds = 3600; // Default: 1 hour
  if (path.includes('trending') || path.includes('popular')) {
    cacheSeconds = 86400; // 1 DAY for Home Screen
  } else if (path.includes('movie/') || path.includes('tv/')) {
    cacheSeconds = 604800; // 1 WEEK for Details
  }

  // Set the Cache headers
  res.setHeader('Cache-Control', `s-maxage=${cacheSeconds}, stale-while-revalidate`);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow your app to call it

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}