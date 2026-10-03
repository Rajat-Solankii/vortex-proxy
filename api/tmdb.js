export const runtime = 'edge';

export default async function handler(req) {
  const urlParams = new URL(req.url).searchParams;
  const path = urlParams.get('path');
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!path) {
    return new Response(JSON.stringify({ error: "Missing 'path' parameter" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Remove 'path' from params and append api_key
  urlParams.delete('path');
  urlParams.append('api_key', TMDB_API_KEY);
  
  const url = `https://api.themoviedb.org/3/${path}?${urlParams.toString()}`;

  // Cache Logic
  let cacheSeconds = 3600; // Default: 1 hour
  if (path.includes('trending') || path.includes('popular') || path.includes('discover')) {
    cacheSeconds = 86400; // 1 DAY for Home Screen & Categories
  } else if (path.includes('movie/') || path.includes('tv/')) {
    cacheSeconds = 604800; // 1 WEEK for Details
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
