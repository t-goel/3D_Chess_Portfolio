// Game state manager
// Phase 4: handleSegment() logs events to verify the scroll-to-event pipeline.
// Phase 5+ will add piece tracking, board state snapshots, and animation hooks.

export function createGameState() {
  let currentSegmentIndex = -1;

  return {
    /**
     * Called by the scroll controller whenever a scroll segment is entered.
     * Phase 4: logs the event. Phase 5+ will drive animations from here.
     *
     * @param {{ id, type, moveIndex, wall, revealIndex }} segment
     */
    handleSegment(segment) {
      currentSegmentIndex++;

      const { type, moveIndex, wall, revealIndex } = segment;

      switch (type) {
        case 'black-move':
          console.log(
            `[GameState] Triggered: black-move | moveIndex ${moveIndex} | wall: ${wall} | revealIndex: ${revealIndex}`
          );
          break;

        case 'return-to-board':
          console.log(
            `[GameState] Triggered: return-to-board | after moveIndex ${moveIndex}`
          );
          break;

        case 'resignation':
          console.log('[GameState] Triggered: resignation — Kasparov resigns');
          break;

        default:
          console.warn(`[GameState] Unknown segment type: "${type}"`);
      }
    },

    getCurrentSegmentIndex() {
      return currentSegmentIndex;
    },

    reset() {
      currentSegmentIndex = -1;
    },
  };
}
