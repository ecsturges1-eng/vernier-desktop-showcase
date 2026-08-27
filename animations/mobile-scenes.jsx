const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakRadio } = window;

// ── Shared mobile shell ──────────────────────────────────────────────────
// One card, entering from the bottom-right, with clear space at the top-left.
// Interface hints (select boxes, ids, sort caret, chevrons, scroll rail) run
// off the right edge; every figure stays inside the visible field.
const W = 1080, H = 1350;
const CARD = { left: 168, top: 132, w: 1040 };
const PADL = 56, PADR = 240, INNER = CARD.w - PADL - PADR;

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

const TYPE = {
  key: "400 22px/1 var(--font-mono)",
  label: "400 20px/1 var(--font-mono)",
  id: "400 21px/1 var(--font-mono)",
  row: "500 33px/1 var(--font-sans)",
  head: "500 45px/1.24 var(--font-sans)",
  figure: "400 100px/1 var(--font-mono)",
  value: "400 31px/1 var(--font-mono)"
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
    behind: ink ? `rgba(234,235,234,${glass * 0.5})` : `rgba(244,245,244,${glass * 4 + 0.18})`,
    well: ink ? "rgba(234,235,234,.035)" : "rgba(6,18,42,.03)",
    sel: ink ? "rgba(73,196,241,.10)" : "rgba(36,64,155,.07)",
    muted: ink ? "rgba(165,178,198,.45)" : "#DCDEDD",
    green: ink ? "#3FC08A" : "#1F7A57",
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
  const fill = tone === "green" ? C.green : tone === "amber" ? C.amber : tone === "red" ? C.red : null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", alignSelf: "center",
      background: fill || "transparent",
      color: fill ? (C.ink ? "#06122A" : "#EAEBEA") : C.dim,
      border: fill ? "none" : `1px solid ${C.rule}`,
      font: "500 19px/1 var(--font-mono)", letterSpacing: ".10em",
      fontVariantNumeric: "tabular-nums", padding: fill ? "11px 15px" : "10px 14px"
    }}>{children}</span>
  );
}

function Box({ C, state }) {
  // state: off · on · part
  const on = state === "on" || state === "part";
  return (
    <span style={{
      width: 26, height: 26, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      background: on ? C.accent : "transparent", border: on ? "none" : `1.5px solid ${C.muted}`
    }}>
      {state === "on" && (
        <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8.5 L6.3 11.8 L13 5" fill="none" stroke={C.ink ? "#06122A" : "#EAEBEA"} strokeWidth="2" /></svg>
      )}
      {state === "part" && <span style={{ width: 12, height: 2, background: C.ink ? "#06122A" : "#EAEBEA" }} />}
    </span>
  );
}

function Chevron({ C }) {
  return (
    <svg width="16" height="16" viewBox="0 0 12 12" style={{ flex: "none", opacity: 0.55 }}>
      <path d="M4 1.5 L8.5 6 L4 10.5" fill="none" stroke={C.dim} strokeWidth="1.4" />
    </svg>
  );
}

function Caret({ C }) {
  return (
    <svg width="15" height="18" viewBox="0 0 12 16" style={{ flex: "none" }}>
      <path d="M2.5 6.5 L6 3 L9.5 6.5" fill="none" stroke={C.text} strokeWidth="1.4" />
      <path d="M2.5 9.5 L6 13 L9.5 9.5" fill="none" stroke={C.dim} strokeWidth="1.4" opacity="0.45" />
    </svg>
  );
}

function ColHeader({ C, label, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 26, height: 74, flex: "0 0 auto",
      padding: `0 ${PADR - 96}px 0 ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`, background: C.well
    }}>
      <Box C={C} state="part" />
      <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.text }}>{label}</span>
      <Caret C={C} />
      <span style={{ flex: 1 }} />
      <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>{right}</span>
      <span style={{ width: 16, flex: "none" }} />
    </div>
  );
}

function Row({ C, id, box, node, title, value, tone, pill, h, hl, dimmed }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 26, height: h || 126, flex: "0 0 auto",
      padding: `0 ${PADR - 96}px 0 ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`,
      background: box === "on" ? C.sel : hl ? (C.ink ? `rgba(234,235,234,${0.05 * hl})` : `rgba(6,18,42,${0.03 * hl})`) : "transparent"
    }}>
      <Box C={C} state={box || "off"} />
      {id !== undefined && (
        <span style={{ width: 132, flex: "none", font: TYPE.id, letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums", opacity: dimmed ? 0.55 : 1 }}>{id}</span>
      )}
      {node !== undefined && (
        <span style={{
          width: 16, height: 16, flex: "none",
          background: node === "green" ? C.green : node === "amber" ? C.amber : node === "red" ? C.red : "transparent",
          border: node ? "none" : `1.5px solid ${C.muted}`
        }} />
      )}
      <span style={{ flex: 1, font: TYPE.row, letterSpacing: "-0.005em", color: dimmed ? C.dim : C.text, whiteSpace: "nowrap" }}>{title}</span>
      {pill ? <Pill C={C} tone={tone}>{pill}</Pill> : (
        <span style={{ font: TYPE.value, letterSpacing: ".04em", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: tone === "accent" ? C.accent : C.text }}>{value}</span>
      )}
      <Chevron C={C} />
    </div>
  );
}

function Shell({ C, tw, camY, camScale, number, name, status, action, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{
        position: "absolute", left: CARD.left, top: CARD.top, width: CARD.w, minHeight: H - CARD.top + 120,
        background: C.panel, borderRadius: tw.radius,
        transform: `translate(${camY * 0.5}px, ${camY}px) scale(${camScale})`, transformOrigin: "0% 0%",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: `46px ${PADR}px 30px ${PADL}px`, display: "flex", alignItems: "center", gap: 22, flex: "0 0 auto" }}>
          <span style={{ width: 12, height: 12, background: C.accent, flex: "none" }} />
          <span style={{ font: TYPE.key, letterSpacing: ".14em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
            {number} / {name}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{status}</span>
        </div>
        <div style={{ padding: `0 ${PADR}px 34px ${PADL}px`, flex: "0 0 auto" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 14, border: `1px solid ${C.rule}`,
            padding: "16px 22px", font: "500 20px/1 var(--font-mono)", letterSpacing: ".12em", color: C.text
          }}>
            <span style={{ width: 12, height: 1.5, background: C.dim, position: "relative" }}>
              <span style={{ position: "absolute", left: 5.25, top: -5.25, width: 1.5, height: 12, background: C.dim }} />
            </span>
            {action}
          </span>
        </div>
        {children}
      </div>
      <div style={{
        position: "absolute", left: 1044, top: CARD.top + 320, width: 4, height: 300,
        background: C.rule
      }} />
    </div>
  );
}

function useShell(tw) {
  const { T, CUES, authoredTotal } = useComposition();
  const C = palette(tw.ground, tw.glass);
  const total = authoredTotal || 10;
  const phase = (2 * Math.PI * T) / total;
  return { T, CUES, total, C, camY: -7 * Math.sin(phase), camScale: 1.004 - 0.004 * Math.cos(phase) };
}

function Stage({ tw, setTweak, children }) {
  return (
    <React.Fragment>
      <CompositionStage
        width={W} height={H}
        scenes={window.OM_SCENES}
        playback={window.OM_PLAYBACK}
        bg={tw.ground === "ink" ? "#06122A" : "#EAEBEA"}
      >
        {children}
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

// ── 01 · Monitor ─────────────────────────────────────────────────────────
const STORIES = [
  { kicker: "AI · 24 AUG 2026", head: "Agentic AI moves from pilot to production", meta: "6 SOURCES · 41 PEER FUNDS", tag: "OPS IMPACT", tone: "amber" },
  { kicker: "FEES · 21 AUG 2026", head: "Fee compression persists as passive share widens", meta: "9 SOURCES · Δ −23BPS SINCE 2010", tag: "FEE IMPACT", tone: "red" }
];
const M_ROWS = [
  { id: "SEC-041", title: "Competitive analysis", value: "4 NEW", box: "on" },
  { id: "SEC-040", title: "New launches", value: "12" },
  { id: "SEC-039", title: "Regions", value: "3 / 3" },
  { id: "SEC-038", title: "Peer fee moves", value: "7" }
];

function MonitorM({ tw }) {
  const { T, CUES, total, C, camY, camScale } = useShell(tw);
  const swap = track([[0, 0], [CUES.Advance + 0.4, 0], [CUES.Advance + 1.4, 1],
                      [CUES.Back + 0.6, 1], [CUES.Back + 1.6, 0], [total, 0]], T);
  const i = swap > 0.5 ? 1 : 0, s = STORIES[i];
  const appear = clamp(1 - Math.abs(Math.sin(swap * Math.PI)), 0, 1);

  const bump = (st, e) => clamp(
    animate({ from: 0, to: 1, start: st, end: st + 0.3, ease: MOTION.enter })(T) -
    animate({ from: 0, to: 1, start: e - 0.3, end: e, ease: MOTION.enter })(T), 0, 1);

  return (
    <Shell C={C} tw={tw} camY={camY} camScale={camScale} number="01" name="MONITOR" status="1,284 SOURCES" action="FILTER">
      <div style={{ padding: `34px ${PADR}px 40px ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, opacity: appear }}>{s.kicker}</span>
          <Pill C={C} tone={s.tone}>{s.tag}</Pill>
        </div>
        <div style={{ font: TYPE.head, letterSpacing: "-0.012em", color: C.text, textWrap: "pretty", opacity: appear, transform: `translateY(${(1 - appear) * 14}px)` }}>
          {s.head}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: appear }}>
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>{s.meta}</span>
          <div style={{ display: "flex", gap: 10 }}>
            {STORIES.map((_, k) => <div key={k} style={{ width: 40, height: 4, background: k === i ? C.accent : C.muted }} />)}
          </div>
        </div>
      </div>

      <ColHeader C={C} label="SECTION" right="UPDATED" />
      {M_ROWS.map((r, k) => (
        <Row key={r.id} C={C} id={r.id} box={r.box} title={r.title} value={r.value}
             tone={bump(CUES.Scan + 0.2 + 0.6 * k, CUES.Scan + 0.8 + 0.6 * k) > 0.35 ? "accent" : null}
             hl={bump(CUES.Scan + 0.2 + 0.6 * k, CUES.Scan + 0.8 + 0.6 * k)} />
      ))}
    </Shell>
  );
}

// ── 02 · Optimise ────────────────────────────────────────────────────────
const AUM = 6.3e9, COST = 26.5e6, CURRENT = 72, OPTIMUM = 78;
const ret = (f) => 1 / (1 + Math.exp((f - 93) / 6));
const rev = (f) => AUM * (f / 10000) * ret(f);
const margin = (f) => (rev(f) - COST) / rev(f);
const M0 = margin(CURRENT), R0 = rev(CURRENT);
const CH = 226, F0 = 60, F1 = 92;
const X = (f) => ((f - F0) / (F1 - F0)) * INNER;
const Y = (r) => CH - ((r - 30e6) / 17e6) * CH;
const CURVE = (() => {
  const p = [];
  for (let f = F0; f <= F1 + 0.001; f += 0.5) p.push(`${X(f).toFixed(1)},${Y(rev(f)).toFixed(1)}`);
  return "M" + p.join(" L");
})();

function OptimiseM({ tw }) {
  const { T, CUES, total, C, camY, camScale } = useShell(tw);
  const f = track([[0, OPTIMUM], [CUES.Down + 0.3, OPTIMUM], [CUES.Down + 2.2, CURRENT],
                   [CUES.Up + 0.3, CURRENT], [CUES.Up + 2.2, 90],
                   [CUES.Settle + 0.4, 90], [CUES.Settle + 2.4, OPTIMUM], [total, OPTIMUM]], T);
  const m = margin(f), r = rev(f), d = (m - M0) * 100, dR = (r - R0) / 1e6, out = 1 - ret(f);
  const tone = d > 0.05 ? "green" : d < -0.05 ? "red" : "amber";
  const x = X(f), y = Y(rev(f));
  const outTone = out < 0.05 ? "green" : out < 0.12 ? "amber" : "red";

  return (
    <Shell C={C} tw={tw} camY={camY} camScale={camScale} number="02" name="OPTIMISE" status={`SWEEP ${f.toFixed(0)}BPS`} action="RE-RUN">
      <div style={{ padding: `34px ${PADR}px 36px ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>OPERATING MARGIN</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ font: TYPE.figure, letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
            {(m * 100).toFixed(1)}%
          </span>
          <Pill C={C} tone={tone}>{`Δ ${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(1)}pp`}</Pill>
        </div>
      </div>

      <div style={{ padding: `30px ${PADR}px 30px ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>NET REVENUE · £M</span>
          <span style={{ font: "400 30px/1 var(--font-mono)", letterSpacing: ".04em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
            {(r / 1e6).toFixed(2)}
            <span style={{ color: C.dim, fontSize: 21 }}>{`  Δ ${dR >= 0 ? "+" : "−"}${Math.abs(dR).toFixed(2)}`}</span>
          </span>
        </div>
        <svg width={INNER} height={CH} viewBox={`0 0 ${INNER} ${CH}`} style={{ display: "block", overflow: "visible" }}>
          {[46e6, 38e6, 30e6].map((g, i) => (
            <line key={i} x1="0" y1={Y(g)} x2={INNER} y2={Y(g)} stroke={C.ruleSoft} strokeWidth="1" />
          ))}
          <line x1={X(CURRENT)} y1="0" x2={X(CURRENT)} y2={CH} stroke={C.rule} strokeWidth="1" strokeDasharray="4 7" />
          <path d={CURVE} fill="none" stroke={C.text} strokeWidth="2.5" opacity="0.85" />
          <line x1={X(OPTIMUM)} y1={CH - 12} x2={X(OPTIMUM)} y2={CH + 12} stroke={C.accent} strokeWidth="3" />
          <line x1={x} y1="0" x2={x} y2={CH} stroke={C.accent} strokeWidth="2.5" />
          <rect x={x - 9} y={y - 9} width="18" height="18" fill={C.accent} />
          <line x1="0" y1={CH} x2={INNER} y2={CH} stroke={C.rule} strokeWidth="1" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", font: "400 18px/1 var(--font-mono)", letterSpacing: ".12em", color: C.dim }}>
          <span>60</span><span>ONGOING CHARGE, BPS</span><span>92</span>
        </div>
      </div>

      <ColHeader C={C} label="RISK" right="STATE" />
      <Row C={C} id="RSK-01" title="Outflow at risk" pill={`${(out * 100).toFixed(1)}%`} tone={outTone} h={108} />
      <Row C={C} id="RSK-02" title="Antitrust screen" pill={f > 86 ? "REVIEW" : "PASS"} tone={f > 86 ? "red" : "green"} h={108} />
      <Row C={C} id="RSK-03" title="Mandate breach" pill={f > 88 ? "1 FLAGGED" : "NONE"} tone={f > 88 ? "amber" : "green"} h={108} dimmed={f <= 88} />
    </Shell>
  );
}

// ── 03 · Implement ───────────────────────────────────────────────────────
const STEPS = [
  { id: "GOV-01", name: "Pricing committee", meta: "2 / 2" },
  { id: "GOV-02", name: "Antitrust screen", meta: "41 FUNDS" },
  { id: "GOV-03", name: "Product governance", meta: "REVIEWED" },
  { id: "GOV-04", name: "Client disclosure", meta: "KID · FS" },
  { id: "GOV-05", name: "Fee schedule live", meta: "3 REGIONS" }
];
const P0 = 2.35;

function ImplementM({ tw }) {
  const { T, CUES, total, C, camY, camScale } = useShell(tw);
  const p = track([[0, P0], [CUES.Sign + 0.3, P0], [CUES.Sign + 1.6, 3.4],
                   [CUES.Sign + 2.8, 4.3], [CUES.Publish + 1.2, 5],
                   [CUES.Reset + 1.4, 5], [CUES.Reset + 2.6, P0], [total, P0]], T);
  const shown = clamp(Math.floor(p), 0, 5);

  return (
    <Shell C={C} tw={tw} camY={camY} camScale={camScale} number="03" name="IMPLEMENT" status="VR-2291 · 09:41 UTC" action="APPROVE">
      <div style={{ padding: `34px ${PADR}px 36px ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>GOVERNANCE STEPS</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ font: TYPE.figure, letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>
            {shown}<span style={{ color: C.dim }}>/5</span>
          </span>
          <Pill C={C} tone={p >= 5 ? "green" : "amber"}>{p >= 5 ? "AUDIT-READY" : "IN REVIEW"}</Pill>
        </div>
        <div style={{ height: 8, background: C.well }}>
          <div style={{ height: 8, width: `${(p / 5) * 100}%`, background: C.green }} />
        </div>
      </div>

      <ColHeader C={C} label="STEP" right="EVIDENCE" />
      {STEPS.map((s, i) => {
        const done = clamp(p - i, 0, 1);
        const state = done >= 1 ? "green" : done > 0 ? "amber" : null;
        return (
          <Row key={s.id} C={C} id={s.id} box={done >= 1 ? "on" : "off"} node={state}
               title={s.name} value={s.meta} h={118} dimmed={done === 0} />
        );
      })}
    </Shell>
  );
}

// ── 04 · Defend ──────────────────────────────────────────────────────────
const SPAN = 273;
const VERSIONS = [
  { v: "v1", day: 7, vars: "968", src: "4 SRC", app: "2 / 2", rules: 3, ref: "PC-01/26", stamp: "08 JAN 2026 11:02 UTC" },
  { v: "v2", day: 77, vars: "1,043", src: "5 SRC", app: "1 / 2", rules: 2, ref: "PC-04/26", stamp: "19 MAR 2026 09:14 UTC" },
  { v: "v3", day: 182, vars: "1,190", src: "5 SRC", app: "2 / 2", rules: 2, ref: "PC-09/26", stamp: "02 JUL 2026 15:38 UTC" },
  { v: "v4", day: 225, vars: "1,284", src: "6 SRC", app: "2 / 2", rules: 3, ref: "PC-14/26", stamp: "14 AUG 2026 09:41 UTC" }
];
const REGIONS = ["EMEA", "NA", "APAC"];

function DefendM({ tw }) {
  const { T, CUES, total, C, camY, camScale } = useShell(tw);
  const day = track([[0, 225], [CUES.Rewind + 0.3, 225], [CUES.Rewind + 2.6, 7],
                     [CUES.Return + 0.4, 7], [CUES.Return + 2.4, 225], [total, 225]], T);
  let ai = 0;
  VERSIONS.forEach((r, i) => { if (day >= r.day - 0.5) ai = i; });
  const R = VERSIONS[ai];
  const x = (day / SPAN) * INNER;

  return (
    <Shell C={C} tw={tw} camY={camY} camScale={camScale} number="04" name="DEFEND" status={`${VERSIONS.length} VERSIONS`} action="EXPORT">
      <div style={{ padding: `34px ${PADR}px 32px ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim }}>AUDIT HISTORY</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ font: TYPE.figure, letterSpacing: "-0.02em", color: C.text, fontVariantNumeric: "tabular-nums" }}>{R.v}</span>
          <span style={{ font: TYPE.label, letterSpacing: ".14em", color: C.dim, fontVariantNumeric: "tabular-nums", paddingBottom: 12 }}>{R.stamp}</span>
        </div>
        <svg width={INNER} height="76" viewBox={`0 0 ${INNER} 76`} style={{ display: "block", overflow: "visible" }}>
          <line x1="0" y1="48" x2={INNER} y2="48" stroke={C.rule} strokeWidth="1" />
          {VERSIONS.map((r, i) => (
            <g key={r.v}>
              <rect x={(r.day / SPAN) * INNER - 6} y="42" width="12" height="12" fill={i === ai ? C.accent : C.muted} />
              <text x={(r.day / SPAN) * INNER} y="26" fill={C.dim} textAnchor="middle" style={{ font: "400 17px var(--font-mono)", letterSpacing: ".08em" }}>{r.v}</text>
            </g>
          ))}
          <line x1={x} y1="16" x2={x} y2="68" stroke={C.accent} strokeWidth="2.5" />
        </svg>
      </div>

      <ColHeader C={C} label="EVIDENCE" right="STATE" />
      <Row C={C} id="EVD-01" box="on" title="Input data" value={`${R.vars} · ${R.src}`} h={118} />
      <Row C={C} id="EVD-02" box="on" title="Approvals" pill={R.app} tone={R.app === "2 / 2" ? "green" : "amber"} h={118} />
      <Row C={C} id="EVD-03" title="Decision governance" value={R.ref} h={118} />
      <div style={{
        display: "flex", alignItems: "center", gap: 26, height: 118, flex: "0 0 auto",
        padding: `0 ${PADR - 96}px 0 ${PADL}px`, borderTop: `1px solid ${C.ruleSoft}`
      }}>
        <Box C={C} state="off" />
        <span style={{ width: 132, flex: "none", font: TYPE.id, letterSpacing: ".08em", color: C.dim, fontVariantNumeric: "tabular-nums" }}>EVD-04</span>
        <span style={{ flex: 1, font: TYPE.row, letterSpacing: "-0.005em", color: C.text, whiteSpace: "nowrap" }}>Regional rules</span>
        <div style={{ display: "flex", gap: 10 }}>
          {REGIONS.map((rg, i) => <Pill key={rg} C={C} tone={i < R.rules ? "green" : "amber"}>{rg}</Pill>)}
        </div>
        <Chevron C={C} />
      </div>
    </Shell>
  );
}

function piece(Body, key) {
  window[key] = function () {
    const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
    return <Stage tw={tw} setTweak={setTweak}><Body tw={tw} /></Stage>;
  };
}

piece(MonitorM, "MonitorMobilePiece");
piece(OptimiseM, "OptimiseMobilePiece");
piece(ImplementM, "ImplementMobilePiece");
piece(DefendM, "DefendMobilePiece");
