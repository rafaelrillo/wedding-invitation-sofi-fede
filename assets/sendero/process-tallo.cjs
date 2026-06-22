// Procesa el tallo watercolor para tener un tile vertical optimizado
// para distribuir como segmentos a lo largo del path del sendero.
//
// Source: diseño/sendero/tallo/Single_vertical_stem_watercolor_202605271908 (1).png
// (la versión más fina, con vena central más definida).
//
// Salida:
//   - assets/sendero/tallo/segment.png  → tile chico (40x120) listo para distribuir
//   - assets/sendero/tallo/segment-2.png → variante usando 271908.png (más ancho)

const sharp = require('sharp');

(async () => {
  // ─ tallo fino (271908_1)
  const src1 = 'diseño/sendero/tallo/Single_vertical_stem_watercolor_202605271908 (1).png';
  const meta1 = await sharp(src1).metadata();
  console.log('src1:', meta1.width + 'x' + meta1.height);

  // El tallo está aproximadamente en el centro horizontal. Tomamos una franja
  // angosta centrada que sólo contenga el tallo y unos pocos splatters.
  // Ancho de franja: ~30% del width centrado.
  const cropW1 = Math.floor(meta1.width * 0.30);
  const cropX1 = Math.floor((meta1.width - cropW1) / 2);
  // Verticalmente: tomamos la zona donde el tallo realmente está pintado
  // (evitamos el top "abrupto" y el bottom donde la pintura termina).
  const cropY1 = Math.floor(meta1.height * 0.04);
  const cropH1 = Math.floor(meta1.height * 0.92);

  await sharp(src1)
    .extract({ left: cropX1, top: cropY1, width: cropW1, height: cropH1 })
    .resize(60, 240, { fit: 'fill' })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile('assets/sendero/tallo/segment.png');
  console.log('segment.png: 60x240');

  // ─ tallo ancho (271908) – variante para tramos donde queremos más "peso"
  const src2 = 'diseño/sendero/tallo/Single_vertical_stem_watercolor_202605271908.png';
  const meta2 = await sharp(src2).metadata();
  console.log('src2:', meta2.width + 'x' + meta2.height);

  const cropW2 = Math.floor(meta2.width * 0.35);
  const cropX2 = Math.floor((meta2.width - cropW2) / 2);
  const cropY2 = Math.floor(meta2.height * 0.04);
  const cropH2 = Math.floor(meta2.height * 0.92);

  await sharp(src2)
    .extract({ left: cropX2, top: cropY2, width: cropW2, height: cropH2 })
    .resize(70, 240, { fit: 'fill' })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile('assets/sendero/tallo/segment-2.png');
  console.log('segment-2.png: 70x240');

  // ─ preview big para validar visualmente
  await sharp('assets/sendero/tallo/segment.png')
    .resize(300, 1200, { fit: 'fill' })
    .toFile('assets/sendero/tallo/preview-segment.png');
  await sharp('assets/sendero/tallo/segment-2.png')
    .resize(300, 1200, { fit: 'fill' })
    .toFile('assets/sendero/tallo/preview-segment-2.png');

  console.log('done.');
})();
