# Setup de Google — Sofi & Fede

La invitación ya está cableada. Solo hay que crear las cosas en Google y pegar
2 URLs en el bloque `CONFIG` de `index.html` (arriba de todo, en el `<head>`).

## Cuenta del estudio

Todo queda bajo **`studiogloton@gmail.com`** — dueña de TODAS las bodas.
Los novios reciben acceso de lectura; nunca la contraseña.

Hacer todos los pasos de abajo **logueado en esa cuenta**.

---

## 1. RSVP + Mensajes → Google Sheet (Apps Script)

1. Crear una **Google Sheet** nueva. Nombre: `Sofi & Fede — Confirmaciones`.
   (No crear pestañas a mano — el script las crea solo con sus encabezados.)

2. En esa hoja: **Extensiones → Apps Script**.

3. Borrar el contenido de ejemplo y pegar **todo** el contenido de `Code.gs`
   (el archivo que está al lado de este). Guardar (💾).

4. **Implementar → Nueva implementación**:
   - Tipo (⚙️): **Aplicación web**
   - Descripción: `RSVP Sofi & Fede`
   - Ejecutar como: **Yo** (tu cuenta)
   - Quién tiene acceso: **Cualquier persona** ← importante, si no el form falla
   - Implementar → autorizar permisos (login + "permitir")

5. Copiar la **URL de la aplicación web** (termina en `/exec`).

6. Pegarla en `index.html`, bloque `CONFIG`, en `RSVP_ENDPOINT`.

**Verificación:** abrir esa URL en el navegador → debe responder
`{"ok":true,"msg":"RSVP endpoint vivo"}`.

> Si más adelante editás `Code.gs`: Implementar → Gestionar implementaciones
> → editar (lápiz) → Nueva versión. Sin eso la web app corre la versión vieja.

---

## 2. Fotos → carpeta de Drive

1. Crear una carpeta en Drive: `Fotos — Sofi & Fede`.

2. Compartir → **Cualquier persona con el enlace** → rol **Editor**
   (para que los invitados puedan subir, no solo ver).

3. Copiar el link de la carpeta.

4. Pegarlo en `CONFIG` → `PHOTOS_URL`.
   (Si queda vacío, la sección de fotos se oculta sola.)

---

## 3. Redeploy a Vercel

Una vez pegadas las 2 URLs (y los datos bancarios completos cuando lleguen),
hacer redeploy a Vercel. El asistente lo corre.

---

### Resumen: las 2 URLs que hay que conseguir y pegar en CONFIG

| CONFIG          | De dónde sale                             |
|-----------------|-------------------------------------------|
| `RSVP_ENDPOINT` | URL `/exec` de la web app de Apps Script  |
| `PHOTOS_URL`    | Link de la carpeta de Drive (modo Editor) |

---

### Compartir con los novios (hacer DESPUÉS del deploy)

Una vez que la invitación esté deployada y funcionando:

- **Sheet**: compartir `Sofi & Fede — Confirmaciones` → Compartir → agregar los
  mails de los novios como **Lectores** (pueden ver las confirmaciones, no editar).
- **Carpeta Drive fotos**: ya está en modo "Cualquier persona con el enlace puede
  subir" — no hace falta compartir aparte, con el link alcanza.
