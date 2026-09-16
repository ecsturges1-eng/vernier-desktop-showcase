const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;

const DS = window.VernierDesignSystem_89b06b || {};
const { Badge, Button, Figure, Logo } = DS;

// Constantly optimising — a PSP fee book under signal pressure.
// Two signals are assessed in the loop. Each arrives as a discrete alert, is
// linked to the weighting panel, scored, then linked to the one structure it
// moves. Flags persist; the window closes at the end of the loop.
const W = 1360, H = 812;
const PAD = 64;
const INNER = W - PAD * 2;
const R = 0;                 // Vernier 3: one radius

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

const C = {
  bg: "#FFFFFF",
  text: "#06122A",
  dim: "#48546B",
  label: "#48546B",
  accent: "#2E4BA0",
  tint: "#EEF1FA",
  border: "#E2E5EB",
  borderStrong: "#C9CFD9",
  sunken: "#F7F8FA",
  positive: "#067647",
  negative: "#B3261E",
  series3: "#5B77C4",
  series5: "#C6D1EE"
};

const MONO_XS = { font: "400 11px/1.2 var(--font-mono)", letterSpacing: "0.12em", fontVariantNumeric: "tabular-nums" };
const MONO_SM = { font: "400 13px/1.2 var(--font-mono)", letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" };
const MONO_FIG = { font: "400 15px/1.2 var(--font-mono)", letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" };
const CHIP = { padding: "4px 8px", letterSpacing: "0.1em" };

// ── Geometry, all in design space so the connectors need no measurement ──
const COL_S = 288, COL_W = 248, LINK = 64;
const COL_F = INNER - COL_S - COL_W - LINK * 2;
const X_S = 0, X_W = COL_S + LINK, X_F = COL_S + LINK + COL_W + LINK;
const PIPE_T = 300, COLH = 470;
const HDR = 42, CARD_H = 96, CARD_GAP = 16;
const SIG_Y = (j) => HDR + CARD_GAP + j * (CARD_H + CARD_GAP);
const SIG_MID = (j) => SIG_Y(j) + CARD_H / 2;
const W_COPY_MID = 90;
const W_COMP_MID = 329;
const ROW_H = 78, F_HEAD = 34;
const HIST_T = 276, HIST_H = 52;
const ROW_MID = (i) => HDR + F_HEAD + i * ROW_H + ROW_H / 2;

// ── The book ─────────────────────────────────────────────────────────────
const BOOK = [
  { ref: "PSP-01", name: "Enterprise · blended MDR", vol: 42.0, take: 18.00, marginP: 2.60, txns: 2850 },
  { ref: "PSP-02", name: "Mid-market · interchange++", vol: 18.4, take: 26.00, marginP: 4.10, txns: 980 },
  { ref: "PSP-03", name: "SME · per-transaction", vol: 9.6, take: 34.00, marginP: 5.80, txns: 640 },
  { ref: "PSP-04", name: "Platform · gateway only", vol: 6.2, take: 12.00, marginP: 1.90, txns: 410 },
  { ref: "PSP-05", name: "Cross-border · FX mark-up", vol: 4.8, take: 41.00, marginP: 7.40, txns: 210 }
];

const TXNS = BOOK.reduce((a, r) => a + r.txns, 0);
const REV0 = BOOK.reduce((a, r) => a + r.vol * 1e9 * (r.take / 10000), 0) / 1e6;
const MP0 = BOOK.reduce((a, r) => a + r.txns * r.marginP, 0) / TXNS;

// impact × confidence is the composite; ≥ 0.55 puts the structure up for review.
const SIGNALS = [
  { src: "SCHEME FEES", text: "Scheme fee bulletin · +0.02% cross-border", impact: 0.82, conf: 0.96, exp: 0.48, row: 1, dTake: 0.40, dMargin: 0.06, dIdx: 2, find: "The fee rise can be passed on in full" },
  { src: "COMPETITOR", text: "Enterprise MDR repriced up 3.00bps", impact: 0.74, conf: 0.88, exp: 0.61, row: 0, dTake: 0.60, dMargin: 0.14, dIdx: 3, find: "Room to raise price without losing customers" }
];

const HISTORY = [
  { src: "COST", text: "Gateway hosting −4.10% per txn", word: "APPLIED" },
  { src: "INTERCHANGE", text: "EEA debit cap unchanged", word: "NO ACTION" },
  { src: "COMPETITOR", text: "Gateway-only fee held flat", word: "NO ACTION" }
];

const composite = (s) => s.impact * s.conf;
const REVIEW = 0.55;

// ── Long-term trend, 24 months ───────────────────────────────────────────
const shape = (n, rise, wob, freq) => Array.from({ length: n }, (_, i) => 1 - rise + (rise * i) / (n - 1) + Math.sin(i * freq) * wob);
const scaleTo = (arr, end) => { const f = end / arr[arr.length - 1]; return arr.map((v) => v * f); };
const TREND_MP = scaleTo(shape(24, 0.21, 0.012, 2.3), MP0);

const IDX0 = 24;
const idxBand = (v) => v >= 70 ? { word: "HIGH", tone: "negative", colour: C.negative } : v >= 40 ? { word: "ELEVATED", tone: "caution", colour: "#B54708" } : { word: "LOW", tone: "positive", colour: C.positive };

function Spark({ series, w, h, draw }) {
  const lo = Math.min(...series), hi = Math.max(...series);
  const pad = (hi - lo) * 0.18;
  const y = (v) => h - ((v - (lo - pad)) / (hi + pad - (lo - pad))) * h;
  const x = (i) => (i / (series.length - 1)) * w;
  const d = "M" + series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" L");
  const last = series.length - 1;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      {[0.22, 0.62].map((k, i) => <line key={i} x1="0" y1={h * k} x2={w} y2={h * k} stroke={C.border} strokeWidth="1" />)}
      <path d={d} fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinejoin="miter" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
      <rect x={x(last) - 3} y={y(series[last]) - 3} width="6" height="6" fill={C.accent} opacity={draw > 0.98 ? 1 : 0} />
      <line x1="0" y1={h} x2={w} y2={h} stroke={C.borderStrong} strokeWidth="1" />
    </svg>
  );
}

function Tile({ label, meta, children }) {
  return (
    <div style={{ boxSizing: "border-box", height: 148, border: `1px solid ${C.border}`, borderRadius: R, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, height: 13, flex: "none" }}>
        <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        <span style={{ flex: 1 }} />
        {meta && <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{meta}</span>}
      </div>
      {children}
    </div>
  );
}

function Bar({ label, value, width, colour }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ ...MONO_XS, color: C.label }}>{label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_FIG, color: C.text }}>{value}</span>
      </div>
      <div style={{ height: 4, background: C.border }}>
        <div style={{ height: 4, width: `${clamp(width, 0, 1) * 100}%`, background: colour }} />
      </div>
    </div>
  );
}

function Panel({ label, meta, children }) {
  return (
    <div style={{ height: COLH, boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: R, overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: HDR, boxSizing: "border-box", padding: "0 18px", background: C.sunken, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ flex: 1 }} />
        {meta && <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{meta}</span>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: HDR, bottom: 0 }}>{children}</div>
    </div>
  );
}

function Alert({ s, y, o, live }) {
  return (
    <div style={{
      position: "absolute", left: 18, right: 18, top: y - HDR, height: CARD_H, boxSizing: "border-box",
      border: `1px solid ${live > 0.5 ? C.borderStrong : C.border}`, borderRadius: R, background: C.bg, overflow: "hidden",
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
      opacity: o, transform: `translateY(${(1 - o) * -10}px)`
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ width: 3, height: 11, flex: "none", background: live > 0.5 ? C.accent : C.series5 }} />
        <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{s.src}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_XS, color: C.text }}>{s.conf.toFixed(2)}</span>
      </div>
      <span style={{ font: "400 14px/1.4 var(--font-sans)", color: C.text }}>{s.text}</span>
    </div>
  );
}

// Orthogonal hairline, drawn left to right. Coordinates come from the layout
// constants above, so nothing has to be measured at runtime.
function HistRow({ row }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center", height: HIST_H, boxSizing: "border-box", borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{row.src}</span>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{row.word}</span>
      </div>
      <span style={{ font: "400 13px/1.3 var(--font-sans)", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.text}</span>
    </div>
  );
}

// Orthogonal hairline on whole-pixel coordinates: one square at each end,
// 1px like every other rule in the system, mitred corners, no arrow tail.
function Link({ x1, y1, x2, y2, draw }) {
  const ax = Math.round(x1) + 0.5, ay = Math.round(y1) + 0.5;
  const bx = Math.round(x2) + 0.5, by = Math.round(y2) + 0.5;
  const mid = Math.round(x1 + (x2 - x1) / 2) + 0.5;
  const land = clamp((draw - 0.86) / 0.14, 0, 1);
  return (
    <g opacity={clamp(draw * 6, 0, 1)} shapeRendering="crispEdges">
      <rect x={ax - 2.5} y={ay - 2.5} width="5" height="5" fill={C.accent} />
      <path d={`M${ax},${ay} H${mid} V${by} H${bx}`} fill="none" stroke={C.accent}
            strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter"
            pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
      <rect x={bx - 2.5} y={by - 2.5} width="5" height="5" fill={C.accent} opacity={land} />
    </g>
  );
}

function Row({ row, take, marginP, flag }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, height: ROW_H, boxSizing: "border-box", padding: "0 18px", borderTop: `1px solid ${C.border}`, background: `rgba(238,241,250,${clamp(flag, 0, 1).toFixed(3)})` }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ font: "400 15px/1.3 var(--font-sans)", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
        <span style={{ ...MONO_XS, color: C.label }}>£{row.vol.toFixed(1)}BN PROCESSED</span>
      </div>
      <span style={{ ...MONO_FIG, width: 72, flex: "none", textAlign: "right", color: C.text }}>{take.toFixed(2)}</span>
      <span style={{ ...MONO_FIG, width: 72, flex: "none", textAlign: "right", color: C.text }}>{marginP.toFixed(2)}</span>
      <span style={{ position: "relative", width: 96, height: 22, flex: "none", marginLeft: 40 }}>
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", ...MONO_XS, color: C.label, opacity: 1 - clamp(flag * 1.6, 0, 1) }}>OPTIMISED</span>
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", opacity: clamp((flag - 0.35) / 0.4, 0, 1) }}>
          <Badge tone="accent" style={CHIP}>REVIEW</Badge>
        </span>
      </span>
    </div>
  );
}

function Page() {
  const { T, authoredTotal } = useComposition();
  const total = authoredTotal || 32;

  // The window closes over the last beat, then the loop begins again.
  const close = animate({ from: 0, to: 1, start: total - 1.6, end: total - 0.2, ease: MOTION.enter })(T);
  const k = 1 - close;

  const T0 = [1.0, 13.6];
  const READ = 2.4;
  const ramp = (a, b, ease) => animate({ from: 0, to: 1, start: a, end: b, ease: ease || MOTION.enter })(T);

  const ph = SIGNALS.map((s, j) => {
    const t = T0[j];
    // Focus eases away when the NEXT signal starts being read — never a snap.
    const focus = j === SIGNALS.length - 1 ? 1 : 1 - ramp(T0[j + 1] + 0.2, T0[j + 1] + 1.4);
    return {
      focus,
      card: ramp(t, t + 1.0) * k,
      link1: ramp(t + 1.4, t + 2.6, MOTION.draw) * k * focus,
      read: ramp(t + READ, t + 3.1) * k,
      bar: (i) => ramp(t + 2.8 + 0.5 * i, t + 3.8 + 0.5 * i) * k,
      comp: ramp(t + 5.0, t + 6.2) * k,
      badge: ramp(t + 6.2, t + 6.6) * k,
      link2: ramp(t + 6.6, t + 8.0, MOTION.draw) * k * focus,
      apply: ramp(t + 7.6, t + 9.0, MOTION.draw) * k
    };
  });

  // The panel holds the signal it last read until the next one is being read.
  const shown = T >= T0[1] + READ ? 1 : 0;
  const s = SIGNALS[shown];
  const p = ph[shown];

  const live = BOOK.map((row, i) => {
    let take = row.take, marginP = row.marginP, flag = 0;
    SIGNALS.forEach((sig, j) => {
      if (sig.row !== i) return;
      take += sig.dTake * ph[j].apply;
      marginP += sig.dMargin * ph[j].apply;
      if (composite(sig) >= REVIEW) flag = Math.max(flag, ph[j].apply);
    });
    return { row, take, marginP, flag };
  });

  const rev = live.reduce((a, r) => a + r.row.vol * 1e9 * (r.take / 10000), 0) / 1e6;
  const rev0 = REV0;
  const idx = IDX0 + SIGNALS.reduce((a, sig, j) => a + sig.dIdx * ph[j].apply, 0);
  const ib = idxBand(idx);
  const flagged = live.filter((r) => r.flag > 0.5).length;

  const mpNow = live.reduce((a, r) => a + r.row.txns * r.marginP, 0) / TXNS;
  const trendDraw = ramp(0.3, 2.4, MOTION.draw);

  const clock = (() => {
    const secs = 9 * 3600 + 41 * 60 + 6 + Math.floor(T);
    return `${String(Math.floor(secs / 3600)).padStart(2, "0")}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")} UTC`;
  })();

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      {/* ── Toolbar ── */}
      <div style={{ position: "absolute", left: PAD, top: 48, width: INNER, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo lockup="mark" tone="ink" height={24} />
          <span style={{ width: 1, height: 14, background: C.borderStrong }} />
          <span style={{ ...MONO_XS, color: C.label }}>SECTOR: PAYMENTS</span>
        </div>
        <span style={{ flex: 1 }} />
        <span style={{ ...MONO_SM, color: C.text }}>{clock}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button variant="secondary" size="sm" style={{ borderRadius: R }}>
            <span style={{ ...MONO_XS, color: C.accent }}>AI</span>Ask Vernier
          </Button>
          <Button variant="secondary" size="sm" style={{ borderRadius: R }}>
            <span style={{ ...MONO_XS, color: C.accent }}>+</span>Product / fee type
          </Button>
          <Button variant="secondary" size="sm" style={{ borderRadius: R }}>Account</Button>
        </div>
      </div>

      {/* ── Aggregates ── */}
      <div style={{ position: "absolute", left: PAD, top: 112, width: INNER, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        <Tile label="NET REVENUE, ANNUALISED">
          <Figure value={`£${rev.toFixed(2)}m`} size="lg"
                  delta={`${rev - rev0 >= 0 ? "+" : "−"}${Math.abs(rev - rev0).toFixed(2)}m`}
                  direction={rev - rev0 > 0.005 ? "up" : "flat"} />
        </Tile>

        <Tile label="REVENUE OPPORTUNITIES IDENTIFIED">
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ font: "400 34px/1 var(--font-mono)", color: C.positive, fontVariantNumeric: "tabular-nums" }}>£{(rev - REV0).toFixed(2)}m</span>
            <span style={{ flex: 1 }} />
            <Button variant="primary" size="sm" style={{ borderRadius: R, padding: "6px 12px", font: "400 13px/1 var(--font-sans)" }}>Action</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
            <div style={{ height: 4, background: C.border }}>
              <div style={{ height: 4, width: `${clamp((rev - REV0) / 0.74, 0, 1) * 100}%`, background: C.positive }} />
            </div>
            <span style={{ ...MONO_XS, color: C.label }}>{String(flagged).padStart(2, "0")} PRICES · CONFIDENCE 0.92</span>
          </div>
        </Tile>

        <Tile label="MARGIN PER PAYMENT · P" meta="24 MONTHS">
          <span style={{ font: "400 24px/1 var(--font-mono)", color: C.text, fontVariantNumeric: "tabular-nums" }}>{mpNow.toFixed(2)}</span>
          <Spark series={TREND_MP} w={252} h={44} draw={trendDraw} />
        </Tile>

        <Tile label="ATTRITION RISK" meta="OUT OF 100">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ font: "400 34px/1 var(--font-mono)", color: C.text, fontVariantNumeric: "tabular-nums" }}>{idx.toFixed(0)}</span>
            <Badge tone={ib.tone} style={CHIP}>{ib.word}</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
            <div style={{ position: "relative", height: 4, background: C.border }}>
              <div style={{ height: 4, width: `${clamp(idx / 100, 0, 1) * 100}%`, background: ib.colour }} />
              <span style={{ position: "absolute", left: "40%", top: -3, width: 1, height: 10, background: C.borderStrong }} />
              <span style={{ position: "absolute", left: "70%", top: -3, width: 1, height: 10, background: C.borderStrong }} />
            </div>
            <span style={{ ...MONO_XS, color: C.label }}>LOW &lt; 40 · ELEVATED &lt; 70</span>
          </div>
        </Tile>
      </div>

      {/* ── Pipeline ── */}
      <div style={{ position: "absolute", left: PAD, top: PIPE_T, width: INNER, height: COLH }}>
        <div style={{ position: "absolute", left: X_S, top: 0, width: COL_S }}>
          <Panel label="MARKET SIGNALS" meta={`${String(SIGNALS.filter((x, j) => ph[j].card > 0.05).length).padStart(2, "0")} / 02`}>
            {SIGNALS.map((sig, j) => (
              <Alert key={sig.text} s={sig} y={SIG_Y(j)} o={ph[j].card} live={ph[j].focus} />
            ))}
            <div style={{ position: "absolute", left: 18, right: 18, top: HIST_T - HDR }}>
              <span style={{ ...MONO_XS, color: C.label, display: "block", marginBottom: 10 }}>EARLIER · 8 WEEKS</span>
              {HISTORY.map((h) => <HistRow key={h.text} row={h} />)}
            </div>
          </Panel>
        </div>

        <div style={{ position: "absolute", left: X_W, top: 0, width: COL_W }}>
          <Panel label="ANALYSIS">
            <div style={{ position: "absolute", inset: 0, padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 20, boxSizing: "border-box" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: p.read }}>
                <span style={{ ...MONO_XS, color: C.label }}>{s.src}</span>
                <span style={{ font: "400 14px/1.4 var(--font-sans)", color: C.text, height: 40, overflow: "hidden" }}>{s.text}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Bar label="IMPACT" value={(s.impact * p.bar(0)).toFixed(2)} width={s.impact * p.bar(0)} colour={C.accent} />
                <Bar label="CONFIDENCE" value={(s.conf * p.bar(1)).toFixed(2)} width={s.conf * p.bar(1)} colour={C.series3} />
                <Bar label="EXPOSURE" value={(s.exp * p.bar(2)).toFixed(2)} width={s.exp * p.bar(2)} colour={C.series5} />
              </div>
              <div style={{ height: 1, background: C.border }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ ...MONO_XS, color: C.label }}>PRIORITY SCORE</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ font: "500 34px/1 var(--font-mono)", color: composite(s) * p.comp >= REVIEW ? C.accent : C.text, fontVariantNumeric: "tabular-nums" }}>
                    {(composite(s) * p.comp).toFixed(2)}
                  </span>
                  <span style={{ opacity: p.badge }}><Badge tone="accent" style={CHIP}>REVIEW</Badge></span>
                </div>
                <span style={{ ...MONO_XS, color: C.label }}>REVIEW THRESHOLD 0.55</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: p.badge }}>
                  <span style={{ ...MONO_XS, color: C.positive }}>FINDING</span>
                  <span style={{ font: "400 14px/1.45 var(--font-sans)", color: C.positive, height: 40, overflow: "hidden" }}>{s.find}</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div style={{ position: "absolute", left: X_F, top: 0, width: COL_F }}>
          <Panel label="PORTFOLIO" meta={`${String(flagged).padStart(2, "0")} TO REVIEW`}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, height: F_HEAD, flex: "none", padding: "0 18px" }}>
                <span style={{ ...MONO_XS, flex: 1, minWidth: 0, color: C.label }}>STRUCTURE</span>
                <span style={{ ...MONO_XS, width: 72, flex: "none", textAlign: "right", color: C.label, whiteSpace: "nowrap" }}>NET TAKE</span>
                <span style={{ ...MONO_XS, width: 72, flex: "none", textAlign: "right", color: C.label, whiteSpace: "nowrap" }}>MARGIN P</span>
                <span style={{ ...MONO_XS, width: 96, flex: "none", textAlign: "right", color: C.label, marginLeft: 40 }}>STATUS</span>
              </div>
              {live.map((r) => <Row key={r.row.ref} {...r} />)}
            </div>
          </Panel>
        </div>

        {/* Connectors: latest signal → weighting → the structure it moves */}
        <svg width={INNER} height={COLH} viewBox={`0 0 ${INNER} ${COLH}`} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
          {SIGNALS.map((sig, j) => (
            <React.Fragment key={sig.text}>
              <Link x1={X_S + COL_S} y1={SIG_MID(j)} x2={X_W} y2={W_COPY_MID} draw={ph[j].link1} />
              <Link x1={X_W + COL_W} y1={W_COMP_MID} x2={X_F} y2={ROW_MID(sig.row)} draw={ph[j].link2} />
            </React.Fragment>
          ))}
        </svg>
      </div>

    </div>
  );
}

window.OptimisingPiece = function () {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
        <Page />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak("motionEditor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
};
