/* Seasonal themes for the Lessons apps (Lana Lessons, Rico Lessons).
   Include with: <script src="../shared/seasons.js" data-key="rl_theme" defer></script>
   - "Auto by season" picks the theme from the month (same months as ABC Rocket / MORE TIME Reading).
   - A 🎨 button is added to the page header; the choice is saved per app in localStorage (data-key).
   - Only the page background, accent colors, falling particles and the ground strip change;
     the white lesson cards stay white so every screen stays readable. */
(function () {
  const KEY = (document.currentScript && document.currentScript.dataset.key) || 'lessons_theme';
  const get = () => { try { return localStorage.getItem(KEY) || 'auto'; } catch (e) { return 'auto'; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  /* ---------- little SVG pieces ---------- */
  const LEAF = c => `<svg viewBox="0 0 24 24"><path d="M12 2c3 3 7 4 9 3-1 3 0 6-3 8 2 1 2 3 2 3s-3 0-5-2c-1 3-3 5-3 8-1-3-2-5-3-8-2 2-5 2-5 2s0-2 2-3c-3-2-2-5-3-8 2 1 6 0 9-3z" fill="${c}"/></svg>`;
  const OVAL = c => `<svg viewBox="0 0 24 24"><path d="M12 2C6 7 6 16 12 22c6-6 6-15 0-20z" fill="${c}"/><path d="M12 4v17" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/></svg>`;
  const FLAKE = `<svg viewBox="0 0 24 24" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/></svg>`;
  const DOT = `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#fff"/></svg>`;
  const PETAL = c => `<svg viewBox="0 0 24 24"><path d="M12 3c5 4 6 11 0 18-6-7-5-14 0-18z" fill="${c}"/></svg>`;
  const BUBBLE = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.25)" stroke="#fff" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="2.2" fill="#fff"/></svg>`;
  const BAT = `<svg viewBox="0 0 64 32"><path d="M32 12c2-4 4-5 4-5l1 4c4-3 10-4 16-2-3 2-4 6-3 9-3-2-7-2-9 1-2-2-5-2-6 1-1-2-2-3-3-3s-2 1-3 3c-1-3-4-3-6-1-2-3-6-3-9-1 1-3 0-7-3-9 6-2 12-1 16 2l1-4s2 1 4 5z" fill="#2a1840"/></svg>`;
  const STAR = `<svg viewBox="0 0 24 24"><path d="M12 2l2.6 7.4H22l-6 4.6 2.3 7.5L12 17l-6.3 4.5L8 14 2 9.4h7.4z" fill="#fff6c8"/></svg>`;
  const SUN = `<svg viewBox="0 0 100 100"><g stroke="#ffc93c" stroke-width="6" stroke-linecap="round">${[...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return `<line x1="${50 + Math.cos(a) * 34}" y1="${50 + Math.sin(a) * 34}" x2="${50 + Math.cos(a) * 46}" y2="${50 + Math.sin(a) * 46}"/>`; }).join('')}</g><circle cx="50" cy="50" r="26" fill="#ffd54f"/></svg>`;

  /* ground strip: two hills + decorations, viewBox 1200x200 */
  const hills = (back, front, deco = '') => `<svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice"><path d="M0 120 Q 200 70 420 112 T 820 100 T 1200 110 V200 H0z" fill="${back}"/><path d="M0 150 Q 260 115 560 145 T 1200 140 V200 H0z" fill="${front}"/>${deco}</svg>`;
  const PUMPKINS = [260, 640, 980].map(x => `<g transform="translate(${x} 150)"><ellipse rx="26" ry="20" fill="#f07b1d"/><ellipse rx="10" ry="20" fill="#f59234"/><rect x="-3" y="-28" width="6" height="12" rx="2" fill="#4c7a2b"/></g>`).join('');
  const JACKS = [300, 760, 1060].map(x => `<g transform="translate(${x} 152)"><ellipse rx="28" ry="21" fill="#f26b1d"/><rect x="-3" y="-29" width="6" height="11" rx="2" fill="#3e6b26"/><path d="M-14 -6l6-6 6 6zM2 -6l6-6 6 6z" fill="#3b1c05"/><path d="M-15 5q15 12 30 0l-5 3-5-3-5 3-5-3-5 3z" fill="#3b1c05"/></g>`).join('');
  const TREES = [150, 520, 1050].map(x => `<g transform="translate(${x} 70)"><path d="M0 0l36 64h-17l26 42h-90l26-42h-17z" fill="#1e7a45"/><rect x="-7" y="104" width="14" height="18" fill="#5b3a1c"/><path d="M0 -8l3 6 6 1-4.5 4 1 6.5L0 6.5-5.5 9.5l1-6.5L-9 -1l6-1z" fill="#ffd166"/><circle cx="-12" cy="70" r="4" fill="#ff4d5e"/><circle cx="14" cy="84" r="4" fill="#ffd166"/><circle cx="-4" cy="40" r="4" fill="#6ec3ff"/></g>`).join('');
  const SNOWMAN = `<g transform="translate(820 120)"><circle cy="30" r="24" fill="#fff"/><circle cy="0" r="17" fill="#fff"/><circle cx="-5" cy="-4" r="2" fill="#223"/><circle cx="5" cy="-4" r="2" fill="#223"/><path d="M0 1l12 3-12 2z" fill="#f28c28"/><rect x="-12" y="-26" width="24" height="5" fill="#223"/><rect x="-8" y="-40" width="16" height="15" fill="#223"/><path d="M-15 12h30" stroke="#e0303f" stroke-width="5"/></g>`;
  const FLOWERS = [180, 330, 520, 760, 930, 1090].map((x, i) => `<g transform="translate(${x} ${150 + (i % 2) * 12})"><path d="M0 0v30" stroke="#4e9a3a" stroke-width="3"/><g fill="${['#ff8fb8', '#ffd25a', '#b98cff', '#ff8fb8', '#ffb0c9', '#ffd25a'][i]}"><circle cy="-8" r="6"/><circle cx="8" r="6"/><circle cy="8" r="6"/><circle cx="-8" r="6"/></g><circle r="4.5" fill="#fff3b0"/></g>`).join('');
  const WAVES = `<path d="M0 172 q 30 -12 60 0 ${'t 60 0 '.repeat(19)} V200 H0z" fill="#5cc8f0" opacity=".9"/><g transform="translate(300 150)"><path d="M0 0v-40" stroke="#8a5a2b" stroke-width="3"/><path d="M0 -40l-40 18h80z" fill="#ff6b35"/></g>`;

  /* ---------- themes (month 0 = Jan) ---------- */
  const THEMES = {
    classic: { label: 'Plain (no season)', months: [], vars: {}, fx: '', ground: '' },
    autumn: {
      label: 'Fall leaves 🍂', months: [8, 10],
      vars: { '--paper': '#fdecd6', '--paper2': '#f6d6ae', '--line': '#e7c39a', '--sky': '#fde0c4', '--coral': '#d2542a', '--teal': '#b5651d', '--gold': '#f4a93a' },
      bg: 'linear-gradient(180deg,#ffe9c9 0%,#ffd8a6 60%,#f8bd7d 100%)',
      fx: 'leaves', ground: hills('#b65a22', '#d98a3d', PUMPKINS)
    },
    halloween: {
      label: 'Halloween 🎃', months: [9],
      vars: { '--paper': '#efe4fb', '--paper2': '#e0cdf5', '--line': '#cdb5ea', '--sky': '#ffe0c7', '--coral': '#f26b1d', '--teal': '#6a3fb5', '--gold': '#ffb627' },
      bg: 'linear-gradient(180deg,#d9c6f2 0%,#ead9fb 55%,#ffd9b8 100%)',
      fx: 'bats', moon: true, ground: hills('#4b2a6b', '#2e1a45', JACKS)
    },
    christmas: {
      label: 'Christmas 🎄', months: [11],
      vars: { '--paper': '#e9f2fb', '--paper2': '#d5e5f5', '--line': '#bcd2e8', '--sky': '#ffe1e4', '--coral': '#e0303f', '--teal': '#1e7a45', '--gold': '#f4bc3f' },
      bg: 'linear-gradient(180deg,#c9dcf2 0%,#e3eefa 60%,#f6fbff 100%)',
      fx: 'snow', lights: true, ground: hills('#f4f8ff', '#dde9f7', TREES + SNOWMAN)
    },
    winter: {
      label: 'Winter snow ❄️', months: [0, 1],
      vars: { '--paper': '#e6f0fb', '--paper2': '#d2e3f6', '--line': '#b5cdea', '--sky': '#dbeeff', '--coral': '#1e5fc2', '--teal': '#2c8fb8', '--gold': '#7fd3f7' },
      bg: 'linear-gradient(180deg,#a9c8ee 0%,#cfe2f8 55%,#eef5fd 100%)',
      fx: 'snow', ground: hills('#f6faff', '#dce8f7', SNOWMAN)
    },
    spring: {
      label: 'Spring blossoms 🌸', months: [2, 3, 4],
      vars: { '--paper': '#eef9f0', '--paper2': '#dff2e4', '--line': '#c4e3cb', '--sky': '#ffe6f0', '--coral': '#e2558e', '--teal': '#3d9e4b', '--gold': '#ffcb47' },
      bg: 'linear-gradient(180deg,#ddf4ff 0%,#eaf8ee 55%,#ffe6f0 100%)',
      fx: 'petals', sun: true, ground: hills('#7cc46a', '#a5d98f', FLOWERS)
    },
    summer: {
      label: 'Summer sun ☀️', months: [5, 6, 7],
      vars: { '--paper': '#e3f6ff', '--paper2': '#cdeefe', '--line': '#b2dcf0', '--sky': '#fff1c9', '--coral': '#ff6b35', '--teal': '#0f8fbf', '--gold': '#ffc93c' },
      bg: 'linear-gradient(180deg,#8fdbff 0%,#c4ecff 55%,#eafaff 100%)',
      fx: 'bubbles', sun: true, ground: hills('#f5d99a', '#ebc678', WAVES)
    }
  };
  const ORDER = ['auto', 'autumn', 'halloween', 'christmas', 'winter', 'spring', 'summer', 'classic'];
  const seasonNow = () => { const m = new Date().getMonth(); return Object.keys(THEMES).find(k => THEMES[k].months.includes(m)) || 'classic'; };
  const themeName = () => { const t = get(); return THEMES[t] ? t : seasonNow(); };

  /* ---------- styles ---------- */
  const css = `
#season-scene{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.app{position:relative;z-index:1}
body.season-on{padding-bottom:70px}
body.season-lights .app{padding-top:max(52px,env(safe-area-inset-top))}
body.season-on header{background:rgba(255,255,255,.82);border-radius:20px;padding:8px 10px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#season-scene .sp{position:absolute;top:-60px;left:var(--x);width:var(--s);height:var(--s);opacity:var(--o);animation:sfall var(--d) linear infinite;animation-delay:var(--dl)}
#season-scene .sp>svg{width:100%;height:100%;display:block;animation:sway var(--sw) ease-in-out infinite alternate}
#season-scene .sp.up{top:auto;bottom:-60px;animation-name:srise}
#season-scene .sp.fly{top:var(--y);left:-80px;animation-name:sfly}
#season-scene .sp.twinkle{top:var(--y);animation:twk var(--d) ease-in-out infinite alternate;animation-delay:var(--dl)}
@keyframes sfall{to{transform:translateY(calc(100vh + 120px)) rotate(300deg)}}
@keyframes srise{to{transform:translateY(calc(-100vh - 120px))}}
@keyframes sfly{to{transform:translateX(calc(100vw + 160px))}}
@keyframes sway{from{transform:translateX(-14px) rotate(-12deg)}to{transform:translateX(14px) rotate(12deg)}}
@keyframes twk{from{opacity:.15;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
#season-scene .ground{position:absolute;left:0;right:0;bottom:0;height:110px}
#season-scene .ground svg{width:100%;height:100%;display:block}
#season-scene .sun{position:absolute;bottom:120px;right:18px;width:96px;height:96px;opacity:.9;animation:spin 60s linear infinite}
#season-scene .moon{position:absolute;bottom:130px;right:24px;width:78px;height:78px;border-radius:50%;background:#fff6c8;box-shadow:0 0 40px 10px rgba(255,246,200,.6),inset -14px -6px 0 #f1e3a0}
#season-scene .lights{position:absolute;top:0;left:0;right:0;height:42px}
#season-scene .lights svg{width:100%;height:100%}
#season-scene .bulb{animation:blink 1.6s ease-in-out infinite alternate}
@keyframes blink{from{opacity:.35}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#season-scene .sp,#season-scene .sp>svg,#season-scene .sun,#season-scene .bulb{animation:none}}
.season-btn{flex:none;margin-left:auto;border:0;background:#fff;border-radius:14px;width:44px;height:40px;font-size:22px;box-shadow:0 2px 0 var(--line);cursor:pointer}
.back:not(.hidden)~.season-btn{margin-left:8px}
.season-sheet{position:fixed;inset:0;background:rgba(20,30,50,.35);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.season-sheet .box{background:#fff;border:3px solid var(--ink);border-bottom:0;border-radius:24px 24px 0 0;padding:18px 18px max(22px,env(safe-area-inset-bottom));width:100%;max-width:560px}
.season-sheet h3{margin:0 0 12px;font-family:"Baloo 2",Nunito,sans-serif;font-size:24px}
.season-sheet .chips{display:flex;flex-wrap:wrap;gap:10px}
.season-sheet button{border:3px solid var(--ink);border-radius:16px;padding:10px 14px;font:800 17px Nunito,system-ui,sans-serif;background:#fff;color:var(--ink);box-shadow:0 4px 0 var(--ink)}
.season-sheet button.on{background:var(--gold)}
.season-sheet .done{margin-top:16px;width:100%;background:var(--teal);color:#fff}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- scene ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sp = (svg, cls, o) => `<div class="sp ${cls}" style="${Object.entries(o).map(([k, v]) => `--${k}:${v}`).join(';')}">${svg}</div>`;
  function fx(kind) {
    const out = [];
    const fall = (n, svgs, s0, s1, d0, d1) => { for (let i = 0; i < n; i++) out.push(sp(pick(svgs), '', { x: rnd(-4, 98).toFixed(1) + 'vw', s: rnd(s0, s1).toFixed(0) + 'px', d: rnd(d0, d1).toFixed(1) + 's', dl: (-rnd(0, d1)).toFixed(1) + 's', sw: rnd(1.6, 3.4).toFixed(1) + 's', o: rnd(.75, 1).toFixed(2) })); };
    if (kind === 'leaves') { const cs = ['#d2542a', '#f4a93a', '#b83a1b', '#e8c547', '#9c4a2a', '#e07a2e']; fall(14, cs.map((c, i) => i % 2 ? OVAL(c) : LEAF(c)), 22, 40, 11, 20); }
    else if (kind === 'snow') { for (let i = 0; i < 30; i++) out.push(sp(DOT, '', { x: rnd(0, 100).toFixed(1) + 'vw', s: rnd(4, 10).toFixed(0) + 'px', d: rnd(9, 18).toFixed(1) + 's', dl: (-rnd(0, 18)).toFixed(1) + 's', sw: rnd(2, 4).toFixed(1) + 's', o: rnd(.6, .95).toFixed(2) })); fall(8, [FLAKE], 16, 28, 12, 22); }
    else if (kind === 'petals') fall(16, ['#ff9ec4', '#ffc2d9', '#ffffff', '#f7b3cf'].map(PETAL), 14, 24, 12, 20);
    else if (kind === 'bubbles') { for (let i = 0; i < 12; i++) out.push(sp(BUBBLE, 'up', { x: rnd(0, 96).toFixed(1) + 'vw', s: rnd(18, 44).toFixed(0) + 'px', d: rnd(14, 26).toFixed(1) + 's', dl: (-rnd(0, 26)).toFixed(1) + 's', sw: rnd(2.5, 4.5).toFixed(1) + 's', o: rnd(.7, 1).toFixed(2) })); }
    else if (kind === 'bats') {
      for (let i = 0; i < 14; i++) out.push(sp(STAR, 'twinkle', { x: rnd(0, 100).toFixed(1) + 'vw', y: rnd(2, 40).toFixed(1) + 'vh', s: rnd(8, 14).toFixed(0) + 'px', d: rnd(1.4, 3.4).toFixed(1) + 's', dl: (-rnd(0, 3)).toFixed(1) + 's', sw: '1s', o: 1 }));
      for (let i = 0; i < 4; i++) out.push(sp(BAT, 'fly', { y: rnd(8, 40).toFixed(1) + 'vh', x: '0', s: rnd(40, 64).toFixed(0) + 'px', d: rnd(16, 28).toFixed(1) + 's', dl: (-rnd(0, 24)).toFixed(1) + 's', sw: '.5s', o: 1 }));
    }
    return out.join('');
  }
  function lightsSvg() {
    const cs = ['#ff4d5e', '#ffd166', '#3dd68c', '#6ec3ff', '#ff8fd8']; let b = '';
    for (let i = 0; i < 24; i++) { const x = 25 + i * 50, y = 12 + 9 * Math.sin((i % 6) / 6 * Math.PI); b += `<rect x="${x - 3}" y="${y - 4}" width="6" height="6" rx="1" fill="#2b3a2b"/><ellipse class="bulb" style="animation-delay:${(-Math.random() * 1.6).toFixed(2)}s" cx="${x}" cy="${y + 9}" rx="6" ry="9" fill="${cs[i % 5]}"/>`; }
    return `<svg viewBox="0 0 1200 40" preserveAspectRatio="none"><path d="M0 10 Q 25 26 50 12 ${'T ' + [...Array(23)].map((_, i) => `${100 + i * 50} 12`).join(' T ')}" stroke="#2b3a2b" stroke-width="2" fill="none"/>${b}</svg>`;
  }

  let applied = null;
  function apply(force) {
    const name = themeName();
    if (name === applied && !force) return;
    applied = name;
    const t = THEMES[name], root = document.documentElement;
    Object.values(THEMES).forEach(x => Object.keys(x.vars).forEach(k => root.style.removeProperty(k)));
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.style.background = t.bg || '';
    document.body.style.backgroundAttachment = t.bg ? 'fixed' : '';
    document.body.classList.toggle('season-on', name !== 'classic');
    document.body.classList.toggle('season-lights', !!t.lights);
    let scene = document.getElementById('season-scene');
    if (!scene) { scene = document.createElement('div'); scene.id = 'season-scene'; scene.setAttribute('aria-hidden', 'true'); document.body.prepend(scene); }
    scene.innerHTML = (t.sun ? `<div class="sun">${SUN}</div>` : '') + (t.moon ? '<div class="moon"></div>' : '') + (t.lights ? `<div class="lights">${lightsSvg()}</div>` : '') + fx(t.fx) + (t.ground ? `<div class="ground">${t.ground}</div>` : '');
    const meta = document.querySelector('meta[name=theme-color]') || Object.assign(document.head.appendChild(document.createElement('meta')), { name: 'theme-color' });
    meta.content = getComputedStyle(root).getPropertyValue('--paper').trim();
  }

  function openSheet() {
    const cur = get(), now = seasonNow();
    const sh = document.createElement('div'); sh.className = 'season-sheet';
    sh.innerHTML = `<div class="box"><h3>🎨 Theme</h3><div class="chips">${ORDER.map(k => `<button data-v="${k}" class="${cur === k ? 'on' : ''}">${k === 'auto' ? 'Auto by season (now: ' + THEMES[now].label + ')' : THEMES[k].label}</button>`).join('')}</div><button class="done">Done</button></div>`;
    sh.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (e.target === sh || (b && b.classList.contains('done'))) return sh.remove();
      if (b && b.dataset.v) { set(b.dataset.v); sh.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b)); apply(true); }
    });
    document.body.appendChild(sh);
  }

  function init() {
    apply(true);
    const header = document.querySelector('header');
    if (header && !header.querySelector('.season-btn')) {
      const b = document.createElement('button'); b.className = 'season-btn'; b.type = 'button'; b.textContent = '🎨'; b.setAttribute('aria-label', 'Change theme');
      b.addEventListener('click', openSheet); header.appendChild(b);
    }
    // re-check the season when the app comes back (Home Screen apps can stay open for days)
    document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
