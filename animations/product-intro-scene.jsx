const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle } = window;
const {
  HAIR, useStageFit, REVEAL, REVEAL_MS, TRAVEL, STAGGER, COUNT, SPRING,
  TYPE, TRACK, C, fmt1
} = window.PS;

const W = 1200, H = 620;

// ---------------------------------------------------------------------------
// Product page opener. Not a workflow — an instrument drawing. The subject is
// drawn the way a machined part is drawn: datum, outline, centre line,
// graduations, then a dimension chain that states the overall figure and the
// one segment that matters. It draws itself once and then holds, so the page
// it opens is a finished drawing rather than a running animation.
// ---------------------------------------------------------------------------

const PART = { x: 220, y: 236, w: 760, h: 196 };
const R = PART.x + PART.w, B = PART.y + PART.h, MIDY = PART.y + PART.h / 2;
const BREAK = PART.x + PART.w * 0.69;          // where the measured segment starts

const DIM_SEG = 496;                            // near dimension: the segment
const DIM_ALL = 556;                            // far dimension: the whole
const TICKS = 20;
const RULER = "#3E4756";

const LIST = 100.0;                             // overall, index points
const SEG = 31.0;                               // the measured segment, basis points

function arrow(x, y, dir) {
  const d = 11 * dir, h = 4.5;
  return `M${x} ${y} L${x + d} ${y - h} L${x + d} ${y + h} Z`;
}

function Intro({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const t = TYPE(false);
  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  const datum = at(CUES.Datum + 0.1, 0.7, REVEAL);
  const stamp = at(CUES.Datum + 0.5, 0.5, REVEAL);

  const outline = at(CUES.Outline + 0.05, 1.1, REVEAL);
  const centre = at(CUES.Outline + 0.75, REVEAL_MS, REVEAL);
  const tick = (i) => at(CUES.Outline + 0.85 + i * (STAGGER * 0.22), 0.3, REVEAL);

  const brk = at(CUES.Dimension + 0.05, REVEAL_MS, REVEAL);
  const tint = at(CUES.Dimension + 0.2, 0.6, REVEAL);
  const ext = at(CUES.Dimension + 0.3, REVEAL_MS, REVEAL);
  const dimSeg = at(CUES.Dimension + 0.55, 0.6, REVEAL);
  const dimAll = at(CUES.Dimension + 0.8, 0.7, REVEAL);
  const figSeg = at(CUES.Dimension + 0.7, 0.9, COUNT);
  const figAll = at(CUES.Dimension + 0.95, 0.9, COUNT);

  const tol = at(CUES.Read + 0.15, REVEAL_MS, REVEAL);
  const lock = at(CUES.Read + 0.5, 0.56, SPRING);
  const block = at(CUES.Read + 0.3, REVEAL_MS, REVEAL);

  const PERIM = (PART.w + PART.h) * 2;
  const SEG_W = R - BREAK;

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)"
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* datum */}
        <line x1={PART.x} y1={PART.y - 62} x2={PART.x} y2={DIM_ALL + 30}
          stroke={C.rule25} strokeWidth={HAIR}
          strokeDasharray={PART.h + 210} strokeDashoffset={(PART.h + 210) * (1 - datum)} />
        <path d={`M${PART.x} ${B} L${PART.x - 9} ${B + 17} L${PART.x + 9} ${B + 17} Z`}
          fill={C.ink} opacity={stamp} />

        {/* the measured segment, tinted before it is dimensioned */}
        <rect x={BREAK} y={PART.y} width={SEG_W * tint} height={PART.h} fill={C.tint} />

        {/* outline, drawing itself clockwise from the top left */}
        <path
          d={`M${PART.x} ${PART.y} L${R} ${PART.y} L${R} ${B} L${PART.x} ${B} Z`}
          fill="none" stroke={C.ink} strokeWidth={HAIR * 1.5}
          strokeLinejoin="miter" strokeDasharray={PERIM}
          strokeDashoffset={PERIM * (1 - outline)} />

        {/* centre line, dash-dot, running past the part on both sides */}
        <line x1={PART.x - 34} y1={MIDY} x2={R + 34} y2={MIDY}
          stroke={C.rule25} strokeWidth={HAIR} strokeDasharray="22 6 3 6"
          opacity={centre * 0.9} />

        {/* graduations along the top edge — the instrument's own scale */}
        {Array.from({ length: TICKS + 1 }).map((_, i) => {
          const x = PART.x + (i / TICKS) * PART.w;
          const major = i % 5 === 0;
          return (
            <line key={i} x1={x} y1={PART.y} x2={x} y2={PART.y + (major ? 22 : 12)}
              stroke={major ? RULER : C.rule25} strokeWidth={HAIR} opacity={tick(i)} />
          );
        })}

        {/* the break: where the segment begins */}
        <line x1={BREAK} y1={PART.y} x2={BREAK} y2={B}
          stroke={C.signal} strokeWidth={HAIR * 1.5}
          strokeDasharray={PART.h} strokeDashoffset={PART.h * (1 - brk)} />

        {/* extension lines */}
        {[PART.x, BREAK, R].map((x, i) => (
          <line key={"e" + i} x1={x} y1={B + 8} x2={x} y2={(x === BREAK ? DIM_SEG : DIM_ALL) + 22}
            stroke={C.rule25} strokeWidth={HAIR} opacity={ext} />
        ))}
        <line x1={R} y1={B + 8} x2={R} y2={DIM_SEG + 22} stroke={C.rule25} strokeWidth={HAIR} opacity={ext} />

        {/* near dimension — the measured segment, in accent */}
        <g opacity={dimSeg > 0.02 ? 1 : 0}>
          <line x1={BREAK} y1={DIM_SEG} x2={BREAK + SEG_W * dimSeg} y2={DIM_SEG}
            stroke={C.signal} strokeWidth={HAIR * 1.5} />
          <path d={arrow(BREAK, DIM_SEG, 1)} fill={C.signal} opacity={dimSeg} />
          <path d={arrow(R, DIM_SEG, -1)} fill={C.signal} opacity={clamp(dimSeg * 4 - 3, 0, 1)} />
        </g>

        {/* far dimension — the whole */}
        <g opacity={dimAll > 0.02 ? 1 : 0}>
          <line x1={PART.x} y1={DIM_ALL} x2={PART.x + PART.w * dimAll} y2={DIM_ALL}
            stroke={RULER} strokeWidth={HAIR * 1.5} />
          <path d={arrow(PART.x, DIM_ALL, 1)} fill={RULER} opacity={dimAll} />
          <path d={arrow(R, DIM_ALL, -1)} fill={RULER} opacity={clamp(dimAll * 4 - 3, 0, 1)} />
        </g>

        {/* tolerance leader off the segment */}
        <g opacity={tol}>
          <line x1={BREAK + SEG_W / 2} y1={PART.y - 10} x2={BREAK + SEG_W / 2 + 54} y2={PART.y - 64}
            stroke={C.rule25} strokeWidth={HAIR} />
          <line x1={BREAK + SEG_W / 2 + 54} y1={PART.y - 64} x2={BREAK + SEG_W / 2 + 150} y2={PART.y - 64}
            stroke={C.rule25} strokeWidth={HAIR} />
        </g>

        {tw.lockMark ? (
          <rect x={BREAK - 6} y={MIDY - 6} width={12} height={12} fill={C.signal}
            opacity={clamp(lock * 4, 0, 1)}
            transform={`translate(${BREAK} ${MIDY}) scale(${clamp(lock, 0, 1.04)}) translate(${-BREAK} ${-MIDY})`} />
        ) : null}
      </svg>

      {/* figures */}
      <div style={{
        position: "absolute", left: BREAK, top: DIM_SEG - 62, width: SEG_W,
        textAlign: "center", opacity: clamp(figSeg * 3, 0, 1)
      }}>
        <div style={{ font: t.micro, letterSpacing: TRACK, color: C.signal }}>HEADROOM</div>
        <div style={{
          marginTop: 8, font: t.fig, color: C.signal, fontVariantNumeric: "tabular-nums"
        }}>+{fmt1(SEG * figSeg)} BP</div>
      </div>

      <div style={{
        position: "absolute", left: PART.x, top: DIM_ALL - 34, width: PART.w,
        textAlign: "center", opacity: clamp(figAll * 3, 0, 1),
        font: t.micro, letterSpacing: TRACK, color: C.slate, fontVariantNumeric: "tabular-nums"
      }}>LIST {fmt1(LIST * figAll)}</div>

      <div style={{
        position: "absolute", left: BREAK + (R - BREAK) / 2 + 160, top: PART.y - 76,
        opacity: tol, font: t.micro, letterSpacing: TRACK, color: C.label,
        whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"
      }}>TOL ±0.02</div>

      {/* title block, bottom left */}
      <div style={{
        position: "absolute", left: PART.x, top: H - 52, width: 560,
        borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 16,
        display: "flex", gap: 32, opacity: block,
        transform: `translateY(${(1 - block) * TRAVEL}px)`,
        font: t.micro, letterSpacing: TRACK, color: C.label
      }}>
        <span>ORTHOGRAPHIC</span>
        <span>SCALE 1:1</span>
        <span>UNITS BP</span>
      </div>
    </div>
  );
}

function IntroPiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <Intro tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Drawing" />
        <TweakToggle label="Lock mark on the break" value={tw.lockMark} onChange={(v) => setTweak("lockMark", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.IntroPiece = IntroPiece;
