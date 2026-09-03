const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakRadio } = window;

const DS = window.VernierDesignSystem_fc76dd || {};
const { MetricCard, Badge, Delta, Card, Button } = DS;

// Primer-style workflow reel: Monitor → Optimise → Implement → Defend.
// Four progress markers across the top; one section on screen at a time.
const W = 1360, H = 900;
const PAD = 64, PAD_B = 40;              // product margin, brand toolkit p.15
const INNER = W - PAD * 2;
const BODY_T = 196;
const GUTTER = 32;
const R = 3;                              // container edge radius for this reel
const COL_W = (INNER - 48) / 2;          // Implement, two columns
const DEF_GAP = 24;
const DEF_W = (INNER - DEF_GAP * 2) / 3; // Defend, three panels

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

const STEPS = ["MONITOR", "OPTIMISE", "IMPLEMENT", "DEFEND"];

// Vernier 2: white is the ground, one navy ink, one accent, status colour only
// where a value has been measured against a threshold.
const C = {
  bg: "#FFFFFF",
  text: "#0D1B33",
  dim: "#48546B",
  label: "#8A93A3",
  accent: "#2E4BA0",
  tint: "#EEF1FA",
  border: "#E2E5EB",
  borderStrong: "#C9CFD9",
  sunken: "#F7F8FA",
  positive: "#067647",
  positiveTint: "#ECFDF3",
  series4: "#93A6DC",
  series5: "#C6D1EE"
};

function track(keys, T) {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (T <= t1) return t1 === t0 ? v1 : v0 + (v1 - v0) * MOTION.draw((T - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

// ── 01 Monitor ───────────────────────────────────────────────────────────
const FEED = [
  { group: "EXTERNAL", title: "Sector news", meta: "1,284 SOURCES", head: "Median ongoing charge +1.00bp this quarter", bars: [0.72, 0.44, 0.9, 0.58] },
  { title: "Competitor analysis", meta: "41 PEER FUNDS", head: "Four peers repriced core equity ranges", bars: [0.55, 0.86, 0.38, 0.7] },
  { title: "New launches", meta: "12 THIS WEEK", head: "9 of 12 launches priced below your list", bars: [0.9, 0.5, 0.64, 0.34] },
  { group: "INTERNAL", title: "Costs", meta: "LEDGER · 09:38", head: "Variable cost per account −3.40%", bars: [0.48, 0.78, 0.56, 0.88] },
  { title: "KRIs", meta: "9 TRACKED", head: "Two indicators within tolerance, both fee-related", bars: [0.66, 0.4, 0.82, 0.5] },
  { group: null, title: "Budget", meta: "FY26", head: "Revenue tracking 94.00% to plan", bars: [0.8, 0.6, 0.46, 0.74] }
];

// ── 02 Optimise model ────────────────────────────────────────────────────
// Retention decays logistically with price, so net revenue peaks at 78bps.
// Fixed £18.2m + variable £8.3m = the £26.5m cost base the margin uses.
const AUM = 6.3e9, COST = 26.5e6, CURRENT = 72, OPTIMUM = 78;
const ret = (f) => 1 / (1 + Math.exp((f - 93) / 6));
const rev = (f) => AUM * (f / 10000) * ret(f);
const margin = (f) => (rev(f) - COST) / rev(f);
const M0 = margin(CURRENT), R0 = rev(CURRENT), O0 = 1 - ret(CURRENT);

const GW = 780, GH = 296, F0 = 64, F1 = 88;
// The band is fitted to the curve's own range across [F0, F1] with a cushion,
// so no value can map outside 0..GH however the domain or model changes.
const R_LO = Math.min(rev(F0), rev(F1)), R_HI = rev(OPTIMUM);
const R_PAD = (R_HI - R_LO) * 0.08;
const Y = (r) => GH - ((r - (R_LO - R_PAD)) / (R_HI + R_PAD - (R_LO - R_PAD))) * GH;
const X = (f) => ((f - F0) / (F1 - F0)) * GW;
const GRIDS = [0.12, 0.4, 0.68, 0.94].map((k) => R_LO - R_PAD + k * (R_HI + R_PAD - (R_LO - R_PAD)));
const pts = (a, b) => {
  const p = [];
  for (let f = a; f <= b + 0.001; f += 0.4) p.push(`${X(f).toFixed(1)},${Y(rev(f)).toFixed(1)}`);
  const last = Math.min(b, F1);
  p.push(`${X(last).toFixed(1)},${Y(rev(last)).toFixed(1)}`);
  return p;
};
const CURVE = "M" + pts(F0, F1).join(" L");
// Area under the curve between the current schedule and the live sweep — the
// revenue being gained, closed back along the baseline.
const GAIN = (f) => f <= CURRENT + 0.01 ? "" :
  `M${X(CURRENT).toFixed(1)},${GH} L` + pts(CURRENT, f).join(" L") + ` L${X(f).toFixed(1)},${GH} Z`;
const SEG = (f) => f <= CURRENT + 0.01 ? "" : "M" + pts(CURRENT, f).join(" L");

const SUM_H = 152;

// ── 03 Implement ─────────────────────────────────────────────────────────
const GOV = [
  {
    group: "INTERNAL", rows: [
      { title: "Commercial analysis", meta: "VR-2291", kind: "state", word: "COMPLETE" },
      { title: "Board paper drafted", meta: "14 AUG 2026", kind: "doc", word: "DRAFTED" },
      { title: "Approvals", meta: "PRICING CTTE", kind: "progress", word: "2 / 3" }
    ]
  },
  {
    group: "EXTERNAL", rows: [
      { title: "Regulatory notification", meta: "FCA · SUP 15", kind: "doc", word: "DRAFTED" },
      { title: "Client notification", meta: "KID · FACTSHEET", kind: "doc", word: "DRAFTED" },
      { title: "Distributor notification", meta: "EMEA · NA · APAC", kind: "state", word: "QUEUED" }
    ]
  }
];

const SCANS = [
  { title: "Antitrust scan", meta: "41 PEER FUNDS · NO SIGNALLING RISK" },
  { title: "Consumer duty assessment", meta: "FAIR VALUE · TARGET MARKET REVIEWED" },
  { title: "Market abuse screen", meta: "NO INSIDE INFORMATION IDENTIFIED" }
];

// ── 04 Defend ────────────────────────────────────────────────────────────
const VAULT = [
  {
    group: "LEGAL", meta: "6 RECORDS", rows: [
      { ref: "LEG-01", title: "Fee schedule, effective 01 Oct 2026", tag: "EXECUTED" },
      { ref: "LEG-02", title: "Board resolution", tag: "SIGNED" },
      { ref: "LEG-03", title: "Distribution agreement addendum", tag: "EXECUTED" }
    ]
  },
  {
    group: "COMPLIANCE", meta: "9 RECORDS", rows: [
      { ref: "CMP-01", title: "Target market assessment", tag: "APPROVED" },
      { ref: "CMP-02", title: "Consumer duty assessment", tag: "APPROVED" },
      { ref: "CMP-03", title: "Antitrust scan record", tag: "PASS" }
    ]
  },
  {
    group: "AUDIT", meta: "4 VERSIONS", rows: [
      { ref: "AUD-01", title: "Decision record, v1 – v4", tag: "STAMPED" },
      { ref: "AUD-02", title: "Approval log, named", tag: "STAMPED" },
      { ref: "AUD-03", title: "Input data manifest", tag: "1,284 VARS" }
    ]
  }
];

const RATIONALE = [
  "Repriced 0.72% → 0.78% on 14 Aug 2026 against a 0.69% peer median.",
  "Antitrust scan PASS · 1,284 variables · 6 sources · 2 named approvers · record v4."
];

const MONO_SM = { font: "400 13px/1 var(--font-mono)", letterSpacing: "0.12em", fontVariantNumeric: "tabular-nums" };
const MONO_XS = { font: "400 11px/1 var(--font-mono)", letterSpacing: "0.12em", fontVariantNumeric: "tabular-nums" };
const CHIP = { padding: "5px 9px", letterSpacing: "0.12em" };

function Markers({ idx, within }) {
  return (
    <div style={{ display: "flex", gap: GUTTER }}>
      {STEPS.map((s, i) => {
        const done = i < idx, live = i === idx;
        const fill = done ? 1 : live ? within : 0;
        return (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ height: 3, background: C.border }}>
              <div style={{ height: 3, width: `${fill * 100}%`, background: done ? C.borderStrong : C.accent }} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ ...MONO_XS, color: C.label }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ ...MONO_SM, color: done || live ? C.text : C.label }}>{s}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupLabel({ name, meta }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
      <span style={{ ...MONO_XS, color: C.label }}>{name}</span>
      <span style={{ flex: 1 }} />
      {meta && <span style={{ ...MONO_XS, color: C.label }}>{meta}</span>}
    </div>
  );
}

function DataLines({ bars, draw, dim }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, opacity: 1 - dim * 0.7 }}>
      {bars.map((w, i) => {
        const p = clamp((draw - i * 0.16) / 0.55, 0, 1);
        return <div key={i} style={{ height: 3, width: `${w * 100}%`, background: C.series5, transform: `scaleX(${p})`, transformOrigin: "left" }} />;
      })}
    </div>
  );
}

function Headline({ text, appear, wipe }) {
  return (
    <div style={{
      width: 486, flex: "none", boxSizing: "border-box",
      border: `1px solid ${C.borderStrong}`, borderRadius: R, background: C.tint,
      padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
      opacity: appear, transform: `translateX(${(1 - appear) * -8}px)`
    }}>
      <span style={{ width: 3, height: 16, flex: "none", background: C.accent }} />
      <span style={{
        font: "400 17px/1.3 var(--font-sans)", color: C.text, whiteSpace: "nowrap",
        clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`
      }}>{text}</span>
    </div>
  );
}

function Metric({ label, value, delta, unit, invert, confidence, appear }) {
  return (
    <div style={{ opacity: appear, transform: `translateY(${(1 - appear) * 10}px)` }}>
      <MetricCard
        label={label}
        value={value}
        confidence={confidence}
        footnote={<Delta value={delta} unit={unit} invert={invert} size="sm" />}
        style={{ borderRadius: R }}
      />
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flex: "none", transform: `rotate(${open * 90}deg)`, transformOrigin: "50% 50%" }}>
      <path d="M9 4 L17 12 L9 20" fill="none" stroke={open > 0.5 ? C.accent : C.label} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

// One governance step. The word always carries the state; the marker only
// reinforces it, so colour is never the sole signal.
function Step({ row, done }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, height: 74, boxSizing: "border-box",
      borderTop: `1px solid ${C.border}`
    }}>
      <span style={{
        width: 10, height: 10, flex: "none", borderRadius: 2,
        background: done > 0.5 ? C.positive : "transparent",
        border: done > 0.5 ? "none" : `1px solid ${C.borderStrong}`
      }} />
      <span style={{ flex: 1, minWidth: 0, font: "400 18px/1.35 var(--font-sans)", color: done > 0.2 ? C.text : C.label, whiteSpace: "nowrap" }}>{row.title}</span>
      <span style={{ ...MONO_XS, width: 120, flex: "none", whiteSpace: "nowrap", color: C.label }}>{row.meta}</span>

      {row.kind === "progress" ? (
        <span style={{ width: 140, flex: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ flex: 1, height: 4, background: C.border }}>
            <span style={{ display: "block", height: 4, width: `${done * 66.7}%`, background: C.accent }} />
          </span>
          <span style={{ ...MONO_SM, color: C.text }}>{row.word}</span>
        </span>
      ) : (
        <span style={{ width: 140, flex: "none", display: "flex", justifyContent: "flex-end", gap: 8, opacity: done }}>
          <Badge tone={row.kind === "doc" ? "neutral" : "positive"} mono style={CHIP}>{row.word}</Badge>
          {row.kind === "doc" && <Badge tone="accent" mono style={CHIP}>VIEW</Badge>}
        </span>
      )}
    </div>
  );
}

// In a narrow panel the identifier and state read better stacked above the
// title than crowded onto one line with it.
function Doc({ row, appear }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 8, height: 92, boxSizing: "border-box",
      justifyContent: "center", padding: "0 20px",
      borderTop: `1px solid ${C.border}`, opacity: appear, transform: `translateY(${(1 - appear) * 8}px)`
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ ...MONO_XS, color: C.label }}>{row.ref}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_XS, color: C.accent, whiteSpace: "nowrap" }}>{row.tag}</span>
      </div>
      <span style={{ font: "400 17px/1.35 var(--font-sans)", color: C.text }}>{row.title}</span>
    </div>
  );
}

function Reel({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const total = authoredTotal || 30.1;

  // One continuous stage index; sections cross-slide off it.
  const stage = clamp(track([
    [0, 0],
    [CUES.Handoff + 0.15, 0], [CUES.Handoff + 1.3, 1],
    [CUES.Deliver + 0.15, 1], [CUES.Deliver + 1.3, 2],
    [CUES.Evidence + 0.15, 2], [CUES.Evidence + 1.3, 3],
    [CUES.Return + 0.3, 3], [CUES.Return + 1.9, 0], [total, 0]
  ], T), 0, 3);

  const sec = (i) => {
    const d = stage - i;
    return { o: clamp(1 - Math.abs(d) * 2.1, 0, 1), y: -40 * d };
  };
  const reset = animate({ from: 0, to: 1, start: CUES.Return + 0.15, end: CUES.Return + 0.85, ease: MOTION.draw })(T);
  const k = 1 - reset;

  // 01 · data lines draw, then the interpreted headline is generated
  const rowAt = (i) => ({
    line: animate({ from: 0, to: 1, start: CUES.Ingest + 0.08 + 0.18 * i, end: CUES.Ingest + 0.83 + 0.18 * i, ease: MOTION.draw })(T) * k,
    box: animate({ from: 0, to: 1, start: CUES.Interpret + 0.06 + 0.32 * i, end: CUES.Interpret + 0.56 + 0.32 * i, ease: MOTION.enter })(T) * k,
    wipe: animate({ from: 0, to: 1, start: CUES.Interpret + 0.2 + 0.32 * i, end: CUES.Interpret + 0.85 + 0.32 * i, ease: MOTION.draw })(T) * k
  });

  // 02 · one slow, short sweep from current pricing to the modelled optimum
  const f = track([
    [0, CURRENT], [CUES.Model + 0.4, CURRENT], [CUES.Model + 3.3, OPTIMUM],
    [CUES.Return + 0.5, OPTIMUM], [CUES.Return + 1.2, CURRENT], [total, CURRENT]
  ], T);
  const m = margin(f), r = rev(f), out = 1 - ret(f);
  const gDraw = animate({ from: 0, to: 1, start: CUES.Model + 0.08, end: CUES.Model + 1.0, ease: MOTION.draw })(T);
  const met = (i) => animate({ from: 0, to: 1, start: CUES.Outcome + 0.06 + 0.1 * i, end: CUES.Outcome + 0.6 + 0.1 * i, ease: MOTION.enter })(T) * k;
  const sumIn = animate({ from: 0, to: 1, start: CUES.Optimise + 0.12, end: CUES.Optimise + 0.8, ease: MOTION.enter })(T) * k;

  // 03 · steps resolve in turn, then the compliance centre expands and scans
  const stepAt = (i) => animate({ from: 0, to: 1, start: CUES.Govern + 0.15 + 0.34 * i, end: CUES.Govern + 0.75 + 0.34 * i, ease: MOTION.enter })(T) * k;
  const expand = animate({ from: 0, to: 1, start: CUES.Clear + 0.1, end: CUES.Clear + 0.8, ease: MOTION.draw })(T) * k;
  const scanAt = (i) => animate({ from: 0, to: 1, start: CUES.Clear + 0.55 + 0.32 * i, end: CUES.Clear + 1.15 + 0.32 * i, ease: MOTION.enter })(T) * k;

  // 04 · the repository fills panel by panel, then the rationale states itself
  const docAt = (c, i) => animate({ from: 0, to: 1, start: CUES.Repository + 0.12 + 0.44 * c + 0.12 * i, end: CUES.Repository + 0.65 + 0.44 * c + 0.12 * i, ease: MOTION.enter })(T) * k;
  const panelAt = (c) => animate({ from: 0, to: 1, start: CUES.Repository + 0.04 + 0.44 * c, end: CUES.Repository + 0.44 + 0.44 * c, ease: MOTION.enter })(T) * k;
  const ratIn = animate({ from: 0, to: 1, start: CUES.Rationale + 0.08, end: CUES.Rationale + 0.7, ease: MOTION.enter })(T) * k;
  const ratWipe = (i) => animate({ from: 0, to: 1, start: CUES.Rationale + 0.25 + 0.4 * i, end: CUES.Rationale + 0.95 + 0.4 * i, ease: MOTION.draw })(T) * k;

  const idx = clamp(Math.round(stage), 0, 3);
  const SPANS = [[CUES.Ingest, CUES.Handoff], [CUES.Optimise, CUES.Deliver], [CUES.Govern, CUES.Evidence], [CUES.Repository, CUES.Return]];
  const within = clamp((T - SPANS[idx][0]) / Math.max(0.1, SPANS[idx][1] - SPANS[idx][0]), 0, 1);

  const s0 = sec(0), s1 = sec(1), s2 = sec(2), s3 = sec(3);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{ position: "absolute", left: PAD, top: 64, width: INNER }}>
        <Markers idx={idx} within={within} />
      </div>

      <div style={{ position: "absolute", left: PAD, bottom: PAD_B }}>
        <Button variant="secondary" size="sm" style={{ borderRadius: R }}
                iconLeft={<span style={{ ...MONO_XS, color: C.accent }}>AI</span>}>
          Ask Vernier
        </Button>
      </div>

      {/* ── 01 · Monitor ── */}
      <div style={{ position: "absolute", left: PAD, top: BODY_T, width: INNER, opacity: s0.o, transform: `translateY(${s0.y}px)`, pointerEvents: "none" }}>
        {FEED.map((row, i) => {
          const s = rowAt(i);
          return (
            <React.Fragment key={row.title}>
              {row.group && (
                <div style={{ paddingTop: i === 0 ? 0 : 16 }}>
                  <GroupLabel name={row.group} />
                </div>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: GUTTER, height: 82, boxSizing: "border-box",
                borderTop: `1px solid ${C.border}`
              }}>
                <span style={{ width: 216, flex: "none", font: "500 20px/1.3 var(--font-sans)", color: C.text }}>{row.title}</span>
                <span style={{ ...MONO_XS, width: 132, flex: "none", whiteSpace: "nowrap", color: C.label }}>{row.meta}</span>
                <DataLines bars={row.bars} draw={s.line} dim={s.box} />
                <Headline text={row.head} appear={s.box} wipe={s.wipe} />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── 02 · Optimise ── */}
      <div style={{ position: "absolute", left: PAD, top: BODY_T, width: INNER, opacity: s1.o, transform: `translateY(${s1.y}px)`, pointerEvents: "none" }}>
        <div style={{
          height: SUM_H, boxSizing: "border-box", paddingBottom: 24,
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40,
          opacity: sumIn, transform: `translateY(${(1 - sumIn) * 10}px)`
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ ...MONO_XS, color: C.label }}>RECOMMENDED ONGOING CHARGE</span>
            <span style={{ font: "500 44px/1 var(--font-mono)", letterSpacing: "-0.01em", color: C.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              0.72% <span style={{ color: C.label }}>→</span> <span style={{ color: C.accent }}>0.78%</span>
            </span>
          </div>
          <span style={{ font: "400 17px/1.5 var(--font-sans)", color: C.dim, textAlign: "right", maxWidth: 420 }}>
            Protects £45.41m of annual net revenue, £1.38m above the current schedule. Confidence 0.94 over eight weeks.
          </span>
        </div>

        <div style={{ display: "flex", gap: 96, alignItems: "flex-start" }}>
          <div style={{ width: GW, flex: "none", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ ...MONO_XS, color: C.label }}>NET REVENUE · £M</span>
              <span style={{ ...MONO_XS, color: C.accent }}>{f.toFixed(2)}BPS</span>
            </div>
            <svg width={GW} height={GH + 12} viewBox={`0 0 ${GW} ${GH + 12}`} style={{ display: "block", overflow: "visible" }}>
              {GRIDS.map((g, i) => (
                <g key={i}>
                  <line x1="0" y1={Y(g)} x2={GW} y2={Y(g)} stroke={C.border} strokeWidth="1" />
                  <text x={GW + 12} y={Y(g) + 4} fill={C.label} style={{ font: "400 11px var(--font-mono)", letterSpacing: "0.06em" }}>{(g / 1e6).toFixed(2)}</text>
                </g>
              ))}
              <line x1={X(CURRENT)} y1="0" x2={X(CURRENT)} y2={GH} stroke={C.borderStrong} strokeWidth="1" strokeDasharray="4 6" />
              <path d={GAIN(f)} fill={C.positiveTint} opacity={gDraw} />
              <path d={CURVE} fill="none" stroke={C.borderStrong} strokeWidth="1.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - gDraw} />
              <path d={SEG(f)} fill="none" stroke={C.positive} strokeWidth="2" opacity={gDraw} strokeLinejoin="round" />
              <line x1={X(OPTIMUM)} y1={GH - 8} x2={X(OPTIMUM)} y2={GH + 8} stroke={C.accent} strokeWidth="2" opacity={gDraw} />
              <line x1={X(f)} y1="0" x2={X(f)} y2={GH} stroke={C.accent} strokeWidth="1.5" opacity={gDraw} />
              <rect x={X(f) - 5} y={Y(r) - 5} width="10" height="10" fill={C.accent} opacity={gDraw} />
              <line x1="0" y1={GH} x2={GW} y2={GH} stroke={C.borderStrong} strokeWidth="1" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", paddingRight: 48, ...MONO_XS, color: C.label }}>
              <span>{F0}.00</span><span>ONGOING CHARGE, BPS</span><span>{F1}.00</span>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <Metric label="Operating margin" value={`${(m * 100).toFixed(2)}%`} delta={(m - M0) * 100} unit="pp" confidence={0.94} appear={met(0)} />
            <Metric label="Net revenue, annualised" value={`£${(r / 1e6).toFixed(2)}m`} delta={(r - R0) / 1e6} unit="m" confidence={0.94} appear={met(1)} />
            <Metric label="Outflow at risk" value={`${(out * 100).toFixed(2)}%`} delta={(out - O0) * 100} unit="pp" invert confidence={0.88} appear={met(2)} />
          </div>
        </div>
      </div>

      {/* ── 03 · Implement ── */}
      <div style={{ position: "absolute", left: PAD, top: BODY_T, width: INNER, opacity: s2.o, transform: `translateY(${s2.y}px)`, pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 48 }}>
          {GOV.map((col, ci) => (
            <div key={col.group} style={{ width: COL_W, flex: "none" }}>
              <GroupLabel name={col.group} />
              {col.rows.map((row, ri) => (
                <Step key={row.title} row={row} done={stepAt(ci * 3 + ri)} />
              ))}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, border: `1px solid ${C.border}`, borderRadius: R, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, height: 72, boxSizing: "border-box", padding: "0 24px", background: C.sunken }}>
            <Chevron open={expand} />
            <span style={{ font: "500 20px/1.4 var(--font-sans)", color: C.text }}>Legal and compliance centre</span>
            <span style={{ flex: 1 }} />
            <span style={{ ...MONO_XS, color: C.label }}>3 SCANS</span>
            <span style={{ opacity: scanAt(2) }}>
              <Badge tone="positive" mono style={CHIP}>3 / 3 PASS</Badge>
            </span>
          </div>
          <div style={{ height: 180 * expand, overflow: "hidden" }}>
            {SCANS.map((sc, i) => {
              const a = scanAt(i);
              return (
                <div key={sc.title} style={{
                  display: "flex", alignItems: "center", gap: 16, height: 60, boxSizing: "border-box",
                  padding: "0 24px", borderTop: `1px solid ${C.border}`, opacity: a
                }}>
                  <span style={{ width: 10, height: 10, flex: "none", borderRadius: 2, background: a > 0.5 ? C.positive : C.border }} />
                  <span style={{ font: "400 17px/1.4 var(--font-sans)", color: C.text }}>{sc.title}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ ...MONO_XS, color: C.label }}>{sc.meta}</span>
                  <Badge tone="positive" mono style={CHIP}>PASS</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 04 · Defend ── */}
      <div style={{ position: "absolute", left: PAD, top: BODY_T, width: INNER, opacity: s3.o, transform: `translateY(${s3.y}px)`, pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: DEF_GAP }}>
          {VAULT.map((col, ci) => {
            const a = panelAt(ci);
            return (
              <div key={col.group} style={{
                width: DEF_W, flex: "none", border: `1px solid ${C.border}`, borderRadius: R, overflow: "hidden",
                opacity: a, transform: `translateY(${(1 - a) * 10}px)`
              }}>
                <div style={{ padding: "0 20px", background: C.sunken }}>
                  <GroupLabel name={col.group} meta={col.meta} />
                </div>
                {col.rows.map((row, ri) => <Doc key={row.ref} row={row} appear={docAt(ci, ri)} />)}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 40, border: `1px solid ${C.borderStrong}`, borderRadius: R, background: C.tint,
          padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18,
          opacity: ratIn, transform: `translateY(${(1 - ratIn) * 10}px)`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 3, height: 16, flex: "none", background: C.accent }} />
            <span style={{ ...MONO_XS, color: C.label }}>DECISION RATIONALE</span>
            <span style={{ flex: 1 }} />
            <span style={{ ...MONO_XS, color: C.label }}>VR-2291 · 09:41 UTC</span>
          </div>
          {RATIONALE.map((line, i) => (
            <span key={i} style={{
              font: i === 0 ? "500 24px/1.35 var(--font-sans)" : "400 16px/1.4 var(--font-mono)",
              letterSpacing: i === 0 ? "-0.004em" : "0.02em",
              color: i === 0 ? C.text : C.dim, whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
              clipPath: `inset(0 ${(1 - ratWipe(i)) * 100}% 0 0)`
            }}>{line}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

window.ReelPiece = function () {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Reel tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak("motionEditor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
};
