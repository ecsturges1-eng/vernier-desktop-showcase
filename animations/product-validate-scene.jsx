const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider } = window;

const W = 1200, H = 760;

// ---- Shared across all six Product pieces. Keep these in sync. ----
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
// container once, before layout has settled. This watchdog compares rendered
// scale against container fit and re-dispatches until they agree.
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

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart, settle: Easing.easeOutQuart };

const M = 40, PAD = 36;
const BAR = { x: M, y: 40, w: 1120, h: 96 };
const CHART = { x: M, y: 164, w: 736, h: 356 };
const KPI = { x: 812, y: 164, w: 348, h: 356 };
const ROWS = { x: M, y: 556, w: 1120, h: 164 };

// Eight weeks of realised revenue against the forecast published at cutover.
const FORECAST = [0.30, 0.38, 0.45, 0.53, 0.60, 0.67, 0.74, 0.80];
const ACTUAL   = [0.28, 0.40, 0.44, 0.56, 0.63, 0.66, 0.78, 0.86];

// Three tracked measures, each an actual read against the same forecast basis.
const MEASURES = [
  { name: "Revenue", actual: 0.814, forecast: 0.80, read: "+1.75%" },
  { name: "Margin", actual: 0.706, forecast: 0.70, read: "+0.86%" },
  { name: "Volume", actual: 0.662, forecast: 0.67, read: "−1.19%" }
];

function Validate({ tw }) {
  const { T, CUES } = useComposition();
  const radius = tw.radius;
  const compact = useCompact(W);
  useStageFit(W, H);
  const t = TYPE(compact);

  const panel = animate({ from: 0, to: 1, start: CUES.Forecast + 0.1, end: CUES.Forecast + 0.9, ease: MOTION.enter })(T);
  const fcast = animate({ from: 0, to: 1, start: CUES.Forecast + 0.4, end: CUES.Forecast + 1.6, ease: MOTION.draw })(T);
  const act = animate({ from: 0, to: 1, start: CUES.Actual + 0.1, end: CUES.Actual + 1.8, ease: MOTION.draw })(T);
  const band = animate({ from: 0, to: 1, start: CUES.Actual + 0.9, end: CUES.Variance + 0.3, ease: MOTION.enter })(T);

  const kpi = animate({ from: 0, to: 1, start: CUES.Variance + 0.1, end: CUES.Variance + 0.9, ease: MOTION.enter })(T);
  const dev = animate({ from: 0, to: 2.4, start: CUES.Variance + 0.2, end: CUES.Variance + 1.6, ease: MOTION.settle })(T);
  const row = (i) => animate({ from: 0, to: 1, start: CUES.Variance + 0.5 + 0.2 * i, end: CUES.Variance + 1.2 + 0.2 * i, ease: MOTION.enter })(T);
  const grow = (i) => animate({ from: 0, to: 1, start: CUES.Variance + 0.6 + 0.2 * i, end: CUES.Variance + 1.6 + 0.2 * i, ease: MOTION.settle })(T);
  const held = animate({ from: 0, to: 1, start: CUES.Confirm + 0.2, end: CUES.Confirm + 1.0, ease: MOTION.enter })(T);

  // Plot geometry, panel-relative.
  const px = (i) => PAD + 28 + (i / (FORECAST.length - 1)) * (CHART.w - PAD * 2 - 56);
  const baseY = CHART.h - 76;
  const topY = 116;
  const py = (v) => baseY - v * (baseY - topY);

  const pts = (arr, k) => arr.slice(0, Math.max(2, Math.ceil(arr.length * k)))
    .map((v, i) => (i ? "L" : "M") + px(i) + " " + py(v)).join(" ");

  const status = T < CUES.Actual ? "FORECAST PUBLISHED"
    : T < CUES.Variance ? "ACTUALS IN"
    : compact ? "IN LINE" : "TRACKING IN LINE · CONF 0.94";

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>

      <div style={{
        position: "absolute", left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.ruleStrong}`, borderRadius: radius,
        display: "flex", alignItems: "center", gap: 24, padding: `0 ${PAD}px`
      }}>
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.title, color: C.ink }}>Actuals against forecast</span>
        <span style={{ flex: 1 }} />
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>{status}</span>
      </div>

      <div style={{
        position: "absolute", left: CHART.x, top: CHART.y, width: CHART.w, height: CHART.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
        opacity: panel, transform: `translateY(${(1 - panel) * 10}px)`
      }} />

      <div style={{
        position: "absolute", left: CHART.x + PAD, top: CHART.y + PAD, width: CHART.w - PAD * 2,
        display: "flex", alignItems: "baseline", opacity: panel
      }}>
        <span style={{ font: t.label, letterSpacing: TRACK, color: C.ink }}>REVENUE · 8 WEEKS</span>
        <span style={{ flex: 1 }} />
        {compact ? null : (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: HAIR, background: C.ruleStrong }} />
              <span style={{ font: t.label, letterSpacing: TRACK, color: C.label }}>FORECAST</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 4, background: C.accent }} />
              <span style={{ font: t.label, letterSpacing: TRACK, color: C.dim }}>ACTUAL</span>
            </span>
          </div>
        )}
      </div>

      <svg width={CHART.w} height={CHART.h} style={{ position: "absolute", left: CHART.x, top: CHART.y, opacity: panel }}>
        {[0, 0.5, 1].map((g, i) => (
          <line key={i} x1={PAD} y1={py(g)} x2={CHART.w - PAD} y2={py(g)} stroke={C.rule} strokeWidth={HAIR} />
        ))}

        {/* Variance band: the gap being reported, drawn between the two series. */}
        {band > 0.01 ? (
          <path d={
            FORECAST.map((v, i) => (i ? "L" : "M") + px(i) + " " + py(v)).join(" ") + " " +
            ACTUAL.map((v, i) => "L" + px(ACTUAL.length - 1 - i) + " " + py(ACTUAL[ACTUAL.length - 1 - i])).join(" ") + " Z"
          } fill={C.tint} opacity={band} />
        ) : null}

        <path d={pts(FORECAST, fcast)} fill="none" stroke={C.ruleStrong} strokeWidth={HAIR} strokeDasharray="10 8" />
        <path d={pts(ACTUAL, act)} fill="none" stroke={C.accent} strokeWidth="4" strokeLinejoin="round" />

        {ACTUAL.map((v, i) => {
          const on = clamp((act * (ACTUAL.length - 1) - i) * 4, 0, 1);
          return <rect key={i} x={px(i) - 6} y={py(v) - 6} width="12" height="12" fill={C.accent} opacity={on} />;
        })}

        {[0, 3, 7].map((i) => (
          <text key={i} x={px(i)} y={baseY + 38} textAnchor="middle"
            fill={C.label} style={{ font: t.label, letterSpacing: TRACK }}>{"W" + (i + 34)}</text>
        ))}
      </svg>

      <div style={{
        position: "absolute", left: KPI.x, top: KPI.y, width: KPI.w, height: KPI.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.ruleStrong}`, borderRadius: radius,
        padding: PAD, display: "flex", flexDirection: "column", gap: 18,
        opacity: kpi, transform: `translateY(${(1 - kpi) * 12}px)`
      }}>
        <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>VS FORECAST</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{
            font: t.hero, color: C.good, fontVariantNumeric: "tabular-nums",
          }}>+{dev.toFixed(2)}</span>
          <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.dim }}>PP</span>
        </div>
        <span style={{ flex: 1 }} />
        <div style={{ borderTop: `${HAIR}px solid ${C.rule}`, paddingTop: 22, display: "flex", alignItems: "baseline", opacity: held }}>
          <span style={{ flex: 1, whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>WITHIN BAND</span>
          <span style={{ font: t.fig, color: C.ink, fontVariantNumeric: "tabular-nums" }}>8 / 8</span>
        </div>
      </div>

      <div style={{
        position: "absolute", left: ROWS.x, top: ROWS.y, width: ROWS.w, height: ROWS.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
        padding: `26px ${PAD}px`, display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}>
        {MEASURES.map((m, i) => {
          const ahead = m.actual >= m.forecast;
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: compact ? "200px 1fr 150px" : "170px 1fr 130px",
              alignItems: "center", columnGap: 28, opacity: row(i)
            }}>
              <span style={{ whiteSpace: "nowrap", font: t.title, color: C.ink }}>{m.name}</span>

              {/* Forecast as a hairline tick on the track, actual as the fill. */}
              <span style={{ position: "relative", display: "block", height: 14, background: C.well }}>
                <span style={{ display: "block", height: 14, width: `${m.actual * grow(i) * 100}%`, background: RAMP[3] }} />
                <span style={{
                  position: "absolute", top: -5, left: `${m.forecast * 100}%`,
                  width: HAIR, height: 24, background: C.ink, opacity: grow(i)
                }} />
              </span>

              <span style={{
                textAlign: "right", whiteSpace: "nowrap", font: t.fig,
                color: ahead ? C.good : C.dim, fontVariantNumeric: "tabular-nums"
              }}>{m.read}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ValidatePiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Validate tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Reading" />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.ValidatePiece = ValidatePiece;
