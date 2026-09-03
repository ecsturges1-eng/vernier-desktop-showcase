/* @ds-bundle: {"format":4,"namespace":"VernierDesignSystem_fc76dd","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"BarChart","sourcePath":"components/data/BarChart.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Delta","sourcePath":"components/data/Delta.jsx"},{"name":"MetricCard","sourcePath":"components/data/MetricCard.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/display/Eyebrow.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"3c92e8bdd4e9","components/brand/Icon.jsx":"a3b35c1911b1","components/brand/Logo.jsx":"1a6053b056b9","components/data/BarChart.jsx":"347765af153c","components/data/DataTable.jsx":"b1282f9ec4d2","components/data/Delta.jsx":"bce4b8353a2a","components/data/MetricCard.jsx":"f7c1a4bb915d","components/display/Badge.jsx":"6cd85fb35ccb","components/display/Card.jsx":"005fa2411a5b","components/display/Eyebrow.jsx":"1c222cc80b37","components/forms/Input.jsx":"660ffcd7907f","ui_kits/console/AppShell.jsx":"80bd8cbff0e7","ui_kits/console/PriceIndexScreen.jsx":"fd77ff6b3e6f","ui_kits/console/SkuDetailPanel.jsx":"4d0ce41c1e17","ui_kits/web/AccessScreen.jsx":"24981356bbe8","ui_kits/web/HomeScreen.jsx":"1357cd846f0d","ui_kits/web/MethodScreen.jsx":"568a55fb55f1","ui_kits/web/SiteFooter.jsx":"967cd9b5263f","ui_kits/web/SiteHeader.jsx":"5b9960bdc9ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VernierDesignSystem_fc76dd = window.VernierDesignSystem_fc76dd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  font: 'var(--weight-medium) var(--size-ui-md)/1 var(--font-sans)',
  borderRadius: 'var(--radius-container)',
  border: '1px solid transparent',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  transition: 'background var(--motion-fast) var(--motion-ease), border-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease)',
  whiteSpace: 'nowrap'
};
const sizes = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--size-ui-sm)'
  },
  md: {
    padding: '10px 16px',
    fontSize: 'var(--size-ui-md)'
  },
  lg: {
    padding: '13px 20px',
    fontSize: 'var(--size-ui-lg)'
  }
};
const variants = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--ink-reversed)',
    borderColor: 'var(--accent)'
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--ink)',
    borderColor: 'var(--border)'
  },
  quiet: {
    background: 'transparent',
    color: 'var(--accent)',
    borderColor: 'transparent',
    padding: '10px 4px'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft,
  iconRight,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? {
    primary: {
      background: '#263F87'
    },
    secondary: {
      borderColor: 'var(--border-strong)'
    },
    quiet: {
      textDecoration: 'underline',
      textUnderlineOffset: '2px'
    }
  }[variant] : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...hoverStyle,
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/brand/Icon.jsx
try { (() => {
/* Vernier's own icon set (24-unit grid, 1.5-unit stroke, square caps and
   joins, 2-unit padding, strokes only) was not supplied with the toolkit.
   This wrapper substitutes Lucide from CDN, masked so the glyph takes
   currentColor. Lucide draws at a 2-unit stroke with round caps: the closest
   available match, flagged in readme.md under Iconography. */
const CDN = 'https://cdn.jsdelivr.net/npm/lucide-static@0.474.0/icons/';
function Icon({
  name,
  size = 20,
  tone = 'ink',
  label,
  style
}) {
  const colors = {
    ink: 'var(--ink)',
    muted: 'var(--ink-muted)',
    secondary: 'var(--ink-secondary)',
    reversed: 'var(--ink-reversed)',
    current: 'currentColor'
  };
  const url = 'url("' + CDN + name + '.svg")';
  return /*#__PURE__*/React.createElement("span", {
    role: label ? 'img' : 'presentation',
    "aria-label": label,
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: '0 0 auto',
      background: colors[tone],
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
/* Mark geometry extracted from the Vernier Brand Toolkit v1.0 (p.05):
   a baseline rule spanning the field, five scale ticks at uneven heights,
   and one accent-blue indicator running the full height and crossing the
   baseline. Do not redraw or re-proportion these rects. */
function Mark({
  height,
  inkColor,
  indicatorColor
}) {
  const ratio = 205.572 / 190.388;
  return /*#__PURE__*/React.createElement("svg", {
    width: height * ratio,
    height: height,
    viewBox: "0 0 205.572 190.388",
    "aria-hidden": "true",
    style: {
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("g", {
    fill: inkColor
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "142.4988",
    width: "205.572",
    height: "5.8401"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "21.0244",
    y: "87.1345",
    width: "4.2049",
    height: "55.3643"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "60.7372",
    y: "116.8023",
    width: "4.2049",
    height: "25.6965"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "100.45",
    y: "54.8971",
    width: "4.2048",
    height: "87.6017"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "138.9947",
    y: "116.8023",
    width: "4.2049",
    height: "25.6965"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "177.5395",
    y: "87.1345",
    width: "4.2048",
    height: "55.3643"
  })), /*#__PURE__*/React.createElement("rect", {
    x: "156.515",
    y: "0",
    width: "5.1393",
    height: "190.388",
    fill: indicatorColor
  }));
}
function Logo({
  variant = 'lockup',
  tone = 'default',
  height = 28,
  style
}) {
  const ink = tone === 'reversed' ? 'var(--ink-reversed)' : 'var(--ink)';
  const markHeight = height;
  // Wordmark cap height is the mark height divided by 1.6 (toolkit p.06);
  // Playfair Display cap height is ~0.7em, so the type size follows.
  const fontSize = markHeight / 1.6 / 0.7;
  const gap = markHeight * 205.572 / 190.388 / 2;
  if (variant === 'mark') return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Mark, {
    height: markHeight,
    inkColor: ink,
    indicatorColor: "var(--accent)"
  }));
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'flex-end',
      gap,
      ...style
    }
  }, /*#__PURE__*/React.createElement(Mark, {
    height: markHeight,
    inkColor: ink,
    indicatorColor: "var(--accent)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-medium) ' + fontSize + 'px/0.72 var(--font-display)',
      color: ink,
      letterSpacing: '-0.005em'
    }
  }, "Vernier"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/data/BarChart.jsx
try { (() => {
function BarChart({
  data,
  height = 180,
  max,
  gridlines = 4,
  style
}) {
  const peak = max != null ? max : Math.max(...data.map(d => d.value));
  const tones = {
    accent: 'var(--series-2)',
    positive: 'var(--positive)',
    negative: 'var(--negative)',
    caution: 'var(--caution)',
    muted: 'var(--series-4)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height
    }
  }, Array.from({
    length: gridlines
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: i * height / gridlines,
      borderTop: '1px solid var(--chart-gridline)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 'var(--space-2)'
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: Math.max(2, d.value / peak * height),
      background: tones[d.tone || 'accent']
    },
    title: d.label + ': ' + d.value
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderTop: '1px solid var(--border)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 'var(--space-1)',
      font: 'var(--weight-regular) var(--size-ui-xs)/var(--leading-ui-xs) var(--font-mono)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, data[0] && data[0].label), /*#__PURE__*/React.createElement("span", null, data[data.length - 1] && data[data.length - 1].label)));
}
Object.assign(__ds_scope, { BarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BarChart.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function DataTable({
  columns,
  rows,
  selectedIndex,
  onRowClick,
  style
}) {
  const [hover, setHover] = React.useState(-1);
  const th = {
    font: 'var(--weight-regular) var(--size-ui-xs)/var(--leading-ui-xs) var(--font-mono)',
    letterSpacing: 'var(--tracking-label)',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    background: 'var(--surface-sunken)',
    padding: '10px 16px',
    borderBottom: 'var(--border-default)',
    whiteSpace: 'nowrap'
  };
  return /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: 'var(--radius-flat)',
      border: 'var(--border-default)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      ...th,
      textAlign: c.numeric ? 'right' : 'left'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => {
    const selected = ri === selectedIndex;
    return /*#__PURE__*/React.createElement("tr", {
      key: ri,
      onClick: onRowClick ? () => onRowClick(ri) : undefined,
      onMouseEnter: () => setHover(ri),
      onMouseLeave: () => setHover(-1),
      style: {
        background: selected ? 'var(--accent-tint)' : hover === ri ? 'var(--surface-sunken)' : 'var(--surface)',
        cursor: onRowClick ? 'pointer' : 'default'
      }
    }, columns.map((c, ci) => /*#__PURE__*/React.createElement("td", {
      key: ci,
      style: {
        padding: '12px 16px',
        borderBottom: ri === rows.length - 1 ? 'none' : 'var(--border-default)',
        textAlign: c.numeric ? 'right' : 'left',
        font: c.numeric || c.mono ? 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-mono)' : 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--ink)',
        whiteSpace: 'nowrap'
      }
    }, r[c.key])));
  })));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/Delta.jsx
try { (() => {
function Delta({
  value,
  unit = '%',
  decimals = 2,
  invert = false,
  size = 'md',
  style
}) {
  const negative = value < 0;
  const good = invert ? negative : !negative;
  const color = value === 0 ? 'var(--ink-secondary)' : good ? 'var(--positive)' : 'var(--negative)';
  const sign = negative ? '\u2212' : '+';
  const fonts = {
    sm: 'var(--size-ui-sm)',
    md: 'var(--size-ui-md)',
    lg: 'var(--size-ui-lg)'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-regular) ' + fonts[size] + '/1.4 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color,
      ...style
    }
  }, sign, Math.abs(value).toFixed(decimals), unit);
}
Object.assign(__ds_scope, { Delta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Delta.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
const tones = {
  neutral: {
    background: 'var(--surface-sunken)',
    color: 'var(--ink-secondary)'
  },
  accent: {
    background: 'var(--accent-tint)',
    color: 'var(--accent)'
  },
  positive: {
    background: 'var(--positive-tint)',
    color: 'var(--positive)'
  },
  caution: {
    background: 'var(--caution-tint)',
    color: 'var(--caution)'
  },
  negative: {
    background: 'var(--negative-tint)',
    color: 'var(--negative)'
  }
};
function Badge({
  tone = 'neutral',
  mono = false,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 'var(--radius-control)',
      padding: '3px 8px',
      font: mono ? 'var(--weight-regular) var(--size-ui-xs)/var(--leading-ui-xs) var(--font-mono)' : 'var(--weight-medium) var(--size-ui-sm)/1.3 var(--font-sans)',
      letterSpacing: mono ? '0.04em' : 'normal',
      ...tones[tone],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function Card({
  elevation = 0,
  sunken = false,
  padding = 'var(--space-3)',
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: sunken ? 'var(--surface-sunken)' : 'var(--surface)',
      border: 'var(--border-default)',
      borderRadius: 'var(--radius-container)',
      boxShadow: elevation === 1 ? 'var(--elevation-1)' : 'var(--elevation-0)',
      padding,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricCard.jsx
try { (() => {
function MetricCard({
  label,
  value,
  footnote,
  confidence,
  style
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    padding: "var(--space-2) var(--space-2) 14px",
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-medium) 34px/1.15 var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--ink)',
      margin: '6px 0 4px'
    }
  }, value), footnote && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-mono)',
      color: 'var(--ink-secondary)'
    }
  }, footnote), confidence != null && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--size-ui-xs)/var(--leading-ui-xs) var(--font-mono)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-muted)',
      marginTop: 'var(--space-1)'
    }
  }, "Confidence ", confidence.toFixed(2)));
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/display/Eyebrow.jsx
try { (() => {
function Eyebrow({
  tone = 'muted',
  children,
  style
}) {
  const colors = {
    muted: 'var(--ink-muted)',
    ink: 'var(--ink)',
    accent: 'var(--accent)',
    reversed: 'rgba(255,255,255,0.7)'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--size-ui-xs)/var(--leading-ui-xs) var(--font-mono)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: colors[tone],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  hint,
  value,
  placeholder,
  numeric = false,
  invalid = false,
  disabled = false,
  suffix,
  onChange,
  id,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-secondary)',
      marginBottom: 'var(--space-1)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface)',
      border: '1px solid ' + (invalid ? 'var(--negative)' : 'var(--border)'),
      borderRadius: 'var(--radius-container)',
      padding: '9px 12px',
      outline: focus ? 'var(--focus-ring)' : 'none',
      outlineOffset: 'var(--focus-offset)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: inputId,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      all: 'unset',
      flex: 1,
      minWidth: 0,
      font: numeric ? 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-mono)' : 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
      color: 'var(--ink)',
      textAlign: numeric ? 'right' : 'left'
    }
  }), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/1 var(--font-mono)',
      color: 'var(--ink-muted)'
    }
  }, suffix)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: invalid ? 'var(--negative)' : 'var(--ink-muted)',
      marginTop: 'var(--space-half)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// ui_kits/console/AppShell.jsx
try { (() => {
const {
  Logo,
  Icon,
  Eyebrow,
  Button
} = window.VernierDesignSystem_fc76dd;
const nav = [['index', 'Price index', 'gauge'], ['skus', 'SKUs', 'table-2'], ['floors', 'Margin floors', 'ruler'], ['sources', 'Sources', 'database'], ['notes', 'Briefing notes', 'file-text']];
function AppShell({
  view,
  onView,
  children,
  onRun
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '244px 1fr',
      minHeight: '100vh',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      borderRight: 'var(--border-default)',
      padding: 'var(--space-3) 0',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-3) var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 22
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'grid',
      gap: '2px',
      padding: '0 var(--space-1)'
    }
  }, nav.map(([id, label, icon]) => {
    const active = id === view;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      type: "button",
      onClick: () => onView(id),
      style: {
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 12px',
        borderRadius: 'var(--radius-container)',
        background: active ? 'var(--accent-tint)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--ink-secondary)',
        font: 'var(--weight-' + (active ? 'medium' : 'regular') + ') var(--size-ui-md)/1 var(--font-sans)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 16,
      tone: "current"
    }), label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      padding: 'var(--space-3)',
      borderTop: 'var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Data source"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-mono)',
      color: 'var(--ink-secondary)',
      marginTop: '6px'
    }
  }, "Q3 feed \xB7 42,610 obs"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px var(--space-4)',
      borderBottom: 'var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--weight-semibold) var(--size-ui-lg)/1 var(--font-sans)',
      color: 'var(--ink)'
    }
  }, "Price index"), /*#__PURE__*/React.createElement(Eyebrow, null, "EMEA \xB7 industrial \xB7 8 weeks")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16,
      tone: "current"
    })
  }, "Export"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: onRun
  }, "Run analysis"))), children));
}
Object.assign(window, {
  AppShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/console/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/console/PriceIndexScreen.jsx
try { (() => {
const {
  Eyebrow,
  Badge,
  Button,
  MetricCard,
  DataTable,
  BarChart,
  Delta,
  Input,
  Card
} = window.VernierDesignSystem_fc76dd;
const ROWS = [{
  sku: 'VX-4180',
  group: 'Industrial',
  list: '1,240.00',
  median: '1,187.50',
  d: -4.23,
  conf: '0.94',
  status: 'Below floor',
  tone: 'negative'
}, {
  sku: 'VX-4180-B',
  group: 'Industrial',
  list: '980.00',
  median: '972.10',
  d: -0.81,
  conf: '0.71',
  status: 'Within tolerance',
  tone: 'caution'
}, {
  sku: 'HD-0092',
  group: 'Hardware',
  list: '312.50',
  median: '328.90',
  d: 5.25,
  conf: '0.96',
  status: 'Headroom',
  tone: 'positive'
}, {
  sku: 'HD-0114',
  group: 'Hardware',
  list: '288.00',
  median: '286.40',
  d: -0.56,
  conf: '0.88',
  status: 'Within tolerance',
  tone: 'caution'
}, {
  sku: 'RM-7720',
  group: 'Raw material',
  list: '54.20',
  median: '58.75',
  d: 8.39,
  conf: '0.92',
  status: 'Headroom',
  tone: 'positive'
}, {
  sku: 'RM-7721',
  group: 'Raw material',
  list: '61.00',
  median: '57.10',
  d: -6.39,
  conf: '0.79',
  status: 'Below floor',
  tone: 'negative'
}];
const FILTERS = ['EMEA', 'Industrial', 'Confidence > 0.70'];
function PriceIndexScreen({
  selected,
  onSelect,
  floor,
  onFloor,
  ran
}) {
  const rows = ROWS.map(r => ({
    sku: r.sku,
    group: r.group,
    list: r.list,
    median: r.median,
    delta: /*#__PURE__*/React.createElement(Delta, {
      value: r.d
    }),
    conf: r.conf,
    status: /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--weight-regular) var(--size-ui-sm)/1 var(--font-sans)',
        color: 'var(--' + r.tone + ')'
      }
    }, r.status)
  }));
  const breaches = ROWS.filter(r => r.tone === 'negative').length;
  return /*#__PURE__*/React.createElement("main", {
    style: {
      padding: 'var(--space-3) var(--space-4) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      paddingBottom: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      flexWrap: 'wrap'
    }
  }, FILTERS.map(x => /*#__PURE__*/React.createElement(Badge, {
    key: x,
    tone: "accent"
  }, x)), /*#__PURE__*/React.createElement(Badge, {
    tone: "caution"
  }, "Stale \u2014 9 days")), /*#__PURE__*/React.createElement(Input, {
    label: "Margin floor",
    value: floor,
    numeric: true,
    suffix: "%",
    onChange: onFloor,
    style: {
      width: '180px'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "Margin at risk",
    value: "1.42m",
    footnote: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Delta, {
      value: -4.23
    }), " vs. floor")
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "SKUs in target",
    value: "1,806",
    footnote: "+112 this week"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Below floor",
    value: String(breaches),
    footnote: ran ? 'Re-read just now' : 'Last read 9 days ago'
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Median confidence",
    value: "0.94",
    confidence: 0.94
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-3)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 'var(--space-1)'
    }
  }, "Readings \xB7 ", ROWS.length, " of 1,806"), /*#__PURE__*/React.createElement(DataTable, {
    selectedIndex: selected,
    onRowClick: onSelect,
    columns: [{
      key: 'sku',
      label: 'SKU',
      mono: true
    }, {
      key: 'group',
      label: 'Group'
    }, {
      key: 'list',
      label: 'List',
      numeric: true
    }, {
      key: 'median',
      label: 'Market median',
      numeric: true
    }, {
      key: 'delta',
      label: 'Delta',
      numeric: true
    }, {
      key: 'conf',
      label: 'Confidence',
      numeric: true
    }, {
      key: 'status',
      label: 'Status'
    }],
    rows: rows
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Price index vs. market median \xB7 8 weeks"), /*#__PURE__*/React.createElement(BarChart, {
    style: {
      marginTop: 'var(--space-2)'
    },
    height: 150,
    data: [{
      label: 'W01',
      value: 58
    }, {
      label: 'W02',
      value: 64
    }, {
      label: 'W03',
      value: 55
    }, {
      label: 'W04',
      value: 71
    }, {
      label: 'W05',
      value: 67
    }, {
      label: 'W06',
      value: 82,
      tone: 'negative'
    }, {
      label: 'W07',
      value: 61
    }, {
      label: 'W08',
      value: 49,
      tone: 'positive'
    }]
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: 'var(--space-2) 0 0'
    }
  }, "Market median moved 4.23% above your list price across 1,806 SKUs. Confidence 0.94."))));
}
Object.assign(window, {
  PriceIndexScreen,
  CONSOLE_ROWS: ROWS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/console/PriceIndexScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/console/SkuDetailPanel.jsx
try { (() => {
const {
  Eyebrow,
  Badge,
  Button,
  Delta,
  DataTable,
  Icon
} = window.VernierDesignSystem_fc76dd;
function SkuDetailPanel({
  row,
  onClose
}) {
  if (!row) return null;
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      background: 'var(--surface)',
      borderLeft: 'var(--border-default)',
      boxShadow: 'var(--elevation-1)',
      padding: 'var(--space-3) var(--space-4)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Reading"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-medium) var(--size-ui-xl)/1.2 var(--font-mono)',
      color: 'var(--ink)',
      marginTop: '4px'
    }
  }, row.sku)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: {
      all: 'unset',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 20,
    tone: "muted"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)',
      margin: 'var(--space-2) 0 var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, row.group), /*#__PURE__*/React.createElement(Badge, {
    tone: row.tone
  }, row.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-2)',
      borderTop: 'var(--border-default)',
      borderBottom: 'var(--border-default)',
      padding: 'var(--space-2) 0'
    }
  }, [['List', row.list], ['Market median', row.median], ['Delta', /*#__PURE__*/React.createElement(Delta, {
    value: row.d
  })], ['Confidence', row.conf]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement(Eyebrow, null, k), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-medium) var(--size-ui-lg)/1.3 var(--font-mono)',
      color: 'var(--ink)',
      marginTop: '4px'
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Window \xB7 last four weeks"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'w',
      label: 'Week',
      mono: true
    }, {
      key: 'median',
      label: 'Median',
      numeric: true
    }, {
      key: 'conf',
      label: 'Confidence',
      numeric: true
    }],
    rows: [{
      w: 'W05',
      median: '1,204.00',
      conf: '0.91'
    }, {
      w: 'W06',
      median: '1,196.25',
      conf: '0.93'
    }, {
      w: 'W07',
      median: '1,190.00',
      conf: '0.94'
    }, {
      w: 'W08',
      median: row.median,
      conf: row.conf
    }]
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: 'var(--space-3) 0 var(--space-3)'
    }
  }, "Reading taken from 396 traceable observations in the eight-week window. Uncertainty is disclosed, not smoothed."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Add to briefing note"), /*#__PURE__*/React.createElement(Button, {
    variant: "quiet",
    size: "sm",
    onClick: onClose
  }, "Close")));
}
Object.assign(window, {
  SkuDetailPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/console/SkuDetailPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/AccessScreen.jsx
try { (() => {
const {
  Input,
  Button,
  Eyebrow,
  Card
} = window.VernierDesignSystem_fc76dd;
function AccessScreen({
  onSubmit,
  submitted
}) {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    company: '',
    skus: ''
  });
  const set = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  return /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '80px var(--margin-product) var(--space-8)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Request access"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--weight-medium) 56px/64px var(--font-display)',
      color: 'var(--ink)',
      margin: 'var(--space-3) 0 var(--space-3)'
    }
  }, "Scope coverage first."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-lg)/var(--leading-ui-lg) var(--font-sans)',
      color: 'var(--ink-secondary)',
      maxWidth: '30em',
      margin: 0
    }
  }, "We publish the coverage and confidence we can reach for your categories before any commitment. Expect a written reading, not a demo.")), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-4)"
  }, submitted ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "accent"
  }, "Received"), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--weight-semibold) var(--size-ui-xl)/var(--leading-ui-xl) var(--font-sans)',
      color: 'var(--ink)',
      margin: '10px 0 8px'
    }
  }, "We will come back with a coverage reading."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: 0
    }
  }, "Two working days, addressed to ", form.email || 'your inbox', ".")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSubmit();
    },
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    value: form.name,
    onChange: set('name'),
    placeholder: "Alexandra Reid"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    value: form.email,
    onChange: set('email'),
    placeholder: "a.reid@company.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Company",
    value: form.company,
    onChange: set('company')
  }), /*#__PURE__*/React.createElement(Input, {
    label: "SKUs priced",
    value: form.skus,
    onChange: set('skus'),
    numeric: true,
    placeholder: "1806"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onSubmit
  }, "Request access"), /*#__PURE__*/React.createElement(Button, {
    variant: "quiet"
  }, "Read the method")))));
}
Object.assign(window, {
  AccessScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/AccessScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/HomeScreen.jsx
try { (() => {
const {
  Button,
  Eyebrow,
  Badge,
  MetricCard,
  DataTable,
  BarChart,
  Delta
} = window.VernierDesignSystem_fc76dd;
const rows = [{
  sku: 'VX-4180',
  list: '1,240.00',
  median: '1,187.50',
  delta: /*#__PURE__*/React.createElement(Delta, {
    value: -4.23
  }),
  conf: '0.94'
}, {
  sku: 'VX-4180-B',
  list: '980.00',
  median: '972.10',
  delta: /*#__PURE__*/React.createElement(Delta, {
    value: -0.81
  }),
  conf: '0.71'
}, {
  sku: 'HD-0092',
  list: '312.50',
  median: '328.90',
  delta: /*#__PURE__*/React.createElement(Delta, {
    value: 5.25
  }),
  conf: '0.96'
}];
function HomeScreen({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px var(--margin-product) var(--space-8)',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Pricing intelligence"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--weight-medium) 64px/72px var(--font-display)',
      color: 'var(--ink)',
      margin: 'var(--space-3) 0 var(--space-3)',
      maxWidth: '11em'
    }
  }, "Price every SKU against the market it actually trades in."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-lg)/var(--leading-ui-lg) var(--font-sans)',
      color: 'var(--ink-secondary)',
      maxWidth: '34em',
      margin: 0
    }
  }, "Vernier reads observed transactions, publishes a market median for each SKU, and states the confidence behind every reading."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNavigate('access')
  }, "Request access"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNavigate('method')
  }, "Read the method"))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: 'var(--border-default)',
      borderRadius: 'var(--radius-container)',
      padding: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Price index vs. market median \xB7 8 weeks"), /*#__PURE__*/React.createElement(BarChart, {
    style: {
      marginTop: 'var(--space-2)'
    },
    height: 148,
    data: [{
      label: 'W01',
      value: 58
    }, {
      label: 'W02',
      value: 64
    }, {
      label: 'W03',
      value: 55
    }, {
      label: 'W04',
      value: 71
    }, {
      label: 'W05',
      value: 67
    }, {
      label: 'W06',
      value: 82,
      tone: 'negative'
    }, {
      label: 'W07',
      value: 61
    }, {
      label: 'W08',
      value: 49,
      tone: 'positive'
    }]
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 var(--margin-product) var(--space-8)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "Margin at risk, EMEA",
    value: "1.42m",
    footnote: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Delta, {
      value: -4.23
    }), " vs. floor")
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "SKUs in target",
    value: "1,806",
    footnote: "+112 this week"
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Median confidence",
    value: "0.94",
    footnote: "Across 42,610 observations"
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-sunken)',
      borderTop: 'var(--border-default)',
      borderBottom: 'var(--border-default)',
      padding: 'var(--space-8) var(--margin-product)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.4fr',
      gap: 'var(--space-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "What you get"), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--weight-medium) 40px/48px var(--font-display)',
      color: 'var(--ink)',
      margin: 'var(--space-2) 0 var(--space-2)'
    }
  }, "A reading, its source, and its confidence."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: 0
    }
  }, "Every figure Vernier publishes carries the window it was measured over and the confidence of the model that produced it. A number without a stated confidence is not published."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)',
      marginTop: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "EMEA"), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "NA"), /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, "Verified sources"), /*#__PURE__*/React.createElement(Badge, {
    tone: "caution"
  }, "Stale \u2014 9 days"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      border: 'var(--border-default)',
      borderRadius: 'var(--radius-container)',
      padding: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'sku',
      label: 'SKU',
      mono: true
    }, {
      key: 'list',
      label: 'List',
      numeric: true
    }, {
      key: 'median',
      label: 'Market median',
      numeric: true
    }, {
      key: 'delta',
      label: 'Delta',
      numeric: true
    }, {
      key: 'conf',
      label: 'Confidence',
      numeric: true
    }],
    rows: rows
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-8) var(--margin-product)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--space-4)'
    }
  }, [['01', 'Observed, not surveyed', 'Readings come from transactions we can trace to a source. Where coverage thins, the confidence drops and the figure says so.'], ['02', 'Floors you can defend', 'Set a margin floor per SKU group and see the exposure the moment the market crosses it.'], ['03', 'Built for review', 'Every view exports as a briefing note with the same figures, windows and confidences.']].map(([n, t, b]) => /*#__PURE__*/React.createElement("div", {
    key: n
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "accent"
  }, n), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--weight-semibold) var(--size-ui-lg)/var(--leading-ui-lg) var(--font-sans)',
      color: 'var(--ink)',
      margin: 'var(--space-1) 0 var(--space-1)'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: 0
    }
  }, b)))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-ink)',
      padding: 'var(--space-8) var(--margin-product)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--weight-medium) 40px/48px var(--font-display)',
      color: 'var(--ink-reversed)',
      margin: 0
    }
  }, "Access is granted per team."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
      color: 'rgba(255,255,255,0.7)',
      margin: '12px 0 0'
    }
  }, "Tell us the categories you price and we will scope coverage and confidence before you commit.")), /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNavigate('access')
  }, "Request access")));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/MethodScreen.jsx
try { (() => {
const {
  Eyebrow,
  Card,
  DataTable,
  Delta,
  Badge
} = window.VernierDesignSystem_fc76dd;
function MethodScreen() {
  return /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '80px var(--margin-product) var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Method"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--weight-medium) 56px/64px var(--font-display)',
      color: 'var(--ink)',
      margin: 'var(--space-3) 0 var(--space-4)',
      maxWidth: '20em'
    }
  }, "How a reading is taken."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-6)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, [['Observation', 'Transactions are collected per SKU, per market, per week. Each carries its source and its timestamp.'], ['Median', 'The market median is the middle observed price in the window, not a list-price average.'], ['Confidence', 'Confidence is the share of the window covered by traceable observations, reported 0.00-1.00.'], ['Window', 'Default window is eight weeks. Shorter windows raise volatility and lower confidence; both are shown.']].map(([t, b]) => /*#__PURE__*/React.createElement(Card, {
    key: t
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-md)/var(--leading-ui-md) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: '10px 0 0'
    }
  }, b)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Worked example \xB7 VX-4180, EMEA, 8 weeks"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'w',
      label: 'Week',
      mono: true
    }, {
      key: 'obs',
      label: 'Observations',
      numeric: true
    }, {
      key: 'median',
      label: 'Median',
      numeric: true
    }, {
      key: 'delta',
      label: 'Delta',
      numeric: true
    }, {
      key: 'conf',
      label: 'Confidence',
      numeric: true
    }],
    rows: [{
      w: 'W05',
      obs: '412',
      median: '1,204.00',
      delta: /*#__PURE__*/React.createElement(Delta, {
        value: -2.90
      }),
      conf: '0.91'
    }, {
      w: 'W06',
      obs: '388',
      median: '1,196.25',
      delta: /*#__PURE__*/React.createElement(Delta, {
        value: -3.53
      }),
      conf: '0.93'
    }, {
      w: 'W07',
      obs: '401',
      median: '1,190.00',
      delta: /*#__PURE__*/React.createElement(Delta, {
        value: -4.03
      }),
      conf: '0.94'
    }, {
      w: 'W08',
      obs: '396',
      median: '1,187.50',
      delta: /*#__PURE__*/React.createElement(Delta, {
        value: -4.23
      }),
      conf: '0.94'
    }]
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-secondary)',
      margin: 'var(--space-2) 0 0'
    }
  }, "Market median moved 4.23% below your list price across the window. Confidence 0.94."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, "Verified"), /*#__PURE__*/React.createElement(Badge, {
    mono: true
  }, "VX-4180")))));
}
Object.assign(window, {
  MethodScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/MethodScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SiteFooter.jsx
try { (() => {
const {
  Logo,
  Eyebrow
} = window.VernierDesignSystem_fc76dd;
const columns = [['Product', ['Market index', 'Margin floors', 'Confidence model', 'Integrations']], ['Method', ['How readings are taken', 'Sources and coverage', 'Confidence and windows']], ['Company', ['About', 'Careers', 'Contact']]];
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: 'var(--border-default)',
      padding: 'var(--space-6) var(--margin-product)',
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    height: 22
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-muted)',
      marginTop: 'var(--space-2)'
    }
  }, "AI-native decision infrastructure for pricing strategy.")), columns.map(([title, items]) => /*#__PURE__*/React.createElement("div", {
    key: title
  }, /*#__PURE__*/React.createElement(Eyebrow, null, title), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 'var(--space-2) 0 0',
      padding: 0,
      display: 'grid',
      gap: 'var(--space-1)'
    }
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      font: 'var(--weight-regular) var(--size-ui-sm)/var(--leading-ui-sm) var(--font-sans)',
      color: 'var(--ink-secondary)',
      textDecoration: 'none'
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: 'var(--border-default)',
      paddingTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "vernier.co"), /*#__PURE__*/React.createElement(Eyebrow, null, "\xA9 2026 Vernier")));
}
Object.assign(window, {
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/SiteHeader.jsx
try { (() => {
const {
  Logo,
  Button
} = window.VernierDesignSystem_fc76dd;
function SiteHeader({
  page,
  onNavigate
}) {
  const links = [['product', 'Product'], ['method', 'Method'], ['pricing', 'Pricing'], ['company', 'Company']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px var(--margin-product)',
      borderBottom: 'var(--border-default)',
      position: 'sticky',
      top: 0,
      background: 'var(--surface)',
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('home');
    },
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 24
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)'
    }
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate(id);
    },
    style: {
      font: 'var(--weight-regular) var(--size-ui-md)/1 var(--font-sans)',
      color: page === id ? 'var(--ink)' : 'var(--ink-secondary)',
      textDecoration: 'none'
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "quiet",
    size: "sm",
    onClick: () => onNavigate('access')
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onNavigate('access')
  }, "Request access")));
}
Object.assign(window, {
  SiteHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/SiteHeader.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.BarChart = __ds_scope.BarChart;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Delta = __ds_scope.Delta;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Input = __ds_scope.Input;

})();
