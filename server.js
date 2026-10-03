const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.get('/api/tmdb', async (req, res) => {
  const { path, ...queryParams } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!path) {
    return res.status(400).json({ error: "Missing 'path' parameter" });
  }

  const searchParams = new URLSearchParams({
    ...queryParams,
    api_key: TMDB_API_KEY || ''
  });
  
  const url = 'https://api.themoviedb.org/3/' + path + '?' + searchParams.toString();

  let cacheSeconds = 3600;
  if (path.includes('trending') || path.includes('popular') || path.includes('discover')) {
    cacheSeconds = 86400;
  } else if (path.includes('movie/') || path.includes('tv/')) {
    cacheSeconds = 604800;
  }

  res.setHeader('Cache-Control', 'public, s-maxage=' + cacheSeconds + ', stale-while-revalidate=86400');

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(Proxy listening on port );
});
