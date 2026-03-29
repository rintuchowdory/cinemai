// ============================================================
// CinemAI - Main Application Logic
// ============================================================

let currentMovieId = null;

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  loadTrending();
  loadTopRated();

  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  document.getElementById("aiInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") askAI();
  });

  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });
});

// ---------- Load Sections ----------

async function loadTrending() {
  try {
    const data = await getTrending();
    renderGrid("trendingGrid", data.results.slice(0, 8));
    setHero(data.results[0]);
  } catch (e) {
    showError("trendingGrid", "Could not load trending. Check your TMDB API key.");
  }
}

async function loadTopRated() {
  try {
    const data = await getTopRated();
    renderGrid("topRatedGrid", data.results.slice(0, 8));
  } catch (e) {
    showError("topRatedGrid", "Could not load top rated.");
  }
}

// ---------- Hero ----------

function setHero(movie) {
  if (!movie) return;
  const bg = document.getElementById("heroBg");
  const title = document.getElementById("heroTitle");
  const meta = document.getElementById("heroMeta");
  const desc = document.getElementById("heroDesc");
  const playBtn = document.getElementById("heroPlayBtn");
  const infoBtn = document.getElementById("heroInfoBtn");

  if (movie.backdrop_path) {
    bg.style.backgroundImage = `url(${CONFIG.TMDB_IMG}/w1280${movie.backdrop_path})`;
    bg.style.backgroundSize = "cover";
    bg.style.backgroundPosition = "center";
  }

  title.textContent = movie.title || movie.name;
  meta.innerHTML = `
    <span class="rating">★ ${(movie.vote_average || 0).toFixed(1)}</span>
    <span class="dot"></span>
    <span>${(movie.release_date || "").slice(0, 4)}</span>
    <span class="dot"></span>
    <span style="color:#2ec06b;font-weight:600">FREE</span>
  `;
  desc.textContent = movie.overview
    ? movie.overview.slice(0, 200) + (movie.overview.length > 200 ? "..." : "")
    : "";

  playBtn.onclick = () => openModal(movie);
  infoBtn.onclick = () => openModal(movie);
}

// ---------- Grid Render ----------

function renderGrid(gridId, movies) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = "";
  movies.forEach((m) => {
    const card = createCard(m);
    grid.appendChild(card);
  });
}

function createCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const poster = movie.poster_path
    ? `<img class="movie-poster" src="${CONFIG.TMDB_IMG}/w342${movie.poster_path}" alt="${movie.title}" loading="lazy" />`
    : `<div class="poster-fallback">🎬<br/><span>${movie.title}</span></div>`;

  const year = (movie.release_date || "").slice(0, 4);
  const rating = (movie.vote_average || 0).toFixed(1);

  card.innerHTML = `
    ${poster}
    <div class="rating-badge">★ ${rating}</div>
    <div class="card-overlay">
      <div class="card-play-btn">▶</div>
      <div class="card-title-overlay">${movie.title}</div>
      <div class="card-meta-overlay">${year}</div>
    </div>
    <div class="card-info">
      <div class="card-title">${movie.title}</div>
      <div class="card-tags">
        <span class="tag free">FREE</span>
        <span class="tag">${year}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => openModal(movie));
  return card;
}

// ---------- Search ----------

async function doSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const searchSection = document.getElementById("searchSection");
  const searchGrid = document.getElementById("searchGrid");
  const searchTitle = document.getElementById("searchTitle");

  searchTitle.textContent = `Results for "${query}"`;
  searchGrid.innerHTML = '<div class="loading">Searching...</div>';
  searchSection.classList.remove("hidden");
  searchSection.scrollIntoView({ behavior: "smooth" });

  try {
    const data = await searchMovies(query);
    if (data.results.length === 0) {
      searchGrid.innerHTML = '<div class="loading">No results found.</div>';
    } else {
      renderGrid("searchGrid", data.results.slice(0, 12));
    }
  } catch (e) {
    searchGrid.innerHTML = '<div class="loading">Search failed. Check API key.</div>';
  }
}

// ---------- Genre Filter ----------

async function filterGenre(btn, genreId) {
  document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");

  const grid = document.getElementById("trendingGrid");
  grid.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = genreId
      ? await discoverByGenre(genreId)
      : await getTrending();
    renderGrid("trendingGrid", data.results.slice(0, 8));
  } catch (e) {
    grid.innerHTML = '<div class="loading">Error loading movies.</div>';
  }
}

// ---------- Modal ----------

async function openModal(movie) {
  currentMovieId = movie.id;
  document.getElementById("modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  document.getElementById("modalTitle").textContent = movie.title || movie.name;
  document.getElementById("modalDesc").textContent = movie.overview || "";
  document.getElementById("modalMeta").innerHTML = `
    <span class="rating">★ ${(movie.vote_average || 0).toFixed(1)}</span>
    <span class="dot"></span>
    <span>${(movie.release_date || "").slice(0, 4)}</span>
    <span class="dot"></span>
    <span style="color:#2ec06b;font-weight:600">FREE to Watch</span>
  `;

  // Set backdrop
  const backdrop = document.getElementById("modalBackdrop");
  if (movie.backdrop_path) {
    backdrop.src = `${CONFIG.TMDB_IMG}/w780${movie.backdrop_path}`;
  } else if (movie.poster_path) {
    backdrop.src = `${CONFIG.TMDB_IMG}/w500${movie.poster_path}`;
  }

  // Reset player
  const frame = document.getElementById("streamFrame");
  frame.src = "";
  frame.classList.add("hidden");
  document.getElementById("playerPlaceholder").classList.remove("hidden");
  document.getElementById("similarMovies").classList.add("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("streamFrame").src = "";
  document.body.style.overflow = "";
  currentMovieId = null;
}

function startStream() {
  if (!currentMovieId) return;
  const frame = document.getElementById("streamFrame");
  frame.src = getStreamURL(currentMovieId, "movie");
  frame.classList.remove("hidden");
  document.getElementById("playerPlaceholder").classList.add("hidden");
}

async function fetchSimilar() {
  if (!currentMovieId) return;
  const container = document.getElementById("similarMovies");
  container.innerHTML = "Loading similar...";
  container.classList.remove("hidden");

  try {
    const data = await getSimilarMovies(currentMovieId);
    container.innerHTML = "";
    data.results.slice(0, 6).forEach((m) => {
      const el = document.createElement("div");
      el.className = "similar-card";
      el.innerHTML = m.poster_path
        ? `<img src="${CONFIG.TMDB_IMG}/w154${m.poster_path}" alt="${m.title}" />`
        : `<div class="poster-fallback-sm">🎬</div>`;
      el.title = m.title;
      el.onclick = () => openModal(m);
      container.appendChild(el);
    });
  } catch (e) {
    container.textContent = "Could not load similar movies.";
  }
}

// ---------- AI ----------

function setAIPrompt(text) {
  document.getElementById("aiInput").value = text;
  askAI();
}

async function askAI() {
  const input = document.getElementById("aiInput");
  const responseBox = document.getElementById("aiResponse");
  const query = input.value.trim();
  if (!query) return;

  responseBox.classList.remove("hidden");
  responseBox.innerHTML = '<span class="ai-thinking">CinemAI is thinking...</span>';

  try {
    const text = await askClaude(query);
    // Convert **bold** to <strong>
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
    responseBox.innerHTML = `<div class="ai-answer">${formatted}</div>`;
  } catch (e) {
    responseBox.innerHTML = `<div class="ai-answer" style="color:#e54545">AI error: ${e.message}. Check your Anthropic API key.</div>`;
  }
}

// ---------- Nav tabs ----------
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-links a").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
  });
});

// ---------- Util ----------

function showError(gridId, msg) {
  const el = document.getElementById(gridId);
  if (el) el.innerHTML = `<div class="loading">${msg}</div>`;
}
