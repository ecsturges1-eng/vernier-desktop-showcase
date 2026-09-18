// ---------------------------------------------------------------------------
// Shared frame plumbing, motion language and palette for the six numbered
// Product pieces (01 Ingest -> 06 Defend). Loaded before each scene file;
// everything crosses the file boundary through window.PS.
// ---------------------------------------------------------------------------

const { clamp } = window;

const HAIR = 2;                          // lands as the toolkit's 1px hairline at display scale
const COMPACT_AT = 460;

function useCompact(canvasW) {
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    let f1 = 0, f2 = 0;
    const measure = () => {
      const w = document.documentElement.clientWidth || window.innerWidth || canvasW;
      const next = w < COMPACT_AT;
      setCompact((prev) => (prev === next ? prev : next));
    };
    f1 = requestAnimationFrame(() => { f2 = requestAnimationFrame(measure); });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(f1); cancelAnimationFrame(f2);
      window.removeEventListener("resize", measure);
    };
  }, [canvasW]);
  return compact;
}

// ResizeObserver does not fire in this document, and the stage measures its
// container once, before layout has settled. Polls until the fit converges,
// then stops.
function useStageFit(canvasW, canvasH) {
  React.useEffect(() => {
    let stop = false, timer = 0, lastW = -1, lastH = -1, settled = 0, corrected = false;
    const POLL = 120, NEEDED = 5, TOL = 0.02;
    const check = () => {
      if (stop) return;
      const svg = document.querySelector('svg[width="' + canvasW + '"]');
      const box = svg && svg.parentElement;
      if (box) {
        const pr = box.getBoundingClientRect();
        const w = Math.round(pr.width), h = Math.round(pr.height);
        if (w > 0 && h > 0) {
          const changed = w !== lastW || h !== lastH;
          lastW = w; lastH = h;
          const want = Math.min(w / canvasW, h / canvasH);
          const have = svg.getBoundingClientRect().width / canvasW;
          const off = want > 0 && Math.abs(have - want) / want > TOL;
          let fired = false;
          if (changed) { settled = 0; corrected = false; fired = true; }
          else if (off && !corrected) { corrected = true; fired = true; }
          if (fired) window.dispatchEvent(new Event("resize"));
          else settled += 1;
          if (settled >= NEEDED) return;
        }
      }
      timer = setTimeout(check, POLL);
    };
    timer = setTimeout(check, POLL);
    return () => { stop = true; clearTimeout(timer); };
  }, [canvasW, canvasH]);
}

// ---------------------------------------------------------------------------
// Motion language — literal values from Motion Spec.dc.html, one role per
// category of element. What a thing is decides how it moves.
// ---------------------------------------------------------------------------

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (p) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;
    for (let i = 0; i < 8; i++) {
      const e = fx(t) - p, d = dx(t);
      if (Math.abs(e) < 1e-6) break;
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (t < 0 || t > 1) {
      let lo = 0, hi = 1;
      t = p;
      for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (fx(t) < p) lo = t; else hi = t; }
    }
    return ((ay * t + by) * t + cy) * t;
  };
}

const REVEAL = bezier(0.16, 1, 0.3, 1);  // structural entrances, rule wipes
const REVEAL_MS = 0.52;                  // --dur-reveal
const TRAVEL = 12;
const STAGGER = 0.09;

const COUNT = bezier(0.22, 1, 0.36, 1);  // figures never spring
const COUNT_MS = 0.9;                    // --dur-count

const OUT = bezier(0.4, 0, 1, 1);        // content swap: out fast, in after a gap
const OUT_MS = 0.12;
const IN = bezier(0, 0, 0.2, 1);
const IN_MS = 0.18, IN_DELAY = 0.16, IN_TRAVEL = 6;

// A live signal travelling a wire: linear, no easing, no overshoot.
const LINEAR = (p) => clamp(p, 0, 1);

// spring/entrance 260 · 26 · 1 — the confirmation moment only, ~4% overshoot.
const SPRING = (() => {
  const k = 260, c = 26, m = 1;
  const w0 = Math.sqrt(k / m);
  const z = c / (2 * Math.sqrt(k * m));
  const wd = w0 * Math.sqrt(1 - z * z);
  return (p) => {
    if (p <= 0) return 0;
    const t = p * 0.72;
    const v = 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    return p >= 1 ? 1 : v;
  };
})();

// ---------------------------------------------------------------------------
// Type — one step down from the previous pass at every level, so the panels
// read at the density of an analyst tool rather than marketing display.
// Authored on a 1200px canvas shown near 600px, so these halve in practice.
// ---------------------------------------------------------------------------

const TYPE = (c) => ({
  hero:  (c ? "400 72px/1 "    : "400 54px/1 ")    + "var(--font-mono)",
  fig:   (c ? "400 34px/1.1 "  : "400 29px/1.1 ")  + "var(--font-mono)",
  figSm: (c ? "400 26px/1.1 "  : "400 22px/1.1 ")  + "var(--font-mono)",
  title: (c ? "500 30px/1.25 " : "500 23px/1.25 ") + "var(--font-sans)",
  body:  (c ? "400 26px/1.45 " : "400 21px/1.45 ") + "var(--font-sans)",
  label: (c ? "400 26px/1.2 "  : "400 19px/1.2 ")  + "var(--font-mono)",
  micro: (c ? "400 22px/1.2 "  : "400 16px/1.2 ")  + "var(--font-mono)"
});
const TRACK = ".12em";

// ---------------------------------------------------------------------------
// Palette. Ink and accent stay dominant. The functional tones are the DS3
// status tokens; --accent-series-4 carries "pending / in progress", which is
// the one functional state the toolkit has no status token for.
// Accent blue is reserved for active and connective elements — wires,
// highlights, progress — and is never used for inert structure.
// ---------------------------------------------------------------------------

const C = {
  paper: "#FFFFFF", sheet: "#F7F8FA", tint: "#EEF1FA",
  ink: "#06122A", slate: "#48546B", label: "#8A93A3",
  signal: "#2E4BA0", signalSoft: "#93A6DC",
  pos: "#067647", posTint: "#E6F2EB",
  neg: "#B3261E", negTint: "#FBEAE8",
  rule15: "#E2E5EB", rule25: "#C9CFD9",
  well: "#F7F8FA"
};

// ---------------------------------------------------------------------------
// Loop seam. Rather than snapping back to the first authored frame, the whole
// composition cross-fades down to a low-opacity resting state over the last
// beat, so the cycle boundary reads as a breath instead of a cut.
// ---------------------------------------------------------------------------

function loopFade(T, total, floor, lead) {
  const f = floor == null ? 0.15 : floor;
  const L = lead == null ? 0.7 : lead;
  if (!total || T <= total - L) return 1;
  const p = clamp((T - (total - L)) / L, 0, 1);
  return 1 - (1 - f) * REVEAL(p);
}

function fmt(n) { return Math.round(n).toLocaleString("en-GB"); }
function fmt1(n) { return n.toFixed(1); }

function polyD(pts) { return pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" "); }
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function perimAt(rect, pt) {
  const { x, y, w, h } = rect;
  if (Math.abs(pt[1] - y) < 2) return pt[0] - x;
  if (Math.abs(pt[0] - (x + w)) < 2) return w + (pt[1] - y);
  if (Math.abs(pt[1] - (y + h)) < 2) return w + h + (x + w - pt[0]);
  return 2 * w + h + (y + h - pt[1]);
}

// A short bright dash running the length of a wire — the visible cause that
// arrives just before its downstream effect moves.
function Pulse({ d, len, p, o, colour, dash, width }) {
  if (o <= 0.01 || p <= 0 || p >= 1) return null;
  const dl = Math.min(dash == null ? 120 : dash, len);
  return (
    <path d={d} fill="none" stroke={colour || C.signal} strokeWidth={width || 3}
      opacity={o} strokeLinejoin="miter" strokeLinecap="butt"
      strokeDasharray={dl + " " + (len + dl * 2)}
      strokeDashoffset={-(p * (len + dl) - dl)} />
  );
}

window.PS = {
  HAIR, COMPACT_AT, useCompact, useStageFit, bezier,
  REVEAL, REVEAL_MS, TRAVEL, STAGGER, COUNT, COUNT_MS,
  OUT, OUT_MS, IN, IN_MS, IN_DELAY, IN_TRAVEL, LINEAR, SPRING,
  TYPE, TRACK, C, loopFade, fmt, fmt1, polyD, polyLen, perimAt, Pulse
};
