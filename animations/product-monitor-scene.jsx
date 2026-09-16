const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider } = window;

const W = 1200, H = 760;

// ---- Shared across all four Product pieces. Keep these in sync. ----
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

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart, settle: Easing.easeOutQuart };

const QUERY = "What changed this week?";

const PAD = 36;
const BAR = { x: 40, y: 40, w: 1120, h: 104 };
const SRC = { x: 40, w: 344, h: 140, ys: [192, 364, 536] };
const ANS = { x: 424, y: 192, w: 736, h: 484 };

const SOURCES = [
  { kicker: "SECTOR NEWS", meta: "4" },
  { kicker: "REGULATORY", meta: "2" },
  { kicker: "COMPETITORS", meta: "2" }
];

const MOVES = [0.32, 0.18, 0.54, 0.28, 0.68, 0.44, 0.92, 0.6];

const FINDINGS = [
  { fig: "+4.23%", text: "Market median moved above your list price." },
  { fig: "14 OCT", text: "EEA interchange consultation closes." }
];

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

const ROUTES = SRC.ys.map((y) => {
  const rect = { x: SRC.x, y, w: SRC.w, h: SRC.h };
  const cy = y + SRC.h / 2;
  const pts = [[SRC.x + SRC.w, cy], [ANS.x, cy]];
  return { rect, d: polyD(pts), len: polyLen(pts), dEx: perimAt(rect, pts[0]) };
});

function Monitor({ tw }) {
  const { T, CUES } = useComposition();
  useStageFit(W, H);
  const radius = tw.radius;
  const compact = useCompact(W);
  const t = TYPE(compact);

  const typed = animate({ from: 0, to: QUERY.length, start: CUES.Ask + 0.35, end: CUES.Ask + 2.0, ease: Easing.linear })(T);
  const shown = QUERY.slice(0, Math.round(typed));
  const caret = T % 0.9 < 0.5 ? 1 : 0.15;
  const barActive = T >= CUES.Gather - 0.1;

  const src = (i) => animate({ from: 0, to: 1, start: CUES.Gather + 0.05 + 0.18 * i, end: CUES.Gather + 0.8 + 0.18 * i, ease: MOTION.enter })(T);
  const panel = animate({ from: 0, to: 1, start: CUES.Gather + 0.35, end: CUES.Gather + 1.1, ease: MOTION.enter })(T);

  const stream = clamp(
    animate({ from: 0, to: 1, start: CUES.Gather + 0.5, end: CUES.Gather + 1.1, ease: MOTION.enter })(T) -
    animate({ from: 0, to: 0.7, start: CUES.Answer + 0.4, end: CUES.Answer + 1.6, ease: MOTION.settle })(T), 0, 1);

  const col = (i) => animate({ from: 0, to: 1, start: CUES.Analyse + 0.35 + 0.09 * i, end: CUES.Analyse + 1.05 + 0.09 * i, ease: MOTION.settle })(T);
  const find = (i) => animate({ from: 0, to: 1, start: CUES.Answer + 0.2 + 0.45 * i, end: CUES.Answer + 1.1 + 0.45 * i, ease: MOTION.enter })(T);

  const status = T < CUES.Gather ? "TYPING"
    : T < CUES.Analyse ? (compact ? "READING" : "READING 12 SOURCES")
    : T < CUES.Answer ? "REASONING"
    : (compact ? "CONF 0.94" : "ANSWERED · CONF 0.94");
  const thinking = T >= CUES.Gather && T < CUES.Answer;
  const think = 0.35 + 0.65 * (0.5 - 0.5 * Math.cos(T * 5));

  const traces = ROUTES.map((r, i) => ({
    key: i, route: r,
    p: (((T - CUES.Gather) * tw.speed * 0.5 - i * 0.03) % 1 + 1) % 1
  }));

  // Answer panel internals share one left edge and one baseline grid.
  const IX = ANS.x + PAD, IW = ANS.w - PAD * 2;
  const HEAD_Y = ANS.y + PAD;                 // panel header row
  const CH = { x: IX, y: ANS.y + 142, w: IW, h: 142 };
  const ROWS_Y = ANS.y + 300;
  const ROW_H = 80;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>

      <div style={{
        position: "absolute", left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h,
        boxSizing: "border-box", background: C.bg,
        border: `${HAIR}px solid ${barActive ? C.ruleStrong : C.rule}`, borderRadius: radius,
        display: "flex", alignItems: "center", gap: 24, padding: `0 ${PAD}px`
      }}>
        <span style={{
          flex: "none", width: 12, height: 12, background: C.accent,
          opacity: thinking ? think : barActive ? 1 : 0.25
        }} />
        {compact ? null : (
          <React.Fragment>
            <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>VERNIER AI</span>
            <span style={{ flex: "none", width: HAIR, height: 40, background: C.rule }} />
          </React.Fragment>
        )}
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.title, color: C.ink }}>
          {shown}
          <span style={{ display: "inline-block", width: 11, height: compact ? 32 : 24, background: C.accent, marginLeft: 5, verticalAlign: "-3px", opacity: barActive ? 0 : caret }} />
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: thinking ? C.accent : C.label }}>{status}</span>
      </div>

      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {ROUTES.map((r, i) => (
          <path key={"l" + i} d={r.d} fill="none" stroke={C.rule} strokeWidth={HAIR}
            strokeLinejoin="miter" strokeLinecap="butt" opacity={clamp(stream * 1.4, 0, 1)} />
        ))}
        {traces.map((t2) => (
          <Trace key={t2.key} rect={t2.route.rect} route={t2.route} p={t2.p} o={stream} radius={radius} />
        ))}
      </svg>

      {SOURCES.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: SRC.x, top: SRC.ys[i], width: SRC.w, height: SRC.h,
          boxSizing: "border-box", background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
          padding: `28px ${PAD - 8}px`, display: "flex", flexDirection: "column", justifyContent: "space-between",
          opacity: src(i), transform: `translateX(${(1 - src(i)) * -14}px)`
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.ink }}>{s.kicker}</span>
            <span style={{ flex: 1 }} />
            <span style={{ flex: "none", font: t.label, letterSpacing: TRACK, color: C.label }}>{s.meta}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ display: "block", height: 10, width: "92%", background: C.rule }} />
            <span style={{ display: "block", height: 10, width: "58%", background: C.rule }} />
          </div>
        </div>
      ))}

      <div style={{
        position: "absolute", left: ANS.x, top: ANS.y, width: ANS.w, height: ANS.h,
        boxSizing: "border-box", background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
        opacity: panel, transform: `translateY(${(1 - panel) * 12}px)`
      }} />

      <div style={{
        position: "absolute", left: IX, top: HEAD_Y, width: IW,
        display: "flex", alignItems: "baseline", opacity: panel
      }}>
        <span style={{ font: t.label, letterSpacing: TRACK, color: C.ink }}>FINDINGS</span>
        <span style={{ flex: 1 }} />
        {compact ? null : (
          <span style={{ font: t.label, letterSpacing: TRACK, color: C.label }}>WEEK 37</span>
        )}
      </div>

      {compact ? null : (
        <div style={{
          position: "absolute", left: IX, top: CH.y - 34, width: IW,
          font: t.label, letterSpacing: TRACK, color: C.label, opacity: panel
        }}>COMPETITOR MOVES · 8 WEEKS</div>
      )}

      <svg width={CH.w} height={CH.h} style={{ position: "absolute", left: CH.x, top: CH.y, opacity: panel }}>
        {[0, 0.5, 1].map((g, i) => (
          <line key={i} x1={0} y1={CH.h - g * CH.h} x2={CH.w} y2={CH.h - g * CH.h} stroke={C.rule} strokeWidth={HAIR} />
        ))}
        {MOVES.map((v, i) => {
          const step = CH.w / MOVES.length, bw = step - 16;
          const h = v * CH.h * col(i);
          return <rect key={i} x={step * i + 8} y={CH.h - h} width={bw} height={h}
            fill={i >= MOVES.length - 2 ? RAMP[1] : RAMP[3]} />;
        })}
      </svg>

      <div style={{ position: "absolute", left: IX, top: ROWS_Y, width: IW }}>
        {FINDINGS.map((f, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: compact ? "176px 1fr" : "150px 1fr",
            alignItems: "baseline", columnGap: 28, height: ROW_H,
            borderTop: `${HAIR}px solid ${C.rule}`, paddingTop: 22, boxSizing: "border-box",
            opacity: find(i), transform: `translateY(${(1 - find(i)) * 8}px)`
          }}>
            <span style={{
              whiteSpace: "nowrap", font: t.fig, color: C.ink, fontVariantNumeric: "tabular-nums",
            }}>{f.fig}</span>
            <span style={{ font: t.body, color: C.dim }}>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitorFeedPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Monitor tw={tw} />
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

window.MonitorFeedPiece = MonitorFeedPiece;
