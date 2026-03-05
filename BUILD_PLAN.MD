# Chess Portfolio — Implementation Plan

This plan is split into phases that build on each other. Each phase produces something visible and testable before moving to the next. Don't skip ahead — each phase depends on the one before it.

---

## Phase 1: Project Setup & Static Scenes (Scene 0 + Scene 1)

**Goal:** Landing page and placard working in the browser. No Three.js yet.

### Steps

1. **Initialize the project.** Set up a Vite + vanilla JS project (or Vite + React if you prefer component structure). Install Three.js as a dependency but don't use it yet. Set up your file structure:
   ```
   src/
     scenes/
       landing.js
       placard.js
       game.js        (empty for now)
       cinematic.js   (empty for now)
     game/
       moves.js       (the PGN data)
     audio/           (empty for now)
     styles/
     main.js
   ```

2. **Build Scene 0 — The Landing.** Create the full-viewport checkered pattern using CSS grid or a canvas element. 8×8 grid of alternating black and cream squares is simplest. Add your name "TANMAY GOEL" centered with a serif font (use Google Fonts — Playfair Display or Cormorant Garamond work well for this aesthetic). "SOFTWARE ENGINEER" below it in a lighter weight. Add the "Click to play" prompt at the bottom with a subtle pulse animation. Implement the parallax shift on mouse move — each square translates slightly based on cursor position using a mousemove event listener. Keep this lightweight — pure CSS and minimal JS.

3. **Build Scene 1 — The Placard.** On click, fade out the checkered pattern (CSS transition, opacity over ~0.8 seconds). Fade in the sepia placard. Style it like aged paper — use a warm background color (#F5E6C8 or similar), a serif font, and maybe a subtle CSS box-shadow to simulate paper edges. Lay out the text: "IBM Man-Machine Challenge — May 11, 1997 — Game 6" / "Match Score: 2½ – 2½" / "Garry Kasparov vs. Deep Blue" / "You play as Kasparov." Add the "Begin" button, initially dimmed with `pointer-events: none`. This button will activate once Three.js loads in a later phase.

4. **Create the move data file.** In `moves.js`, define the complete game as a structured array:
   ```js
   export const GAME_MOVES = [
     { moveNum: 1, white: { piece: 'P', from: 'e2', to: 'e4' }, black: { piece: 'P', from: 'c7', to: 'c6' } },
     { moveNum: 2, white: { piece: 'P', from: 'd2', to: 'd4' }, black: { piece: 'P', from: 'd7', to: 'd5' } },
     // ... all 19 move pairs
   ];
   ```
   Include the piece type, origin square, destination square, and any special flags (capture, castling for move 9 where white castles kingside, check for move 10 Bg6+). This file is the single source of truth for the entire game.

5. **Set up scene transitions.** Build a simple state machine in `main.js` that manages which scene is active: LANDING → PLACARD → GAME → CINEMATIC → POSTGAME. Each state has an enter/exit function. This architecture will save you from spaghetti code later.

**Test:** You should be able to load the site, see the checkered landing with your name, click to see the placard, and click "Begin" (which for now just logs a message or shows an alert since the game scene doesn't exist yet).

---

## Phase 2: Three.js Scene — Board & Table

**Goal:** A chess board on a table rendering in Three.js with orbit controls.

### Steps

1. **Set up the Three.js scene.** In `game.js`, create the renderer (WebGLRenderer with antialias), scene, and camera (PerspectiveCamera). Set the renderer to fill the viewport. Use a dark/black background. Add the renderer's canvas to the DOM but keep it hidden behind the placard for now.

2. **Build the board.** The board is a flat box geometry (BoxGeometry) — thin and wide. Create 64 squares as individual plane meshes or, more efficiently, as a single plane with a texture. The texture approach is better for performance: create an 8×8 checkered texture (either as a loaded image or generated with canvas) and apply it to a single flat box. Use a dark wood color (#5C3A21) and light cream (#F0D9B5) for the squares. Add a border/frame around the board using four thin box geometries with a darker wood material.

3. **Build the table.** A simple box or cylinder underneath the board. Doesn't need to be complex — a wooden surface (BoxGeometry, wider than the board) with four legs (thin CylinderGeometry). Apply a wood-toned MeshStandardMaterial. The table exists to ground the board in physical space and give the room a "center."

4. **Set up lighting.** Start with a single overhead spotlight (SpotLight) pointing down at the board. This is your "pool of light" effect. Set the spotlight's angle, penumbra (soft edges), and intensity so the board is well-lit and the area around it falls off into darkness. Add a dim ambient light (AmbientLight, very low intensity) so the rest of the scene isn't pure black — just dark enough to feel like a void. Enable shadows on the spotlight and the board/table to ground everything.

5. **Set up OrbitControls for testing.** Import OrbitControls from Three.js examples. Configure it: enable rotation, disable panning (translateEnabled = false), clamp polar angle (minPolarAngle and maxPolarAngle) to keep the camera between ~10° and ~80° above the table. Set a min and max distance. Enable damping for smooth rotation. Set the target to the center of the board. This is your "free mode" camera. You'll add the locked mode toggling later.

6. **Wire up the placard → game transition.** When the Three.js scene is fully loaded (all geometries and materials created), enable the "Begin" button on the placard. On click, fade out the placard, reveal the Three.js canvas, and start the render loop.

**Test:** Click through landing → placard → a lit chess board on a table in 3D that you can orbit around. No pieces yet, just the board.

---

## Phase 3: Chess Pieces

**Goal:** All 32 chess pieces on the board in starting position.

### Where to Get Piece Models

You have three options, ordered by recommendation:

**Option A — Download low-poly models (recommended).** Search these sources:
- **Sketchfab** (sketchfab.com): Search "low poly chess pieces" or "stylized chess set." Filter by "Downloadable" and check the license (many are CC-BY or free for personal use). Look for sets that come as individual pieces (king, queen, bishop, knight, rook, pawn separately). Download in GLTF/GLB format — this is Three.js's native format and loads fastest.
- **Poly Pizza** (poly.pizza): Free low-poly models, all CC0 (public domain). Search "chess." Quality varies but the price is right.
- **Turbosquid** (turbosquid.com): Has free sections. Search "chess pieces low poly." Check licenses carefully.
- **CGTrader** (cgtrader.com): Similar to Turbosquid, has free low-poly options.

  When downloading, look for: GLB/GLTF format, under 5000 triangles per piece (ideally under 1000), a style that's geometric/clean rather than hyper-detailed, and a set where all six piece types are available in the same style.

**Option B — Build them in Blender.** If you know Blender or want to learn, modeling low-poly chess pieces is a great beginner project. Each piece is essentially a lathe/revolution shape: draw a 2D profile (silhouette of a pawn, bishop, etc.) and spin it 360°. Reduce polygon count by using fewer profile points. Export as GLB. This gives you complete creative control and zero licensing concerns. There are dozens of YouTube tutorials for "blender chess pieces low poly" that walk through this in 1-2 hours.

**Option C — Build them procedurally in Three.js.** Combine basic geometries in code: a pawn is a sphere on top of a tapered cylinder on top of a wider cylinder base. A rook is a cylinder with a crenelated top (small boxes). A bishop is a tall tapered cylinder with an angled cut (a clipping plane or CSG operation). A knight is the hardest — skip this approach if you want a recognizable horse head. This approach is the most limited aesthetically but has zero external dependencies.

### Steps

1. **Load or create the piece models.** If using downloaded GLTF models, use Three.js's GLTFLoader. Load each piece type once and clone it for multiples (8 pawns, 2 rooks, etc.). If building procedurally, create a function for each piece type that returns a Group of merged geometries.

2. **Set up materials.** Create two materials: one for white pieces (light cream/ivory MeshStandardMaterial, slight roughness) and one for black pieces (dark charcoal or deep brown, not pure black — pure black kills surface detail). Apply the correct material to each piece based on its side.

3. **Position pieces on the board.** Create a coordinate mapping function: given a chess square name (e.g., "e2"), return the 3D world position (x, z) on the board. The board's squares are a grid, so this is straightforward math: a-h maps to x positions, 1-8 maps to z positions. Place all 32 pieces at their starting squares. Each piece should be stored in a data structure that maps square names to piece meshes — you'll need this for the move system.

4. **Create the Deep Blue figurine.** For Deep Blue's "seat" opposite the player, create a simple stylized object that represents the computer. This could be a small monolith (a tall thin rectangular box with a dark metallic material and a subtle emissive glow), or a geometric abstract shape. Place it at the white side of the board, at table height. It's atmospheric, not interactive.

5. **Add piece highlight materials.** Create a highlight material or shader effect for the piece that needs to be clicked next. Options: swap the piece's material to one with emissive glow, add an outline effect using a slightly-scaled duplicate mesh with backface rendering, or place a glowing ring (TorusGeometry with emissive material) on the square beneath the piece. Also create a destination square indicator — a glowing ring or pulsing plane on the target square.

**Test:** The board now has all 32 pieces in starting position. You can orbit around and see them. One piece (the c7 pawn) should have a visible highlight, and c6 should have a destination indicator. Nothing is clickable yet.

---

## Phase 4: Camera System (Locked / Free Toggle)

**Goal:** The two camera modes working with the clock as the toggle.

### Steps

1. **Build the chess clock model.** Place it on the table to the right of the board. A simple box with two "face" planes on top (these will display text later — for now just colored rectangles). Add a button on top — a small cylinder or box that's a slightly different color. The button is the clickable element.

2. **Implement locked mode.** Define the exact locked camera position and rotation: Kasparov's side (black), elevated ~30°, looking at the board center. Store these as constants. When entering locked mode, disable OrbitControls and animate the camera to the locked position using a tween library (install tween.js or gsap — GSAP is more powerful and you'll want it for piece animations later anyway). The animation should take ~1.5 seconds with an ease-out curve.

3. **Implement free mode.** When entering free mode, re-enable OrbitControls. The camera stays wherever it currently is (the locked position) and the visitor can start orbiting from there.

4. **Wire up the clock as toggle.** Add a raycaster click handler. When the visitor clicks in free mode, raycast against the clock button. If hit, transition to locked mode. Display "Your Turn" text on the clock face during free mode — for now this can be a simple sprite or a canvas texture mapped to the clock face plane.

5. **Set the initial state.** When the game scene first loads, start in locked mode. The camera is at Kasparov's position, OrbitControls are disabled.

**Test:** The scene starts in locked mode (fixed camera, no orbit). You can't move the camera. Clicking the clock does nothing yet (since there's no move to trigger free mode). For testing, add a temporary keyboard shortcut (press F for free mode) to verify the orbit works and the clock click returns to locked mode.

---

## Phase 5: Move System — Core Game Loop

**Goal:** Clicking a highlighted piece plays the move, Deep Blue responds, next piece highlights.

### Steps

1. **Build the game state manager.** Create a class or module that tracks: current move index (which move pair we're on), current phase (waiting for black move, animating black move, waiting for Deep Blue, animating Deep Blue, free exploration), and the board state (which piece is on which square). Initialize with the starting position.

2. **Implement piece click detection.** In locked mode, add a raycaster click handler that checks if the visitor clicked the highlighted piece. If they clicked the correct piece (and only the highlighted piece), trigger the move animation.

3. **Implement move animation.** When a piece moves, animate it from its current position to the destination square. Use GSAP for smooth tweening: `gsap.to(piece.position, { x: targetX, z: targetZ, duration: 0.8, ease: "power2.inOut" })`. If the move is a capture, the captured piece should either sink into the board (scale to 0 and remove) or slide off to a captured-pieces area. Handle special moves: castling (move 9, O-O) requires moving both the king and rook simultaneously. Check moves (move 10, Bg6+) could add a brief flash or camera shake.

4. **Implement the move → explore → resume cycle.** After the black move animation completes: transition camera to free mode. The visitor explores. When they click the clock: transition to locked mode, then after the camera settles, auto-play Deep Blue's next white move with its mechanical sound, then highlight the next black piece. If the visitor doesn't explore (clicks the clock immediately), the cycle is fast and the game progresses quickly.

5. **Implement the score sheet sidebar.** Create a DOM element positioned on the left edge of the screen. As each move is made (both white and black), append the algebraic notation. Each black move entry also shows a section label ("About", "Skills", etc.). Make each entry clickable — clicking jumps the game state to that move (this is complex: you need to be able to set the board to any mid-game position, which means tracking or computing board state at each move index).

6. **Handle the score sheet jump logic.** When a sidebar entry is clicked: determine the target move index, compute or look up the board state at that point (store snapshots of piece positions after each move), animate all pieces to their correct positions simultaneously, set the room illumination to the corresponding state, and update the game state manager.

**Test:** You can now play through the game. Click piece → it moves → camera unlocks → explore → click clock → Deep Blue moves → next piece highlights → repeat. The sidebar fills in as you go and you can click entries to jump around.

---

## Phase 6: The Room & Wall Reveals

**Goal:** Four walls with content that illuminate as moves progress.

### Steps

1. **Build the room geometry.** Create four wall planes (large PlaneGeometry, positioned and rotated to form a square room around the table). Add a ceiling plane and a floor plane. All walls start with zero-opacity or a fully dark material (black, unlit). The room should be large enough that the walls feel like they're at a comfortable reading distance when the camera faces them — experiment with scale, but roughly 3-4x the width of the board in each direction.

2. **Build the wall content system.** This is the most design-intensive part of the build. For each wall, you need to create the content surfaces. You have two approaches:

   **Approach A — Canvas textures (recommended for text-heavy content).** Create HTML5 canvas elements offscreen, draw your text and images onto them using the Canvas 2D API, then use them as textures on the wall planes. This gives you full control over typography and layout, and the text renders at whatever resolution you draw the canvas at. Update the canvas and mark the texture as needing update when content changes.

   **Approach B — CSS3DRenderer overlay.** Use Three.js's CSS3DRenderer in a second render layer to place actual DOM elements (HTML/CSS) positioned in 3D space on the walls. This gives you perfect text rendering, clickable links, and standard web layout — but mixing CSS3D with WebGL has complexity and can cause z-fighting or alignment issues.

   **Approach C — Hybrid.** Use WebGL for the room, walls, and atmospheric elements, but overlay DOM panels positioned to align with the 3D walls when the camera faces them. Use CSS transforms calculated from the camera's projection matrix. This is how many portfolio/gallery Three.js sites work.

   I recommend starting with Approach A for the initial build (simpler integration) and upgrading to C later if you need better text quality or clickable links.

3. **Implement wall reveal animations.** Each wall has an associated light (SpotLight or PointLight) that starts at zero intensity. When a move triggers a wall reveal, tween the light's intensity up over ~1 second. The wall material should also transition from dark/transparent to visible. Group the lights by wall: back wall has one or two lights, left wall has its own, etc. Map each black move index to a wall and a "reveal progress" value (move 1 reveals 33% of the back wall, move 2 reveals 66%, move 3 reveals 100%).

4. **Create content for each wall.**
   - **Back wall (About):** Your name large, a bio paragraph, location, a personal detail. Laid out cleanly.
   - **Left wall (Skills):** A bookshelf — this could be a 3D model (boxes arranged as books on shelves) or a flat texture designed to look like a bookshelf. Label the spines.
   - **Right wall (Projects):** Framed rectangles on the wall (PlaneGeometry with border meshes). Each frame contains a project card rendered as a canvas texture: title, screenshot, description, tech stack.
   - **Fourth wall (Experience):** A horizontal timeline. Company logos as textures, role titles, dates.

5. **Implement light temperature shifts.** During Deep Blue's (white) moves, slightly adjust the scene's ambient light color toward a cooler tone (bluish). During the visitor's (black) turns, shift it back to warm. Use GSAP to tween the light's color property.

**Test:** Playing through the game now reveals the room. Each wall lights up in sequence as you make moves. The content is visible on the walls when you orbit to face them. The room goes from dark void to fully lit study by the end of the game.

---

## Phase 7: Table Props & Interactive Objects

**Goal:** The score sheet (3D), envelope, coffee mug, and clock faces are present and interactive where specified.

### Steps

1. **Build the 3D score sheet.** A flat plane on the table to the left of the board. Apply a canvas texture that shows lined paper with move notation filling in as the game progresses. Update the texture after each move. In post-game, add raycaster click detection so clicking an entry highlights the corresponding wall.

2. **Build the envelope.** A simple mesh — a flat rectangle with a triangular flap (a few triangles of geometry, or just a textured plane). Place it on the table. During gameplay it's non-interactive. In post-game, add emissive glow and click detection — clicking triggers the cinematic contact screen.

3. **Build the coffee mug.** A cylinder with a torus handle. Apply a ceramic-looking material. This is pure atmosphere — no interactivity ever. Keep the geometry simple.

4. **Update the clock faces.** Replace the placeholder rectangles with canvas textures. One face shows the move counter ("7 / 19") and updates after each move. During free mode, the other face shows "Your Turn." In post-game, it shows "Your Move." Add click detection on the clock body for the free → locked transition during gameplay, and for the contact screen trigger in post-game.

**Test:** The table now has props. The clock is clickable and functional. The score sheet updates. The envelope glows in post-game and navigates to the contact screen.

---

## Phase 8: The Cinematic Ending (Scene 8)

**Goal:** The resignation sequence, blackout, and "Your move" cinematic page.

### Steps

1. **Trigger the resignation.** After the visitor's 18th move (Bxe7), Deep Blue plays 19. c4 automatically. After the animation completes, add a 2-second pause. Then update the score sheet with "Black resigns."

2. **Fade the room to black.** Tween all light intensities to 0 over ~3 seconds. Simultaneously fade the Three.js canvas opacity to 0 (CSS transition on the canvas element). The scene disappears.

3. **Hold the black screen.** Display nothing for 2-3 seconds. This is just a CSS div with a black background sitting over everything.

4. **Build the cinematic text sequence.** Create a full-screen DOM overlay. Fade in each line of text sequentially using CSS animations or GSAP timeline:
   - Line 1 fades in over 1s, holds for 3s
   - Line 2 fades in over 1s, holds for 3s
   - Line 3 fades in over 1s, holds for 3s
   - All three lines fade out or the background transitions
   - "But the game is never over." fades in — different font, modern, different color temperature
   - "Your move." fades in — large, bold, modern
   - Contact info fades in beneath
   - "Return to the board" and "View resume" buttons fade in

   The sepia lines use the same serif font and warm tones as the placard. The "Your move" section uses a sans-serif or modern font with a neutral/cool white background. The visual shift should feel like stepping out of history into the present.

5. **Play the single warm tone.** When "Your move" appears, play one audio note — a soft piano key, a warm synth pad, or a resolved chord. This is the only sound in the entire cinematic. Use the Web Audio API or a simple audio element.

6. **Wire up the buttons.** "Return to the board" restores the Three.js scene with full room illumination and enters post-game free roam. "View resume" opens a PDF in a new tab or triggers a download.

**Test:** Complete the game and experience the full resignation → blackout → cinematic → "Your move" flow. Both buttons work.

---

## Phase 9: Post-Game Interactivity

**Goal:** The room is a fully navigable portfolio space after the game.

### Steps

1. **Enable project frame clicks.** Add raycaster detection on the project frames (right wall). On click, animate the camera to zoom into the frame. Display a detail overlay — either a larger canvas texture that swaps in, or a DOM panel positioned over the 3D scene. Include: project title, detailed description, multiple screenshots (if applicable), tech stack, and links (GitHub, live demo). Add an escape/close mechanism: press Escape, click outside the frame, or click a close button.

2. **Enable bookshelf clicks.** Add raycaster detection on book spine regions. On click, open the relevant link (GitHub repo, documentation, etc.) in a new tab. Add a hover effect — the book could tilt slightly outward or glow on mouseover.

3. **Enable timeline entry clicks.** Add raycaster detection on experience entries (fourth wall). On click, expand the entry to show more detail: full role description, key accomplishments, dates. This could be an in-scene animation (the entry grows) or a DOM overlay.

4. **Enable the 3D score sheet navigation.** Raycaster on the score sheet entries. On click, brighten the corresponding wall section's lights momentarily and optionally nudge the camera toward that wall with a smooth tween.

5. **Enable the envelope and clock "Your Move" triggers.** Both should transition to the cinematic contact screen when clicked. The envelope glows on hover. The clock face shows "Your Move" in its canvas texture.

**Test:** In post-game, every interactive object works. You can click projects for detail, click books for links, click timeline entries to expand, click the clock or envelope to reach the contact screen, and click score sheet entries to navigate the room.

---

## Phase 10: Sound Design

**Goal:** Full soundscape implementation.

### Steps

1. **Set up audio infrastructure.** Use the Web Audio API (via Tone.js if you want easier scheduling, or raw API for simplicity). Create an audio manager that handles: ambient layers, one-shot sound effects, and the mute toggle. Remember that browsers require a user gesture before playing audio — the "Click to play" on the landing page or the "Begin" button on the placard satisfies this requirement.

2. **Create or source the sounds.** You need:
   - Clock ticking (looped) — find a free clock tick sample on Freesound.org or similar
   - Wooden piece click (one-shot) — a short wood-on-wood tap
   - Mechanical whir (one-shot) — a short servo or electronic sound for Deep Blue's moves
   - Ambient hum (looped) — a warm low-frequency drone
   - Room atmosphere (looped) — a fuller ambient pad
   - Tension layer (looped) — slightly dissonant or faster-pulsing variant for endgame
   - Resolve tone (one-shot) — the single warm note for "Your move"

   Freesound.org (CC-licensed), Pixabay audio (royalty-free), or ZapSplat are good free sources. Alternatively, generate them with Tone.js synthesizers for a consistent electronic aesthetic.

3. **Implement the evolving soundscape.** Map move indices to sound layers:
   - Moves 1-3: clock tick only, low volume
   - Moves 4-7: fade in ambient hum layer
   - Moves 8-13: fade in room atmosphere layer
   - Moves 14-18: fade in tension layer, increase clock tick rate/volume
   - Resignation: all layers cut to silence immediately (stop all, don't fade)
   - Post-game: gentle ambient only

4. **Implement the light temperature audio cue.** During Deep Blue's moves, optionally add a subtle low electronic tone or filter the ambient toward colder frequencies. During the visitor's turns, return to warmth.

5. **Add the mute button logic.** Toggle all audio on/off. Persist the mute state in a variable so re-entering the scene after the cinematic respects the setting.

**Test:** Play through the game with sound on. The soundscape should evolve naturally. Muting works. The resignation silence is impactful. The resolve tone plays at "Your move."

---

## Phase 11: DOM UI & Quality of Life

**Goal:** Skip, auto-play, move counter, view room button, and help.

### Steps

1. **Build the persistent DOM overlay.** A transparent div layered over the Three.js canvas. Position the utility controls in corners:
   - Top-right: mute button (speaker icon), skip link ("Skip" in small text)
   - Bottom-right: auto-play toggle (play/pause icon), move counter ("7 / 19")
   - Bottom-left or contextual: "View Room" button (appears after first move)

2. **Implement skip.** On click: instantly set the game state to the final move, position all pieces at their endgame squares, illuminate all room lights to full, remove the score sheet sidebar, enter post-game free roam mode. Skip the cinematic — the visitor who skips doesn't want to wait through text animations.

3. **Implement auto-play.** When toggled on, run the move → explore → resume cycle automatically on a timer. Every 3-4 seconds: play the next black move, briefly free the camera (or keep it locked and just rotate slowly), then play Deep Blue's response. The visitor can toggle it off at any time to take manual control. If they click a piece or the clock during auto-play, auto-play disengages.

4. **Implement the View Room button.** Appears after the first move. On click, unlocks the camera to free mode without advancing the game. The game is paused — the next piece stays highlighted. Clicking the clock resumes.

5. **Add a help tooltip or first-time hint.** On the first visit (check a variable, not localStorage), show a brief overlay after the board emerges: "Click the glowing piece to make your move. Explore the room between moves." Dismiss on click or after 5 seconds. This prevents confusion for visitors who don't understand the interaction model.

**Test:** All utility controls work. A brand-new visitor gets a hint. Auto-play runs the game hands-free. Skip jumps to the end. View Room lets you look around mid-game.

---

## Phase 12: Mobile Fallback

**Goal:** A functional portfolio on mobile devices.

### Steps

1. **Add device detection.** Check for touch capability and screen width. If mobile (< 768px width or touch-primary), serve the fallback instead of loading Three.js at all. This saves mobile users from downloading 3D assets they'll never see.

2. **Build the mobile landing.** Same checkered pattern and name, but optimized for vertical screens. The "Click to play" prompt changes to "Scroll to explore" or leads to the static portfolio directly.

3. **Build the mobile portfolio.** A single scrollable page with sections: About → Skills → Projects → Experience → Contact. Use the same color scheme (cream and dark brown/black), the same serif font, and sepia accents. Section dividers could use chess piece icons or checkered pattern borders. The "Your move" contact section is the last element.

4. **Add the desktop prompt.** A subtle banner at the top: "Visit on desktop for the full experience." Not aggressive — don't make mobile users feel like they're missing out too much.

**Test:** On a phone or in a narrow browser window, the site shows a clean scrollable portfolio with chess theming. No Three.js loads. Everything is readable and functional.

---

## Phase 13: Performance Optimization & Polish

**Goal:** Smooth experience, fast loads, polished details.

### Steps

1. **Optimize Three.js performance.**
   - Use `BufferGeometry` for everything (Three.js default now, but verify).
   - Instance meshes for repeated objects: all 8 white pawns share geometry via InstancedMesh, all 8 black pawns share another, etc.
   - Limit dynamic lights to 3-4 active at once. When a new wall's lights turn on, the previous wall's lights can be slightly dimmed (not off, just reduced) to keep the total light count manageable.
   - Bake shadow maps once for static objects (table, room walls) and only update for moving pieces.
   - Use compressed textures (basis/ktx2) for wall content if file sizes get large.
   - Set `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to cap retina rendering.

2. **Optimize asset loading.**
   - Use GLB (binary glTF) for models — smaller than GLTF.
   - Compress textures with tools like Squoosh.
   - Lazy-load wall content textures — don't load the projects wall texture until the visitor is near that phase of the game.
   - Show a progress bar on the placard if total assets exceed ~2MB.

3. **Add animation polish.**
   - Ease all camera transitions (GSAP `power2.inOut` or similar).
   - Add subtle hover effects on interactive objects (glow, scale, cursor change).
   - Add a slow idle camera drift if the visitor hasn't interacted for 30+ seconds in free mode — a very gentle orbit rotation to keep the scene alive.
   - Polish the piece slide animation — add a slight vertical arc so pieces look like they're being picked up and placed, not sliding on the surface.

4. **Add visual polish.**
   - Subtle fog in the scene (Three.js Fog) to enhance the darkness-to-light room reveal.
   - Soft particle effects — dust motes in the light beams (a simple particle system).
   - A vignette post-processing effect on the camera for cinematic feel.

5. **Test on target hardware.** Test on a mid-range laptop (integrated graphics), a gaming desktop, and a MacBook. Profile with Chrome DevTools → Performance tab. Target 60fps with no drops below 30fps. If the scene is too heavy, reduce polygon counts, light counts, or shadow resolution.

**Test:** The full experience runs smoothly from landing to post-game on a standard laptop. Loading is fast. Animations are polished. No jank.

---

## Summary — Build Order

| Phase | What You Get | Est. Effort |
|-------|-------------|-------------|
| 1. Setup & Static Scenes | Landing page + placard | 1 day |
| 2. Board & Table | 3D board rendering with orbit | 1-2 days |
| 3. Chess Pieces | 32 pieces in starting position | 2-3 days (depends on model source) |
| 4. Camera System | Locked/free toggle with clock | 1-2 days |
| 5. Move System | Playable game loop | 3-4 days |
| 6. Room & Walls | Content reveals with lighting | 4-5 days |
| 7. Table Props | Clock, sheet, envelope, mug | 1-2 days |
| 8. Cinematic Ending | Resignation + "Your move" | 2-3 days |
| 9. Post-Game Interactivity | Clickable room | 2-3 days |
| 10. Sound Design | Full soundscape | 2-3 days |
| 11. DOM UI | Skip, auto-play, help | 1-2 days |
| 12. Mobile Fallback | Static portfolio | 2-3 days |
| 13. Optimization & Polish | Smooth + beautiful | 3-5 days |
| **Total** | | **~25-38 days** |

These estimates assume you're working on this part-time alongside other responsibilities. A focused full-time build could compress this to 2-3 weeks.