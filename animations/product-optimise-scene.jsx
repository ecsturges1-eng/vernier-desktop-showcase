const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider } = window;
const {
  HAIR, useCompact, useStageFit, REVEAL, REVEAL_MS, TRAVEL,
  SPRING, TYPE, TRACK, C, loopFade, fmt1
} = window.PS;

const W = 1200, H = 760;

// ---------------------------------------------------------------------------
// 03 — A reasoned number, ready for review. A vernier caliper reading.
//
// The main scale is graduated every £2.00. The sub-scale carries ten divisions
// across nine of those, so its divisions fall £1.80 apart — a real vernier.
// The reading is £118.40: the main scale gives 118, and division 2 of the
// sub-scale is the one that lines up with a main graduation, which is what
// supplies the .40. Nothing here is decorative — the alignment is computed,
// and the figures are interpolated from the same zoom clock as the scales, so
// the number refines because the instrument closed in on it.
// ---------------------------------------------------------------------------

const PX = 80, PW = 1040;
const MAIN_Y = 300;                      // main scale baseline, ticks rise from it
const SUB_Y = 340;                       // sub-scale body, ticks fall from its top
const SUB_H = 64;

const TARGET = 118.40;                   // the reading
const MAIN_STEP = 2.0;                   // main scale graduation
const DIVS = 10;                         // sub-scale divisions
const SUB_STEP = MAIN_STEP * (DIVS - 1) / DIVS;   // 1.80 — nine mains over ten divisions
const MAIN_FLOOR = Math.floor(TARGET / MAIN_STEP) * MAIN_STEP;     // 118
const FRACTION = TARGET - MAIN_FLOOR;                              // 0.40
// the division that lands on a main graduation — the reading's working
const ALIGNED = Math.round(FRACTION / (MAIN_STEP / DIVS));         // 2

const WIDE_SPAN = 120, WIDE_CENTRE = 120;
const LIST = 113.85;                     // current list price — the reading is +400bp on this

function Optimise({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  const t = TYPE(compact);

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  // ---- the instrument arriving -------------------------------------------
  const beam = at(CUES.Distribution + 0.1, 0.9, REVEAL);
  const labels = at(CUES.Distribution + 0.5, REVEAL_MS, REVEAL);
  const pointer = at(CUES.Distribution + 0.9, REVEAL_MS, REVEAL);

  // ---- the push-in, and the release back to the wide view at the seam ----
  const zoomIn = at(CUES.Position, 2.1, REVEAL);
  const zoomOut = at(authoredTotal - 1.1, 0.7, REVEAL);
  const ez = clamp(zoomIn - zoomOut, 0, 1);

  // Exponential, so the travel is mechanical rather than a linear stretch. The
  // pointer also slides from the middle of the plot toward the left third, so
  // the whole ten-division sub-scale has room to the right of its zero — the
  // way the sliding jaw carries its scale on a real caliper.
  const span = WIDE_SPAN * Math.pow(tw.depth / WIDE_SPAN, ez);
  const centre = WIDE_CENTRE + (TARGET - WIDE_CENTRE) * ez;
  const anchor = 0.5 - 0.28 * ez;
  const x = (p) => PX + anchor * PW + ((p - centre) / span) * PW;

  const subIn = clamp(at(CUES.Position + 0.25, 0.6, REVEAL) - zoomOut, 0, 1);
  const divIn = (k) => clamp(at(CUES.Position + 0.4 + k * 0.055, 0.4, REVEAL) - zoomOut, 0, 1);
  const lock = clamp(at(CUES.Headroom + 0.3, 0.56, SPRING) - zoomOut, 0, 1);

  // ---- figures, interpolated on the zoom clock ---------------------------
  const price = MAIN_FLOOR + FRACTION * ez;
  const bps = (price / LIST - 1) * 10000;
  const conf = 0.71 + 0.25 * ez;
  const delta = 2.40 + 0.78 * ez;
  const risk = clamp(at(CUES.Headroom, REVEAL_MS, REVEAL) - zoomOut, 0, 1);

  const seal = clamp(at(CUES.Deliver + 0.3, 0.56, SPRING) - zoomOut * 1.6, 0, 1);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.45);

  // ---- main scale graduations, wiping left to right on arrival -----------
  const lo = centre - span * anchor * 1.05, hi = centre + span * (1 - anchor) * 1.05;
  const mains = [];
  const first = Math.ceil(lo / MAIN_STEP) * MAIN_STEP;
  for (let p = first; p <= hi; p += MAIN_STEP) {
    const px = x(p);
    if (px < PX || px > PX + PW) continue;
    const major = Math.abs(p % 10) < 1e-6;
    const nx = (px - PX) / PW;
    mains.push({ p, px, major, on: clamp((beam * 1.15 - nx) * 6, 0, 1) });
  }

  const divs = Array.from({ length: DIVS + 1 }).map((_, k) => {
    const p = TARGET + k * SUB_STEP;
    const px = x(p);
    return {
      k, p, px, aligned: k === ALIGNED,
      on: divIn(k) * (px < PX - 10 || px > PX + PW + 10 ? 0 : 1)
    };
  });

  const CELLS = [
    {
      l: "RECOMMENDED PRICE",
      v: "£" + price.toFixed(2),
      c: C.ink, hero: true,
      note: ez > 0.02 ? "MAIN " + MAIN_FLOOR.toFixed(0) + " + VERNIER " + FRACTION.toFixed(2) : "APPROXIMATE"
    },
    { l: "UPLIFT", v: "+" + Math.round(bps) + " BP", c: C.ink, note: "VS LIST £" + LIST.toFixed(2) },
    { l: "CONFIDENCE", v: conf.toFixed(2), c: C.ink, note: "N = 18 OBSERVATIONS" },
    {
      l: "REVENUE IMPACT", v: "+£" + delta.toFixed(2) + "M", c: C.pos,
      note: "IF UNCHANGED −£1.90M", noteC: C.neg, noteO: risk
    }
  ];

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)", opacity: fade
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* main scale beam */}
        <line x1={PX} y1={MAIN_Y} x2={PX + PW} y2={MAIN_Y}
          stroke={C.ink} strokeWidth={HAIR * 1.5}
          strokeDasharray={PW} strokeDashoffset={PW * (1 - beam)} />

        {mains.map((m, i) => {
          const len = m.major ? 34 : 20;
          const near = Math.abs(m.px - x(TARGET)) < 3;
          return (
            <line key={"m" + i} x1={m.px} y1={MAIN_Y} x2={m.px} y2={MAIN_Y - len}
              stroke={near ? C.signal : m.major ? C.ink : C.rule25}
              strokeWidth={m.major ? HAIR * 1.5 : HAIR} opacity={m.on} />
          );
        })}

        {/* sub-scale body — the sliding jaw's scale */}
        <g opacity={subIn}>
          <line x1={x(TARGET) - 26} y1={SUB_Y} x2={x(TARGET + DIVS * SUB_STEP) + 26} y2={SUB_Y}
            stroke={C.rule25} strokeWidth={HAIR} />
          <line x1={x(TARGET) - 26} y1={SUB_Y} x2={x(TARGET) - 26} y2={SUB_Y + SUB_H}
            stroke={C.rule25} strokeWidth={HAIR} />
          <line x1={x(TARGET + DIVS * SUB_STEP) + 26} y1={SUB_Y}
            x2={x(TARGET + DIVS * SUB_STEP) + 26} y2={SUB_Y + SUB_H}
            stroke={C.rule25} strokeWidth={HAIR} />
          <line x1={x(TARGET) - 26} y1={SUB_Y + SUB_H} x2={x(TARGET + DIVS * SUB_STEP) + 26} y2={SUB_Y + SUB_H}
            stroke={C.rule15} strokeWidth={HAIR} />
        </g>

        {divs.map((d) => {
          const on = d.on * subIn;
          const hot = d.aligned ? lock : 0;
          const len = 18 + (d.aligned ? 10 * hot : 0);
          return (
            <line key={"d" + d.k} x1={d.px} y1={SUB_Y} x2={d.px} y2={SUB_Y + len}
              stroke={d.aligned && hot > 0.05 ? C.signal : C.slate}
              strokeWidth={d.aligned && hot > 0.05 ? HAIR * 2 : HAIR} opacity={on} />
          );
        })}

        {/* the aligned division, carried up through the main scale */}
        {lock > 0.02 ? (
          <line x1={divs[ALIGNED].px} y1={MAIN_Y - 34} x2={divs[ALIGNED].px} y2={SUB_Y + 28}
            stroke={C.signal} strokeWidth={HAIR} opacity={lock * 0.55}
            strokeDasharray="6 6" />
        ) : null}

        {/* pointer: the reading itself, the one accent-blue indicator */}
        <g opacity={pointer}>
          <line x1={x(TARGET)} y1={MAIN_Y - 74} x2={x(TARGET)} y2={SUB_Y + SUB_H + 10}
            stroke={C.signal} strokeWidth={HAIR * 2} />
          <rect x={x(TARGET) - 7} y={MAIN_Y - 88} width={14} height={14} fill={C.signal} />
        </g>
      </svg>

      {/* main scale numerals */}
      {mains.filter((m) => m.major).map((m, i) => (
        <div key={"l" + i} style={{
          position: "absolute", left: m.px - 50, top: MAIN_Y - 128, width: 100, textAlign: "center",
          font: t.micro, letterSpacing: TRACK, color: C.label,
          opacity: labels * m.on, whiteSpace: "nowrap"
        }}>{m.p.toFixed(0)}</div>
      ))}

      {/* sub-scale numerals */}
      {divs.map((d) => (
        <div key={"dl" + d.k} style={{
          position: "absolute", left: d.px - 15, top: SUB_Y + 34, width: 30, textAlign: "center",
          font: t.micro, letterSpacing: TRACK,
          color: d.aligned && lock > 0.05 ? C.signal : C.label,
          opacity: d.on * subIn, whiteSpace: "nowrap"
        }}>{d.k}</div>
      ))}

      <div style={{
        position: "absolute", left: PX, top: 92, width: PW,
        display: "flex", alignItems: "baseline", gap: 24,
        font: t.micro, letterSpacing: TRACK, color: C.label, opacity: labels
      }}>
        <span style={{ whiteSpace: "nowrap" }}>PRICE SCALE · £ PER UNIT</span>
        <span style={{ flex: 1 }} />
        <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>SPAN £{fmt1(span)}</span>
        <span style={{
          whiteSpace: "nowrap", color: lock > 0.05 ? C.signal : C.label,
          opacity: clamp(subIn * 1.2, 0, 1)
        }}>DIVISION {ALIGNED} ALIGNS</span>
      </div>

      {/* the reading, and the working that produced it */}
      <div style={{
        position: "absolute", left: PX, top: 476, width: PW, display: "flex", gap: 28
      }}>
        {CELLS.map((cell, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 0,
            borderTop: `${HAIR}px solid ${i === 0 ? C.rule25 : C.rule15}`,
            paddingTop: 22, display: "flex", flexDirection: "column", gap: 14,
            opacity: labels, transform: `translateY(${(1 - labels) * TRAVEL}px)`
          }}>
            <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label, whiteSpace: "nowrap" }}>{cell.l}</span>
            <span style={{
              font: cell.hero ? t.hero : t.fig, color: cell.c,
              fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"
            }}>{cell.v}</span>
            <span style={{
              font: t.micro, letterSpacing: TRACK,
              color: cell.noteC || C.label, whiteSpace: "nowrap",
              opacity: cell.noteO == null ? 1 : cell.noteO
            }}>{cell.note}</span>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute", left: PX, top: 692, width: PW,
        borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 16,
        display: "flex", alignItems: "center", gap: 12,
        opacity: clamp(seal * 2, 0, 1)
      }}>
        <span style={{ flex: "none", width: 18, height: 18, background: C.signal, transform: `scale(${seal})` }} />
        <span style={{ font: t.micro, letterSpacing: TRACK, color: C.ink, whiteSpace: "nowrap" }}>READY FOR REVIEW</span>
        <span style={{ flex: 1 }} />
        {compact ? null : (
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label, whiteSpace: "nowrap" }}>
            SUB-SCALE RETAINED AS WORKING
          </span>
        )}
      </div>
    </div>
  );
}

function OptimisePlotPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <Optimise tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Caliper" />
        <TweakSlider label="Zoom depth" value={tw.depth} min={12} max={48} step={4} unit=" £span" onChange={(v) => setTweak("depth", v)} />
        <TweakSection label="Loop" />
        <TweakSlider label="Cross-fade floor" value={tw.loopFloor} min={0} max={0.5} step={0.05} onChange={(v) => setTweak("loopFloor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.OptimisePlotPiece = OptimisePlotPiece;
