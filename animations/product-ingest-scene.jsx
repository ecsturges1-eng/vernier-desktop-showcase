const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider } = window;

const W = 1200, H = 760;

// ---- Shared frame plumbing ----
// Authored on a 1200px canvas displayed at ~600px desktop, ~340px mobile.
// HAIR=2 so rules land as the toolkit's 1px hairline at desktop size.
const HAIR = 2;
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
          if (changed) {
            settled = 0; corrected = false; fired = true;
          } else if (off && !corrected) {
            corrected = true; fired = true;   // one-shot, never per frame
          }
          if (fired) window.dispatchEvent(new Event("resize"));
          else settled += 1;
          if (settled >= NEEDED) return;      // quiet for N polls: stop
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
// category of element. No shared "enter/draw/settle" triple: what a thing is
// decides how it moves.
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
    for (let i = 0; i < 8; i++) {          // Newton, then bisect as a fallback
      const e = fx(t) - p, d = dx(t);
      if (Math.abs(e) < 1e-6) break;
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (t < 0 || t > 1) {
      let lo = 0, hi = 1;
      t = p;
      for (let i = 0; i < 24; i++) {
        t = (lo + hi) / 2;
        if (fx(t) < p) lo = t; else hi = t;
      }
    }
    return ((ay * t + by) * t + cy) * t;
  };
}

// Structural entrances and rule wipes. The instrument arriving: no overshoot.
const REVEAL = bezier(0.16, 1, 0.3, 1);
const REVEAL_MS = 0.52;                  // --dur-reveal
const TRAVEL = 12;                       // px
const STAGGER = 0.09;                    // 90ms base

// Numbers never spring — an overshooting figure reads as a wrong value on the
// way past. One clock drives figure and bar so they land on the same frame.
const COUNT = bezier(0.22, 1, 0.36, 1);
const COUNT_MS = 0.9;                    // --dur-count

// Panel content swap. Outgoing leaves faster than the incoming arrives, with a
// 40ms gap so the two states are never legible at once.
const OUT = bezier(0.4, 0, 1, 1);
const OUT_MS = 0.12;
const IN = bezier(0, 0, 0.2, 1);
const IN_MS = 0.18, IN_DELAY = 0.16, IN_TRAVEL = 6;

// spring/entrance 260 · 26 · 1. Reserved for the confirmation moment: a seal
// clicking into place, ~4% overshoot and no larger.
const SPRING = (() => {
  const k = 260, c = 26, m = 1;
  const w0 = Math.sqrt(k / m);
  const z = c / (2 * Math.sqrt(k * m));
  const wd = w0 * Math.sqrt(1 - z * z);
  return (p) => {
    if (p <= 0) return 0;
    const t = p * 0.72;                  // settles just past the 560ms mark
    const v = 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    return p >= 1 ? 1 : v;
  };
})();

const TYPE = (c) => ({
  hero:  (c ? "400 84px/1 "    : "400 64px/1 ")    + "var(--font-mono)",
  fig:   (c ? "400 40px/1.1 "  : "400 34px/1.1 ")  + "var(--font-mono)",
  title: (c ? "500 34px/1.25 " : "500 26px/1.25 ") + "var(--font-sans)",
  body:  (c ? "400 30px/1.45 " : "400 24px/1.45 ") + "var(--font-sans)",
  label: (c ? "400 32px/1.2 "  : "400 22px/1.2 ")  + "var(--font-mono)"
});
const TRACK = ".12em";

// Vernier 3 palette, shared with the other five Product pieces:
// white ground, one navy ink, one accent blue used sparingly.
const C = {
  paper: "#FFFFFF", sheet: "#F7F8FA", tint: "#EEF1FA",
  ink: "#06122A", slate: "#48546B", label: "#8A93A3",
  signal: "#2E4BA0",
  rule15: "#E2E5EB", rule25: "#C9CFD9",
  well: "#F7F8FA"
};

const CARD = { x: 40, w: 540, h: 88 };
const CARD_Y = [96, 216, 336, 456, 576];
const TRUNK_X = 610;
// Panel zones, declared once and summed: the height is not chosen independently
// of what it holds. Sized for the compact scale (the taller of the two).
const PANEL_PAD = 26;
const HEAD_Z = 38;                       // compact label, 32px at 1.2
const HEAD_GAP = 14;
const CONTENT_Z = { desktop: 92, compact: 112 };   // hero + gap + bar
const FOOT_Z = 58;                       // rule + 18 pad + compact label
const MIN_GAP = 20;                      // content region to footer, never 0
const BOX_H = PANEL_PAD * 2 + HEAD_Z + HEAD_GAP + CONTENT_Z.compact + MIN_GAP + FOOT_Z;
const BOX = { x: 660, y: Math.round((760 - BOX_H) / 2), w: 460, h: BOX_H };
const JOIN = [BOX.x, BOX.y + BOX.h / 2];

const SOURCES = [
  { title: "Sector news", meta: "TRADE PRESS" },
  { title: "Regulatory updates", meta: "EEA · UK · US" },
  { title: "Competitor analysis", meta: "12 PROVIDERS" },
  { title: "Transaction ledger", meta: "84.7K ROWS" },
  { title: "Contract terms", meta: "1,806 DOCS" }
];

const TOTAL = 84720;
function fmt(n) { return Math.round(n).toLocaleString("en-GB"); }

const DASH = 150, NODE = 10;

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

// A highlight runs the full border of a card, then departs along its connector.
// This is a live stream, not an entrance: linear, no easing, no overshoot.
function Trace({ rect, route, p, o }) {
  const { x, y, w, h } = rect;
  const P = 2 * (w + h);
  const q = clamp(p / 0.58, 0, 1);
  const r2 = clamp((p - 0.54) / 0.46, 0, 1);
  const dl = Math.min(DASH, route.len);
  const oRect = o * clamp((0.62 - p) / 0.05, 0, 1);
  const oLine = o * clamp((p - 0.54) / 0.05, 0, 1) * clamp((1 - p) / 0.1, 0, 1);
  return (
    <g>
      {oRect > 0.01 ? (
        <rect x={x} y={y} width={w} height={h} fill="none"
          stroke={C.signal} strokeWidth="3" opacity={oRect}
          strokeDasharray={DASH + " " + P} strokeDashoffset={-(q * P + route.dEx - DASH)} />
      ) : null}
      {oLine > 0.01 ? (
        <path d={route.d} fill="none" stroke={C.signal} strokeWidth="3" opacity={oLine}
          strokeLinejoin="miter" strokeLinecap="butt"
          strokeDasharray={dl + " " + (route.len + DASH * 2)}
          strokeDashoffset={-(r2 * (route.len + dl) - dl)} />
      ) : null}
    </g>
  );
}

const ROUTES = CARD_Y.map((y) => {
  const rect = { x: CARD.x, y, w: CARD.w, h: CARD.h };
  const cy = y + CARD.h / 2;
  const pts = cy === JOIN[1]
    ? [[CARD.x + CARD.w, cy], JOIN]
    : [[CARD.x + CARD.w, cy], [TRUNK_X, cy], [TRUNK_X, JOIN[1]], JOIN];
  return { rect, d: polyD(pts), len: polyLen(pts), dEx: perimAt(rect, pts[0]) };
});

function Ingest({ tw }) {
  const { T, CUES } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  const radius = tw.radius;
  const t = TYPE(compact);
  const showMeta = tw.labels && !compact;

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  // Structural: the panel and the source frames arriving.
  const shell = at(CUES.Sources + 0.04, REVEAL_MS, REVEAL);

  // A sequence being assembled — row by row at the spec's cadence, so five
  // sources read as a five-beat build rather than one flat move.
  const ROW0 = CUES.Sources + 0.16;
  const card = (i) => at(ROW0 + STAGGER * i, REVEAL_MS, REVEAL);
  const lastCard = ROW0 + STAGGER * (SOURCES.length - 1) + REVEAL_MS;

  // Each connector wipes once its own card has settled. 420ms, same bezier as
  // the accent rule in the spec.
  const draw = (i) => at(ROW0 + STAGGER * i + REVEAL_MS * 0.75, 0.42, REVEAL);
  const node = at(lastCard - 0.1, 0.42, REVEAL);

  // The stream runs while sources are being read, then thins.
  const stream = clamp(
    at(CUES.Flow - 0.2, 0.56, REVEAL) - 0.6 * at(CUES.Settle + 0.4, 0.8, REVEAL), 0, 1);

  // Panel content swap: shell holds still, only the content region changes.
  const swapAt = CUES.Collate;
  const outgoing = 1 - at(swapAt, OUT_MS, OUT);
  const incoming = at(swapAt + IN_DELAY, IN_MS, IN);

  // One clock for figure and bar.
  const countP = at(swapAt + IN_DELAY, COUNT_MS, COUNT);
  const count = countP * TOTAL;

  // The confirmation moment: the reading seals once the count has landed.
  const seal = at(swapAt + IN_DELAY + COUNT_MS + 0.08, 0.56, SPRING);  // --dur-confirm
  const conf = at(CUES.Settle + 0.1, REVEAL_MS, REVEAL);

  // All five highlights share one clock. A 30ms-equivalent offset keeps the
  // rows distinguishable while reading as a single sweep down the stack.
  const TRACE_LAG = 0.03;
  const traces = ROUTES.map((r, i) => ({
    key: i, route: r,
    p: (((T - CUES.Flow) * tw.speed * 0.5 - i * TRACE_LAG) % 1 + 1) % 1
  }));

  const CONTENT_H = compact ? CONTENT_Z.compact : CONTENT_Z.desktop;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden", fontFamily: "var(--font-sans)" }}>

      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {ROUTES.map((r, i) => (
          <path key={i} d={r.d} fill="none"
            stroke={C.rule25} strokeWidth={HAIR} strokeLinejoin="miter" strokeLinecap="butt"
            strokeDasharray={r.len} strokeDashoffset={r.len * (1 - draw(i))} />
        ))}
        <rect x={JOIN[0] - NODE / 2} y={JOIN[1] - NODE / 2} width={NODE} height={NODE}
          fill={C.ink} opacity={node} />
        {traces.map((tr) => (
          <Trace key={tr.key} rect={tr.route.rect} route={tr.route} p={tr.p} o={stream} />
        ))}
      </svg>

      {SOURCES.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: CARD.x, top: CARD_Y[i], width: CARD.w, height: CARD.h,
          boxSizing: "border-box", background: C.paper,
          border: `${HAIR}px solid ${C.rule15}`, borderRadius: radius,
          padding: "0 28px", display: "flex", alignItems: "center", gap: 20,
          opacity: card(i), transform: `translateY(${(1 - card(i)) * TRAVEL}px)`
        }}>
          <span style={{ flex: "none", whiteSpace: "nowrap", font: t.title, color: C.ink }}>{s.title}</span>
          <span style={{ flex: 1 }} />
          {showMeta ? (
            <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>{s.meta}</span>
          ) : null}
        </div>
      ))}

      {/* Panel shell — frame, header and footer never animate after arrival. */}
      <div style={{
        position: "absolute", left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h,
        boxSizing: "border-box", background: C.paper, border: `${HAIR}px solid ${C.rule25}`, borderRadius: radius, overflow: "hidden",
        padding: `${PANEL_PAD}px 34px`, display: "flex", flexDirection: "column",
        opacity: shell, transform: `translateY(${(1 - shell) * TRAVEL}px)`
      }}>
        <span style={{ flex: "none", font: t.label, letterSpacing: TRACK, color: C.label }}>RECORDS COLLATED</span>

        <div style={{ position: "relative", flex: "none", height: CONTENT_H, marginTop: HEAD_GAP }}>
          <span style={{
            position: "absolute", left: 0, top: 6, whiteSpace: "nowrap",
            font: t.label, letterSpacing: TRACK, color: C.label, opacity: outgoing
          }}>AWAITING SOURCES</span>

          <div style={{
            position: "absolute", left: 0, right: 0, top: 0,
            opacity: incoming, transform: `translateY(${(1 - incoming) * IN_TRAVEL}px)`,
            display: "flex", flexDirection: "column", gap: 20
          }}>
            <span style={{ font: t.hero, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(count)}</span>
            {/* Bar is bound to the count's clock, so figure and fill land together. */}
            <span style={{ display: "block", height: 8, background: C.well }}>
              <span style={{ display: "block", height: 8, width: `${countP * 100}%`, background: C.signal }} />
            </span>
          </div>
        </div>

        <span style={{ flex: 1, minHeight: MIN_GAP }} />

        <div style={{
          flex: "none", borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 18,
          display: "flex", alignItems: "center", gap: 14
        }}>
          <span style={{
            flex: "none", width: 20, height: 20, background: C.signal,
            opacity: clamp(seal * 4, 0, 1), transform: `scale(${seal})`
          }} />
          <span style={{
            whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.ink,
            opacity: clamp(seal * 2, 0, 1)
          }}>COLLATED</span>
        </div>
      </div>

      {compact ? null : (
        <div style={{
          position: "absolute", left: BOX.x, top: BOX.y + BOX.h + 32, width: BOX.w,
          opacity: conf, transform: `translateY(${(1 - conf) * TRAVEL}px)`,
          font: t.label, letterSpacing: TRACK, color: C.label
        }}>FIVE SOURCES · CONF 0.94</div>
      )}
    </div>
  );
}

function IngestPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <Ingest tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Flow" />
        <TweakSlider label="Data speed" value={tw.speed} min={0.15} max={0.8} step={0.05} onChange={(v) => setTweak("speed", v)} />
        <TweakToggle label="Source labels" value={tw.labels} onChange={(v) => setTweak("labels", v)} />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.IngestPiece = IngestPiece;
