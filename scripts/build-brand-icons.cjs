// Render the original SVG mark and package PNG frames into an ICO.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const { chromium } = createRequire(path.join(root, 'frontend/package.json'))('@playwright/test');
const publicDir = path.join(root, 'frontend/public');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const svg = fs.readFileSync(path.join(publicDir, 'media/lumora.svg'), 'utf8');
    const frames = [];
    for (const size of [16, 32, 48, 180]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;background:transparent}svg{display:block;width:100%;height:100%}</style>${svg}`);
      const png = await page.screenshot({ omitBackground: true });
      if (size === 180) fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png);
      else frames.push({ size, png });
    }
    const header = Buffer.alloc(6 + frames.length * 16);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(frames.length, 4);
    let offset = header.length;
    frames.forEach(({ size, png }, index) => {
      const entry = 6 + index * 16;
      header[entry] = header[entry + 1] = size;
      header.writeUInt16LE(1, entry + 4);
      header.writeUInt16LE(32, entry + 6);
      header.writeUInt32LE(png.length, entry + 8);
      header.writeUInt32LE(offset, entry + 12);
      offset += png.length;
    });
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([header, ...frames.map(f => f.png)]));
    fs.copyFileSync(path.join(publicDir, 'media/lumora.svg'), path.join(publicDir, 'favicon.svg'));
    const previewDir = path.join(root, 'artifacts');
    fs.mkdirSync(previewDir, { recursive: true });
    await page.setViewportSize({ width: 900, height: 430 });
    await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#f7f4ed;color:#514363;font:20px Arial;padding:62px}header{display:flex;align-items:center;gap:30px}header svg{width:126px;height:126px}h1{font:64px Georgia;margin:0 0 10px;letter-spacing:-2px}p{margin:0;color:#657a68}section{margin-top:45px;display:flex;align-items:center;gap:30px}section span{display:flex;align-items:center;gap:9px;font-size:13px;color:#6e6575}.dark{background:#282232;padding:14px 20px;border-radius:18px;color:#f7f4ed}</style><header>${svg}<div><h1>Lumora</h1><p>Encuentra tu equilibrio digital.</p></div></header><section><span>${svg.replace('<svg ', '<svg width="16" height="16" ')}16 px</span><span>${svg.replace('<svg ', '<svg width="32" height="32" ')}32 px</span><span>${svg.replace('<svg ', '<svg width="48" height="48" ')}48 px</span><span class="dark">${svg.replace('<svg ', '<svg width="34" height="34" ')}Lumora</span></section>`);
    await page.screenshot({ path: path.join(previewDir, 'lumora-brand.png') });
    console.log('Lumora: SVG, ICO (16/32/48), icono móvil 180 y vista previa generados.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
