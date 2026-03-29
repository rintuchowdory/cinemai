// ============================================================
// CinemAI - API Layer (TMDB + Anthropic Claude)
// ============================================================

// ---------- TMDB ----------

async function tmdb(endpoint, params = {}) {
  const url = new URL(`${CONFIG.TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", CONFIG.TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

async function getTrending() {
  return tmdb("/trending/movie/week");
}

async function getTopRated() {
  return tmdb("/movie/top_rated");
}

async function searchMovies(query) {
  return tmdb("/search/movie", { query });
}

async function getMovieDetails(id) {
  return tmdb(`/movie/${id}`, { append_to_response: "videos,credits" });
}

async function getSimilarMovies(id) {
  return tmdb(`/movie/${id}/similar`);
}

async function discoverByGenre(genreId) {
  return tmdb("/discover/movie", {
    with_genres: genreId,
    sort_by: "popularity.desc",
  });
}

// ---------- Anthropic Claude ----------

async function askClaude(userMessage) {
  const res = await fetch("/api/ask-claude", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userMessage: userMessage,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "AI error");
  }
  const data = await res.json();
  return data.content[0].text;
}

// ---------- VidSrc Embed ----------

function getStreamURL(tmdbId, type = "movie") {
  // vidsrc.cc supports: /embed/movie/{id} and /embed/tv/{id}/{season}/{episode}
  return `${CONFIG.VIDSRC_BASE}/${type}/${tmdbId}`;
}
