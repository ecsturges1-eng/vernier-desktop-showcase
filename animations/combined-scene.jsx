const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;

// Centrepiece — the four monitored sections feed one trunk on the right,
// the trunk scans the portfolio, and the scan hands off to the optimiser.
const W = 1440, H = 900;
const CARD = { left: 96, top: 72, w: 1440, h: 880 };
const PADL = 56;
const BODY_T = 116;                       // body origin inside the card
const COL_W = 544, GUT_X = 600, GUT_W = 160, PANE_X = 760, PANE_W = 544;
const HDR_H = 44, GRP_H = 34, ROW_H = 50, GRP_GAP = 14;
// Row 0-3 sit under the External group header, 4-8 under Internal.
const rowY = (i) => i < 4
  ? HDR_H + GRP_H + ROW_H * i + ROW_H / 2
  : HDR_H + GRP_H + ROW_H * 4 + GRP_GAP + GRP_H + ROW_H * (i - 4) + ROW_H / 2;
const INLET = 296;

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

const TYPE = {
  key: "400 16px/1 var(--font-mono)",
  label: "400 14px/1 var(--font-mono)",
  id: "400 15px/1 var(--font-mono)",
  row: "500 23px/1 var(--font-sans)",
  small: "400 19px/1 var(--font-sans)",
  value: "400 20px/1 var(--font-mono)",
  figure: "400 68px/1 var(--font-mono)"
};

function palette(ground, glass) {
  const ink = ground === "ink";
  return {
    ink,
    bg: ink ? "#06122A" : "#EAEBEA",
    text: ink ? "#EAEBEA" : "#06122A",
    dim: ink ? "#A5B2C6" : "#2E3A4D",
    accent: ink ? "#49C4F1" : "#24409B",
    accentDeep: ink ? "#2FA6D4" : "#1B3179",
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
      font: "500 13px/1 var(--font-mono)", letterSpacing: ".10em", flex: "none", whiteSpace: "nowrap",
      fontVariantNumeric: "tabular-nums", padding: fill ? "7px 10px" : "6px 9px"
    }}>{children}</span>
  );
}

function Box({ C, state }) {
  const on = state === "on" || state === "part";
  return (
    <span style={{
      width: 18, height: 18, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      background: on ? C.accent : "transparent", border: on ? "none" : `1.2px solid ${C.muted}`
    }}>
      {state === "on" && <svg width="11" height="11" viewBox="0 0 16 16"><path d="M3 8.5 L6.3 11.8 L13 5" fill="none" stroke="#EAEBEA" strokeWidth="2.4" /></svg>}
      {state === "part" && <span style={{ width: 9, height: 1.6, background: "#EAEBEA" }} />}
    </span>
  );
}

// A rotating disclosure caret: closed points right, feeding points down.
function Expand({ C, open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{
      flex: "none", transform: `rotate(${(open || 0) * 90}deg)`, transformOrigin: "50% 50%"
    }}>
      <path d="M4 1.5 L8.5 6 L4 10.5" fill="none" stroke={open > 0.5 ? C.accent : C.dim} strokeWidth="1.5" />
    </svg>
  );
}

function Chevron({ C }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ flex: "none", opacity: 0.5 }}>
      <path d="M4 1.5 L8.5 6 L4 10.5" fill="none" stroke={C.dim} strokeWidth="1.4" />
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
const SECTIONS = GROUPS.flatMap((g) => g.rows);

const FUNDS = [
  { id: "VR-1104", name: "Global equity", aum: "£2.1bn", fee: "0.64%", flag: null },
  { id: "VR-1876", name: "Sterling credit", aum: "£0.9bn", fee: "0.41%", flag: null },
  { id: "VR-2291", name: "Euro smaller cos.", aum: "£6.3bn", fee: "0.72%", flag: "amber" },
  { id: "VR-2410", name: "Multi-asset", aum: "£3.4bn", fee: "0.58%", flag: null },
  { id: "VR-2688", name: "EM hard-ccy debt", aum: "£1.2bn", fee: "0.69%", flag: null },
  { id: "VR-3050", name: "Index tracker", aum: "£8.7bn", fee: "0.11%", flag: null }
];

// Elasticity model — the optimiser's own numbers.
const AUM = 6.3e9, COST = 26.5e6, CURRENT = 72, OPTIMUM = 78;
const ret = (f) => 1 / (1 + Math.exp((f - 93) / 6));
const rev = (f) => AUM * (f / 10000) * ret(f);
const margin = (f) => (rev(f) - COST) / rev(f);
const M0 = margin(CURRENT);
const CW = PANE_W - 48, CH = 186, F0 = 60, F1 = 92;
const X = (f) => ((f - F0) / (F1 - F0)) * CW;
const Y = (r) => CH - ((r - 30e6) / 17e6) * CH;
const CURVE = (() => {
  const p = [];
  for (let f = F0; f <= F1 + 0.001; f += 0.5) p.push(`${X(f).toFixed(1)},${Y(rev(f)).toFixed(1)}`);
  return "M" + p.join(" L");
})();

// Routing: each section leaves its row, turns into a trunk, enters the pane.
function trace(i) {
  const y = rowY(i) - HDR_H, mid = 96;
  const drop = (INLET - HDR_H) - y;
  // A row sitting level with the trunk runs straight in; otherwise the corner
  // radius can never exceed half its own drop, or the path folds back on itself.
  if (Math.abs(drop) < 3) return `M0 ${INLET - HDR_H} H${GUT_W}`;
  const dir = drop > 0 ? 1 : -1;
  const bend = Math.min(22, Math.abs(drop) / 2);
  const inlet = INLET - HDR_H;
  return `M0 ${y} H${mid - bend} Q${mid} ${y} ${mid} ${y + bend * dir} V${inlet - bend * dir} Q${mid} ${inlet} ${mid + bend} ${inlet} H${GUT_W}`;
}
const TRACES = SECTIONS.map((_, i) => trace(i));

function Combined({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 14;
  const phase = (2 * Math.PI * T) / total;
  const camY = -6 * Math.sin(phase), camScale = 1.004 - 0.004 * Math.cos(phase);

  // 1 · the four sections stream into the trunk
  const feed = (i) => clamp(
    animate({ from: 0, to: 1, start: CUES.Collect + 0.2 + 0.2 * i, end: CUES.Collect + 1.5 + 0.2 * i, ease: MOTION.draw })(T) -
    animate({ from: 0, to: 1, start: CUES.Settle + 1.6 + 0.05 * i, end: CUES.Settle + 2.4 + 0.05 * i, ease: MOTION.draw })(T), 0, 1);

  // 2 · the trunk scans the portfolio
  const scan = clamp(track([[0, 0], [CUES.Scan + 0.3, 0], [CUES.Scan + 3.1, FUNDS.length], [CUES.Settle + 1.8, FUNDS.length], [CUES.Settle + 2.7, 0], [total, 0]], T), 0, FUNDS.length);
  // 3 · the pane slides: scan → optimiser → proposal → back to the scan
  const PAGES = 4;
  const pagePos = clamp(track([[0, 0], [CUES.Optimise + 0.2, 0], [CUES.Optimise + 1.5, 1],
                               [CUES.Proposal + 0.3, 1], [CUES.Proposal + 1.6, 2],
                               [CUES.Ready + 0.3, 2], [CUES.Ready + 1.5, 3],
                               [CUES.Settle + 0.3, 3], [CUES.Settle + 2.0, 0], [total, 0]], T), 0, 3);

  // Face-ID style confirmation: the ring draws, then the tick strokes through it.
  const ringDraw = animate({ from: 0, to: 1, start: CUES.Ready + 1.5, end: CUES.Ready + 2.2, ease: MOTION.draw })(T);
  const tickDraw = animate({ from: 0, to: 1, start: CUES.Ready + 2.0, end: CUES.Ready + 2.55, ease: Easing.easeOutCubic })(T);
  const tickPop = 1 + 0.06 * clamp(
    animate({ from: 0, to: 1, start: CUES.Ready + 2.35, end: CUES.Ready + 2.5, ease: MOTION.enter })(T) -
    animate({ from: 0, to: 1, start: CUES.Ready + 2.5, end: CUES.Ready + 2.85, ease: MOTION.enter })(T), 0, 1);
  const readyIn = animate({ from: 0, to: 1, start: CUES.Ready + 2.5, end: CUES.Ready + 3.1, ease: MOTION.enter })(T);

  // 4 · the optimiser sweeps and settles, once its page has arrived
  const f = track([[0, CURRENT], [CUES.Optimise + 1.6, CURRENT], [CUES.Optimise + 2.9, 90],
                   [CUES.Optimise + 3.2, 90], [CUES.Proposal + 0.3, OPTIMUM],
                   [CUES.Settle + 1.6, OPTIMUM], [CUES.Settle + 2.6, CURRENT], [total, CURRENT]], T);
  const m = margin(f), d = (m - M0) * 100;
  const tone = d > 0.05 ? "green" : d < -0.05 ? "red" : "amber";

  const settled = T >= CUES.Proposal + 0.4 && T < CUES.Settle + 1.8;
  const scanned = Math.floor(scan);
  const active = clamp(scanned, 0, FUNDS.length - 1);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: CARD.left, top: CARD.top, width: CARD.w, height: CARD.h,
        background: C.panel, border: `1px solid ${C.rule}`, borderRadius: tw.radius,
        transform: `translate(${camY * 0.5}px, ${camY}px) scale(${camScale})`, transformOrigin: "0% 0%",
        overflow: "hidden"
      }}>
        <div style={{ padding: `38px 150px 0 ${PADL}px`, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 9, height: 9, background: C.accent, flex: "none" }} />
          <span style={{ font: TYPE.key, letterSpacing: ".14em", color: C.text }}>PRICING INTELLIGENCE</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 10, border: `1px solid ${C.rule}`,
            padding: "9px 13px", font: "500 13px/1 var(--font-mono)", letterSpacing: ".12em", color: C.text, marginLeft: 12
          }}>
            <span style={{ width: 9, height: 1.4, background: C.dim, position: "relative" }}>
              <span style={{ position: "absolute", left: 3.8, top: -3.8, width: 1.4, height: 9, background: C.dim }} />
            </span>
            NEW PRODUCT
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>
            1,284 SOURCES · 6 FUNDS · 09:41 UTC
          </span>
        </div>

        <div style={{ position: "absolute", left: 0, top: BODY_T, right: 0, bottom: 0 }}>
          {/* ── monitored sections ── */}
          <div style={{ position: "absolute", left: PADL, top: 0, width: COL_W }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, height: HDR_H, boxSizing: "border-box", borderBottom: `1px solid ${C.ruleSoft}` }}>
              <Box C={C} state="part" />
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.text }}>MONITOR</span>
              <svg width="11" height="14" viewBox="0 0 12 16" style={{ flex: "none" }}>
                <path d="M2.5 6.5 L6 3 L9.5 6.5" fill="none" stroke={C.text} strokeWidth="1.4" />
                <path d="M2.5 9.5 L6 13 L9.5 9.5" fill="none" stroke={C.dim} strokeWidth="1.4" opacity="0.45" />
              </svg>
              <span style={{ flex: 1 }} />
              <span style={{ width: 130, flex: "none", textAlign: "right", font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>SIGNALS</span>
              <span style={{ width: 12, flex: "none", marginRight: 14 }} />
            </div>
            {GROUPS.map((g, gi) => {
              const base = gi === 0 ? 0 : GROUPS[0].rows.length;
              return (
                <div key={g.name} style={{ marginTop: gi === 0 ? 0 : GRP_GAP }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, height: GRP_H, boxSizing: "border-box",
                    borderBottom: `1px solid ${C.ruleSoft}`, paddingRight: 14
                  }}>
                    <span style={{ width: 3, height: 13, background: C.accent, flex: "none", marginLeft: 4 }} />
                    <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".16em", color: C.text }}>{g.name}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ font: "400 13px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{g.meta}</span>
                    <span style={{ width: 12, flex: "none" }} />
                  </div>
                  {g.rows.map((s, ri) => {
                    const on = feed(base + ri);
                    return (
                      <div key={s.title} style={{
                        display: "flex", alignItems: "center", gap: 16, height: ROW_H, boxSizing: "border-box",
                        borderBottom: `1px solid ${C.ruleSoft}`, background: on > 0.02 ? C.sel : "transparent",
                        paddingRight: 14
                      }}>
                        <Box C={C} state={on > 0.5 ? "on" : "off"} />
                        <span style={{ flex: 1, font: "500 18px/1 var(--font-sans)", letterSpacing: "-0.004em", color: C.text, whiteSpace: "nowrap" }}>{s.title}</span>
                        <span style={{ width: 130, flex: "none", textAlign: "right", font: "400 16px/1 var(--font-mono)", letterSpacing: ".04em", whiteSpace: "nowrap", color: on > 0.5 ? C.accent : C.dim, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                        <Expand C={C} open={on} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── routing ── */}
          <svg width={GUT_W} height="556" viewBox={`0 0 ${GUT_W} 556`} style={{ position: "absolute", left: GUT_X, top: HDR_H, overflow: "visible" }}>
            {TRACES.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke={C.ruleSoft} strokeWidth="1" />
                <path d={d} fill="none" stroke={C.accent} strokeWidth="1.6" pathLength="1"
                      strokeDasharray="1" strokeDashoffset={1 - feed(i)} opacity={feed(i) > 0 ? 1 : 0} />
              </g>
            ))}
            <rect x={GUT_W - 9} y={INLET - HDR_H - 5} width="10" height="10" fill={feed(0) > 0.9 ? C.accent : C.muted} />
          </svg>

          {/* ── right pane ── */}
          <div style={{
            position: "absolute", left: PANE_X, top: 0, width: PANE_W, height: 556,
            border: `1px solid ${C.rule}`, background: C.well, overflow: "hidden"
          }}>
          <div style={{ display: "flex", width: PANE_W * PAGES, height: "100%", transform: `translateX(${-pagePos * PANE_W}px)` }}>
          {/* page one — portfolio scan */}
          <div style={{ position: "relative", width: PANE_W, height: "100%", flex: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, height: HDR_H, boxSizing: "border-box", padding: "0 20px", borderBottom: `1px solid ${C.ruleSoft}` }}>
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.text }}>PORTFOLIO SCAN</span>
              <span style={{ flex: 1 }} />
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>
                {scanned} / {FUNDS.length}
              </span>
            </div>

            <div style={{ position: "absolute", left: 0, top: HDR_H, width: "100%" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14, height: 34, boxSizing: "border-box", padding: "0 20px",
                borderBottom: `1px solid ${C.ruleSoft}`, font: "400 12px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim
              }}>
                <span style={{ width: 9, flex: "none" }} />
                <span style={{ width: 78, flex: "none" }}>FUND</span>
                <span style={{ flex: 1, minWidth: 0 }}>RANGE</span>
                <span style={{ width: 78, flex: "none", textAlign: "right" }}>OCF</span>
                <span style={{ width: 86, flex: "none" }} />
              </div>
              {FUNDS.map((fd, i) => {
                const seen = i < scanned, live = i === active && scanned < FUNDS.length;
                return (
                  <div key={fd.id} style={{
                    display: "flex", alignItems: "center", gap: 14, height: 75, boxSizing: "border-box", padding: "0 20px",
                    borderBottom: `1px solid ${C.ruleSoft}`,
                    background: live ? C.sel : "transparent",
                    opacity: seen || live ? 1 : 0.4
                  }}>
                    <span style={{
                      width: 9, height: 9, flex: "none",
                      background: seen && fd.flag ? C.amber : seen ? C.green : live ? C.accent : "transparent",
                      border: seen || live ? "none" : `1.2px solid ${C.muted}`
                    }} />
                    <span style={{ width: 78, flex: "none", font: TYPE.id, letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{fd.id}</span>
                    <span style={{ flex: 1, minWidth: 0, font: "400 17px/1 var(--font-sans)", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fd.name}</span>
                    <span style={{ width: 78, flex: "none", font: TYPE.value, textAlign: "right", color: C.text, fontVariantNumeric: "tabular-nums" }}>{fd.fee}</span>
                    <span style={{ width: 86, flex: "none", display: "flex", justifyContent: "flex-end" }}>
                      {seen && fd.flag ? <Pill C={C} tone="amber">FLAGGED</Pill> : null}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* page two — the optimiser */}
          <div style={{ position: "relative", width: PANE_W, height: "100%", flex: "none", borderLeft: `1px solid ${C.ruleSoft}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, height: HDR_H, boxSizing: "border-box", padding: "0 20px", borderBottom: `1px solid ${C.ruleSoft}` }}>
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.text }}>OPTIMISE · VR-2291</span>
              <span style={{ flex: 1 }} />
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>SWEEP {f.toFixed(0)}BPS</span>
            </div>

            <div style={{ position: "absolute", left: 0, top: HDR_H, width: "100%", padding: "26px 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>OPERATING MARGIN</span>
                  <span style={{ font: TYPE.figure, letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>{(m * 100).toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
                  <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>NET REVENUE · £M</span>
                  <span style={{ font: "400 30px/1 var(--font-mono)", color: C.text, fontVariantNumeric: "tabular-nums" }}>{(rev(f) / 1e6).toFixed(2)}</span>
                </div>
              </div>
              <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ display: "block", overflow: "visible" }}>
                {[46e6, 38e6, 30e6].map((g, i) => <line key={i} x1="0" y1={Y(g)} x2={CW} y2={Y(g)} stroke={C.ruleSoft} strokeWidth="1" />)}
                <line x1={X(CURRENT)} y1="0" x2={X(CURRENT)} y2={CH} stroke={C.rule} strokeWidth="1" strokeDasharray="4 6" />
                <path d={CURVE} fill="none" stroke={C.text} strokeWidth="2" opacity="0.85" />
                <line x1={X(OPTIMUM)} y1={CH - 9} x2={X(OPTIMUM)} y2={CH + 9} stroke={C.accent} strokeWidth="2.5" />
                <line x1={X(f)} y1="0" x2={X(f)} y2={CH} stroke={C.accent} strokeWidth="2" />
                <rect x={X(f) - 7} y={Y(rev(f)) - 7} width="14" height="14" fill={C.accent} />
                <line x1="0" y1={CH} x2={CW} y2={CH} stroke={C.rule} strokeWidth="1" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${C.ruleSoft}`, paddingTop: 18 }}>
                <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  OCF {CURRENT} → {f.toFixed(0)}BPS
                </span>
                <span style={{ display: "flex", gap: 10, flex: "none", whiteSpace: "nowrap" }}>
                  {settled ? <Pill C={C} tone="accent">RECOMMENDED 0.78%</Pill> : null}
                  <Pill C={C} tone={tone}>{`Δ ${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(1)}pp`}</Pill>
                </span>
              </div>
            </div>
          </div>

          {/* page three — proposal and business outcome */}
          <div style={{ position: "relative", width: PANE_W, height: "100%", flex: "none", borderLeft: `1px solid ${C.ruleSoft}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, height: HDR_H, boxSizing: "border-box", padding: "0 20px", borderBottom: `1px solid ${C.ruleSoft}` }}>
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.text }}>PROPOSAL · VR-2291</span>
              <span style={{ flex: 1 }} />
              <Pill C={C} tone="accent">READY TO FILE</Pill>
            </div>
            <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>NET REVENUE UPLIFT</span>
                <span style={{ font: "400 44px/1 var(--font-mono)", letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
                  +£{((rev(OPTIMUM) - rev(CURRENT)) / 1e6).toFixed(2)}m
                </span>
                <span style={{ font: "400 15px/1 var(--font-mono)", letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>
                  OCF 0.72% <span style={{ color: C.dim }}>→</span> <span style={{ color: C.accent }}>0.78%</span> · Δ +9.0BPS VS PEER MEDIAN
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", height: 34, boxSizing: "border-box", borderBottom: `1px solid ${C.rule}`, font: "400 12px/1 var(--font-mono)", letterSpacing: ".14em", color: C.dim }}>
                  <span style={{ width: 44, flex: "none" }}>REF</span>
                  <span style={{ flex: 1, minWidth: 0 }}>OUTCOME</span>
                  <span style={{ width: 108, flex: "none", textAlign: "right" }}>VALUE</span>
                  <span style={{ width: 128, flex: "none", textAlign: "right" }}>STATE</span>
                </div>
                {[
                  ["O1", "Operating margin", "41.6%", "+1.8pp", "green"],
                  ["AR1", "Annualised revenue", "£45.41m", "+3.1%", "green"],
                  ["OR1", "Outflow at risk", "7.6%", "MODERATE", "amber"],
                  ["CL1", "Competition law scan", "41 funds", "PASS", "green"],
                  ["RF1", "Regional filings", "3 / 3", "CLEARED", "green"]
                ].map(([id, label, value, chip, tone2]) => (
                  <div key={id} style={{ display: "flex", alignItems: "center", height: 54, boxSizing: "border-box", borderBottom: `1px solid ${C.ruleSoft}` }}>
                    <span style={{ width: 44, flex: "none", font: "400 14px/1 var(--font-mono)", letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{id}</span>
                    <span style={{ flex: 1, minWidth: 0, font: "400 17px/1 var(--font-sans)", color: C.text, whiteSpace: "nowrap" }}>{label}</span>
                    <span style={{ width: 108, flex: "none", font: "400 18px/1 var(--font-mono)", textAlign: "right", color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                    <span style={{ width: 128, flex: "none", display: "flex", justifyContent: "flex-end" }}>
                      <Pill C={C} tone={tone2}>{chip}</Pill>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* page four — implementation confirmation */}
          <div style={{ position: "relative", width: PANE_W, height: "100%", flex: "none", borderLeft: `1px solid ${C.ruleSoft}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, height: HDR_H, boxSizing: "border-box", padding: "0 20px", borderBottom: `1px solid ${C.ruleSoft}` }}>
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.text }}>IMPLEMENTATION</span>
              <span style={{ flex: 1 }} />
              <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>VR-2291</span>
            </div>
            <div style={{
              position: "absolute", left: 0, top: HDR_H, right: 0, bottom: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30
            }}>
              <svg width="84" height="84" viewBox="0 0 84 84" style={{ display: "block", transform: `scale(${tickPop})`, transformOrigin: "50% 50%" }}>
                <circle cx="42" cy="42" r="33" fill="none" stroke={C.green} strokeWidth="2"
                        pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ringDraw}
                        transform="rotate(-90 42 42)" opacity="0.85" />
                <path d="M27 43.5 L37.5 54 L57 33" fill="none" stroke={C.green} strokeWidth="3.5"
                      strokeLinecap="square" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - tickDraw} />
              </svg>
              <span style={{
                font: "500 26px/1 var(--font-sans)", letterSpacing: "-0.008em", color: C.text,
                opacity: readyIn, transform: `translateY(${(1 - readyIn) * 8}px)`
              }}>Ready for implementation</span>
            </div>
          </div>
          </div>

          {/* scroll rail */}
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 12, height: 3, background: C.ruleSoft }}>
            <div style={{ position: "absolute", top: 0, left: `${(pagePos / PAGES) * 100}%`, width: `${100 / PAGES}%`, height: 3, background: C.muted }} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CombinedPiece = function () {
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
