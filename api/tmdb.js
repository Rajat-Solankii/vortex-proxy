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

  // TWEAK: Better Cache Logic (discover/ added)
  let cacheSeconds = 3600; // Default: 1 hour
  if (path.includes('trending') || path.includes('popular') || path.includes('discover')) {
    cacheSeconds = 86400; // 1 DAY for Home Screen & Categories
  } else if (path.includes('movie/') || path.includes('tv/')) {
    cacheSeconds = 604800; // 1 WEEK for Details
  }

  // TWEAK: Proper Cache-Control string with public and stale-while-revalidate values
  res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`);
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
