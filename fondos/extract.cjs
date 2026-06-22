const sharp = require('sharp');

const SRC = 'diseño/flores/Watercolor_floral_arrangement_on…_202605271732 (1).jpeg';

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log('source:', meta.width + 'x' + meta.height);

  // Zona limpia confirmada: mid-right de la imagen, evitando los splatters
  // del corner. Tomamos 600x600 desde left=850 top=350 (si entra).
  let left = 850, top = 350, w = 600, h = 600;
  if (left + w > meta.width)  w = meta.width  - left;
  if (top  + h > meta.height) h = meta.height - top;
  console.log('crop:', w + 'x' + h, 'at', left + ',' + top);

  // 1) recorte crudo grande (para diagnóstico)
  await sharp(SRC)
    .extract({ left, top, width: w, height: h })
    .toFile('fondos/paper-clean.jpg');

  // 2) tile final optimizado: 480x480, JPEG calidad 80, mozjpeg.
  await sharp('fondos/paper-clean.jpg')
    .resize(480, 480, { fit: 'cover' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile('fondos/paper-tile.jpg');

  // 3) versión más grande (para fondo non-repeat de toda la stage si conviene)
  await sharp('fondos/paper-clean.jpg')
    .resize(390, 600, { fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile('fondos/paper-section.jpg');

  console.log('done.');
})();
