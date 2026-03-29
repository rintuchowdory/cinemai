import { useState, useEffect } from 'react';
import './style.css';
import { getTrending, getTopRated, searchMovies, askClaude, getMovieDetails } from './api';
import { CONFIG } from './config';

function App() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiResponseVisible, setIsAiResponseVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);

  useEffect(() => {
    loadTrending();
    loadTopRated();
  }, []);

  const loadTrending = async () => {
    try {
      const data = await getTrending();
      setTrendingMovies(data.results.slice(0, 8));
      setHeroMovie(data.results[0]);
    } catch (e) {
      console.error('Could not load trending:', e);
    }
  };

  const loadTopRated = async () => {
    try {
      const data = await getTopRated();
      setTopRatedMovies(data.results.slice(0, 8));
    } catch (e) {
      console.error('Could not load top rated:', e);
    }
  };

  const doSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMovies(searchQuery);
      setSearchResults(data.results);
    } catch (e) {
      console.error('Search failed:', e);
    }
  };

  const askAI = async () => {
    if (!aiQuery.trim()) return;
    try {
      const data = await askClaude(aiQuery);
      setAiResponse(data.response || 'No response from AI');
      setIsAiResponseVisible(true);
    } catch (e) {
      setAiResponse('Error: ' + e.message);
      setIsAiResponseVisible(true);
    }
  };

  const handleWatchFree = () => {
    if (heroMovie) {
      const streamingUrl = `${CONFIG.VIDSRC_BASE}/${heroMovie.id}`;
      window.open(streamingUrl, '_blank');
    }
  };

  const handleMoreInfo = async () => {
    if (heroMovie) {
      try {
        const details = await getMovieDetails(heroMovie.id);
        setMovieDetails(details);
        alert(`Title: ${details.title}\nOverview: ${details.overview}`); // Replace with a modal or detailed view
      } catch (e) {
        console.error('Failed to fetch movie details:', e);
      }
    }
  };

  const renderMovieCard = (movie) => (
    <div key={movie.id} className="movie-card" onClick={() => setHeroMovie(movie)}>
      <img src={`${CONFIG.TMDB_IMG}/w500${movie.poster_path}`} alt={movie.title} />
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date?.split('-')[0]}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="logo">CinemAI<span>Your Infinite Watchlist</span></div>
        <ul className="nav-links">
          <li><a className="active" data-section="home">Home</a></li>
          <li><a data-section="movies">Movies</a></li>
          <li><a data-section="tv">TV Shows</a></li>
          <li><a data-section="trending">Trending</a></li>
        </ul>
        <div className="nav-right">
          <div className="search-wrap">
            <input
              type="text"
              id="searchInput"
              className="search-input"
              placeholder="Search movies, shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            />
            <button className="search-btn" onClick={doSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div
          className="hero-bg"
          id="heroBg"
          style={{
            backgroundImage: heroMovie?.backdrop_path ? `url(${CONFIG.TMDB_IMG}/w1280${heroMovie.backdrop_path})` : 'none',
            backgroundSize: 'cover'
          }}
        ></div>
        <div className="hero-overlay"></div>
        <div className="hero-content" id="heroContent">
          <div className="hero-badge">⭐ AI Pick of the Day</div>
          <h1 className="hero-title" id="heroTitle">{heroMovie?.title || 'Loading...'}</h1>
          <div className="hero-meta" id="heroMeta">
            {heroMovie && `${heroMovie.release_date?.split('-')[0]} • ${heroMovie.vote_average?.toFixed(1)} ⭐`}
          </div>
          <p className="hero-desc" id="heroDesc">{heroMovie?.overview}</p>
          <div className="hero-actions">
            <button className="btn-play" id="heroPlayBtn" onClick={handleWatchFree}>▶ Watch Free</button>
            <button className="btn-ghost" id="heroInfoBtn" onClick={handleMoreInfo}>ℹ More Info</button>
          </div>
        </div>
      </section>

      {/* AI ASK STRIP */}
      <div className="ai-strip">
        <div className="ai-strip-header">
          <span className="ai-dot"></span>
          <strong>Ask CinemAI</strong>
          <span className="ai-sub">Your personal movie advisor</span>
        </div>
        <div className="ai-input-row">
          <input
            type="text"
            id="aiInput"
            className="ai-input"
            placeholder="e.g. Something like Inception but more emotional..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAI()}
          />
          <button className="ai-send-btn" onClick={askAI}>Ask AI ↗</button>
        </div>
        <div id="aiResponse" className={`ai-response ${isAiResponseVisible ? '' : 'hidden'}`}>
          {aiResponse}
        </div>
        <div className="ai-prompts"></div>
      </div>

      {/* TRENDING SECTION */}
      <section className="section">
        <h2>Trending Now</h2>
        <div className="movie-grid" id="trendingGrid">
          {trendingMovies.map(renderMovieCard)}
        </div>
      </section>

      {/* TOP RATED SECTION */}
      <section className="section">
        <h2>Top Rated</h2>
        <div className="movie-grid" id="topRatedGrid">
          {topRatedMovies.map(renderMovieCard)}
        </div>
      </section>
    </>
  );
}

export default App;
