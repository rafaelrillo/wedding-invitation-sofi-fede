# Publicar Agus & Santi con todo — setup de Google

Lo que falta es **conectar la invitación a Google**. El código ya está cableado;
solo hay que crear las cosas en Google y pegar 3 URLs en el bloque `CONFIG` de
`index.html` (arriba de todo, después del `<script>` de `data-inv`).

## 0. Cuenta del estudio (una sola vez)

Todo lo de Google (Sheet + Apps Script + carpeta de Drive) queda atado a **una
única cuenta de Google del estudio** — es la dueña del pipeline de TODAS las
bodas. A cada pareja se le **comparte** lo que tiene que ver (la Sheet y la
carpeta como lectores); nunca se le da la contraseña de la cuenta.

- Si la cuenta del estudio aún no existe: crear un Gmail nuevo (ej.
  `cabannestudio@gmail.com` o el nombre que definan). Verificación por teléfono.
- **Hacer TODOS los pasos de abajo logueado en esa cuenta**, no en la personal.
- La playlist de Spotify es aparte (cuenta de Spotify, no Google).

## 1. RSVP + Mensajes → Google Sheet (Apps Script)

1. Crear una **Google Sheet** nueva (Drive → Nueva → Hoja de cálculo). Nombre
   sugerido: `Agus & Santi — Confirmaciones`. No hace falta crear pestañas a
   mano: el script crea `Confirmaciones` y `Mensajes` con sus encabezados solo.
2. En esa hoja: **Extensiones → Apps Script**.
3. Borrar el contenido de ejemplo y pegar **todo** el contenido de `Code.gs`
   (el archivo que está al lado de este). Guardar (💾).
4. **Implementar → Nueva implementación**.
   - Tipo (⚙️): **Aplicación web**.
   - Descripción: `RSVP Agus & Santi`.
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier persona**.  ← importante, si no, el form falla.
   - Implementar → autorizar permisos (te va a pedir login + "permitir").
5. Copiar la **URL de la aplicación web** (termina en `/exec`).
6. Pegarla en `index.html`, bloque CONFIG, en `RSVP_ENDPOINT`.

Verificación rápida: abrir esa URL `/exec` en el navegador → debe responder
`{"ok":true,"msg":"RSVP endpoint vivo"}`.

> Nota: si más adelante editás `Code.gs`, hay que hacer **Implementar → Gestionar
> implementaciones → editar (lápiz) → Nueva versión**, si no la web app sigue
> corriendo la versión vieja.

## 2. Fotos → carpeta de Drive

1. Crear una carpeta en Drive: `Fotos — Agus & Santi`.
2. Compartir → **Cualquier persona con el enlace** → rol **Editor** (para que los
   invitados puedan *subir*, no solo ver).
3. Copiar el link de la carpeta.
4. Pegarlo en CONFIG → `PHOTOS_URL`. (Si queda vacío, la sección de fotos se
   oculta sola.)

## 3. Música → playlist de Spotify

1. Crear una playlist en Spotify, marcarla como **colaborativa** (así los
   invitados agregan temas) y **pública**.
2. Compartir → Copiar enlace.
3. Pegarlo en CONFIG → `SPOTIFY_PLAYLIST`. (Si queda vacío, el botón se oculta.)

## 4. Datos bancarios (regalos)

En `index.html`, sección "DATOS BANCARIOS (regalos)", reemplazar los placeholders
por los datos reales de Agus & Santi (titular, CBU, alias — pesos y dólares).
Hoy figuran `agusysanti.pesos` / `agusysanti.usd` y "Mercado Pago" como ejemplo.

## 5. Redeploy a Vercel

Una vez pegadas las URLs y los datos, volver a deployar (mismo proyecto Vercel
`agus-y-santi`). El asistente corre el deploy.

---

### Resumen: las 3 URLs que hay que conseguir y pegar en CONFIG

| CONFIG            | De dónde sale                               |
|-------------------|---------------------------------------------|
| `RSVP_ENDPOINT`   | URL `/exec` de la web app de Apps Script    |
| `PHOTOS_URL`      | Link de la carpeta de Drive (modo aportar)  |
| `SPOTIFY_PLAYLIST`| Link de la playlist colaborativa de Spotify |
