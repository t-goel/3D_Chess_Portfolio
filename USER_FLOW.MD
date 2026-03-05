# Chess Portfolio — Complete User Flow

## Concept

A Three.js chess portfolio that replays Game 6 of the 1997 Kasparov vs. Deep Blue match. The visitor plays as Kasparov (black). The entire experience is **scroll-driven** — scrolling advances the game, moves pieces, pans the camera to walls, and reveals portfolio content. Each scroll step reveals a section of a room surrounding the board. The game ends with Kasparov's resignation, leading to a cinematic "Your move" contact call-to-action. Only after the game ends and the visitor returns to the board does free orbit unlock.

---

## Game Data

**Game:** Deep Blue vs. Kasparov, May 11, 1997 — Game 6
**Opening:** Caro-Kann Defense, Steinitz Variation (ECO B17)
**Result:** 1-0 (Kasparov resigns after 19 moves)
**Deep Blue is White. Kasparov is Black. The visitor plays as Black.**

```
1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 5.Ng5 Ngf6
6.Bd3 e6 7.N1f3 h6 8.Nxe6 Qe7 9.O-O fxe6 10.Bg6+ Kd8
11.Bf4 b5 12.a4 Bb7 13.Re1 Nd5 14.Bg3 Kc8 15.axb5 cxb5
16.Qd3 Bc6 17.Bf5 exf5 18.Rxe7 Bxe7 19.c4 (Black resigns)
```

**19 white moves, 18 black moves (Kasparov resigns before playing move 19 as black).**

---

## Interaction Model — Scroll-Driven

The entire game is controlled by scrolling. The visitor never clicks pieces or manually controls the camera during gameplay. Each "scroll step" triggers a choreographed sequence: a piece moves, the camera pans to a wall, content is revealed via a lighting animation, and more scrolling brings the camera back to the board.

### Scroll Step Cycle (repeats for each black move)

1. **Visitor scrolls →** Black piece animates to its destination with a wooden *click* sound.
2. **Camera pans** from the board to the relevant wall. A lighting animation illuminates the new content on the wall.
3. **Visitor scrolls again →** Camera pans back to the board.
4. **Deep Blue's next white move plays automatically** with a mechanical whir. The light cools briefly, then warms.
5. **Pause.** The next scroll triggers the next black move (step 1 again).

This cycle repeats 18 times (one for each black move). The visitor scrolls to advance, watches the choreography, scrolls again. The entire experience has a cinematic, directed feel — like scrubbing through a film.

### What Scrolling Does NOT Do

- The visitor cannot freely orbit, pan, or rotate the camera during the game.
- The visitor cannot click chess pieces.
- The visitor cannot interact with wall content during the game (project frames, bookshelf, etc. are view-only until post-game).
- The camera path is fully choreographed per move.

---

## Move-to-Content Mapping

| Phase | Black Moves | Wall | Content |
|-------|-------------|------|---------|
| Opening | 1-3 (c6, d5, dxe4) | Back wall | About — bio, location, personal detail |
| Development | 4-7 (Nd7, Ngf6, e6, h6) | Left wall | Skills — bookshelf with languages, frameworks, tools |
| Middlegame | 8-13 (Qe7, fxe6, Kd8, b5, Bb7, Nd5) | Right wall | Projects — gallery of framed project cards |
| Late Middlegame | 14-18 (Kc8, cxb5, Bc6, exf5, Bxe7) | Fourth wall (behind camera start) | Experience — timeline, company logos, roles |

---

## Camera System

### During the Game — Choreographed (No Manual Control)

The camera follows a scripted path for each move. The visitor has no manual control — no orbit, no pan, no zoom. Scrolling advances the choreography.

**Board view:** Kasparov's perspective — black's side, slightly elevated, ~30° above the board. This is the "home" position the camera returns to between wall reveals.

**Wall view:** After each black move, the camera pans smoothly from the board to face the relevant wall head-on at a comfortable reading distance. The pan takes ~1.5 seconds. The camera holds on the wall while the lighting animation reveals content. The next scroll pans the camera back to the board (~1.5 seconds).

**Camera path per phase:**
- Moves 1-3: Board → back wall → board (repeated 3 times, each revealing more of the about wall)
- Moves 4-7: Board → left wall → board (repeated 4 times, each lighting another bookshelf section)
- Moves 8-13: Board → right wall → board (repeated 6 times, each revealing a project frame)
- Moves 14-18: Board → fourth wall → board (repeated 5 times, each revealing a timeline entry)

### Post-Game — Free Orbit (Manual Control)

Only after the cinematic ending and clicking "Return to the board" does the visitor gain free orbit control. At this point:
- Can look down at the board and table
- Can look up at the ceiling
- Can orbit left/right to face any wall
- Vertical angle clamped: ~10° below the table plane to ~80° above
- Cannot flip upside down or go under the table

---

## Scenes

### Scene 0 — The Landing (2D, no Three.js)

The screen opens to a full-viewport repeating checkered pattern — black and cream squares tiling to fill the entire screen regardless of resolution. Not a literal 8×8 board, but a chess *motif* that extends edge to edge. **TANMAY GOEL** is typeset across the center in a clean serif font with a subtle semi-transparent dark backdrop for readability. **SOFTWARE ENGINEER** sits underneath in a smaller weight.

The squares subtly animate — a slow diagonal wave or parallax shift on mouse move.

A prompt at the bottom reads: *"Click to play"*

**While the visitor sees this screen, the Three.js scene begins preloading in the background.**

---

### Scene 1 — The Placard (2D, no Three.js)

On click, the checkered pattern fades. A sepia-toned placard fills the screen, styled like an old tournament announcement or newspaper clipping:

> **IBM Man-Machine Challenge — May 11, 1997 — Game 6**
> **Match Score: 2½ – 2½**
> **Garry Kasparov vs. Deep Blue**
> *"You play as Kasparov."*

The **"Begin"** button starts dimmed/disabled. It activates once the Three.js scene finishes loading behind this screen. A subtle loading indicator (a chess piece icon filling in) appears below the button if loading takes more than a moment.

Clicking "Begin" transitions to the board.

---

### Scene 2 — The Board Emerges (Three.js begins)

The screen goes dark — a void. A pool of warm overhead light fades in, illuminating just the chess board on a wooden table. Pieces are in starting position, low-poly / stylized. A figurine representing Deep Blue sits at the white side.

**Camera:** Board view — Kasparov's perspective. No manual control.

The ambient soundscape begins: just a ticking clock, quiet.

Deep Blue makes the first move automatically (1. e4) — the pawn slides forward with a mechanical whir. The light cools briefly, then warms.

A scroll prompt appears at the bottom of the screen: *"Scroll to continue"* or a subtle downward arrow animation.

The score sheet sidebar appears in the DOM showing the first white move.

**The visitor scrolls to begin.**

---

### Scene 3 — Opening Phase: About You (Moves 1–3)

**Scroll →** Black's first move (1... c6) animates automatically. The pawn slides to c6 with a wooden *click*. The score sheet updates.

**Camera pans** from the board to the **back wall**. A warm light blooms, revealing the first piece of content: a brief bio. Who you are, what drives you, where you're based. The visitor reads the wall.

**Scroll →** Camera pans back to the board. Deep Blue's next move (2. d4) plays automatically with a mechanical whir. The light cools briefly, then warms.

**Scroll →** Black's second move (2... d5) animates. Camera pans to the back wall. More content illuminates — education.

**Scroll →** Camera pans back. Deep Blue plays (3. Nc3). Automatic.

**Scroll →** Black's third move (3... dxe4) animates. Camera pans to the back wall. Final about section illuminates — a personal detail. The back wall is now fully revealed.

**Scroll →** Camera pans back to the board. Deep Blue plays (4. Nxe4). Automatic.

**Soundscape:** Ticking clock only. Sparse.

---

### Scene 4 — Development Phase: Skills & Tech Stack (Moves 4–7)

Same scroll cycle, but the camera now pans to the **left wall** after each black move.

Each scroll → move → pan reveals a new section of the bookshelf: languages, frameworks, tools, other skills. Book spines are labeled. Each move lights up another shelf or cluster with a lighting animation.

**Soundscape:** Ticking clock joined by a low warm hum.

---

### Scene 5 — Middlegame: Projects (Moves 8–13)

The camera pans to the **right wall** after each black move. This is the gallery.

Each scroll reveals a framed project: screenshot, title, one-line description, tech stack. The most important project gets a more dramatic reveal — larger frame, brighter light. On a capture move, the captured piece could fly off the board and embed itself in the frame on the wall.

**Soundscape:** Full ambient atmosphere. The room sounds alive.

---

### Scene 6 — Late Middlegame: Experience & Work (Moves 14–18)

The camera pans to the **fourth wall** (behind the visitor's starting camera position) after each black move. The camera now rotates further than before — a full 180° turn from the board to see the wall behind. This is a dramatic moment the first time it happens.

Each scroll reveals a timeline entry: company logos, role descriptions, dates.

By the end of this phase, the room is fully illuminated — four walls of content, a chess game on the table, atmospheric props.

**Soundscape:** Warm and full. Clock ticking grows subtly louder as the endgame approaches.

---

### Scene 7 — Ceiling & Floor (Ambient, no dedicated moves)

The ceiling holds education: university crests or diploma-style elements. The floor has a subtle pattern with certifications or links to GitHub/LinkedIn. These fade in as ambient details once enough of the room is revealed during Scenes 4-6. They do not require dedicated scroll steps.

---

### Scene 8 — The Resignation

After the visitor's final scroll triggers black's last move (18... Bxe7), Deep Blue responds with 19. c4 automatically. A pause. The board state settles. The score sheet writes: *"Black resigns."*

**All sound cuts to silence.**

The room lights dim slowly — like a curtain falling. The Three.js scene fades to black.

**Pure black screen. Hold for 2–3 seconds.**

Then the cinematic page begins. Sepia-toned, matching the opening placard. Text fades in one line at a time, ~3 seconds apart:

> *"On May 11, 1997, Game 6 lasted barely an hour."*

> *"For the first time in history, a computer had defeated a reigning World Chess Champion in a match."*

> *"The age of the machine had begun."*

A longer beat. The sepia drops away. Color temperature shifts. The font changes to something modern and clean:

> *"But the game is never over."*

> **"Your move."**

Below it: contact information — email, LinkedIn, GitHub. A simple contact form or mailto link.

Beneath the contact info, two options:
- **"Return to the board"** — transitions back to the Three.js scene, room fully illuminated, free orbit unlocked
- **"View resume"** — opens or downloads a PDF

A single warm tone resolves — like a breath — when "Your move" appears. The only sound in the entire cinematic sequence.

---

### Post-Game — Free Roam

The visitor clicks "Return to the board." The Three.js scene reappears: room fully illuminated, final board position on the table.

**Free orbit is now unlocked for the first time.** The visitor can manually rotate, zoom, and explore the room in any direction.

The room is now **fully interactive as a navigable portfolio space.** The DOM sidebar is gone. The visitor explores the 3D room directly.

---

## Interactive Objects

### During the Game (Scroll-Driven)

| Object | Interactive? | Behavior |
|--------|-------------|----------|
| Scroll | **Yes** | The only input during gameplay. Each scroll advances the choreographed sequence. |
| Score sheet sidebar (DOM) | **Yes** | Clickable entries jump to any move state, animate the board, illuminate the room to that point, and set the scroll position accordingly. |
| Skip link (DOM) | **Yes** | Instantly illuminates full room and jumps to post-game state. |
| Auto-play toggle (DOM) | **Yes** | Steps through the scroll sequence on a 3-4 second timer automatically without needing to scroll. |
| Mute button (DOM) | **Yes** | Toggles soundscape on/off. |
| Help button (DOM) | **Yes** | First-time hint: "Scroll to advance the game." |
| Move counter (DOM) | **No** | Displays "7 / 18" — read-only indicator. |
| Chess pieces | **No** | The visitor never clicks pieces. All piece movement is triggered by scroll. |
| Chess clock | **No** | Visible on the table as atmosphere. Not interactive during gameplay. |
| Board squares | **No** | Static. |
| Coffee mug | **No** | Atmosphere only. |
| Envelope on table | **No** | Visible but not interactive until post-game. |
| Project frames on walls | **No** | View-only during gameplay. Content is revealed by lighting but cannot be clicked for detail views yet. |
| Bookshelf spines | **No** | View-only during gameplay. |
| Timeline entries | **No** | View-only during gameplay. |
| Unrevealed walls/ceiling/floor | **No** | Dark and invisible until unlocked by scroll progression. |

### During Post-Game Free Roam

| Object | Interactive? | Behavior |
|--------|-------------|----------|
| Camera (orbit controls) | **Yes** | Free orbit unlocked for the first time. Manual rotation, zoom, pan. Vertical angle clamped. |
| Project frames on walls | **Yes** | Click to zoom into detail view with text, screenshots, links. Escape or click outside to return. |
| Bookshelf spines (left wall) | **Yes** | Click to open GitHub repos or relevant links. |
| Timeline entries (fourth wall) | **Yes** | Click to expand with more detail about each role. |
| Chess clock | **Yes** | Now displays "Your Move." Click to return to the cinematic contact screen. |
| Envelope on table | **Yes** | Glows subtly. Click to return to the cinematic contact screen. Second path to contact info. |
| Score sheet on table (3D) | **Yes** | Click any entry to highlight the corresponding wall section and nudge the camera toward it. Does not change the board position. |
| Mute button (DOM) | **Yes** | Still available. |
| Chess pieces (final position) | **No** | Static. The game is over. |
| Board | **No** | Static display of final position. |
| Coffee mug | **No** | Atmosphere only. |
| Ceiling / floor content | **No** | Visible ambient detail. Links on the floor (GitHub/LinkedIn) could be clickable if implemented. |

---

## Persistent DOM Elements (Always Visible During 3D Scenes)

These are small, unobtrusive utility controls — not navigation:

| Element | Position | Notes |
|---------|----------|-------|
| Mute/unmute button | Corner | Toggles soundscape. |
| Skip link | Corner | Small text. Jumps to post-game state. |
| Auto-play toggle | Corner | Auto-advances the scroll sequence on a timer. |
| Move counter | Corner | Read-only: "7 / 18" (18 black moves total). |
| Help button | Corner | Shows first-time hint overlay. |
| Scroll prompt | Bottom center | "Scroll to continue" or animated arrow. Fades after first interaction. |

**The score sheet sidebar** appears docked to the screen edge during gameplay only. It disappears in post-game — navigation moves to the 3D score sheet on the table.

---

## Scroll Architecture

The scroll system is the core of the experience. Here's how it works technically:

### Scroll Segments

The page has a tall invisible scrollable container (or uses a virtual scroll library). The total scroll height is divided into segments, one for each choreographed beat:

| Scroll Segment | What Happens |
|----------------|-------------|
| Segment 1 | Black move 1 animates. Camera pans to back wall. Lighting reveals about content (part 1). |
| Segment 2 | Camera pans back to board. Deep Blue move 2 auto-plays. |
| Segment 3 | Black move 2 animates. Camera pans to back wall. Lighting reveals about content (part 2). |
| Segment 4 | Camera pans back to board. Deep Blue move 3 auto-plays. |
| ... | ... |
| Segment 35 | Black move 18 animates. Camera pans to fourth wall. Final experience entry revealed. |
| Segment 36 | Camera pans back to board. Deep Blue plays 19. c4. Resignation sequence begins. |

Each segment corresponds to a scroll range. As the visitor scrolls through a segment's range, the animation for that segment plays proportionally (scrub-style) or triggers at a threshold (snap-style).

**Recommended approach:** Snap-style — scrolling past a threshold triggers the full animation for that segment, then the scroll locks briefly until the animation completes. This prevents the visitor from scrubbing halfway through a piece animation and leaving things in a broken state. Libraries like GSAP ScrollTrigger are built for exactly this.

### Scroll Direction

Scrolling **down** advances the game. Scrolling **up** does nothing during gameplay (no rewind). The score sheet sidebar is the mechanism for jumping backward — clicking a previous entry rewinds the game state.

---

## Sound Design

| Phase | Soundscape |
|-------|------------|
| Opening (moves 1–3) | Ticking clock only. Sparse. |
| Development (moves 4–7) | Low ambient hum joins the clock. |
| Middlegame (moves 8–13) | Full ambient atmosphere. Room sounds alive. |
| Endgame (moves 14–18) | Tension builds. Clock ticking subtly louder/faster. |
| Resignation | All sound cuts to silence instantly. |
| Cinematic text | Silence. Single warm tone when "Your move" appears. |
| Post-game roam | Gentle ambient — warm, resolved, no tension. |

**Move sounds:**
- Black moves (scroll-triggered): warm wooden *click*
- White moves (auto-play): cold mechanical *whir* or electronic *tick*

**Light temperature:**
- Cools slightly during white (Deep Blue) moves
- Warms back up on black (visitor) scroll triggers

---

## Mobile Fallback

The site detects mobile and serves a static portfolio. Same chess aesthetic: checkered patterns, piece iconography, matching color scheme, serif typography, sepia accents. No 3D scene.

Content is laid out as a traditional scrollable portfolio with sections matching the room walls: About → Skills → Projects → Experience → Contact.

A banner at the top: *"Visit on desktop for the full experience."*

The "Your move" contact section is the final element.

---

## Piece Style

Low-poly / stylized pieces.