const { useComposition, CompositionStage, animate, clamp, Easing } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;

const DS = window.VernierDesignSystem_89b06b || {};
const { Badge, Button, Logo } = DS;

// Constantly optimising — mobile. The concept unchanged: a signal arrives, is
// scored against the review threshold, and moves one fee structure. Everything
// the desktop scene shows alongside that chain (trends, attrition index, the
// three weighting bars, the earlier-signal history) is left to desktop.
const W = 390, H = 676;
const PAD = 24;
const INNER = W - PAD * 2;
const R = 0;                 // Vernier 3: one radius

const MOTION = { enter: Easing.easeOutCubic, draw: Easing.easeInOutQuart };

const C = {
  bg: "#FFFFFF",
  text: "#06122A",
  label: "#48546B",
  accent: "#2E4BA0",
  border: "#E2E5EB",
  borderStrong: "#C9CFD9",
  sunken: "#F7F8FA",
  positive: "#067647"
};

const MONO_XS = { font: "400 11px/1.2 var(--font-mono)", letterSpacing: "0.1em", fontVariantNumeric: "tabular-nums" };
const MONO_SM = { font: "400 12px/1.2 var(--font-mono)", letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" };
const MONO_FIG = { font: "400 14px/1.2 var(--font-mono)", letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" };
const CHIP = { padding: "3px 6px", letterSpacing: "0.1em" };

const BOOK = [
  { ref: "PSP-01", name: "Enterprise · blended MDR", vol: 42.0, take: 18.00 },
  { ref: "PSP-02", name: "Mid-market · interchange++", vol: 18.4, take: 26.00 },
  { ref: "PSP-03", name: "SME · per-transaction", vol: 9.6, take: 34.00 },
  { ref: "PSP-04", name: "Platform · gateway only", vol: 6.2, take: 12.00 },
  { ref: "PSP-05", name: "Cross-border · FX mark-up", vol: 4.8, take: 41.00 }
];

const REV0 = BOOK.reduce((a, r) => a + r.vol * 1e9 * (r.take / 10000), 0) / 1e6;

const SIGNALS = [
  { src: "SCHEME FEES", text: "Scheme fee bulletin · +0.02% cross-border", impact: 0.82, conf: 0.96, row: 1, dTake: 0.40, dIdx: 2, find: "The fee rise can be passed on in full" },
  { src: "COMPETITOR", text: "Enterprise MDR repriced up 3.00bps", impact: 0.74, conf: 0.88, row: 0, dTake: 0.60, dIdx: 3, find: "Room to raise price without losing customers" }
];

const composite = (s) => s.impact * s.conf;
const REVIEW = 0.55;

// ── Vertical geometry, design space, so connectors need no measurement ───
const Y_BAR = 28;
const Y_HEAD = 84;
const Y_SIG = 232, SIG_H = 68;
const Y_ANA = 356, ANA_H = 112;
const Y_BOOK = 524, BOOK_HEAD = 26, ROW_H = 32, MORE_H = 30;
const SHOWN_ROWS = 2;
const LINK_X = 16;

function Eyebrow({ label, meta }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
      <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: C.border }} />
      {meta && <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{meta}</span>}
    </div>
  );
}

function VLink({ y1, y2, draw }) {
  const land = clamp((draw - 0.8) / 0.2, 0, 1);
  return (
    <g opacity={clamp(draw * 6, 0, 1)} shapeRendering="crispEdges">
      <rect x={LINK_X - 2.5} y={Math.round(y1) - 2} width="5" height="5" fill={C.accent} />
      <path d={`M${LINK_X + 0.5},${Math.round(y1) + 0.5} V${Math.round(y2) + 0.5}`} fill="none" stroke={C.accent}
            strokeWidth="1" strokeLinecap="square"
            pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
      <rect x={LINK_X - 2.5} y={Math.round(y2) - 2} width="5" height="5" fill={C.accent} opacity={land} />
    </g>
  );
}

function Row({ row, take, flag }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: ROW_H, boxSizing: "border-box", borderTop: `1px solid ${C.border}`, padding: "0 12px", background: `rgba(238,241,250,${clamp(flag, 0, 1).toFixed(3)})` }}>
      <span style={{ flex: 1, minWidth: 0, font: "400 12px/1.25 var(--font-sans)", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
      <span style={{ ...MONO_FIG, width: 44, flex: "none", textAlign: "right", color: C.text }}>{take.toFixed(2)}</span>
      <span style={{ position: "relative", width: 66, height: 18, flex: "none", marginLeft: 22 }}>
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

  const close = animate({ from: 0, to: 1, start: total - 1.6, end: total - 0.2, ease: MOTION.enter })(T);
  const k = 1 - close;

  const T0 = [1.0, 13.6];
  const READ = 2.4;
  const ramp = (a, b, ease) => animate({ from: 0, to: 1, start: a, end: b, ease: ease || MOTION.enter })(T);

  const ph = SIGNALS.map((s, j) => {
    const t = T0[j];
    const focus = j === SIGNALS.length - 1 ? 1 : 1 - ramp(T0[j + 1] + 0.2, T0[j + 1] + 1.4);
    return {
      focus,
      card: ramp(t, t + 1.0) * k,
      link1: ramp(t + 1.4, t + 2.6, MOTION.draw) * k * focus,
      comp: ramp(t + 3.4, t + 5.2) * k,
      badge: ramp(t + 5.4, t + 5.9) * k,
      link2: ramp(t + 6.0, t + 7.4, MOTION.draw) * k * focus,
      apply: ramp(t + 7.0, t + 8.4, MOTION.draw) * k
    };
  });

  const shown = T >= T0[1] + READ ? 1 : 0;
  const s = SIGNALS[shown];
  const p = ph[shown];

  const live = BOOK.map((row, i) => {
    let take = row.take, flag = 0;
    SIGNALS.forEach((sig, j) => {
      if (sig.row !== i) return;
      take += sig.dTake * ph[j].apply;
      if (composite(sig) >= REVIEW) flag = Math.max(flag, ph[j].apply);
    });
    return { row, take, flag };
  });

  const rev = live.reduce((a, r) => a + r.row.vol * 1e9 * (r.take / 10000), 0) / 1e6;
  const flagged = live.filter((r) => r.flag > 0.5).length;
  const cardO = clamp(p.card, 0, 1);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.bg, overflow: "hidden", fontFamily: "var(--font-sans)" }}>
      <div style={{ position: "absolute", left: PAD, top: Y_BAR, width: INNER, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo lockup="monogram" tone="ink" height={20} />
          <span style={{ width: 1, height: 12, background: C.borderStrong }} />
          <span style={{ ...MONO_XS, color: C.label }}>PAYMENTS</span>
        </div>
        <span style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" style={{ borderRadius: R, padding: "6px 10px", font: "400 12px/1 var(--font-sans)" }}>
          <span style={{ ...MONO_XS, color: C.accent }}>AI</span>Ask Vernier
        </Button>
      </div>

      {/* ── Headline ── */}
      <div style={{ position: "absolute", left: PAD, top: Y_HEAD, width: INNER, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ ...MONO_XS, color: C.label }}>REVENUE OPPORTUNITIES IDENTIFIED</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ font: "400 38px/1 var(--font-mono)", color: C.positive, fontVariantNumeric: "tabular-nums" }}>£{(rev - REV0).toFixed(2)}m</span>
          <span style={{ flex: 1 }} />
          <Button variant="primary" size="sm" style={{ borderRadius: R, padding: "8px 14px", font: "400 13px/1 var(--font-sans)" }}>Action</Button>
        </div>
        <div style={{ height: 4, background: C.border }}>
          <div style={{ height: 4, width: `${clamp((rev - REV0) / 0.74, 0, 1) * 100}%`, background: C.positive }} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{String(flagged).padStart(2, "0")} PRICES TO REVIEW</span>
          <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>· CONFIDENCE 0.92</span>
        </div>
      </div>

      {/* ── Signal ── */}
      <div style={{ position: "absolute", left: PAD, top: Y_SIG - 20, width: INNER }}>
        <Eyebrow label="MARKET SIGNAL" meta={`${String(shown + 1).padStart(2, "0")} / 02`} />
      </div>
      <div style={{
        position: "absolute", left: PAD, top: Y_SIG, width: INNER, height: SIG_H, boxSizing: "border-box",
        border: `1px solid ${C.borderStrong}`, borderRadius: R, padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: 8,
        opacity: cardO, transform: `translateY(${(1 - cardO) * -8}px)`
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ width: 3, height: 10, flex: "none", background: C.accent }} />
          <span style={{ ...MONO_XS, color: C.label, whiteSpace: "nowrap" }}>{s.src}</span>
          <span style={{ flex: 1 }} />
          <span style={{ ...MONO_XS, color: C.text }}>CONF {s.conf.toFixed(2)}</span>
        </div>
        <span style={{ font: "400 13px/1.35 var(--font-sans)", color: C.text }}>{s.text}</span>
      </div>

      {/* ── Analysis ── */}
      <div style={{ position: "absolute", left: PAD, top: Y_ANA - 20, width: INNER }}>
        <Eyebrow label="ANALYSIS" meta="REVIEW THRESHOLD 0.55" />
      </div>
      <div style={{ position: "absolute", left: PAD, top: Y_ANA, width: INNER, height: ANA_H, boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: R, padding: "14px", display: "flex", flexDirection: "column", gap: 10, justifyContent: "space-between" }}>
        <span style={{ ...MONO_XS, color: C.label }}>PRIORITY SCORE</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ font: "400 30px/1 var(--font-mono)", color: composite(s) * p.comp >= REVIEW ? C.accent : C.text, fontVariantNumeric: "tabular-nums" }}>
            {(composite(s) * p.comp).toFixed(2)}
          </span>
          <span style={{ opacity: p.badge }}><Badge tone="accent" style={CHIP}>REVIEW</Badge></span>
        </div>
        <span style={{ font: "400 13px/1.4 var(--font-sans)", color: C.positive, height: 19, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", opacity: p.badge }}>{s.find}</span>
      </div>

      {/* ── Portfolio ── */}
      <div style={{ position: "absolute", left: PAD, top: Y_BOOK - 20, width: INNER }}>
        <Eyebrow label="PORTFOLIO" meta={`${String(flagged).padStart(2, "0")} TO REVIEW`} />
      </div>
      <div style={{ position: "absolute", left: PAD, top: Y_BOOK, width: INNER, boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: R, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: BOOK_HEAD, padding: "0 12px", background: C.sunken, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ ...MONO_XS, flex: 1, minWidth: 0, color: C.label }}>PRICE</span>
          <span style={{ ...MONO_XS, width: 44, flex: "none", textAlign: "right", color: C.label }}>TAKE</span>
          <span style={{ ...MONO_XS, width: 66, flex: "none", textAlign: "right", color: C.label, marginLeft: 22 }}>STATUS</span>
        </div>
        {live.slice(0, SHOWN_ROWS).map((r) => <Row key={r.row.ref} {...r} />)}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: MORE_H, boxSizing: "border-box", padding: "0 12px", borderTop: `1px solid ${C.border}` }}>
          <span style={{ ...MONO_XS, color: C.accent }}>+ {String(BOOK.length - SHOWN_ROWS).padStart(2, "0")} MORE</span>
        </div>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}>
        <g transform={`translate(${PAD},0)`}>
          <VLink y1={Y_SIG + SIG_H} y2={Y_ANA - 28} draw={p.link1} />
          <VLink y1={Y_ANA + ANA_H} y2={Y_BOOK - 28} draw={p.link2} />
        </g>
      </svg>

    </div>
  );
}

window.OptimisingMobilePiece = function () {
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
