const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;
const DS = window.VernierDesignSystem_7374ab || {};
const { Logo, DeltaBadge } = DS;

const W = 1080, H = 1350;
const SECTOR_H = 500, COMP_H = 392, ROW_H = 104;

// Three motion helpers — nothing eases outside these.
const MOTION = {
  enter: Easing.easeOutCubic,
  draw: Easing.easeInOutQuart,
  settle: Easing.easeOutQuart
};

function palette(ground, glass) {
  const ink = ground === "ink";
  return {
    ink,
    bg: ink ? "#06122A" : "#EAEBEA",
    text: ink ? "#EAEBEA" : "#06122A",
    dim: ink ? "#A5B2C6" : "#2E3A4D",
    accent: ink ? "#49C4F1" : "#24409B",
    rule: ink ? "rgba(234,235,234,.20)" : "rgba(6,18,42,.15)",
    ruleSoft: ink ? "rgba(234,235,234,.10)" : "rgba(6,18,42,.10)",
    panel: ink ? `rgba(234,235,234,${glass})` : `rgba(244,245,244,${Math.min(0.95, glass * 8 + 0.45)})`,
    well: ink ? "rgba(234,235,234,.035)" : "rgba(6,18,42,.03)"
  };
}

const STORIES = [
  {
    kicker: "AI · 24 AUG 2026",
    head: "Agentic AI moves from pilot to production across asset management operating models",
    tag: "OPS IMPACT · MEDIUM"
  },
  {
    kicker: "FEES · 21 AUG 2026",
    head: "Fee compression persists as passive share of net flows widens",
    tag: "FEE IMPACT · HIGH"
  }
];

const PEERS = [
  ["Peer group median", "0.69%", "−3.0bps"],
  ["Largest four, blended", "0.64%", "−8.0bps"],
  ["Passive substitute", "0.18%", "−54.0bps"],
  ["VR-2291, optimised", "0.78%", "+6.0bps"]
];

const ROWS = [
  { title: "Competitive analysis", meta: "4 UPDATED" },
  { title: "New launches", meta: "12 THIS WEEK" },
  { title: "Regions", meta: "EMEA · NA · APAC" }
];

function Chevron({ open, color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 12 12" style={{ display: "block", flex: "none", transform: `rotate(${open * 90}deg)`, transformOrigin: "50% 50%" }}>
      <path d="M3.5 1.5 L8.5 6 L3.5 10.5" fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function Row({ C, title, meta, hl, open }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24, height: ROW_H, flex: "0 0 auto",
      padding: "0 88px 0 44px", borderTop: `1px solid ${C.ruleSoft}`,
      background: hl > 0 ? (C.ink ? `rgba(234,235,234,${0.05 * hl})` : `rgba(6,18,42,${0.03 * hl})`) : "transparent"
    }}>
      <Chevron open={open} color={hl > 0.35 ? C.accent : C.dim} />
      <span style={{ flex: 1, font: "500 26px/1 var(--font-sans)", color: C.text, letterSpacing: "-0.005em" }}>{title}</span>
      <span style={{
        font: "400 14px/1 var(--font-mono)", letterSpacing: ".12em",
        color: hl > 0.35 ? C.accent : C.dim, fontVariantNumeric: "tabular-nums"
      }}>{meta}</span>
    </div>
  );
}

function Story({ C, story, i, appear, bar }) {
  return (
    <div style={{ display: "flex", gap: 36, opacity: appear, transform: `translateY(${(1 - appear) * 16}px)` }}>
      <div style={{
        width: 3, alignSelf: "stretch",
        background: i === 0 ? C.accent : C.rule,
        transform: `scaleY(${i === 0 ? bar : 1})`, transformOrigin: "top"
      }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>{story.kicker}</div>
        <div style={{ font: "500 30px/1.3 var(--font-sans)", color: C.text, textWrap: "pretty", maxWidth: 720, letterSpacing: "-0.01em" }}>{story.head}</div>
        <div style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums", paddingTop: 4 }}>{story.tag}</div>
      </div>
    </div>
  );
}

function PeerTable({ C, appear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 150px 190px", paddingBottom: 20,
        font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim
      }}>
        <span>COMPARATOR</span>
        <span style={{ textAlign: "right" }}>OGC</span>
        <span style={{ textAlign: "right" }}>VS VR-2291</span>
      </div>
      {PEERS.map((p, i) => {
        const a = appear(i);
        const last = i === PEERS.length - 1;
        return (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 150px 190px", alignItems: "center",
            borderTop: `1px solid ${C.ruleSoft}`, padding: "22px 0",
            opacity: a, transform: `translateY(${(1 - a) * 10}px)`
          }}>
            <span style={{ font: "400 21px/1 var(--font-sans)", color: last ? C.text : C.dim }}>{p[0]}</span>
            <span style={{ font: "400 19px/1 var(--font-mono)", letterSpacing: ".06em", textAlign: "right", color: last ? C.accent : C.dim, fontVariantNumeric: "tabular-nums" }}>{p[1]}</span>
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <DeltaBadge value={p[2]} ground={C.ink ? "ink" : "paper"} muted={!last} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Monitor({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 12;

  // Camera — one continuous loop-safe drift.
  const phase = (2 * Math.PI * T) / total;
  const camScale = 1.006 - 0.006 * Math.cos(phase);
  const camY = -8 * Math.sin(phase);

  // Accordion: sector news closes as competitive analysis opens, then swaps back.
  const sector = T < CUES.Return
    ? animate({ from: 1, to: 0, start: CUES.Swap + 0.2, end: CUES.Swap + 1.3, ease: MOTION.draw })(T)
    : animate({ from: 0, to: 1, start: CUES.Return + 0.25, end: CUES.Return + 1.5, ease: MOTION.draw })(T);
  const comp = T < CUES.Return
    ? animate({ from: 0, to: 1, start: CUES.Swap + 0.55, end: CUES.Swap + 1.8, ease: MOTION.draw })(T)
    : animate({ from: 1, to: 0, start: CUES.Return + 0.1, end: CUES.Return + 1.0, ease: MOTION.draw })(T);

  const story = (i) => {
    if (T < CUES.Swap) return 1;
    if (T < CUES.Return) return animate({ from: 1, to: 0, start: CUES.Swap + 0.1 + 0.1 * i, end: CUES.Swap + 0.7 + 0.1 * i, ease: Easing.easeInQuad })(T);
    return animate({ from: 0, to: 1, start: CUES.Return + 1.1 + 0.28 * i, end: CUES.Return + 2.2 + 0.28 * i, ease: MOTION.enter })(T);
  };

  const peer = (i) => T < CUES.Return
    ? animate({ from: 0, to: 1, start: CUES.Swap + 1.1 + 0.18 * i, end: CUES.Swap + 1.9 + 0.18 * i, ease: MOTION.enter })(T)
    : animate({ from: 1, to: 0, start: CUES.Return, end: CUES.Return + 0.5, ease: Easing.easeInQuad })(T);

  const bar = T < CUES.Swap ? 1
    : T < CUES.Return ? animate({ from: 1, to: 0, start: CUES.Swap, end: CUES.Swap + 0.45, ease: MOTION.settle })(T)
    : animate({ from: 0, to: 1, start: CUES.Return + 1.8, end: CUES.Return + 3.0, ease: MOTION.draw })(T);

  // Scan sweep across the three closed sections — transient, back to zero by the cue.
  const bump = (s, e) => clamp(
    animate({ from: 0, to: 1, start: s, end: s + 0.35, ease: MOTION.enter })(T) -
    animate({ from: 0, to: 1, start: e - 0.35, end: e, ease: MOTION.enter })(T), 0, 1);
  const hl = (i) => Math.max(bump(CUES.Scan + 0.3 + 0.7 * i, CUES.Scan + 1.05 + 0.7 * i), i === 0 ? comp : 0);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: 112, top: 196, width: 1012, height: 1220,
        background: C.panel, border: `1px solid ${C.rule}`, borderRadius: tw.radius,
        transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: "42% 38%",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "44px 44px 48px", flex: "0 0 auto" }}>
          <Logo size={32} ground={C.ink ? "ink" : "paper"} />
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 24, height: ROW_H, flex: "0 0 auto",
          padding: "0 88px 0 44px", borderTop: `1px solid ${C.ruleSoft}`
        }}>
          <Chevron open={sector} color={sector > 0.35 ? C.accent : C.dim} />
          <span style={{ flex: 1, font: "500 26px/1 var(--font-sans)", color: C.text, letterSpacing: "-0.005em" }}>Sector news</span>
          <span style={{ font: "400 14px/1 var(--font-mono)", letterSpacing: ".12em", color: sector > 0.35 ? C.accent : C.dim }}>2 NEW</span>
        </div>

        <div style={{ height: SECTOR_H * sector, overflow: "hidden", background: C.well, flex: "0 0 auto" }}>
          <div style={{ padding: "24px 88px 44px 44px", display: "flex", flexDirection: "column", gap: 40 }}>
            {STORIES.map((s, i) => <Story key={i} C={C} story={s} i={i} appear={story(i)} bar={bar} />)}
          </div>
        </div>

        <Row C={C} title={ROWS[0].title} meta={ROWS[0].meta} hl={hl(0)} open={comp} />

        <div style={{ height: COMP_H * comp, overflow: "hidden", background: C.well, flex: "0 0 auto" }}>
          <div style={{ padding: "28px 88px 36px 83px" }}>
            <PeerTable C={C} appear={peer} />
          </div>
        </div>

        {ROWS.slice(1).map((r, i) => <Row key={i} C={C} title={r.title} meta={r.meta} hl={hl(i + 1)} open={0} />)}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}

function MonitorPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage
        width={W} height={H}
        scenes={window.OM_SCENES}
        playback={window.OM_PLAYBACK}
        bg={tw.ground === "ink" ? "#06122A" : "#EAEBEA"}
      >
        <Monitor tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Surface" />
        <TweakRadio label="Ground" value={tw.ground} options={["ink", "paper"]} onChange={(v) => setTweak("ground", v)} />
        <TweakSlider label="Translucency" value={tw.glass} min={0.02} max={0.14} step={0.005} onChange={(v) => setTweak("glass", v)} />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={28} step={2} unit="px" onChange={(v) => setTweak("radius", v)} />
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak("motionEditor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.MonitorPiece = MonitorPiece;
