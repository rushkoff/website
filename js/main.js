/* ============================================================
   RUSHKOFF.COM — MAIN JS
   ============================================================

   IMAGE CONFIGURATION
   -------------------
   When you have the Dropbox file list, update the src attributes
   in each HTML file directly. Direct Dropbox download URLs use:

     Books folder:  https://www.dropbox.com/scl/fo/so0e2y4zbhe6tl5fjtln8/...
     Photos folder: https://www.dropbox.com/scl/fo/pfy5r8lzn5u2beccfg2p0/...

   For each file, get a shareable link and change ?dl=0 → ?dl=1
   (or use https://dl.dropboxusercontent.com/... format).
   ============================================================ */


// ============================================================
// THEME DETECTION — runs immediately, reads localStorage
// ============================================================
(function () {
  let theme;
  try { theme = localStorage.getItem('rushkoff-theme'); } catch (e) {}
  if (theme === 'cyber')    document.body.classList.add('cyber');
  if (theme === 'ftp')      document.body.classList.add('ftp');
  if (theme === 'minimal')  document.body.classList.add('minimal');
  if (theme === 'magick') document.body.classList.add('magick');
})();


function _init() {
  setActiveNav();
  initDropdown();
  initHamburger();
  initNavScroll();
  initTheme();
  initThemePicker();

  if (document.getElementById('team-human-video')) {
    initTeamHumanVideo();
  }

  if (document.querySelector('.photo-grid')) {
    initLightbox();
  }

  if (document.querySelector('.press-toc')) {
    initPressToc();
    initPressSearch();
  }
}

// Works whether loaded normally or injected dynamically (Date.now() cache-bust)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _init);
} else {
  _init();
}


/* ========================
   TEAM HUMAN LATEST VIDEO
======================== */
function initTeamHumanVideo() {
  var link  = document.getElementById('team-human-link');
  var thumb = document.getElementById('team-human-thumb');
  var wrap  = document.getElementById('team-human-wrap');
  if (!link || !thumb || !wrap) return;

  // Try to fetch the latest video from the channel RSS feed
  var channelId = link.dataset.channel;
  var feedUrl   = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId;
  var proxyUrl  = 'https://api.allorigins.win/get?url=' + encodeURIComponent(feedUrl);

  fetch(proxyUrl)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var match   = data.contents.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      var videoId = match && match[1];
      if (!videoId) return;
      // Update thumbnail and store the fresh video ID
      link.dataset.videoid = videoId;
      thumb.src = 'https://i.ytimg.com/vi/' + videoId + '/maxresdefault.jpg';
      thumb.onerror = function() {
        thumb.src = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';
        thumb.onerror = null;
      };
    });
  // If fetch fails, the hardcoded fallback video ID stays — no visible error

  // Click-to-play: swap thumbnail for embedded iframe on click
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var videoId = link.dataset.videoid;
    var iframe  = document.createElement('iframe');
    iframe.src  = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
    iframe.title = 'Team Human — latest episode';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    wrap.replaceChildren(iframe);
  });
}


/* ========================
   ACTIVE NAV LINK
======================== */
function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(`.nav-links a[data-page="${page}"]`).forEach(el => {
    el.classList.add('active');
    el.setAttribute('aria-current', 'page');
  });
}


/* ========================
   DROPDOWN
======================== */
function initDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  function closeAll() {
    dropdowns.forEach(d => {
      d.classList.remove('open');
      const b = d.querySelector(':scope > button');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector(':scope > button');
    if (!btn) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      closeAll();
      if (!isOpen) {
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.addEventListener('click', e => e.stopPropagation());
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
}


/* ========================
   HAMBURGER / MOBILE NAV
======================== */
function initHamburger() {
  const btn    = document.getElementById('nav-hamburger');
  const mobile = document.getElementById('nav-mobile');
  if (!btn || !mobile) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    mobile.classList.toggle('open', open);
    mobile.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  function closeMenu() {
    btn.classList.remove('open');
    mobile.classList.remove('open');
    mobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}


/* ========================
   NAV SCROLL SHADOW
======================== */
function initNavScroll() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const check = () => nav.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', check, { passive: true });
  check();
}


/* ========================
   THEME PICKER
======================== */
function initThemePicker() {
  let current = '';
  try { current = localStorage.getItem('rushkoff-theme') || ''; } catch (e) {}

  function applyTheme(t) {
    try {
      if (t) localStorage.setItem('rushkoff-theme', t);
      else   localStorage.removeItem('rushkoff-theme');
    } catch (e) {}
    // Flag for boot sequence — only show when actively switching themes
    try {
      if (t) sessionStorage.setItem('rushkoff-switching', t);
      else   sessionStorage.removeItem('rushkoff-switching');
    } catch (e) {}
    // Reload without any theme param
    const url = new URL(window.location.href);
    url.searchParams.delete('theme');
    window.location.href = url.toString();
  }

  // Desktop picker
  document.querySelectorAll('#nav-theme-picker .theme-option').forEach(opt => {
    if (opt.dataset.theme === current) opt.classList.add('active');
    opt.addEventListener('click', () => applyTheme(opt.dataset.theme));
  });

  // Mobile picker
  document.querySelectorAll('.mobile-theme-btn').forEach(btn => {
    if (btn.dataset.theme === current) btn.classList.add('active');
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      // also close the mobile nav overlay
      const mobileNav = document.getElementById('nav-mobile');
      const hamburger  = document.getElementById('nav-hamburger');
      if (mobileNav)  { mobileNav.classList.remove('open'); mobileNav.setAttribute('aria-hidden', 'true'); }
      if (hamburger)  hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}


/* ========================
   LIGHTBOX (photos page)
======================== */
function initLightbox() {
  const box      = document.getElementById('lightbox');
  const boxImg   = document.getElementById('lightbox-img');
  const boxLink  = document.getElementById('lightbox-download');
  const closeBtn = document.getElementById('lightbox-close');
  if (!box || !boxImg) return;

  document.querySelectorAll('.photo-grid figure').forEach(fig => {
    fig.addEventListener('click', () => {
      const img   = fig.querySelector('img');
      const hires = fig.dataset.hires || img.src;
      boxImg.src  = hires;
      boxImg.alt  = img.alt;
      if (boxLink) boxLink.href = hires;
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    boxImg.src = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}


/* ========================
   PRESS TOC
======================== */
function initPressToc() {
  document.querySelectorAll('.press-toc a').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target && target.tagName === 'DETAILS') {
        target.open = true;
      }
    });
  });
}


/* ========================
   PRESS SEARCH
======================== */
function initPressSearch() {
  const input = document.getElementById('press-search');
  const countEl = document.getElementById('press-search-count');
  if (!input) return;

  // Pre-index: cache searchable text per item
  const sections = Array.from(document.querySelectorAll('.press-section'));
  const index = sections.map(section => ({
    section,
    items: Array.from(section.querySelectorAll('.press-item')).map(item => ({
      el: item,
      text: item.textContent.toLowerCase(),
    })),
    yearLabels: Array.from(section.querySelectorAll('.press-year-label')),
  }));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let totalVisible = 0;

    index.forEach(({ section, items, yearLabels }) => {
      let sectionVisible = 0;

      items.forEach(({ el, text }) => {
        const match = !q || text.includes(q);
        el.hidden = !match;
        if (match) sectionVisible++;
      });

      // Hide year labels that have no visible items after them
      yearLabels.forEach(label => {
        let sibling = label.nextElementSibling;
        let hasVisible = false;
        while (sibling && !sibling.classList.contains('press-year-label')) {
          if (sibling.classList.contains('press-item') && !sibling.hidden) {
            hasVisible = true;
            break;
          }
          sibling = sibling.nextElementSibling;
        }
        label.hidden = !hasVisible;
      });

      if (q) {
        section.hidden = sectionVisible === 0;
        if (sectionVisible > 0) section.open = true;
      } else {
        section.hidden = false;
        section.open = false;
      }

      totalVisible += sectionVisible;
    });

    countEl.textContent = q
      ? `${totalVisible} result${totalVisible !== 1 ? 's' : ''}`
      : '';
  });
}


/* ============================================================
   THEME ENGINE
   Theme is stored in localStorage and applied on every page load.
============================================================ */
function initTheme() {
  let theme;
  try { theme = localStorage.getItem('rushkoff-theme'); } catch (e) {}

  // Strip any legacy ?theme= param from the URL without reloading
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('theme')) {
      url.searchParams.delete('theme');
      history.replaceState(null, '', url.toString());
    }
  } catch (e) {}

  if (!theme) return;

  // ── Resolve CSS base path from the existing styles.css link ─
  const styleEl = document.querySelector('link[href*="styles.css"]');
  const base = styleEl
    ? styleEl.getAttribute('href').replace('styles.css', '')
    : 'css/';

  // ── Inject the stylesheet ────────────────────────────────
  const cssNames = { cyber: 'cyber.css', ftp: 'ftp.css', magick: 'magick.css', minimal: 'minimal.css' };
  const cssFile  = cssNames[theme] ? base + cssNames[theme] : null;
  if (cssFile && !document.getElementById(`${theme}-css`)) {
    const link = document.createElement('link');
    link.id   = `${theme}-css`;
    link.rel  = 'stylesheet';
    link.href = cssFile;
    document.head.appendChild(link);
  }

  // ── Inject decorative sigil layer (magick only) ─────────
  if (theme === 'magick') injectMagickDecor();

  // ── Show boot sequences — only when actively switching themes ─
  try {
    if (sessionStorage.getItem('rushkoff-switching') === theme) {
      sessionStorage.removeItem('rushkoff-switching');
      if (theme === 'cyber')  showCyberBoot();
      if (theme === 'ftp')    showFtpConnect();
      if (theme === 'magick') showMagickBoot();
    }
  } catch (e) {}
}


/* ========================
   CYBERPUNK BOOT SEQUENCE
======================== */
function showCyberBoot() {
  const overlay = document.createElement('div');
  overlay.id = 'cp-boot';
  overlay.innerHTML = `<pre
>> SYSTEM OVERRIDE DETECTED
>> LOADING ALTERNATIVE REALITY...
>> [<span class="cp-bar">                    </span>]
>> <span class="cp-done"></span></pre>`;
  document.body.appendChild(overlay);

  const bar  = overlay.querySelector('.cp-bar');
  const done = overlay.querySelector('.cp-done');
  const chars = 20;
  let prog = 0;

  const tick = setInterval(() => {
    prog++;
    bar.textContent  = '█'.repeat(prog) + ' '.repeat(chars - prog);
    if (prog >= chars) {
      clearInterval(tick);
      done.textContent = 'ACCESS GRANTED_';
      setTimeout(() => overlay.classList.add('fade-out'), 300);
      setTimeout(() => overlay.remove(), 750);
    }
  }, 28);
}


/* ========================
   MAGICK DECOR LAYER
======================== */
function injectMagickDecor() {
  if (document.getElementById('magick-decor')) return;

  // Build SVG tick marks on outer ring (8 compass points)
  const C = 250, R_OUTER = 238, R_TICK = 222, R_TICK_SM = 228;
  const ticks = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
    const rad    = (deg - 90) * Math.PI / 180; // 0° = top
    const isCard = deg % 90 === 0;
    const r1 = R_OUTER, r2 = isCard ? R_TICK : R_TICK_SM;
    const x1 = (C + r1 * Math.cos(rad)).toFixed(1);
    const y1 = (C + r1 * Math.sin(rad)).toFixed(1);
    const x2 = (C + r2 * Math.cos(rad)).toFixed(1);
    const y2 = (C + r2 * Math.sin(rad)).toFixed(1);
    const op  = isCard ? 0.18 : 0.1;
    const sw  = isCard ? 1 : 0.8;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(201,168,76,${op})" stroke-width="${sw}"/>`;
  }).join('');

  // Tick marks on inner ring (12 clock positions)
  const R_IN = 160, R_IN_TICK = 151;
  const innerTicks = Array.from({ length: 12 }, (_, i) => {
    const rad  = (i * 30 - 90) * Math.PI / 180;
    const isHex = i % 2 === 0;
    const r2   = isHex ? 148 : R_IN_TICK;
    const x1   = (C + R_IN * Math.cos(rad)).toFixed(1);
    const y1   = (C + R_IN * Math.sin(rad)).toFixed(1);
    const x2   = (C + r2  * Math.cos(rad)).toFixed(1);
    const y2   = (C + r2  * Math.sin(rad)).toFixed(1);
    const op   = isHex ? 0.13 : 0.07;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(201,168,76,${op})" stroke-width="0.8"/>`;
  }).join('');

  // Hexagram star-tip dots
  const starPts = [
    [250, 90], [389, 170], [389, 330], [250, 410], [111, 330], [111, 170]
  ].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="2.8" fill="rgba(201,168,76,0.18)"/>`
  ).join('');

  const wrap = document.createElement('div');
  wrap.id = 'magick-decor';
  wrap.innerHTML = `
    <div class="mk-ring mk-ring-1"></div>
    <div class="mk-ring mk-ring-2"></div>
    <div class="mk-ring mk-ring-3"></div>
    <div class="mk-ring mk-ring-4"></div>
    <svg class="mk-sigil" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" fill="none">
      <!-- Outer dashed ring -->
      <circle cx="250" cy="250" r="238" stroke="rgba(201,168,76,0.07)" stroke-dasharray="5 9"  stroke-width="0.9"/>
      <!-- Inner dashed ring -->
      <circle cx="250" cy="250" r="160" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3 7"  stroke-width="0.8"/>
      <!-- Centre circle -->
      <circle cx="250" cy="250" r="10"  stroke="rgba(201,168,76,0.14)" stroke-dasharray="2 4"  stroke-width="0.8"/>
      <!-- Hexagram — upward triangle -->
      <polygon points="250,90 389,330 111,330" stroke="rgba(255,255,255,0.06)" stroke-dasharray="6 7" stroke-width="0.9"/>
      <!-- Hexagram — downward triangle -->
      <polygon points="389,170 111,170 250,410" stroke="rgba(201,168,76,0.08)" stroke-dasharray="6 7" stroke-width="0.9"/>
      <!-- Compass & clock ticks -->
      ${ticks}
      ${innerTicks}
      <!-- Star-tip dots -->
      ${starPts}
    </svg>`;

  document.body.appendChild(wrap);
}


/* ========================
   MAGICK RITUAL SEQUENCE
======================== */
function showMagickBoot() {
  const overlay = document.createElement('div');
  overlay.id = 'magick-boot';

  const lines = [
    { text: '                 ∴',                               cls: 'mk-gold' },
    { text: '',                                                  cls: 'mk-dim' },
    { text: '    ☿  ♀  ♁  ♂  ♃  ♄  ♇',                       cls: 'mk-silver', delay: 550 },
    { text: '',                                                  cls: 'mk-dim' },
    { text: '      △  ·  ✡  ·  ▽',                             cls: 'mk-purple', delay: 450 },
    { text: '',                                                  cls: 'mk-dim' },
    { text: '          ☽  ⊕  ☾',                               cls: 'mk-final',  delay: 800 },
  ];

  const pre = document.createElement('pre');
  overlay.appendChild(pre);
  document.body.appendChild(overlay);

  let i = 0;
  function next() {
    if (i >= lines.length) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 1000);
      }, 600);
      return;
    }
    const { text, cls, delay } = lines[i];
    const span = document.createElement('span');
    span.className = cls || 'mk-gold';
    span.textContent = text;
    pre.appendChild(span);
    pre.appendChild(document.createTextNode('\n'));
    i++;
    setTimeout(next, delay || 260);
  }
  next();
}


/* ========================
   FTP CONNECT SEQUENCE
======================== */
function showFtpConnect() {
  const overlay = document.createElement('div');
  overlay.id = 'ftp-connect';

  const lines = [
    { text: 'C:\\USERS\\GUEST> ftp rushkoff.com',                                   color: '#ffff00' },
    { text: 'Connecting to rushkoff.com...',                                         color: '#aaaaaa', delay: 600 },
    { text: 'Connected to 207.108.11.4.',                                            color: '#aaaaaa' },
    { text: '220 RUSHKOFF.COM FTP server (WU-FTP 2.6.1-18) ready.',                 color: '#55ffff' },
    { text: 'User (207.108.11.4:(none)): anonymous',                                 color: '#ffff00' },
    { text: '331 Guest login ok, send your complete e-mail address as password.',    color: '#55ffff' },
    { text: 'Password: guest@internet.com',                                           color: '#666666' },
    { text: '',                                                                        color: '' },
    { text: '230-                  *** WELCOME TO RUSHKOFF.COM ***',                 color: '#55ff55' },
    { text: '230-           Douglas Rushkoff\'s Unauthorized Digital Archive',       color: '#55ff55' },
    { text: '230-           Est. 1994  |  "Program or Be Programmed"',              color: '#55ff55' },
    { text: '230 Guest login ok, access restrictions apply.',                         color: '#55ffff' },
    { text: '',                                                                        color: '' },
    { text: 'ftp> ls -la',                                                            color: '#ffff00' },
    { text: '200 PORT command successful.',                                            color: '#55ffff' },
    { text: '150 Opening ASCII mode data connection for /bin/ls.',                   color: '#55ffff' },
    { text: '',                                                                        color: '' },
    { text: 'drwxr-xr-x  8 rushkoff  staff   256  Nov 01 2023  ./',                 color: '#aaaaaa' },
    { text: '-rw-r--r--  1 rushkoff  staff  8423  Jan 15 2024  index.htm',          color: '#ffffff' },
    { text: '-rw-r--r--  1 rushkoff  staff  5821  Dec 10 2023  about.htm',          color: '#ffffff' },
    { text: 'drwxr-xr-x  2 rushkoff  staff   512  Nov 01 2023  books/',             color: '#55ffff' },
    { text: '-rw-r--r--  1 rushkoff  staff  7293  Sep 22 2023  films.htm',          color: '#ffffff' },
    { text: 'drwxr-xr-x  2 rushkoff  staff   256  Oct 15 2023  photos/',            color: '#55ffff' },
    { text: '-rw-r--r--  1 rushkoff  staff  3401  Aug 08 2023  contact.htm',        color: '#ffffff' },
    { text: '',                                                                        color: '' },
    { text: '226 Transfer complete.  7 matches found.',                               color: '#55ffff' },
    { text: 'ftp> get index.htm',                                                     color: '#ffff00' },
    { text: '150 Opening ASCII mode data connection for index.htm (8423 bytes).',    color: '#55ffff' },
    { text: '226 Transfer complete.',                                                  color: '#55ff55' },
    { text: '8423 bytes received in 0.12 seconds (68.23 Kbytes/s)',                  color: '#aaaaaa' },
    { text: '',                                                                        color: '' },
    { text: 'ftp> _',                                                                  color: '#ffff00' },
  ];

  const pre = document.createElement('pre');
  pre.id = 'ftp-connect-pre';
  overlay.appendChild(pre);

  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: '#000000',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 'clamp(10px, 1.8vw, 13px)',
    padding: '24px 32px',
    overflowY: 'auto',
    pointerEvents: 'none',
    transition: 'opacity 0.4s ease',
  });

  document.body.appendChild(overlay);

  let i = 0;
  function next() {
    if (i >= lines.length) {
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
      }, 700);
      return;
    }
    const { text, color, delay } = lines[i];
    const span = document.createElement('span');
    span.style.color = color || '#aaaaaa';
    span.textContent = text;
    pre.appendChild(span);
    pre.appendChild(document.createTextNode('\n'));
    overlay.scrollTop = overlay.scrollHeight;
    i++;
    setTimeout(next, delay || (i < 4 ? 180 : i < 14 ? 90 : 35));
  }
  next();
}
