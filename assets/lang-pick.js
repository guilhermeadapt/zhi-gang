/* Zhi Guides — escolha de idioma na primeira visita
   Mostra um cartao breve com as bandeiras quando ainda nao ha preferencia salva.
   Nao duplica logica: clica no proprio botao [data-lang] da pagina, que aplica
   e grava a preferencia na chave compartilhada 'wanted-guide-language' — a mesma
   usada pelo hub, healer, tank, dps, playbook e timer (mesma origem, logo vale
   para todas as paginas). */
(function () {
  var KEY = 'wanted-guide-language';
  var MARK = 'wanted-guide-language-prompted';
  var LANGS = ['pt', 'es', 'en'];
  window.__langPickVersion = '1';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(code) {
    try { localStorage.setItem(KEY, code); } catch (e) {}
  }
  function guess() {
    var n = (navigator.language || navigator.userLanguage || 'pt').toLowerCase();
    if (n.indexOf('es') === 0) return 'es';
    if (n.indexOf('en') === 0) return 'en';
    return 'pt';
  }
  var NAMES = { pt: 'Português (Brasil)', es: 'Español (España)', en: 'English (United States)' };
  var FLAGS = {
    pt: '<svg class="flag flag-svg" viewBox="0 0 24 16" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" rx="1" fill="#229E45"/><path d="M12 2 22 8 12 14 2 8Z" fill="#FFDF00"/><circle cx="12" cy="8" r="3.25" fill="#002776"/><path d="M9.1 7.3c2.2-.55 4.25-.18 5.75.8" fill="none" stroke="#fff" stroke-width=".55"/></svg>',
    es: '<svg class="flag flag-svg" viewBox="0 0 24 16" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" rx="1" fill="#AA151B"/><rect y="4" width="24" height="8" fill="#F1BF00"/><rect x="7" y="6.15" width="2.15" height="3.7" rx=".3" fill="#AA151B"/><path d="M6.55 6h3.05" stroke="#fff" stroke-width=".55"/></svg>',
    en: '<svg class="flag flag-svg" viewBox="0 0 24 16" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" rx="1" fill="#fff"/><path d="M0 0h24v2H0zm0 4h24v2H0zm0 4h24v2H0zm0 4h24v2H0" fill="#B22234"/><rect width="10.5" height="8.5" rx=".5" fill="#3C3B6E"/><g fill="#fff"><circle cx="2" cy="2" r=".45"/><circle cx="5" cy="2" r=".45"/><circle cx="8" cy="2" r=".45"/><circle cx="3.5" cy="4.25" r=".45"/><circle cx="6.5" cy="4.25" r=".45"/><circle cx="2" cy="6.5" r=".45"/><circle cx="5" cy="6.5" r=".45"/><circle cx="8" cy="6.5" r=".45"/></g></svg>'
  };
  var TXT = {
    pt: { title: 'Escolha o idioma', note: 'Fica salvo para os outros guias.', close: 'Fechar' },
    es: { title: 'Elige el idioma', note: 'Se guarda para las demás guías.', close: 'Cerrar' },
    en: { title: 'Choose your language', note: 'Saved for the other guides.', close: 'Close' }
  };

  function current() {
    var l = '';
    try { l = document.documentElement.lang || ''; } catch (e) {}
    if (l.indexOf('es') === 0) return 'es';
    if (l.indexOf('en') === 0) return 'en';
    return 'pt';
  }

  function build() {
    var pref = (window.__lpkPre || guess());
    var wrap = document.createElement('div');
    wrap.className = 'lpk-wrap';
    wrap.setAttribute('role', 'dialog');
    var t = TXT[guess()];
    wrap.setAttribute('aria-label', t.title);

    var card = document.createElement('div');
    card.className = 'lpk-card';

    var row = document.createElement('div');
    row.className = 'lpk-row';
    LANGS.forEach(function (code) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lpk-flag' + (code === pref ? ' is-on' : '');
      b.setAttribute('data-lpk', code);
      b.setAttribute('aria-label', NAMES[code]);
      b.innerHTML = FLAGS[code];
      row.appendChild(b);
    });

    var head = document.createElement('div');
    head.className = 'lpk-t';
    head.textContent = t.title;

    var note = document.createElement('div');
    note.className = 'lpk-n';
    note.textContent = t.note;

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'lpk-x';
    x.setAttribute('aria-label', t.close);
    x.innerHTML = '&times;';

    card.appendChild(head);
    card.appendChild(row);
    card.appendChild(note);
    card.appendChild(x);
    wrap.appendChild(card);
    return { wrap: wrap, x: x, row: row };
  }

  var CSS = '' +
    '.lpk-wrap{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:1000;font-family:inherit;' +
    'max-width:min(92vw,340px);animation:lpkIn .28s ease-out both}' +
    '.lpk-card{position:relative;background:var(--ink-2,rgba(12,15,21,.97));border:1px solid var(--gold-line,rgba(217,164,65,.4));' +
    'border-radius:var(--r-l,14px);padding:16px 44px 15px 16px;box-shadow:0 18px 44px rgba(0,0,0,.55)}' +
    '.lpk-card::after{content:"";position:absolute;left:16px;right:44px;bottom:0;height:1px;background:var(--gold,#d9a441);opacity:.35}' +
    '.lpk-t{font-family:var(--font-d,\'Oswald\',inherit);font-weight:600;font-size:13px;letter-spacing:.09em;' +
    'text-transform:uppercase;color:var(--text,#e9e6df);margin-bottom:11px}' +
    '.lpk-row{display:flex;align-items:center;gap:6px;padding:3px;border:1px solid var(--gold-line,rgba(217,164,65,.35));' +
    'border-radius:99px;background:rgba(9,11,16,.78);width:max-content}' +
    '.lpk-flag{width:46px;height:34px;display:grid;place-items:center;padding:0;cursor:pointer;' +
    'background:transparent;border:1px solid transparent;border-radius:99px;opacity:.6;' +
    'transition:opacity .15s ease,background .15s ease,border-color .15s ease}' +
    '.lpk-flag:hover{opacity:.92}' +
    '.lpk-flag.is-on{opacity:1;background:rgba(217,164,65,.18);border-color:var(--gold-line,rgba(217,164,65,.4))}' +
    '.lpk-flag svg{display:block;width:26px;height:18px;border-radius:2px;overflow:hidden}' +
    '.lpk-flag .flag{font-size:20px;line-height:1}' +
    '.lpk-flag:focus-visible{outline:2px solid var(--gold,#d9a441);outline-offset:2px}' +
    '.lpk-n{margin-top:9px;font-size:11.5px;line-height:1.4;color:var(--muted,#9aa0aa)}' +
    '.lpk-x{position:absolute;top:9px;right:9px;width:26px;height:26px;display:grid;place-items:center;' +
    'background:transparent;border:1px solid var(--line-2,rgba(255,255,255,.14));border-radius:99px;' +
    'color:var(--muted,#9aa0aa);font-size:15px;line-height:1;cursor:pointer}' +
    '.lpk-x:hover{color:var(--text,#e9e6df);border-color:var(--gold-line,rgba(217,164,65,.4))}' +
    '@keyframes lpkIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.lpk-wrap{animation:none}}' +
    '@media print{.lpk-wrap{display:none!important}}' +
    '@media (max-width:560px){.lpk-wrap{left:10px;right:10px;transform:none;bottom:10px;max-width:none}}';

  function injectCss() {
    if (document.getElementById('lpk-css')) return;
    var s = document.createElement('style');
    s.id = 'lpk-css';
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }

  function kill() {
    var el = document.querySelector('.lpk-wrap');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') { save(current()); kill(); }
  }

  function show() {
    if (document.querySelector('.lpk-wrap')) return;
    if (!document.body) return;
    injectCss();
    var el = build();
    document.body.appendChild(el.wrap);
    document.addEventListener('keydown', onKey);
    el.x.addEventListener('click', function () { save(current()); kill(); });
    el.row.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-lpk]') : null;
      if (!b) return;
      var code = b.getAttribute('data-lpk');
      save(code);
      var real = document.querySelector('[data-lang="' + code + '"]');
      kill();
      if (real) { real.click(); } else { location.reload(); }
    });
  }

  /* A chave da lingua nao serve para detectar primeira visita: as proprias
     paginas gravam 'pt' no init (setLanguage). O marcador e escrito por nos,
     uma vez por navegador/origem. */
  var asked = null;
  try { asked = localStorage.getItem(MARK); } catch (e) {}
  if (asked) return;
  try { localStorage.setItem(MARK, '1'); } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(show, 400); });
  } else {
    setTimeout(show, 400);
  }
})();
