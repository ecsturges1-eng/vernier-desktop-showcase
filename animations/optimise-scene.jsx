const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;
const DS = window.VernierDesignSystem_7374ab || {};
const { Logo, DeltaBadge, MetricCard, StatusChip, SectionLabel } = DS;

const W = 1080, H = 1350;
const CW = 878, CH = 224;

const MOTION = {
  enter: Easing.easeOutCubic,
  draw: Easing.easeInOutQuart,
  settle: Easing.easeOutQuart
};

// ── Model ────────────────────────────────────────────────────────────────
// Ongoing charge in bps. Retention falls logistically with price; net revenue
// is the product, so it peaks at 78bps — the modelled optimum.
const AUM = 6.3e9, COST = 26.5e6, CURRENT = 72, OPTIMUM = 78;
const ret = (f) => 1 / (1 + Math.exp((f - 93) / 6));
const rev = (f) => AUM * (f / 10000) * ret(f);
const margin = (f) => (rev(f) - COST) / rev(f);
const R0 = rev(CURRENT), M0 = margin(CURRENT);

const fmtM = (v) => `£${(v / 1e6).toFixed(2)}m`;
const rag = (d) => (d > 0.05 ? "green" : d < -0.05 ? "red" : "amber");
const sgn = (v, d, u) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(d)}${u}`;

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
    barMuted: ink ? "rgba(165,178,198,.45)" : "#DCDEDD",
    green: ink ? "#3FC08A" : "#1F7A57",
    amber: ink ? "#E0A33C" : "#8A6212",
    red: ink ? "#E2665C" : "#A33227"
  };
}

// Signal pill — RAG state on a flat fill, always with a sign or a word.
function Pill({ C, tone, children }) {
  const fill = tone === "green" ? C.green : tone === "amber" ? C.amber : tone === "red" ? C.red : C.barMuted;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", alignSelf: "flex-start", background: fill,
      color: C.ink ? "#06122A" : "#EAEBEA",
      font: "500 13px/1 var(--font-mono)", letterSpacing: ".10em",
      fontVariantNumeric: "tabular-nums", padding: "7px 10px"
    }}>{children}</span>
  );
}

// Keyframe track — piecewise eased interpolation over authored seconds.
function track(keys, T) {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (T <= t1) {
      if (t1 === t0) return v1;
      return v0 + (v1 - v0) * MOTION.draw((T - t0) / (t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
}

const X = (f) => ((f - 60) / 36) * CW;
const Y = (r) => CH - ((r - 28e6) / 20e6) * CH;

const CURVE = (() => {
  const pts = [];
  for (let f = 60; f <= 96.001; f += 0.75) pts.push(`${X(f).toFixed(1)},${Y(rev(f)).toFixed(1)}`);
  return "M" + pts.join(" L");
})();

function Elasticity({ C, f }) {
  const r = rev(f);
  const x = X(f), y = Y(r);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>NET REVENUE · £M</span>
      </div>
      <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ display: "block", overflow: "visible" }}>
        {[48e6, 41e6, 34e6, 28e6].map((g, i) => (
          <g key={i}>
            <line x1="0" y1={Y(g)} x2={CW} y2={Y(g)} stroke={C.ruleSoft} strokeWidth="1" />
            <text x={CW + 10} y={Y(g) + 4} fill={C.dim} style={{ font: "400 11px var(--font-mono)", letterSpacing: ".08em" }}>{(g / 1e6).toFixed(0)}</text>
          </g>
        ))}
        <line x1={X(CURRENT)} y1="0" x2={X(CURRENT)} y2={CH} stroke={C.rule} strokeWidth="1" strokeDasharray="3 5" />
        <text x={X(CURRENT) + 10} y="16" fill={C.dim} style={{ font: "400 11px var(--font-mono)", letterSpacing: ".12em" }}>CURRENT 72</text>
        <path d={CURVE} fill="none" stroke={C.text} strokeWidth="1.5" opacity="0.85" />
        <line x1={X(OPTIMUM)} y1={CH - 8} x2={X(OPTIMUM)} y2={CH + 8} stroke={C.accent} strokeWidth="2" />
        <line x1={x} y1="0" x2={x} y2={CH} stroke={C.accent} strokeWidth="1.5" />
        <line x1="0" y1={y} x2={x} y2={y} stroke={C.accent} strokeWidth="1" opacity="0.5" />
        <rect x={x - 5} y={y - 5} width="10" height="10" fill={C.accent} />
        <line x1="0" y1={CH} x2={CW} y2={CH} stroke={C.rule} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim, paddingTop: 4 }}>
        <span>60</span><span>ONGOING CHARGE, BPS</span><span>96</span>
      </div>
    </div>
  );
}

function RiskRow({ C, label, chip, tone }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderTop: `1px solid ${C.ruleSoft}`, padding: "15px 0"
    }}>
      <span style={{ font: "500 24px/1 var(--font-sans)", color: C.text, letterSpacing: "-0.005em" }}>{label}</span>
      <Pill C={C} tone={tone}>{chip}</Pill>
    </div>
  );
}

function Bar({ C, label, value, width, accent, tone }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim }}>{label}</span>
        <span style={{ font: "400 20px/1 var(--font-mono)", letterSpacing: ".04em", color: tone === "green" ? C.green : tone === "amber" ? C.amber : tone === "red" ? C.red : C.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
      <div style={{ height: 12, background: C.well }}>
        <div style={{ height: 12, width: `${width * 100}%`, background: accent ? C.accent : C.barMuted }} />
      </div>
    </div>
  );
}

function Optimise({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 12;

  const phase = (2 * Math.PI * T) / total;
  const camScale = 1.005 - 0.005 * Math.cos(phase);
  const camY = -8 * Math.sin(phase);

  // The instrument sweeps the fee axis and every figure recomputes from it.
  const f = track([
    [0, OPTIMUM],
    [CUES.Down + 0.25, OPTIMUM],
    [CUES.Down + 2.4, CURRENT],
    [CUES.Up + 0.35, CURRENT],
    [CUES.Up + 2.7, 92],
    [CUES.Settle + 0.5, 92],
    [CUES.Settle + 2.7, OPTIMUM],
    [total, OPTIMUM]
  ], T);

  const r = rev(f), m = margin(f), out = 1 - ret(f);
  const dRev = r - R0, dMargin = (m - M0) * 100, dFee = f - CURRENT;

  const outTone = out < 0.05 ? "green" : out < 0.12 ? "amber" : "red";
  const outWord = out < 0.05 ? "LOW" : out < 0.12 ? "MODERATE" : "ELEVATED";
  const scan = f > 86;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: 112, top: 128, width: 1012, height: 1270,
        background: C.panel, border: `1px solid ${C.rule}`, borderRadius: tw.radius,
        transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: "42% 38%",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "34px 44px 28px", flex: "0 0 auto" }}>
          <Logo size={30} ground={C.ink ? "ink" : "paper"} />
        </div>

        <div style={{ padding: "0 88px 32px 44px", display: "flex", flexDirection: "column", gap: 14, flex: "0 0 auto", borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 28 }}>
          <SectionLabel number="03" ground={C.ink ? "ink" : "paper"}>Optimise</SectionLabel>
        </div>

        <div style={{ padding: "0 88px 26px 44px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, flex: "0 0 auto" }}>
          <MetricCard ground={C.ink ? "ink" : "paper"} label="Ongoing charge" value={`${(f / 100).toFixed(2)}%`}>
            <Pill C={C} tone={rag(dFee)}>{`Δ ${sgn(dFee, 1, "bps")}`}</Pill>
          </MetricCard>
          <MetricCard ground={C.ink ? "ink" : "paper"} label="Net revenue" value={fmtM(r)}>
            <Pill C={C} tone={rag(dRev)}>{`Δ ${dRev >= 0 ? "+" : "−"}£${Math.abs(dRev / 1e6).toFixed(2)}m`}</Pill>
          </MetricCard>
          <MetricCard ground={C.ink ? "ink" : "paper"} label="Operating margin" value={`${(m * 100).toFixed(1)}%`}>
            <Pill C={C} tone={rag(dMargin)}>{`Δ ${sgn(dMargin, 1, "pp")}`}</Pill>
          </MetricCard>
        </div>

        <div style={{ padding: "0 88px 24px 44px", flex: "0 0 auto" }}>
          <Elasticity C={C} f={f} />
        </div>

        <div style={{ padding: "0 88px 22px 44px", flex: "0 0 auto" }}>
          <div style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim, paddingBottom: 10 }}>RISK</div>
          <RiskRow C={C} label="Outflow at risk" chip={`${(out * 100).toFixed(1)}% · ${outWord}`} tone={outTone} />
          <RiskRow C={C} label="Antitrust screen" chip={scan ? "REVIEW" : "PASS"} tone={scan ? "red" : "green"} />
          <RiskRow C={C} label="Mandate breach" chip={f > 90 ? "1 FLAGGED" : "NONE"} tone={f > 90 ? "amber" : "green"} />
        </div>

        <div style={{ padding: "0 88px 36px 44px", display: "flex", flexDirection: "column", gap: 18, flex: "0 0 auto", borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>MARGIN</span>
            <Pill C={C} tone={rag(dMargin)}>{`Δ ${sgn(dMargin, 1, "pp")}`}</Pill>
          </div>
          <Bar C={C} label="CURRENT" value={`${(M0 * 100).toFixed(1)}%`} width={M0 / 0.5} />
          <Bar C={C} label="MODELLED" value={`${(m * 100).toFixed(1)}%`} width={clamp(m / 0.5, 0, 1)} accent tone={rag(dMargin)} />
        </div>
      </div>
    </div>
  );
}

function OptimisePiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage
        width={W} height={H}
        scenes={window.OM_SCENES}
        playback={window.OM_PLAYBACK}
        bg={tw.ground === "ink" ? "#06122A" : "#EAEBEA"}
      >
        <Optimise tw={tw} />
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

window.OptimisePiece = OptimisePiece;
