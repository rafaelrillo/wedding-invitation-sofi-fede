// Procesa los PNGs sin fondo de diseño/sendero/png/ → assets/sendero/
// (reemplaza las JPGs anteriores con las versiones sin fondo).
const sharp = require('sharp');

const pieces = [
  { src: 'diseño/sendero/png/Loose_watercolor_eucalyptus_leaf_202605271742.png',      dst: 'assets/sendero/eucalipto-1.png' },
  { src: 'diseño/sendero/png/Sage_olive_leaves_on_stem_202605271744.png',             dst: 'assets/sendero/sage-stem-1.png' },
  { src: 'diseño/sendero/png/Sage_olive_leaves_on_stem_202605271744 (1).png',         dst: 'assets/sendero/sage-stem-2.png' },
  { src: 'diseño/sendero/png/Watercolor_botanical_element_on_…_202605271746 (1).png', dst: 'assets/sendero/gold-cluster-1.png' },
  { src: 'diseño/sendero/png/image (3).png',                                          dst: 'assets/sendero/capullos-terra.png' },
  { src: 'diseño/sendero/png/Peach_wildflower_with_leaf_202605271749.png',            dst: 'assets/sendero/peach-flower-1.png' },
  { src: 'diseño/sendero/png/Peach_wildflower_with_leaf_202605271749 (1).png',        dst: 'assets/sendero/peach-flower-2.png' },
  { src: 'diseño/sendero/png/Sage_olive_leaves_watercolor_study_202605271751.png',    dst: 'assets/sendero/sage-leaves-1.png' },
  { src: 'diseño/sendero/png/Sage_olive_leaves_watercolor_study_202605271751 (1).png',dst: 'assets/sendero/sage-leaves-2.png' },
];

(async () => {
  for (const p of pieces) {
    try {
      await sharp(p.src)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85, compressionLevel: 9 })
        .toFile(p.dst);
      console.log('  →', p.dst);
    } catch (e) {
      console.log('  SKIP', p.src, '(' + e.message + ')');
    }
  }
  console.log('done.');
})();
