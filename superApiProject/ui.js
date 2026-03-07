/**
 * ui.js — PokéVerse UI Utilities
 * Handles: Toast notifications, Modal, Skeleton loaders, Type colors, Stat rendering
 */

'use strict';

/* ── TYPE CONFIG ── */
const TYPE_COLORS = {
  fire:'#F08030', water:'#6890F0', grass:'#78C850', electric:'#F8D030',
  psychic:'#F85888', ice:'#98D8D8', dragon:'#7038F8', dark:'#705848',
  fairy:'#EE99AC', fighting:'#C03028', poison:'#A040A0', ground:'#E0C068',
  flying:'#A890F0', bug:'#A8B820', rock:'#B8A038', ghost:'#705898',
  steel:'#B8B8D0', normal:'#A8A878'
};

const TYPE_EMOJIS = {
  fire:'🔥', water:'💧', grass:'🌿', electric:'⚡', psychic:'🔮',
  ice:'❄️', dragon:'🐉', dark:'🌑', fairy:'🌸', fighting:'🥊',
  poison:'☠️', ground:'🌍', flying:'🦅', bug:'🐛', rock:'🪨',
  ghost:'👻', steel:'⚙️', normal:'⚪'
};

const STAT_NAMES = {
  hp:'HP', attack:'ATK', defense:'DEF',
  'special-attack':'SP.ATK', 'special-defense':'SP.DEF', speed:'SPD'
};

const STAT_CLASSES = {
  hp:'stat-hp', attack:'stat-attack', defense:'stat-defense',
  'special-attack':'stat-sp-attack', 'special-defense':'stat-sp-defense', speed:'stat-speed'
};

/* ── TOAST SYSTEM ── */
const UI = {

  /**
   * Show a toast notification
   * @param {string} message - Message text
   * @param {'success'|'error'|'info'} type - Toast type
   * @param {number} duration - Auto-dismiss duration in ms
   */
  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },

  /* ── MODAL ── */
  openModal(content) {
    const overlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = content;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  /* ── SKELETON CARDS ── */
  createSkeletons(container, count = 20) {
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `).join('');
  },

  /* ── TYPE BADGE HTML ── */
  typeBadge(type, extraClass = '') {
    const col = TYPE_COLORS[type] || '#999';
    return `<span class="type-badge type-${type} ${extraClass}" style="background:${col}">${TYPE_EMOJIS[type] || ''} ${type}</span>`;
  },

  typeBadgeSmall(type) {
    const col = TYPE_COLORS[type] || '#999';
    return `<span class="card-type type-${type}" style="background:${col}">${type}</span>`;
  },

  /* ── TYPE BACKGROUND COLOR ── */
  typeColor(type) { return TYPE_COLORS[type] || '#888'; },

  /* ── STAT BAR HTML ── */
  statBar(statName, value, max = 255) {
    const pct = Math.min(100, (value / max) * 100).toFixed(1);
    const cls = STAT_CLASSES[statName] || '';
    const label = STAT_NAMES[statName] || statName.toUpperCase();
    return `
      <div class="stat-row">
        <span class="stat-name">${label}</span>
        <span class="stat-val">${value}</span>
        <div class="stat-track">
          <div class="stat-fill ${cls}" style="width:0%" data-target="${pct}"></div>
        </div>
      </div>
    `;
  },

  /* Animate stat bars after render */
  animateStatBars(container = document) {
    requestAnimationFrame(() => {
      container.querySelectorAll('.stat-fill[data-target]').forEach(bar => {
        setTimeout(() => {
          bar.style.width = bar.dataset.target + '%';
        }, 100);
      });
    });
  },

  /* ── FORMAT ── */
  formatName(name) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  padId(id) {
    return '#' + String(id).padStart(4, '0');
  },

  formatHeight(dm) {
    const m = dm / 10;
    const ft = Math.floor(m * 3.28084);
    const inch = Math.round((m * 3.28084 - ft) * 12);
    return `${m.toFixed(1)}m / ${ft}'${inch}"`;
  },

  formatWeight(hg) {
    const kg = hg / 10;
    return `${kg.toFixed(1)}kg / ${(kg * 2.205).toFixed(1)}lbs`;
  },

  /* ── EXPLORER CARD ── */
  buildExplorerCard(poke, isShiny = false) {
    const primaryType = poke.types[0]?.type.name || 'normal';
    const typeColor = UI.typeColor(primaryType);
    const imgSrc = isShiny
      ? (poke.sprites.front_shiny || poke.sprites.front_default)
      : (poke.sprites.other?.['official-artwork']?.front_default || poke.sprites.front_default);

    const typeBadges = poke.types.map(t => UI.typeBadge(t.type.name)).join('');
    const abilities = poke.abilities.map(a =>
      `<span class="ability-tag${a.is_hidden ? ' hidden-ability' : ''}">${UI.formatName(a.ability.name)}${a.is_hidden ? ' (H)' : ''}</span>`
    ).join('');
    const stats = poke.stats.map(s => UI.statBar(s.stat.name, s.base_stat)).join('');

    return `
      <div class="explorer-card" id="explorerCard">
        <div class="explorer-left">
          <div class="explorer-bg-type bg-${primaryType}" style="background:${typeColor}"></div>
          <button class="explorer-shiny-btn${isShiny ? ' active' : ''}" id="shinyToggle">
            ${isShiny ? '✨ Shiny' : '⭐ Shiny'}
          </button>
          <div class="explorer-img-wrapper">
            <img src="${imgSrc}" alt="${poke.name}" class="explorer-img" id="explorerImg" />
          </div>
          <div class="explorer-number">${UI.padId(poke.id)}</div>
        </div>
        <div class="explorer-right">
          <h2 class="explorer-name">${UI.formatName(poke.name)}</h2>
          <div class="type-badges">${typeBadges}</div>
          <div class="explorer-meta">
            <div class="meta-item">
              <span class="meta-label">Height</span>
              <span class="meta-value">${UI.formatHeight(poke.height)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Weight</span>
              <span class="meta-value">${UI.formatWeight(poke.weight)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Base Exp</span>
              <span class="meta-value">${poke.base_experience || '—'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Species</span>
              <span class="meta-value">${UI.formatName(poke.species?.name || '—')}</span>
            </div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Abilities</span>
            <div class="abilities-list" style="margin-top:0.4rem">${abilities}</div>
          </div>
          <div class="stats-section">${stats}</div>
          <div class="explorer-actions">
            <button class="btn-primary sm" id="battleWithBtn" data-id="${poke.id}">⚔️ Battle With This</button>
            <button class="btn-secondary sm" id="randomExplorerBtn">🎲 Random</button>
          </div>
        </div>
      </div>
    `;
  },

  /* ── MODAL CARD ── */
  buildModalCard(poke) {
    const primaryType = poke.types[0]?.type.name || 'normal';
    const typeColor = UI.typeColor(primaryType);
    const img = poke.sprites.other?.['official-artwork']?.front_default || poke.sprites.front_default;
    const typeBadges = poke.types.map(t => UI.typeBadge(t.type.name)).join('');
    const stats = poke.stats.map(s => UI.statBar(s.stat.name, s.base_stat)).join('');
    const abilities = poke.abilities.map(a =>
      `<span class="ability-tag${a.is_hidden ? ' hidden-ability' : ''}">${UI.formatName(a.ability.name)}${a.is_hidden ? ' (H)' : ''}</span>`
    ).join('');

    return `
      <div class="modal-pokemon">
        <div class="modal-header" style="background:linear-gradient(135deg, ${typeColor}22, transparent)">
          <img src="${img}" alt="${poke.name}" class="modal-img" />
          <div class="modal-name">${UI.formatName(poke.name)}</div>
          <div class="modal-num">${UI.padId(poke.id)}</div>
          <div class="type-badges">${typeBadges}</div>
        </div>
        <div class="modal-section">
          <h4>Info</h4>
          <div class="explorer-meta">
            <div class="meta-item"><span class="meta-label">Height</span><span class="meta-value">${UI.formatHeight(poke.height)}</span></div>
            <div class="meta-item"><span class="meta-label">Weight</span><span class="meta-value">${UI.formatWeight(poke.weight)}</span></div>
          </div>
        </div>
        <div class="modal-section">
          <h4>Abilities</h4>
          <div class="abilities-list">${abilities}</div>
        </div>
        <div class="modal-section">
          <h4>Base Stats</h4>
          <div class="stats-section">${stats}</div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary sm" onclick="window.APP.exploreFromModal(${poke.id})">🔍 Explore</button>
          <button class="btn-secondary sm" onclick="window.APP.battleFromModal(${poke.id})">⚔️ Battle</button>
        </div>
      </div>
    `;
  },

  /* ── POKÉMON CARD ── */
  buildPokeCard(poke) {
    const primaryType = poke.types[0]?.type.name || 'normal';
    const typeColor = UI.typeColor(primaryType);
    const img = poke.sprites.other?.['official-artwork']?.front_default || poke.sprites.front_default;
    const typeBadges = poke.types.map(t => UI.typeBadgeSmall(t.type.name)).join('');

    return `
      <div class="poke-card" data-id="${poke.id}" data-type="${poke.types.map(t=>t.type.name).join(' ')}">
        <div class="card-img-wrap">
          <div class="card-type-bg bg-${primaryType}" style="background:${typeColor}"></div>
          <span class="card-num">${UI.padId(poke.id)}</span>
          <img src="${img}" alt="${poke.name}" class="card-img" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-name">${UI.formatName(poke.name)}</div>
          <div class="card-types">${typeBadges}</div>
        </div>
      </div>
    `;
  },

  /* ── HP BAR UPDATE ── */
  updateHpBar(barEl, valEl, current, max) {
    const pct = Math.max(0, (current / max) * 100);
    barEl.style.width = pct + '%';
    valEl.textContent = Math.max(0, current);
    barEl.classList.remove('warn', 'danger');
    if (pct <= 25) barEl.classList.add('danger');
    else if (pct <= 50) barEl.classList.add('warn');
  }
};

/* Export globally */
window.UI = UI;
window.TYPE_COLORS = TYPE_COLORS;
