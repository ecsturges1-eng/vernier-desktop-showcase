const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider } = window;

const W = 1200, H = 760;

// ---- Shared frame plumbing ----
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

const TYPE = (c) => ({
  hero:  (c ? "400 84px/1 "    : "400 64px/1 ")    + "var(--font-mono)",
  fig:   (c ? "400 40px/1.1 "  : "400 34px/1.1 ")  + "var(--font-mono)",
  title: (c ? "500 34px/1.25 " : "500 26px/1.25 ") + "var(--font-sans)",
  body:  (c ? "400 30px/1.45 " : "400 24px/1.45 ") + "var(--font-sans)",
  label: (c ? "400 32px/1.2 "  : "400 22px/1.2 ")  + "var(--font-mono)"
});
const TRACK = ".12em";

const C = {
  bg: "#FFFFFF", ink: "#06122A", dim: "#48546B", label: "#8A93A3",
  rule: "#E2E5EB", ruleStrong: "#C9CFD9", accent: "#2E4BA0", well: "#F7F8FA", tint: "#EEF1FA",
  good: "#067647"
};
const RAMP = ["#1B2E63", "#2E4BA0", "#5B77C4", "#93A6DC", "#C6D1EE"];

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

const PAD = 36;
const PANEL = { x: 40, y: 56, w: 680, h: 648 };
const PLOT = { x: 80, y: 232, w: 520, h: 268 };   // panel-relative
const CARD = { x: 760, y: 192, w: 400, h: 408 };

const LIST = 0.40, MEDIAN = 0.66, REC = 0.56;

const DASH = 150, NODE = 10;
const EXIT_Y = PANEL.y + PLOT.y - 34;
const TRUNK_X = 732;
const LINK_Y = CARD.y + 88;
const LINK = [[PANEL.x + PANEL.w, EXIT_Y], [TRUNK_X, EXIT_Y], [TRUNK_X, LINK_Y], [CARD.x, LINK_Y]];

function rnd(i) {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

// Market price distribution, 13 bins of observed competitor prices.
const BINS = Array.from({ length: 13 }, (_, i) => {
  const x = (i + 0.5) / 13;
  const g = Math.exp(-Math.pow((x - 0.6) / 0.23, 2));
  return { x, v: clamp(g * (0.84 + (rnd(i) - 0.5) * 0.34), 0.06, 1) };
});

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
function Node({ at, o }) {
  return <rect x={at[0] - NODE / 2} y={at[1] - NODE / 2} width={NODE} height={NODE} fill={C.ink} opacity={o} />;
}

function Trace({ rect, route, p, o, radius }) {
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
        <rect x={x} y={y} width={w} height={h} rx={radius} fill="none"
          stroke={C.accent} strokeWidth="3" opacity={oRect}
          strokeDasharray={DASH + " " + P} strokeDashoffset={-(q * P + route.dEx - DASH)} />
      ) : null}
      {oLine > 0.01 ? (
        <path d={route.d} fill="none" stroke={C.accent} strokeWidth="3" opacity={oLine}
          strokeLinejoin="miter" strokeLinecap="butt"
          strokeDasharray={dl + " " + (route.len + DASH * 2)}
          strokeDashoffset={-(r2 * (route.len + dl) - dl)} />
      ) : null}
    </g>
  );
}

const PANEL_RECT = { x: PANEL.x, y: PANEL.y, w: PANEL.w, h: PANEL.h };
const LEG = [[PANEL.x + PLOT.x + REC * PLOT.w, EXIT_Y], [PANEL.x + PANEL.w, EXIT_Y]];
const LEG_D = polyD(LEG), LEG_LEN = polyLen(LEG), LINK_D = polyD(LINK);
const PULSE_ROUTE = { d: polyD(LEG.concat(LINK.slice(1))), len: polyLen(LEG.concat(LINK.slice(1))), dEx: perimAt(PANEL_RECT, LINK[0]) };

function Optimise({ tw }) {
  const { T, CUES } = useComposition();
  useStageFit(W, H);
  const radius = tw.radius;
  const compact = useCompact(W);
  const t = TYPE(compact);

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  // Structural: the instrument arriving.
  const shell = at(CUES.Distribution + 0.04, REVEAL_MS, REVEAL);

  // The distribution is a list being assembled. The per-item delta is derived
  // from this piece's own item count, so thirteen bands read as a thirteen-beat
  // build rather than inheriting a five-item cadence.
  const seqStep = (n) => STAGGER * clamp(5 / n, 0.35, 1);
  const BIN_STEP = seqStep(BINS.length);
  const BIN0 = CUES.Distribution + 0.16;
  // Bar fills are figures, not entrances: they count, they do not overshoot.
  const bin = (i) => at(BIN0 + BIN_STEP * i, COUNT_MS * 0.5, COUNT);

  // Rule wipes: the two reference lines, then the sweep to the recommendation.
  const listIn = at(CUES.Position + 0.1, REVEAL_MS, REVEAL);
  const medIn = at(CUES.Position + 0.1 + STAGGER * 2, REVEAL_MS, REVEAL);
  const sweep = at(CUES.Headroom + 0.4, REVEAL_MS, REVEAL);
  const move = LIST + (REC - LIST) * sweep;
  const band = sweep;
  const recLbl = at(CUES.Headroom + 0.4 + STAGGER * 3, REVEAL_MS, REVEAL);
  const leg = at(CUES.Headroom + 1.2, REVEAL_MS, REVEAL);

  // The one confirmation in this piece: the recommendation marker clicking into
  // place once the sweep has landed. The only spring in the frame.
  const seal = at(CUES.Headroom + 0.4 + REVEAL_MS, REVEAL_MS, SPRING);

  // Outcome card: the shell reveals, then only its content region swaps.
  const card = at(CUES.Deliver + 0.1, REVEAL_MS, REVEAL);
  const swapAt = CUES.Deliver + 0.3;
  const outgoing = 1 - at(swapAt, OUT_MS, OUT);
  const incoming = at(swapAt + IN_DELAY, IN_MS, IN);

  // One clock for both figures, so they land on the same frame.
  const countP = at(swapAt + IN_DELAY, COUNT_MS, COUNT);
  const bps = 0.6 * countP;
  const rev = 0.74 * countP;
  const rows = (i) => at(swapAt + IN_DELAY + STAGGER * i, REVEAL_MS, REVEAL);

  const flow = clamp(at(CUES.Deliver - 0.6, REVEAL_MS, REVEAL) - at(CUES.Deliver + 2.2, REVEAL_MS, REVEAL), 0, 1);
  const pulse = (((T - CUES.Deliver + 0.6) * tw.speed * 0.5) % 1 + 1) % 1;

  // Continuous band inspection. Once the reveal has settled, one price band at a
  // time carries the surface tint, ~3.5s each, cross-faded on colour alone —
  // nothing moves and never more than one band is lit. Driven by a wall clock so
  // it keeps cycling across loops rather than restarting with the timeline.
  const DWELL = 3.5, FADE = 0.4;
  const nowS = (window.performance ? window.performance.now() : Date.now()) / 1000;
  const phase = nowS % DWELL;
  const activeBin = Math.floor(nowS / DWELL) % BINS.length;
  const lit = clamp(phase / FADE, 0, 1) * clamp((DWELL - phase) / FADE, 0, 1)
    * at(CUES.Deliver + 1.0, REVEAL_MS, REVEAL);

  const CONTENT_H = compact ? 104 : 84;

  const px = (v) => PLOT.x + v * PLOT.w;
  const baseY = PLOT.y + PLOT.h;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>

      <div style={{
        position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h,
        boxSizing: "border-box", background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
        opacity: shell, transform: `translateY(${(1 - shell) * TRAVEL}px)`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: `${PAD}px ${PAD}px 0` }}>
          <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.ink }}>PRICE POSITION</span>
          <span style={{ flex: 1 }} />
          {compact ? null : (
            <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>1,806 PRODUCTS</span>
          )}
        </div>

        <svg width={PANEL.w} height={PANEL.h} style={{ position: "absolute", left: 0, top: 0 }}>
          {[0.5, 1].map((g, i) => (
            <line key={i} x1={PLOT.x} y1={baseY - g * PLOT.h} x2={PLOT.x + PLOT.w} y2={baseY - g * PLOT.h}
              stroke={C.rule} strokeWidth={HAIR} />
          ))}

          <rect x={px(Math.min(LIST, move))} y={PLOT.y} width={Math.abs(px(move) - px(LIST))} height={PLOT.h}
            fill={C.tint} opacity={band} />

          {BINS.map((b, i) => {
            const step = PLOT.w / BINS.length, bw = step - 10;
            const h = b.v * PLOT.h * 0.88 * bin(i);
            const on = i === activeBin ? lit : 0;
            return (
              <g key={i}>
                {on > 0.01 ? (
                  <g opacity={on}>
                    <rect x={PLOT.x + step * i + 5} y={PLOT.y} width={bw} height={PLOT.h} fill={C.well} />
                    <line x1={PLOT.x + step * i + 5} y1={PLOT.y} x2={PLOT.x + step * i + 5 + bw} y2={PLOT.y}
                      stroke={C.ruleStrong} strokeWidth={HAIR} />
                  </g>
                ) : null}
                <rect x={PLOT.x + step * i + 5} y={baseY - h} width={bw} height={h} fill={RAMP[3]} />
              </g>
            );
          })}

          <line x1={PLOT.x} y1={baseY} x2={PLOT.x + PLOT.w} y2={baseY} stroke={C.ruleStrong} strokeWidth={HAIR} />
          <line x1={px(LIST)} y1={PLOT.y - 14} x2={px(LIST)} y2={baseY} stroke={C.ink} strokeWidth={HAIR} opacity={listIn} />
          <line x1={px(MEDIAN)} y1={PLOT.y + 2} x2={px(MEDIAN)} y2={baseY} stroke={C.dim} strokeWidth={HAIR} opacity={medIn} strokeDasharray="8 8" />
          <line x1={px(move)} y1={PLOT.y - 40} x2={px(move)} y2={baseY} stroke={C.accent} strokeWidth="3" opacity={band} />
          <rect x={px(move) - 8 * seal} y={PLOT.y - 40 - 8 * seal} width={16 * seal} height={16 * seal}
            fill={C.accent} opacity={clamp(seal * 4, 0, 1)} />
        </svg>

        {compact ? null : (
          <React.Fragment>
            <span style={{
              position: "absolute", left: px(MEDIAN) + 14, top: PLOT.y - 26, whiteSpace: "nowrap", opacity: medIn,
              font: t.label, letterSpacing: TRACK, color: C.dim
            }}>MARKET MEDIAN</span>
            <span style={{
              position: "absolute", left: px(LIST) - 6, top: baseY + 24, whiteSpace: "nowrap", opacity: listIn,
              font: t.label, letterSpacing: TRACK, color: C.ink
            }}>LIST 1,240.00</span>
          </React.Fragment>
        )}

        <span style={{
          position: "absolute", left: PAD, top: PLOT.y - 110, width: PANEL.w - PAD * 2, opacity: recLbl,
          font: t.label, letterSpacing: TRACK, color: C.accent,
        }}>RECOMMENDED 1,247.44</span>

        {compact ? null : (
          <div style={{
            position: "absolute", left: PAD, right: PAD, bottom: PAD, borderTop: `${HAIR}px solid ${C.rule}`, paddingTop: 24,
            font: t.label, letterSpacing: TRACK, color: C.label
          }}>13 PRICE BANDS · CONF 0.92</div>
        )}
      </div>

      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={LINK_D} fill="none" stroke={C.rule} strokeWidth={HAIR}
          strokeLinejoin="miter" strokeLinecap="butt" opacity={clamp(flow * 1.4, 0, 1)} />
        <path d={LEG_D} fill="none" stroke={C.rule} strokeWidth={HAIR}
          strokeLinejoin="miter" strokeLinecap="butt"
          strokeDasharray={LEG_LEN} strokeDashoffset={LEG_LEN * (1 - leg)} />
        <Node at={LEG[0]} o={leg} />
        <Node at={LINK[LINK.length - 1]} o={clamp(flow * 1.4, 0, 1)} />
        <Trace rect={PANEL_RECT} route={PULSE_ROUTE} p={pulse} o={flow} radius={radius} />
      </svg>

      <div style={{
        position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
        boxSizing: "border-box", background: C.bg, border: `${HAIR}px solid ${C.ruleStrong}`, borderRadius: radius,
        padding: PAD, display: "flex", flexDirection: "column", gap: 20,
        opacity: card, transform: `translateY(${(1 - card) * TRAVEL}px)`
      }}>
        <span style={{ font: t.label, letterSpacing: TRACK, color: C.label }}>RECOMMENDED MOVE</span>

        <div style={{ position: "relative", flex: "none", height: CONTENT_H }}>
          <span style={{
            position: "absolute", left: 0, top: 6, whiteSpace: "nowrap",
            font: t.label, letterSpacing: TRACK, color: C.label, opacity: outgoing
          }}>AWAITING READING</span>
          <div style={{
            position: "absolute", left: 0, top: 0, display: "flex", alignItems: "baseline", gap: 14,
            opacity: incoming, transform: `translateY(${(1 - incoming) * IN_TRAVEL}px)`
          }}>
            <span style={{ font: t.hero, color: C.ink, fontVariantNumeric: "tabular-nums" }}>+{bps.toFixed(2)}</span>
            <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.dim }}>BPS</span>
          </div>
        </div>

        <span style={{ flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", height: 72, paddingTop: 22, boxSizing: "border-box", borderTop: `${HAIR}px solid ${C.rule}`, opacity: rows(0) }}>
            <span style={{ flex: 1, whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>REVENUE</span>
            <span style={{ font: t.fig, color: C.good, fontVariantNumeric: "tabular-nums" }}>£{rev.toFixed(2)}M</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", height: 72, paddingTop: 22, boxSizing: "border-box", borderTop: `${HAIR}px solid ${C.rule}`, opacity: rows(1) }}>
            <span style={{ flex: 1, whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>CONFIDENCE</span>
            <span style={{ font: t.fig, color: C.dim, fontVariantNumeric: "tabular-nums" }}>0.92</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptimisePlotPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Optimise tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Flow" />
        <TweakSlider label="Trace speed" value={tw.speed} min={0.15} max={0.8} step={0.05} onChange={(v) => setTweak("speed", v)} />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.OptimisePlotPiece = OptimisePlotPiece;
