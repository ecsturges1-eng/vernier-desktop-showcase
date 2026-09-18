const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider } = window;
const {
  HAIR, useCompact, useStageFit, REVEAL, REVEAL_MS, TRAVEL, STAGGER,
  COUNT, SPRING, LINEAR, TYPE, TRACK, C, loopFade, fmt, Pulse
} = window.PS;

const W = 1200, H = 760;

// ---------------------------------------------------------------------------
// 02 — Nothing unchecked. A staged sequence, not five bars filling at once:
// a stage runs its checks, then a baton crosses the gap to the next stage,
// and the next stage cannot begin until the baton lands. The aggregate rail
// and the cleared tally are driven by the stages, so the top of the frame is
// always the sum of what the row below it has actually done.
// ---------------------------------------------------------------------------

const STAGE_W = 176, GAP = 56, STAGE_Y = 296, STAGE_H = 268;
const X0 = Math.round((W - (STAGE_W * 5 + GAP * 4)) / 2);
const stageX = (i) => X0 + i * (STAGE_W + GAP);
const MID = STAGE_Y + STAGE_H / 2;

const STAGES = [
  { name: "Sector news", checks: 6 },
  { name: "Regulatory", checks: 4 },
  { name: "Competitors", checks: 5 },
  { name: "Transactions", checks: 3 },
  { name: "Contracts", checks: 6 }
];
const CHECKS = STAGES.reduce((a, s) => a + s.checks, 0);

const RAIL = { x: X0, y: 208, w: STAGE_W * 5 + GAP * 4, h: 8 };

function Monitor({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  const t = TYPE(compact);
  const radius = tw.radius;

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  const A0 = CUES.Ask + 0.2;
  const block = (i) => at(A0 + STAGGER * i, REVEAL_MS, REVEAL);
  const railIn = at(A0 + 0.3, 0.6, REVEAL);

  // The chain. run 850ms, handoff 280ms, and stage i+1 starts exactly when
  // stage i's baton arrives.
  const S0 = CUES.Gather - 0.1, RUN = 0.85, HAND = 0.28, STEP = RUN + HAND;
  const run = (i) => at(S0 + i * STEP, RUN, COUNT);
  const hand = (i) => at(S0 + i * STEP + RUN, HAND, LINEAR);

  const cleared = STAGES.reduce((a, s, i) => a + s.checks * run(i), 0);
  const done = (i) => run(i) > 0.995;
  const active = (i) => run(i) > 0.002 && run(i) <= 0.995;

  const seal = at(CUES.Answer + 0.3, 0.56, SPRING);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.7);

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)", opacity: fade
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {STAGES.slice(0, 4).map((s, i) => {
          const x1 = stageX(i) + STAGE_W, x2 = stageX(i + 1);
          const d = `M${x1} ${MID} L${x2} ${MID}`;
          return (
            <g key={i}>
              <path d={d} stroke={C.rule25} strokeWidth={HAIR} fill="none"
                strokeDasharray={GAP} strokeDashoffset={GAP * (1 - railIn)} />
              <Pulse d={d} len={GAP} p={hand(i)} o={1} dash={22} width={4} />
            </g>
          );
        })}
      </svg>

      {/* Aggregate: the effect of the row below, never animated on its own. */}
      <div style={{
        position: "absolute", left: X0, top: 84, width: RAIL.w,
        opacity: railIn, transform: `translateY(${(1 - railIn) * TRAVEL}px)`,
        display: "flex", alignItems: "baseline", gap: 16
      }}>
        <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>CHECKS CLEARED</span>
        <span style={{ flex: 1 }} />
        <span style={{ font: t.hero, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(cleared)}</span>
        <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>OF {CHECKS}</span>
      </div>

      <div style={{
        position: "absolute", left: RAIL.x, top: RAIL.y, width: RAIL.w, height: RAIL.h,
        background: C.well, opacity: railIn
      }}>
        <span style={{
          display: "block", height: RAIL.h,
          width: `${(cleared / CHECKS) * 100}%`, background: C.signal
        }} />
      </div>

      {STAGES.map((s, i) => {
        const p = run(i), on = active(i), fin = done(i);
        const tone = fin ? C.pos : on ? C.signal : C.signalSoft;
        return (
          <div key={i} style={{
            position: "absolute", left: stageX(i), top: STAGE_Y, width: STAGE_W, height: STAGE_H,
            boxSizing: "border-box", background: on ? C.tint : C.paper,
            border: `${HAIR}px solid ${on ? C.signal : C.rule15}`, borderRadius: radius,
            padding: "18px 20px", display: "flex", flexDirection: "column",
            opacity: block(i), transform: `translateY(${(1 - block(i)) * TRAVEL}px)`
          }}>
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1 }} />
              <span style={{ flex: "none", width: 12, height: 12, background: tone }} />
            </div>

            <span style={{ flex: "none", marginTop: 14, font: t.title, color: C.ink }}>{s.name}</span>

            <span style={{ flex: 1 }} />

            {/* One tick per check — the stage's own detail, filling in order. */}
            <div style={{ flex: "none", display: "flex", gap: 6, marginBottom: 14 }}>
              {Array.from({ length: s.checks }).map((_, k) => (
                <span key={k} style={{
                  flex: 1, height: 14,
                  background: p >= (k + 1) / s.checks ? tone : C.rule15
                }} />
              ))}
            </div>

            <div style={{ flex: "none", display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                font: t.figSm, color: fin ? C.pos : on ? C.ink : C.label,
                fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"
              }}>{fmt(s.checks * p)}</span>
              <span style={{
                font: t.micro, letterSpacing: TRACK, color: C.label, whiteSpace: "nowrap"
              }}>/ {s.checks}</span>
            </div>
            <span style={{
              flex: "none", marginTop: 10, font: t.micro, letterSpacing: TRACK,
              whiteSpace: "nowrap",
              color: fin ? C.pos : on ? C.signal : C.label
            }}>{fin ? "CLEAR" : on ? "RUNNING" : "QUEUED"}</span>
          </div>
        );
      })}

      <div style={{
        position: "absolute", left: X0, top: 644, width: RAIL.w,
        borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 18,
        display: "flex", alignItems: "center", gap: 12,
        opacity: clamp(seal * 2, 0, 1)
      }}>
        <span style={{
          flex: "none", width: 18, height: 18, background: C.pos, transform: `scale(${seal})`
        }} />
        <span style={{ font: t.micro, letterSpacing: TRACK, color: C.ink }}>NOTHING UNCHECKED</span>
        <span style={{ flex: 1 }} />
        {compact ? null : (
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>FIVE STAGES · NO EXCEPTIONS</span>
        )}
      </div>
    </div>
  );
}

function MonitorFeedPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <Monitor tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Loop" />
        <TweakSlider label="Cross-fade floor" value={tw.loopFloor} min={0} max={0.5} step={0.05} onChange={(v) => setTweak("loopFloor", v)} />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.MonitorFeedPiece = MonitorFeedPiece;
