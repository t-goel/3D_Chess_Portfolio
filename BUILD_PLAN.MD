# Chess Portfolio — Implementation Plan (Scroll-Driven)

This plan is split into phases that build on each other. Each phase produces something visible and testable before moving to the next. Don't skip ahead — each phase depends on the one before it.

---

## Phase 1: Project Setup & Static Scenes (Scene 0 + Scene 1)

**Goal:** Landing page and placard working in the browser. No Three.js yet.

### Steps

https://easings.net/

1. **Initialize the project.** Set up a Vite + vanilla JS project (or Vite + React if you prefer component structure). Install dependencies: `three`, `gsap` (with ScrollTrigger plugin). Set up your file structure:
   ```
   src/
     scenes/
       landing.js       (checkered pattern + name)
       placard.js       (tournament announcement)
       game.js          (empty for now)
       cinematic.js     (empty for now)
       postgame.js      (empty for now)
     game/
       moves.js         (PGN data as structured array)
       state.js         (game state manager — empty for now)
     three/
       board.js         (empty for now)
       pieces.js        (empty for now)
       room.js          (empty for now)
       lights.js        (empty for now)
       camera.js        (empty for now)
     scroll/
       controller.js    (scroll system — empty for now)
       segments.js      (scroll segment definitions — empty for now)
     audio/
       manager.js       (empty for now)
     styles/
       main.css
       landing.css
       placard.css
     main.js            (scene state machine)
   ```

2. **Build the scene state machine.** In `main.js`, create a controller that manages which scene is active: `LANDING → PLACARD → GAME → CINEMATIC → POSTGAME`. Each state has `enter()` and `exit()` methods. Transitions between states are triggered by user actions (click, scroll completion). This architecture prevents spaghetti code and makes each scene independently testable.

3. **Build Scene 0 — The Landing.** Create the full-viewport repeating checkered pattern. Use a CSS approach: a container div with `background-image` using a repeating gradient or a tiled SVG pattern of alternating black (#1a1a1a) and cream (#F0D9B5) squares. The pattern should tile seamlessly at any viewport size — this is not an 8×8 board, it's an infinite motif. Center your name **TANMAY GOEL** using a serif font (Google Fonts: Playfair Display, Cormorant Garamond, or EB Garamond). Add a semi-transparent dark backdrop behind the text (`background: rgba(0,0,0,0.5)` with some padding) so it reads cleanly against the pattern. **SOFTWARE ENGINEER** below in a lighter weight of the same font. Add the *"Click to play"* prompt at the bottom with a CSS pulse animation (opacity cycling or a subtle scale throb). Implement the parallax shift: add a `mousemove` listener that translates the background-position of the checkered pattern by a fraction of the cursor offset from center. Keep the movement subtle — ±10px max.

4. **Build Scene 1 — The Placard.** On click anywhere on the landing, call `stateManager.transition('PLACARD')`. The landing fades out (CSS `opacity` transition, ~0.8 seconds). The placard fades in. Style it as aged paper: warm background (#F5E6C8), a serif font, a subtle CSS `box-shadow: inset 0 0 100px rgba(0,0,0,0.15)` to simulate paper aging. Optionally add a faint paper texture as a background image. Lay out the text centered vertically:
   - "IBM Man-Machine Challenge — May 11, 1997 — Game 6" (smaller, uppercase, tracked)
   - "Match Score: 2½ – 2½" (medium)
   - "Garry Kasparov vs. Deep Blue" (large, bold)
   - "You play as Kasparov." (italic, slightly smaller)
   - "Begin" button below, initially styled as dimmed (`opacity: 0.3`, `pointer-events: none`).

5. **Create the move data file.** In `moves.js`, define the complete game as a structured array. Each entry needs:
   ```js
   export const GAME_MOVES = [
     {
       moveNum: 1,
       white: { piece: 'P', from: 'e2', to: 'e4', capture: false, castle: false, check: false },
       black: { piece: 'P', from: 'c7', to: 'c6', capture: false, castle: false, check: false },
       phase: 'opening',    // which wall this black move reveals
       wall: 'back',        // back, left, right, fourth
       revealIndex: 0       // 0th reveal on this wall (first of 3 on back wall)
     },
     {
       moveNum: 2,
       white: { piece: 'P', from: 'd2', to: 'd4', capture: false, castle: false, check: false },
       black: { piece: 'P', from: 'd7', to: 'd5', capture: false, castle: false, check: false },
       phase: 'opening',
       wall: 'back',
       revealIndex: 1
     },
     // ... continue for all 19 move pairs
     // Move 8: Nxe6 is a capture
     // Move 9: O-O is castling (king e1→g1, rook h1→f1)
     // Move 10: Bg6+ is a check
     // Move 19: white only (c4), black resigns — no black move
   ];
   ```
   Take special care with: move 8 (8. Nxe6 — capture, the knight takes the pawn on e6), move 9 (9. O-O — castling, need to move both king and rook), move 10 (10. Bg6+ — check, Kd8 response), and any other captures throughout the game. Cross-reference the PGN with a chess engine or lichess.org to verify every piece's origin and destination square.

6. **Wire up preloading.** In the placard's `enter()` method, begin loading Three.js assets in the background (this will be implemented properly in Phase 2, but set up the hook now). When loading completes, enable the "Begin" button: set `opacity: 1`, `pointer-events: auto`, add a subtle entrance animation. If loading takes more than 2 seconds, show a loading indicator below the button — a small chess piece icon (use a unicode character ♔ or a small SVG) with a fill animation.

**Deliverable:** The site loads. You see the checkered pattern with your name. Click → placard appears with tournament info. "Begin" button exists but the game scene isn't built yet. Verify the state machine transitions work by logging to console.

---

## Phase 2: Three.js Scene — Board, Table & Lighting

**Goal:** A chess board on a table rendering in Three.js with the pool-of-light effect.

### Steps

1. **Set up the Three.js renderer.** In `game.js`, create: `WebGLRenderer` with `antialias: true`, `alpha: false`. Set `outputEncoding` to `sRGBEncoding` (correct for modern Three.js) or `outputColorSpace = THREE.SRGBColorSpace` if on r152+. Enable shadow maps: `renderer.shadowMap.enabled = true`, `renderer.shadowMap.type = THREE.PCFSoftShadowMap`. Size the renderer to fill the viewport. Append its canvas to a container div that starts hidden (behind the placard).

2. **Set up the camera.** Create a `PerspectiveCamera` with FOV ~50°, aspect ratio matching viewport. Position it at Kasparov's side: this means the camera is on the black side of the board. If the board center is at world origin (0, 0, 0), and white is along -z, black is along +z, then the camera sits at roughly `(0, 5, 8)` looking at `(0, 0, 0)`. Adjust these values until the board fills about 60-70% of the frame with some table and darkness visible around it. Store this position and rotation as constants — this is your "board view" home position that the camera returns to between every wall reveal.

3. **Build the board.** Create a single `BoxGeometry(8, 0.3, 8)` for the board body. For the squares, the most performant approach is a single plane with a checkered texture: generate an 8×8 pixel canvas (each pixel = one square, alternating colors), scale it up with `texture.minFilter = THREE.NearestFilter` and `texture.magFilter = THREE.NearestFilter` to keep the squares sharp. Apply it as a `MeshStandardMaterial` with `map` set to the texture. Use dark wood (#5C3A21) and light cream (#F0D9B5) as the square colors. Add a border: four thin `BoxGeometry` pieces framing the board with a darker wood material (#3E2414). Add algebraic coordinate labels (a-h, 1-8) as small canvas textures on the border — optional for now, add later in polish.

4. **Build the table.** A `BoxGeometry` surface wider and longer than the board (roughly 12 × 0.5 × 10) with four `CylinderGeometry` legs. Apply a wood-toned `MeshStandardMaterial` with slight roughness (~0.7) and low metalness (~0.1). Position the board on top of the table surface. Enable `castShadow` on the board and `receiveShadow` on the table.

5. **Create the pool-of-light effect.** Add a `SpotLight` positioned above the board, pointing straight down. Configure:
   - `intensity`: high enough to clearly illuminate the board (start with 2.0, adjust)
   - `angle`: narrow enough that light falls off before reaching the table edges (~0.6 radians)
   - `penumbra`: 0.5-0.8 for soft falloff
   - `castShadow`: true
   - `shadow.mapSize`: 1024×1024 (balance quality vs. performance)
   Add a very dim `AmbientLight` (intensity ~0.05) so the void isn't absolute black — just very dark.

6. **Wire up the scene transition.** When the "Begin" button is clicked: fade out the placard DOM element, unhide the Three.js canvas container, start the render loop (`requestAnimationFrame`), and animate the spotlight intensity from 0 to full over ~2 seconds (the "light fading in" effect from the user flow). Use GSAP: `gsap.to(spotlight, { intensity: 2, duration: 2, ease: "power2.inOut" })`.

**Deliverable:** Click through landing → placard → Begin → dark screen → a pool of light fades in revealing a chess board on a table. The camera is fixed at Kasparov's position. No pieces, no interactivity. Just the lit board in darkness.

---

## Phase 3: Chess Pieces

**Goal:** All 32 chess pieces on the board in starting position.

### Where to Get Piece Models

**Option A — Download from Sketchfab (recommended).**
Go to sketchfab.com. Search "low poly chess pieces" or "stylized chess set." Filter by "Downloadable." Look for:
- GLB or GLTF format (Three.js native — fastest to load, easiest to use)
- Low triangle count: ideally under 1,000 triangles per piece, definitely under 5,000
- A geometric/stylized aesthetic, not hyper-realistic
- All six piece types (king, queen, bishop, knight, rook, pawn) available in the same visual style
- License: CC-BY (free, give credit) or CC0 (public domain, no credit needed)

Good search terms: "chess set lowpoly glb", "minimal chess pieces", "geometric chess."

Alternative sources: Poly Pizza (poly.pizza, all CC0), CGTrader free section, Turbosquid free section.

**Option C — Procedural in Three.js (fallback).**
Build pieces from combined primitives:
- Pawn: `SphereGeometry` (head) + `CylinderGeometry` (body, tapered) + `CylinderGeometry` (base, wider)
- Rook: `CylinderGeometry` (tower) + `BoxGeometry` (crenelations on top) + `CylinderGeometry` (base)
- Bishop: `CylinderGeometry` (body, tapered) + `SphereGeometry` (top, squished) + small angled cut
- Knight: the hardest — use an `ExtrudeGeometry` from a 2D horse-head shape, or accept a very abstract representation
- Queen: `CylinderGeometry` (body) + `SphereGeometry` (orb on top) + crown points (small cones)
- King: similar to queen but taller with a cross on top (two intersecting `BoxGeometry`)

This is the least visually impressive option but has zero external dependencies. Use `mergeGeometries` from Three.js utils to combine each piece's parts into a single geometry for performance.

### Steps

1. **Load the models.** Import `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader`. Load each piece type once. Store the loaded geometries in a map: `{ king: geometry, queen: geometry, ... }`. Handle loading errors gracefully.

2. **Create materials.** Two materials:
   - White pieces: `MeshStandardMaterial({ color: '#E8D5B7', roughness: 0.6, metalness: 0.1 })` (warm ivory)
   - Black pieces: `MeshStandardMaterial({ color: '#2C2C2C', roughness: 0.5, metalness: 0.15 })` (dark charcoal, NOT pure black)

3. **Create a coordinate system.** Write a function `squareToPosition(squareName)` that converts chess notation ("e4") to world coordinates. The board is 8 units wide, each square is 1 unit. Map file letters (a=0, b=1, ..., h=7) to x positions and rank numbers (1=0, 2=1, ..., 8=7) to z positions. Offset so the board center is at the origin. Account for which side faces the camera — white pieces should be on the far side (ranks 1-2), black pieces on the near side (ranks 7-8) relative to the camera.

4. **Place all 32 pieces.** Create a piece registry — an object or Map that stores `{ squareName: { mesh, pieceType, color } }`. Loop through the starting position and instantiate each piece: clone the loaded geometry, apply the correct material, position it using `squareToPosition()`, add it to the scene. Use `InstancedMesh` for pawns if performance is a concern (8 white pawns share geometry, 8 black pawns share geometry).

5. **Create the Deep Blue figurine.** A small stylized object at the white side of the table representing the computer opponent. Options: a dark metallic monolith (`BoxGeometry` with `MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.8, roughness: 0.2 })`), a small geometric CPU shape, or an abstract angular form. Keep it simple — 1-2 geometries max. Position it opposite the camera, just beyond the edge of the board.

6. **Add piece highlight system.** Create a highlight effect for the piece that moves next. Recommended approach: a glowing ring on the square beneath the piece. Create a `TorusGeometry(0.4, 0.05, 8, 24)` with a `MeshBasicMaterial({ color: '#FFD700', transparent: true, opacity: 0.8 })`. Add a pulsing animation: `gsap.to(ring.material, { opacity: 0.3, duration: 1, yoyo: true, repeat: -1 })`. Similarly, create a destination square indicator — a flat `PlaneGeometry` with a semi-transparent glowing material on the target square. For now, highlight the first black piece to move (c7 pawn) and its destination (c6).

**Deliverable:** The board has all 32 pieces in starting position. The c7 pawn has a glowing ring beneath it and c6 has a destination indicator. Everything looks cohesive. You can still only view from the fixed camera.

---

## Phase 4: Scroll System Foundation

**Goal:** Scrolling triggers events. No animations yet — just the scroll-to-event pipeline.

### Steps

1. **Install and configure GSAP ScrollTrigger.** Register the ScrollTrigger plugin. Create a tall scrollable container: a div with a height tall enough to accommodate all scroll segments. Calculate the height: 36 segments × a per-segment scroll distance (e.g., 300px per segment = 10,800px total, or use `100vh` per segment). The Three.js canvas is `position: fixed` and fills the viewport — it doesn't scroll. The tall div scrolls behind it, and ScrollTrigger maps scroll position to animation progress.

2. **Define scroll segments.** In `segments.js`, create an array of segment definitions:
   ```js
   export const SCROLL_SEGMENTS = [
     { id: 'black-1', type: 'black-move', moveIndex: 0, wall: 'back', revealIndex: 0 },
     { id: 'return-1', type: 'return-to-board', moveIndex: 0 },
     { id: 'black-2', type: 'black-move', moveIndex: 1, wall: 'back', revealIndex: 1 },
     { id: 'return-2', type: 'return-to-board', moveIndex: 1 },
     // ... pattern continues for all 18 black moves
     { id: 'resignation', type: 'resignation' }
   ];
   ```
   Each `black-move` segment triggers: piece animation + camera pan to wall + lighting reveal. Each `return-to-board` segment triggers: camera pan back + Deep Blue auto-move.

3. **Create ScrollTrigger instances for each segment.** Loop through the segments array. For each segment, create a ScrollTrigger that fires `onEnter` when the visitor scrolls past its threshold. Use `snap` behavior: when the visitor scrolls into a segment's range, snap the scroll position to the segment's start so animations play cleanly. Set `pin: true` on the Three.js canvas container so it stays fixed while the scroll container moves.

4. **Build the event dispatcher.** When a ScrollTrigger fires, it dispatches an event to the game state manager: `gameState.handleSegment(segment)`. For now, the handler just logs: `"Triggered: black-move, moveIndex 0, wall: back"`. This verifies the scroll-to-event pipeline works before connecting animations.

5. **Disable scroll-up rewind.** Configure ScrollTrigger so scrolling up does not trigger reverse animations. Set `toggleActions: "play none none none"` so segments only fire on forward scroll. The score sheet sidebar (built later) handles backward jumps.

6. **Add the scroll prompt.** After the board emerges (Phase 2 transition), display a DOM element at the bottom center of the screen: *"Scroll to continue"* with a subtle bouncing arrow animation (CSS `@keyframes`). After the first scroll event fires, fade this prompt out and remove it.

**Deliverable:** The board is visible. A scroll prompt appears. Scrolling triggers console logs for each segment in the correct order. Scrolling up does nothing. The event pipeline is proven and ready for animations.

---

## Phase 5: Move Animations & Camera Choreography

**Goal:** Scrolling moves pieces and pans the camera. The core experience works.

### Steps

1. **Implement piece move animation.** In the game state manager, when a `black-move` segment fires:
   - Identify the piece to move from the move data (piece type + origin square).
   - Look up the piece mesh in the piece registry.
   - Calculate the destination world position using `squareToPosition()`.
   - Animate the piece using GSAP: `gsap.to(piece.position, { x: destX, z: destZ, duration: 0.8, ease: "power2.inOut" })`.
   - Add a subtle vertical arc — the piece rises slightly then comes back down, like being picked up and placed: animate `y` with a custom ease or use a separate tween: `gsap.to(piece.position, { y: 0.5, duration: 0.4, ease: "power2.out", yoyo: true, repeat: 1 })`.
   - Update the piece registry: remove the piece from its old square, assign it to the new square.
   - If it's a capture: identify the captured piece, animate it — either scale to 0 (`gsap.to(capturedPiece.scale, { x: 0, y: 0, z: 0, duration: 0.5 })`) and then remove from scene, or slide it off the board to a "captured pieces" area.
   - Special: castling (move 9, O-O) — animate both the king (e1→g1) and rook (h1→f1) simultaneously.
   - Special: check (move 10, Bg6+) — add a brief camera shake or red flash on the board after the move.

2. **Implement camera pan to wall.** After the piece move animation completes, pan the camera to face the relevant wall. Define wall camera positions:
   - Back wall view: camera at `(0, 3, -6)` looking at `(0, 2, -10)` (facing the back wall head-on)
   - Left wall view: camera at `(6, 3, 0)` looking at `(10, 2, 0)` (facing the left wall)
   - Right wall view: camera at `(-6, 3, 0)` looking at `(-10, 2, 0)` (facing the right wall)
   - Fourth wall view: camera at `(0, 3, 6)` looking at `(0, 2, 10)` (180° turn, facing the wall behind)
   
   These are starting estimates — adjust based on your actual room dimensions and what looks good.

   Animate using GSAP: tween both `camera.position` and a lookAt target simultaneously over ~1.5 seconds with `ease: "power2.inOut"`. Use a helper: instead of directly tweening `camera.rotation` (quaternion math is painful), tween a `lookTarget` vector and call `camera.lookAt(lookTarget)` each frame during the tween.

3. **Implement camera return to board.** When a `return-to-board` segment fires, animate the camera back to the board view home position over ~1.5 seconds. After the camera arrives, auto-play Deep Blue's next white move: same piece animation system, but triggered automatically (no scroll needed). After Deep Blue's move completes, move the highlight ring to the next black piece.

4. **Chain the animations into a timeline.** For each scroll segment, create a GSAP timeline that sequences: piece move → camera pan → (scroll locks here, waiting for next scroll) → camera return → Deep Blue move → highlight next piece. Use ScrollTrigger's `onEnter` to play the appropriate timeline. Ensure the scroll locks (doesn't advance) while animations are playing — set a flag that prevents the next ScrollTrigger from firing until the current timeline completes.

5. **Handle the highlight system updates.** After each full move cycle (black move + return + white move), remove the old highlight ring and destination indicator, then create new ones on the next black piece and its target square. Reference the move data to know which piece moves next.

6. **Update the board state tracking.** After each move, update the piece registry so every piece's current square is accurate. This is critical for later features (score sheet jump, skip to end).

**Deliverable:** The complete game is playable by scrolling. Each scroll triggers a piece move, camera pan to a wall (wall is still dark — no content yet), camera return, and Deep Blue's response. The highlight moves to the next piece. The full 18-move cycle works end to end. This is the core experience without content — verify pacing, camera angles, and animation feel before continuing.

---

## Phase 6: Room Geometry & Wall Reveals

**Goal:** Four walls with content that illuminate as the game progresses.

### Steps

1. **Build the room geometry.** Create four wall planes using `PlaneGeometry`. Size them large enough to feel like room walls — roughly 16 units wide × 8 units tall. Position them:
   - Back wall: `position(0, 4, -10)`, no rotation (faces +z toward the camera)
   - Left wall: `position(10, 4, 0)`, rotated 90° around y-axis (faces -x)
   - Right wall: `position(-10, 4, 0)`, rotated -90° around y-axis (faces +x)
   - Fourth wall: `position(0, 4, 10)`, rotated 180° around y-axis (faces -z)
   
   Add a ceiling: `PlaneGeometry` at `position(0, 8, 0)`, rotated to face downward.
   Add a floor: `PlaneGeometry` at `position(0, 0, 0)`, rotated to face upward.

   Apply a dark material to all surfaces initially: `MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 })`. The walls shouldn't be visible until lit — they blend into the void.

2. **Create the wall lighting system.** For each wall, create one or two `SpotLight` sources positioned to illuminate that wall from above or from the side. All wall lights start at `intensity: 0`. Group them in an object:
   ```js
   const wallLights = {
     back: [spotLight1, spotLight2],
     left: [spotLight3],
     right: [spotLight4, spotLight5],
     fourth: [spotLight6]
   };
   ```
   Each light should cast a warm tone (`color: '#FFF5E6'`). Position them to create an even wash on the wall surface without harsh spots.

3. **Implement the reveal animation.** When a scroll segment triggers a wall reveal (e.g., `wall: 'back', revealIndex: 0`), calculate the reveal intensity: `intensity = (revealIndex + 1) / totalRevealsForWall`. For the back wall with 3 reveals, the first reveal sets lights to 33% intensity, second to 66%, third to 100%. Animate with GSAP: `gsap.to(wallLights.back[0], { intensity: targetIntensity, duration: 1.5, ease: "power2.out" })`. This creates a progressive brightening effect — each move makes the wall a little more visible.

4. **Create wall content using canvas textures.** For each wall, create an offscreen HTML5 `<canvas>` element. Draw the content onto the canvas using the 2D context API:

   **Back wall (About):**
   - Canvas size: 2048 × 1024 pixels (good resolution for a large wall texture)
   - Draw your name large at the top, bio text in the center, education and location details below
   - Use a warm color palette: cream text on a dark warm background, or dark text on a subtly textured surface
   - Divide the canvas into 3 vertical sections (one per reveal). Initially, only the revealed sections are drawn — or draw everything and use a masking approach (a dark overlay that gradually disappears per reveal)

   **Left wall (Skills — Bookshelf):**
   - This wall benefits from actual 3D geometry rather than just a texture. Create a bookshelf: a frame made of `BoxGeometry` pieces (two verticals, three or four horizontal shelves). Books are thin `BoxGeometry` rectangles standing upright on the shelves. Apply canvas textures to the book spines with labels: "React", "Python", "TypeScript", etc.
   - Group books into clusters by category (languages, frameworks, tools). Each reveal lights up one cluster.

   **Right wall (Projects — Gallery):**
   - Create picture frames: `BoxGeometry` rectangles mounted on the wall plane. Each frame has a canvas texture inside showing: project title, a screenshot (loaded as an image and drawn onto the canvas), one-line description, and tech stack.
   - Space frames in a gallery layout — row of frames at eye level (camera level when facing the wall).
   - Each reveal lights up one frame.

   **Fourth wall (Experience — Timeline):**
   - Draw a horizontal timeline line across the wall. At intervals along the line, draw nodes or markers. Each marker has a canvas texture below it: company name/logo, role title, dates, brief description.
   - Each reveal lights up one timeline entry.

5. **Implement content masking per reveal.** To progressively reveal content on a wall, use one of these approaches:
   - **Separate meshes:** Each reveal corresponds to a separate plane/group of objects that starts with `visible: false` and becomes `visible: true` on reveal. This is simplest.
   - **Dynamic texture:** Redraw the canvas texture after each reveal, adding the new content. Call `texture.needsUpdate = true`.
   - **Opacity zones:** Divide the wall into zones, each with its own material. Tween the opacity of each zone on reveal.

   Recommend: separate meshes. Each "reveal unit" is an independent group of meshes. Wall lights illuminate the area, and the meshes become visible. Clean and simple.

6. **Implement the ceiling and floor ambient reveals.** The ceiling and floor content fades in automatically once the room is ~50% revealed (after move 8 or so). Add a subtle tween: their material opacity goes from 0 to 1 over several moves. No dedicated scroll segments needed — just check the current move index in the render loop or after each move.

7. **Adjust camera wall-view positions.** Now that the walls have real content, adjust the camera positions defined in Phase 5 so the content is well-framed when the camera pans. The camera should be close enough to read text but far enough to see the full wall section being revealed. Test each wall and fine-tune.

**Deliverable:** The full game loop now reveals actual content. Scrolling through the game shows pieces moving, the camera panning to walls with real content lighting up, and the camera returning to the board. The room goes from void to fully illuminated study by the end. This is the first time the experience feels real.

---

## Phase 7: The Cinematic Ending (Scene 8)

**Goal:** The resignation, blackout, and "Your move" cinematic.

### Steps

1. **Trigger the resignation.** After the final scroll segment: Deep Blue plays 19. c4 automatically. After the animation completes, pause for 2 seconds (use `gsap.delayedCall(2, callback)`). Then update the score sheet sidebar with "Black resigns."

2. **Cut the sound.** If audio is implemented (Phase 10), stop all audio sources immediately — no fade, a hard cut. If audio isn't implemented yet, leave a hook for it: `audioManager.silenceAll()`.

3. **Fade the room to black.** Create a GSAP timeline:
   ```js
   const resignationTimeline = gsap.timeline();
   resignationTimeline
     .to(allLights, { intensity: 0, duration: 3, ease: "power2.in" })  // all room lights dim
     .to(boardSpotlight, { intensity: 0, duration: 2 }, "-=2")         // board light dims too
     .to(canvasContainer, { opacity: 0, duration: 1 }, "-=1");         // canvas fades to transparent
   ```
   Behind the canvas, have a black div that's now visible.

4. **Hold pure black.** After the fade completes, wait 2.5 seconds. The visitor sees nothing. This silence and void is intentional.

5. **Build the cinematic DOM overlay.** Create a full-screen div with a sepia-toned background (matching the placard). Use GSAP timeline to animate text in:
   ```js
   const cinematicTimeline = gsap.timeline();
   cinematicTimeline
     .from(line1, { opacity: 0, duration: 1.5 })        // "On May 11, 1997..."
     .to({}, { duration: 2.5 })                           // hold
     .from(line2, { opacity: 0, duration: 1.5 })          // "For the first time..."
     .to({}, { duration: 2.5 })                           // hold
     .from(line3, { opacity: 0, duration: 1.5 })          // "The age of the machine..."
     .to({}, { duration: 3 })                              // longer hold
     .to(sepiaBackground, { opacity: 0, duration: 1.5 })  // sepia fades away
     .from(modernSection, { opacity: 0, duration: 1.5 })  // modern style fades in
     .from(yourMove, { opacity: 0, y: 20, duration: 1 })  // "Your move" with slight rise
     .from(contactInfo, { opacity: 0, duration: 1 }, "+=0.5")
     .from(buttons, { opacity: 0, duration: 1 }, "+=0.3");
   ```
   Style the sepia lines in the same serif font as the placard, warm tones. Style "But the game is never over." and "Your move." in a modern sans-serif (Inter, Neue Haas Grotesk, or similar), neutral/cool white background, strong contrast.

6. **Play the resolve tone.** When "Your move" appears, play a single audio note. A soft piano key or warm synth pad, ~2 seconds long, fading naturally. Use `new Audio('resolve-tone.mp3').play()` or the Web Audio API if the audio system is built.

7. **Wire up buttons.** "Return to the board": triggers state transition to POSTGAME — restores the Three.js scene with full room illumination and enables orbit controls (Phase 8). "View resume": `window.open('resume.pdf', '_blank')`.

**Deliverable:** Complete the game by scrolling to the end. Experience: resignation → room dims → black void → sepia text sequence → "Your move" with contact info. Both buttons work (the "Return to the board" button enters post-game state).

---

## Phase 8: Post-Game Free Roam & Interactivity

**Goal:** The room is a navigable, interactive portfolio space.

### Steps

1. **Enable orbit controls.** Import `OrbitControls` from Three.js examples. In the POSTGAME state's `enter()` method: create OrbitControls, set the target to the board center, clamp polar angle (min: ~10°, max: ~80°), set min/max distance, enable damping. This is the first time the visitor has manual camera control.

2. **Restore the scene.** When entering POSTGAME: set all wall lights to full intensity, set the board spotlight to full, set the canvas container opacity to 1. Position the camera at the board view home position and let the visitor orbit from there. Remove the scroll container (scrolling is no longer the interaction model).

3. **Remove the DOM sidebar.** The score sheet sidebar disappears. The persistent DOM elements (mute button, etc.) remain.

4. **Add raycaster interaction system.** Create a `Raycaster` and a mouse/click handler. On click, cast a ray from the camera through the click point. Check for intersections with interactive objects. Build an interaction registry: a list of meshes and their associated callbacks.

5. **Make project frames clickable.** Register each project frame mesh in the interaction registry. On click: animate the camera to zoom into the frame (`gsap.to(camera.position, { ... })` moving close to the frame, `gsap.to(lookTarget, { ... })` focusing on the frame center). Display a DOM overlay panel with detailed project info: title, full description, screenshots, tech stack, links. Style it as a semi-transparent panel over the 3D scene. Add a close button and Escape key handler that dismisses the panel and returns the camera to its previous position.

6. **Make bookshelf spines clickable.** Register each book spine mesh. On click: `window.open(url, '_blank')` to open the relevant GitHub repo or documentation. Add a hover effect: on mouseover (raycast in the `mousemove` handler), slightly tilt the book outward or add a glow (swap material to one with `emissive`).

7. **Make timeline entries clickable.** Register each timeline entry. On click: expand the entry — either animate the entry mesh to grow and reveal more detail (complex) or show a DOM overlay panel similar to the project detail view (simpler, recommended).

8. **Make the chess clock clickable.** Update the clock face canvas texture to display "Your Move." Register the clock mesh. On click: transition to the cinematic contact screen (reuse the cinematic from Phase 7 — skip the sepia text, go straight to "Your move" and contact info).

9. **Make the envelope clickable.** Add an emissive glow to the envelope material (subtle pulse). Register the envelope mesh. On click: same as clock — transition to the cinematic contact screen.

10. **Make the 3D score sheet interactive.** Register click zones on the score sheet (one per move entry). On click: identify the move entry clicked, brighten the corresponding wall section's lights briefly (flash up then back down), and gently tween the camera to face that wall.

**Deliverable:** After the cinematic, clicking "Return to the board" puts you in the room with free orbit. You can click projects for details, click books for links, click timeline entries to expand, click the clock or envelope to reach contact info. The room is a fully functional portfolio.

---

## Phase 9: Score Sheet Sidebar & Navigation

**Goal:** The DOM sidebar provides navigation during gameplay.

### Steps

1. **Build the sidebar DOM element.** A div docked to the left or right edge of the screen, ~200-250px wide. Dark background with slight transparency (`rgba(0,0,0,0.8)`). Styled to match the chess aesthetic: serif font, cream text, a subtle chess-piece icon at the top.

2. **Populate the sidebar dynamically.** As each move is made (both white and black), append an entry to the sidebar. White moves show just the notation (e.g., "1. e4"). Black moves show the notation AND a section label (e.g., "1... c6 — About"). Use different text colors or weights to distinguish white and black moves.

3. **Make entries clickable.** Each black move entry is a clickable link. On click:
   - Determine the target move index.
   - Compute the board state at that move: you need to know where every piece is after that move. Pre-compute and store board state snapshots after each move during normal gameplay, OR compute it on demand by replaying moves from the start position.
   - Animate all pieces to their correct positions simultaneously (not one at a time — slide everything at once).
   - Set the room illumination to match: all walls up to the target move's phase are lit, walls after are dark.
   - Update the scroll position to match the target segment.
   - Update the move counter.
   This is the most complex navigation logic in the project. The board state snapshots approach is much simpler to implement — store them during the initial scroll-through.

4. **Handle forward vs. backward jumps.** Jumping forward: animate pieces to target positions, reveal all walls up to that point. Jumping backward: animate pieces backward to target positions, dim walls that are beyond the target point. Both directions should use the same snapshot system.

5. **Add the move counter.** A small DOM element in a corner showing "7 / 18" — the current black move out of 18 total. Updates after each move.

6. **Sidebar visibility rules.** The sidebar is visible only during gameplay (GAME state). It disappears when entering the CINEMATIC or POSTGAME states.

**Deliverable:** During gameplay, the sidebar fills in as you scroll through the game. Clicking any entry jumps the game to that state correctly — board position, room illumination, and scroll position all update. The move counter tracks progress.

---

## Phase 10: Sound Design

**Goal:** Full soundscape implementation.

### Steps

1. **Build the audio manager.** Create a class that manages: ambient loop layers, one-shot sound effects, master volume, and mute state. Use the Web Audio API directly or through Tone.js (install with npm). The audio context must be created after a user gesture — use the "Click to play" on the landing page or the "Begin" button on the placard. Store a reference: `audioContext = new AudioContext()`.

2. **Source or create sounds.** You need these audio files:
   - `clock-tick.mp3` — a short, clean clock tick (loopable or triggered on interval)
   - `piece-click.mp3` — wooden piece placement sound, warm and short (~0.3s)
   - `machine-whir.mp3` — electronic/mechanical sound for Deep Blue's moves (~0.5s)
   - `ambient-hum.mp3` — low-frequency warm drone (loopable, ~10-30 seconds)
   - `ambient-full.mp3` — richer ambient pad (loopable, ~10-30 seconds)
   - `tension-layer.mp3` — slightly dissonant or faster-pulsing layer (loopable)
   - `resolve-tone.mp3` — single warm note for "Your move" (~2-3 seconds)

   Sources: Freesound.org (CC-licensed, huge library), Pixabay Audio (royalty-free), ZapSplat (free with attribution). Search: "clock tick clean", "chess piece wood", "servo motor short", "ambient drone warm", "tension build subtle".

   Alternative: generate sounds with Tone.js synthesizers for a consistent electronic aesthetic. A clock tick is a short `MetalSynth` hit. An ambient hum is a low `FMSynth` note with slow LFO.

3. **Implement the evolving soundscape.** Map move indices to audio layer volumes:
   ```
   Moves 1-3:  clock tick volume 0.3, everything else 0
   Moves 4-7:  clock tick 0.3, ambient hum fades to 0.2
   Moves 8-13: clock tick 0.3, ambient hum 0.2, ambient full fades to 0.3
   Moves 14-18: clock tick 0.5 (louder), ambient hum 0.2, ambient full 0.3, tension fades to 0.2
   Resignation: ALL volumes → 0 instantly (hard cut, no fade)
   Post-game: gentle ambient only, volume 0.15
   ```
   After each move, check the current move index and tween the appropriate layer volumes using GSAP or the Web Audio API's `linearRampToValueAtTime`.

4. **Implement move sounds.** On each black move (scroll trigger): play `piece-click.mp3` as a one-shot. On each white move (Deep Blue auto-play): play `machine-whir.mp3`. These are fire-and-forget — create an `AudioBufferSourceNode`, connect it to the output, and start it.

5. **Implement the mute toggle.** The mute button in the DOM corner sets `audioContext.suspend()` when muting and `audioContext.resume()` when unmuting. Or set the master gain node to 0. Store the mute state in a variable so it persists across scene transitions.

6. **Implement the light temperature audio cue (optional).** During Deep Blue's moves, add a subtle low-pass filter on the ambient layers to make the sound feel "colder." Remove the filter on the visitor's turns. This is polish — skip it if time is tight.

**Deliverable:** Play through the game with sound on. The clock ticks from the start. The soundscape evolves from sparse to full. Piece sounds are distinct between black and white. The resignation is silent. The resolve tone plays at "Your move." Muting works.

---

## Phase 11: DOM UI & Quality of Life

**Goal:** Skip, auto-play, help, and polish the DOM layer.

### Steps

1. **Build the persistent DOM overlay.** A transparent div layered over the Three.js canvas with `pointer-events: none` (so clicks pass through to the canvas). Individual controls inside it have `pointer-events: auto`. Position controls in corners:
   - Top-right: mute button (speaker icon — use a simple SVG or unicode 🔊/🔇), skip link ("Skip" in small, light-gray text)
   - Bottom-right: move counter ("7 / 18")
   - Bottom-center: scroll prompt (visible initially, fades after first scroll)

2. **Implement the skip function.** On click:
   - Compute the final board state (all pieces at their move-19 positions). Use the pre-computed snapshots from Phase 9.
   - Animate all pieces to final positions simultaneously (quick, ~0.5 seconds).
   - Set all wall lights to full intensity.
   - Set the game state to complete.
   - Skip the cinematic — go directly to post-game free roam (the visitor who clicks skip doesn't want to watch text fade in).
   - Or optionally: jump to the cinematic but with a "Skip" option there too.

3. **Implement auto-play.** A toggle button (play/pause icon). When active, fire scroll events on a timer: every 3-4 seconds, advance one scroll segment. This makes the game play itself like a cinematic film. The visitor can toggle it off at any time. If they manually scroll during auto-play, auto-play disengages. Implement with `setInterval` that calls a `advanceOneSegment()` function.

4. **Add the first-time help hint.** On first visit (use a simple JS variable — NOT localStorage), show a semi-transparent overlay after the board emerges: "Scroll to advance the game" with a downward arrow icon. Dismiss on click, scroll, or after 5 seconds.

5. **Add cursor feedback.** During post-game, change the cursor to `pointer` when hovering over interactive objects (detected by continuous raycasting on `mousemove`). During gameplay, the cursor stays default since nothing is clickable.

**Deliverable:** All utility controls work. Skip jumps to the end. Auto-play runs the game hands-free. The help hint appears once. Cursor changes on hover in post-game.

---

## Phase 12: Table Props

**Goal:** The score sheet (3D), envelope, coffee mug, and clock are detailed and functional.

### Steps

1. **Build the 3D score sheet.** A flat `PlaneGeometry` (~1.5 × 2 units) on the table to the left of the board, slightly angled. Apply a canvas texture: draw a cream/white background with faint horizontal lines (like lined paper). As the game progresses, draw move notation onto the canvas after each move and update the texture. Use a handwritten-style or monospace font. This is a visual prop during gameplay but becomes interactive in post-game (Phase 8 already set up the interaction).

2. **Build the envelope.** A flat rectangle with a triangular flap — two `PlaneGeometry` pieces or a custom `Shape` + `ExtrudeGeometry`. Apply a warm paper material (`MeshStandardMaterial({ color: '#D4C4A8', roughness: 0.9 })`). Position it on the table near the board. During post-game, add a pulsing emissive glow: `gsap.to(envelope.material, { emissiveIntensity: 0.5, duration: 1.5, yoyo: true, repeat: -1 })`.

3. **Build the coffee mug.** A `CylinderGeometry` body with a `TorusGeometry` handle (half torus). Apply a ceramic material: `MeshStandardMaterial({ color: '#F5F0E8', roughness: 0.4, metalness: 0.05 })`. Optionally add dark "coffee" inside using a dark disc at the top of the cylinder. This is atmosphere only, never interactive.

4. **Detail the chess clock.** Refine the clock model from Phase 4 (if built) or build it now. Two faces: flat planes with canvas textures. One face shows the move counter ("7 / 18") — update the canvas after each move. The other face shows "Your Turn" during the game (or is blank) and "Your Move" in post-game. Add a button on top: a small `CylinderGeometry` protruding slightly. The clock's material should look like dark wood or black plastic: `MeshStandardMaterial({ color: '#2A2A2A', roughness: 0.7 })`.

**Deliverable:** The table looks complete and lived-in. The clock updates with move numbers. The score sheet fills in as the game progresses. The envelope glows in post-game. The mug is just there looking good.

---

## Phase 13: Mobile Fallback

**Goal:** A functional portfolio on mobile devices.

### Steps

1. **Add device detection.** At the very start of `main.js`, before any Three.js loading: check `window.innerWidth < 768` or `'ontouchstart' in window` (or both). If mobile, skip the entire Three.js pipeline and serve the fallback.

2. **Build the mobile landing.** Reuse the checkered pattern from Scene 0, optimized for portrait orientation. Your name and title centered. Instead of "Click to play," use "Scroll to explore" or go directly to the portfolio.

3. **Build the mobile portfolio page.** A single-page scrollable layout with sections:
   - **About** — bio, location, personal detail (matches back wall content)
   - **Skills** — tech stack in a clean list or grid layout
   - **Projects** — project cards with screenshots, descriptions, tech stacks, links
   - **Experience** — timeline or stacked entries with company, role, dates
   - **Contact** — "Your move" header, email, LinkedIn, GitHub, contact form

   Style it with the chess aesthetic: checkered pattern borders between sections, chess piece unicode icons (♔ ♕ ♗ ♘ ♖ ♙) as decorative elements, the same serif font (Playfair Display), cream/dark brown color scheme, sepia accents.

4. **Add the desktop prompt.** A slim banner at the top: *"Visit on desktop for the full experience."* Not aggressive. Style it subtly with a light background and a dismiss button.

5. **Ensure the mobile page is SEO-friendly.** Use semantic HTML (`<section>`, `<h1>`, `<article>`), proper meta tags, Open Graph tags for social sharing, and a meta description. The mobile page is what search engines will index — the Three.js scene is invisible to crawlers.

**Deliverable:** On a phone or in a narrow browser window, the site shows a clean, chess-themed scrollable portfolio. Everything is readable and functional. No Three.js loads.

---

## Phase 14: Design Refinement

**Goal:** Visual coherence and polish across the entire experience.

### Steps

1. **Establish a unified color palette.** Define exact hex values and use them consistently:
   - Board light squares: #F0D9B5
   - Board dark squares: #B58863
   - Wood/table: #5C3A21
   - Sepia/paper: #F5E6C8
   - Dark void: #0A0A0A
   - Text (warm): #E8D5B7
   - Text (modern): #FAFAFA
   - Accent/highlight: #FFD700 (gold for piece highlights)
   - Deep Blue cold: #4A7FBF (subtle blue for machine moves)

2. **Establish typography.** Choose and lock your font pairing:
   - Serif (historical/chess elements): Playfair Display or Cormorant Garamond
   - Sans-serif (modern/contact elements): Inter or DM Sans
   - Monospace (score sheet): JetBrains Mono or IBM Plex Mono
   
   Define size scale: use consistent sizes across DOM elements and canvas textures.

3. **Refine wall content layout.** Review each wall's canvas texture at actual in-game reading distance. Is the text large enough? Are margins sufficient? Is there enough contrast? Redraw canvases as needed. Consider adding subtle decorative elements: thin borders, section dividers, small icons.

4. **Refine the bookshelf (left wall).** Ensure books have varied heights and colors for visual interest. Add small details: a bookend, a tilted book, a small plant. These are just extra `BoxGeometry` pieces but they sell the environment.

5. **Refine the project gallery (right wall).** Ensure frame sizes are proportional to project importance. Add subtle shadows under frames (small dark planes behind them, offset slightly). Verify screenshots are readable at camera distance.

6. **Refine the experience timeline (fourth wall).** Ensure dates, roles, and descriptions are clearly laid out. Add connecting lines between entries. Consider adding company logos as loaded textures.

7. **Refine the cinematic ending.** Test the text timing — does each line have enough time to land? Is the transition from sepia to modern dramatic enough? Adjust the GSAP timeline durations. Test with fresh eyes (show someone who hasn't seen it before).

8. **Add material refinement.** Add subtle normal maps or bump maps to the table (wood grain), walls (plaster texture), and floor. These are small texture files that add significant visual depth without extra geometry. Source free normal maps from sites like ambientCG.com (CC0).

9. **Review lighting across all phases.** Play through the entire game and check: are any walls too bright or too dim? Do the light temperature shifts feel natural? Is the pool-of-light effect on the board dramatic enough? Adjust light intensities, angles, and colors.

10. **Add subtle fog.** `scene.fog = new THREE.FogExp2('#0A0A0A', 0.03)` — this adds depth to the void and makes the room reveal feel more dramatic as things emerge from the fog.

**Deliverable:** The entire experience has a cohesive, polished visual identity. Colors, fonts, materials, and lighting all work together. The mood is consistent from landing to post-game.

---

## Phase 15: Performance Optimization

**Goal:** Smooth 60fps on standard hardware.

### Steps

1. **Profile the scene.** Open Chrome DevTools → Performance tab. Record a scroll-through of the entire game. Look for: frame drops below 30fps, long frame times, excessive draw calls, memory leaks.

2. **Optimize geometry.**
   - Verify all pieces use `BufferGeometry` (default in modern Three.js).
   - Use `InstancedMesh` for repeated pieces: all white pawns share one instanced mesh, all black pawns share another. Same for rooks, bishops, knights. This reduces draw calls from 32 to ~12.
   - Merge static geometry where possible: the table and its legs can be merged into one geometry. The board frame can be merged. Use `BufferGeometryUtils.mergeGeometries()`.
   - Check total triangle count: aim for under 50,000 total for the entire scene.

3. **Optimize lighting.**
   - Limit active shadow-casting lights to 2-3. Not every wall light needs to cast shadows — only the board spotlight and perhaps one wall light. Other wall lights can have `castShadow: false`.
   - Use `shadow.mapSize` of 512×512 for wall lights, 1024×1024 for the board spotlight.
   - When a wall is fully revealed and the camera has moved on, consider reducing its light intensity slightly to save GPU.

4. **Optimize textures.**
   - Compress all texture images with a tool like Squoosh (squoosh.app). Use WebP format where supported.
   - Limit canvas texture sizes: 2048×1024 is fine for major walls, use 1024×512 for smaller elements.
   - Use `texture.dispose()` for textures that are no longer needed.

5. **Optimize the render loop.**
   - Set `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to cap retina rendering. A 3x retina display renders 9x the pixels — capping at 2x is a huge performance save with barely visible quality loss.
   - Only render when something changes. During moments when the camera is static and no animations are playing, skip `renderer.render()` calls. Use a dirty flag set by animations and orbit controls.
   - Disable orbit controls' damping update when in gameplay (no orbit exists, no need to compute).

6. **Lazy-load wall content.** Don't create all four walls' content textures at startup. Create them on demand: when the game approaches a wall's phase, generate that wall's canvas textures and geometry. This speeds up initial load time.

7. **Optimize asset loading.**
   - Use GLB (binary glTF) for models — smaller than text-based GLTF.
   - Compress GLB files with gltf-transform or glTF-Pipeline.
   - Load piece models and audio files during the placard screen (Scene 1) while the visitor reads the tournament info. Show the loading indicator if needed.
   - Total initial download target: under 3MB for the board, pieces, and essential textures. Wall content loads progressively.

8. **Test on target hardware.**
   - Mid-range laptop with integrated graphics (Intel Iris or similar)
   - MacBook Air (Apple Silicon — generally good but check thermal throttling)
   - A gaming desktop (should run flawlessly)
   - Chrome, Firefox, Safari — verify all three

   Target: solid 60fps with no drops below 30fps on the mid-range laptop.

9. **Add a performance fallback.** If `renderer.info.render.triangles` is above a threshold or if frame time exceeds 33ms consistently, automatically reduce quality: lower shadow map resolution, disable fog, reduce pixel ratio to 1.

**Deliverable:** The full experience runs at 60fps on a standard laptop. Loading is fast. No jank during scroll animations or camera pans. Memory usage is stable.

---

## Phase 16: Final Polish & Launch Prep

**Goal:** Last details, testing, and deployment.

### Steps

1. **Add animation polish.**
   - Piece move arcs: ensure every piece rises slightly during its move for a "picked up and placed" feel.
   - Camera pans: verify all 18 pan-to-wall and pan-to-board transitions feel smooth with no jarring snaps.
   - Lighting reveals: ensure the progressive brightening feels organic, not steppy.
   - Scroll snap: verify the snap behavior feels natural — not too aggressive (locks you up) or too loose (animations start halfway).

2. **Add visual effects (optional, performance permitting).**
   - Dust motes in the spotlight beam: a simple particle system using `Points` with small transparent sprites, slowly drifting.
   - Vignette post-processing: darken the screen edges slightly for a cinematic feel. Use Three.js `EffectComposer` with a vignette shader, OR a simpler CSS approach: a div overlay with `box-shadow: inset 0 0 150px rgba(0,0,0,0.5)` and `pointer-events: none`.
   - Subtle idle camera drift in post-game: if the visitor hasn't interacted for 30 seconds, start a very slow auto-orbit. Stop immediately on any input.

3. **Cross-browser testing.** Test in Chrome, Firefox, Safari, and Edge. Three.js generally works well across browsers but verify: WebGL context creation, GSAP animations, audio playback, and scroll behavior.

4. **Accessibility check.** Ensure the score sheet sidebar entries are keyboard-accessible (Tab + Enter to jump). The skip link should be the first Tab-focusable element for keyboard users. The mute button should have an aria-label. The mobile fallback should be fully accessible. Add a visually-hidden `<h1>` with your name for screen readers that's present on the page even when the Three.js scene is active.

5. **SEO setup.** Add meta tags: title, description, Open Graph (for social sharing previews — use a screenshot of the board as the OG image), canonical URL. The mobile fallback is your SEO content — search engines will index that. Add structured data (JSON-LD) with your name, job title, and contact info.

6. **Deploy.** Host on Vercel, Netlify, or Cloudflare Pages — all support Vite builds out of the box and have generous free tiers. Set up a custom domain. Verify the build output: the production bundle should be optimized (Vite does this automatically with `vite build`).

7. **Final playthrough.** Do a complete start-to-finish playthrough on the deployed site. Check: landing loads fast, placard shows, Begin works, all 18 scroll steps play correctly, all walls reveal, resignation sequence plays, cinematic timing feels right, "Return to the board" works, post-game interactions work, mobile fallback works. Have at least one other person test it cold (no context about how it works).

**Deliverable:** The site is live, polished, and performing well. Ready to share.

---

## Summary — Build Order & Estimates

| Phase | What You Get | Est. Effort |
|-------|-------------|-------------|
| 1. Setup & Static Scenes | Landing + placard + project structure | 1 day |
| 2. Board & Table | 3D board with pool-of-light | 1-2 days |
| 3. Chess Pieces | 32 pieces on the board | 2-3 days |
| 4. Scroll System | Scroll-to-event pipeline | 2-3 days |
| 5. Move Animations & Camera | Pieces move, camera pans | 3-4 days |
| 6. Room & Wall Reveals | Content appears on walls | 4-5 days |
| 7. Cinematic Ending | Resignation + "Your move" | 2-3 days |
| 8. Post-Game Interactivity | Clickable room with orbit | 3-4 days |
| 9. Score Sheet & Nav | Sidebar + jump navigation | 2-3 days |
| 10. Sound Design | Full soundscape | 2-3 days |
| 11. DOM UI & QoL | Skip, auto-play, help | 1-2 days |
| 12. Table Props | Clock, sheet, envelope, mug | 1-2 days |
| 13. Mobile Fallback | Static portfolio | 2-3 days |
| 14. Design Refinement | Visual polish & coherence | 3-4 days |
| 15. Performance Optimization | Smooth 60fps everywhere | 2-3 days |
| 16. Final Polish & Launch | Testing, deploy, launch | 2-3 days |
| **Total** | | **~33-48 days** |

Working part-time (a few hours daily), this is roughly 2-3 months. A focused full-time push could compress it to 4-6 weeks.

### Critical Path

The phases that matter most for proving the concept are **1 through 5**. Once scroll → piece movement → camera pan → return works smoothly, you know the idea works and everything else is content and polish. Get there as fast as possible.