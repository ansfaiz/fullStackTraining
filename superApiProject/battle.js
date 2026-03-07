/**
 * battle.js — PokéVerse Battle Engine
 * Handles: Turn-based combat, damage calculation, HP management, move effects
 */

'use strict';

const Battle = (() => {

  /* ── STATE ── */
  let state = {
    active: false,
    turn: 'player',
    healUsed: false,
    player: { data: null, currentHp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0 },
    enemy: { data: null, currentHp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0 }
  };

  /* ── DOM REFS ── */
  const dom = {
    setup: () => document.getElementById('battleSetup'),
    field: () => document.getElementById('battleField'),
    log: () => document.getElementById('battleLog'),
    controls: () => document.getElementById('battleControls'),
    result: () => document.getElementById('battleResult'),
    resultContent: () => document.getElementById('resultContent'),
    logMessages: () => document.getElementById('logMessages'),
    attackBtn: () => document.getElementById('attackBtn'),
    specialBtn: () => document.getElementById('specialBtn'),
    healBtn: () => document.getElementById('healBtn'),
    fleeBtn: () => document.getElementById('fleeBtn'),
    rematchBtn: () => document.getElementById('rematchBtn'),
    playerSprite: () => document.getElementById('playerSprite'),
    enemySprite: () => document.getElementById('enemySprite'),
    playerName: () => document.getElementById('playerName'),
    enemyName: () => document.getElementById('enemyName'),
    playerHpBar: () => document.getElementById('playerHpBar'),
    enemyHpBar: () => document.getElementById('enemyHpBar'),
    playerHpVal: () => document.getElementById('playerHpVal'),
    enemyHpVal: () => document.getElementById('enemyHpVal'),
    playerHpMax: () => document.getElementById('playerHpMax'),
    enemyHpMax: () => document.getElementById('enemyHpMax'),
  };

  /* ── UTILITY ── */
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  /**
   * Extract battle stats from Pokémon data
   * @param {Object} pokeData - Raw PokéAPI data
   */
  function extractStats(pokeData) {
    const get = name => pokeData.stats.find(s => s.stat.name === name)?.base_stat || 50;
    return {
      data: pokeData,
      currentHp: get('hp'),
      maxHp: get('hp'),
      attack: get('attack'),
      spAttack: get('special-attack'),
      defense: get('defense'),
      spDefense: get('special-defense'),
      speed: get('speed')
    };
  }

  /**
   * Calculate damage using simplified Gen 3 formula
   * @param {Object} attacker - Attacker stats object
   * @param {Object} defender - Defender stats object
   * @param {'normal'|'special'} category - Move category
   * @param {number} power - Base move power
   * @returns {number} Damage dealt
   */
  function calcDamage(attacker, defender, category = 'normal', power = 60) {
    const atk = category === 'normal' ? attacker.attack : attacker.spAttack;
    const def = category === 'normal' ? defender.defense : defender.spDefense;
    const level = 50;
    const random = rand(85, 100) / 100;
    const critical = Math.random() < 0.0625 ? 1.5 : 1;
    const damage = Math.floor((((2 * level / 5 + 2) * power * (atk / def)) / 50 + 2) * random * critical);
    return { damage: clamp(damage, 1, 999), critical: critical > 1 };
  }

  /* ── LOG ── */
  function addLog(message, type = '') {
    const el = document.createElement('div');
    el.className = `log-msg ${type}`;
    el.textContent = message;
    const logEl = dom.logMessages();
    logEl.appendChild(el);
    logEl.scrollTop = logEl.scrollHeight;
    // Keep max 20 log entries
    const msgs = logEl.querySelectorAll('.log-msg');
    if (msgs.length > 20) msgs[0].remove();
  }

  /* ── ANIMATIONS ── */
  function animateSprite(spriteEl, type) {
    spriteEl.classList.remove('shake', 'hit-flash');
    void spriteEl.offsetWidth; // reflow
    if (type === 'shake') spriteEl.classList.add('shake');
    if (type === 'hit') spriteEl.classList.add('hit-flash');
    setTimeout(() => {
      spriteEl.classList.remove('shake', 'hit-flash');
    }, 500);
  }

  /* ── DISABLE/ENABLE CONTROLS ── */
  function setControlsDisabled(disabled) {
    ['attackBtn', 'specialBtn', 'healBtn', 'fleeBtn'].forEach(id => {
      const btn = dom[id]();
      if (btn) {
        if (id === 'healBtn' && state.healUsed) {
          btn.disabled = true;
        } else {
          btn.disabled = disabled;
        }
      }
    });
  }

  /* ── CHECK BATTLE END ── */
  function checkEnd() {
    if (state.enemy.currentHp <= 0) { endBattle('win'); return true; }
    if (state.player.currentHp <= 0) { endBattle('lose'); return true; }
    return false;
  }

  /* ── ENEMY TURN ── */
  async function enemyTurn() {
    if (!state.active) return;

    // Brief delay for realism
    await delay(900);

    if (!state.active) return;

    // Enemy AI: use special if has type advantage, else normal attack
    const useSpecial = state.enemy.spAttack > state.enemy.attack && Math.random() < 0.4;
    const power = useSpecial ? rand(65, 90) : rand(45, 75);
    const { damage, critical } = calcDamage(state.enemy, state.player, useSpecial ? 'special' : 'normal', power);

    state.player.currentHp = clamp(state.player.currentHp - damage, 0, state.player.maxHp);

    UI.updateHpBar(dom.playerHpBar(), dom.playerHpVal(), state.player.currentHp, state.player.maxHp);
    animateSprite(dom.playerSprite(), 'hit');

    const pName = UI.formatName(state.enemy.data.name);
    const move = useSpecial ? 'Special Attack' : 'Attack';
    addLog(`${pName} used ${move}! ${critical ? '⚡ Critical hit! ' : ''}${damage} damage!`, 'enemy-msg');

    if (!checkEnd()) {
      setControlsDisabled(false);
      state.turn = 'player';
    }
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));

  /* ── PLAYER ACTIONS ── */
  async function playerAttack(category = 'normal') {
    if (!state.active || state.turn !== 'player') return;
    setControlsDisabled(true);
    state.turn = 'enemy';

    const power = category === 'normal' ? rand(45, 75) : rand(65, 95);
    const { damage, critical } = calcDamage(state.player, state.enemy, category, power);

    state.enemy.currentHp = clamp(state.enemy.currentHp - damage, 0, state.enemy.maxHp);

    UI.updateHpBar(dom.enemyHpBar(), dom.enemyHpVal(), state.enemy.currentHp, state.enemy.maxHp);
    animateSprite(dom.enemySprite(), 'shake');

    const pName = UI.formatName(state.player.data.name);
    const move = category === 'normal' ? 'Attack' : 'Special';
    addLog(`Your ${pName} used ${move}! ${critical ? '⚡ Critical hit! ' : ''}${damage} damage!`, 'player-msg');

    if (!checkEnd()) {
      await enemyTurn();
    }
  }

  async function playerHeal() {
    if (!state.active || state.turn !== 'player' || state.healUsed) return;
    setControlsDisabled(true);
    state.healUsed = true;
    state.turn = 'enemy';

    const healAmount = Math.floor(state.player.maxHp * 0.35);
    state.player.currentHp = clamp(state.player.currentHp + healAmount, 0, state.player.maxHp);
    UI.updateHpBar(dom.playerHpBar(), dom.playerHpVal(), state.player.currentHp, state.player.maxHp);

    addLog(`💊 Used Full Restore! Healed ${healAmount} HP!`, 'heal-msg');
    dom.healBtn().disabled = true;
    dom.healBtn().textContent = '💊 HEAL (used)';

    await enemyTurn();
  }

  function playerFlee() {
    if (!state.active) return;
    state.active = false;
    addLog('You fled from battle! 🏃', 'system-msg');
    setTimeout(() => endBattle('flee'), 800);
  }

  /* ── START BATTLE ── */
  async function start(playerData, enemyData) {
    state = {
      active: true,
      turn: 'player',
      healUsed: false,
      player: extractStats(playerData),
      enemy: extractStats(enemyData)
    };

    // Speed check for who goes first
    if (state.enemy.speed > state.player.speed) {
      state.turn = 'enemy';
    }

    // Show field
    dom.setup().style.display = 'none';
    dom.field().style.display = 'grid';
    dom.log().style.display = 'block';
    dom.controls().style.display = 'flex';
    dom.result().style.display = 'none';

    // Populate sprites
    const playerImg = playerData.sprites.other?.['official-artwork']?.front_default || playerData.sprites.front_default;
    const enemyImg = enemyData.sprites.other?.['official-artwork']?.front_default || enemyData.sprites.front_default;

    dom.playerSprite().src = playerImg;
    dom.playerSprite().alt = playerData.name;
    dom.enemySprite().src = enemyImg;
    dom.enemySprite().alt = enemyData.name;
    dom.playerName().textContent = UI.formatName(playerData.name);
    dom.enemyName().textContent = UI.formatName(enemyData.name);
    dom.playerHpMax().textContent = state.player.maxHp;
    dom.enemyHpMax().textContent = state.enemy.maxHp;

    UI.updateHpBar(dom.playerHpBar(), dom.playerHpVal(), state.player.currentHp, state.player.maxHp);
    UI.updateHpBar(dom.enemyHpBar(), dom.enemyHpVal(), state.enemy.currentHp, state.enemy.maxHp);

    // Clear log
    dom.logMessages().innerHTML = '';

    const pName = UI.formatName(playerData.name);
    const eName = UI.formatName(enemyData.name);
    addLog(`⚔️ Battle Start! ${pName} vs ${eName}!`, 'system-msg');

    if (state.turn === 'enemy') {
      addLog(`${eName} is faster and attacks first!`, 'system-msg');
      setControlsDisabled(true);
      await enemyTurn();
    } else {
      addLog(`${pName} is faster! Your turn.`, 'system-msg');
      setControlsDisabled(false);
    }

    /* ── WIRE CONTROLS ── */
    dom.attackBtn().onclick = () => playerAttack('normal');
    dom.specialBtn().onclick = () => playerAttack('special');
    dom.healBtn().onclick = () => playerHeal();
    dom.fleeBtn().onclick = () => playerFlee();
  }

  /* ── END BATTLE ── */
  function endBattle(outcome) {
    state.active = false;
    setControlsDisabled(true);
    dom.controls().style.display = 'none';
    dom.result().style.display = 'flex';

    const pName = UI.formatName(state.player.data?.name || 'You');
    const eName = UI.formatName(state.enemy.data?.name || 'Enemy');

    const messages = {
      win: {
        cls: 'result-win',
        title: '🏆 VICTORY!',
        body: `${pName} defeated ${eName}! You're a Pokémon Master!`
      },
      lose: {
        cls: 'result-lose',
        title: '💀 DEFEATED!',
        body: `${eName} was too powerful! Heal up and try again!`
      },
      flee: {
        cls: 'result-flee',
        title: '🏃 ESCAPED!',
        body: `You fled from ${eName}. Sometimes wisdom is the better part of valor.`
      }
    };

    const m = messages[outcome];
    dom.resultContent().className = m.cls;
    dom.resultContent().innerHTML = `<h2>${m.title}</h2><p>${m.body}</p>`;
  }

  /* ── RESET ── */
  function reset() {
    state.active = false;
    dom.setup().style.display = 'flex';
    dom.field().style.display = 'none';
    dom.log().style.display = 'none';
    dom.controls().style.display = 'none';
    dom.result().style.display = 'none';

    // Reset heal button
    const healBtn = dom.healBtn();
    if (healBtn) {
      healBtn.disabled = false;
      healBtn.textContent = '💊 HEAL (1x)';
    }
  }

  /* ── PUBLIC API ── */
  return { start, reset, state };

})();

window.Battle = Battle;
