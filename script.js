// ============================================
// EVC - Movie Streaming Website
// Supabase + TMDB Integration
// ============================================

// --- Supabase Config ---
const SUPABASE_URL = 'https://xhoiouzraqoyvevbxefj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K3hyy5i7tZ5J9Z4WtTop1g_ZFAW06R5';

let supabase;
let allMovies = [];
let usingFallback = false;

// --- Fallback Movie Data (used if Supabase is unavailable) ---
const fallbackMovies = [
  { id: 1, title: "Interstellar", year: 2014, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/xJHokMbljXjADYdit5fK1DVfjko.jpg", imdb_rating: 8.7, rt_score: "73%", trailer_url: "https://www.youtube.com/embed/zSWdZVtXT7E", is_featured: false },
  { id: 2, title: "Spider-Man: Across the Spider-Verse", year: 2023, category: ["Action", "Comedy", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg", imdb_rating: 8.7, rt_score: "95%", trailer_url: "https://www.youtube.com/embed/cqGjhVJWtEg", subtitle: "Across the Spider-Verse", is_featured: false },
  { id: 3, title: "Inception", year: 2010, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", imdb_rating: 8.8, rt_score: "87%", trailer_url: "https://www.youtube.com/embed/YoHD9XEInc0", is_featured: false },
  { id: 4, title: "Deadpool & Wolverine", year: 2024, category: ["Action", "Comedy", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg", imdb_rating: 7.6, rt_score: "79%", trailer_url: "https://www.youtube.com/embed/73_1biulkYk", is_featured: false },
  { id: 5, title: "Dune: Part Two", year: 2024, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg", imdb_rating: 8.8, rt_score: "92%", trailer_url: "https://www.youtube.com/embed/Way9Dexny3w", is_featured: false },
  { id: 6, title: "The Dark Knight", year: 2008, category: ["Action", "Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BytUjfs2gX1T.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg", imdb_rating: 9.0, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/EXeTwQWrcwY", is_featured: true },
  { id: 7, title: "Avengers: Endgame", year: 2019, category: ["Action", "Marvel"], poster_url: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", imdb_rating: 8.4, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/TcMBFSGVi1c", is_featured: false },
  { id: 8, title: "Joker", year: 2019, category: ["Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YMDm2A0Q.jpg", imdb_rating: 8.4, rt_score: "68%", trailer_url: "https://www.youtube.com/embed/zAGVQLHvwOY", is_featured: false },
  { id: 9, title: "Oppenheimer", year: 2023, category: ["Drama"], poster_url: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg", imdb_rating: 8.5, rt_score: "93%", trailer_url: "https://www.youtube.com/embed/uYPbbksJxIg", is_featured: false },
  { id: 10, title: "John Wick: Chapter 4", year: 2023, category: ["Action"], poster_url: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7Q2KBnHEI4lg.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/h8gHn0OzBoKcXvwnKtbPMkDHZ0g.jpg", imdb_rating: 7.7, rt_score: "94%", trailer_url: "https://www.youtube.com/embed/qEVUtrk8_B4", is_featured: false },
  { id: 11, title: "Avatar: The Way of Water", year: 2022, category: ["Action", "Family", "Disney"], poster_url: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/Yc9q6QuWrMp9nuDm5R8ExNoExbi.jpg", imdb_rating: 7.6, rt_score: "76%", trailer_url: "https://www.youtube.com/embed/d9MyW72ELq0", is_featured: false },
  { id: 12, title: "Top Gun: Maverick", year: 2022, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/62HCnUTziyWQpDaBO2i1DX17ljH.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/AaV1YIdWKRYmfih9zEISsdm7wdz.jpg", imdb_rating: 8.3, rt_score: "96%", trailer_url: "https://www.youtube.com/embed/giXco2jaZ_4", is_featured: false },
  { id: 13, title: "Pacific Rim", year: 2013, category: ["Action", "Drama"], poster_url: "https://image.tmdb.org/t/p/w500/sCxfSuEfNE1s3aBFMXRiPireIsK.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/cUJYBIbHLJK2ll0CztrHgrXBOlI.jpg", imdb_rating: 6.9, rt_score: "72%", trailer_url: "https://www.youtube.com/embed/5guMumPFBag", is_featured: true },
  { id: 14, title: "The Batman", year: 2022, category: ["Action", "Drama", "DC"], poster_url: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", backdrop_url: "https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyFAJlgN7YhkPgifRh.jpg", imdb_rating: 7.8, rt_score: "85%", trailer_url: "https://www.youtube.com/embed/mqqft2x_Aa4", is_featured: true },
];

// --- DOM Elements ---
const movieGrid = document.getElementById('movieGrid');
const featuredContainer = document.getElementById('featuredMovies');
const categoryPills = document.querySelectorAll('.category-pill');
const contentTabs = document.querySelectorAll('.content-tab');
const navItems = document.querySelectorAll('.nav-item');
const searchInput = document.getElementById('searchInput');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebar = document.getElementById('sidebar');
const mobileHamburger = document.getElementById('mobileHamburger');

// ============================================
// SUPABASE INITIALIZATION
// ============================================
async function initApp() {
  // Try to connect to Supabase
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('🔌 Connecting to Supabase...');

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      allMovies = data;
      console.log(`✅ Loaded ${data.length} movies from Supabase`);
    } else {
      console.warn('⚠️ No movies in Supabase, using fallback data');
      allMovies = fallbackMovies;
      usingFallback = true;
    }
  } catch (err) {
    console.warn('⚠️ Supabase connection failed, using fallback data:', err.message);
    allMovies = fallbackMovies;
    usingFallback = true;
  }

  // Render the UI
  renderFeaturedMovies();
  renderMovies();
  setupEventListeners();

  // Show data source indicator
  if (usingFallback) {
    console.info('ℹ️ Using offline/fallback data. Run setup.sql in Supabase SQL Editor to enable database.');
  }
}

// ============================================
// RENDER FEATURED MOVIES
// ============================================
function renderFeaturedMovies() {
  const featured = allMovies.filter(m => m.is_featured);
  // If no featured flag, take first 3 movies with backdrop
  const toShow = featured.length >= 2 ? featured : allMovies.filter(m => m.backdrop_url).slice(0, 3);

  featuredContainer.innerHTML = '';

  toShow.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'featured-card';
    card.dataset.title = movie.title;
    card.dataset.trailer = movie.trailer_url;

    // Use backdrop image
    if (movie.backdrop_url) {
      card.style.backgroundImage = `url(${movie.backdrop_url})`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }

    card.innerHTML = `
      <div class="overlay">
        <div class="featured-info">
          <h3>${movie.title}</h3>
          <div class="year">${movie.year}</div>
          <div class="featured-ratings">
            <div class="rating"><span class="imdb">⭐</span> ${movie.imdb_rating}</div>
            <div class="rating"><span class="rt">🍅</span> ${movie.rt_score}</div>
          </div>
        </div>
        <button class="watch-btn">Watch</button>
      </div>
    `;

    // Click handlers
    card.addEventListener('click', () => showTrailerModal(movie));
    card.querySelector('.watch-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showTrailerModal(movie);
    });

    featuredContainer.appendChild(card);
  });
}

// ============================================
// RENDER MOVIE GRID
// ============================================
function renderMovies(filter = 'All', searchQuery = '') {
  movieGrid.innerHTML = '';
  const query = searchQuery.toLowerCase().trim();

  const filtered = allMovies.filter(movie => {
    const cats = movie.category || [];
    const matchesCategory = filter === 'All' || cats.includes(filter);
    const matchesSearch = !query || movie.title.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    movieGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#1a1d29; opacity:0.5;">
        <i class="fas fa-film" style="font-size:48px; margin-bottom:16px; display:block;"></i>
        <p style="font-size:16px; font-weight:500;">No movies found</p>
      </div>`;
    return;
  }

  filtered.forEach((movie, index) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const posterHTML = movie.poster_url
      ? `<img src="${movie.poster_url}" alt="${movie.title}" loading="lazy" />`
      : `<div class="poster-placeholder" style="background:linear-gradient(135deg,#2d3436,#6c5ce7);">${movie.title}</div>`;

    card.innerHTML = `
      <div class="movie-poster">
        ${posterHTML}
        <div class="play-overlay">
          <i class="fas fa-play-circle"></i>
        </div>
      </div>
      <div class="movie-info">
        <h4>${movie.title}</h4>
        <span class="movie-year">${movie.year}</span>
      </div>
    `;

    card.addEventListener('click', () => showTrailerModal(movie));
    movieGrid.appendChild(card);
  });
}

// ============================================
// TRAILER MODAL (YouTube Embed)
// ============================================
function showTrailerModal(movie) {
  const existing = document.getElementById('movieModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'movieModal';
  modal.style.cssText = `
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,0.88); backdrop-filter:blur(12px);
    display:flex; align-items:center; justify-content:center;
    animation: modalFadeIn 0.3s ease;
    padding: 20px;
  `;

  const categories = (movie.category || []).filter(c => c !== 'All');

  modal.innerHTML = `
    <style>
      @keyframes modalFadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes modalSlideUp { from { opacity:0; transform:translateY(40px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
    </style>
    <div class="modal-content" style="
      background:#1a1d29; border-radius:20px; max-width:900px; width:100%;
      overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,0.6);
      animation: modalSlideUp 0.4s cubic-bezier(0.4,0,0.2,1);
    ">
      <!-- YouTube Player -->
      <div style="position:relative; width:100%; padding-top:56.25%; background:#000;">
        <iframe
          src="${movie.trailer_url}?autoplay=1&rel=0&modestbranding=1"
          style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <!-- Movie Info Bar -->
      <div style="padding:20px 28px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="flex:1; min-width:200px;">
          <h2 style="font-family:'Poppins',sans-serif; font-size:22px; font-weight:700; color:white; margin-bottom:6px;">
            ${movie.title}
            <span style="font-size:14px; color:#8b8fa3; font-weight:400; margin-left:8px;">${movie.year}</span>
          </h2>
          <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:5px;">
              <span style="color:#ffc107; font-size:16px;">⭐</span>
              <span style="font-weight:600; color:white; font-size:15px;">${movie.imdb_rating}</span>
              <span style="color:#8b8fa3; font-size:12px;">IMDb</span>
            </div>
            <div style="display:flex; align-items:center; gap:5px;">
              <span style="color:#e53935; font-size:16px;">🍅</span>
              <span style="font-weight:600; color:white; font-size:15px;">${movie.rt_score}</span>
              <span style="color:#8b8fa3; font-size:12px;">RT</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${categories.map(c => `
                <span style="background:rgba(33,150,243,0.15); color:#2196F3; padding:3px 12px;
                  border-radius:20px; font-size:11px; font-weight:500;">${c}</span>
              `).join('')}
            </div>
          </div>
        </div>
        <button id="closeModal" style="
          background:rgba(255,255,255,0.1); border:none; color:white;
          width:42px; height:42px; border-radius:50%; font-size:20px;
          cursor:pointer; transition:all 0.2s ease; flex-shrink:0;
        " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✕</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    modal.remove();
    document.body.style.overflow = '';
  };

  document.getElementById('closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handler); }
  });
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  let activeCategory = 'All';

  // Category Filter
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderMovies(activeCategory, searchInput.value);
    });
  });

  // Content Tabs
  contentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      contentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Sidebar Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      }
    });
  });

  // Search (debounced)
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderMovies(activeCategory, searchInput.value);
    }, 250);
  });

  // Mobile Sidebar
  if (mobileHamburger) {
    mobileHamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }
}

// ============================================
// INIT
// ============================================
initApp();
