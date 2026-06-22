# Boda Flavia & Alex — invitación digital

Proyecto: invitación de boda digital, mobile, scroll vertical. El diseño viene de un prototipo previo; lo estamos rehaciendo para que el **design system** (colores, tamaños) lo genere **Cortex**.

## Qué hay en esta carpeta

| Archivo / carpeta | Qué es | ¿Lo tocás? |
|---|---|---|
| `index.html` | **La invitación.** Es el archivo "vivo" — el que abrís en el navegador y el que vamos modificando. Ya NO define colores: los toma de `tokens.css`. | Sí (con ayuda del asistente). Para verlo: clic derecho → *Open with Live Server*. |
| `build-tokens.mjs` | Script que usa **Cortex** para calcular los colores (desde una "semilla": un hue + chroma), chequear el contraste, y escribir `tokens.css`. | No directamente; le pedís cambios al asistente. Para regenerar: `node build-tokens.mjs`. |
| `tokens.css` | Lo que **genera Cortex**: las variables de color (`--bg`, `--ink`, `--accent`, `--hair`, `--hair-strong`) que usa `index.html`. **No se edita a mano** — se regenera corriendo `build-tokens.mjs`. | No. |
| `cortex-sdk/` | Copia de la librería Cortex, para que el proyecto sea autocontenido. | No. |
| `handoff/` | Documentación del prototipo original (contexto, design system, componentes, próximos pasos). **Solo referencia.** | No — es de consulta. |

## Cómo verla

1. En VS Code: `Archivo → Abrir carpeta...` → elegí esta carpeta (`boda-flavia-alex`).
2. Clic derecho sobre `index.html` → **Open with Live Server** (o botón **Go Live** abajo a la derecha).
3. Se abre en el navegador. Está pensada **mobile**: en una pantalla de compu se ve como una columna angosta centrada (eso es a propósito). Para verla "como en un celular": `F12` en el navegador → ícono de celular/tablet.

## Estado

- [x] Carpeta del proyecto creada con el prototipo como `index.html`.
- [x] Design system enchufado en Cortex (`build-tokens.mjs` → `tokens.css` → lo usa `index.html`). Los colores son **exactamente** los del prototipo (`#f0eeeb` / `#1a1a1a` / `#888880`); Cortex los analiza (los ubica en la escala HCT) y verifica el contraste APCA. La invitación se ve idéntica.
- [ ] Aplicar las modificaciones planeadas.

### Cuando queramos tocar la paleta
Hoy `build-tokens.mjs` deja los colores fijos a propósito, pero ya tiene calculada (al final de `tokens.css`, como comentario) una **paleta tonal cálida completa** generada por Cortex. Pasar de "colores fijos" a "colores generados desde una semilla" es un cambio chico cuando lo decidamos. También está disponible `ensure_contrast` de Cortex para subir el contraste del `--accent` (hoy al límite, |Lc|≈54) garantizándolo matemáticamente — pero eso oscurece un poco el gris, así que es una decisión, no automático.

*Cualquier duda, preguntale al asistente (Claude) en VS Code.*
