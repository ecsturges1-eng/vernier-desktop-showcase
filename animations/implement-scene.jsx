const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;
const DS = window.VernierDesignSystem_7374ab || {};
const { Logo, SectionLabel } = DS;

const W = 1080, H = 1350;
const ROW_H = 164, STAMP_H = 124, CARD_H = ROW_H * 5 + STAMP_H;
const P0 = 2.35; // opening state: two steps stamped, the third under review

const MOTION = {
  enter: Easing.easeOutCubic,
  draw: Easing.easeInOutQuart,
  settle: Easing.easeOutQuart
};

const STEPS = [
  { id: "01", name: "Pricing committee", meta: "2 APPROVERS" },
  { id: "02", name: "Antitrust screen", meta: "PEER SET, 41 FUNDS" },
  { id: "03", name: "Product governance", meta: "TARGET MARKET REVIEWED" },
  { id: "04", name: "Client disclosure", meta: "KID · FACTSHEET" },
  { id: "05", name: "Fee schedule live", meta: "EMEA · NA · APAC" }
];

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
    well: ink ? "rgba(234,235,234,.035)" : "rgba(6,18,42,.03)",
    muted: ink ? "rgba(165,178,198,.45)" : "#DCDEDD",
    green: ink ? "#3FC08A" : "#1F7A57",
    amber: ink ? "#E0A33C" : "#8A6212"
  };
}

function track(keys, T) {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (T <= t1) return t1 === t0 ? v1 : v0 + (v1 - v0) * MOTION.draw((T - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

function Pill({ C, tone, children }) {
  const fill = tone === "green" ? C.green : tone === "amber" ? C.amber : null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", alignSelf: "center",
      background: fill || "transparent",
      color: fill ? (C.ink ? "#06122A" : "#EAEBEA") : C.dim,
      border: fill ? "none" : `1px solid ${C.rule}`,
      font: "500 13px/1 var(--font-mono)", letterSpacing: ".10em",
      padding: fill ? "7px 10px" : "6px 9px"
    }}>{children}</span>
  );
}

function Step({ C, step, i, p }) {
  const done = clamp(p - i, 0, 1);          // 0 pending · 0–1 under review · 1 stamped
  const state = done >= 1 ? "done" : done > 0 ? "live" : "queued";
  const node = state === "done" ? C.green : state === "live" ? C.amber : "transparent";
  return (
    <div style={{ display: "flex", gap: 24, height: ROW_H, alignItems: "center", padding: "0 88px 0 44px", borderTop: `1px solid ${C.ruleSoft}` }}>
      <div style={{ position: "relative", width: 15, alignSelf: "stretch", flex: "none" }}>
        <div style={{ position: "absolute", left: 7, top: 0, width: 1, height: "100%", background: C.ruleSoft }} />
        <div style={{ position: "absolute", left: 7, top: 0, width: 1, height: `${done * 100}%`, background: C.green }} />
        <div style={{
          position: "absolute", left: 2, top: ROW_H / 2 - 6, width: 12, height: 12,
          background: node, border: state === "queued" ? `1px solid ${C.muted}` : "none"
        }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
          <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{step.id}</span>
          <span style={{ font: "500 26px/1 var(--font-sans)", letterSpacing: "-0.005em", color: state === "queued" ? C.dim : C.text }}>{step.name}</span>
        </div>
        <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>{step.meta}</span>
      </div>
      <Pill C={C} tone={state === "done" ? "green" : state === "live" ? "amber" : null}>
        {state === "done" ? "STAMPED" : state === "live" ? "IN REVIEW" : "QUEUED"}
      </Pill>
    </div>
  );
}

function Card({ C, p }) {
  const complete = p >= 5;
  const land = clamp((p - 4.6) / 0.4, 0, 1);
  return (
    <div style={{ height: CARD_H }}>
      {STEPS.map((s, i) => <Step key={i} C={C} step={s} i={i} p={p} />)}
      <div style={{
        height: STAMP_H, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 88px 0 44px", borderTop: `1px solid ${C.rule}`,
        opacity: land, transform: `translateY(${(1 - land) * 10}px)`
      }}>
        <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>
          STAMPED 09:41 UTC
        </span>
        <Pill C={C} tone={complete ? "green" : "amber"}>AUDIT-READY</Pill>
      </div>
    </div>
  );
}

function Implement({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 11.5;

  const phase = (2 * Math.PI * T) / total;
  const camScale = 1.005 - 0.005 * Math.cos(phase);
  const camY = -8 * Math.sin(phase);

  const p = track([
    [0, P0],
    [CUES.Sign + 0.2, P0],
    [CUES.Sign + 1.4, 3.4],
    [CUES.Sign + 2.7, 4.3],
    [CUES.Publish + 1.2, 5],
    [total, 5]
  ], T);

  // The stamped record advances and the next run arrives in the opening state,
  // so the last authored frame is the first.
  const slide = track([
    [0, 0],
    [CUES.Advance + 1.2, 0],
    [CUES.Advance + 3.4, -CARD_H],
    [total, -CARD_H]
  ], T);

  // The header reads the record in view, so it hands over during the advance.
  const s = clamp(-slide / CARD_H, 0, 1);
  const pHead = p * (1 - s) + P0 * s;
  const shown = clamp(Math.floor(pHead), 0, 5);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: 112, top: 128, width: 1012, height: 1270,
        background: C.panel, border: `1px solid ${C.rule}`, borderRadius: tw.radius,
        transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: "42% 38%",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "34px 44px 30px", flex: "0 0 auto" }}>
          <Logo size={30} ground={C.ink ? "ink" : "paper"} />
        </div>

        <div style={{ padding: "28px 88px 30px 44px", display: "flex", flexDirection: "column", gap: 16, flex: "0 0 auto", borderTop: `1px solid ${C.ruleSoft}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <SectionLabel number="04" ground={C.ink ? "ink" : "paper"}>Implement</SectionLabel>
            <span style={{ font: "400 15px/1 var(--font-mono)", letterSpacing: ".12em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
              {shown} / 5
            </span>
          </div>
          <div style={{ height: 6, background: C.well }}>
            <div style={{ height: 6, width: `${(pHead / 5) * 100}%`, background: C.green }} />
          </div>
        </div>

        <div style={{ height: CARD_H, overflow: "hidden", flex: "0 0 auto" }}>
          <div style={{ transform: `translateY(${slide}px)` }}>
            <Card C={C} p={p} />
            <Card C={C} p={P0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImplementPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage
        width={W} height={H}
        scenes={window.OM_SCENES}
        playback={window.OM_PLAYBACK}
        bg={tw.ground === "ink" ? "#06122A" : "#EAEBEA"}
      >
        <Implement tw={tw} />
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

window.ImplementPiece = ImplementPiece;
