// PGN move data for Deep Blue (White) vs. Kasparov (Black) — Game 6, May 11 1997
// Each entry covers one full move pair (white + black).
// Move 19 has white only — Kasparov resigns.
//
// Squares use algebraic notation: file (a-h) + rank (1-8)
// phase/wall/revealIndex drive the wall-reveal system (Phase 6).
//
// Wall distribution (18 black moves across 4 walls; move 19 black: null):
//   back   — revealIndex 0–2  (moves  1– 3, opening)
//   left   — revealIndex 0–4  (moves  4– 8, opening → middlegame)
//   right  — revealIndex 0–4  (moves  9–13, middlegame)
//   fourth — revealIndex 0–4  (moves 14–18, endgame)

export const GAME_MOVES = [
  // ── Opening ──────────────────────────────────────────────────────────────────
  {
    moveNum: 1,
    white: { piece: 'P', from: 'e2', to: 'e4', capture: false, castle: false, check: false },
    black: { piece: 'P', from: 'c7', to: 'c6', capture: false, castle: false, check: false },
    phase: 'opening',
    wall: 'back',
    revealIndex: 0,
  },
  {
    moveNum: 2,
    white: { piece: 'P', from: 'd2', to: 'd4', capture: false, castle: false, check: false },
    black: { piece: 'P', from: 'd7', to: 'd5', capture: false, castle: false, check: false },
    phase: 'opening',
    wall: 'back',
    revealIndex: 1,
  },
  {
    moveNum: 3,
    // 3. Nc3 — Nb1 develops to c3
    white: { piece: 'N', from: 'b1', to: 'c3', capture: false, castle: false, check: false },
    // 3. ...dxe4 — d5 pawn captures the e4 pawn (CAPTURE)
    black: { piece: 'P', from: 'd5', to: 'e4', capture: true,  castle: false, check: false },
    phase: 'opening',
    wall: 'back',
    revealIndex: 2,
  },
  {
    moveNum: 4,
    // 4. Nxe4 — Nc3 captures the black pawn on e4 (CAPTURE)
    white: { piece: 'N', from: 'c3', to: 'e4', capture: true,  castle: false, check: false },
    // 4. ...Nd7 — Nb8 develops to d7
    black: { piece: 'N', from: 'b8', to: 'd7', capture: false, castle: false, check: false },
    phase: 'opening',
    wall: 'left',
    revealIndex: 0,
  },
  {
    moveNum: 5,
    // 5. Ng5 — Ne4 advances to g5 aiming at e6
    white: { piece: 'N', from: 'e4', to: 'g5', capture: false, castle: false, check: false },
    // 5. ...Ngf6 — Ng8 develops to f6
    black: { piece: 'N', from: 'g8', to: 'f6', capture: false, castle: false, check: false },
    phase: 'opening',
    wall: 'left',
    revealIndex: 1,
  },
  {
    moveNum: 6,
    // 6. Bd3 — Bf1 develops to d3
    white: { piece: 'B', from: 'f1', to: 'd3', capture: false, castle: false, check: false },
    // 6. ...e6 — opens the diagonal for Bc8, supports d5
    black: { piece: 'P', from: 'e7', to: 'e6', capture: false, castle: false, check: false },
    phase: 'opening',
    wall: 'left',
    revealIndex: 2,
  },
  {
    moveNum: 7,
    // 7. N1f3 — Ng1 develops to f3 ("1" disambiguates from the Ng5)
    white: { piece: 'N', from: 'g1', to: 'f3', capture: false, castle: false, check: false },
    // 7. ...h6 — attacks the Ng5
    black: { piece: 'P', from: 'h7', to: 'h6', capture: false, castle: false, check: false },
    phase: 'opening',
    wall: 'left',
    revealIndex: 3,
  },

  // ── Middlegame ────────────────────────────────────────────────────────────────
  {
    moveNum: 8,
    // 8. Nxe6 — Ng5 sacrifices itself capturing the e6 pawn (CAPTURE)
    white: { piece: 'N', from: 'g5', to: 'e6', capture: true,  castle: false, check: false },
    // 8. ...Qe7 — Qd8 sidesteps the d8/f8 fork; knight remains hanging
    black: { piece: 'Q', from: 'd8', to: 'e7', capture: false, castle: false, check: false },
    phase: 'middlegame',
    wall: 'left',
    revealIndex: 4,
  },
  {
    moveNum: 9,
    // 9. O-O — kingside castling: Ke1→g1, Rh1→f1 (castle: true)
    white: { piece: 'K', from: 'e1', to: 'g1', capture: false, castle: true,  check: false },
    // 9. ...fxe6 — f7 pawn finally captures the hanging Ne6 (CAPTURE)
    black: { piece: 'P', from: 'f7', to: 'e6', capture: true,  castle: false, check: false },
    phase: 'middlegame',
    wall: 'right',
    revealIndex: 0,
  },
  {
    moveNum: 10,
    // 10. Bg6+ — Bd3 slides to g6, giving CHECK to Ke8 (diagonal d3–e4–f5–g6)
    white: { piece: 'B', from: 'd3', to: 'g6', capture: false, castle: false, check: true  },
    // 10. ...Kd8 — king escapes the check
    black: { piece: 'K', from: 'e8', to: 'd8', capture: false, castle: false, check: false },
    phase: 'middlegame',
    wall: 'right',
    revealIndex: 1,
  },
  {
    moveNum: 11,
    // 11. Bf4 — Bc1 (dark-squared bishop) develops to f4
    white: { piece: 'B', from: 'c1', to: 'f4', capture: false, castle: false, check: false },
    // 11. ...b5 — space-gaining advance
    black: { piece: 'P', from: 'b7', to: 'b5', capture: false, castle: false, check: false },
    phase: 'middlegame',
    wall: 'right',
    revealIndex: 2,
  },
  {
    moveNum: 12,
    // 12. a4 — challenges the b5 pawn
    white: { piece: 'P', from: 'a2', to: 'a4', capture: false, castle: false, check: false },
    // 12. ...Bb7 — Bc8 develops to b7
    black: { piece: 'B', from: 'c8', to: 'b7', capture: false, castle: false, check: false },
    phase: 'middlegame',
    wall: 'right',
    revealIndex: 3,
  },
  {
    moveNum: 13,
    // 13. Re1 — Rf1 transfers to the open e-file
    white: { piece: 'R', from: 'f1', to: 'e1', capture: false, castle: false, check: false },
    // 13. ...Nd5 — Nf6 centralises to d5
    black: { piece: 'N', from: 'f6', to: 'd5', capture: false, castle: false, check: false },
    phase: 'middlegame',
    wall: 'right',
    revealIndex: 4,
  },

  // ── Endgame ───────────────────────────────────────────────────────────────────
  {
    moveNum: 14,
    // 14. Bg3 — Bf4 repositions to g3
    white: { piece: 'B', from: 'f4', to: 'g3', capture: false, castle: false, check: false },
    // 14. ...Kc8 — king steps off the e-file pin threat
    black: { piece: 'K', from: 'd8', to: 'c8', capture: false, castle: false, check: false },
    phase: 'endgame',
    wall: 'fourth',
    revealIndex: 0,
  },
  {
    moveNum: 15,
    // 15. axb5 — a4 pawn captures b5 (CAPTURE)
    white: { piece: 'P', from: 'a4', to: 'b5', capture: true,  castle: false, check: false },
    // 15. ...cxb5 — c6 pawn recaptures (CAPTURE)
    black: { piece: 'P', from: 'c6', to: 'b5', capture: true,  castle: false, check: false },
    phase: 'endgame',
    wall: 'fourth',
    revealIndex: 1,
  },
  {
    moveNum: 16,
    // 16. Qd3 — queen centralises, eyes h7 and the kingside
    white: { piece: 'Q', from: 'd1', to: 'd3', capture: false, castle: false, check: false },
    // 16. ...Bc6 — Bb7 reroutes, challenging White's dark-square grip
    black: { piece: 'B', from: 'b7', to: 'c6', capture: false, castle: false, check: false },
    phase: 'endgame',
    wall: 'fourth',
    revealIndex: 2,
  },
  {
    moveNum: 17,
    // 17. Bf5 — Bg6 moves to f5, a piece offer targeting e6 and d7
    white: { piece: 'B', from: 'g6', to: 'f5', capture: false, castle: false, check: false },
    // 17. ...exf5 — e6 pawn captures the bishop (CAPTURE); opens the e-file fatally
    black: { piece: 'P', from: 'e6', to: 'f5', capture: true,  castle: false, check: false },
    phase: 'endgame',
    wall: 'fourth',
    revealIndex: 3,
  },
  {
    moveNum: 18,
    // 18. Rxe7 — Re1 captures the queen on e7 (CAPTURE)
    white: { piece: 'R', from: 'e1', to: 'e7', capture: true,  castle: false, check: false },
    // 18. ...Bxe7 — Bf8 recaptures the rook (CAPTURE)
    black: { piece: 'B', from: 'f8', to: 'e7', capture: true,  castle: false, check: false },
    phase: 'endgame',
    wall: 'fourth',
    revealIndex: 4,
  },
  {
    moveNum: 19,
    // 19. c4 — decisive central break; Kasparov resigns
    white: { piece: 'P', from: 'c2', to: 'c4', capture: false, castle: false, check: false },
    black: null, // Kasparov resigns — no reply
    phase: 'endgame',
    wall: null,
    revealIndex: null,
  },
];
