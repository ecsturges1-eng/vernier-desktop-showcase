/* @ds-bundle: {"format":4,"namespace":"VernierDesignSystem_7374ab","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"StatusChip","sourcePath":"components/actions/StatusChip.jsx"},{"name":"Mark","sourcePath":"components/brand/Logo.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"NumberedList","sourcePath":"components/content/NumberedList.jsx"},{"name":"PullQuote","sourcePath":"components/content/PullQuote.jsx"},{"name":"SectionLabel","sourcePath":"components/content/SectionLabel.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"DeltaBadge","sourcePath":"components/data/DeltaBadge.jsx"},{"name":"MetricCard","sourcePath":"components/data/MetricCard.jsx"},{"name":"StatBlock","sourcePath":"components/data/StatBlock.jsx"},{"name":"AuditStamp","sourcePath":"components/feedback/AuditStamp.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"2b9b838144a1","components/actions/StatusChip.jsx":"a07e23774687","components/brand/Logo.jsx":"9bc0e8b86882","components/content/NumberedList.jsx":"d15770ba0d7a","components/content/PullQuote.jsx":"96aae4f1fed7","components/content/SectionLabel.jsx":"57039f6a14f4","components/data/DataTable.jsx":"8246b031083a","components/data/DeltaBadge.jsx":"79a278f8bfcf","components/data/MetricCard.jsx":"8180565cf1e5","components/data/StatBlock.jsx":"7e717ededc3a","components/feedback/AuditStamp.jsx":"46a4a4274a98","components/forms/Field.jsx":"269dec8f3c7d","ui_kits/platform/AnalyseScreen.jsx":"8d9df08d83da","ui_kits/platform/AppShell.jsx":"bf6df888a827","ui_kits/platform/DefendScreen.jsx":"9202fc531600","ui_kits/platform/OptimiseScreen.jsx":"81db672c0aa8","ui_kits/platform/SignIn.jsx":"06a9f12c403b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VernierDesignSystem_7374ab = window.VernierDesignSystem_7374ab || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
/* Actions and states, §05. Flat, always — no radius, no shadow.
   One filled action per view; everything else is outline or link. */
function Button({
  variant = "primary",
  ground = "paper",
  size = "m",
  disabled = false,
  children,
  onClick,
  type = "button",
  style
}) {
  const ink = ground === "ink";
  const accent = ink ? "var(--aperture)" : "var(--signal)";
  const accentDeep = ink ? "var(--aperture-deep)" : "var(--signal-deep)";
  const fg = ink ? "var(--paper)" : "var(--ink)";
  const pad = size === "s" ? "8px 14px" : size === "l" ? "16px 28px" : "12px 20px";
  const fontSize = size === "s" ? "14px" : size === "l" ? "17px" : "15px";
  const base = {
    font: `500 ${fontSize}/1 var(--font-sans)`,
    padding: pad,
    border: "1px solid transparent",
    borderRadius: 0,
    cursor: disabled ? "default" : "pointer",
    transition: "background-color 120ms linear, color 120ms linear, border-color 120ms linear",
    opacity: disabled ? 0.4 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: "10px"
  };
  const variants = {
    primary: {
      background: accent,
      color: ink ? "var(--ink)" : "var(--paper)",
      borderColor: accent
    },
    secondary: {
      background: "transparent",
      color: fg,
      borderColor: ink ? "rgba(234,235,234,.35)" : "var(--rule-25)"
    },
    tertiary: {
      background: "transparent",
      color: accent,
      borderColor: "transparent",
      borderBottom: `1px solid ${accent}`,
      padding: `${pad.split(" ")[0]} 0`
    }
  };
  const hover = {
    primary: {
      background: accentDeep,
      borderColor: accentDeep
    },
    secondary: {
      borderColor: ink ? "var(--paper)" : "var(--ink)"
    },
    tertiary: {
      color: accentDeep,
      borderBottomColor: accentDeep
    }
  };
  const [over, setOver] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setOver(true),
    onMouseLeave: () => setOver(false),
    style: {
      ...base,
      ...variants[variant],
      ...(over && !disabled ? hover[variant] : null),
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/StatusChip.jsx
try { (() => {
/* Mono label chips for pipeline state. Colour is never the only carrier —
   the word is always present. */
const TONES = {
  neutral: {
    paper: {
      bg: "transparent",
      fg: "var(--slate)",
      bd: "var(--rule-25)"
    },
    ink: {
      bg: "transparent",
      fg: "var(--mist)",
      bd: "rgba(234,235,234,.25)"
    }
  },
  active: {
    paper: {
      bg: "var(--ink)",
      fg: "var(--paper)",
      bd: "var(--ink)"
    },
    ink: {
      bg: "var(--paper)",
      fg: "var(--ink)",
      bd: "var(--paper)"
    }
  },
  accent: {
    paper: {
      bg: "transparent",
      fg: "var(--signal)",
      bd: "var(--signal)"
    },
    ink: {
      bg: "transparent",
      fg: "var(--aperture)",
      bd: "var(--aperture)"
    }
  },
  muted: {
    paper: {
      bg: "var(--recess)",
      fg: "var(--slate)",
      bd: "var(--recess)"
    },
    ink: {
      bg: "var(--ink-raised)",
      fg: "var(--mist)",
      bd: "var(--ink-raised)"
    }
  }
};
function StatusChip({
  tone = "neutral",
  ground = "paper",
  children,
  style
}) {
  const t = TONES[tone][ground];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "7px 10px",
      background: t.bg,
      color: t.fg,
      border: `1px solid ${t.bd}`,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
const TICKS = [{
  x: 10,
  y: 50,
  h: 28.75
}, {
  x: 30,
  y: 65,
  h: 13.75
}, {
  x: 48,
  y: 35,
  h: 43.75
}, {
  x: 67.5,
  y: 65,
  h: 13.75
}, {
  x: 86.25,
  y: 50,
  h: 28.75
}];

/* The vernier scale: five graduation ticks of unequal height on a baseline,
   with the reading mark crossing it above and below. Geometry is fixed. */
function Mark({
  size = 26,
  ground = "paper",
  mono = false,
  style
}) {
  const grad = ground === "ink" ? "var(--paper)" : "var(--ink)";
  const read = mono ? grad : ground === "ink" ? "var(--aperture)" : "var(--signal)";
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 112",
    width: size,
    height: size * 112 / 100,
    fill: "none",
    shapeRendering: "crispEdges",
    "aria-hidden": "true",
    style: {
      display: "block",
      flex: "none",
      ...style
    }
  }, /*#__PURE__*/React.createElement("g", {
    fill: grad
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "77.5",
    width: "100",
    height: "2.5"
  }), TICKS.map((t, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: t.x,
    y: t.y,
    width: "2.5",
    height: t.h
  }))), /*#__PURE__*/React.createElement("rect", {
    x: "77.5",
    y: "8.75",
    width: "2.5",
    height: "98.75",
    fill: read
  }));
}

/* Wordmark is Open Sauce Sans Medium at +0.02em, sentence case.
   Mark is set at 1.7× the wordmark's cap height, optically centred. */
function Logo({
  size = 26,
  ground = "paper",
  mono = false,
  descriptor = false,
  style
}) {
  const fg = ground === "ink" ? "var(--paper)" : "var(--ink)";
  const sub = ground === "ink" ? "var(--mist)" : "var(--slate)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: `${Math.round(size * 0.62)}px`,
      ...style
    }
  }, /*#__PURE__*/React.createElement(Mark, {
    size: size,
    ground: ground,
    mono: mono
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      fontSize: `${Math.round(size * 0.92)}px`,
      letterSpacing: "0.02em",
      lineHeight: 1,
      color: fg
    }
  }, "Vernier"), descriptor && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontWeight: 400,
      fontSize: `${Math.max(9, Math.round(size * 0.34))}px`,
      letterSpacing: "0.12em",
      lineHeight: 1.35,
      textTransform: "uppercase",
      color: sub,
      maxWidth: `${size * 5}px`
    }
  }, "Pricing intelligence infrastructure")));
}
Object.assign(__ds_scope, { Mark, Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/content/NumberedList.jsx
try { (() => {
/* Numbered list, §06 — accent mono numeral, hairline between rows. */
function NumberedList({
  items,
  ground = "paper",
  scale = 1,
  style
}) {
  const px = n => `${Math.round(n * scale)}px`;
  const ink = ground === "ink";
  return /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: "none",
      ...style
    }
  }, items.map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: "flex",
      gap: px(20),
      alignItems: "baseline",
      padding: `${px(16)} 0`,
      borderBottom: i === items.length - 1 ? "none" : ink ? "1px solid rgba(234,235,234,.15)" : "1px solid var(--rule-15)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `400 ${px(12)}/1 var(--font-mono)`,
      letterSpacing: "0.12em",
      color: ink ? "var(--aperture)" : "var(--signal)"
    }
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `400 ${px(17)}/1.5 var(--font-sans)`,
      color: ink ? "var(--paper)" : "var(--ink)"
    }
  }, item))));
}
Object.assign(__ds_scope, { NumberedList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/NumberedList.jsx", error: String((e && e.message) || e) }); }

// components/content/PullQuote.jsx
try { (() => {
/* Quote slide, §06 — accent rule above, display quote, mono attribution. */
function PullQuote({
  children,
  attribution,
  ground = "paper",
  style
}) {
  const ink = ground === "ink";
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "44px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: "3px",
      height: "56px",
      background: ink ? "var(--aperture)" : "var(--signal)",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      font: "500 40px/1.10 var(--font-display)",
      letterSpacing: "-0.015em",
      color: ink ? "var(--paper)" : "var(--ink)",
      textWrap: "pretty"
    }
  }, children), attribution && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, attribution));
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionLabel.jsx
try { (() => {
/* Section label, §07 — "Label sections with mono numerals: 03 / The challenge". */
function SectionLabel({
  number,
  children,
  ground = "paper",
  align = "left",
  style
}) {
  const ink = ground === "ink";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "12px",
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: ink ? "var(--mist)" : "var(--slate)",
      ...style
    }
  }, number && /*#__PURE__*/React.createElement("span", null, number), number && children && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "/"), children && /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { SectionLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionLabel.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
/* Data table, §05 — mono figures, hairline rules, no fills. */
function DataTable({
  columns,
  rows,
  ground = "paper",
  onRowClick,
  selectedIndex,
  scale = 1,
  style
}) {
  const px = n => `${Math.round(n * scale)}px`;
  const ink = ground === "ink";
  const rule = ink ? "1px solid rgba(234,235,234,.15)" : "1px solid var(--rule-15)";
  const label = ink ? "var(--mist)" : "var(--slate)";
  const body = ink ? "var(--paper)" : "var(--ink)";
  const accent = ink ? "var(--aperture)" : "var(--signal)";
  return /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      ...style
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      textAlign: c.align || (i === 0 ? "left" : "right"),
      font: `400 ${px(11)}/1 var(--font-mono)`,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: label,
      padding: `0 0 ${px(12)}`,
      borderBottom: rule,
      whiteSpace: "nowrap"
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, r) => /*#__PURE__*/React.createElement("tr", {
    key: r,
    onClick: onRowClick ? () => onRowClick(r) : undefined,
    style: {
      cursor: onRowClick ? "pointer" : "default",
      background: selectedIndex === r ? ink ? "var(--ink-raised)" : "var(--signal-tint-10)" : "transparent"
    }
  }, columns.map((c, i) => {
    const cell = row[c.key];
    const isAccent = c.accent && cell && cell.accent;
    const text = cell && typeof cell === "object" ? cell.value : cell;
    return /*#__PURE__*/React.createElement("td", {
      key: i,
      style: {
        textAlign: c.align || (i === 0 ? "left" : "right"),
        font: i === 0 ? `400 ${px(15)}/1 var(--font-sans)` : `400 ${px(15)}/1 var(--font-mono)`,
        letterSpacing: i === 0 ? "0" : "0.06em",
        fontVariantNumeric: "tabular-nums",
        color: isAccent ? accent : body,
        padding: `${px(18)} 0`,
        borderBottom: rule,
        whiteSpace: "nowrap"
      }
    }, text);
  })))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/DeltaBadge.jsx
try { (() => {
/* Δ +0.4bps — deltas carry an explicit sign and sit on the ground's accent fill.
   Labels on any accent fill are Paper on Signal, Ink on Aperture. */
function DeltaBadge({
  value,
  ground = "paper",
  muted = false,
  style
}) {
  const ink = ground === "ink";
  const bg = muted ? ink ? "var(--ink-raised)" : "var(--recess)" : ink ? "var(--aperture)" : "var(--signal)";
  const fg = muted ? ink ? "var(--mist)" : "var(--slate)" : ink ? "var(--ink)" : "var(--paper)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: bg,
      color: fg,
      font: "500 13px/1 var(--font-mono)",
      letterSpacing: "0.10em",
      fontVariantNumeric: "tabular-nums",
      padding: "7px 10px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u0394"), /*#__PURE__*/React.createElement("span", null, value));
}
Object.assign(__ds_scope, { DeltaBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DeltaBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricCard.jsx
try { (() => {
/* Metric card, §05. Mono label · mono figure · one accent delta.
   Paper card = 1px hairline, no fill. Ink card = Ink Raised fill, no border. */
function MetricCard({
  label,
  meta,
  value,
  delta,
  baseline,
  ground = "paper",
  style,
  children
}) {
  const ink = ground === "ink";
  return /*#__PURE__*/React.createElement("section", {
    className: ink ? "ink" : undefined,
    style: {
      background: ink ? "var(--ink)" : "transparent",
      border: ink ? "none" : "1px solid var(--rule-15)",
      padding: "28px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, label), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: `400 38px/1 var(--font-mono)`,
      letterSpacing: "0.02em",
      fontVariantNumeric: "tabular-nums",
      color: ink ? "var(--paper)" : "var(--ink)"
    }
  }, value), (delta || baseline) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, delta && /*#__PURE__*/React.createElement(__ds_scope.DeltaBadge, {
    value: delta,
    ground: ground
  }), baseline && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 13px/1 var(--font-mono)",
      letterSpacing: "0.10em",
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, baseline)), children);
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/data/StatBlock.jsx
try { (() => {
/* Statistic block, §06 — display figure over a hairline, with a measured caption. */
function StatBlock({
  figure,
  caption,
  ground = "paper",
  scale = 1,
  style
}) {
  const px = n => `${Math.round(n * scale)}px`;
  const ink = ground === "ink";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: `500 ${px(56)}/1.05 var(--font-display)`,
      letterSpacing: "-0.015em",
      color: ink ? "var(--paper)" : "var(--ink)",
      paddingBottom: "20px",
      borderBottom: ink ? "1px solid rgba(234,235,234,.20)" : "1px solid var(--rule-15)"
    }
  }, figure), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: `400 ${px(15)}/1.5 var(--font-sans)`,
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, caption));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/feedback/AuditStamp.jsx
try { (() => {
/* Audit stamp, §05 — appended to every decision. Always Ink ground, always mono,
   fields separated by interpuncts on one line. */
function AuditStamp({
  label = "Audit stamp — appended to every decision",
  fields = [],
  action,
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--ink)",
      padding: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "28px",
      flexWrap: "wrap",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--mist)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 17px/1.4 var(--font-mono)",
      letterSpacing: "0.04em",
      color: "var(--paper)",
      fontVariantNumeric: "tabular-nums"
    }
  }, fields.join("  ·  "))), action && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--aperture)",
      background: "transparent",
      border: "1px solid var(--aperture)",
      padding: "13px 18px",
      cursor: onAction ? "pointer" : "default"
    }
  }, action));
}
Object.assign(__ds_scope, { AuditStamp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/AuditStamp.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
/* Inputs and wells sit on Sheet (#F4F5F4) with a hairline. Flat, square. */
function Field({
  label,
  hint,
  value,
  placeholder,
  onChange,
  ground = "paper",
  type = "text",
  disabled,
  style
}) {
  const ink = ground === "ink";
  const [focused, setFocused] = React.useState(false);
  const accent = ink ? "var(--aperture)" : "var(--signal)";
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      font: "400 15px/1 var(--font-sans)",
      padding: "13px 12px",
      background: ink ? "var(--ink-raised)" : "var(--sheet)",
      color: ink ? "var(--paper)" : "var(--ink)",
      border: `1px solid ${focused ? accent : ink ? "rgba(234,235,234,.20)" : "var(--rule-15)"}`,
      borderRadius: 0,
      outline: "none",
      opacity: disabled ? 0.4 : 1
    }
  }), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1.4 var(--font-mono)",
      letterSpacing: "0.08em",
      color: ink ? "var(--mist)" : "var(--slate)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/AnalyseScreen.jsx
try { (() => {
const {
  MetricCard: MC,
  DataTable: DT,
  AuditStamp: AS,
  Button: Btn,
  StatusChip: Chip,
  DeltaBadge: DB
} = window.VernierDesignSystem_7374ab;
const FEE_COLUMNS = [{
  key: "fee",
  header: "Fee type"
}, {
  key: "current",
  header: "Current"
}, {
  key: "optimal",
  header: "Optimal",
  accent: true
}, {
  key: "delta",
  header: "\u0394"
}, {
  key: "risk",
  header: "Risk"
}];
const FEE_ROWS = [{
  fee: "Ongoing charge",
  current: "0.72%",
  optimal: {
    value: "0.78%",
    accent: true
  },
  delta: "+6.0bps",
  risk: "Low"
}, {
  fee: "Performance fee",
  current: "10.00%",
  optimal: {
    value: "12.50%",
    accent: true
  },
  delta: "+250bps",
  risk: "Medium"
}, {
  fee: "Custody",
  current: "0.04%",
  optimal: "0.04%",
  delta: "\u2014",
  risk: "Low"
}, {
  fee: "Transfer agency",
  current: "0.09%",
  optimal: {
    value: "0.07%",
    accent: true
  },
  delta: "\u22122.0bps",
  risk: "Low"
}, {
  fee: "Research",
  current: "0.03%",
  optimal: "0.03%",
  delta: "\u2014",
  risk: "Low"
}];
function AnalyseScreen({
  fund,
  selected,
  setSelected
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "44px",
      display: "flex",
      flexDirection: "column",
      gap: "44px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "28px"
    }
  }, /*#__PURE__*/React.createElement(MC, {
    meta: `Modelled synergy · Fund ${fund}`,
    value: "\xA3128,400.00",
    delta: "+0.4bps",
    baseline: "vs. 30d baseline"
  }), /*#__PURE__*/React.createElement(MC, {
    meta: `Net revenue · Fund ${fund}`,
    value: "\xA34,918,220.00",
    delta: "+18bps",
    baseline: "vs. 30d baseline"
  }), /*#__PURE__*/React.createElement(MC, {
    meta: "Variables in model",
    value: "1,284",
    delta: "0.0bps",
    baseline: "unchanged"
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, "02 / Fee book"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".10em",
      color: "var(--slate)"
    }
  }, "5 lines \xB7 scanned 14 Aug 2026 09:38 UTC")), /*#__PURE__*/React.createElement(DT, {
    columns: FEE_COLUMNS,
    rows: FEE_ROWS,
    selectedIndex: selected,
    onRowClick: setSelected
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "20px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Btn, null, "Approve pricing"), /*#__PURE__*/React.createElement(Btn, {
    variant: "secondary"
  }, "Export board paper"), /*#__PURE__*/React.createElement(Btn, {
    variant: "tertiary"
  }, "View audit trail"))), /*#__PURE__*/React.createElement(AS, {
    fields: [fund, "approved 14 Aug 2026 09:41 UTC", "antitrust scan PASS", "2 approvers"],
    action: "Audit-ready"
  }));
}
Object.assign(window, {
  AnalyseScreen,
  FEE_COLUMNS,
  FEE_ROWS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/AnalyseScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/AppShell.jsx
try { (() => {
const NS = window.VernierDesignSystem_7374ab;
const {
  Logo,
  Mark,
  Button,
  StatusChip,
  Field
} = NS;
function NavItem({
  label,
  active,
  onClick
}) {
  const [over, setOver] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setOver(true),
    onMouseLeave: () => setOver(false),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      background: active ? "var(--ink-raised)" : over ? "rgba(234,235,234,.04)" : "transparent",
      border: "none",
      borderLeft: `2px solid ${active ? "var(--aperture)" : "transparent"}`,
      padding: "13px 20px",
      cursor: "pointer",
      textAlign: "left",
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: active ? "var(--paper)" : "var(--mist)"
    }
  }, label);
}
function Rail({
  view,
  setView,
  onSignOut
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: "220px",
      flex: "none",
      background: "var(--ink)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRight: "1px solid rgba(234,235,234,.10)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "28px 20px",
      borderBottom: "1px solid rgba(234,235,234,.10)"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 20,
    ground: "ink"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 0 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "400 10px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)",
      padding: "0 20px 12px"
    }
  }, "Workspace"), /*#__PURE__*/React.createElement(NavItem, {
    label: "Analyse",
    active: view === "analyse",
    onClick: () => setView("analyse")
  }), /*#__PURE__*/React.createElement(NavItem, {
    label: "Optimise",
    active: view === "optimise",
    onClick: () => setView("optimise")
  }), /*#__PURE__*/React.createElement(NavItem, {
    label: "Defend",
    active: view === "defend",
    onClick: () => setView("defend")
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px",
      borderTop: "1px solid rgba(234,235,234,.10)",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1.5 var(--font-mono)",
      letterSpacing: ".10em",
      color: "var(--mist)"
    }
  }, "R. OKONJO", /*#__PURE__*/React.createElement("br", null), "Pricing committee"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSignOut,
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      font: "400 10px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--aperture)",
      textAlign: "left"
    }
  }, "Sign out")));
}
function TopBar({
  title,
  section,
  fund,
  setFund
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "28px 44px",
      borderBottom: "1px solid var(--rule-15)",
      gap: "28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, section), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "500 40px/1.05 var(--font-display)",
      letterSpacing: "-.015em",
      color: "var(--ink)"
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, "Fund"), /*#__PURE__*/React.createElement("select", {
    value: fund,
    onChange: e => setFund(e.target.value),
    style: {
      font: "400 14px/1 var(--font-mono)",
      letterSpacing: ".08em",
      padding: "11px 12px",
      background: "var(--sheet)",
      color: "var(--ink)",
      border: "1px solid var(--rule-15)",
      borderRadius: 0
    }
  }, /*#__PURE__*/React.createElement("option", null, "VR-2291"), /*#__PURE__*/React.createElement("option", null, "VR-1184"), /*#__PURE__*/React.createElement("option", null, "VR-3007"))));
}
Object.assign(window, {
  Rail,
  TopBar,
  NavItem
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/DefendScreen.jsx
try { (() => {
const {
  DataTable: DDT,
  AuditStamp: DAS,
  StatusChip: DChip,
  Button: DBtn,
  StatBlock: DSB,
  PullQuote: DPQ,
  Field: DField
} = window.VernierDesignSystem_7374ab;
function DefendScreen({
  fund,
  approved
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "44px",
      display: "flex",
      flexDirection: "column",
      gap: "44px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      gap: "28px",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, "04 / Evidence trail"), /*#__PURE__*/React.createElement(DField, {
    placeholder: "Filter by record",
    style: {
      width: "220px"
    }
  })), /*#__PURE__*/React.createElement(DDT, {
    columns: [{
      key: "id",
      header: "Record"
    }, {
      key: "event",
      header: "Event",
      align: "left"
    }, {
      key: "scan",
      header: "Antitrust scan",
      accent: true
    }, {
      key: "stamped",
      header: "Stamped"
    }],
    rows: [{
      id: "VR-2291-04",
      event: "Scenario 03 approved",
      scan: {
        value: "PASS",
        accent: true
      },
      stamped: "14 Aug 2026 09:41"
    }, {
      id: "VR-2291-03",
      event: "Fee book rescanned",
      scan: "PASS",
      stamped: "14 Aug 2026 09:38"
    }, {
      id: "VR-2291-02",
      event: "Performance fee amended",
      scan: "PASS",
      stamped: "12 Aug 2026 16:02"
    }, {
      id: "VR-2291-01",
      event: "Book imported",
      scan: "PASS",
      stamped: "01 Aug 2026 08:15"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "20px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(DBtn, null, "Export evidence pack"), /*#__PURE__*/React.createElement(DBtn, {
    variant: "tertiary"
  }, "Open regulator view"))), /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--rule-15)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, "Status"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(DChip, {
    tone: "neutral"
  }, "Analyse"), /*#__PURE__*/React.createElement(DChip, {
    tone: "neutral"
  }, "Optimise"), /*#__PURE__*/React.createElement(DChip, {
    tone: "active"
  }, "Defend"), /*#__PURE__*/React.createElement(DChip, {
    tone: approved ? "accent" : "muted"
  }, approved ? "Cleared" : "Pending"))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--rule-15)",
      padding: "20px"
    }
  }, /*#__PURE__*/React.createElement(DSB, {
    figure: "4",
    caption: `Decisions stamped against fund ${fund} in the current quarter.`
  })))), /*#__PURE__*/React.createElement(DAS, {
    fields: [fund, "approved 14 Aug 2026 09:41 UTC", "antitrust scan PASS", "2 approvers"],
    action: "Audit-ready"
  }));
}
Object.assign(window, {
  DefendScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/DefendScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/OptimiseScreen.jsx
try { (() => {
const {
  MetricCard: OMC,
  DataTable: ODT,
  Button: OBtn,
  StatusChip: OChip,
  Field: OField,
  NumberedList: ONL
} = window.VernierDesignSystem_7374ab;

/* Optimise is a dark product surface: Ink ground, Aperture accent, no Signal anywhere. */
function OptimiseScreen({
  fund,
  approved,
  onApprove
}) {
  const [bps, setBps] = React.useState("40");
  return /*#__PURE__*/React.createElement("div", {
    className: "ink",
    style: {
      minHeight: "100%",
      padding: "44px",
      display: "flex",
      flexDirection: "column",
      gap: "44px",
      background: "var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: "28px",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(OMC, {
    ground: "ink",
    label: "Modelled outcome",
    meta: `Scenario 03 · Fund ${fund}`,
    value: "\xA3128,400.00",
    delta: "+0.4bps",
    baseline: "vs. 30d baseline"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--ink-raised)",
      padding: "28px",
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--mist)"
    }
  }, "Model inputs"), /*#__PURE__*/React.createElement(OField, {
    ground: "ink",
    label: "Performance uplift",
    value: bps,
    onChange: e => setBps(e.target.value),
    hint: "Basis points \xB7 tabular"
  }), /*#__PURE__*/React.createElement(OField, {
    ground: "ink",
    label: "Baseline window",
    value: "30d",
    onChange: () => {}
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--mist)"
    }
  }, "03 / Scenarios"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(OChip, {
    ground: "ink",
    tone: "neutral"
  }, "Analyse"), /*#__PURE__*/React.createElement(OChip, {
    ground: "ink",
    tone: "active"
  }, "Optimise"), /*#__PURE__*/React.createElement(OChip, {
    ground: "ink",
    tone: approved ? "accent" : "muted"
  }, approved ? "Cleared" : "Pending"))), /*#__PURE__*/React.createElement(ODT, {
    ground: "ink",
    columns: [{
      key: "scenario",
      header: "Scenario"
    }, {
      key: "revenue",
      header: "Net revenue"
    }, {
      key: "delta",
      header: "\u0394",
      accent: true
    }, {
      key: "risk",
      header: "Antitrust risk"
    }],
    rows: [{
      scenario: "01 — hold",
      revenue: "£4,789,820.00",
      delta: "\u2014",
      risk: "None"
    }, {
      scenario: "02 — partial",
      revenue: "£4,861,540.00",
      delta: "+14bps",
      risk: "Low"
    }, {
      scenario: "03 — modelled",
      revenue: "£4,918,220.00",
      delta: {
        value: "+18bps",
        accent: true
      },
      risk: "Low"
    }],
    selectedIndex: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "28px",
      alignItems: "flex-start",
      justifyContent: "space-between",
      borderTop: "1px solid rgba(234,235,234,.20)",
      paddingTop: "28px"
    }
  }, /*#__PURE__*/React.createElement(ONL, {
    ground: "ink",
    items: ["Complete — all variables considered", "Intelligent — always on", "Defensible — prepared"],
    style: {
      maxWidth: "420px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "20px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(OBtn, {
    ground: "ink",
    variant: "secondary"
  }, "Compare scenarios"), /*#__PURE__*/React.createElement(OBtn, {
    ground: "ink",
    onClick: onApprove
  }, approved ? "Approved" : "Approve scenario 03"))));
}
Object.assign(window, {
  OptimiseScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/OptimiseScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/SignIn.jsx
try { (() => {
const {
  Logo: SignInLogo,
  Button: SignInButton,
  Field: SignInField
} = window.VernierDesignSystem_7374ab;
function SignIn({
  onSubmit
}) {
  const [email, setEmail] = React.useState("r.okonjo@northgate-am.co.uk");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      display: "grid",
      gridTemplateColumns: "1fr 1fr"
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--ink)",
      padding: "72px 56px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(SignInLogo, {
    size: 24,
    ground: "ink"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "28px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: "3px",
      height: "56px",
      background: "var(--aperture)"
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "500 56px/1.05 var(--font-display)",
      letterSpacing: "-.015em",
      color: "var(--paper)",
      maxWidth: "9ch"
    }
  }, "The space between prices"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 17px/1.5 var(--font-sans)",
      color: "var(--mist)",
      maxWidth: "44ch"
    }
  }, "Pricing intelligence and regulatory defensibility in a single platform.")), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 11px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, "Analyse \xB7 Optimise \xB7 Defend")), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--paper)",
      padding: "72px 56px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "44px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "400 12px/1 var(--font-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--slate)"
    }
  }, "01 / Sign in"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: "500 28px/1.1 var(--font-display)",
      letterSpacing: "-.015em",
      color: "var(--ink)"
    }
  }, "Institution access")), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSubmit();
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "28px",
      maxWidth: "420px"
    }
  }, /*#__PURE__*/React.createElement(SignInField, {
    label: "Work email",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(SignInField, {
    label: "Passphrase",
    type: "password",
    value: "\xB7\xB7\xB7\xB7\xB7\xB7\xB7\xB7\xB7\xB7\xB7\xB7",
    onChange: () => {},
    hint: "SSO enforced for committee roles"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement(SignInButton, {
    type: "submit"
  }, "Continue"), /*#__PURE__*/React.createElement(SignInButton, {
    variant: "tertiary"
  }, "Recover access"))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "400 13px/1.5 var(--font-mono)",
      letterSpacing: ".06em",
      color: "var(--slate)",
      maxWidth: "48ch"
    }
  }, "Sessions are recorded. Every decision taken in this workspace is appended to the audit trail.")));
}
Object.assign(window, {
  SignIn
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/SignIn.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.Mark = __ds_scope.Mark;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.NumberedList = __ds_scope.NumberedList;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SectionLabel = __ds_scope.SectionLabel;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.DeltaBadge = __ds_scope.DeltaBadge;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.AuditStamp = __ds_scope.AuditStamp;

__ds_ns.Field = __ds_scope.Field;

})();
