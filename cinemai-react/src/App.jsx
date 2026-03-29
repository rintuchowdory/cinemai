import { useState, useEffect } from 'react';
import './style.css';
import { getTrending, getTopRated, searchMovies, askClaude, getSimilarMovies } from './api';
import { CONFIG } from './config';

function App() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchResults,  setSearchResults]  = useState([]);
  const [heroMovie,      setHeroMovie]      = useState(null);
  const [aiResponse,     setAiResponse]     = useState('');
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiVisible,      setAiVisible]      = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [aiQuery,        setAiQuery]        = useState('');
  const [modal,          setModal]          = useState(null);
  const [similarMovies,  setSimilarMovies]  = useState([]);
  const [activeTab,      setActiveTab]      = useState('home');
  const [isStreaming,    setIsStreaming]     = useState(false);
  const [streamSource,   setStreamSource]   = useState(0);

  const STREAM_SOURCES = [
    (id) => `https://vidsrc.cc/embed/movie/${id}`,
    (id) => `https://vidsrc.to/embed/movie/${id}`,
    (id) => `https://embed.su/embed/movie/${id}`,
    (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  ];

  useEffect(() => { loadTrending(); loadTopRated(); }, []);

  const loadTrending = async () => {
    try {
      const data = await getTrending();
      setTrendingMovies(data.results.slice(0, 8));
      setHeroMovie(data.results[0]);
    } catch (e) { console.error(e); }
  };

  const loadTopRated = async () => {
    try {
      const data = await getTopRated();
      setTopRatedMovies(data.results.slice(0, 8));
    } catch (e) { console.error(e); }
  };

  const doSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMovies(searchQuery);
      setSearchResults(data.results.slice(0, 12));
      setActiveTab('search');
    } catch (e) { console.error(e); }
  };

  const askAI = async (customQuery) => {
    const query = customQuery || aiQuery;
    if (!query.trim()) return;
    setAiQuery(query);
    setAiLoading(true);
    setAiVisible(true);
    setAiResponse('');
    try {
      const text = await askClaude(query);
      setAiResponse(text);
    } catch (e) {
      if (e.message.includes('credit') || e.message.includes('balance')) {
        setAiResponse('💳 Your Anthropic account needs credits. Go to console.anthropic.com → Plans & Billing → Add $5. AI will work immediately after.');
      } else if (e.message.includes('401') || e.message.includes('auth')) {
        setAiResponse('🔑 Invalid API key. Check ANTHROPIC_API_KEY in config.js.');
      } else {
        setAiResponse('⚠️ Error: ' + e.message);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const formatAI = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  const openModal = async (movie) => {
    setModal(movie);
    setIsStreaming(false);
    setStreamSource(0);
    setSimilarMovies([]);
    document.body.style.overflow = 'hidden';
    try {
      const data = await getSimilarMovies(movie.id);
      setSimilarMovies(data.results.slice(0, 6));
    } catch (e) { /* silent */ }
  };

  const closeModal = () => {
    setModal(null);
    setIsStreaming(false);
    document.body.style.overflow = '';
  };

  const tryNextSource = () => {
    const next = streamSource + 1;
    if (next < STREAM_SOURCES.length) {
      setStreamSource(next);
    } else {
      window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(modal.title)}+free+online`, '_blank');
    }
  };

  const MovieCard = ({ movie }) => (
    <div className="movie-card" onClick={() => openModal(movie)}>
      {movie.poster_path
        ? <img className="movie-poster" src={`${CONFIG.TMDB_IMG}/w342${movie.poster_path}`} alt={movie.title} loading="lazy" />
        : <div className="poster-fallback">🎬<span>{movie.title}</span></div>
      }
      <div className="rating-badge">★ {(movie.vote_average || 0).toFixed(1)}</div>
      <div className="card-overlay">
        <div className="card-play-btn">▶</div>
        <div className="card-title-overlay">{movie.title}</div>
        <div className="card-meta-overlay">{(movie.release_date || '').slice(0, 4)}</div>
      </div>
      <div className="card-info">
        <div className="card-title">{movie.title}</div>
        <div className="card-tags">
          <span className="tag free">FREE</span>
          <span className="tag">{(movie.release_date || '').slice(0, 4)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="nav">
        <div className="logo">CinemAI<span>Your Infinite Watchlist</span></div>
        <ul className="nav-links">
          {['home','movies','tv','trending'].map(tab => (
            <li key={tab}>
              <a className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search movies, shows..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            <button className="search-btn" onClick={doSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" style={{
          backgroundImage: heroMovie?.backdrop_path
            ? `url(${CONFIG.TMDB_IMG}/w1280${heroMovie.backdrop_path})`
            : 'linear-gradient(135deg,#0a1628,#1a0a2e)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">⭐ AI Pick of the Day</div>
          <h1 className="hero-title">{heroMovie?.title || 'Loading...'}</h1>
          <div className="hero-meta">
            {heroMovie && <>
              <span className="rating">★ {heroMovie.vote_average?.toFixed(1)}</span>
              <span className="dot" />
              <span>{heroMovie.release_date?.slice(0, 4)}</span>
              <span className="dot" />
              <span style={{color:'#2ec06b',fontWeight:600}}>FREE</span>
            </>}
          </div>
          <p className="hero-desc">
            {heroMovie?.overview?.slice(0, 220)}{heroMovie?.overview?.length > 220 ? '...' : ''}
          </p>
          <div className="hero-actions">
            <button className="btn-play" onClick={() => heroMovie && openModal(heroMovie)}>▶ Watch Free</button>
            <button className="btn-ghost" onClick={() => heroMovie && openModal(heroMovie)}>ℹ More Info</button>
          </div>
        </div>
      </section>

      <div className="ai-strip">
        <div className="ai-strip-header">
          <span className="ai-dot" />
          <strong>Ask CinemAI</strong>
          <span className="ai-sub">Your personal movie advisor</span>
        </div>
        <div className="ai-input-row">
          <input
            type="text"
            className="ai-input"
            placeholder="e.g. Something like Inception but more emotional..."
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()}
          />
          <button className="ai-send-btn" onClick={() => askAI()} disabled={aiLoading}>
            {aiLoading ? '⏳ Thinking...' : 'Ask AI ↗'}
          </button>
        </div>
        <div className="ai-prompts">
          {[
            ['👻','Horror tonight',     'Best free horror movies to watch tonight'],
            ['⚡','90-min pick',        'I have 90 minutes, recommend a mindblowing short film'],
            ['🍿','Weekend marathon',   'Build me a movie marathon list for the weekend mixing genres'],
            ['👨‍👩‍👧','Family night',       'Best family movies for kids under 10 that adults also enjoy'],
            ['📽️','Top documentaries',  'Top rated documentaries of all time'],
            ['💫','Like Inception',     'Something like Inception but more emotional'],
          ].map(([emoji, label, prompt]) => (
            <button key={label} className="ai-prompt" onClick={() => askAI(prompt)}>
              {emoji} {label}
            </button>
          ))}
        </div>
        {aiVisible && (
          <div className="ai-response">
            {aiLoading
              ? <span className="ai-thinking">CinemAI is thinking...</span>
              : <div dangerouslySetInnerHTML={{ __html: formatAI(aiResponse) }} />
            }
          </div>
        )}
      </div>

      <div className="genre-pills">
        {['All','Action','Drama','Sci-Fi','Comedy','Thriller','Horror','Romance','Animation','Documentary'].map(label => (
          <button key={label} className={`pill ${label==='All'?'active':''}`}>{label}</button>
        ))}
      </div>

      {activeTab === 'search' && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🔍 Results for "{searchQuery}"</h2>
            <button className="section-link" onClick={() => setActiveTab('home')}>✕ Clear</button>
          </div>
          <div className="movies-grid">
            {searchResults.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      )}

      {(activeTab === 'home' || activeTab === 'trending') && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending Now</h2>
          </div>
          <div className="movies-grid">
            {trendingMovies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      )}

      {activeTab === 'home' && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">⭐ Top Rated</h2>
          </div>
          <div className="movies-grid">
            {topRatedMovies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-logo">CinemAI</div>
        <p className="footer-copy">Powered by TMDB · Streaming via VidSrc · AI by Claude</p>
      </footer>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target.classList.contains('modal-backdrop') && closeModal()}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-player">
              {isStreaming ? (
                <>
                  <iframe
                    key={streamSource}
                    src={STREAM_SOURCES[streamSource](modal.id)}
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                    referrerPolicy="no-referrer"
                    style={{width:'100%',height:'100%',border:'none',position:'absolute',inset:0,zIndex:2}}
                  />
                  <div style={{position:'absolute',bottom:12,right:12,zIndex:3}}>
                    <button onClick={tryNextSource} style={{
                      background:'rgba(0,0,0,0.8)',color:'#e8b44a',
                      border:'1px solid #e8b44a',borderRadius:6,
                      padding:'5px 14px',fontSize:12,cursor:'pointer'
                    }}>
                      {streamSource < STREAM_SOURCES.length - 1 ? '🔄 Try different source' : '🔍 Search online'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="player-placeholder">
                  {modal.backdrop_path && (
                    <img
                      src={`${CONFIG.TMDB_IMG}/w780${modal.backdrop_path}`}
                      alt=""
                      style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.45,position:'absolute',inset:0}}
                    />
                  )}
                  <button className="play-big" onClick={() => setIsStreaming(true)}>▶</button>
                </div>
              )}
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{modal.title}</h2>
              <div className="modal-meta">
                <span className="rating">★ {modal.vote_average?.toFixed(1)}</span>
                <span className="dot" />
                <span>{modal.release_date?.slice(0,4)}</span>
                <span className="dot" />
                <span style={{color:'#2ec06b',fontWeight:600}}>Free to Watch</span>
              </div>
              <p className="modal-desc">{modal.overview}</p>
              <div className="modal-actions">
                <button className="btn-play" onClick={() => setIsStreaming(true)}>▶ Play Free</button>
                <button className="btn-ghost" onClick={() => { closeModal(); askAI(`Find 5 movies similar to ${modal.title}`); }}>
                  Similar Movies ↗
                </button>
              </div>
              {similarMovies.length > 0 && (
                <div className="similar-row">
                  {similarMovies.map(m => (
                    <div key={m.id} className="similar-card" onClick={() => openModal(m)} title={m.title}>
                      {m.poster_path
                        ? <img src={`${CONFIG.TMDB_IMG}/w154${m.poster_path}`} alt={m.title} />
                        : <div className="poster-fallback-sm">🎬</div>
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
