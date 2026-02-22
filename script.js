// ============================================
// EVC - Movie Streaming Website
// Full SPA with All Pages & Systems
// ============================================

// --- Supabase Config ---
const SUPABASE_URL = 'https://xhoiouzraqoyvevbxefj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K3hyy5i7tZ5J9Z4WtTop1g_ZFAW06R5';

let supabaseClient = null;
let allMovies = [];
let currentPage = 'home';
let activeCategory = 'All';

// --- localStorage helpers ---
const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem('evc_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('evc_' + key, JSON.stringify(val)); },
  getObj(key) { try { return JSON.parse(localStorage.getItem('evc_' + key)) || {}; } catch { return {}; } },
  setObj(key, val) { localStorage.setItem('evc_' + key, JSON.stringify(val)); }
};

// --- User settings defaults ---
function getSettings() {
  return storage.getObj('settings') || { theme: 'light', language: 'th', autoplay: true, quality: '1080p', notifications: true };
}
function saveSettings(s) { storage.setObj('settings', s); }

function getAccount() {
  return storage.getObj('account') || { name: 'Movie Fan', email: 'user@evc.com', avatar: 'M', joined: '2025' };
}
function saveAccount(a) { storage.setObj('account', a); }

// --- Fallback Movie Data ---
const fallbackMovies = [
  { id: 1, title: "Pacific Rim", year: 2013, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/sCxfSuEfNE1s3aBFMXRiPireIsK.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/cUJYBIbHLJK2ll0CztrHgrXBOlI.jpg", imdb_rating: 6.9, rt_score: "72%", trailer_url: "https://www.youtube.com/embed/5guMumPFBag", is_featured: true },
  { id: 2, title: "The Batman", year: 2022, category: ["Action", "Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyFAJlgN7YhkPgifRh.jpg", imdb_rating: 7.8, rt_score: "85%", trailer_url: "https://www.youtube.com/embed/mqqft2x_Aa4", is_featured: true },
  { id: 3, title: "The Dark Knight", year: 2008, category: ["Action", "Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUjfs2gX1T.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg", imdb_rating: 9.0, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/EXeTwQWrcwY", is_featured: true },
  { id: 4, title: "Interstellar", year: 2014, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/xJHokMbljXjADYdit5fK1DVfjko.jpg", imdb_rating: 8.7, rt_score: "73%", trailer_url: "https://www.youtube.com/embed/zSWdZVtXT7E", is_featured: false },
  { id: 5, title: "Spider-Man: Across the Spider-Verse", year: 2023, category: ["Action", "Comedy", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg", imdb_rating: 8.7, rt_score: "95%", trailer_url: "https://www.youtube.com/embed/cqGjhVJWtEg", is_featured: false },
  { id: 6, title: "Inception", year: 2010, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", imdb_rating: 8.8, rt_score: "87%", trailer_url: "https://www.youtube.com/embed/YoHD9XEInc0", is_featured: false },
  { id: 7, title: "Deadpool & Wolverine", year: 2024, category: ["Action", "Comedy", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg", imdb_rating: 7.6, rt_score: "79%", trailer_url: "https://www.youtube.com/embed/73_1biulkYk", is_featured: false },
  { id: 8, title: "Dune: Part Two", year: 2024, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", imdb_rating: 8.8, rt_score: "92%", trailer_url: "https://www.youtube.com/embed/Way9Dexny3w", is_featured: false },
  { id: 9, title: "Avengers: Endgame", year: 2019, category: ["Action", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", imdb_rating: 8.4, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/TcMBFSGVi1c", is_featured: false },
  { id: 10, title: "Joker", year: 2019, category: ["Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YMDm2A0Q.jpg", imdb_rating: 8.4, rt_score: "68%", trailer_url: "https://www.youtube.com/embed/zAGVQLHvwOY", is_featured: false },
  { id: 11, title: "Oppenheimer", year: 2023, category: ["Drama"], poster_url: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg", imdb_rating: 8.5, rt_score: "93%", trailer_url: "https://www.youtube.com/embed/uYPbbksJxIg", is_featured: false },
  { id: 12, title: "John Wick: Chapter 4", year: 2023, category: ["Action"], poster_url: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7Q2KBnHEI4lg.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/h8gHn0OzBoKcXvwnKtbPMkDHZ0g.jpg", imdb_rating: 7.7, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/qEVUtrk8_B4", is_featured: false },
  { id: 13, title: "Avatar: The Way of Water", year: 2022, category: ["Action", "Family", "Disney"], poster_url: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/Yc9q6QuWrMp9nuDm5R8ExNoExbi.jpg", imdb_rating: 7.6, rt_score: "76%", trailer_url: "https://www.youtube.com/embed/d9MyW72ELq0", is_featured: false },
  { id: 14, title: "Top Gun: Maverick", year: 2022, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/62HCnUTziyWQpDaBO2i1DX17ljH.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/AaV1YIdWKRYmfih9zEISsdm7wdz.jpg", imdb_rating: 8.3, rt_score: "96%", trailer_url: "https://www.youtube.com/embed/giXco2jaZ_4", is_featured: false },
];

// --- DOM ---
const contentArea = document.getElementById('contentArea');
const searchInput = document.getElementById('searchInput');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebar = document.getElementById('sidebar');
const mobileHamburger = document.getElementById('mobileHamburger');

// ============================================
// SUPABASE
// ============================================
function fetchWithTimeout(promise, ms = 5000) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))]);
}

async function loadMoviesFromSupabase() {
  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) throw new Error('Supabase JS not loaded');
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await fetchWithTimeout(supabaseClient.from('movies').select('*').order('id', { ascending: true }), 6000);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No movies in database');
  return data;
}

// ============================================
// INIT
// ============================================
async function initApp() {
  try {
    allMovies = await loadMoviesFromSupabase();
    console.log(`✅ Loaded ${allMovies.length} movies from Supabase`);
  } catch (err) {
    console.warn('⚠️ Using fallback data:', err.message);
    allMovies = fallbackMovies;
  }
  setupGlobalEvents();
  navigateTo('home');
}

// ============================================
// ROUTER / NAVIGATION
// ============================================
function navigateTo(page) {
  currentPage = page;
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (activeNav) activeNav.classList.add('active');
  // Close mobile sidebar
  if (window.innerWidth <= 768) { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); }
  // Clear search
  searchInput.value = '';
  // Render page
  const pages = { home: renderHome, trending: renderTrending, 'coming-soon': renderComingSoon, categories: renderCategories, history: renderHistory, saved: renderSaved, library: renderLibrary, downloads: renderDownloads, settings: renderSettings, account: renderAccount, help: renderHelp };
  const renderer = pages[page] || renderHome;
  contentArea.scrollTop = 0;
  renderer();
}

// ============================================
// REUSABLE: Movie Card HTML
// ============================================
function movieCardHTML(movie, idx = 0) {
  const saved = storage.get('saved');
  const isSaved = saved.some(s => s.id === movie.id);
  const posterImg = movie.poster_url
    ? `<img src="${movie.poster_url}" alt="${movie.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="poster-placeholder" style="display:none;background:linear-gradient(135deg,#2d3436,#6c5ce7);">${movie.title}</div>`
    : `<div class="poster-placeholder" style="background:linear-gradient(135deg,#2d3436,#6c5ce7);">${movie.title}</div>`;

  return `<div class="movie-card" data-id="${movie.id}" style="animation-delay:${idx * 0.04}s">
    <div class="movie-poster">
      ${posterImg}
      <div class="play-overlay"><i class="fas fa-play-circle"></i></div>
      <button class="card-save-btn ${isSaved ? 'saved' : ''}" data-id="${movie.id}" title="${isSaved ? 'Remove from Saved' : 'Save'}">
        <i class="fas fa-bookmark"></i>
      </button>
    </div>
    <div class="movie-info">
      <h4>${movie.title}</h4>
      <span class="movie-year">${movie.year}</span>
    </div>
    <div class="movie-rating-bar">
      <span>⭐ ${movie.imdb_rating}</span>
      <span>🍅 ${movie.rt_score}</span>
    </div>
  </div>`;
}

function attachCardEvents(container) {
  container.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-save-btn')) return;
      const id = parseInt(card.dataset.id);
      const movie = allMovies.find(m => m.id === id);
      if (movie) { addToHistory(movie); showTrailerModal(movie); }
    });
  });
  container.querySelectorAll('.card-save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      toggleSaved(id);
      btn.classList.toggle('saved');
    });
  });
}

function renderMovieGrid(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (movies.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-film"></i><p>No movies found</p></div>`;
    return;
  }
  container.innerHTML = movies.map((m, i) => movieCardHTML(m, i)).join('');
  attachCardEvents(container);
}

// ============================================
// PAGE: HOME
// ============================================
function renderHome() {
  const featured = allMovies.filter(m => m.is_featured);
  const toShow = featured.length >= 2 ? featured : allMovies.slice(0, 3);

  const featuredHTML = toShow.map(movie => {
    const bg = movie.backdrop_url ? `background-image:url(${movie.backdrop_url}); background-size:cover; background-position:center;` : `background:linear-gradient(135deg,#1a1d29,#2d3436);`;
    return `<div class="featured-card" data-id="${movie.id}" style="${bg}">
      <div class="overlay">
        <div class="featured-info">
          <h3>${movie.title}</h3>
          <div class="year">${movie.year}</div>
          <div class="featured-ratings">
            <div class="rating"><span class="imdb">⭐</span> ${movie.imdb_rating}</div>
            <div class="rating"><span class="rt">🍅</span> ${movie.rt_score}</div>
          </div>
        </div>
        <button class="watch-btn" data-id="${movie.id}">Watch</button>
      </div>
    </div>`;
  }).join('');

  const categories = ['All', 'Action', 'Comedy', 'DC', 'Disney', 'Drama', 'Family', 'Horror', 'Marvel', 'Romance'];
  const pillsHTML = categories.map(c => `<button class="category-pill ${activeCategory === c ? 'active' : ''}" data-category="${c}">${c}</button>`).join('');

  contentArea.innerHTML = `
    <div class="content-tabs">
      <button class="content-tab active" data-tab="movies">Movies</button>
      <button class="content-tab" data-tab="tv">TV Series</button>
      <button class="content-tab" data-tab="anime">Anime</button>
      <button class="content-tab" data-tab="music">Music Video</button>
    </div>
    <h2 class="section-title">New Releases</h2>
    <div class="featured-movies">${featuredHTML}</div>
    <div class="category-filter">${pillsHTML}</div>
    <div class="movie-grid" id="homeGrid"></div>
  `;

  renderFilteredHome();

  // Featured click
  contentArea.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', () => { const m = allMovies.find(x => x.id === parseInt(card.dataset.id)); if (m) { addToHistory(m); showTrailerModal(m); } });
  });
  contentArea.querySelectorAll('.featured-card .watch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); const m = allMovies.find(x => x.id === parseInt(btn.dataset.id)); if (m) { addToHistory(m); showTrailerModal(m); } });
  });

  // Category pills
  contentArea.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      contentArea.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderFilteredHome();
    });
  });

  // Content tabs
  contentArea.querySelectorAll('.content-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      contentArea.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function renderFilteredHome() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = allMovies.filter(m => {
    const cats = m.category || [];
    const matchCat = activeCategory === 'All' || cats.includes(activeCategory);
    const matchSearch = !query || m.title.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });
  renderMovieGrid(filtered, 'homeGrid');
}

// ============================================
// PAGE: TRENDING
// ============================================
function renderTrending() {
  const sorted = [...allMovies].sort((a, b) => b.imdb_rating - a.imdb_rating);
  contentArea.innerHTML = `
    <h2 class="section-title"><i class="fas fa-fire" style="color:#e53935;margin-right:8px;"></i>Trending Now</h2>
    <p class="section-desc">Top rated movies by IMDb score</p>
    <div class="movie-grid" id="trendingGrid"></div>
  `;
  renderMovieGrid(sorted, 'trendingGrid');
}

// ============================================
// PAGE: COMING SOON
// ============================================
function renderComingSoon() {
  const upcoming = [
    { id: 100, title: "Captain America: Brave New World", year: 2025, category: ["Action", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/pzIddUEMWhVYrm1IURC5XirJFBp.jpg", backdrop_url: "", imdb_rating: 'N/A', rt_score: 'N/A', trailer_url: "https://www.youtube.com/embed/RZ-MiApYEkI", is_featured: false },
    { id: 101, title: "Thunderbolts*", year: 2025, category: ["Action", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/hI2pGIaQ5LXiWWqkb5sGTaNJL6j.jpg", backdrop_url: "", imdb_rating: 'N/A', rt_score: 'N/A', trailer_url: "https://www.youtube.com/embed/tSMU0X10CAk", is_featured: false },
    { id: 102, title: "Mission: Impossible 8", year: 2025, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/z0HJnXBYCE2r0mDqmMYKKNSiFRZ.jpg", backdrop_url: "", imdb_rating: 'N/A', rt_score: 'N/A', trailer_url: "https://www.youtube.com/embed/avz06PDqDbM", is_featured: false },
    { id: 103, title: "Superman", year: 2025, category: ["Action", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/sJhMlSJH0g6by1PyBfCMnrCNAQz.jpg", backdrop_url: "", imdb_rating: 'N/A', rt_score: 'N/A', trailer_url: "https://www.youtube.com/embed/vB3CLvUYT7c", is_featured: false },
  ];

  contentArea.innerHTML = `
    <h2 class="section-title"><i class="fas fa-rocket" style="color:#7c4dff;margin-right:8px;"></i>Coming Soon</h2>
    <p class="section-desc">Upcoming movies to look forward to</p>
    <div class="coming-soon-list" id="comingSoonList"></div>
  `;

  const list = document.getElementById('comingSoonList');
  list.innerHTML = upcoming.map(movie => `
    <div class="coming-soon-card" data-trailer="${movie.trailer_url}">
      <div class="cs-poster">
        ${movie.poster_url ? `<img src="${movie.poster_url}" alt="${movie.title}" />` : `<div class="poster-placeholder" style="background:linear-gradient(135deg,#2d3436,#7c4dff);">${movie.title}</div>`}
      </div>
      <div class="cs-info">
        <h3>${movie.title}</h3>
        <span class="cs-year"><i class="fas fa-calendar"></i> ${movie.year}</span>
        <div class="cs-cats">${movie.category.map(c => `<span class="cs-cat-pill">${c}</span>`).join('')}</div>
        <button class="watch-btn cs-trailer-btn" data-trailer="${movie.trailer_url}" data-title="${movie.title}" data-year="${movie.year}">
          <i class="fas fa-play"></i> Watch Trailer
        </button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.cs-trailer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showTrailerModal({ title: btn.dataset.title, year: btn.dataset.year, imdb_rating: 'N/A', rt_score: 'N/A', category: [], trailer_url: btn.dataset.trailer });
    });
  });
}

// ============================================
// PAGE: CATEGORIES
// ============================================
function renderCategories() {
  const cats = ['Action', 'Comedy', 'DC', 'Disney', 'Drama', 'Family', 'Horror', 'Marvel', 'Romance'];
  const catIcons = { Action: '💥', Comedy: '😂', DC: '🦇', Disney: '🏰', Drama: '🎭', Family: '👨‍👩‍👧‍👦', Horror: '👻', Marvel: '🦸', Romance: '💕' };
  const catColors = { Action: '#e53935', Comedy: '#ff9800', DC: '#1a237e', Disney: '#1565c0', Drama: '#6a1b9a', Family: '#2e7d32', Horror: '#4a148c', Marvel: '#c62828', Romance: '#e91e63' };

  contentArea.innerHTML = `
    <h2 class="section-title"><i class="fas fa-filter" style="color:#2196F3;margin-right:8px;"></i>Categories</h2>
    <p class="section-desc">Browse movies by genre</p>
    <div class="categories-grid">
      ${cats.map(c => {
    const count = allMovies.filter(m => (m.category || []).includes(c)).length;
    return `<div class="category-card" data-cat="${c}" style="background:linear-gradient(135deg,${catColors[c]}dd,${catColors[c]}88);">
          <span class="cat-emoji">${catIcons[c]}</span>
          <h3>${c}</h3>
          <span class="cat-count">${count} movies</span>
        </div>`;
  }).join('')}
    </div>
    <div id="catMovieSection" style="display:none;">
      <h2 class="section-title" id="catMovieTitle"></h2>
      <div class="movie-grid" id="catMovieGrid"></div>
      <button class="back-btn" id="catBackBtn"><i class="fas fa-arrow-left"></i> Back to Categories</button>
    </div>
  `;

  contentArea.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      const movies = allMovies.filter(m => (m.category || []).includes(cat));
      document.querySelector('.categories-grid').style.display = 'none';
      document.querySelector('.section-desc').style.display = 'none';
      const section = document.getElementById('catMovieSection');
      section.style.display = 'block';
      document.getElementById('catMovieTitle').textContent = cat + ' Movies';
      renderMovieGrid(movies, 'catMovieGrid');
      document.getElementById('catBackBtn').addEventListener('click', () => renderCategories());
    });
  });
}

// ============================================
// PAGE: HISTORY
// ============================================
function renderHistory() {
  const history = storage.get('history');
  const historyMovies = history.map(h => allMovies.find(m => m.id === h.id)).filter(Boolean);

  contentArea.innerHTML = `
    <div class="page-header-row">
      <h2 class="section-title"><i class="fas fa-clock-rotate-left" style="color:#ff9800;margin-right:8px;"></i>Watch History</h2>
      ${history.length > 0 ? `<button class="clear-btn" id="clearHistoryBtn"><i class="fas fa-trash"></i> Clear All</button>` : ''}
    </div>
    <p class="section-desc">${history.length > 0 ? `${history.length} movies watched` : 'No watch history yet. Start watching movies!'}</p>
    <div class="movie-grid" id="historyGrid"></div>
  `;

  renderMovieGrid(historyMovies, 'historyGrid');

  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all watch history?')) { storage.set('history', []); renderHistory(); }
    });
  }
}

// ============================================
// PAGE: SAVED
// ============================================
function renderSaved() {
  const saved = storage.get('saved');
  const savedMovies = saved.map(s => allMovies.find(m => m.id === s.id)).filter(Boolean);

  contentArea.innerHTML = `
    <div class="page-header-row">
      <h2 class="section-title"><i class="fas fa-bookmark" style="color:#2196F3;margin-right:8px;"></i>Saved Movies</h2>
      ${saved.length > 0 ? `<button class="clear-btn" id="clearSavedBtn"><i class="fas fa-trash"></i> Clear All</button>` : ''}
    </div>
    <p class="section-desc">${saved.length > 0 ? `${saved.length} movies saved` : 'No saved movies yet. Bookmark movies you want to watch later!'}</p>
    <div class="movie-grid" id="savedGrid"></div>
  `;

  renderMovieGrid(savedMovies, 'savedGrid');

  const clearBtn = document.getElementById('clearSavedBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all saved movies?')) { storage.set('saved', []); renderSaved(); }
    });
  }
}

// ============================================
// PAGE: MY LIBRARY
// ============================================
function renderLibrary() {
  const library = storage.get('library');
  const libMovies = library.map(l => allMovies.find(m => m.id === l.id)).filter(Boolean);

  contentArea.innerHTML = `
    <div class="page-header-row">
      <h2 class="section-title"><i class="fas fa-photo-film" style="color:#7c4dff;margin-right:8px;"></i>My Library</h2>
      <button class="add-btn" id="addToLibBtn"><i class="fas fa-plus"></i> Add Movies</button>
    </div>
    <p class="section-desc">${library.length > 0 ? `${library.length} movies in your library` : 'Your personal movie collection is empty. Add movies from the catalog!'}</p>
    <div class="movie-grid" id="libraryGrid"></div>
  `;

  renderMovieGrid(libMovies, 'libraryGrid');

  document.getElementById('addToLibBtn').addEventListener('click', () => showAddToLibraryModal());
}

function showAddToLibraryModal() {
  const library = storage.get('library');
  const available = allMovies.filter(m => !library.some(l => l.id === m.id));

  const modal = document.createElement('div');
  modal.id = 'movieModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:600px;">
      <div class="modal-header">
        <h2>Add to My Library</h2>
        <button class="modal-close-btn" id="closeModal">✕</button>
      </div>
      <div class="modal-body" style="max-height:400px;overflow-y:auto;">
        ${available.length === 0 ? '<p style="text-align:center;color:#8b8fa3;padding:20px;">All movies are already in your library!</p>' :
      available.map(m => `
            <div class="lib-add-item" data-id="${m.id}">
              <img src="${m.poster_url}" alt="${m.title}" style="width:40px;height:60px;border-radius:6px;object-fit:cover;" />
              <div style="flex:1;"><strong>${m.title}</strong><br/><small style="color:#8b8fa3;">${m.year}</small></div>
              <button class="add-lib-btn" data-id="${m.id}"><i class="fas fa-plus"></i></button>
            </div>
          `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  document.getElementById('closeModal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelectorAll('.add-lib-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      addToLibrary(id);
      btn.closest('.lib-add-item').style.opacity = '0.3';
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-check"></i>';
    });
  });
}

// ============================================
// PAGE: DOWNLOADS
// ============================================
function renderDownloads() {
  const downloads = storage.get('downloads');
  const dlMovies = downloads.map(d => ({ ...(allMovies.find(m => m.id === d.id) || {}), dlDate: d.date, dlSize: d.size })).filter(m => m.id);

  contentArea.innerHTML = `
    <div class="page-header-row">
      <h2 class="section-title"><i class="fas fa-download" style="color:#4caf50;margin-right:8px;"></i>Downloads</h2>
      ${downloads.length > 0 ? `<button class="clear-btn" id="clearDlBtn"><i class="fas fa-trash"></i> Clear All</button>` : ''}
    </div>
    <p class="section-desc">${downloads.length > 0 ? `${downloads.length} movies downloaded` : 'No downloads yet. Download movies to watch offline!'}</p>
    <div class="downloads-list" id="downloadsList">
      ${dlMovies.map(m => `
        <div class="download-item">
          <img src="${m.poster_url}" alt="${m.title}" />
          <div class="dl-info">
            <h4>${m.title}</h4>
            <span>${m.year} • ${m.dlSize || '1.2 GB'}</span>
            <small>Downloaded ${m.dlDate || 'recently'}</small>
          </div>
          <div class="dl-actions">
            <button class="dl-play-btn" data-id="${m.id}"><i class="fas fa-play"></i></button>
            <button class="dl-remove-btn" data-id="${m.id}"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const clearBtn = document.getElementById('clearDlBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => { if (confirm('Clear all downloads?')) { storage.set('downloads', []); renderDownloads(); } });

  contentArea.querySelectorAll('.dl-play-btn').forEach(btn => {
    btn.addEventListener('click', () => { const m = allMovies.find(x => x.id === parseInt(btn.dataset.id)); if (m) showTrailerModal(m); });
  });
  contentArea.querySelectorAll('.dl-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => { removeDownload(parseInt(btn.dataset.id)); renderDownloads(); });
  });
}

// ============================================
// PAGE: SETTINGS
// ============================================
function renderSettings() {
  const s = getSettings();
  contentArea.innerHTML = `
    <h2 class="section-title"><i class="fas fa-gear" style="color:#607d8b;margin-right:8px;"></i>Settings</h2>
    <div class="settings-form">
      <div class="settings-group">
        <h3>Playback</h3>
        <div class="setting-row">
          <label>Autoplay Trailers</label>
          <label class="toggle-switch"><input type="checkbox" id="setAutoplay" ${s.autoplay ? 'checked' : ''} /><span class="toggle-slider"></span></label>
        </div>
        <div class="setting-row">
          <label>Video Quality</label>
          <select id="setQuality" class="setting-select">
            <option value="480p" ${s.quality === '480p' ? 'selected' : ''}>480p</option>
            <option value="720p" ${s.quality === '720p' ? 'selected' : ''}>720p</option>
            <option value="1080p" ${s.quality === '1080p' ? 'selected' : ''}>1080p (HD)</option>
            <option value="4k" ${s.quality === '4k' ? 'selected' : ''}>4K Ultra HD</option>
          </select>
        </div>
      </div>
      <div class="settings-group">
        <h3>General</h3>
        <div class="setting-row">
          <label>Language</label>
          <select id="setLang" class="setting-select">
            <option value="th" ${s.language === 'th' ? 'selected' : ''}>ไทย</option>
            <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
        <div class="setting-row">
          <label>Notifications</label>
          <label class="toggle-switch"><input type="checkbox" id="setNotif" ${s.notifications ? 'checked' : ''} /><span class="toggle-slider"></span></label>
        </div>
      </div>
      <div class="settings-group">
        <h3>Data</h3>
        <div class="setting-row">
          <label>Clear Watch History</label>
          <button class="setting-action-btn" id="setClearHistory">Clear</button>
        </div>
        <div class="setting-row">
          <label>Clear All Saved</label>
          <button class="setting-action-btn" id="setClearSaved">Clear</button>
        </div>
        <div class="setting-row">
          <label>Clear All Data</label>
          <button class="setting-action-btn danger" id="setClearAll">Reset All</button>
        </div>
      </div>
      <button class="save-settings-btn" id="saveSettingsBtn"><i class="fas fa-check"></i> Save Settings</button>
    </div>
  `;

  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    saveSettings({
      autoplay: document.getElementById('setAutoplay').checked,
      quality: document.getElementById('setQuality').value,
      language: document.getElementById('setLang').value,
      notifications: document.getElementById('setNotif').checked,
    });
    showToast('Settings saved!');
  });

  document.getElementById('setClearHistory').addEventListener('click', () => { storage.set('history', []); showToast('History cleared'); });
  document.getElementById('setClearSaved').addEventListener('click', () => { storage.set('saved', []); showToast('Saved cleared'); });
  document.getElementById('setClearAll').addEventListener('click', () => {
    if (confirm('This will clear ALL your data (history, saved, library, downloads, settings). Continue?')) {
      ['history', 'saved', 'library', 'downloads', 'settings', 'account'].forEach(k => localStorage.removeItem('evc_' + k));
      showToast('All data cleared');
    }
  });
}

// ============================================
// PAGE: YOUR ACCOUNT
// ============================================
function renderAccount() {
  const acc = getAccount();
  contentArea.innerHTML = `
    <h2 class="section-title"><i class="fas fa-user" style="color:#7c4dff;margin-right:8px;"></i>Your Account</h2>
    <div class="account-card">
      <div class="account-avatar">${acc.avatar || 'M'}</div>
      <div class="account-form">
        <div class="form-group">
          <label>Display Name</label>
          <input type="text" id="accName" value="${acc.name}" class="form-input" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="accEmail" value="${acc.email}" class="form-input" />
        </div>
        <div class="form-group">
          <label>Avatar Letter</label>
          <input type="text" id="accAvatar" value="${acc.avatar}" maxlength="2" class="form-input" style="width:80px;" />
        </div>
        <div class="account-stats">
          <div class="stat-box"><i class="fas fa-clock-rotate-left"></i><span>${storage.get('history').length}</span><small>Watched</small></div>
          <div class="stat-box"><i class="fas fa-bookmark"></i><span>${storage.get('saved').length}</span><small>Saved</small></div>
          <div class="stat-box"><i class="fas fa-photo-film"></i><span>${storage.get('library').length}</span><small>Library</small></div>
          <div class="stat-box"><i class="fas fa-download"></i><span>${storage.get('downloads').length}</span><small>Downloads</small></div>
        </div>
        <button class="save-settings-btn" id="saveAccBtn"><i class="fas fa-check"></i> Save Profile</button>
      </div>
    </div>
  `;

  document.getElementById('saveAccBtn').addEventListener('click', () => {
    const newAcc = { name: document.getElementById('accName').value, email: document.getElementById('accEmail').value, avatar: document.getElementById('accAvatar').value || 'M', joined: getAccount().joined };
    saveAccount(newAcc);
    document.querySelector('.user-avatar').textContent = newAcc.avatar;
    showToast('Profile saved!');
  });
}

// ============================================
// PAGE: HELP
// ============================================
function renderHelp() {
  const faqs = [
    { q: 'How do I save a movie?', a: 'Click the bookmark icon on any movie card or use the Save button in the movie details.' },
    { q: 'Where are my downloaded movies?', a: 'Go to Downloads in the sidebar to see all your offline movies.' },
    { q: 'How do I change video quality?', a: 'Go to Settings → Playback → Video Quality and select your preferred resolution.' },
    { q: 'Can I clear my watch history?', a: 'Yes, go to Settings → Data → Clear Watch History, or go to the History page and click "Clear All".' },
    { q: 'How do categories work?', a: 'Use the Categories page to browse movies by genre. Click any category to see all movies in that genre.' },
  ];

  contentArea.innerHTML = `
    <h2 class="section-title"><i class="fas fa-circle-question" style="color:#2196F3;margin-right:8px;"></i>Help & Information</h2>
    <div class="help-section">
      <h3>Frequently Asked Questions</h3>
      <div class="faq-list">
        ${faqs.map((f, i) => `
          <div class="faq-item">
            <div class="faq-q" data-idx="${i}"><span>${f.q}</span><i class="fas fa-chevron-down"></i></div>
            <div class="faq-a" id="faq-${i}">${f.a}</div>
          </div>
        `).join('')}
      </div>
      <div class="help-info-box">
        <h3>About EVC</h3>
        <p>EVC (E-Video Cloud) is your personal movie streaming platform. Version 1.0</p>
        <p>Built with HTML, CSS, JavaScript + Supabase</p>
      </div>
    </div>
  `;

  contentArea.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const a = document.getElementById('faq-' + q.dataset.idx);
      const open = a.classList.toggle('open');
      q.querySelector('i').style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
    });
  });
}

// ============================================
// DATA OPERATIONS
// ============================================
function addToHistory(movie) {
  let history = storage.get('history');
  history = history.filter(h => h.id !== movie.id);
  history.unshift({ id: movie.id, date: new Date().toLocaleDateString('th-TH') });
  if (history.length > 50) history = history.slice(0, 50);
  storage.set('history', history);
}

function toggleSaved(movieId) {
  let saved = storage.get('saved');
  const idx = saved.findIndex(s => s.id === movieId);
  if (idx >= 0) { saved.splice(idx, 1); showToast('Removed from saved'); }
  else { saved.unshift({ id: movieId, date: new Date().toLocaleDateString('th-TH') }); showToast('Saved!'); }
  storage.set('saved', saved);
}

function addToLibrary(movieId) {
  let library = storage.get('library');
  if (!library.some(l => l.id === movieId)) {
    library.push({ id: movieId, date: new Date().toLocaleDateString('th-TH') });
    storage.set('library', library);
    showToast('Added to library!');
  }
}

function addToDownloads(movie) {
  let downloads = storage.get('downloads');
  if (!downloads.some(d => d.id === movie.id)) {
    downloads.push({ id: movie.id, date: new Date().toLocaleDateString('th-TH'), size: (Math.random() * 2 + 0.8).toFixed(1) + ' GB' });
    storage.set('downloads', downloads);
    showToast('Download started!');
  } else { showToast('Already downloaded'); }
}

function removeDownload(movieId) {
  let downloads = storage.get('downloads');
  downloads = downloads.filter(d => d.id !== movieId);
  storage.set('downloads', downloads);
  showToast('Download removed');
}

// ============================================
// TRAILER MODAL (YouTube Embed)
// ============================================
function showTrailerModal(movie) {
  const existing = document.getElementById('movieModal');
  if (existing) existing.remove();

  const saved = storage.get('saved');
  const isSaved = saved.some(s => s.id === movie.id);
  const categories = (movie.category || []).filter(c => c !== 'All');

  const modal = document.createElement('div');
  modal.id = 'movieModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box trailer-modal">
      <div class="trailer-video">
        <iframe src="${movie.trailer_url}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
      <div class="trailer-info">
        <div class="trailer-info-left">
          <h2>${movie.title} <span class="trailer-year">${movie.year}</span></h2>
          <div class="trailer-ratings">
            <span>⭐ ${movie.imdb_rating} <small>IMDb</small></span>
            <span>🍅 ${movie.rt_score} <small>RT</small></span>
            ${categories.map(c => `<span class="trailer-cat">${c}</span>`).join('')}
          </div>
        </div>
        <div class="trailer-actions">
          <button class="trailer-action-btn ${isSaved ? 'saved' : ''}" id="modalSaveBtn" title="Save"><i class="fas fa-bookmark"></i></button>
          <button class="trailer-action-btn" id="modalDownloadBtn" title="Download"><i class="fas fa-download"></i></button>
          <button class="trailer-action-btn" id="modalLibBtn" title="Add to Library"><i class="fas fa-plus"></i></button>
          <button class="modal-close-btn" id="closeModal">✕</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  document.getElementById('closeModal').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', function h(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', h); } });

  if (movie.id) {
    document.getElementById('modalSaveBtn').addEventListener('click', () => { toggleSaved(movie.id); document.getElementById('modalSaveBtn').classList.toggle('saved'); });
    document.getElementById('modalDownloadBtn').addEventListener('click', () => addToDownloads(movie));
    document.getElementById('modalLibBtn').addEventListener('click', () => addToLibrary(movie.id));
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
}

// ============================================
// GLOBAL EVENTS
// ============================================
function setupGlobalEvents() {
  // Sidebar nav
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Header shortcuts
  document.getElementById('headerSavedBtn').addEventListener('click', () => navigateTo('saved'));
  document.getElementById('headerHistoryBtn').addEventListener('click', () => navigateTo('history'));
  document.getElementById('headerAvatarBtn').addEventListener('click', () => navigateTo('account'));

  // Search
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (currentPage === 'home') renderFilteredHome();
      else { activeCategory = 'All'; navigateTo('home'); setTimeout(() => { searchInput.value = searchInput.value; renderFilteredHome(); }, 50); }
    }, 250);
  });
  document.getElementById('searchBtn').addEventListener('click', () => {
    if (currentPage !== 'home') { navigateTo('home'); setTimeout(() => { renderFilteredHome(); }, 50); }
  });

  // Mobile sidebar
  if (mobileHamburger) mobileHamburger.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('active'); });
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) { showToast('Logged out'); setTimeout(() => navigateTo('home'), 500); }
  });

  // Load user avatar
  const acc = getAccount();
  document.querySelector('.user-avatar').textContent = acc.avatar || 'M';
}

// ============================================
// START
// ============================================
initApp();
