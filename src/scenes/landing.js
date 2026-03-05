import '../styles/landing.css';

export function createLandingScene(stateManager) {
  let rootEl    = null;
  let boardEl   = null;
  let contentEl = null;
  let promptEl  = null;
  let onMouseMove    = null;
  let onClick        = null;
  let flickerTimeout = null;
  let rafId          = null;

  // Lerp state — current and target positions start at 0 (matches CSS defaults)
  // so there is never a positional jump when the first mousemove fires.
  let targetBdx = 0, targetBdy = 0;
  let curBdx    = 0, curBdy    = 0;
  let targetPdx = 0, targetPdy = 0;
  let curPdx    = 0, curPdy    = 0;

  // ── Build DOM ─────────────────────────────────────────────────────────────
  function build() {
    // SVG filter injected once into <body> — referenced by CSS filter: url(#board-warp).
    // Kept outside #landing so it survives the scene being removed from DOM.
    if (!document.getElementById('landing-filters')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'landing-filters';
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
      svg.innerHTML = `
        <defs>
          <filter id="board-warp" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.012 0.007"
              numOctaves="2" seed="7" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise"
              scale="12" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      `;
      document.body.appendChild(svg);
    }

    rootEl = document.createElement('div');
    rootEl.id = 'landing';

    // Board layer — gets the displacement filter applied to it alone.
    // The plaque and vignette overlay sit above it and are never warped.
    boardEl = document.createElement('div');
    boardEl.className = 'landing-board';
    rootEl.appendChild(boardEl);

    contentEl = document.createElement('div');
    contentEl.className = 'landing-content';
    contentEl.innerHTML = `
      <h1 class="landing-name">Tanmay Goel</h1>
      <p class="landing-title">Software Engineer</p>
      <div class="landing-divider"></div>
      <p class="landing-prompt">Click to play</p>
    `;
    rootEl.appendChild(contentEl);

    promptEl = contentEl.querySelector('.landing-prompt');
    document.getElementById('app').appendChild(rootEl);
  }

  // ── Candle flicker ────────────────────────────────────────────────────────
  // Three probability tiers so timing feels irregular, not rhythmic.
  function startFlicker(el) {
    function tick() {
      const r = Math.random();
      let opacity, delay;

      if (r < 0.07) {
        // Sudden dip — gust of wind
        opacity = 0.18 + Math.random() * 0.18;
        delay   = 50  + Math.random() * 80;
      } else if (r < 0.22) {
        // Quick flutter
        opacity = 0.5  + Math.random() * 0.28;
        delay   = 70   + Math.random() * 120;
      } else {
        // Slow ambient drift
        opacity = 0.45 + Math.random() * 0.45;
        delay   = 200  + Math.random() * 600;
      }

      el.style.opacity = opacity.toFixed(2);
      flickerTimeout = setTimeout(tick, delay);
    }
    tick();
  }

  function stopFlicker() {
    clearTimeout(flickerTimeout);
    flickerTimeout = null;
  }

  // ── Two-layer parallax with lerp ─────────────────────────────────────────
  // mousemove only writes to target values — never touches the DOM directly.
  // A rAF loop smoothly chases targets each frame (LERP = 0.09).
  // Because targets and current both start at 0 (matching CSS defaults),
  // there is no snap on the first event — movement begins from rest.
  function attachParallax() {
    const SQ   = 110;   // must match --sq in landing.css
    const HALF = SQ / 2;
    const LERP = 0.09;

    onMouseMove = (e) => {
      const nx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      targetBdx = nx * 20;
      targetBdy = ny * 20;
      targetPdx = nx * 6;
      targetPdy = ny * 6;
    };

    function loop() {
      curBdx += (targetBdx - curBdx) * LERP;
      curBdy += (targetBdy - curBdy) * LERP;
      curPdx += (targetPdx - curPdx) * LERP;
      curPdy += (targetPdy - curPdy) * LERP;

      boardEl.style.backgroundPosition = [
        `${curBdx}px ${curBdy}px`,
        `${curBdx}px ${HALF + curBdy}px`,
        `${HALF + curBdx}px ${-HALF + curBdy}px`,
        `${-HALF + curBdx}px ${curBdy}px`,
      ].join(', ');

      contentEl.style.transform =
        `translate(${curPdx}px, ${curPdy}px) rotate(-0.4deg)`;

      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(loop);
  }

  // ── Click → PLACARD ───────────────────────────────────────────────────────
  function attachClick() {
    onClick = () => stateManager.transition('PLACARD');
    rootEl.addEventListener('click', onClick);
  }

  // ── Scene lifecycle ───────────────────────────────────────────────────────
  return {
    enter() {
      if (!rootEl) build();
      attachParallax();
      attachClick();
      startFlicker(promptEl);
      // Brief black pause before fading in — gives the browser a clear black
      // frame to start from so the emergence feels intentional, not abrupt.
      setTimeout(() => rootEl.classList.add('visible'), 150);
    },

    exit() {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      rootEl.removeEventListener('click', onClick);
      stopFlicker();

      rootEl.classList.add('fading-out');
      rootEl.classList.remove('visible');
      setTimeout(() => rootEl.remove(), 850);
    },
  };
}
