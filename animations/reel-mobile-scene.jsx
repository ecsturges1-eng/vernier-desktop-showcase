const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;

const DS = window.VernierDesignSystem_fc76dd || {};
const { MetricCard, Badge, Delta } = DS;

// Narrow companion to the desktop reel: same four stages, same cue names, one
// column. Content is trimmed rather than shrunk — nothing is set below 13px.
const W = 390, H = 800;
const PAD = 24, PAD_B = 28;
const INNER = W - PAD * 2;
const BODY_T = 136;
const R = 3;

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };
const STEPS = ["MONITOR", "OPTIMISE", "IMPLEMENT", "DEFEND"];

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

const FEED = [
  { group: "EXTERNAL", title: "Sector news", meta: "1,284 SOURCES", head: "Median charge +1.00bp this quarter", bars: [0.72, 0.46] },
  { title: "Competitor analysis", meta: "41 PEERS", head: "Four peers repriced core equity", bars: [0.55, 0.86] },
  { title: "New launches", meta: "12 THIS WEEK", head: "9 of 12 priced below your list", bars: [0.9, 0.5] },
  { group: "INTERNAL", title: "Costs", meta: "LEDGER · 09:38", head: "Variable cost per account −3.40%", bars: [0.48, 0.78] },
  { title: "KRIs", meta: "9 TRACKED", head: "Two indicators within tolerance", bars: [0.66, 0.4] },
  { group: null, title: "Budget", meta: "FY26", head: "Revenue tracking 94.00% to plan", bars: [0.8, 0.6] }
];

const AUM = 6.3e9, COST = 26.5e6, CURRENT = 72, OPTIMUM = 78;
const ret = (f) => 1 / (1 + Math.exp((f - 93) / 6));
const rev = (f) => AUM * (f / 10000) * ret(f);
const margin = (f) => (rev(f) - COST) / rev(f);
const M0 = margin(CURRENT), R0 = rev(CURRENT), O0 = 1 - ret(CURRENT);

const GW = INNER, GH = 186, F0 = 64, F1 = 88;
const R_LO = Math.min(rev(F0), rev(F1)), R_HI = rev(OPTIMUM);
const R_PAD = (R_HI - R_LO) * 0.08;
const Y = (r) => GH - ((r - (R_LO - R_PAD)) / (R_HI + R_PAD - (R_LO - R_PAD))) * GH;
const X = (f) => ((f - F0) / (F1 - F0)) * GW;
const GRIDS = [0.16, 0.52, 0.9].map((k) => R_LO - R_PAD + k * (R_HI + R_PAD - (R_LO - R_PAD)));
const pts = (a, b) => {
  const p = [];
  for (let f = a; f <= b + 0.001; f += 0.4) p.push(`${X(f).toFixed(1)},${Y(rev(f)).toFixed(1)}`);
  const last = Math.min(b, F1);
  p.push(`${X(last).toFixed(1)},${Y(rev(last)).toFixed(1)}`);
  return p;
};
const CURVE = "M" + pts(F0, F1).join(" L");
const GAIN = (f) => f <= CURRENT + 0.01 ? "" :
  `M${X(CURRENT).toFixed(1)},${GH} L` + pts(CURRENT, f).join(" L") + ` L${X(f).toFixed(1)},${GH} Z`;
const SEG = (f) => f <= CURRENT + 0.01 ? "" : "M" + pts(CURRENT, f).join(" L");

const GOV = [
  {
    group: "INTERNAL", rows: [
      { title: "Commercial analysis", kind: "state", word: "COMPLETE" },
      { title: "Board paper", kind: "doc", word: "DRAFTED" },
      { title: "Approvals", kind: "progress", word: "2 / 3" }
    ]
  },
  {
    group: "EXTERNAL", rows: [
      { title: "Regulatory notification", kind: "doc", word: "DRAFTED" },
      { title: "Client notification", kind: "doc", word: "DRAFTED" },
      { title: "Distributor notification", kind: "state", word: "QUEUED" }
    ]
  }
];

const SCANS = ["Antitrust scan", "Consumer duty assessment", "Market abuse screen"];

// Two records per repository on mobile; the count states how many are held.
const VAULT = [
  {
    group: "LEGAL", meta: "6 RECORDS", rows: [
      { ref: "LEG-01", title: "Fee schedule, 01 Oct 2026", tag: "EXECUTED" },
      { ref: "LEG-02", title: "Board resolution", tag: "SIGNED" }
    ]
  },
  {
    group: "COMPLIANCE", meta: "9 RECORDS", rows: [
      { ref: "CMP-01", title: "Target market assessment", tag: "APPROVED" },
      { ref: "CMP-03", title: "Antitrust scan record", tag: "PASS" }
    ]
  },
  {
    group: "AUDIT", meta: "4 VERSIONS", rows: [
      { ref: "AUD-01", title: "Decision record, v1 – v4", tag: "STAMPED" },
      { ref: "AUD-02", title: "Approval log, named", tag: "STAMPED" }
    ]
  }
];

const RATIONALE = [
  "Repriced 0.72% → 0.78% on 14 Aug 2026 against a 0.69% peer median.",
  "Antitrust scan PASS · 1,284 variables · 2 named approvers · record v4."
];

const MONO_XS = { font: "400 11px/1.2 var(--font-mono)", letterSpacing: "0.12em", fontVariantNumeric: "tabular-nums" };
const MONO_10 = { font: "400 10px/1.2 var(--font-mono)", letterSpacing: "0.1em", fontVariantNumeric: "tabular-nums" };
const CHIP = { padding: "4px 7px", letterSpacing: "0.1em", fontSize: "10px" };

function Header({ idx, within }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {STEPS.map((s, i) => {
          const done = i < idx, live = i === idx;
          const fill = done ? 1 : live ? within : 0;
          return (
            <div key={s} style={{ flex: 1, height: 3, background: C.border }}>
              <div style={{ height: 3, width: `${fill * 100}%`, background: done ? C.borderStrong : C.accent }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ ...MONO_10, color: C.label }}>{String(idx + 1).padStart(2, "0")}</span>
        <span style={{ ...MONO_XS, color: C.text }}>{STEPS[idx]}</span>
      </div>
    </div>
  );
}

function GroupLabel({ name, meta }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 30 }}>
      <span style={{ ...MONO_10, color: C.label }}>{name}</span>
      <span style={{ flex: 1 }} />
      {meta && <span style={{ ...MONO_10, color: C.label }}>{meta}</span>}
    </div>
  );
}

// The raw lines and the interpreted headline share one slot: the lines fade as
// the sentence wipes in over them.
function FeedRow({ row, s }) {
  return (
    <div style={{ height: 76, boxSizing: "border-box", borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ font: "500 16px/1.2 var(--font-sans)", color: C.text }}>{row.title}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_10, color: C.label, whiteSpace: "nowrap" }}>{row.meta}</span>
      </div>
      <div style={{ position: "relative", height: 22 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 6, paddingTop: 5, opacity: 1 - s.box }}>
          {row.bars.map((w, i) => {
            const p = clamp((s.line - i * 0.16) / 0.6, 0, 1);
            return <div key={i} style={{ height: 3, width: `${w * 100}%`, background: C.series5, transform: `scaleX(${p})`, transformOrigin: "left" }} />;
          })}
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 8, opacity: s.box }}>
          <span style={{ width: 3, height: 14, flex: "none", background: C.accent }} />
          <span style={{ font: "400 14px/1.4 var(--font-sans)", color: C.text, whiteSpace: "nowrap", clipPath: `inset(0 ${(1 - s.wipe) * 100}% 0 0)` }}>{row.head}</span>
        </div>
      </div>
    </div>
  );
}

function Step({ row, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 52, boxSizing: "border-box", borderTop: `1px solid ${C.border}` }}>
      <span style={{
        width: 9, height: 9, flex: "none", borderRadius: 2,
        background: done > 0.5 ? C.positive : "transparent",
        border: done > 0.5 ? "none" : `1px solid ${C.borderStrong}`
      }} />
      <span style={{ flex: 1, minWidth: 0, font: "400 15px/1.3 var(--font-sans)", color: done > 0.2 ? C.text : C.label, whiteSpace: "nowrap" }}>{row.title}</span>
      {row.kind === "progress" ? (
        <span style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <span style={{ width: 48, height: 4, background: C.border }}>
            <span style={{ display: "block", height: 4, width: `${done * 66.7}%`, background: C.accent }} />
          </span>
          <span style={{ ...MONO_XS, color: C.text }}>{row.word}</span>
        </span>
      ) : (
        <span style={{ flex: "none", opacity: done }}>
          <Badge tone={row.kind === "doc" ? "neutral" : "positive"} mono style={CHIP}>{row.word}</Badge>
        </span>
      )}
    </div>
  );
}

function Doc({ row, appear }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 5, height: 50, boxSizing: "border-box", justifyContent: "center",
      padding: "0 14px", borderTop: `1px solid ${C.border}`, opacity: appear, transform: `translateY(${(1 - appear) * 6}px)`
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ ...MONO_10, color: C.label }}>{row.ref}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_10, color: C.accent, whiteSpace: "nowrap" }}>{row.tag}</span>
      </div>
      <span style={{ font: "400 14px/1.3 var(--font-sans)", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.title}</span>
    </div>
  );
}

function Reel() {
  const { T, CUES, authoredTotal } = useComposition();
  const total = authoredTotal || 30.1;

  const stage = clamp(track([
    [0, 0],
    [CUES.Handoff + 0.15, 0], [CUES.Handoff + 1.3, 1],
    [CUES.Deliver + 0.15, 1], [CUES.Deliver + 1.3, 2],
    [CUES.Evidence + 0.15, 2], [CUES.Evidence + 1.3, 3],
    [CUES.Return + 0.3, 3], [CUES.Return + 1.9, 0], [total, 0]
  ], T), 0, 3);

  const sec = (i) => {
    const d = stage - i;
    return { o: clamp(1 - Math.abs(d) * 2.1, 0, 1), y: -28 * d };
  };
  const reset = animate({ from: 0, to: 1, start: CUES.Return + 0.15, end: CUES.Return + 0.85, ease: MOTION.draw })(T);
  const k = 1 - reset;

  const rowAt = (i) => ({
    line: animate({ from: 0, to: 1, start: CUES.Ingest + 0.08 + 0.18 * i, end: CUES.Ingest + 0.83 + 0.18 * i, ease: MOTION.draw })(T) * k,
    box: animate({ from: 0, to: 1, start: CUES.Interpret + 0.06 + 0.32 * i, end: CUES.Interpret + 0.56 + 0.32 * i, ease: MOTION.enter })(T) * k,
    wipe: animate({ from: 0, to: 1, start: CUES.Interpret + 0.2 + 0.32 * i, end: CUES.Interpret + 0.85 + 0.32 * i, ease: MOTION.draw })(T) * k
  });

  const f = track([
    [0, CURRENT], [CUES.Model + 0.4, CURRENT], [CUES.Model + 3.3, OPTIMUM],
    [CUES.Return + 0.5, OPTIMUM], [CUES.Return + 1.2, CURRENT], [total, CURRENT]
  ], T);
  const m = margin(f), r = rev(f), out = 1 - ret(f);
  const gDraw = animate({ from: 0, to: 1, start: CUES.Model + 0.08, end: CUES.Model + 1.0, ease: MOTION.draw })(T);
  const met = (i) => animate({ from: 0, to: 1, start: CUES.Outcome + 0.06 + 0.1 * i, end: CUES.Outcome + 0.6 + 0.1 * i, ease: MOTION.enter })(T) * k;
  const sumIn = animate({ from: 0, to: 1, start: CUES.Optimise + 0.12, end: CUES.Optimise + 0.8, ease: MOTION.enter })(T) * k;

  const stepAt = (i) => animate({ from: 0, to: 1, start: CUES.Govern + 0.15 + 0.34 * i, end: CUES.Govern + 0.75 + 0.34 * i, ease: MOTION.enter })(T) * k;
  const expand = animate({ from: 0, to: 1, start: CUES.Clear + 0.1, end: CUES.Clear + 0.8, ease: MOTION.draw })(T) * k;
  const scanAt = (i) => animate({ from: 0, to: 1, start: CUES.Clear + 0.55 + 0.32 * i, end: CUES.Clear + 1.15 + 0.32 * i, ease: MOTION.enter })(T) * k;

  const docAt = (c, i) => animate({ from: 0, to: 1, start: CUES.Repository + 0.12 + 0.44 * c + 0.12 * i, end: CUES.Repository + 0.65 + 0.44 * c + 0.12 * i, ease: MOTION.enter })(T) * k;
  const panelAt = (c) => animate({ from: 0, to: 1, start: CUES.Repository + 0.04 + 0.44 * c, end: CUES.Repository + 0.44 + 0.44 * c, ease: MOTION.enter })(T) * k;
  const ratIn = (i) => animate({ from: 0, to: 1, start: CUES.Rationale + 0.1 + 0.35 * i, end: CUES.Rationale + 0.8 + 0.35 * i, ease: MOTION.enter })(T) * k;

  const idx = clamp(Math.round(stage), 0, 3);
  const SPANS = [[CUES.Ingest, CUES.Handoff], [CUES.Optimise, CUES.Deliver], [CUES.Govern, CUES.Evidence], [CUES.Repository, CUES.Return]];
  const within = clamp((T - SPANS[idx][0]) / Math.max(0.1, SPANS[idx][1] - SPANS[idx][0]), 0, 1);

  const s0 = sec(0), s1 = sec(1), s2 = sec(2), s3 = sec(3);
  const body = { position: "absolute", left: PAD, top: BODY_T, width: INNER, pointerEvents: "none" };

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{ position: "absolute", left: PAD, top: 52, width: INNER }}>
        <Header idx={idx} within={within} />
      </div>

      {/* ── 01 · Monitor ── */}
      <div style={{ ...body, opacity: s0.o, transform: `translateY(${s0.y}px)` }}>
        {FEED.map((row, i) => (
          <React.Fragment key={row.title}>
            {row.group && <div style={{ paddingTop: i === 0 ? 0 : 10 }}><GroupLabel name={row.group} /></div>}
            <FeedRow row={row} s={rowAt(i)} />
          </React.Fragment>
        ))}
      </div>

      {/* ── 02 · Optimise ── */}
      <div style={{ ...body, opacity: s1.o, transform: `translateY(${s1.y}px)` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: sumIn, transform: `translateY(${(1 - sumIn) * 8}px)` }}>
          <span style={{ ...MONO_10, color: C.label }}>RECOMMENDED ONGOING CHARGE</span>
          <span style={{ font: "500 30px/1 var(--font-mono)", letterSpacing: "-0.01em", color: C.text, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            0.72% <span style={{ color: C.label }}>→</span> <span style={{ color: C.accent }}>0.78%</span>
          </span>
          <span style={{ font: "400 14px/1.5 var(--font-sans)", color: C.dim }}>
            Protects £45.41m of annual net revenue, £1.38m above the current schedule. Confidence 0.94.
          </span>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ ...MONO_10, color: C.label }}>NET REVENUE · £M</span>
          <span style={{ ...MONO_10, color: C.accent }}>{f.toFixed(2)}BPS</span>
        </div>
        <svg width={GW} height={GH + 10} viewBox={`0 0 ${GW} ${GH + 10}`} style={{ display: "block", marginTop: 12 }}>
          {GRIDS.map((g, i) => <line key={i} x1="0" y1={Y(g)} x2={GW} y2={Y(g)} stroke={C.border} strokeWidth="1" />)}
          <line x1={X(CURRENT)} y1="0" x2={X(CURRENT)} y2={GH} stroke={C.borderStrong} strokeWidth="1" strokeDasharray="4 6" />
          <path d={GAIN(f)} fill={C.positiveTint} opacity={gDraw} />
          <path d={CURVE} fill="none" stroke={C.borderStrong} strokeWidth="1.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - gDraw} />
          <path d={SEG(f)} fill="none" stroke={C.positive} strokeWidth="2" opacity={gDraw} strokeLinejoin="round" />
          <line x1={X(OPTIMUM)} y1={GH - 7} x2={X(OPTIMUM)} y2={GH + 7} stroke={C.accent} strokeWidth="2" opacity={gDraw} />
          <line x1={X(f)} y1="0" x2={X(f)} y2={GH} stroke={C.accent} strokeWidth="1.5" opacity={gDraw} />
          <rect x={X(f) - 4} y={Y(r) - 4} width="8" height="8" fill={C.accent} opacity={gDraw} />
          <line x1="0" y1={GH} x2={GW} y2={GH} stroke={C.borderStrong} strokeWidth="1" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", ...MONO_10, color: C.label }}>
          <span>{F0}.00</span><span>ONGOING CHARGE, BPS</span><span>{F1}.00</span>
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ minWidth: 0, opacity: met(0), transform: `translateY(${(1 - met(0)) * 8}px)` }}>
            <MetricCard label="Operating margin, %" value={(m * 100).toFixed(2)}
                        footnote={<Delta value={(m - M0) * 100} unit="pp" size="sm" />} style={{ borderRadius: R }} />
          </div>
          <div style={{ minWidth: 0, opacity: met(1), transform: `translateY(${(1 - met(1)) * 8}px)` }}>
            <MetricCard label="Net revenue, £m" value={(r / 1e6).toFixed(2)}
                        footnote={<Delta value={(r - R0) / 1e6} unit="m" size="sm" />} style={{ borderRadius: R }} />
          </div>
        </div>
      </div>

      {/* ── 03 · Implement ── */}
      <div style={{ ...body, opacity: s2.o, transform: `translateY(${s2.y}px)` }}>
        {GOV.map((col, ci) => (
          <div key={col.group} style={{ paddingTop: ci === 0 ? 0 : 8 }}>
            <GroupLabel name={col.group} />
            {col.rows.map((row, ri) => <Step key={row.title} row={row} done={stepAt(ci * 3 + ri)} />)}
          </div>
        ))}

        <div style={{ marginTop: 16, border: `1px solid ${C.border}`, borderRadius: R, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: 50, boxSizing: "border-box", padding: "0 14px", background: C.sunken }}>
            <span style={{ font: "500 15px/1.3 var(--font-sans)", color: C.text }}>Legal and compliance centre</span>
            <span style={{ flex: 1 }} />
            <span style={{ opacity: scanAt(2) }}>
              <Badge tone="positive" mono style={CHIP}>3 / 3 PASS</Badge>
            </span>
          </div>
          <div style={{ height: 138 * expand, overflow: "hidden" }}>
            {SCANS.map((sc, i) => {
              const a = scanAt(i);
              return (
                <div key={sc} style={{
                  display: "flex", alignItems: "center", gap: 12, height: 46, boxSizing: "border-box",
                  padding: "0 14px", borderTop: `1px solid ${C.border}`, opacity: a
                }}>
                  <span style={{ width: 9, height: 9, flex: "none", borderRadius: 2, background: a > 0.5 ? C.positive : C.border }} />
                  <span style={{ font: "400 14px/1.3 var(--font-sans)", color: C.text }}>{sc}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ ...MONO_10, color: C.positive }}>PASS</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 04 · Defend ── */}
      <div style={{ ...body, opacity: s3.o, transform: `translateY(${s3.y}px)` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {VAULT.map((col, ci) => {
            const a = panelAt(ci);
            return (
              <div key={col.group} style={{
                border: `1px solid ${C.border}`, borderRadius: R, overflow: "hidden",
                opacity: a, transform: `translateY(${(1 - a) * 8}px)`
              }}>
                <div style={{ padding: "0 14px", background: C.sunken }}>
                  <GroupLabel name={col.group} meta={col.meta} />
                </div>
                {col.rows.map((row, ri) => <Doc key={row.ref} row={row} appear={docAt(ci, ri)} />)}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 16, border: `1px solid ${C.borderStrong}`, borderRadius: R, background: C.tint,
          padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 12,
          opacity: ratIn(0), transform: `translateY(${(1 - ratIn(0)) * 8}px)`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 3, height: 12, flex: "none", background: C.accent }} />
            <span style={{ ...MONO_10, color: C.label }}>DECISION RATIONALE</span>
            <span style={{ flex: 1 }} />
            <span style={{ ...MONO_10, color: C.label }}>VR-2291</span>
          </div>
          <span style={{ font: "500 15px/1.4 var(--font-sans)", color: C.text, opacity: ratIn(0) }}>{RATIONALE[0]}</span>
          <span style={{ font: "400 11px/1.5 var(--font-mono)", letterSpacing: "0.02em", color: C.dim, fontVariantNumeric: "tabular-nums", opacity: ratIn(1) }}>{RATIONALE[1]}</span>
        </div>
      </div>

      <div style={{ position: "absolute", left: PAD, bottom: PAD_B, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: R, padding: "7px 12px" }}>
        <span style={{ ...MONO_10, color: C.accent }}>AI</span>
        <span style={{ font: "500 13px/1 var(--font-sans)", color: C.text }}>Ask Vernier</span>
      </div>
    </div>
  );
}

window.ReelMobilePiece = function () {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Reel />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak("motionEditor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
};
