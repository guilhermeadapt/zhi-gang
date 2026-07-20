/* =============================================================================
 * Zhi Guides — Mapa de Estratégia GvG (guild Wanted)
 * app.js — Etapas 1–3:
 *   (1) mapa + tokens de PT (colocar/arrastar/mover/remover)
 *   (2) CENÁRIOS: cada "foto" do mapa como cenário; criar, duplicar como base,
 *       renomear, condição, reordenar, navegar. Fases padrão do brief.
 *   (3) NOTA por cenário + MODO APRESENTAÇÃO (tela cheia, ‹ ›, teclado).
 *
 * Coordenadas dos tokens em FRAÇÃO 0–1. Assets lidos de window.WWM (config.js).
 * Projeto salvo em localStorage; export/import JSON vem numa próxima etapa.
 * ========================================================================== */
(function () {
  'use strict';

  const CFG = window.WWM;
  const NAT = CFG.mapSize;
  const AR = NAT.w / NAT.h;

  // ---- DOM ----
  const $ = id => document.getElementById(id);
  const mapPanel = $('mapPanel'), stageWrap = $('stageWrap'), mapHint = $('mapHint');
  const ptList = $('ptList'), placedCount = $('placedCount');
  const objToggle = $('objToggle'), objState = $('objState');
  const rail = $('rail'), addScene = $('addScene'), dupScene = $('dupScene'), seedBtn = $('seedBtn');
  const nameInput = $('nameInput'), condInput = $('condInput'), noteInput = $('noteInput');
  const presentBtn = $('presentBtn'), exitBtn = $('exitBtn');
  const prevBtn = $('prevBtn'), nextBtn = $('nextBtn');
  const pbTitle = $('pbTitle'), pbCond = $('pbCond'), pbProg = $('pbProg');
  const pnPhase = $('pnPhase'), pnBadge = $('pnBadge'), pnText = $('pnText');

  // ---- estado ----
  const state = {
    scenarios: [],            // [{ id, fase, nome, condicao, tokens:[{pt,xf,yf}], desenhos:[], nota }]
    currentId: null,
    objectivesOn: CFG.defaults.objectivesOn,   // preferência de exibição (global)
    present: false,
  };
  const partyById = new Map(CFG.parties.map(p => [p.id, p]));

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

  // ---------------------------------------------------------------------------
  // Helpers de cenário
  // ---------------------------------------------------------------------------
  function uid() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cur() { return state.scenarios.find(s => s.id === state.currentId) || state.scenarios[0]; }
  function curIndex() { return state.scenarios.findIndex(s => s.id === state.currentId); }
  function newScenario(over) {
    return Object.assign({ id: uid(), fase: 'Cenário', nome: 'Novo cenário', condicao: null, tokens: [], desenhos: [], nota: '' }, over || {});
  }
  function isPristine(s) { return s && (!s.tokens || s.tokens.length === 0) && !(s.nota || '').trim(); }

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
    buildRoster();
    applyObjectivesUI();
    renderRail();
    loadScenarioIntoUI();
    fit();
    wireEvents();
  }

  // ---------------------------------------------------------------------------
  // Layout responsivo
  // ---------------------------------------------------------------------------
  function fit() {
    const availW = mapPanel.clientWidth - 32;
    const availH = mapPanel.clientHeight - 32;
    if (availW <= 0 || availH <= 0) return;
    let w = availW, h = w / AR;
    if (h > availH) { h = availH; w = h * AR; }
    W = Math.round(w); H = Math.round(h); R = Math.max(14, Math.round(W * 0.024));
    stage.size({ width: W, height: H });
    stageWrap.style.width = W + 'px'; stageWrap.style.height = H + 'px';
    bgImage.size({ width: W, height: H });
    bgLayer.batchDraw();
    renderTokens();
  }

  // ---------------------------------------------------------------------------
  // Objetivos (arte do mapa)
  // ---------------------------------------------------------------------------
  function applyObjectivesUI() {
    objToggle.checked = state.objectivesOn;
    objState.textContent = state.objectivesOn ? 'ON' : 'OFF';
    bgImage.image(state.objectivesOn ? imgObjectives : imgClean);
    bgLayer.batchDraw();
  }

  // ---------------------------------------------------------------------------
  // Roster (paleta de PTs)
  // ---------------------------------------------------------------------------
  function buildRoster() {
    ptList.innerHTML = '';
    CFG.parties.forEach(p => {
      const chip = document.createElement('div');
      chip.className = 'pt-chip';
      chip.style.setProperty('--accent', p.cor);
      chip.setAttribute('draggable', 'true');
      chip.dataset.pt = p.id;
      chip.innerHTML =
        '<span class="dot">' + p.id.replace('PT', '') + '</span>' +
        '<span class="lbl"><b>' + p.id + '</b><span>Party de ~5</span></span>' +
        '<span class="status">Arraste</span>';
      chip.addEventListener('dragstart', ev => {
        if (state.present) { ev.preventDefault(); return; }
        ev.dataTransfer.setData('text/plain', p.id);
        ev.dataTransfer.effectAllowed = 'copy';
      });
      ptList.appendChild(chip);
    });
    refreshChips();
  }
  function refreshChips() {
    const toks = cur() ? cur().tokens : [];
    let placed = 0;
    ptList.querySelectorAll('.pt-chip').forEach(chip => {
      const on = toks.some(t => t.pt === chip.dataset.pt);
      chip.classList.toggle('placed', on);
      chip.querySelector('.status').textContent = on ? 'No mapa' : 'Arraste';
      if (on) placed++;
    });
    placedCount.textContent = placed;
    mapHint.classList.toggle('hide', placed > 0 || state.present);
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
      fontSize: Math.round(R * 0.78), fill: p.cor, align: 'center', verticalAlign: 'middle',
      width: R * 2.4, height: R * 2, offsetX: R * 1.2, offsetY: R });
    g.add(halo, body, label);
    g.position({ x: t.xf * W, y: t.yf * H });

    if (!state.present) {
      g.dragBoundFunc(pos => ({ x: Math.max(0, Math.min(W, pos.x)), y: Math.max(0, Math.min(H, pos.y)) }));
      g.on('dragstart', () => g.moveToTop());
      g.on('dragend', () => {
        const tk = cur().tokens.find(x => x.pt === t.pt);
        if (tk) { tk.xf = clamp01(g.x() / W); tk.yf = clamp01(g.y() / H); saveProject(); }
      });
      g.on('dblclick dbltap', () => removeToken(t.pt));
      g.on('mouseenter', () => { stage.container().style.cursor = 'grab'; });
      g.on('mouseleave', () => { stage.container().style.cursor = 'default'; });
      g.on('mousedown', () => { stage.container().style.cursor = 'grabbing'; });
      g.on('mouseup', () => { stage.container().style.cursor = 'grab'; });
    }
    return g;
  }
  function renderTokens() {
    tokenLayer.destroyChildren();
    (cur() ? cur().tokens : []).forEach(t => tokenLayer.add(makeToken(t)));
    tokenLayer.batchDraw();
    refreshChips();
  }
  function placeToken(pt, xf, yf) {
    if (!partyById.has(pt) || state.present) return;
    const toks = cur().tokens;
    const ex = toks.find(t => t.pt === pt);
    if (ex) { ex.xf = clamp01(xf); ex.yf = clamp01(yf); }
    else toks.push({ pt, xf: clamp01(xf), yf: clamp01(yf) });
    renderTokens(); saveProject();
  }
  function removeToken(pt) {
    const s = cur(); s.tokens = s.tokens.filter(t => t.pt !== pt);
    renderTokens(); saveProject();
  }

  // ---------------------------------------------------------------------------
  // Trilha de cenários
  // ---------------------------------------------------------------------------
  function renderRail() {
    rail.innerHTML = '';
    state.scenarios.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'scene' + (s.id === state.currentId ? ' active' : '');
      card.dataset.id = s.id;
      card.setAttribute('draggable', 'true');
      card.innerHTML =
        '<div class="sc-top"><span class="sc-idx">' + (i + 1) + '</span>' +
        '<span class="sc-name">' + escapeHtml(s.nome || 'Cenário') + '</span></div>' +
        (s.condicao ? '<span class="sc-cond">▸ ' + escapeHtml(s.condicao) + '</span>' : '<span class="sc-meta">' + escapeHtml(s.fase || '') + '</span>') +
        '<button class="sc-del" title="Excluir cenário" aria-label="Excluir">✕</button>';

      card.addEventListener('click', e => {
        if (e.target.classList.contains('sc-del')) return;
        selectScenario(s.id);
      });
      card.querySelector('.sc-del').addEventListener('click', e => { e.stopPropagation(); deleteScenario(s.id); });

      // reordenar (HTML5 DnD)
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/scene', s.id); card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); clearDropHints(); });
      card.addEventListener('dragover', e => {
        const id = dragSceneId(e); if (!id || id === s.id) return;
        e.preventDefault(); clearDropHints();
        const before = (e.offsetX < card.offsetWidth / 2);
        card.classList.add(before ? 'drop-before' : 'drop-after');
      });
      card.addEventListener('drop', e => {
        const id = dragSceneId(e); if (!id || id === s.id) return;
        e.preventDefault();
        const before = (e.offsetX < card.offsetWidth / 2);
        reorderScenario(id, s.id, before);
      });
      rail.appendChild(card);
    });
    // rola pro cenário ativo
    const active = rail.querySelector('.scene.active');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function dragSceneId(e) { return Array.from(e.dataTransfer.types).includes('text/scene') ? (dragSceneId._id || null) : null; }
  // dataTransfer.getData não funciona em dragover — guardamos o id à parte
  rail.addEventListener('dragstart', e => { dragSceneId._id = e.target.dataset ? e.target.dataset.id : null; });
  function clearDropHints() { rail.querySelectorAll('.drop-before,.drop-after').forEach(c => c.classList.remove('drop-before', 'drop-after')); }

  function selectScenario(id) {
    if (id === state.currentId) return;
    state.currentId = id;
    renderRail(); loadScenarioIntoUI(); renderTokens();
    if (state.present) updatePresentUI();
    saveProject();
  }
  function loadScenarioIntoUI() {
    const s = cur(); if (!s) return;
    nameInput.value = s.nome || '';
    condInput.value = s.condicao || '';
    noteInput.value = s.nota || '';
  }
  function addScenarioBlank() {
    const s = newScenario({ fase: 'Cenário', nome: 'Cenário ' + (state.scenarios.length + 1) });
    insertAfterCurrent(s); selectScenario(s.id);
  }
  function duplicateCurrent() {
    const s = cur();
    const copy = newScenario({
      fase: s.fase, nome: s.nome, condicao: s.condicao,
      tokens: s.tokens.map(t => ({ pt: t.pt, xf: t.xf, yf: t.yf })),
      nota: s.nota,
    });
    insertAfterCurrent(copy); selectScenario(copy.id);
  }
  function insertAfterCurrent(s) {
    const i = curIndex();
    state.scenarios.splice(i < 0 ? state.scenarios.length : i + 1, 0, s);
    saveProject();
  }
  function deleteScenario(id) {
    if (state.scenarios.length <= 1) { alert('É preciso ter ao menos um cenário.'); return; }
    const i = state.scenarios.findIndex(s => s.id === id);
    if (i < 0) return;
    if (!isPristine(state.scenarios[i]) && !confirm('Excluir o cenário "' + (state.scenarios[i].nome || '') + '"?')) return;
    state.scenarios.splice(i, 1);
    if (state.currentId === id) state.currentId = state.scenarios[Math.max(0, i - 1)].id;
    renderRail(); loadScenarioIntoUI(); renderTokens(); saveProject();
  }
  function reorderScenario(dragId, targetId, before) {
    const from = state.scenarios.findIndex(s => s.id === dragId);
    if (from < 0) return;
    const [moved] = state.scenarios.splice(from, 1);
    let to = state.scenarios.findIndex(s => s.id === targetId);
    if (to < 0) { state.scenarios.push(moved); }
    else state.scenarios.splice(before ? to : to + 1, 0, moved);
    renderRail(); saveProject();
  }
  function seedStandard() {
    const key = e => (e.nome || '') + '|' + (e.condicao || '');
    // se o projeto tem só um cenário "em branco", começa do zero
    if (state.scenarios.length === 1 && isPristine(state.scenarios[0])) state.scenarios = [];
    const have = new Set(state.scenarios.map(key));
    let added = 0, firstId = null;
    CFG.fasesPadrao.forEach(f => {
      if (have.has(key(f))) return;
      const s = newScenario({ fase: f.fase, nome: f.nome, condicao: f.condicao });
      state.scenarios.push(s); added++; if (!firstId) firstId = s.id;
    });
    if (!state.currentId || !cur()) state.currentId = state.scenarios[0].id;
    if (firstId && added) state.currentId = state.scenarios[0].id;
    renderRail(); loadScenarioIntoUI(); renderTokens(); saveProject();
  }

  // ---------------------------------------------------------------------------
  // Modo apresentação
  // ---------------------------------------------------------------------------
  function enterPresent() {
    state.present = true;
    document.body.classList.add('present');
    presentBtn.style.display = 'none';
    exitBtn.style.display = '';
    renderTokens();            // recria sem draggable
    updatePresentUI();
    try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) {}
    setTimeout(fit, 60);
  }
  function exitPresent() {
    state.present = false;
    document.body.classList.remove('present');
    presentBtn.style.display = '';
    exitBtn.style.display = 'none';
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
    pnText.textContent = nota || 'Sem nota neste cenário.';
    pnText.classList.toggle('empty', !nota);
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= n - 1;
  }
  function go(delta) {
    const i = curIndex(), j = i + delta;
    if (j < 0 || j >= state.scenarios.length) return;
    selectScenario(state.scenarios[j].id);
  }

  // ---------------------------------------------------------------------------
  // Eventos
  // ---------------------------------------------------------------------------
  function wireEvents() {
    const cont = stage.container();
    ['dragenter', 'dragover'].forEach(evt => cont.addEventListener(evt, e => {
      if (state.present) return;
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

    objToggle.addEventListener('change', () => { state.objectivesOn = objToggle.checked; applyObjectivesUI(); saveProject(); });

    // edição do cenário atual
    nameInput.addEventListener('input', () => { cur().nome = nameInput.value; syncCard(); saveProject(); });
    condInput.addEventListener('input', () => { cur().condicao = condInput.value.trim() || null; syncCard(); saveProject(); });
    noteInput.addEventListener('input', () => { cur().nota = noteInput.value; saveProject(); });

    addScene.addEventListener('click', addScenarioBlank);
    dupScene.addEventListener('click', duplicateCurrent);
    seedBtn.addEventListener('click', () => {
      const has = state.scenarios.some(s => !isPristine(s));
      if (has && !confirm('Adicionar os cenários das fases padrão ao projeto?')) return;
      seedStandard();
    });

    presentBtn.addEventListener('click', enterPresent);
    exitBtn.addEventListener('click', exitPresent);
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    document.addEventListener('keydown', e => {
      if (!state.present) return;
      if (e.key === 'Escape') exitPresent();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && state.present) exitPresent(); });

    let raf = null;
    const relayout = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    new ResizeObserver(relayout).observe(mapPanel);
    window.addEventListener('resize', relayout);
  }
  // atualiza só o card ativo da trilha sem re-render completo (mais suave ao digitar)
  function syncCard() {
    const s = cur();
    const card = rail.querySelector('.scene.active'); if (!card) return;
    card.querySelector('.sc-name').textContent = s.nome || 'Cenário';
    const condEl = card.querySelector('.sc-cond'), metaEl = card.querySelector('.sc-meta');
    if (s.condicao) {
      if (condEl) condEl.textContent = '▸ ' + s.condicao;
      else { const el = document.createElement('span'); el.className = 'sc-cond'; el.textContent = '▸ ' + s.condicao; if (metaEl) metaEl.replaceWith(el); else card.appendChild(el); }
    } else if (condEl) {
      const el = document.createElement('span'); el.className = 'sc-meta'; el.textContent = s.fase || ''; condEl.replaceWith(el);
    }
  }

  // ---------------------------------------------------------------------------
  // Persistência
  // ---------------------------------------------------------------------------
  function saveProject() {
    try {
      localStorage.setItem(CFG.projectKey, JSON.stringify({
        v: 1, objectivesOn: state.objectivesOn, currentId: state.currentId,
        scenarios: state.scenarios,
      }));
    } catch (e) {}
  }
  function loadProject() {
    // 1) projeto novo
    try {
      const raw = localStorage.getItem(CFG.projectKey);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.scenarios) && d.scenarios.length) {
          state.scenarios = d.scenarios.map(sanitizeScenario);
          state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id;
          if (typeof d.objectivesOn === 'boolean') state.objectivesOn = d.objectivesOn;
          return;
        }
      }
    } catch (e) {}
    // 2) migração do rascunho da etapa 1 (board único)
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
    // 3) projeto novo em branco
    const s = newScenario({ fase: 'Start', nome: 'Start (30m)' });
    state.scenarios = [s]; state.currentId = s.id;
  }
  function sanitizeScenario(s) {
    return {
      id: s.id || uid(), fase: s.fase || 'Cenário', nome: s.nome || 'Cenário',
      condicao: s.condicao || null,
      tokens: Array.isArray(s.tokens) ? s.tokens.filter(t => partyById.has(t.pt)).map(t => ({ pt: t.pt, xf: clamp01(t.xf), yf: clamp01(t.yf) })) : [],
      desenhos: Array.isArray(s.desenhos) ? s.desenhos : [],
      nota: typeof s.nota === 'string' ? s.nota : '',
    };
  }

  // ---- util ----
  function clamp01(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
})();
