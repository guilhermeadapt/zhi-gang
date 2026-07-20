/* =============================================================================
 * Zhi Guides — Mapa de Estratégia GvG (guild Wanted)
 * app.js — Etapa 1: casca + mapa + tokens de PT (colocar / arrastar / mover)
 *
 * Conceitos que já ficam prontos para as próximas etapas:
 *  - Coordenadas dos tokens em FRAÇÃO 0–1 (responsivo a qualquer tamanho de mapa)
 *  - Assets 100% lidos de window.WWM (config.js) — trocar em 1 lugar
 *  - Rascunho salvo em localStorage
 * ========================================================================== */
(function () {
  'use strict';

  const CFG = window.WWM;
  const NAT = CFG.mapSize;                       // tamanho natural do mapa
  const AR = NAT.w / NAT.h;                       // proporção

  // ---- elementos DOM ----
  const mapPanel = document.getElementById('mapPanel');
  const stageWrap = document.getElementById('stageWrap');
  const ptList = document.getElementById('ptList');
  const mapHint = document.getElementById('mapHint');
  const placedCount = document.getElementById('placedCount');
  const objToggle = document.getElementById('objToggle');
  const objState = document.getElementById('objState');
  const clearBtn = document.getElementById('clearBtn');

  // ---- estado ----
  const state = {
    tokens: new Map(),        // ptId -> { xf, yf }  (fração 0–1)
    objectivesOn: CFG.defaults.objectivesOn,
  };
  const partyById = new Map(CFG.parties.map(p => [p.id, p]));

  // ---- Konva ----
  const stage = new Konva.Stage({ container: 'stage', width: 10, height: 10 });
  const bgLayer = new Konva.Layer({ listening: false });
  const tokenLayer = new Konva.Layer();
  stage.add(bgLayer, tokenLayer);

  const bgImage = new Konva.Image({ x: 0, y: 0 });
  bgLayer.add(bgImage);

  let W = 10, H = 10, R = 20;   // dimensões atuais do stage + raio do token
  const imgObjectives = new Image();
  const imgClean = new Image();
  let imagesReady = 0;

  // ---------------------------------------------------------------------------
  // Boot: carrega as duas variantes do mapa, então monta a UI
  // ---------------------------------------------------------------------------
  function onImg() {
    imagesReady++;
    if (imagesReady === 2) init();
  }
  imgObjectives.onload = onImg;
  imgClean.onload = onImg;
  imgObjectives.onerror = onImg;   // não trava se um faltar
  imgClean.onerror = onImg;
  imgObjectives.src = CFG.assets.mapObjectives;
  imgClean.src = CFG.assets.mapClean;

  function init() {
    loadDraft();
    buildRoster();
    applyObjectivesUI();
    fit();
    renderTokens();
    wireEvents();
  }

  // ---------------------------------------------------------------------------
  // Layout responsivo: encaixa o mapa (contain) na área disponível
  // ---------------------------------------------------------------------------
  function fit() {
    const availW = mapPanel.clientWidth - 36;    // padding do .map-panel
    const availH = mapPanel.clientHeight - 36;
    if (availW <= 0 || availH <= 0) return;

    let w = availW, h = w / AR;
    if (h > availH) { h = availH; w = h * AR; }

    W = Math.round(w);
    H = Math.round(h);
    R = Math.max(15, Math.round(W * 0.024));

    stage.size({ width: W, height: H });
    stageWrap.style.width = W + 'px';
    stageWrap.style.height = H + 'px';

    bgImage.size({ width: W, height: H });
    bgLayer.batchDraw();

    layoutTokens();
  }

  // ---------------------------------------------------------------------------
  // Objetivos: alterna a arte do mapa entre "com marcadores" e "limpo"
  // ---------------------------------------------------------------------------
  function applyObjectivesUI() {
    objToggle.checked = state.objectivesOn;
    objState.textContent = state.objectivesOn ? 'ON' : 'OFF';
    bgImage.image(state.objectivesOn ? imgObjectives : imgClean);
    bgLayer.batchDraw();
  }

  // ---------------------------------------------------------------------------
  // Roster (paleta de PTs à direita)
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
        ev.dataTransfer.setData('text/plain', p.id);
        ev.dataTransfer.effectAllowed = 'copy';
      });
      ptList.appendChild(chip);
    });
    refreshChips();
  }

  function refreshChips() {
    let placed = 0;
    ptList.querySelectorAll('.pt-chip').forEach(chip => {
      const on = state.tokens.has(chip.dataset.pt);
      chip.classList.toggle('placed', on);
      chip.querySelector('.status').textContent = on ? 'No mapa' : 'Arraste';
      if (on) placed++;
    });
    placedCount.textContent = placed;
    mapHint.classList.toggle('hide', placed > 0);
  }

  // ---------------------------------------------------------------------------
  // Tokens
  // ---------------------------------------------------------------------------
  function makeToken(ptId) {
    const p = partyById.get(ptId);
    const group = new Konva.Group({ draggable: true, name: 'token', id: 'tok-' + ptId });
    group.setAttr('ptId', ptId);

    // halo
    const halo = new Konva.Circle({ radius: R + 4, fill: p.cor, opacity: 0.22 });
    // corpo
    const body = new Konva.Circle({
      radius: R, fill: '#0b0e15',
      stroke: p.cor, strokeWidth: Math.max(2, R * 0.12),
      shadowColor: '#000', shadowBlur: 10, shadowOpacity: 0.5, shadowOffsetY: 3,
    });
    // rótulo
    const label = new Konva.Text({
      text: ptId, fontFamily: 'Oswald, sans-serif', fontStyle: '700',
      fontSize: Math.round(R * 0.78), fill: p.cor,
      align: 'center', verticalAlign: 'middle',
      width: R * 2.4, height: R * 2, offsetX: R * 1.2, offsetY: R,
    });
    group.add(halo, body, label);

    // manter dentro do mapa
    group.dragBoundFunc(pos => ({
      x: Math.max(0, Math.min(W, pos.x)),
      y: Math.max(0, Math.min(H, pos.y)),
    }));

    group.on('dragstart', () => group.moveToTop());
    group.on('dragend', () => {
      const t = state.tokens.get(ptId);
      if (t) { t.xf = clamp01(group.x() / W); t.yf = clamp01(group.y() / H); saveDraft(); }
    });

    // duplo-clique / duplo-toque remove
    group.on('dblclick dbltap', () => removeToken(ptId));

    // feedback de cursor
    group.on('mouseenter', () => { stage.container().style.cursor = 'grab'; body.strokeWidth(Math.max(3, R * 0.16)); tokenLayer.batchDraw(); });
    group.on('mouseleave', () => { stage.container().style.cursor = 'default'; body.strokeWidth(Math.max(2, R * 0.12)); tokenLayer.batchDraw(); });
    group.on('mousedown', () => { stage.container().style.cursor = 'grabbing'; });
    group.on('mouseup', () => { stage.container().style.cursor = 'grab'; });

    return group;
  }

  // (re)desenha todos os tokens a partir do estado
  function renderTokens() {
    tokenLayer.destroyChildren();
    state.tokens.forEach((t, ptId) => {
      const g = makeToken(ptId);
      g.position({ x: t.xf * W, y: t.yf * H });
      tokenLayer.add(g);
    });
    tokenLayer.batchDraw();
    refreshChips();
  }

  // reposiciona/redimensiona tokens após resize (sem recriar o estado)
  function layoutTokens() {
    // recria com o novo R (mais simples e barato do que mutar cada shape)
    renderTokens();
  }

  function placeToken(ptId, xf, yf) {
    if (!partyById.has(ptId)) return;
    state.tokens.set(ptId, { xf: clamp01(xf), yf: clamp01(yf) });
    renderTokens();
    saveDraft();
  }

  function removeToken(ptId) {
    state.tokens.delete(ptId);
    renderTokens();
    saveDraft();
  }

  // ---------------------------------------------------------------------------
  // Eventos globais
  // ---------------------------------------------------------------------------
  function wireEvents() {
    // drag-drop da paleta -> stage
    const cont = stage.container();

    ['dragenter', 'dragover'].forEach(evt =>
      cont.addEventListener(evt, e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; mapPanel.classList.add('dragover'); })
    );
    ['dragleave', 'dragend'].forEach(evt =>
      cont.addEventListener(evt, () => mapPanel.classList.remove('dragover'))
    );
    cont.addEventListener('drop', e => {
      e.preventDefault();
      mapPanel.classList.remove('dragover');
      const ptId = e.dataTransfer.getData('text/plain');
      if (!ptId) return;
      stage.setPointersPositions(e);
      const pos = stage.getPointerPosition() || { x: W / 2, y: H / 2 };
      placeToken(ptId, pos.x / W, pos.y / H);
    });

    // toggle de objetivos
    objToggle.addEventListener('change', () => {
      state.objectivesOn = objToggle.checked;
      applyObjectivesUI();
      saveDraft();
    });

    // limpar
    clearBtn.addEventListener('click', () => {
      if (state.tokens.size === 0) return;
      if (!confirm('Remover todas as PTs do mapa?')) return;
      state.tokens.clear();
      renderTokens();
      saveDraft();
    });

    // resize
    let raf = null;
    const ro = new ResizeObserver(() => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); });
    ro.observe(mapPanel);
    window.addEventListener('resize', () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); });
  }

  // ---------------------------------------------------------------------------
  // Persistência (rascunho localStorage)
  // ---------------------------------------------------------------------------
  function saveDraft() {
    try {
      const data = {
        v: 1,
        objectivesOn: state.objectivesOn,
        tokens: Array.from(state.tokens, ([pt, t]) => ({ pt, xf: t.xf, yf: t.yf })),
      };
      localStorage.setItem(CFG.storageKey, JSON.stringify(data));
    } catch (e) { /* localStorage indisponível — ignora */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.objectivesOn === 'boolean') state.objectivesOn = data.objectivesOn;
      if (Array.isArray(data.tokens)) {
        data.tokens.forEach(t => {
          if (partyById.has(t.pt)) state.tokens.set(t.pt, { xf: clamp01(t.xf), yf: clamp01(t.yf) });
        });
      }
    } catch (e) { /* rascunho corrompido — ignora */ }
  }

  // ---- util ----
  function clamp01(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }
})();
