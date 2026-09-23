const { useComposition, CompositionStage, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakSlider } = window;
const { useStageFit, REVEAL, REVEAL_MS, TRAVEL, STAGGER, COUNT, LINEAR, loopFade } = window.PS;

// ---------------------------------------------------------------------------
// Analyst — a product-UI piece on the landscape desktop canvas, one centred
// column with no chrome around it. Two exchanges: a commercial question answered with fee-level
// opportunities in revenue terms, then a document retrieval. Each follows the
// same order: typed, sent, sources named as they are read, answer, figures.
// The thread scrolls only when the second question is sent.
// ---------------------------------------------------------------------------

const W = 1200, H = 760, PAD = 24;
const COMPOSER = 88;
const VIEW_H = H - COMPOSER;
const COL_W = 760, COL_X = (W - COL_W) / 2;

const LABEL = { font: "400 12px/16px var(--font-mono)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" };
const DATA = { font: "400 14px/20px var(--font-mono)", letterSpacing: "var(--tracking-mono)", fontVariantNumeric: "tabular-nums" };
const BODY = { font: "400 16px/24px var(--font-sans)" };
const RULE = "1px solid var(--border)";

const Q = [
  {
    scene: "Opportunities", y: 32, scroll: 0,
    ask: "Where are my current optimisation opportunities?",
    sources: ["Transaction ledger", "Competitor analysis", "Attrition model"], secs: "1.4S"
  },
  {
    scene: "Retrieve", y: 400, scroll: 368,
    ask: "Retrieve the September 2025 Board paper for 2026 pricing strategy",
    sources: ["Governance library", "Board papers · 2025"], secs: "0.9S"
  }
];

const TYPE_AT = 0.5, SEND_GAP = 0.15, READ_MS = 0.4;
const typeDur = (q) => q.ask.length * 0.026;
const sendAt = (q) => TYPE_AT + typeDur(q) + SEND_GAP;
const readAt = (q) => sendAt(q) + 0.3;
const answerAt = (q) => readAt(q) + q.sources.length * READ_MS + 0.15;

// Revenue, annualised.
//   Raise: +0.40bps on £18.5bn = +£0.74m.
//   Lower: −0.30bps on £39.3bn = −£1.18m of rate, against £1.5bn of at-risk
//   volume retained at 17.70bps = +£2.66m. Net +£1.48m.
//   Together +£2.22m.
const OPPS = [
  {
    dir: "Raise", fee: "Cross-border interchange++", seg: "Mid-market",
    from: "26.00", to: "26.40", delta: "+0.40bps",
    rev: 0.74, revNote: "revenue",
    why: "Improves margin", risk: "Attrition risk 18", word: "LOW", tone: "var(--positive)"
  },
  {
    dir: "Lower", fee: "Blended MDR", seg: "Enterprise",
    from: "18.00", to: "17.70", delta: "−0.30bps",
    rev: 1.48, revNote: "net revenue",
    why: "Retains £1.5bn volume", risk: "Attrition risk 46 → 24", word: "LOW", tone: "var(--positive)"
  }
];
const TOTAL = OPPS.reduce((a, o) => a + o.rev, 0);

const EXTRACTS = [
  { ref: "§2.1 · P.4", text: "Target blended yield of 22.5bps by Q4 2026." },
  { ref: "§3.4 · P.9", text: "Scheme fee changes passed through within 60 days." },
  { ref: "§5.2 · P.14", text: "Price reductions permitted where they bring attrition risk below 40." }
];

function Analyst({ tw }) {
  const { T, CUES, authoredTotal } = useComposition();
  useStageFit(W, H);
  const at = (start, dur, ease) => animate({ from: 0, to: 1, start, end: start + dur, ease })(T);
  const fade = loopFade(T, authoredTotal, tw.loopFloor, 0.6);
  const reveal = (p) => ({ opacity: p, transform: `translateY(${(1 - p) * TRAVEL}px)` });

  const S = Q.map((q) => CUES[q.scene]);
  const active = T >= S[1] ? 1 : 0;

  const scroll = Q[1].scroll * at(S[1] + sendAt(Q[1]) - 0.05, REVEAL_MS, REVEAL);

  const qa = Q[active], s0 = S[active];
  const typed = at(s0 + TYPE_AT, typeDur(qa), LINEAR);
  const sent = T >= s0 + sendAt(qa);
  const draft = sent ? "" : qa.ask.slice(0, Math.floor(qa.ask.length * typed));

  const ex = Q.map((q, i) => {
    const s = S[i];
    return {
      user: at(s + sendAt(q), REVEAL_MS, REVEAL),
      statusIn: at(s + readAt(q), 0.18, REVEAL),
      readIdx: clamp(Math.floor((T - s - readAt(q)) / READ_MS), 0, q.sources.length - 1),
      answered: T >= s + answerAt(q),
      A: s + answerAt(q),
      weight: i === active ? 1 : 0.58
    };
  });
  const ans = (i, d = 0) => at(ex[i].A + d, REVEAL_MS, REVEAL);

  const opp = (k) => at(ex[0].A + 0.3 + k * STAGGER * 3, REVEAL_MS, REVEAL);
  const oppCount = (k) => at(ex[0].A + 0.45 + k * STAGGER * 3, 0.9, COUNT);
  const totalIn = at(ex[0].A + 0.3 + 2 * STAGGER * 3, REVEAL_MS, REVEAL);
  const totalCount = at(ex[0].A + 0.45 + 2 * STAGGER * 3, 0.9, COUNT);
  const card = at(ex[1].A + 0.1, REVEAL_MS, REVEAL);
  const ext = (k) => at(ex[1].A + 0.5 + k * STAGGER * 2, REVEAL_MS, REVEAL);

  const status = (i) => {
    const e = ex[i], q = Q[i];
    if (!e.answered) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: e.statusIn }}>
          <span style={{ width: 6, height: 6, background: "var(--accent)" }} />
          <span style={{ ...LABEL, color: "var(--accent)" }}>Reading</span>
          <span style={{ font: "var(--type-ui-sm)", color: "var(--ink-secondary)" }}>{q.sources[e.readIdx]}</span>
          <span style={{ ...DATA, fontSize: 12, color: "var(--ink-muted)" }}>{e.readIdx + 1}/{q.sources.length}</span>
        </div>
      );
    }
    return <div style={{ ...LABEL, color: "var(--ink-muted)" }}>{q.sources.length} sources · {q.secs}</div>;
  };

  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--surface)", overflow: "hidden",
      fontFamily: "var(--font-sans)", color: "var(--ink)", opacity: fade
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: VIEW_H, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: COL_X, top: 0, width: COL_W, transform: `translateY(${-scroll}px)` }}>
          {Q.map((q, i) => {
            const e = ex[i];
            return (
              <div key={i} style={{
                position: "absolute", left: 0, top: q.y, width: COL_W,
                display: "flex", flexDirection: "column", gap: 16
              }}>
                <div style={{ display: "flex", justifyContent: "flex-end", ...reveal(e.user) }}>
                  <div style={{
                    maxWidth: 520, padding: "12px 16px", background: "var(--surface-sunken)",
                    border: RULE, ...BODY, color: "var(--ink)"
                  }}>{q.ask}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: e.weight }}>
                  <div style={{ height: 16 }}>{e.user > 0.5 ? status(i) : null}</div>

                  {i === 0 && e.answered ? (
                    <React.Fragment>
                      <div style={{ ...BODY, ...reveal(ans(0)) }}>
                        Two fee moves are ready, worth £2.22m in annualised revenue.
                      </div>
                      <div style={{ marginTop: 4, display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", columnGap: 32, borderTop: "1px solid var(--border-strong)" }}>
                        {OPPS.map((o, k) => (
                          <div key={k} style={{
                            padding: "16px 0 18px", borderBottom: RULE,
                            display: "flex", flexDirection: "column", gap: 6, ...reveal(opp(k))
                          }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                              <span style={{ ...LABEL, color: "var(--accent)" }}>{o.dir === "Raise" ? "↑ Raise" : "↓ Lower"}</span>
                              <span style={{ ...LABEL, color: "var(--ink-muted)" }}>{o.seg}</span>
                            </div>
                            <div style={{ font: "500 17px/24px var(--font-sans)" }}>{o.fee}</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                              <span style={{ ...DATA, color: "var(--ink)" }}>
                                {o.from}<span style={{ color: "var(--ink-muted)", padding: "0 6px" }}>→</span>{o.to}
                                <span style={{ color: "var(--ink-muted)" }}> bps</span>
                              </span>
                              <span style={{ flex: 1 }} />
                              <span style={{ font: "500 20px/28px var(--font-mono)", color: "var(--positive)", fontVariantNumeric: "tabular-nums" }}>
                                +£{(o.rev * oppCount(k)).toFixed(2)}m
                              </span>
                            </div>
                            <span style={{ font: "var(--type-ui-sm)", color: "var(--ink-secondary)", whiteSpace: "nowrap" }}>{o.why}</span>
                            <span style={{ ...LABEL, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                              {o.risk} · <span style={{ color: o.tone }}>{o.word}</span>
                            </span>
                          </div>
                        ))}
                        <div style={{ gridColumn: "1 / -1", padding: "14px 0 0", display: "flex", alignItems: "baseline", ...reveal(totalIn) }}>
                          <span style={{ ...LABEL, color: "var(--ink)" }}>Revenue uplift · annualised</span>
                          <span style={{ flex: 1 }} />
                          <span style={{ font: "500 28px/36px var(--font-mono)", color: "var(--positive)", fontVariantNumeric: "tabular-nums" }}>
                            +£{(TOTAL * totalCount).toFixed(2)}m
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  ) : null}

                  {i === 1 && e.answered ? (
                    <React.Fragment>
                      <div style={{ ...BODY, ...reveal(ans(1)) }}>
                        Found it. Approved by the Board on 24 September 2025.
                      </div>
                      <div style={{ marginTop: 4, border: RULE, ...reveal(card) }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: RULE }}>
                          <span style={{
                            flex: "none", width: 32, height: 40, boxSizing: "border-box",
                            border: "1px solid var(--border-strong)", display: "flex", alignItems: "flex-end",
                            justifyContent: "center", paddingBottom: 4
                          }}>
                            <span style={{ ...LABEL, fontSize: 9, lineHeight: "12px", color: "var(--ink-muted)" }}>PDF</span>
                          </span>
                          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ font: "500 17px/24px var(--font-sans)" }}>2026 Pricing Strategy</span>
                            <span style={{ ...LABEL, color: "var(--ink-muted)" }}>Board paper · 24 Sep 2025 · 18 pp</span>
                          </div>
                        </div>
                        <div style={{ padding: "4px 16px 8px" }}>
                          {EXTRACTS.map((x, k) => (
                            <div key={k} style={{
                              display: "grid", gridTemplateColumns: "120px minmax(0,1fr)", alignItems: "baseline", padding: "12px 0",
                              borderBottom: k < EXTRACTS.length - 1 ? RULE : "none", opacity: ext(k)
                            }}>
                              <span style={{ ...LABEL, color: "var(--accent)" }}>{x.ref}</span>
                              <span style={{ ...BODY, color: "var(--ink)" }}>{x.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: "absolute", left: 0, top: VIEW_H, width: W, height: COMPOSER, boxSizing: "border-box",
        padding: `16px ${COL_X}px 24px`, background: "var(--surface)"
      }}>
        <div style={{
          height: 48, boxSizing: "border-box", border: "1px solid var(--border-strong)",
          display: "flex", alignItems: "center", gap: 12, padding: "0 8px 0 14px"
        }}>
          <span style={{
            flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", direction: draft ? "rtl" : "ltr",
            textAlign: "left", ...BODY, color: draft ? "var(--ink)" : "var(--ink-muted)"
          }}>
            <bdi>
              {draft || "Ask Vernier"}
              {draft ? <span style={{ display: "inline-block", width: 1, height: 18, marginLeft: 1, verticalAlign: -3, background: "var(--ink)" }} /> : null}
            </bdi>
          </span>
          <span style={{
            flex: "none", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            background: draft ? "var(--accent)" : "var(--surface-sunken)",
            color: draft ? "#FFFFFF" : "var(--ink-muted)", font: "500 16px/1 var(--font-mono)"
          }}>↑</span>
        </div>
      </div>
    </div>
  );
}

window.AnalystPiece = function () {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#FFFFFF">
        <Analyst tw={tw} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Loop" />
        <TweakSlider label="Cross-fade floor" value={tw.loopFloor} min={0} max={0.5} step={0.05} onChange={(v) => setTweak("loopFloor", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
};
