// ============================================
// EVC - Movie Streaming Website
// Full SPA + Movie Player + Google Login
// ============================================

// --- Supabase Config ---
const SUPABASE_URL = 'https://xhoiouzraqoyvevbxefj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K3hyy5i7tZ5J9Z4WtTop1g_ZFAW06R5';

let supabaseClient = null;
let allMovies = [];
let currentPage = 'home';
let activeCategory = 'All';
let activeTab = 'movies';
let currentUser = null;

// --- Embed Sources for Full Movies ---
const EMBED_SOURCES = [
  { name: 'VidSrc', url: id => `https://vidsrc.xyz/embed/movie/${id}` },
  { name: '2Embed', url: id => `https://www.2embed.cc/embed/${id}` },
  { name: 'VidSrc.to', url: id => `https://vidsrc.to/embed/movie/${id}` },
];

// --- localStorage helpers ---
const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem('evc_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('evc_' + key, JSON.stringify(val)); },
  getObj(key) { try { return JSON.parse(localStorage.getItem('evc_' + key)) || {}; } catch { return {}; } },
  setObj(key, val) { localStorage.setItem('evc_' + key, JSON.stringify(val)); }
};

function getSettings() { return { theme: 'light', language: 'th', autoplay: true, quality: '1080p', notifications: true, ...storage.getObj('settings') }; }
function saveSettings(s) { storage.setObj('settings', s); }
function getAccount() { return { name: 'Movie Fan', email: 'user@evc.com', avatar: 'M', joined: '2025', ...storage.getObj('account') }; }
function saveAccount(a) { storage.setObj('account', a); }

// --- Fallback Movie Data ---
const fallbackMovies = [
  { id: 1, tmdb_id: 68726, title: "Pacific Rim", year: 2013, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/sCxfSuEfNE1s3aBFMXRiPireIsK.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/cUJYBIbHLJK2ll0CztrHgrXBOlI.jpg", imdb_rating: 6.9, rt_score: "72%", trailer_url: "https://www.youtube.com/embed/5guMumPFBag", is_featured: true },
  { id: 2, tmdb_id: 414906, title: "The Batman", year: 2022, category: ["Action", "Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyFAJlgN7YhkPgifRh.jpg", imdb_rating: 7.8, rt_score: "85%", trailer_url: "https://www.youtube.com/embed/mqqft2x_Aa4", is_featured: true },
  { id: 3, tmdb_id: 155, title: "The Dark Knight", year: 2008, category: ["Action", "Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUjfs2gX1T.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg", imdb_rating: 9.0, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/EXeTwQWrcwY", is_featured: true },
  { id: 4, tmdb_id: 157336, title: "Interstellar", year: 2014, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/xJHokMbljXjADYdit5fK1DVfjko.jpg", imdb_rating: 8.7, rt_score: "73%", trailer_url: "https://www.youtube.com/embed/zSWdZVtXT7E", is_featured: false },
  { id: 5, tmdb_id: 569094, title: "Spider-Man: ATSV", year: 2023, category: ["Action", "Comedy", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg", imdb_rating: 8.7, rt_score: "95%", trailer_url: "https://www.youtube.com/embed/cqGjhVJWtEg", is_featured: false },
  { id: 6, tmdb_id: 27205, title: "Inception", year: 2010, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", imdb_rating: 8.8, rt_score: "87%", trailer_url: "https://www.youtube.com/embed/YoHD9XEInc0", is_featured: false },
  { id: 7, tmdb_id: 533535, title: "Deadpool & Wolverine", year: 2024, category: ["Action", "Comedy", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg", imdb_rating: 7.6, rt_score: "79%", trailer_url: "https://www.youtube.com/embed/73_1biulkYk", is_featured: false },
  { id: 8, tmdb_id: 693134, title: "Dune: Part Two", year: 2024, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", imdb_rating: 8.8, rt_score: "92%", trailer_url: "https://www.youtube.com/embed/Way9Dexny3w", is_featured: false },
  { id: 9, tmdb_id: 299534, title: "Avengers: Endgame", year: 2019, category: ["Action", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", imdb_rating: 8.4, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/TcMBFSGVi1c", is_featured: false },
  { id: 10, tmdb_id: 475557, title: "Joker", year: 2019, category: ["Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YMDm2A0Q.jpg", imdb_rating: 8.4, rt_score: "68%", trailer_url: "https://www.youtube.com/embed/zAGVQLHvwOY", is_featured: false },
  { id: 11, tmdb_id: 872585, title: "Oppenheimer", year: 2023, category: ["Drama"], poster_url: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg", imdb_rating: 8.5, rt_score: "93%", trailer_url: "https://www.youtube.com/embed/uYPbbksJxIg", is_featured: false },
  { id: 12, tmdb_id: 603692, title: "John Wick: Chapter 4", year: 2023, category: ["Action"], poster_url: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7Q2KBnHEI4lg.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/h8gHn0OzBoKcXvwnKtbPMkDHZ0g.jpg", imdb_rating: 7.7, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/qEVUtrk8_B4", is_featured: false },
  { id: 13, tmdb_id: 76600, title: "Avatar 2", year: 2022, category: ["Action", "Family", "Disney"], poster_url: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/Yc9q6QuWrMp9nuDm5R8ExNoExbi.jpg", imdb_rating: 7.6, rt_score: "76%", trailer_url: "https://www.youtube.com/embed/d9MyW72ELq0", is_featured: false },
  { id: 14, tmdb_id: 361743, title: "Top Gun: Maverick", year: 2022, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/62HCnUTziyWQpDaBO2i1DX17ljH.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/AaV1YIdWKRYmfih9zEISsdm7wdz.jpg", imdb_rating: 8.3, rt_score: "96%", trailer_url: "https://www.youtube.com/embed/giXco2jaZ_4", is_featured: false },
];

// --- DOM elements ---
const loginPage = document.getElementById('loginPage'), appContainer = document.getElementById('appContainer'), contentArea = document.getElementById('contentArea'), searchInput = document.getElementById('searchInput'), sidebarOverlay = document.getElementById('sidebarOverlay'), sidebar = document.getElementById('sidebar'), mobileHamburger = document.getElementById('mobileHamburger');

// --- Supabase Init ---
function initSupabase() { if (typeof window.supabase !== 'undefined' && window.supabase.createClient) { supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); return true; } return false; }
async function loadMoviesFromSupabase() { if (!supabaseClient) throw new Error('No Supabase client'); const { data, error } = await supabaseClient.from('movies').select('*').order('id', { ascending: true }); if (error) throw error; return data; }

// --- Auth ---
async function loginWithGoogle() { if (!supabaseClient) { showToast('Supabase not connected'); return; } try { await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } }); } catch (err) { showToast('Login failed: ' + err.message); } }
function loginAsGuest() { currentUser = { name: 'Guest', avatarUrl: null, isGuest: true }; storage.setObj('guestSession', { active: true }); showApp(); }
async function checkAuthState() { initSupabase(); if (supabaseClient) { const { data: { session } } = await supabaseClient.auth.getSession(); if (session && session.user) { const u = session.user; currentUser = { name: u.user_metadata?.full_name || u.email.split('@')[0], avatarUrl: u.user_metadata?.avatar_url, isGuest: false }; showApp(); return; } } const g = storage.getObj('guestSession'); if (g && g.active) { currentUser = { name: 'Guest', avatarUrl: null, isGuest: true }; showApp(); return; } showLogin(); }
function logout() { if (supabaseClient && currentUser && !currentUser.isGuest) supabaseClient.auth.signOut(); localStorage.removeItem('evc_guestSession'); currentUser = null; showLogin(); }
function showLogin() { loginPage.style.display = 'flex'; appContainer.style.display = 'none'; }
async function showApp() { loginPage.style.display = 'none'; appContainer.style.display = 'flex'; updateUserAvatar(); try { if (supabaseClient) allMovies = await loadMoviesFromSupabase() || fallbackMovies; else allMovies = fallbackMovies; } catch (e) { allMovies = fallbackMovies; } setupGlobalEvents(); navigateTo('home'); }
function updateUserAvatar() { const el = document.getElementById('headerAvatarBtn'); if (!el || !currentUser) return; if (currentUser.avatarUrl) { el.innerHTML = `<img src="${currentUser.avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`; el.style.padding = '0'; } else { el.textContent = (currentUser.name || 'M')[0].toUpperCase(); el.style.padding = ''; } }

// --- Router ---
function navigateTo(page) { currentPage = page; document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page)); if (window.innerWidth <= 768) { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); } searchInput.value = ''; const pages = { home: renderHome, trending: renderTrending, 'coming-soon': renderComingSoon, categories: renderCategories, history: renderHistory, saved: renderSaved, library: renderLibrary, downloads: renderDownloads, settings: renderSettings, account: renderAccount, help: renderHelp }; (pages[page] || renderHome)(); }

// --- Rendering helpers ---
function movieCardHTML(m, idx = 0) { const isSaved = storage.get('saved').some(s => s.id === m.id); return `<div class="movie-card" data-id="${m.id}" style="animation-delay:${idx * 0.04}s"><div class="movie-poster"><img src="${m.poster_url}" onerror="this.src='https://place-hold.it/500x750/1a1d29/7c4dff?text=${m.title.split(' ')[0]}';" /><div class="play-overlay"><i class="fas fa-play-circle"></i></div><button class="card-save-btn ${isSaved ? 'saved' : ''}" data-id="${m.id}"><i class="fas fa-bookmark"></i></button></div><div class="movie-info"><h4>${m.title}</h4><span>${m.year}</span></div><div class="movie-rating-bar"><span>⭐ ${m.imdb_rating}</span><span>🍅 ${m.rt_score}</span></div></div>`; }
function attachCardEvents(container) { container.querySelectorAll('.movie-card').forEach(c => c.addEventListener('click', (e) => { if (e.target.closest('.card-save-btn')) return; const m = allMovies.find(x => x.id === parseInt(c.dataset.id)); if (m) { addToHistory(m); showMovieDetail(m); } })); container.querySelectorAll('.card-save-btn').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); toggleSaved(parseInt(b.dataset.id)); b.classList.toggle('saved'); })); }
function renderMovieGrid(movies, id) { const c = document.getElementById(id); if (!c) return; if (movies.length === 0) { c.innerHTML = '<div class="empty-state">No items found</div>'; return; } c.innerHTML = movies.map((m, i) => movieCardHTML(m, i)).join(''); attachCardEvents(c); }

// --- Player & Details ---
function showMovieDetail(m) {
  const ex = document.getElementById('movieModal'); if (ex) ex.remove();
  const isS = storage.get('saved').some(s => s.id === m.id);
  const modal = document.createElement('div'); modal.id = 'movieModal'; modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="movie-detail-modal"><button class="detail-close-btn" id="closeModal">✕</button><div class="detail-hero" style="background-image:url(${m.backdrop_url});"><div class="detail-hero-overlay"><div class="detail-hero-content"><h1>${m.title}</h1><div class="detail-meta"><span>${m.year}</span><span>⭐ ${m.imdb_rating}</span>${(m.category || []).map(c => `<span class="detail-cat">${c}</span>`).join('')}</div><div class="detail-actions"><button class="detail-play-btn" id="watchFull"><i class="fas fa-play"></i> Watch Full</button><button class="detail-trailer-btn" id="watchTrailer"><i class="fas fa-film"></i> Trailer</button><button class="detail-icon-btn ${isS ? 'saved' : ''}" id="detailSave"><i class="fas fa-bookmark"></i></button><button class="detail-icon-btn" id="detailDownload"><i class="fas fa-download"></i></button></div></div></div></div><div class="detail-player" id="detailPlayer" style="display:none;"><div class="player-header"><div class="source-selector">${m.direct_url ? '<button class="source-btn active">Direct Player</button>' : EMBED_SOURCES.map((s, i) => `<button class="source-btn ${i === 0 ? 'active' : ''}" data-idx="${i}">${s.name}</button>`).join('')}</div><button class="player-close-btn" id="closePlayer">Close Player</button></div><div class="player-frame"><iframe id="movieIframe" src="" allowfullscreen></iframe></div></div></div>`;
  document.body.appendChild(modal); document.body.style.overflow = 'hidden';
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  document.getElementById('closeModal').onclick = close; modal.onclick = (e) => { if (e.target === modal) close(); };
  const iframe = document.getElementById('movieIframe'); const player = document.getElementById('detailPlayer');
  document.getElementById('watchFull').onclick = () => { player.style.display = 'block'; iframe.src = m.direct_url || EMBED_SOURCES[0].url(m.tmdb_id || m.id); player.scrollIntoView({ behavior: 'smooth' }); };
  document.getElementById('watchTrailer').onclick = () => { player.style.display = 'block'; iframe.src = m.trailer_url; player.scrollIntoView({ behavior: 'smooth' }); };
  document.querySelectorAll('.source-btn').forEach(b => b.onclick = () => { document.querySelectorAll('.source-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); iframe.src = m.direct_url || EMBED_SOURCES[b.dataset.idx].url(m.tmdb_id || m.id); });
  document.getElementById('closePlayer').onclick = () => { player.style.display = 'none'; iframe.src = ''; };
  document.getElementById('detailSave').onclick = () => { toggleSaved(m.id); document.getElementById('detailSave').classList.toggle('saved'); };
  document.getElementById('detailDownload').onclick = () => { addToDownloads(m); };
}

// --- Home logic ---
function renderHome() {
  contentArea.innerHTML = `<div class="content-tabs">
    <button class="content-tab ${activeTab === 'movies' ? 'active' : ''}" data-tab="movies">Movies</button>
    <button class="content-tab ${activeTab === 'tv' ? 'active' : ''}" data-tab="tv">TV Series</button>
    <button class="content-tab ${activeTab === 'anime' ? 'active' : ''}" data-tab="anime">Anime</button>
    <button class="content-tab ${activeTab === 'music' ? 'active' : ''}" data-tab="music">Music</button>
  </div>
  <h2 class="section-title">New Releases</h2><div class="featured-movies">${allMovies.filter(m => m.is_featured).map(m => `<div class="featured-card" data-id="${m.id}" style="background-image:url(${m.backdrop_url});"><div class="overlay"><div class="featured-info"><h3>${m.title}</h3><div class="year">${m.year}</div></div><button class="watch-btn">Play</button></div></div>`).join('')}</div>
  <div class="category-filter">${['All', 'Action', 'Comedy', 'DC', 'Disney', 'Drama', 'Marvel'].map(c => `<button class="category-pill ${activeCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
  <div class="movie-grid" id="homeGrid"></div>`;
  renderFilteredHome();
  contentArea.querySelectorAll('.featured-card').forEach(c => c.onclick = () => { const m = allMovies.find(x => x.id === parseInt(c.dataset.id)); if (m) showMovieDetail(m); });
  contentArea.querySelectorAll('.content-tab').forEach(t => t.onclick = () => { activeTab = t.dataset.tab; renderHome(); });
  contentArea.querySelectorAll('.category-pill').forEach(p => p.onclick = () => { activeCategory = p.dataset.cat; renderFilteredHome(); p.parentElement.querySelectorAll('.category-pill').forEach(x => x.classList.toggle('active', x === p)); });
}

function renderFilteredHome() {
  const q = searchInput.value.toLowerCase().trim();
  const f = allMovies.filter(m => {
    const c = m.category || [];
    const matchCat = activeCategory === 'All' || c.includes(activeCategory);
    const matchSearch = !q || m.title.toLowerCase().includes(q) || c.some(x => x.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });
  renderMovieGrid(f, 'homeGrid');
}

// --- Other Page Renderers ---
const rS = (t, d, id) => contentArea.innerHTML = `<h2 class="section-title">${t}</h2><p class="section-desc">${d}</p><div class="movie-grid" id="${id}"></div>`;
function renderTrending() { rS('Trending', 'Top rated', 'trendingGrid'); renderMovieGrid([...allMovies].sort((a, b) => b.imdb_rating - a.imdb_rating), 'trendingGrid'); }
function renderComingSoon() { contentArea.innerHTML = `<h2 class="section-title">Coming Soon</h2><div class="coming-soon-list">${allMovies.slice(0, 4).map(m => `<div class="coming-soon-card"><div class="cs-poster"><img src="${m.poster_url}"/></div><div class="cs-info"><h3>${m.title}</h3><span>${m.year}</span><button class="watch-btn" onclick='showMovieDetail(${JSON.stringify(m)})'>Trailer</button></div></div>`).join('')}</div>`; }
function renderCategories() { contentArea.innerHTML = `<h2 class="section-title">Categories</h2><div class="categories-grid">${['Action', 'Comedy', 'DC', 'Disney', 'Drama', 'Marvel'].map(c => `<div class="category-card" onclick="activeCategory='${c}';navigateTo('home')"><h3>${c}</h3></div>`).join('')}</div>`; }
function renderHistory() { const h = storage.get('history').map(x => allMovies.find(m => m.id === x.id)).filter(Boolean); rS('History', `${h.length} items`, 'historyGrid'); renderMovieGrid(h, 'historyGrid'); }
function renderSaved() { const s = storage.get('saved').map(x => allMovies.find(m => m.id === x.id)).filter(Boolean); rS('Saved', `${s.length} items`, 'savedGrid'); renderMovieGrid(s, 'savedGrid'); }
function renderLibrary() { const l = storage.get('library').map(x => allMovies.find(m => m.id === x.id)).filter(Boolean); contentArea.innerHTML = `<h2 class="section-title">Library</h2><div class="movie-grid" id="libGrid"></div>`; renderMovieGrid(l, 'libGrid'); }
function renderDownloads() { contentArea.innerHTML = `<h2 class="section-title">Downloads</h2><div class="downloads-list">${storage.get('downloads').map(d => { const m = allMovies.find(x => x.id === d.id); return m ? `<div class="download-item"><img src="${m.poster_url}"/><div><h4>${m.title}</h4><span>${d.size}</span></div></div>` : '' }).join('')}</div>`; }
function renderSettings() { contentArea.innerHTML = `<h2 class="section-title">Settings</h2><button class="save-settings-btn" onclick="storage.set('history',[]);storage.set('saved',[]);showToast('Cleared')">Clear All Data</button>`; }
function renderAccount() { contentArea.innerHTML = `<h2 class="section-title">Account</h2><div class="account-card"><div class="account-avatar">${currentUser?.name[0] || 'M'}</div><div class="account-form"><h3>${currentUser?.name || 'Guest'}</h3><button class="save-settings-btn" onclick="logout()">Logout</button></div></div>`; }
function renderHelp() { contentArea.innerHTML = `<h2 class="section-title">Help</h2><p>Contact support at help@evc.com</p>`; }

// --- Data Ops ---
function addToHistory(m) { let h = storage.get('history'); h = h.filter(x => x.id !== m.id); h.unshift({ id: m.id }); storage.set('history', h.slice(0, 50)); }
function toggleSaved(id) { let s = storage.get('saved'); const i = s.findIndex(x => x.id === id); if (i >= 0) s.splice(i, 1); else s.unshift({ id: id }); storage.set('saved', s); showToast(i >= 0 ? 'Removed' : 'Saved'); }
function addToDownloads(m) { let d = storage.get('downloads'); if (!d.some(x => x.id === m.id)) { d.push({ id: m.id, size: '1.2 GB' }); storage.set('downloads', d); showToast('Downloading'); } }
function showToast(m) { const e = document.createElement('div'); e.className = 'toast show'; e.innerHTML = m; document.body.appendChild(e); setTimeout(() => { e.remove() }, 2500); }

// --- Global Events ---
function setupGlobalEvents() {
  document.querySelectorAll('.nav-item[data-page]').forEach(i => i.onclick = () => navigateTo(i.dataset.page));
  document.getElementById('headerSavedBtn').onclick = () => navigateTo('saved');
  document.getElementById('headerHistoryBtn').onclick = () => navigateTo('history');
  document.getElementById('headerAvatarBtn').onclick = () => navigateTo('account');
  const si = document.getElementById('searchInput'); si.oninput = () => { if (currentPage !== 'home') navigateTo('home'); renderFilteredHome(); };
  mobileHamburger.onclick = () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('active'); };
  sidebarOverlay.onclick = () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); };
  document.getElementById('logoutBtn').onclick = logout;
}
checkAuthState();
