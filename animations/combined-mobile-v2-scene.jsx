const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;

// Mobile centrepiece — the workflow runs top to bottom, one section on screen
// at a time: monitor → portfolio scan → optimiser → proposal → confirmation.
const W = 1080, H = 1400;
const BLEED = 32;
const CARD = { left: -BLEED, top: -BLEED, w: 1080 + BLEED * 2 };
const PAD = 56, RAIL = 68;               // left gutter carries the collecting trunk
const SEC_T = 20, ARROW_RUN = 40, SEC_B = 28;
const INNER = CARD.w - PAD * 2;
const BODY_W = INNER - RAIL;
const SECTIONS_N = 5;

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

const TYPE = {
  key: "400 19px/1 var(--font-mono)",
  label: "400 17px/1 var(--font-mono)",
  grp: "400 16px/1 var(--font-mono)",
  row: "500 25px/1 var(--font-sans)",
  small: "400 21px/1 var(--font-sans)",
  value: "400 22px/1 var(--font-mono)",
  figure: "400 86px/1 var(--font-mono)"
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
    ruleSoft: ink ? "rgba(234,235,234,.10)" : "rgba(6,18,42,.09)",
    panel: ink ? `rgba(234,235,234,${glass})` : `rgba(255,255,255,${Math.min(0.96, glass * 6 + 0.52)})`,
    well: ink ? "rgba(234,235,234,.035)" : "rgba(255,255,255,.55)",
    sel: ink ? "rgba(73,196,241,.10)" : "rgba(36,64,155,.06)",
    muted: ink ? "rgba(165,178,198,.45)" : "#DCDEDD",
    green: ink ? "#3FC08A" : "#1A6549",
    amber: ink ? "#E0A33C" : "#8A6212",
    red: ink ? "#E2665C" : "#A33227"
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
  const fill = tone === "green" ? C.green : tone === "amber" ? C.amber : tone === "red" ? C.red : tone === "accent" ? C.accent : null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", alignSelf: "center",
      background: fill || "transparent",
      color: fill ? "#EAEBEA" : C.dim,
      border: fill ? "none" : `1px solid ${C.rule}`,
      font: "500 17px/1 var(--font-mono)", letterSpacing: ".10em", flex: "none", whiteSpace: "nowrap",
      fontVariantNumeric: "tabular-nums", padding: fill ? "9px 13px" : "8px 12px"
    }}>{children}</span>
  );
}

function Box({ C, state }) {
  const on = state === "on" || state === "part";
  return (
    <span style={{
      width: 22, height: 22, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      background: on ? C.accent : "transparent", border: on ? "none" : `1.4px solid ${C.muted}`
    }}>
      {state === "on" && <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8.5 L6.3 11.8 L13 5" fill="none" stroke="#EAEBEA" strokeWidth="2.6" /></svg>}
      {state === "part" && <span style={{ width: 11, height: 2, background: "#EAEBEA" }} />}
    </span>
  );
}

// Disclosure caret: closed points right, feeding points down.
function Expand({ C, open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" style={{
      flex: "none", transform: `rotate(${(open || 0) * 90}deg)`, transformOrigin: "50% 50%"
    }}>
      <path d="M4 1.5 L8.5 6 L4 10.5" fill="none" stroke={open > 0.5 ? C.accent : C.dim} strokeWidth="1.5" />
    </svg>
  );
}

const GROUPS = [
  {
    name: "EXTERNAL", meta: "1,284 SOURCES", rows: [
      { title: "Fee signals", value: "2 NEW" },
      { title: "Competitive analysis", value: "4 UPDATED" },
      { title: "New launches", value: "12" },
      { title: "Regional monitor", value: "3 / 3" }
    ]
  },
  {
    name: "INTERNAL", meta: "LEDGER · 09:38", rows: [
      { title: "Fixed costs", value: "£18.2m" },
      { title: "Variable costs", value: "£8.3m" },
      { title: "KPIs", value: "9 TRACKED" },
      { title: "KRIs", value: "2 AMBER" },
      { title: "Budget", value: "FY26 · 94%" }
    ]
  }
];
const ROWS = GROUPS.flatMap((g) => g.rows);

const FUNDS = [
  { id: "VR-1104", name: "Global Equity Income", fee: "0.64%", flag: null },
  { id: "VR-1876", name: "Sterling Corporate Bond", fee: "0.41%", flag: null },
  { id: "VR-2291", name: "European Smaller Companies", fee: "0.72%", flag: "amber" },
  { id: "VR-2410", name: "Diversified Growth", fee: "0.58%", flag: null },
  { id: "VR-2688", name: "Emerging Market Debt", fee: "0.69%", flag: null },
  { id: "VR-3050", name: "Global Index Tracker", fee: "0.11%", flag: null }
];

// Retention decays logistically with price, so net revenue peaks at 78bps.
// Fixed £18.2m + variable £8.3m = the £26.5m cost base the margin uses.
const AUM = 6.3e9, COST = 26.5e6, CURRENT = 72, OPTIMUM = 78;
const ret = (f) => 1 / (1 + Math.exp((f - 93) / 6));
const rev = (f) => AUM * (f / 10000) * ret(f);
const margin = (f) => (rev(f) - COST) / rev(f);
const M0 = margin(CURRENT);
const CW = INNER - 48, CH = 340, F0 = 60, F1 = 92;
const X = (f) => ((f - F0) / (F1 - F0)) * CW;
const Y = (r) => CH - ((r - 30e6) / 17e6) * CH;
const CURVE = (() => {
  const p = [];
  for (let f = F0; f <= F1 + 0.001; f += 0.5) p.push(`${X(f).toFixed(1)},${Y(rev(f)).toFixed(1)}`);
  return "M" + p.join(" L");
})();

const GRP_H = 44, MROW_H = 88, GRP_GAP = 18, COLH_H = 64;
const TRUNK_START = COLH_H + GRP_H;
const TRUNK_END = COLH_H + GRP_H + MROW_H * 4 + GRP_GAP + GRP_H + MROW_H * 5;
const ARROW_END = TRUNK_END + ARROW_RUN;
const STAGE_H = SEC_T + ARROW_END + SEC_B;
const rowTop = (i) => i < 4
  ? COLH_H + GRP_H + MROW_H * i
  : COLH_H + GRP_H + MROW_H * 4 + GRP_GAP + GRP_H + MROW_H * (i - 4);

function SectionHead({ C, n, label, right, pill }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18, height: COLH_H, boxSizing: "border-box",
      borderBottom: `1px solid ${C.rule}`
    }}>
      <span style={{ font: TYPE.key, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{n}</span>
      <span style={{ font: TYPE.key, letterSpacing: ".14em", color: C.text }}>{label}</span>
      <span style={{ flex: 1 }} />
      {pill || <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{right}</span>}
    </div>
  );
}

function Combined({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 22;
  const phase = (2 * Math.PI * T) / total;
  const camY = -6 * Math.sin(phase), camScale = 1.003 - 0.003 * Math.cos(phase);

  // One section on screen at a time; the stage steps down by whole sections.
  const step = clamp(track([
    [0, 0],
    [CUES.Scan + 0.2, 0], [CUES.Scan + 1.5, 1],
    [CUES.Optimise + 0.2, 1], [CUES.Optimise + 1.5, 2],
    [CUES.Proposal + 0.2, 2], [CUES.Proposal + 1.5, 3],
    [CUES.Ready + 0.2, 3], [CUES.Ready + 1.5, 4],
    [CUES.Settle + 0.4, 4], [CUES.Settle + 2.2, 0], [total, 0]
  ], T), 0, 4);

  // The trunk collects downward through the nine monitored rows.
  const collect = clamp(
    animate({ from: 0, to: 1, start: CUES.Collect + 0.2, end: CUES.Collect + 2.6, ease: MOTION.draw })(T) -
    animate({ from: 0, to: 1, start: CUES.Settle + 1.4, end: CUES.Settle + 2.2, ease: MOTION.draw })(T), 0, 1);
  const trunkEnd = TRUNK_END;
  const trunkY = TRUNK_START + collect * (trunkEnd - TRUNK_START);
  const tapped = (i) => clamp((trunkY - (rowTop(i) + MROW_H / 2)) / 40, 0, 1);

  const scan = clamp(track([[0, 0], [CUES.Scan + 1.6, 0], [CUES.Scan + 4.0, FUNDS.length],
                            [CUES.Settle + 1.4, FUNDS.length], [CUES.Settle + 2.2, 0], [total, 0]], T), 0, FUNDS.length);

  const f = track([[0, CURRENT], [CUES.Optimise + 1.6, CURRENT], [CUES.Optimise + 2.9, 90],
                   [CUES.Optimise + 3.2, 90], [CUES.Proposal + 0.2, OPTIMUM],
                   [CUES.Settle + 1.4, OPTIMUM], [CUES.Settle + 2.4, CURRENT], [total, CURRENT]], T);
  const m = margin(f), d = (m - M0) * 100;
  const tone = d > 0.05 ? "green" : d < -0.05 ? "red" : "amber";
  const settled = T >= CUES.Proposal + 0.3 && T < CUES.Settle + 1.6;

  // Face-ID style confirmation.
  const ringDraw = animate({ from: 0, to: 1, start: CUES.Ready + 1.5, end: CUES.Ready + 2.2, ease: MOTION.draw })(T);
  const tickDraw = animate({ from: 0, to: 1, start: CUES.Ready + 2.0, end: CUES.Ready + 2.55, ease: Easing.easeOutCubic })(T);
  const tickPop = 1 + 0.06 * clamp(
    animate({ from: 0, to: 1, start: CUES.Ready + 2.35, end: CUES.Ready + 2.5, ease: MOTION.enter })(T) -
    animate({ from: 0, to: 1, start: CUES.Ready + 2.5, end: CUES.Ready + 2.85, ease: MOTION.enter })(T), 0, 1);
  const readyIn = animate({ from: 0, to: 1, start: CUES.Ready + 2.5, end: CUES.Ready + 3.1, ease: MOTION.enter })(T);

  const scanned = Math.floor(scan);
  const active = clamp(scanned, 0, FUNDS.length - 1);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: CARD.left, top: CARD.top, width: CARD.w, minHeight: H + BLEED * 2,
        background: C.panel,
        transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: "50% 0%",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: `${36 + BLEED}px ${PAD + BLEED}px 30px ${PAD + BLEED}px`, display: "flex", alignItems: "center", gap: 18, flex: "0 0 auto" }}>
          <span style={{ width: 11, height: 11, background: C.accent, flex: "none" }} />
          <span style={{ font: TYPE.key, letterSpacing: ".14em", color: C.text }}>PRICING INTELLIGENCE</span>
          <span style={{ flex: 1 }} />
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>VR-2291 · 09:41 UTC</span>
        </div>

        <div style={{ padding: `0 ${PAD + BLEED}px 26px ${PAD + BLEED}px`, display: "flex", alignItems: "center", gap: 24, flex: "0 0 auto" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 13, border: `1px solid ${C.rule}`,
            padding: "14px 18px", font: "500 17px/1 var(--font-mono)", letterSpacing: ".12em", color: C.text
          }}>
            <span style={{ width: 12, height: 1.6, background: C.dim, position: "relative" }}>
              <span style={{ position: "absolute", left: 5.2, top: -5.2, width: 1.6, height: 12, background: C.dim }} />
            </span>
            NEW PRODUCT
          </span>
          <span style={{ flex: 1, display: "flex", gap: 8 }}>
            {Array.from({ length: SECTIONS_N }).map((_, i) => (
              <span key={i} style={{ flex: 1, height: 4, background: step >= i - 0.5 ? C.accent : C.ruleSoft }} />
            ))}
          </span>
        </div>

        {/* ── the stage: one section visible, stepping downward ── */}
        <div style={{ height: STAGE_H, margin: `0 ${BLEED}px 0 ${BLEED}px`, overflow: "hidden", position: "relative", flex: "0 0 auto", borderTop: `1px solid ${C.ruleSoft}` }}>
          <div style={{ transform: `translateY(${-step * STAGE_H}px)` }}>

            {/* 01 · monitor */}
            <div style={{ height: STAGE_H, boxSizing: "border-box", padding: `${SEC_T}px ${PAD}px 0`, position: "relative", display: "flex", flexDirection: "column" }}>
              <SectionHead C={C} n="01" label="MONITOR" right="9 SECTIONS" />
              <div style={{ marginLeft: RAIL }}>
                {GROUPS.map((g, gi) => {
                  const base = gi === 0 ? 0 : GROUPS[0].rows.length;
                  return (
                    <div key={g.name} style={{ marginTop: gi === 0 ? 0 : GRP_GAP }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, height: GRP_H, boxSizing: "border-box", borderBottom: `1px solid ${C.ruleSoft}` }}>
                        <span style={{ width: 3, height: 16, background: C.accent, flex: "none" }} />
                        <span style={{ font: TYPE.grp, letterSpacing: ".16em", color: C.text }}>{g.name}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ font: TYPE.grp, letterSpacing: ".12em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{g.meta}</span>
                      </div>
                      {g.rows.map((s, ri) => {
                        const on = tapped(base + ri);
                        return (
                          <div key={s.title} style={{
                            display: "flex", alignItems: "center", gap: 20, height: MROW_H, boxSizing: "border-box",
                            borderBottom: `1px solid ${C.ruleSoft}`, background: on > 0.02 ? C.sel : "transparent"
                          }}>
                            <Box C={C} state={on > 0.5 ? "on" : "off"} />
                            <span style={{ flex: 1, font: TYPE.row, letterSpacing: "-0.005em", color: C.text, whiteSpace: "nowrap" }}>{s.title}</span>
                            <span style={{ width: 190, flex: "none", textAlign: "right", font: TYPE.value, letterSpacing: ".04em", whiteSpace: "nowrap", color: on > 0.5 ? C.accent : C.dim, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                            <Expand C={C} open={on} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* collecting trunk, drawn down the left gutter */}
              <svg width={RAIL} height={ARROW_END} viewBox={`0 0 ${RAIL} ${ARROW_END}`}
                   style={{ position: "absolute", left: PAD, top: SEC_T, overflow: "hidden" }}>
                <line x1="18" y1={TRUNK_START} x2="18" y2={trunkEnd} stroke={C.ruleSoft} strokeWidth="1" />
                {ROWS.map((_, i) => (
                  <line key={i} x1="18" y1={rowTop(i) + MROW_H / 2} x2={RAIL} y2={rowTop(i) + MROW_H / 2}
                        stroke={tapped(i) > 0.02 ? C.accent : C.ruleSoft} strokeWidth={tapped(i) > 0.02 ? 1.6 : 1}
                        opacity={tapped(i) > 0.02 ? tapped(i) : 1} />
                ))}
                <line x1="18" y1={TRUNK_START} x2="18" y2={trunkY} stroke={C.accent} strokeWidth="2" />
                <rect x="12" y={trunkY - 6} width="12" height="12" fill={C.accent} opacity={collect > 0.01 ? 1 : 0} />
                <path d={`M18 ${trunkEnd + 10} V${ARROW_END - 2} M10 ${ARROW_END - 10} L18 ${ARROW_END - 2} L26 ${ARROW_END - 10}`}
                      fill="none" stroke={C.accent} strokeWidth="2" opacity={collect > 0.98 ? 1 : 0.15} />
              </svg>
            </div>

            {/* 02 · portfolio scan */}
            <div style={{ height: STAGE_H, boxSizing: "border-box", padding: `${SEC_T}px ${PAD}px ${SEC_B}px`, display: "flex", flexDirection: "column" }}>
              <SectionHead C={C} n="02" label="PORTFOLIO SCAN" right={`${scanned} / ${FUNDS.length}`} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 20, height: 48, boxSizing: "border-box",
                borderBottom: `1px solid ${C.ruleSoft}`, font: "400 16px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim
              }}>
                <span style={{ width: 12, flex: "none" }} />
                <span style={{ width: 128, flex: "none" }}>FUND</span>
                <span style={{ flex: 1, minWidth: 0 }}>RANGE</span>
                <span style={{ width: 116, flex: "none", textAlign: "right" }}>OCF</span>
                <span style={{ width: 132, flex: "none" }} />
              </div>
              {FUNDS.map((fd, i) => {
                const seen = i < scanned, live = i === active && scanned < FUNDS.length;
                return (
                  <div key={fd.id} style={{
                    display: "flex", alignItems: "center", gap: 20, height: 122, boxSizing: "border-box",
                    borderBottom: `1px solid ${C.ruleSoft}`, background: live ? C.sel : "transparent",
                    opacity: seen || live ? 1 : 0.4
                  }}>
                    <span style={{
                      width: 12, height: 12, flex: "none",
                      background: seen && fd.flag ? C.amber : seen ? C.green : live ? C.accent : "transparent",
                      border: seen || live ? "none" : `1.4px solid ${C.muted}`
                    }} />
                    <span style={{ width: 128, flex: "none", font: "400 20px/1 var(--font-mono)", letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{fd.id}</span>
                    <span style={{ flex: 1, minWidth: 0, font: TYPE.small, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fd.name}</span>
                    <span style={{ width: 116, flex: "none", font: TYPE.value, textAlign: "right", color: C.text, fontVariantNumeric: "tabular-nums" }}>{fd.fee}</span>
                    <span style={{ width: 132, flex: "none", display: "flex", justifyContent: "flex-end" }}>
                      {seen && fd.flag ? <Pill C={C} tone="amber">FLAG</Pill> : null}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>

            {/* 03 · optimiser */}
            <div style={{ height: STAGE_H, boxSizing: "border-box", padding: `${SEC_T}px ${PAD}px ${SEC_B}px`, display: "flex", flexDirection: "column" }}>
              <SectionHead C={C} n="03" label="OPTIMISE" right={`SWEEP ${f.toFixed(0)}BPS`} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>OPERATING MARGIN</span>
                    <span style={{ font: TYPE.figure, letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>{(m * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end" }}>
                    <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>NET REVENUE · £M</span>
                    <span style={{ font: "400 40px/1 var(--font-mono)", color: C.text, fontVariantNumeric: "tabular-nums" }}>{(rev(f) / 1e6).toFixed(2)}</span>
                  </div>
                </div>
                <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ display: "block", overflow: "visible" }}>
                  {[46e6, 38e6, 30e6].map((g, i) => <line key={i} x1="0" y1={Y(g)} x2={CW} y2={Y(g)} stroke={C.ruleSoft} strokeWidth="1" />)}
                  <line x1={X(CURRENT)} y1="0" x2={X(CURRENT)} y2={CH} stroke={C.rule} strokeWidth="1" strokeDasharray="5 8" />
                  <path d={CURVE} fill="none" stroke={C.text} strokeWidth="2.5" opacity="0.85" />
                  <line x1={X(OPTIMUM)} y1={CH - 12} x2={X(OPTIMUM)} y2={CH + 12} stroke={C.accent} strokeWidth="3" />
                  <line x1={X(f)} y1="0" x2={X(f)} y2={CH} stroke={C.accent} strokeWidth="2.5" />
                  <rect x={X(f) - 10} y={Y(rev(f)) - 10} width="20" height="20" fill={C.accent} />
                  <line x1="0" y1={CH} x2={CW} y2={CH} stroke={C.rule} strokeWidth="1" />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 17px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim }}>
                  <span>60</span><span>ONGOING CHARGE, BPS</span><span>92</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 26 }}>
                  <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    OCF {CURRENT} → {f.toFixed(0)}BPS
                  </span>
                  <span style={{ display: "flex", gap: 12, flex: "none" }}>
                    {settled ? <Pill C={C} tone="accent">RECOMMENDED 0.78%</Pill> : null}
                    <Pill C={C} tone={tone}>{`Δ ${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(1)}pp`}</Pill>
                  </span>
                </div>
              </div>
            </div>

            {/* 04 · proposal */}
            <div style={{ height: STAGE_H, boxSizing: "border-box", padding: `${SEC_T}px ${PAD}px ${SEC_B}px`, display: "flex", flexDirection: "column" }}>
              <SectionHead C={C} n="04" label="PROPOSAL" pill={<Pill C={C} tone="accent">READY TO FILE</Pill>} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>NET REVENUE UPLIFT</span>
                  <span style={{ font: "400 78px/1 var(--font-mono)", letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
                    +£{((rev(OPTIMUM) - rev(CURRENT)) / 1e6).toFixed(2)}m
                  </span>
                  <span style={{ font: "400 19px/1 var(--font-mono)", letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>
                    OCF 0.72% <span style={{ color: C.dim }}>→</span> <span style={{ color: C.accent }}>0.78%</span> · Δ +9.0BPS VS PEER MEDIAN
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", height: 48, boxSizing: "border-box", borderBottom: `1px solid ${C.rule}`, font: "400 16px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>
                    <span style={{ width: 72, flex: "none" }}>REF</span>
                    <span style={{ flex: 1, minWidth: 0 }}>OUTCOME</span>
                    <span style={{ width: 160, flex: "none", textAlign: "right" }}>VALUE</span>
                    <span style={{ width: 176, flex: "none", textAlign: "right" }}>STATE</span>
                  </div>
                  {[
                    ["O1", "Operating margin", "41.6%", "+1.8pp", "green"],
                    ["AR1", "Annualised revenue", "£45.41m", "+3.1%", "green"],
                    ["OR1", "Outflow at risk", "7.6%", "MODERATE", "amber"],
                    ["CL1", "Competition law scan", "41 funds", "PASS", "green"],
                    ["RF1", "Regional filings", "3 / 3", "CLEARED", "green"]
                  ].map(([id, label, value, chip, tone2]) => (
                    <div key={id} style={{ display: "flex", alignItems: "center", height: 84, boxSizing: "border-box", borderBottom: `1px solid ${C.ruleSoft}` }}>
                      <span style={{ width: 72, flex: "none", font: "400 18px/1 var(--font-mono)", letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{id}</span>
                      <span style={{ flex: 1, minWidth: 0, font: TYPE.small, color: C.text, whiteSpace: "nowrap" }}>{label}</span>
                      <span style={{ width: 160, flex: "none", font: "400 24px/1 var(--font-mono)", textAlign: "right", color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                      <span style={{ width: 176, flex: "none", display: "flex", justifyContent: "flex-end" }}>
                        <Pill C={C} tone={tone2}>{chip}</Pill>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 05 · confirmation */}
            <div style={{ height: STAGE_H, boxSizing: "border-box", padding: `${SEC_T}px ${PAD}px ${SEC_B}px`, display: "flex", flexDirection: "column" }}>
              <SectionHead C={C} n="05" label="IMPLEMENTATION" right="VR-2291" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: "block", transform: `scale(${tickPop})`, transformOrigin: "50% 50%" }}>
                  <circle cx="60" cy="60" r="48" fill="none" stroke={C.green} strokeWidth="2.5"
                          pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ringDraw}
                          transform="rotate(-90 60 60)" opacity="0.85" />
                  <path d="M39 62 L54 77 L82 47" fill="none" stroke={C.green} strokeWidth="5"
                        strokeLinecap="square" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - tickDraw} />
                </svg>
                <span style={{
                  font: "500 34px/1 var(--font-sans)", letterSpacing: "-0.01em", color: C.text,
                  opacity: readyIn, transform: `translateY(${(1 - readyIn) * 10}px)`
                }}>Ready for implementation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CombinedMobilePiece = function () {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}
                        bg={tw.ground === "ink" ? "#06122A" : "#EAEBEA"}>
        <Combined tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Surface" />
        <TweakRadio label="Ground" value={tw.ground} options={["paper", "ink"]} onChange={(v) => setTweak("ground", v)} />
        <TweakSlider label="Translucency" value={tw.glass} min={0.02} max={0.14} step={0.005} onChange={(v) => setTweak("glass", v)} />
        <TweakSlider label="Corner radius" value={tw.radius} min={0} max={28} step={2} unit="px" onChange={(v) => setTweak("radius", v)} />
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak("motionEditor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
};
