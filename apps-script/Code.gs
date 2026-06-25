/**
 * Sofi & Fede — backend del RSVP (Google Apps Script).
 *
 * Recibe los POST del formulario de la invitación y los escribe en la
 * Google Sheet a la que está ligado este script. Dos tipos de envío:
 *   · type:'rsvp'     → una fila por invitado en la pestaña "Confirmaciones"
 *   · type:'mensaje'  → una fila en la pestaña "Mensajes"
 *
 * Está pensado para correr LIGADO a la Sheet (Extensiones → Apps Script
 * desde la propia hoja), por eso usa getActiveSpreadsheet().
 *
 * Pasos de publicación en apps-script/SETUP.md
 */

var TZ = 'America/Argentina/Buenos_Aires';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ts = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');

    if (data.type === 'rsvp') {
      var sh = getOrCreateSheet_(ss, 'Confirmaciones',
        ['Fecha', 'Invitado', 'Nombre', 'Asistencia', 'Menú', 'Alergias', 'Invitacion']);
      (data.guests || []).forEach(function (g) {
        sh.appendRow([ts, g.invitado || '', g.nombre || '', g.asistencia || '',
          g.menu || '', g.alergias || '', data.link || '']);
      });
    } else if (data.type === 'mensaje') {
      var sm = getOrCreateSheet_(ss, 'Mensajes', ['Fecha', 'De parte de', 'Mensaje']);
      sm.appendRow([ts, data.nombre || '', data.mensaje || '']);
    } else if (data.type === 'cancion') {
      var sc = getOrCreateSheet_(ss, 'Canciones', ['Fecha', 'De parte de', 'Canción']);
      sc.appendRow([ts, data.nombre || '', data.cancion || '']);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Permite abrir la URL en el navegador para verificar que está viva.
function doGet() {
  return json_({ ok: true, msg: 'RSVP endpoint vivo' });
}

function getOrCreateSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
  }
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Utilidad one-shot: limpia los datos y deja las tres pestañas prolijas y
 * legibles (anchos por columna, header con color, colores alternos, header
 * congelado, wrap). Se corre A MANO desde el editor (Ejecutar → formatSheets)
 * cuando se quiere resetear/embellecer la Sheet. Reutilizable en cada boda.
 * OJO: borra todas las filas de datos (deja solo encabezados).
 * ────────────────────────────────────────────────────────────────────────── */
function formatSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheet_(ss.getSheetByName('Confirmaciones'), [150, 80, 220, 110, 200, 220, 120]);
  setupSheet_(ss.getSheetByName('Mensajes'), [150, 200, 460]);
  setupSheet_(ss.getSheetByName('Canciones'), [150, 200, 460]);
}

function setupSheet_(sh, widths) {
  if (!sh) return;
  var ncols = widths.length;

  // 1. limpiar datos (deja solo la fila de encabezados)
  var last = sh.getLastRow();
  if (last > 1) sh.deleteRows(2, last - 1);

  // 2. anchos por columna
  for (var i = 0; i < ncols; i++) sh.setColumnWidth(i + 1, widths[i]);

  // 3. quitar bandings previos
  var prev = sh.getBandings();
  for (var b = 0; b < prev.length; b++) prev[b].remove();

  // 4. colores alternos en el cuerpo (legibilidad fila a fila)
  var maxRows = sh.getMaxRows();
  sh.getRange(2, 1, maxRows - 1, ncols)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);

  // 5. header: negrita, fondo terracota, texto blanco, alto y congelado
  var header = sh.getRange(1, 1, 1, ncols);
  header.setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
        .setFontColor('#ffffff').setBackground('#8a5440')
        .setHorizontalAlignment('left').setVerticalAlignment('middle');
  sh.setRowHeight(1, 36);
  sh.setFrozenRows(1);

  // 6. cuerpo: fuente, alineación vertical y wrap (menú/alergias/mensaje largos)
  sh.getRange(2, 1, maxRows - 1, ncols)
    .setFontFamily('Arial').setFontSize(10)
    .setVerticalAlignment('middle').setWrap(true);
}
