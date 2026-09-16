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
const REPO = { x: M, y: 164, w: 348, h: 556 };
const TRAIL = { x: 424, y: 164, w: 736, h: 556 };

// Documentation repositories, each with what an auditor would ask for.
const REPOS = [
  { name: "Evidence", count: 1806, unit: "PRODUCTS PRICED" },
  { name: "Approvals", count: 14, unit: "SIGNED OFF" },
  { name: "Model runs", count: 96, unit: "VERSIONED" }
];

// The decision history, newest first, as it would be exported for audit.
const TRAIL_ROWS = [
  { date: "06 OCT", who: "Pricing committee", what: "Repricing approved", state: "signed" },
  { date: "29 SEP", who: "Legal", what: "Antitrust cleared", state: "signed" },
  { date: "22 SEP", who: "Revenue management", what: "Forecast basis agreed", state: "signed" },
  { date: "15 SEP", who: "Vernier AI", what: "Recommendation issued", state: "logged" }
];

function Defend({ tw }) {
  const { T, CUES } = useComposition();
  const radius = tw.radius;
  const compact = useCompact(W);
  useStageFit(W, H);
  const t = TYPE(compact);

  const panel = animate({ from: 0, to: 1, start: CUES.Repository + 0.1, end: CUES.Repository + 0.9, ease: MOTION.enter })(T);
  const repo = (i) => animate({ from: 0, to: 1, start: CUES.Repository + 0.25 + 0.2 * i, end: CUES.Repository + 1.0 + 0.2 * i, ease: MOTION.enter })(T);
  const tally = (i) => animate({ from: 0, to: REPOS[i].count, start: CUES.Repository + 0.35 + 0.2 * i, end: CUES.Repository + 1.7 + 0.2 * i, ease: MOTION.settle })(T);

  const row = (i) => animate({ from: 0, to: 1, start: CUES.History + 0.1 + 0.24 * i, end: CUES.History + 0.9 + 0.24 * i, ease: MOTION.enter })(T);
  const spine = animate({ from: 0, to: 1, start: CUES.History + 0.1, end: CUES.History + 1.4, ease: MOTION.draw })(T);
  const seal = (i) => animate({ from: 0, to: 1, start: CUES.Signed + 0.1 + 0.18 * i, end: CUES.Signed + 0.8 + 0.18 * i, ease: MOTION.enter })(T);
  const ready = animate({ from: 0, to: 1, start: CUES.Ready + 0.2, end: CUES.Ready + 1.0, ease: MOTION.enter })(T);

  // Only human sign-offs count; the model-logged entry is recorded, not signed.
  const SIGNABLE = TRAIL_ROWS.filter((r) => r.state === "signed").length;
  const signed = TRAIL_ROWS.filter((r, i) => r.state === "signed" && seal(i) > 0.9).length;
  const status = T < CUES.History ? "REPOSITORY INDEXED"
    : T < CUES.Signed ? "ASSEMBLING TRAIL"
    : compact ? "AUDIT READY" : "AUDIT READY · EXPORT ON DEMAND";

  const RX = TRAIL.x + PAD, RW = TRAIL.w - PAD * 2;
  const HEAD_Z = 128;                            // panel top to first row
  const FOOT_Z = 104;                            // rule + padding + 52px export controls
  const ROW_TOP = TRAIL.y + HEAD_Z;
  const ROW_H = (TRAIL.h - HEAD_Z - FOOT_Z) / TRAIL_ROWS.length;
  const FOOT_TOP = TRAIL.y + TRAIL.h - FOOT_Z;
  const SPINE_X = RX + 10;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>

      <div style={{
        position: "absolute", left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.ruleStrong}`, borderRadius: radius,
        display: "flex", alignItems: "center", gap: 24, padding: `0 ${PAD}px`
      }}>
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.title, color: C.ink }}>Audit and approval record</span>
        <span style={{ flex: 1 }} />
        <span style={{ flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>{status}</span>
      </div>

      <div style={{
        position: "absolute", left: REPO.x, top: REPO.y, width: REPO.w, height: REPO.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.rule}`, borderRadius: radius,
        padding: PAD, display: "flex", flexDirection: "column",
        opacity: panel, transform: `translateY(${(1 - panel) * 10}px)`
      }}>
        <span style={{ font: t.label, letterSpacing: TRACK, color: C.ink }}>REPOSITORIES</span>
        <span style={{ flex: 1 }} />
        {REPOS.map((r, i) => (
          <div key={i} style={{
            borderTop: `${HAIR}px solid ${C.rule}`, paddingTop: 22, paddingBottom: 26,
            display: "flex", flexDirection: "column", gap: 10, opacity: repo(i)
          }}>
            <span style={{ font: t.fig, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(tally(i)).toLocaleString("en-GB")}
            </span>
            <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>{r.unit}</span>
          </div>
        ))}
        <div style={{
          borderTop: `${HAIR}px solid ${C.ruleStrong}`, paddingTop: 24,
          display: "flex", alignItems: "baseline", opacity: ready
        }}>
          <span style={{ flex: 1, whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.label }}>RETENTION</span>
          <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.ink }}>7 YEARS</span>
        </div>
      </div>

      <div style={{
        position: "absolute", left: TRAIL.x, top: TRAIL.y, width: TRAIL.w, height: TRAIL.h, boxSizing: "border-box",
        background: C.bg, border: `${HAIR}px solid ${C.ruleStrong}`, borderRadius: radius,
        opacity: panel, transform: `translateY(${(1 - panel) * 10}px)`
      }} />

      <div style={{
        position: "absolute", left: RX, top: TRAIL.y + PAD, width: RW,
        display: "flex", alignItems: "baseline", opacity: panel
      }}>
        <span style={{ font: t.label, letterSpacing: TRACK, color: C.ink }}>DECISION HISTORY</span>
        <span style={{ flex: 1 }} />
        <span style={{ font: t.label, letterSpacing: TRACK, color: C.label }}>{signed} OF {SIGNABLE} SIGNED · 1 LOGGED</span>
      </div>

      {/* The spine that threads the record together, drawn as the rows arrive. */}
      <svg width={TRAIL.w} height={TRAIL.h} style={{ position: "absolute", left: TRAIL.x, top: TRAIL.y }}>
        <line x1={SPINE_X - TRAIL.x} y1={ROW_TOP - TRAIL.y + ROW_H / 2}
          x2={SPINE_X - TRAIL.x} y2={ROW_TOP - TRAIL.y + ROW_H / 2 + (TRAIL_ROWS.length - 1) * ROW_H * spine}
          stroke={C.ruleStrong} strokeWidth={HAIR} />
      </svg>

      {TRAIL_ROWS.map((r, i) => {
        const y = ROW_TOP + i * ROW_H;
        const sealed = seal(i) > 0.9;
        return (
          <div key={i} style={{
            position: "absolute", left: RX, top: y, width: RW, height: ROW_H, boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: compact ? "44px 150px 1fr 150px" : "44px 120px 1fr 120px",
            alignItems: "center", columnGap: 24,
            borderTop: i ? `${HAIR}px solid ${C.rule}` : "none",
            opacity: row(i)
          }}>
            <span style={{
              width: 20, height: 20, marginLeft: -0,
              background: sealed ? C.accent : C.bg,
              border: `${HAIR}px solid ${sealed ? C.accent : C.ruleStrong}`
            }} />
            <span style={{ whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.dim }}>{r.date}</span>
            <span style={{ font: t.body, color: C.ink }}>{r.what}</span>
            <span style={{
              textAlign: "right", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK,
              color: sealed ? (r.state === "signed" ? C.good : C.dim) : C.label, opacity: seal(i)
            }}>{r.state === "signed" ? "SIGNED" : "LOGGED"}</span>
          </div>
        );
      })}

      <div style={{
        position: "absolute", left: RX, top: FOOT_TOP, width: RW,
        borderTop: `${HAIR}px solid ${C.ruleStrong}`, paddingTop: 22,
        display: "flex", alignItems: "center", opacity: ready
      }}>
        <span style={{
          flex: "none", whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK, color: C.accent
        }}>NO GAPS</span>
        <span style={{ flex: 1, minWidth: 24 }} />
        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 12 }}>
          {(compact ? ["PDF"] : ["EXPORT PDF", "CSV"]).map((label, i) => (
            <span key={i} style={{
              boxSizing: "border-box", display: "inline-flex", alignItems: "center", height: 52,
              padding: "0 20px", borderRadius: radius,
              background: i === 0 ? C.accent : C.bg,
              border: `${HAIR}px solid ${i === 0 ? C.accent : C.ruleStrong}`,
              whiteSpace: "nowrap", font: t.label, letterSpacing: TRACK,
              color: i === 0 ? C.bg : C.ink
            }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DefendPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Defend tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.DefendPiece = DefendPiece;
