// ============================================
// EVC - Movie Streaming Website
// Full Dynamic Expansion (1000+ Movies)
// ============================================

const SUPABASE_URL = 'https://xhoiouzraqoyvevbxefj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K3hyy5i7tZ5J9Z4WtTop1g_ZFAW06R5';
const TMDB_API_KEY = 'e226f4a5f5bace766952aa0d17182959';

let supabaseClient = null;
let allMovies = [];
let currentPageNum = 1;
let currentCategory = 'All';
let currentTab = 'movies';
let searchResults = [];
let isLoading = false;

// TMDB Genre IDs mapping
const GENRE_MAP = {
  "Action": 28,
  "Adventure": 12,
  "Animation": 16,
  "Comedy": 35,
  "Crime": 80,
  "Drama": 18,
  "Fantasy": 14,
  "Horror": 27,
  "Sci-Fi": 878,
  "Romance": 10749,
  "Anime": 16, // Using Animation ID for Anime (filter results later if needed)
  "Marvel": "marvel", // Special Case
};

// --- Embed Sources ---
const EMBED_SOURCES = [
  { name: 'VidSrc', movie: id => `https://vidsrc.xyz/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
  { name: '2Embed', movie: id => `https://www.2embed.cc/embed/${id}`, tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  { name: 'VidSrc.to', movie: id => `https://vidsrc.to/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
];

// --- Storage ---
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

// --- TMDB Data Fetching ---
const tmdbPoster = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;
const tmdbBackdrop = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : null;

async function fetchTMDB(endpoint, params = {}) {
  const urlParams = new URLSearchParams({ api_key: TMDB_API_KEY, language: 'th-TH', ...params });
  const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?${urlParams.toString()}`);
  return res.json();
}

function mapResult(r, type = 'movie') {
  return {
    id: r.id,
    tmdb_id: r.id,
    title: r.title || r.name,
    year: (r.release_date || r.first_air_date || '').split('-')[0],
    type: type,
    poster_url: tmdbPoster(r.poster_path),
    backdrop_url: tmdbBackdrop(r.backdrop_path),
    imdb_rating: r.vote_average ? r.vote_average.toFixed(1) : 'N/A',
    rt_score: 'N/A',
    seasons: type === 'tv' ? [{ num: 1, ep: 10 }] : [] // Basic Season Data
  };
}

// Global Discover Function
async function discoverContent(page = 1, category = 'All', tab = 'movies') {
  isLoading = true;
  let endpoint = tab === 'movies' ? 'discover/movie' : 'discover/tv';
  let params = { page, sort_by: 'popularity.desc' };

  if (category === 'Thai Movies') {
    params.with_original_language = 'th';
  } else if (category === 'Marvel') {
    params.with_keywords = '180547'; // Keywords for Marvel (MCU)
  } else if (GENRE_MAP[category]) {
    params.with_genres = GENRE_MAP[category];
  }

  const data = await fetchTMDB(endpoint, params);
  const results = (data.results || []).map(r => mapResult(r, tab === 'movies' ? 'movie' : 'tv'));

  if (page === 1) allMovies = results;
  else allMovies = [...allMovies, ...results];

  isLoading = false;
  return results;
}

// --- APP CORE ---

function initApp() {
  if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  setupGlobalEvents();
  navigateTo('home');
}

async function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));

  if (window.innerWidth <= 1024) {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  const pages = {
    home: renderHome,
    trending: renderTrending,
    series: () => { currentTab = 'series'; currentCategory = 'All'; renderHome(); },
    'coming-soon': renderComingSoon,
    categories: renderCategories,
    history: () => renderStaticList("History", storage.get('history')),
    saved: () => renderStaticList("Saved", storage.get('saved')),
    library: () => renderDiscoveryList("Library", 'All', 'movies'),
    settings: renderSettings,
    help: renderHelp
  };

  (pages[page] || renderHome)();
}

async function renderHome() {
  currentPageNum = 1;
  contentArea.innerHTML = `<div class="loading-full"><i class="fas fa-spinner fa-spin"></i> Loading Discover...</div>`;

  await discoverContent(1, currentCategory, currentTab);

  contentArea.innerHTML = `
    <div class="content-tabs">
      <button class="content-tab ${currentTab === 'movies' ? 'active' : ''}" onclick="setTab('movies')">Movies</button>
      <button class="content-tab ${currentTab === 'series' ? 'active' : ''}" onclick="setTab('series')">Series</button>
      <button class="content-tab ${currentTab === 'anime' ? 'active' : ''}" onclick="setTab('anime')">Anime</button>
    </div>

    <div class="category-filter">
      ${['All', 'Thai Movies', 'Action', 'Sci-Fi', 'Drama', 'Crime', 'Horror', 'Comedy'].map(c => `
        <button class="category-pill ${currentCategory === c ? 'active' : ''}" onclick="setCategory('${c}')">${c}</button>
      `).join('')}
    </div>

    <div class="movie-grid" id="mainGrid"></div>
    <div class="load-more-container">
      <button id="loadMoreBtn" class="detail-play-btn" style="width:200px">Load More Content</button>
    </div>
  `;

  updateGrid();

  document.getElementById('loadMoreBtn').onclick = async () => {
    currentPageNum++;
    const btn = document.getElementById('loadMoreBtn');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
    const newItems = await discoverContent(currentPageNum, currentCategory, currentTab);
    appendGrid(newItems);
    btn.innerHTML = `Load More Content`;
  };
}

function updateGrid() {
  const grid = document.getElementById('mainGrid');
  if (!grid) return;
  grid.innerHTML = allMovies.map((m, i) => movieCardTemplate(m, i)).join('');
}

function appendGrid(newItems) {
  const grid = document.getElementById('mainGrid');
  if (!grid) return;
  grid.insertAdjacentHTML('beforeend', newItems.map((m, i) => movieCardTemplate(m, i + allMovies.length)).join(''));
}

function movieCardTemplate(m, i) {
  return `
    <div class="movie-card" style="animation-delay:${(i % 20) * 0.05}s" onclick="showDetail(${m.id}, '${m.type}')">
      <div class="movie-poster">
        <img src="${m.poster_url || 'https://place-hold.it/500x750/0f172a/10b981?text=No+Poster'}">
        <div class="play-overlay"><i class="fas fa-play"></i></div>
      </div>
      <div class="movie-info">
        <h4>${m.title}</h4>
        <div class="movie-year">${m.year}</div>
      </div>
      <div class="movie-rating-bar">
        <span>⭐ ${m.imdb_rating}</span>
      </div>
    </div>
  `;
}

// --- Actions ---

window.setTab = (tab) => { currentTab = tab; currentCategory = 'All'; renderHome(); };
window.setCategory = (cat) => { currentCategory = cat; renderHome(); };

async function searchGlobal(q) {
  if (!q) return;
  contentArea.innerHTML = `<div class="loading-full"><i class="fas fa-spinner fa-spin"></i> Searching Globally...</div>`;
  const data = await fetchTMDB('search/multi', { query: q });
  searchResults = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv').map(r => mapResult(r, r.media_type));

  contentArea.innerHTML = `
    <h1 class="section-title">Results for "${q}"</h1>
    <div class="movie-grid" id="searchGrid"></div>
  `;
  const grid = document.getElementById('searchGrid');
  grid.innerHTML = searchResults.map(m => movieCardTemplate(m, 0)).join('');
}

// --- Detail Modal ---

function showDetail(id, type = 'movie') {
  const m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id) || storage.get('history').find(x => x.id === id);
  if (!m) return;

  addToHistory(m);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'movieModal';

  const personalRating = social.getRating(id);
  const comments = social.getComments(id);
  const isSeries = type === 'tv';

  modal.innerHTML = `
    <div class="movie-detail-modal">
      <button class="detail-close-btn" onclick="closeModal()">✕</button>
      
      <div class="detail-hero" style="background-image:url(${m.backdrop_url || m.poster_url})">
        <div class="detail-hero-overlay">
          <div class="detail-hero-content">
            <h1>${m.title}</h1>
            <div class="detail-meta">
              <span>${m.year}</span><span>IMDb ${m.imdb_rating}</span> <span>${type.toUpperCase()}</span>
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
                <select id="seasonSelect" onchange="updateEpisodes(${m.id}, '${type}')">
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
            <div class="source-selector">
              ${EMBED_SOURCES.map((s, i) => `<button class="p-source ${i === 0 ? 'active' : ''}" onclick="changeSource(${m.id}, '${type}', ${i}, this)">${s.name}</button>`).join('')}
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

  if (isSeries) updateEpisodes(id, type);

  document.getElementById('playBtn').onclick = () => {
    const area = document.getElementById('playerArea');
    area.style.display = 'block';
    const iframe = document.getElementById('mainIframe');
    if (type === 'movie') { iframe.src = EMBED_SOURCES[0].movie(m.tmdb_id || m.id); }
    else {
      const s = document.getElementById('seasonSelect').value;
      const e = document.getElementById('episodeSelect').value;
      iframe.src = EMBED_SOURCES[0].tv(m.tmdb_id || m.id, s, e);
    }
    area.scrollIntoView({ behavior: 'smooth' });
  };
}

window.closeModal = () => { document.getElementById('movieModal') && document.getElementById('movieModal').remove(); document.body.style.overflow = ''; };
window.updateEpisodes = (id, type) => {
  const m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id) || storage.get('history').find(x => x.id === id);
  const sNum = parseInt(document.getElementById('seasonSelect').value);
  const season = (m.seasons || []).find(s => s.num === sNum) || { num: 1, ep: 10 };
  const epSelect = document.getElementById('episodeSelect');
  epSelect.innerHTML = Array.from({ length: season.ep || 10 }, (_, i) => `<option value="${i + 1}">Episode ${i + 1}</option>`).join('');
};

window.changeSource = (id, type, sIdx, btn) => {
  const m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id) || storage.get('history').find(x => x.id === id);
  const iframe = document.getElementById('mainIframe');
  document.querySelectorAll('.p-source').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (type === 'movie') { iframe.src = EMBED_SOURCES[sIdx].movie(m.tmdb_id || m.id); }
  else {
    const s = document.getElementById('seasonSelect').value;
    const e = document.getElementById('episodeSelect').value;
    iframe.src = EMBED_SOURCES[sIdx].tv(m.tmdb_id || m.id, s, e);
  }
};

window.rateItem = (id, val, star) => { social.setRating(id, val); const stars = star.parentElement.querySelectorAll('i'); stars.forEach((s, i) => { s.classList.toggle('fas', i < val); s.classList.toggle('far', i >= val); }); showToast("Rating saved"); };
window.postComment = (id) => { const inp = document.getElementById('commentIn'); if (!inp.value.trim()) return; social.addComment(id, inp.value); inp.value = ''; const comments = social.getComments(id); document.getElementById('commentList').innerHTML = comments.map(c => `<div class="comment-item"><strong>${c.user}</strong><p>${c.text}</p><small>${c.date}</small></div>`).join(''); };

// --- List Renderers ---

function renderStaticList(title, list) {
  contentArea.innerHTML = `<h1 class="section-title">${title}</h1><div class="movie-grid"></div>`;
  const grid = contentArea.querySelector('.movie-grid');
  grid.innerHTML = list.map(m => movieCardTemplate(m, 0)).join('');
}

async function renderTrending() {
  contentArea.innerHTML = `<div class="loading-full"><i class="fas fa-spinner fa-spin"></i> Loading Trending...</div>`;
  const data = await fetchTMDB('trending/all/week');
  const results = data.results.filter(r => r.media_type !== 'person').map(r => mapResult(r, r.media_type));
  contentArea.innerHTML = `<h1 class="section-title">Trending This Week</h1><div class="movie-grid"></div>`;
  contentArea.querySelector('.movie-grid').innerHTML = results.map((m, i) => movieCardTemplate(m, i)).join('');
}

function renderCategories() {
  const cats = ['Thai Movies', 'Action', 'Sci-Fi', 'Drama', 'Crime', 'Marvel', 'Comedy', 'Anime', 'Romance', 'Horror'];
  contentArea.innerHTML = `
    <h1 class="section-title">Categories</h1>
    <div class="category-grid">
      ${cats.map(c => `<div class="category-card" onclick="setCategory('${c}')"><h3>${c}</h3></div>`).join('')}
    </div>
  `;
}

function renderComingSoon() {
  contentArea.innerHTML = `<h1 class="section-title">Coming Soon</h1><div class="movie-grid" id="upcomingGrid"></div>`;
  fetchTMDB('movie/upcoming').then(data => {
    const results = data.results.map(r => mapResult(r));
    document.getElementById('upcomingGrid').innerHTML = results.map(m => movieCardTemplate(m, 0)).join('');
  });
}

function renderSettings() { contentArea.innerHTML = `<h1 class="section-title">Settings</h1><button class="save-settings-btn" onclick="clearAllData()">Reset Cache & Privacy</button>`; }
function renderHelp() { contentArea.innerHTML = `<h1 class="section-title">Help</h1><p>Welcome to the ultimate stream experience. Our library is powered by global discovery.</p>`; }

// --- Utils ---

window.clearAllData = () => { if (confirm("Are you sure?")) { localStorage.clear(); location.reload(); } };
function addToHistory(m) { let h = storage.get('history'); h = h.filter(x => x.id !== m.id); h.unshift(m); storage.set('history', h.slice(0, 50)); }
window.toggleSaved = (id, btn) => {
  let s = storage.get('saved');
  const m = allMovies.find(x => x.id === id) || searchResults.find(x => x.id === id);
  const idx = s.findIndex(x => x.id === id);
  if (idx >= 0) s.splice(idx, 1); else if (m) s.push(m);
  storage.set('saved', s); btn.classList.toggle('saved');
  showToast(idx >= 0 ? "Removed" : "Saved");
};

function showToast(m) { const t = document.createElement('div'); t.className = 'toast show'; t.innerHTML = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2500); }

function setupGlobalEvents() {
  document.querySelectorAll('.nav-item[data-page]').forEach(i => i.onclick = () => navigateTo(i.dataset.page));
  document.getElementById('headerSavedBtn').onclick = () => navigateTo('saved');
  document.getElementById('headerHistoryBtn').onclick = () => navigateTo('history');
  document.getElementById('searchBtn').onclick = () => searchGlobal(document.getElementById('searchInput').value);
  document.getElementById('searchInput').onkeydown = (e) => { if (e.key === 'Enter') searchGlobal(e.target.value); };
}

initApp();
