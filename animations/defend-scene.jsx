const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;
const DS = window.VernierDesignSystem_7374ab || {};
const { Logo, SectionLabel, MetricCard } = DS;

const W = 1080, H = 1350;
const CW = 878;

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

// Axis: 1 Jan 2026 → 1 Oct 2026, in days.
const SPAN = 273;
const MONTHS = [["JAN", 0], ["MAR", 59], ["MAY", 120], ["JUL", 181], ["SEP", 243]];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP"];

function dateOf(day) {
  let d = clamp(Math.round(day), 0, SPAN - 1), i = 0;
  while (i < DAYS.length - 1 && d >= DAYS[i]) { d -= DAYS[i]; i++; }
  return `${String(d + 1).padStart(2, "0")} ${MON[i]} 2026`;
}

// The audit history: four stamped versions of one fee decision.
const VERSIONS = [
  { v: "v1", day: 7, fee: "0.72%", vars: "968", sources: "4 SOURCES", app: "2 / 2", rules: ["PASS", "PASS", "PASS"], ref: "PC-01/26", stamp: "08 JAN 2026 11:02 UTC" },
  { v: "v2", day: 77, fee: "0.74%", vars: "1,043", sources: "5 SOURCES", app: "1 / 2", rules: ["PASS", "PASS", "REVIEW"], ref: "PC-04/26", stamp: "19 MAR 2026 09:14 UTC" },
  { v: "v3", day: 182, fee: "0.76%", vars: "1,190", sources: "5 SOURCES", app: "2 / 2", rules: ["PASS", "PASS", "REVIEW"], ref: "PC-09/26", stamp: "02 JUL 2026 15:38 UTC" },
  { v: "v4", day: 225, fee: "0.78%", vars: "1,284", sources: "6 SOURCES", app: "2 / 2", rules: ["PASS", "PASS", "PASS"], ref: "PC-14/26", stamp: "14 AUG 2026 09:41 UTC" }
];
const REGIONS = ["EMEA", "NA", "APAC"];

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
      font: "500 12px/1 var(--font-mono)", letterSpacing: ".10em",
      padding: fill ? "6px 9px" : "5px 8px"
    }}>{children}</span>
  );
}

function Rail({ C, day }) {
  const x = (day / SPAN) * CW;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>AUDIT HISTORY</span>
        <span style={{ font: "400 15px/1 var(--font-mono)", letterSpacing: ".12em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
          AS AT {dateOf(day)}
        </span>
      </div>
      <svg width={CW} height="70" viewBox={`0 0 ${CW} 70`} style={{ display: "block", overflow: "visible" }}>
        <line x1="0" y1="38" x2={CW} y2="38" stroke={C.rule} strokeWidth="1" />
        {MONTHS.map(([m, d], i) => (
          <g key={i}>
            <line x1={(d / SPAN) * CW} y1="38" x2={(d / SPAN) * CW} y2="48" stroke={C.ruleSoft} strokeWidth="1" />
            <text x={(d / SPAN) * CW} y="66" fill={C.dim} style={{ font: "400 11px var(--font-mono)", letterSpacing: ".12em" }}>{m}</text>
          </g>
        ))}
        {VERSIONS.map((r, i) => (
          <g key={i}>
            <rect x={(r.day / SPAN) * CW - 4} y="34" width="8" height="8" fill={C.muted} />
            <text x={(r.day / SPAN) * CW} y="18" fill={C.dim} textAnchor="middle" style={{ font: "400 11px var(--font-mono)", letterSpacing: ".08em" }}>{r.v}</text>
          </g>
        ))}
        <line x1={x} y1="10" x2={x} y2="54" stroke={C.accent} strokeWidth="1.5" />
        <rect x={x - 5} y="33" width="10" height="10" fill={C.accent} />
      </svg>
    </div>
  );
}

function Ledger({ C, activeIndex }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim, paddingBottom: 18 }}>DECISION RECORD</div>
      {[...VERSIONS].reverse().map((r, i) => {
        const idx = VERSIONS.length - 1 - i;
        const on = idx === activeIndex;
        return (
          <div key={r.v} style={{
            display: "flex", alignItems: "center", gap: 20, padding: "28px 0",
            borderTop: `1px solid ${C.ruleSoft}`, background: on ? C.well : "transparent"
          }}>
            <div style={{ width: 3, alignSelf: "stretch", background: on ? C.accent : "transparent", flex: "none" }} />
            <span style={{ width: 46, font: "400 15px/1 var(--font-mono)", letterSpacing: ".08em", color: on ? C.text : C.dim, fontVariantNumeric: "tabular-nums" }}>{r.v}</span>
            <span style={{ flex: 1, font: "400 15px/1 var(--font-mono)", letterSpacing: ".06em", color: on ? C.text : C.dim, fontVariantNumeric: "tabular-nums" }}>
              {r.stamp} · {r.fee} · {r.app}
            </span>
            <Pill C={C} tone={r.rules.includes("REVIEW") ? "amber" : "green"}>
              {r.rules.includes("REVIEW") ? "1 REVIEW" : "ALL PASS"}
            </Pill>
          </div>
        );
      })}
    </div>
  );
}

function Defend({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 11;

  const phase = (2 * Math.PI * T) / total;
  const camScale = 1.005 - 0.005 * Math.cos(phase);
  const camY = -8 * Math.sin(phase);

  // The playhead walks the record back and returns — every panel reads as at its date.
  const day = track([
    [0, 225],
    [CUES.Rewind + 0.3, 225],
    [CUES.Rewind + 2.9, 7],
    [CUES.Return + 0.4, 7],
    [CUES.Return + 2.6, 225],
    [total, 225]
  ], T);

  let ai = 0;
  VERSIONS.forEach((r, i) => { if (day >= r.day - 0.5) ai = i; });
  const R = VERSIONS[ai];
  const ground = C.ink ? "ink" : "paper";

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: 112, top: 128, width: 1012, height: 1270,
        background: C.panel, border: `1px solid ${C.rule}`, borderRadius: tw.radius,
        transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: "42% 38%",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "34px 44px 28px", flex: "0 0 auto" }}>
          <Logo size={30} ground={ground} />
        </div>

        <div style={{ padding: "30px 88px 36px 44px", flex: "0 0 auto", borderTop: `1px solid ${C.ruleSoft}`, display: "flex", flexDirection: "column", gap: 26 }}>
          <SectionLabel number="05" ground={ground}>Defend</SectionLabel>
          <Rail C={C} day={day} />
        </div>

        <div style={{ padding: "0 88px 34px 44px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, flex: "0 0 auto" }}>
          <MetricCard ground={ground} label="Input data" value={R.vars} style={{ padding: "34px" }}>
            <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim }}>VARIABLES · {R.sources}</span>
          </MetricCard>
          <MetricCard ground={ground} label="Approvals" value={R.app} style={{ padding: "34px" }}>
            <Pill C={C} tone={R.app === "2 / 2" ? "green" : "amber"}>{R.app === "2 / 2" ? "NAMED · COMPLETE" : "AWAITING SECOND"}</Pill>
          </MetricCard>
          <MetricCard ground={ground} label="Regional rules" value={`${R.rules.filter((x) => x === "PASS").length} / 3`} style={{ padding: "34px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {REGIONS.map((rg, i) => (
                <Pill key={rg} C={C} tone={R.rules[i] === "PASS" ? "green" : "amber"}>{rg}</Pill>
              ))}
            </div>
          </MetricCard>
          <MetricCard ground={ground} label="Decision governance" value={R.v} style={{ padding: "34px" }}>
            <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim }}>PRICING CTTE · {R.ref}</span>
          </MetricCard>
        </div>

        <div style={{ padding: "32px 88px 40px 44px", flex: "0 0 auto", borderTop: `1px solid ${C.ruleSoft}` }}>
          <Ledger C={C} activeIndex={ai} />
        </div>
      </div>
    </div>
  );
}

function DefendPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage
        width={W} height={H}
        scenes={window.OM_SCENES}
        playback={window.OM_PLAYBACK}
        bg={tw.ground === "ink" ? "#06122A" : "#EAEBEA"}
      >
        <Defend tw={tw} />
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

window.DefendPiece = DefendPiece;
