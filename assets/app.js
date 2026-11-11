/* Cloud Car shared script: header, footer, car data, cards */
const SITE = {
  name: 'Cloud Car',
  address: '1 Nicholls Ct, Mordialloc VIC 3195',
  email: 'sales@cloudcore.com.au',
  phone: 'Ali 0414 247 969',
  people: [
    { name: 'Ali', role: 'Dealer', numbers: [{ phone: '0414 247 969', tel: '0414247969' }] },
    { name: 'Suneel', role: 'Dealer', numbers: [{ phone: '0451 318 313', tel: '0451318313' }, { phone: '0478 493 005', tel: '0478493005' }] }
  ],
  hours: 'Mon to Sat, 9am to 7pm'
};

/* ---------- drawn car art (used until you add a real photo) ---------- */
const SHAPES = {
  Sedan:{b:'M16 92 L26 72 Q48 64 84 60 L112 40 Q128 34 152 34 L196 34 Q226 36 242 58 L272 64 Q288 68 288 92 Z',w:'M112 58 L126 42 Q134 38 150 38 L170 38 L170 58 Z M178 38 L198 38 Q216 40 228 58 L178 58 Z'},
  Hatchback:{b:'M16 92 L24 72 L80 62 L106 38 L214 38 L250 62 L286 70 L286 92 Z',w:'M112 58 L124 43 L168 43 L168 58 Z M176 43 L210 43 L236 58 L176 58 Z'},
  SUV:{b:'M16 92 L22 70 L66 62 L88 34 L238 34 L262 60 L288 68 L288 92 Z',w:'M94 58 L108 40 L168 40 L168 58 Z M176 40 L232 40 L250 58 L176 58 Z'},
  Truck:{b:'M14 92 L14 62 L128 62 L128 40 Q130 34 140 34 L200 34 L222 60 L288 66 L288 92 Z',w:'M136 58 L136 40 L168 40 L168 58 Z M176 40 L198 40 L214 58 L176 58 Z'},
  Luxury:{b:'M16 92 L24 76 L96 66 L136 42 Q150 38 170 38 L200 38 Q230 44 252 64 L286 72 L286 92 Z',w:'M142 48 Q152 43 168 43 L196 43 Q216 47 230 62 L146 62 Z'},
  Van:{b:'M16 92 L16 36 Q16 30 24 30 L214 30 L256 60 L288 68 L288 92 Z',w:'M30 40 L100 40 L100 58 L30 58 Z M108 40 L170 40 L170 58 L108 58 Z M178 40 L212 40 L240 58 L178 58 Z'}
};
const PAINT = {White:'#eef2f7',Silver:'#bcc6d4',Grey:'#6f7c8f',Black:'#1d2430',Blue:'#2f66c9',Red:'#c4372f',Green:'#2f7d59',Yellow:'#e9b52a',Orange:'#dd7a22',Brown:'#7b5538'};

function carInner(type, color) {
  const s = SHAPES[type] || SHAPES.Sedan, p = PAINT[color] || '#8aa0bd';
  const wheel = x => `<circle cx="${x}" cy="92" r="21" fill="#0a1424"/><circle cx="${x}" cy="92" r="16" fill="#111827"/><circle cx="${x}" cy="92" r="8.5" fill="#cfd8e4"/><circle cx="${x}" cy="92" r="3" fill="#7b8aa0"/>`;
  return `<ellipse cx="152" cy="110" rx="140" ry="6" fill="#0d2547" opacity=".16"/>
    <path d="${s.b}" fill="${p}"/><path d="${s.b}" fill="url(#sheen)" opacity=".35"/>
    <path d="${s.w}" fill="#0d2547" opacity=".82"/>
    <path d="M276 72 L288 75 L288 82 L275 80 Z" fill="#fff6c9"/><path d="M16 78 L22 78 L22 86 L16 86 Z" fill="#d9483f"/>
    ${wheel(76)}${wheel(232)}`;
}
function carSVG(type, color) {
  return `<svg viewBox="0 0 304 120" role="img" aria-label="${color||''} ${type||'car'} illustration"><defs><linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient></defs>${carInner(type, color)}</svg>`;
}

/* ---------- data ---------- */
let CURRENCY = '$';
async function loadCars() {
  try {
    const r = await fetch('/api/cars', { cache: 'no-store' });
    if (!r.ok) throw new Error('no api');
    const d = await r.json();
    CURRENCY = d.currency || '$';
    window.CARS = (d.cars || []).filter(c => !c.sold);
    return window.CARS;
  } catch (e) {
    return null;
  }
}
const plural = t => t==='SUV'?'SUVs':t==='Luxury'?'Luxury cars':t+'s';
const money = n => CURRENCY + Number(n).toLocaleString('en-US');
const km = n => Number(n).toLocaleString('en-US') + ' km';

/* ---------- pieces ---------- */
const ICON = {
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>'
};

function logoSVG() {
  return `<svg viewBox="0 0 64 46" aria-hidden="true"><path d="M17 40a12 12 0 0 1-1.5-23.9A15 15 0 0 1 44.6 12 13 13 0 0 1 48 40Z" fill="#2f7bff"/><path d="M17 40a12 12 0 0 1-1.5-23.9A15 15 0 0 1 44.6 12 13 13 0 0 1 48 40Z" fill="url(#lg)" opacity=".5"/><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#0d2547"/></linearGradient></defs><g transform="translate(14 20) scale(.115)" fill="#fff"><path d="M16 92 L26 72 Q48 64 84 60 L112 40 Q128 34 152 34 L196 34 Q226 36 242 58 L272 64 Q288 68 288 92 Z"/></g><g transform="translate(14 20) scale(.115)"><path d="M112 58 L126 42 Q134 38 150 38 L170 38 L170 58 Z M178 38 L198 38 Q216 40 228 58 L178 58 Z" fill="#1d5fd1"/><circle cx="76" cy="92" r="19" fill="#1d5fd1"/><circle cx="232" cy="92" r="19" fill="#1d5fd1"/><circle cx="76" cy="92" r="9" fill="#fff"/><circle cx="232" cy="92" r="9" fill="#fff"/></g></svg>`;
}

function renderChrome(active) {
  const types = ['Hatchback','Sedan','SUV','Truck','Luxury','Van'];
  const a = k => active === k ? ' class="on"' : '';
  document.getElementById('site-header').innerHTML = `
  <div class="topbar"><div class="wrap">
    <span>${ICON.pin}${SITE.address}</span>
    <span class="hide-sm">${ICON.mail}${SITE.email}</span>
    <span>${ICON.phone}${SITE.people.map(p => p.name + ' ' + p.numbers.map(n => `<a href="tel:${n.tel}">${n.phone}</a>`).join(' / ')).join(' &nbsp;|&nbsp; ')}</span>
    <span>${ICON.clock}${SITE.hours}</span>
  </div></div>
  <header class="nav"><div class="wrap">
    <a class="logo" href="index.html" aria-label="Cloud Car home">${logoSVG()}<span><b>Cloud <i>Car</i></b><small>Quality used cars</small></span></a>
    <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <ul class="menu" id="menu">
      <li><a href="index.html"${a('home')}>Home</a></li>
      <li><button class="drop" type="button">Buy a car ${ICON.chev}</button>
        <div class="dropdown">${['All cars'].concat(types).map(t => `<a href="inventory.html${t==='All cars'?'':'?type='+t}">${t==='All cars'?t:plural(t)}</a>`).join('')}</div></li>
      <li><a href="index.html#sell">Sell your car</a></li>
      <li><a href="index.html#finance">Finance</a></li>
      <li><a href="index.html#visit">Visit us</a></li>
      <li><a href="index.html#contact">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <a class="btn btn-amber" href="index.html#contact">Book test drive</a>
    </div>
  </div></header>`;

  document.getElementById('site-footer').innerHTML = `
  <footer id="contact"><div class="wrap">
    <div class="foot">
      <div><a class="logo" href="index.html">${logoSVG()}<span><b>Cloud <i>Car</i></b><small>Quality used cars</small></span></a>
        <p class="about">Used cars that are checked, fairly priced and ready to drive. Visit the showroom or browse online.</p></div>
      <div><h4>Quick links</h4><ul><li><a href="index.html">Home</a></li><li><a href="inventory.html">All cars</a></li></ul></div>
      <div><h4>Our services</h4><ul><li><a href="index.html#sell">Sell your car</a></li><li><a href="index.html#finance">Car finance</a></li><li><a href="index.html#how">Test drives</a></li><li><a href="index.html#how">Trade-ins</a></li></ul></div>
      <div><h4>Browse by type</h4><ul>${types.map(t=>`<li><a href="inventory.html?type=${t}">${plural(t)}</a></li>`).join('')}</ul></div>
      <div id="visit"><h4>Contact us</h4><ul><li>${SITE.address}</li>${SITE.people.map(p => `<li>${p.name}: ${p.numbers.map(n => `<a href="tel:${n.tel}">${n.phone}</a>`).join(' / ')}</li>`).join('')}<li>${SITE.email}</li><li>${SITE.hours}</li></ul></div>
      <div><h4>We accept</h4><div class="chips"><span>Cash</span><span>Bank transfer</span><span>Card</span><span>Finance</span></div></div>
    </div>
    <div class="legal"><span>&copy; ${new Date().getFullYear()} Cloud Car. All rights reserved.</span><div><a href="#">Privacy policy</a><a href="#">Terms and conditions</a></div></div>
  </div></footer>`;

  const b = document.querySelector('.burger'), m = document.getElementById('menu');
  b.addEventListener('click', () => { const o = m.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
}

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const carName = c => `${c.make} ${c.model}`;
const carTitle = c => `${c.year} ${c.make} ${c.model}`;
const imgUrl = (u, w, h, fit = 'cover') => u.startsWith('cars/stock/') ? `/img?p=${encodeURIComponent(u)}&w=${w}&h=${h}&fit=${fit}` : u;
const coverOf = c => (c.images && c.images[0]) || (c.image ? 'cars/' + c.image : '');
const specList = c => [c.mileage != null ? km(c.mileage) : '', c.fuel, c.transmission, c.color].filter(Boolean);

function carCard(c, opts = {}) {
  const save = c.wasPrice && c.wasPrice > c.price ? c.wasPrice - c.price : 0;
  const cover = coverOf(c);
  const n = (c.images || []).length;
  const photo = cover
    ? `<div class="photo has-img"><img src="${esc(imgUrl(cover, 800, 600))}" alt="${esc(carTitle(c))}" loading="lazy" data-type="${esc(c.type)}" data-color="${esc(c.color)}" onerror="imgFail(this)">${n > 1 ? `<span class="count">${n} photos</span>` : ''}</div>`
    : `<div class="photo">${carSVG(c.type, c.color)}</div>`;
  const specs = specList(c).slice(0, 3);
  return `<article class="car">
    ${save ? `<span class="save">Save ${money(save)}</span>` : ''}
    ${c.sold ? '<span class="save sold">Sold</span>' : ''}
    <button class="open" type="button" data-car="${encodeURIComponent(c.id)}" aria-label="View photos and details of ${esc(carTitle(c))}">${photo}</button>
    <div class="body">
      <h3>${esc(carName(c))}</h3>
      <div class="sub">${c.year} &middot; ${esc(c.type)}</div>
      ${specs.length ? `<div class="specs">${specs.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      <div class="price"><b>${money(c.price)}</b>${save ? `<s>${money(c.wasPrice)}</s>` : ''}</div>
      ${opts.enquire ? `<button class="btn btn-blue enq" type="button" data-car="${encodeURIComponent(c.id)}">View photos and details</button>` : ''}
    </div>
  </article>`;
}

/* ---------- photo gallery / details window ---------- */
function openCar(id) {
  const c = (window.CARS || []).find(x => x.id === id);
  if (!c) return;
  let dlg = document.getElementById('car-modal');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'car-modal';
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
  }
  const imgs = (c.images && c.images.length) ? c.images : (c.image ? ['cars/' + c.image] : []);
  let i = 0;
  const calls = SITE.people.map(p => p.numbers.map(nm => `<a class="btn btn-line" href="tel:${nm.tel}">${p.name} ${nm.phone}</a>`).join('')).join('');
  const rows = [['Year', c.year], ['Body', c.type], ['Fuel', c.fuel], ['Transmission', c.transmission], ['Odometer', c.mileage != null ? km(c.mileage) : ''], ['Colour', c.color]].filter(r => r[1]);
  dlg.innerHTML = `<div class="m-wrap">
    <button class="m-close" type="button" aria-label="Close">&times;</button>
    <div class="m-gal">
      <div class="m-main">${imgs.length ? '<img id="m-img" alt="">' : carSVG(c.type, c.color)}
        ${imgs.length > 1 ? '<button class="m-nav prev" type="button" aria-label="Previous photo">&#8249;</button><button class="m-nav next2" type="button" aria-label="Next photo">&#8250;</button><span class="m-count" id="m-count"></span>' : ''}</div>
      ${imgs.length > 1 ? `<div class="m-thumbs">${imgs.map((u, k) => `<button type="button" data-k="${k}" aria-label="Photo ${k + 1}"><img src="${esc(imgUrl(u, 168, 126))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>
    <div class="m-info">
      <h2>${esc(carTitle(c))}</h2>
      <div class="m-price">${money(c.price)}${c.wasPrice && c.wasPrice > c.price ? ` <s>${money(c.wasPrice)}</s>` : ''}</div>
      ${c.description ? `<p>${esc(c.description)}</p>` : ''}
      <dl>${rows.map(r => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
      <div class="m-actions">${calls}<a class="btn btn-blue" href="mailto:${SITE.email}?subject=${encodeURIComponent('Enquiry: ' + carTitle(c))}">Email about this car</a></div>
      <p class="m-note">Price is in Australian dollars. Call or email to book an inspection or test drive.</p>
    </div></div>`;
  const show = k => {
    i = (k + imgs.length) % imgs.length;
    const im = dlg.querySelector('#m-img'); if (im) im.src = imgUrl(imgs[i], 1600, 1200, 'inside');
    const ct = dlg.querySelector('#m-count'); if (ct) ct.textContent = (i + 1) + ' / ' + imgs.length;
    dlg.querySelectorAll('.m-thumbs button').forEach((b, k2) => b.setAttribute('aria-current', k2 === i));
  };
  if (imgs.length) show(0);
  dlg.querySelector('.m-close').onclick = () => dlg.close();
  const pv = dlg.querySelector('.prev'), nx = dlg.querySelector('.next2');
  if (pv) { pv.onclick = () => show(i - 1); nx.onclick = () => show(i + 1); }
  dlg.querySelectorAll('.m-thumbs button').forEach(b => b.onclick = () => show(+b.dataset.k));
  dlg.onkeydown = e => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); };
  dlg.showModal();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-car]');
  if (b) openCar(decodeURIComponent(b.dataset.car));
});


/* if a photo file is missing, show the drawn placeholder instead of a broken image */
function imgFail(img) {
  const box = img.parentNode;
  box.classList.remove('has-img');
  box.innerHTML = carSVG(img.dataset.type, img.dataset.color);
}

function dataError(el) {
  el.innerHTML = '<div class="empty"><b>Cars could not load</b>Open the site through the local server (node serve.mjs) and check that cars/cars.json is valid.</div>';
}
