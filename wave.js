/* Living brand current. One rAF loop drives:
   - the back canvas: navy field + the Saudi Energy ribbon (many thin strands between two twisting edges)
     with a travelling pulse, so every slide sits on the same continuous current;
   - the front canvas: the glowing wave edge of slide wipes and short honor sparks.
   Ribbon parameters tween on each slide change, so the ribbon morphs instead of cutting.
   Reduced motion: no loop, a single static frame is drawn whenever the slide changes. */
(function () {
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const back = document.getElementById("wave");
  const front = document.getElementById("fx");
  const bctx = back.getContext("2d");
  const fctx = front.getContext("2d");
  const KEYS = ["y", "amp", "freq", "tilt", "thick", "glow", "dim", "my"];
  const DEFAULTS = { y: .75, amp: .12, freq: 1, tilt: 0, thick: .12, glow: 1, dim: 0, my: .66 };
  let W = 0, H = 0, dpr = 1, raf = 0, last = 0, phase = 0, frontDirty = false;
  let cur = { ...DEFAULTS, glow: 0 }, from = { ...cur }, to = { ...cur }, t0 = 0, dur = 1;
  let ribbonGrad = null, bandGrad = null, fieldGrad = null, shield = null;
  let edge = null, sparks = [];
  const tasks = new Set();

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const full = p => { const o = { ...DEFAULTS }; KEYS.forEach(k => { if (p && p[k] !== undefined) o[k] = p[k]; }); return o; };
  const isMobile = () => W < 761;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [back, front].forEach(c => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); c.style.width = W + "px"; c.style.height = H + "px"; });
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ribbonGrad = bctx.createLinearGradient(0, 0, W, 0);
    ribbonGrad.addColorStop(0, "#2FD6A0"); ribbonGrad.addColorStop(.42, "#0076FF"); ribbonGrad.addColorStop(1, "#32C2FF");
    bandGrad = bctx.createLinearGradient(0, 0, W, 0);
    bandGrad.addColorStop(0, "rgba(47,214,160,.55)"); bandGrad.addColorStop(.45, "rgba(0,118,255,.7)"); bandGrad.addColorStop(1, "rgba(50,194,255,.6)");
    fieldGrad = bctx.createRadialGradient(W * .72, H * .22, 0, W * .6, H * .4, Math.max(W, H) * .9);
    fieldGrad.addColorStop(0, "#0b3b93"); fieldGrad.addColorStop(.55, "#06296f"); fieldGrad.addColorStop(1, "#031a4c");
    const logo = document.getElementById("brandLogo");
    if (logo) { const r = logo.getBoundingClientRect(); shield = r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(r.width, r.height) * 1.05 } : null; }
    paint(performance.now());
  }

  /* Effective ribbon geometry: on phones the ribbon is calmer and dimmer so text stays readable. */
  function geometry(p) {
    if (!isMobile()) return p;
    return { ...p, y: p.my, amp: p.amp * .55, thick: p.thick * .75, glow: p.glow * .55 };
  }
  function edgeY(g, u, side, ph) {
    const base = H * (g.y + g.tilt * (u - .5)) + g.amp * H * Math.sin(Math.PI * 2 * g.freq * u + ph);
    return base + side * g.thick * H * Math.sin(Math.PI * u * 1.3 + ph * .6 + 1.2);
  }

  function paintBack(t) {
    const g = geometry(cur);
    bctx.globalCompositeOperation = "source-over";
    bctx.globalAlpha = 1;
    bctx.fillStyle = fieldGrad; bctx.fillRect(0, 0, W, H);
    const strands = isMobile() ? 24 : 44, step = isMobile() ? 10 : 14;
    bctx.globalCompositeOperation = "lighter";
    // translucent band surface between the two edges
    bctx.globalAlpha = .3 * g.glow;
    bctx.fillStyle = bandGrad;
    bctx.beginPath();
    for (let x = -step; x <= W + step; x += step) bctx.lineTo(x, edgeY(g, x / W, -.5, phase));
    for (let x = W + step; x >= -step; x -= step) bctx.lineTo(x, edgeY(g, x / W, .5, phase));
    bctx.closePath(); bctx.fill();
    // strands
    bctx.strokeStyle = ribbonGrad; bctx.lineWidth = 1;
    for (let k = 0; k < strands; k++) {
      const s = k / (strands - 1) - .5;
      bctx.globalAlpha = (.07 + .26 * Math.pow(Math.abs(s) * 2, 3)) * g.glow;
      bctx.beginPath();
      for (let x = -step; x <= W + step; x += step) bctx.lineTo(x, edgeY(g, x / W, s, phase));
      bctx.stroke();
    }
    // travelling pulse: the current moving through the line, left to right
    if (!reduceMq.matches) {
      const head = -.15 + ((t * .00009) % 1.3);
      const len = .16, seg = 10;
      for (let i = 0; i < seg; i++) {
        const u0 = head - (i / seg) * len, u1 = head - ((i + 1) / seg) * len;
        const a = (1 - i / seg) * g.glow;
        bctx.globalAlpha = .9 * a; bctx.lineWidth = 2; bctx.strokeStyle = "#cfefff";
        bctx.beginPath(); bctx.moveTo(u0 * W, edgeY(g, u0, -.5, phase)); bctx.lineTo(u1 * W, edgeY(g, u1, -.5, phase)); bctx.stroke();
        bctx.globalAlpha = .12 * a; bctx.lineWidth = 9;
        bctx.stroke();
      }
    }
    bctx.globalCompositeOperation = "source-over";
    // keep the corner logo legible on any ribbon position
    if (shield && document.body.dataset.layout !== "end") {
      const rg = bctx.createRadialGradient(shield.x, shield.y, 0, shield.x, shield.y, shield.r);
      rg.addColorStop(0, "rgba(5,36,99,.97)"); rg.addColorStop(.6, "rgba(5,36,99,.75)"); rg.addColorStop(1, "rgba(5,36,99,0)");
      bctx.globalAlpha = 1; bctx.fillStyle = rg;
      bctx.fillRect(shield.x - shield.r, shield.y - shield.r, shield.r * 2, shield.r * 2);
    }
    if (g.dim > 0) { bctx.globalAlpha = g.dim; bctx.fillStyle = "#010a26"; bctx.fillRect(0, 0, W, H); }
    bctx.globalAlpha = 1;
  }

  function paintFront(dt) {
    if (!edge && !sparks.length) { if (frontDirty) { fctx.clearRect(0, 0, W, H); frontDirty = false; } return; }
    fctx.clearRect(0, 0, W, H); frontDirty = true;
    fctx.globalCompositeOperation = "lighter";
    if (edge && edge.length) {
      const grad = fctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#2FD6A0"); grad.addColorStop(.5, "#32C2FF"); grad.addColorStop(1, "#0076FF");
      [[14, .08], [5, .3], [1.6, 1]].forEach(([w, a]) => {
        fctx.globalAlpha = a; fctx.lineWidth = w; fctx.strokeStyle = w < 2 ? "#e6f7ff" : grad;
        fctx.beginPath(); edge.forEach(([x, y], i) => i ? fctx.lineTo(x, y) : fctx.moveTo(x, y)); fctx.stroke();
      });
    }
    sparks = sparks.filter(s => (s.life -= dt) > 0);
    sparks.forEach(s => {
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += .00002 * dt;
      const a = Math.min(1, s.life / 600) * Math.min(1, (s.max - s.life) / 120);
      fctx.globalAlpha = a; fctx.fillStyle = s.c;
      fctx.beginPath(); fctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); fctx.fill();
      fctx.globalAlpha = a * .18; fctx.beginPath(); fctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2); fctx.fill();
    });
    fctx.globalCompositeOperation = "source-over"; fctx.globalAlpha = 1;
  }

  function paint(t) { paintBack(t); paintFront(16); }

  function frame(t) {
    const dt = Math.min(64, t - (last || t)); last = t;
    phase += dt * .00028;
    const k = Math.min(1, (t - t0) / dur), e = ease(k);
    KEYS.forEach(key => { cur[key] = from[key] + (to[key] - from[key]) * e; });
    tasks.forEach(fn => { if (fn(t) === false) tasks.delete(fn); });
    paintBack(t); paintFront(dt);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !reduceMq.matches && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  window.Current = {
    /* Morph the ribbon to a slide's parameters over ms milliseconds. */
    setTarget(p, ms = 1500) {
      from = { ...cur }; to = full(p); t0 = performance.now(); dur = Math.max(1, ms);
      if (reduceMq.matches) { cur = { ...to }; paint(t0); }
    },
    /* Per-frame callbacks for the deck transition; return false to stop. */
    addTask(fn) { if (reduceMq.matches) return false; tasks.add(fn); start(); return true; },
    setEdge(points) { edge = points; },
    burst(rect, count = 46) {
      if (reduceMq.matches || !rect) return;
      for (let i = 0; i < count; i++) {
        const side = i % 4, f = Math.random();
        const x = side === 0 ? rect.left + f * rect.width : side === 1 ? rect.right : side === 2 ? rect.right - f * rect.width : rect.left;
        const y = side === 0 ? rect.top : side === 1 ? rect.top + f * rect.height : side === 2 ? rect.bottom : rect.bottom - f * rect.height;
        const ang = Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2)) + (Math.random() - .5) * .9;
        const sp = .02 + Math.random() * .05, max = 900 + Math.random() * 1300;
        sparks.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: max, max, size: .7 + Math.random() * 1.4, c: Math.random() < .35 ? "#ffffff" : "#7fd8ff" });
      }
    },
    /* Jump the ribbon to its target immediately (used for static rendering and checks). */
    settle() { cur = { ...to }; paint(performance.now()); },
    refresh: resize
  };

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
  reduceMq.addEventListener("change", () => { reduceMq.matches ? (stop(), cur = { ...to }, paint(performance.now())) : start(); });
  resize();
  start();
})();
