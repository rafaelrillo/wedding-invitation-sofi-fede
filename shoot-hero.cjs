/* Captura DETERMINISTICA del write-on de "Agus & Santi" (Agus -> & -> Santi).
   Construye la MISMA timeline GSAP en PAUSA y la "mueve" (tl.time) a instantes
   exactos: sin carreras de tiempo, y permite leer fielmente el estado final. */
const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  // toma control: la pagina no auto-dispara su timeline de nombres.
  await page.evaluateOnNewDocument(() => { window.__SHOOT = true; });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    const hn = document.querySelector('.hero-names');
    const amp = hn.querySelector('.hero-amp');
    const ng = hn.querySelectorAll('.name-group');
    const agusIni = ng[0].querySelector('.ini'), agusRest = ng[0].querySelector('.rest');
    const santiIni = ng[1].querySelector('.ini'), santiRest = ng[1].querySelector('.rest');
    [agusIni, santiIni].forEach(el => el.classList.add('inking'));
    window.gsap.set([agusIni, santiIni], { opacity: 1, y: 0 });
    agusIni.style.setProperty('--ink', 100); santiIni.style.setProperty('--ink', 100);
    window.gsap.set([agusRest, santiRest], { opacity: 0, y: 14 });
    window.gsap.set(amp, { xPercent: -50, yPercent: -50, x: 23, opacity: 0, scale: 0.9 });
    const aInk = { v: 100 }, sInk = { v: 100 };
    const tl = window.gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    tl.to(aInk, { v: 0, duration: 0.65, ease: 'power1.inOut',
          onUpdate: () => agusIni.style.setProperty('--ink', aInk.v) }, 0.35)
      .to(agusRest, { opacity: 1, y: 0, duration: 0.5 }, 0.78)
      .to(amp, { opacity: 1, scale: 1, duration: 0.7 }, 1.18)
      .to(sInk, { v: 0, duration: 0.65, ease: 'power1.inOut',
          onUpdate: () => santiIni.style.setProperty('--ink', sInk.v) }, 1.5)
      .to(santiRest, { opacity: 1, y: 0, duration: 0.5 }, 1.93);
    window.__tl = tl;
  });

  for (const t of [0.5, 0.9, 1.3, 1.85, 2.43]) {
    await page.evaluate((tt) => { window.__tl.time(tt); }, t);
    const name = `seq-${String(Math.round(t * 100)).padStart(3, '0')}.png`;
    await page.screenshot({ path: path.join(__dirname, name), clip: { x: 0, y: 0, width: 390, height: 560 } });
    console.log(name);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
