const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;
const { useStageFit, bezier } = window.PS;

// ---------------------------------------------------------------------------
// Constantly optimising — mobile. One chain, top to bottom, against the
// toolkit's graduation scale: signal → assessment → price move → record. The
// consequence leads. Ink-reversed mode, licensed for this bookend surface.
//
// Light ramp: ink type on white, slate for supporting copy, the #E2E5EB
// hairline, #2E4BA0 as the one accent — the reading indicator, and the chip
// it fills. Status colour only where it carries a state or a signed delta:
// #067647 on the uplift and the pass, #B3261E on elevated attrition risk.
// #49C4F1 stays in the mark. Motion is addition 05: entrance .16,1,.3,1
// 520ms, counted figure .22,1,.36,1 900ms, opacity and the indicator hop
// .2,0,.2,1 at 120–180ms.
// ---------------------------------------------------------------------------

const W = 390, H = 480;
const PAD = 24;                 // one left edge: rule, hero and divider share it
const RULE_X = PAD;
const TICK = 10;                // graduation, drawn into the gutter
const TEXT_X = PAD + 28;
const INNER = W - TEXT_X - PAD;

const ENTER = bezier(0.16, 1, 0.3, 1), ENTER_MS = 0.52;
const COUNT = bezier(0.22, 1, 0.36, 1), COUNT_MS = 0.9;
const SWAP = bezier(0.2, 0, 0.2, 1), SWAP_MS = 0.18, FADE_MS = 0.12;
const STAGGER = 0.09;           // 90ms base, three to six items

// Each zone states its own top, the height of its first line, and anything
// above that line inside the block. The graduation is derived from those, so
// the tick and the copy it marks cannot drift apart.
const ZONE = [
  { top: 124, lead: 0, line: 16 },    // signal — mono label, 11/16
  { top: 176, lead: 0, line: 22 },    // assessment — "Scored on 3 inputs", 15/22
  { top: 312, lead: 0, line: 16 },    // price move — mono ref label, 11/16
  { top: 408, lead: 13, line: 18 }    // record — 1px rule + 12px padding, 13/18
];
const NODE = ZONE.map((z) => z.top + z.lead + z.line / 2);
const RULE_TOP = 118, RULE_BOT = 455;

const BEATS = [
  {
    src: "SCHEME FEES", at: "09:41 UTC",
    text: "Scheme fee bulletin · +0.02% cross-border",
    rows: [
      { l: "Impact", v: "0.82", s: "HIGH" },
      { l: "Confidence", v: "0.96", s: "HIGH" },
      { l: "Attrition risk", v: "18", s: "LOW", tone: "var(--positive)" }
    ],
    find: "Full pass-through supported · attrition risk low",
    ref: "PSP-02 · MID-MARKET · INTERCHANGE++",
    from: "26.00", to: "26.40", delta: "+0.40bps",
    uplift: 0.74,
    audit: ["PSP-02 · repriced 09:41 UTC", "antitrust scan PASS"]
  },
  {
    src: "COMPETITOR", at: "09:47 UTC",
    text: "Enterprise MDR repriced up 3.00bps",
    rows: [
      { l: "Impact", v: "0.74", s: "HIGH" },
      { l: "Confidence", v: "0.88", s: "HIGH" },
      { l: "Attrition risk", v: "46", s: "ELEVATED", tone: "var(--negative)" }
    ],
    find: "Move sized down · attrition risk elevated",
    ref: "PSP-01 · ENTERPRISE · BLENDED MDR",
    from: "18.00", to: "18.30", delta: "+0.30bps",
    uplift: 2.00,
    audit: ["PSP-01 · repriced 09:47 UTC", "antitrust scan PASS"]
  }
];

const MONO = { fontVariantNumeric: "tabular-nums" };
const LABEL = { ...MONO, font: "var(--type-label)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" };
const DATA = { ...MONO, font: "var(--type-data)", letterSpacing: "var(--tracking-mono)" };
const TEXT = { font: "var(--type-ui-sm)" };
const PAST = 0.58;

const HOPS = [
  { t: 1.0, to: 0 }, { t: 2.0, to: 1 }, { t: 4.2, to: 2 }, { t: 5.4, to: 3 },
  { t: 7.0, to: 0 }, { t: 8.0, to: 1 }, { t: 10.2, to: 2 }, { t: 11.4, to: 3 }
];

function Scene({ tw }) {
  const { T } = useComposition();
  useStageFit(W, H);

  const reduced = tw.poster ||
    (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const t = reduced ? 11.9 : T;

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(t);
  const fade = (start) => at(start, FADE_MS, SWAP);

  const b = t >= 7 ? 1 : 0;
  const B = b ? 7 : 1;
  const beat = BEATS[b];

  // the reading indicator, hopping the scale
  let markY = NODE[0], prev = NODE[0];
  for (const h of HOPS) {
    if (t < h.t) break;
    markY = prev + (NODE[h.to] - prev) * SWAP(clamp((t - h.t) / SWAP_MS, 0, 1));
    if (t >= h.t + SWAP_MS) prev = NODE[h.to];
  }
  const markOn = t >= 1;
  const zone = HOPS.reduce((z, h) => (t >= h.t ? h.to : z), -1);
  const weight = (i) => (zone === i ? 1 : PAST);

  const ruleIn = at(0.2, 0.64, ENTER);           // rule wipe
  const heroIn = at(0.1, ENTER_MS, ENTER);
  const sigIn = fade(B);
  const rowIn = (i) => fade(B + 1.1 + i * STAGGER);
  const findIn = fade(B + 1.6);
  const priceIn = fade(B + 3.2);
  const auditIn = fade(B + 4.4);

  const settled = BEATS.reduce(
    (a, x, i) => a + (x.uplift - (i ? BEATS[i - 1].uplift : 0)) * at((i ? 7 : 1) + 3.2, COUNT_MS, COUNT), 0
  );

  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--surface)", overflow: "hidden",
      fontFamily: "var(--font-sans)", color: "var(--ink)"
    }}>
      {/* the consequence, leading */}
      <div style={{ position: "absolute", left: PAD, top: 24, width: W - PAD * 2, opacity: heroIn }}>
        <div style={{ ...LABEL, color: "var(--ink-secondary)" }}>Annualised uplift identified</div>
        <div style={{ ...MONO, marginTop: 8, font: "var(--type-figure-lg)", color: "var(--positive)" }}>
          +£{settled.toFixed(2)}m
        </div>
      </div>

      <div style={{
        position: "absolute", left: PAD, top: 108, width: (W - PAD * 2) * ruleIn,
        height: 1, background: "var(--border)"
      }} />

      {/* the scale */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={RULE_X + 0.5} y1={RULE_TOP} x2={RULE_X + 0.5} y2={RULE_TOP + (RULE_BOT - RULE_TOP) * ruleIn}
          stroke="var(--border)" strokeWidth="1" />
        {NODE.map((y, i) => (
          <line key={i} x1={RULE_X + 0.5} y1={y + 0.5} x2={RULE_X + 0.5 + TICK} y2={y + 0.5}
            stroke="var(--ink-secondary)" strokeWidth="1"
            opacity={ruleIn * (zone >= i ? 1 : 0.45)} />
        ))}
        {markOn ? (
          <rect x={RULE_X - 5.5} y={markY - 1} width={26} height={2} fill="var(--accent)" />
        ) : null}
      </svg>

      {/* signal */}
      <div style={{ position: "absolute", left: TEXT_X, top: ZONE[0].top, width: INNER, opacity: sigIn * weight(0) }}>
        <div style={{ ...LABEL, color: "var(--ink-secondary)" }}>{beat.src} · {beat.at}</div>
        <div style={{ ...TEXT, marginTop: 6, color: "var(--ink)" }}>{beat.text}</div>
      </div>

      {/* assessment */}
      <div style={{ position: "absolute", left: TEXT_X, top: ZONE[1].top, width: INNER, opacity: weight(1) }}>
        <div style={{ font: "var(--type-ui-md)", opacity: rowIn(0) }}>Scored on 3 inputs</div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {beat.rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, opacity: rowIn(i) }}>
              <span style={{ ...TEXT, flex: 1, minWidth: 0, color: "var(--ink-secondary)" }}>{r.l}</span>
              <span style={{ ...DATA, color: "var(--ink)" }}>{r.v}</span>
              <span style={{ ...LABEL, width: 76, flex: "none", textAlign: "right", color: r.tone || "var(--ink)" }}>{r.s}</span>
            </div>
          ))}
        </div>
        <div style={{ ...TEXT, marginTop: 10, color: "var(--ink-secondary)", opacity: findIn }}>{beat.find}</div>
      </div>

      {/* price move — the dominant element */}
      <div style={{ position: "absolute", left: TEXT_X, top: ZONE[2].top, width: INNER, opacity: priceIn * weight(2) }}>
        <div style={{ ...LABEL, color: "var(--ink-secondary)" }}>{beat.ref}</div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ ...MONO, font: "var(--type-figure-sm)", color: "var(--ink)" }}>
            {beat.from}
            <span style={{ color: "var(--ink-secondary)", padding: "0 5px" }}>→</span>
            {beat.to}
            <span style={{ font: "var(--type-data)", color: "var(--ink-secondary)" }}>bps</span>
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ ...DATA, color: "var(--positive)" }}>{beat.delta}</span>
        </div>
        <div style={{ marginTop: 10, display: "flex" }}>
          <span style={{
            ...LABEL, padding: "4px 8px",
            background: "var(--accent)", color: "var(--white)"
          }}>Review</span>
        </div>
      </div>

      {/* record */}
      <div style={{
        position: "absolute", left: TEXT_X, top: ZONE[3].top, width: INNER,
        borderTop: "1px solid var(--border)", paddingTop: 12,
        display: "flex", flexDirection: "column", gap: 2, opacity: auditIn * PAST
      }}>
        {beat.audit.map((line, i) => (
          <span key={i} style={{
            ...DATA, color: "var(--ink-secondary)", whiteSpace: "nowrap"
          }}>{line}</span>
        ))}
      </div>
    </div>
  );
}

window.ConstantlyOptimisingMobilePiece = function () {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#FFFFFF">
        <Scene tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Playback" />
        <TweakToggle label="Poster frame (reduced motion)" value={tw.poster} onChange={(v) => setTweak("poster", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
};
