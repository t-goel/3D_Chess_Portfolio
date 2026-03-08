import * as THREE from 'three';
import gsap from 'gsap';
import { placePieces, squareToPosition } from '../three/pieces.js';
import { getLoadedGeometries } from './placard.js';

const DARK_SQUARE  = '#5C3A21';
const LIGHT_SQUARE = '#F0D9B5';
const BORDER_COLOR = '#3E2414';
const TABLE_COLOR  = '#8B5C2A';
const BORDER_W     = 0.5;
const BOARD_SIZE   = 8;

// Board sits centred at y=0 (occupies y: -0.15 → +0.15).
// Table top must be flush with board bottom (y = -0.15).
const TABLE_H = 0.5;
const TABLE_Y = -(TABLE_H / 2 + 0.15); // = -0.4
const LEG_H   = 3.5;
const LEG_Y   = TABLE_Y - TABLE_H / 2 - LEG_H / 2; // = -2.4

// ---------- checker texture ----------

function createCheckerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width  = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? LIGHT_SQUARE : DARK_SQUARE;
      ctx.fillRect(col, row, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

// ---------- board ----------

function createBoard() {
  const group = new THREE.Group();

  // Surface
  const boardMesh = new THREE.Mesh(
    new THREE.BoxGeometry(BOARD_SIZE, 0.3, BOARD_SIZE),
    new THREE.MeshStandardMaterial({ map: createCheckerTexture() }),
  );
  boardMesh.castShadow    = true;
  boardMesh.receiveShadow = true;
  group.add(boardMesh);

  // Border — front/back span full outer width to fill corners
  const outerSize  = BOARD_SIZE + BORDER_W * 2;
  const halfBoard  = BOARD_SIZE / 2;
  const halfBorder = BORDER_W  / 2;
  const borderMat  = new THREE.MeshStandardMaterial({ color: BORDER_COLOR });

  const borderDefs = [
    // [ geoW, geoD, x, z ]
    [ outerSize, BORDER_W,  0,                       halfBoard  + halfBorder ],  // front
    [ outerSize, BORDER_W,  0,                     -(halfBoard  + halfBorder) ], // back
    [ BORDER_W,  BOARD_SIZE, -(halfBoard + halfBorder),  0 ],                    // left
    [ BORDER_W,  BOARD_SIZE,   halfBoard + halfBorder,   0 ],                    // right
  ];

  for (const [w, d, x, z] of borderDefs) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), borderMat);
    mesh.position.set(x, 0, z);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}

// ---------- table ----------

function createTable() {
  const group  = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    color:     TABLE_COLOR,
    roughness: 0.7,
    metalness: 0.1,
  });

  // Surface
  const surface = new THREE.Mesh(new THREE.BoxGeometry(12, TABLE_H, 10), woodMat);
  surface.position.y  = TABLE_Y;
  surface.castShadow    = true;
  surface.receiveShadow = true;
  group.add(surface);

  // Four legs — slight taper (top radius 0.2, bottom 0.25)
  for (const [lx, lz] of [[-5, -3.75], [5, -3.75], [-5, 3.75], [5, 3.75]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, LEG_H, 8), woodMat);
    leg.position.set(lx, LEG_Y, lz);
    leg.castShadow    = true;
    leg.receiveShadow = true;
    group.add(leg);
  }

  return group;
}

// ---------- Deep Blue figurine ----------
// A dark metallic monolith sitting on the white side of the table,
// representing the computer opponent. Two geometries: body + inset panel.

const TABLE_TOP_Y = TABLE_Y + TABLE_H / 2; // = -0.15 (flush with board bottom)

function createDeepBlueFigurine() {
  const group = new THREE.Group();

  // Dark steel body — visible but not bright; slight blue tint for "Deep Blue"
  const monolithMat = new THREE.MeshStandardMaterial({
    color:     '#1c2a3a',
    metalness: 0.85,
    roughness: 0.15,
    emissive:  '#0a1520',
    emissiveIntensity: 0.3,
  });

  // Main body — tall narrow monolith, 2× bigger than before
  const bodyH = 2.2;
  const body  = new THREE.Mesh(new THREE.BoxGeometry(0.8, bodyH, 0.3), monolithMat);
  body.position.y = bodyH / 2;
  body.castShadow    = true;
  body.receiveShadow = true;
  group.add(body);

  // Glowing blue face panel — the "screen"
  const panelMat = new THREE.MeshStandardMaterial({
    color:             '#051030',
    metalness:         0.4,
    roughness:         0.5,
    emissive:          '#1040c0',
    emissiveIntensity: 1.2,
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.04), panelMat);
  panel.position.set(0, bodyH * 0.50, 0.17);
  group.add(panel);

  // Sit on the table, centred x, just behind the white-side board border
  group.position.set(0, TABLE_TOP_Y, -4.8);

  return group;
}

// ---------- piece highlight system ----------
// Returns { objects, tweens } so the caller can clean up on exit.

const HIGHLIGHT_Y = 0.17; // just above board surface (0.15)

function createHighlights(scene, fromSquare, toSquare) {
  const objects = [];
  const tweens  = [];

  // ── Source ring — pulsing gold torus beneath the piece to move ──
  const ringMat = new THREE.MeshBasicMaterial({
    color:       '#FFD700',
    transparent: true,
    opacity:     0.8,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 24), ringMat);
  const fromPos = squareToPosition(fromSquare);
  ring.position.set(fromPos.x, HIGHLIGHT_Y, fromPos.z);
  ring.rotation.x = -Math.PI / 2; // lay flat on board
  scene.add(ring);
  objects.push(ring);

  tweens.push(
    gsap.to(ringMat, { opacity: 0.2, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  );

  // ── Destination square — semi-transparent glowing plane ──
  const destMat = new THREE.MeshBasicMaterial({
    color:       '#FFD700',
    transparent: true,
    opacity:     0.25,
    depthWrite:  false,
  });
  const dest = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.88), destMat);
  const toPos = squareToPosition(toSquare);
  dest.position.set(toPos.x, HIGHLIGHT_Y, toPos.z);
  dest.rotation.x = -Math.PI / 2;
  scene.add(dest);
  objects.push(dest);

  tweens.push(
    gsap.to(destMat, { opacity: 0.05, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5 }),
  );

  return { objects, tweens };
}

// ---------- scene setup ----------

function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0A0A0A');

  // Ambient fill — bright enough to read dark pieces clearly
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));

  // SpotLight — physical units (candela). Starts at 0, animated to 250 on enter.
  const spotlight = new THREE.SpotLight(0xfff5e0, 0);
  spotlight.position.set(0, 10, 0);
  spotlight.angle   = 0.6;       // ~34° half-angle — tight cone
  spotlight.penumbra = 0.65;     // soft falloff at cone edge
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.set(1024, 1024);
  spotlight.shadow.camera.near = 1;
  spotlight.shadow.camera.far  = 20;
  // target stays at origin (0,0,0) — board centre
  scene.add(spotlight);
  scene.add(spotlight.target);

  scene.add(createBoard());
  scene.add(createTable());
  scene.add(createDeepBlueFigurine());

  return { scene, spotlight };
}

// ---------- camera ----------

function createCamera() {
  const cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  cam.position.set(0, 10, 12);
  cam.lookAt(0, 0, 0);
  return cam;
}

// ---------- scene factory ----------

export function createGameScene(stateManager) {
  let containerEl   = null;
  let renderer      = null;
  let scene         = null;
  let camera        = null;
  let spotlight     = null;
  let rafId         = null;
  let pieceRegistry = null;
  let highlights    = null; // { objects, tweens }

  function setupRenderer() {
    containerEl = document.createElement('div');
    containerEl.id = 'game-container';
    Object.assign(containerEl.style, {
      position:      'fixed',
      inset:         '0',
      opacity:       '0',
      pointerEvents: 'none',
      transition:    'opacity 0.8s ease',
    });
    document.getElementById('app').appendChild(containerEl);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerEl.appendChild(renderer.domElement);

    ({ scene, spotlight } = setupScene());
    camera = createCamera();

    // Place chess pieces if geometries were preloaded
    const geometries = getLoadedGeometries();
    if (geometries && !pieceRegistry) {
      pieceRegistry = placePieces(scene, geometries);
    }

    // Highlight first move: black c7 pawn → c6
    if (!highlights) {
      highlights = createHighlights(scene, 'c7', 'c6');
    }
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    renderer.render(scene, camera);
  }

  function onResize() {
    if (!renderer) return;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  return {
    enter() {
      if (!renderer) setupRenderer();

      window.addEventListener('resize', onResize);
      tick();

      // Light fades in over 2s — spotlight starts at 0 to support re-entry
      spotlight.intensity = 0;
      gsap.to(spotlight, { intensity: 250, duration: 2, ease: 'power2.inOut' });

      // Reveal canvas after one frame so the CSS transition fires
      requestAnimationFrame(() => {
        containerEl.style.opacity      = '1';
        containerEl.style.pointerEvents = 'auto';
      });
    },

    exit() {
      gsap.killTweensOf(spotlight);
      if (highlights) {
        highlights.tweens.forEach((t) => t.kill());
        highlights.objects.forEach((o) => scene.remove(o));
        highlights = null;
      }
      cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener('resize', onResize);
      if (containerEl) {
        containerEl.style.opacity      = '0';
        containerEl.style.pointerEvents = 'none';
      }
      // Renderer, scene, spotlight kept alive — re-entrant (CINEMATIC → GAME)
    },
  };
}
