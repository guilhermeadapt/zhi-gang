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
  // Tamanho natural (px) da arte do mapa. Usado só para manter proporção.
  mapSize: { w: 1217, h: 864 },

  assets: {
    // Mapa base (limpo) — gerado pela guild.
    map: '../assets/map/board.jpg',

    // Ícones dos objetivos (placeholder do vendor-ref — TODO: trocar por próprios).
    icons: {
      tower_blue: '../assets/vendor-ref/tower_blue.png',
      tower_red:  '../assets/vendor-ref/tower_red.png',
      goose_blue: '../assets/vendor-ref/goose_blue.png',
      goose_red:  '../assets/vendor-ref/goose_red.png',
      tree_blue:  '../assets/vendor-ref/tree_blue.png',
      tree_red:   '../assets/vendor-ref/tree_red.png',
      boss:       '../assets/vendor-ref/boss.png',
    },
  },

  /* --- catálogo de objetivos -------------------------------------------
   * Cada objetivo pode ser ligado/desligado ("up") por cenário e reposicionado
   * arrastando (posição salva no projeto). Posições iniciais são estimativas
   * sobre o mapa base — ajuste arrastando. icone: chave em assets.icons ou
   * um tipo desenhado (jungle). up: default no cenário Start.
   */
  // Posições calibradas sobre o mapa base (board.jpg). Ajustáveis arrastando.
  objetivos: [
    // 3 torres por lado (top / mid / bot) — Oeste (azul) e Leste (vermelho)
    { id: 'torre_top_o', grupo: 'Torres', rotulo: 'Torre Top (O)', icone: 'tower_blue', x: 0.393, y: 0.312 },
    { id: 'torre_mid_o', grupo: 'Torres', rotulo: 'Torre Mid (O)', icone: 'tower_blue', x: 0.393, y: 0.499 },
    { id: 'torre_bot_o', grupo: 'Torres', rotulo: 'Torre Bot (O)', icone: 'tower_blue', x: 0.393, y: 0.687 },
    { id: 'torre_top_l', grupo: 'Torres', rotulo: 'Torre Top (L)', icone: 'tower_red',  x: 0.626, y: 0.312 },
    { id: 'torre_mid_l', grupo: 'Torres', rotulo: 'Torre Mid (L)', icone: 'tower_red',  x: 0.626, y: 0.499 },
    { id: 'torre_bot_l', grupo: 'Torres', rotulo: 'Torre Bot (L)', icone: 'tower_red',  x: 0.626, y: 0.687 },
    // ganso nos 2 lados (junto aos portões)
    { id: 'ganso_o', grupo: 'Ganso', rotulo: 'Ganso (Oeste)', icone: 'goose_blue', x: 0.196, y: 0.499 },
    { id: 'ganso_l', grupo: 'Ganso', rotulo: 'Ganso (Leste)', icone: 'goose_red',  x: 0.827, y: 0.499 },
    // árvore nos 2 lados — nasce no portão e caminha até o portão inimigo (333m, lane mid)
    { id: 'arvore_o', grupo: 'Árvore', rotulo: 'Árvore (Oeste)', icone: 'tree_blue', x: 0.159, y: 0.499, caminho: { a: [0.159, 0.499], b: [0.864, 0.499] } },
    { id: 'arvore_l', grupo: 'Árvore', rotulo: 'Árvore (Leste)', icone: 'tree_red',  x: 0.864, y: 0.499, caminho: { a: [0.864, 0.499], b: [0.159, 0.499] } },
    // boss / nirvana (2, ao centro)
    { id: 'boss_n', grupo: 'Boss', rotulo: 'Boss / Nirvana (N)', icone: 'boss', x: 0.475, y: 0.41 },
    { id: 'boss_s', grupo: 'Boss', rotulo: 'Boss / Nirvana (S)', icone: 'boss', x: 0.475, y: 0.60 },
    // jungle (mini-ninjas) — 8 camps
    { id: 'jg_1', grupo: 'Jungle', rotulo: 'Jungle 1', icone: 'jungle', x: 0.37, y: 0.40 },
    { id: 'jg_2', grupo: 'Jungle', rotulo: 'Jungle 2', icone: 'jungle', x: 0.45, y: 0.38 },
    { id: 'jg_3', grupo: 'Jungle', rotulo: 'Jungle 3', icone: 'jungle', x: 0.55, y: 0.38 },
    { id: 'jg_4', grupo: 'Jungle', rotulo: 'Jungle 4', icone: 'jungle', x: 0.63, y: 0.40 },
    { id: 'jg_5', grupo: 'Jungle', rotulo: 'Jungle 5', icone: 'jungle', x: 0.37, y: 0.60 },
    { id: 'jg_6', grupo: 'Jungle', rotulo: 'Jungle 6', icone: 'jungle', x: 0.45, y: 0.62 },
    { id: 'jg_7', grupo: 'Jungle', rotulo: 'Jungle 7', icone: 'jungle', x: 0.55, y: 0.62 },
    { id: 'jg_8', grupo: 'Jungle', rotulo: 'Jungle 8', icone: 'jungle', x: 0.63, y: 0.60 },
  ],
  objetivosGrupos: ['Torres', 'Ganso', 'Árvore', 'Boss', 'Jungle'],
  treeMeters: 333,   // distância total do caminho da árvore (base -> portão inimigo)

  /* --- funções (mesmas cores do site Zhi Guides) ------------------------- */
  roleColors: {
    Tank:    '#89abc5', // board (azul)
    DPS:     '#E25B52', // crimson
    Healer:  '#4CC9A4', // jade
    Support: '#B98BE0', // roxo (debuffer)
  },
  roleOrder: ['Tank', 'Healer', 'DPS', 'Support'],
  ptSize: 5,   // tamanho alvo de cada PT (usado no auto-montar)

  /* mapeia as classes do raid-helper (Discord) para as nossas funções */
  classMap: {
    Tank: 'Tank', Healer: 'Healer', Ranged: 'DPS', Melee: 'DPS', Support: 'Support',
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

  // paleta das ferramentas de desenho
  drawColors: ['#D9A441', '#E25B52', '#89ABC5', '#4CC9A4', '#F2F2F2', '#111318'],
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
