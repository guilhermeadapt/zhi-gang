/* =============================================================================
 * Zhi Guides — Mapa de Estratégia GvG (guild Wanted)
 * app.js — Etapas 1–6:
 *   1 mapa + tokens de PT   2 cenários (árvore de fases)   3 nota + apresentação
 *   4 DESENHO (seta/linha/livre/área, cor, espessura, undo/redo)
 *   4b OBJETIVOS up/down por cenário (ícones arrastáveis)
 *   4c DESTACAR membro de uma PT (token menor ligado por traço à PT)
 *   5 roster (parse raid-helper)   6 export/import JSON
 *
 * 6 PTs no máximo — PT1–3 Ataque, PT4–6 Defesa. Coordenadas em fração 0–1.
 * ========================================================================== */
(function () {
  'use strict';

  const CFG = window.WWM;
  const NAT = CFG.mapSize;
  const AR = NAT.w / NAT.h;
  const PT_IDS = CFG.parties.map(p => p.id);

  const $ = id => document.getElementById(id);
  const mapPanel = $('mapPanel'), stageWrap = $('stageWrap'), mapHint = $('mapHint'), ptPopover = $('ptPopover');
  const ptList = $('ptList');
  const rail = $('rail'), addScene = $('addScene'), dupScene = $('dupScene'), seedBtn = $('seedBtn');
  const nameInput = $('nameInput'), condInput = $('condInput'), noteInput = $('noteInput');
  const presentBtn = $('presentBtn'), exitBtn = $('exitBtn'), prevBtn = $('prevBtn'), nextBtn = $('nextBtn');
  const pbTitle = $('pbTitle'), pbCond = $('pbCond'), pbProg = $('pbProg');
  const pnPhase = $('pnPhase'), pnBadge = $('pnBadge'), pnText = $('pnText');
  const sumEsc = $('sumEsc'), sumRes = $('sumRes'), sumAus = $('sumAus');
  const rosterBtn = $('rosterBtn'), editRosterBtn = $('editRosterBtn'), rosterModal = $('rosterModal'), rosterClose = $('rosterClose');
  const rosterPaste = $('rosterPaste'), parseBtn = $('parseBtn'), parseMsg = $('parseMsg'), autoBtn = $('autoBtn');
  const rosterGrid = $('rosterGrid'), gEsc = $('gEsc'), gRes = $('gRes'), gAus = $('gAus'), gComp = $('gComp');
  const rosterSave = $('rosterSave'), rosterClear2 = $('rosterClear2'), saveMsg = $('saveMsg');
  const exportBtn = $('exportBtn'), importBtn = $('importBtn'), importFile = $('importFile'), shareBtn = $('shareBtn'), toastEl = $('toast');
  const drawTools = $('drawTools'), dtColors = $('dtColors'), dtWidth = $('dtWidth');
  const undoBtn = $('undoBtn'), redoBtn = $('redoBtn'), clearDraw = $('clearDraw');
  const objBtn = $('objBtn'), objPanel = $('objPanel'), objClose = $('objClose'), objGroups = $('objGroups');

  const state = {
    scenarios: [], currentId: null,
    roster: [], objetivoPos: {},
    tool: 'select', drawColor: CFG.drawColors[0], drawWidth: CFG.drawWidths[1],
    present: false,
  };
  const partyById = new Map(CFG.parties.map(p => [p.id, p]));
  const objById = new Map(CFG.objetivos.map(o => [o.id, o]));
  let popoverPt = null, rosterDraft = [];
  const undoStacks = {}, redoStacks = {};

  // ---- Konva ----
  const stage = new Konva.Stage({ container: 'stage', width: 10, height: 10 });
  const bgLayer = new Konva.Layer({ listening: false });
  const drawLayer = new Konva.Layer({ listening: false });
  const objLayer = new Konva.Layer();
  const tokenLayer = new Konva.Layer();
  stage.add(bgLayer, drawLayer, objLayer, tokenLayer);
  const bgImage = new Konva.Image({ x: 0, y: 0 });
  bgLayer.add(bgImage);
  let W = 10, H = 10, R = 20;

  const mapImg = new Image();
  const iconImgs = {};
  const iconKeys = Object.keys(CFG.assets.icons);

  // ---- helpers ----
  function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cur() { return state.scenarios.find(s => s.id === state.currentId) || state.scenarios[0]; }
  function curIndex() { return state.scenarios.findIndex(s => s.id === state.currentId); }
  function newScenario(over) { return Object.assign({ id: uid(), fase: 'Cenário', nome: 'Novo cenário', condicao: null, tokens: [], desenhos: [], objetivos: {}, destacados: [], nota: '' }, over || {}); }
  function isPristine(s) { return s && !(s.tokens || []).length && !(s.desenhos || []).length && !(s.nota || '').trim() && !Object.keys(s.objetivos || {}).length; }
  function clamp01(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function roleColor(f) { return CFG.roleColors[f] || CFG.roleColors.DPS; }
  function hexA(hex, a) { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; const n = parseInt(m[1], 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  let ready = 0; const need = 1 + iconKeys.length;
  function done() { if (++ready === need) init(); }
  mapImg.onload = mapImg.onerror = done; mapImg.src = CFG.assets.map;
  iconKeys.forEach(k => { const im = new Image(); iconImgs[k] = im; im.onload = im.onerror = done; im.src = CFG.assets.icons[k]; });

  function init() {
    loadProject();
    bgImage.image(mapImg); bgLayer.batchDraw();
    buildColorSwatches();
    renderSidebar(); renderRail(); loadScenarioIntoUI();
    fit(); wireEvents();
    maybeLoadShared();
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  function fit() {
    const availW = mapPanel.clientWidth - 20, availH = mapPanel.clientHeight - 20;
    if (availW <= 0 || availH <= 0) return;
    let w = availW, h = w / AR;
    if (h > availH) { h = availH; w = h * AR; }
    W = Math.round(w); H = Math.round(h); R = Math.max(13, Math.round(W * 0.022));
    stage.size({ width: W, height: H });
    stageWrap.style.width = W + 'px'; stageWrap.style.height = H + 'px';
    bgImage.size({ width: W, height: H }); bgLayer.batchDraw();
    hidePopover(); renderDrawings(); renderObjectives(); renderTokens();
  }

  // ---------------------------------------------------------------------------
  // Roster helpers + Sidebar (Ataque / Defesa)
  // ---------------------------------------------------------------------------
  function membersOf(pt, reserva) { return state.roster.filter(p => p.pt === pt && !p.ausente && !!p.reserva === reserva); }
  function compCounts(pt) { const c = { Tank: 0, Healer: 0, DPS: 0, Support: 0 }; membersOf(pt, false).forEach(p => c[p.funcao]++); return c; }

  function renderSidebar() {
    sumAus.textContent = state.roster.filter(p => p.ausente).length;
    sumRes.textContent = state.roster.filter(p => p.reserva && !p.ausente).length;
    sumEsc.textContent = state.roster.filter(p => !p.ausente && !p.reserva && p.pt).length;
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.innerHTML = '';
    CFG.grupos.forEach(g => {
      const gh = document.createElement('div');
      gh.className = 'grp-h ' + (g.nome === 'Ataque' ? 'atk' : 'def');
      gh.innerHTML = '<span class="gn">' + g.nome + '</span><span class="gh">' + g.hint + '</span><span class="gline"></span>';
      ptList.appendChild(gh);
      g.pts.forEach(pid => {
        const p = partyById.get(pid); if (!p) return;
        const c = compCounts(pid), total = c.Tank + c.Healer + c.DPS + c.Support, resN = membersOf(pid, true).length;
        const dots = CFG.roleOrder.filter(f => c[f]).map(f => '<span class="cd"><i style="background:' + roleColor(f) + '"></i>' + c[f] + '</span>').join('');
        const compHtml = total ? dots + (resN ? '<span class="cd" style="color:#9aa2b4">+' + resN + ' res</span>' : '') : 'sem membros';
        const chip = document.createElement('div');
        chip.className = 'pt-chip' + (placed.includes(pid) ? ' placed' : '');
        chip.style.setProperty('--accent', p.cor);
        chip.setAttribute('draggable', 'true'); chip.dataset.pt = pid;
        chip.innerHTML = '<span class="dot">' + pid.replace('PT', '') + '</span>' +
          '<span class="lbl"><b>' + pid + '</b><span class="comp' + (total ? '' : ' vazia') + '">' + compHtml + '</span></span>' +
          '<span class="status">' + (placed.includes(pid) ? 'No mapa' : 'Arraste') + '</span>';
        chip.addEventListener('dragstart', ev => { if (state.present) { ev.preventDefault(); return; } ev.dataTransfer.setData('text/plain', pid); ev.dataTransfer.effectAllowed = 'copy'; });
        ptList.appendChild(chip);
      });
    });
  }
  function syncPlacedChips() {
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.querySelectorAll('.pt-chip').forEach(chip => {
      const on = placed.includes(chip.dataset.pt);
      chip.classList.toggle('placed', on);
      chip.querySelector('.status').textContent = on ? 'No mapa' : 'Arraste';
    });
  }

  // ---------------------------------------------------------------------------
  // Tokens de PT + membros destacados + conectores
  // ---------------------------------------------------------------------------
  function makePtToken(t) {
    const p = partyById.get(t.pt);
    const g = new Konva.Group({ draggable: !state.present, name: 'pt-' + t.pt });
    g.add(new Konva.Circle({ radius: R + 4, fill: p.cor, opacity: 0.22 }));
    g.add(new Konva.Circle({ radius: R, fill: '#0b0e15', stroke: p.cor, strokeWidth: Math.max(2, R * 0.12), shadowColor: '#000', shadowBlur: 10, shadowOpacity: 0.5, shadowOffsetY: 3 }));
    g.add(new Konva.Text({ text: t.pt, fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.round(R * 0.72), fill: p.cor, align: 'center', verticalAlign: 'middle', width: R * 2.4, height: R * 1.4, offsetX: R * 1.2, offsetY: R * 0.7 }));
    const n = membersOf(t.pt, false).length;
    if (n) { const b = new Konva.Label({ x: R * 0.72, y: R * 0.72 }); b.add(new Konva.Tag({ fill: p.cor, cornerRadius: R * 0.5 })); b.add(new Konva.Text({ text: String(n), fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.round(R * 0.6), fill: '#0a0c11', padding: Math.max(2, R * 0.18) })); g.add(b); }
    g.position({ x: t.xf * W, y: t.yf * H });
    g.on('click tap', e => { e.cancelBubble = true; togglePopover(t.pt, g.x(), g.y()); });
    if (!state.present) {
      g.dragBoundFunc(pos => ({ x: Math.max(0, Math.min(W, pos.x)), y: Math.max(0, Math.min(H, pos.y)) }));
      g.on('dragstart', () => { hidePopover(); g.moveToTop(); });
      g.on('dragmove', updateConnectors);
      g.on('dragend', () => { const tk = cur().tokens.find(x => x.pt === t.pt); if (tk) { tk.xf = clamp01(g.x() / W); tk.yf = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => removeToken(t.pt));
      g.on('mouseenter', () => stage.container().style.cursor = 'grab');
      g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
    }
    return g;
  }
  function makeMemberToken(d) {
    const p = partyById.get(d.pt);
    const rm = Math.max(9, R * 0.6);
    const g = new Konva.Group({ draggable: !state.present, id: 'mem-' + d.id });
    g.add(new Konva.Circle({ radius: rm, fill: '#0b0e15', stroke: p.cor, strokeWidth: Math.max(1.5, rm * 0.16), shadowColor: '#000', shadowBlur: 6, shadowOpacity: 0.5, shadowOffsetY: 2 }));
    g.add(new Konva.Circle({ radius: rm * 0.4, fill: roleColor(d.funcao) }));
    const lbl = new Konva.Label({ x: rm + 4, y: -rm * 0.5 });
    lbl.add(new Konva.Tag({ fill: 'rgba(10,12,17,.86)', stroke: p.cor, strokeWidth: 1, cornerRadius: 4 }));
    lbl.add(new Konva.Text({ text: d.nome, fontFamily: 'Oswald, sans-serif', fontStyle: '600', fontSize: Math.max(9, R * 0.42), fill: '#EDEBE4', padding: 3 }));
    g.add(lbl);
    g.position({ x: d.xf * W, y: d.yf * H });
    if (!state.present) {
      g.dragBoundFunc(pos => ({ x: Math.max(0, Math.min(W, pos.x)), y: Math.max(0, Math.min(H, pos.y)) }));
      g.on('dragmove', updateConnectors);
      g.on('dragend', () => { const dd = cur().destacados.find(x => x.id === d.id); if (dd) { dd.xf = clamp01(g.x() / W); dd.yf = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => { cur().destacados = cur().destacados.filter(x => x.id !== d.id); renderTokens(); saveProject(); });
      g.on('mouseenter', () => stage.container().style.cursor = 'grab');
      g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
    }
    return g;
  }
  function ptPos(pt) { const t = (cur().tokens || []).find(x => x.pt === pt); return t ? { x: t.xf * W, y: t.yf * H } : null; }
  function renderTokens() {
    tokenLayer.destroyChildren();
    const toks = cur() ? cur().tokens : [];
    // conectores (embaixo)
    (cur() ? cur().destacados : []).forEach(d => {
      const pp = ptPos(d.pt); if (!pp) return;
      const p = partyById.get(d.pt);
      tokenLayer.add(new Konva.Line({ name: 'conn-' + d.id, points: [pp.x, pp.y, d.xf * W, d.yf * H], stroke: p.cor, strokeWidth: Math.max(1.5, R * 0.1), dash: [6, 5], opacity: 0.8, listening: false }));
    });
    toks.forEach(t => tokenLayer.add(makePtToken(t)));
    (cur() ? cur().destacados : []).forEach(d => { if (ptPos(d.pt)) tokenLayer.add(makeMemberToken(d)); });
    tokenLayer.batchDraw();
    syncPlacedChips();
    mapHint.classList.toggle('hide', toks.length > 0 || (cur() && cur().desenhos.length) || state.present);
  }
  function updateConnectors() {
    (cur() ? cur().destacados : []).forEach(d => {
      const line = tokenLayer.findOne('.conn-' + d.id); if (!line) return;
      const ptNode = tokenLayer.findOne('.pt-' + d.pt), memNode = tokenLayer.findOne('#mem-' + d.id);
      if (ptNode && memNode) line.points([ptNode.x(), ptNode.y(), memNode.x(), memNode.y()]);
    });
    tokenLayer.batchDraw();
  }
  function placeToken(pt, xf, yf) {
    if (!partyById.has(pt) || state.present) return;
    const toks = cur().tokens, ex = toks.find(t => t.pt === pt);
    if (ex) { ex.xf = clamp01(xf); ex.yf = clamp01(yf); } else toks.push({ pt, xf: clamp01(xf), yf: clamp01(yf) });
    renderTokens(); saveProject();
  }
  function removeToken(pt) { const s = cur(); s.tokens = s.tokens.filter(t => t.pt !== pt); s.destacados = s.destacados.filter(d => d.pt !== pt); hidePopover(); renderTokens(); saveProject(); }

  function detachMember(pt, nome, funcao) {
    const pp = ptPos(pt); if (!pp) return;
    const xf = clamp01((pp.x + R * 3) / W), yf = clamp01((pp.y - R * 2) / H);
    cur().destacados.push({ id: uid(), pt, nome, funcao, xf, yf });
    hidePopover(); renderTokens(); saveProject();
  }

  // ---------------------------------------------------------------------------
  // Popover de membros da PT
  // ---------------------------------------------------------------------------
  function togglePopover(pt, x, y) {
    if (popoverPt === pt && !ptPopover.hidden) { hidePopover(); return; }
    const p = partyById.get(pt), tit = membersOf(pt, false), res = membersOf(pt, true);
    let html = '<h4><span class="pd" style="background:' + p.cor + '"></span>' + pt + '</h4>';
    if (!tit.length && !res.length) html += '<div class="empty">Sem membros. Defina no roster.</div>';
    else {
      html += '<ul>';
      tit.forEach(m => html += '<li><span class="rl" style="background:' + roleColor(m.funcao) + '"></span>' + esc(m.nome) +
        (state.present ? '<span class="tag">' + esc(m.funcao) + '</span>' : '<button class="detach" data-nome="' + esc(m.nome) + '" data-fn="' + m.funcao + '">↗ destacar</button>') + '</li>');
      res.forEach(m => html += '<li class="res"><span class="rl" style="background:' + roleColor(m.funcao) + ';opacity:.5"></span>' + esc(m.nome) + '<span class="tag">reserva</span></li>');
      html += '</ul>';
      if (!state.present) html += '<div class="phint">"Destacar" solta o membro no mapa, ligado à PT por um traço.</div>';
    }
    ptPopover.innerHTML = html; ptPopover.hidden = false;
    ptPopover.querySelectorAll('.detach').forEach(b => b.addEventListener('click', () => detachMember(pt, b.dataset.nome, b.dataset.fn)));
    const px = stageWrap.offsetLeft + x + R + 8, py = stageWrap.offsetTop + y - 10;
    ptPopover.style.left = Math.max(8, Math.min(px, mapPanel.clientWidth - ptPopover.offsetWidth - 8)) + 'px';
    ptPopover.style.top = Math.max(8, Math.min(py, mapPanel.clientHeight - ptPopover.offsetHeight - 8)) + 'px';
    popoverPt = pt;
  }
  function hidePopover() { ptPopover.hidden = true; popoverPt = null; }

  // ---------------------------------------------------------------------------
  // Objetivos (camada + painel por cenário)
  // ---------------------------------------------------------------------------
  function objPos(o) { const p = state.objetivoPos[o.id]; return { x: (p ? p.x : o.x), y: (p ? p.y : o.y) }; }
  function renderObjectives() {
    objLayer.destroyChildren();
    const up = cur() ? (cur().objetivos || {}) : {};
    CFG.objetivos.forEach(o => {
      if (!up[o.id]) return;
      const pos = objPos(o), os = Math.max(26, W * 0.05);
      const g = new Konva.Group({ x: pos.x * W, y: pos.y * H, draggable: !state.present });
      const img = iconImgs[o.icone];
      if (img && img.width) {
        const h = os * (img.height / img.width);
        g.add(new Konva.Image({ image: img, width: os, height: h, offsetX: os / 2, offsetY: h / 2, shadowColor: '#000', shadowBlur: 6, shadowOpacity: 0.5 }));
      } else {
        // jungle / sem ícone: marcador desenhado
        g.add(new Konva.Circle({ radius: os * 0.42, fill: 'rgba(76,201,164,.18)', stroke: '#4CC9A4', strokeWidth: 2 }));
        g.add(new Konva.Text({ text: 'JG', fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: os * 0.34, fill: '#4CC9A4', align: 'center', verticalAlign: 'middle', width: os, height: os, offsetX: os / 2, offsetY: os / 2 }));
      }
      if (!state.present) {
        g.dragBoundFunc(p => ({ x: Math.max(0, Math.min(W, p.x)), y: Math.max(0, Math.min(H, p.y)) }));
        g.on('dragend', () => { state.objetivoPos[o.id] = { x: clamp01(g.x() / W), y: clamp01(g.y() / H) }; saveProject(); });
        g.on('mouseenter', () => stage.container().style.cursor = 'grab');
        g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      }
      objLayer.add(g);
    });
    objLayer.batchDraw();
  }
  function renderObjPanel() {
    const up = cur() ? (cur().objetivos || {}) : {};
    objGroups.innerHTML = '';
    CFG.objetivosGrupos.forEach(grp => {
      const list = CFG.objetivos.filter(o => o.grupo === grp); if (!list.length) return;
      const box = document.createElement('div'); box.className = 'obj-g';
      box.innerHTML = '<div class="gh">' + grp + '</div>';
      list.forEach(o => {
        const row = document.createElement('label');
        row.className = 'obj-row' + (up[o.id] ? ' up' : '');
        row.innerHTML = '<input type="checkbox"' + (up[o.id] ? ' checked' : '') + '><span class="on"></span><span class="nm">' + esc(o.rotulo) + '</span>';
        row.querySelector('input').addEventListener('change', e => {
          const c = cur().objetivos; if (e.target.checked) c[o.id] = true; else delete c[o.id];
          row.classList.toggle('up', e.target.checked);
          renderObjectives(); saveProject();
        });
        box.appendChild(row);
      });
      objGroups.appendChild(box);
    });
  }
  function toggleObjPanel(force) {
    const show = force != null ? force : objPanel.hidden;
    if (show) { renderObjPanel(); objPanel.hidden = false; objBtn.classList.add('on'); }
    else { objPanel.hidden = true; objBtn.classList.remove('on'); }
  }

  // ---------------------------------------------------------------------------
  // Desenho
  // ---------------------------------------------------------------------------
  function toolCursor() { return state.tool === 'select' ? 'default' : 'crosshair'; }
  function buildColorSwatches() {
    dtColors.innerHTML = '';
    CFG.drawColors.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'sw' + (c === state.drawColor ? ' active' : '');
      sw.style.background = c; sw.title = c; sw.dataset.c = c;
      sw.addEventListener('click', () => { state.drawColor = c; dtColors.querySelectorAll('.sw').forEach(s => s.classList.toggle('active', s.dataset.c === c)); });
      dtColors.appendChild(sw);
    });
  }
  function setTool(t) {
    state.tool = t;
    drawTools.querySelectorAll('.dt[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
    const drawing = t !== 'select';
    tokenLayer.listening(!drawing); objLayer.listening(!drawing);
    stage.container().style.cursor = toolCursor();
    if (drawing) hidePopover();
  }
  function pxPts(pts) { const a = []; pts.forEach(p => { a.push(p[0] * W, p[1] * H); }); return a; }
  function shapeFromDesenho(d) {
    const stroke = d.cor || '#D9A441', sw = d.largura || 5;
    if (d.tipo === 'seta') return new Konva.Arrow({ points: pxPts(d.pontos), stroke, fill: stroke, strokeWidth: sw, pointerLength: sw * 2.4, pointerWidth: sw * 2.2, lineCap: 'round', lineJoin: 'round' });
    if (d.tipo === 'linha') return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, lineCap: 'round' });
    if (d.tipo === 'livre') return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, lineCap: 'round', lineJoin: 'round', tension: 0.35 });
    if (d.tipo === 'retangulo') { const a = d.pontos[0], b = d.pontos[1]; return new Konva.Rect({ x: Math.min(a[0], b[0]) * W, y: Math.min(a[1], b[1]) * H, width: Math.abs(b[0] - a[0]) * W, height: Math.abs(b[1] - a[1]) * H, stroke, strokeWidth: sw, cornerRadius: 4, fill: hexA(stroke, 0.12) }); }
    return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw });
  }
  function renderDrawings() {
    drawLayer.destroyChildren();
    (cur() ? cur().desenhos : []).forEach(d => drawLayer.add(shapeFromDesenho(d)));
    drawLayer.batchDraw();
  }
  let live = null;
  function beginDraw() {
    if (state.present || state.tool === 'select') return;
    const pos = stage.getPointerPosition(); if (!pos) return;
    const f = [clamp01(pos.x / W), clamp01(pos.y / H)];
    live = { tipo: state.tool, pontos: state.tool === 'livre' ? [f] : [f, f], cor: state.drawColor, largura: state.drawWidth, shape: null };
    live.shape = shapeFromDesenho(live); drawLayer.add(live.shape); drawLayer.batchDraw();
  }
  function moveDraw() {
    if (!live) return;
    const pos = stage.getPointerPosition(); if (!pos) return;
    const f = [clamp01(pos.x / W), clamp01(pos.y / H)];
    if (live.tipo === 'livre') live.pontos.push(f); else live.pontos[1] = f;
    live.shape.destroy(); live.shape = shapeFromDesenho(live); drawLayer.add(live.shape); drawLayer.batchDraw();
  }
  function endDraw() {
    if (!live) return; const d = live; live = null;
    d.shape && d.shape.destroy();
    const tiny = d.tipo === 'livre' ? d.pontos.length < 3 : (Math.hypot((d.pontos[1][0] - d.pontos[0][0]) * W, (d.pontos[1][1] - d.pontos[0][1]) * H) < 6);
    if (tiny) { drawLayer.batchDraw(); return; }
    recordUndo();
    cur().desenhos.push({ tipo: d.tipo, pontos: d.pontos.map(p => [p[0], p[1]]), cor: d.cor, largura: d.largura });
    renderDrawings(); renderTokens(); saveProject();
  }
  function recordUndo() { const id = cur().id; (undoStacks[id] = undoStacks[id] || []).push(JSON.stringify(cur().desenhos)); redoStacks[id] = []; }
  function doUndo() { const id = cur().id, u = undoStacks[id]; if (!u || !u.length) return; (redoStacks[id] = redoStacks[id] || []).push(JSON.stringify(cur().desenhos)); cur().desenhos = JSON.parse(u.pop()); renderDrawings(); renderTokens(); saveProject(); }
  function doRedo() { const id = cur().id, r = redoStacks[id]; if (!r || !r.length) return; (undoStacks[id] = undoStacks[id] || []).push(JSON.stringify(cur().desenhos)); cur().desenhos = JSON.parse(r.pop()); renderDrawings(); renderTokens(); saveProject(); }
  function clearDrawings() { if (!cur().desenhos.length) return; if (!confirm('Limpar os desenhos deste cenário?')) return; recordUndo(); cur().desenhos = []; renderDrawings(); renderTokens(); saveProject(); }

  // ---------------------------------------------------------------------------
  // Cenários
  // ---------------------------------------------------------------------------
  function renderRail() {
    rail.innerHTML = '';
    state.scenarios.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'scene' + (s.id === state.currentId ? ' active' : ''); card.dataset.id = s.id; card.setAttribute('draggable', 'true');
      card.innerHTML = '<div class="sc-top"><span class="sc-idx">' + (i + 1) + '</span><span class="sc-name">' + esc(s.nome || 'Cenário') + '</span></div>' +
        (s.condicao ? '<span class="sc-cond">▸ ' + esc(s.condicao) + '</span>' : '<span class="sc-meta">' + esc(s.fase || '') + '</span>') +
        '<button class="sc-del" title="Excluir cenário" aria-label="Excluir">✕</button>';
      card.addEventListener('click', e => { if (e.target.classList.contains('sc-del')) return; selectScenario(s.id); });
      card.querySelector('.sc-del').addEventListener('click', e => { e.stopPropagation(); deleteScenario(s.id); });
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/scene', s.id); dragId._id = s.id; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); clearHints(); });
      card.addEventListener('dragover', e => { if (!Array.from(e.dataTransfer.types).includes('text/scene') || dragId._id === s.id) return; e.preventDefault(); clearHints(); card.classList.add(e.offsetX < card.offsetWidth / 2 ? 'drop-before' : 'drop-after'); });
      card.addEventListener('drop', e => { if (!Array.from(e.dataTransfer.types).includes('text/scene')) return; e.preventDefault(); const id = dragId._id; if (id && id !== s.id) reorder(id, s.id, e.offsetX < card.offsetWidth / 2); });
      rail.appendChild(card);
    });
    const a = rail.querySelector('.scene.active'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function dragId() {} function clearHints() { rail.querySelectorAll('.drop-before,.drop-after').forEach(c => c.classList.remove('drop-before', 'drop-after')); }
  function selectScenario(id) {
    if (id === state.currentId) return;
    hidePopover(); state.currentId = id;
    renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderTokens(); renderSidebar();
    if (!objPanel.hidden) renderObjPanel();
    if (state.present) updatePresentUI();
    saveProject();
  }
  function loadScenarioIntoUI() { const s = cur(); if (!s) return; nameInput.value = s.nome || ''; condInput.value = s.condicao || ''; noteInput.value = s.nota || ''; }
  function insertAfterCurrent(s) { const i = curIndex(); state.scenarios.splice(i < 0 ? state.scenarios.length : i + 1, 0, s); saveProject(); }
  function addScenarioBlank() { const s = newScenario({ fase: 'Cenário', nome: 'Cenário ' + (state.scenarios.length + 1) }); insertAfterCurrent(s); selectScenario(s.id); }
  function duplicateCurrent() {
    const s = cur();
    insertAfterCurrent(newScenario({ fase: s.fase, nome: s.nome, condicao: s.condicao,
      tokens: s.tokens.map(t => ({ pt: t.pt, xf: t.xf, yf: t.yf })),
      desenhos: JSON.parse(JSON.stringify(s.desenhos)),
      objetivos: Object.assign({}, s.objetivos),
      destacados: s.destacados.map(d => Object.assign({}, d, { id: uid() })), nota: s.nota }));
    selectScenario(state.scenarios[curIndex() + 1].id);
  }
  function deleteScenario(id) {
    if (state.scenarios.length <= 1) { alert('É preciso ter ao menos um cenário.'); return; }
    const i = state.scenarios.findIndex(s => s.id === id); if (i < 0) return;
    if (!isPristine(state.scenarios[i]) && !confirm('Excluir o cenário "' + (state.scenarios[i].nome || '') + '"?')) return;
    state.scenarios.splice(i, 1);
    if (state.currentId === id) state.currentId = state.scenarios[Math.max(0, i - 1)].id;
    renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderTokens(); renderSidebar(); saveProject();
  }
  function reorder(dragIdV, targetId, before) {
    const from = state.scenarios.findIndex(s => s.id === dragIdV); if (from < 0) return;
    const [m] = state.scenarios.splice(from, 1);
    let to = state.scenarios.findIndex(s => s.id === targetId);
    if (to < 0) state.scenarios.push(m); else state.scenarios.splice(before ? to : to + 1, 0, m);
    renderRail(); saveProject();
  }
  function seedStandard() {
    const key = e => (e.nome || '') + '|' + (e.condicao || '');
    if (state.scenarios.length === 1 && isPristine(state.scenarios[0])) state.scenarios = [];
    const have = new Set(state.scenarios.map(key));
    CFG.fasesPadrao.forEach(f => { if (!have.has(key(f))) state.scenarios.push(newScenario({ fase: f.fase, nome: f.nome, condicao: f.condicao })); });
    state.currentId = state.scenarios[0].id;
    renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderTokens(); renderSidebar(); saveProject();
  }
  function syncCard() {
    const s = cur(), card = rail.querySelector('.scene.active'); if (!card) return;
    card.querySelector('.sc-name').textContent = s.nome || 'Cenário';
    const condEl = card.querySelector('.sc-cond'), metaEl = card.querySelector('.sc-meta');
    if (s.condicao) { if (condEl) condEl.textContent = '▸ ' + s.condicao; else { const el = document.createElement('span'); el.className = 'sc-cond'; el.textContent = '▸ ' + s.condicao; if (metaEl) metaEl.replaceWith(el); else card.appendChild(el); } }
    else if (condEl) { const el = document.createElement('span'); el.className = 'sc-meta'; el.textContent = s.fase || ''; condEl.replaceWith(el); }
  }

  // ---------------------------------------------------------------------------
  // Apresentação
  // ---------------------------------------------------------------------------
  function enterPresent() {
    state.present = true; document.body.classList.add('present');
    presentBtn.style.display = 'none'; exitBtn.style.display = ''; hidePopover(); toggleObjPanel(false); setTool('select');
    renderDrawings(); renderObjectives(); renderTokens(); updatePresentUI();
    try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) {}
    setTimeout(fit, 60);
  }
  function exitPresent() {
    state.present = false; document.body.classList.remove('present');
    presentBtn.style.display = ''; exitBtn.style.display = 'none';
    renderDrawings(); renderObjectives(); renderTokens();
    try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {}
    setTimeout(fit, 60);
  }
  function updatePresentUI() {
    const s = cur(); if (!s) return; const i = curIndex(), n = state.scenarios.length;
    pbTitle.textContent = s.nome || 'Cenário';
    if (s.condicao) { pbCond.hidden = false; pbCond.textContent = s.condicao; } else pbCond.hidden = true;
    pbProg.textContent = (i + 1) + ' / ' + n;
    pnPhase.textContent = s.fase || s.nome || 'Fase';
    if (s.condicao) { pnBadge.hidden = false; pnBadge.textContent = s.condicao; } else pnBadge.hidden = true;
    const nota = (s.nota || '').trim(); pnText.textContent = nota || 'Sem nota neste cenário.'; pnText.classList.toggle('empty', !nota);
    prevBtn.disabled = i <= 0; nextBtn.disabled = i >= n - 1;
  }
  function go(delta) { const j = curIndex() + delta; if (j < 0 || j >= state.scenarios.length) return; selectScenario(state.scenarios[j].id); }

  // ---------------------------------------------------------------------------
  // ROSTER (parse + modal) — igual à etapa 5
  // ---------------------------------------------------------------------------
  function mapClass(c) { return CFG.classMap[c] || 'DPS'; }
  function normalizeRole(t) { t = (t || '').toLowerCase(); if (/tank|tanque/.test(t)) return 'Tank'; if (/heal|cura/.test(t)) return 'Healer'; if (/supp|debuff|suporte/.test(t)) return 'Support'; return 'DPS'; }
  function parseRoster(text) {
    text = (text || '').trim(); if (!text) return [];
    if (text[0] === '{' || text[0] === '[') { try { const d = JSON.parse(text); const arr = Array.isArray(d) ? d : d.signUps; if (Array.isArray(arr)) return parseRaidHelper(arr); } catch (e) {} }
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
      else { classe = cls; funcao = mapClass(cls); }
      out.push({ id: uid(), nome: s.name || '—', classe, funcao, status, ausente, reserva, pt: null, nota: s.note || '' });
    });
    const rank = p => (p.ausente ? 3 : p.reserva ? 2 : 1), fo = f => ({ Tank: 0, Healer: 1, DPS: 2, Support: 3 }[f] ?? 4);
    out.sort((a, b) => rank(a) - rank(b) || fo(a.funcao) - fo(b.funcao) || a.nome.localeCompare(b.nome));
    return out;
  }
  function parseLines(text) {
    const out = [];
    text.split(/\n+/).forEach(line => {
      const m = line.match(/^\s*(PT\s?\d+|reservas?|bench|banco|sem\s?pt)\s*[—:\-–]\s*(.+)$/i); if (!m) return;
      const reserva = /reserv|bench|banco/i.test(m[1]), ptm = m[1].match(/PT\s?(\d+)/i), pt = ptm ? 'PT' + ptm[1] : null;
      m[2].split(/[,;]+/).forEach(part => { part = part.trim(); if (!part) return; const mm = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/); const nome = (mm ? mm[1] : part).trim(); const funcao = normalizeRole(mm ? mm[2] : ''); if (nome) out.push({ id: uid(), nome, classe: funcao, funcao, status: reserva ? 'bench' : 'primary', ausente: false, reserva, pt: pt && PT_IDS.includes(pt) ? pt : null, nota: '' }); });
    });
    return out;
  }
  function openRoster() { rosterDraft = state.roster.map(p => Object.assign({}, p)); rosterPaste.value = ''; parseMsg.textContent = ''; parseMsg.className = 'parse-msg'; saveMsg.textContent = ''; renderGrid(); rosterModal.hidden = false; }
  function closeRoster() { rosterModal.hidden = true; }
  function renderGrid() {
    gAus.textContent = rosterDraft.filter(p => p.ausente).length;
    gRes.textContent = rosterDraft.filter(p => p.reserva && !p.ausente).length;
    gEsc.textContent = rosterDraft.filter(p => !p.ausente && !p.reserva).length;
    const c = { Tank: 0, Healer: 0, DPS: 0, Support: 0 }; rosterDraft.filter(p => !p.ausente && !p.reserva).forEach(p => c[p.funcao]++);
    gComp.innerHTML = CFG.roleOrder.filter(f => c[f]).map(f => '<b style="color:' + roleColor(f) + '">' + c[f] + '</b> ' + f).join(' · ');
    let html = '<div class="rrow head"><span>Jogador</span><span>Função</span><span>PT</span><span>Res.</span><span></span></div>';
    if (!rosterDraft.length) html += '<div style="padding:22px 6px;color:#9aa2b4;font-size:12.5px">Nenhum jogador ainda. Cole a montagem e clique <b>Processar</b>.</div>';
    rosterDraft.forEach((p, i) => {
      const opts = ['Tank', 'DPS', 'Healer', 'Support'].map(f => '<option value="' + f + '"' + (p.funcao === f ? ' selected' : '') + '>' + f + '</option>').join('');
      const ptopts = '<option value="">—</option>' + PT_IDS.map(id => '<option value="' + id + '"' + (p.pt === id ? ' selected' : '') + '>' + id + '</option>').join('');
      html += '<div class="rrow' + (p.ausente ? ' absence' : '') + '" data-i="' + i + '"><div class="rn"><span class="rl" style="background:' + roleColor(p.funcao) + (p.ausente ? ';opacity:.4' : '') + '"></span><span class="nm">' + esc(p.nome) + '</span><span class="cl">' + esc(p.ausente ? 'ausente' : p.classe) + '</span></div><select class="f-fn"' + (p.ausente ? ' disabled' : '') + '>' + opts + '</select><select class="f-pt"' + (p.ausente ? ' disabled' : '') + '>' + ptopts + '</select><div class="res"><input type="checkbox" class="f-res"' + (p.reserva ? ' checked' : '') + (p.ausente ? ' disabled' : '') + '></div><button class="rdel" title="Remover">✕</button></div>';
    });
    rosterGrid.innerHTML = html;
  }
  function autoAssign() {
    const avail = rosterDraft.filter(p => !p.ausente && !p.reserva); avail.forEach(p => p.pt = null);
    if (!avail.length) { renderGrid(); return; }
    const nPT = Math.max(1, Math.min(CFG.parties.length, Math.ceil(avail.length / CFG.ptSize)));
    const buckets = Array.from({ length: nPT }, () => []); let bi = 0;
    const deal = list => { list.forEach(p => { buckets[bi % nPT].push(p); bi++; }); };
    bi = 0; deal(avail.filter(p => p.funcao === 'Tank'));
    bi = 0; deal(avail.filter(p => p.funcao === 'Healer'));
    bi = 0; deal(avail.filter(p => p.funcao === 'DPS' || p.funcao === 'Support'));
    buckets.forEach((b, k) => b.forEach(p => p.pt = PT_IDS[k]));
    renderGrid();
  }

  // ---------------------------------------------------------------------------
  // Export / Import
  // ---------------------------------------------------------------------------
  function exportProject() {
    const blob = new Blob([JSON.stringify(projectData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), d = new Date(), pad = n => String(n).padStart(2, '0');
    const a = document.createElement('a'); a.href = url; a.download = 'estrategia-wanted-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function applyImported(d) {
    const scenarios = Array.isArray(d.cenarios) ? d.cenarios : (Array.isArray(d.scenarios) ? d.scenarios : null);
    if (!scenarios || !scenarios.length) { alert('Não encontrei cenários neste plano.'); return false; }
    state.scenarios = scenarios.map(sanitizeScenario);
    state.roster = Array.isArray(d.roster) ? d.roster.map(sanitizePlayer) : [];
    state.objetivoPos = (d.objetivoPos && typeof d.objetivoPos === 'object') ? d.objetivoPos : {};
    state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id;
    hidePopover(); renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderSidebar(); renderTokens(); saveProject();
    return true;
  }
  function importProjectFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let d; try { d = JSON.parse(reader.result); } catch (e) { alert('Arquivo inválido: não é um JSON.'); return; }
      if (!Array.isArray(d.cenarios) && !Array.isArray(d.scenarios)) { alert('Não encontrei cenários neste arquivo.'); return; }
      if (state.scenarios.some(s => !isPristine(s)) && !confirm('Importar vai substituir o plano atual. Continuar?')) return;
      applyImported(d);
    };
    reader.readAsText(file);
  }

  // ---- compartilhar por link (plano codificado na URL, sem servidor) ----
  function b64urlFromBytes(bytes) { let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function bytesFromB64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  async function encodeShare(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      const buf = new Uint8Array(await new Response(stream).arrayBuffer());
      return 'g' + b64urlFromBytes(buf);
    }
    return 'r' + b64urlFromBytes(bytes);
  }
  async function decodeShare(str) {
    const flag = str[0]; let bytes = bytesFromB64url(str.slice(1));
    if (flag === 'g' && window.DecompressionStream) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  async function shareLink() {
    try {
      const enc = await encodeShare(projectData());
      const url = location.origin + location.pathname + '#p=' + enc;
      history.replaceState(null, '', '#p=' + enc);
      let copied = false;
      try { await navigator.clipboard.writeText(url); copied = true; } catch (e) {}
      if (copied) toast('Link copiado ✓ — cole no Discord para compartilhar');
      else { toast('Link gerado — copie da barra de endereço'); }
    } catch (e) { toast('Não consegui gerar o link'); }
  }
  function projectData() { return { app: 'zhi-estrategia', v: 3, exportedAt: new Date().toISOString(), objetivoPos: state.objetivoPos, currentId: state.currentId, roster: state.roster, cenarios: state.scenarios }; }
  async function maybeLoadShared() {
    const m = /[#&]p=([^&]+)/.exec(location.hash); if (!m) return;
    let d; try { d = await decodeShare(decodeURIComponent(m[1])); } catch (e) { toast('Link de plano inválido'); return; }
    if (state.scenarios.some(s => !isPristine(s)) && !confirm('Este link abre um plano compartilhado. Abrir agora substitui o seu rascunho atual. Continuar?')) return;
    if (applyImported(d)) toast('Plano do link carregado ✓');
  }
  let toastT = null;
  function toast(msg) { toastEl.innerHTML = msg.replace(/✓/g, '<b>✓</b>'); toastEl.hidden = false; requestAnimationFrame(() => toastEl.classList.add('show')); clearTimeout(toastT); toastT = setTimeout(() => { toastEl.classList.remove('show'); setTimeout(() => toastEl.hidden = true, 220); }, 2600); }

  // ---------------------------------------------------------------------------
  // Eventos
  // ---------------------------------------------------------------------------
  function wireEvents() {
    const cont = stage.container();
    ['dragenter', 'dragover'].forEach(evt => cont.addEventListener(evt, e => { if (state.present) return; if (!Array.from(e.dataTransfer.types).includes('text/plain')) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; mapPanel.classList.add('dragover'); }));
    ['dragleave', 'dragend'].forEach(evt => cont.addEventListener(evt, () => mapPanel.classList.remove('dragover')));
    cont.addEventListener('drop', e => { e.preventDefault(); mapPanel.classList.remove('dragover'); if (state.present) return; const pt = e.dataTransfer.getData('text/plain'); if (!pt) return; stage.setPointersPositions(e); const pos = stage.getPointerPosition() || { x: W / 2, y: H / 2 }; placeToken(pt, pos.x / W, pos.y / H); });

    // desenho
    stage.on('mousedown touchstart', e => { if (state.tool !== 'select' && !state.present) { e.evt && e.evt.preventDefault && e.evt.preventDefault(); beginDraw(); } });
    stage.on('mousemove touchmove', moveDraw);
    stage.on('mouseup touchend', endDraw);
    stage.on('click tap', e => { if (state.tool === 'select' && (e.target === stage || e.target === bgImage)) hidePopover(); });

    // desenho toolbar
    drawTools.querySelectorAll('.dt[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    dtWidth.addEventListener('click', () => { const i = (CFG.drawWidths.indexOf(state.drawWidth) + 1) % CFG.drawWidths.length; state.drawWidth = CFG.drawWidths[i]; dtWidth.textContent = ['▁', '▬', '█'][i] || '▬'; });
    undoBtn.addEventListener('click', doUndo); redoBtn.addEventListener('click', doRedo); clearDraw.addEventListener('click', clearDrawings);

    // objetivos
    objBtn.addEventListener('click', () => toggleObjPanel());
    objClose.addEventListener('click', () => toggleObjPanel(false));

    // cenário
    nameInput.addEventListener('input', () => { cur().nome = nameInput.value; syncCard(); saveProject(); });
    condInput.addEventListener('input', () => { cur().condicao = condInput.value.trim() || null; syncCard(); saveProject(); });
    noteInput.addEventListener('input', () => { cur().nota = noteInput.value; saveProject(); });
    addScene.addEventListener('click', addScenarioBlank);
    dupScene.addEventListener('click', duplicateCurrent);
    seedBtn.addEventListener('click', () => { if (state.scenarios.some(s => !isPristine(s)) && !confirm('Adicionar os cenários das fases padrão ao projeto?')) return; seedStandard(); });
    exportBtn.addEventListener('click', exportProject);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', e => { const f = e.target.files[0]; if (f) importProjectFile(f); e.target.value = ''; });
    shareBtn.addEventListener('click', shareLink);
    presentBtn.addEventListener('click', enterPresent); exitBtn.addEventListener('click', exitPresent);
    prevBtn.addEventListener('click', () => go(-1)); nextBtn.addEventListener('click', () => go(1));

    document.addEventListener('keydown', e => {
      if (!rosterModal.hidden) { if (e.key === 'Escape') closeRoster(); return; }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
      if (state.present) { if (e.key === 'Escape') exitPresent(); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); } return; }
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); return; }
      const map = { v: 'select', a: 'seta', l: 'linha', d: 'livre', r: 'retangulo' };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && state.present) exitPresent(); });

    // modal roster
    rosterBtn.addEventListener('click', openRoster); editRosterBtn.addEventListener('click', openRoster);
    rosterClose.addEventListener('click', closeRoster);
    rosterModal.addEventListener('click', e => { if (e.target === rosterModal) closeRoster(); });
    parseBtn.addEventListener('click', () => { const parsed = parseRoster(rosterPaste.value); if (!parsed.length) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = 'Não reconheci jogadores. Confira o formato.'; return; } rosterDraft = parsed; parseMsg.className = 'parse-msg ok'; parseMsg.textContent = parsed.length + ' jogadores reconhecidos.'; renderGrid(); });
    autoBtn.addEventListener('click', autoAssign);
    rosterClear2.addEventListener('click', () => { if (confirm('Limpar todos os jogadores?')) { rosterDraft = []; renderGrid(); } });
    rosterGrid.addEventListener('change', e => { const row = e.target.closest('.rrow'); if (!row) return; const p = rosterDraft[+row.dataset.i]; if (!p) return; if (e.target.classList.contains('f-fn')) p.funcao = e.target.value; else if (e.target.classList.contains('f-pt')) p.pt = e.target.value || null; else if (e.target.classList.contains('f-res')) p.reserva = e.target.checked; renderGrid(); });
    rosterGrid.addEventListener('click', e => { if (!e.target.classList.contains('rdel')) return; const row = e.target.closest('.rrow'); if (!row) return; rosterDraft.splice(+row.dataset.i, 1); renderGrid(); });
    rosterSave.addEventListener('click', () => { state.roster = rosterDraft.map(p => Object.assign({}, p)); saveProject(); renderSidebar(); renderTokens(); saveMsg.className = 'parse-msg ok'; saveMsg.textContent = 'Roster salvo ✓'; setTimeout(closeRoster, 500); });

    let raf = null; const relayout = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    new ResizeObserver(relayout).observe(mapPanel); window.addEventListener('resize', relayout);
  }

  // ---------------------------------------------------------------------------
  // Persistência
  // ---------------------------------------------------------------------------
  function saveProject() { try { localStorage.setItem(CFG.projectKey, JSON.stringify({ v: 3, objetivoPos: state.objetivoPos, currentId: state.currentId, scenarios: state.scenarios, roster: state.roster })); } catch (e) {} }
  function loadProject() {
    try {
      const raw = localStorage.getItem(CFG.projectKey);
      if (raw) { const d = JSON.parse(raw); if (Array.isArray(d.scenarios) && d.scenarios.length) {
        state.scenarios = d.scenarios.map(sanitizeScenario);
        state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id;
        if (Array.isArray(d.roster)) state.roster = d.roster.map(sanitizePlayer);
        if (d.objetivoPos && typeof d.objetivoPos === 'object') state.objetivoPos = d.objetivoPos;
        return;
      } }
    } catch (e) {}
    const s = newScenario({ fase: 'Start', nome: 'Start (30m)' });
    state.scenarios = [s]; state.currentId = s.id;
  }
  function sanitizeScenario(s) {
    return { id: s.id || uid(), fase: s.fase || 'Cenário', nome: s.nome || 'Cenário', condicao: s.condicao || null,
      tokens: Array.isArray(s.tokens) ? s.tokens.filter(t => partyById.has(t.pt)).map(t => ({ pt: t.pt, xf: clamp01(t.xf), yf: clamp01(t.yf) })) : [],
      desenhos: Array.isArray(s.desenhos) ? s.desenhos.filter(d => d && Array.isArray(d.pontos)).map(d => ({ tipo: d.tipo, pontos: d.pontos.map(p => [clamp01(p[0]), clamp01(p[1])]), cor: d.cor || '#D9A441', largura: d.largura || 5 })) : [],
      objetivos: (s.objetivos && typeof s.objetivos === 'object') ? Object.fromEntries(Object.keys(s.objetivos).filter(k => objById.has(k) && s.objetivos[k]).map(k => [k, true])) : {},
      destacados: Array.isArray(s.destacados) ? s.destacados.filter(d => partyById.has(d.pt)).map(d => ({ id: d.id || uid(), pt: d.pt, nome: String(d.nome || '—'), funcao: ['Tank', 'DPS', 'Healer', 'Support'].includes(d.funcao) ? d.funcao : 'DPS', xf: clamp01(d.xf), yf: clamp01(d.yf) })) : [],
      nota: typeof s.nota === 'string' ? s.nota : '' };
  }
  function sanitizePlayer(p) {
    const funcao = ['Tank', 'DPS', 'Healer', 'Support'].includes(p.funcao) ? p.funcao : 'DPS';
    return { id: p.id || uid(), nome: String(p.nome || '—'), classe: String(p.classe || funcao), funcao, status: p.status || 'primary', ausente: !!p.ausente, reserva: !!p.reserva, pt: PT_IDS.includes(p.pt) ? p.pt : null, nota: typeof p.nota === 'string' ? p.nota : '' };
  }
})();
