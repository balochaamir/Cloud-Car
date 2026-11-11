import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const stockDir = path.join(root, 'cars', 'stock');
const port = process.env.PORT || 3100;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

/* ---- stock folders -> car list ----
   Folder name:  Make Model - Year - Price     e.g.  Hyundai Tucson - 2018 - 14900
   Optional details.json inside the folder can set: type, fuel, transmission,
   mileage, color, wasPrice, featured, sold, description, title                */
const MULTI_MAKES = ['Land Rover', 'Mercedes-Benz', 'Alfa Romeo', 'Great Wall', 'Rolls Royce', 'Aston Martin', 'Mini Cooper'];
const TYPE_HINTS = [
  [/tucson|santa ?fe|sportage|rav4|cx-?[3579]|cr-v|x-?trail|outlander|forester|kluger|pajero|territory|qashqai|seltos|kona|venue|xv|crosstrek|escape|captiva|tiguan|q[2-8]|x[1-7]|glc|gle|evoque|discovery|prado|landcruiser/i, 'SUV'],
  [/hilux|ranger|triton|navara|d-max|bt-50|amarok|colorado|l200/i, 'Truck'],
  [/carnival|odyssey|hiace|transit|vito|sprinter|kangoo|tarago|stavic|starex|iload|imax/i, 'Van'],
  [/camry|accord|civic sedan|mazda6|mazda 6|altima|commodore|falcon|sonata|elantra|cerato|a4|a6|3 series|320i|c-class|e-class|s60|s90|passat|superb|stinger|g70/i, 'Sedan'],
  [/corolla|i30|i20|veloster|impreza|mazda3|mazda 3|golf|polo|swift|yaris|fiesta|focus|cerato hatch|rio|picanto|jazz|leaf|ioniq|prius|a3|1 series/i, 'Hatchback']
];
const IMG = /\.(jpe?g|png|webp|avif|gif)$/i;
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function parseFolder(name) {
  const m = name.match(/^(.+?)\s*-\s*((?:19|20)\d{2})\s*-\s*\$?\s*([\d,]+)\s*$/);
  if (!m) return null;
  const title = m[1].trim();
  let make = MULTI_MAKES.find(x => title.toLowerCase().startsWith(x.toLowerCase()));
  make = make ? title.slice(0, make.length) : title.split(/\s+/)[0];
  let model = title.slice(make.length).trim() || make;
  model = model.replace(/\b(cx|mx)-?(\d+)/gi, (_, p, n) => p.toUpperCase() + '-' + n);   // cx30 -> CX-30
  return { make, model, year: +m[2], price: +m[3].replace(/,/g, '') };
}

function readStock() {
  if (!fs.existsSync(stockDir)) return [];
  const cars = [];
  for (const ent of fs.readdirSync(stockDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const info = parseFolder(ent.name);
    if (!info) continue;
    const dir = path.join(stockDir, ent.name);
    const files = fs.readdirSync(dir).filter(f => IMG.test(f)).sort((a, b) => {
      const ca = /^cover\./i.test(a), cb = /^cover\./i.test(b);
      return ca !== cb ? (ca ? -1 : 1) : collator.compare(a, b);
    });
    let extra = {};
    const dj = path.join(dir, 'details.json');
    if (fs.existsSync(dj)) { try { extra = JSON.parse(fs.readFileSync(dj, 'utf8')); } catch { /* ignore bad json */ } }
    const hint = TYPE_HINTS.find(([re]) => re.test(info.model));
    cars.push({
      id: ent.name,
      ...info,
      type: hint ? hint[1] : 'Sedan',
      images: files.map(f => `cars/stock/${encodeURIComponent(ent.name)}/${encodeURIComponent(f)}`),
      added: fs.statSync(dir).mtimeMs,
      ...extra
    });
  }
  return cars;
}

/* ---- automatic photo resizing ----
   /img?p=cars/stock/<car>/<file>&w=800&h=600&fit=cover
   Originals are never changed. Resized copies are cached in cars/.cache      */
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.log('sharp not installed: photos will be served at original size (run npm install)'); }
const cacheDir = path.join(root, 'cars', '.cache');
const SIZES = new Set(['800x600', '168x126', '1600x1200', '640x320']);   // sizes used by the front end

const inflight = new Map();
async function makeImage(src, out, w, h, fit) {
  if (fs.existsSync(out)) return;
  if (inflight.has(out)) return inflight.get(out);
  const job = (async () => {
    fs.mkdirSync(cacheDir, { recursive: true });
    const tmp = out + '.' + process.pid + '.tmp';
    await sharp(src).rotate()                                   // honour phone rotation
      .resize(w, h, { fit, position: 'attention', withoutEnlargement: fit === 'inside', background: '#0a1c33' })
      .sharpen({ sigma: 0.6 })                                  // gentle crispness after shrinking
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(tmp);
    fs.renameSync(tmp, out);
  })().finally(() => inflight.delete(out));
  inflight.set(out, job);
  return job;
}

async function serveImage(url, res) {
  try {
    const q = url.searchParams;
    const rel = decodeURIComponent(q.get('p') || '');
    const src = path.normalize(path.join(root, rel));
    if (!src.startsWith(stockDir) || !IMG.test(src) || !fs.existsSync(src)) { res.writeHead(404); return res.end('Not found'); }
    const w = +q.get('w'), h = +q.get('h');
    if (!SIZES.has(w + 'x' + h)) { res.writeHead(400); return res.end('Size not allowed'); }
    const fit = q.get('fit') === 'inside' ? 'inside' : 'cover';
    const st = fs.statSync(src);
    const key = Buffer.from(`${rel}|${w}|${h}|${fit}|${st.mtimeMs}`).toString('base64url').slice(-90);
    const out = path.join(cacheDir, key + '.jpg');
    let file = out;
    try { await makeImage(src, out, w, h, fit); } catch (e) { file = src; }   // fall back to the original
    res.writeHead(200, { 'Content-Type': file === out ? 'image/jpeg' : (types[path.extname(src).toLowerCase()] || 'image/jpeg'), 'Cache-Control': 'public, max-age=86400' });
    fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch (e) {
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}

process.on('uncaughtException', e => console.error('error:', e.message));
process.on('unhandledRejection', e => console.error('rejection:', e && e.message));

http.createServer((req, res) => {
  if (sharp && req.url.startsWith('/img?')) return serveImage(new URL(req.url, 'http://x'), res);
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/api/cars') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ currency: '$', cars: readStock() }));
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.resolve(root, '.' + path.sep + urlPath);
  const rel = path.relative(root, file);
  const parts = rel.split(path.sep);
  const allowed = rel && !rel.startsWith('..') && !path.isAbsolute(rel) &&
    !parts.some(p => p.startsWith('.')) &&                               // no .git, .cache, .gitignore
    (parts.length === 1 ? /.html$/i.test(rel) : (parts[0] === 'assets' || (parts[0] === 'cars' && parts[1] === 'stock')));
  if (!allowed) { res.writeHead(403, { 'Content-Type': 'text/plain' }); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log(`Cloud Car running at http://localhost:${port}`));
