# CLAUDE.md — contexto del proyecto (se lee automáticamente al iniciar sesión)

> Contexto **estable** del proyecto. Se lee solo al empezar cualquier sesión
> en esta carpeta. Si algo quedó desactualizado, actualizalo.

## Qué es esto

Invitación de boda **digital, mobile, de scroll vertical** para **Sofi & Fede**.
Producto de **Cabanne Studio** (invitaciones). Es la **segunda** invitación del
estudio, **derivada de la plantilla de agus-y-santi** (concepto "El Sendero":
una línea de tinta que se dibuja al scrollear y serpentea entre las secciones).

Tracking en Beads: epic de la pareja **`wedding-1`** (bajo `wedding-epic`).
Estructura del proceso (fases A–G) en basic-memory `hub-knowledge/wedding-invitations/`.

**Estado: SCAFFOLD (fase D, bead `wedding-5`).** El esqueleto es una copia limpia
de agus-y-santi con los datos de esa pareja todavía dentro como placeholder. Falta:
- **Brief (A, `wedding-2`)** — info real de los novios y el evento.
- **Identidad visual (B, `wedding-3`)** — semilla de color + tipografías + assets.
- **Copy (C, `wedding-4`)** — reemplazar todo el texto de Agus&Santi por el de Sofi&Fede.
- **Integraciones (E, `wedding-6`)** — pegar las 3 URLs en el bloque CONFIG.
- **Deploy+QA (F) / Entrega (G).**

## Stack (importante — NO es Vite/React)

Un único `index.html` **autocontenido y estático** (CSS + JS inline, sin build,
sin frameworks). Dependencias externas: Google Fonts + fuentes locales en `fonts/`.
Los colores los genera **Cortex** (`build-tokens.mjs` → `tokens.css`), no se
escriben a mano. Preview local con `_preview-server.cjs` (o Live Server).
Deploy: estático a Vercel (`main` = producción, auto-deploy).

## Estructura de la carpeta

| Archivo / carpeta | Qué es |
|---|---|
| `index.html` | La invitación. Archivo vivo. Single-file estático. |
| `fonts/` | Fuentes locales (duo New Icon) vía `@font-face`. La fase B puede cambiarlas. |
| `assets/` | Imágenes que usa `index.html` (hoy: placeholders de Agus&Santi → se reemplazan en B/C). |
| `fondos/` | Tile de papel cold-press + script para extraerlo. Genérico, reusable. |
| `build-tokens.mjs` | Script Node que usa Cortex para generar `tokens.css` desde una semilla. |
| `tokens.css` | Generado por Cortex. Lo consume `index.html`. NO editar a mano. |
| `cortex-sdk/` | Copia local de `@cortex/core`. No editar. |
| `apps-script/` | Backend RSVP/fotos (Code.gs + SETUP.md). Plantilla para la fase E. |
| `shoot-hero.cjs`, `shoot-sendero.cjs` | Tooling de screenshots (puppeteer). |
| `_preview-server.cjs` | Server local de preview. |
| `vercel.json`, `.vercelignore` | Config de deploy estático. |
| `LEEME.md` | Orientación general. |

## Bloque CONFIG (el único lugar de las integraciones)

En el `<head>` de `index.html`, `window.WEDDING_CFG` tiene `RSVP_ENDPOINT`,
`SPOTIFY_PLAYLIST`, `PHOTOS_URL`. **Hoy vacías** (cada sección se oculta sola
mientras lo estén). Se llenan en la fase E con la cuenta del estudio
`studiogloton@gmail.com` siguiendo `apps-script/SETUP.md`. NUNCA pegar acá las
URLs de otra boda.

## Reglas al editar `index.html`

- Se mantiene **single-file** (no partir en módulos).
- Mobile-first (~390px de ancho), salvo pedido explícito.
- Copy en castellano rioplatense neutro, voz cálida pero sobria, frases cortas.
- Elementos que animan al entrar a viewport llevan `class="reveal"`.
- **Los colores no se escriben a mano**: vienen de `tokens.css` (`--cream`,
  `--ink`, `--terra`, `--terra-deep`, `--sage`, `--gold`, etc.). Acentos finos
  de texto chico = `--terra-deep` (no `--terra`) por la auditoría APCA.
- **Estética watercolor real**: sendero y decoración son PNG/JPG (IA), no SVG
  hand-made. Si una iteración requiere SVG a mano, preguntar primero.
- GOTCHA heredado: **no reusar `var ticking`** entre el sweep de `.reveal` y el
  trail del sendero (colisión de scroll handlers).
- La sección **FOTOS se activa por fecha** (gate en el `<head>`). Hoy con fecha
  placeholder lejana (2099) hasta fijar la real en el brief.

## La fecha de la boda

Sin definir (TBD). La fecha condiciona: `<title>`, countdown si lo hay, y el
gate de la sección FOTOS. Fijarla apenas llegue el brief (fase A).
