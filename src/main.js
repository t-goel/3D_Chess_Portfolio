import './styles/main.css';
import { createLandingScene } from './scenes/landing.js';
import { createPlacardScene } from './scenes/placard.js';
import { createGameScene } from './scenes/game.js';
import { createCinematicScene } from './scenes/cinematic.js';
import { createPostgameScene } from './scenes/postgame.js';

// ─── Valid Transitions ─────────────────────────────────────────────────────
// Defines which states can transition to which.
// Prevents impossible jumps (e.g. LANDING → CINEMATIC).
const VALID_TRANSITIONS = {
  LANDING:    ['PLACARD'],
  PLACARD:    ['GAME'],
  GAME:       ['CINEMATIC'],
  CINEMATIC:  ['POSTGAME', 'GAME'],   // "Return to board" goes back to GAME
  POSTGAME:   ['CINEMATIC'],          // clock/envelope re-opens cinematic contact screen
};

// ─── Scene State Machine ───────────────────────────────────────────────────
let scenes = {};
let currentStateName = null;
let transitioning = false;

export const stateManager = {
  /**
   * Attempt a transition to a new scene.
   * Calls exit() on the current scene then enter() on the next.
   * Silently blocked if:
   *   - already in that state
   *   - transition is not in VALID_TRANSITIONS
   *   - a transition is already in progress
   *
   * @param {'LANDING'|'PLACARD'|'GAME'|'CINEMATIC'|'POSTGAME'} next
   */
  transition(next) {
    if (transitioning) {
      console.warn(`stateManager: transition to "${next}" blocked — already transitioning`);
      return;
    }

    if (next === currentStateName) {
      console.warn(`stateManager: already in "${next}", ignoring`);
      return;
    }

    const allowed = VALID_TRANSITIONS[currentStateName] ?? [];
    if (!allowed.includes(next)) {
      console.warn(
        `stateManager: invalid transition "${currentStateName}" → "${next}"`,
        `(allowed: ${allowed.join(', ') || 'none'})`
      );
      return;
    }

    transitioning = true;

    const current = scenes[currentStateName];
    const nextScene = scenes[next];

    console.log(`stateManager: "${currentStateName}" → "${next}"`);

    current.exit();
    currentStateName = next;
    nextScene.enter();

    transitioning = false;
  },

  /** Returns the name of the active scene. */
  getState() {
    return currentStateName;
  },
};

// ─── Bootstrap ────────────────────────────────────────────────────────────
function init() {
  scenes = {
    LANDING:   createLandingScene(stateManager),
    PLACARD:   createPlacardScene(stateManager),
    GAME:      createGameScene(stateManager),
    CINEMATIC: createCinematicScene(stateManager),
    POSTGAME:  createPostgameScene(stateManager),
  };

  // Enter the first scene directly (no prior state to exit).
  currentStateName = 'LANDING';
  console.log(`stateManager: enter → "LANDING"`);
  scenes.LANDING.enter();
}

init();
