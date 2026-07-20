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
  mapSize: { w: 1430, h: 1100 },

  assets: {
    // Mapa com os objetivos "queimados" na arte (torres, gansos, árvores, boss).
    mapObjectives: '../assets/vendor-ref/map.png',
    // Mapa limpo, sem marcadores de objetivo.
    mapClean: '../assets/vendor-ref/map-clean.png',

    // Ícones avulsos (para camadas futuras de objetivo / roles).
    icons: {
      tank:       '../assets/vendor-ref/tank.png',
      dps:        '../assets/vendor-ref/dps.png',
      healer:     '../assets/vendor-ref/healer.png',
      tower_blue: '../assets/vendor-ref/tower_blue.png',
      tower_red:  '../assets/vendor-ref/tower_red.png',
      goose_blue: '../assets/vendor-ref/goose_blue.png',
      goose_red:  '../assets/vendor-ref/goose_red.png',
      tree_blue:  '../assets/vendor-ref/tree_blue.png',
      tree_red:   '../assets/vendor-ref/tree_red.png',
      boss:       '../assets/vendor-ref/boss.png',
    },
  },

  /* --- funções (mesmas cores do site Zhi Guides) ------------------------- */
  roleColors: {
    Tank:   '#89abc5', // board (azul)
    DPS:    '#E25B52', // crimson
    Healer: '#4CC9A4', // jade
  },

  /* --- PTs disponíveis na paleta ----------------------------------------
   * A ferramenta é focada em PTs (grupos de ~5), não em players individuais.
   * Cada PT recebe uma cor distinta para leitura no mapa. Ajuste a lista
   * conforme o tamanho da guild (o roster real virá numa etapa futura).
   */
  parties: [
    { id: 'PT1', cor: '#D9A441' }, // dourado
    { id: 'PT2', cor: '#89ABC5' }, // azul board
    { id: 'PT3', cor: '#E25B52' }, // crimson
    { id: 'PT4', cor: '#4CC9A4' }, // jade
    { id: 'PT5', cor: '#A98BE0' }, // violeta
    { id: 'PT6', cor: '#E8974A' }, // laranja
    { id: 'PT7', cor: '#E27B9E' }, // rosa
    { id: 'PT8', cor: '#46B3C9' }, // ciano
  ],

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
