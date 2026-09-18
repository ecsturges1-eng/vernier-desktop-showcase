const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider } = window;
const {
  HAIR, useCompact, useStageFit, REVEAL, REVEAL_MS, TRAVEL,
  COUNT, SPRING, TYPE, TRACK, C, loopFade, fmt, Pulse
} = window.PS;

const W = 1200, H = 760;

// ---------------------------------------------------------------------------
// 06 — The record. A spine, newest decision at the top, each entry taking its
// seal in turn. The seal is the cause; the evidence tally on the right takes
// that entry's items 120ms after the seal lands, so the count is visibly the
// consequence of the record closing rather than a number running on its own.
// Green seals are human sign-off, soft accent are model-logged.
// ---------------------------------------------------------------------------

const SPINE_X = 224;
const ROW_H = 96, ROW_GAP = 16;
const ROW0 = 148;
const rowY = (i) => ROW0 + i * (ROW_H + ROW_GAP);
const CARD = { x: 254, w: 600 };
const READ_X = 890, READ_W = 270;

const ENTRIES = [
  { date: "14 MAR 2026", owner: "Pricing committee", decision: "List price +4.0%", signed: true, items: 46 },
  { date: "02 MAR 2026", owner: "Legal", decision: "Antitrust screen clear", signed: true, items: 18 },
  { date: "21 FEB 2026", owner: "Vernier model", decision: "Headroom 6.4% found", signed: false, items: 112 },
  { date: "09 FEB 2026", owner: "Finance", decision: "Margin floor set", signed: true, items: 27 },
  { date: "28 JAN 2026", owner: "Vernier model", decision: "Elasticity refit", signed: false, items: 84 }
];
const ITEMS = ENTRIES.reduce((a, e) => a + e.items, 0);

const SPINE_TOP = ROW0 - 20;
const SPINE_BOT = rowY(ENTRIES.length - 1) + ROW_H + 20;
const SPINE_LEN = SPINE_BOT - SPINE_TOP;

function DefendTrim({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  // one step down from the shared scale — this piece is the densest of the
  // six, and the extra room comes from the left gutter rather than from size
  const base = TYPE(compact);
  const t = Object.assign({}, base, {
    fig: compact ? "400 30px/1.1 var(--font-mono)" : "400 26px/1.1 var(--font-mono)",
    figSm: compact ? "400 22px/1.1 var(--font-mono)" : "400 19px/1.1 var(--font-mono)",
    title: compact ? "500 26px/1.25 var(--font-sans)" : "500 20px/1.25 var(--font-sans)",
    micro: compact ? "400 19px/1.2 var(--font-mono)" : "400 15px/1.2 var(--font-mono)"
  });
  const radius = tw.radius;

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  const spine = at(CUES.Repository + 0.3, 1.0, REVEAL);
  const head = at(CUES.Repository + 0.1, REVEAL_MS, REVEAL);
  const entry = (i) => at(CUES.History - 0.2 + i * 0.12, REVEAL_MS, REVEAL);

  const seal = (i) => at(CUES.Signed + i * 0.3, 0.56, SPRING);
  const took = (i) => at(CUES.Signed + i * 0.3 + 0.12, 0.5, COUNT);
  const evidence = ENTRIES.reduce((a, e, i) => a + e.items * took(i), 0);
  const sealedCount = ENTRIES.reduce((a, e, i) => a + (took(i) > 0.995 ? 1 : 0), 0);

  const ready = at(CUES.Ready + 0.1, REVEAL_MS, REVEAL);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.7);

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)", opacity: fade
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={SPINE_X} y1={SPINE_TOP} x2={SPINE_X} y2={SPINE_BOT}
          stroke={C.rule25} strokeWidth={HAIR}
          strokeDasharray={SPINE_LEN} strokeDashoffset={SPINE_LEN * (1 - spine)} />

        {ENTRIES.map((e, i) => {
          const cy = rowY(i) + ROW_H / 2;
          const s = seal(i);
          const tone = took(i) > 0.995 ? (e.signed ? C.pos : C.signalSoft) : C.rule25;
          const d = `M${SPINE_X} ${cy} L${CARD.x} ${cy}`;
          return (
            <g key={i}>
              <line x1={SPINE_X} y1={cy} x2={CARD.x} y2={cy}
                stroke={C.rule25} strokeWidth={HAIR} opacity={entry(i)} />
              <Pulse d={d} len={CARD.x - SPINE_X} p={at(CUES.Signed + i * 0.3, 0.26, REVEAL)} o={1} dash={14} width={4} />
              <rect x={SPINE_X - 7} y={cy - 7} width={14} height={14}
                fill={tone} opacity={entry(i)}
                transform={s > 0 ? `translate(${SPINE_X} ${cy}) scale(${clamp(s, 0.4, 1.04)}) translate(${-SPINE_X} ${-cy})` : undefined} />
            </g>
          );
        })}
      </svg>

      <div style={{
        position: "absolute", left: 24, top: 84, width: 830,
        opacity: head, transform: `translateY(${(1 - head) * TRAVEL}px)`,
        font: t.micro, letterSpacing: TRACK, color: C.label,
        display: "flex", gap: 28
      }}>
        <span>DECISION RECORD · NEWEST FIRST</span>
        <span style={{ color: C.pos }}>■ SIGNED OFF</span>
        <span style={{ color: C.signalSoft }}>■ MODEL-LOGGED</span>
      </div>

      {ENTRIES.map((e, i) => {
        const a = entry(i), s = took(i) > 0.995;
        return (
          <React.Fragment key={i}>
            <div style={{
              position: "absolute", left: 24, top: rowY(i) + 36, width: 176, textAlign: "right",
              font: t.micro, letterSpacing: TRACK, color: C.label, opacity: a
            }}>{e.date}</div>

            <div style={{
              position: "absolute", left: CARD.x, top: rowY(i), width: CARD.w, height: ROW_H,
              boxSizing: "border-box", background: C.paper,
              border: `${HAIR}px solid ${C.rule15}`, borderRadius: radius,
              padding: "0 22px", display: "flex", alignItems: "center", gap: 16,
              opacity: a, transform: `translateY(${(1 - a) * TRAVEL}px)`
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                <span style={{ font: t.title, color: C.ink, whiteSpace: "nowrap" }}>{e.decision}</span>
                <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>{e.owner.toUpperCase()}</span>
              </div>
              <span style={{ flex: 1 }} />
              <span style={{
                font: t.figSm, color: s ? C.ink : C.label, fontVariantNumeric: "tabular-nums"
              }}>{fmt(e.items * took(i))}</span>
              <span style={{
                font: t.micro, letterSpacing: TRACK, color: C.label, minWidth: 54
              }}>ITEMS</span>
            </div>
          </React.Fragment>
        );
      })}

      <div style={{
        position: "absolute", left: READ_X, top: ROW0 - 20, width: READ_W,
        display: "flex", flexDirection: "column"
      }}>
        {[
          { l: "EVIDENCE ITEMS", v: fmt(evidence), c: C.ink, o: head },
          { l: "DECISIONS CLOSED", v: sealedCount + " / " + ENTRIES.length, c: C.ink, o: head },
          { l: "GAPS", v: "0", c: C.pos, o: ready }
        ].map((row, i) => (
          <div key={i} style={{
            borderTop: `${HAIR}px solid ${i === 0 ? C.rule25 : C.rule15}`,
            padding: "20px 0 24px", display: "flex", flexDirection: "column", gap: 12,
            opacity: row.o, transform: `translateY(${(1 - row.o) * TRAVEL}px)`
          }}>
            <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>{row.l}</span>
            <span style={{ font: t.fig, color: row.c, fontVariantNumeric: "tabular-nums" }}>{row.v}</span>
          </div>
        ))}

        <div style={{
          borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 18,
          display: "flex", alignItems: "center", gap: 12, opacity: ready
        }}>
          <span style={{ flex: "none", width: 18, height: 18, background: C.pos }} />
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.ink, whiteSpace: "nowrap" }}>SEVEN-YEAR RETENTION</span>
        </div>
      </div>

      {compact ? null : (
        <div style={{
          position: "absolute", left: 24, top: 700, width: 830,
          borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 16,
          font: t.micro, letterSpacing: TRACK, color: C.label, opacity: ready
        }}>{fmt(ITEMS)} ITEMS · EVERY DECISION TIMESTAMPED AND ATTRIBUTED</div>
      )}
    </div>
  );
}

function DefendMobile2Piece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <DefendTrim tw={tw} />
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

window.DefendMobile2Piece = DefendMobile2Piece;
