const collections = Array.from(document.querySelectorAll(".collection"));
const navLinks = Array.from(document.querySelectorAll(".nav__link"));

// Per-collection text color (each section keeps its own ink)
for (const section of collections) {
  const ink = section.dataset.ink || "#0f172a";
  section.style.setProperty("--section-ink", ink);
}

function setThemeFromSection(section) {
  const accent = section.dataset.accent || "#2F4A75";
  const surface = section.dataset.surface || "#EFEEE4";

  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--bg", surface);
}

function setActive(section) {
  for (const s of collections) s.classList.toggle("is-active", s === section);
  setThemeFromSection(section);

  const id = section.getAttribute("id");
  for (const a of navLinks) {
    const href = a.getAttribute("href") || "";
    a.classList.toggle("is-active", href === `#${id}`);
  }
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function computeVisibility(section, viewportMid, viewportH) {
  const r = section.getBoundingClientRect();
  const mid = r.top + r.height / 2;
  const dist = Math.abs(mid - viewportMid);
  const norm = dist / (viewportH * 0.9);
  const v = clamp01(1 - norm);
  // Bias towards visibility so content feels present earlier.
  return clamp01(Math.pow(v, 0.55));
}

let raf = 0;
function updateScenes() {
  raf = 0;
  const viewportH = Math.max(1, document.documentElement.clientHeight);
  const viewportMid = viewportH * 0.5;

  let best = collections[0];
  let bestV = -1;

  for (const section of collections) {
    const v = computeVisibility(section, viewportMid, viewportH);
    section.style.setProperty("--v", v.toFixed(4));
    if (v > bestV) {
      bestV = v;
      best = section;
    }
  }

  setActive(best);
}

function scheduleUpdate() {
  if (raf) return;
  raf = requestAnimationFrame(updateScenes);
}

addEventListener("scroll", scheduleUpdate, { passive: true });
addEventListener("resize", scheduleUpdate, { passive: true });

// Initialize
updateScenes();

// Smooth anchor scrolling (avoid in reduced motion)
const prefersReduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
if (!prefersReduced) {
  document.documentElement.style.scrollBehavior = "smooth";
}

// Better mobile swipe feel: prevent accidental vertical scroll lock on horizontal galleries
for (const g of document.querySelectorAll(".gallery")) {
  g.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // If horizontally scrollable and user scrolls wheel, map to horizontal.
      if (g.scrollWidth <= g.clientWidth) return;
      if (Math.abs(e.deltaY) < 2) return;
      g.scrollLeft += e.deltaY;
    },
    { passive: true },
  );
}

