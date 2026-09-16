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
  rule: "#E2E5EB", ruleStrong: "#C9CFD9", accent: "#2E4BA0", well: "#F7F8FA", tint: "#EEF1FA"
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

const M = 40;
const BAR = { x: M, y: 40, w: 1120, h: 96 };
const CARD_W = 356, CARD_H = 196, GAP = 26;
const ROW_Y = [144, 360];
const STATUS_H = 44;                             // reserved, never absorbed by the spacer
const TL = { x: M, y: 572, w: 1120, h: 148 };

const WORK = [
  { title: "Pricing committee", gate: "COMMITTEE SIGN-OFF", target: 1, fact: "Approved" },
  { title: "Antitrust screen", gate: "LEGAL REVIEW", target: 1, fact: "No flag" },
  { title: "System config", gate: "CONFIGURATION", target: 1, fact: "1,806 products" },
  { title: "Client disclosure", gate: "LEGAL DRAFTING", target: 0.62, fact: "With legal" },
  { title: "Channel setup", gate: "CHANNEL ROLLOUT", target: 0.34, fact: "6 of 9 live" },
  { title: "Fee schedule", gate: "CUTOVER", target: 0.08, fact: "28 Oct" }
];

const MILESTONES = [
  { name: "Committee", date: "22 SEP", state: "done" },
  { name: "Antitrust", date: "29 SEP", state: "done" },
  { name: "Disclosure", date: "14 OCT", state: "live" },
  { name: "Fee schedule", date: "28 OCT", state: "due" }
];


function WorkCard({ w, x, y, f, appear, radius, sealed, t, compact }) {
  const state = f >= 0.995 ? "done" : f > 0.04 ? "live" : "queued";
  const pct = Math.round(f * 100);
  const text = state === "done" ? w.fact : state === "live" ? pct + "%" : "QUEUED";
  const mark = state === "done" ? 0.84 + 0.16 * sealed : 1;
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: CARD_W, height: CARD_H, boxSizing: "border-box",
      background: C.bg, border: `${HAIR}px solid ${state === "queued" ? C.rule : C.ruleStrong}`, borderRadius: radius,
      padding: compact ? 24 : 28, display: "flex", flexDirection: "column", gap: 16,
      opacity: appear, transform: `translateY(${(1 - appear) * TRAVEL}px)`
    }}>
      <span style={{ whiteSpace: "nowrap", font: t.title, color: state === "queued" ? C.dim : C.ink }}>{w.title}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {compact ? null : (
          <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>{w.gate}</span>
        )}
        <span style={{ display: "block", height: 8, background: C.rule }}>
          <span style={{ display: "block", height: 8, width: `${f * 100}%`, background: RAMP[3] }} />
        </span>
      </div>
      <span style={{ flex: 1 }} />
      <div style={{ flex: "none", height: STATUS_H, display: "flex", alignItems: "center", gap: 12, opacity: appear }}>
        <span style={{
          flex: "none", width: 10 * mark, height: 10 * mark, marginRight: 10 * (1 - mark),
          background: state === "queued" ? C.ruleStrong : C.accent,
          opacity: clamp(mark * 4, 0, 1)
        }} />
        <span style={{
          whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK,
          color: state === "done" ? C.ink : state === "live" ? C.accent : C.label,
          textTransform: "uppercase"
        }}>{text}</span>
      </div>
    </div>
  );
}

function Timeline({ draw, dot, today, breathe, radius, appear, t, compact }) {
  const ax = 150, aw = TL.w - 300;                 // outer milestones inset so labels fit
  const axisY = 70;                              // lifts the date row off the panel floor
  const pos = (i) => (aw / (MILESTONES.length - 1)) * i;
  const todayX = pos(1) + (pos(2) - pos(1)) * 0.62;
  const progress = clamp(todayX / aw, 0, 1) * today;

  return (
    <div style={{
      position: "absolute", left: TL.x, top: TL.y, width: TL.w, height: TL.h, boxSizing: "border-box",
      background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
      opacity: appear, transform: `translateY(${(1 - appear) * TRAVEL}px)`
    }}>
      <svg width={TL.w} height={TL.h} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={ax} y1={axisY} x2={ax + aw * draw} y2={axisY} stroke={C.rule} strokeWidth={HAIR} />
        <rect x={ax} y={axisY - 4} width={aw * progress} height={8} fill={RAMP[3]} />
        {MILESTONES.map((m, i) => {
          const x = ax + pos(i), d = dot(i), s = 16;
          return (
            <rect key={i} opacity={d} x={x - s / 2} y={axisY - s / 2} width={s} height={s}
              fill={m.state === "done" ? C.dim : m.state === "live" ? C.accent : C.bg}
              stroke={m.state === "due" ? C.ruleStrong : "none"} strokeWidth={HAIR} />
          );
        })}
        {today > 0.01 ? (
          <line x1={ax + todayX} y1={axisY - 40} x2={ax + todayX} y2={axisY + 34}
            stroke={C.accent} strokeWidth={HAIR} opacity={today * breathe} />
        ) : null}
      </svg>

      {MILESTONES.map((m, i) => {
        const x = ax + pos(i);
        return (
          <div key={i} style={{ position: "absolute", left: x - 130, top: axisY - 60, width: 260, textAlign: "center", opacity: dot(i) }}>
            <span style={{ whiteSpace: "nowrap", font: t.title, color: m.state === "due" ? C.dim : C.ink }}>{m.name}</span>
          </div>
        );
      })}

      {compact ? null : MILESTONES.map((m, i) => {
        const x = ax + pos(i);
        return (
          <div key={i} style={{ position: "absolute", left: x - 130, top: axisY + 26, width: 260, textAlign: "center", opacity: dot(i) }}>
            <span style={{
              whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK,
              color: m.state === "live" ? C.accent : C.label,
            }}>{m.date}</span>
          </div>
        );
      })}
    </div>
  );
}

function Implement({ tw }) {
  const { T, CUES } = useComposition();
  useStageFit(W, H);
  const radius = tw.radius;
  const compact = useCompact(W);
  const t = TYPE(compact);

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  // Per-item delta derived from each list's own length, so six cards and four
  // milestones read as their own builds rather than a borrowed cadence.
  const seqStep = (n) => STAGGER * clamp(5 / n, 0.35, 1);

  // Structural: bar, card shells, timeline panel.
  const CARD_STEP = seqStep(WORK.length);
  const CARD0 = CUES.Plan + 0.1;
  const topBar = at(CUES.Plan + 0.04, REVEAL_MS, REVEAL);
  const card = (i) => at(CARD0 + CARD_STEP * i, REVEAL_MS, REVEAL);
  const panel = at(CARD0 + CARD_STEP * WORK.length, REVEAL_MS, REVEAL);

  // Progress is a figure, not an entrance: it counts, it does not overshoot.
  const FILL_STEP = seqStep(WORK.length);
  const fillStart = (i) => CUES.Work + FILL_STEP * i;
  const fill = (i) => WORK[i].target * tw.progress * at(fillStart(i), COUNT_MS, COUNT);

  // A card crossing into done is this piece's confirmation moment — the only
  // spring in the frame, and only for the streams that actually complete. The
  // spring starts on the frame the fill actually crosses 0.995, which is well
  // before COUNT_MS because the count bezier is front-loaded, so it is solved
  // from the curve rather than assumed.
  const crossAt = (i) => {
    const span = WORK[i].target * tw.progress;
    if (span < 0.995) return null;
    const want = 0.995 / span;
    let lo = 0, hi = 1;
    for (let k = 0; k < 20; k++) {
      const mid = (lo + hi) / 2;
      if (COUNT(mid) < want) lo = mid; else hi = mid;
    }
    return fillStart(i) + hi * COUNT_MS;
  };
  const sealed = (i) => {
    const x = crossAt(i);
    return x === null ? 1 : at(x, REVEAL_MS, SPRING);
  };

  // Axis wipe and milestone marks: rule wipes, staggered on their own count.
  const DOT_STEP = seqStep(MILESTONES.length);
  const draw = at(CUES.Plan + 0.9, REVEAL_MS, REVEAL);
  const dot = (i) => at(CUES.Work + 0.3 + DOT_STEP * i, REVEAL_MS, REVEAL);
  const today = at(CUES.Track - 0.4, REVEAL_MS, REVEAL);

  // The instrument's own indicator: a slow, narrow breathe on the TODAY line,
  // fixed 3.5s period on a wall clock, matching the cadence Optimise uses.
  const BREATHE = 3.5;
  const nowS = (window.performance ? window.performance.now() : Date.now()) / 1000;
  const breathe = 0.78 + 0.22 * (0.5 - 0.5 * Math.cos((nowS % BREATHE) / BREATHE * 2 * Math.PI));

  const cleared = MILESTONES.filter((m, i) => m.state === "done" && dot(i) > 0.9).length;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>

      <div style={{
        position: "absolute", left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.ruleStrong}`, borderRadius: radius,
        display: "flex", alignItems: "center", gap: 24, padding: "0 36px",
        opacity: topBar, transform: `translateY(${(1 - topBar) * TRAVEL}px)`
      }}>
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.title, color: C.ink }}>Q4 repricing rollout</span>
        <span style={{ flex: 1 }} />
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>
          {cleared} OF 4 CLEARED · TODAY 09 OCT
        </span>
      </div>

      {WORK.map((w, i) => (
        <WorkCard key={i} w={w} t={t} compact={compact}
          x={M + (i % 3) * (CARD_W + GAP)} y={ROW_Y[Math.floor(i / 3)]}
          f={clamp(fill(i), 0, 1)} appear={card(i)} radius={radius} sealed={sealed(i)} />
      ))}

      <Timeline draw={draw} dot={dot} today={today} breathe={breathe} radius={radius} appear={panel}
        t={t} compact={compact} />
    </div>
  );
}

function ImplementRolloutPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Implement tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Rollout" />
        <TweakSlider label="Completion" value={tw.progress} min={0.4} max={1.2} step={0.05} onChange={(v) => setTweak("progress", v)} />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.ImplementRolloutPiece = ImplementRolloutPiece;
