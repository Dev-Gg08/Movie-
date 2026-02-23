// ==================================================
// DEV MOVIE — Complete Streaming Platform Logic
// ==================================================

const TMDB_KEY = 'e226f4a5f5bace766952aa0d17182959';
const IMG_BASE = 'https://image.tmdb.org/t/p/';
const poster = (p) => p ? `${IMG_BASE}w500${p}` : 'https://placehold.co/300x450/1a1a2e/666?text=No+Image';
const backdrop = (p) => p ? `${IMG_BASE}original${p}` : '';

// ========== STATE ==========
let state = {
  page: 1,
  totalPages: 1,
  endpoint: 'trending/all/day',
  params: {},
  loadedCount: 0,
  currentView: 'home',
  activeGenre: 'all'
};

// ========== DOM CACHE ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ========== TMDB API ==========
async function tmdb(endpoint, params = {}) {
  const q = new URLSearchParams({ api_key: TMDB_KEY, language: 'th-TH', region: 'TH', ...params });
  try {
    const r = await fetch(`https://api.themoviedb.org/3/${endpoint}?${q}`);
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.error('TMDB Error:', e);
    return { results: [], total_pages: 0 };
  }
}

function mapMovie(r, type) {
  const t = type || r.media_type || 'movie';
  return {
    id: r.id,
    title: r.title || r.name || 'ไม่ทราบชื่อ',
    desc: r.overview || '',
    year: (r.release_date || r.first_air_date || '').split('-')[0] || '—',
    type: t,
    poster: poster(r.poster_path),
    backdrop: backdrop(r.backdrop_path),
    rating: r.vote_average ? r.vote_average.toFixed(1) : '—',
    genres: r.genre_ids || (r.genres || []).map(g => g.id)
  };
}

// ========== CARD TEMPLATES ==========
function cardHTML(m) {
  return `
    <div class="movie-card" onclick="openModal(${m.id},'${m.type}')">
      <div class="card-poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://placehold.co/300x450/1a1a2e/666?text=No+Image'">
        <div class="card-overlay">
          <span class="card-rating"><i class="fas fa-star"></i> ${m.rating}</span>
        </div>
        <div class="card-play-icon"><i class="fas fa-play"></i></div>
      </div>
      <div class="card-title">${m.title}</div>
      <div class="card-meta">
        <span class="card-year">${m.year}</span>
        <span class="card-rating"><i class="fas fa-star"></i> ${m.rating}</span>
      </div>
    </div>`;
}

function skelCardHTML(n = 6) {
  return Array(n).fill(`
    <div class="skel-card shimmer">
      <div class="skel-poster shimmer"></div>
      <div class="skel-title shimmer"></div>
      <div class="skel-meta shimmer"></div>
    </div>`).join('');
}

// ========== HERO BILLBOARD ==========
function renderHero(container, m, badge) {
  container.innerHTML = `
    <div class="hero-bg" style="background-image:url(${m.backdrop})"></div>
    <div class="hero-info">
      <div class="hero-badge hero-animate"><i class="fas fa-fire"></i> ${badge}</div>
      <h1 class="hero-title hero-animate">${m.title}</h1>
      <div class="hero-meta hero-animate-delay">
        <span class="rating-badge"><i class="fas fa-star"></i> ${m.rating}</span>
        <span class="year-badge">${m.year}</span>
        <span class="type-badge">${m.type === 'tv' ? 'ซีรีส์' : 'ภาพยนตร์'}</span>
      </div>
      <p class="hero-desc hero-animate-delay">${m.desc.slice(0, 200)}${m.desc.length > 200 ? '...' : ''}</p>
      <div class="hero-actions hero-animate-delay2">
        <button class="btn-play" onclick="openModal(${m.id},'${m.type}')"><i class="fas fa-play"></i> เล่น</button>
        <button class="btn-glass" onclick="openModal(${m.id},'${m.type}')"><i class="fas fa-info-circle"></i> รายละเอียด</button>
      </div>
    </div>`;
}

function renderMidBillboard(container, m) {
  container.innerHTML = `
    <div class="mid-bg" style="background-image:url(${m.backdrop})"></div>
    <div class="mid-info">
      <h2 class="hero-animate">${m.title}</h2>
      <p class="hero-animate-delay">${m.desc.slice(0, 150)}${m.desc.length > 150 ? '...' : ''}</p>
      <div class="hero-actions hero-animate-delay2">
        <button class="btn-play" onclick="openModal(${m.id},'${m.type}')"><i class="fas fa-play"></i> ดูเลย</button>
        <button class="btn-glass" onclick="openModal(${m.id},'${m.type}')"><i class="fas fa-plus"></i> รายการโปรด</button>
      </div>
    </div>`;
}

// ========== RENDER CAROUSEL ==========
function renderRow(container, items) {
  container.innerHTML = items.map(r => cardHTML(mapMovie(r, r.media_type))).join('');
}

// ========== PAGE RENDERERS ==========
async function renderHome() {
  state.currentView = 'home';
  showAllSections();

  const hero = $('#heroBillboard');
  const trendRow = $('#trendingRow');
  const popRow = $('#popularRow');
  const tvRow = $('#tvRow');
  const mid = $('#midBillboard');
  const grid = $('#gridContent');

  // Skeletons
  hero.innerHTML = '<div class="hero-skeleton shimmer"></div>';
  trendRow.innerHTML = skelCardHTML(8);
  popRow.innerHTML = skelCardHTML(8);
  tvRow.innerHTML = skelCardHTML(8);
  grid.innerHTML = '';

  const [trending, popular, topTV, upcoming, nowPlaying] = await Promise.all([
    tmdb('trending/all/day'),
    tmdb('movie/popular'),
    tmdb('tv/popular'),
    tmdb('movie/upcoming', { region: 'TH' }),
    tmdb('movie/now_playing', { region: 'TH' })
  ]);

  // Hero
  if (trending.results.length) {
    const heroMovie = trending.results[0];
    renderHero(hero, mapMovie(heroMovie, heroMovie.media_type), '#1 กำลังมาแรงวันนี้');
  }

  // Rows
  renderRow(trendRow, trending.results.slice(1, 12));
  renderRow(popRow, popular.results.slice(0, 12));
  renderRow(tvRow, topTV.results.slice(0, 12));

  // Mid Billboard
  if (topTV.results.length > 1) {
    renderMidBillboard(mid, mapMovie(topTV.results[1], 'tv'));
  }

  // Grid (upcoming + now playing)
  const gridMovies = [...upcoming.results, ...nowPlaying.results].slice(0, 18);
  grid.innerHTML = gridMovies.map(r => cardHTML(mapMovie(r, 'movie'))).join('');

  // State for load-more
  state.endpoint = 'movie/popular';
  state.params = {};
  state.page = 1;
  state.totalPages = popular.total_pages || 1;
  state.loadedCount = gridMovies.length;
  updateLoadMore();
  updateCount();
}

async function renderCategory(title, type, extraParams = {}) {
  state.currentView = type;
  hideSectionsForBrowse();

  const grid = $('#gridContent');
  grid.innerHTML = skelCardHTML(18);

  // Add heading
  const heading = document.createElement('h2');
  heading.className = 'search-results-header';
  heading.textContent = title;
  grid.parentElement.insertBefore(heading, grid);

  const data = await tmdb(`discover/${type}`, { sort_by: 'popularity.desc', page: 1, ...extraParams });

  // Remove any existing heading before grid
  grid.parentElement.querySelectorAll('.search-results-header').forEach(h => h.remove());

  grid.innerHTML = `<h2 class="search-results-header" style="grid-column:1/-1;padding:0">${title}</h2>` +
    data.results.map(r => cardHTML(mapMovie(r, type))).join('');

  state.endpoint = `discover/${type}`;
  state.params = { sort_by: 'popularity.desc', ...extraParams };
  state.page = 1;
  state.totalPages = Math.min(data.total_pages || 1, 500); // TMDB max
  state.loadedCount = data.results.length;
  updateLoadMore();
  updateCount();
}

async function renderTrending() {
  state.currentView = 'trending';
  hideSectionsForBrowse();

  const grid = $('#gridContent');
  grid.innerHTML = skelCardHTML(18);

  const data = await tmdb('trending/all/day');

  grid.innerHTML = `<h2 class="search-results-header" style="grid-column:1/-1;padding:0">🔥 กำลังฮิตตอนนี้</h2>` +
    data.results.map(r => cardHTML(mapMovie(r, r.media_type))).join('');

  state.endpoint = 'trending/all/day';
  state.params = {};
  state.page = 1;
  state.totalPages = Math.min(data.total_pages || 1, 500);
  state.loadedCount = data.results.length;
  updateLoadMore();
  updateCount();
}

async function renderSearch(query) {
  if (!query || !query.trim()) return;
  state.currentView = 'search';
  hideSectionsForBrowse();

  const grid = $('#gridContent');
  grid.innerHTML = skelCardHTML(12);

  const data = await tmdb('search/multi', { query: query.trim() });
  const results = data.results.filter(r => r.media_type !== 'person' && r.poster_path);

  if (!results.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <i class="fas fa-search"></i>
        <h2>ไม่พบผลการค้นหา "${query}"</h2>
        <p>ลองค้นหาด้วยคำอื่น</p>
      </div>`;
    $('#loadMoreWrap').style.display = 'none';
    return;
  }

  grid.innerHTML = `<h2 class="search-results-header" style="grid-column:1/-1;padding:0">ผลการค้นหา "${query}"</h2>` +
    results.map(r => cardHTML(mapMovie(r))).join('');

  state.endpoint = 'search/multi';
  state.params = { query: query.trim() };
  state.page = 1;
  state.totalPages = Math.min(data.total_pages || 1, 500);
  state.loadedCount = results.length;
  updateLoadMore();
  updateCount();
}

// ========== GENRE FILTER ==========
async function filterByGenre(genreId) {
  const grid = $('#gridContent');
  grid.innerHTML = skelCardHTML(18);

  let endpoint, params;

  if (genreId === 'all') {
    endpoint = 'trending/all/day';
    params = {};
  } else {
    endpoint = 'discover/movie';
    params = { sort_by: 'popularity.desc', with_genres: genreId };
  }

  const data = await tmdb(endpoint, { ...params, page: 1 });

  grid.innerHTML = data.results.map(r => cardHTML(mapMovie(r, r.media_type || 'movie'))).join('');

  state.endpoint = endpoint;
  state.params = params;
  state.page = 1;
  state.totalPages = Math.min(data.total_pages || 1, 500);
  state.loadedCount = data.results.length;
  state.activeGenre = genreId;
  updateLoadMore();
  updateCount();
}

// ========== LOAD MORE ==========
async function loadMore() {
  if (state.page >= state.totalPages) return;

  const btn = $('#loadMoreBtn');
  btn.classList.add('loading');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังโหลด...';

  state.page++;
  const data = await tmdb(state.endpoint, { ...state.params, page: state.page });
  state.totalPages = Math.min(data.total_pages || state.totalPages, 500);

  const filtered = (data.results || []).filter(r => r.poster_path);
  const newHTML = filtered.map(r => cardHTML(mapMovie(r, r.media_type || 'movie'))).join('');
  $('#gridContent').insertAdjacentHTML('beforeend', newHTML);

  state.loadedCount += filtered.length;

  btn.classList.remove('loading');
  btn.innerHTML = '<i class="fas fa-plus"></i> โหลดเพิ่มเติม';
  updateLoadMore();
  updateCount();
}

function updateLoadMore() {
  const wrap = $('#loadMoreWrap');
  if (!wrap) return;
  wrap.style.display = state.page >= state.totalPages ? 'none' : '';
}

function updateCount() {
  const el = $('#movieCount');
  if (!el) return;
  const totalEst = state.totalPages * 20; // ~20 per page
  el.textContent = `แสดง ${state.loadedCount} จาก ~${totalEst.toLocaleString()}+ เรื่อง`;
}

// ========== DETAIL MODAL ==========
async function openModal(id, type = 'movie') {
  const overlay = $('#movieModal');
  const content = $('#modalContent');

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  content.innerHTML = '<div class="hero-skeleton shimmer" style="height:420px"></div>';

  const r = await tmdb(`${type}/${id}`);
  const m = mapMovie(r, type);
  const genres = (r.genres || []).map(g => `<span class="meta-chip genre">${g.name}</span>`).join('');
  const runtime = r.runtime ? `${Math.floor(r.runtime / 60)}ชม. ${r.runtime % 60}น.` : (r.number_of_seasons ? `${r.number_of_seasons} ซีซั่น` : '');

  content.innerHTML = `
    <button class="modal-close" onclick="closeModal()"><i class="fas fa-xmark"></i></button>
    <div class="modal-hero" style="background-image:url(${m.backdrop})">
      <div class="modal-hero-gradient">
        <div class="modal-hero-info">
          <h1>${m.title}</h1>
          <div class="hero-actions">
            <button class="btn-play"><i class="fas fa-play"></i> เล่น</button>
            <button class="btn-glass"><i class="fas fa-plus"></i> รายการโปรด</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-meta-row">
        <span class="meta-chip match"><i class="fas fa-thumbs-up"></i> 98% Match</span>
        <span class="meta-chip year">${m.year}</span>
        <span class="meta-chip rating"><i class="fas fa-star"></i> ${m.rating}</span>
        ${runtime ? `<span class="meta-chip year">${runtime}</span>` : ''}
      </div>
      ${genres ? `<div class="modal-meta-row">${genres}</div>` : ''}
      <p class="modal-desc">${m.desc || 'ยังไม่มีรายละเอียดสำหรับรายการนี้'}</p>
    </div>`;
}

function closeModal() {
  const overlay = $('#movieModal');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ========== NAVIGATION ==========
function navigate(page) {
  // Clear search
  if (page !== 'search') {
    const si = $('#searchInput');
    if (si) si.value = '';
  }

  // Remove any extra headers
  $$('.search-results-header').forEach(h => {
    if (!h.closest('.content-grid')) h.remove();
  });

  // Update nav active
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page || (page === 'home' && l.dataset.page === 'home')));
  $$('.side-icon[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));

  // Reset genre filter
  $$('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
  state.activeGenre = 'all';

  switch (page) {
    case 'home': renderHome(); break;
    case 'movies': renderCategory('🎬 ภาพยนตร์ทั้งหมด', 'movie'); break;
    case 'series': renderCategory('📺 ซีรีส์ทั้งหมด', 'tv'); break;
    case 'cartoons': renderCategory('🎨 การ์ตูนและแอนิเมชั่น', 'movie', { with_genres: 16 }); break;
    case 'trending': renderTrending(); break;
    case 'search': break; // handled separately
    case 'saved': renderSaved(); break;
    default: renderHome();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSaved() {
  hideSectionsForBrowse();
  const grid = $('#gridContent');
  grid.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <i class="fas fa-bookmark"></i>
      <h2>รายการโปรดของคุณ</h2>
      <p>ยังไม่มีรายการที่บันทึกไว้</p>
    </div>`;
  $('#loadMoreWrap').style.display = 'none';
}

// ========== VISIBILITY ==========
function showAllSections() {
  $$('#categoryRow, #popularSection, #tvSection, #heroBillboard, #midBillboard, #filterBar, #loadMoreWrap').forEach(el => el.style.display = '');
}

function hideSectionsForBrowse() {
  $$('#categoryRow, #popularSection, #tvSection, #heroBillboard, #midBillboard').forEach(el => el.style.display = 'none');
  $$('#filterBar, #loadMoreWrap').forEach(el => el.style.display = '');
}

// ========== INIT ==========
function init() {
  // Nav links
  $$('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });

  // Side nav
  $$('.side-icon[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'search') {
        $('#searchInput').focus();
        return;
      }
      navigate(page);
    });
  });

  // See all buttons
  $$('.see-all-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // Brand logo
  $('#brandLogo')?.addEventListener('click', () => navigate('home'));

  // Search
  const searchInput = $('#searchInput');
  let searchTimer;
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimer);
      renderSearch(searchInput.value);
    }
  });
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    if (searchInput.value.length >= 2) {
      searchTimer = setTimeout(() => renderSearch(searchInput.value), 600);
    }
  });

  // Genre filter chips
  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterByGenre(chip.dataset.filter);
    });
  });

  // Load more
  $('#loadMoreBtn')?.addEventListener('click', loadMore);

  // Modal close
  $('#movieModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'movieModal') closeModal();
  });

  // ESC close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Header scroll effect
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const header = $('#mainHeader');
        if (header) header.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Start!
  navigate('home');
}

// Make functions global
window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', init);
