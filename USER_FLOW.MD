# Chess Portfolio — Complete User Flow

## Concept

A Three.js chess portfolio that replays Game 6 of the 1997 Kasparov vs. Deep Blue match. The visitor plays as Kasparov (black). Each move they make reveals a section of a room surrounding the board — walls hold portfolio content (About, Skills, Projects, Experience). The game ends with Kasparov's resignation, leading to a cinematic "Your move" contact call-to-action.

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
**The visitor clicks 18 times to complete the game.**

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

### Locked Mode (Playing Chess)
- Fixed at Kasparov's perspective: black's side, slightly elevated, ~30° above the board
- No orbit, no drag, no pan
- Active during move selection
- The visitor sees the board and the highlighted piece

### Free Mode (Exploring the Room)
- The visitor is positioned in the center of the room
- Can look down at the board and table
- Can look up at the ceiling
- Can orbit left/right to face any wall
- Vertical angle clamped: ~10° below the table plane to ~80° above
- Cannot flip upside down or go under the table

### Transitions
- **Locked → Free:** Instant unlock after a move resolves
- **Free → Locked:** Visitor clicks the chess clock → camera glides to locked position over ~1.5 seconds

---

## Scenes

### Scene 0 — The Landing (2D, no Three.js)

The screen opens to a full-viewport checkered pattern — black and cream squares filling the screen like staring down at a chess board. **TANMAY GOEL** is typeset across the center in a clean serif font. **SOFTWARE ENGINEER** sits underneath in a smaller weight.

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

The screen goes dark — a void. A pool of warm overhead light fades in, illuminating just the chess board on a wooden table. Pieces are in starting position, low-poly or stylized. Create a figureine to represent Deep Blue.

**Camera:** Locked mode — Kasparov's perspective.

The ambient soundscape begins: just a ticking clock, quiet.

Deep Blue makes the first move automatically (1. e4) — the pawn slides forward with a mechanical whir. Then Kasparov's first piece (c6 pawn) begins glowing. The destination square pulses gently.

The score sheet sidebar appears in the DOM and reads *"Black to move."*

---

### Scene 3 — Opening Phase: About You (Moves 1–3)

The visitor clicks the glowing pawn. It slides to c6 with a wooden *click* sound.

**The camera unlocks.** The visitor is free to look around. The room is dark — except the **back wall** is beginning to illuminate. A warm light blooms, revealing a brief bio: who you are, what drives you, where you're based.

The visitor explores freely. When ready, they **click the chess clock** (which reads "Your Turn" and glows). The camera glides back to locked position. Deep Blue's next move auto-plays with a mechanical sound. The light cools briefly during the machine's move, then warms. The next black piece highlights.

This cycle repeats for moves 1–3. Each black move reveals more of the about wall: education, location, personal details.

**Soundscape:** Ticking clock only. Sparse.

---

### Scene 4 — Development Phase: Skills & Tech Stack (Moves 4–7)

A new light begins glowing from a different direction. The **left wall** illuminates — a bookshelf fading into view. Book spines are labeled with languages, frameworks, and tools. Each move lights up another shelf or cluster.

**Soundscape:** Ticking clock joined by a low warm hum.

---

### Scene 5 — Middlegame: Projects (Moves 8–13)

The **right wall** illuminates as a gallery. Each black move reveals a framed project: screenshot, title, one-line description, tech stack.

The most important project gets a more dramatic reveal — larger frame, brighter light. On a capture move, the captured piece could fly off the board and embed itself in the frame.

Clicking a revealed project frame during free exploration zooms the camera into a detail view with more text, screenshots, and links. Pressing escape or clicking outside pulls the camera back.

**Soundscape:** Full ambient atmosphere. The room sounds alive.

---

### Scene 6 — Late Middlegame: Experience & Work (Moves 14–18)

The **fourth wall** (behind the visitor's starting camera position) reveals work experience: a timeline running horizontally, or framed company logos with role descriptions. The visitor has to orbit around to discover it.

By now the room is mostly illuminated — four walls of content, a chess game on the table, atmospheric props. A complete space.

**Soundscape:** Warm and full. Clock ticking grows subtly louder as the endgame approaches.

---

### Scene 7 — Ceiling & Floor (Ambient, no dedicated moves)

The ceiling holds education: university crests or diploma-style elements. The floor has a subtle pattern with certifications or links to GitHub/LinkedIn. These fade in as ambient details once enough of the room is revealed. They do not require moves to unlock.

---

### Scene 8 — The Resignation

The visitor makes Kasparov's final move (18... Bxe7). Deep Blue responds with 19. c4. A pause. The board state settles. The score sheet writes: *"Black resigns."*

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
- **"Return to the board"** — transitions back to the Three.js scene, room fully illuminated
- **"View resume"** — opens or downloads a PDF

A single warm tone resolves — like a breath — when "Your move" appears. The only sound in the entire cinematic sequence.

---

### Post-Game — Free Roam

The visitor clicks "Return to the board." The Three.js scene reappears: room fully illuminated, final board position on the table, camera in free mode.

The room is now **fully interactive as a navigable portfolio space.** The DOM sidebar is gone. The visitor explores the 3D room directly.

---

## Interactive Objects

### During the Game (Locked/Free Cycle)

| Object | Interactive? | Behavior |
|--------|-------------|----------|
| Highlighted chess piece | **Yes** | Click to make the next move. Only available in locked mode. |
| Chess clock | **Yes** | Reads "Your Turn" with a glow during free mode. Click to return to locked mode and continue the game. |
| Score sheet sidebar (DOM) | **Yes** | Clickable entries jump to any move state, animate the board, and illuminate the room to that point. |
| View Room button (DOM) | **Yes** | Available after the first move. Unlocks camera to free mode without advancing a move. Same as finishing a move — click the clock to resume. |
| Project frames on walls | **Yes** | Clickable during free mode once revealed. Zooms camera into detail view. Escape or click outside to return. |
| Skip link (DOM) | **Yes** | Instantly illuminates full room and jumps to post-game state. |
| Auto-play toggle (DOM) | **Yes** | Steps through moves on a 3-4 second timer automatically. |
| Mute button (DOM) | **Yes** | Toggles soundscape on/off. |
| Move counter (DOM) | **No** | Displays "7 / 19" — read-only indicator. |
| Non-highlighted chess pieces | **No** | Static. Cannot be clicked or moved. |
| Board squares | **No** | Static. Destination square pulses as a visual cue only, not clickable. |
| Coffee mug | **No** | Atmosphere only. |
| Envelope on table | **No** | Visible but not interactive until post-game. |
| Notepad on table | **No** | Atmosphere only during gameplay. |
| Unrevealed walls/ceiling/floor | **No** | Dark and invisible until unlocked by moves. |
help button for guidance 

### During Post-Game Free Roam

| Object | Interactive? | Behavior |
|--------|-------------|----------|
| Project frames on walls | **Yes** | Click to zoom into detail view with text, screenshots, links. Escape or click outside to return. |
| Bookshelf spines (left wall) | **Yes** | Click to open GitHub repos or relevant links. |
| Timeline entries (fourth wall) | **Yes** | Click to expand with more detail about each role. |
| Chess clock | **Yes** | Now permanently displays "Your Move." Click to return to the cinematic contact screen. |
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
| Mute/unmute button | Corner | Toggles soundscape |
| Skip link | Corner | Small text. Jumps to post-game state. |
| Auto-play toggle | Corner | Steps through moves on a timer. |
| Move counter | Corner | Read-only: "7 / 19" |
| View Room button | Corner | Appears after first move. Unlocks free mode without advancing. |

**The score sheet sidebar** appears docked to the screen edge during gameplay only. It disappears in post-game — navigation moves to the 3D score sheet on the table.

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
- Black moves (visitor clicks): warm wooden *click*
- White moves (Deep Blue auto-plays): cold mechanical *whir* or electronic *tick*

**Light temperature:**
- Cools slightly during white (Deep Blue) moves
- Warms back up on black (visitor) turns

---

## Mobile Fallback

The site detects mobile and serves a static portfolio. Same chess aesthetic: checkered patterns, piece iconography, matching color scheme, serif typography, sepia accents. No 3D scene.

Content is laid out as a traditional scrollable portfolio with sections matching the room walls: About → Skills → Projects → Experience → Contact.

A banner at the top: *"Visit on desktop for the full experience."*

The "Your move" contact section is the final element.



Low-poly / stylized pieces