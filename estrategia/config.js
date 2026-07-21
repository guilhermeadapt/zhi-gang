/* =============================================================================
 * Zhi Guides — Mapa de Estratégia GvG (guild Wanted)
 * config.js — ponto único de configuração
 *
 * TODO (assets próprios): as imagens abaixo são reaproveitadas TEMPORARIAMENTE
 * do gvgstratmaker (MightyLabs) como placeholder, guardadas em
 * /assets/vendor-ref/. São de uso INTERNO e devem ser substituídas por assets
 * próprios. Para trocar o mapa ou os ícones, basta editar os caminhos aqui —
 * o resto do app lê tudo deste objeto.
 * ========================================================================== */

const WWM = {
  /* --- imagem do mapa ---------------------------------------------------- */
  // Tamanho natural (px) da arte do mapa (v2 cortado). Só para manter proporção.
  mapSize: { w: 1096, h: 813 },

  assets: {
    // Mapa base (limpo, grama até a borda, cortado) — gerado pela guild (v2).
    map: '../assets/map/board.jpg',

    // Ícones dos objetivos (torre/ganso/árvore/boss) + classe (tank/dps/healer).
    icons: {
      tower_blue: '../assets/vendor-ref/tower_blue.png',
      tower_red:  '../assets/vendor-ref/tower_red.png',
      goose_blue: '../assets/vendor-ref/goose_blue.png',
      goose_red:  '../assets/vendor-ref/goose_red.png',
      tree_blue:  '../assets/vendor-ref/tree_blue.png',
      tree_red:   '../assets/vendor-ref/tree_red.png',
      boss:       '../assets/vendor-ref/boss.png',
      // Jungle = ícone da Fun Coin (arte própria da guild, recorte redondo).
      jungle:     '../assets/icons/funcoin.png',
      tank:       '../assets/vendor-ref/tank.png',
      dps:        '../assets/vendor-ref/dps.png',
      healer:     '../assets/vendor-ref/healer.png',
    },
  },

  // ícone de classe por função (tokens de membro destacado)
  classIcons: { Tank: 'tank', DPS: 'dps', Healer: 'healer' },

  // galeria de ícones para as PTs (emoji) — o estrategista escolhe no editor
  ptIcons: ['⚔️', '🛡️', '🏹', '💥', '🎯', '🌳', '🦢', '👑', '🔥', '❄️', '⚡', '🩸', '🚩', '🐉', '💀', '⭐'],

  // paleta de ícones "carimbáveis" no mapa (ferramenta Ícone):
  //  assets = arte do jogo (chaves de assets.icons); emojis = símbolos livres
  markIcons: {
    assets: ['tower_blue', 'tower_red', 'goose_blue', 'goose_red', 'tree_blue', 'tree_red', 'boss', 'jungle', 'tank', 'dps', 'healer'],
    emojis: ['⚔️', '🛡️', '🏹', '🎯', '⚠️', '❗', '❌', '✅', '⭐', '🔥', '💥', '💀', '🚩', '📍', '👑', '🐉', '🩸', '🛑', '⬆️', '⬇️', '⬅️', '➡️', '🔵', '🔴', '🟢', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'],
  },

  /* --- catálogo de objetivos -------------------------------------------
   * Cada objetivo pode ser ligado/desligado ("up") por cenário e reposicionado
   * arrastando (posição salva no projeto). Posições iniciais são estimativas
   * sobre o mapa base — ajuste arrastando. icone: chave em assets.icons ou
   * um tipo desenhado (jungle). up: default no cenário Start.
   */
  // Posições calibradas sobre o mapa base. `movel:true` = arrastável (árvore/ganso);
  // os demais são FIXOS (torres, boss, outpost, jungle não se movem).
  // TODO: refinar posições no mapa novo que a guild vai gerar.
  // Posições calibradas pela guild (dump "Copiar posições"). As torres do lado
  // Leste (vermelho) são o espelho horizontal das do Oeste (base = torre azul),
  // em torno do eixo de simetria do mapa (x≈0.506), mantendo a mesma altura.
  objetivos: [
    // 3 torres por lado (top / mid / bot) — FIXAS
    { id: 'torre_top_o', grupo: 'Torres', rotulo: 'Torre Top (O)', icone: 'tower_blue', x: 0.390, y: 0.330 },
    { id: 'torre_mid_o', grupo: 'Torres', rotulo: 'Torre Mid (O)', icone: 'tower_blue', x: 0.384, y: 0.505 },
    { id: 'torre_bot_o', grupo: 'Torres', rotulo: 'Torre Bot (O)', icone: 'tower_blue', x: 0.388, y: 0.686 },
    { id: 'torre_top_l', grupo: 'Torres', rotulo: 'Torre Top (L)', icone: 'tower_red',  x: 0.622, y: 0.330 },
    { id: 'torre_mid_l', grupo: 'Torres', rotulo: 'Torre Mid (L)', icone: 'tower_red',  x: 0.628, y: 0.505 },
    { id: 'torre_bot_l', grupo: 'Torres', rotulo: 'Torre Bot (L)', icone: 'tower_red',  x: 0.624, y: 0.686 },
    // ganso nos 2 lados (nasce no portão) — MÓVEL. flip: espelha a arte do lado O.
    { id: 'ganso_o', grupo: 'Ganso', rotulo: 'Ganso (Oeste)', icone: 'goose_blue', x: 0.222, y: 0.509, movel: true, flip: true },
    { id: 'ganso_l', grupo: 'Ganso', rotulo: 'Ganso (Leste)', icone: 'goose_red',  x: 0.793, y: 0.503, movel: true },
    // árvore nasce no MESMO ponto do ganso e caminha até o portão inimigo (333m) — MÓVEL
    { id: 'arvore_o', grupo: 'Árvore', rotulo: 'Árvore (Oeste)', icone: 'tree_blue', x: 0.195, y: 0.511, movel: true, flip: true, caminho: { a: [0.195, 0.511], b: [0.831, 0.511] } },
    { id: 'arvore_l', grupo: 'Árvore', rotulo: 'Árvore (Leste)', icone: 'tree_red',  x: 0.831, y: 0.511, movel: true, caminho: { a: [0.831, 0.511], b: [0.195, 0.511] } },
    // boss / nirvana nas 2 PONTAS (norte e sul) — FIXO
    { id: 'boss_n', grupo: 'Boss', rotulo: 'Boss / Nirvana (N)', icone: 'boss', x: 0.438, y: 0.136 },
    { id: 'boss_s', grupo: 'Boss', rotulo: 'Boss / Nirvana (S)', icone: 'boss', x: 0.594, y: 0.869 },
    // outpost — nasce quase ao lado do boss (FIXO). Marcador.
    { id: 'outpost_n', grupo: 'Outpost', rotulo: 'Outpost (N)', icone: 'outpost', x: 0.593, y: 0.146 },
    { id: 'outpost_s', grupo: 'Outpost', rotulo: 'Outpost (S)', icone: 'outpost', x: 0.432, y: 0.871 },
    // jungle (mini-ninjas) — 8 camps FIXOS
    { id: 'jg_1', grupo: 'Jungle', rotulo: 'Jungle 1', icone: 'jungle', x: 0.375, y: 0.424 },
    { id: 'jg_2', grupo: 'Jungle', rotulo: 'Jungle 2', icone: 'jungle', x: 0.459, y: 0.430 },
    { id: 'jg_3', grupo: 'Jungle', rotulo: 'Jungle 3', icone: 'jungle', x: 0.571, y: 0.402 },
    { id: 'jg_4', grupo: 'Jungle', rotulo: 'Jungle 4', icone: 'jungle', x: 0.649, y: 0.424 },
    { id: 'jg_5', grupo: 'Jungle', rotulo: 'Jungle 5', icone: 'jungle', x: 0.374, y: 0.588 },
    { id: 'jg_6', grupo: 'Jungle', rotulo: 'Jungle 6', icone: 'jungle', x: 0.447, y: 0.625 },
    { id: 'jg_7', grupo: 'Jungle', rotulo: 'Jungle 7', icone: 'jungle', x: 0.568, y: 0.574 },
    { id: 'jg_8', grupo: 'Jungle', rotulo: 'Jungle 8', icone: 'jungle', x: 0.645, y: 0.580 },
  ],
  objetivosGrupos: ['Torres', 'Ganso', 'Árvore', 'Boss', 'Outpost', 'Jungle'],
  treeMeters: 333,   // distância total do caminho da árvore (base -> portão inimigo)

  /* --- funções (Tank / DPS / Healer — Support = DPS) --------------------- */
  roleColors: {
    Tank:   '#89abc5', // board (azul)
    DPS:    '#E25B52', // crimson
    Healer: '#4CC9A4', // jade
  },
  roleOrder: ['Tank', 'Healer', 'DPS'],
  ptSize: 5,   // tamanho alvo de cada PT (usado no auto-montar)

  /* mapeia as classes do raid-helper (Discord) para as nossas funções.
     Support não existe como função própria — entra como DPS. */
  classMap: {
    Tank: 'Tank', Healer: 'Healer', Ranged: 'DPS', Melee: 'DPS', Support: 'DPS',
  },

  /* --- PTs disponíveis na paleta ----------------------------------------
   * A ferramenta é focada em PTs (grupos de ~5), não em players individuais.
   * Cada PT recebe uma cor distinta para leitura no mapa. Ajuste a lista
   * conforme o tamanho da guild (o roster real virá numa etapa futura).
   */
  // Máximo 6 PTs. PT1–3 = Ataque, PT4–6 = Defesa.
  parties: [
    { id: 'PT1', cor: '#E8974A', grupo: 'Ataque' }, // laranja
    { id: 'PT2', cor: '#E25B52', grupo: 'Ataque' }, // crimson
    { id: 'PT3', cor: '#E27B9E', grupo: 'Ataque' }, // rosa
    { id: 'PT4', cor: '#89ABC5', grupo: 'Defesa' }, // azul board
    { id: 'PT5', cor: '#4CC9A4', grupo: 'Defesa' }, // jade
    { id: 'PT6', cor: '#46B3C9', grupo: 'Defesa' }, // ciano
  ],
  grupos: [
    { nome: 'Ataque', hint: 'PT1–3', pts: ['PT1', 'PT2', 'PT3'] },
    { nome: 'Defesa', hint: 'PT4–6', pts: ['PT4', 'PT5', 'PT6'] },
  ],

  // paleta das ferramentas de desenho — cores fortes (boa leitura sobre o mapa)
  drawColors: ['#FFC21A', '#FF3B30', '#2E7DFF', '#17C964', '#FFFFFF', '#0A0A0A'],
  drawWidths: [2, 3, 5],

  /* --- comportamento default --------------------------------------------- */
  defaults: {
    objectivesOn: true,       // começa mostrando os objetivos na arte do mapa
  },

  /* --- fases padrão da partida (a timeline do brief) ---------------------
   * "Semeia" a árvore de cenários. As variantes condicionais viram cenários
   * irmãos na mesma fase (ex.: Torres → "se levamos" / "se não levamos").
   */
  fasesPadrao: [
    { fase: 'Start',          nome: 'Start (30m)',      condicao: null },
    { fase: 'Torres',         nome: 'Torres',           condicao: 'se levamos' },
    { fase: 'Torres',         nome: 'Torres',           condicao: 'se não levamos' },
    { fase: 'Ganso',          nome: 'Ganso',            condicao: null },
    { fase: 'Halftime',       nome: 'Halftime',         condicao: null },
    { fase: 'Boss / Nirvana', nome: 'Boss / Nirvana',   condicao: null },
    { fase: 'Pós-Nirvana',    nome: 'Pós-Nirvana',      condicao: 'vitória' },
    { fase: 'Pós-Nirvana',    nome: 'Pós-Nirvana',      condicao: 'derrota' },
    { fase: 'Colapso',        nome: 'Colapso de Árvores', condicao: null },
  ],

  /* --- persistência (localStorage) --------------------------------------- */
  projectKey: 'zhi_estrategia_projeto_v1',   // projeto completo (cenários)
  storageKey: 'zhi_estrategia_rascunho_v1',  // rascunho antigo (etapa 1) — migrado
};

// expõe global (app.js consome)
window.WWM = WWM;
