/* ==========================================================================
   FEEL ALIVE — interações e animações (JS puro, sem dependências)
   ========================================================================== */

/* Dados institucionais — VALIDAR com a clínica antes da publicação (plano, seção 21) */
const CONFIG = {
  whatsapp: '5511900000000', // TODO: número oficial de WhatsApp da recepção
  addressShort: 'Domo Business · São Bernardo do Campo',
  address: 'Domo Business, ao lado do Shopping Metrópole — São Bernardo do Campo/SP',
  mapQuery: 'Domo Business São Bernardo do Campo',
  hours: 'Horários a confirmar',
  rt: 'Responsável técnico: nome, CRM e RQE a confirmar',
};

const NAV = [
  ['index.html', 'Início', 'home'],
  ['clinica.html', 'A Clínica', 'clinica'],
  ['estetica.html', 'Estética', 'estetica'],
  ['nutrologia.html', 'Nutrologia', 'nutrologia'],
  ['recovery.html', 'Recovery', 'recovery'],
  ['clubes-vip.html', 'Clubes VIP', 'clubes'],
  ['equipe.html', 'Equipe', 'equipe'],
];

const SPECIALTIES = ['Dermatologia', 'Natural Face', 'Natural Lift', 'Nutrologia', 'NeuroMap', 'Recovery', 'Clubes VIP'];

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const isDesktop = () => innerWidth > 900;
const page = document.body.dataset.page || 'home';
const pageName = (NAV.find((n) => n[2] === page) || [, 'Início'])[1];

const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sem storage */ } },
};

const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';

/* ==========================================================================
   Estrutura compartilhada (header, menu, footer, modal…)
   ========================================================================== */
function renderShell() {
  const links = NAV.map(([href, label, id]) =>
    `<a class="nav__link" href="${href}"${id === page ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const menuLinks = NAV.map(([href, label, id], i) =>
    `<li><a href="${href}" style="--i:${i}"${id === page ? ' aria-current="page"' : ''}><small>0${i + 1}</small><span>${label}</span></a></li>`).join('');
  const logoLetters = [...'FEEL ALIVE'].map((c, i) => c === ' ' ? '<span class="gap" style="--i:' + i + '"></span>' : `<span style="--i:${i}">${c}</span>`).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip" href="#conteudo">Pular para o conteúdo</a>
    <div class="loader" aria-hidden="true">
      <canvas class="loader__gl"></canvas>
      <div class="loader__inner">
        <div class="loader__logo">${logoLetters}</div>
        <div class="loader__tag">Sentir-se vivo</div>
        <span class="loader__ball"></span>
      </div>
    </div>
    <div class="curtain" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 L100 100 Z"/></svg>
      <div class="curtain__label"><small>FEEL ALIVE</small><span class="curtain__name"></span></div>
    </div>
    <div class="grain" aria-hidden="true"></div>
    <svg class="fx-defs" aria-hidden="true"><filter id="liquid" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.016" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
    <div class="progress" aria-hidden="true"></div>
    <div class="cursor" aria-hidden="true"><span class="cursor__ring"></span><span class="cursor__dot"></span><span class="cursor__label"></span></div>
    <header class="header">
      <div class="container header__inner">
        <a class="logo" href="index.html" aria-label="Feel Alive — página inicial">
          <span class="logo__name">FEEL ALIVE</span><span class="logo__sub">DERMATOLOGIA E NUTROLOGIA</span>
        </a>
        <nav class="nav" aria-label="Principal">${links}</nav>
        <div class="header__cta">
          <button class="btn btn--gold btn--sm" data-agendar data-magnetic>Agendar consulta</button>
          <button class="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
        </div>
      </div>
    </header>
    <div class="menu" id="menu">
      <ul class="menu__list">${menuLinks}</ul>
      <div class="menu__foot">
        <button class="btn btn--gold" data-agendar>Agendar consulta <span class="btn__arrow">→</span></button>
        <span>${CONFIG.address}</span>
      </div>
    </div>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer class="footer">
      <div class="container">
        <div class="footer__top">
          <div>
            <a class="logo" href="index.html" style="justify-items:start"><span class="logo__name" style="padding-left:0">FEEL ALIVE</span><span class="logo__sub" style="padding-left:0">DERMATOLOGIA E NUTROLOGIA</span></a>
            <p class="footer__claim">Viver bem começa quando você também se torna prioridade.</p>
          </div>
          <div><h4>Navegação</h4><ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>
          <div><h4>Protocolos</h4><ul>
            <li><a href="estetica.html#natural-face">Natural Face</a></li>
            <li><a href="estetica.html#natural-lift">Natural Lift</a></li>
            <li><a href="nutrologia.html#neuromap">NeuroMap</a></li>
            <li><a href="recovery.html">Recovery</a></li>
          </ul></div>
          <div><h4>Visite</h4><ul>
            <li>${CONFIG.address}</li>
            <li>${CONFIG.hours}</li>
            <li><a href="${waLink(`Olá! Vim pelo site (${pageName}) e gostaria de falar com a equipe Feel Alive.`)}" target="_blank" rel="noopener">WhatsApp</a></li>
          </ul></div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Feel Alive · Sentir-se vivo</span>
          <span>${CONFIG.rt}</span>
        </div>
      </div>
    </footer>
    <a class="wa-float" href="${waLink(`Olá! Vim pela página ${pageName} do site e gostaria de mais informações.`)}" target="_blank" rel="noopener" aria-label="Conversar pelo WhatsApp">${waIcon}</a>
    <div class="preview" aria-hidden="true"><div class="preview__orb"></div><div class="preview__text"></div></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal__bg" data-close></div>
      <div class="modal__card">
        <button class="modal__close" data-close aria-label="Fechar">×</button>
        <span class="eyebrow">Agendamento</span>
        <h2 class="h3" id="modal-title" style="margin-top:14px">Agende sua avaliação</h2>
        <p class="small" style="margin-top:8px">Conte por onde quer começar. A equipe confirma horários e profissionais pelo WhatsApp.</p>
        <form class="form" novalidate>
          <div class="field"><label>Por onde quer começar?</label>
            <div class="chips">${SPECIALTIES.map((s, i) => `<label class="chip"><input type="radio" name="esp" value="${s}"${i === 0 ? ' checked' : ''}><span>${s}</span></label>`).join('')}</div>
          </div>
          <div class="field"><label for="f-nome">Seu nome</label><input id="f-nome" name="nome" required autocomplete="name" placeholder="Como podemos te chamar?"></div>
          <div class="field"><label for="f-msg">Mensagem (opcional)</label><textarea id="f-msg" name="msg" rows="3" placeholder="Algo que gostaria de contar antes da conversa?"></textarea></div>
          <label class="consent"><input type="checkbox" name="lgpd" required> Autorizo o contato da Feel Alive para fins de agendamento, conforme a política de privacidade.</label>
          <button class="btn" type="submit">Continuar no WhatsApp <span class="btn__arrow">→</span></button>
        </form>
      </div>
    </div>`);
}

/* ==========================================================================
   Tween e curvas de easing
   ========================================================================== */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2);
function tween(from, to, dur, fn, ease = easeOut, delay = 0) {
  return new Promise((resolve) => {
    const t0 = performance.now() + delay;
    const tick = (t) => {
      const p = clamp((t - t0) / dur);
      fn(from + (to - from) * ease(p));
      if (p < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
}

/* ==========================================================================
   Cortina curva — transição entre páginas
   ========================================================================== */
const curtain = {
  draw(d) { $('.curtain path').setAttribute('d', d); },
  label(text) {
    $('.curtain__name').textContent = text;
    $('.curtain').classList.toggle('is-label', !!text);
  },
  set(text, gold = false) {
    const el = $('.curtain');
    el.classList.add('is-active');
    el.classList.toggle('is-gold', gold);
    this.label(text);
    this.draw('M0 0 L100 0 L100 100 L0 100 Z');
  },
  cover(text) {
    const el = $('.curtain');
    el.classList.remove('is-gold', 'is-label');
    el.classList.add('is-active');
    $('.curtain__name').textContent = text;
    setTimeout(() => el.classList.add('is-label'), 420);
    return tween(0, 1, 950, (e) => {
      const y = 100 - 100 * e;
      const c = Math.sin(e * Math.PI) * 18;
      this.draw(`M0 100 L0 ${y} Q50 ${y - c} 100 ${y} L100 100 Z`);
    }, easeInOut);
  },
  reveal() {
    $('.curtain').classList.remove('is-label');
    return tween(0, 1, 1100, (e) => {
      const y = 100 - 100 * e;
      const c = Math.sin(e * Math.PI) * 18;
      this.draw(`M0 0 L100 0 L100 ${y} Q50 ${y + c} 0 ${y} Z`);
    }, easeInOut, 220).then(() => this.reset());
  },
  reset() {
    $('.curtain').classList.remove('is-active', 'is-label', 'is-gold');
    this.draw('M0 100 L100 100 Z');
  },
};

function initPageTransitions() {
  if (reduced) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    if (!/(\.html?|\/)$/.test(url.pathname)) return;
    e.preventDefault();
    closeMenu();
    const nav = NAV.find(([href]) => url.pathname.endsWith(`/${href}`));
    const label = nav ? nav[1] : 'Feel Alive';
    curtain.cover(label).then(() => {
      store.set('fa-curtain', label);
      location.href = url.href;
    });
  });
  // voltar pelo histórico (bfcache) não pode reabrir a página coberta
  addEventListener('pageshow', (e) => { if (e.persisted) curtain.reset(); });
}

function curtainIntro(onDone) {
  const label = store.get('fa-curtain');
  if (!label || reduced) return false;
  try { sessionStorage.removeItem('fa-curtain'); } catch { /* sem storage */ }
  curtain.set(label);
  setTimeout(() => {
    curtain.reveal();
    setTimeout(onDone, 380);
  }, 450);
  return true;
}

/* ==========================================================================
   Abertura — partículas formam "FEEL ALIVE", a bolinha cai e cobre a tela
   ========================================================================== */
async function sampleLogo(spans) {
  try {
    await Promise.race([document.fonts.load('300 64px Montserrat'), new Promise((r) => setTimeout(r, 1200))]);
  } catch { /* segue com a fonte disponível */ }
  const w = innerWidth, h = innerHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  spans.forEach((s) => {
    if (!s.textContent.trim()) return;
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    const fs = parseFloat(cs.fontSize);
    g.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m = g.measureText(s.textContent);
    const asc = m.fontBoundingBoxAscent ?? fs * .97;
    const desc = m.fontBoundingBoxDescent ?? fs * .25;
    const ls = parseFloat(cs.letterSpacing) || 0;
    g.fillText(s.textContent, r.left + (r.width - ls) / 2, r.top + (r.height - (asc + desc)) / 2 + asc);
  });
  const data = g.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push(x - w / 2, y - h / 2);
    }
  }
  return pts;
}

function runLoader(onDone) {
  const loader = $('.loader');
  if (store.get('fa-visited') || reduced) {
    loader.classList.add('is-hidden');
    return false;
  }
  store.set('fa-visited', '1');
  document.body.classList.add('is-locked');
  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; });

  sampleLogo($$('.loader__logo span', loader)).then((pts) => {
    let gl = null;
    try {
      if (window.FAGL && pts.length) gl = FAGL.particles($('.loader__gl', loader), pts, isDesktop() ? 7000 : 3800);
    } catch { gl = null; }
    if (gl) tween(0, 1, 2100, (v) => { gl.conv = v; }, (t) => t);

    setTimeout(() => {
      loader.classList.add('is-formed');
      if (gl) tween(1, .22, 900, (v) => { gl.fade = v; });
    }, gl ? 1850 : 250);
    setTimeout(() => loader.classList.add('is-ball'), gl ? 2450 : 950);

    const exit = () => {
      if (!loaded) { setTimeout(exit, 150); return; }
      loader.style.setProperty('--cover', (Math.hypot(innerWidth, innerHeight) / 16 * 2.3).toFixed(1));
      loader.classList.add('is-done');
      if (gl) { gl.fade = 1; tween(0, 1, 1300, (v) => { gl.out = v; }); }
      setTimeout(() => {
        curtain.set('', true);
        loader.classList.add('is-hidden');
        gl?.destroy();
        document.body.classList.remove('is-locked');
        curtain.reveal();
        setTimeout(onDone, 300);
      }, 1250);
    };
    setTimeout(exit, gl ? 3800 : 2700);
  });
  return true;
}

/* ==========================================================================
   Texto dividido em palavras (máscara)
   ========================================================================== */
function splitWords(el) {
  let i = 0;
  const chars = el.dataset.split === 'chars';
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span');
          if (chars) {
            w.className = 'wc';
            [...part].forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              c.style.setProperty('--i', i++);
              w.append(c);
            });
            frag.append(w);
            return;
          }
          const s = document.createElement('span');
          w.className = 'w';
          s.textContent = part;
          s.style.setProperty('--i', i++);
          w.append(s);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
}

function splitFill(el) {
  const words = [];
  const walk = (node, gold) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const s = document.createElement('span');
          s.className = 'fw' + (gold ? ' gold' : '');
          s.textContent = part;
          words.push(s);
          frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        const isEm = n.tagName === 'EM';
        if (isEm) { walk(n, true); n.replaceWith(...n.childNodes); } else walk(n, gold);
      }
    });
  };
  walk(el, false);
  el._words = words;
}

/* Texto que rola letra a letra no hover (links do menu e botões) */
function rollText(el) {
  const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  if (!node) return;
  const text = node.textContent.trim();
  const letters = () => [...text].map((ch, i) => `<span class="ch" style="--i:${i}">${ch}</span>`).join('');
  const roll = document.createElement('span');
  roll.className = 'roll';
  roll.innerHTML = `<span class="roll__a">${letters()}</span><span class="roll__b" aria-hidden="true">${letters()}</span>`;
  node.replaceWith(roll, node.textContent.endsWith(' ') ? ' ' : '');
}

/* Texto embaralhado que se decifra (eyebrows) */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·';
function scramble(el) {
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  el.setAttribute('aria-label', final);
  const t0 = performance.now();
  const dur = 500 + final.length * 28;
  const tick = (t) => {
    const p = clamp((t - t0) / dur);
    const n = Math.floor(easeOut(p) * final.length);
    let out = final.slice(0, n);
    for (let i = n; i < final.length; i++) out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
  };
  requestAnimationFrame(tick);
}
function initScramble() {
  if (reduced) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      scramble(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: .6 });
  $$('main .eyebrow').forEach((el) => io.observe(el));
}

/* Distorção líquida (SVG feDisplacementMap) ao passar o mouse nas imagens */
function initLiquid() {
  if (!finePointer || reduced) return;
  const disp = $('#liquid feDisplacementMap');
  const turb = $('#liquid feTurbulence');
  let busy = null;
  $$('[data-liquid]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      if (busy && busy !== el) busy.style.filter = '';
      busy = el;
      el.style.filter = 'url(#liquid)';
      turb.setAttribute('seed', String((Math.random() * 100) | 0));
      tween(0, 1, 1100, (v) => {
        const k = Math.sin(v * Math.PI);
        disp.setAttribute('scale', (k * 46).toFixed(1));
        turb.setAttribute('baseFrequency', `${(0.008 + k * 0.006).toFixed(4)} ${(0.016 + k * 0.01).toFixed(4)}`);
      }, (t) => t).then(() => {
        if (busy === el) { el.style.filter = ''; busy = null; }
      });
    });
  });
}

/* ==========================================================================
   Reveals por IntersectionObserver
   ========================================================================== */
function initReveals() {
  const targets = $$('[data-split], [data-reveal], .img-reveal');
  if (reduced) { targets.forEach((t) => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  targets.forEach((t) => io.observe(t));
}

/* ==========================================================================
   Rolagem suave (inércia no mouse, nativa no toque)
   ========================================================================== */
const smooth = { target: 0, current: 0, raf: null, enabled: false };
function maxScroll() { return document.documentElement.scrollHeight - innerHeight; }
function smoothStep() {
  smooth.current = lerp(smooth.current, smooth.target, .095);
  if (Math.abs(smooth.target - smooth.current) < .5) {
    smooth.current = smooth.target;
    scrollTo(0, smooth.current);
    smooth.raf = null;
    return;
  }
  scrollTo(0, smooth.current);
  smooth.raf = requestAnimationFrame(smoothStep);
}
function scrollToY(y) {
  if (!smooth.enabled) { scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); return; }
  smooth.target = clamp(y, 0, maxScroll());
  if (!smooth.raf) smooth.raf = requestAnimationFrame(smoothStep);
}
function initSmoothScroll() {
  smooth.current = smooth.target = scrollY;
  if (!reduced && finePointer) {
    smooth.enabled = true;
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || document.body.classList.contains('is-locked')) return;
      if (e.target.closest('iframe, .modal, [data-native-scroll]')) return;
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      if (!smooth.raf) smooth.current = scrollY;
      smooth.target = clamp(smooth.target + delta, 0, maxScroll());
      if (!smooth.raf) smooth.raf = requestAnimationFrame(smoothStep);
    }, { passive: false });
    addEventListener('scroll', () => { if (!smooth.raf) smooth.current = smooth.target = scrollY; }, { passive: true });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    const el = document.querySelector(url.hash);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToY(el.getBoundingClientRect().top + scrollY - 70);
    history.replaceState(null, '', url.hash);
  });
}

/* ==========================================================================
   Header, menu móvel
   ========================================================================== */
function initHeader() {
  const header = $('.header');
  let last = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 320 && y > last && !document.body.classList.contains('is-menu-open'));
    last = y;
  }, { passive: true });
  $('.burger').addEventListener('click', () => {
    const open = !document.body.classList.contains('is-menu-open');
    document.body.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('is-locked', open);
    $('.burger').setAttribute('aria-expanded', open);
    $('.burger').setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
}
function closeMenu() {
  if (!document.body.classList.contains('is-menu-open')) return;
  document.body.classList.remove('is-menu-open', 'is-locked');
  $('.burger').setAttribute('aria-expanded', 'false');
}

/* ==========================================================================
   Cursor personalizado, botões magnéticos, tilt 3D
   ========================================================================== */
const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

function initCursor() {
  if (!finePointer || reduced) return;
  document.documentElement.classList.add('has-cursor');
  const c = $('.cursor');
  const dot = $('.cursor__dot', c);
  const ring = $('.cursor__ring', c);
  const label = $('.cursor__label', c);
  const pos = { x: mouse.x, y: mouse.y };
  const loop = () => {
    pos.x = lerp(pos.x, mouse.x, .16);
    pos.y = lerp(pos.y, mouse.y, .16);
    // o anel estica na direção do movimento (squash & stretch)
    const dx = mouse.x - pos.x, dy = mouse.y - pos.y;
    const sp = Math.min(Math.hypot(dx, dy), 140);
    const ang = Math.atan2(dy, dx) * 57.2958;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${ang}deg) scale(${1 + sp / 180}, ${1 - sp / 420})`;
    label.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    const hov = e.target.closest('a, button, summary, label, [data-hover]');
    c.classList.toggle('is-label', !!lab);
    label.textContent = lab ? lab.dataset.cursor : '';
    c.classList.toggle('is-hover', !lab && !!hov);
  });
  document.addEventListener('pointerleave', () => c.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => c.classList.remove('is-hidden'));
  $$('iframe').forEach((f) => {
    f.addEventListener('pointerenter', () => c.classList.add('is-hidden'));
    f.addEventListener('pointerleave', () => c.classList.remove('is-hidden'));
  });
}

function initMagnetic() {
  if (!finePointer || reduced) return;
  $$('[data-magnetic]').forEach((el) => {
    const s = parseFloat(el.dataset.magnetic) || .35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px, ${(e.clientY - r.top - r.height / 2) * s}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

function initTilt() {
  if (!finePointer || reduced) return;
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - .5) * 14}deg`);
      el.style.setProperty('--rx', `${(.5 - y) * 14}deg`);
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/* ==========================================================================
   Loop de rolagem: parallax, texto preenchido, horizontal, assinatura
   ========================================================================== */
function initScrollScenes() {
  const parallax = $$('[data-parallax]');
  const fills = $$('[data-fill]');
  fills.forEach(splitFill);
  const hs = $$('[data-hscroll]');
  const sig = $('.signature__word');
  const sigLetters = sig ? [...sig.children] : [];
  const skews = $$('[data-skew]');
  const zooms = $$('[data-zoom]');
  const marquees = $$('.marquee').map((m) => {
    m.classList.add('is-js');
    const track = $('.marquee__track', m);
    return { m, track, x: 0, dir: 1 };
  });
  let lastY = scrollY;
  let vel = 0;

  const sizeHs = () => hs.forEach((sec) => {
    const track = $('.hs__track', sec);
    sec.style.height = isDesktop() ? `${track.scrollWidth - innerWidth + innerHeight}px` : '';
  });
  sizeHs();
  addEventListener('resize', sizeHs);
  addEventListener('load', sizeHs);

  const update = () => {
    const vh = innerHeight;
    if (!reduced) parallax.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const speed = parseFloat(el.dataset.parallax) || .15;
      el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - vh / 2) * -speed}px, 0)`;
    });
    fills.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh * .85 - r.top) / (r.height + vh * .3));
      const on = Math.round(p * el._words.length);
      el._words.forEach((w, i) => w.classList.toggle('on', i < on));
    });
    // velocidade da rolagem (px/frame, suavizada)
    vel = lerp(vel, scrollY - lastY, .12);
    lastY = scrollY;
    const skew = reduced ? 0 : clamp(vel * .07, -5, 5);
    skews.forEach((el) => { el.style.transform = `skewY(${skew}deg)`; });

    marquees.forEach((q) => {
      if (reduced) return;
      if (Math.abs(vel) > .3) q.dir = vel > 0 ? 1 : -1;
      const half = q.track.scrollWidth / 2;
      q.x -= (.7 + Math.min(Math.abs(vel) * .35, 22)) * q.dir;
      if (q.x <= -half) q.x += half;
      if (q.x > 0) q.x -= half;
      q.track.style.transform = `translate3d(${q.x}px, 0, 0) skewX(${-skew * 2}deg)`;
    });

    zooms.forEach((z) => {
      const r = z.getBoundingClientRect();
      const p = clamp(-r.top / (z.offsetHeight - vh));
      z.style.setProperty('--zp', easeInOut(clamp(p * 1.2)).toFixed(4));
    });

    hs.forEach((sec) => {
      const track = $('.hs__track', sec);
      if (!isDesktop()) return;
      const r = sec.getBoundingClientRect();
      const p = clamp(-r.top / (sec.offsetHeight - vh));
      track.style.transform = `translate3d(${-p * (track.scrollWidth - innerWidth)}px, 0, 0)`;
      sec.style.setProperty('--hp', p);
      if (reduced) return;
      // cards giram em 3D conforme a posição na tela (efeito "coverflow")
      $$('.proto', track).forEach((card) => {
        const cr = card.getBoundingClientRect();
        const off = (cr.left + cr.width / 2 - innerWidth / 2) / innerWidth;
        card.style.setProperty('--ry', `${(off * -22).toFixed(2)}deg`);
        card.style.setProperty('--sk', `${(-skew * 1.6).toFixed(2)}deg`);
      });
    });

    if (sig && !reduced) {
      const r = sig.getBoundingClientRect();
      const p = clamp(1 - (r.top - vh * .25) / (vh * .75));
      sigLetters.forEach((l, i) => {
        const lr = l.getBoundingClientRect();
        const d = Math.hypot(mouse.x - (lr.left + lr.width / 2), mouse.y - (lr.top + lr.height / 2));
        const lift = Math.max(0, 1 - d / 300);
        l._lift = lerp(l._lift || 0, lift, .12);
        l.style.setProperty('--ty', `${(1 - p) * (i % 2 ? 90 : -40) - l._lift * 60}px`);
        l.style.color = l._lift > .35 ? 'var(--gold)' : '';
      });
    }
    requestAnimationFrame(update);
  };
  update();
}

/* ==========================================================================
   Vídeos opcionais: injeta <video> se o arquivo existir; senão mantém o visual
   ========================================================================== */
function initVideos() {
  if (reduced) return;
  $$('[data-video]').forEach((box) => {
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: !box.hasAttribute('data-video-once'), playsInline: true, autoplay: true, preload: 'metadata' });
    v.setAttribute('muted', '');
    v.setAttribute('aria-hidden', 'true');
    v.src = box.dataset.video;
    v.addEventListener('loadeddata', () => { box.append(v); box.classList.add('has-video'); box.dispatchEvent(new CustomEvent('video', { detail: v })); v.play().catch(() => {}); }, { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
  });
}

/* ==========================================================================
   Filme de abertura — capítulos de 18 segundos
   ========================================================================== */
function initFilm() {
  const film = $('.film');
  if (!film) return;
  const chapters = $$('.film__ch', film);
  const caption = $('.film__caption');
  const times = chapters.map((c) => parseFloat(c.dataset.t));
  const ends = times.slice(1).concat(18);
  let idx = 0;
  let timer = null;
  let video = null;

  const set = (i, restart = true) => {
    idx = i;
    chapters.forEach((c, k) => {
      c.classList.toggle('is-done', k < i);
      c.classList.remove('is-active');
      c.style.setProperty('--dur', `${ends[k] - times[k]}s`);
    });
    void chapters[i].offsetWidth; // reinicia a animação da barra
    chapters[i].classList.add('is-active');
    caption.innerHTML = `<span>${chapters[i].dataset.caption}</span>`;
    if (video && restart) video.currentTime = times[i];
    if (!video) {
      clearTimeout(timer);
      timer = setTimeout(() => set((i + 1) % chapters.length), (ends[i] - times[i]) * 1000);
    }
  };
  chapters.forEach((c, i) => c.addEventListener('click', () => set(i)));
  $('.hero__media')?.addEventListener('video', (e) => {
    video = e.detail;
    clearTimeout(timer);
    video.addEventListener('timeupdate', () => {
      const i = times.findLastIndex((t) => video.currentTime >= t);
      if (i !== idx && i >= 0) set(i, false);
    });
  });
  if (reduced) { chapters.forEach((c) => c.classList.add('is-done')); caption.textContent = chapters[0].dataset.caption; return; }
  set(0);
}

/* ==========================================================================
   Lista de tratamentos com prévia flutuante
   ========================================================================== */
function initTreatmentList() {
  const rows = $$('.tlist__row');
  if (!rows.length) return;
  const prev = $('.preview');
  const text = $('.preview__text', prev);
  const pos = { x: mouse.x, y: mouse.y };
  let on = false;
  const loop = () => {
    pos.x = lerp(pos.x, mouse.x + 160, .12);
    pos.y = lerp(pos.y, mouse.y, .12);
    prev.style.left = `${pos.x}px`;
    prev.style.top = `${pos.y}px`;
    if (on) requestAnimationFrame(loop);
  };
  rows.forEach((row) => {
    const head = $('.tlist__head', row);
    head.addEventListener('click', () => {
      const open = !row.classList.contains('is-open');
      row.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', open);
    });
    if (!finePointer) return;
    head.addEventListener('pointerenter', () => {
      text.textContent = row.dataset.preview || '';
      prev.classList.add('is-on');
      if (!on) { on = true; pos.x = mouse.x + 160; pos.y = mouse.y; loop(); }
    });
    head.addEventListener('pointerleave', () => { prev.classList.remove('is-on'); on = false; });
  });
}

/* ==========================================================================
   Equipe — painéis acessíveis por teclado
   ========================================================================== */
function initTeam() {
  $$('.team').forEach((team) => {
    const members = $$('.member', team);
    members.forEach((m) => {
      m.addEventListener('focusin', () => {
        members.forEach((o) => o.classList.toggle('is-active', o === m));
        team.classList.add('has-active');
      });
    });
    team.addEventListener('focusout', (e) => {
      if (team.contains(e.relatedTarget)) return;
      members.forEach((o) => o.classList.remove('is-active'));
      team.classList.remove('has-active');
    });
  });
}

/* ==========================================================================
   NeuroMap — painel ilustrativo sincronizado com as etapas
   ========================================================================== */
function initNeuro() {
  const dash = $('.dash');
  if (!dash) return;
  const ring = $('.ring', dash);
  const ringVal = $('.ring b', dash);
  const bars = $$('.bars i', dash);
  const states = {
    1: { ring: 38, bars: [30, 55, 40, 70, 45, 60, 35] },
    2: { ring: 64, bars: [50, 65, 60, 80, 55, 72, 58] },
    3: { ring: 78, bars: [65, 70, 78, 74, 82, 76, 80] },
    4: { ring: 86, bars: [72, 80, 84, 82, 88, 85, 90] },
  };
  const apply = (n) => {
    const s = states[n];
    dash.dataset.step = n;
    $$('.dash__panel', dash).forEach((p) => p.classList.toggle('is-focus', p.dataset.steps.split(',').includes(String(n))));
    ring.style.setProperty('--v', s.ring);
    animateNumber(ringVal, s.ring);
    bars.forEach((b, i) => b.style.setProperty('--h', s.bars[i]));
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('.step').forEach((s) => s.classList.toggle('is-active', s === e.target));
      apply(e.target.dataset.step);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  $$('.step').forEach((s) => io.observe(s));
  apply(1);

  // onda animada
  const canvas = $('canvas', dash);
  const ctx = canvas.getContext('2d');
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) draw(performance.now()); }).observe(canvas);
  const draw = (t) => {
    const dpr = Math.min(devicePixelRatio, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const step = +dash.dataset.step || 1;
    const calm = 1 - (step - 1) * .2;
    const wave = (color, amp, freq, speed, phase, width) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 + Math.sin(x * freq + t * speed + phase) * amp * calm + Math.sin(x * freq * 2.7 + t * speed * 1.6) * amp * .35 * calm;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    };
    ctx.shadowColor = 'rgba(228,181,49,.8)'; ctx.shadowBlur = 10;
    wave('#e4b531', h * .26, .018, .0016, 0, 1.6);
    ctx.shadowBlur = 0;
    wave('rgba(255,255,255,.35)', h * .18, .024, .0011, 2, 1);
    if (visible && !reduced) requestAnimationFrame(draw);
  };
}

function animateNumber(el, to, dur = 1400) {
  const from = parseFloat(el.textContent) || 0;
  const t0 = performance.now();
  const tick = (t) => {
    const p = clamp((t - t0) / dur);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.textContent = '0';
      animateNumber(e.target, +e.target.dataset.count, 1800);
      io.unobserve(e.target);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach((c) => io.observe(c));
}

/* ==========================================================================
   Rede de partículas (fundo do NeuroMap / nutrologia)
   ========================================================================== */
function initNetwork() {
  $$('canvas[data-network]').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [], visible = true;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(clamp(w * h / 16000, 30, 110));
      nodes = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 }));
    };
    resize();
    addEventListener('resize', resize);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) frame(); }).observe(canvas);
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const r = canvas.getBoundingClientRect();
      const mx = mouse.x - r.left, my = mouse.y - r.top;
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = mx - n.x, dy = my - n.y, d = Math.hypot(dx, dy);
        if (d < 160) { n.x -= dx * .004; n.y -= dy * .004; }
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(228,181,49,${(1 - d / 120) * .35})`;
            ctx.lineWidth = .6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => { ctx.fillStyle = 'rgba(240,210,122,.85)'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill(); });
      if (visible && !reduced) requestAnimationFrame(frame);
    };
    frame();
  });
}

/* ==========================================================================
   Som ambiente (Recovery) — água gerada por Web Audio, opcional
   ========================================================================== */
function initSound() {
  const btn = $('[data-sound]');
  if (!btn) return;
  let ctx, gain;
  btn.addEventListener('click', async () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 700;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = .08; lfoGain.gain.value = 300;
      lfo.connect(lfoGain).connect(lp.frequency);
      gain = ctx.createGain(); gain.gain.value = 0;
      src.connect(lp).connect(gain).connect(ctx.destination);
      src.start(); lfo.start();
    }
    const on = !btn.classList.contains('is-on');
    if (ctx.state === 'suspended') await ctx.resume();
    gain.gain.setTargetAtTime(on ? .35 : 0, ctx.currentTime, .6);
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on);
    $('.sound-btn__txt', btn).textContent = on ? 'Som ambiente ligado' : 'Ativar som ambiente';
  });
}

/* Respiração guiada: acompanha o ciclo de 10s do círculo (CSS breathe-b) */
function initBreath() {
  const el = $('[data-breath]');
  if (!el || reduced) return;
  let inhale = true;
  setInterval(() => { inhale = !inhale; el.textContent = inhale ? 'inspire' : 'expire'; }, 5000);
}

/* ==========================================================================
   Agendamento (modal → WhatsApp com origem)
   ========================================================================== */
function initBooking() {
  const modal = $('.modal');
  const form = $('form', modal);
  let lastFocus = null;
  const open = (esp) => {
    lastFocus = document.activeElement;
    closeMenu();
    if (esp) { const r = $(`input[value="${esp}"]`, form); if (r) r.checked = true; }
    modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    setTimeout(() => $('#f-nome').focus(), 300);
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    lastFocus?.focus();
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-agendar]');
    if (t) { e.preventDefault(); open(t.dataset.agendar); }
    if (e.target.closest('[data-close]')) close();
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('is-open')) close();
    else closeMenu();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    if (!nome) { form.nome.focus(); form.nome.style.borderColor = '#c0392b'; return; }
    if (!form.lgpd.checked) { form.lgpd.focus(); return; }
    const esp = form.esp.value;
    const extra = form.msg.value.trim();
    const msg = `Olá! Sou ${nome} e gostaria de agendar uma avaliação de ${esp}.\n(Origem: site — página ${pageName})${extra ? `\n\n${extra}` : ''}`;
    window.open(waLink(msg), '_blank', 'noopener');
    close();
  });
}

/* Links de WhatsApp com mensagem de origem específica */
function initWaLinks() {
  $$('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa || `Olá! Vim pela página ${pageName} do site.`);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-map]').forEach((f) => { f.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.mapQuery)}&output=embed`; });
  $$('[data-address]').forEach((el) => { el.textContent = CONFIG.address; });
}

/* ==========================================================================
   Boot
   ========================================================================== */
function initHeroGL() {
  const hero = $('.hero');
  const canvas = $('.hero__gl');
  if (!hero || !canvas || !window.FAGL || reduced) return null;
  try {
    return FAGL.hero(canvas, {
      photo: $('.hero__photo', hero),
      src: $('.hero__photo img', hero).getAttribute('src'),
      isMobile: () => !isDesktop(),
      onTexture: () => hero.classList.add('is-gl'),
    });
  } catch { return null; }
}

function initSilk() {
  if (!window.FAGL || reduced) return;
  $$('canvas[data-silk]').forEach((c) => {
    try { FAGL.silk(c, { dim: +c.dataset.silk || 1 }); } catch { /* mantém o gradiente CSS */ }
  });
}

renderShell();
$$('[data-split]').forEach(splitWords);
$$('.nav__link, .btn').forEach(rollText);
initWaLinks();
initHeader();
initSmoothScroll();
initPageTransitions();
initCursor();
initVideos();
initScrollScenes();
initTreatmentList();
initTeam();
initNeuro();
initNetwork();
initSound();
initBreath();
initBooking();
initCounters();
initLiquid();
initSilk();
const heroGL = initHeroGL();

const start = () => {
  document.body.classList.add('is-loaded');
  heroGL?.start();
  initReveals();
  initScramble();
  initFilm();
  initMagnetic();
  initTilt();
};
const intro = runLoader(start) || curtainIntro(start);
document.documentElement.classList.remove('is-first', 'is-curtain');
if (!intro) start();
