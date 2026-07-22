/* =============================================================================
 * Zhi Guides — Mapa de Estratégia GvG (guild Wanted) — app.js
 * Mapa (fundo transparente) + tokens de PT · cenários (árvore de fases) ·
 * nota + apresentação · desenho (seta/linha/livre/área, undo/redo de tudo) ·
 * objetivos up/down por cenário (torres/boss/outpost/jungle FIXOS; ganso e
 * árvore MÓVEIS, posição por cenário; árvore com contador de metros) ·
 * destacar membro arrastando · roster (raid-helper) · export/import ·
 * compartilhar por link · zoom com scroll · reset · fases ocultáveis.
 * Funções: Tank / DPS / Healer (Support = DPS). 6 PTs (Ataque/Defesa).
 * ========================================================================== */
(function () {
  'use strict';
  const CFG = window.WWM, NAT = CFG.mapSize, AR = NAT.w / NAT.h, PT_IDS = CFG.parties.map(p => p.id);
  const DRAW = ['seta', 'linha', 'livre', 'retangulo'];

  // ---------- i18n (PT / ES / EN) ----------
  const LANG_KEY = 'wanted-guide-language';
  let lang = 'pt';
  const I18N = {
    pt: {
      menu:'Menu', phases:'Fases', objectives:'Objetivos', roster:'Roster', share:'Compartilhar', present:'Apresentar', exit:'Sair',
      objUp:'Objetivos up', objInScene:'neste cenário', objAll:'Adicionar todos', objFoot:'Marque o que está "up" nesta fase. No mapa, arraste cada ícone para posicioná-lo (vale para todos os cenários).', copyPos:'Copiar posições',
      dragHint:'Arraste uma PT da lista para o mapa', dragHint2:'Cada cenário é uma "foto": posições, desenhos e objetivos up. Crie fases e navegue embaixo.',
      pts:'PTs', editRoster:'Editar roster', scaled:'escalados', reserves:'reservas', absent:'ausentes', atk:'Ataque', def:'Defesa', drag:'ARRASTE', noMembers:'sem membros', onMap:'No mapa', dragShort:'Arraste', tapShort:'Tocar',
      rosterTitle:'Roster', rosterSub:'Cole a montagem do Board e ajuste PT / reservas', discordMontage:'Montagem do Discord', process:'Processar', autoMount:'⚙ Auto-montar PTs', clearAll:'Limpar tudo', saveRoster:'Salvar roster',
      tabTable:'Tabela', tabBoard:'Board', bdAuto:'⚙ Auto-preencher', bdEmpty:'Esvaziar PTs', bdLegend:'Arraste cada jogador para a PT, para as <b>reservas da PT</b> ou reservas gerais. Clique num jogador para função, tarja e flags. Alvo: <b>1 Tank · 1 Healer · 3 DPS</b>.', titulars:'Titulares', ptReserves:'Reservas da PT', genReserves:'Reservas gerais', obsPh:'Observações da PT…', roleLbl:'Função', ptLbl:'PT', replaceLbl:'Replace', allToRes:'Jogar todos os disponíveis para reservas',
      available:'Disponíveis', reservesLbl:'Reservas', dropHere:'solte jogadores aqui', secTag:'Tarja secundária', special:'Especial', tagNone:'nenhuma',
      colPlayer:'Jogador', colRole:'Função', colPT:'PT', colRes:'Res.',
      shareTitle:'Link do plano — copie e mande no Discord:', close:'Fechar', copy:'Copiar', zoomTip:'Scroll = zoom · arraste o mapa para mover',
      menuLink:'🔗 Vincular', menuRemove:'Remover', menuHp:'Vida / HP', dead:'Morto', showNames:'Nomes', noteTitle:'Anotação', notePh:'Escreva a anotação…', buffs:'Buffs', carryTitle:'Carry da árvore (máx 2)', carryAdd:'Carry', carryPick:'Toque num player pra ser o carry', carryMax:'Máximo de 2 carries', carrySet:'Carry definido ✓', enemyTitle:'Inimigo', enemyCount:'Quantidade', enemyLabel:'Nome / nota (opcional)', usLbl:'Nós:', westLbl:'Oeste', eastLbl:'Leste', sidePick:'Definir nosso lado', linkPick:'Toque em outro ícone para vincular', linkDone:'Vinculado ✓', linkDup:'Esses dois já estão vinculados', tapPlace:'Toque numa PT (embaixo) e depois no mapa'
    },
    es: {
      menu:'Menú', phases:'Fases', objectives:'Objetivos', roster:'Roster', share:'Compartir', present:'Presentar', exit:'Salir',
      objUp:'Objetivos activos', objInScene:'en esta escena', objAll:'Añadir todos', objFoot:'Marca lo que está "activo" en esta fase. En el mapa, arrastra cada icono para posicionarlo (vale para todas las escenas).', copyPos:'Copiar posiciones',
      dragHint:'Arrastra una PT de la lista al mapa', dragHint2:'Cada escena es una "foto": posiciones, dibujos y objetivos activos. Crea fases y navega abajo.',
      pts:'PTs', editRoster:'Editar roster', scaled:'convocados', reserves:'reservas', absent:'ausentes', atk:'Ataque', def:'Defensa', drag:'ARRASTRA', noMembers:'sin miembros', onMap:'En el mapa', dragShort:'Arrastra', tapShort:'Tocar',
      rosterTitle:'Roster', rosterSub:'Pega la formación del Board y ajusta PT / reservas', discordMontage:'Formación del Discord', process:'Procesar', autoMount:'⚙ Auto-armar PTs', clearAll:'Limpiar todo', saveRoster:'Guardar roster',
      tabTable:'Tabla', tabBoard:'Board', bdAuto:'⚙ Auto-rellenar', bdEmpty:'Vaciar PTs', bdLegend:'Arrastra cada jugador a la PT, a las <b>reservas de la PT</b> o reservas generales. Haz clic en un jugador para función, tarja y flags. Objetivo: <b>1 Tank · 1 Healer · 3 DPS</b>.', titulars:'Titulares', ptReserves:'Reservas de la PT', genReserves:'Reservas generales', obsPh:'Observaciones de la PT…', roleLbl:'Función', ptLbl:'PT', replaceLbl:'Replace', allToRes:'Enviar todos los disponibles a reservas',
      available:'Disponibles', reservesLbl:'Reservas', dropHere:'suelta jugadores aquí', secTag:'Tarja secundaria', special:'Especial', tagNone:'ninguna',
      colPlayer:'Jugador', colRole:'Función', colPT:'PT', colRes:'Res.',
      shareTitle:'Enlace del plan — cópialo y mándalo al Discord:', close:'Cerrar', copy:'Copiar', zoomTip:'Scroll = zoom · arrastra el mapa para mover',
      menuLink:'🔗 Vincular', menuRemove:'Quitar', menuHp:'Vida / HP', dead:'Muerto', showNames:'Nombres', noteTitle:'Nota', notePh:'Escribe la nota…', buffs:'Buffs', carryTitle:'Carry del árbol (máx 2)', carryAdd:'Carry', carryPick:'Toca un jugador para ser el carry', carryMax:'Máximo 2 carries', carrySet:'Carry definido ✓', enemyTitle:'Enemigo', enemyCount:'Cantidad', enemyLabel:'Nombre / nota (opcional)', usLbl:'Nosotros:', westLbl:'Oeste', eastLbl:'Este', sidePick:'Definir nuestro lado', linkPick:'Toca otro ícono para vincular', linkDone:'Vinculado ✓', linkDup:'Esos dos ya están vinculados', tapPlace:'Toca una PT (abajo) y luego el mapa'
    },
    en: {
      menu:'Menu', phases:'Phases', objectives:'Objectives', roster:'Roster', share:'Share', present:'Present', exit:'Exit',
      objUp:'Objectives up', objInScene:'this scene', objAll:'Add all', objFoot:'Mark what is "up" in this phase. On the map, drag each icon to position it (applies to all scenes).', copyPos:'Copy positions',
      dragHint:'Drag a PT from the list onto the map', dragHint2:'Each scene is a "snapshot": positions, drawings and objectives up. Create phases and navigate below.',
      pts:'PTs', editRoster:'Edit roster', scaled:'assigned', reserves:'reserves', absent:'absent', atk:'Attack', def:'Defense', drag:'DRAG', noMembers:'no members', onMap:'On map', dragShort:'Drag', tapShort:'Tap',
      rosterTitle:'Roster', rosterSub:'Paste the Board sign-up and adjust PT / reserves', discordMontage:'Discord sign-up', process:'Process', autoMount:'⚙ Auto-build PTs', clearAll:'Clear all', saveRoster:'Save roster',
      tabTable:'Table', tabBoard:'Board', bdAuto:'⚙ Auto-fill', bdEmpty:'Empty PTs', bdLegend:'Drag each player to the PT, to the <b>PT reserves</b> or general reserves. Click a player for role, tag and flags. Target: <b>1 Tank · 1 Healer · 3 DPS</b>.', titulars:'Starters', ptReserves:'PT reserves', genReserves:'General reserves', obsPh:'PT notes…', roleLbl:'Role', ptLbl:'PT', replaceLbl:'Replace', allToRes:'Send all available to reserves',
      available:'Available', reservesLbl:'Reserves', dropHere:'drop players here', secTag:'Secondary tag', special:'Special', tagNone:'none',
      colPlayer:'Player', colRole:'Role', colPT:'PT', colRes:'Res.',
      shareTitle:'Plan link — copy and share on Discord:', close:'Close', copy:'Copy', zoomTip:'Scroll = zoom · drag the map to move',
      menuLink:'🔗 Link', menuRemove:'Remove', menuHp:'Health / HP', dead:'Dead', showNames:'Names', noteTitle:'Note', notePh:'Write the note…', buffs:'Buffs', carryTitle:'Tree carry (max 2)', carryAdd:'Carry', carryPick:'Tap a player to be the carry', carryMax:'Max 2 carries', carrySet:'Carry set ✓', enemyTitle:'Enemy', enemyCount:'Count', enemyLabel:'Name / note (optional)', usLbl:'Us:', westLbl:'West', eastLbl:'East', sidePick:'Set our side', linkPick:'Tap another icon to link', linkDone:'Linked ✓', linkDup:'Those two are already linked', tapPlace:'Tap a PT (below) then the map'
    }
  };
  function t(k) { return (I18N[lang] && I18N[lang][k] != null) ? I18N[lang][k] : (I18N.pt[k] != null ? I18N.pt[k] : k); }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
    document.documentElement.setAttribute('lang', lang);
  }

  const $ = id => document.getElementById(id);
  const mapPanel = $('mapPanel'), stageWrap = $('stageWrap'), mapHint = $('mapHint'), ptPopover = $('ptPopover'), iconMenu = $('iconMenu');
  const ptList = $('ptList');
  const rail = $('rail'), addScene = $('addScene'), dupScene = $('dupScene'), seedBtn = $('seedBtn');
  const nameInput = $('nameInput'), condInput = $('condInput'), noteInput = $('noteInput');
  const presentBtn = $('presentBtn'), exitBtn = $('exitBtn'), prevBtn = $('prevBtn'), nextBtn = $('nextBtn');
  const pbTitle = $('pbTitle'), pbCond = $('pbCond'), pbProg = $('pbProg');
  const pnPhase = $('pnPhase'), pnBadge = $('pnBadge'), pnText = $('pnText');
  const sumEsc = $('sumEsc'), sumRes = $('sumRes'), sumAus = $('sumAus');
  const rosterBtn = $('rosterBtn'), editRosterBtn = $('editRosterBtn'), rosterModal = $('rosterModal'), rosterClose = $('rosterClose');
  const rosterPaste = $('rosterPaste'), parseBtn = $('parseBtn'), parseMsg = $('parseMsg'), autoBtn = $('autoBtn');
  const rosterBoard = $('rosterBoard'), boardTools = $('boardTools'), viewToggle = $('viewToggle'), bdPop = $('bdPop'), bdAuto = $('bdAuto'), bdClearPt = $('bdClearPt');
  const rosterGrid = $('rosterGrid'), gEsc = $('gEsc'), gRes = $('gRes'), gAus = $('gAus'), gComp = $('gComp');
  const rosterSave = $('rosterSave'), rosterClear2 = $('rosterClear2'), saveMsg = $('saveMsg');
  const exportBtn = $('exportBtn'), importBtn = $('importBtn'), importFile = $('importFile'), shareBtn = $('shareBtn'), resetBtn = $('resetBtn'), toastEl = $('toast');
  const shareModal = $('shareModal'), shareUrl = $('shareUrl'), shareCopy = $('shareCopy'), shareClose = $('shareClose');
  const drawTools = $('drawTools'), dtColors = $('dtColors'), undoBtn = $('undoBtn'), redoBtn = $('redoBtn'), clearDraw = $('clearDraw');
  const dtColorBtn = $('dtColorBtn'), dtCurColor = $('dtCurColor'), dtColorPop = $('dtColorPop'), dtWidthBtn = $('dtWidthBtn'), dtWidthPop = $('dtWidthPop'), dtWidthOpts = $('dtWidthOpts'), dtHex = $('dtHex'), dtHexApply = $('dtHexApply');
  const markPicker = $('markPicker'), markGrid = $('markGrid');
  const objBtn = $('objBtn'), objPanel = $('objPanel'), objClose = $('objClose'), objGroups = $('objGroups');
  const fasesBtn = $('fasesBtn'), dockCollapse = $('dockCollapse'), dockMini = $('dockMini'), dockExpand = $('dockExpand'), miniName = $('miniName'), miniPrev = $('miniPrev'), miniNext = $('miniNext');
  const confirmModal = $('confirmModal'), confirmMsg = $('confirmMsg'), confirmYes = $('confirmYes'), confirmNo = $('confirmNo');
  const ptModal = $('ptModal'), peDot = $('peDot'), peTitle = $('peTitle'), peClose = $('peClose'), peDesc = $('peDesc'), peIcons = $('peIcons'), peMembers = $('peMembers'), peCount = $('peCount'), peAddSel = $('peAddSel'), peAddBtn = $('peAddBtn');

  const state = { scenarios: [], currentId: null, roster: [], ptDesc: {}, ptIcon: {}, objetivoPosGlobal: {}, gates: {}, side: null, tool: 'select', drawColor: CFG.drawColors[0], drawWidth: CFG.drawWidths[0], present: false, showNames: true };
  let hintDismissed = false, editingPt = null;
  const objGroupOpen = {};   // grupos do painel de objetivos começam colapsados
  const partyById = new Map(CFG.parties.map(p => [p.id, p]));
  const objById = new Map(CFG.objetivos.map(o => [o.id, o]));
  let popoverPt = null, rosterDraft = [];
  let linkTempFrom = null, linkTempArrow = null;   // vínculo em criação (origem + seta-preview)
  let carryPickFor = null;                          // objId da árvore aguardando escolha de carry
  const undoStacks = {}, redoStacks = {};

  const stage = new Konva.Stage({ container: 'stage', width: 10, height: 10 });
  const bgLayer = new Konva.Layer({ listening: false });
  const drawLayer = new Konva.Layer({ listening: false });
  const objLayer = new Konva.Layer();
  const markLayer = new Konva.Layer();
  const tokenLayer = new Konva.Layer();
  const noteLayer = new Konva.Layer();
  // ordem z: fundo < desenhos < tokens (PT/membros/inimigos/vínculos) < OBJETIVOS < carimbos < notas
  // objetivos ficam ACIMA de setas e nomes pra não serem tapados.
  stage.add(bgLayer, drawLayer, tokenLayer, objLayer, markLayer, noteLayer);
  const bgImage = new Konva.Image({ x: 0, y: 0 });
  bgLayer.add(bgImage);
  let W = 10, H = 10, R = 20;
  const mapImg = new Image(), iconImgs = {}, iconKeys = Object.keys(CFG.assets.icons);

  // ---- helpers ----
  function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cur() { return state.scenarios.find(s => s.id === state.currentId) || state.scenarios[0]; }
  function curIndex() { return state.scenarios.findIndex(s => s.id === state.currentId); }
  function newScenario(o) { return Object.assign({ id: uid(), fase: 'Cenário', nome: 'Novo cenário', condicao: null, tokens: [], desenhos: [], marcas: [], objetivos: {}, objetivoPos: {}, destacados: [], links: [], objHp: {}, objBuffs: {}, treeCarry: {}, notas: [], enemies: [], nota: '' }, o || {}); }
  function isPristine(s) { return s && !(s.tokens || []).length && !(s.desenhos || []).length && !(s.marcas || []).length && !(s.nota || '').trim() && !Object.keys(s.objetivos || {}).length && !(s.destacados || []).length && !(s.links || []).length && !Object.keys(s.objHp || {}).length && !(s.notas || []).length && !Object.keys(s.objBuffs || {}).length; }
  function clamp01(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function roleColor(f) { return CFG.roleColors[f] || CFG.roleColors.DPS; }
  function memTags(m) { return Array.isArray(m.tags) ? m.tags : (m.tag2 ? [m.tag2] : []); }
  function memBadges(m) { let s = ''; memTags(m).forEach(tg => s += '<span class="mb-tag">' + esc(tg) + '</span>'); (m.flags || []).forEach(fid => { const f = (CFG.specialFlags || []).find(x => x.id === fid); if (f) s += '<span class="mb-flag" title="' + esc(f.label) + '">' + f.icon + '</span>'; }); return s; }
  function hexA(hex, a) { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; const n = parseInt(m[1], 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  // ---- boot ----
  let ready = 0; const need = 1 + iconKeys.length;
  function done() { if (++ready === need) init(); }
  mapImg.onload = mapImg.onerror = done; mapImg.src = CFG.assets.map;
  iconKeys.forEach(k => { const im = new Image(); iconImgs[k] = im; im.onload = im.onerror = done; im.src = CFG.assets.icons[k]; });
  function setLang(l) {
    if (!I18N[l]) l = 'pt';
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    document.querySelectorAll('#langSel button').forEach(b => b.classList.toggle('active', b.dataset.lang === l));
    applyI18n();
    // re-render dynamic surfaces that hold translated strings
    renderSidebar();
    if (rosterModal && !rosterModal.hidden) { renderBoard(); }
  }

  function init() {
    try { const sl = localStorage.getItem(LANG_KEY); if (sl && I18N[sl]) lang = sl; } catch (e) {}
    applyI18n();
    document.querySelectorAll('#langSel button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    loadProject(); bgImage.image(mapImg); bgLayer.batchDraw(); buildColorSwatches(); buildMarkPicker();
    dockMini.hidden = false;   // mini-nav sempre visível; painel de Fases começa fechado
    renderSidebar(); renderRail(); loadScenarioIntoUI(); fit(); wireEvents(); maybeLoadShared();
    setTimeout(() => { hintDismissed = true; mapHint.classList.add('hide'); }, 5000);   // aviso some em 5s (definitivo)
    setTimeout(() => toast(t('zoomTip')), 900);
  }

  // ---- layout + zoom ----
  function fit() {
    const availW = mapPanel.clientWidth - 20, availH = mapPanel.clientHeight - 20;
    if (availW <= 0 || availH <= 0) return;
    let w = availW, h = w / AR; if (h > availH) { h = availH; w = h * AR; }
    W = Math.round(w); H = Math.round(h); R = Math.max(8, Math.round(W * 0.0125));
    stage.scale({ x: 1, y: 1 }); stage.position({ x: 0, y: 0 });
    stage.size({ width: W, height: H });
    stageWrap.style.width = W + 'px'; stageWrap.style.height = H + 'px';
    bgImage.size({ width: W, height: H }); renderSide();
    hidePopover(); updateStageDrag(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens();
  }
  function clampPos(x, y, s) { const minX = W - W * s, minY = H - H * s; if (s <= 1) return { x: 0, y: 0 }; return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) }; }
  function updateStageDrag() { stage.draggable(stage.scaleX() > 1 && state.tool === 'select'); }
  function zoomBy(factor) { const cx = W / 2, cy = H / 2, old = stage.scaleX(); let ns = Math.max(1, Math.min(4, old * factor)); const mp = { x: (cx - stage.x()) / old, y: (cy - stage.y()) / old }; stage.scale({ x: ns, y: ns }); stage.position(clampPos(cx - mp.x * ns, cy - mp.y * ns, ns)); stage.batchDraw(); updateStageDrag(); hidePopover(); }
  function zoomReset() { stage.scale({ x: 1, y: 1 }); stage.position({ x: 0, y: 0 }); stage.batchDraw(); updateStageDrag(); hidePopover(); }
  function frac() { const p = stage.getPointerPosition(); if (!p) return null; const s = stage.scaleX() || 1; return { xf: clamp01((p.x - stage.x()) / s / W), yf: clamp01((p.y - stage.y()) / s / H) }; }

  // ---- undo (cenário inteiro: tokens, desenhos, objetivos, posições, destacados) ----
  function snap() { const s = cur(); return JSON.stringify({ tokens: s.tokens, desenhos: s.desenhos, marcas: s.marcas || [], objetivos: s.objetivos, objetivoPos: s.objetivoPos, destacados: s.destacados, links: s.links || [], objHp: s.objHp || {}, objBuffs: s.objBuffs || {}, treeCarry: s.treeCarry || {}, notas: s.notas || [], enemies: s.enemies || [], nota: s.nota }); }
  function pushUndo() { const id = cur().id; const st = (undoStacks[id] = undoStacks[id] || []); st.push(snap()); if (st.length > 60) st.shift(); redoStacks[id] = []; }
  function applySnap(json) { const s = cur(), d = JSON.parse(json); s.tokens = d.tokens; s.desenhos = d.desenhos; s.marcas = d.marcas || []; s.objetivos = d.objetivos; s.objetivoPos = d.objetivoPos; s.destacados = d.destacados; s.links = d.links || []; s.objHp = d.objHp || {}; s.objBuffs = d.objBuffs || {}; s.treeCarry = d.treeCarry || {}; s.notas = d.notas || []; s.enemies = d.enemies || []; s.nota = d.nota; loadScenarioIntoUI(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); if (!objPanel.hidden) renderObjPanel(); saveProject(); }
  function doUndo() { const id = cur().id, u = undoStacks[id]; if (!u || !u.length) return; (redoStacks[id] = redoStacks[id] || []).push(snap()); applySnap(u.pop()); }
  function doRedo() { const id = cur().id, r = redoStacks[id]; if (!r || !r.length) return; (undoStacks[id] = undoStacks[id] || []).push(snap()); applySnap(r.pop()); }

  // ---- roster comp / sidebar ----
  function membersOf(pt, reserva) { return state.roster.filter(p => p.pt === pt && !p.ausente && !!p.reserva === reserva); }
  function compCounts(pt) { const c = { Tank: 0, Healer: 0, DPS: 0 }; membersOf(pt, false).forEach(p => { c[p.funcao] = (c[p.funcao] || 0) + 1; }); return c; }
  function renderSidebar() {
    sumAus.textContent = state.roster.filter(p => p.ausente).length;
    sumRes.textContent = state.roster.filter(p => p.reserva && !p.ausente).length;
    sumEsc.textContent = state.roster.filter(p => !p.ausente && !p.reserva && p.pt).length;
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.innerHTML = '';
    CFG.grupos.forEach(g => {
      const gh = document.createElement('div'); gh.className = 'grp-h ' + (g.nome === 'Ataque' ? 'atk' : 'def');
      const gnm = g.nome === 'Ataque' ? t('atk') : (g.nome === 'Defesa' ? t('def') : g.nome);
      gh.innerHTML = '<span class="gn">' + gnm + '</span><span class="gh">' + g.hint + '</span><span class="gline"></span>'; ptList.appendChild(gh);
      g.pts.forEach(pid => {
        const p = partyById.get(pid); if (!p) return;
        const c = compCounts(pid), total = c.Tank + c.Healer + c.DPS, resN = membersOf(pid, true).length;
        const dots = CFG.roleOrder.filter(f => c[f]).map(f => '<span class="cd"><i style="background:' + roleColor(f) + '"></i>' + c[f] + '</span>').join('');
        const compHtml = total ? dots + (resN ? '<span class="cd" style="color:#9aa2b4">+' + resN + ' res</span>' : '') : t('noMembers');
        const chip = document.createElement('div'); chip.className = 'pt-chip' + (placed.includes(pid) ? ' placed' : ''); chip.style.setProperty('--accent', p.cor);
        chip.setAttribute('draggable', 'true'); chip.dataset.pt = pid;
        const desc = state.ptDesc[pid], ic = state.ptIcon[pid];
        const isPl = placed.includes(pid);
        chip.innerHTML = '<span class="dot">' + pid.replace('PT', '') + '</span><span class="lbl"><b>' + (ic ? ptIconHTML(ic) + ' ' : '') + pid + '</b>' + (desc ? '<span class="pt-desc-line">' + esc(desc) + '</span>' : '') + '<span class="comp' + (total ? '' : ' vazia') + '">' + compHtml + '</span></span><span class="status">' + (isPl ? t('onMap') : (isMobile() ? t('tapShort') : t('dragShort'))) + '</span>';
        chip.addEventListener('dragstart', ev => { if (state.present) { ev.preventDefault(); return; } ev.dataTransfer.setData('text/plain', pid); ev.dataTransfer.effectAllowed = 'copy'; });
        chip.addEventListener('click', () => { if (isMobile() && !cur().tokens.some(x => x.pt === pid)) { placeTokenCenter(pid); document.body.classList.remove('mob-roster'); toast(pid + ' ✓'); } else openPtEditor(pid); });
        ptList.appendChild(chip);
      });
    });
  }
  function syncPlacedChips() {
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.querySelectorAll('.pt-chip').forEach(chip => { const on = placed.includes(chip.dataset.pt); chip.classList.toggle('placed', on); chip.querySelector('.status').textContent = on ? t('onMap') : t('dragShort'); });
  }

  // ---- tokens de PT + membros destacados + conectores ----
  function makePtToken(t) {
    const p = partyById.get(t.pt);
    const g = new Konva.Group({ draggable: !state.present, name: 'pt-' + t.pt });
    g.add(new Konva.Circle({ radius: R + 2, fill: p.cor, opacity: 0.14 }));
    g.add(new Konva.Circle({ radius: R, fill: 'rgba(11,14,21,.55)', stroke: p.cor, strokeWidth: Math.max(1.6, R * 0.1), shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.32, shadowOffsetY: 1 }));
    g.add(new Konva.Text({ text: t.pt, fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.round(R * 0.72), fill: p.cor, align: 'center', verticalAlign: 'middle', width: R * 2.4, height: R * 1.4, offsetX: R * 1.2, offsetY: R * 0.7, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.7 }));
    const n = membersOf(t.pt, false).length;
    if (n) { const b = new Konva.Label({ x: R * 0.7, y: R * 0.7 }); b.add(new Konva.Tag({ fill: p.cor, cornerRadius: R * 0.5 })); b.add(new Konva.Text({ text: String(n), fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.round(R * 0.55), fill: '#0a0c11', padding: Math.max(1.5, R * 0.16) })); g.add(b); }
    const pIc = state.ptIcon[t.pt];
    if (pIc && pIc.indexOf('asset:') === 0) { const im = iconImgs[pIc.slice(6)]; if (im && im.width) { const s = R * 1.5, h = s * (im.height / im.width); g.add(new Konva.Image({ image: im, width: s, height: h, offsetX: s / 2, offsetY: h / 2, y: -R * 1.05, shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.4 })); } }
    else if (pIc) g.add(new Konva.Text({ text: pIc, fontSize: R, align: 'center', verticalAlign: 'middle', width: R * 3, height: R * 1.4, offsetX: R * 1.5, offsetY: R * 0.7, y: -R * 0.9 }));
    g.position({ x: t.xf * W, y: t.yf * H });
    // barra de HP da PT (quando < 100)
    if (t.hp != null && t.hp < 100) hpBar(g, t.hp, R + 4, R * 2.1);
    g.on('click tap', e => { e.cancelBubble = true; g.moveToTop(); tokenLayer.batchDraw(); iconClicked('pt:' + t.pt, () => togglePopover(t.pt, g.x(), g.y())); });
    if (!state.present) {
      g.dragBoundFunc(clampToStage);
      g.on('dragstart', () => { pushUndo(); hidePopover(); g.moveToTop(); });
      g.on('dragmove', updateConnectors);
      g.on('dragend', () => { const tk = cur().tokens.find(x => x.pt === t.pt); if (tk) { tk.xf = clamp01(g.x() / W); tk.yf = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => removeToken(t.pt));
      g.on('mouseenter', () => stage.container().style.cursor = 'grab');
      g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
    }
    return g;
  }
  // barrinha de HP reutilizável (com sombra e bom contraste) — anexa ao grupo g
  function hpBar(g, hp, topY, barW) { const bw = Math.max(barW, R), bh = Math.max(3.5, R * 0.2), by = topY + Math.max(2, R * 0.12); const hc = hp > 60 ? '#4CC9A4' : hp > 30 ? '#f0c66b' : '#E25B52'; g.add(new Konva.Rect({ x: -bw / 2, y: by, width: bw, height: bh, cornerRadius: bh / 2, fill: 'rgba(6,8,12,.92)', stroke: 'rgba(255,255,255,.28)', strokeWidth: 0.8, shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.7, shadowOffsetY: 1 })); g.add(new Konva.Rect({ x: -bw / 2, y: by, width: Math.max(bh, bw * hp / 100), height: bh, cornerRadius: bh / 2, fill: hc, shadowColor: hc, shadowBlur: 4, shadowOpacity: 0.5 })); g.add(new Konva.Text({ text: hp + '%', fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.max(9, R * 0.4), fill: hc, align: 'center', width: bw + R * 2, offsetX: (bw + R * 2) / 2, y: by + bh + 1, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.9 })); }
  function makeMemberToken(d) {
    const p = partyById.get(d.pt), rc = roleColor(d.funcao), rm = Math.max(7, R * 0.48), dead = !!d.dead;
    const g = new Konva.Group({ draggable: !state.present, id: 'mem-' + d.id, opacity: dead ? 0.5 : 1 });
    g.add(new Konva.Circle({ radius: rm, fill: 'rgba(11,14,21,.42)', stroke: dead ? '#7a828f' : rc, strokeWidth: Math.max(1.2, rm * 0.13), shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.4, shadowOffsetY: 1 }));
    const ci = iconImgs[(CFG.classIcons || {})[d.funcao]];
    if (ci && ci.width) { const s = rm * 1.92, h = s * (ci.height / ci.width); g.add(new Konva.Image({ image: ci, width: s, height: h, offsetX: s / 2, offsetY: h / 2, opacity: dead ? 0.7 : 1 })); }
    else g.add(new Konva.Text({ text: d.funcao[0], fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: rm * 1.1, fill: rc, align: 'center', verticalAlign: 'middle', width: rm * 2, height: rm * 2, offsetX: rm, offsetY: rm }));
    if (dead) g.add(new Konva.Text({ text: '✕', fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: rm * 1.7, fill: '#E25B52', align: 'center', verticalAlign: 'middle', width: rm * 2, height: rm * 2, offsetX: rm, offsetY: rm, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.8 }));
    if (state.showNames) { const fs = Math.max(8, R * 0.36); const lbl = new Konva.Label({ x: rm + 4, y: -fs * 0.72 }); lbl.add(new Konva.Tag({ fill: 'rgba(8,10,14,.7)', cornerRadius: 4 })); lbl.add(new Konva.Text({ text: d.nome, fontFamily: 'Oswald, sans-serif', fontStyle: '600', fontSize: fs, fill: dead ? '#c9cdd4' : '#EDEBE4', padding: 3, shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.6 })); g.add(lbl); }
    g.position({ x: d.xf * W, y: d.yf * H });
    // se é carry de uma árvore up, gruda na posição da árvore (segue ela)
    const carryTree = carryTreeOf(d.id);
    let pinned = false;
    if (carryTree) { const o = objById.get(carryTree); if (o && (cur().objetivos || {})[carryTree]) { const tp = objPos(o), arr = (cur().treeCarry[carryTree] || []), idx = arr.indexOf(d.id), off = (idx === 0 ? -1 : 1) * rm * 1.5; g.position({ x: tp.x * W + off, y: tp.y * H + rm * 1.4 }); g.draggable(false); pinned = true; } }
    if (d.hp != null && d.hp < 100 && !dead) hpBar(g, d.hp, rm, rm * 2.2);
    g.on('click tap', e => { e.cancelBubble = true; g.moveToTop(); tokenLayer.batchDraw(); iconClicked('mem:' + d.id, () => openMemberMenu(d, g.x(), g.y())); });
    if (!state.present && !pinned) {
      g.dragBoundFunc(clampToStage);
      g.on('dragstart', () => { pushUndo(); g.moveToTop(); });
      g.on('dragmove', updateLinks);
      g.on('dragend', () => { const dd = cur().destacados.find(x => x.id === d.id); if (dd) { dd.xf = clamp01(g.x() / W); dd.yf = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => { pushUndo(); cur().destacados = cur().destacados.filter(x => x.id !== d.id); pruneLinksFor('mem:' + d.id); pruneCarry(d.id); renderTokens(); saveProject(); });
      g.on('mouseenter', () => stage.container().style.cursor = 'grab');
      g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
    }
    return g;
  }
  // ---- token de inimigo (vermelho, com número + rótulo) ----
  function makeEnemyToken(e) {
    const er = Math.max(9, R * 0.8);
    const g = new Konva.Group({ draggable: !state.present, id: 'enemy-' + e.id, name: 'enemy-' + e.id });
    g.add(new Konva.Circle({ radius: er + 2, fill: '#E25B52', opacity: 0.14 }));
    g.add(new Konva.Circle({ radius: er, fill: 'rgba(46,14,14,.66)', stroke: '#E25B52', strokeWidth: Math.max(1.6, er * 0.13), shadowColor: '#000', shadowBlur: 5, shadowOpacity: 0.45, shadowOffsetY: 1 }));
    const hasN = e.n > 0;
    g.add(new Konva.Text({ text: hasN ? String(e.n) : '⚔', fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: er * (hasN ? 1.05 : 1.1), fill: '#ffd9d5', align: 'center', verticalAlign: 'middle', width: er * 2, height: er * 2, offsetX: er, offsetY: er, shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.75 }));
    g.position({ x: e.x * W, y: e.y * H });
    if (e.label && state.showNames) { const fs = Math.max(8, R * 0.36); const lbl = new Konva.Label({ x: er + 4, y: -fs * 0.72 }); lbl.add(new Konva.Tag({ fill: 'rgba(30,8,8,.78)', cornerRadius: 4 })); lbl.add(new Konva.Text({ text: e.label, fontFamily: 'Oswald, sans-serif', fontStyle: '600', fontSize: fs, fill: '#ffd9d5', padding: 3, shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.6 })); g.add(lbl); }
    g.on('click tap', ev => { ev.cancelBubble = true; if (linkTempFrom || carryPickFor) return; g.moveToTop(); tokenLayer.batchDraw(); openEnemyMenu(e, g.x(), g.y()); });
    if (!state.present) {
      g.dragBoundFunc(clampToStage);
      g.on('dragstart', () => { pushUndo(); g.moveToTop(); });
      g.on('dragend', () => { const ee = (cur().enemies || []).find(x => x.id === e.id); if (ee) { ee.x = clamp01(g.x() / W); ee.y = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => { pushUndo(); cur().enemies = (cur().enemies || []).filter(x => x.id !== e.id); renderTokens(); saveProject(); });
      g.on('mouseenter', () => stage.container().style.cursor = 'grab');
      g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
    }
    return g;
  }
  function placeEnemy() {
    if (state.present) return; const f = frac(); if (!f) return;
    pushUndo(); cur().enemies = cur().enemies || [];
    const e = { id: uid(), x: f.xf, y: f.yf, n: 1, label: '' };
    cur().enemies.push(e); hintDismissed = true; setTool('select'); renderTokens(); saveProject();
    const g = tokenLayer.findOne('#enemy-' + e.id); openEnemyMenu(e, g ? g.x() : f.xf * W, g ? g.y() : f.yf * H);
  }
  function openEnemyMenu(e, x, y) {
    if (!iconMenu || state.present) return; hidePopover();
    let h = '<div class="im-hd"><span class="im-dot" style="background:#E25B52"></span><b>' + t('enemyTitle') + '</b><button class="im-x" data-act="close">✕</button></div>';
    h += '<div class="im-sec">' + t('enemyCount') + '</div><div class="im-step"><button data-d="-1">−</button><span class="im-stepv">' + (e.n || 0) + '</span><button data-d="1">+</button></div>';
    h += '<input class="im-elabel" placeholder="' + t('enemyLabel') + '" value="' + esc(e.label || '') + '">';
    h += '<div class="im-actions"><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.innerHTML = h; iconMenu.hidden = false; placeIconMenu(x, y);
    iconMenu.querySelectorAll('.im-step button').forEach(b => b.addEventListener('click', () => { pushUndo(); e.n = Math.max(0, Math.min(99, (e.n || 0) + (+b.dataset.d))); iconMenu.querySelector('.im-stepv').textContent = e.n; renderTokens(); saveProject(); }));
    iconMenu.querySelector('.im-elabel').addEventListener('input', ev => { e.label = ev.target.value.slice(0, 24); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="remove"]').addEventListener('click', () => { pushUndo(); cur().enemies = (cur().enemies || []).filter(x => x.id !== e.id); closeIconMenu(); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="close"]').addEventListener('click', closeIconMenu);
  }
  // ---- nosso lado (Azul/Oeste ou Vermelho/Leste): destaque leve da nossa metade ----
  function renderSide() {
    bgLayer.find('.side-ov').forEach(n => n.destroy());
    if (state.side) {
      const west = state.side === 'blue';
      bgLayer.add(new Konva.Rect({ name: 'side-ov', x: west ? 0 : W / 2, y: 0, width: W / 2, height: H, fill: west ? 'rgba(106,168,224,0.10)' : 'rgba(226,91,82,0.10)', listening: false }));
      bgLayer.add(new Konva.Line({ name: 'side-ov', points: [W / 2, 0, W / 2, H], stroke: 'rgba(255,255,255,0.14)', strokeWidth: Math.max(1, R * 0.05), dash: [8, 8], listening: false }));
    }
    bgLayer.batchDraw();
    updateSideChip();
  }
  function updateSideChip() { const c = $('sideChip'); if (!c) return; const west = state.side === 'blue'; c.className = 'side-chip' + (state.side ? (' on ' + state.side) : ''); c.innerHTML = state.side ? ('<b>' + t('usLbl') + '</b> ' + (west ? '🔵 ' + t('westLbl') : '🔴 ' + t('eastLbl'))) : t('sidePick'); }
  function cycleSide() { state.side = state.side === 'blue' ? 'red' : (state.side === 'red' ? null : 'blue'); renderSide(); saveProject(); }
  function clampToStage(pos) { return { x: Math.max(0, Math.min(W, pos.x)), y: Math.max(0, Math.min(H, pos.y)) }; }
  function ptPos(pt) { const t = (cur().tokens || []).find(x => x.pt === pt); return t ? { x: t.xf * W, y: t.yf * H } : null; }
  function renderTokens() {
    tokenLayer.destroyChildren();
    const toks = cur() ? cur().tokens : [];
    renderLinks();                                    // vínculos ficam por baixo dos tokens
    toks.forEach(t => tokenLayer.add(makePtToken(t)));
    (cur() ? cur().destacados : []).forEach(d => { if (ptPos(d.pt)) tokenLayer.add(makeMemberToken(d)); });
    (cur() ? cur().enemies : []).forEach(e => tokenLayer.add(makeEnemyToken(e)));
    if (linkTempFrom) tokenLayer.add(linkTempArrow);  // preview de vínculo por cima
    tokenLayer.batchDraw(); syncPlacedChips();
    mapHint.classList.toggle('hide', hintDismissed || toks.length > 0 || (cur() && cur().desenhos.length) || state.present);
  }
  // ---- vínculos genéricos entre ícones (PT / objetivo / membro) ----
  function anchorLivePos(ref) {
    const i = (ref || '').indexOf(':'); if (i < 0) return null; const ty = ref.slice(0, i), id = ref.slice(i + 1);
    if (ty === 'pt') { const n = tokenLayer.findOne('.pt-' + id); if (n) return { x: n.x(), y: n.y() }; return ptPos(id); }
    if (ty === 'mem') { const n = tokenLayer.findOne('#mem-' + id); if (n) return { x: n.x(), y: n.y() }; const d = (cur().destacados || []).find(x => x.id === id); return (d && ptPos(d.pt)) ? { x: d.xf * W, y: d.yf * H } : null; }
    if (ty === 'obj') { const n = objLayer.findOne('.obj-' + id); if (n) return { x: n.x(), y: n.y() }; const o = objById.get(id); if (o && (cur().objetivos || {})[id]) { const p = objPos(o); return { x: p.x * W, y: p.y * H }; } return null; }
    return null;
  }
  function anchorColor(ref) { const i = (ref || '').indexOf(':'); if (i < 0) return '#D9A441'; const ty = ref.slice(0, i), id = ref.slice(i + 1); if (ty === 'pt') { const p = partyById.get(id); return p ? p.cor : '#D9A441'; } if (ty === 'mem') { const d = (cur().destacados || []).find(x => x.id === id); return d ? roleColor(d.funcao) : '#D9A441'; } if (ty === 'obj') { const o = objById.get(id); return o ? objStyle(o).c : '#D9A441'; } return '#D9A441'; }
  // raio aproximado de cada ícone (pra seta parar na borda, não por cima)
  function anchorRadius(ref) { const i = (ref || '').indexOf(':'); const ty = ref.slice(0, i), id = ref.slice(i + 1); const os = Math.max(13, W * 0.025); if (ty === 'pt') return R + 5; if (ty === 'mem') return Math.max(8, R * 0.56) + 3; if (ty === 'obj') { const o = objById.get(id); const sc = o && o.icone && o.icone.indexOf('tower') === 0 ? 1.25 : (o && o.icone === 'boss' ? 1.5 : 1); return os * sc * 0.55; } return R; }
  function linkPts(l) { const a = anchorLivePos(l.a), b = anchorLivePos(l.b); if (!a || !b) return null; const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, ra = anchorRadius(l.a), rb = anchorRadius(l.b); if (len <= ra + rb + 6) return [a.x, a.y, b.x, b.y]; return [a.x + ux * ra, a.y + uy * ra, b.x - ux * rb, b.y - uy * rb]; }
  function renderLinks() {
    (cur() ? cur().links : []).forEach(l => {
      const pts = linkPts(l); if (!pts) return;
      const col = anchorColor(l.a);
      const arr = new Konva.Arrow({ name: 'link-' + l.id, points: pts, stroke: col, fill: col, strokeWidth: Math.max(2.4, R * 0.17), pointerLength: Math.max(7, R * 0.5), pointerWidth: Math.max(7, R * 0.5), opacity: 0.95, dash: [Math.max(7, R * 0.5), Math.max(5, R * 0.34)], hitStrokeWidth: Math.max(16, R * 1.1), listening: !state.present, shadowColor: '#000', shadowBlur: Math.max(3, R * 0.28), shadowOpacity: 0.55, shadowOffsetY: 1 });
      if (!state.present) { arr.on('click tap', e => { e.cancelBubble = true; if (linkTempFrom) return; removeLink(l.id); }); arr.on('mouseenter', () => stage.container().style.cursor = 'pointer'); arr.on('mouseleave', () => stage.container().style.cursor = toolCursor()); }
      tokenLayer.add(arr);
    });
  }
  function updateLinks() { (cur() ? cur().links : []).forEach(l => { const ln = tokenLayer.findOne('.link-' + l.id); if (!ln) return; const pts = linkPts(l); if (pts) ln.points(pts); }); if (linkTempFrom) updateLinkTemp(); tokenLayer.batchDraw(); }
  function updateConnectors() { updateLinks(); }
  function removeLink(id) { pushUndo(); cur().links = (cur().links || []).filter(l => l.id !== id); renderTokens(); saveProject(); toast('Vínculo removido'); }
  function pruneLinksFor(ref) { const s = cur(); if (s.links) s.links = s.links.filter(l => l.a !== ref && l.b !== ref); }
  function pruneCarry(memId) { const tc = cur().treeCarry; if (!tc) return; Object.keys(tc).forEach(k => { tc[k] = (tc[k] || []).filter(x => x !== memId); if (!tc[k].length) delete tc[k]; }); }
  // clique em qualquer ícone: se estiver criando vínculo, fecha o vínculo; senão abre o menu
  function iconClicked(ref, openFn) { if (linkTempFrom) { finishLink(ref); return; } if (carryPickFor) { if (ref.indexOf('mem:') === 0) addTreeCarry(carryPickFor, ref.slice(4)); carryPickFor = null; document.body.classList.remove('linking'); return; } openFn(); }
  function carryTreeOf(memId) { const tc = cur().treeCarry || {}; for (const k in tc) { if ((tc[k] || []).indexOf(memId) >= 0) return k; } return null; }
  function addTreeCarry(objId, memId) { const s = cur(); s.treeCarry = s.treeCarry || {}; const prev = carryTreeOf(memId); if (prev) s.treeCarry[prev] = (s.treeCarry[prev] || []).filter(x => x !== memId); const arr = s.treeCarry[objId] = s.treeCarry[objId] || []; if (arr.indexOf(memId) < 0) { if (arr.length >= 2) { toast(t('carryMax')); return; } pushUndo(); arr.push(memId); saveProject(); renderTokens(); toast(t('carrySet')); } }
  function removeTreeCarry(objId, memId) { const s = cur(); if (s.treeCarry && s.treeCarry[objId]) { pushUndo(); s.treeCarry[objId] = s.treeCarry[objId].filter(x => x !== memId); if (!s.treeCarry[objId].length) delete s.treeCarry[objId]; saveProject(); renderTokens(); } }
  function buildLinkTemp(ref) { if (linkTempArrow) { linkTempArrow.destroy(); } linkTempFrom = ref; const from = anchorLivePos(ref) || { x: W / 2, y: H / 2 }; linkTempArrow = new Konva.Arrow({ points: [from.x, from.y, from.x, from.y], stroke: '#f0c66b', fill: '#f0c66b', strokeWidth: Math.max(2.4, R * 0.17), pointerLength: Math.max(7, R * 0.5), pointerWidth: Math.max(7, R * 0.5), dash: [Math.max(6, R * 0.4), Math.max(4, R * 0.3)], opacity: 0.85, listening: false, shadowColor: '#000', shadowBlur: Math.max(3, R * 0.28), shadowOpacity: 0.5 }); }
  function startLink(ref) {
    if (state.present) return;
    hidePopover(); closeIconMenu();
    buildLinkTemp(ref);
    document.body.classList.add('linking');
    renderTokens();
    toast(t('linkPick'));
  }
  function updateLinkTemp() {
    if (!linkTempFrom || !linkTempArrow) return;
    const from = anchorLivePos(linkTempFrom); if (!from) return;
    const p = stage.getPointerPosition(); let ex = from.x, ey = from.y;
    if (p) { const s = stage.scaleX() || 1; ex = (p.x - stage.x()) / s; ey = (p.y - stage.y()) / s; }
    const dx = ex - from.x, dy = ey - from.y, len = Math.hypot(dx, dy) || 1, ra = anchorRadius(linkTempFrom);
    const sx = len > ra ? from.x + dx / len * ra : from.x, sy = len > ra ? from.y + dy / len * ra : from.y;
    linkTempArrow.points([sx, sy, ex, ey]);
  }
  function finishLink(ref) {
    const src = linkTempFrom;
    if (!src) { return; }
    if (!ref || ref === src) { return; }            // toque em vazio/origem: continua armado
    const s = cur(); s.links = s.links || [];
    if (s.links.some(l => (l.a === src && l.b === ref) || (l.a === ref && l.b === src))) { toast(t('linkDup')); return; }
    pushUndo(); s.links.push({ id: uid(), a: src, b: ref }); saveProject();
    buildLinkTemp(src);                              // permanece armado na MESMA origem (encadear/leque)
    renderTokens(); toast(t('linkDone'));
  }
  function cancelLink() { linkTempFrom = null; if (linkTempArrow) { linkTempArrow.destroy(); linkTempArrow = null; } document.body.classList.remove('linking'); }

  // ---- menu de ícone (objetivo / membro): HP + vincular + remover ----
  function closeIconMenu() { if (iconMenu) { iconMenu.hidden = true; iconMenu.innerHTML = ''; } }
  function placeIconMenu(x, y) {
    const s = stage.scaleX() || 1, vx = stage.x() + x * s, vy = stage.y() + y * s;
    const px = stageWrap.offsetLeft + vx + 14, py = stageWrap.offsetTop + vy - 10;
    iconMenu.style.left = Math.max(8, Math.min(px, mapPanel.clientWidth - iconMenu.offsetWidth - 8)) + 'px';
    iconMenu.style.top = Math.max(8, Math.min(py, mapPanel.clientHeight - iconMenu.offsetHeight - 8)) + 'px';
  }
  function openObjMenu(o, x, y) {
    if (!iconMenu || state.present) return;
    hidePopover();
    const st = objStyle(o), hp = (cur().objHp || {})[o.id];
    const cur_hp = hp == null ? 100 : hp;
    let h = '<div class="im-hd"><span class="im-dot" style="background:' + st.c + '"></span><b>' + esc(o.rotulo || o.id) + '</b><button class="im-x" data-act="close">✕</button></div>';
    h += '<div class="im-sec">' + t('menuHp') + '</div>';
    h += '<div class="im-hp"><input type="range" class="im-range" min="0" max="100" step="5" value="' + cur_hp + '"><span class="im-hpv">' + cur_hp + '%</span></div>';
    h += '<div class="im-quick">' + [100, 75, 50, 25, 0].map(v => '<button data-hp="' + v + '"' + (cur_hp === v ? ' class="on"' : '') + '>' + v + '</button>').join('') + '</div>';
    const buffs = objBuffsFor(o);
    if (buffs.length) { const act = (cur().objBuffs || {})[o.id] || []; h += '<div class="im-sec">' + t('buffs') + '</div><div class="im-buffs">'; buffs.forEach(bf => { h += '<button class="im-buff' + (act.includes(bf.id) ? ' on' : '') + '" data-buff="' + bf.id + '">' + bf.icon + ' ' + esc(bf.label) + '</button>'; }); h += '</div>'; }
    const isTree = o.icone && o.icone.indexOf('tree') === 0;
    if (isTree) { const carries = (cur().treeCarry || {})[o.id] || []; h += '<div class="im-sec">' + t('carryTitle') + '</div><div class="im-carry">'; carries.forEach(mid => { const d = (cur().destacados || []).find(x => x.id === mid); h += '<span class="im-cchip">' + esc(d ? d.nome : '—') + '<button data-carryrm="' + mid + '">✕</button></span>'; }); if (carries.length < 2) h += '<button class="im-cadd" data-act="carryadd">+ ' + t('carryAdd') + '</button>'; h += '</div>'; }
    h += '<div class="im-actions"><button class="im-link" data-act="link">' + t('menuLink') + '</button><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.innerHTML = h; iconMenu.hidden = false; placeIconMenu(x, y);
    if (isTree) { const ca = iconMenu.querySelector('[data-act="carryadd"]'); if (ca) ca.addEventListener('click', () => { carryPickFor = o.id; closeIconMenu(); document.body.classList.add('linking'); toast(t('carryPick')); }); iconMenu.querySelectorAll('[data-carryrm]').forEach(bt => bt.addEventListener('click', () => { removeTreeCarry(o.id, bt.dataset.carryrm); openObjMenu(o, x, y); })); }
    iconMenu.querySelectorAll('.im-buff').forEach(bt => bt.addEventListener('click', () => { pushUndo(); cur().objBuffs = cur().objBuffs || {}; const arr = cur().objBuffs[o.id] = cur().objBuffs[o.id] || []; const id = bt.dataset.buff, i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id); if (!arr.length) delete cur().objBuffs[o.id]; bt.classList.toggle('on', ((cur().objBuffs[o.id] || []).indexOf(id) >= 0)); renderObjectives(); saveProject(); }));
    const setHp = v => { v = Math.max(0, Math.min(100, Math.round(v / 5) * 5)); cur().objHp = cur().objHp || {}; if (v === 100) delete cur().objHp[o.id]; else cur().objHp[o.id] = v; iconMenu.querySelector('.im-range').value = v; iconMenu.querySelector('.im-hpv').textContent = v + '%'; iconMenu.querySelectorAll('.im-quick button').forEach(b => b.classList.toggle('on', +b.dataset.hp === v)); renderObjectives(); saveProject(); };
    let hpUndoPushed = false;
    iconMenu.querySelector('.im-range').addEventListener('input', e => { if (!hpUndoPushed) { pushUndo(); hpUndoPushed = true; } setHp(+e.target.value); });
    iconMenu.querySelectorAll('.im-quick button').forEach(b => b.addEventListener('click', () => { pushUndo(); setHp(+b.dataset.hp); }));
    iconMenu.querySelector('[data-act="link"]').addEventListener('click', () => startLink('obj:' + o.id));
    iconMenu.querySelector('[data-act="remove"]').addEventListener('click', () => { pushUndo(); delete cur().objetivos[o.id]; if (cur().objetivoPos) delete cur().objetivoPos[o.id]; if (cur().objHp) delete cur().objHp[o.id]; pruneLinksFor('obj:' + o.id); closeIconMenu(); renderObjectives(); renderTokens(); if (!objPanel.hidden) renderObjPanel(); saveProject(); });
    iconMenu.querySelector('[data-act="close"]').addEventListener('click', closeIconMenu);
  }
  function openMemberMenu(d, x, y) {
    if (!iconMenu || state.present) return;
    hidePopover();
    const chp = d.hp == null ? 100 : d.hp;
    let h = '<div class="im-hd"><span class="im-dot" style="background:' + roleColor(d.funcao) + '"></span><b>' + esc(d.nome) + '</b><button class="im-x" data-act="close">✕</button></div>';
    h += '<button class="im-dead' + (d.dead ? ' on' : '') + '" data-act="dead">💀 ' + t('dead') + '</button>';
    h += '<div class="im-sec">' + t('menuHp') + '</div>';
    h += '<div class="im-hp"><input type="range" class="im-range" min="0" max="100" step="5" value="' + chp + '"' + (d.dead ? ' disabled' : '') + '><span class="im-hpv">' + chp + '%</span></div>';
    h += '<div class="im-quick">' + [100, 75, 50, 25, 0].map(v => '<button data-hp="' + v + '"' + (chp === v ? ' class="on"' : '') + '>' + v + '</button>').join('') + '</div>';
    h += '<div class="im-actions"><button class="im-link" data-act="link">' + t('menuLink') + '</button><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.innerHTML = h; iconMenu.hidden = false; placeIconMenu(x, y);
    const setHp = v => { v = Math.max(0, Math.min(100, Math.round(v / 5) * 5)); if (v === 100) delete d.hp; else d.hp = v; iconMenu.querySelector('.im-range').value = v; iconMenu.querySelector('.im-hpv').textContent = v + '%'; iconMenu.querySelectorAll('.im-quick button').forEach(b => b.classList.toggle('on', +b.dataset.hp === v)); renderTokens(); saveProject(); };
    let pushed = false;
    iconMenu.querySelector('.im-range').addEventListener('input', e => { if (!pushed) { pushUndo(); pushed = true; } setHp(+e.target.value); });
    iconMenu.querySelectorAll('.im-quick button').forEach(b => b.addEventListener('click', () => { pushUndo(); setHp(+b.dataset.hp); }));
    iconMenu.querySelector('[data-act="dead"]').addEventListener('click', () => { pushUndo(); d.dead = !d.dead; closeIconMenu(); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="link"]').addEventListener('click', () => startLink('mem:' + d.id));
    iconMenu.querySelector('[data-act="remove"]').addEventListener('click', () => { pushUndo(); cur().destacados = cur().destacados.filter(x => x.id !== d.id); pruneLinksFor('mem:' + d.id); pruneCarry(d.id); closeIconMenu(); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="close"]').addEventListener('click', closeIconMenu);
  }
  function placeToken(pt, xf, yf) { if (!partyById.has(pt) || state.present) return; hintDismissed = true; pushUndo(); const toks = cur().tokens, ex = toks.find(t => t.pt === pt); if (ex) { ex.xf = clamp01(xf); ex.yf = clamp01(yf); } else toks.push({ pt, xf: clamp01(xf), yf: clamp01(yf) }); renderTokens(); saveProject(); }
  function isMobile() { return window.matchMedia('(max-width:860px)').matches; }
  function placeTokenCenter(pt) { const s = stage.scaleX() || 1; const xf = clamp01(((W / 2) - stage.x()) / s / W), yf = clamp01(((H / 2) - stage.y()) / s / H); placeToken(pt, xf, yf); }
  function removeToken(pt) { pushUndo(); const s = cur(); const memObjs = s.destacados.filter(d => d.pt === pt); const memIds = memObjs.map(d => 'mem:' + d.id); memObjs.forEach(d => pruneCarry(d.id)); s.tokens = s.tokens.filter(t => t.pt !== pt); s.destacados = s.destacados.filter(d => d.pt !== pt); const drop = new Set(['pt:' + pt].concat(memIds)); if (s.links) s.links = s.links.filter(l => !drop.has(l.a) && !drop.has(l.b)); hidePopover(); renderTokens(); saveProject(); }
  function detachMember(pt, nome, funcao, xf, yf) { if (!ptPos(pt)) return; pushUndo(); const id = uid(); cur().destacados.push({ id, pt, nome, funcao, xf: clamp01(xf), yf: clamp01(yf) }); cur().links = cur().links || []; cur().links.push({ id: uid(), a: 'pt:' + pt, b: 'mem:' + id }); hidePopover(); renderTokens(); saveProject(); }

  // ---- popover ----
  function togglePopover(pt, x, y) {
    closeIconMenu();
    if (popoverPt === pt && !ptPopover.hidden) { hidePopover(); return; }
    const p = partyById.get(pt), tit = membersOf(pt, false), res = membersOf(pt, true);
    let html = '<h4><span class="pd" style="background:' + p.cor + '"></span>' + (state.ptIcon[pt] ? ptIconHTML(state.ptIcon[pt]) + ' ' : '') + pt + (state.present ? '' : '<button class="po-edit">editar</button>') + '</h4>';
    if (state.ptDesc[pt]) html += '<div class="po-desc">' + esc(state.ptDesc[pt]) + '</div>';
    const tk = (cur().tokens || []).find(x => x.pt === pt);
    if (tk && !state.present) { const chp = tk.hp == null ? 100 : tk.hp; html += '<div class="po-hp"><span class="po-hp-l">' + t('menuHp') + ' <b>' + chp + '%</b></span><input type="range" class="po-range" min="0" max="100" step="5" value="' + chp + '"></div>'; }
    if (!state.present) html += '<button class="po-link" data-act="link">' + t('menuLink') + '</button>';
    if (!tit.length && !res.length) html += '<div class="empty">Sem membros. Defina no roster.</div>';
    else {
      html += '<ul>';
      tit.forEach(m => html += '<li class="mem"' + (state.present ? '' : ' draggable="true"') + ' data-nome="' + esc(m.nome) + '" data-fn="' + m.funcao + '"><span class="rl" style="background:' + roleColor(m.funcao) + '"></span>' + esc(m.nome) + memBadges(m) + '<span class="tag">' + esc(m.funcao) + '</span></li>');
      res.forEach(m => html += '<li class="res"><span class="rl" style="background:' + roleColor(m.funcao) + ';opacity:.5"></span>' + esc(m.nome) + '<span class="tag">reserva</span></li>');
      html += '</ul>';
      if (!state.present) html += '<div class="phint">Arraste um membro para fora → ele sai ligado à PT por um traço.</div>';
    }
    ptPopover.innerHTML = html; ptPopover.hidden = false;
    ptPopover.querySelectorAll('li.mem[draggable]').forEach(li => li.addEventListener('dragstart', ev => { ev.dataTransfer.setData('text/member', JSON.stringify({ pt, nome: li.dataset.nome, funcao: li.dataset.fn })); ev.dataTransfer.effectAllowed = 'copy'; }));
    const eb = ptPopover.querySelector('.po-edit'); if (eb) eb.addEventListener('click', () => { hidePopover(); openPtEditor(pt); });
    const lb = ptPopover.querySelector('.po-link'); if (lb) lb.addEventListener('click', () => startLink('pt:' + pt));
    const rg = ptPopover.querySelector('.po-range'); if (rg && tk) { let pushed = false; rg.addEventListener('input', e => { if (!pushed) { pushUndo(); pushed = true; } let v = Math.max(0, Math.min(100, Math.round(+e.target.value / 5) * 5)); if (v === 100) delete tk.hp; else tk.hp = v; const lbl = ptPopover.querySelector('.po-hp-l b'); if (lbl) lbl.textContent = v + '%'; renderTokens(); saveProject(); }); }
    const s = stage.scaleX() || 1, vx = stage.x() + x * s, vy = stage.y() + y * s;
    const px = stageWrap.offsetLeft + vx + R * s + 8, py = stageWrap.offsetTop + vy - 10;
    ptPopover.style.left = Math.max(8, Math.min(px, mapPanel.clientWidth - ptPopover.offsetWidth - 8)) + 'px';
    ptPopover.style.top = Math.max(8, Math.min(py, mapPanel.clientHeight - ptPopover.offsetHeight - 8)) + 'px';
    popoverPt = pt;
  }
  function hidePopover() { ptPopover.hidden = true; popoverPt = null; }

  // ---- objetivos ----
  function objPos(o) { if (o.movel) { const p = cur().objetivoPos && cur().objetivoPos[o.id]; if (p) return { x: p.x, y: p.y }; } else { const g = state.objetivoPosGlobal[o.id]; if (g) return { x: g.x, y: g.y }; } return { x: o.x, y: o.y }; }
  const OBJ_STYLE = { tower_blue: { c: '#6aa8e0', t: 'T' }, tower_red: { c: '#e0685a', t: 'T' }, goose_blue: { c: '#5ec8d8', t: 'G' }, goose_red: { c: '#e0685a', t: 'G' }, tree_blue: { c: '#5bc98a', t: 'A' }, tree_red: { c: '#e0685a', t: 'A' }, boss: { c: '#f0c66b', t: 'B' }, outpost: { c: '#b98be0', t: '🚩', emoji: true }, jungle: { c: '#8fc06a', t: 'JG' } };
  function objStyle(o) { return OBJ_STYLE[o.icone] || { c: '#9aa2b4', t: '?' }; }
  function objBuffsFor(o) { if (!o || !o.icone || !CFG.objBuffs) return []; if (o.icone.indexOf('tower') === 0) return CFG.objBuffs.tower || []; if (o.icone.indexOf('goose') === 0) return CFG.objBuffs.goose || []; if (o.icone.indexOf('tree') === 0) return CFG.objBuffs.tree || []; return []; }
  function gatePos(o) { const g = state.gates && state.gates[o.id]; return g ? { x: g.x, y: g.y } : { x: o.caminho.b[0], y: o.caminho.b[1] }; }
  function treeMeters(o, xf, yf) { const a = o.caminho.a, b = gatePos(o), ax = b.x - a[0], ay = b.y - a[1]; const t = ((xf - a[0]) * ax + (yf - a[1]) * ay) / (ax * ax + ay * ay || 1); return Math.round(Math.max(0, Math.min(1, t)) * CFG.treeMeters); }
  function renderObjectives() {
    objLayer.destroyChildren();
    const up = cur() ? (cur().objetivos || {}) : {}, os = Math.max(13, W * 0.025);
    CFG.objetivos.forEach(o => {
      if (!up[o.id]) return;
      const pos = objPos(o);
      if (o.caminho) { const gp = gatePos(o); objLayer.add(new Konva.Line({ points: [o.caminho.a[0] * W, o.caminho.a[1] * H, gp.x * W, gp.y * H], stroke: hexA(o.icone === 'tree_red' ? '#E25B52' : '#89ABC5', 0.45), strokeWidth: Math.max(1, R * 0.06), dash: [4, 6], listening: false, name: 'treepath-' + o.id })); if (!state.present && state.tool === 'select') { const gh = new Konva.Group({ x: gp.x * W, y: gp.y * H, draggable: true, name: 'gate-' + o.id }); gh.add(new Konva.Rect({ width: os * 0.5, height: os * 0.9, offsetX: os * 0.25, offsetY: os * 0.45, cornerRadius: 2, fill: 'rgba(240,198,107,.18)', stroke: '#f0c66b', strokeWidth: Math.max(1.4, os * 0.06), dash: [3, 3] })); gh.add(new Konva.Text({ text: '⛩', fontSize: os * 0.5, offsetX: os * 0.25, offsetY: os * 0.3, opacity: 0.9 })); gh.dragBoundFunc(clampToStage); gh.on('dragstart', () => { pushUndo(); }); gh.on('dragmove', () => { const t2 = objLayer.findOne('.treepath-' + o.id); if (t2) t2.points([o.caminho.a[0] * W, o.caminho.a[1] * H, gh.x(), gh.y()]); const on = objLayer.findOne('.obj-' + o.id); if (on) { const tm = on.findOne('.tm'); if (tm) { state.gates[o.id] = { x: clamp01(gh.x() / W), y: clamp01(gh.y() / H) }; const op = objPos(o); tm.findOne('Text').text(treeMeters(o, op.x, op.y) + 'm'); tm.offsetX(tm.getClientRect({ skipTransform: true }).width / 2); } } objLayer.batchDraw(); }); gh.on('dragend', () => { state.gates[o.id] = { x: clamp01(gh.x() / W), y: clamp01(gh.y() / H) }; renderObjectives(); saveProject(); }); gh.on('mouseenter', () => stage.container().style.cursor = 'grab'); gh.on('mouseleave', () => stage.container().style.cursor = toolCursor()); objLayer.add(gh); } }
      const canDrag = !state.present && state.tool === 'select';
      const g = new Konva.Group({ x: pos.x * W, y: pos.y * H, draggable: canDrag, name: 'obj-' + o.id });
      const img = iconImgs[o.icone];
      // escala por tipo de ícone: torres 1.25x, boss 1.5x (o restante 1x)
      const osz = os * (o.icone && o.icone.indexOf('tower') === 0 ? 1.25 : o.icone === 'boss' ? 1.5 : 1);
      let iconH = osz;
      if (img && img.width) { const h = osz * (img.height / img.width); iconH = h; g.add(new Konva.Image({ image: img, width: osz, height: h, offsetX: osz / 2, offsetY: h / 2, scaleX: o.flip ? -1 : 1, shadowColor: '#000', shadowBlur: 5, shadowOpacity: 0.35, shadowOffsetY: 1 })); }
      else { const st = objStyle(o); iconH = os * 0.88; g.add(new Konva.Circle({ radius: os * 0.44, fill: 'rgba(12,15,22,.62)', stroke: st.c, strokeWidth: Math.max(2, os * 0.08), shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.4 })); g.add(new Konva.Text({ text: st.t, fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: os * (st.emoji ? 0.5 : st.t.length > 1 ? 0.3 : 0.42), fill: st.emoji ? undefined : st.c, align: 'center', verticalAlign: 'middle', width: os * 1.6, height: os, offsetX: os * 0.8, offsetY: os / 2 })); }
      if (o.caminho) { const ml = new Konva.Label({ name: 'tm', y: os * 0.52 }); ml.add(new Konva.Tag({ fill: 'rgba(10,12,17,.82)', cornerRadius: 3, pointerDirection: 'up', pointerWidth: 5, pointerHeight: 4 })); ml.add(new Konva.Text({ text: treeMeters(o, pos.x, pos.y) + 'm', fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.max(9, os * 0.26), fill: '#f0c66b', padding: 3 })); ml.offsetX(ml.getClientRect({ skipTransform: true }).width / 2); g.add(ml); }
      // barra de HP (quando < 100%) — árvore mostra em cima pra não bater no medidor de metros
      const hp = (cur().objHp || {})[o.id];
      if (hp != null && hp < 100) { const bw = Math.max(osz * 0.98, os * 0.92), bh = Math.max(4, os * 0.16), by = o.caminho ? (-iconH / 2 - bh - Math.max(9, os * 0.28)) : (iconH / 2 + Math.max(2, os * 0.12)); const hc = hp > 60 ? '#4CC9A4' : hp > 30 ? '#f0c66b' : '#E25B52'; g.add(new Konva.Rect({ x: -bw / 2, y: by, width: bw, height: bh, cornerRadius: bh / 2, fill: 'rgba(6,8,12,.92)', stroke: 'rgba(255,255,255,.3)', strokeWidth: 0.8, shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.7, shadowOffsetY: 1 })); g.add(new Konva.Rect({ x: -bw / 2, y: by, width: Math.max(bh, bw * hp / 100), height: bh, cornerRadius: bh / 2, fill: hc, shadowColor: hc, shadowBlur: 4, shadowOpacity: 0.5 })); g.add(new Konva.Text({ text: hp + '%', fontFamily: 'Oswald, sans-serif', fontStyle: '700', fontSize: Math.max(9, os * 0.28), fill: hc, align: 'center', width: bw + os * 2, offsetX: (bw + os * 2) / 2, y: by + bh + 1, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.9 })); }
      // selos de buff ativos (City Protection / You Got a Problem / Hair Pulling) acima do ícone
      const abuffs = (cur().objBuffs || {})[o.id] || [];
      if (abuffs.length) {
        const defs = objBuffsFor(o), shown = abuffs.map(id => defs.find(d => d.id === id)).filter(Boolean);
        const br = Math.max(7, os * 0.4), gap = br * 2 + Math.max(1, os * 0.06), tot = (shown.length - 1) * gap, by = -iconH / 2 - br * 0.35;
        shown.forEach((def, i) => {
          const bx = -tot / 2 + i * gap;
          g.add(new Konva.Circle({ x: bx, y: by, radius: br, fill: 'rgba(10,12,17,.55)', stroke: 'rgba(240,198,107,.7)', strokeWidth: Math.max(0.8, os * 0.04), shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.45 }));
          g.add(new Konva.Text({ text: def.icon, fontFamily: '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji","Twemoji Mozilla",sans-serif', fontSize: br * 1.24, x: bx - br, y: by - br, width: br * 2, height: br * 2, align: 'center', verticalAlign: 'middle' }));
        });
      }
      g.on('click tap', e => { e.cancelBubble = true; g.moveToTop(); objLayer.batchDraw(); iconClicked('obj:' + o.id, () => openObjMenu(o, g.x(), g.y())); });
      if (canDrag) {
        g.dragBoundFunc(clampToStage);
        g.on('dragstart', () => { closeIconMenu(); g.moveToTop(); if (o.movel) pushUndo(); });
        g.on('dragmove', () => { if (o.caminho) { const t = g.findOne('.tm'); if (t) { t.findOne('Text').text(treeMeters(o, g.x() / W, g.y() / H) + 'm'); t.offsetX(t.getClientRect({ skipTransform: true }).width / 2); } const carr = (cur().treeCarry || {})[o.id] || []; carr.forEach((mid, idx) => { const mn = tokenLayer.findOne('#mem-' + mid); if (mn) { const rm = Math.max(7, R * 0.5); mn.position({ x: g.x() + (idx === 0 ? -1 : 1) * rm * 1.5, y: g.y() + rm * 1.4 }); } }); tokenLayer.batchDraw(); } objLayer.batchDraw(); updateLinks(); });
        g.on('dragend', () => { const p = { x: clamp01(g.x() / W), y: clamp01(g.y() / H) }; if (o.movel) { cur().objetivoPos = cur().objetivoPos || {}; cur().objetivoPos[o.id] = p; } else { state.objetivoPosGlobal[o.id] = p; } saveProject(); });
        g.on('mouseenter', () => stage.container().style.cursor = 'grab');
        g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      } else { g.on('mouseenter', () => { if (!state.present) stage.container().style.cursor = 'pointer'; }); g.on('mouseleave', () => stage.container().style.cursor = toolCursor()); }
      objLayer.add(g);
    });
    objLayer.batchDraw();
  }
  function setObjUp(id, on) { const c = cur().objetivos; if (on) c[id] = true; else { delete c[id]; if (cur().objetivoPos) delete cur().objetivoPos[id]; } }
  function renderObjPanel() {
    const up = cur() ? (cur().objetivos || {}) : {}; objGroups.innerHTML = '';
    const totalN = CFG.objetivos.length, upAll = CFG.objetivos.filter(o => up[o.id]).length;
    const master = document.createElement('label'); master.className = 'obj-master';
    master.innerHTML = '<input type="checkbox"' + (upAll === totalN ? ' checked' : '') + '><span class="mtxt">Adicionar todos</span><span class="gcount">' + upAll + '/' + totalN + '</span>';
    const mcb = master.querySelector('input'); mcb.indeterminate = upAll > 0 && upAll < totalN;
    mcb.addEventListener('change', () => { pushUndo(); CFG.objetivos.forEach(o => setObjUp(o.id, mcb.checked)); renderObjectives(); renderObjPanel(); saveProject(); });
    objGroups.appendChild(master);
    CFG.objetivosGrupos.forEach(grp => {
      const list = CFG.objetivos.filter(o => o.grupo === grp); if (!list.length) return;
      const nUp = list.filter(o => up[o.id]).length, allUp = nUp === list.length, open = !!objGroupOpen[grp];
      const box = document.createElement('div'); box.className = 'obj-g';
      const gh = document.createElement('div'); gh.className = 'obj-gh' + (nUp ? ' any' : '') + (open ? ' open' : '');
      gh.innerHTML = '<input type="checkbox"' + (allUp ? ' checked' : '') + '><span class="chev">▸</span><span class="gname">' + grp + '</span><span class="gcount">' + nUp + '/' + list.length + '</span>';
      const gcb = gh.querySelector('input'); gcb.indeterminate = nUp > 0 && !allUp;
      gcb.addEventListener('click', e => e.stopPropagation());
      gcb.addEventListener('change', () => { pushUndo(); list.forEach(o => setObjUp(o.id, gcb.checked)); renderObjectives(); renderObjPanel(); saveProject(); });
      gh.addEventListener('click', e => { if (e.target === gcb) return; objGroupOpen[grp] = !objGroupOpen[grp]; renderObjPanel(); });
      box.appendChild(gh);
      if (open) {
        const rows = document.createElement('div'); rows.className = 'obj-rows';
        list.forEach(o => {
          const row = document.createElement('label'); row.className = 'obj-row' + (up[o.id] ? ' up' : '');
          row.innerHTML = '<input type="checkbox"' + (up[o.id] ? ' checked' : '') + '><span class="on"></span><span class="nm">' + esc(o.rotulo) + '</span>';
          row.querySelector('input').addEventListener('change', e => { pushUndo(); setObjUp(o.id, e.target.checked); renderObjectives(); renderObjPanel(); saveProject(); });
          rows.appendChild(row);
        });
        box.appendChild(rows);
      }
      objGroups.appendChild(box);
    });
  }
  function toggleObjPanel(force) { const show = force != null ? force : objPanel.hidden; if (show) { renderObjPanel(); objPanel.hidden = false; objBtn.classList.add('on'); } else { objPanel.hidden = true; objBtn.classList.remove('on'); } renderObjectives(); }

  // ---- desenho ----
  function toolCursor() { return (DRAW.includes(state.tool) || state.tool === 'marca' || state.tool === 'nota' || state.tool === 'inimigo') ? 'crosshair' : 'default'; }
  function selectDrawColor(c) { state.drawColor = c; if (dtCurColor) dtCurColor.style.background = c; dtColors.querySelectorAll('.sw').forEach(s => s.classList.toggle('active', s.dataset.c && s.dataset.c.toLowerCase() === c.toLowerCase())); }
  function buildColorSwatches() { dtColors.innerHTML = ''; CFG.drawColors.forEach(c => { const sw = document.createElement('div'); sw.className = 'sw' + (c === state.drawColor ? ' active' : ''); sw.style.background = c; sw.title = c; sw.dataset.c = c; sw.addEventListener('click', () => { selectDrawColor(c); }); dtColors.appendChild(sw); }); if (dtCurColor) dtCurColor.style.background = state.drawColor; }
  function buildWidthOpts() { if (!dtWidthOpts) return; dtWidthOpts.innerHTML = ''; CFG.drawWidths.forEach(w => { const b = document.createElement('button'); b.className = (w === state.drawWidth ? 'active' : ''); b.dataset.w = w; b.innerHTML = '<span class="wbar" style="height:' + w + 'px"></span><span style="font-size:10px;font-family:var(--disp);font-weight:700">' + w + '</span>'; b.addEventListener('click', () => { state.drawWidth = w; dtWidthOpts.querySelectorAll('button').forEach(x => x.classList.toggle('active', +x.dataset.w === w)); if (dtWidthBtn) dtWidthBtn.textContent = w <= 2 ? '▁' : w <= 3 ? '▬' : w <= 5 ? '▬' : '█'; dtWidthPop.hidden = true; }); dtWidthOpts.appendChild(b); }); }
  function positionDtPop(pop, btn) { pop.style.top = (btn.offsetTop) + 'px'; }
  function buildMarkPicker() {
    if (!markGrid) return; const M = CFG.markIcons || { assets: [], emojis: [] };
    const cell = (kind, val, inner, title) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'mk' + (markSel.kind === kind && markSel.val === val ? ' active' : ''); b.dataset.kind = kind; b.dataset.val = val; b.title = title || val; b.innerHTML = inner; b.addEventListener('click', () => { markSel = { kind, val }; markGrid.querySelectorAll('.mk').forEach(x => x.classList.toggle('active', x.dataset.kind === kind && x.dataset.val === val)); if (state.tool !== 'marca') setTool('marca'); }); return b; };
    markGrid.innerHTML = '';
    const hA = document.createElement('div'); hA.className = 'mk-h'; hA.textContent = 'Assets'; markGrid.appendChild(hA);
    const gA = document.createElement('div'); gA.className = 'mk-row';
    (M.assets || []).forEach(k => { const src = CFG.assets.icons[k]; if (!src) return; gA.appendChild(cell('asset', k, '<img src="' + src + '" alt="">', k)); });
    markGrid.appendChild(gA);
    const hE = document.createElement('div'); hE.className = 'mk-h'; hE.textContent = 'Emojis'; markGrid.appendChild(hE);
    const gE = document.createElement('div'); gE.className = 'mk-row';
    (M.emojis || []).forEach(em => gE.appendChild(cell('emoji', em, '<span class="mk-em">' + em + '</span>', em)));
    markGrid.appendChild(gE);
  }
  function setTool(t) { if (linkTempFrom) { cancelLink(); renderTokens(); } state.tool = t; drawTools.querySelectorAll('.dt[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === t)); const noHit = DRAW.includes(t) || t === 'marca' || t === 'inimigo'; tokenLayer.listening(!noHit); objLayer.listening(!noHit); noteLayer.listening(t === 'select'); stage.container().style.cursor = toolCursor(); if (noHit || t === 'nota') { hidePopover(); closeIconMenu(); } if (markPicker) markPicker.hidden = (t !== 'marca'); renderMarks(); updateStageDrag(); }
  function pxPts(pts) { const a = []; pts.forEach(p => { a.push(p[0] * W, p[1] * H); }); return a; }
  function shapeFromDesenho(d) {
    const stroke = d.cor || '#FFC21A', sw = d.largura || 3;
    if (d.tipo === 'seta') return new Konva.Arrow({ points: pxPts(d.pontos), stroke, fill: stroke, strokeWidth: sw, pointerLength: sw * 2.6 + 3, pointerWidth: sw * 2.4 + 2, lineCap: 'round', lineJoin: 'round' });
    if (d.tipo === 'linha') return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, lineCap: 'round' });
    if (d.tipo === 'livre') return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, lineCap: 'round', lineJoin: 'round', tension: 0.35 });
    if (d.tipo === 'retangulo') { const a = d.pontos[0], b = d.pontos[1]; return new Konva.Rect({ x: Math.min(a[0], b[0]) * W, y: Math.min(a[1], b[1]) * H, width: Math.abs(b[0] - a[0]) * W, height: Math.abs(b[1] - a[1]) * H, stroke, strokeWidth: sw, cornerRadius: 4, fill: hexA(stroke, 0.1) }); }
    return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw });
  }
  function renderDrawings() { drawLayer.destroyChildren(); (cur() ? cur().desenhos : []).forEach(d => drawLayer.add(shapeFromDesenho(d))); drawLayer.batchDraw(); }
  let live = null;
  function beginDraw() { if (state.present || !DRAW.includes(state.tool)) return; const f = frac(); if (!f) return; live = { tipo: state.tool, pontos: state.tool === 'livre' ? [[f.xf, f.yf]] : [[f.xf, f.yf], [f.xf, f.yf]], cor: state.drawColor, largura: state.drawWidth, shape: null }; live.shape = shapeFromDesenho(live); drawLayer.add(live.shape); drawLayer.batchDraw(); }
  function moveDraw() { if (!live) return; const f = frac(); if (!f) return; if (live.tipo === 'livre') live.pontos.push([f.xf, f.yf]); else live.pontos[1] = [f.xf, f.yf]; live.shape.destroy(); live.shape = shapeFromDesenho(live); drawLayer.add(live.shape); drawLayer.batchDraw(); }
  function endDraw() { if (!live) return; const d = live; live = null; d.shape && d.shape.destroy(); const tiny = d.tipo === 'livre' ? d.pontos.length < 3 : Math.hypot((d.pontos[1][0] - d.pontos[0][0]) * W, (d.pontos[1][1] - d.pontos[0][1]) * H) < 6; if (tiny) { drawLayer.batchDraw(); return; } pushUndo(); cur().desenhos.push({ tipo: d.tipo, pontos: d.pontos.map(p => [p[0], p[1]]), cor: d.cor, largura: d.largura }); renderDrawings(); renderTokens(); saveProject(); }
  async function clearDrawings() { const hasM = (cur().marcas || []).length; if (!cur().desenhos.length && !hasM) return; if (!await askConfirm('Limpar desenhos e ícones deste cenário?')) return; pushUndo(); cur().desenhos = []; cur().marcas = []; renderDrawings(); renderMarks(); renderTokens(); saveProject(); }

  // ---- ícones carimbados no mapa (marcas) ----
  let markSel = { kind: 'asset', val: (CFG.markIcons && CFG.markIcons.assets && CFG.markIcons.assets[0]) || 'boss' };
  function markSize() { return Math.max(11, W * 0.02); }
  function renderMarks() {
    markLayer.destroyChildren();
    const list = (cur() ? cur().marcas : []) || [], ms = markSize();
    list.forEach(m => {
      const canDrag = !state.present && state.tool === 'select';
      const g = new Konva.Group({ x: m.x * W, y: m.y * H, draggable: canDrag });
      if (m.kind === 'asset') {
        const img = iconImgs[m.val];
        if (img && img.width) { const h = ms * (img.height / img.width); g.add(new Konva.Image({ image: img, width: ms, height: h, offsetX: ms / 2, offsetY: h / 2, shadowColor: '#000', shadowBlur: 5, shadowOpacity: 0.4, shadowOffsetY: 1 })); }
      } else {
        g.add(new Konva.Text({ text: m.val, fontSize: ms, align: 'center', verticalAlign: 'middle', width: ms * 1.7, height: ms * 1.5, offsetX: ms * 0.85, offsetY: ms * 0.75, shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.5, shadowOffsetY: 1 }));
      }
      g.on('dblclick dbltap', e => { e.cancelBubble = true; pushUndo(); cur().marcas = (cur().marcas || []).filter(x => x.id !== m.id); renderMarks(); saveProject(); });
      if (canDrag) {
        g.dragBoundFunc(clampToStage);
        g.on('dragstart', () => { pushUndo(); g.moveToTop(); });
        g.on('dragend', () => { const mm = (cur().marcas || []).find(x => x.id === m.id); if (mm) { mm.x = clamp01(g.x() / W); mm.y = clamp01(g.y() / H); saveProject(); } });
        g.on('mouseenter', () => stage.container().style.cursor = 'grab');
        g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      }
      markLayer.add(g);
    });
    markLayer.batchDraw();
    renderNotes();
  }
  function placeMark() {
    if (state.present) return; const f = frac(); if (!f) return;
    pushUndo(); cur().marcas = cur().marcas || [];
    cur().marcas.push({ id: uid(), x: f.xf, y: f.yf, kind: markSel.kind, val: markSel.val });
    hintDismissed = true; renderMarks(); saveProject();
  }

  // ---- anotações / post-its no mapa ----
  function renderNotes() {
    noteLayer.destroyChildren();
    const list = (cur() ? cur().notas : []) || [], fs = Math.max(11, W * 0.016);
    list.forEach(n => {
      const canDrag = !state.present && state.tool === 'select';
      const g = new Konva.Group({ x: n.x * W, y: n.y * H, draggable: canDrag, name: 'note-' + n.id });
      const label = new Konva.Label();
      label.add(new Konva.Tag({ fill: 'rgba(24,20,8,.92)', stroke: '#f0c66b', strokeWidth: 1, cornerRadius: 5, shadowColor: '#000', shadowBlur: 8, shadowOpacity: 0.5, shadowOffsetY: 2 }));
      label.add(new Konva.Text({ text: n.text || '…', fontFamily: 'Barlow, sans-serif', fontStyle: '600', fontSize: fs, fill: '#f7e6bf', padding: Math.max(5, fs * 0.5), width: Math.min(W * 0.32, Math.max(fs * 6, fs * (String(n.text || '').length > 26 ? 12 : 8))), lineHeight: 1.25 }));
      g.add(label);
      g.on('click tap', e => { e.cancelBubble = true; if (linkTempFrom) return; g.moveToTop(); noteLayer.batchDraw(); if (!state.present) openNoteEditor(n, g.x(), g.y()); });
      if (canDrag) {
        g.dragBoundFunc(clampToStage);
        g.on('dragstart', () => { pushUndo(); g.moveToTop(); });
        g.on('dragend', () => { const nn = (cur().notas || []).find(x => x.id === n.id); if (nn) { nn.x = clamp01(g.x() / W); nn.y = clamp01(g.y() / H); saveProject(); } });
        g.on('dblclick dbltap', e => { e.cancelBubble = true; pushUndo(); cur().notas = (cur().notas || []).filter(x => x.id !== n.id); renderNotes(); saveProject(); });
        g.on('mouseenter', () => stage.container().style.cursor = 'grab');
        g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      }
      noteLayer.add(g);
    });
    noteLayer.batchDraw();
  }
  function placeNote() {
    if (state.present) return; const f = frac(); if (!f) return;
    pushUndo(); cur().notas = cur().notas || [];
    const n = { id: uid(), x: f.xf, y: f.yf, text: '' };
    cur().notas.push(n); hintDismissed = true; setTool('select'); renderNotes(); saveProject();
    const g = noteLayer.findOne('.note-' + n.id); openNoteEditor(n, g ? g.x() : f.xf * W, g ? g.y() : f.yf * H);
  }
  function openNoteEditor(n, x, y) {
    if (!iconMenu || state.present) return; hidePopover();
    iconMenu.innerHTML = '<div class="im-hd"><span class="im-dot" style="background:#f0c66b"></span><b>' + t('noteTitle') + '</b><button class="im-x" data-act="close">✕</button></div>'
      + '<textarea class="im-note" rows="3" placeholder="' + t('notePh') + '">' + esc(n.text || '') + '</textarea>'
      + '<div class="im-actions"><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.hidden = false; placeIconMenu(x, y);
    const ta = iconMenu.querySelector('.im-note'); ta.focus();
    ta.addEventListener('input', () => { n.text = ta.value; renderNotes(); saveProject(); });
    iconMenu.querySelector('[data-act="remove"]').addEventListener('click', () => { pushUndo(); cur().notas = (cur().notas || []).filter(x => x.id !== n.id); closeIconMenu(); renderNotes(); saveProject(); });
    iconMenu.querySelector('[data-act="close"]').addEventListener('click', closeIconMenu);
  }

  // ---- cenários ----
  function renderRail() {
    rail.innerHTML = '';
    state.scenarios.forEach((s, i) => {
      const card = document.createElement('div'); card.className = 'scene' + (s.id === state.currentId ? ' active' : ''); card.dataset.id = s.id; card.setAttribute('draggable', 'true');
      card.innerHTML = '<div class="sc-top"><span class="sc-idx">' + (i + 1) + '</span><span class="sc-name">' + esc(s.nome || 'Cenário') + '</span></div>' + (s.condicao ? '<span class="sc-cond">▸ ' + esc(s.condicao) + '</span>' : '<span class="sc-meta">' + esc(s.fase || '') + '</span>') + '<button class="sc-del" title="Excluir cenário" aria-label="Excluir">✕</button>';
      card.addEventListener('click', e => { if (e.target.classList.contains('sc-del')) return; selectScenario(s.id); });
      card.querySelector('.sc-del').addEventListener('click', e => { e.stopPropagation(); deleteScenario(s.id); });
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/scene', s.id); dragRef._id = s.id; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); clearHints(); });
      card.addEventListener('dragover', e => { if (!Array.from(e.dataTransfer.types).includes('text/scene') || dragRef._id === s.id) return; e.preventDefault(); clearHints(); card.classList.add(e.offsetX < card.offsetWidth / 2 ? 'drop-before' : 'drop-after'); });
      card.addEventListener('drop', e => { if (!Array.from(e.dataTransfer.types).includes('text/scene')) return; e.preventDefault(); const id = dragRef._id; if (id && id !== s.id) reorder(id, s.id, e.offsetX < card.offsetWidth / 2); });
      rail.appendChild(card);
    });
    const a = rail.querySelector('.scene.active'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  const dragRef = {}; function clearHints() { rail.querySelectorAll('.drop-before,.drop-after').forEach(c => c.classList.remove('drop-before', 'drop-after')); }
  function selectScenario(id) { if (id === state.currentId) return; if (linkTempFrom) cancelLink(); closeIconMenu(); hidePopover(); state.currentId = id; renderRail(); loadScenarioIntoUI(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); renderSidebar(); updateMini(); if (!objPanel.hidden) renderObjPanel(); if (state.present) updatePresentUI(); saveProject(); }
  function loadScenarioIntoUI() { const s = cur(); if (!s) return; nameInput.value = s.nome || ''; condInput.value = s.condicao || ''; noteInput.value = s.nota || ''; updateMini(); }
  function insertAfterCurrent(s) { const i = curIndex(); state.scenarios.splice(i < 0 ? state.scenarios.length : i + 1, 0, s); saveProject(); }
  function addScenarioBlank() { const s = newScenario({ fase: 'Cenário', nome: 'Cenário ' + (state.scenarios.length + 1) }); insertAfterCurrent(s); selectScenario(s.id); }
  function duplicateCurrent() { const s = cur(); const memMap = {}; const destacados = s.destacados.map(d => { const nid = uid(); memMap[d.id] = nid; return Object.assign({}, d, { id: nid }); }); const remap = ref => { if (typeof ref === 'string' && ref.indexOf('mem:') === 0) { const ni = memMap[ref.slice(4)]; return ni ? 'mem:' + ni : null; } return ref; }; const links = (s.links || []).map(l => { const a = remap(l.a), b = remap(l.b); return (a && b) ? { id: uid(), a, b } : null; }).filter(Boolean); insertAfterCurrent(newScenario({ fase: s.fase, nome: s.nome, condicao: s.condicao, tokens: s.tokens.map(t => ({ pt: t.pt, xf: t.xf, yf: t.yf })), desenhos: JSON.parse(JSON.stringify(s.desenhos)), marcas: (s.marcas || []).map(m => Object.assign({}, m, { id: uid() })), objetivos: Object.assign({}, s.objetivos), objetivoPos: JSON.parse(JSON.stringify(s.objetivoPos || {})), destacados, links, objHp: Object.assign({}, s.objHp || {}), objBuffs: JSON.parse(JSON.stringify(s.objBuffs || {})), treeCarry: Object.fromEntries(Object.entries(s.treeCarry || {}).map(([k, v]) => [k, v.map(id => memMap[id] || id)])), notas: (s.notas || []).map(n => Object.assign({}, n, { id: uid() })), enemies: (s.enemies || []).map(e => Object.assign({}, e, { id: uid() })), nota: s.nota })); selectScenario(state.scenarios[curIndex() + 1].id); }
  async function deleteScenario(id) { if (state.scenarios.length <= 1) { toast('É preciso ter ao menos um cenário'); return; } const i = state.scenarios.findIndex(s => s.id === id); if (i < 0) return; if (!isPristine(state.scenarios[i]) && !await askConfirm('Excluir o cenário "' + (state.scenarios[i].nome || '') + '"?')) return; state.scenarios.splice(i, 1); if (state.currentId === id) state.currentId = state.scenarios[Math.max(0, i - 1)].id; renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderTokens(); renderSidebar(); saveProject(); }
  function reorder(dragIdV, targetId, before) { const from = state.scenarios.findIndex(s => s.id === dragIdV); if (from < 0) return; const [m] = state.scenarios.splice(from, 1); let to = state.scenarios.findIndex(s => s.id === targetId); if (to < 0) state.scenarios.push(m); else state.scenarios.splice(before ? to : to + 1, 0, m); renderRail(); saveProject(); }
  function seedStandard() { const key = e => (e.nome || '') + '|' + (e.condicao || ''); if (state.scenarios.length === 1 && isPristine(state.scenarios[0])) state.scenarios = []; const have = new Set(state.scenarios.map(key)); CFG.fasesPadrao.forEach(f => { if (!have.has(key(f))) state.scenarios.push(newScenario({ fase: f.fase, nome: f.nome, condicao: f.condicao })); }); state.currentId = state.scenarios[0].id; renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderTokens(); renderSidebar(); saveProject(); }
  function syncCard() { const s = cur(), card = rail.querySelector('.scene.active'); if (!card) return; card.querySelector('.sc-name').textContent = s.nome || 'Cenário'; const condEl = card.querySelector('.sc-cond'), metaEl = card.querySelector('.sc-meta'); if (s.condicao) { if (condEl) condEl.textContent = '▸ ' + s.condicao; else { const el = document.createElement('span'); el.className = 'sc-cond'; el.textContent = '▸ ' + s.condicao; if (metaEl) metaEl.replaceWith(el); else card.appendChild(el); } } else if (condEl) { const el = document.createElement('span'); el.className = 'sc-meta'; el.textContent = s.fase || ''; condEl.replaceWith(el); } updateMini(); }
  function updateMini() { const s = cur(); if (s) miniName.textContent = (curIndex() + 1) + '. ' + (s.nome || 'Cenário') + (s.condicao ? ' · ' + s.condicao : ''); }

  // ---- apresentação ----
  function enterPresent() { if (linkTempFrom) cancelLink(); closeIconMenu(); state.present = true; document.body.classList.add('present'); presentBtn.style.display = 'none'; exitBtn.style.display = ''; hidePopover(); toggleObjPanel(false); setTool('select'); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); updatePresentUI(); try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) {} setTimeout(fit, 60); }
  function exitPresent() { state.present = false; document.body.classList.remove('present'); presentBtn.style.display = ''; exitBtn.style.display = 'none'; renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {} setTimeout(fit, 60); }
  function updatePresentUI() { const s = cur(); if (!s) return; const i = curIndex(), n = state.scenarios.length; pbTitle.textContent = s.nome || 'Cenário'; if (s.condicao) { pbCond.hidden = false; pbCond.textContent = s.condicao; } else pbCond.hidden = true; pbProg.textContent = (i + 1) + ' / ' + n; pnPhase.textContent = s.fase || s.nome || 'Fase'; if (s.condicao) { pnBadge.hidden = false; pnBadge.textContent = s.condicao; } else pnBadge.hidden = true; const nota = (s.nota || '').trim(); pnText.textContent = nota || 'Sem nota neste cenário.'; pnText.classList.toggle('empty', !nota); prevBtn.disabled = i <= 0; nextBtn.disabled = i >= n - 1; }
  function go(delta) { const j = curIndex() + delta; if (j < 0 || j >= state.scenarios.length) return; selectScenario(state.scenarios[j].id); }

  // ---- roster parse + modal ----
  function mapClass(c) { return CFG.classMap[c] || 'DPS'; }
  function normalizeRole(t) { t = (t || '').toLowerCase(); if (/tank|tanque/.test(t)) return 'Tank'; if (/heal|cura/.test(t)) return 'Healer'; return 'DPS'; }
  function parseRoster(text) { text = (text || '').trim(); if (!text) return []; if (text[0] === '{' || text[0] === '[') { try { const d = JSON.parse(text); const arr = Array.isArray(d) ? d : d.signUps; if (Array.isArray(arr)) return parseRaidHelper(arr); } catch (e) {} } return parseLines(text); }
  function parseRaidHelper(signUps) { const out = []; signUps.forEach(s => { const cls = s.className || s.cClassName || ''; let status = 'primary', ausente = false, reserva = false, classe = cls, funcao = 'DPS'; if (/^absence$/i.test(cls)) { status = 'absence'; ausente = true; classe = 'Absence'; } else if (/^bench$/i.test(cls)) { status = 'bench'; reserva = true; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); } else if (/^late$/i.test(cls)) { status = 'late'; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); } else if (/^tentative$/i.test(cls)) { status = 'tentative'; reserva = true; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); } else { classe = cls; funcao = mapClass(cls); } out.push({ id: uid(), nome: s.name || '—', classe, funcao, status, ausente, reserva, pt: null, nota: s.note || '' }); }); const rank = p => (p.ausente ? 3 : p.reserva ? 2 : 1), fo = f => ({ Tank: 0, Healer: 1, DPS: 2 }[f] ?? 3); out.sort((a, b) => rank(a) - rank(b) || fo(a.funcao) - fo(b.funcao) || a.nome.localeCompare(b.nome)); return out; }
  function parseLines(text) { const out = []; text.split(/\n+/).forEach(line => { const m = line.match(/^\s*(PT\s?\d+|reservas?|bench|banco|sem\s?pt)\s*[—:\-–]\s*(.+)$/i); if (!m) return; const reserva = /reserv|bench|banco/i.test(m[1]), ptm = m[1].match(/PT\s?(\d+)/i), pt = ptm ? 'PT' + ptm[1] : null; m[2].split(/[,;]+/).forEach(part => { part = part.trim(); if (!part) return; const mm = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/); const nome = (mm ? mm[1] : part).trim(); const funcao = normalizeRole(mm ? mm[2] : ''); if (nome) out.push({ id: uid(), nome, classe: funcao, funcao, status: reserva ? 'bench' : 'primary', ausente: false, reserva, pt: pt && PT_IDS.includes(pt) ? pt : null, nota: '' }); }); }); return out; }
  function openRoster() { rosterDraft = state.roster.map(p => Object.assign({}, p, { flags: (p.flags || []).slice() })); rosterPaste.value = ''; parseMsg.textContent = ''; parseMsg.className = 'parse-msg'; saveMsg.textContent = ''; renderGrid(); setRosterView('grid'); rosterModal.hidden = false; }
  function closeRoster() { rosterModal.hidden = true; }
  function renderGrid() {
    gAus.textContent = rosterDraft.filter(p => p.ausente).length; gRes.textContent = rosterDraft.filter(p => p.reserva && !p.ausente).length; gEsc.textContent = rosterDraft.filter(p => !p.ausente && !p.reserva).length;
    const c = { Tank: 0, Healer: 0, DPS: 0 }; rosterDraft.filter(p => !p.ausente && !p.reserva).forEach(p => { c[p.funcao] = (c[p.funcao] || 0) + 1; }); gComp.innerHTML = CFG.roleOrder.filter(f => c[f]).map(f => '<b style="color:' + roleColor(f) + '">' + c[f] + '</b> ' + f).join(' · ');
    let html = '<div class="rrow head"><span>Jogador</span><span>Função</span><span>PT</span><span>Res.</span><span></span></div>';
    if (!rosterDraft.length) html += '<div style="padding:22px 6px;color:#9aa2b4;font-size:12.5px">Nenhum jogador ainda. Cole a montagem e clique <b>Processar</b>.</div>';
    rosterDraft.forEach((p, i) => { const opts = ['Tank', 'DPS', 'Healer'].map(f => '<option value="' + f + '"' + (p.funcao === f ? ' selected' : '') + '>' + f + '</option>').join(''); const ptopts = '<option value="">—</option>' + PT_IDS.map(id => '<option value="' + id + '"' + (p.pt === id ? ' selected' : '') + '>' + id + '</option>').join(''); html += '<div class="rrow' + (p.ausente ? ' absence' : '') + '" data-i="' + i + '"><div class="rn"><span class="rl" style="background:' + roleColor(p.funcao) + (p.ausente ? ';opacity:.4' : '') + '"></span><span class="nm">' + esc(p.nome) + '</span><span class="cl">' + esc(p.ausente ? 'ausente' : p.classe) + '</span></div><select class="f-fn"' + (p.ausente ? ' disabled' : '') + '>' + opts + '</select><select class="f-pt"' + (p.ausente ? ' disabled' : '') + '>' + ptopts + '</select><div class="res"><input type="checkbox" class="f-res"' + (p.reserva ? ' checked' : '') + (p.ausente ? ' disabled' : '') + '></div><button class="rdel" title="Remover">✕</button></div>'; });
    rosterGrid.innerHTML = html;
  }
  // Auto-preenche as PTs seguindo a composição alvo (1 heal/1 tank/3 dps, com
  // margens) e joga o excedente nas reservas.
  function autoAssign() {
    const players = rosterDraft.filter(p => !p.ausente);
    players.forEach(p => { p.pt = null; p.reserva = false; });
    if (!players.length) { refreshRoster(); return; }
    const heal = players.filter(p => p.funcao === 'Healer');
    const tank = players.filter(p => p.funcao === 'Tank');
    const dps = players.filter(p => p.funcao === 'DPS');
    const nPT = Math.max(1, Math.min(PT_IDS.length, Math.ceil(players.length / CFG.ptSize)));
    const comp = CFG.ptComp || { Healer: { alvo: 1, max: 2 }, Tank: { alvo: 1, max: 2 }, DPS: { alvo: 3, max: 4 } };
    const pts = PT_IDS.slice(0, nPT).map(id => ({ id: id, Healer: 0, Tank: 0, DPS: 0, n: 0 }));
    const cap = CFG.ptSize;
    let hi = 0, ti = 0, di = 0;
    // round 1: alvo por PT (1 heal, 1 tank, 3 dps)
    pts.forEach(pt => { for (let k = 0; k < comp.Healer.alvo && heal[hi]; k++) { heal[hi].pt = pt.id; pt.Healer++; pt.n++; hi++; } });
    pts.forEach(pt => { for (let k = 0; k < comp.Tank.alvo && tank[ti]; k++) { tank[ti].pt = pt.id; pt.Tank++; pt.n++; ti++; } });
    pts.forEach(pt => { for (let k = 0; k < comp.DPS.alvo && dps[di] && pt.n < cap; k++) { dps[di].pt = pt.id; pt.DPS++; pt.n++; di++; } });
    // round 2: distribui excedentes respeitando o max por função e o tamanho da PT
    const spread = (list, idx, role) => { for (; idx < list.length; idx++) { let placed = false; for (const pt of pts) { if (pt[role] < comp[role].max && pt.n < cap) { list[idx].pt = pt.id; pt[role]++; pt.n++; placed = true; break; } } if (!placed) break; } return idx; };
    hi = spread(heal, hi, 'Healer'); ti = spread(tank, ti, 'Tank'); di = spread(dps, di, 'DPS');
    // sobra -> reservas
    heal.slice(hi).concat(tank.slice(ti), dps.slice(di)).forEach(p => { p.reserva = true; });
    refreshRoster();
  }

  // ---- montador visual de PTs (board drag & drop) ----
  let rosterView = 'grid', bdDragId = null, bdPopId = null;
  function refreshRoster() { renderGrid(); if (rosterView === 'board') renderBoard(); }
  function setRosterView(v) {
    rosterView = v; if (viewToggle) viewToggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    const board = v === 'board';
    rosterGrid.hidden = board; boardTools.hidden = !board; rosterBoard.hidden = !board;
    rosterModal.classList.toggle('board-mode', board);
    if (bdPop) bdPop.hidden = true;
    if (board) renderBoard();
  }
  function bdFlagsHTML(p) { return (p.flags || []).map(fid => { const f = (CFG.specialFlags || []).find(x => x.id === fid); return f ? '<span class="c-flag" title="' + esc(f.label) + '">' + f.icon + '</span>' : ''; }).join(''); }
  function classIcoHTML(funcao, sm) { const key = (CFG.classIcons || {})[funcao]; const src = key && CFG.assets && CFG.assets.icons ? CFG.assets.icons[key] : ''; const cls = 'c-ico' + (sm ? ' sm' : ''); return src ? '<span class="' + cls + '" style="--rc:' + roleColor(funcao) + '"><img src="' + src + '" alt="' + funcao + '"></span>' : '<span class="' + cls + ' dotonly" style="--rc:' + roleColor(funcao) + '"></span>'; }
  function byRole(arr) { return arr.slice().sort((a, b) => (CFG.roleOrder.indexOf(a.funcao) - CFG.roleOrder.indexOf(b.funcao)) || a.nome.localeCompare(b.nome)); }
  function bdChip(p) {
    const tagsHtml = memTags(p).map(tg => '<span class="c-tag2" title="' + esc(tg) + '">' + esc(tg) + '</span>').join('');
    const rep = p.replace ? '<span class="c-rep" title="Replace">⇄</span>' : '';
    // nome → tarjas secundárias (discretas, depois do nome) → flags → função (classe) sempre à direita
    return '<div class="bd-chip" draggable="true" data-id="' + p.id + '" style="--rc:' + roleColor(p.funcao) + '">'
      + '<span class="c-grip">⋮⋮</span>' + classIcoHTML(p.funcao)
      + '<span class="c-name">' + esc(p.nome) + '</span>'
      + '<span class="c-tags">' + tagsHtml + rep + bdFlagsHTML(p) + '</span>'
      + '<span class="c-role">' + p.funcao + '</span></div>';
  }
  function bdZone(zoneId, label, chips, cls, extra) {
    return '<div class="bd-zone ' + (cls || '') + '" data-zone="' + zoneId + '"><div class="bd-zh">' + label + (extra || '') + '</div>'
      + '<div class="bd-chips">' + (chips.length ? chips.map(bdChip).join('') : '<span class="bd-empty">' + t('dropHere') + '</span>') + '</div></div>';
  }
  function renderBoard() {
    if (!rosterBoard) return;
    const active = rosterDraft.filter(p => !p.ausente);
    const pool = byRole(active.filter(p => !p.pt && !p.reserva));
    const gres = byRole(active.filter(p => !p.pt && p.reserva));
    // coluna esquerda: disponíveis (arrastar) + reservas gerais ; direita: grade 3x2 das 6 PTs
    let side = '<div class="bd-zone bd-pool" data-zone="pool"><div class="bd-zh">' + t('available')
      + (pool.length ? '<button class="bd-allres" title="' + t('allToRes') + '">→ ' + t('reservesLbl') + '</button>' : '')
      + '<span class="bd-c">' + pool.length + '</span></div>'
      + '<div class="bd-chips">' + (pool.length ? pool.map(bdChip).join('') : '<span class="bd-empty">' + t('dropHere') + '</span>') + '</div></div>';
    side += bdZone('res', t('genReserves'), gres, 'bd-res', ' <span class="bd-c">' + gres.length + '</span>');
    let grid = '<div class="bd-grid">';
    PT_IDS.forEach(pid => {
      const party = partyById.get(pid);
      const tit = byRole(active.filter(x => x.pt === pid && !x.reserva));
      const ptres = byRole(active.filter(x => x.pt === pid && x.reserva));
      const c = { Tank: 0, Healer: 0, DPS: 0 }; tit.forEach(m => c[m.funcao]++);
      const head = '<span class="dot" style="background:' + party.cor + '"></span><b>' + (state.ptIcon[pid] ? ptIconHTML(state.ptIcon[pid]) + ' ' : '') + pid + '</b>'
        + '<span class="bd-comp">' + c.Tank + 'T · ' + c.Healer + 'H · ' + c.DPS + 'D</span>'
        + '<span class="bd-n' + (tit.length > CFG.ptSize ? ' over' : '') + '">' + tit.length + '/' + CFG.ptSize + '</span>';
      const obs = state.ptDesc[pid] || '';
      grid += '<div class="bd-pt-card">'
        + '<div class="bd-pt-h">' + head + '<button class="bd-obs-btn' + (obs ? ' has' : '') + '" data-obspt="' + pid + '" title="' + t('obsPh') + '">✎</button></div>'
        + (obs ? '<div class="bd-obs-line" data-obspt="' + pid + '">' + esc(obs) + '</div>' : '')
        + '<input class="bd-obs" data-pt="' + pid + '" placeholder="' + t('obsPh') + '" value="' + esc(obs) + '">'
        + '<div class="bd-zone bd-pt" data-zone="' + pid + '"><div class="bd-chips">' + (tit.length ? tit.map(bdChip).join('') : '<span class="bd-empty">' + t('dropHere') + '</span>') + '</div></div>'
        + '<div class="bd-zone bd-ptres' + (ptres.length ? '' : ' slim') + '" data-zone="' + pid + '-res"><div class="bd-zh mini">' + t('ptReserves') + (ptres.length ? ' <span class="bd-c">' + ptres.length + '</span>' : '') + '</div>' + (ptres.length ? '<div class="bd-chips">' + ptres.map(bdChip).join('') + '</div>' : '') + '</div>'
        + '</div>';
    });
    grid += '</div>';
    rosterBoard.innerHTML = '<div class="bd-layout"><div class="bd-side">' + side + '</div>' + grid + '</div>';
  }
  function bdMove(id, zone) {
    const p = rosterDraft.find(x => x.id === id); if (!p) return;
    if (zone === 'pool') { p.pt = null; p.reserva = false; }
    else if (zone === 'res') { p.pt = null; p.reserva = true; }
    else if (typeof zone === 'string' && zone.slice(-4) === '-res' && PT_IDS.includes(zone.slice(0, -4))) { p.pt = zone.slice(0, -4); p.reserva = true; }
    else if (PT_IDS.includes(zone)) { p.pt = zone; p.reserva = false; }
    refreshRoster();
  }
  function openBdPop(id, anchor) {
    const p = rosterDraft.find(x => x.id === id); if (!p || !bdPop) return; bdPopId = id;
    let html = '<div class="bp-nm">' + esc(p.nome) + '</div><div class="bp-sec">' + t('ptLbl') + '</div><div class="bp-row">';
    html += '<button class="bp-p' + (!p.pt ? ' active' : '') + '" data-pt="">—</button>';
    PT_IDS.forEach(pid => { const party = partyById.get(pid); html += '<button class="bp-p' + (p.pt === pid ? ' active' : '') + '" data-pt="' + pid + '" style="--rc:' + (party ? party.cor : '#D9A441') + '">' + pid + '</button>'; });
    html += '</div><div class="bp-sec">' + t('roleLbl') + '</div><div class="bp-row">';
    ['Tank', 'Healer', 'DPS'].forEach(fn => { html += '<button class="bp-r' + (p.funcao === fn ? ' active' : '') + '" data-role="' + fn + '" style="--rc:' + roleColor(fn) + '">' + fn + '</button>'; });
    html += '</div><div class="bp-sec">' + t('secTag') + '</div><div class="bp-row">';
    const ptags = memTags(p);
    html += '<button class="bp-t' + (!ptags.length ? ' active' : '') + '" data-tag="">' + t('tagNone') + '</button>';
    (CFG.secondaryTags || []).forEach(tg => { html += '<button class="bp-t' + (ptags.indexOf(tg) >= 0 ? ' active' : '') + '" data-tag="' + tg + '">' + esc(tg) + '</button>'; });
    html += '</div><div class="bp-sec">'+t('special')+'</div><div class="bp-row">';
    (CFG.specialFlags || []).forEach(f => { html += '<button class="bp-f' + ((p.flags || []).includes(f.id) ? ' active' : '') + '" data-flag="' + f.id + '">' + f.icon + ' ' + esc(f.label) + '</button>'; });
    html += '<button class="bp-f bp-rep' + (p.replace ? ' active' : '') + '" data-rep="1">⇄ ' + t('replaceLbl') + '</button>';
    html += '</div>';
    bdPop.innerHTML = html; bdPop.hidden = false;
    bdPop.style.left = '0px'; bdPop.style.top = '0px';
    const ar = anchor.getBoundingClientRect(), pr = bdPop.getBoundingClientRect();
    let left = Math.max(10, Math.min(ar.left, window.innerWidth - pr.width - 10));
    let top = ar.bottom + 6; if (top + pr.height > window.innerHeight - 10) top = Math.max(10, ar.top - pr.height - 6);
    bdPop.style.left = left + 'px'; bdPop.style.top = top + 'px';
  }

  // ---- export / import / compartilhar / reset ----
  function projectData() { return { app: 'zhi-estrategia', v: 5, exportedAt: new Date().toISOString(), currentId: state.currentId, roster: state.roster, ptDesc: state.ptDesc, ptIcon: state.ptIcon, objetivoPosGlobal: state.objetivoPosGlobal, gates: state.gates, side: state.side, showNames: state.showNames, cenarios: state.scenarios }; }
  function sanitizeDesc(m) { return (m && typeof m === 'object') ? Object.fromEntries(Object.entries(m).filter(([k, v]) => PT_IDS.includes(k) && typeof v === 'string' && v.trim()).map(([k, v]) => [k, String(v)])) : {}; }
  function sanitizePosMap(m) { return (m && typeof m === 'object') ? Object.fromEntries(Object.entries(m).filter(([k, v]) => objById.has(k) && v).map(([k, v]) => [k, { x: clamp01(v.x), y: clamp01(v.y) }])) : {}; }
  function exportProject() { const blob = new Blob([JSON.stringify(projectData(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob), d = new Date(), pad = n => String(n).padStart(2, '0'); const a = document.createElement('a'); a.href = url; a.download = 'estrategia-wanted-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function applyImported(d) { const scenarios = Array.isArray(d.cenarios) ? d.cenarios : (Array.isArray(d.scenarios) ? d.scenarios : null); if (!scenarios || !scenarios.length) { alert('Não encontrei cenários neste plano.'); return false; } state.scenarios = scenarios.map(sanitizeScenario); state.roster = Array.isArray(d.roster) ? d.roster.map(sanitizePlayer) : []; state.objetivoPosGlobal = sanitizePosMap(d.objetivoPosGlobal); state.gates = sanitizePosMap(d.gates); state.side = (d.side === 'blue' || d.side === 'red') ? d.side : null; state.ptDesc = sanitizeDesc(d.ptDesc); state.ptIcon = sanitizeDesc(d.ptIcon); if (typeof d.showNames === 'boolean') state.showNames = d.showNames; state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id; hidePopover(); renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderSidebar(); renderTokens(); saveProject(); return true; }
  function importProjectFile(file) { const reader = new FileReader(); reader.onload = async () => { let d; try { d = JSON.parse(reader.result); } catch (e) { toast('Arquivo inválido: não é um JSON'); return; } if (!Array.isArray(d.cenarios) && !Array.isArray(d.scenarios)) { toast('Não encontrei cenários neste arquivo'); return; } if (state.scenarios.some(s => !isPristine(s)) && !await askConfirm('Importar vai substituir o plano atual. Continuar?')) return; applyImported(d); }; reader.readAsText(file); }
  async function resetAll() { if (!await askConfirm('Resetar tudo e começar um plano do zero? Isso apaga o plano atual (PTs, cenários, desenhos, roster).')) return; try { localStorage.removeItem(CFG.projectKey); } catch (e) {} const s = newScenario({ fase: 'Start', nome: 'Start (30m)' }); state.scenarios = [s]; state.currentId = s.id; state.roster = []; state.ptDesc = {}; state.ptIcon = {}; state.objetivoPosGlobal = {}; state.gates = {}; toggleObjPanel(false); hidePopover(); renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderSidebar(); renderTokens(); saveProject(); toast('Plano resetado ✓'); }
  function b64urlFromBytes(bytes) { let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function bytesFromB64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  async function encodeShare(obj) { const bytes = new TextEncoder().encode(JSON.stringify(obj)); if (window.CompressionStream) { const st = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')); return 'g' + b64urlFromBytes(new Uint8Array(await new Response(st).arrayBuffer())); } return 'r' + b64urlFromBytes(bytes); }
  async function decodeShare(str) { const flag = str[0]; let bytes = bytesFromB64url(str.slice(1)); if (flag === 'g' && window.DecompressionStream) { const st = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')); bytes = new Uint8Array(await new Response(st).arrayBuffer()); } return JSON.parse(new TextDecoder().decode(bytes)); }
  async function shareLink() {
    try {
      const enc = await encodeShare(projectData());
      const url = location.origin + location.pathname + '#p=' + enc;
      try { history.replaceState(null, '', '#p=' + enc); } catch (e) {}
      { const tp = $('shareTitleP'); if (tp) tp.textContent = t('shareTitle'); }
      shareUrl.value = url; shareModal.hidden = false; shareUrl.focus(); shareUrl.select();
      let copied = false; try { await navigator.clipboard.writeText(url); copied = true; } catch (e) {}
      if (copied) toast('Link copiado ✓'); else toast('Selecione o link e copie (Ctrl+C)');
    } catch (e) { toast('Não consegui gerar o link'); }
  }
  // dump curto (só coordenadas) — robusto para colar num chat sem corromper
  function dumpPositions() {
    const r = v => Math.round(v * 1e4) / 1e4;
    const glob = {}; Object.keys(state.objetivoPosGlobal || {}).forEach(k => { const p = state.objetivoPosGlobal[k]; glob[k] = [r(p.x), r(p.y)]; });
    const mov = {}; const cp = cur() && cur().objetivoPos ? cur().objetivoPos : {}; Object.keys(cp).forEach(k => { mov[k] = [r(cp[k].x), r(cp[k].y)]; });
    const gts = {}; Object.keys(state.gates || {}).forEach(k => { const p = state.gates[k]; gts[k] = [r(p.x), r(p.y)]; });
    const s = JSON.stringify({ fixos: glob, moveis: mov, portoes: gts });
    { const tp = $('shareTitleP'); if (tp) tp.textContent = 'Posições (inclui o portão da árvore) — copie tudo e me mande:'; }
    shareUrl.value = s; shareModal.hidden = false; shareUrl.focus(); shareUrl.select();
    (async () => { let ok = false; try { await navigator.clipboard.writeText(s); ok = true; } catch (e) {} if (!ok) { try { ok = document.execCommand('copy'); } catch (e) {} } toast(ok ? 'Posições copiadas ✓' : 'Selecione o texto e copie (Ctrl+C)'); })();
  }
  async function maybeLoadShared() { const m = /[#&]p=([^&]+)/.exec(location.hash); if (!m) return; let d; try { d = await decodeShare(decodeURIComponent(m[1])); } catch (e) { toast('Link de plano inválido'); return; } if (state.scenarios.some(s => !isPristine(s)) && !await askConfirm('Este link abre um plano compartilhado. Abrir substitui o rascunho atual. Continuar?')) return; if (applyImported(d)) toast('Plano do link carregado ✓'); }
  let toastT = null; function toast(msg) { toastEl.innerHTML = msg.replace(/✓/g, '<b>✓</b>'); toastEl.hidden = false; requestAnimationFrame(() => toastEl.classList.add('show')); clearTimeout(toastT); toastT = setTimeout(() => { toastEl.classList.remove('show'); setTimeout(() => toastEl.hidden = true, 220); }, 2600); }
  // confirm próprio (o confirm() nativo é bloqueado no iframe do preview)
  function askConfirm(msg) { return new Promise(res => { confirmMsg.textContent = msg; confirmModal.hidden = false; const done = v => { confirmModal.hidden = true; confirmYes.onclick = confirmNo.onclick = null; res(v); }; confirmYes.onclick = () => done(true); confirmNo.onclick = () => done(false); confirmModal.onclick = e => { if (e.target === confirmModal) done(false); }; }); }

  // ---- editor de PT (descrição + membros) ----
  function openPtEditor(pt) {
    if (state.present || !partyById.has(pt)) return;
    editingPt = pt; const p = partyById.get(pt);
    peDot.style.background = p.cor; peTitle.innerHTML = (state.ptIcon[pt] ? ptIconHTML(state.ptIcon[pt]) + ' ' : '') + pt;
    peDesc.value = state.ptDesc[pt] || '';
    renderPtIcons(); renderPtEditor(); ptModal.hidden = false; peDesc.focus();
  }
  function ptIconHTML(v, px) { if (!v) return ''; if (v.indexOf('asset:') === 0) { const key = v.slice(6), src = (CFG.assets && CFG.assets.icons) ? CFG.assets.icons[key] : ''; return src ? '<img class="pt-ic-img" src="' + src + '" alt="" style="width:' + (px || 15) + 'px;height:' + (px || 15) + 'px;object-fit:contain;vertical-align:-3px">' : ''; } return v; }
  function renderPtIcons() {
    const cur = state.ptIcon[editingPt] || '';
    let html = '<button class="none' + (cur ? '' : ' sel') + '" data-i="">sem</button>';
    html += CFG.ptIcons.map(ic => '<button' + (ic === cur ? ' class="sel"' : '') + ' data-i="' + ic + '">' + ic + '</button>').join('');
    html += (CFG.ptIconAssets || []).map(key => { const v = 'asset:' + key; return '<button class="ico-asset' + (v === cur ? ' sel' : '') + '" data-i="' + v + '">' + ptIconHTML(v, 18) + '</button>'; }).join('');
    peIcons.innerHTML = html;
    peIcons.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { const v = b.dataset.i; if (v) state.ptIcon[editingPt] = v; else delete state.ptIcon[editingPt]; peTitle.innerHTML = ptIconHTML(v) + ' ' + editingPt; renderPtIcons(); renderSidebar(); renderTokens(); saveProject(); }));
  }
  function renderPtEditor() {
    const pt = editingPt; const tit = membersOf(pt, false), res = membersOf(pt, true);
    peCount.textContent = tit.length + (res.length ? ' + ' + res.length + ' res' : '');
    let html = '';
    if (!tit.length && !res.length) html += '<div class="pe-empty">Sem membros nesta PT. Adicione abaixo.</div>';
    tit.concat(res).forEach(m => html += '<div class="pe-mem' + (m.reserva ? ' res' : '') + '"><span class="rl" style="background:' + roleColor(m.funcao) + '"></span><span class="nm">' + esc(m.nome) + memBadges(m) + '</span><span class="cl">' + m.funcao + (m.reserva ? ' · res' : '') + '</span><button class="rm" data-id="' + m.id + '" title="Tirar da PT">✕</button></div>');
    peMembers.innerHTML = html;
    peMembers.querySelectorAll('.rm').forEach(b => b.addEventListener('click', () => { const pl = state.roster.find(x => x.id === b.dataset.id); if (pl) { pl.pt = null; saveProject(); renderSidebar(); renderTokens(); renderPtEditor(); fillAddSel(); } }));
    fillAddSel();
  }
  function fillAddSel() {
    const avail = state.roster.filter(p => p.pt !== editingPt && !p.ausente).sort((a, b) => a.nome.localeCompare(b.nome));
    peAddSel.innerHTML = avail.length ? avail.map(p => '<option value="' + p.id + '">' + esc(p.nome) + ' · ' + p.funcao + (p.pt ? ' (' + p.pt + ')' : p.reserva ? ' (res)' : '') + '</option>').join('') : '<option value="">— ninguém disponível —</option>';
  }
  function closePtEditor() { ptModal.hidden = true; editingPt = null; }

  // ---- eventos ----
  function wireEvents() {
    const cont = stage.container();
    const langSel = $('langSel'); if (langSel) langSel.addEventListener('click', e => { const b = e.target.closest('button[data-lang]'); if (b) setLang(b.dataset.lang); });
    ['dragenter', 'dragover'].forEach(evt => cont.addEventListener(evt, e => { if (state.present) return; const ty = Array.from(e.dataTransfer.types); if (!ty.includes('text/plain') && !ty.includes('text/member')) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; mapPanel.classList.add('dragover'); }));
    ['dragleave', 'dragend'].forEach(evt => cont.addEventListener(evt, () => mapPanel.classList.remove('dragover')));
    cont.addEventListener('drop', e => { e.preventDefault(); mapPanel.classList.remove('dragover'); if (state.present) return; stage.setPointersPositions(e); const f = frac() || { xf: 0.5, yf: 0.5 }; const mem = e.dataTransfer.getData('text/member'); if (mem) { try { const o = JSON.parse(mem); detachMember(o.pt, o.nome, o.funcao, f.xf, f.yf); } catch (x) {} return; } const pt = e.dataTransfer.getData('text/plain'); if (pt) placeToken(pt, f.xf, f.yf); });

    stage.on('wheel', e => { e.evt.preventDefault(); const old = stage.scaleX(), pointer = stage.getPointerPosition(); if (!pointer) return; const mp = { x: (pointer.x - stage.x()) / old, y: (pointer.y - stage.y()) / old }; const dir = e.evt.deltaY > 0 ? 1 / 1.12 : 1.12; let ns = Math.max(1, Math.min(4, old * dir)); stage.scale({ x: ns, y: ns }); stage.position(clampPos(pointer.x - mp.x * ns, pointer.y - mp.y * ns, ns)); stage.batchDraw(); updateStageDrag(); hidePopover(); });
    stage.dragBoundFunc(pos => clampPos(pos.x, pos.y, stage.scaleX()));

    stage.on('mousedown touchstart', e => { if (DRAW.includes(state.tool) && !state.present) { e.evt && e.evt.preventDefault && e.evt.preventDefault(); beginDraw(); } });
    stage.on('mousemove touchmove', moveDraw);
    stage.on('mousemove touchmove', () => { if (linkTempFrom) { updateLinkTemp(); tokenLayer.batchDraw(); } });
    stage.on('mouseup touchend', endDraw);
    stage.on('click tap', e => { if (linkTempFrom) { if (e.target === stage || e.target === bgImage) { cancelLink(); renderTokens(); } return; } if (carryPickFor) { if (e.target === stage || e.target === bgImage) { carryPickFor = null; document.body.classList.remove('linking'); } return; } if (state.tool === 'marca' && !state.present) { placeMark(); return; } if (state.tool === 'nota' && !state.present) { placeNote(); return; } if (state.tool === 'inimigo' && !state.present) { placeEnemy(); return; } if (state.tool === 'select' && (e.target === stage || e.target === bgImage)) { hidePopover(); closeIconMenu(); } });

    drawTools.querySelectorAll('.dt[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    // flyouts de cor e espessura (só aparecem ao apertar)
    buildWidthOpts();
    if (dtColorBtn) dtColorBtn.addEventListener('click', e => { e.stopPropagation(); const show = dtColorPop.hidden; dtWidthPop.hidden = true; if (show) { positionDtPop(dtColorPop, dtColorBtn); } dtColorPop.hidden = !show; });
    if (dtWidthBtn) dtWidthBtn.addEventListener('click', e => { e.stopPropagation(); const show = dtWidthPop.hidden; dtColorPop.hidden = true; if (show) { positionDtPop(dtWidthPop, dtWidthBtn); } dtWidthPop.hidden = !show; });
    if (dtHexApply) dtHexApply.addEventListener('click', () => { let v = (dtHex.value || '').trim(); if (v && v[0] !== '#') v = '#' + v; if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) { selectDrawColor(v); dtHex.value = ''; } else { dtHex.style.borderColor = 'var(--crimson)'; setTimeout(() => dtHex.style.borderColor = '', 900); } });
    if (dtHex) dtHex.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); dtHexApply.click(); } });
    document.addEventListener('click', e => { if (!e.target.closest('#dtColorPop') && !e.target.closest('#dtColorBtn')) dtColorPop.hidden = true; if (!e.target.closest('#dtWidthPop') && !e.target.closest('#dtWidthBtn')) dtWidthPop.hidden = true; });
    undoBtn.addEventListener('click', doUndo); redoBtn.addEventListener('click', doRedo); clearDraw.addEventListener('click', clearDrawings);
    { const nt = $('namesTgl'); if (nt) { nt.classList.toggle('on', state.showNames); nt.addEventListener('click', () => { state.showNames = !state.showNames; nt.classList.toggle('on', state.showNames); renderTokens(); saveProject(); }); } }
    { const sc = $('sideChip'); if (sc) sc.addEventListener('click', cycleSide); }
    objBtn.addEventListener('click', () => toggleObjPanel()); objClose.addEventListener('click', () => toggleObjPanel(false));

    nameInput.addEventListener('input', () => { cur().nome = nameInput.value; syncCard(); saveProject(); });
    condInput.addEventListener('input', () => { cur().condicao = condInput.value.trim() || null; syncCard(); saveProject(); });
    noteInput.addEventListener('input', () => { cur().nota = noteInput.value; saveProject(); });
    addScene.addEventListener('click', addScenarioBlank); dupScene.addEventListener('click', duplicateCurrent);
    seedBtn.addEventListener('click', async () => { if (state.scenarios.some(s => !isPristine(s)) && !await askConfirm('Adicionar os cenários das fases padrão ao projeto?')) return; seedStandard(); });
    exportBtn.addEventListener('click', exportProject); importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', e => { const f = e.target.files[0]; if (f) importProjectFile(f); e.target.value = ''; });
    shareBtn.addEventListener('click', shareLink); resetBtn.addEventListener('click', resetAll);
    shareClose.addEventListener('click', () => shareModal.hidden = true);
    shareModal.addEventListener('click', e => { if (e.target === shareModal) shareModal.hidden = true; });
    shareCopy.addEventListener('click', async () => { shareUrl.focus(); shareUrl.select(); let ok = false; try { await navigator.clipboard.writeText(shareUrl.value); ok = true; } catch (e) {} if (!ok) { try { ok = document.execCommand('copy'); } catch (e) {} } toast(ok ? 'Link copiado ✓' : 'Selecione tudo e copie (Ctrl+C)'); });
    { const od = $('objDump'); if (od) od.addEventListener('click', dumpPositions); }
    $('zoomIn').addEventListener('click', () => zoomBy(1.25)); $('zoomOut').addEventListener('click', () => zoomBy(0.8)); $('zoomReset').addEventListener('click', zoomReset);
    presentBtn.addEventListener('click', enterPresent); exitBtn.addEventListener('click', exitPresent);
    prevBtn.addEventListener('click', () => go(-1)); nextBtn.addEventListener('click', () => go(1));
    miniPrev.addEventListener('click', () => go(-1)); miniNext.addEventListener('click', () => go(1));
    fasesBtn.addEventListener('click', () => setDock(!document.body.classList.contains('fases-open')));
    dockCollapse.addEventListener('click', () => setDock(false));
    dockExpand.addEventListener('click', () => setDock(true));

    document.addEventListener('keydown', e => {
      if (!confirmModal.hidden) { if (e.key === 'Escape') { confirmNo.onclick && confirmNo.onclick(); } return; }
      if (!ptModal.hidden) { if (e.key === 'Escape') closePtEditor(); return; }
      if (!rosterModal.hidden) { if (e.key === 'Escape') closeRoster(); return; }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
      if (state.present) { if (e.key === 'Escape') exitPresent(); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); } return; }
      if (e.key === 'Escape' && linkTempFrom) { cancelLink(); renderTokens(); return; }
      if (e.key === 'Escape' && carryPickFor) { carryPickFor = null; document.body.classList.remove('linking'); return; }
      if (e.key === 'Escape' && iconMenu && !iconMenu.hidden) { closeIconMenu(); return; }
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); return; }
      const map = { v: 'select', a: 'seta', l: 'linha', d: 'livre', r: 'retangulo', i: 'marca' }; if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && state.present) exitPresent(); });

    rosterBtn.addEventListener('click', () => { if (isMobile()) document.body.classList.toggle('mob-roster'); else openRoster(); }); editRosterBtn.addEventListener('click', openRoster); rosterClose.addEventListener('click', closeRoster);
    { const rmc = $('rosterMClose'); if (rmc) rmc.addEventListener('click', () => document.body.classList.remove('mob-roster')); }
    rosterModal.addEventListener('click', e => { if (e.target === rosterModal) closeRoster(); });
    parseBtn.addEventListener('click', () => { const parsed = parseRoster(rosterPaste.value); if (!parsed.length) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = 'Não reconheci jogadores. Confira o formato.'; return; } rosterDraft = parsed; parseMsg.className = 'parse-msg ok'; parseMsg.textContent = parsed.length + ' jogadores reconhecidos.'; renderGrid(); });
    autoBtn.addEventListener('click', autoAssign);
    bdAuto.addEventListener('click', autoAssign);
    bdClearPt.addEventListener('click', () => { rosterDraft.forEach(p => { p.pt = null; p.reserva = false; }); refreshRoster(); });
    viewToggle.addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) setRosterView(b.dataset.view); });
    rosterBoard.addEventListener('dragstart', e => { const c = e.target.closest('.bd-chip'); if (c) { bdDragId = c.dataset.id; c.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.dataset.id); } catch (_) {} if (bdPop) bdPop.hidden = true; } });
    rosterBoard.addEventListener('dragend', () => { rosterBoard.querySelectorAll('.dragging').forEach(x => x.classList.remove('dragging')); rosterBoard.querySelectorAll('.bd-zone.over').forEach(z => z.classList.remove('over')); });
    rosterBoard.addEventListener('dragover', e => { const z = e.target.closest('.bd-zone'); if (z) { e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch (_) {} rosterBoard.querySelectorAll('.bd-zone.over').forEach(x => { if (x !== z) x.classList.remove('over'); }); z.classList.add('over'); } });
    rosterBoard.addEventListener('drop', e => { const z = e.target.closest('.bd-zone'); if (z && bdDragId) { e.preventDefault(); bdMove(bdDragId, z.dataset.zone); } bdDragId = null; });
    rosterBoard.addEventListener('click', e => {
      if (e.target.closest('.bd-allres')) { rosterDraft.forEach(p => { if (!p.pt && !p.reserva && !p.ausente) p.reserva = true; }); refreshRoster(); return; }
      const ob = e.target.closest('.bd-obs-btn') || e.target.closest('.bd-obs-line'); if (ob) { const card = ob.closest('.bd-pt-card'); if (card) { card.classList.toggle('obs-edit'); const inp = card.querySelector('.bd-obs'); if (inp && card.classList.contains('obs-edit')) inp.focus(); } return; }
      const c = e.target.closest('.bd-chip'); if (c) openBdPop(c.dataset.id, c);
    });
    bdPop.addEventListener('click', e => {
      const p = rosterDraft.find(x => x.id === bdPopId); if (!p) return;
      const pt = e.target.closest('.bp-p'), r = e.target.closest('.bp-r'), rep = e.target.closest('.bp-rep'), tg = e.target.closest('.bp-t'), f = e.target.closest('.bp-f:not(.bp-rep)');
      if (pt) { p.pt = pt.dataset.pt || null; if (p.pt) p.reserva = false; bdPop.querySelectorAll('.bp-p').forEach(x => x.classList.toggle('active', (x.dataset.pt || '') === (p.pt || ''))); refreshRoster(); }
      else if (r) { p.funcao = r.dataset.role; bdPop.querySelectorAll('.bp-r').forEach(x => x.classList.toggle('active', x.dataset.role === p.funcao)); refreshRoster(); }
      else if (rep) { p.replace = !p.replace; rep.classList.toggle('active', !!p.replace); refreshRoster(); }
      else if (tg) { const val = tg.dataset.tag; p.tags = memTags(p).slice(); delete p.tag2; if (!val) { p.tags = []; } else { const i = p.tags.indexOf(val); if (i >= 0) p.tags.splice(i, 1); else p.tags.push(val); } bdPop.querySelectorAll('.bp-t').forEach(x => x.classList.toggle('active', x.dataset.tag ? p.tags.indexOf(x.dataset.tag) >= 0 : !p.tags.length)); refreshRoster(); }
      else if (f) { const id = f.dataset.flag; p.flags = p.flags || []; const i = p.flags.indexOf(id); if (i >= 0) p.flags.splice(i, 1); else p.flags.push(id); f.classList.toggle('active', p.flags.indexOf(id) >= 0); refreshRoster(); }
    });
    rosterBoard.addEventListener('input', e => { const o = e.target.closest('.bd-obs'); if (o) { const pid = o.dataset.pt, v = o.value.trim(); if (v) state.ptDesc[pid] = v; else delete state.ptDesc[pid]; saveProject(); renderSidebar(); } });
    document.addEventListener('click', e => { if (bdPop && !bdPop.hidden && !e.target.closest('#bdPop') && !e.target.closest('.bd-chip')) bdPop.hidden = true; });
    rosterClear2.addEventListener('click', async () => { if (await askConfirm('Limpar todos os jogadores?')) { rosterDraft = []; renderGrid(); } });
    // editor de PT
    peClose.addEventListener('click', closePtEditor);
    ptModal.addEventListener('click', e => { if (e.target === ptModal) closePtEditor(); });
    peDesc.addEventListener('input', () => { if (editingPt) { state.ptDesc[editingPt] = peDesc.value.trim(); if (!state.ptDesc[editingPt]) delete state.ptDesc[editingPt]; renderSidebar(); saveProject(); } });
    peAddBtn.addEventListener('click', () => { const id = peAddSel.value; if (!id) return; const pl = state.roster.find(x => x.id === id); if (pl) { pl.pt = editingPt; pl.reserva = false; saveProject(); renderSidebar(); renderTokens(); renderPtEditor(); } });
    rosterGrid.addEventListener('change', e => { const row = e.target.closest('.rrow'); if (!row) return; const p = rosterDraft[+row.dataset.i]; if (!p) return; if (e.target.classList.contains('f-fn')) p.funcao = e.target.value; else if (e.target.classList.contains('f-pt')) p.pt = e.target.value || null; else if (e.target.classList.contains('f-res')) p.reserva = e.target.checked; renderGrid(); });
    rosterGrid.addEventListener('click', e => { if (!e.target.classList.contains('rdel')) return; const row = e.target.closest('.rrow'); if (!row) return; rosterDraft.splice(+row.dataset.i, 1); renderGrid(); });
    rosterSave.addEventListener('click', () => { state.roster = rosterDraft.map(p => Object.assign({}, p)); saveProject(); renderSidebar(); renderTokens(); saveMsg.className = 'parse-msg ok'; saveMsg.textContent = 'Roster salvo ✓'; setTimeout(closeRoster, 500); });

    let raf = null; const relayout = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }; new ResizeObserver(relayout).observe(mapPanel); window.addEventListener('resize', relayout);
  }
  function setDock(open) { document.body.classList.toggle('fases-open', open); fasesBtn.classList.toggle('on', open); updateMini(); }

  // ---- persistência ----
  function saveProject() { try { localStorage.setItem(CFG.projectKey, JSON.stringify({ v: 5, currentId: state.currentId, scenarios: state.scenarios, roster: state.roster, ptDesc: state.ptDesc, ptIcon: state.ptIcon, objetivoPosGlobal: state.objetivoPosGlobal, gates: state.gates, side: state.side, showNames: state.showNames })); } catch (e) {} }
  function loadProject() { try { const raw = localStorage.getItem(CFG.projectKey); if (raw) { const d = JSON.parse(raw); if (Array.isArray(d.scenarios) && d.scenarios.length) { state.scenarios = d.scenarios.map(sanitizeScenario); state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id; if (Array.isArray(d.roster)) state.roster = d.roster.map(sanitizePlayer); state.objetivoPosGlobal = sanitizePosMap(d.objetivoPosGlobal); state.gates = sanitizePosMap(d.gates); state.side = (d.side === 'blue' || d.side === 'red') ? d.side : null; state.ptDesc = sanitizeDesc(d.ptDesc); state.ptIcon = sanitizeDesc(d.ptIcon); if (typeof d.showNames === 'boolean') state.showNames = d.showNames; return; } } } catch (e) {} const s = newScenario({ fase: 'Start', nome: 'Start (30m)' }); state.scenarios = [s]; state.currentId = s.id; }
  function sanitizeScenario(s) { return { id: s.id || uid(), fase: s.fase || 'Cenário', nome: s.nome || 'Cenário', condicao: s.condicao || null, tokens: Array.isArray(s.tokens) ? s.tokens.filter(t => partyById.has(t.pt)).map(t => { const o = { pt: t.pt, xf: clamp01(t.xf), yf: clamp01(t.yf) }; if (typeof t.hp === 'number' && t.hp >= 0 && t.hp < 100) o.hp = Math.round(t.hp); return o; }) : [], desenhos: Array.isArray(s.desenhos) ? s.desenhos.filter(d => d && Array.isArray(d.pontos)).map(d => ({ tipo: d.tipo, pontos: d.pontos.map(p => [clamp01(p[0]), clamp01(p[1])]), cor: d.cor || '#FFC21A', largura: d.largura || 3 })) : [], objetivos: (s.objetivos && typeof s.objetivos === 'object') ? Object.fromEntries(Object.keys(s.objetivos).filter(k => objById.has(k) && s.objetivos[k]).map(k => [k, true])) : {}, objetivoPos: (s.objetivoPos && typeof s.objetivoPos === 'object') ? Object.fromEntries(Object.entries(s.objetivoPos).filter(([k, v]) => objById.has(k) && v).map(([k, v]) => [k, { x: clamp01(v.x), y: clamp01(v.y) }])) : {}, destacados: Array.isArray(s.destacados) ? s.destacados.filter(d => partyById.has(d.pt)).map(d => { const o = { id: d.id || uid(), pt: d.pt, nome: String(d.nome || '—'), funcao: ['Tank', 'DPS', 'Healer'].includes(d.funcao) ? d.funcao : 'DPS', xf: clamp01(d.xf), yf: clamp01(d.yf) }; if (typeof d.hp === 'number' && d.hp >= 0 && d.hp < 100) o.hp = Math.round(d.hp); if (d.dead) o.dead = true; return o; }) : [], links: Array.isArray(s.links) ? s.links.filter(l => l && typeof l.a === 'string' && typeof l.b === 'string' && l.a !== l.b).map(l => ({ id: l.id || uid(), a: l.a, b: l.b })) : [], objHp: (s.objHp && typeof s.objHp === 'object') ? Object.fromEntries(Object.entries(s.objHp).filter(([k, v]) => objById.has(k) && typeof v === 'number' && v >= 0 && v <= 100).map(([k, v]) => [k, Math.round(v)])) : {}, objBuffs: (s.objBuffs && typeof s.objBuffs === 'object') ? Object.fromEntries(Object.entries(s.objBuffs).filter(([k, v]) => objById.has(k) && Array.isArray(v)).map(([k, v]) => [k, v.filter(x => typeof x === 'string')])) : {}, treeCarry: (s.treeCarry && typeof s.treeCarry === 'object') ? Object.fromEntries(Object.entries(s.treeCarry).filter(([k, v]) => objById.has(k) && Array.isArray(v)).map(([k, v]) => [k, v.filter(x => typeof x === 'string').slice(0, 2)])) : {}, notas: Array.isArray(s.notas) ? s.notas.filter(n => n && typeof n.text === 'string').map(n => ({ id: n.id || uid(), x: clamp01(n.x), y: clamp01(n.y), text: String(n.text).slice(0, 240) })) : [], enemies: Array.isArray(s.enemies) ? s.enemies.map(e => ({ id: e.id || uid(), x: clamp01(e.x), y: clamp01(e.y), n: Math.max(0, Math.min(99, parseInt(e.n) || 0)), label: typeof e.label === 'string' ? e.label.slice(0, 24) : '' })) : [], marcas: Array.isArray(s.marcas) ? s.marcas.filter(m => m && (m.kind === 'emoji' || (m.kind === 'asset' && CFG.assets.icons[m.val])) && typeof m.val === 'string').map(m => ({ id: m.id || uid(), x: clamp01(m.x), y: clamp01(m.y), kind: m.kind, val: String(m.val).slice(0, 8) })) : [], nota: typeof s.nota === 'string' ? s.nota : '' }; }
  function sanitizePlayer(p) { const funcao = ['Tank', 'DPS', 'Healer'].includes(p.funcao) ? p.funcao : 'DPS'; const flagIds = (CFG.specialFlags || []).map(f => f.id); return { id: p.id || uid(), nome: String(p.nome || '—'), classe: String(p.classe || funcao), funcao, status: p.status || 'primary', ausente: !!p.ausente, reserva: !!p.reserva, pt: PT_IDS.includes(p.pt) ? p.pt : null, tags: (Array.isArray(p.tags) ? p.tags : (p.tag2 ? [p.tag2] : [])).filter(tg => (CFG.secondaryTags || []).includes(tg)), flags: Array.isArray(p.flags) ? p.flags.filter(f => flagIds.includes(f)) : [], replace: !!p.replace, nota: typeof p.nota === 'string' ? p.nota : '' }; }
})();
