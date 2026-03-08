// Scene 1 — Placard
// Tournament announcement card styled as aged paper.
// "Begin" button starts dimmed; it enables after a simulated preload delay.

import '../styles/placard.css';
import { loadPieceGeometries } from '../three/pieces.js';

// Shared reference — loaded geometries are passed to the game scene
let loadedGeometries = null;
export function getLoadedGeometries() { return loadedGeometries; }

export function createPlacardScene(stateManager) {
  let rootEl = null;
  let beginBtn = null;
  let loadingEl = null;
  let onBeginClick = null;
  let showLoadingTimer = null;
  let preloadCancelled = false;

  // ── Build DOM ──────────────────────────────────────────────────────────────
  function build() {
    rootEl = document.createElement('div');
    rootEl.id = 'placard';

    const card = document.createElement('div');
    card.className = 'placard-card';

    // Decorative corner brackets
    ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
      const corner = document.createElement('span');
      corner.className = `placard-corner placard-corner--${pos}`;
      card.appendChild(corner);
    });

    // ── Text hierarchy ───────────────────────────────────────────────────
    const event = document.createElement('p');
    event.className = 'placard-event';
    event.textContent = 'IBM Man-Machine Challenge — May 11, 1997 — Game 6';

    const rule = document.createElement('div');
    rule.className = 'placard-rule';

    const score = document.createElement('p');
    score.className = 'placard-score';
    score.textContent = 'Match Score: 2½ – 2½';

    const matchup = document.createElement('h2');
    matchup.className = 'placard-matchup';
    matchup.innerHTML = `
      <span class="placard-player">Garry Kasparov</span>
      <span class="vs">vs.</span>
      <span class="placard-player">IBM's Deep Blue</span>
    `;

    const role = document.createElement('p');
    role.className = 'placard-role';
    role.textContent = 'You play as Kasparov.';

    // ── Bottom: Begin + Loading ──────────────────────────────────────────
    const bottom = document.createElement('div');
    bottom.className = 'placard-bottom';

    beginBtn = document.createElement('button');
    beginBtn.className = 'placard-begin';
    beginBtn.textContent = 'Begin';
    beginBtn.setAttribute('aria-label', 'Begin the game');

    loadingEl = document.createElement('div');
    loadingEl.className = 'placard-loading';
    loadingEl.innerHTML = '<span class="placard-loading-icon">♔</span> Preparing the board…';

    bottom.appendChild(beginBtn);
    bottom.appendChild(loadingEl);

    // Assemble card
    card.appendChild(event);
    card.appendChild(rule);
    card.appendChild(score);
    card.appendChild(matchup);
    card.appendChild(role);
    card.appendChild(bottom);

    rootEl.appendChild(card);
    document.getElementById('app').appendChild(rootEl);
  }

  // ── Asset loading hook ──────────────────────────────────────────────────
  function loadThreeAssets() {
    return loadPieceGeometries().then((geometries) => {
      loadedGeometries = geometries;
    });
  }

  // ── Preload orchestration ───────────────────────────────────────────────
  function startPreload() {
    preloadCancelled = false;

    // Show the loading indicator if loading takes more than 2 seconds
    showLoadingTimer = setTimeout(() => {
      if (loadingEl) loadingEl.classList.add('visible');
    }, 2000);

    loadThreeAssets().then(() => {
      if (preloadCancelled) return;
      clearTimeout(showLoadingTimer);
      if (loadingEl) loadingEl.classList.remove('visible');
      enableBeginButton();
    });
  }

  function enableBeginButton() {
    if (!beginBtn) return;
    beginBtn.classList.add('enabled');
  }

  // ── Click handler ──────────────────────────────────────────────────────
  function attachClick() {
    onBeginClick = () => {
      // Only advance if the button is actually enabled
      if (!beginBtn.classList.contains('enabled')) return;
      stateManager.transition('GAME');
    };
    beginBtn.addEventListener('click', onBeginClick);
  }

  // ── Scene lifecycle ────────────────────────────────────────────────────
  return {
    enter() {
      if (!rootEl) build();
      attachClick();
      // Small delay so the CSS transition triggers reliably after insertion
      requestAnimationFrame(() => {
        rootEl.classList.add('visible');
      });
      startPreload();
    },

    exit() {
      preloadCancelled = true;
      clearTimeout(showLoadingTimer);
      if (beginBtn && onBeginClick) {
        beginBtn.removeEventListener('click', onBeginClick);
      }

      rootEl.classList.add('fading-out');
      rootEl.classList.remove('visible');
      setTimeout(() => rootEl.remove(), 850);
    },
  };
}
