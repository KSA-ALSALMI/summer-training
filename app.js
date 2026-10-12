/* Deck renderer, navigation and the wave-wipe transition. Copy lives in content.js. */
const slides = window.SLIDES;
const deck = document.querySelector("#deck");
const currentSlide = document.querySelector("#currentSlide");
const totalSlides = document.querySelector("#totalSlides");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
let activeIndex = 0;
let isAnimating = false;
let coolUntil = 0;
let touchStartY = null;
const timers = [];

function pad(value) { return String(value).padStart(2, "0"); }
function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[char])); }

/* Markup helpers. r(i) = staggered fade-up, words() = per-word masked reveal. */
function r(i, cls = "") { return `class="rv ${cls}" style="--i:${i}"`; }
function words(text, start = 0) { return String(text).split(" ").map((w, i) => `<span class="w"><span style="--wi:${start + i}">${escapeHtml(w)}</span></span>`).join(" "); }
function img(src, alt, cls = "") { return `<img ${cls ? `class="${cls}" ` : ""}src="./assets/photos/${escapeHtml(src)}" alt="${escapeHtml(alt)}" decoding="async" draggable="false" />`; }
function eyebrow(s, i = 0) { return s.eyebrow ? `<p ${r(i, "eyebrow")}>${escapeHtml(s.eyebrow)}</p>` : ""; }
function count(value, decimals = 0) { return `<span class="count" data-to="${value}" data-dec="${decimals}">${Number(value).toFixed(decimals)}</span>`; }

const layouts = {
  cover: s => `<div class="slide-content">
    ${eyebrow(s, 0)}
    <h1 class="kinetic">${words(s.title)}</h1>
    <p ${r(6, "cover-name")}>${escapeHtml(s.name)} <span>${escapeHtml(s.id)}</span></p>
    <p ${r(7, "cover-meta")}>${s.meta.map(escapeHtml).join("<br />")}</p>
  </div>`,

  bleed: s => `<figure class="bleed"><div class="plx" style="--d:-14"><div class="kb">${img(s.image, s.alt)}</div></div></figure><span class="bleed-scrim"></span>
  <div class="slide-content">
    <h1 class="kinetic">${words(s.title, 2)}</h1>
    <p ${r(6, "body-copy")}>${escapeHtml(s.body)}</p>
    <p ${r(7, "bleed-caption")}>${escapeHtml(s.caption)}</p>
  </div>`,

  numbers: s => `<div class="slide-content">
    <h1 class="kinetic">${words(s.title)}</h1>
    <div class="num-grid">
      <div class="big-eight">
        <svg viewBox="0 0 260 340" role="img" aria-label="${escapeHtml(s.big.value + " " + s.big.label)}">
          <defs><linearGradient id="eightGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#32C2FF" /><stop offset=".55" stop-color="#0076FF" /><stop offset="1" stop-color="#2FD6A0" /></linearGradient></defs>
          <text x="130" y="300" text-anchor="middle" class="eight">${escapeHtml(s.big.value)}</text>
        </svg>
        <div ${r(3, "eight-cap")}><p class="eight-label">${escapeHtml(s.big.label)}</p><p class="eight-sub">${escapeHtml(s.big.sub)}</p></div>
      </div>
      <ul class="stats">${s.stats.map((x, i) => `<li ${r(i + 4, "stat")}><p class="stat-num">${count(x.value, x.decimals)}${x.unit ? `<span class="unit">${escapeHtml(x.unit)}</span>` : ""}</p><p class="stat-label">${escapeHtml(x.label)}</p></li>`).join("")}</ul>
    </div>
  </div>`,

  journey: s => {
    const total = s.phases.reduce((sum, p) => sum + p.weeks, 0);
    let week = 0;
    const cells = s.phases.map((p, pi) => Array.from({ length: p.weeks }, () => { week += 1; return `<li class="week phase-${pi}" style="--w:${week}"><span>${week}</span></li>`; }).join("")).join("");
    return `<div class="slide-content">
      <h1 class="kinetic">${words(s.title)}</h1>
      <div class="track" style="--cols:${s.phases.map(p => `${p.weeks}fr`).join(" ")}; --total:${total}">
        <div class="weeks-wrap"><ol class="weeks" aria-label="Weeks">${cells}</ol><span class="trace" aria-hidden="true"><i></i></span></div>
        <div class="phases">${s.phases.map((p, pi) => `<div ${r(pi * 3 + 6, `phase phase-${pi}`)}><p class="phase-range">${escapeHtml(p.range)}</p><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.body)}</p></div>`).join("")}</div>
      </div>
    </div>`;
  },

  split: s => `<div class="slide-content">
    <div class="text-col">
      ${eyebrow(s, 0)}
      <h1 class="kinetic">${words(s.title, 1)}</h1>
      <p ${r(5, "body-copy")}>${escapeHtml(s.body)}</p>
      <div ${r(6, "beats")}>
        <div class="beat"><p class="beat-key">${escapeHtml(s.challengeLabel)}</p><p>${escapeHtml(s.challenge)}</p></div>
        <span class="flow" aria-hidden="true"></span>
        <div class="beat beat--answer"><p class="beat-key">${escapeHtml(s.solutionLabel)}</p><p>${escapeHtml(s.solution)}</p></div>
      </div>
      <p ${r(8, "quiet")}>${escapeHtml(s.link)}</p>
    </div>
    <figure class="split-photo curtain"><div class="bezel"><div class="frame"><div class="plx" style="--d:10"><div class="kb">${img(s.image, s.caption)}</div></div></div></div><figcaption ${r(9)}>${escapeHtml(s.caption)}</figcaption></figure>
  </div>`,

  bento: s => `<div class="slide-content">
    <div class="bento-head"><h1 class="kinetic">${words(s.title)}</h1><p ${r(3, "body-copy")}>${escapeHtml(s.body)}</p></div>
    <div class="bento">${s.images.map((item, i) => `<figure class="tile tile-${i} curtain" style="--c:${i}"><div class="plx" style="--d:${8 + i * 3}">${img(item.src, item.caption)}</div><figcaption>${escapeHtml(item.caption)}</figcaption></figure>`).join("")}</div>
  </div>`,

  statement: s => `<div class="slide-content">
    <h1 class="kinetic kinetic--slow">${words(s.title)}</h1>
    <p ${r(8, "body-copy")}>${escapeHtml(s.body)}</p>
  </div>`,

  factors: s => `<div class="slide-content">
    ${eyebrow(s, 0)}
    <h1 class="kinetic">${words(s.title, 1)}</h1>
    <p ${r(5, "body-copy")}>${escapeHtml(s.body)}</p>
    <ul class="factor-grid">${s.factors.map((f, i) => `<li class="factor" style="--f:${i}"><span>${escapeHtml(f)}</span></li>`).join("")}</ul>
    <div ${r(12, "recs-line")}><p class="recs-label">${escapeHtml(s.recsLabel)}</p><ul>${s.recs.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>
    <p ${r(13, "quiet")}>${escapeHtml(s.link)}</p>
  </div>`,

  takeaways: s => {
    const group = (label, items, cls, i) => `<section ${r(i, `group ${cls}`)}><h2>${escapeHtml(label)}</h2><dl>${items.map(x => `<div><dt>${escapeHtml(x.key)}</dt><dd>${escapeHtml(x.text)}</dd></div>`).join("")}</dl></section>`;
    return `<div class="slide-content">
      <h1 class="kinetic">${words(s.title)}</h1>
      <div class="groups">${group(s.learnedLabel, s.learned, "group--learned", 5)}${group(s.challengesLabel, s.challenges, "group--challenges", 7)}</div>
    </div>`;
  },

  honor: s => `<div class="slide-content honor--${escapeHtml(s.variant)}">
    <figure class="honor-photo"><span class="spot" aria-hidden="true"></span><span class="rays" aria-hidden="true"></span><div class="bezel"><div class="frame"><div class="plx" style="--d:8">${img(s.image, s.alt)}</div></div><span class="beam" aria-hidden="true"></span></div></figure>
    <div class="honor-text">
      <h1 class="land"><span class="h-lead">${words(s.lead)}</span> ${words(s.title, 2)}</h1>
      <p ${r(14, "body-copy")}>${escapeHtml(s.body)}</p>
    </div>
  </div>`,

  recs: s => `<div class="slide-content">
    <h1 class="kinetic">${words(s.title)}</h1>
    <dl class="rec-list">${s.items.map((x, i) => `<div ${r(i * 3 + 3, "rec")}><span class="rec-line" aria-hidden="true"></span><dt>${escapeHtml(x.to)}</dt><dd>${escapeHtml(x.text)}</dd></div>`).join("")}</dl>
  </div>`,

  end: s => `<div class="slide-content">
    <img class="end-logo" src="./assets/logo.svg" alt="Saudi Energy" draggable="false" />
    <h1 class="kinetic kinetic--late">${words(s.title)}</h1>
    <p ${r(14, "body-copy")}>${escapeHtml(s.body)}</p>
  </div>`
};

function slideMarkup(slide, index) {
  const on = index === activeIndex;
  return `<section class="slide layout-${slide.layout}${on ? " is-active is-current" : ""}" data-index="${index}" aria-label="Slide ${index + 1} of ${slides.length}" aria-hidden="${!on}">${layouts[slide.layout](slide)}</section>`;
}
function render() {
  deck.innerHTML = slides.map(slideMarkup).join("");
  totalSlides.textContent = pad(slides.length);
  updateUi();
  arrive(activeIndex);
}
function updateUi() {
  currentSlide.textContent = pad(activeIndex + 1);
  prevButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === slides.length - 1;
  document.body.dataset.layout = slides[activeIndex].layout;
  document.documentElement.style.setProperty("--progress", ((activeIndex + 1) / slides.length).toFixed(4));
}

/* Things that start when a slide becomes current: counters, honor sparks. */
function arrive(index) {
  timers.splice(0).forEach(clearTimeout);
  const el = deck.querySelector(`[data-index="${index}"]`);
  if (!el) return;
  el.querySelectorAll(".count").forEach(node => runCounter(node));
  if (slides[index].layout === "honor") {
    timers.push(setTimeout(() => { const f = el.querySelector(".honor-photo .bezel"); if (f && el.classList.contains("is-current")) window.Current.burst(f.getBoundingClientRect()); }, 1700));
  }
}
function runCounter(node) {
  const target = Number(node.dataset.to), dec = Number(node.dataset.dec);
  if (reduceMq.matches) { node.textContent = target.toFixed(dec); return; }
  const t0 = performance.now() + 450, length = 1700;
  node.textContent = (0).toFixed(dec);
  window.Current.addTask(t => {
    const k = Math.max(0, Math.min(1, (t - t0) / length));
    node.textContent = (target * (1 - Math.pow(2, -10 * k))).toFixed(dec);
    if (k >= 1) { node.textContent = target.toFixed(dec); return false; }
    return true;
  });
}

/* Wave-wipe: the incoming slide is revealed below (or above) a moving sine edge, the outgoing slide keeps
   only the other side and sinks back with scale and blur. The front canvas draws the same edge as a glowing current. */
function wavePoints(p, dir, W, H) {
  const A = H * (.025 + .06 * Math.sin(Math.PI * p));
  const base = dir > 0 ? (H + A) + (-A - (H + A)) * p : -A + (H + 2 * A) * p;
  const pts = [];
  for (let i = 0; i <= 28; i++) { const u = i / 28; pts.push([u * W, base + A * Math.sin(u * Math.PI * 2 * 1.1 + p * 5)]); }
  return pts;
}
const poly = list => `polygon(${list.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
function setStates(oldIndex) {
  deck.querySelectorAll(".slide").forEach(el => {
    const i = Number(el.dataset.index), on = i === activeIndex;
    el.classList.toggle("is-active", on); el.classList.toggle("is-current", on);
    el.setAttribute("aria-hidden", String(!on));
    if (i === oldIndex || on) { el.style.clipPath = ""; el.style.transform = ""; el.style.opacity = ""; el.style.filter = ""; }
  });
}
function goTo(nextIndex) {
  if (isAnimating || performance.now() < coolUntil || nextIndex < 0 || nextIndex >= slides.length || nextIndex === activeIndex) return;
  const dir = nextIndex > activeIndex ? 1 : -1;
  const oldIndex = activeIndex;
  const outEl = deck.querySelector(`[data-index="${oldIndex}"]`);
  const inEl = deck.querySelector(`[data-index="${nextIndex}"]`);
  activeIndex = nextIndex;
  updateUi();
  window.Current.setTarget(slides[nextIndex].wave, 1600);
  if (reduceMq.matches) { setStates(oldIndex); arrive(nextIndex); return; }
  isAnimating = true;
  outEl.classList.remove("is-current");
  inEl.classList.add("is-active", "is-current");
  inEl.setAttribute("aria-hidden", "false"); outEl.setAttribute("aria-hidden", "true");
  arrive(nextIndex);
  const W = window.innerWidth, H = window.innerHeight, small = W < 761;
  const t0 = performance.now(), length = small ? 950 : 1150;
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const started = window.Current.addTask(t => {
    const p = easeIO(Math.min(1, (t - t0) / length));
    const pts = wavePoints(p, dir, W, H);
    const rev = pts.slice().reverse();
    if (dir > 0) { inEl.style.clipPath = poly([...pts, [W, H], [0, H]]); outEl.style.clipPath = poly([[0, 0], [W, 0], ...rev]); }
    else { inEl.style.clipPath = poly([[0, 0], [W, 0], ...rev]); outEl.style.clipPath = poly([...pts, [W, H], [0, H]]); }
    outEl.style.transform = `translateY(${-dir * 3 * p}%) scale(${1 - .06 * p})`;
    outEl.style.opacity = String(1 - .55 * p);
    if (!small) outEl.style.filter = `blur(${(5 * p).toFixed(2)}px)`;
    window.Current.setEdge(p < 1 ? pts : null);
    if (p >= 1) { finish(); return false; }
    return true;
  });
  function finish() { setStates(oldIndex); isAnimating = false; coolUntil = performance.now() + 250; window.Current.setEdge(null); }
  if (!started) finish();
}
function next() { goTo(activeIndex + 1); }
function previous() { goTo(activeIndex - 1); }

prevButton.addEventListener("click", previous);
nextButton.addEventListener("click", next);
/* LTR: ArrowRight moves forward, ArrowLeft moves back. */
window.addEventListener("keydown", event => {
  if (event.target.closest && event.target.closest("button") && (event.key === " " || event.key === "Enter")) return;
  if (["ArrowDown", "PageDown", "ArrowRight", " "].includes(event.key)) { event.preventDefault(); next(); }
  else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(event.key)) { event.preventDefault(); previous(); }
  else if (event.key === "Home") { event.preventDefault(); goTo(0); }
  else if (event.key === "End") { event.preventDefault(); goTo(slides.length - 1); }
});
window.addEventListener("wheel", event => { if (Math.abs(event.deltaY) > 12) { event.preventDefault(); event.deltaY > 0 ? next() : previous(); } }, { passive: false });
window.addEventListener("touchstart", event => { touchStartY = event.changedTouches[0].clientY; }, { passive: true });
window.addEventListener("touchend", event => { if (touchStartY === null) return; const distance = touchStartY - event.changedTouches[0].clientY; if (Math.abs(distance) > 45) distance > 0 ? next() : previous(); touchStartY = null; }, { passive: true });

/* Pointer parallax on photos: fine pointers only, never under reduced motion. */
(function parallax() {
  let tx = 0, ty = 0, x = 0, y = 0, running = false;
  const step = () => {
    x += (tx - x) * .08; y += (ty - y) * .08;
    const el = deck.querySelector(".slide.is-current");
    if (el) { el.style.setProperty("--px", x.toFixed(3)); el.style.setProperty("--py", y.toFixed(3)); }
    if (Math.abs(tx - x) < .001 && Math.abs(ty - y) < .001) { running = false; return false; }
    return true;
  };
  window.addEventListener("pointermove", e => {
    if (!finePointer.matches || reduceMq.matches) return;
    tx = (e.clientX / window.innerWidth - .5) * 2; ty = (e.clientY / window.innerHeight - .5) * 2;
    if (!running) running = window.Current.addTask(step);
  }, { passive: true });
})();

window.Current.setTarget(slides[0].wave, 2400);
render();
