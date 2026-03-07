/**
 * script.js — PokéVerse Main Application
 * Handles: API calls, Explorer, Pokédex Grid, Search, Theme, Navigation
 */

'use strict';

/* ── API CONFIG ── */
const API ='https://pokeapi.co/api/v2';
const CACHE = new Map();

/**
 * Fetch with cache + error handling
 * @param {string} url - API endpoint
 * @returns {Promise<Object>} JSON response
 */
async function apiFetch(url) {
  if (CACHE.has(url)) return CACHE.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  CACHE.set(url, data);
  return data;
}

async function getPokemon(nameOrId) {
  return apiFetch(`${API}/pokemon/${String(nameOrId).toLowerCase().trim()}`);
}

async function getPokemonList(limit = 20, offset = 0) {
  return apiFetch(`${API}/pokemon?limit=${limit}&offset=${offset}`);
}

/* ── APP STATE ── */
const AppState = {
  currentPoke: null,
  selectedBattlePoke: null,
  gridOffset: 0,
  gridLimit: 20,
  gridData: [],
  isShiny: false,
  typeFilter: '',
  genFilter: ''
};

/* ── GRID GEN RANGES ── */
const GEN_RANGES = {
  '1': [1,151], '2': [152,251], '3': [252,386], '4': [387,493], '5': [494,649]
};

/* ════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════ */
async function handleSearch(query) {
  const q = query?.trim();
  if (!q) { UI.toast('Please enter a Pokémon name or ID', 'error'); return; }

  try {
    const poke = await getPokemon(q);
    AppState.currentPoke = poke;
    AppState.isShiny = false;
    renderExplorer(poke, false);
    document.getElementById('explorer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    UI.toast(`"${q}" not found. Try another name or ID!`, 'error');
    document.getElementById('explorerContainer').innerHTML = `
      <div class="explorer-empty">
        <div class="empty-icon">😕</div>
        <p>Pokémon "<strong>${q}</strong>" not found.<br>Check the spelling or try a different ID.</p>
      </div>
    `;
  }
}

/* ── SUGGESTION BOX ── */
let suggestionTimeout;
let pokemonNameList = [];

async function loadNameList() {
  try {
    const data = await apiFetch(`${API}/pokemon?limit=1025&offset=0`);
    pokemonNameList = data.results.map(p => p.name);
  } catch {
    pokemonNameList = [];
  }
}

function showSuggestions(query) {
  const box = document.getElementById('searchSuggestions');
  if (!query || query.length < 2) { box.style.display = 'none'; return; }

  const matches = pokemonNameList
    .filter(n => n.startsWith(query.toLowerCase()))
    .slice(0, 6);

  if (!matches.length) { box.style.display = 'none'; return; }

  box.innerHTML = matches.map(name => `
    <div class="suggestion-item" data-name="${name}">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNameList.indexOf(name)+1}.png"
           alt="${name}" onerror="this.style.display='none'" />
      <span>${UI.formatName(name)}</span>
    </div>
  `).join('');

  box.style.display = 'block';

  box.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      document.getElementById('heroSearch').value = item.dataset.name;
      box.style.display = 'none';
      handleSearch(item.dataset.name);
    });
  });
}

/* ════════════════════════════════════════
   EXPLORER
   ════════════════════════════════════════ */
function renderExplorer(poke, isShiny) {
  const container = document.getElementById('explorerContainer');
  container.innerHTML = UI.buildExplorerCard(poke, isShiny);
  UI.animateStatBars(container);

  // Shiny toggle
  document.getElementById('shinyToggle')?.addEventListener('click', () => {
    AppState.isShiny = !AppState.isShiny;
    renderExplorer(AppState.currentPoke, AppState.isShiny);
  });

  // Random explorer button
  document.getElementById('randomExplorerBtn')?.addEventListener('click', loadRandomPokemon);

  // Battle with button
  document.getElementById('battleWithBtn')?.addEventListener('click', async (e) => {
    const id = e.currentTarget.dataset.id;
    await selectBattlePokemon(parseInt(id));
    document.getElementById('battle').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ════════════════════════════════════════
   POKÉDEX GRID
   ════════════════════════════════════════ */
async function loadGrid(reset = false) {
  if (reset) {
    AppState.gridOffset = 0;
    AppState.gridData = [];
  }

  const grid = document.getElementById('pokemonGrid');
  if (reset) UI.createSkeletons(grid, 20);

  try {
    let offset = AppState.gridOffset;
    let limit = AppState.gridLimit;

    // Handle gen filter
    if (AppState.genFilter) {
      const [start, end] = GEN_RANGES[AppState.genFilter];
      offset = (start - 1) + AppState.gridOffset;
      const remaining = end - (start - 1) - AppState.gridOffset;
      limit = Math.min(limit, remaining);
      if (limit <= 0) {
        UI.toast('No more Pokémon in this generation.', 'info');
        return;
      }
    }

    const data = await getPokemonList(limit, offset);
    const pokeDetails = await Promise.all(
      data.results.map(p => getPokemon(p.name))
    );

    // Apply type filter client-side
    let filtered = pokeDetails;
    if (AppState.typeFilter) {
      filtered = filtered.filter(p =>
        p.types.some(t => t.type.name === AppState.typeFilter)
      );
    }

    AppState.gridData = reset ? filtered : [...AppState.gridData, ...filtered];
    AppState.gridOffset += AppState.gridLimit;

    renderGrid(AppState.gridData, reset);
  } catch (err) {
    UI.toast('Failed to load Pokédex. Check your connection.', 'error');
    if (reset) grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:3rem">Failed to load Pokémon.</p>';
  }
}

function renderGrid(pokeList, reset = false) {
  const grid = document.getElementById('pokemonGrid');
  const searchVal = document.getElementById('gridSearch').value.toLowerCase();

  let filtered = pokeList;
  if (searchVal) {
    filtered = pokeList.filter(p =>
      p.name.includes(searchVal) || String(p.id).includes(searchVal)
    );
  }

  if (reset) {
    grid.innerHTML = filtered.map(p => UI.buildPokeCard(p)).join('');
  } else {
    const newCards = document.createElement('div');
    newCards.style.display = 'contents';
    newCards.innerHTML = filtered.map(p => UI.buildPokeCard(p)).join('');
    grid.appendChild(newCards);
  }

  // Attach click listeners to new cards
  grid.querySelectorAll('.poke-card:not([data-bound])').forEach(card => {
    card.dataset.bound = '1';
    card.addEventListener('click', () => openPokeModal(parseInt(card.dataset.id)));
  });
}

async function openPokeModal(id) {
  try {
    const poke = await getPokemon(id);
    UI.openModal(UI.buildModalCard(poke));
    UI.animateStatBars(document.getElementById('modal'));
  } catch {
    UI.toast('Could not load Pokémon details.', 'error');
  }
}

/* ════════════════════════════════════════
   RANDOM
   ════════════════════════════════════════ */
async function loadRandomPokemon() {
  const id = Math.floor(Math.random() * 1025) + 1;
  try {
    const poke = await getPokemon(id);
    AppState.currentPoke = poke;
    AppState.isShiny = false;
    renderExplorer(poke, false);
    document.getElementById('heroSearch').value = poke.name;
    document.getElementById('explorer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    UI.toast(`🎲 Found ${UI.formatName(poke.name)}!`, 'success');
  } catch {
    UI.toast('Could not load random Pokémon. Try again!', 'error');
  }
}

/* ════════════════════════════════════════
   HERO MASCOT
   ════════════════════════════════════════ */
async function loadHeroMascot() {
  const starters = [25, 1, 4, 7, 155, 158, 152, 252, 255, 258]; // Pikachu + starters
  const id = starters[Math.floor(Math.random() * starters.length)];
  try {
    const poke = await getPokemon(id);
    const img = document.getElementById('heroMascotImg');
    const src = poke.sprites.other?.['official-artwork']?.front_default || poke.sprites.front_default;
    img.src = src;
    img.alt = poke.name;
  } catch { /* silent fail */ }
}

/* ════════════════════════════════════════
   BATTLE SETUP
   ════════════════════════════════════════ */
async function selectBattlePokemon(idOrName) {
  try {
    const poke = await getPokemon(idOrName);
    AppState.selectedBattlePoke = poke;

    const img = poke.sprites.other?.['official-artwork']?.front_default || poke.sprites.front_default;
    const preview = document.getElementById('battlePreview');
    preview.innerHTML = `
      <div class="preview-pokemon">
        <img src="${img}" alt="${poke.name}" />
        <div class="preview-name">${UI.formatName(poke.name)}</div>
        <div class="type-badges">
          ${poke.types.map(t => UI.typeBadge(t.type.name)).join('')}
        </div>
      </div>
    `;

    document.getElementById('startBattleBtn').disabled = false;
    UI.toast(`${UI.formatName(poke.name)} is ready to battle!`, 'success');
  } catch {
    UI.toast('Pokémon not found. Try another name or ID.', 'error');
  }
}

async function startBattle() {
  if (!AppState.selectedBattlePoke) return;

  // Load random enemy
  const enemyId = Math.floor(Math.random() * 800) + 1;
  try {
    const enemy = await getPokemon(enemyId);
    Battle.start(AppState.selectedBattlePoke, enemy);
  } catch {
    UI.toast('Could not load opponent. Try again!', 'error');
  }
}

/* ════════════════════════════════════════
   THEME
   ════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('pv-theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('pv-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    // Highlight active section
    const sections = ['home','explorer','grid','battle'];
    const scrollY = window.scrollY + 100;

    for (const id of sections.reverse()) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${id}"]`)?.classList.add('active');
        break;
      }
    }
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ════════════════════════════════════════
   MODAL BRIDGE FUNCTIONS (called from modal HTML)
   ════════════════════════════════════════ */
window.APP = {
  async exploreFromModal(id) {
    UI.closeModal();
    try {
      const poke = await getPokemon(id);
      AppState.currentPoke = poke;
      AppState.isShiny = false;
      renderExplorer(poke, false);
      document.getElementById('explorer').scrollIntoView({ behavior: 'smooth' });
    } catch {
      UI.toast('Could not load Pokémon.', 'error');
    }
  },

  async battleFromModal(id) {
    UI.closeModal();
    await selectBattlePokemon(id);
    document.getElementById('battle').scrollIntoView({ behavior: 'smooth' });
  }
};

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* Theme */
  initTheme();

  /* Navbar */
  initNavbar();

  /* Load Mascot */
  loadHeroMascot();

  /* Load name list for suggestions (non-blocking) */
  loadNameList();

  /* Load initial grid */
  loadGrid(true);

  /* ── HERO SEARCH ── */
  const heroSearch = document.getElementById('heroSearch');
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const suggestionsBox = document.getElementById('searchSuggestions');

  heroSearch.addEventListener('input', e => {
    clearTimeout(suggestionTimeout);
    suggestionTimeout = setTimeout(() => showSuggestions(e.target.value), 250);
  });

  heroSearch.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      suggestionsBox.style.display = 'none';
      handleSearch(heroSearch.value);
    }
  });

  heroSearchBtn.addEventListener('click', () => {
    suggestionsBox.style.display = 'none';
    handleSearch(heroSearch.value);
  });

  // Close suggestions on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('heroSearchWrapper').contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });

  /* ── RANDOM BUTTON (HERO) ── */
  document.getElementById('randomHeroBtn').addEventListener('click', loadRandomPokemon);

  /* ── THEME TOGGLE ── */
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  /* ── MODAL CLOSE ── */
  document.getElementById('modalClose').addEventListener('click', UI.closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) UI.closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') UI.closeModal();
  });

  /* ── GRID SEARCH & FILTERS ── */
  document.getElementById('gridSearch').addEventListener('input', () => {
    renderGrid(AppState.gridData, true);
  });

  document.getElementById('typeFilter').addEventListener('change', e => {
    AppState.typeFilter = e.target.value;
    loadGrid(true);
  });

  document.getElementById('genFilter').addEventListener('change', e => {
    AppState.genFilter = e.target.value;
    AppState.gridOffset = 0;
    loadGrid(true);
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => loadGrid(false));
  document.getElementById('loadMoreBtnBottom').addEventListener('click', () => loadGrid(false));

  /* ── BATTLE ── */
  const battleSearchBtn = document.getElementById('battleSearchBtn');
  const battleRandomBtn = document.getElementById('battleRandomBtn');
  const startBattleBtn = document.getElementById('startBattleBtn');
  const rematchBtn = document.getElementById('rematchBtn');
  const battleSearchInput = document.getElementById('battleSearch');

  battleSearchBtn.addEventListener('click', () => {
    selectBattlePokemon(battleSearchInput.value);
  });

  battleSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') selectBattlePokemon(battleSearchInput.value);
  });

  battleRandomBtn.addEventListener('click', async () => {
    const id = Math.floor(Math.random() * 1025) + 1;
    await selectBattlePokemon(id);
  });

  startBattleBtn.addEventListener('click', startBattle);

  rematchBtn.addEventListener('click', () => {
    Battle.reset();
    AppState.selectedBattlePoke = null;
    document.getElementById('battlePreview').innerHTML = '<p class="preview-placeholder">Your Pokémon will appear here</p>';
    document.getElementById('startBattleBtn').disabled = true;
  });

});
