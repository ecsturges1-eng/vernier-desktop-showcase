const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider } = window;
const {
  HAIR, useCompact, useStageFit, REVEAL, REVEAL_MS, TRAVEL, STAGGER,
  COUNT, SPRING, LINEAR, TYPE, TRACK, C, loopFade, fmt, polyD, polyLen, Pulse
} = window.PS;

const W = 1200, H = 760;

// ---------------------------------------------------------------------------
// 01 — Evidence base. A two-column flow: five sources on the left, the
// collated total on the right. The point of the piece is causation, so each
// source lights, sends a visible pulse down its wire, and the total only
// advances by that source's own contribution once the pulse has arrived.
// Five discrete increments, not one counter ticking on its own.
// ---------------------------------------------------------------------------

const CARD = { x: 40, w: 548, h: 88 };
const CARD_Y = [96, 216, 336, 456, 576];
const TRUNK_X = 614;
const BOX = { x: 660, y: 230, w: 460, h: 300 };
const JOIN = [BOX.x, BOX.y + BOX.h / 2];
const NODE = 10;

const SOURCES = [
  { title: "Sector news", meta: "TRADE PRESS", rows: 120 },
  { title: "Regulatory updates", meta: "EEA · UK · US", rows: 86 },
  { title: "Competitor analysis", meta: "12 PROVIDERS", rows: 940 },
  { title: "Transaction ledger", meta: "84.7K ROWS", rows: 81768 },
  { title: "Contract terms", meta: "1,806 DOCS", rows: 1806 }
];
const TOTAL = SOURCES.reduce((a, s) => a + s.rows, 0);

const ROUTES = CARD_Y.map((y) => {
  const cy = y + CARD.h / 2;
  const pts = cy === JOIN[1]
    ? [[CARD.x + CARD.w, cy], JOIN]
    : [[CARD.x + CARD.w, cy], [TRUNK_X, cy], [TRUNK_X, JOIN[1]], JOIN];
  return { d: polyD(pts), len: polyLen(pts) };
});

function Ingest({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  const t = TYPE(compact);
  const radius = tw.radius;
  const showMeta = tw.labels && !compact;

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  const shell = at(CUES.Sources + 0.04, REVEAL_MS, REVEAL);
  const ROW0 = CUES.Sources + 0.16;
  const card = (i) => at(ROW0 + STAGGER * i, REVEAL_MS, REVEAL);
  const wire = (i) => at(ROW0 + STAGGER * i + REVEAL_MS * 0.75, 0.42, REVEAL);
  const node = at(ROW0 + STAGGER * 4 + REVEAL_MS - 0.1, 0.42, REVEAL);

  // The causal chain. Each source fires 620ms after the one above it.
  const FIRE0 = CUES.Flow + 0.15, STEP = 0.62;
  const fireAt = (i) => FIRE0 + i * STEP;
  // cause: the source frame brightens, and holds only while it is sending
  const live = (i) => {
    const up = at(fireAt(i), 0.22, REVEAL);
    const down = at(fireAt(i) + 0.62, 0.3, REVEAL);
    return clamp(up - down, 0, 1);
  };
  // the signal itself, 120ms behind the source lighting
  const travel = (i) => at(fireAt(i) + 0.12, 0.42, LINEAR);
  // effect: the total takes this source's rows, 300ms behind the cause
  const took = (i) => at(fireAt(i) + 0.30, 0.45, COUNT);

  const count = SOURCES.reduce((a, s, i) => a + s.rows * took(i), 0);
  const read = SOURCES.reduce((a, s, i) => a + (took(i) > 0.995 ? 1 : 0), 0);

  const seal = at(CUES.Collate + 0.25, 0.56, SPRING);
  const conf = at(CUES.Settle + 0.1, REVEAL_MS, REVEAL);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.7);

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)", opacity: fade
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {ROUTES.map((r, i) => (
          <path key={i} d={r.d} fill="none"
            stroke={live(i) > 0.05 ? C.signalSoft : C.rule25} strokeWidth={HAIR}
            strokeLinejoin="miter" strokeLinecap="butt"
            strokeDasharray={r.len} strokeDashoffset={r.len * (1 - wire(i))} />
        ))}
        {ROUTES.map((r, i) => (
          <Pulse key={"p" + i} d={r.d} len={r.len} p={travel(i)} o={1} dash={130} />
        ))}
        <rect x={JOIN[0] - NODE / 2} y={JOIN[1] - NODE / 2} width={NODE} height={NODE}
          fill={C.ink} opacity={node} />
      </svg>

      {SOURCES.map((s, i) => {
        const l = live(i), done = took(i) > 0.995;
        return (
          <div key={i} style={{
            position: "absolute", left: CARD.x, top: CARD_Y[i], width: CARD.w, height: CARD.h,
            boxSizing: "border-box", background: l > 0.05 ? C.tint : C.paper,
            border: `${HAIR}px solid ${l > 0.05 ? C.signal : C.rule15}`, borderRadius: radius,
            padding: "0 18px", display: "flex", alignItems: "center", gap: 10, overflow: "hidden",
            opacity: card(i), transform: `translateY(${(1 - card(i)) * TRAVEL}px)`
          }}>
            <span style={{
              flex: "none", width: 12, height: 12,
              background: done ? C.pos : l > 0.05 ? C.signal : C.rule25
            }} />
            <span style={{ flex: "none", whiteSpace: "nowrap", font: t.title, color: C.ink }}>{s.title}</span>
            <span style={{ flex: 1 }} />
            {showMeta ? (
              <span style={{
                flex: "0 1 auto", minWidth: 0, whiteSpace: "nowrap", overflow: "hidden",
                textOverflow: "ellipsis", font: t.micro,
                letterSpacing: TRACK, color: C.label
              }}>{s.meta}</span>
            ) : null}
            <span style={{
              flex: "none", minWidth: 92, textAlign: "right", whiteSpace: "nowrap",
              font: t.figSm, color: done ? C.ink : l > 0.05 ? C.signal : C.label,
              fontVariantNumeric: "tabular-nums"
            }}>{took(i) > 0.002 ? "+" + fmt(s.rows * took(i)) : "—"}</span>
          </div>
        );
      })}

      <div style={{
        position: "absolute", left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h,
        boxSizing: "border-box", background: C.paper,
        border: `${HAIR}px solid ${C.rule25}`, borderRadius: radius, overflow: "hidden",
        padding: "24px 30px", display: "flex", flexDirection: "column",
        opacity: shell, transform: `translateY(${(1 - shell) * TRAVEL}px)`
      }}>
        <div style={{ flex: "none", display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>RECORDS COLLATED</span>
          <span style={{ flex: 1 }} />
          <span style={{
            font: t.micro, letterSpacing: TRACK, color: C.slate, fontVariantNumeric: "tabular-nums"
          }}>{read}/5 SOURCES</span>
        </div>

        <div style={{ flex: "none", marginTop: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ font: t.hero, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(count)}</span>
          <span style={{ display: "block", height: 8, background: C.well }}>
            <span style={{ display: "block", height: 8, width: `${(count / TOTAL) * 100}%`, background: C.signal }} />
          </span>
        </div>

        <span style={{ flex: 1, minHeight: 20 }} />

        <div style={{
          flex: "none", borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 16,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{
            flex: "none", width: 18, height: 18, background: C.pos,
            opacity: clamp(seal * 4, 0, 1), transform: `scale(${seal})`
          }} />
          <span style={{
            whiteSpace: "nowrap", font: t.micro, letterSpacing: TRACK, color: C.ink,
            opacity: clamp(seal * 2, 0, 1)
          }}>COLLATED</span>
        </div>
      </div>

      {compact ? null : (
        <div style={{
          position: "absolute", left: BOX.x, top: BOX.y + BOX.h + 28, width: BOX.w,
          opacity: conf, transform: `translateY(${(1 - conf) * TRAVEL}px)`,
          font: t.micro, letterSpacing: TRACK, color: C.label
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
        <TweakToggle label="Source labels" value={tw.labels} onChange={(v) => setTweak("labels", v)} />
        <TweakSection label="Loop" />
        <TweakSlider label="Cross-fade floor" value={tw.loopFloor} min={0} max={0.5} step={0.05} onChange={(v) => setTweak("loopFloor", v)} />
        <TweakSection label="Surface" />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={12} step={3} unit="px" onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.IngestPiece = IngestPiece;
