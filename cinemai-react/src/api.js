import { CONFIG } from './config';

// ── TMDB helper ───────────────────────────────────────────────
async function tmdb(endpoint, params = {}) {
  const url = new URL(`${CONFIG.TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', CONFIG.TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}: check your TMDB_API_KEY in config.js`);
  return res.json();
}

export const getTrending      = ()   => tmdb('/trending/movie/week');
export const getTopRated      = ()   => tmdb('/movie/top_rated');
export const searchMovies     = (q)  => tmdb('/search/movie', { query: q });
export const getMovieDetails  = (id) => tmdb(`/movie/${id}`, { append_to_response: 'videos,credits' });
export const getSimilarMovies = (id) => tmdb(`/movie/${id}/similar`);
export const discoverByGenre  = (id) => tmdb('/discover/movie', { with_genres: id, sort_by: 'popularity.desc' });

// ── Anthropic Claude ──────────────────────────────────────────
// FIX: returns the text string directly (not wrapped in data.response)
export async function askClaude(userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system:
        'You are CinemAI, an expert movie recommendation assistant. Give enthusiastic, concise recommendations. Always mention 3-5 specific movies with a short reason for each. Format movie titles in bold using **Title** syntax. Keep it under 200 words.',
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error ${res.status}`);
  }

  const data = await res.json();
  // Correct path: data.content[0].text  (NOT data.response — that was Copilot's bug)
  return data.content[0].text;
}
