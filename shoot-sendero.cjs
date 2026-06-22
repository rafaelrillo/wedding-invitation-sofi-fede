/* Captura el sendero a varias alturas de scroll para ver densidad/tamano de
   las hojas y flores. Escribe sendero-<scrollY>.png (viewport completo). */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  // dar tiempo a buildTrail (corre diferido ~3.9s) y a que las hojas se siembren
  await new Promise(r => setTimeout(r, 4500));

  for (const y of [600, 1300, 2000, 2700, 3400]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise(r => setTimeout(r, 450)); // dejar que aparezcan (transition .7s)
    await page.screenshot({ path: path.join(__dirname, `sendero-${y}.png`) });
    console.log(`sendero-${y}.png`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
