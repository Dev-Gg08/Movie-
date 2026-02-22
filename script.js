// ============================================
// EVC - Movie Streaming Website
// Full SPA + Mobile Optimization + Global Search
// ============================================

const SUPABASE_URL = 'https://xhoiouzraqoyvevbxefj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K3hyy5i7tZ5J9Z4WtTop1g_ZFAW06R5';
const TMDB_API_KEY = 'e226f4a5f5bace766952aa0d17182959'; // Public key for global search

let supabaseClient = null;
let allMovies = [];
let currentPage = 'home';
let activeCategory = 'All';
let activeTab = 'movies';
let searchResults = [];

// --- Embed Sources ---
const EMBED_SOURCES = [
  { name: 'VidSrc', movie: id => `https://vidsrc.xyz/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
  { name: '2Embed', movie: id => `https://www.2embed.cc/embed/${id}`, tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  { name: 'VidSrc.to', movie: id => `https://vidsrc.to/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
];

// --- Storage Helpers ---
const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem('evc_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('evc_' + key, JSON.stringify(val)); },
  getObj(key) { try { return JSON.parse(localStorage.getItem('evc_' + key)) || {}; } catch { return {}; } },
  setObj(key, val) { localStorage.setItem('evc_' + key, JSON.stringify(val)); }
};

const social = {
  getRating(id) { return storage.getObj('ratings')[id] || 0; },
  setRating(id, val) { const r = storage.getObj('ratings'); r[id] = val; storage.setObj('ratings', r); },
  getComments(id) { return storage.getObj('comments')[id] || []; },
  addComment(id, text) {
    const c = storage.getObj('comments');
    if (!c[id]) c[id] = [];
    c[id].unshift({ user: 'You', text, date: 'Just now' });
    storage.setObj('comments', c);
  }
};

// --- Media Helpers ---
const tmdbPoster = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;
const tmdbBackdrop = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : null;

// Expanded Local Library
const fallbackMovies = [
  // FEATURED
  { id: 1, tmdb_id: 68726, title: "Pacific Rim", year: 2013, type: "movie", category: ["Action", "Sci-Fi"], poster_url: tmdbPoster("/sCxfSuEfNE1s3aBFMXRiPireIsK.jpg"), backdrop_url: tmdbBackdrop("/cUJYBIbHLJK2ll0CztrHgrXBOlI.jpg"), imdb_rating: 6.9, rt_score: "72%", is_featured: true },
  { id: 2, tmdb_id: 414906, title: "The Batman", year: 2022, type: "movie", category: ["Action", "Crime"], poster_url: tmdbPoster("/74xTEgt7R36Fpooo50r9T25onhq.jpg"), backdrop_url: tmdbBackdrop("/b0PlSFdDwbyFAJlgN7YhkPgifRh.jpg"), imdb_rating: 7.8, rt_score: "85%", is_featured: true },
  { id: 3, tmdb_id: 155, title: "The Dark Knight", year: 2008, type: "movie", category: ["Action", "Crime"], poster_url: tmdbPoster("/qJ2tW6WMUDux911BytUjfs2gX1T.jpg"), backdrop_url: tmdbBackdrop("/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg"), imdb_rating: 9.0, rt_score: "94%", is_featured: true },

  // THAI MOVIES
  { id: 201, tmdb_id: 1121019, title: "How to Make Millions Before Grandma Dies", year: 2024, type: "movie", category: ["Drama", "Thai Movies"], poster_url: tmdbPoster("/9baY7N0pSmsS.jpg"), backdrop_url: tmdbBackdrop("/v9vSmsS.jpg"), imdb_rating: 8.3, rt_score: "100%" },
  { id: 202, tmdb_id: 1184351, title: "The Undertaker (สัปเหร่อ)", year: 2023, type: "movie", category: ["Horror", "Drama", "Thai Movies"], poster_url: tmdbPoster("/r8gSmsS.jpg"), backdrop_url: tmdbBackdrop("/z9vSmsS.jpg"), imdb_rating: 7.7, rt_score: "N/A" },
  { id: 203, tmdb_id: 458723, title: "Bad Genius", year: 2017, type: "movie", category: ["Crime", "Drama", "Thai Movies"], poster_url: tmdbPoster("/hSmsS.jpg"), backdrop_url: tmdbBackdrop("/kSmsS.jpg"), imdb_rating: 7.6, rt_score: "100%" },
  { id: 204, tmdb_id: 156801, title: "Pee Mak", year: 2013, type: "movie", category: ["Horror", "Comedy", "Thai Movies"], poster_url: tmdbPoster("/pSmsS.jpg"), backdrop_url: tmdbBackdrop("/qSmsS.jpg"), imdb_rating: 7.3, rt_score: "N/A" },
  { id: 205, tmdb_id: 561966, title: "Friend Zone", year: 2019, type: "movie", category: ["Romance", "Comedy", "Thai Movies"], poster_url: tmdbPoster("/fSmsS.jpg"), backdrop_url: tmdbBackdrop("/gSmsS.jpg"), imdb_rating: 7.2, rt_score: "N/A" },

  // 2024-2025 HITS
  { id: 301, tmdb_id: 558449, title: "Gladiator II", year: 2024, type: "movie", category: ["Action", "Drama"], poster_url: tmdbPoster("/vSmsS.jpg"), backdrop_url: tmdbBackdrop("/wSmsS.jpg"), imdb_rating: 7.1, rt_score: "75%" },
  { id: 302, tmdb_id: 1241982, title: "Moana 2", year: 2024, type: "movie", category: ["Action", "Comedy"], poster_url: tmdbPoster("/xSmsS.jpg"), backdrop_url: tmdbBackdrop("/ySmsS.jpg"), imdb_rating: 7.0, rt_score: "68%" },
  { id: 303, tmdb_id: 939243, title: "Sonic 3", year: 2024, type: "movie", category: ["Action", "Sci-Fi"], poster_url: tmdbPoster("/zSmsS.jpg"), backdrop_url: tmdbBackdrop("/aSmsS.jpg"), imdb_rating: 7.4, rt_score: "80%" },

  // SERIES
  { id: 101, tmdb_id: 1396, title: "Breaking Bad", year: 2008, type: "tv", category: ["Drama", "Crime"], poster_url: tmdbPoster("/ggFHVNu6YYI5L9pCfOacjizRGt.jpg"), backdrop_url: tmdbBackdrop("/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg"), imdb_rating: 9.5, rt_score: "96%", seasons: [{ num: 1, ep: 7 }, { num: 2, ep: 13 }, { num: 3, ep: 13 }, { num: 4, ep: 13 }, { num: 5, ep: 16 }] },
  { id: 102, tmdb_id: 76479, title: "The Boys", year: 2019, type: "tv", category: ["Action", "Sci-Fi"], poster_url: tmdbPoster("/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg"), backdrop_url: tmdbBackdrop("/thLAoL6VeZGmCyDpCOeoxLvA8yS.jpg"), imdb_rating: 8.7, rt_score: "93%", seasons: [{ num: 1, ep: 8 }, { num: 2, ep: 8 }, { num: 3, ep: 8 }, { num: 4, ep: 8 }] },
  { id: 103, tmdb_id: 94605, title: "Arcane", year: 2021, type: "tv", category: ["Anime", "Fantasy"], poster_url: tmdbPoster("/eN5hpJpPzW9j4D8f4Jb3G4w0dK0.jpg"), backdrop_url: tmdbBackdrop("/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg"), imdb_rating: 9.0, rt_score: "100%", seasons: [{ num: 1, ep: 9 }, { num: 2, ep: 9 }] },
  { id: 104, tmdb_id: 37854, title: "One Piece", year: 1999, type: "tv", category: ["Anime", "Action"], poster_url: tmdbPoster("/cMD9YfsS73SStS6M19SmsS.jpg"), backdrop_url: tmdbBackdrop("/v9R0p6C7tGz3oK6P0D6JbS7M2yv.jpg"), imdb_rating: 8.9, rt_score: "95%", seasons: [{ num: 1, ep: 1100 }] },
];

const getPoster = (m) => m.poster_url || `https://place-hold.it/500x750/0f172a/10b981?text=${m.title.split(' ')[0]}&fontsize=40`;

// --- DOM Elements ---
const contentArea = document.getElementById('contentArea'), searchInput = document.getElementById('searchInput'), appContainer = document.getElementById('appContainer'), mobileHamburger = document.getElementById('mobileHamburger'), sidebar = document.getElementById('sidebar'), sidebarOverlay = document.getElementById('sidebarOverlay'), searchBtn = document.getElementById('searchBtn');

// --- Initialization ---
function initApp() {
  if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  loadDataAndStart();
  setupGlobalEvents();
}

async function loadDataAndStart() {
  try {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from('movies').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) allMovies = data;
      else allMovies = fallbackMovies;
    } else allMovies = fallbackMovies;
  } catch (e) {
    allMovies = fallbackMovies;
  }
  navigateTo('home');
}

// --- Dynamic Global Search ---
async function searchGlobal(q) {
  if (!q) return;
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=th-TH&include_adult=false`;
    const res = await fetch(url);
    const data = await res.json();

    searchResults = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv').map(r => ({
      id: r.id,
      tmdb_id: r.id,
      title: r.title || r.name,
      year: (r.release_date || r.first_air_date || '').split('-')[0],
      type: r.media_type === 'tv' ? 'tv' : 'movie',
      category: [],
      poster_url: tmdbPoster(r.poster_path),
      backdrop_url: tmdbBackdrop(r.backdrop_path),
      imdb_rating: r.vote_average.toFixed(1),
      rt_score: 'N/A',
      seasons: r.media_type === 'tv' ? [{ num: 1, ep: 10 }] : [] // Default seasons for global search
    }));

    renderGlobalResults(q);
  } catch (e) { console.error("Search failed", e); }
}

function renderGlobalResults(q) {
  contentArea.innerHTML = `
    <h1 class="section-title">Global Results for "${q}"</h1>
    <div class="movie-grid" id="globalGrid"></div>
  `;
  renderMovieGrid(searchResults, 'globalGrid');
}

// --- Router ---
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

  if (window.innerWidth <= 1024) {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  const pages = {
    home: renderHome,
    trending: () => renderList("Trending", [...allMovies].sort((a, b) => b.imdb_rating - a.imdb_rating)),
    series: () => renderList("TV Series", allMovies.filter(m => m.type === 'tv')),
    'coming-soon': renderComingSoon,
    categories: renderCategories,
    history: () => renderList("History", storage.get('history').map(h => allMovies.find(m => m.id === h.id) || searchResults.find(m => m.id === h.id)).filter(Boolean)),
    saved: () => renderList("Saved", storage.get('saved').map(h => allMovies.find(m => m.id === h.id) || searchResults.find(m => m.id === h.id)).filter(Boolean)),
    library: () => renderList("My Library", [].concat(allMovies, searchResults).slice(0, 50)),
    downloads: () => renderList("Downloads", []),
    settings: renderSettings,
    help: renderHelp
  };

  (pages[page] || renderHome)();
}

// --- Home Rendering ---
function renderHome() {
  const featured = allMovies.filter(m => m.is_featured);
  contentArea.innerHTML = `
    <div class="content-tabs">
      <button class="content-tab ${activeTab === 'movies' ? 'active' : ''}" onclick="activeTab='movies';renderHome()">Movies</button>
      <button class="content-tab ${activeTab === 'series' ? 'active' : ''}" onclick="activeTab='series';renderHome()">Series</button>
      <button class="content-tab ${activeTab === 'anime' ? 'active' : ''}" onclick="activeTab='anime';renderHome()">Anime</button>
    </div>

    <div class="featured-movies">
      ${featured.map(m => `
        <div class="featured-card" style="background-image:url(${m.backdrop_url})" onclick="showDetail(${m.id})">
          <div class="overlay">
            <div class="featured-info">
              <h3>${m.title}</h3>
              <div class="year">${m.year} • ${m.type === 'movie' ? 'Movie' : 'Series'}</div>
            </div>
            <button class="watch-btn" onclick="event.stopPropagation();showDetail(${m.id})">Quick Play</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="category-filter">
      ${['All', 'Thai Movies', 'Action', 'Sci-Fi', 'Drama', 'Crime', 'Horror', 'Comedy', 'Anime'].map(c => `
        <button class="category-pill ${activeCategory === c ? 'active' : ''}" onclick="filterByCat('${c}')">${c}</button>
      `).join('')}
    </div>

    <div class="movie-grid" id="mainGrid"></div>
  `;
  updateGrid();
}

function updateGrid() {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = allMovies.filter(m => {
    const matchTab = activeTab === 'all' || (activeTab === 'movies' && m.type === 'movie') || (activeTab === 'series' && m.type === 'tv') || (activeTab === 'anime' && (m.category || []).includes('Anime'));
    const matchCat = activeCategory === 'All' || (m.category && m.category.includes(activeCategory));
    const matchSearch = !q || m.title.toLowerCase().includes(q);
    return matchTab && matchCat && matchSearch;
  });

  const grid = document.getElementById('mainGrid');
  if (!grid) return;

  if (filtered.length === 0 && q) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No local matches for "${q}"</p>
        <button class="detail-play-btn" style="margin-top:15px;" onclick="searchGlobal('${q}')">Search Global Database</button>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((m, i) => `
    <div class="movie-card" style="animation-delay:${i * 0.05}s" onclick="showDetail(${m.id})">
      <div class="movie-poster">
        <img src="${getPoster(m)}">
        <div class="play-overlay"><i class="fas fa-play"></i></div>
      </div>
      <div class="movie-info">
        <h4>${m.title}</h4>
        <div class="movie-year">${m.year}</div>
      </div>
      <div class="movie-rating-bar">
        <span>⭐ ${m.imdb_rating}</span>
        <span>🍅 ${m.rt_score || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

function renderList(title, list) {
  contentArea.innerHTML = `
    <h1 class="section-title">${title}</h1>
    <div class="movie-grid" id="listGrid"></div>
  `;
  renderMovieGrid(list, 'listGrid');
}

function renderMovieGrid(list, id) {
  const grid = document.getElementById(id);
  if (!grid) return;
  grid.innerHTML = list.map(m => `
    <div class="movie-card" onclick="showDetail(${m.id})">
      <div class="movie-poster"><img src="${getPoster(m)}"><div class="play-overlay"><i class="fas fa-play"></i></div></div>
      <div class="movie-info"><h4>${m.title}</h4><span>${m.year}</span></div>
    </div>
  `).join('');
}

// --- Detail & Modal ---
function showDetail(id) {
  let m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id);
  if (!m) return;

  addToHistory(m);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'movieModal';

  const personalRating = social.getRating(id);
  const comments = social.getComments(id);
  const isSeries = m.type === 'tv';

  modal.innerHTML = `
    <div class="movie-detail-modal">
      <button class="detail-close-btn" onclick="closeModal()">✕</button>
      
      <div class="detail-hero" style="background-image:url(${m.backdrop_url || m.poster_url})">
        <div class="detail-hero-overlay">
          <div class="detail-hero-content">
            <h1>${m.title}</h1>
            <div class="detail-meta">
              <span>${m.year}</span><span>IMDb ${m.imdb_rating}</span> <span>${m.type.toUpperCase()}</span>
            </div>
            
            <div class="detail-actions">
              <button class="detail-play-btn" id="playBtn"><i class="fas fa-play"></i> Watch Now</button>
              <button class="detail-icon-btn" onclick="toggleSaved(${m.id}, this)"><i class="fas fa-bookmark"></i></button>
              <div class="rating-box">
                ${[1, 2, 3, 4, 5].map(i => `<i class="fa-star ${i <= personalRating ? 'fas' : 'far'}" onclick="rateItem(${m.id}, ${i}, this)"></i>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-main">
          ${isSeries ? `
            <div class="series-controls">
              <div class="control-group">
                <label>Season</label>
                <select id="seasonSelect" onchange="updateEpisodes(${m.id})">
                  ${(m.seasons || [{ num: 1, ep: 10 }]).map(s => `<option value="${s.num}">Season ${s.num}</option>`).join('')}
                </select>
              </div>
              <div class="control-group">
                <label>Episode</label>
                <select id="episodeSelect"></select>
              </div>
            </div>
          ` : ''}

          <div class="detail-player" id="playerArea" style="display:none;">
            <div class="player-header">
              <div class="source-selector">
                ${EMBED_SOURCES.map((s, i) => `<button class="p-source ${i === 0 ? 'active' : ''}" onclick="changeSource(${m.id}, ${i}, this)">${s.name}</button>`).join('')}
              </div>
            </div>
            <div class="player-iframe-container">
              <iframe id="mainIframe" allowfullscreen></iframe>
            </div>
          </div>

          <div class="comment-section">
            <h3>Comments (${comments.length})</h3>
            <div class="comment-input">
              <input type="text" id="commentIn" placeholder="Write a comment...">
              <button onclick="postComment(${m.id})">Post</button>
            </div>
            <div class="comment-list" id="commentList">
              ${comments.map(c => `<div class="comment-item"><strong>${c.user}</strong><p>${c.text}</p><small>${c.date}</small></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  if (isSeries) updateEpisodes(m.id);

  document.getElementById('playBtn').onclick = () => {
    const area = document.getElementById('playerArea');
    area.style.display = 'block';
    const iframe = document.getElementById('mainIframe');
    if (m.type === 'movie') { iframe.src = EMBED_SOURCES[0].movie(m.tmdb_id || m.id); }
    else {
      const s = document.getElementById('seasonSelect').value;
      const e = document.getElementById('episodeSelect').value;
      iframe.src = EMBED_SOURCES[0].tv(m.tmdb_id || m.id, s, e);
    }
    area.scrollIntoView({ behavior: 'smooth' });
  };
}

window.closeModal = () => { document.getElementById('movieModal') && document.getElementById('movieModal').remove(); document.body.style.overflow = ''; };
window.updateEpisodes = (id) => {
  let m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id);
  const sNum = parseInt(document.getElementById('seasonSelect').value);
  const season = (m.seasons || []).find(s => s.num === sNum) || { num: 1, ep: 10 };
  const epSelect = document.getElementById('episodeSelect');
  epSelect.innerHTML = Array.from({ length: season.ep }, (_, i) => `<option value="${i + 1}">Episode ${i + 1}</option>`).join('');
};

window.changeSource = (id, sIdx, btn) => {
  let m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id);
  const iframe = document.getElementById('mainIframe');
  document.querySelectorAll('.p-source').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (m.type === 'movie') { iframe.src = EMBED_SOURCES[sIdx].movie(m.tmdb_id || m.id); }
  else {
    const s = document.getElementById('seasonSelect').value;
    const e = document.getElementById('episodeSelect').value;
    iframe.src = EMBED_SOURCES[sIdx].tv(m.tmdb_id || m.id, s, e);
  }
};

window.rateItem = (id, val, star) => { social.setRating(id, val); const stars = star.parentElement.querySelectorAll('i'); stars.forEach((s, i) => { s.classList.toggle('fas', i < val); s.classList.toggle('far', i >= val); }); showToast("Rating saved"); };
window.postComment = (id) => { const inp = document.getElementById('commentIn'); if (!inp.value.trim()) return; social.addComment(id, inp.value); inp.value = ''; const comments = social.getComments(id); document.getElementById('commentList').innerHTML = comments.map(c => `<div class="comment-item"><strong>${c.user}</strong><p>${c.text}</p><small>${c.date}</small></div>`).join(''); };

// --- Navigation & Categories ---
function renderCategories() {
  const cats = ['Thai Movies', 'Action', 'Sci-Fi', 'Drama', 'Crime', 'Marvel', 'Comedy', 'Anime', 'Romance', 'Horror'];
  contentArea.innerHTML = `<h1 class="section-title">Categories</h1><div class="movie-grid" id="catGrid">${cats.map(c => `<div class="category-card" onclick="filterByCat('${c}')"><h3>${c}</h3></div>`).join('')}</div>`;
}

function renderComingSoon() {
  const list = [{ title: "Captain America 4", year: 2025, img: "https://image.tmdb.org/t/p/w500/pzIddUEMWhVYrm1IURC5XirJFBp.jpg" }, { title: "Mission Impossible 8", year: 2025, img: "https://image.tmdb.org/t/p/w500/z0HJnXBYCE2r0mDqmMYKKNSiFRZ.jpg" }];
  contentArea.innerHTML = `<h1 class="section-title">Coming Soon</h1><div class="movie-grid">${list.map(m => `<div class="movie-card" onclick="showToast('Coming soon...')"><div class="movie-poster"><img src="${m.img}"></div><div class="movie-info"><h4>${m.title}</h4><span>${m.year}</span></div></div>`).join('')}</div>`;
}

function renderSettings() { contentArea.innerHTML = `<h1 class="section-title">Settings</h1><div style="flex-direction:column;display:flex;gap:15px;"><button class="save-settings-btn" onclick="clearAllData()">Reset Local Data</button><p style="color:var(--text-dim)">Global Search API: Active</p></div>`; }
function renderHelp() { contentArea.innerHTML = `<h1 class="section-title">Help</h1><p>Enjoy premium streaming. Mobile users can use the hamburger menu on the top left to navigate.</p>`; }

// --- Events ---
window.filterByCat = (cat) => { activeCategory = cat; if (currentPage !== 'home') navigateTo('home'); renderHome(); };
window.clearAllData = () => { if (confirm("Delete all history, ratings, and saved items?")) { localStorage.clear(); location.reload(); } };

function addToHistory(m) { let h = storage.get('history'); h = h.filter(x => x.id !== m.id); h.unshift({ id: m.id }); storage.set('history', h.slice(0, 50)); }
window.toggleSaved = (id, btn) => {
  let s = storage.get('saved'); const idx = s.findIndex(x => x.id === id);
  if (idx >= 0) s.splice(idx, 1); else s.push({ id });
  storage.set('saved', s); btn.classList.toggle('saved'); showToast(idx >= 0 ? "Removed from Saved" : "Saved to Library");
};

function showToast(m) { const t = document.createElement('div'); t.className = 'toast show'; t.innerHTML = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2500); }

function setupGlobalEvents() {
  document.querySelectorAll('.nav-item[data-page]').forEach(i => i.onclick = () => navigateTo(i.dataset.page));
  document.getElementById('headerSavedBtn').onclick = () => navigateTo('saved');
  document.getElementById('headerHistoryBtn').onclick = () => navigateTo('history');
  searchBtn.onclick = () => { const q = searchInput.value.trim(); if (q) searchGlobal(q); };
  searchInput.onkeydown = (e) => { if (e.key === 'Enter') searchBtn.click(); };

  mobileHamburger.onclick = () => { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); };
  sidebarOverlay.onclick = () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); };
  document.getElementById('hamburgerBtn').onclick = () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); };
}

initApp();
