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
  objetivos: [
    { id: 'boss_n',   grupo: 'Boss',   rotulo: 'Boss / Nirvana (Norte)', icone: 'boss',       x: 0.50, y: 0.11 },
    { id: 'boss_s',   grupo: 'Boss',   rotulo: 'Boss / Nirvana (Sul)',   icone: 'boss',       x: 0.495, y: 0.885 },
    { id: 'ganso',    grupo: 'Ganso',  rotulo: 'Ganso',                  icone: 'goose_blue', x: 0.50, y: 0.50 },
    { id: 'arvore_o', grupo: 'Árvore', rotulo: 'Árvore (Oeste)',         icone: 'tree_blue',  x: 0.175, y: 0.47 },
    { id: 'arvore_l', grupo: 'Árvore', rotulo: 'Árvore (Leste)',         icone: 'tree_red',   x: 0.825, y: 0.47 },
    { id: 'torre_o',  grupo: 'Torres', rotulo: 'Torre Oeste',            icone: 'tower_blue', x: 0.085, y: 0.47 },
    { id: 'torre_l',  grupo: 'Torres', rotulo: 'Torre Leste',            icone: 'tower_red',  x: 0.915, y: 0.47 },
    { id: 'torre_n',  grupo: 'Torres', rotulo: 'Torre Norte',            icone: 'tower_blue', x: 0.50, y: 0.20 },
    { id: 'torre_s',  grupo: 'Torres', rotulo: 'Torre Sul',              icone: 'tower_red',  x: 0.50, y: 0.79 },
    { id: 'jg_no',    grupo: 'Jungle', rotulo: 'Jungle NO',              icone: 'jungle',     x: 0.35, y: 0.28 },
    { id: 'jg_ne',    grupo: 'Jungle', rotulo: 'Jungle NE',              icone: 'jungle',     x: 0.65, y: 0.28 },
    { id: 'jg_so',    grupo: 'Jungle', rotulo: 'Jungle SO',              icone: 'jungle',     x: 0.35, y: 0.70 },
    { id: 'jg_se',    grupo: 'Jungle', rotulo: 'Jungle SE',              icone: 'jungle',     x: 0.65, y: 0.70 },
  ],
  objetivosGrupos: ['Torres', 'Ganso', 'Árvore', 'Boss', 'Jungle'],

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
  drawWidths: [3, 5, 8],

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
