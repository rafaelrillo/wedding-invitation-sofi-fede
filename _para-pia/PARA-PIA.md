# Invitación Sofi & Fede — Info para Pía

Todo lo que necesitás para hacer los retoques.
La invitación live está en **https://sofi-y-fede.vercel.app**

---

## Cómo trabajar

1. Cloná el repo
2. Abrí `index.html` en el navegador (o corrés `node _preview-server.cjs` para tener recarga automática)
3. Hacés los cambios en `index.html`
4. Cuando esté listo, hacés push a `master` y avisás a Rafa para el redeploy a Vercel

El proyecto es **un solo archivo** (`index.html`) con todo el CSS y JS inline. No hay build, no hay React, no hay npm install necesario para editar.

---

## Paleta de colores

| Variable | Hex | Uso |
|---|---|---|
| `--cream` | `#f4f1e8` | Fondo general (papel cálido) |
| `--cream-2` | `#ebe4d3` | Crema más profundo (fondos de sección) |
| `--ink` | `#3a3026` | Texto principal (marrón oscuro cálido) |
| `--ink-soft` | `#877560` | Texto secundario |
| `--ink-name` | `#6b5c47` | Nombres del hero |
| `--terra` | `#6f7d4f` | Verde eucalipto (acento principal) |
| `--terra-deep` | `#515e39` | Olivo profundo (texto chico, botones) |
| `--sage` | `#8b9471` | Verde salvia (washes, hojas) |
| `--gold` | `#b89b66` | Dorado trigo (puntitos decorativos) |

Los colores viven en `tokens.css`. **No editar a mano** — si hace falta regenerar la paleta hay que tocar `build-tokens.mjs`.

---

## Tipografías

### Locales (en `fonts/`)
| Fuente | Uso |
|---|---|
| **New Icon Script Regular** | Nombres "Sofi & Fede" en el hero |
| **New Icon Serif Regular** | Títulos de sección principales |
| **New Icon Serif Condensed** | Variante condensada en algunas secciones |

### Google Fonts (cargadas automáticamente)
| Fuente | Uso actual |
|---|---|
| **Cormorant Garamond** | `--font-title` (default) — la mayor parte de los títulos |
| **Parisienne** | Texto script decorativo (kickers, acentos) |
| **Fraunces** | Algunos títulos de sección |
| **DM Sans** | `--font-body` — cuerpo de texto, botones |
| **Source Serif 4** | Disponible como opción alternativa de título |

El save-the-date que mandaron los novios (en `assets-fuente/save-the-date/`) muestra la tipografía que eligieron. Los nombres están en **New Icon Script**; los títulos en **New Icon Serif**.

---

## Secciones y qué assets usa cada una

| # | Sección | Assets en uso | Notas |
|---|---|---|---|
| 1 | **Hero** | `assets/hero-palmeras.jpg` (fondo sepia, pareja en palmeras) | Foto principal al entrar |
| 2 | **Ceremonia** | `assets/draws/iglesia-misa.webp` | Ilustración sepia de la capilla |
| 3 | **Festejo** | `assets/draws/fiesta-draw.webp` | Ilustración sepia del salón |
| 4 | **Dress code** | — | Solo texto, sin ilustraciones |
| 5 | **Regalos** | — | Alias pesos/dólares. CBU/titular: pendiente |
| 6 | **Playlist** | `assets/draws/spotify-draw.webp` | Formulario que va al Sheet |
| 7 | **Fotos** | QR generado por JS | Se activa solo el día de la boda |
| 8 | **RSVP** | — | Formulario con menú + alergias |
| 9 | **Contador** | — | Countdown a 08/08/2026 |

**Botánicas del sendero** (línea de tinta que se dibuja al scrollear):
- Están en `assets/sendero/` y en `assets-fuente/botanicas/`
- Son PNG con canal alpha (fondo transparente)
- Se posicionan como decoración lateral entre secciones

**Flores decorativas:**
- En `assets/flores/` y en `assets-fuente/botanicas/flores-composicion-*.jpg`
- Se usan como separadores visuales

---

## Qué está pendiente de los novios

1. **Links de mapa** — Ceremonia (Capilla Ntra Sra del Carmen, Universidad San Pablo, Solano Vera T4129, Yerba Buena) + Festejo (La Arboleda)
2. **Dirección exacta de La Arboleda** (sale del link de mapa)
3. **Datos bancarios completos** — Hoy solo tiene alias (`SOFIYFEDE.PESOS` / `SOFIYFEDE.USD`). Falta: Titular, CBU, banco
4. **Deadline del RSVP** — La invitación dice "antes del 25 de julio" (placeholder). Confirmar fecha real

Esos datos van en el bloque de texto en `index.html`. Buscar los comentarios `<!-- PENDIENTE -->` o los textos entre corchetes para ubicarlos fácil.

---

## Assets fuente en esta carpeta

```
assets-fuente/
├── save-the-date/          ← imágenes del save the date (referencia de tipografía)
├── fotos-novios/           ← fotos usadas en la invitación + originals del brief
│   └── agus-y-santi-footer-REEMPLAZAR.jpeg  ← esta foto es de la boda anterior, hay que reemplazarla
├── ilustraciones/          ← iglesia, salón, vestido, saco, copas (webp + originales)
└── botanicas/              ← PNGs transparentes del sendero + composiciones de flores
```

**OJO:** `fotos-novios/agus-y-santi-footer-REEMPLAZAR.jpeg` es la foto del footer que todavía corresponde a la pareja anterior (Agus & Santi). Hay que reemplazarla por una foto de Sofi & Fede. El archivo que usa la invitación vive en `assets/agus-y-santi-footer.jpeg` — reemplazarlo allí (o cambiar la ruta en `index.html`).

---

## Datos del evento

| | |
|---|---|
| **Boda** | Sofi & Fede |
| **Fecha** | 08 de agosto de 2026 |
| **Ceremonia** | 16:30 hs — Capilla Nuestra Señora del Carmen, Universidad San Pablo, Solano Vera T4129, Yerba Buena, Tucumán |
| **Festejo** | 18:00 hs — La Arboleda (dirección exacta pendiente) |
| **Dress code** | Elegante |
| **Alias pesos** | SOFIYFEDE.PESOS |
| **Alias dólares** | SOFIYFEDE.USD |
