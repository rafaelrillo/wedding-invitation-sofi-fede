// Quita el fondo blanco de los dibujos line-art y los deja como PNG con canal
// alfa (igual idea que el QR transparente): la luminancia se usa como alfa, asi
// el blanco del fondo desaparece y quedan solo las lineas (con bordes suaves).
// Correr:  node assets/draws/process-draws.cjs
const sharp = require('sharp');
const path = require('path');

const DIR = __dirname;
const drawings = [
  { src: 'Bridal_gown_on_hanger_illustration_202606051714.jpeg', dst: 'vestido-novia.png' },
  { src: 'Church_facade_line_art_illustration_202606051717.jpeg', dst: 'iglesia-1.png' },
  { src: "Groom's_suit_jacket_on_hanger_202606051716.jpeg",       dst: 'saco-novio.png' },
  { src: 'Ink_line_art_church_facade_202606051723.jpeg',          dst: 'iglesia-2.png' },
  { src: 'Two_champagne_flutes_clinking_202606051719.jpeg',       dst: 'copas.png' },
];

(async () => {
  for (const d of drawings) {
    const src = path.join(DIR, d.src);
    const dst = path.join(DIR, d.dst);
    try {
      const { width, height } = await sharp(src).metadata();
      // alfa = luminancia invertida, con una curva (linear) que lleva el
      // off-white a 0 (sin halo) y deja las lineas oscuras 100% opacas.
      const alpha = await sharp(src)
        .greyscale()
        .negate()                 // lineas oscuras -> alto ; fondo claro -> bajo
        .linear(1.8, -25)         // empuja: off-white -> transparente, lineas -> solidas
        .toColourspace('b-w')
        .raw()
        .toBuffer();
      // RGB original (las lineas conservan su tinta) + alfa calculado.
      await sharp(src)
        .removeAlpha()
        .joinChannel(alpha, { raw: { width, height, channels: 1 } })
        .png({ compressionLevel: 9 })
        .toFile(dst);
      console.log('  ->', d.dst);
    } catch (e) {
      console.log('  SKIP', d.src, '(' + e.message + ')');
    }
  }
  console.log('done.');
})();
