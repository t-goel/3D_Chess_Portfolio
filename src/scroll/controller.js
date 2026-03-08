// GSAP ScrollTrigger-based scroll system
// Maps scroll position to game events via segment definitions.
//
// Architecture:
//   - A tall #scroll-spacer div gives the page enough height to scroll.
//   - The Three.js canvas is position:fixed, so it never actually moves.
//   - Each segment gets a ScrollTrigger with a per-segment `consumed` flag so
//     it fires exactly once regardless of scroll oscillation or bounce-back.
//   - Scrolling up does nothing — segments cannot re-fire after being consumed.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCROLL_SEGMENTS } from './segments.js';

gsap.registerPlugin(ScrollTrigger);

// Pixels of scroll distance per segment.
// 37 segments × 300 px = 11 100 px of total scroll travel.
const SEGMENT_HEIGHT = 300;

// Gap before the first segment so the board can fade in before scrolling starts.
const INITIAL_OFFSET = SEGMENT_HEIGHT;

// Raw scroll-position (px from top) for segment i (0-based).
function segmentScrollPos(i) {
  return INITIAL_OFFSET + i * SEGMENT_HEIGHT;
}

/**
 * Initialise the scroll controller for the game scene.
 *
 * @param {ReturnType<import('../game/state.js').createGameState>} gameState
 * @param {() => void} [onFirstScroll] - called once when the first segment fires
 * @returns {{ destroy: () => void }}
 */
export function createScrollController(gameState, onFirstScroll) {
  // ── Scroll spacer ──────────────────────────────────────────────────────────
  // Gives the page enough height to scroll through all segments.
  const totalHeight = INITIAL_OFFSET + (SCROLL_SEGMENTS.length + 1) * SEGMENT_HEIGHT;

  const spacer = document.createElement('div');
  spacer.id = 'scroll-spacer';
  Object.assign(spacer.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '1px',
    height: `${totalHeight}px`,
    pointerEvents: 'none',
    visibility: 'hidden',
  });
  document.body.appendChild(spacer);

  // Allow the page to scroll (main.css sets overflow:hidden by default).
  // Also hide the scrollbar so it doesn't appear over the 3D canvas.
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
  document.documentElement.classList.add('game-scrolling');

  // ── Per-segment ScrollTriggers ─────────────────────────────────────────────
  let firstScrollFired = false;

  const triggers = SCROLL_SEGMENTS.map((segment, i) => {
    // Per-trigger flag — ensures onEnter fires exactly once.
    // onEnter fires on every forward crossing of the start threshold, so
    // without this guard a single scroll gesture can fire it many times.
    let consumed = false;

    return ScrollTrigger.create({
      // No trigger element — start/end are raw pixel scroll positions.
      start: segmentScrollPos(i),
      end: segmentScrollPos(i) + SEGMENT_HEIGHT - 1,

      onEnter() {
        if (consumed) return;

        consumed = true;
        console.log(
          `%c[Scroll] ▶ Segment ${i} "${segment.id}" | type: ${segment.type}${segment.moveIndex !== undefined ? ` | moveIndex: ${segment.moveIndex}` : ''}`,
          'color: #8f8; font-weight: bold'
        );

        // Notify the prompt to hide (only fires once).
        if (!firstScrollFired) {
          firstScrollFired = true;
          onFirstScroll?.();
        }

        // Dispatch to the game state manager.
        gameState.handleSegment(segment);
      },
    });
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    destroy() {
      triggers.forEach((t) => t.kill());
      spacer.remove();

      // Restore default overflow and scrollbar visibility.
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.classList.remove('game-scrolling');

      // Reset scroll to top so re-entry starts clean.
      window.scrollTo(0, 0);

      ScrollTrigger.refresh();
    },
  };
}
