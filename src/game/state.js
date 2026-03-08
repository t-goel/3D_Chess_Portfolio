// Game state manager — Phase 5
// Drives piece animations, camera choreography, and the scroll-to-action pipeline.

import * as THREE from 'three';
import gsap from 'gsap';
import { GAME_MOVES } from './moves.js';
import { squareToPosition } from '../three/pieces.js';

const HOME_POS  = new THREE.Vector3(0, 10, 12);
const HOME_LOOK = new THREE.Vector3(0, 0, 0);

const WALL_VIEWS = {
  back:   { pos: new THREE.Vector3(0,   3, -6), look: new THREE.Vector3(0,  2, -10) },
  left:   { pos: new THREE.Vector3(6,   3,  0), look: new THREE.Vector3(10, 2,   0) },
  right:  { pos: new THREE.Vector3(-6,  3,  0), look: new THREE.Vector3(-10,2,   0) },
  fourth: { pos: new THREE.Vector3(0,   3,  6), look: new THREE.Vector3(0,  2,  10) },
};

const PIECE_MOVE_DUR  = 0.8;
const ARC_HEIGHT      = 1.5;
const WALL_PAN_DUR    = 0.4;
const CAMERA_HOME_DUR = 0.4;
const CAPTURE_DUR     = 0.3;

// ── Debug helpers ─────────────────────────────────────────────────────────────

function logRegistry(pieceRegistry, label) {
  const entries = [];
  for (const [sq, { pieceType, color }] of pieceRegistry) {
    entries.push(`${sq}:${color[0].toUpperCase()}${pieceType}`);
  }
  entries.sort();
  console.log(`  [Registry @ ${label}] ${entries.join('  ')}`);
}

function logMove(side, moveNum, piece, from, to, flags = {}) {
  const parts = [`${moveNum}${side === 'black' ? '...' : '.'} ${piece} ${from}→${to}`];
  if (flags.capture) parts.push('(capture)');
  if (flags.castle)  parts.push('(castle)');
  if (flags.check)   parts.push('(CHECK)');
  console.log(`  [${side.toUpperCase()}] ${parts.join(' ')}`);
}

export function createGameState(refs) {
  const { scene, camera, pieceRegistry, stateManager, onHighlightChange } = refs;

  let animating = false;
  const segmentQueue = [];
  const lookTarget = HOME_LOOK.clone();

  function processNext() {
    if (animating || segmentQueue.length === 0) return;
    const segment = segmentQueue.shift();
    switch (segment.type) {
      case 'black-move':      handleBlackMove(segment.moveIndex);    break;
      case 'return-to-board': handleReturnToBoard(segment.moveIndex); break;
      case 'resignation':     handleResignation();                   break;
    }
  }

  // ── Camera ─────────────────────────────────────────────────────────────────

  function cameraTo(pos, look, duration) {
    const tl = gsap.timeline();
    tl.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration, ease: 'power2.inOut' }, 0);
    tl.to(lookTarget, {
      x: look.x, y: look.y, z: look.z, duration, ease: 'power2.inOut',
      onUpdate() { camera.lookAt(lookTarget); },
    }, 0);
    return tl;
  }

  // ── Piece movement ──────────────────────────────────────────────────────────

  function movePiece(fromSq, toSq, label = '') {
    const tl = gsap.timeline();

    tl.call(() => {
      const entry = pieceRegistry.get(fromSq);
      if (!entry) {
        console.error(`  [movePiece${label ? ' ' + label : ''}] ❌ No piece on ${fromSq}! Registry has: ${[...pieceRegistry.keys()].sort().join(', ')}`);
        return;
      }

      console.log(`  [movePiece${label ? ' ' + label : ''}] ✓ ${entry.color} ${entry.pieceType} ${fromSq}→${toSq} | mesh pos before: (${entry.mesh.position.x.toFixed(2)}, ${entry.mesh.position.y.toFixed(2)}, ${entry.mesh.position.z.toFixed(2)})`);

      const dest  = squareToPosition(toSq);
      const mesh  = entry.mesh;
      const peakY = mesh.position.y + ARC_HEIGHT;

      gsap.to(mesh.position, { y: peakY, duration: PIECE_MOVE_DUR * 0.45, ease: 'power2.out' });
      gsap.to(mesh.position, { x: dest.x, z: dest.z, duration: PIECE_MOVE_DUR, ease: 'power2.inOut' });
      gsap.to(mesh.position, { y: dest.y, duration: PIECE_MOVE_DUR * 0.55, ease: 'power2.in', delay: PIECE_MOVE_DUR * 0.45 });

      pieceRegistry.delete(fromSq);
      pieceRegistry.set(toSq, entry);

      console.log(`  [movePiece${label ? ' ' + label : ''}]   Registry updated: ${fromSq} deleted, ${toSq} set to ${entry.color} ${entry.pieceType}`);
    });

    tl.to({}, { duration: PIECE_MOVE_DUR });
    return tl;
  }

  function capturePiece(sq, label = '') {
    const tl = gsap.timeline();

    tl.call(() => {
      const entry = pieceRegistry.get(sq);
      if (!entry) {
        console.warn(`  [capturePiece${label ? ' ' + label : ''}] ⚠️ No piece on ${sq} to capture`);
        return;
      }
      console.log(`  [capturePiece${label ? ' ' + label : ''}] ✓ Capturing ${entry.color} ${entry.pieceType} on ${sq}`);
      gsap.to(entry.mesh.scale, {
        x: 0, y: 0, z: 0, duration: CAPTURE_DUR, ease: 'power2.in',
        onComplete() { scene.remove(entry.mesh); },
      });
      pieceRegistry.delete(sq);
    });

    tl.to({}, { duration: CAPTURE_DUR });
    return tl;
  }

  function flashCheck() {
    const tl = gsap.timeline();
    tl.call(() => {
      const cx = camera.position.x;
      gsap.to(camera.position, { x: cx + 0.15, duration: 0.05, yoyo: true, repeat: 3 });
    });
    tl.to({}, { duration: 0.2 });
    return tl;
  }

  // ── Segment handlers ────────────────────────────────────────────────────────

  function handleBlackMove(moveIndex) {
    const move  = GAME_MOVES[moveIndex];
    const black = move.black;
    if (!black) return;

    console.group(`%c[SEGMENT] black-move | moveIndex=${moveIndex} | move ${move.moveNum}`, 'color: #4af; font-weight: bold');
    logMove('black', move.moveNum, black.piece, black.from, black.to, black);
    logRegistry(pieceRegistry, 'before black move');

    animating = true;
    onHighlightChange(null, null);

    const master = gsap.timeline({
      onComplete() {
        console.log(`  [black-move ${move.moveNum}] ✅ complete`);
        logRegistry(pieceRegistry, 'after black move');
        console.groupEnd();
        animating = false;
        processNext();
      },
    });

    if (black.capture) {
      master.add(capturePiece(black.to, `for black move ${move.moveNum}`));
    }

    master.add(movePiece(black.from, black.to, `black ${move.moveNum}`));

    if (black.check) master.add(flashCheck());

    if (move.wall && WALL_VIEWS[move.wall]) {
      console.log(`  [black-move ${move.moveNum}] Camera → wall: ${move.wall}`);
      master.add(cameraTo(WALL_VIEWS[move.wall].pos, WALL_VIEWS[move.wall].look, WALL_PAN_DUR), '+=0.15');
    }
  }

  function handleReturnToBoard(moveIndex) {
    const nextIdx  = moveIndex + 1;
    const hasNext  = nextIdx < GAME_MOVES.length;
    const white    = hasNext ? GAME_MOVES[nextIdx].white : null;

    console.group(`%c[SEGMENT] return-to-board | after moveIndex=${moveIndex}`, 'color: #fa4; font-weight: bold');
    if (white) {
      logMove('white', GAME_MOVES[nextIdx].moveNum, white.piece, white.from, white.to, white);
    }
    logRegistry(pieceRegistry, 'before white move');

    animating = true;

    const master = gsap.timeline({
      onComplete() {
        console.log(`  [return-to-board] ✅ complete`);
        logRegistry(pieceRegistry, 'after white move');
        console.groupEnd();
        animating = false;
        processNext();
      },
    });

    // 1. Camera home first
    console.log('  [return-to-board] Camera → HOME');
    master.add(cameraTo(HOME_POS, HOME_LOOK, CAMERA_HOME_DUR));
    master.to({}, { duration: 0.2 });

    // 2. Deep Blue's white move
    if (white) {
      if (white.castle) {
        const rookFrom = white.to === 'g1' ? 'h1' : 'a1';
        const rookTo   = white.to === 'g1' ? 'f1' : 'd1';
        console.log(`  [return-to-board] Castle: K ${white.from}→${white.to}, R ${rookFrom}→${rookTo}`);

        master.call(() => {
          const kingEntry = pieceRegistry.get(white.from);
          const rookEntry = pieceRegistry.get(rookFrom);

          if (!kingEntry) console.error(`  [Castle] ❌ No king on ${white.from}! Registry: ${[...pieceRegistry.keys()].sort().join(', ')}`);
          if (!rookEntry) console.error(`  [Castle] ❌ No rook on ${rookFrom}! Registry: ${[...pieceRegistry.keys()].sort().join(', ')}`);
          if (!kingEntry || !rookEntry) return;

          console.log(`  [Castle] ✓ King=${kingEntry.color} ${kingEntry.pieceType} on ${white.from}, Rook=${rookEntry.color} ${rookEntry.pieceType} on ${rookFrom}`);

          const kingDest = squareToPosition(white.to);
          const rookDest = squareToPosition(rookTo);

          gsap.to(kingEntry.mesh.position, { y: kingEntry.mesh.position.y + ARC_HEIGHT, duration: PIECE_MOVE_DUR * 0.45, ease: 'power2.out' });
          gsap.to(kingEntry.mesh.position, { x: kingDest.x, z: kingDest.z, duration: PIECE_MOVE_DUR, ease: 'power2.inOut' });
          gsap.to(kingEntry.mesh.position, { y: kingDest.y, duration: PIECE_MOVE_DUR * 0.55, ease: 'power2.in', delay: PIECE_MOVE_DUR * 0.45 });

          gsap.to(rookEntry.mesh.position, { y: rookEntry.mesh.position.y + ARC_HEIGHT, duration: PIECE_MOVE_DUR * 0.45, ease: 'power2.out' });
          gsap.to(rookEntry.mesh.position, { x: rookDest.x, z: rookDest.z, duration: PIECE_MOVE_DUR, ease: 'power2.inOut' });
          gsap.to(rookEntry.mesh.position, { y: rookDest.y, duration: PIECE_MOVE_DUR * 0.55, ease: 'power2.in', delay: PIECE_MOVE_DUR * 0.45 });

          pieceRegistry.delete(white.from);
          pieceRegistry.set(white.to, kingEntry);
          pieceRegistry.delete(rookFrom);
          pieceRegistry.set(rookTo, rookEntry);

          console.log(`  [Castle] Registry updated: K→${white.to}, R→${rookTo}`);
        });
        master.to({}, { duration: PIECE_MOVE_DUR });

      } else {
        if (white.capture) {
          master.add(capturePiece(white.to, `for white move ${GAME_MOVES[nextIdx].moveNum}`));
        }
        master.add(movePiece(white.from, white.to, `white ${GAME_MOVES[nextIdx].moveNum}`));
      }

      if (white.check) master.add(flashCheck());

      const nextBlack = GAME_MOVES[nextIdx].black;
      if (nextBlack) {
        master.call(() => {
          console.log(`  [return-to-board] Highlight → ${nextBlack.from}→${nextBlack.to}`);
          onHighlightChange(nextBlack.from, nextBlack.to);
        });
      } else {
        master.call(() => {
          console.log('  [return-to-board] No next black move — clearing highlights');
          onHighlightChange(null, null);
        });
      }
    }
  }

  function handleResignation() {
    console.log('%c[SEGMENT] resignation → CINEMATIC', 'color: #f44; font-weight: bold');
    stateManager.transition('CINEMATIC');
  }

  // ── Opening move ────────────────────────────────────────────────────────────

  function initialize() {
    return new Promise((resolve) => {
      const firstWhite = GAME_MOVES[0].white;

      console.group('%c[INIT] Deep Blue opening: 1. e4', 'color: #fa4; font-weight: bold');
      logMove('white', 1, firstWhite.piece, firstWhite.from, firstWhite.to, firstWhite);
      logRegistry(pieceRegistry, 'initial board');

      animating = true;
      const tl = gsap.timeline({
        onComplete() {
          const firstBlack = GAME_MOVES[0].black;
          console.log(`[INIT] ✅ Opening done. Highlight → ${firstBlack.from}→${firstBlack.to}`);
          logRegistry(pieceRegistry, 'after 1.e4');
          console.groupEnd();
          onHighlightChange(firstBlack.from, firstBlack.to);
          animating = false;
          processNext();
          resolve();
        },
      });

      tl.to({}, { duration: 0.5 });
      tl.add(movePiece(firstWhite.from, firstWhite.to, 'init 1.e4'));
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    handleSegment(segment) {
      segmentQueue.push(segment);
      processNext();
    },
    initialize,
    reset() { animating = false; },
  };
}
