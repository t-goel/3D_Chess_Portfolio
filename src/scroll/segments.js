// Scroll segment definitions
// Each segment maps a scroll position to a game event.
// Pattern: black-move → return-to-board, repeated for all 18 black moves.
// Final segment: resignation (move 19, Deep Blue plays c4, Kasparov resigns).

import { GAME_MOVES } from '../game/moves.js';

export const SCROLL_SEGMENTS = [];

// Build segments from move data.
// Moves 1–18 have a black reply → generate black-move + return-to-board pair.
// Move 19 has black: null (resignation) → handled separately below.
for (const move of GAME_MOVES) {
  if (move.black === null) continue; // move 19 — no black reply

  SCROLL_SEGMENTS.push({
    id: `black-${move.moveNum}`,
    type: 'black-move',
    moveIndex: move.moveNum - 1, // 0-based index into GAME_MOVES
    wall: move.wall,
    revealIndex: move.revealIndex,
  });

  SCROLL_SEGMENTS.push({
    id: `return-${move.moveNum}`,
    type: 'return-to-board',
    moveIndex: move.moveNum - 1,
  });
}

// Resignation — triggered after the 18th return-to-board, when Deep Blue plays c4
SCROLL_SEGMENTS.push({
  id: 'resignation',
  type: 'resignation',
});

// Sanity check: 18 black moves × 2 + 1 resignation = 37 segments
// console.log(`SCROLL_SEGMENTS: ${SCROLL_SEGMENTS.length} segments`);
