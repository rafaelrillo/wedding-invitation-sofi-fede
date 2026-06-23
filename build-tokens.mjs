// ============================================================================
//  build-tokens.mjs
//  ---------------------------------------------------------------------------
//  Genera "tokens.css" usando la librería Cortex.
//  El index.html NO define colores: los toma de tokens.css. Este script es la
//  "fábrica" de ese archivo.
//
//  Para regenerar tokens.css:   node build-tokens.mjs
//
//  ESTRATEGIA:
//    1. Anclas exactas — los 8 colores cálidos que ya usa el rediseño quedan
//       como hex literales (política: "no reinventar lo que ya gusta").
//    2. Paletas tonales por hue — Cortex genera rampas completas (tonos 5..95)
//       para los 4 hues principales (neutral cálido, terra, sage, gold).
//       Los anclas caen como "anclajes" naturales dentro de su paleta.
//    3. Auditoría APCA — para cada par texto/fondo que realmente usa la
//       invitación, Cortex mide el contraste y marca OK / AL LÍMITE / BAJO.
// ============================================================================

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  make_color,
  convert_space,
  color_l, color_c, color_h,
  apca_contrast,
  tonal_palette, palette_at,
  lit_color, emit_css_color,
} from './cortex-sdk/dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// 1) ANCLAS — colores exactos del rediseño actual de index.html
// ─────────────────────────────────────────────────────────────────────────────
// SOFI & FEDE — fondos cálidos heredados de agus, pero el ACENTO pasa de
// terracota/tierra a los VERDES de las hojas del save the date (eucalipto/olivo
// cálido, muestreados con PIL: hue ~60-85°, baja saturación). Los nombres de
// variable --terra/--terra-deep se conservan (los usa index.html) pero su valor
// ahora es verde hoja. Rename semántico = cleanup posterior.
const ANCHOR = {
  cream:      '#f4f1e8',  // papel cálido (fondo principal) — KEEP
  cream2:     '#ebe4d3',  // crema más profundo (variante) — KEEP
  ink:        '#3a3026',  // marrón oscuro cálido (texto principal) — KEEP cálido
  inkSoft:    '#877560',  // texto secundario / labels — KEEP
  inkName:    '#6b5c47',  // marrón medio: nombres del hero — KEEP
  terra:      '#6f7d4f',  // ACENTO = verde eucalipto (era terracota #c0734a)
  terraDeep:  '#515e39',  // acento profundo = olivo (era terracota #a4572f)
  sage:       '#8b9471',  // verde salvia (washes / hojas) — KEEP, ya es verde
  gold:       '#b89b66',  // dorado trigo apagado (centros de orquídea / brotes)
};

// utilidades hex ↔ rgb01 ↔ HCT
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const hexToRgb01 = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const rgb01ToHex = (coords) =>
  '#' + coords.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('');
const hexToHct = (hex) => convert_space(make_color(hexToRgb01(hex), 'sRGB'), 'HCT');
const hctToHex = (col) => rgb01ToHex(convert_space(col, 'sRGB').coords);

// ─────────────────────────────────────────────────────────────────────────────
// 2) LECTURA HCT DE LAS ANCLAS — h (hue 0-360°), c (chroma), l (tone 0-100)
// ─────────────────────────────────────────────────────────────────────────────
const hct  = Object.fromEntries(Object.entries(ANCHOR).map(([k, v]) => [k, hexToHct(v)]));
const tone = Object.fromEntries(Object.entries(hct).map(([k, v]) => [k, color_l(v)]));
const hue  = Object.fromEntries(Object.entries(hct).map(([k, v]) => [k, color_h(v)]));
const chr  = Object.fromEntries(Object.entries(hct).map(([k, v]) => [k, color_c(v)]));

// ─────────────────────────────────────────────────────────────────────────────
// 3) PALETAS TONALES — Cortex genera una rampa completa para cada hue.
//    Cada ancla cae aprox. en algún tono de su rampa (la rampa "extiende"
//    el color a tonos más claros y más oscuros mantieniendo coherencia HCT).
// ─────────────────────────────────────────────────────────────────────────────
const RAMP_TONES = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];

// Seeds: hue y chroma representativos para cada familia. El hue lo sacamos del
// ancla más característica de cada familia; el chroma lo elegimos para que la
// paleta se sienta cálida pero no fosforescente.
const SEEDS = {
  neutral: { hue: hue.cream,     chroma: 6,   name: 'neutral' },  // beige cálido
  terra:   { hue: hue.terra,     chroma: 24,  name: 'terra'   },  // acento verde eucalipto (muted)
  sage:    { hue: hue.sage,      chroma: 18,  name: 'sage'    },  // verde salvia
  gold:    { hue: hue.gold,      chroma: 28,  name: 'gold'    },  // dorado trigo apagado
};

const palettes = Object.fromEntries(
  Object.entries(SEEDS).map(([k, s]) => [
    k,
    tonal_palette(s.hue, s.chroma, { tones: RAMP_TONES, name: s.name })
  ])
);
const tonHex = (pal, t) => hctToHex(palette_at(pal, t, { interpolate: true }));

// ─────────────────────────────────────────────────────────────────────────────
// 4) AUDITORÍA APCA — pares texto/fondo reales de la invitación.
//    APCA: |Lc| ≥ 75 OK incluso texto chico; 60-74 OK texto normal; <45 BAJO.
// ─────────────────────────────────────────────────────────────────────────────
const PAIRS = [
  { fg: 'ink',       bg: 'cream', use: 'texto principal sobre fondo'           },
  { fg: 'ink',       bg: 'cream2',use: 'texto principal sobre crema profundo'  },
  { fg: 'inkSoft',   bg: 'cream', use: 'labels / kickers (10.5px uppercase)'   },
  { fg: 'inkName',   bg: 'cream', use: 'nombres del hero (serif grande)'       },
  { fg: 'terra',     bg: 'cream', use: 'acento terra (sin smoking, sin blanco)'},
  { fg: 'terraDeep', bg: 'cream', use: 'acento terra profundo'                 },
  { fg: 'sage',      bg: 'cream', use: 'tallo enredadera + wash sage'          },
  { fg: 'gold',      bg: 'cream', use: 'dorado trigo (puntitos brote)'         },
  { fg: 'cream',     bg: 'ink',   use: 'texto claro sobre tinta (botones)'     },
];
const grade = (lc) => {
  const a = Math.abs(lc);
  if (a >= 75) return 'OK (incluso texto chico)';
  if (a >= 60) return 'OK (texto normal)';
  if (a >= 45) return 'AL LÍMITE (solo texto grande)';
  return 'BAJO (no usar para texto)';
};
const auditPairs = PAIRS.map(p => {
  const lc = apca_contrast(hct[p.fg], hct[p.bg]);
  return { ...p, lc, grade: grade(lc) };
});

// ─────────────────────────────────────────────────────────────────────────────
// 5) REPORTE EN CONSOLA
// ─────────────────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log('\n=== Cortex · paleta cálida de la invitación =================');
console.log('Política: 9 anclas exactas + paletas tonales completas por hue.\n');

console.log('  Anclas (HCT analizado por Cortex):');
console.log('  ' + pad('rol', 10) + pad('hex', 9) + pad('tono', 6) + pad('hue°', 6) + 'chroma');
console.log('  ' + '-'.repeat(48));
for (const k of Object.keys(ANCHOR)) {
  console.log('  ' + pad(k, 10) + pad(ANCHOR[k], 9) +
              pad(tone[k].toFixed(0), 6) + pad(hue[k].toFixed(0), 6) + chr[k].toFixed(1));
}

console.log('\n  Paletas tonales generadas (Cortex tonal_palette):');
for (const k of Object.keys(palettes)) {
  console.log(`\n    ${SEEDS[k].name}  (hue ${SEEDS[k].hue.toFixed(0)}°, chroma ${SEEDS[k].chroma})`);
  for (const t of RAMP_TONES) {
    const hex = tonHex(palettes[k], t);
    console.log(`      tono ${String(t).padStart(2)}  →  ${hex}`);
  }
}

console.log('\n  Auditoría APCA (Cortex apca_contrast):');
console.log('  ' + pad('fg / bg', 22) + pad('|Lc|', 8) + 'veredicto · uso');
console.log('  ' + '-'.repeat(80));
for (const a of auditPairs) {
  const pair = `${a.fg} / ${a.bg}`;
  console.log('  ' + pad(pair, 22) + pad(Math.abs(a.lc).toFixed(1), 8) + a.grade + '  ·  ' + a.use);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6) ESCRIBIR tokens.css
// ─────────────────────────────────────────────────────────────────────────────
const rampLines = (k) => RAMP_TONES.map(t =>
  `  --${SEEDS[k].name}-${t}: ${tonHex(palettes[k], t)};`
).join('\n');

const auditLines = auditPairs.map(a =>
  `   ${pad(a.fg + '/' + a.bg, 22)}|Lc|=${Math.abs(a.lc).toFixed(1).padStart(5)}   ${a.grade}`
).join('\n');

const css = `/* ============================================================================
   tokens.css — GENERADO POR CORTEX.  ⚠ No editar a mano.
   Para regenerar:   node build-tokens.mjs
   ----------------------------------------------------------------------------
   Design system de Sofi & Fede — fondos cálidos + acento verde hoja (eucalipto).

   Estructura:
     1. ANCLAS (--cream, --ink, --terra, --sage, --gold, ...): los colores
        exactos del rediseño. Son las variables que usa index.html.
     2. PALETAS TONALES (--neutral-XX, --terra-XX, --sage-XX, --gold-XX):
        rampas completas generadas por Cortex desde el hue/chroma del ancla.
        Disponibles para ajustes finos (sombras, hovers, washes).
     3. HAIRLINES: --line / --line-strong, derivadas de --ink con color-mix.

   Auditoría APCA (verificada por Cortex):
${auditLines}
   ============================================================================ */

:root {
  /* — 1. ANCLAS (colores exactos del rediseño) — */
  --cream:       ${ANCHOR.cream};   /* papel cálido (fondo)         · tono ${tone.cream.toFixed(0)} */
  --cream-2:     ${ANCHOR.cream2};   /* crema más profundo           · tono ${tone.cream2.toFixed(0)} */
  --ink:         ${ANCHOR.ink};   /* marrón oscuro cálido (texto) · tono ${tone.ink.toFixed(0)}  */
  --ink-soft:    ${ANCHOR.inkSoft};   /* texto secundario             · tono ${tone.inkSoft.toFixed(0)} */
  --ink-name:    ${ANCHOR.inkName};   /* nombres del hero             · tono ${tone.inkName.toFixed(0)} */
  --terra:       ${ANCHOR.terra};   /* verde eucalipto (acento)     · tono ${tone.terra.toFixed(0)} */
  --terra-deep:  ${ANCHOR.terraDeep};   /* olivo profundo (acento)      · tono ${tone.terraDeep.toFixed(0)} */
  --sage:        ${ANCHOR.sage};   /* verde salvia (washes/hojas)  · tono ${tone.sage.toFixed(0)} */
  --gold:        ${ANCHOR.gold};   /* dorado trigo (puntitos)      · tono ${tone.gold.toFixed(0)} */
  --marron:      ${ANCHOR.inkName};   /* alias para hojas marrón sutil */

  /* — 2. PALETAS TONALES (Cortex) — rampas completas por hue.
     Disponibles si en algún momento querés un sage más claro para un wash,
     o un terra más oscuro para un hover, etc. — */

  /* neutral cálido (de cream a ink) — hue ${SEEDS.neutral.hue.toFixed(0)}°, chroma ${SEEDS.neutral.chroma} */
${rampLines('neutral')}

  /* terra (terracota) — hue ${SEEDS.terra.hue.toFixed(0)}°, chroma ${SEEDS.terra.chroma} */
${rampLines('terra')}

  /* sage (verde salvia) — hue ${SEEDS.sage.hue.toFixed(0)}°, chroma ${SEEDS.sage.chroma} */
${rampLines('sage')}

  /* gold (dorado trigo) — hue ${SEEDS.gold.hue.toFixed(0)}°, chroma ${SEEDS.gold.chroma} */
${rampLines('gold')}

  /* — 3. HAIRLINES (líneas finitas): derivadas de --ink con color-mix —
     Mantienen el mismo hue del texto pero a baja opacidad, así nunca chocan. */
  --line:        color-mix(in srgb, var(--ink) 16%, transparent);
  --line-strong: color-mix(in srgb, var(--ink) 42%, transparent);
}
`;

const outPath = join(__dirname, 'tokens.css');
writeFileSync(outPath, css, 'utf8');
console.log(`\n  ✓ Escrito: ${outPath}`);
console.log('=============================================================\n');
