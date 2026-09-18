const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider } = window;
const {
  HAIR, useCompact, useStageFit, REVEAL, REVEAL_MS, TRAVEL, STAGGER,
  COUNT, SPRING, TYPE, TRACK, C, loopFade
} = window.PS;

const W = 1200, H = 760;

// ---------------------------------------------------------------------------
// 04 — Rollout. A six-card grid rather than a panel of rows. Each card runs
// its own work, and its gate seal is the consequence of that work finishing:
// the bar lands, then 180ms later the seal clicks in and the aggregate rail
// at the top takes its segment. The top of the frame never moves first.
// ---------------------------------------------------------------------------

const M = 40, CARD_W = 354, CARD_H = 224, GAP = 29;
const COLS = 3;
const cardX = (i) => M + (i % COLS) * (CARD_W + GAP);
const cardY = (i) => (i < COLS ? 196 : 196 + CARD_H + 36);
const FULL_W = CARD_W * COLS + GAP * (COLS - 1);

const WORK = [
  { title: "Pricing committee", gate: "COMMITTEE SIGN-OFF", fact: "Approved" },
  { title: "Antitrust screen", gate: "LEGAL REVIEW", fact: "No flag" },
  { title: "Contract repapering", gate: "1,806 DOCS", fact: "Reissued" },
  { title: "Billing migration", gate: "SYSTEM CUTOVER", fact: "Live" },
  { title: "Field enablement", gate: "214 SELLERS", fact: "Trained" },
  { title: "Customer notice", gate: "90-DAY WINDOW", fact: "Served" }
];

function Implement({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  const t = TYPE(compact);
  const radius = tw.radius;

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  const head = at(CUES.Plan + 0.05, REVEAL_MS, REVEAL);
  const card = (i) => at(CUES.Plan + 0.2 + STAGGER * i, REVEAL_MS, REVEAL);

  // cause: the work itself. effect: the gate, 180ms after the bar lands.
  const fill = (i) => at(CUES.Work + i * 0.42, 1.1, COUNT) * tw.progress;
  const gate = (i) => at(CUES.Work + i * 0.42 + 1.1 + 0.18, 0.56, SPRING) * (fill(i) > 0.99 ? 1 : 0);

  const landed = WORK.reduce((a, w, i) => a + (gate(i) > 0.5 ? 1 : 0), 0);
  const aggregate = WORK.reduce((a, w, i) => a + gate(i), 0) / WORK.length;

  const track = at(CUES.Track + 0.1, REVEAL_MS, REVEAL);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.7);

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)", opacity: fade
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} />

      <div style={{
        position: "absolute", left: M, top: 74, width: FULL_W,
        opacity: head, transform: `translateY(${(1 - head) * TRAVEL}px)`,
        display: "flex", flexDirection: "column", gap: 18
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>WORKSTREAMS LANDED</span>
          <span style={{ flex: 1 }} />
          <span style={{ font: t.fig, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{landed}</span>
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>OF {WORK.length}</span>
        </div>
        {/* one segment per card, each turned by its own gate */}
        <div style={{ display: "flex", gap: 4 }}>
          {WORK.map((w, i) => (
            <span key={i} style={{ flex: 1, height: 8, background: C.well }}>
              <span style={{
                display: "block", height: 8, width: `${clamp(gate(i), 0, 1) * 100}%`, background: C.pos
              }} />
            </span>
          ))}
        </div>
      </div>

      {WORK.map((w, i) => {
        const f = fill(i), g = gate(i);
        const live = f > 0.02 && f < 0.995;
        const tone = g > 0.5 ? C.pos : live ? C.signal : C.signalSoft;
        return (
          <div key={i} style={{
            position: "absolute", left: cardX(i), top: cardY(i), width: CARD_W, height: CARD_H,
            boxSizing: "border-box", background: live ? C.tint : C.paper,
            border: `${HAIR}px solid ${live ? C.signal : C.rule15}`, borderRadius: radius,
            padding: "20px 22px", display: "flex", flexDirection: "column",
            opacity: card(i), transform: `translateY(${(1 - card(i)) * TRAVEL}px)`
          }}>
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1 }} />
              <span style={{
                flex: "none", width: 14, height: 14, background: tone,
                transform: g > 0 ? `scale(${clamp(g, 0.2, 1)})` : "none"
              }} />
            </div>

            <span style={{ flex: "none", marginTop: 12, font: t.title, color: C.ink }}>{w.title}</span>
            <span style={{
              flex: "none", marginTop: 8, font: t.micro, letterSpacing: TRACK, color: C.label
            }}>{w.gate}</span>

            <span style={{ flex: 1 }} />

            <div style={{ flex: "none", display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
              <span style={{
                font: t.figSm, color: g > 0.5 ? C.pos : live ? C.ink : C.label,
                fontVariantNumeric: "tabular-nums"
              }}>{Math.round(f * 100)}%</span>
              <span style={{ flex: 1 }} />
              <span style={{
                font: t.micro, letterSpacing: TRACK,
                color: g > 0.5 ? C.pos : live ? C.signal : C.label,
                opacity: g > 0.5 ? clamp(g * 2, 0, 1) : 1
              }}>{g > 0.5 ? w.fact.toUpperCase() : live ? "IN FLIGHT" : "QUEUED"}</span>
            </div>

            <span style={{ flex: "none", display: "block", height: 8, background: C.well }}>
              <span style={{ display: "block", height: 8, width: `${f * 100}%`, background: g > 0.5 ? C.pos : C.signal }} />
            </span>
          </div>
        );
      })}

      <div style={{
        position: "absolute", left: M, top: 700, width: FULL_W,
        borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 16,
        display: "flex", alignItems: "center", gap: 14,
        opacity: track, font: t.micro, letterSpacing: TRACK, color: C.label
      }}>
        <span>ROLLOUT {Math.round(aggregate * 100)}% COMPLETE</span>
        <span style={{ flex: 1 }} />
        {compact ? null : <span>TRACKED WEEKLY · OWNER NAMED ON EVERY GATE</span>}
      </div>
    </div>
  );
}

function ImplementRolloutPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <Implement tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Rollout" />
        <TweakSlider label="Completion" value={tw.progress} min={0.2} max={1} step={0.1} onChange={(v) => setTweak("progress", v)} />
        <TweakSection label="Loop" />
        <TweakSlider label="Cross-fade floor" value={tw.loopFloor} min={0} max={0.5} step={0.05} onChange={(v) => setTweak("loopFloor", v)} />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.ImplementRolloutPiece = ImplementRolloutPiece;
