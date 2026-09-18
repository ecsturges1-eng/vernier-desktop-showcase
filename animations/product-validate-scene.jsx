const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider } = window;
const {
  HAIR, useCompact, useStageFit, REVEAL, REVEAL_MS, TRAVEL,
  COUNT, SPRING, TYPE, TRACK, C, loopFade, fmt1, polyD, polyLen
} = window.PS;

const W = 1200, H = 760;

// ---------------------------------------------------------------------------
// 05 — Did it work. A rising confidence curve rather than a box of rows: the
// forecast published at cutover as a dashed line, realised revenue drawing
// over it, and the confidence band closing around the curve as each week
// lands. Every week that arrives is the cause; the confidence figure and the
// band's width are the effect, 200ms behind it.
// ---------------------------------------------------------------------------

const PLOT = { x: 80, y: 150, w: 780, h: 340 };
const BASE = PLOT.y + PLOT.h;
const LO = 95, HI = 136;
const VAR = { y: 552, h: 120, zero: 612 };
const READ_X = 916, READ_W = 244;

const FORECAST = [100, 104, 108, 112, 116, 120, 124, 128];
const ACTUAL = [99, 105, 110, 113, 118, 123, 126, 131];
const N = FORECAST.length;

const px = (i) => PLOT.x + (i / (N - 1)) * PLOT.w;
const py = (v) => BASE - ((v - LO) / (HI - LO)) * PLOT.h;

const F_PTS = FORECAST.map((v, i) => [px(i), py(v)]);
const A_PTS = ACTUAL.map((v, i) => [px(i), py(v)]);
const F_D = polyD(F_PTS), F_LEN = polyLen(F_PTS);
const A_D = polyD(A_PTS), A_LEN = polyLen(A_PTS);

function Validate({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const compact = useCompact(W);
  const t = TYPE(compact);

  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);

  const frame = at(CUES.Forecast + 0.05, REVEAL_MS, REVEAL);
  const fcast = at(CUES.Forecast + 0.4, 0.9, REVEAL);

  // cause: a week of realised revenue lands
  const week = (i) => at(CUES.Actual + i * 0.26, 0.4, COUNT);
  // effect: confidence takes it, 200ms later
  const taken = (i) => at(CUES.Actual + i * 0.26 + 0.2, 0.4, COUNT);

  const drawn = week(0) > 0 ? A_PTS.reduce((a, p, i) => a + week(i), 0) / N : 0;
  const conviction = A_PTS.reduce((a, p, i) => a + taken(i), 0) / N;
  const landed = A_PTS.reduce((a, p, i) => a + (week(i) > 0.995 ? 1 : 0), 0);

  const conf = 0.62 + 0.34 * conviction;
  const meanVar = landed
    ? ACTUAL.slice(0, landed).reduce((a, v, i) => a + (v - FORECAST[i]) / FORECAST[i], 0) / landed * 100
    : 0;

  // the band closes as conviction rises: ±7 index points down to ±1.4
  const hw = 7 - 5.6 * conviction;
  const BAND = A_PTS.map((p, i) => [p[0], py(ACTUAL[i] + hw)])
    .concat(A_PTS.map((p, i) => [p[0], py(ACTUAL[i] - hw)]).reverse());

  const vbar = (i) => at(CUES.Variance + i * 0.18, 0.4, REVEAL);
  const seal = at(CUES.Confirm + 0.3, 0.56, SPRING);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.7);

  return (
    <div style={{
      position: "absolute", inset: 0, background: C.paper, overflow: "hidden",
      fontFamily: "var(--font-sans)", opacity: fade
    }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* week gridlines and baseline */}
        {Array.from({ length: N }).map((_, i) => (
          <line key={"g" + i} x1={px(i)} y1={PLOT.y} x2={px(i)} y2={BASE}
            stroke={C.rule15} strokeWidth={HAIR} opacity={frame * 0.9} />
        ))}
        <line x1={PLOT.x} y1={BASE} x2={PLOT.x + PLOT.w} y2={BASE}
          stroke={C.rule25} strokeWidth={HAIR}
          strokeDasharray={PLOT.w} strokeDashoffset={PLOT.w * (1 - frame)} />

        {/* confidence band — width is a function of conviction, nothing else */}
        {drawn > 0.02 ? (
          <path d={polyD(BAND) + " Z"} fill={C.tint} opacity={clamp(drawn * 1.4, 0, 1) * 0.9} />
        ) : null}

        {/* forecast published at cutover */}
        <path d={F_D} fill="none" stroke={C.slate} strokeWidth={HAIR * 1.5}
          strokeDasharray={`10 8`} opacity={fcast} />

        {/* realised revenue */}
        <path d={A_D} fill="none" stroke={C.signal} strokeWidth={4}
          strokeDasharray={A_LEN} strokeDashoffset={A_LEN * (1 - drawn)} />

        {A_PTS.map((p, i) => {
          const w = week(i);
          if (w < 0.02) return null;
          const good = ACTUAL[i] >= FORECAST[i];
          const s = 10 + (1 - w) * 6;
          return (
            <rect key={"p" + i} x={p[0] - s / 2} y={p[1] - s / 2} width={s} height={s}
              fill={good ? C.pos : C.neg} opacity={clamp(w * 2, 0, 1)} />
          );
        })}

        {/* variance, per week, beneath the plot */}
        <line x1={PLOT.x} y1={VAR.zero} x2={PLOT.x + PLOT.w} y2={VAR.zero}
          stroke={C.rule25} strokeWidth={HAIR} opacity={frame} />
        {ACTUAL.map((v, i) => {
          const pct = (v - FORECAST[i]) / FORECAST[i] * 100;
          const full = clamp(Math.abs(pct) / 3, 0, 1) * 54;
          const h = full * vbar(i);
          const up = pct >= 0;
          const bw = 30;
          return (
            <rect key={"v" + i} x={px(i) - bw / 2} y={up ? VAR.zero - h : VAR.zero}
              width={bw} height={h} fill={up ? C.pos : C.neg} opacity={0.9} />
          );
        })}
      </svg>

      {/* week axis */}
      <div style={{ position: "absolute", left: PLOT.x, top: 684, width: PLOT.w, opacity: frame }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {Array.from({ length: N }).map((_, i) => (
            <span key={i} style={{
              font: t.micro, letterSpacing: TRACK,
              color: i < landed ? C.slate : C.label
            }}>W{i + 1}</span>
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute", left: PLOT.x, top: 84,
        font: t.micro, letterSpacing: TRACK, color: C.label, opacity: frame,
        display: "flex", gap: 28
      }}>
        <span>REVENUE INDEX · CUTOVER = 100</span>
        <span style={{ color: C.slate }}>— — FORECAST</span>
        <span style={{ color: C.signal }}>—— REALISED</span>
      </div>

      <div style={{
        position: "absolute", left: READ_X, top: 150, width: READ_W,
        display: "flex", flexDirection: "column"
      }}>
        {[
          { l: "CONFIDENCE", v: conf.toFixed(2), c: C.ink },
          {
            l: "MEAN VARIANCE", v: (meanVar >= 0 ? "+" : "−") + fmt1(Math.abs(meanVar)) + "%",
            c: meanVar >= 0 ? C.pos : C.neg
          },
          { l: "WEEKS LANDED", v: landed + " / " + N, c: C.ink }
        ].map((row, i) => (
          <div key={i} style={{
            borderTop: `${HAIR}px solid ${i === 0 ? C.rule25 : C.rule15}`,
            padding: "20px 0 24px", display: "flex", flexDirection: "column", gap: 12,
            opacity: frame, transform: `translateY(${(1 - frame) * TRAVEL}px)`
          }}>
            <span style={{ font: t.micro, letterSpacing: TRACK, color: C.label }}>{row.l}</span>
            <span style={{ font: t.fig, color: row.c, fontVariantNumeric: "tabular-nums" }}>{row.v}</span>
          </div>
        ))}

        <div style={{
          borderTop: `${HAIR}px solid ${C.rule15}`, paddingTop: 18,
          display: "flex", alignItems: "center", gap: 12, opacity: clamp(seal * 2, 0, 1)
        }}>
          <span style={{ flex: "none", width: 18, height: 18, background: C.pos, transform: `scale(${seal})` }} />
          <span style={{ font: t.micro, letterSpacing: TRACK, color: C.ink, whiteSpace: "nowrap" }}>AHEAD OF FORECAST</span>
        </div>
      </div>
    </div>
  );
}

function ValidatePiece() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.paper}>
        <Validate tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Loop" />
        <TweakSlider label="Cross-fade floor" value={tw.loopFloor} min={0} max={0.5} step={0.05} onChange={(v) => setTweak("loopFloor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.ValidatePiece = ValidatePiece;
