/* =============================================================================
 * Zhi Guides — Mapa de Estratégia GvG (guild Wanted)
 * app.js — Etapas 1–5:
 *   1 mapa + tokens de PT   2 cenários (árvore de fases)   3 nota + apresentação
 *   5 ROSTER: parse da inscrição do Discord (raid-helper) -> grade editável ->
 *     PTs com composição; token de PT expande e mostra os membros/reservas.
 *
 * Coordenadas em FRAÇÃO 0–1. Assets/config em window.WWM. Projeto no localStorage.
 * ========================================================================== */
(function () {
  'use strict';

  const CFG = window.WWM;
  const NAT = CFG.mapSize;
  const AR = NAT.w / NAT.h;
  const PT_IDS = CFG.parties.map(p => p.id);

  // ---- DOM ----
  const $ = id => document.getElementById(id);
  const mapPanel = $('mapPanel'), stageWrap = $('stageWrap'), mapHint = $('mapHint'), ptPopover = $('ptPopover');
  const ptList = $('ptList'), objToggle = $('objToggle'), objState = $('objState');
  const rail = $('rail'), addScene = $('addScene'), dupScene = $('dupScene'), seedBtn = $('seedBtn');
  const nameInput = $('nameInput'), condInput = $('condInput'), noteInput = $('noteInput');
  const presentBtn = $('presentBtn'), exitBtn = $('exitBtn'), prevBtn = $('prevBtn'), nextBtn = $('nextBtn');
  const pbTitle = $('pbTitle'), pbCond = $('pbCond'), pbProg = $('pbProg');
  const pnPhase = $('pnPhase'), pnBadge = $('pnBadge'), pnText = $('pnText');
  const sumEsc = $('sumEsc'), sumRes = $('sumRes'), sumAus = $('sumAus');
  // modal
  const rosterBtn = $('rosterBtn'), editRosterBtn = $('editRosterBtn'), rosterModal = $('rosterModal'), rosterClose = $('rosterClose');
  const rosterPaste = $('rosterPaste'), parseBtn = $('parseBtn'), parseMsg = $('parseMsg'), autoBtn = $('autoBtn');
  const rosterGrid = $('rosterGrid'), gEsc = $('gEsc'), gRes = $('gRes'), gAus = $('gAus'), gComp = $('gComp');
  const rosterSave = $('rosterSave'), rosterClear2 = $('rosterClear2'), saveMsg = $('saveMsg');

  // ---- estado ----
  const state = {
    scenarios: [], currentId: null,
    roster: [],                    // [{ id,nome,classe,funcao,status,ausente,reserva,pt,nota }]
    objectivesOn: CFG.defaults.objectivesOn,
    present: false,
  };
  const partyById = new Map(CFG.parties.map(p => [p.id, p]));
  let popoverPt = null;            // PT aberta no popover
  let rosterDraft = [];            // cópia editável dentro do modal

  // ---- Konva ----
  const stage = new Konva.Stage({ container: 'stage', width: 10, height: 10 });
  const bgLayer = new Konva.Layer({ listening: false });
  const tokenLayer = new Konva.Layer();
  stage.add(bgLayer, tokenLayer);
  const bgImage = new Konva.Image({ x: 0, y: 0 });
  bgLayer.add(bgImage);
  let W = 10, H = 10, R = 20;
  const imgObjectives = new Image(), imgClean = new Image();
  let imagesReady = 0;

  // ---- helpers ----
  function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cur() { return state.scenarios.find(s => s.id === state.currentId) || state.scenarios[0]; }
  function curIndex() { return state.scenarios.findIndex(s => s.id === state.currentId); }
  function newScenario(over) { return Object.assign({ id: uid(), fase: 'Cenário', nome: 'Novo cenário', condicao: null, tokens: [], desenhos: [], nota: '' }, over || {}); }
  function isPristine(s) { return s && (!s.tokens || s.tokens.length === 0) && !(s.nota || '').trim(); }
  function clamp01(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function roleColor(f) { return CFG.roleColors[f] || CFG.roleColors.DPS; }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function onImg() { if (++imagesReady === 2) init(); }
  imgObjectives.onload = imgClean.onload = onImg;
  imgObjectives.onerror = imgClean.onerror = onImg;
  imgObjectives.src = CFG.assets.mapObjectives;
  imgClean.src = CFG.assets.mapClean;

  function init() {
    loadProject();
    applyObjectivesUI();
    renderSidebar();
    renderRail();
    loadScenarioIntoUI();
    fit();
    wireEvents();
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  function fit() {
    const availW = mapPanel.clientWidth - 20, availH = mapPanel.clientHeight - 20;
    if (availW <= 0 || availH <= 0) return;
    let w = availW, h = w / AR;
    if (h > availH) { h = availH; w = h * AR; }
    W = Math.round(w); H = Math.round(h); R = Math.max(14, Math.round(W * 0.024));
    stage.size({ width: W, height: H });
    stageWrap.style.width = W + 'px'; stageWrap.style.height = H + 'px';
    bgImage.size({ width: W, height: H });
    bgLayer.batchDraw();
    hidePopover();
    renderTokens();
  }
  function applyObjectivesUI() {
    objToggle.checked = state.objectivesOn;
    objState.textContent = state.objectivesOn ? 'ON' : 'OFF';
    bgImage.image(state.objectivesOn ? imgObjectives : imgClean);
    bgLayer.batchDraw();
  }

  // ---------------------------------------------------------------------------
  // Roster helpers (composição das PTs)
  // ---------------------------------------------------------------------------
  function membersOf(pt, reserva) { return state.roster.filter(p => p.pt === pt && !p.ausente && !!p.reserva === reserva); }
  function compCounts(pt) {
    const c = { Tank: 0, Healer: 0, DPS: 0, Support: 0 };
    membersOf(pt, false).forEach(p => { c[p.funcao] = (c[p.funcao] || 0) + 1; });
    return c;
  }

  // ---------------------------------------------------------------------------
  // Sidebar (PTs com composição) + resumo
  // ---------------------------------------------------------------------------
  function renderSidebar() {
    const aus = state.roster.filter(p => p.ausente).length;
    const res = state.roster.filter(p => p.reserva && !p.ausente).length;
    const esc_ = state.roster.filter(p => !p.ausente && !p.reserva && p.pt).length;
    sumEsc.textContent = esc_; sumRes.textContent = res; sumAus.textContent = aus;

    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.innerHTML = '';
    CFG.parties.forEach(p => {
      const c = compCounts(p.id);
      const total = c.Tank + c.Healer + c.DPS + c.Support;
      const resN = membersOf(p.id, true).length;
      const dots = CFG.roleOrder.filter(f => c[f]).map(f =>
        '<span class="cd"><i style="background:' + roleColor(f) + '"></i>' + c[f] + '</span>').join('');
      const compHtml = total
        ? dots + (resN ? '<span class="cd" style="color:#9aa2b4">+' + resN + ' res</span>' : '')
        : 'sem membros';
      const chip = document.createElement('div');
      chip.className = 'pt-chip' + (placed.includes(p.id) ? ' placed' : '');
      chip.style.setProperty('--accent', p.cor);
      chip.setAttribute('draggable', 'true');
      chip.dataset.pt = p.id;
      chip.innerHTML =
        '<span class="dot">' + p.id.replace('PT', '') + '</span>' +
        '<span class="lbl"><b>' + p.id + '</b><span class="comp' + (total ? '' : ' vazia') + '">' + compHtml + '</span></span>' +
        '<span class="status">' + (placed.includes(p.id) ? 'No mapa' : 'Arraste') + '</span>';
      chip.addEventListener('dragstart', ev => {
        if (state.present) { ev.preventDefault(); return; }
        ev.dataTransfer.setData('text/plain', p.id); ev.dataTransfer.effectAllowed = 'copy';
      });
      ptList.appendChild(chip);
    });
  }

  // ---------------------------------------------------------------------------
  // Tokens
  // ---------------------------------------------------------------------------
  function makeToken(t) {
    const p = partyById.get(t.pt);
    const g = new Konva.Group({ draggable: !state.present });
    g.setAttr('ptId', t.pt);
    const halo = new Konva.Circle({ radius: R + 4, fill: p.cor, opacity: 0.22 });
    const body = new Konva.Circle({ radius: R, fill: '#0b0e15', stroke: p.cor, strokeWidth: Math.max(2, R * 0.12),
      shadowColor: '#000', shadowBlur: 10, shadowOpacity: 0.5, shadowOffsetY: 3 });
    const label = new Konva.Text({ text: t.pt, fontFamily: 'Oswald, sans-serif', fontStyle: '700',
      fontSize: Math.round(R * 0.72), fill: p.cor, align: 'center', verticalAlign: 'middle',
      width: R * 2.4, height: R * 1.4, offsetX: R * 1.2, offsetY: R * 0.7 });
    g.add(halo, body, label);

    // selo com nº de membros (se houver roster)
    const n = membersOf(t.pt, false).length;
    if (n) {
      const badge = new Konva.Label({ x: R * 0.72, y: R * 0.72 });
      badge.add(new Konva.Tag({ fill: p.cor, cornerRadius: R * 0.5 }));
      badge.add(new Konva.Text({ text: String(n), fontFamily: 'Oswald, sans-serif', fontStyle: '700',
        fontSize: Math.round(R * 0.62), fill: '#0a0c11', padding: Math.max(2, R * 0.18) }));
      g.add(badge);
    }
    g.position({ x: t.xf * W, y: t.yf * H });

    g.on('click tap', e => { e.cancelBubble = true; togglePopover(t.pt, g.x(), g.y()); });
    if (!state.present) {
      g.dragBoundFunc(pos => ({ x: Math.max(0, Math.min(W, pos.x)), y: Math.max(0, Math.min(H, pos.y)) }));
      g.on('dragstart', () => { hidePopover(); g.moveToTop(); });
      g.on('dragend', () => {
        const tk = cur().tokens.find(x => x.pt === t.pt);
        if (tk) { tk.xf = clamp01(g.x() / W); tk.yf = clamp01(g.y() / H); saveProject(); }
      });
      g.on('dblclick dbltap', () => removeToken(t.pt));
      g.on('mouseenter', () => { stage.container().style.cursor = 'grab'; });
      g.on('mouseleave', () => { stage.container().style.cursor = 'default'; });
    } else {
      g.on('mouseenter', () => { stage.container().style.cursor = 'pointer'; });
      g.on('mouseleave', () => { stage.container().style.cursor = 'default'; });
    }
    return g;
  }
  function renderTokens() {
    tokenLayer.destroyChildren();
    (cur() ? cur().tokens : []).forEach(t => tokenLayer.add(makeToken(t)));
    tokenLayer.batchDraw();
    syncPlacedChips();
    mapHint.classList.toggle('hide', (cur() ? cur().tokens.length : 0) > 0 || state.present);
  }
  function syncPlacedChips() {
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.querySelectorAll('.pt-chip').forEach(chip => {
      const on = placed.includes(chip.dataset.pt);
      chip.classList.toggle('placed', on);
      chip.querySelector('.status').textContent = on ? 'No mapa' : 'Arraste';
    });
  }
  function placeToken(pt, xf, yf) {
    if (!partyById.has(pt) || state.present) return;
    const toks = cur().tokens, ex = toks.find(t => t.pt === pt);
    if (ex) { ex.xf = clamp01(xf); ex.yf = clamp01(yf); }
    else toks.push({ pt, xf: clamp01(xf), yf: clamp01(yf) });
    renderTokens(); saveProject();
  }
  function removeToken(pt) { const s = cur(); s.tokens = s.tokens.filter(t => t.pt !== pt); hidePopover(); renderTokens(); saveProject(); }

  // ---------------------------------------------------------------------------
  // Popover de membros da PT
  // ---------------------------------------------------------------------------
  function togglePopover(pt, x, y) {
    if (popoverPt === pt && !ptPopover.hidden) { hidePopover(); return; }
    const p = partyById.get(pt);
    const tit = membersOf(pt, false), res = membersOf(pt, true);
    let html = '<h4><span class="pd" style="background:' + p.cor + '"></span>' + pt + '</h4>';
    if (!tit.length && !res.length) {
      html += '<div class="empty">Sem membros. Defina no roster (botão Roster).</div>';
    } else {
      html += '<ul>';
      tit.forEach(m => html += '<li><span class="rl" style="background:' + roleColor(m.funcao) + '"></span>' + esc(m.nome) + '<span class="tag">' + esc(m.funcao) + '</span></li>');
      res.forEach(m => html += '<li class="res"><span class="rl" style="background:' + roleColor(m.funcao) + ';opacity:.5"></span>' + esc(m.nome) + '<span class="tag">reserva</span></li>');
      html += '</ul>';
    }
    ptPopover.innerHTML = html;
    ptPopover.hidden = false;
    // posiciona relativo ao stage-col
    const px = stageWrap.offsetLeft + x + R + 8;
    const py = stageWrap.offsetTop + y - 10;
    const maxX = mapPanel.clientWidth - ptPopover.offsetWidth - 8;
    const maxY = mapPanel.clientHeight - ptPopover.offsetHeight - 8;
    ptPopover.style.left = Math.max(8, Math.min(px, maxX)) + 'px';
    ptPopover.style.top = Math.max(8, Math.min(py, maxY)) + 'px';
    popoverPt = pt;
  }
  function hidePopover() { ptPopover.hidden = true; popoverPt = null; }

  // ---------------------------------------------------------------------------
  // Cenários (trilha)
  // ---------------------------------------------------------------------------
  function renderRail() {
    rail.innerHTML = '';
    state.scenarios.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'scene' + (s.id === state.currentId ? ' active' : '');
      card.dataset.id = s.id;
      card.setAttribute('draggable', 'true');
      card.innerHTML =
        '<div class="sc-top"><span class="sc-idx">' + (i + 1) + '</span><span class="sc-name">' + esc(s.nome || 'Cenário') + '</span></div>' +
        (s.condicao ? '<span class="sc-cond">▸ ' + esc(s.condicao) + '</span>' : '<span class="sc-meta">' + esc(s.fase || '') + '</span>') +
        '<button class="sc-del" title="Excluir cenário" aria-label="Excluir">✕</button>';
      card.addEventListener('click', e => { if (e.target.classList.contains('sc-del')) return; selectScenario(s.id); });
      card.querySelector('.sc-del').addEventListener('click', e => { e.stopPropagation(); deleteScenario(s.id); });
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/scene', s.id); dragSceneId._id = s.id; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); clearDropHints(); });
      card.addEventListener('dragover', e => {
        if (!Array.from(e.dataTransfer.types).includes('text/scene')) return;
        if (dragSceneId._id === s.id) return;
        e.preventDefault(); clearDropHints();
        card.classList.add(e.offsetX < card.offsetWidth / 2 ? 'drop-before' : 'drop-after');
      });
      card.addEventListener('drop', e => {
        if (!Array.from(e.dataTransfer.types).includes('text/scene')) return;
        e.preventDefault();
        const id = dragSceneId._id; if (!id || id === s.id) return;
        reorderScenario(id, s.id, e.offsetX < card.offsetWidth / 2);
      });
      rail.appendChild(card);
    });
    const active = rail.querySelector('.scene.active');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function dragSceneId() {}  // guarda o id em ._id (getData não funciona no dragover)
  function clearDropHints() { rail.querySelectorAll('.drop-before,.drop-after').forEach(c => c.classList.remove('drop-before', 'drop-after')); }

  function selectScenario(id) {
    if (id === state.currentId) return;
    hidePopover();
    state.currentId = id;
    renderRail(); loadScenarioIntoUI(); renderTokens(); renderSidebar();
    if (state.present) updatePresentUI();
    saveProject();
  }
  function loadScenarioIntoUI() { const s = cur(); if (!s) return; nameInput.value = s.nome || ''; condInput.value = s.condicao || ''; noteInput.value = s.nota || ''; }
  function insertAfterCurrent(s) { const i = curIndex(); state.scenarios.splice(i < 0 ? state.scenarios.length : i + 1, 0, s); saveProject(); }
  function addScenarioBlank() { const s = newScenario({ fase: 'Cenário', nome: 'Cenário ' + (state.scenarios.length + 1) }); insertAfterCurrent(s); selectScenario(s.id); }
  function duplicateCurrent() {
    const s = cur();
    const copy = newScenario({ fase: s.fase, nome: s.nome, condicao: s.condicao, tokens: s.tokens.map(t => ({ pt: t.pt, xf: t.xf, yf: t.yf })), nota: s.nota });
    insertAfterCurrent(copy); selectScenario(copy.id);
  }
  function deleteScenario(id) {
    if (state.scenarios.length <= 1) { alert('É preciso ter ao menos um cenário.'); return; }
    const i = state.scenarios.findIndex(s => s.id === id); if (i < 0) return;
    if (!isPristine(state.scenarios[i]) && !confirm('Excluir o cenário "' + (state.scenarios[i].nome || '') + '"?')) return;
    state.scenarios.splice(i, 1);
    if (state.currentId === id) state.currentId = state.scenarios[Math.max(0, i - 1)].id;
    renderRail(); loadScenarioIntoUI(); renderTokens(); renderSidebar(); saveProject();
  }
  function reorderScenario(dragId, targetId, before) {
    const from = state.scenarios.findIndex(s => s.id === dragId); if (from < 0) return;
    const [moved] = state.scenarios.splice(from, 1);
    let to = state.scenarios.findIndex(s => s.id === targetId);
    if (to < 0) state.scenarios.push(moved); else state.scenarios.splice(before ? to : to + 1, 0, moved);
    renderRail(); saveProject();
  }
  function seedStandard() {
    const key = e => (e.nome || '') + '|' + (e.condicao || '');
    if (state.scenarios.length === 1 && isPristine(state.scenarios[0])) state.scenarios = [];
    const have = new Set(state.scenarios.map(key));
    CFG.fasesPadrao.forEach(f => { if (!have.has(key(f))) state.scenarios.push(newScenario({ fase: f.fase, nome: f.nome, condicao: f.condicao })); });
    if (!state.currentId || !cur()) state.currentId = state.scenarios[0].id;
    state.currentId = state.scenarios[0].id;
    renderRail(); loadScenarioIntoUI(); renderTokens(); renderSidebar(); saveProject();
  }
  function syncCard() {
    const s = cur(), card = rail.querySelector('.scene.active'); if (!card) return;
    card.querySelector('.sc-name').textContent = s.nome || 'Cenário';
    const condEl = card.querySelector('.sc-cond'), metaEl = card.querySelector('.sc-meta');
    if (s.condicao) {
      if (condEl) condEl.textContent = '▸ ' + s.condicao;
      else { const el = document.createElement('span'); el.className = 'sc-cond'; el.textContent = '▸ ' + s.condicao; (metaEl || card).replaceWith ? (metaEl ? metaEl.replaceWith(el) : card.appendChild(el)) : card.appendChild(el); }
    } else if (condEl) { const el = document.createElement('span'); el.className = 'sc-meta'; el.textContent = s.fase || ''; condEl.replaceWith(el); }
  }

  // ---------------------------------------------------------------------------
  // Apresentação
  // ---------------------------------------------------------------------------
  function enterPresent() {
    state.present = true; document.body.classList.add('present');
    presentBtn.style.display = 'none'; exitBtn.style.display = ''; hidePopover();
    renderTokens(); updatePresentUI();
    try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) {}
    setTimeout(fit, 60);
  }
  function exitPresent() {
    state.present = false; document.body.classList.remove('present');
    presentBtn.style.display = ''; exitBtn.style.display = 'none';
    renderTokens();
    try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {}
    setTimeout(fit, 60);
  }
  function updatePresentUI() {
    const s = cur(); if (!s) return;
    const i = curIndex(), n = state.scenarios.length;
    pbTitle.textContent = s.nome || 'Cenário';
    if (s.condicao) { pbCond.hidden = false; pbCond.textContent = s.condicao; } else pbCond.hidden = true;
    pbProg.textContent = (i + 1) + ' / ' + n;
    pnPhase.textContent = s.fase || s.nome || 'Fase';
    if (s.condicao) { pnBadge.hidden = false; pnBadge.textContent = s.condicao; } else pnBadge.hidden = true;
    const nota = (s.nota || '').trim();
    pnText.textContent = nota || 'Sem nota neste cenário.'; pnText.classList.toggle('empty', !nota);
    prevBtn.disabled = i <= 0; nextBtn.disabled = i >= n - 1;
  }
  function go(delta) { const j = curIndex() + delta; if (j < 0 || j >= state.scenarios.length) return; selectScenario(state.scenarios[j].id); }

  // ---------------------------------------------------------------------------
  // ROSTER — parse
  // ---------------------------------------------------------------------------
  function mapClass(c) { return CFG.classMap[c] || 'DPS'; }
  function normalizeRole(t) {
    t = (t || '').toLowerCase();
    if (/tank|tanque/.test(t)) return 'Tank';
    if (/heal|cura/.test(t)) return 'Healer';
    if (/supp|debuff|suporte/.test(t)) return 'Support';
    return 'DPS';
  }
  function parseRoster(text) {
    text = (text || '').trim();
    if (!text) return [];
    if (text[0] === '{' || text[0] === '[') {
      try {
        const d = JSON.parse(text);
        const arr = Array.isArray(d) ? d : d.signUps;
        if (Array.isArray(arr)) return parseRaidHelper(arr);
      } catch (e) { /* não é JSON válido — cai no parser de texto */ }
    }
    return parseLines(text);
  }
  function parseRaidHelper(signUps) {
    const out = [];
    signUps.forEach(s => {
      const cls = s.className || s.cClassName || '';
      let status = 'primary', ausente = false, reserva = false, classe = cls, funcao = 'DPS';
      if (/^absence$/i.test(cls)) { status = 'absence'; ausente = true; classe = 'Absence'; }
      else if (/^bench$/i.test(cls)) { status = 'bench'; reserva = true; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); }
      else if (/^late$/i.test(cls)) { status = 'late'; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); }
      else if (/^tentative$/i.test(cls)) { status = 'tentative'; reserva = true; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); }
      else { status = 'primary'; classe = cls; funcao = mapClass(cls); }
      out.push({ id: uid(), nome: s.name || '—', classe, funcao, status, ausente, reserva, pt: null, nota: s.note || '' });
    });
    // ordena: disponíveis (por função) -> reservas -> ausentes
    const rank = p => (p.ausente ? 3 : p.reserva ? 2 : 1);
    const forder = f => ({ Tank: 0, Healer: 1, DPS: 2, Support: 3 }[f] ?? 4);
    out.sort((a, b) => rank(a) - rank(b) || forder(a.funcao) - forder(b.funcao) || a.nome.localeCompare(b.nome));
    return out;
  }
  function parseLines(text) {
    const out = [];
    text.split(/\n+/).forEach(line => {
      const m = line.match(/^\s*(PT\s?\d+|reservas?|bench|banco|sem\s?pt)\s*[—:\-–]\s*(.+)$/i);
      if (!m) return;
      const reserva = /reserv|bench|banco/i.test(m[1]);
      const ptm = m[1].match(/PT\s?(\d+)/i);
      const pt = ptm ? 'PT' + ptm[1] : null;
      m[2].split(/[,;]+/).forEach(part => {
        part = part.trim(); if (!part) return;
        const mm = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
        const nome = (mm ? mm[1] : part).trim();
        const funcao = normalizeRole(mm ? mm[2] : '');
        if (nome) out.push({ id: uid(), nome, classe: funcao, funcao, status: reserva ? 'bench' : 'primary', ausente: false, reserva, pt: pt && PT_IDS.includes(pt) ? pt : null, nota: '' });
      });
    });
    return out;
  }

  // ---------------------------------------------------------------------------
  // ROSTER — modal
  // ---------------------------------------------------------------------------
  function openRoster() {
    rosterDraft = state.roster.map(p => Object.assign({}, p));
    rosterPaste.value = '';
    parseMsg.textContent = ''; parseMsg.className = 'parse-msg';
    saveMsg.textContent = '';
    renderGrid();
    rosterModal.hidden = false;
  }
  function closeRoster() { rosterModal.hidden = true; }
  function renderGrid() {
    const aus = rosterDraft.filter(p => p.ausente).length;
    const res = rosterDraft.filter(p => p.reserva && !p.ausente).length;
    const esc_ = rosterDraft.filter(p => !p.ausente && !p.reserva).length;
    gEsc.textContent = esc_; gRes.textContent = res; gAus.textContent = aus;
    const c = { Tank: 0, Healer: 0, DPS: 0, Support: 0 };
    rosterDraft.filter(p => !p.ausente && !p.reserva).forEach(p => c[p.funcao] = (c[p.funcao] || 0) + 1);
    gComp.innerHTML = CFG.roleOrder.filter(f => c[f]).map(f => '<b style="color:' + roleColor(f) + '">' + c[f] + '</b> ' + f).join(' · ');

    let html = '<div class="rrow head"><span>Jogador</span><span>Função</span><span>PT</span><span>Res.</span><span></span></div>';
    if (!rosterDraft.length) html += '<div style="padding:22px 6px;color:#9aa2b4;font-size:12.5px">Nenhum jogador ainda. Cole a montagem à esquerda e clique <b>Processar</b>.</div>';
    rosterDraft.forEach((p, i) => {
      const opts = ['Tank', 'DPS', 'Healer', 'Support'].map(f => '<option value="' + f + '"' + (p.funcao === f ? ' selected' : '') + '>' + f + '</option>').join('');
      const ptopts = '<option value="">—</option>' + PT_IDS.map(id => '<option value="' + id + '"' + (p.pt === id ? ' selected' : '') + '>' + id + '</option>').join('');
      html += '<div class="rrow' + (p.ausente ? ' absence' : '') + '" data-i="' + i + '">' +
        '<div class="rn"><span class="rl" style="background:' + roleColor(p.funcao) + (p.ausente ? ';opacity:.4' : '') + '"></span>' +
        '<span class="nm">' + esc(p.nome) + '</span><span class="cl">' + esc(p.ausente ? 'ausente' : p.classe) + '</span></div>' +
        '<select class="f-fn"' + (p.ausente ? ' disabled' : '') + '>' + opts + '</select>' +
        '<select class="f-pt"' + (p.ausente ? ' disabled' : '') + '>' + ptopts + '</select>' +
        '<div class="res"><input type="checkbox" class="f-res"' + (p.reserva ? ' checked' : '') + (p.ausente ? ' disabled' : '') + '></div>' +
        '<button class="rdel" title="Remover">✕</button></div>';
    });
    rosterGrid.innerHTML = html;
  }
  function autoAssign() {
    const avail = rosterDraft.filter(p => !p.ausente && !p.reserva);
    avail.forEach(p => p.pt = null);
    if (!avail.length) { renderGrid(); return; }
    const nPT = Math.max(1, Math.min(CFG.parties.length, Math.ceil(avail.length / CFG.ptSize)));
    const buckets = Array.from({ length: nPT }, () => []);
    const by = f => avail.filter(p => p.funcao === f);
    let bi = 0;
    const deal = list => list.forEach(p => { buckets[bi % nPT].push(p); bi++; });
    bi = 0; deal(by('Tank'));
    bi = 0; deal(by('Healer'));
    bi = 0; deal(avail.filter(p => p.funcao === 'DPS' || p.funcao === 'Support'));
    buckets.forEach((b, k) => b.forEach(p => p.pt = PT_IDS[k]));
    renderGrid();
  }

  // ---------------------------------------------------------------------------
  // Eventos
  // ---------------------------------------------------------------------------
  function wireEvents() {
    const cont = stage.container();
    ['dragenter', 'dragover'].forEach(evt => cont.addEventListener(evt, e => {
      if (state.present) return;
      if (!Array.from(e.dataTransfer.types).includes('text/plain')) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; mapPanel.classList.add('dragover');
    }));
    ['dragleave', 'dragend'].forEach(evt => cont.addEventListener(evt, () => mapPanel.classList.remove('dragover')));
    cont.addEventListener('drop', e => {
      e.preventDefault(); mapPanel.classList.remove('dragover');
      if (state.present) return;
      const pt = e.dataTransfer.getData('text/plain'); if (!pt) return;
      stage.setPointersPositions(e);
      const pos = stage.getPointerPosition() || { x: W / 2, y: H / 2 };
      placeToken(pt, pos.x / W, pos.y / H);
    });
    // clique em área vazia do mapa fecha o popover
    stage.on('click tap', e => { if (e.target === stage || e.target === bgImage) hidePopover(); });

    objToggle.addEventListener('change', () => { state.objectivesOn = objToggle.checked; applyObjectivesUI(); saveProject(); });
    nameInput.addEventListener('input', () => { cur().nome = nameInput.value; syncCard(); saveProject(); });
    condInput.addEventListener('input', () => { cur().condicao = condInput.value.trim() || null; syncCard(); saveProject(); });
    noteInput.addEventListener('input', () => { cur().nota = noteInput.value; saveProject(); });
    addScene.addEventListener('click', addScenarioBlank);
    dupScene.addEventListener('click', duplicateCurrent);
    seedBtn.addEventListener('click', () => {
      if (state.scenarios.some(s => !isPristine(s)) && !confirm('Adicionar os cenários das fases padrão ao projeto?')) return;
      seedStandard();
    });
    presentBtn.addEventListener('click', enterPresent);
    exitBtn.addEventListener('click', exitPresent);
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));
    document.addEventListener('keydown', e => {
      if (!rosterModal.hidden && e.key === 'Escape') { closeRoster(); return; }
      if (!state.present) return;
      if (e.key === 'Escape') exitPresent();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && state.present) exitPresent(); });

    // modal roster
    rosterBtn.addEventListener('click', openRoster);
    editRosterBtn.addEventListener('click', openRoster);
    rosterClose.addEventListener('click', closeRoster);
    rosterModal.addEventListener('click', e => { if (e.target === rosterModal) closeRoster(); });
    parseBtn.addEventListener('click', () => {
      const parsed = parseRoster(rosterPaste.value);
      if (!parsed.length) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = 'Não reconheci jogadores. Confira o formato.'; return; }
      rosterDraft = parsed;
      parseMsg.className = 'parse-msg ok';
      parseMsg.textContent = parsed.length + ' jogadores reconhecidos.';
      renderGrid();
    });
    autoBtn.addEventListener('click', autoAssign);
    rosterClear2.addEventListener('click', () => { if (confirm('Limpar todos os jogadores?')) { rosterDraft = []; renderGrid(); } });
    rosterGrid.addEventListener('change', e => {
      const row = e.target.closest('.rrow'); if (!row) return;
      const p = rosterDraft[+row.dataset.i]; if (!p) return;
      if (e.target.classList.contains('f-fn')) p.funcao = e.target.value;
      else if (e.target.classList.contains('f-pt')) p.pt = e.target.value || null;
      else if (e.target.classList.contains('f-res')) { p.reserva = e.target.checked; }
      renderGrid();
    });
    rosterGrid.addEventListener('click', e => {
      if (!e.target.classList.contains('rdel')) return;
      const row = e.target.closest('.rrow'); if (!row) return;
      rosterDraft.splice(+row.dataset.i, 1); renderGrid();
    });
    rosterSave.addEventListener('click', () => {
      state.roster = rosterDraft.map(p => Object.assign({}, p));
      saveProject(); renderSidebar(); renderTokens();
      saveMsg.className = 'parse-msg ok'; saveMsg.textContent = 'Roster salvo ✓';
      setTimeout(closeRoster, 500);
    });

    let raf = null;
    const relayout = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    new ResizeObserver(relayout).observe(mapPanel);
    window.addEventListener('resize', relayout);
  }

  // ---------------------------------------------------------------------------
  // Persistência
  // ---------------------------------------------------------------------------
  function saveProject() {
    try {
      localStorage.setItem(CFG.projectKey, JSON.stringify({
        v: 2, objectivesOn: state.objectivesOn, currentId: state.currentId,
        scenarios: state.scenarios, roster: state.roster,
      }));
    } catch (e) {}
  }
  function loadProject() {
    try {
      const raw = localStorage.getItem(CFG.projectKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.scenarios) && d.scenarios.length) {
          state.scenarios = d.scenarios.map(sanitizeScenario);
          state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id;
          if (typeof d.objectivesOn === 'boolean') state.objectivesOn = d.objectivesOn;
          if (Array.isArray(d.roster)) state.roster = d.roster.map(sanitizePlayer);
          return;
        }
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem(CFG.storageKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.objectivesOn === 'boolean') state.objectivesOn = d.objectivesOn;
        const toks = Array.isArray(d.tokens) ? d.tokens.filter(t => partyById.has(t.pt)).map(t => ({ pt: t.pt, xf: clamp01(t.xf), yf: clamp01(t.yf) })) : [];
        const s = newScenario({ fase: 'Start', nome: 'Start (30m)', tokens: toks });
        state.scenarios = [s]; state.currentId = s.id; return;
      }
    } catch (e) {}
    const s = newScenario({ fase: 'Start', nome: 'Start (30m)' });
    state.scenarios = [s]; state.currentId = s.id;
  }
  function sanitizeScenario(s) {
    return { id: s.id || uid(), fase: s.fase || 'Cenário', nome: s.nome || 'Cenário', condicao: s.condicao || null,
      tokens: Array.isArray(s.tokens) ? s.tokens.filter(t => partyById.has(t.pt)).map(t => ({ pt: t.pt, xf: clamp01(t.xf), yf: clamp01(t.yf) })) : [],
      desenhos: Array.isArray(s.desenhos) ? s.desenhos : [], nota: typeof s.nota === 'string' ? s.nota : '' };
  }
  function sanitizePlayer(p) {
    const funcao = ['Tank', 'DPS', 'Healer', 'Support'].includes(p.funcao) ? p.funcao : 'DPS';
    return { id: p.id || uid(), nome: String(p.nome || '—'), classe: String(p.classe || funcao), funcao,
      status: p.status || 'primary', ausente: !!p.ausente, reserva: !!p.reserva,
      pt: PT_IDS.includes(p.pt) ? p.pt : null, nota: typeof p.nota === 'string' ? p.nota : '' };
  }
})();
