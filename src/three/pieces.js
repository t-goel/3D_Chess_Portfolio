// Chess piece models, materials, and placement
// Phase 3: Load GLTF models, create coordinate system, place all 32 pieces

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ── Materials ────────────────────────────────────────────────────────────────

const WHITE_MAT = new THREE.MeshStandardMaterial({
  color: '#E8D5B7',
  roughness: 0.6,
  metalness: 0.1,
});

const BLACK_MAT = new THREE.MeshStandardMaterial({
  color: '#2C2C2C',
  roughness: 0.5,
  metalness: 0.15,
});

// ── Target heights (world units, relative to 1-unit squares) ─────────────────

const PIECE_HEIGHTS = {
  K: 1.3,
  Q: 1.15,
  B: 0.95,
  N: 0.9,
  R: 0.8,
  P: 0.65,
};

// ── Coordinate system ────────────────────────────────────────────────────────
// Board is 8×8, centered at origin. Each square is 1 unit.
// Camera sits at +z (black's side). White ranks (1-2) are at -z (far),
// black ranks (7-8) at +z (near).
// Files: a=-3.5 (left from camera) … h=+3.5 (right from camera).
// Board top surface is at y = 0.15 (half of the 0.3-thick board).

const BOARD_TOP_Y = 0.15;

export function squareToPosition(square) {
  const file = square.charCodeAt(0) - 97; // a=0 … h=7
  const rank = parseInt(square[1], 10) - 1; // 1=0 … 8=7

  return new THREE.Vector3(
    3.5 - file, // x: a=3.5, h=-3.5 (mirrored for camera on black's side)
    BOARD_TOP_Y, // y: sit on board surface
    rank - 3.5, // z: rank1=-3.5 (far), rank8=3.5 (near camera)
  );
}

// ── GLTF name → piece-type mapping ───────────────────────────────────────────

const NAME_TO_PIECE = {
  Knight: 'N',
  Rook: 'R',
  Pawn: 'P',
  Bishop: 'B',
  Queen: 'Q',
  King: 'K',
};

// ── Load & normalise piece geometries ────────────────────────────────────────

export function loadPieceGeometries() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        const geometries = {};

        // Compute world matrices for every node in the loaded scene
        gltf.scene.updateMatrixWorld(true);

        gltf.scene.traverse((child) => {
          if (!child.isMesh) return;

          for (const [keyword, pieceType] of Object.entries(NAME_TO_PIECE)) {
            if (geometries[pieceType]) continue; // already extracted
            if (!child.name.includes(keyword)) continue;

            // Clone geometry and bake the full ancestor transform chain
            const geo = child.geometry.clone();
            geo.applyMatrix4(child.matrixWorld);

            // Centre horizontally, place bottom at y = 0
            geo.computeBoundingBox();
            const box = geo.boundingBox;
            const cx = (box.max.x + box.min.x) / 2;
            const cz = (box.max.z + box.min.z) / 2;
            geo.translate(-cx, -box.min.y, -cz);

            // Scale to target height
            geo.computeBoundingBox();
            const rawHeight = geo.boundingBox.max.y - geo.boundingBox.min.y;
            const s = PIECE_HEIGHTS[pieceType] / rawHeight;
            geo.scale(s, s, s);

            geometries[pieceType] = geo;
          }
        });

        // Verify all six types were found
        const missing = Object.values(NAME_TO_PIECE).filter((t) => !geometries[t]);
        if (missing.length) {
          reject(new Error(`Missing piece geometries: ${missing.join(', ')}`));
          return;
        }

        resolve(geometries);
      },
      undefined,
      (err) => reject(err),
    );
  });
}

// ── Starting position ────────────────────────────────────────────────────────

const STARTING_POSITION = {
  // White (ranks 1-2) — Deep Blue
  a1: { piece: 'R', color: 'white' },
  b1: { piece: 'N', color: 'white' },
  c1: { piece: 'B', color: 'white' },
  d1: { piece: 'Q', color: 'white' },
  e1: { piece: 'K', color: 'white' },
  f1: { piece: 'B', color: 'white' },
  g1: { piece: 'N', color: 'white' },
  h1: { piece: 'R', color: 'white' },
  a2: { piece: 'P', color: 'white' },
  b2: { piece: 'P', color: 'white' },
  c2: { piece: 'P', color: 'white' },
  d2: { piece: 'P', color: 'white' },
  e2: { piece: 'P', color: 'white' },
  f2: { piece: 'P', color: 'white' },
  g2: { piece: 'P', color: 'white' },
  h2: { piece: 'P', color: 'white' },
  // Black (ranks 7-8) — Kasparov
  a7: { piece: 'P', color: 'black' },
  b7: { piece: 'P', color: 'black' },
  c7: { piece: 'P', color: 'black' },
  d7: { piece: 'P', color: 'black' },
  e7: { piece: 'P', color: 'black' },
  f7: { piece: 'P', color: 'black' },
  g7: { piece: 'P', color: 'black' },
  h7: { piece: 'P', color: 'black' },
  a8: { piece: 'R', color: 'black' },
  b8: { piece: 'N', color: 'black' },
  c8: { piece: 'B', color: 'black' },
  d8: { piece: 'Q', color: 'black' },
  e8: { piece: 'K', color: 'black' },
  f8: { piece: 'B', color: 'black' },
  g8: { piece: 'N', color: 'black' },
  h8: { piece: 'R', color: 'black' },
};

// ── Place pieces on the board ────────────────────────────────────────────────
// Returns a piece registry: Map<squareName, { mesh, pieceType, color }>

export function placePieces(scene, geometries) {
  const registry = new Map();

  for (const [square, { piece, color }] of Object.entries(STARTING_POSITION)) {
    const geo = geometries[piece];
    const mat = color === 'white' ? WHITE_MAT : BLACK_MAT;
    const mesh = new THREE.Mesh(geo, mat);

    const pos = squareToPosition(square);
    mesh.position.copy(pos);

    // Rotate black knights 180° so they face toward the board center
    if (piece === 'N' && color === 'black') {
      mesh.rotation.y = Math.PI;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
    registry.set(square, { mesh, pieceType: piece, color });
  }

  return registry;
}
