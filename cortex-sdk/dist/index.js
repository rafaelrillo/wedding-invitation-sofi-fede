// src/core/ir/errors.ts
var ErrorCode = {
  // Spec-canonical codes (§08-EVALUATION §6 error taxonomy)
  UNBOUND_PARAM: "UNBOUND_PARAM",
  CIRCULAR_REF: "CIRCULAR_REF",
  MALFORMED_NODE: "MALFORMED_NODE",
  DIVISION_BY_ZERO: "DIVISION_BY_ZERO",
  INVALID_PARAM_TYPE: "INVALID_PARAM_TYPE",
  INVARIANT_VIOLATION: "INVARIANT_VIOLATION",
  TYPE_MISMATCH: "TYPE_MISMATCH",
  INVALID_LITERAL: "INVALID_LITERAL",
  STACK_OVERFLOW: "STACK_OVERFLOW",
  GAMUT_EXHAUSTED: "GAMUT_EXHAUSTED",
  UNKNOWN_OPERATOR: "UNKNOWN_OPERATOR",
  CONVERGENCE_FAILED: "CONVERGENCE_FAILED",
  UNKNOWN_M3_ROLE: "UNKNOWN_M3_ROLE",
  UNSUPPORTED: "UNSUPPORTED",
  MISSING_CTX_FOR_CONVERSION: "MISSING_CTX_FOR_CONVERSION",
  INCOMPATIBLE_SPEC_VERSION: "INCOMPATIBLE_SPEC_VERSION",
  // Backward-compatibility alias (Phase 2-3 catch blocks)
  PARAM_NOT_FOUND: "PARAM_NOT_FOUND"
};
var CortexError = class extends Error {
  code;
  details;
  constructor(code, message, details) {
    super(message);
    this.name = "CortexError";
    this.code = code;
    if (details !== void 0) {
      this.details = details;
    }
  }
};

// src/core/operators/color/hue.ts
function normalize(h) {
  return (h % 360 + 360) % 360;
}
function hue_shift(h, delta) {
  return normalize(h + delta);
}
function hue_distance(h1, h2) {
  const d = Math.abs(normalize(h1) - normalize(h2));
  return d > 180 ? 360 - d : d;
}

// src/algebra/color/harmony.ts
function harmonic_hues(base, scheme) {
  const b = hue_shift(0, base);
  switch (scheme.kind) {
    case "complementary":
      return [b, hue_shift(b, 180)];
    case "split_complementary":
      return [b, hue_shift(b, 180 - scheme.angle), hue_shift(b, 180 + scheme.angle)];
    case "triadic":
      return [b, hue_shift(b, 120), hue_shift(b, 240)];
    case "tetradic":
      return [b, hue_shift(b, 90), hue_shift(b, 180), hue_shift(b, 270)];
    case "analogous": {
      if (scheme.count <= 0) return [];
      return Array.from({ length: scheme.count }, (_, i) => hue_shift(b, i * scheme.angle));
    }
    case "monochromatic":
      return [b];
    case "custom":
      return scheme.offsets.map((o) => hue_shift(b, o));
    default: {
      const _exhaustive = scheme;
      throw new CortexError(
        "UNKNOWN_OPERATOR",
        `harmonic_hues: unknown scheme kind '${_exhaustive.kind}'`
      );
    }
  }
}

// src/core/ir/build.ts
function lit_n(v) {
  return { kind: "lit", type: { _t: "Number" }, value: { _t: "Number", v } };
}
function lit_bool(v) {
  return { kind: "lit", type: { _t: "Boolean" }, value: { _t: "Boolean", v } };
}
function lit_ratio(v) {
  return { kind: "lit", type: { _t: "Ratio" }, value: { _t: "Ratio", v } };
}
function lit_hue(degrees) {
  return {
    kind: "lit",
    type: { _t: "Hue" },
    value: { _t: "Hue", degrees }
  };
}
function lit_step(n) {
  return {
    kind: "lit",
    type: { _t: "Step" },
    value: { _t: "Step", n: Math.round(n) }
  };
}
function lit_tag(domain, v) {
  return {
    kind: "lit",
    type: { _t: "Tag", domain },
    value: { _t: "Tag", domain, v }
  };
}
function lit_color(coords, space) {
  if (!coords.every((c) => Number.isFinite(c))) {
    throw new CortexError(
      "INVALID_LITERAL",
      `lit_color: coords contain non-finite values: [${coords.join(", ")}]`
    );
  }
  return {
    kind: "lit",
    type: { _t: "Color", space },
    value: { _t: "Color", coords, space }
  };
}
function make_param(name, type, default_) {
  const node = default_ !== void 0 ? { kind: "param", type, name, default: default_ } : { kind: "param", type, name };
  return node;
}
function param_n(name, default_) {
  return make_param(name, { _t: "Number" }, default_);
}
function param_bool(name, default_) {
  return make_param(name, { _t: "Boolean" }, default_);
}
function param_color(name, space, default_) {
  return make_param(name, { _t: "Color", space }, default_);
}
function param_hue(name, default_) {
  return make_param(name, { _t: "Hue" }, default_);
}
function make_op(op, type, args, opts) {
  const node = opts !== void 0 ? { kind: "op", op, type, args, opts } : { kind: "op", op, type, args };
  return node;
}
function if_(cond, then_, else_) {
  const node = { kind: "if", type: then_.type, cond, then: then_, else_ };
  return node;
}
function let_(name, value, body) {
  const binding = { name, type: value.type, value };
  const node = { kind: "let", type: body.type, bindings: [binding], body };
  return node;
}
function let_many(bindings, body) {
  const bound = bindings.map((b) => ({
    name: b.name,
    type: b.value.type,
    value: b.value
  }));
  const node = { kind: "let", type: body.type, bindings: bound, body };
  return node;
}
function lit_length(n, unit) {
  if (!Number.isFinite(n)) {
    throw new CortexError("INVALID_LITERAL", `lit_length: magnitude must be finite, got ${n}`);
  }
  return {
    kind: "lit",
    type: { _t: "Length", unit },
    value: { _t: "Length", magnitude: n, unit }
  };
}
function param_length(name, unit, default_) {
  return make_param(name, { _t: "Length", unit }, default_);
}
function seq_(exprs, result_type) {
  if (exprs.length === 0) {
    throw new CortexError("INVALID_LITERAL", "seq_: exprs must be non-empty");
  }
  const node = { kind: "seq", type: result_type, exprs };
  return node;
}
function target_hint_(target, hint, inner) {
  const node = { kind: "target_hint", type: inner.type, target, hint, inner };
  return node;
}
function comment_(doc, inner) {
  const node = { kind: "comment", type: inner.type, doc, inner };
  return node;
}
function ctx_query_color_scheme() {
  return {
    kind: "ctx_query",
    type: { _t: "Tag", domain: "ColorScheme" },
    query: { kind: "color_scheme" }
  };
}
function ctx_query_viewport(axis = "inline") {
  return {
    kind: "ctx_query",
    type: { _t: "Length", unit: "Px" },
    query: { kind: "viewport_size", axis }
  };
}
function ctx_query_container(axis = "inline") {
  return {
    kind: "ctx_query",
    type: { _t: "Length", unit: "Px" },
    query: { kind: "container_size", axis }
  };
}
function ctx_query_font_size(scope = "root") {
  return {
    kind: "ctx_query",
    type: { _t: "Length", unit: "Px" },
    query: { kind: "font_size", scope }
  };
}

// src/core/types/color.ts
function make_color(coords, space) {
  return { coords, space };
}

// src/core/types/hue.ts
function make_hue(degrees) {
  const normalized = (degrees % 360 + 360) % 360;
  return normalized;
}
function hue_diff(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

// src/core/conversion/gamut.ts
function in_srgb_gamut(rgb, tol = 0) {
  return rgb[0] >= -tol && rgb[0] <= 1 + tol && rgb[1] >= -tol && rgb[1] <= 1 + tol && rgb[2] >= -tol && rgb[2] <= 1 + tol;
}

// src/core/conversion/cam16_partial.ts
var VC_N = 0.18418651851244416;
var VC_AW = 29.98099719444734;
var VC_NBB = 1.0169191804458757;
var VC_NCB = 1.0169191804458757;
var VC_C = 0.69;
var VC_NC = 1;
var VC_FL = 0.3884814537800353;
var VC_Z = 1.909169568483652;
var VC_RGBD0 = 1.02117770275752;
var VC_RGBD1 = 0.9863077294280124;
var VC_RGBD2 = 0.9339605082802299;
var ALPHA_BASE = (1.64 - 0.29 ** VC_N) ** 0.73;
function signum(x) {
  return x < 0 ? -1 : x > 0 ? 1 : 0;
}
function cam16_xyz_to_jch(xyz) {
  const x = xyz[0] * 100;
  const y = xyz[1] * 100;
  const z = xyz[2] * 100;
  const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
  const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
  const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
  const rD = VC_RGBD0 * rC;
  const gD = VC_RGBD1 * gC;
  const bD = VC_RGBD2 * bC;
  const rAF = (VC_FL * Math.abs(rD) / 100) ** 0.42;
  const gAF = (VC_FL * Math.abs(gD) / 100) ** 0.42;
  const bAF = (VC_FL * Math.abs(bD) / 100) ** 0.42;
  const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
  const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
  const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
  const a = (11 * rA - 12 * gA + bA) / 11;
  const b = (rA + gA - 2 * bA) / 9;
  const atanDeg = Math.atan2(b, a) * 180 / Math.PI;
  const hue = atanDeg < 0 ? atanDeg + 360 : atanDeg >= 360 ? atanDeg - 360 : atanDeg;
  const p2 = (40 * rA + 20 * gA + bA) / 20;
  const ac = p2 * VC_NBB;
  const J = 100 * (ac / VC_AW) ** (VC_C * VC_Z);
  const u = (20 * rA + 20 * gA + 21 * bA) / 20;
  const huePrime = hue < 20.14 ? hue + 360 : hue;
  const eHue = 0.25 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
  const p1 = 5e4 / 13 * eHue * VC_NC * VC_NCB;
  const t = p1 * Math.sqrt(a * a + b * b) / (u + 0.305);
  const alpha = t ** 0.9 * ALPHA_BASE;
  const C = alpha * Math.sqrt(J / 100);
  return [J, hue, C];
}
function cam16_jch_to_xyz(J, C, h) {
  const alpha = C === 0 || J === 0 ? 0 : C / Math.sqrt(J / 100);
  const t = (alpha / ALPHA_BASE) ** (1 / 0.9);
  const hRad = h * Math.PI / 180;
  const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
  const ac = VC_AW * (J / 100) ** (1 / (VC_C * VC_Z));
  const p1 = eHue * (5e4 / 13) * VC_NC * VC_NCB;
  const p2 = ac / VC_NBB;
  const hSin = Math.sin(hRad);
  const hCos = Math.cos(hRad);
  const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
  const a = gamma * hCos;
  const b = gamma * hSin;
  const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
  const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
  const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
  const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
  const rC = signum(rA) * (100 / VC_FL) * rCBase ** (1 / 0.42);
  const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
  const gC = signum(gA) * (100 / VC_FL) * gCBase ** (1 / 0.42);
  const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
  const bC = signum(bA) * (100 / VC_FL) * bCBase ** (1 / 0.42);
  const rF = rC / VC_RGBD0;
  const gF = gC / VC_RGBD1;
  const bF = bC / VC_RGBD2;
  const X = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
  const Y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
  const Z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
  return [X / 100, Y / 100, Z / 100];
}

// src/core/conversion/lab.ts
var DELTA = 6 / 29;
var DELTA_CUBED = DELTA ** 3;
var DELTA_SQ_3 = 3 * DELTA * DELTA;
function f_lab(t) {
  return t > DELTA_CUBED ? Math.cbrt(t) : t / DELTA_SQ_3 + 4 / 29;
}
function lab_l_from_xyz(xyz) {
  return 116 * f_lab(xyz[1]) - 16;
}

// src/core/conversion/hct_xyz.ts
var BISECT_TOL = 1e-3;
var BISECT_MAX_ITER = 50;
var XYZ_D65_WHITE = [0.9504559270516718, 1, 1.0890577508399184];
function xyz_to_hct(xyz) {
  const T = lab_l_from_xyz(xyz);
  const [, h, C] = cam16_xyz_to_jch(xyz);
  return [h, C, T];
}
function hct_to_xyz(hct) {
  const [H, C, T] = hct;
  if (T <= 0) return [0, 0, 0];
  if (T >= 100) return XYZ_D65_WHITE;
  let j_low = 0;
  let j_high = 100;
  let iter = 0;
  while (j_high - j_low > BISECT_TOL && iter < BISECT_MAX_ITER) {
    const j_mid = (j_low + j_high) / 2;
    const l_mid = lab_l_from_xyz(cam16_jch_to_xyz(j_mid, C, H));
    if (l_mid < T) j_low = j_mid;
    else j_high = j_mid;
    iter++;
  }
  if (j_high - j_low > BISECT_TOL) {
    throw new CortexError(
      "CONVERGENCE_FAILED",
      `hct_to_xyz: bisection did not converge in ${iter} iterations`,
      { input: [H, C, T], iter, j_low, j_high }
    );
  }
  const xyz = cam16_jch_to_xyz(j_low, C, H);
  if (xyz[1] > 1) {
    const s = 1 / xyz[1];
    return [xyz[0] * s, 1, xyz[2] * s];
  }
  return xyz;
}

// src/core/conversion/constants.ts
var SRGB_ENCODE_THRESHOLD = 31308e-7;
var SRGB_DECODE_THRESHOLD = 0.04045;
var SRGB_ENCODE_SLOPE = 12.92;
var SRGB_ENCODE_A = 1.055;
var SRGB_ENCODE_GAMMA = 1 / 2.4;
var SRGB_ENCODE_OFFSET = 0.055;
var LINEARRGB_TO_XYZ = [
  [0.4123907992659595, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
];
var XYZ_TO_LINEARRGB = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007981249285, -0.20397695888897655, 1.0569715142428786]
];

// src/core/conversion/linearrgb_xyz.ts
function assert_finite_triple(v, fn) {
  if (!Number.isFinite(v[0]) || !Number.isFinite(v[1]) || !Number.isFinite(v[2])) {
    throw new CortexError("INVALID_LITERAL", `${fn}: non-finite input [${v[0]}, ${v[1]}, ${v[2]}]`);
  }
}
function matmul3(m, v) {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
  ];
}
function linearrgb_to_xyz(rgb) {
  assert_finite_triple(rgb, "linearrgb_to_xyz");
  return matmul3(LINEARRGB_TO_XYZ, rgb);
}
function xyz_to_linearrgb(xyz) {
  assert_finite_triple(xyz, "xyz_to_linearrgb");
  return matmul3(XYZ_TO_LINEARRGB, xyz);
}

// src/core/conversion/srgb.ts
function assert_finite(c, fn) {
  if (!Number.isFinite(c)) {
    throw new CortexError("INVALID_LITERAL", `${fn}: non-finite input ${c}`);
  }
}
function srgb_decode(c) {
  assert_finite(c, "srgb_decode");
  return c <= SRGB_DECODE_THRESHOLD ? c / SRGB_ENCODE_SLOPE : ((c + SRGB_ENCODE_OFFSET) / SRGB_ENCODE_A) ** 2.4;
}
function srgb_encode(c) {
  assert_finite(c, "srgb_encode");
  return c <= SRGB_ENCODE_THRESHOLD ? c * SRGB_ENCODE_SLOPE : SRGB_ENCODE_A * c ** SRGB_ENCODE_GAMMA - SRGB_ENCODE_OFFSET;
}
function srgb_decode_triple(rgb) {
  return [srgb_decode(rgb[0]), srgb_decode(rgb[1]), srgb_decode(rgb[2])];
}
function srgb_encode_triple(rgb) {
  return [srgb_encode(rgb[0]), srgb_encode(rgb[1]), srgb_encode(rgb[2])];
}

// src/core/conversion/srgb_xyz.ts
function srgb_to_xyz(rgb) {
  return linearrgb_to_xyz(srgb_decode_triple(rgb));
}
function xyz_to_srgb(xyz) {
  return srgb_encode_triple(xyz_to_linearrgb(xyz));
}

// src/core/conversion/srgb_hct.ts
function hct_to_srgb(hct) {
  return xyz_to_srgb(hct_to_xyz(hct));
}

// src/core/operators/color/gamut.ts
var GAMUT_TOL = 1e-3;
function gamut_map_to_srgb(H, C, T) {
  if (in_srgb_gamut(hct_to_srgb([H, C, T]))) return [H, C, T];
  let c_low = 0;
  let c_high = C;
  while (c_high - c_low > GAMUT_TOL) {
    const c_mid = (c_low + c_high) / 2;
    if (in_srgb_gamut(hct_to_srgb([H, c_mid, T]))) {
      c_low = c_mid;
    } else {
      c_high = c_mid;
    }
  }
  return [H, c_low, T];
}

// src/core/operators/color/mix.ts
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function hue_lerp(ha, hb, t) {
  let a = ha;
  let b = hb;
  if (Math.abs(b - a) > 180) {
    if (a < b) a += 360;
    else b += 360;
  }
  return ((a + (b - a) * t) % 360 + 360) % 360;
}
function mix_color(a, b, t) {
  const ct = Math.max(0, Math.min(1, t));
  if (ct === 0) return a;
  if (ct === 1) return b;
  const [a0, a1, a2] = a.coords;
  const [b0, b1, b2] = b.coords;
  if (a.space === "OKLCH" || a.space === "LCh") {
    return make_color([lerp(a0, b0, ct), lerp(a1, b1, ct), hue_lerp(a2, b2, ct)], a.space);
  }
  if (a.space === "HCT") {
    return make_color([hue_lerp(a0, b0, ct), lerp(a1, b1, ct), lerp(a2, b2, ct)], a.space);
  }
  return make_color([lerp(a0, b0, ct), lerp(a1, b1, ct), lerp(a2, b2, ct)], a.space);
}

// src/core/operators/color/palette.ts
var DEFAULT_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
function tonal_palette(source_hue, source_chroma, opts) {
  const tone_list = opts?.tones ?? DEFAULT_TONES;
  if (tone_list.length === 0) {
    throw new CortexError("INVALID_LITERAL", "tonal_palette: opts.tones must not be empty");
  }
  const hue = make_hue(source_hue);
  const sorted = [...tone_list].sort((a, b) => a - b);
  const tones = sorted.map((t) => {
    const [H, C, T] = gamut_map_to_srgb(hue, source_chroma, t);
    return { tone: t, color: make_color([H, C, T], "HCT") };
  });
  const palette = {
    space: "HCT",
    source_hue: hue,
    source_chroma,
    tones,
    ...opts?.name !== void 0 ? { name: opts.name } : {}
  };
  return palette;
}
function palette_at(palette, tone, opts) {
  const { tones } = palette;
  if (tones.length === 0) {
    return make_color([0, 0, 0], palette.space);
  }
  const first = tones[0];
  const last = tones[tones.length - 1];
  const exact = tones.find((tp) => tp.tone === tone);
  if (exact !== void 0) return exact.color;
  if (tone <= first.tone) return first.color;
  if (tone >= last.tone) return last.color;
  let lo_idx = 0;
  for (let i = 0; i < tones.length - 1; i++) {
    if (tones[i].tone <= tone && tone <= tones[i + 1].tone) {
      lo_idx = i;
      break;
    }
  }
  const lo = tones[lo_idx];
  const hi = tones[lo_idx + 1];
  if (!opts?.interpolate) {
    return Math.abs(tone - lo.tone) <= Math.abs(tone - hi.tone) ? lo.color : hi.color;
  }
  const t = (tone - lo.tone) / (hi.tone - lo.tone);
  return mix_color(lo.color, hi.color, t);
}

// src/algebra/color/roles.ts
var M3_ROLES = {
  // Primary palette
  primary: { palette: "primary", light_tone: 40, dark_tone: 80 },
  on_primary: { palette: "primary", light_tone: 100, dark_tone: 20 },
  primary_container: { palette: "primary", light_tone: 90, dark_tone: 30 },
  on_primary_container: { palette: "primary", light_tone: 30, dark_tone: 90 },
  // Secondary palette
  secondary: { palette: "secondary", light_tone: 40, dark_tone: 80 },
  on_secondary: { palette: "secondary", light_tone: 100, dark_tone: 20 },
  secondary_container: { palette: "secondary", light_tone: 90, dark_tone: 30 },
  on_secondary_container: { palette: "secondary", light_tone: 30, dark_tone: 90 },
  // Tertiary palette
  tertiary: { palette: "tertiary", light_tone: 40, dark_tone: 80 },
  on_tertiary: { palette: "tertiary", light_tone: 100, dark_tone: 20 },
  tertiary_container: { palette: "tertiary", light_tone: 90, dark_tone: 30 },
  on_tertiary_container: { palette: "tertiary", light_tone: 30, dark_tone: 90 },
  // Error palette (fixed H=25, C=84)
  error: { palette: "error", light_tone: 40, dark_tone: 80 },
  on_error: { palette: "error", light_tone: 100, dark_tone: 20 },
  error_container: { palette: "error", light_tone: 90, dark_tone: 30 },
  on_error_container: { palette: "error", light_tone: 30, dark_tone: 90 },
  // Neutral palette (background / surface)
  background: { palette: "neutral", light_tone: 98, dark_tone: 6 },
  on_background: { palette: "neutral", light_tone: 10, dark_tone: 90 },
  surface: { palette: "neutral", light_tone: 98, dark_tone: 6 },
  on_surface: { palette: "neutral", light_tone: 10, dark_tone: 90 },
  // Neutral variant palette
  surface_variant: { palette: "neutral_variant", light_tone: 90, dark_tone: 30 },
  on_surface_variant: { palette: "neutral_variant", light_tone: 30, dark_tone: 80 },
  outline: { palette: "neutral_variant", light_tone: 50, dark_tone: 60 },
  outline_variant: { palette: "neutral_variant", light_tone: 80, dark_tone: 30 }
};
function lookup_role(role) {
  const def = M3_ROLES[role];
  if (def === void 0) {
    throw new CortexError(
      "UNKNOWN_M3_ROLE",
      `Unknown M3 role: '${role}'. Valid roles: ${Object.keys(M3_ROLES).join(", ")}`,
      { role, valid_roles: Object.keys(M3_ROLES) }
    );
  }
  return def;
}

// src/algebra/color/m3.ts
function dark_mode_cond() {
  return make_op("eq", { _t: "Boolean" }, [
    ctx_query_color_scheme(),
    lit_tag("ColorScheme", "dark")
  ]);
}
function m3_role(scheme, role, mode) {
  const def = lookup_role(role);
  const palette = scheme[def.palette];
  if (mode !== void 0) {
    const tone = mode === "dark" ? def.dark_tone : def.light_tone;
    return palette_at(palette, tone);
  }
  const dark_color = palette_at(palette, def.dark_tone);
  const light_color = palette_at(palette, def.light_tone);
  return if_(
    dark_mode_cond(),
    lit_color(dark_color.coords, "HCT"),
    lit_color(light_color.coords, "HCT")
  );
}

// src/algebra/color/schemes.ts
function m3_scheme_tonal_spot(source_hue) {
  const h = (source_hue % 360 + 360) % 360;
  const t_hue = (h + 60) % 360;
  return {
    primary: tonal_palette(h, 48),
    secondary: tonal_palette(h, 16),
    tertiary: tonal_palette(t_hue, 24),
    neutral: tonal_palette(h, 4),
    neutral_variant: tonal_palette(h, 8),
    error: tonal_palette(25, 84)
  };
}

// src/algebra/size/stevens.ts
var STEVENS_AREA_EXPONENT = 0.7;
function stevens_area(perceived_ratio) {
  if (!Number.isFinite(perceived_ratio))
    throw new Error("stevens_area: perceived_ratio must be finite");
  if (perceived_ratio < 0) throw new Error("stevens_area: perceived_ratio must be non-negative");
  return perceived_ratio ** (1 / STEVENS_AREA_EXPONENT);
}
function stevens_general(perceived_ratio, exponent) {
  if (exponent <= 0) throw new Error("stevens_general: exponent must be positive");
  return perceived_ratio ** (1 / exponent);
}

// src/core/operators/length/fluid.ts
function fluid_coefficients(inner_min_px, inner_max_px, outer_min_px, outer_max_px) {
  const outer_range = outer_max_px - outer_min_px;
  if (outer_range === 0) {
    return { slope: 0, intercept_px: inner_min_px, slope_per_vw: 0 };
  }
  const slope = (inner_max_px - inner_min_px) / outer_range;
  const intercept_px = inner_min_px - slope * outer_min_px;
  return { slope, intercept_px, slope_per_vw: slope * 100 };
}
function fluid(inner_min, inner_max, outer_min, outer_max, outer_axis = "viewport") {
  return make_op(
    "fluid",
    inner_min.type,
    [inner_min, inner_max, outer_min, outer_max],
    { outer_axis: lit_tag("OuterAxis", outer_axis) }
  );
}

// src/core/operators/length/scale.ts
function step_to_length(step, base, ratio) {
  return make_op("step_to_length", base.type, [step, base, ratio]);
}

// src/algebra/size/type_scale.ts
function type_scale_step(n, base_param, ratio_param) {
  return step_to_length(lit_step(n), param_length(base_param, "Rem"), param_n(ratio_param));
}
function type_scale_fluid_step(n, base_min_param, base_max_param, ratio_min_param, ratio_max_param, vp_min_param, vp_max_param) {
  const inner_min = step_to_length(
    lit_step(n),
    param_length(base_min_param, "Rem"),
    param_n(ratio_min_param)
  );
  const inner_max = step_to_length(
    lit_step(n),
    param_length(base_max_param, "Rem"),
    param_n(ratio_max_param)
  );
  return fluid(
    inner_min,
    inner_max,
    param_length(vp_min_param, "Px"),
    param_length(vp_max_param, "Px")
  );
}

// src/core/context/context.ts
var empty_ctx = {
  bindings: /* @__PURE__ */ new Map(),
  env: /* @__PURE__ */ new Map()
};
function make_ctx(bindings, env, parent) {
  return parent !== void 0 ? { bindings, env, parent } : { bindings, env };
}
function ctx_extend(ctx, name, value) {
  const bindings = new Map(ctx.bindings);
  bindings.set(name, value);
  return make_ctx(bindings, ctx.env, ctx.parent);
}
function with_bindings(ctx, entries) {
  const bindings = new Map(ctx.bindings);
  for (const [name, value] of Object.entries(entries)) {
    bindings.set(name, value);
  }
  return make_ctx(bindings, ctx.env, ctx.parent);
}
function ctx_push(parent, child) {
  return make_ctx(child.bindings, child.env, parent);
}
function ctx_with_env(ctx, key, value) {
  const env = new Map(ctx.env);
  env.set(key, value);
  return make_ctx(ctx.bindings, env, ctx.parent);
}
function ctx_lookup(ctx, name) {
  let c = ctx;
  while (c !== void 0) {
    const entry = c.bindings.get(name);
    if (entry !== void 0) return entry;
    c = c.parent;
  }
  return void 0;
}
function ctx_env_lookup(ctx, query) {
  const key = query_key(query);
  let c = ctx;
  while (c !== void 0) {
    const val = c.env.get(key);
    if (val !== void 0) return val;
    c = c.parent;
  }
  return void 0;
}
function ctx_self_lookup(ctx, name) {
  return ctx.bindings.get(name);
}
function query_key(q) {
  switch (q.kind) {
    case "color_scheme":
      return "__env:color_scheme";
    case "density":
      return "__env:density";
    case "high_contrast":
      return "__env:high_contrast";
    case "reduced_motion":
      return "__env:reduced_motion";
    case "theme":
      return `__env:theme:${q.which}`;
    case "viewport_size":
      return `__env:viewport:${q.axis}`;
    case "container_size":
      return `__env:container:${q.axis}`;
    case "font_size":
      return `__env:font_size:${q.scope}`;
  }
}

// src/core/types/length.ts
function make_length(magnitude, unit) {
  return { magnitude, unit };
}
var KIND_OF = {
  Px: "absolute",
  Cm: "absolute",
  Mm: "absolute",
  In: "absolute",
  Pt: "absolute",
  Pc: "absolute",
  Em: "font",
  Rem: "font",
  Ch: "font",
  Ex: "font",
  Vw: "viewport",
  Vh: "viewport",
  Vmin: "viewport",
  Vmax: "viewport",
  Cqi: "container",
  Cqb: "container",
  Cqw: "container",
  Cqh: "container",
  Pct: "reference",
  Fr: "grid"
};
var UNIT_CSS_NAME = {
  Px: "px",
  Cm: "cm",
  Mm: "mm",
  In: "in",
  Pt: "pt",
  Pc: "pc",
  Em: "em",
  Rem: "rem",
  Ch: "ch",
  Ex: "ex",
  Vw: "vw",
  Vh: "vh",
  Vmin: "vmin",
  Vmax: "vmax",
  Cqi: "cqi",
  Cqb: "cqb",
  Cqw: "cqw",
  Cqh: "cqh",
  Pct: "%",
  Fr: "fr"
};

// src/core/context/root.ts
function root_context() {
  const env = /* @__PURE__ */ new Map([
    [query_key({ kind: "color_scheme" }), "light"],
    [query_key({ kind: "viewport_size", axis: "inline" }), make_length(1024, "Px")],
    [query_key({ kind: "viewport_size", axis: "block" }), make_length(768, "Px")],
    [query_key({ kind: "viewport_size", axis: "width" }), make_length(1024, "Px")],
    [query_key({ kind: "viewport_size", axis: "height" }), make_length(768, "Px")],
    [query_key({ kind: "font_size", scope: "current" }), make_length(16, "Px")],
    [query_key({ kind: "font_size", scope: "root" }), make_length(16, "Px")],
    [query_key({ kind: "density" }), 1],
    [query_key({ kind: "reduced_motion" }), false],
    [query_key({ kind: "high_contrast" }), false],
    [query_key({ kind: "theme", which: "name" }), "default"]
  ]);
  return { bindings: /* @__PURE__ */ new Map(), env };
}

// src/core/ir/expr.ts
function type_ref_eq(a, b) {
  if (a._t !== b._t) return false;
  if (a._t === "Color" && b._t === "Color") return a.space === b.space;
  if (a._t === "Length" && b._t === "Length") return a.unit === b.unit;
  if (a._t === "Angle" && b._t === "Angle") return a.unit === b.unit;
  if (a._t === "Time" && b._t === "Time") return a.unit === b.unit;
  if (a._t === "Palette" && b._t === "Palette") return a.space === b.space;
  if (a._t === "Tag" && b._t === "Tag") return a.domain === b.domain;
  if (a._t === "Var" && b._t === "Var") return a.id === b.id;
  return true;
}
function is_lit(n) {
  return n.kind === "lit";
}
function is_param(n) {
  return n.kind === "param";
}
function is_op(n) {
  return n.kind === "op";
}
function is_if(n) {
  return n.kind === "if";
}
function is_let(n) {
  return n.kind === "let";
}
function is_ctx_query(n) {
  return n.kind === "ctx_query";
}

// src/core/ir/resolve.ts
var MAX_DEPTH = 1e3;
function resolve(expr, ctx, ops, depth = 0) {
  if (depth > MAX_DEPTH) {
    throw new CortexError("STACK_OVERFLOW", `resolve: max recursion depth (${MAX_DEPTH}) exceeded`);
  }
  const next = depth + 1;
  switch (expr.kind) {
    case "lit": {
      const node = expr;
      return extract_primitive(node.value);
    }
    case "param": {
      const node = expr;
      const bound = ctx_lookup(ctx, node.name);
      if (bound === void 0) {
        if (node.default !== void 0) {
          return resolve(node.default, ctx, ops, next);
        }
        throw new CortexError("UNBOUND_PARAM", `param '${node.name}' is not bound in context`, {
          name: node.name
        });
      }
      return resolve(bound, ctx, ops, next);
    }
    case "if": {
      const node = expr;
      const cond = resolve(node.cond, ctx, ops, next);
      return resolve(cond ? node.then : node.else_, ctx, ops, next);
    }
    case "let": {
      const node = expr;
      let inner = ctx;
      for (const binding of node.bindings) {
        const val = resolve(binding.value, inner, ops, next);
        inner = ctx_extend(inner, binding.name, value_to_expr(val, binding.type));
      }
      return resolve(node.body, inner, ops, next);
    }
    case "op": {
      const node = expr;
      if (ops === void 0) {
        throw new CortexError("UNKNOWN_OPERATOR", `op '${node.op}' \u2014 no OpResolver provided`, {
          op: node.op
        });
      }
      const arg_vals = node.args.map((a) => resolve(a, ctx, ops, next));
      const opt_vals = node.opts !== void 0 ? Object.fromEntries(
        Object.entries(node.opts).map(([k, v]) => [k, resolve(v, ctx, ops, next)])
      ) : {};
      return ops(node.op, arg_vals, opt_vals, ctx);
    }
    case "seq": {
      const node = expr;
      let last;
      for (const e of node.exprs) {
        last = resolve(e, ctx, ops, next);
      }
      return last;
    }
    case "ctx_query": {
      const node = expr;
      const val = ctx_env_lookup(ctx, node.query);
      if (val === void 0) {
        throw new CortexError(
          "UNBOUND_PARAM",
          `ctx_query '${node.query.kind}' not found in context env`
        );
      }
      return val;
    }
    case "target_hint": {
      const node = expr;
      return resolve(node.inner, ctx, ops, next);
    }
    case "comment": {
      const node = expr;
      return resolve(node.inner, ctx, ops, next);
    }
    default: {
      throw new CortexError(
        "UNKNOWN_OPERATOR",
        `resolve: unknown node kind '${String(expr.kind)}'`
      );
    }
  }
}
function extract_primitive(v) {
  switch (v._t) {
    case "Number":
      return v.v;
    case "Boolean":
      return v.v;
    case "Ratio":
      return v.v;
    case "Hue":
      return v.degrees;
    case "Step":
      return v.n;
    case "Color":
      return make_color(
        [v.coords[0], v.coords[1], v.coords[2]],
        v.space
      );
    case "Tag":
      return v.v;
    case "Length":
      return { magnitude: v.magnitude, unit: v.unit };
    case "Angle":
      return v.magnitude;
    case "Time":
      return v.magnitude;
    case "Palette":
      return v;
    case "Scheme":
      return v;
  }
}
function value_to_expr(val, type) {
  const pv = runtime_to_primitive(val, type);
  return { kind: "lit", type, value: pv };
}
function runtime_to_primitive(val, type) {
  switch (type._t) {
    case "Number":
      return { _t: "Number", v: val };
    case "Boolean":
      return { _t: "Boolean", v: val };
    case "Ratio":
      return { _t: "Ratio", v: val };
    case "Hue":
      return { _t: "Hue", degrees: val };
    case "Step":
      return { _t: "Step", n: val };
    case "Color": {
      const c = val;
      return { _t: "Color", coords: c.coords, space: c.space };
    }
    case "Tag": {
      return { _t: "Tag", domain: type.domain, v: String(val) };
    }
    case "Length": {
      const l = val;
      return { _t: "Length", magnitude: l.magnitude, unit: l.unit };
    }
    case "Angle":
      return { _t: "Angle", magnitude: val, unit: type.unit };
    case "Time":
      return { _t: "Time", magnitude: val, unit: type.unit };
    case "Palette":
    case "Scheme":
    case "Curve":
    case "Var":
      throw new CortexError(
        "TYPE_MISMATCH",
        `value_to_expr: cannot wrap type '${type._t}' as a primitive let-binding`
      );
  }
}

// src/core/ir/visitor.ts
function compose(...visitors) {
  if (visitors.length === 0) {
    throw new CortexError("INVARIANT_VIOLATION", "compose: requires at least one visitor");
  }
  return {
    visit_lit: (n) => {
      let r;
      for (const v of visitors) r = v.visit_lit(n);
      return r;
    },
    visit_param: (n) => {
      let r;
      for (const v of visitors) r = v.visit_param(n);
      return r;
    },
    visit_let: (n) => {
      let r;
      for (const v of visitors) r = v.visit_let(n);
      return r;
    },
    visit_op: (n) => {
      let r;
      for (const v of visitors) r = v.visit_op(n);
      return r;
    },
    visit_if: (n) => {
      let r;
      for (const v of visitors) r = v.visit_if(n);
      return r;
    },
    visit_seq: (n) => {
      let r;
      for (const v of visitors) r = v.visit_seq(n);
      return r;
    },
    visit_ctx_query: (n) => {
      let r;
      for (const v of visitors) r = v.visit_ctx_query(n);
      return r;
    },
    visit_target_hint: (n) => {
      let r;
      for (const v of visitors) if (v.visit_target_hint) r = v.visit_target_hint(n);
      return r;
    },
    visit_comment: (n) => {
      let r;
      for (const v of visitors) if (v.visit_comment) r = v.visit_comment(n);
      return r;
    }
  };
}
function walk(node, visitor) {
  visitor.enter?.(node);
  let result;
  switch (node.kind) {
    case "lit":
      result = visitor.visit_lit(node);
      break;
    case "param":
      result = visitor.visit_param(node);
      break;
    case "let": {
      const n = node;
      for (const binding of n.bindings) {
        walk(binding.value, visitor);
      }
      walk(n.body, visitor);
      result = visitor.visit_let(n);
      break;
    }
    case "op": {
      const n = node;
      for (const arg of n.args) {
        walk(arg, visitor);
      }
      if (n.opts !== void 0) {
        for (const v of Object.values(n.opts)) {
          walk(v, visitor);
        }
      }
      result = visitor.visit_op(n);
      break;
    }
    case "if": {
      const n = node;
      walk(n.cond, visitor);
      walk(n.then, visitor);
      walk(n.else_, visitor);
      result = visitor.visit_if(n);
      break;
    }
    case "seq": {
      const n = node;
      for (const e of n.exprs) {
        walk(e, visitor);
      }
      result = visitor.visit_seq(n);
      break;
    }
    case "ctx_query":
      result = visitor.visit_ctx_query(node);
      break;
    case "target_hint": {
      const n = node;
      walk(n.inner, visitor);
      result = visitor.visit_target_hint ? visitor.visit_target_hint(n) : walk(n.inner, visitor);
      break;
    }
    case "comment": {
      const n = node;
      walk(n.inner, visitor);
      result = visitor.visit_comment ? visitor.visit_comment(n) : walk(n.inner, visitor);
      break;
    }
    default:
      throw new Error(`walk: unknown node kind '${String(node.kind)}'`);
  }
  return visitor.exit ? visitor.exit(node, result) : result;
}

// src/core/conversion/oklab_xyz.ts
var M1 = [
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707]
];
var M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766]
];
var M2_INV = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548]
];
var M1_INV = [
  [1.2270138511035211, -0.5577999806518222, 0.2812561489664678],
  [-0.0405801784232806, 1.1122568696168302, -0.0716766786656012],
  [-0.0763812845057069, -0.4214819784180127, 1.5861632204407947]
];
function matmul32(m, v) {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
  ];
}
function assert_finite_triple2(v, fn) {
  if (!Number.isFinite(v[0]) || !Number.isFinite(v[1]) || !Number.isFinite(v[2])) {
    throw new CortexError("INVALID_LITERAL", `${fn}: non-finite input`);
  }
}
function xyz_to_oklab(xyz) {
  assert_finite_triple2(xyz, "xyz_to_oklab");
  const lms = matmul32(M1, xyz);
  const lms_g = [Math.cbrt(lms[0]), Math.cbrt(lms[1]), Math.cbrt(lms[2])];
  return matmul32(M2, lms_g);
}
function oklab_to_xyz(lab) {
  assert_finite_triple2(lab, "oklab_to_xyz");
  const lms_g = matmul32(M2_INV, lab);
  const lms = [lms_g[0] ** 3, lms_g[1] ** 3, lms_g[2] ** 3];
  return matmul32(M1_INV, lms);
}

// src/core/conversion/oklch_oklab.ts
var EPSILON_COLOR_C = 1e-3;
function oklab_to_oklch(lab) {
  if (!Number.isFinite(lab[0]) || !Number.isFinite(lab[1]) || !Number.isFinite(lab[2])) {
    throw new CortexError("INVALID_LITERAL", "oklab_to_oklch: non-finite input");
  }
  const [l, a, b] = lab;
  const c = Math.sqrt(a * a + b * b);
  const h = c < EPSILON_COLOR_C ? 0 : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  return [l, c, h];
}
function oklch_to_oklab(lch) {
  if (!Number.isFinite(lch[0]) || !Number.isFinite(lch[1]) || !Number.isFinite(lch[2])) {
    throw new CortexError("INVALID_LITERAL", "oklch_to_oklab: non-finite input");
  }
  const [l, c, h] = lch;
  const h_rad = h * Math.PI / 180;
  return [l, c * Math.cos(h_rad), c * Math.sin(h_rad)];
}

// src/core/conversion/oklch_xyz.ts
function xyz_to_oklch(xyz) {
  return oklab_to_oklch(xyz_to_oklab(xyz));
}
function oklch_to_xyz(lch) {
  return oklab_to_xyz(oklch_to_oklab(lch));
}

// src/core/operators/color/construction.ts
function color_from_hue(hue, chroma, lightness, space) {
  if (space === "HCT") return make_color([hue, chroma, lightness], space);
  return make_color([lightness, chroma, hue], space);
}
function to_xyz(c) {
  const coords = c.coords;
  switch (c.space) {
    case "XYZ":
      return coords;
    case "sRGB":
      return srgb_to_xyz(coords);
    case "LinearRGB":
      return linearrgb_to_xyz(coords);
    case "OKLab":
      return oklab_to_xyz(coords);
    case "OKLCH":
      return oklch_to_xyz(coords);
    case "HCT":
      return hct_to_xyz(coords);
    default:
      throw new CortexError(
        "TYPE_MISMATCH",
        `convert_space: unsupported source space '${c.space}'`
      );
  }
}
function from_xyz(xyz, space) {
  let coords;
  switch (space) {
    case "XYZ":
      coords = xyz;
      break;
    case "sRGB":
      coords = xyz_to_srgb(xyz);
      break;
    case "LinearRGB":
      coords = xyz_to_linearrgb(xyz);
      break;
    case "OKLab":
      coords = xyz_to_oklab(xyz);
      break;
    case "OKLCH":
      coords = xyz_to_oklch(xyz);
      break;
    case "HCT":
      coords = xyz_to_hct(xyz);
      break;
    default:
      throw new CortexError("TYPE_MISMATCH", `convert_space: unsupported target space '${space}'`);
  }
  return make_color(coords, space);
}
function convert_space(color, target) {
  if (color.space === target) return color;
  return from_xyz(to_xyz(color), target);
}

// src/core/operators/color/luminance.ts
function relative_luminance(c) {
  const xyz = convert_space(c, "XYZ");
  return Math.max(0, xyz.coords[1]);
}

// src/core/operators/color/apca.ts
var NORM_BG = 0.56;
var NORM_TXT = 0.57;
var REV_BG = 0.65;
var REV_TXT = 0.62;
var SCALE = 1.14;
var LO_CLIP = 0.12;
function apca_contrast(text, bg) {
  const Y_txt = Math.max(0, relative_luminance(text));
  const Y_bg = Math.max(0, relative_luminance(bg));
  let Sa;
  if (Y_bg >= Y_txt) {
    Sa = (Y_bg ** NORM_BG - Y_txt ** NORM_TXT) * SCALE;
  } else {
    Sa = (Y_bg ** REV_BG - Y_txt ** REV_TXT) * SCALE;
  }
  if (Math.abs(Sa) < LO_CLIP) return 0;
  return Sa * 100;
}

// src/core/operators/color/components.ts
function l_idx(space) {
  return space === "HCT" ? 2 : 0;
}
function h_idx(space) {
  return space === "HCT" ? 0 : 2;
}
function color_l(c) {
  return c.coords[l_idx(c.space)];
}
function color_c(c) {
  return c.coords[1];
}
function color_h(c) {
  return c.coords[h_idx(c.space)];
}
function with_l(c, l) {
  const [a, b, d] = c.coords;
  if (c.space === "HCT") return make_color([a, b, l], c.space);
  return make_color([l, b, d], c.space);
}
function with_c(c, chroma) {
  const [a, , d] = c.coords;
  return make_color([a, chroma, d], c.space);
}
function with_h(c, h) {
  const [a, b, d] = c.coords;
  if (c.space === "HCT") return make_color([h, b, d], c.space);
  return make_color([a, b, h], c.space);
}

// src/core/operators/color/ensure_contrast.ts
var MAX_ITER = 20;
function l_range(space) {
  return space === "HCT" ? [0, 100] : [0, 1];
}
function apply_l(fg, l) {
  if (fg.space === "HCT") {
    const H = fg.coords[0];
    const C = fg.coords[1];
    const [H2, C2, T2] = gamut_map_to_srgb(H, C, l);
    return make_color([H2, C2, T2], "HCT");
  }
  return with_l(fg, l);
}
function ensure_contrast(fg, bg, target) {
  const abs_target = Math.abs(target);
  if (Math.abs(apca_contrast(fg, bg)) >= abs_target) return fg;
  const [l_min, l_max] = l_range(fg.space);
  const l_curr = color_l(fg);
  const Y_bg = relative_luminance(bg);
  const Y_fg = relative_luminance(fg);
  const should_darken = Y_bg >= Y_fg;
  const l_extreme = should_darken ? l_min : l_max;
  const extreme_fg = apply_l(fg, l_extreme);
  if (Math.abs(apca_contrast(extreme_fg, bg)) < abs_target) {
    return extreme_fg;
  }
  let l_best = l_extreme;
  let l_worst = l_curr;
  for (let i = 0; i < MAX_ITER; i++) {
    const mid = (l_best + l_worst) / 2;
    const mid_lc = Math.abs(apca_contrast(apply_l(fg, mid), bg));
    if (mid_lc >= abs_target) {
      l_best = mid;
    } else {
      l_worst = mid;
    }
  }
  return apply_l(fg, l_best);
}

// src/core/operators/color/operations.ts
function lighten(c, amount) {
  if (c.space === "HCT") {
    const T = Math.min(100, Math.max(0, color_l(c) + amount));
    const [H, C_out, T_out] = gamut_map_to_srgb(color_h(c), color_c(c), T);
    return make_color([H, C_out, T_out], c.space);
  }
  return with_l(c, Math.min(1, Math.max(0, color_l(c) + amount)));
}
function darken(c, amount) {
  return lighten(c, -amount);
}
function saturate(c, amount) {
  const newC = Math.max(0, color_c(c) + amount);
  if (c.space === "HCT") {
    const [H, C_out, T] = gamut_map_to_srgb(color_h(c), newC, color_l(c));
    return make_color([H, C_out, T], c.space);
  }
  return with_c(c, newC);
}
function desaturate(c, amount) {
  return saturate(c, -amount);
}
function shift_hue(c, delta) {
  const h = ((color_h(c) + delta) % 360 + 360) % 360;
  return with_h(c, h);
}
function complement(c) {
  return shift_hue(c, 180);
}

// src/core/operators/color/wcag.ts
function wcag_contrast(a, b) {
  const La = relative_luminance(a) + 0.05;
  const Lb = relative_luminance(b) + 0.05;
  return La >= Lb ? La / Lb : Lb / La;
}

// src/core/types/number.ts
function make_ratio(v) {
  return v;
}
function make_step(n) {
  return Math.round(n);
}

// src/core/types/space.ts
var COLOR_SPACES = [
  "OKLCH",
  "OKLab",
  "HCT",
  "LCh",
  "Lab",
  "sRGB",
  "LinearRGB",
  "P3",
  "XYZ"
];
function is_color_space(s) {
  return typeof s === "string" && COLOR_SPACES.includes(s);
}

// src/emit/targets/css/format.ts
function format_number(n, decimals = 3) {
  const s = parseFloat(n.toFixed(decimals)).toString();
  return s === "-0" ? "0" : s;
}
var POSITION_ORDER = {
  head: 0,
  "fallback-before": 1,
  body: 2,
  conditional: 3,
  footer: 4
};
function position_rank(pos) {
  return POSITION_ORDER[pos] ?? 2;
}
function composeCSS(fragments, opts = {}) {
  const { selector = ":root", inline_threshold = 1, usage_map } = opts;
  const valid = fragments.filter((f) => f !== void 0);
  if (valid.length === 0) return "";
  const sorted = [...valid].sort((a, b) => position_rank(a.position) - position_rank(b.position));
  const head_frags = sorted.filter((f) => f.position === "head");
  const cond_frags = sorted.filter((f) => f.position === "conditional");
  const footer_frags = sorted.filter((f) => f.position === "footer");
  const is_root_position = (f) => f.position === "body" || f.position === "fallback-before";
  const decl_frags = sorted.filter((f) => is_root_position(f) && f.fragment_kind === "custom-property").filter((f) => {
    if (!usage_map) return true;
    if (!f.source_node_path.startsWith("let:")) return true;
    const param_name = f.source_node_path.slice(4);
    return (usage_map.get(param_name) ?? 0) > inline_threshold;
  });
  const value_frags = sorted.filter(
    (f) => is_root_position(f) && f.fragment_kind !== "custom-property"
  );
  const parts = [];
  if (head_frags.length > 0) {
    parts.push(head_frags.map((f) => f.content).join("\n"));
  }
  if (decl_frags.length > 0) {
    const body = decl_frags.map((f) => `  ${f.content};`).join("\n");
    parts.push(`${selector} {
${body}
}`);
  }
  if (value_frags.length > 0) {
    parts.push(value_frags.map((f) => f.content).join("\n"));
  }
  if (cond_frags.length > 0) {
    parts.push(cond_frags.map((f) => f.content).join("\n"));
  }
  if (footer_frags.length > 0) {
    parts.push(footer_frags.map((f) => f.content).join("\n"));
  }
  return parts.join("\n\n");
}

// src/core/conversion/length_factors.ts
var ABSOLUTE_TO_PX = {
  Px: 1,
  Cm: 37.7952755906,
  Mm: 3.7795275591,
  In: 96,
  Pt: 1.3333333333,
  Pc: 16
};
function abs_to_abs(magnitude, from, to) {
  return magnitude * ABSOLUTE_TO_PX[from] / ABSOLUTE_TO_PX[to];
}

// src/core/operators/length/conversion.ts
var STANDARD_FONT_SIZE_PX = 16;
function convert_l_raw(val, target, ctx) {
  const from_unit = val.unit;
  const to_unit = target;
  if (from_unit === to_unit) return val;
  const from_kind = KIND_OF[from_unit];
  const to_kind = KIND_OF[to_unit];
  if (from_kind === "grid" || to_kind === "grid") return void 0;
  if (from_kind === "reference" || to_kind === "reference") return void 0;
  if (from_kind === "absolute" && to_kind === "absolute") {
    return make_length(
      abs_to_abs(val.magnitude, from_unit, to_unit),
      target
    );
  }
  const px_mag = to_px_mag(val.magnitude, from_unit, ctx);
  if (px_mag === void 0) return void 0;
  if (to_kind === "absolute") {
    return make_length(abs_to_abs(px_mag, "Px", to_unit), target);
  }
  return from_px_mag(px_mag, target, ctx);
}
function env_px(ctx, query) {
  const val = ctx_env_lookup(ctx, query);
  if (val === void 0 || val.magnitude === 0) return void 0;
  return val.magnitude;
}
function to_px_mag(magnitude, unit, ctx) {
  const kind = KIND_OF[unit];
  switch (kind) {
    case "absolute":
      return abs_to_abs(magnitude, unit, "Px");
    case "font": {
      switch (unit) {
        case "Rem": {
          const root_px = env_px(ctx, { kind: "font_size", scope: "root" });
          return root_px !== void 0 ? magnitude * root_px : void 0;
        }
        case "Em": {
          const em_px = env_px(ctx, { kind: "font_size", scope: "current" });
          return em_px !== void 0 ? magnitude * em_px : void 0;
        }
        case "Ch": {
          const em_px = env_px(ctx, { kind: "font_size", scope: "current" });
          return em_px !== void 0 ? magnitude * 0.5 * em_px : void 0;
        }
        case "Ex": {
          const em_px = env_px(ctx, { kind: "font_size", scope: "current" });
          return em_px !== void 0 ? magnitude * 0.5 * em_px : void 0;
        }
        default:
          return void 0;
      }
    }
    case "viewport": {
      const vw = env_px(ctx, { kind: "viewport_size", axis: "inline" });
      const vh = env_px(ctx, { kind: "viewport_size", axis: "block" });
      switch (unit) {
        case "Vw":
          return vw !== void 0 ? magnitude * vw / 100 : void 0;
        case "Vh":
          return vh !== void 0 ? magnitude * vh / 100 : void 0;
        case "Vmin":
          return vw !== void 0 && vh !== void 0 ? magnitude * Math.min(vw, vh) / 100 : void 0;
        case "Vmax":
          return vw !== void 0 && vh !== void 0 ? magnitude * Math.max(vw, vh) / 100 : void 0;
        default:
          return void 0;
      }
    }
    case "container": {
      const ci = env_px(ctx, { kind: "container_size", axis: "inline" });
      const cb = env_px(ctx, { kind: "container_size", axis: "block" });
      switch (unit) {
        case "Cqi":
        case "Cqw":
          return ci !== void 0 ? magnitude * ci / 100 : void 0;
        case "Cqb":
        case "Cqh":
          return cb !== void 0 ? magnitude * cb / 100 : void 0;
        default:
          return void 0;
      }
    }
    default:
      return void 0;
  }
}
function from_px_mag(px_mag, target, ctx) {
  const kind = KIND_OF[target];
  switch (kind) {
    case "absolute":
      return make_length(abs_to_abs(px_mag, "Px", target), target);
    case "font": {
      switch (target) {
        case "Rem": {
          const root_px = env_px(ctx, { kind: "font_size", scope: "root" });
          return root_px !== void 0 ? make_length(px_mag / root_px, target) : void 0;
        }
        case "Em": {
          const em_px = env_px(ctx, { kind: "font_size", scope: "current" });
          return em_px !== void 0 ? make_length(px_mag / em_px, target) : void 0;
        }
        case "Ch": {
          const em_px = env_px(ctx, { kind: "font_size", scope: "current" });
          return em_px !== void 0 ? make_length(px_mag / (0.5 * em_px), target) : void 0;
        }
        case "Ex": {
          const em_px = env_px(ctx, { kind: "font_size", scope: "current" });
          return em_px !== void 0 ? make_length(px_mag / (0.5 * em_px), target) : void 0;
        }
        default:
          return void 0;
      }
    }
    case "viewport": {
      const vw = env_px(ctx, { kind: "viewport_size", axis: "inline" });
      const vh = env_px(ctx, { kind: "viewport_size", axis: "block" });
      switch (target) {
        case "Vw":
          return vw !== void 0 ? make_length(px_mag / vw * 100, target) : void 0;
        case "Vh":
          return vh !== void 0 ? make_length(px_mag / vh * 100, target) : void 0;
        case "Vmin":
          return vw !== void 0 && vh !== void 0 ? make_length(px_mag / Math.min(vw, vh) * 100, target) : void 0;
        case "Vmax":
          return vw !== void 0 && vh !== void 0 ? make_length(px_mag / Math.max(vw, vh) * 100, target) : void 0;
        default:
          return void 0;
      }
    }
    case "container": {
      const ci = env_px(ctx, { kind: "container_size", axis: "inline" });
      const cb = env_px(ctx, { kind: "container_size", axis: "block" });
      switch (target) {
        case "Cqi":
        case "Cqw":
          return ci !== void 0 ? make_length(px_mag / ci * 100, target) : void 0;
        case "Cqb":
        case "Cqh":
          return cb !== void 0 ? make_length(px_mag / cb * 100, target) : void 0;
        default:
          return void 0;
      }
    }
    default:
      return void 0;
  }
}

// src/emit/targets/css/patterns/container.ts
function is_container_if(node) {
  if (node.kind !== "if") return false;
  const cond = node.cond;
  if (cond.kind !== "op") return false;
  if (cond.op !== "lt_l" && cond.op !== "gt_l") return false;
  const first = cond.args[0];
  if (!first || first.kind !== "ctx_query") return false;
  return first.query.kind === "container_size";
}
function get_threshold_px(node) {
  const cond = node.cond;
  const threshold_arg = cond.args[1];
  if (!threshold_arg || threshold_arg.kind !== "lit") {
    throw new CortexError("UNSUPPORTED", "container if threshold must be a literal Length");
  }
  const val = threshold_arg.value;
  if (val._t !== "Length") {
    throw new CortexError("UNSUPPORTED", "container if threshold must be a Length<Px> literal");
  }
  if (val.unit === "Px" && typeof val.magnitude === "number") return val.magnitude;
  throw new CortexError(
    "UNSUPPORTED",
    `container threshold unit '${val.unit}' cannot be converted to px`
  );
}
function collect_container_tiers(node, emit_fn) {
  if (!is_container_if(node)) {
    throw new Error("collect_container_tiers: node is not a container if");
  }
  const default_str = emit_fn(node.then);
  const breakpoints = [];
  let threshold_px = get_threshold_px(node);
  let current = node.else_;
  while (is_container_if(current)) {
    const cur = current;
    breakpoints.push({ px: threshold_px, value_str: emit_fn(cur.then) });
    threshold_px = get_threshold_px(cur);
    current = cur.else_;
  }
  breakpoints.push({ px: threshold_px, value_str: emit_fn(current) });
  return { default_str, breakpoints };
}

// src/emit/targets/css/length.ts
function param_to_css_var(name) {
  return `--${name.replace(/\./g, "-").replace(/[^a-zA-Z0-9\-_]/g, "-")}`;
}
function ctx_query_to_css_var(query) {
  switch (query.kind) {
    case "viewport_size":
      return `--env-viewport-${query.axis}`;
    case "container_size":
      return `--env-container-${query.axis}`;
    case "font_size":
      return `--env-font-size-${query.scope}`;
    default:
      throw new CortexError(
        "UNSUPPORTED",
        `emit_css_length: ctx_query kind '${query.kind}' is not supported in CSS size emit`
      );
  }
}
function length_to_px_static(magnitude, unit) {
  if (unit === "Px") return magnitude;
  if (unit === "Rem") return magnitude * STANDARD_FONT_SIZE_PX;
  const abs = ABSOLUTE_TO_PX[unit];
  if (abs !== void 0) return magnitude * abs;
  return void 0;
}
function px_to_unit_static(px_mag, unit) {
  if (unit === "Px") return px_mag;
  if (unit === "Rem") return px_mag / STANDARD_FONT_SIZE_PX;
  const abs = ABSOLUTE_TO_PX[unit];
  if (abs !== void 0) return px_mag * ABSOLUTE_TO_PX.Px / abs;
  return void 0;
}
function emit_scalar(expr) {
  if (expr.kind === "lit") {
    const v = expr.value;
    if (v._t === "Number" || v._t === "Ratio") return format_number(v.v);
    if (v._t === "Step") return String(v.n);
  }
  if (expr.kind === "param") {
    return `var(${param_to_css_var(expr.name)})`;
  }
  throw new CortexError(
    "UNSUPPORTED",
    `emit_css_length: cannot emit scalar from '${expr.kind}' node in step_to_length`
  );
}
function emit_length_scalar(expr) {
  if (expr.kind === "lit" && expr.value._t === "Length") {
    const unit = UNIT_CSS_NAME[expr.value.unit] ?? expr.value.unit.toLowerCase();
    return `${format_number(expr.value.magnitude)}${unit}`;
  }
  if (expr.kind === "param") {
    return `var(${param_to_css_var(expr.name)})`;
  }
  throw new CortexError(
    "UNSUPPORTED",
    `emit_css_length: cannot emit length scalar from '${expr.kind}' node in step_to_length`
  );
}
function emit_css_length(expr) {
  switch (expr.kind) {
    case "lit": {
      const v = expr.value;
      if (v._t !== "Length") {
        throw new CortexError("TYPE_MISMATCH", `emit_css_length: expected Length, got '${v._t}'`);
      }
      const unit = UNIT_CSS_NAME[v.unit] ?? v.unit.toLowerCase();
      return `${format_number(v.magnitude)}${unit}`;
    }
    case "param": {
      return `var(${param_to_css_var(expr.name)})`;
    }
    case "ctx_query": {
      return `var(${ctx_query_to_css_var(expr.query)})`;
    }
    case "op": {
      switch (expr.op) {
        case "add_l": {
          const [a, b] = expr.args;
          if (!a || !b)
            throw new CortexError("INVALID_LITERAL", "emit_css_length: add_l requires 2 args");
          return `calc(${emit_css_length(a)} + ${emit_css_length(b)})`;
        }
        case "sub_l": {
          const [a, b] = expr.args;
          if (!a || !b)
            throw new CortexError("INVALID_LITERAL", "emit_css_length: sub_l requires 2 args");
          return `calc(${emit_css_length(a)} - ${emit_css_length(b)})`;
        }
        case "mul_l": {
          const [a, b] = expr.args;
          if (!a || !b)
            throw new CortexError("INVALID_LITERAL", "emit_css_length: mul_l requires 2 args");
          return `calc(${emit_css_length(a)} * ${emit_scalar(b)})`;
        }
        case "div_l": {
          const [a, b] = expr.args;
          if (!a || !b)
            throw new CortexError("INVALID_LITERAL", "emit_css_length: div_l requires 2 args");
          return `calc(${emit_css_length(a)} / ${emit_scalar(b)})`;
        }
        case "neg_l": {
          const [a] = expr.args;
          if (!a) throw new CortexError("INVALID_LITERAL", "emit_css_length: neg_l requires 1 arg");
          if (a.kind === "lit" && a.value._t === "Length") {
            const unit = UNIT_CSS_NAME[a.value.unit] ?? a.value.unit.toLowerCase();
            return `-${format_number(a.value.magnitude)}${unit}`;
          }
          return `calc(-1 * ${emit_css_length(a)})`;
        }
        case "step_to_length": {
          const [step_node, base_node, ratio_node] = expr.args;
          if (!step_node || !base_node || !ratio_node) {
            throw new CortexError(
              "INVALID_LITERAL",
              "emit_css_length: step_to_length requires 3 args"
            );
          }
          if (step_node.kind === "lit" && step_node.value._t === "Step" && base_node.kind === "param" && base_node.name === "scale.base" && ratio_node.kind === "param" && ratio_node.name === "scale.ratio") {
            return `var(--scale-step-${step_node.value.n})`;
          }
          if (step_node.kind === "lit" && step_node.value._t === "Step" && base_node.kind === "lit" && base_node.value._t === "Length" && ratio_node.kind === "lit" && (ratio_node.value._t === "Number" || ratio_node.value._t === "Ratio")) {
            const step_n = step_node.value.n;
            const base_mag = base_node.value.magnitude;
            const ratio_v = ratio_node.value.v;
            const result = base_mag * ratio_v ** step_n;
            const unit = UNIT_CSS_NAME[base_node.value.unit] ?? base_node.value.unit.toLowerCase();
            return `${format_number(result)}${unit}`;
          }
          const base_css = emit_length_scalar(base_node);
          const ratio_css = emit_scalar(ratio_node);
          const step_css = emit_scalar(step_node);
          return `calc(${base_css} * pow(${ratio_css}, ${step_css}))`;
        }
        case "fluid": {
          const [inner_min_node, inner_max_node, outer_min_node, outer_max_node] = expr.args;
          if (!inner_min_node || !inner_max_node || !outer_min_node || !outer_max_node) {
            throw new CortexError("INVALID_LITERAL", "emit_css_length: fluid requires 4 args");
          }
          if (inner_min_node.kind !== "lit" || inner_min_node.value._t !== "Length" || inner_max_node.kind !== "lit" || inner_max_node.value._t !== "Length") {
            throw new CortexError(
              "UNSUPPORTED",
              "emit_css_length: fluid inner args must be Length literals for static CSS emit (param-based fluid is not supported in Phase 3)"
            );
          }
          if (outer_min_node.kind !== "lit" || outer_min_node.value._t !== "Length" || outer_max_node.kind !== "lit" || outer_max_node.value._t !== "Length") {
            throw new CortexError(
              "UNSUPPORTED",
              "emit_css_length: fluid outer args must be Length literals"
            );
          }
          const inner_unit = inner_min_node.value.unit;
          const outer_unit = outer_min_node.value.unit;
          if (outer_unit !== "Px" || outer_max_node.value.unit !== "Px") {
            throw new CortexError(
              "UNSUPPORTED",
              `emit_css_length: fluid outer args must be Px (got '${outer_unit}')`
            );
          }
          const inner_min_px = length_to_px_static(inner_min_node.value.magnitude, inner_unit);
          const inner_max_px = length_to_px_static(inner_max_node.value.magnitude, inner_unit);
          if (inner_min_px === void 0 || inner_max_px === void 0) {
            throw new CortexError(
              "UNSUPPORTED",
              `emit_css_length: fluid inner unit '${inner_unit}' cannot be statically converted to Px (requires runtime context)`
            );
          }
          const { intercept_px, slope_per_vw } = fluid_coefficients(
            inner_min_px,
            inner_max_px,
            outer_min_node.value.magnitude,
            outer_max_node.value.magnitude
          );
          const intercept_inner = px_to_unit_static(intercept_px, inner_unit);
          if (intercept_inner === void 0) {
            throw new CortexError(
              "UNSUPPORTED",
              `emit_css_length: cannot convert fluid intercept from Px to '${inner_unit}'`
            );
          }
          const outer_axis_node = expr.opts?.outer_axis;
          const outer_axis_v = outer_axis_node?.kind === "lit" && outer_axis_node.value._t === "Tag" ? outer_axis_node.value.v : "viewport";
          const outer_css_unit = outer_axis_v === "container" ? "cqi" : "vw";
          const inner_css_unit = UNIT_CSS_NAME[inner_unit] ?? inner_unit.toLowerCase();
          const min_str = `${format_number(inner_min_node.value.magnitude)}${inner_css_unit}`;
          const max_str = `${format_number(inner_max_node.value.magnitude)}${inner_css_unit}`;
          const intercept_str = `${format_number(intercept_inner, 4)}${inner_css_unit}`;
          const slope_str = `${format_number(slope_per_vw, 4)}${outer_css_unit}`;
          return `clamp(${min_str}, ${intercept_str} + ${slope_str}, ${max_str})`;
        }
        default:
          throw new CortexError("UNSUPPORTED", `emit_css_length: unsupported op '${expr.op}'`);
      }
    }
    case "if": {
      if (!is_container_if(expr)) {
        throw new CortexError(
          "UNSUPPORTED",
          "emit_css_length: only the container_size if-pattern is supported for IfNode (use is_container_if() to detect; @container rules require Phase 5 emit pipeline)"
        );
      }
      return emit_css_length(expr.else_);
    }
    default:
      throw new CortexError("UNSUPPORTED", `emit_css_length: unsupported node kind '${expr.kind}'`);
  }
}

// src/emit/targets/css/light_dark.ts
function is_color_scheme_if(node) {
  if (node.kind !== "if") return false;
  const cond = node.cond;
  if (cond.kind !== "op" || cond.op !== "eq") return false;
  const [a, b] = cond.args;
  if (!a || a.kind !== "ctx_query" || a.query.kind !== "color_scheme") return false;
  if (!b || b.kind !== "lit" || b.value._t !== "Tag" || b.value.v !== "dark") return false;
  return true;
}

// src/emit/targets/css/color.ts
function emit_oklch_coords(coords) {
  const l = format_number(coords[0]);
  const c = format_number(coords[1]);
  const h = format_number(coords[2]);
  return `oklch(${l} ${c} ${h})`;
}
function emit_css_color(expr) {
  switch (expr.kind) {
    case "lit": {
      const v = expr.value;
      if (v._t !== "Color") {
        throw new CortexError("TYPE_MISMATCH", `emit_css_color: expected Color, got '${v._t}'`);
      }
      if (v.space === "OKLCH") {
        return emit_oklch_coords(v.coords);
      }
      if (v.space === "sRGB") {
        const r = format_number(v.coords[0]);
        const g = format_number(v.coords[1]);
        const b = format_number(v.coords[2]);
        return `color(srgb ${r} ${g} ${b})`;
      }
      if (v.space === "P3") {
        const r = format_number(v.coords[0]);
        const g = format_number(v.coords[1]);
        const b = format_number(v.coords[2]);
        return `color(display-p3 ${r} ${g} ${b})`;
      }
      const oklch = convert_space(make_color(v.coords, v.space), "OKLCH");
      return emit_oklch_coords(oklch.coords);
    }
    case "if": {
      if (!is_color_scheme_if(expr)) {
        throw new CortexError(
          "UNSUPPORTED",
          "emit_css_color: only the color_scheme if-pattern is supported for IfNode"
        );
      }
      const light = emit_css_color(expr.else_);
      const dark = emit_css_color(expr.then);
      return `light-dark(${light}, ${dark})`;
    }
    case "param": {
      return `var(${param_to_css_var(expr.name)})`;
    }
    case "ctx_query": {
      const q = expr.query;
      if (q.kind === "color_scheme") {
        return "var(--cortex-color-scheme)";
      }
      throw new CortexError(
        "UNSUPPORTED",
        `emit_css_color: ctx_query kind '${q.kind}' is not a color value`
      );
    }
    case "op": {
      if (expr.op === "with_l" || expr.op === "with_c" || expr.op === "with_h") {
        const [base_node, val_node] = expr.args;
        if (!base_node || !val_node) {
          throw new CortexError("INVALID_LITERAL", `emit_css_color: ${expr.op} requires 2 args`);
        }
        const base_css = emit_css_color(base_node);
        let val_css;
        if (val_node.kind === "lit" && (val_node.value._t === "Number" || val_node.value._t === "Hue")) {
          const v = val_node.value;
          val_css = format_number(v.v ?? v.degrees ?? 0);
        } else if (val_node.kind === "param") {
          val_css = `var(${param_to_css_var(val_node.name)})`;
        } else {
          throw new CortexError(
            "UNSUPPORTED",
            `emit_css_color: ${expr.op} value must be a Number literal or Param`
          );
        }
        if (expr.op === "with_l") return `oklch(from ${base_css} ${val_css} c h)`;
        if (expr.op === "with_c") return `oklch(from ${base_css} l ${val_css} h)`;
        return `oklch(from ${base_css} l c ${val_css})`;
      }
      if (expr.op === "mix") {
        const [a, b, t_node] = expr.args;
        if (!a || !b || !t_node) {
          throw new CortexError("INVALID_LITERAL", "emit_css_color: mix requires 3 args");
        }
        if (t_node.kind === "lit" && t_node.value._t === "Ratio") {
          const pct = format_number(t_node.value.v * 100, 2);
          return `color-mix(in oklch, ${emit_css_color(a)}, ${emit_css_color(b)} ${pct}%)`;
        }
        let t_css;
        if (t_node.kind === "param") {
          t_css = `var(${param_to_css_var(t_node.name)})`;
        } else if (t_node.kind === "lit" && t_node.value._t === "Number") {
          t_css = format_number(t_node.value.v);
        } else {
          throw new CortexError(
            "UNSUPPORTED",
            "emit_css_color: mix ratio must be a Ratio literal, Number literal, or Param"
          );
        }
        return `color-mix(in oklch, ${emit_css_color(a)}, ${emit_css_color(b)} calc(${t_css} * 100%))`;
      }
      throw new CortexError("UNSUPPORTED", `emit_css_color: unsupported op '${expr.op}'`);
    }
    default:
      throw new CortexError("UNSUPPORTED", `emit_css_color: unsupported node kind '${expr.kind}'`);
  }
}

// src/emit/targets/css/capabilities.ts
var CSS_TARGET_CAPABILITIES = {
  supported_node_kinds: [
    "lit",
    "param",
    "let",
    "op",
    "if",
    "seq",
    "ctx_query",
    "target_hint",
    "comment"
  ],
  supported_operators: [
    // Color
    "mix",
    "with_l",
    "with_c",
    "with_h",
    // Length arithmetic
    "add_l",
    "sub_l",
    "mul_l",
    "div_l",
    "neg_l",
    "step_to_length",
    "fluid",
    // Comparison (used in if-patterns)
    "lt_l",
    "gt_l",
    "eq",
    // Scale
    "scale"
  ],
  supported_color_spaces: ["OKLCH", "sRGB", "HCT", "P3"],
  features: {
    custom_properties: true,
    fluid_clamp: true,
    container_queries: true,
    reactive: false,
    conditionals: true,
    alpha: false,
    gradients: false,
    shadows: false
  }
};

// src/emit/targets/css/patterns/multi-mode.ts
function detect_color_scheme_ifs(expr) {
  let found = false;
  const detector = {
    visit_lit: () => {
    },
    visit_param: () => {
    },
    visit_let: () => {
    },
    visit_op: () => {
    },
    visit_if: (node) => {
      if (is_color_scheme_if(node)) found = true;
    },
    visit_seq: () => {
    },
    visit_ctx_query: () => {
    },
    visit_target_hint: () => {
    },
    visit_comment: () => {
    }
  };
  walk(expr, detector);
  return found;
}
function extract_light_dark_css(node, emit_fn) {
  return {
    light_css: emit_fn(node.else_),
    dark_css: emit_fn(node.then)
  };
}

// src/emit/targets/css/strategy.ts
function dot_to_css_var(name) {
  if (!name) return "--unnamed";
  const slug = name.split(".").filter(Boolean).join("-").replace(/[^a-zA-Z0-9\-_]/g, "-");
  return `--${slug}`;
}
function count_param_usage(expr) {
  const counts = /* @__PURE__ */ new Map();
  const counter = {
    visit_lit: () => {
    },
    visit_param: (node) => {
      counts.set(node.name, (counts.get(node.name) ?? 0) + 1);
    },
    visit_let: () => {
    },
    visit_op: () => {
    },
    visit_if: () => {
    },
    visit_seq: () => {
    },
    visit_ctx_query: () => {
    },
    visit_target_hint: () => {
    },
    visit_comment: () => {
    }
  };
  walk(expr, counter);
  return counts;
}
function build_root_block(declarations) {
  if (declarations.length === 0) return "";
  return `:root {
${declarations.map((d) => `  ${d}`).join("\n")}
}`;
}

// src/emit/targets/css/at-property.ts
function typeref_to_css_syntax(typeRef) {
  switch (typeRef._t) {
    case "Length":
      return "<length>";
    case "Color":
      return "<color>";
    case "Number":
      return "<number>";
    case "Ratio":
      return "<percentage>";
    case "Hue":
      return "<angle>";
    default:
      return "<custom-ident>";
  }
}
function initial_value_for(typeRef) {
  switch (typeRef._t) {
    case "Length":
      return "0px";
    case "Color":
      return "oklch(0 0 0)";
    case "Number":
      return "0";
    case "Ratio":
      return "0%";
    case "Hue":
      return "0deg";
    default:
      return "none";
  }
}
function emit_property_registration(css_var_name, typeRef) {
  if (typeRef._t === "Tag" || typeRef._t === "Boolean") return void 0;
  const syntax = typeref_to_css_syntax(typeRef);
  const initial = initial_value_for(typeRef);
  return `@property ${css_var_name} {
  syntax: "${syntax}";
  inherits: false;
  initial-value: ${initial};
}`;
}

// src/emit/targets/css/compat/fallback.ts
function clamp(n) {
  return Math.min(1, Math.max(0, n));
}
function p3_to_srgb_linear(coords) {
  const [r, g, b] = coords;
  return [
    1.2249401 * r + -0.2249401 * g + 0 * b,
    -0.0420569 * r + 1.0420569 * g + 0 * b,
    -0.0196376 * r + -0.0786361 * g + 1.0982735 * b
  ];
}
function srgb_coords_str(r, g, b) {
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) throw new Error("NaN coords");
  const rc = format_number(clamp(r));
  const gc = format_number(clamp(g));
  const bc = format_number(clamp(b));
  return `color(srgb ${rc} ${gc} ${bc})`;
}
function srgb_fallback_for(v) {
  if (v.space === "sRGB") return void 0;
  if (v.space === "P3") {
    try {
      const r = v.coords[0] ?? 0;
      const g = v.coords[1] ?? 0;
      const b = v.coords[2] ?? 0;
      const linear_p3 = [srgb_decode(r), srgb_decode(g), srgb_decode(b)];
      const linear_srgb = p3_to_srgb_linear(linear_p3);
      return srgb_coords_str(
        srgb_encode(linear_srgb[0]),
        srgb_encode(linear_srgb[1]),
        srgb_encode(linear_srgb[2])
      );
    } catch {
      return void 0;
    }
  }
  try {
    const src = make_color(v.coords, v.space);
    const srgb = convert_space(src, "sRGB");
    return srgb_coords_str(srgb.coords[0], srgb.coords[1], srgb.coords[2]);
  } catch {
    return void 0;
  }
}

// src/emit/targets/css/patterns/media.ts
function is_viewport_if(node) {
  if (node.kind !== "if") return false;
  const cond = node.cond;
  if (cond.kind !== "op") return false;
  if (cond.op !== "lt_l" && cond.op !== "gt_l") return false;
  const first = cond.args[0];
  if (!first || first.kind !== "ctx_query") return false;
  return first.query.kind === "viewport_size";
}
function get_threshold_px2(node) {
  const cond = node.cond;
  const threshold_arg = cond.args[1];
  if (!threshold_arg || threshold_arg.kind !== "lit") {
    throw new CortexError("UNSUPPORTED", "viewport if threshold must be a literal Length");
  }
  const val = threshold_arg.value;
  if (val._t !== "Length") {
    throw new CortexError("UNSUPPORTED", "viewport if threshold must be a Length<Px> literal");
  }
  if (val.unit === "Px" && typeof val.magnitude === "number") return val.magnitude;
  throw new CortexError(
    "UNSUPPORTED",
    `viewport threshold unit '${val.unit}' cannot be converted to px`
  );
}
function collect_viewport_tiers(node, emit_fn) {
  if (!is_viewport_if(node)) {
    throw new Error("collect_viewport_tiers: node is not a viewport if");
  }
  const default_str = emit_fn(node.then);
  const breakpoints = [];
  let threshold_px = get_threshold_px2(node);
  let current = node.else_;
  while (is_viewport_if(current)) {
    const cur = current;
    breakpoints.push({ px: threshold_px, value_str: emit_fn(cur.then) });
    threshold_px = get_threshold_px2(cur);
    current = cur.else_;
  }
  breakpoints.push({ px: threshold_px, value_str: emit_fn(current) });
  return { default_str, breakpoints };
}

// src/emit/targets/css/visitor.ts
var _walk_acc = [];
var _custom_acc = [];
var _dark_mode_strategy = "light-dark";
var _themes = {};
var _compat = "baseline-2024";
var _color_scheme_declared = false;
function configure_emit(opts) {
  _compat = opts.compat ?? "baseline-2024";
  _dark_mode_strategy = opts.dark_mode_strategy ?? "light-dark";
  if (_compat === "baseline-2022" && _dark_mode_strategy === "light-dark") {
    _dark_mode_strategy = "media-query";
  }
  _themes = opts.themes ?? {};
  _color_scheme_declared = false;
}
function reset_walk() {
  _walk_acc.length = 0;
  _custom_acc.length = 0;
  _color_scheme_declared = false;
}
function collected_fragments() {
  return [..._custom_acc, ..._walk_acc];
}
function push_frag(content, kind, position, path = "node") {
  const f = { source_node_path: path, fragment_kind: kind, content, position };
  _walk_acc.push(f);
  return f;
}
function value_frag(content, path = "node") {
  return push_frag(content, "value", "body", path);
}
function push_custom_prop(content, path, position = "body") {
  const f = {
    source_node_path: path,
    fragment_kind: "custom-property",
    content,
    position
  };
  _custom_acc.push(f);
  return f;
}
function needs_srgb_fallback() {
  return _compat === "baseline-2022" || _compat === "baseline-2020";
}
var css_visitor = {
  // ── LitNode ────────────────────────────────────────────────────────────────
  visit_lit(node) {
    const v = node.value;
    let content;
    try {
      if (v._t === "Color") {
        if (needs_srgb_fallback()) {
          const fallback = srgb_fallback_for(
            v
          );
          if (fallback !== void 0) {
            push_frag(fallback, "value", "fallback-before", "lit:color:srgb");
          }
        }
        content = emit_css_color(node);
      } else if (v._t === "Length") {
        content = emit_css_length(node);
      } else if (v._t === "Number") {
        content = format_number(v.v);
      } else if (v._t === "Ratio") {
        content = format_number(v.v);
      } else {
        return void 0;
      }
    } catch {
      return void 0;
    }
    return value_frag(content, "lit");
  },
  // ── ParamNode → var(--name) ────────────────────────────────────────────────
  visit_param(node) {
    const content = `var(${param_to_css_var(node.name)})`;
    return value_frag(content, node.name);
  },
  // ── LetNode ────────────────────────────────────────────────────────────────
  // Children (bindings + body) are walked before visit_let is called.
  // Emit a custom-property declaration for each binding whose value can be
  // emitted, then return the body's canonical fragment.
  visit_let(node) {
    const body_canonical = _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
    for (const binding of node.bindings) {
      let value_str;
      try {
        if (binding.type._t === "Color") {
          value_str = emit_css_color(binding.value);
        } else if (binding.type._t === "Length") {
          value_str = emit_css_length(binding.value);
        } else if (binding.value.kind === "lit") {
          const v = binding.value.value;
          if ((v._t === "Number" || v._t === "Ratio") && typeof v.v === "number") {
            value_str = format_number(v.v);
          }
        }
      } catch {
      }
      if (value_str !== void 0) {
        if (needs_srgb_fallback() && binding.type._t === "Color" && binding.value.kind === "lit") {
          const lit_v = binding.value.value;
          const fallback = srgb_fallback_for(lit_v);
          if (fallback !== void 0) {
            push_custom_prop(
              `${dot_to_css_var(binding.name)}: ${fallback}`,
              `let:${binding.name}`,
              "fallback-before"
            );
          }
        }
        push_custom_prop(`${dot_to_css_var(binding.name)}: ${value_str}`, `let:${binding.name}`);
      }
    }
    return body_canonical;
  },
  // ── OpNode ─────────────────────────────────────────────────────────────────
  visit_op(node) {
    let content;
    try {
      if (node.type._t === "Color") {
        content = emit_css_color(node);
      } else if (node.type._t === "Length") {
        content = emit_css_length(node);
      } else {
        return void 0;
      }
    } catch {
      return void 0;
    }
    return value_frag(content, `op:${node.op}`);
  },
  // ── IfNode ─────────────────────────────────────────────────────────────────
  visit_if(node) {
    try {
      if (is_color_scheme_if(node)) {
        if (_dark_mode_strategy === "media-query") {
          try {
            const { light_css, dark_css } = extract_light_dark_css(node, emit_css_color);
            const default_frag = value_frag(light_css, "if:color_scheme:light");
            push_frag(
              `@media (prefers-color-scheme: dark) {
  :root {
    ${dark_css};
  }
}`,
              "at-rule",
              "conditional",
              "if:color_scheme:media"
            );
            return default_frag;
          } catch {
            return _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
          }
        }
        if (_dark_mode_strategy === "class") {
          try {
            const { light_css, dark_css } = extract_light_dark_css(node, emit_css_color);
            const default_frag = value_frag(light_css, "if:color_scheme:light");
            for (const theme_name of Object.keys(_themes)) {
              const theme_val = theme_name === "dark" ? dark_css : light_css;
              push_frag(
                `.theme-${theme_name} {
  ${theme_val};
}`,
                "selector-block",
                "conditional",
                `if:color_scheme:class:${theme_name}`
              );
            }
            return default_frag;
          } catch {
            return _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
          }
        }
        if (!_color_scheme_declared) {
          _color_scheme_declared = true;
          push_custom_prop("color-scheme: light dark", "color-scheme-auto");
        }
        const content = emit_css_color(node);
        return value_frag(content, "if:color_scheme");
      }
      if (is_container_if(node)) {
        try {
          const { default_str, breakpoints } = collect_container_tiers(node, emit_css_length);
          const default_frag = value_frag(default_str, "if:container:default");
          for (const bp of breakpoints) {
            push_frag(
              `@container (min-width: ${bp.px}px) {
  :root {
    ${bp.value_str};
  }
}`,
              "at-rule",
              "conditional",
              `if:container:${bp.px}`
            );
            if (_compat === "baseline-2020") {
              push_frag(
                `@media (min-width: ${bp.px}px) {
  :root {
    ${bp.value_str};
  }
}`,
                "at-rule",
                "conditional",
                `if:container:media-twin:${bp.px}`
              );
            }
          }
          return default_frag;
        } catch {
          return _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
        }
      }
      if (is_viewport_if(node)) {
        try {
          const { default_str, breakpoints } = collect_viewport_tiers(node, emit_css_length);
          const default_frag = value_frag(default_str, "if:viewport:default");
          for (const bp of breakpoints) {
            push_frag(
              `@media (min-width: ${bp.px}px) {
  :root {
    ${bp.value_str};
  }
}`,
              "at-rule",
              "conditional",
              `if:viewport:${bp.px}`
            );
          }
          return default_frag;
        } catch {
          return _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
        }
      }
      const if_node = node;
      if (if_node.type._t === "Length") {
        try {
          const content = emit_css_length(if_node);
          return value_frag(content, "if:length");
        } catch {
          return void 0;
        }
      }
      return void 0;
    } catch {
      return void 0;
    }
  },
  // ── SeqNode ────────────────────────────────────────────────────────────────
  // Each expr was walked; their fragments are in _walk_acc. Return the last (canonical).
  visit_seq(_node) {
    return _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
  },
  // ── CtxQueryNode ───────────────────────────────────────────────────────────
  visit_ctx_query(node) {
    if (node.type._t === "Length") {
      try {
        const content2 = emit_css_length(node);
        return value_frag(content2, `ctx:${node.query.kind}`);
      } catch {
        return void 0;
      }
    }
    const q = node.query;
    let content;
    switch (q.kind) {
      case "color_scheme":
        content = "var(--cortex-color-scheme)";
        break;
      case "viewport_size":
        content = `var(--env-viewport-${q.axis})`;
        break;
      case "container_size":
        content = `var(--env-container-${q.axis})`;
        break;
      case "font_size":
        content = `var(--env-font-size-${q.scope})`;
        break;
      default:
        return void 0;
    }
    return value_frag(content, `ctx:${q.kind}`);
  },
  // ── TargetHintNode ─────────────────────────────────────────────────────────
  visit_target_hint(node) {
    if (node.target !== "css") {
      return _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
    }
    const css_var_name = typeof node.hint.css_var_name === "string" ? node.hint.css_var_name : void 0;
    const override_position = typeof node.hint.position === "string" ? node.hint.position : void 0;
    if (node.hint.register_property === true) {
      let var_name = css_var_name;
      if (!var_name && node.inner.kind === "param") {
        var_name = param_to_css_var(node.inner.name);
      }
      if (var_name) {
        const at_prop = emit_property_registration(var_name, node.inner.type);
        if (at_prop !== void 0) {
          push_frag(at_prop, "at-rule", "head", "target_hint:register_property");
        }
      }
    }
    const inner_frag = _walk_acc.length > 0 ? _walk_acc[_walk_acc.length - 1] : void 0;
    let content = inner_frag?.content ?? "";
    if (css_var_name) {
      content = `${css_var_name}: ${content}`;
    }
    const position = override_position ?? inner_frag?.position ?? "body";
    return push_frag(content, inner_frag?.fragment_kind ?? "value", position, "target_hint");
  },
  // ── CommentNode ─────────────────────────────────────────────────────────────
  visit_comment(node) {
    const comment_frag = push_frag(`/* ${node.doc} */`, "css-comment", "head", "comment");
    return comment_frag;
  }
};

// src/emit/targets/css/validate.ts
var SUPPORTED_OPS = new Set(CSS_TARGET_CAPABILITIES.supported_operators);
var SUPPORTED_SPACES = new Set(CSS_TARGET_CAPABILITIES.supported_color_spaces);
var SUPPORTED_KINDS = new Set(CSS_TARGET_CAPABILITIES.supported_node_kinds);
function validate(expr, opts = {}) {
  const issues = [];
  const severity = opts.fallback_policy === "lossy" ? "warning" : "error";
  const checker = {
    visit_lit: (node) => {
      const v = node.value;
      if (v._t === "Color") {
        const space = v.space;
        if (!SUPPORTED_SPACES.has(space)) {
          issues.push({
            severity,
            code: "UNSUPPORTED_COLOR_SPACE",
            message: `Color space '${space}' is not supported by the CSS target`,
            node_path: "lit:color"
          });
        }
      }
    },
    visit_param: () => {
    },
    visit_let: () => {
    },
    visit_op: (node) => {
      if (!SUPPORTED_OPS.has(node.op)) {
        issues.push({
          severity,
          code: "UNSUPPORTED_OPERATOR",
          message: `Operator '${node.op}' is not supported by the CSS target`,
          node_path: `op:${node.op}`
        });
      }
    },
    visit_if: () => {
    },
    visit_seq: () => {
    },
    visit_ctx_query: () => {
    },
    visit_target_hint: (node) => {
      if (!SUPPORTED_KINDS.has(node.kind)) {
        issues.push({
          severity,
          code: "UNSUPPORTED_NODE_KIND",
          message: `Node kind '${node.kind}' is not supported by the CSS target`
        });
      }
    },
    visit_comment: () => {
    }
  };
  walk(expr, checker);
  return issues;
}

// src/emit/targets/css/index.ts
var _last_validation_issues = [];
var css_target = {
  name: "css",
  version: "0.1.0",
  cortex_spec_version: "0.1",
  capabilities: CSS_TARGET_CAPABILITIES,
  visit: css_visitor,
  validate(expr, opts) {
    const issues = validate(expr, opts);
    _last_validation_issues = issues;
    return issues;
  },
  format(fragments, opts) {
    if (opts?.fallback_policy === "strict" && _last_validation_issues.some((i) => i.severity === "error")) {
      _last_validation_issues = [];
      throw new CortexError(
        "UNSUPPORTED",
        "Validation errors prevent emit in strict mode (fallback_policy: strict)"
      );
    }
    return composeCSS(fragments, opts);
  }
};

// src/core/operators/color/resolver.ts
function as_color(v, op, pos) {
  if (typeof v !== "object" || v === null || !("coords" in v) || !("space" in v)) {
    throw new CortexError("TYPE_MISMATCH", `${op}: arg[${pos}] is not a Color`);
  }
  return v;
}
function as_hue(v, op, pos) {
  if (typeof v !== "number") {
    throw new CortexError(
      "TYPE_MISMATCH",
      `${op}: arg[${pos}] expected hue (number), got ${typeof v}`
    );
  }
  return v;
}
function as_number(v, op, pos) {
  if (typeof v !== "number") {
    throw new CortexError("TYPE_MISMATCH", `${op}: arg[${pos}] expected number, got ${typeof v}`);
  }
  return v;
}
function as_string(v, op, pos) {
  if (typeof v !== "string") {
    throw new CortexError("TYPE_MISMATCH", `${op}: arg[${pos}] expected string, got ${typeof v}`);
  }
  return v;
}
function as_palette(v, op, pos) {
  if (typeof v !== "object" || v === null || !("tones" in v) || !("space" in v)) {
    throw new CortexError("TYPE_MISMATCH", `${op}: arg[${pos}] is not a Palette`);
  }
  return v;
}
var color_catalog_entries = {
  mix: (args) => mix_color(
    as_color(args[0], "mix", 0),
    as_color(args[1], "mix", 1),
    as_number(args[2], "mix", 2)
  ),
  color_from_hue: (args) => color_from_hue(
    as_hue(args[0], "color_from_hue", 0),
    as_number(args[1], "color_from_hue", 1),
    as_number(args[2], "color_from_hue", 2),
    as_string(args[3], "color_from_hue", 3)
  ),
  convert_space: (args) => convert_space(
    as_color(args[0], "convert_space", 0),
    as_string(args[1], "convert_space", 1)
  ),
  color_l: (args) => color_l(as_color(args[0], "color_l", 0)),
  color_c: (args) => color_c(as_color(args[0], "color_c", 0)),
  color_h: (args) => color_h(as_color(args[0], "color_h", 0)),
  with_l: (args) => with_l(as_color(args[0], "with_l", 0), as_number(args[1], "with_l", 1)),
  with_c: (args) => with_c(as_color(args[0], "with_c", 0), as_number(args[1], "with_c", 1)),
  with_h: (args) => with_h(as_color(args[0], "with_h", 0), as_number(args[1], "with_h", 1)),
  lighten: (args) => lighten(as_color(args[0], "lighten", 0), as_number(args[1], "lighten", 1)),
  darken: (args) => darken(as_color(args[0], "darken", 0), as_number(args[1], "darken", 1)),
  saturate: (args) => saturate(as_color(args[0], "saturate", 0), as_number(args[1], "saturate", 1)),
  desaturate: (args) => desaturate(as_color(args[0], "desaturate", 0), as_number(args[1], "desaturate", 1)),
  shift_hue: (args) => shift_hue(as_color(args[0], "shift_hue", 0), as_number(args[1], "shift_hue", 1)),
  complement: (args) => complement(as_color(args[0], "complement", 0)),
  tonal_palette: (args, opts) => {
    const tones = opts.tones;
    const name = opts.name;
    const o = {};
    if (tones !== void 0) o.tones = tones;
    if (name !== void 0) o.name = name;
    return tonal_palette(
      as_number(args[0], "tonal_palette", 0),
      as_number(args[1], "tonal_palette", 1),
      o
    );
  },
  palette_at: (args, opts) => {
    const interpolate = opts.interpolate;
    const o = {};
    if (interpolate !== void 0) o.interpolate = interpolate;
    return palette_at(as_palette(args[0], "palette_at", 0), as_number(args[1], "palette_at", 1), o);
  },
  apca_contrast: (args) => apca_contrast(as_color(args[0], "apca_contrast", 0), as_color(args[1], "apca_contrast", 1)),
  wcag_contrast: (args) => wcag_contrast(as_color(args[0], "wcag_contrast", 0), as_color(args[1], "wcag_contrast", 1)),
  ensure_contrast: (args) => ensure_contrast(
    as_color(args[0], "ensure_contrast", 0),
    as_color(args[1], "ensure_contrast", 1),
    as_number(args[2], "ensure_contrast", 2)
  ),
  hue_shift: (args) => hue_shift(as_hue(args[0], "hue_shift", 0), as_number(args[1], "hue_shift", 1)),
  hue_distance: (args) => hue_distance(as_hue(args[0], "hue_distance", 0), as_hue(args[1], "hue_distance", 1)),
  harmonic_hues: (args) => harmonic_hues(as_hue(args[0], "harmonic_hues", 0), args[1])
};

// src/core/operators/length/resolver.ts
function assert_same_unit(a, b, op) {
  if (a.unit !== b.unit) {
    throw new CortexError("TYPE_MISMATCH", `${op}: unit mismatch (${a.unit} vs ${b.unit})`);
  }
}
function as_length(v, op, pos) {
  if (typeof v !== "object" || v === null || !("magnitude" in v) || !("unit" in v)) {
    throw new CortexError("TYPE_MISMATCH", `${op}: arg[${pos}] is not a Length`);
  }
  return v;
}
function as_number2(v, op, pos) {
  if (typeof v !== "number") {
    throw new CortexError("TYPE_MISMATCH", `${op}: arg[${pos}] expected number, got ${typeof v}`);
  }
  return v;
}
var size_op_resolver = (op, args, opts, ctx) => {
  switch (op) {
    case "add_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return make_length(a.magnitude + b.magnitude, a.unit);
    }
    case "sub_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return make_length(a.magnitude - b.magnitude, a.unit);
    }
    case "mul_l": {
      const a = as_length(args[0], op, 0);
      const b = as_number2(args[1], op, 1);
      return make_length(a.magnitude * b, a.unit);
    }
    case "div_l": {
      const a = as_length(args[0], op, 0);
      const b = as_number2(args[1], op, 1);
      if (b === 0) throw new CortexError("DIVISION_BY_ZERO", "div_l: division by zero");
      return make_length(a.magnitude / b, a.unit);
    }
    case "neg_l": {
      const a = as_length(args[0], op, 0);
      return make_length(-a.magnitude, a.unit);
    }
    case "abs_l": {
      const a = as_length(args[0], op, 0);
      return make_length(Math.abs(a.magnitude), a.unit);
    }
    case "min_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return make_length(Math.min(a.magnitude, b.magnitude), a.unit);
    }
    case "max_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return make_length(Math.max(a.magnitude, b.magnitude), a.unit);
    }
    case "clamp_l": {
      const value = as_length(args[0], op, 0);
      const lo = as_length(args[1], op, 1);
      const hi = as_length(args[2], op, 2);
      assert_same_unit(value, lo, op);
      assert_same_unit(value, hi, op);
      if (lo.magnitude > hi.magnitude) return make_length(lo.magnitude, lo.unit);
      return make_length(
        Math.min(Math.max(value.magnitude, lo.magnitude), hi.magnitude),
        value.unit
      );
    }
    case "lt_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return a.magnitude < b.magnitude;
    }
    case "gt_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return a.magnitude > b.magnitude;
    }
    case "le_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return a.magnitude <= b.magnitude;
    }
    case "ge_l": {
      const a = as_length(args[0], op, 0);
      const b = as_length(args[1], op, 1);
      assert_same_unit(a, b, op);
      return a.magnitude >= b.magnitude;
    }
    case "fluid": {
      const inner_min = as_length(args[0], op, 0);
      const inner_max = as_length(args[1], op, 1);
      const outer_min = as_length(args[2], op, 2);
      const outer_max = as_length(args[3], op, 3);
      const outer_axis_str = opts.outer_axis ?? "viewport";
      const query = outer_axis_str === "container" ? { kind: "container_size", axis: "inline" } : { kind: "viewport_size", axis: "inline" };
      const outer_raw = ctx_env_lookup(ctx, query);
      if (outer_raw === void 0) {
        throw new CortexError("UNBOUND_PARAM", `fluid: missing ${outer_axis_str} size in context`);
      }
      const outer_current = outer_raw.magnitude;
      const outer_range = outer_max.magnitude - outer_min.magnitude;
      if (outer_range <= 0) return make_length(inner_min.magnitude, inner_min.unit);
      if (outer_current <= outer_min.magnitude)
        return make_length(inner_min.magnitude, inner_min.unit);
      if (outer_current >= outer_max.magnitude)
        return make_length(inner_max.magnitude, inner_max.unit);
      const t = (outer_current - outer_min.magnitude) / outer_range;
      const mag = inner_min.magnitude + t * (inner_max.magnitude - inner_min.magnitude);
      return make_length(mag, inner_min.unit);
    }
    case "step_to_length": {
      const step_val = args[0];
      const base_val = as_length(args[1], op, 1);
      const ratio_val = args[2];
      const n = Math.round(step_val);
      return make_length(base_val.magnitude * ratio_val ** n, base_val.unit);
    }
    case "convert_l": {
      const val = as_length(args[0], op, 0);
      const target = opts.target;
      if (KIND_OF[val.unit] === "grid" || KIND_OF[target] === "grid") {
        throw new CortexError(
          "TYPE_MISMATCH",
          `convert_l: IncompatibleUnitKinds \u2014 cannot convert ${val.unit} \u2194 ${target}`
        );
      }
      const result = convert_l_raw(val, target, ctx);
      if (result === void 0) {
        throw new CortexError(
          "MISSING_CTX_FOR_CONVERSION",
          `convert_l: missing context for ${val.unit} \u2192 ${target}`
        );
      }
      return result;
    }
    default:
      return void 0;
  }
};

// src/runtime/eval/apply.ts
var SIZE_OPS = [
  "add_l",
  "sub_l",
  "mul_l",
  "div_l",
  "neg_l",
  "abs_l",
  "min_l",
  "max_l",
  "clamp_l",
  "lt_l",
  "gt_l",
  "le_l",
  "ge_l",
  "fluid",
  "step_to_length",
  "convert_l"
];
var OPERATOR_CATALOG = {
  ...Object.fromEntries(
    Object.entries(color_catalog_entries).map(([name, fn]) => [
      name,
      {
        impl: (args, opts) => fn(args, opts)
      }
    ])
  ),
  ...Object.fromEntries(
    SIZE_OPS.map((op) => [
      op,
      {
        impl: (args, opts, ctx) => size_op_resolver(op, args, opts, ctx)
      }
    ])
  )
};
function apply_operator(op, args, opts, ctx) {
  const entry = OPERATOR_CATALOG[op];
  if (entry === void 0) {
    throw new CortexError("UNKNOWN_OPERATOR", `apply_operator: unknown op '${op}'`);
  }
  return entry.impl(args, opts, ctx);
}

// src/runtime/eval/eager.ts
function evaluate_eager(expr, ctx) {
  return resolve(expr, ctx, apply_operator);
}

// src/inspect/describe.ts
var FORMULA_MAX = 120;
function formula(expr) {
  const full = render(expr);
  if (full.length <= FORMULA_MAX) return full;
  return `${full.slice(0, FORMULA_MAX)}...`;
}
function formula_full(expr) {
  return render(expr);
}
function render(node) {
  switch (node.kind) {
    case "lit":
      return render_lit(node.value);
    case "param":
      return `param("${node.name}")`;
    case "op": {
      const n = node;
      const args = n.args.map(render);
      const opts = n.opts !== void 0 ? Object.entries(n.opts).map(([k, v]) => `${k}: ${render(v)}`) : [];
      const all_args = [...args, ...opts];
      return `${n.op}(${all_args.join(", ")})`;
    }
    case "if": {
      const n = node;
      return `if(${render(n.cond)}, ${render(n.then)}, ${render(n.else_)})`;
    }
    case "let": {
      const n = node;
      const binds = n.bindings.map((b) => `${b.name} = ${render(b.value)}`).join(", ");
      return `let {${binds}} in ${render(n.body)}`;
    }
    case "seq": {
      const n = node;
      return n.exprs.map(render).join("; ");
    }
    case "ctx_query": {
      const n = node;
      return render_ctx_query(n);
    }
    // target_hint and comment are transparent — show their inner node
    case "target_hint":
      return render(node.inner);
    case "comment":
      return render(node.inner);
    default:
      return `<unknown:${String(node.kind)}>`;
  }
}
function render_lit(v) {
  switch (v._t) {
    case "Number":
      return format_num(v.v);
    case "Boolean":
      return String(v.v);
    case "Ratio":
      return format_num(v.v);
    case "Hue":
      return `${format_num(v.degrees)}\xB0`;
    case "Step":
      return `step(${v.n})`;
    case "Length":
      return `${format_num(v.magnitude)}${v.unit.toLowerCase()}`;
    case "Angle":
      return `${format_num(v.magnitude)}${v.unit.toLowerCase()}`;
    case "Time":
      return `${format_num(v.magnitude)}${v.unit.toLowerCase()}`;
    case "Color": {
      const [a, b, c] = v.coords;
      const space = v.space.toLowerCase();
      return `${space}(${format_num(a)}, ${format_num(b)}, ${format_num(c)})`;
    }
    case "Tag":
      return `"${v.v}"`;
    case "Palette":
      return `palette(${v.space})`;
    case "Scheme":
      return `scheme(${v.kind})`;
    default:
      return "<lit>";
  }
}
function format_num(n) {
  return String(parseFloat(n.toPrecision(6)));
}
function render_ctx_query(n) {
  const q = n.query;
  switch (q.kind) {
    case "color_scheme":
      return "ctx.color_scheme";
    case "density":
      return "ctx.density";
    case "high_contrast":
      return "ctx.high_contrast";
    case "reduced_motion":
      return "ctx.reduced_motion";
    case "theme":
      return `ctx.theme.${q.which}`;
    case "viewport_size":
      return `ctx.viewport.${q.axis}`;
    case "container_size":
      return `ctx.container.${q.axis}`;
    case "font_size":
      return `ctx.font_size.${q.scope}`;
  }
}

// src/inspect/graph.ts
function graph(expr) {
  const nodes = [];
  const edges = [];
  collect(expr, "root", null, null, nodes, edges);
  return { nodes, edges };
}
function collect(node, id, parent_id, edge_label, nodes, edges) {
  const is_param2 = node.kind === "param" || node.kind === "ctx_query";
  const param_name = node.kind === "param" ? node.name : node.kind === "ctx_query" ? String(node.query.kind) : void 0;
  nodes.push({
    id,
    kind: node.kind,
    label: formula(node),
    is_param: is_param2,
    ...param_name !== void 0 ? { param_name } : {}
  });
  if (parent_id !== null) {
    edges.push({ from: parent_id, to: id, ...edge_label !== null ? { label: edge_label } : {} });
  }
  switch (node.kind) {
    case "lit":
    case "param":
    case "ctx_query":
      break;
    case "op": {
      const n = node;
      for (const [i, arg] of n.args.entries()) {
        collect(arg, `${id}.args[${i}]`, id, `arg[${i}]`, nodes, edges);
      }
      if (n.opts !== void 0) {
        for (const [k, v] of Object.entries(n.opts)) {
          collect(v, `${id}.opts.${k}`, id, k, nodes, edges);
        }
      }
      break;
    }
    case "if": {
      const n = node;
      collect(n.cond, `${id}.cond`, id, "cond", nodes, edges);
      collect(n.then, `${id}.then`, id, "then", nodes, edges);
      collect(n.else_, `${id}.else`, id, "else", nodes, edges);
      break;
    }
    case "let": {
      const n = node;
      for (const [i, b] of n.bindings.entries()) {
        collect(b.value, `${id}.bindings[${i}]`, id, b.name, nodes, edges);
      }
      collect(n.body, `${id}.body`, id, "body", nodes, edges);
      break;
    }
    case "seq": {
      const n = node;
      for (const [i, e] of n.exprs.entries()) {
        collect(e, `${id}.exprs[${i}]`, id, `seq[${i}]`, nodes, edges);
      }
      break;
    }
    case "target_hint": {
      const n = node;
      collect(n.inner, `${id}.inner`, id, "inner", nodes, edges);
      break;
    }
    case "comment": {
      const n = node;
      collect(n.inner, `${id}.inner`, id, "inner", nodes, edges);
      break;
    }
  }
}

// src/inspect/api.ts
function dependencies(expr) {
  const names = /* @__PURE__ */ new Set();
  walk(expr, {
    visit_param(n) {
      names.add(n.name);
    },
    visit_ctx_query(n) {
      names.add(query_key(n.query));
    },
    visit_lit: () => void 0,
    visit_op: () => void 0,
    visit_if: () => void 0,
    visit_let: () => void 0,
    visit_seq: () => void 0
  });
  return [...names].sort();
}
function current_value(expr, ctx) {
  return evaluate_eager(expr, ctx);
}
var inspect = {
  dependencies,
  formula,
  formula_full,
  current_value,
  graph
};

// src/core/ir/validation.ts
function validate_ir(expr) {
  const seen = /* @__PURE__ */ new Set();
  check_node(expr, seen);
}
function check_node(node, seen) {
  if (seen.has(node)) {
    throw new CortexError(
      "CIRCULAR_REF",
      "validate_ir: shared or cyclic IR node (S-Inv-1 tree / S-Inv-6 cycle)"
    );
  }
  seen.add(node);
  switch (node.kind) {
    case "lit":
    case "param":
    case "ctx_query":
      break;
    case "let": {
      const n = node;
      const bound_so_far = /* @__PURE__ */ new Set();
      for (const binding of n.bindings) {
        check_no_self_ref(binding.value, binding.name, bound_so_far);
        check_node(binding.value, seen);
        bound_so_far.add(binding.name);
      }
      check_node(n.body, seen);
      break;
    }
    case "op": {
      const n = node;
      for (const arg of n.args) check_node(arg, seen);
      if (n.opts) {
        for (const v of Object.values(n.opts)) check_node(v, seen);
      }
      break;
    }
    case "if": {
      const n = node;
      check_node(n.cond, seen);
      check_node(n.then, seen);
      check_node(n.else_, seen);
      break;
    }
    case "seq": {
      const n = node;
      for (const e of n.exprs) check_node(e, seen);
      break;
    }
    case "target_hint": {
      const n = node;
      check_node(n.inner, seen);
      break;
    }
    case "comment": {
      const n = node;
      check_node(n.inner, seen);
      break;
    }
    default:
      throw new CortexError(
        "MALFORMED_NODE",
        `validate_ir: unknown node kind '${String(node.kind)}'`
      );
  }
}
function check_no_self_ref(expr, self_name, prior_names) {
  switch (expr.kind) {
    case "param": {
      const n = expr;
      if (n.name === self_name || prior_names.has(n.name)) {
        throw new CortexError(
          "CIRCULAR_REF",
          `validate_ir: let binding '${self_name}' references '${n.name}' in its own value (S-Inv-3)`
        );
      }
      if (n.default !== void 0) check_no_self_ref(n.default, self_name, prior_names);
      break;
    }
    case "op": {
      const n = expr;
      for (const arg of n.args) check_no_self_ref(arg, self_name, prior_names);
      if (n.opts) {
        for (const v of Object.values(n.opts)) {
          check_no_self_ref(v, self_name, prior_names);
        }
      }
      break;
    }
    case "if": {
      const n = expr;
      check_no_self_ref(n.cond, self_name, prior_names);
      check_no_self_ref(n.then, self_name, prior_names);
      check_no_self_ref(n.else_, self_name, prior_names);
      break;
    }
    case "let": {
      const n = expr;
      for (const b of n.bindings) check_no_self_ref(b.value, self_name, prior_names);
      check_no_self_ref(n.body, self_name, prior_names);
      break;
    }
    case "seq": {
      const n = expr;
      for (const e of n.exprs) check_no_self_ref(e, self_name, prior_names);
      break;
    }
    case "target_hint": {
      const n = expr;
      check_no_self_ref(n.inner, self_name, prior_names);
      break;
    }
    case "comment": {
      const n = expr;
      check_no_self_ref(n.inner, self_name, prior_names);
      break;
    }
    case "lit":
    case "ctx_query":
      break;
  }
}

// src/io/serialize/primitives.ts
function emit_primitive(v) {
  switch (v._t) {
    case "Number": {
      if (!Number.isFinite(v.v)) {
        throw new CortexError(
          "MALFORMED_NODE",
          `emit_primitive: Number value must be finite, got ${v.v}`
        );
      }
      return { _t: "Number", v: v.v };
    }
    case "Boolean":
      return { _t: "Boolean", v: v.v };
    case "Ratio":
      return { _t: "Ratio", v: v.v };
    case "Hue":
      return { _t: "Hue", degrees: v.degrees };
    case "Step":
      return { _t: "Step", n: v.n };
    case "Length":
      return { _t: "Length", magnitude: v.magnitude, unit: v.unit };
    case "Angle":
      return { _t: "Angle", magnitude: v.magnitude, unit: v.unit };
    case "Time":
      return { _t: "Time", magnitude: v.magnitude, unit: v.unit };
    case "Color":
      return { _t: "Color", coords: [...v.coords], space: v.space };
    case "Tag":
      return { _t: "Tag", domain: v.domain, v: v.v };
    case "Palette": {
      return {
        _t: "Palette",
        source_hue: v.source_hue,
        source_chroma: v.source_chroma,
        space: v.space,
        tones: v.tones.map((t) => ({
          tone: t.tone,
          color: t.color
        }))
      };
    }
    case "Scheme": {
      return { ...v };
    }
    default:
      throw new CortexError(
        "MALFORMED_NODE",
        `emit_primitive: unknown type '${String(v._t)}'`
      );
  }
}
function parse_primitive(obj) {
  if (obj === null || typeof obj !== "object") {
    throw new CortexError("MALFORMED_NODE", "parse_primitive: expected object");
  }
  const o = obj;
  const t = o._t;
  if (typeof t !== "string") {
    throw new CortexError("MALFORMED_NODE", "parse_primitive: missing _t field");
  }
  switch (t) {
    case "Number": {
      const v = Number(o.v);
      if (!Number.isFinite(v)) {
        throw new CortexError(
          "MALFORMED_NODE",
          `parse_primitive: Number value must be finite, got ${o.v}`
        );
      }
      return { _t: "Number", v };
    }
    case "Boolean":
      return { _t: "Boolean", v: Boolean(o.v) };
    case "Ratio":
      return { _t: "Ratio", v: Number(o.v) };
    case "Hue": {
      const raw = Number(o.degrees);
      const normalized = (raw % 360 + 360) % 360;
      return { _t: "Hue", degrees: normalized };
    }
    case "Step":
      return { _t: "Step", n: Number(o.n) };
    case "Length":
      return {
        _t: "Length",
        magnitude: Number(o.magnitude),
        unit: String(o.unit)
      };
    case "Angle":
      return {
        _t: "Angle",
        magnitude: Number(o.magnitude),
        unit: String(o.unit)
      };
    case "Time":
      return {
        _t: "Time",
        magnitude: Number(o.magnitude),
        unit: String(o.unit)
      };
    case "Color": {
      const coords = o.coords;
      return { _t: "Color", coords, space: String(o.space) };
    }
    case "Tag":
      return { _t: "Tag", domain: String(o.domain), v: String(o.v) };
    case "Palette": {
      return {
        _t: "Palette",
        source_hue: Number(o.source_hue),
        source_chroma: Number(o.source_chroma),
        space: String(o.space),
        tones: o.tones.map((t2) => ({
          tone: t2.tone,
          color: t2.color
        }))
      };
    }
    case "Scheme": {
      return { ...o };
    }
    default:
      throw new CortexError("MALFORMED_NODE", `parse_primitive: unknown primitive type '${t}'`);
  }
}

// src/io/serialize/typeref.ts
function emit_typeref(t) {
  switch (t._t) {
    case "Number":
      return "Number";
    case "Boolean":
      return "Boolean";
    case "Ratio":
      return "Ratio";
    case "Hue":
      return "Hue";
    case "Step":
      return "Step";
    case "Curve":
      return "Curve";
    case "Scheme":
      return "Scheme";
    case "Length":
      return `Length<${t.unit}>`;
    case "Angle":
      return `Angle<${t.unit}>`;
    case "Time":
      return `Time<${t.unit}>`;
    case "Color":
      return `Color<${t.space}>`;
    case "Palette":
      return `Palette<${t.space}>`;
    case "Tag":
      return `Tag<${t.domain}>`;
    case "Var":
      return `Var<${t.id}>`;
    default:
      return `Unknown<${String(t._t)}>`;
  }
}
function parse_typeref(s) {
  if (typeof s === "object" && s !== null) {
    return s;
  }
  if (typeof s !== "string") {
    throw new CortexError(
      "MALFORMED_NODE",
      `parse_typeref: expected string or object, got ${typeof s}`
    );
  }
  const str = s.trim();
  const m = str.match(/^(\w+)<([^>]+)>$/);
  if (m) {
    const [, kind, param] = m;
    switch (kind) {
      case "Length":
        return { _t: "Length", unit: param };
      case "Angle":
        return { _t: "Angle", unit: param };
      case "Time":
        return { _t: "Time", unit: param };
      case "Color":
        return { _t: "Color", space: param };
      case "Palette":
        return { _t: "Palette", space: param };
      case "Tag":
        return { _t: "Tag", domain: param };
      case "Var":
        return { _t: "Var", id: param };
      default:
        throw new CortexError(
          "MALFORMED_NODE",
          `parse_typeref: unknown parameterized type '${kind}'`
        );
    }
  }
  switch (str) {
    case "Number":
      return { _t: "Number" };
    case "Boolean":
      return { _t: "Boolean" };
    case "Ratio":
      return { _t: "Ratio" };
    case "Hue":
      return { _t: "Hue" };
    case "Step":
      return { _t: "Step" };
    case "Curve":
      return { _t: "Curve" };
    case "Scheme":
      return { _t: "Scheme" };
    default:
      throw new CortexError("MALFORMED_NODE", `parse_typeref: unknown type '${str}'`);
  }
}

// src/io/parse/validate.ts
function validate_document(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new CortexError("MALFORMED_NODE", "parse: document must be a JSON object");
  }
  const doc = obj;
  if (!("cortex_spec_version" in doc)) {
    throw new CortexError("MALFORMED_NODE", "parse: missing cortex_spec_version field");
  }
  const version = String(doc.cortex_spec_version);
  const [major] = version.split(".");
  if (major !== "0") {
    throw new CortexError(
      "INCOMPATIBLE_SPEC_VERSION",
      `parse: major version ${major} is not supported (expected 0.x)`
    );
  }
  if (!("expression" in doc)) {
    throw new CortexError("MALFORMED_NODE", "parse: missing expression field");
  }
  return { doc, expression: doc.expression, version };
}

// src/io/parse/json.ts
function parse(json) {
  let raw;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new CortexError("MALFORMED_NODE", "parse: invalid JSON");
  }
  const { expression } = validate_document(raw);
  const result = parse_node(expression);
  validate_ir(result);
  return result;
}
function parse_node(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new CortexError("MALFORMED_NODE", "parse_node: expected object");
  }
  const o = obj;
  const kind = o.kind;
  if (typeof kind !== "string") {
    throw new CortexError("MALFORMED_NODE", "parse_node: missing or invalid kind field");
  }
  const type = parse_typeref(o.type);
  switch (kind) {
    case "lit": {
      return { kind: "lit", type, value: parse_primitive(o.value) };
    }
    case "param": {
      const node = { kind: "param", type, name: String(o.name) };
      if (o.default !== void 0) {
        node.default = parse_node(o.default);
      }
      return node;
    }
    case "op": {
      const args = o.args.map(parse_node);
      const opts = o.opts !== void 0 ? Object.fromEntries(
        Object.entries(o.opts).map(([k, v]) => [k, parse_node(v)])
      ) : void 0;
      return {
        kind: "op",
        type,
        op: String(o.op),
        args,
        ...opts !== void 0 ? { opts } : {}
      };
    }
    case "if": {
      return {
        kind: "if",
        type,
        cond: parse_node(o.cond),
        then: parse_node(o.then),
        else_: parse_node(o.else)
      };
    }
    case "let": {
      const bindings = o.bindings.map((b) => ({
        name: String(b.name),
        type: parse_typeref(b.type),
        value: parse_node(b.value)
      }));
      return {
        kind: "let",
        type,
        bindings,
        body: parse_node(o.body)
      };
    }
    case "seq": {
      const exprs = o.exprs.map(parse_node);
      return { kind: "seq", type, exprs };
    }
    case "ctx_query": {
      return {
        kind: "ctx_query",
        type,
        query: o.query
      };
    }
    case "target_hint": {
      return {
        kind: "target_hint",
        type,
        target: String(o.target),
        hint: o.hint,
        inner: parse_node(o.inner)
      };
    }
    case "comment": {
      return {
        kind: "comment",
        type,
        doc: String(o.doc),
        inner: parse_node(o.inner)
      };
    }
    default:
      throw new CortexError("MALFORMED_NODE", `parse_node: unknown node kind '${kind}'`);
  }
}

// src/io/serialize/json.ts
var SPEC_VERSION = "0.1";
function serialize(expr) {
  const doc = {
    $schema: "https://cortex.dev/schema/v0.1/expression.json",
    cortex_spec_version: SPEC_VERSION,
    expression: serialize_node(expr)
  };
  return `${JSON.stringify(sort_keys(doc), null, 2)}
`;
}
function serializeModule(name, exprs) {
  const doc = {
    $schema: "https://cortex.dev/schema/v0.1/module.json",
    cortex_spec_version: SPEC_VERSION,
    module: {
      name,
      expressions: Object.fromEntries(
        Object.entries(exprs).map(([k, v]) => [k, serialize_node(v)])
      )
    }
  };
  return `${JSON.stringify(sort_keys(doc), null, 2)}
`;
}
function serialize_node(node) {
  const base = { kind: node.kind, type: emit_typeref(node.type) };
  switch (node.kind) {
    case "lit": {
      const n = node;
      return { ...base, value: emit_primitive(n.value) };
    }
    case "param": {
      const n = node;
      return {
        ...base,
        name: n.name,
        ...n.default !== void 0 ? { default: serialize_node(n.default) } : {}
      };
    }
    case "op": {
      const n = node;
      const obj = {
        ...base,
        op: n.op,
        args: n.args.map(serialize_node)
      };
      if (n.opts !== void 0 && Object.keys(n.opts).length > 0) {
        obj.opts = Object.fromEntries(
          Object.entries(n.opts).map(([k, v]) => [k, serialize_node(v)])
        );
      }
      return obj;
    }
    case "if": {
      const n = node;
      return {
        ...base,
        cond: serialize_node(n.cond),
        else: serialize_node(n.else_),
        then: serialize_node(n.then)
      };
    }
    case "let": {
      const n = node;
      return {
        ...base,
        bindings: n.bindings.map((b) => ({
          name: b.name,
          type: emit_typeref(b.type),
          value: serialize_node(b.value)
        })),
        body: serialize_node(n.body)
      };
    }
    case "seq": {
      const n = node;
      return { ...base, exprs: n.exprs.map(serialize_node) };
    }
    case "ctx_query": {
      const n = node;
      return { ...base, query: { ...n.query } };
    }
    case "target_hint": {
      const n = node;
      return { ...base, hint: n.hint, inner: serialize_node(n.inner), target: n.target };
    }
    case "comment": {
      const n = node;
      return { ...base, doc: n.doc, inner: serialize_node(n.inner) };
    }
    default:
      throw new CortexError(
        "MALFORMED_NODE",
        `serialize: unknown node kind '${String(node.kind)}'`
      );
  }
}
function sort_keys(obj) {
  if (Array.isArray(obj)) return obj.map(sort_keys);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.keys(obj).sort().map((k) => [k, sort_keys(obj[k])])
    );
  }
  return obj;
}

// src/runtime/cache/equality.ts
function per_type_equal(a, b, type) {
  switch (type._t) {
    case "Number":
    case "Ratio":
    case "Hue":
    case "Angle":
    case "Time":
    case "Step":
      return typeof a === "number" && typeof b === "number" && Math.abs(a - b) < 1e-9;
    case "Boolean":
    case "Tag":
      return a === b;
    case "Length": {
      const la = a;
      const lb = b;
      if (la == null || lb == null) return a === b;
      return la.unit === lb.unit && Math.abs(la.magnitude - lb.magnitude) < 1e-6;
    }
    case "Color": {
      const ca = a;
      const cb = b;
      if (ca == null || cb == null) return a === b;
      if (ca.space !== cb.space) return false;
      const [a0, a1, a2] = ca.coords;
      const [b0, b1, b2] = cb.coords;
      return Math.abs(a0 - b0) < 1e-4 && // L/T epsilon
      Math.abs(a1 - b1) < 1e-3 && // C epsilon
      Math.abs(a2 - b2) < 0.05;
    }
    case "Palette":
    case "Scheme":
    case "Curve":
    case "Var":
      return a === b;
    default:
      return a === b;
  }
}

// src/runtime/eval/lazy.ts
var MAX_DEPTH2 = 1e3;
function evaluate_with_tracking(expr, ctx, on_read, depth = 0) {
  if (depth > MAX_DEPTH2) {
    throw new CortexError("STACK_OVERFLOW", "evaluate_with_tracking: max depth exceeded");
  }
  const next = depth + 1;
  const track = (e) => evaluate_with_tracking(e, ctx, on_read, next);
  switch (expr.kind) {
    case "lit": {
      const node = expr;
      return extract_primitive2(node.value);
    }
    case "param": {
      const node = expr;
      const bound = ctx_lookup(ctx, node.name);
      on_read(node.name);
      if (bound === void 0) {
        if (node.default !== void 0) {
          return evaluate_with_tracking(node.default, ctx, on_read, next);
        }
        throw new CortexError("UNBOUND_PARAM", `param '${node.name}' is not bound in context`);
      }
      return track(bound);
    }
    case "if": {
      const node = expr;
      const cond = evaluate_with_tracking(node.cond, ctx, on_read, next);
      return evaluate_with_tracking(cond ? node.then : node.else_, ctx, on_read, next);
    }
    case "let": {
      const node = expr;
      let inner = ctx;
      for (const binding of node.bindings) {
        const val = evaluate_with_tracking(binding.value, inner, on_read, next);
        inner = ctx_extend(inner, binding.name, value_to_expr(val, binding.type));
      }
      return evaluate_with_tracking(node.body, inner, on_read, next);
    }
    case "op": {
      const node = expr;
      const arg_vals = node.args.map((a) => evaluate_with_tracking(a, ctx, on_read, next));
      const opt_vals = node.opts !== void 0 ? Object.fromEntries(
        Object.entries(node.opts).map(([k, v]) => [
          k,
          evaluate_with_tracking(v, ctx, on_read, next)
        ])
      ) : {};
      return apply_operator(node.op, arg_vals, opt_vals, ctx);
    }
    case "seq": {
      const node = expr;
      let last;
      for (const e of node.exprs) last = evaluate_with_tracking(e, ctx, on_read, next);
      return last;
    }
    case "ctx_query": {
      const node = expr;
      const query_key2 = ctx_query_to_key(node.query);
      on_read(query_key2);
      const val = ctx_env_lookup(ctx, node.query);
      if (val === void 0) {
        throw new CortexError(
          "UNBOUND_PARAM",
          `ctx_query '${node.query.kind}' not found in context`
        );
      }
      return val;
    }
    case "target_hint": {
      const node = expr;
      return evaluate_with_tracking(node.inner, ctx, on_read, next);
    }
    case "comment": {
      const node = expr;
      return evaluate_with_tracking(node.inner, ctx, on_read, next);
    }
    default:
      throw new CortexError(
        "UNKNOWN_OPERATOR",
        `evaluate_with_tracking: unknown node kind '${String(expr.kind)}'`
      );
  }
}
function extract_primitive2(v) {
  switch (v._t) {
    case "Number":
      return v.v;
    case "Boolean":
      return v.v;
    case "Ratio":
      return v.v;
    case "Hue":
      return v.degrees;
    case "Step":
      return v.n;
    case "Color":
      return make_color(
        [v.coords[0], v.coords[1], v.coords[2]],
        v.space
      );
    case "Tag":
      return v.v;
    case "Length":
      return { magnitude: v.magnitude, unit: v.unit };
    case "Angle":
      return v.magnitude;
    case "Time":
      return v.magnitude;
    case "Palette":
      return v;
    case "Scheme":
      return v;
  }
}
function ctx_query_to_key(q) {
  switch (q.kind) {
    case "color_scheme":
      return "__env:color_scheme";
    case "density":
      return "__env:density";
    case "high_contrast":
      return "__env:high_contrast";
    case "reduced_motion":
      return "__env:reduced_motion";
    case "theme":
      return `__env:theme:${q.which}`;
    case "viewport_size":
      return `__env:viewport:${q.axis}`;
    case "container_size":
      return `__env:container:${q.axis}`;
    case "font_size":
      return `__env:font_size:${q.scope}`;
  }
}

// src/runtime/graph/store.ts
function make_meta(ir) {
  return {
    ir,
    color: "dirty",
    cached_value: void 0,
    was_changed: false,
    reads_bindings: /* @__PURE__ */ new Set(),
    dependencies: /* @__PURE__ */ new Set(),
    dependents: /* @__PURE__ */ new Set(),
    recompute_count: 0
  };
}
var ReactiveStore = class {
  _ctx;
  _metas = /* @__PURE__ */ new Map();
  // Registered reactive computations: output binding name → NodeMeta
  _reactive_outputs = /* @__PURE__ */ new Map();
  // Push-phase reverse index: binding name → Set<NodeMeta> that directly read it
  _binding_readers = /* @__PURE__ */ new Map();
  constructor(initial_ctx) {
    this._ctx = initial_ctx;
  }
  // Register ir as a reactive computation whose value becomes binding output_name.
  register(ir, output_name) {
    const meta = this._ensure_meta(ir);
    this._reactive_outputs.set(output_name, meta);
  }
  // Register ir as a terminal consumer (no output binding).
  register_dependent(ir) {
    this._ensure_meta(ir);
  }
  // Pull: compute current value, lazily updating upstream if needed.
  observe(ir) {
    const meta = this._ensure_meta(ir);
    this._update_if_necessary(meta);
    return meta.cached_value;
  }
  // Push: update context binding + invalidate all reactive nodes that read it.
  set_binding(name, value) {
    this._ctx = ctx_extend(this._ctx, name, value);
    const readers = this._binding_readers.get(name);
    if (readers === void 0) return;
    for (const meta of readers) {
      this._mark_dirty_and_propagate(meta);
    }
  }
  recompute_count(ir) {
    return this._metas.get(ir)?.recompute_count ?? 0;
  }
  // ── Private: graph coloring ──────────────────────────────────────────────────
  _ensure_meta(ir) {
    let meta = this._metas.get(ir);
    if (meta === void 0) {
      meta = make_meta(ir);
      this._metas.set(ir, meta);
    }
    return meta;
  }
  // Push phase: mark meta dirty, mark its dependents check (recursively).
  _mark_dirty_and_propagate(meta) {
    if (meta.color === "clean") {
      meta.color = "dirty";
      this._mark_dependents_check(meta);
    }
  }
  _mark_dependents_check(meta) {
    for (const dep of meta.dependents) {
      if (dep.color === "clean") {
        dep.color = "check";
        this._mark_dependents_check(dep);
      }
    }
  }
  // Pull phase: Reactively algorithm (update_if_necessary).
  _update_if_necessary(meta) {
    if (meta.color === "clean") return;
    if (meta.color === "check") {
      for (const dep_meta of meta.dependencies) {
        this._update_if_necessary(dep_meta);
        if (dep_meta.was_changed) {
          meta.color = "dirty";
          break;
        }
      }
      if (meta.color === "check") {
        meta.color = "clean";
        meta.was_changed = false;
        return;
      }
    }
    meta.was_changed = false;
    const new_value = this._recompute(meta);
    meta.recompute_count++;
    const prev = meta.cached_value;
    if (prev !== void 0 && per_type_equal(prev, new_value, meta.ir.type)) {
      meta.color = "clean";
      meta.was_changed = false;
    } else {
      meta.cached_value = new_value;
      meta.color = "clean";
      meta.was_changed = true;
    }
  }
  // Returns true if ir tree contains a param node referencing binding_name.
  _references_binding(ir, name) {
    switch (ir.kind) {
      case "param":
        return ir.name === name;
      case "lit":
        return false;
      case "ctx_query":
        return false;
      case "op": {
        const n = ir;
        const in_args = n.args.some((a) => this._references_binding(a, name));
        const in_opts = n.opts ? Object.values(n.opts).some(
          (v) => this._references_binding(v, name)
        ) : false;
        return in_args || in_opts;
      }
      case "let": {
        const n = ir;
        return n.bindings.some((b) => this._references_binding(b.value, name)) || this._references_binding(n.body, name);
      }
      case "if": {
        const n = ir;
        return this._references_binding(n.cond, name) || this._references_binding(n.then, name) || this._references_binding(n.else_, name);
      }
      case "seq":
        return ir.exprs.some((e) => this._references_binding(e, name));
      case "target_hint":
      case "comment":
        return this._references_binding(ir.inner, name);
      default:
        return false;
    }
  }
  // Recompute meta's value with full dependency tracking.
  _recompute(meta) {
    this._clear_deps(meta);
    let ctx = this._ctx;
    for (const [output_name, upstream_meta] of this._reactive_outputs) {
      if (upstream_meta === meta) continue;
      if (!this._references_binding(meta.ir, output_name)) continue;
      this._update_if_necessary(upstream_meta);
      meta.dependencies.add(upstream_meta);
      upstream_meta.dependents.add(meta);
      if (upstream_meta.cached_value !== void 0) {
        const lit_node = value_to_lit(upstream_meta.cached_value, upstream_meta.ir.type);
        ctx = ctx_extend(ctx, output_name, lit_node);
      }
    }
    const new_value = evaluate_with_tracking(meta.ir, ctx, (name) => {
      if (this._reactive_outputs.has(name)) return;
      meta.reads_bindings.add(name);
      let readers = this._binding_readers.get(name);
      if (readers === void 0) {
        readers = /* @__PURE__ */ new Set();
        this._binding_readers.set(name, readers);
      }
      readers.add(meta);
    });
    return new_value;
  }
  _clear_deps(meta) {
    for (const dep of meta.dependencies) {
      dep.dependents.delete(meta);
    }
    meta.dependencies.clear();
    for (const name of meta.reads_bindings) {
      this._binding_readers.get(name)?.delete(meta);
    }
    meta.reads_bindings.clear();
  }
};
function value_to_lit(val, type) {
  const pv = value_to_pv(val, type);
  return { kind: "lit", type, value: pv };
}
function value_to_pv(val, type) {
  switch (type._t) {
    case "Number":
      return { _t: "Number", v: val };
    case "Boolean":
      return { _t: "Boolean", v: val };
    case "Ratio":
      return { _t: "Ratio", v: val };
    case "Hue":
      return { _t: "Hue", degrees: val };
    case "Step":
      return { _t: "Step", n: val };
    case "Length": {
      const l = val;
      return { _t: "Length", magnitude: l.magnitude, unit: l.unit };
    }
    case "Color": {
      const c = val;
      return { _t: "Color", coords: c.coords, space: c.space };
    }
    case "Tag":
      return { _t: "Tag", domain: type.domain ?? "", v: String(val) };
    case "Angle":
      return { _t: "Angle", magnitude: val, unit: type.unit ?? "" };
    case "Time":
      return { _t: "Time", magnitude: val, unit: type.unit ?? "" };
    default:
      return { _t: "Tag", domain: "", v: String(val) };
  }
}

// src/runtime/subscribe/tracking.ts
var DIRTY_SUBS = /* @__PURE__ */ new Set();
function register_subscription(sub, subs) {
  subs.add(sub);
}
function unregister_subscription(sub, subs) {
  sub.active = false;
  subs.delete(sub);
  DIRTY_SUBS.delete(sub);
}
function mark_subscription_dirty(sub) {
  if (sub.active) DIRTY_SUBS.add(sub);
}

// src/runtime/subscribe/api.ts
var CTX_STATES = /* @__PURE__ */ new WeakMap();
function get_state(ctx) {
  let s = CTX_STATES.get(ctx);
  if (s === void 0) {
    s = { store: new ReactiveStore(ctx), subs: /* @__PURE__ */ new Set() };
    CTX_STATES.set(ctx, s);
  }
  return s;
}
var RECOMPUTE_HOOKS = /* @__PURE__ */ new Map();
function observe_and_fire_hooks(expr, store) {
  const before = store.recompute_count(expr);
  const val = store.observe(expr);
  const after = store.recompute_count(expr);
  if (after > before) {
    const hooks = RECOMPUTE_HOOKS.get(expr);
    if (hooks !== void 0) {
      for (const cb of hooks) cb();
    }
  }
  return val;
}
function evaluate(expr, ctx) {
  const state = get_state(ctx);
  state.store.register_dependent(expr);
  return observe_and_fire_hooks(expr, state.store);
}
function subscribe(expr, ctx, cb) {
  const state = get_state(ctx);
  state.store.register_dependent(expr);
  const initial = observe_and_fire_hooks(expr, state.store);
  const sub = {
    expr,
    ctx,
    store: state.store,
    cb,
    last_value: initial,
    active: true
  };
  cb(initial);
  register_subscription(sub, state.subs);
  return () => unregister_subscription(sub, state.subs);
}
function set_binding(ctx, name, value) {
  const state = get_state(ctx);
  state.store.set_binding(name, value);
  for (const sub of state.subs) {
    mark_subscription_dirty(sub);
  }
}
var _flushing = false;
function flush() {
  if (_flushing) return;
  _flushing = true;
  try {
    const to_process = [...DIRTY_SUBS];
    DIRTY_SUBS.clear();
    for (const sub of to_process) {
      if (!sub.active) continue;
      const new_val = observe_and_fire_hooks(sub.expr, sub.store);
      if (!per_type_equal(sub.last_value, new_val, sub.expr.type)) {
        sub.last_value = new_val;
        sub.cb(new_val);
      }
    }
  } finally {
    _flushing = false;
  }
}
function on_recompute(expr, cb) {
  if (!RECOMPUTE_HOOKS.has(expr)) {
    RECOMPUTE_HOOKS.set(expr, /* @__PURE__ */ new Set());
  }
  RECOMPUTE_HOOKS.get(expr)?.add(cb);
}

// src/runtime/index.ts
var runtime = {
  evaluate,
  subscribe,
  set_binding,
  flush,
  on_recompute
};
export {
  COLOR_SPACES,
  CSS_TARGET_CAPABILITIES,
  CortexError,
  DEFAULT_TONES,
  ErrorCode,
  M3_ROLES,
  STEVENS_AREA_EXPONENT,
  apca_contrast,
  build_root_block,
  collected_fragments,
  color_c,
  color_from_hue,
  color_h,
  color_l,
  comment_,
  complement,
  compose,
  composeCSS,
  configure_emit,
  convert_space,
  count_param_usage,
  css_target,
  css_visitor,
  ctx_env_lookup,
  ctx_extend,
  ctx_lookup,
  ctx_push,
  ctx_query_color_scheme,
  ctx_query_container,
  ctx_query_font_size,
  ctx_query_viewport,
  ctx_self_lookup,
  ctx_with_env,
  current_value,
  darken,
  dependencies,
  desaturate,
  detect_color_scheme_ifs,
  dot_to_css_var,
  emit_css_color,
  emit_css_length,
  empty_ctx,
  ensure_contrast,
  fluid_coefficients,
  format_number,
  formula,
  formula_full,
  gamut_map_to_srgb,
  graph,
  harmonic_hues,
  hue_diff,
  hue_distance,
  hue_shift,
  if_,
  in_srgb_gamut,
  inspect,
  is_color_scheme_if,
  is_color_space,
  is_container_if,
  is_ctx_query,
  is_if,
  is_let,
  is_lit,
  is_op,
  is_param,
  let_,
  let_many,
  lighten,
  lit_bool,
  lit_color,
  lit_hue,
  lit_length,
  lit_n,
  lit_ratio,
  lit_step,
  lit_tag,
  lookup_role,
  m3_role,
  m3_scheme_tonal_spot,
  make_color,
  make_hue,
  make_op,
  make_param,
  make_ratio,
  make_step,
  mix_color as mix,
  palette_at,
  param_bool,
  param_color,
  param_hue,
  param_length,
  param_n,
  param_to_css_var,
  parse,
  query_key,
  relative_luminance,
  reset_walk,
  resolve,
  root_context,
  runtime,
  saturate,
  seq_,
  serialize,
  serializeModule,
  shift_hue,
  stevens_area,
  stevens_general,
  target_hint_,
  tonal_palette,
  type_ref_eq,
  type_scale_fluid_step,
  type_scale_step,
  validate,
  value_to_expr,
  walk,
  wcag_contrast,
  with_bindings,
  with_c,
  with_h,
  with_l
};
//# sourceMappingURL=index.js.map