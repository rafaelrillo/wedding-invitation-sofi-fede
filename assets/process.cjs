const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const flores = [
  { src: 'diseño/flores/Watercolor_floral_arrangement_on…_202605271728.jpeg', dst: 'assets/flores/composicion-1.jpg', label: 'comp1 (rosa peach + flor terra + mustard + arch)' },
  { src: 'diseño/flores/Watercolor_floral_arrangement_on…_202605271729.jpeg', dst: 'assets/flores/composicion-2.jpg', label: 'comp2 (2 rosas + mustard cluster grande)' },
  { src: 'diseño/flores/Watercolor_floral_arrangement_on…_202605271732.jpeg', dst: 'assets/flores/composicion-3.jpg', label: 'comp3 (amapola + eucalipto)' },
  { src: 'diseño/flores/Watercolor_floral_arrangement_on…_202605271732 (1).jpeg', dst: 'assets/flores/composicion-4.jpg', label: 'comp4 (arco eucalipto + flor abajo)' },
];

const sendero = [
  { src: 'diseño/sendero/Loose_watercolor_eucalyptus_leaf_202605271742.jpeg',     dst: 'assets/sendero/eucalipto-1.jpg' },
  { src: 'diseño/sendero/Sage_olive_leaves_on_stem_202605271744.jpeg',            dst: 'assets/sendero/sage-stem-1.jpg' },
  { src: 'diseño/sendero/Sage_olive_leaves_on_stem_202605271744 (1).jpeg',        dst: 'assets/sendero/sage-stem-2.jpg' },
  { src: 'diseño/sendero/Watercolor_botanical_element_on_…_202605271746.jpeg',    dst: 'assets/sendero/gold-cluster-1.jpg' },
  { src: 'diseño/sendero/Watercolor_botanical_element_on_…_202605271746 (1).jpeg',dst: 'assets/sendero/gold-cluster-2.jpg' },
  { src: 'diseño/sendero/Botanical_element_watercolor_study_202605271747.jpeg',   dst: 'assets/sendero/capullos-terra.jpg' },
  { src: 'diseño/sendero/Peach_wildflower_with_leaf_202605271749.jpeg',           dst: 'assets/sendero/peach-flower-1.jpg' },
  { src: 'diseño/sendero/Peach_wildflower_with_leaf_202605271749 (1).jpeg',       dst: 'assets/sendero/peach-flower-2.jpg' },
  { src: 'diseño/sendero/Sage_olive_leaves_watercolor_study_202605271751.jpeg',   dst: 'assets/sendero/sage-leaves-1.jpg' },
  { src: 'diseño/sendero/Sage_olive_leaves_watercolor_study_202605271751 (1).jpeg',dst: 'assets/sendero/sage-leaves-2.jpg' },
];

(async () => {
  // Composiciones: copiamos en alta calidad (son decoración grande)
  for (const f of flores) {
    await sharp(f.src)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(f.dst);
    console.log('flor ->', f.dst);
  }
  // Sendero: comprimimos más fuerte (cada hoja es chica en pantalla)
  for (const s of sendero) {
    await sharp(s.src)
      .resize(400, 400, { fit: 'inside' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(s.dst);
    console.log('sendero ->', s.dst);
  }
  console.log('OK');
})();
