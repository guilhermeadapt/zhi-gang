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
      pts:'PTs', editRoster:'Editar roster', playersTab:'Players', scaled:'escalados', reserves:'reservas', absent:'ausentes', atk:'Ataque', def:'Defesa', drag:'ARRASTE', noMembers:'sem membros', onMap:'No mapa', dragShort:'Arraste', tapShort:'Tocar',
      rosterTitle:'Roster', rosterSub:'Cole a montagem do Board e ajuste PT / reservas', discordMontage:'Montagem do Discord', process:'Processar (substitui)', merge:'Mesclar com atual', mergeHint:'Mantém quem já está montado (PT, tarjas), adiciona os novos como reserva e tira quem não está no novo JSON.', mKept:'mantidos', mAdded:'novos', mRemoved:'removidos', autoMount:'⚙ Auto-montar PTs', clearAll:'Limpar tudo', saveRoster:'Salvar roster',
      tabTable:'Tabela', tabBoard:'Board', bdAuto:'⚙ Preencher', bdEmpty:'🧹 Esvaziar', groupClass:'🗂 Classe', bdLegend:'Arraste cada jogador para a PT, para as <b>reservas da PT</b> ou reservas gerais. Clique num jogador para função, tarja e flags. Alvo: <b>1 Tank · 1 Healer · 3 DPS</b>.', titulars:'Titulares', ptReserves:'Reservas da PT', genReserves:'Reservas gerais', obsPh:'Observações da PT…', roleLbl:'Função', ptLbl:'PT', replaceLbl:'Replace', repOf:'Replace de', swapWith:'Trocar com', swapHint:'Trocar titular ⇄ replace:', repGone:'O alvo do replace saiu do roster — replace limpo', copyBoard:'🔗 Copiar', boardShareTitle:'Link do BOARD (players e PTs, sem cenários) — mande no Discord:', confirmBoard:'Este link traz só o BOARD (players, PTs, reservas). Aplicar por cima do plano atual? Os cenários e o mapa são mantidos.', boardLoaded:'Board do link aplicado ✓', confirmSaveBoard:'Você mexeu no board. O que fazer com as alterações?', allToRes:'Jogar todos os disponíveis para reservas',
      available:'Disponíveis', reservesLbl:'Reservas', dropHere:'solte jogadores aqui', secTag:'Tarja secundária', special:'Especial', tagNone:'nenhuma',
      colPlayer:'Jogador', colRole:'Função', colPT:'PT', colRes:'Res.',
      shareTitle:'Link do plano — copie e mande no Discord:', close:'Fechar', copy:'Copiar', focusClear:'Foco removido', variation:'Variação', hideMeters:'Ocultar metros', showMeters:'Mostrar metros', iconsTitle:'Ícones', iconsHint:'escolha e clique no mapa', plans:'Planos', plansEmpty:'Nenhum plano salvo ainda. Exporte o plano e commite o JSON em /estrategia/plans/.', tool_select:'Selecionar', tool_arrow:'Seta', tool_line:'Linha', tool_free:'Livre', tool_area:'Área', tool_icon:'Ícone', tool_note:'Nota', tool_enemy:'Inimigo', tool_focus:'Foco', tool_color:'Cor', tool_width:'Traço', tool_undo:'Desfazer', tool_redo:'Refazer', tool_clear:'Limpar', tool_names:'Nomes', tool_focusZones:'Zonas', tool_autoSpot:'Auto-foco', tool_collapse:'Recolher', sideBlue:'Azul', sideRed:'Vermelho', hudToggle:'Título no mapa', dockTitle:'Fases & cenários', phName:'Nome da fase', phCond:'condição (opcional)', phDesc:'Nota do estrategista neste cenário. Ex: PT1/PT2 vão de torre; PT3 segura a árvore…', dupBtn:'Duplicar', sceneBtn:'Cenário', seedLbl:'Fases padrão', pastePh:'Cole aqui o JSON do raid-helper OU texto simples:\nPT1 — Fulano (Tank), Ciclano (DPS)\nReservas — Sicrano (DPS)', pasteHint:'Detecta o JSON do raid-helper (Ranged/Melee → DPS; Absence → ausente; Bench → reserva). Depois ajuste na grade e distribua nas PTs.', btnCancel:'Cancelar', btnConfirm:'Confirmar', gridEmpty:'Nenhum jogador ainda. Cole a montagem e clique Processar.', rosterSaved:'Roster salvo ✓', posInherited:'posição(ões) herdada(s)', tabGuide:'Guia', tabNews:'Novidades', tourIntroT:'Primeira vez por aqui?', tourIntroD:'Quer um tour rápido? Eu escureço a tela e mostro, área por área, como o Game Plan funciona — leva 1 minuto. Dá pra sair a qualquer momento (Esc) e refazer depois pelo (?).', tourStart:'🎓 Fazer o tour', tourNo:'Agora não', tourSkip:'Pular', tourNext:'Próximo →', tourDone:'Concluir ✓', tourBtn:'🎓 Tutorial', tourT1:'Cenas & fases', tourD1:'Cada cena é uma \u201cfoto\u201d do mapa. Navegue por aqui (ou pelas setas ‹ › embaixo) pra contar a estratégia fase a fase.', tourT2:'Editor da fase', tourD2:'Nome, ⏱ tempo de jogo, condição e a ✎ nota do estrategista. Duplicar cria a próxima fase já com tudo; Variação agrupa alternativas.', tourT3:'Ferramentas', tourD3:'Setas, linhas, áreas, ícones, notas, inimigos e o Foco (holofote). O Auto-foco ilumina tudo sozinho. Atalhos: V A L D R I N.', tourT4:'PTs & Players', tourD4:'Arraste uma PT ou um player pro mapa. Clicar num player abre o menu dele (vida, morto, galinha, replace ⇄).', tourT5:'Objetivos', tourD5:'Marque o que está UP nesta cena. Azul/Vermelho liga um lado inteiro; no mapa, toque no objetivo pra vida e buffs.', tourT6:'Roster & Board', tourD6:'Cole a inscrição do raid-helper (ou o LINK do evento — sincroniza sozinho 🔄). No Board, monte as PTs arrastando: replaces ⇄, fixos 📌, busca 🔎 e o 💬 copia pro Discord.', tourT7:'Guerras', tourD7:'Vários planos salvos neste navegador: troque, crie, duplique e renomeie sem perder nada.', tourT8:'Ao vivo', tourD8:'Sessão P2P entre comandantes: código oculto (👁 revela), caneta pra quem edita, 🔭 todos acompanham e o host controla permissões no ⚙.', tourT9:'Compartilhar', tourD9:'Gera link do plano por escopo: tudo, só as cenas, só o board ou os objetivos da cena.', tourT10:'Guia & Novidades', tourD10:'O (?) tem o guia completo (Como usar), o changelog em Novidades — e este tour de novo, no 🎓 Tutorial. Boa guerra!',  clLead:'Tudo que mudou, por versão (mais novo primeiro). A versão atual aparece no fim do endereço dos scripts.', clFail:'Não consegui carregar as novidades agora.', linkRemoved:'Vínculo removido', copied:'Copiado ✓', pasted:'Colado ✓', confirmClearDraw:'Limpar desenhos, notas, ícones, inimigos e focos deste cenário? (mantém objetivos e PTs)', needOneScene:'É preciso ter ao menos um cenário', noScenes:'Não encontrei cenários neste plano.', invalidJson:'Arquivo inválido: não é um JSON', noScenesFile:'Não encontrei cenários neste arquivo', confirmImport:'Importar vai substituir o plano atual. Continuar?', confirmReset:'Resetar tudo e começar um plano do zero? Isso apaga o plano atual (PTs, cenários, desenhos, roster).', planReset:'Plano resetado ✓', linkCopied:'Link copiado ✓', selectCopy:'Selecione o link e copie (Ctrl+C)', linkFail:'Não consegui gerar o link', linkInvalid:'Link de plano inválido', confirmShared:'Este link abre um plano compartilhado. Abrir substitui o rascunho atual. Continuar?', planLoadedLink:'Plano do link carregado ✓', planLoadFail:'Não consegui carregar o plano', confirmOpenPlan:'Abrir este plano substitui o rascunho atual. Continuar?', planLoaded:'Plano carregado ✓', confirmSeed:'Adicionar os cenários das fases padrão ao projeto?', confirmClearPlayers:'Limpar todos os jogadores?', posTitle:'Posições (inclui o portão da árvore) — copie tudo e me mande:', rosterNone:'Não reconheci jogadores. Confira o formato.', rosterOk:'jogadores reconhecidos.', rhPh:'Link do evento do raid-helper — busca e mescla sozinho ao abrir o app', rhSyncHint:'Salva o link e busca as inscrições agora (mescla com o board atual)', rhNoLink:'Cole o link (ou ID) do evento do raid-helper', rhFail:'Não consegui buscar o evento no raid-helper', rhSynced:'Roster sincronizado do raid-helper ✓', tipSceneWrap:'Cena atual — escolha direto ou abra as fases', tipSceneSel:'Ir para a cena', tipFases:'Mostrar / ocultar as fases (embaixo)', tipWars:'Guerras — planos salvos neste navegador', tipLive:'Sessão de comando ao vivo (P2P)', tipMore:'Mais opções', tipHelp:'Guia — como usar a ferramenta', tipLang:'Idioma — toque pra trocar', tipDtMin:'Recolher / expandir a barra', tipSelect:'Selecionar / mover (V)', tipSeta:'Seta — movimento / rotação (A)', tipLinha:'Linha (L)', tipLivre:'Traço livre (D)', tipArea:'Área (R)', tipIcone:'Ícone / marcador (I)', tipNota:'Anotação / post-it (N)', tipInimigo:'Inimigo defendendo', tipFoco:'Foco — destaca uma área e escurece o resto (arraste; clique pra limpar)', tipCor:'Cor do traço', tipTraco:'Espessura do traço', tipUndo:'Desfazer (Ctrl+Z)', tipRedo:'Refazer (Ctrl+Y)', tipLimpar:'Limpar desenhos e ícones do cenário', tipNames:'Mostrar / ocultar nomes dos players', tipZonas:'Mostrar / ocultar as zonas de foco', tipAutoFoco:'Escurece o mapa e ilumina só os elementos (PTs, players, objetivos, inimigos, desenhos)', tipApply:'Aplicar', tipExpandir:'Expandir o mapa — preenche a largura e corta em cima/embaixo (arraste na vertical)', tipZoomSave:'Salvar/limpar o zoom desta cena', tipZoomIn:'Aproximar', tipZoomOut:'Afastar', tipZoomReset:'Ajustar / centralizar', tipDockExpand:'Mostrar as fases', tipLado:'Nosso lado — toque pra alternar', tipSideMin:'Recolher / expandir o painel de PTs', tipTempo:'Tempo de jogo deste cenário (ex.: 30m, 25m). Aparece na régua de fases e no mapa.', tipNoteTgl:'Nota do estrategista desta cena (aparece no topo do mapa)', tipDup:'Cria um novo cenário já com PTs, desenhos e objetivos como estão agora', tipVar:'Cria uma variação do cenário atual (mesma base, mudança pequena)', tipAdd:'Cria um cenário em branco', tipSeed:'Semeia os cenários das fases padrão da partida', tipHud:'Mostrar / ocultar o título, condição e descrição em cima do mapa', tipAutoMont:'Distribui os escalados nas PTs equilibrando funções', tipBdShare:'Gera um link só com o board (players, PTs, reservas, replaces) — sem os cenários', posCopied:'Posições copiadas ✓', cmdName:'Comandante', gradeTitle:'Grade dos jogos', gradePng:'🖼 Imagem', gradeHint:'Cada coluna é um jogo. Célula destacada = mudou em relação ao jogo anterior.', gradeOut:'Fora deste jogo', gradeTip:'Grade: todos os jogos lado a lado (e a imagem pro Discord)', gradeCopied:'Imagem copiada ✓ — cole no Discord', gradeSaved:'Imagem baixada ✓', gradeFail:'Não consegui gerar a imagem', player:'Jogador', jogoDup:'Novo jogo copiando a escalação atual (Alt+clique: vazio)', jogoDel:'Remover este jogo', jogoDelAsk:'Remover o jogo', jogoName:'Nome do jogo:', signupAbsTip:'Marcou Absence no raid-helper — escalado mesmo assim', vNewer:'Este plano foi feito numa versão mais nova do Game Plan. Abrir aqui pode descartar partes que esta versão não entende (e sobrescrever o plano). Continuar?', gradeIn:'✓', gradeRes:'res', gradeByPt:'Por PT', gradeByPlayer:'Por jogador', gradeColPt:'PT / Jogador', impTitle:'Este link traz uma guerra inteira', impSub:'Cenários, roster e jogos. O que fazer com a guerra aberta agora?', impNew:'Abrir numa guerra nova — mantém a atual', impReplace:'Substituir a guerra atual', bdAbsZone:'Marcaram ausência', mJogosOn:'Vários jogos nesta guerra…', jogosOnAsk:'Dividir esta guerra em vários jogos (G1, G2, G3…), cada um com sua própria escalação? A escalação atual vira o G1. Nada do que já existe é perdido.', jogosOnOk:'Jogos ativados nesta guerra ✓', jogosJaOn:'Esta guerra já usa vários jogos', gradeBySheet:'Escalação', gradeColSlot:'#', warDefault:'Guerra', copySuffix:'cópia', mExport:'Exportar JSON', mImport:'Importar JSON', mReset:'Resetar…', noteBtn:'Nota', scAll:'Tudo', scScenes:'Só as cenas', scBoard:'Só o board', scObj:'Objetivos da cena', scenesAsk:'Aplicar as CENAS deste link? Seu roster e board atuais são mantidos.', objAsk:'Aplicar os OBJETIVOS deste link na cena atual?', scenesLoaded:'Cenas aplicadas (board mantido) ✓', objLoaded:'Objetivos aplicados na cena ✓', resetTitle:'Resetar o quê?', resetAllBtn:'Tudo — plano do zero', resetBoardBtn:'Só o board (PTs e players do mapa)', resetObjBtn:'Só os objetivos (todas as cenas)', resetBoardAsk:'Tirar todos os players das PTs e limpar os players do mapa em TODAS as cenas?', resetObjAsk:'Desmarcar objetivos, vida e buffs em TODAS as cenas?', boardReset:'Board resetado ✓', objReset:'Objetivos resetados ✓', livePermsT:'Comandantes — ✏️ dar/tirar caneta · 💾 pode salvar cópia · ⛔ remover:', youLbl:'(você)', codeHidden:'•••••• — código oculto (👁 mostra)', tipReveal:'Mostrar / ocultar o código (fica oculto por padrão por causa de streams)', kickAsk:'Remover da sessão:', liveKicked:'O host removeu você da sessão', liveCanSave:'💾 Salvar cópia', liveNoSavePerm:'O host não liberou salvar cópia — sua guerra original voltou', livePermOn:'O host liberou: você pode salvar cópia da guerra 💾', livePermOff:'O host retirou a permissão de salvar cópia', livePenFreeS:'caneta livre', tipPenBar:'Caneta — pegar / largar (quem tem a caneta edita)', tipCfg:'Opções da sessão (host): caneta, permissões, remover', optPenLock:'🔒 Caneta só com o host', optMulti:'✏️✏️ Canetas múltiplas', optMultiWarn:'Com 2+ editando juntos, em conflito vale a última edição', givePen:'Caneta', kickBtn:'Remover da sessão', exportTitle:'Exportar o quê?', copyDisc:'💬 Discord', discResOf:'Reserva', discRotate:'rotaciona com', fixLbl:'Fixar no ⚙ Preencher (fica sempre nesta PT)', fixBtn:'Fixar nesta PT', bdUndone:'↩︎ Board desfeito', bdSearchPh:'🔎 Buscar player…', bdSave:'💾 Salvar', bdSaved:'Board baixado em JSON ✓ (importa pelo ⋯ ou arrastando)', tipBdSave:'Baixa o board (players, PTs, reservas, replaces) como arquivo JSON', saveLbl:'💾 Salvar', discardLbl:'Descartar', discCopied:'Board copiado no formato do Discord ✓ — cole lá no canal', tipBdDisc:'Copia a montagem por PT com menções do Discord (quem veio do raid-helper vira @menção)', importTitle:'Importar o quê deste arquivo?', impHint:'O arquivo tem um plano completo — escolha o que puxar dele (o resto do seu plano fica como está):', sbNotOnMap:'Este player não está no mapa desta cena — arraste-o da lista pro mapa primeiro', wars:'Guerras', warsMine:'Minhas guerras', plansGuild:'Planos da guild', warNew:'+ Nova', warDup:'⧉ Duplicar atual', warName:'Nome da guerra:', warDelAsk:'Excluir esta guerra? O plano dela é apagado deste navegador.', warLoaded:'Guerra carregada ✓', scenesLbl:'fases', live:'Ao vivo', liveTitle:'Sessão de comando (ao vivo)', liveHint:'Comandantes editam o mesmo plano em tempo real, direto entre navegadores (P2P). Um segura a caneta por vez; os outros acompanham e podem pedi-la.', liveHostBtn:'📡 Criar sessão (eu comando)', liveJoinPh:'código de 6 letras', liveJoinBtn:'Entrar', liveShareHint:'Mande o link (ou só o código) pros outros comandantes — 🕶 oculto por padrão pra quem faz stream; o Copiar copia o link real sem mostrar:', liveLeaveBtn:'Sair da sessão', liveNamePh:'Seu nome (aparece pros outros comandantes)', livePenHas:'está com a caneta', liveFollowTitle:'🔭 Seguir: todos acompanham a cena e o zoom de quem está com a caneta', liveFollowOn:'🔭 Seguir o editor: ATIVADO', liveFollowOff:'🔭 Seguir o editor: desligado — navegação livre', liveInName:'entrou na sessão', liveOutName:'saiu da sessão', livePenBtn:'✋ Pegar a caneta', liveDropBtn:'🖐 Largar a caneta', livePenFree:'Caneta livre — pegue pra editar', liveJoinedN:'Comandante entrou na sessão', liveLeftN:'Comandante saiu da sessão', liveConnecting:'⏳ Conectando… pode levar alguns segundos.', liveHosting:'📡 Transmitindo — código', liveGuestLbl:'📡 Na sessão', liveConnN:'comandante(s) junto(s)', liveJoined:'Conectado à sessão ✓', liveHostGone:'O host encerrou a sessão', liveErr:'Erro na conexão ao vivo', livePenYou:'Você está com a caneta', livePenOther:'Outro comandante está com a caneta', livePenGot:'A caneta agora é sua ✏️', liveKeepCopy:'Salvar esta guerra ao vivo como uma cópia sua?', liveCopySaved:'Cópia salva nas suas guerras ✓', liveJoinAsk:'Entrar na sessão de comando deste link? Sua guerra atual fica guardada e intacta.', nameSide:'Nome ao lado', nameBelow:'Nome embaixo', zoomTip:'Scroll = zoom · arraste o mapa para mover', zoomSaved:'Zoom salvo nesta cena ✓', zoomCleared:'Zoom da cena removido', zoomTipM:'Pinça = zoom · arraste = mover · toque = editar',
      menuLink:'🔗 Vincular', menuRemove:'Remover', menuHp:'Vida / HP', dead:'Morto', showNames:'Nomes', noteTitle:'Anotação', notePh:'Escreva a anotação…', buffs:'Buffs', carryTitle:'Carry da árvore (máx 2)', carryAdd:'Carry', carryPick:'Toque num player pra ser o carry', carryMax:'Máximo de 2 carries', carrySet:'Carry definido ✓', enemyTitle:'Inimigo', enemyCount:'Quantidade', enemyLabel:'Nome / nota (opcional)', nameToggle:'Nome no mapa', chicken:'Galinha', editPlayer:'Editar player', unlockAction:'Destravar posição', lockAction:'Travar posição', unlockedHint:'Destravado — arraste para reposicionar', usLbl:'Nós:', westLbl:'Oeste', eastLbl:'Leste', sidePick:'Definir nosso lado', linkPick:'Toque em outro ícone para vincular', linkDone:'Vinculado ✓', linkDup:'Esses dois já estão vinculados', tapPlace:'Toque numa PT (embaixo) e depois no mapa'
    },
    es: {
      menu:'Menú', phases:'Fases', objectives:'Objetivos', roster:'Roster', share:'Compartir', present:'Presentar', exit:'Salir',
      objUp:'Objetivos activos', objInScene:'en esta escena', objAll:'Añadir todos', objFoot:'Marca lo que está "activo" en esta fase. En el mapa, arrastra cada icono para posicionarlo (vale para todas las escenas).', copyPos:'Copiar posiciones',
      dragHint:'Arrastra una PT de la lista al mapa', dragHint2:'Cada escena es una "foto": posiciones, dibujos y objetivos activos. Crea fases y navega abajo.',
      pts:'PTs', editRoster:'Editar roster', playersTab:'Players', scaled:'convocados', reserves:'reservas', absent:'ausentes', atk:'Ataque', def:'Defensa', drag:'ARRASTRA', noMembers:'sin miembros', onMap:'En el mapa', dragShort:'Arrastra', tapShort:'Tocar',
      rosterTitle:'Roster', rosterSub:'Pega la formación del Board y ajusta PT / reservas', discordMontage:'Formación del Discord', process:'Procesar (reemplaza)', merge:'Combinar con actual', mergeHint:'Mantiene a quien ya está armado (PT, etiquetas), agrega a los nuevos como reserva y quita a quien no está en el nuevo JSON.', mKept:'mantenidos', mAdded:'nuevos', mRemoved:'quitados', autoMount:'⚙ Auto-armar PTs', clearAll:'Limpiar todo', saveRoster:'Guardar roster',
      tabTable:'Tabla', tabBoard:'Board', bdAuto:'⚙ Rellenar', bdEmpty:'🧹 Vaciar', groupClass:'🗂 Clase', bdLegend:'Arrastra cada jugador a la PT, a las <b>reservas de la PT</b> o reservas generales. Haz clic en un jugador para función, tarja y flags. Objetivo: <b>1 Tank · 1 Healer · 3 DPS</b>.', titulars:'Titulares', ptReserves:'Reservas de la PT', genReserves:'Reservas generales', obsPh:'Observaciones de la PT…', roleLbl:'Función', ptLbl:'PT', replaceLbl:'Replace', repOf:'Replace de', swapWith:'Cambiar con', swapHint:'Cambiar titular ⇄ replace:', repGone:'El objetivo del replace salió del roster — replace limpiado', copyBoard:'🔗 Copiar', boardShareTitle:'Enlace del BOARD (players y PTs, sin escenas) — mándalo al Discord:', confirmBoard:'Este enlace trae solo el BOARD (players, PTs, reservas). ¿Aplicar sobre el plan actual? Las escenas y el mapa se mantienen.', boardLoaded:'Board del enlace aplicado ✓', confirmSaveBoard:'Cambiaste el board. ¿Qué hacer con los cambios?', allToRes:'Enviar todos los disponibles a reservas',
      available:'Disponibles', reservesLbl:'Reservas', dropHere:'suelta jugadores aquí', secTag:'Tarja secundaria', special:'Especial', tagNone:'ninguna',
      colPlayer:'Jugador', colRole:'Función', colPT:'PT', colRes:'Res.',
      shareTitle:'Enlace del plan — cópialo y mándalo al Discord:', close:'Cerrar', copy:'Copiar', focusClear:'Foco quitado', variation:'Variación', hideMeters:'Ocultar metros', showMeters:'Mostrar metros', iconsTitle:'Íconos', iconsHint:'elige y haz clic en el mapa', plans:'Planes', plansEmpty:'Aún no hay planes guardados. Exporta el plan y commitea el JSON en /estrategia/plans/.', tool_select:'Seleccionar', tool_arrow:'Flecha', tool_line:'Línea', tool_free:'Libre', tool_area:'Área', tool_icon:'Ícono', tool_note:'Nota', tool_enemy:'Enemigo', tool_focus:'Foco', tool_color:'Color', tool_width:'Trazo', tool_undo:'Deshacer', tool_redo:'Rehacer', tool_clear:'Limpiar', tool_names:'Nombres', tool_focusZones:'Zonas', tool_autoSpot:'Auto-foco', tool_collapse:'Plegar', sideBlue:'Azul', sideRed:'Rojo', hudToggle:'Título en el mapa', dockTitle:'Fases y escenas', phName:'Nombre de la fase', phCond:'condición (opcional)', phDesc:'Nota del estratega en esta escena. Ej.: PT1/PT2 van a torre; PT3 sostiene el árbol…', dupBtn:'Duplicar', sceneBtn:'Escena', seedLbl:'Fases estándar', pastePh:'Pega aquí el JSON del raid-helper O texto simple:\nPT1 — Fulano (Tank), Ciclano (DPS)\nReservas — Sicrano (DPS)', pasteHint:'Detecta el JSON del raid-helper (Ranged/Melee → DPS; Absence → ausente; Bench → reserva). Luego ajusta en la tabla y distribuye en las PTs.', btnCancel:'Cancelar', btnConfirm:'Confirmar', gridEmpty:'Aún no hay jugadores. Pega la formación y toca Procesar.', rosterSaved:'Roster guardado ✓', posInherited:'posición(es) heredada(s)', tabGuide:'Guía', tabNews:'Novedades', tourIntroT:'¿Primera vez por aquí?', tourIntroD:'¿Un tour rápido? Oscurezco la pantalla y muestro, área por área, cómo funciona el Game Plan — 1 minuto. Sal cuando quieras (Esc) y repítelo luego en el (?).', tourStart:'🎓 Hacer el tour', tourNo:'Ahora no', tourSkip:'Saltar', tourNext:'Siguiente →', tourDone:'Concluir ✓', tourBtn:'🎓 Tutorial', tourT1:'Escenas y fases', tourD1:'Cada escena es una \u201cfoto\u201d del mapa. Navega por aquí (o con ‹ › abajo) para contar la estrategia fase a fase.', tourT2:'Editor de la fase', tourD2:'Nombre, ⏱ tiempo, condición y la ✎ nota del estratega. Duplicar crea la siguiente fase; Variación agrupa alternativas.', tourT3:'Herramientas', tourD3:'Flechas, líneas, áreas, íconos, notas, enemigos y el Foco. El Auto-foco ilumina todo solo. Atajos: V A L D R I N.', tourT4:'PTs y Players', tourD4:'Arrastra una PT o un player al mapa. Clic en un player abre su menú (vida, muerto, gallina, replace ⇄).', tourT5:'Objetivos', tourD5:'Marca lo que está UP en esta escena. Azul/Rojo enciende un lado entero; en el mapa, toca el objetivo para vida y buffs.', tourT6:'Roster y Board', tourD6:'Pega la inscripción del raid-helper (o el ENLACE del evento — sincroniza solo 🔄). En el Board arma las PTs arrastrando: replaces ⇄, fijos 📌, búsqueda 🔎 y 💬 copia al Discord.', tourT7:'Guerras', tourD7:'Varios planes guardados en este navegador: cambia, crea, duplica y renombra sin perder nada.', tourT8:'En vivo', tourD8:'Sesión P2P entre comandantes: código oculto (👁), lápiz para quien edita, 🔭 todos siguen y el host controla permisos en ⚙.', tourT9:'Compartir', tourD9:'Genera el enlace del plan por alcance: todo, solo escenas, solo board u objetivos de la escena.', tourT10:'Guía y Novedades', tourD10:'El (?) tiene la guía completa, el changelog en Novedades — y este tour otra vez en 🎓 Tutorial. ¡Buena guerra!',  clLead:'Todo lo que cambió, por versión (lo más nuevo primero). Las entradas están en portugués.', clFail:'No pude cargar las novedades ahora.', linkRemoved:'Vínculo quitado', copied:'Copiado ✓', pasted:'Pegado ✓', confirmClearDraw:'¿Borrar dibujos, notas, íconos, enemigos y focos de este escenario? (mantiene objetivos y PTs)', needOneScene:'Debe haber al menos un escenario', noScenes:'No encontré escenarios en este plan.', invalidJson:'Archivo inválido: no es un JSON', noScenesFile:'No encontré escenarios en este archivo', confirmImport:'Importar reemplazará el plan actual. ¿Continuar?', confirmReset:'¿Resetear todo y empezar un plan desde cero? Esto borra el plan actual (PTs, escenarios, dibujos, roster).', planReset:'Plan reseteado ✓', linkCopied:'Enlace copiado ✓', selectCopy:'Selecciona el enlace y cópialo (Ctrl+C)', linkFail:'No pude generar el enlace', linkInvalid:'Enlace de plan inválido', confirmShared:'Este enlace abre un plan compartido. Abrirlo reemplaza el borrador actual. ¿Continuar?', planLoadedLink:'Plan del enlace cargado ✓', planLoadFail:'No pude cargar el plan', confirmOpenPlan:'Abrir este plan reemplaza el borrador actual. ¿Continuar?', planLoaded:'Plan cargado ✓', confirmSeed:'¿Agregar los escenarios de las fases estándar al proyecto?', confirmClearPlayers:'¿Borrar todos los jugadores?', posTitle:'Posiciones (incluye la puerta del árbol) — copia todo y mándamelo:', rosterNone:'No reconocí jugadores. Revisa el formato.', rosterOk:'jugadores reconocidos.', rhPh:'Enlace del evento de raid-helper — busca y combina solo al abrir la app', rhSyncHint:'Guarda el enlace y busca las inscripciones ahora (combina con el board actual)', rhNoLink:'Pega el enlace (o ID) del evento de raid-helper', rhFail:'No pude buscar el evento en raid-helper', rhSynced:'Roster sincronizado del raid-helper ✓', tipSceneWrap:'Escena actual — elige directo o abre las fases', tipSceneSel:'Ir a la escena', tipFases:'Mostrar / ocultar las fases (abajo)', tipWars:'Guerras — planes guardados en este navegador', tipLive:'Sesión de comando en vivo (P2P)', tipMore:'Más opciones', tipHelp:'Guía — cómo usar la herramienta', tipLang:'Idioma — toca para cambiar', tipDtMin:'Plegar / expandir la barra', tipSelect:'Seleccionar / mover (V)', tipSeta:'Flecha — movimiento / rotación (A)', tipLinha:'Línea (L)', tipLivre:'Trazo libre (D)', tipArea:'Área (R)', tipIcone:'Ícono / marcador (I)', tipNota:'Nota / post-it (N)', tipInimigo:'Enemigo defendiendo', tipFoco:'Foco — resalta un área y oscurece el resto (arrastra; clic para limpiar)', tipCor:'Color del trazo', tipTraco:'Grosor del trazo', tipUndo:'Deshacer (Ctrl+Z)', tipRedo:'Rehacer (Ctrl+Y)', tipLimpar:'Limpiar dibujos e íconos de la escena', tipNames:'Mostrar / ocultar nombres de los players', tipZonas:'Mostrar / ocultar las zonas de foco', tipAutoFoco:'Oscurece el mapa e ilumina solo los elementos (PTs, players, objetivos, enemigos, dibujos)', tipApply:'Aplicar', tipExpandir:'Expandir el mapa — llena el ancho y recorta arriba/abajo (arrastra en vertical)', tipZoomSave:'Guardar/limpiar el zoom de esta escena', tipZoomIn:'Acercar', tipZoomOut:'Alejar', tipZoomReset:'Ajustar / centrar', tipDockExpand:'Mostrar las fases', tipLado:'Nuestro lado — toca para alternar', tipSideMin:'Plegar / expandir el panel de PTs', tipTempo:'Tiempo de juego de esta escena (ej.: 30m, 25m). Aparece en la barra de fases y el mapa.', tipNoteTgl:'Nota del estratega de esta escena (aparece arriba del mapa)', tipDup:'Crea una escena nueva con PTs, dibujos y objetivos como están ahora', tipVar:'Crea una variación de la escena actual (misma base, cambio pequeño)', tipAdd:'Crea una escena en blanco', tipSeed:'Siembra las escenas de las fases estándar', tipHud:'Mostrar / ocultar el título, condición y descripción sobre el mapa', tipAutoMont:'Distribuye a los titulares en las PTs equilibrando roles', tipBdShare:'Genera un enlace solo del board (players, PTs, reservas, replaces) — sin escenas', posCopied:'Posiciones copiadas ✓', cmdName:'Comandante', gradeTitle:'Cuadro de partidas', gradePng:'🖼 Imagen', gradeHint:'Cada columna es una partida. Celda resaltada = cambió respecto a la anterior.', gradeOut:'Fuera de esta partida', gradeTip:'Cuadro: todas las partidas lado a lado (y la imagen para Discord)', gradeCopied:'Imagen copiada ✓ — pégala en Discord', gradeSaved:'Imagen descargada ✓', gradeFail:'No pude generar la imagen', player:'Jugador', jogoDup:'Nueva partida copiando la alineación actual (Alt+clic: vacía)', jogoDel:'Quitar esta partida', jogoDelAsk:'¿Quitar la partida', jogoName:'Nombre de la partida:', signupAbsTip:'Marcó Absence en raid-helper — alineado igualmente', vNewer:'Este plan se hizo en una versión más nueva del Game Plan. Abrirlo aquí puede descartar partes que esta versión no entiende (y sobrescribir el plan). ¿Continuar?', gradeIn:'✓', gradeRes:'res', gradeByPt:'Por PT', gradeByPlayer:'Por jugador', gradeColPt:'PT / Jugador', impTitle:'Este enlace trae una guerra entera', impSub:'Escenarios, roster y partidas. ¿Qué hacer con la guerra abierta ahora?', impNew:'Abrir en una guerra nueva — conserva la actual', impReplace:'Reemplazar la guerra actual', bdAbsZone:'Marcaron ausencia', mJogosOn:'Varias partidas en esta guerra…', jogosOnAsk:'¿Dividir esta guerra en varias partidas (G1, G2, G3…), cada una con su alineación? La alineación actual pasa a ser G1. No se pierde nada.', jogosOnOk:'Partidas activadas en esta guerra ✓', jogosJaOn:'Esta guerra ya usa varias partidas', gradeBySheet:'Alineación', gradeColSlot:'#', warDefault:'Guerra', copySuffix:'copia', mExport:'Exportar JSON', mImport:'Importar JSON', mReset:'Resetear…', noteBtn:'Nota', scAll:'Todo', scScenes:'Solo las escenas', scBoard:'Solo el board', scObj:'Objetivos de la escena', scenesAsk:'¿Aplicar las ESCENAS de este enlace? Tu roster y board actuales se mantienen.', objAsk:'¿Aplicar los OBJETIVOS de este enlace en la escena actual?', scenesLoaded:'Escenas aplicadas (board mantenido) ✓', objLoaded:'Objetivos aplicados en la escena ✓', resetTitle:'¿Resetear qué?', resetAllBtn:'Todo — plan desde cero', resetBoardBtn:'Solo el board (PTs y players del mapa)', resetObjBtn:'Solo los objetivos (todas las escenas)', resetBoardAsk:'¿Sacar a todos de las PTs y limpiar los players del mapa en TODAS las escenas?', resetObjAsk:'¿Desmarcar objetivos, vida y buffs en TODAS las escenas?', boardReset:'Board reseteado ✓', objReset:'Objetivos reseteados ✓', livePermsT:'Comandantes — ✏️ dar/quitar lápiz · 💾 puede guardar copia · ⛔ quitar:', youLbl:'(tú)', codeHidden:'•••••• — código oculto (👁 muestra)', tipReveal:'Mostrar / ocultar el código (oculto por defecto por los streams)', kickAsk:'Quitar de la sesión:', liveKicked:'El host te quitó de la sesión', liveCanSave:'💾 Guardar copia', liveNoSavePerm:'El host no permitió guardar copia — tu guerra original volvió', livePermOn:'El host lo permitió: puedes guardar copia de la guerra 💾', livePermOff:'El host retiró el permiso de guardar copia', livePenFreeS:'lápiz libre', tipPenBar:'Lápiz — tomar / soltar (quien lo tiene edita)', tipCfg:'Opciones de la sesión (host): lápiz, permisos, quitar', optPenLock:'🔒 Lápiz solo con el host', optMulti:'✏️✏️ Lápices múltiples', optMultiWarn:'Con 2+ editando juntos, en conflicto vale la última edición', givePen:'Lápiz', kickBtn:'Quitar de la sesión', exportTitle:'¿Exportar qué?', copyDisc:'💬 Discord', discResOf:'Reserva', discRotate:'rota con', fixLbl:'Fijar en ⚙ Rellenar (queda siempre en esta PT)', fixBtn:'Fijar en esta PT', bdUndone:'↩︎ Board deshecho', bdSearchPh:'🔎 Buscar player…', bdSave:'💾 Guardar', bdSaved:'Board descargado en JSON ✓', tipBdSave:'Descarga el board (players, PTs, reservas, replaces) como archivo JSON', saveLbl:'💾 Guardar', discardLbl:'Descartar', discCopied:'Board copiado en formato Discord ✓ — pégalo en el canal', tipBdDisc:'Copia la formación por PT con menciones de Discord (quien vino del raid-helper se vuelve @mención)', importTitle:'¿Qué importar de este archivo?', impHint:'El archivo tiene un plan completo — elige qué tomar de él (el resto de tu plan queda como está):', sbNotOnMap:'Este player no está en el mapa de esta escena — arrástralo de la lista al mapa primero', wars:'Guerras', warsMine:'Mis guerras', plansGuild:'Planes de la guild', warNew:'+ Nueva', warDup:'⧉ Duplicar actual', warName:'Nombre de la guerra:', warDelAsk:'¿Eliminar esta guerra? Su plan se borra de este navegador.', warLoaded:'Guerra cargada ✓', scenesLbl:'fases', live:'En vivo', liveTitle:'Sesión de comando (en vivo)', liveHint:'Los comandantes editan el mismo plan en tiempo real, directo entre navegadores (P2P). Uno sostiene el lápiz a la vez; los demás siguen y pueden pedirlo.', liveHostBtn:'📡 Crear sesión (yo comando)', liveJoinPh:'código de 6 letras', liveJoinBtn:'Entrar', liveShareHint:'Manda el enlace (o solo el código) a los demás comandantes — 🕶 oculto por defecto para quien hace stream; Copiar copia el enlace real sin mostrarlo:', liveLeaveBtn:'Salir de la sesión', liveNamePh:'Tu nombre (visible para los demás comandantes)', livePenHas:'tiene el lápiz', liveFollowTitle:'🔭 Seguir: todos acompañan la escena y el zoom de quien tiene el lápiz', liveFollowOn:'🔭 Seguir al editor: ACTIVADO', liveFollowOff:'🔭 Seguir al editor: apagado — navegación libre', liveInName:'entró a la sesión', liveOutName:'salió de la sesión', livePenBtn:'✋ Tomar el lápiz', liveDropBtn:'🖐 Soltar el lápiz', livePenFree:'Lápiz libre — tómalo para editar', liveJoinedN:'Un comandante entró a la sesión', liveLeftN:'Un comandante salió de la sesión', liveConnecting:'⏳ Conectando… puede tardar unos segundos.', liveHosting:'📡 Transmitiendo — código', liveGuestLbl:'📡 En la sesión', liveConnN:'comandante(s) conectados', liveJoined:'Conectado a la sesión ✓', liveHostGone:'El host cerró la sesión', liveErr:'Error en la conexión en vivo', livePenYou:'Tienes el lápiz', livePenOther:'Otro comandante tiene el lápiz', livePenGot:'El lápiz ahora es tuyo ✏️', liveKeepCopy:'¿Guardar esta guerra en vivo como una copia tuya?', liveCopySaved:'Copia guardada en tus guerras ✓', liveJoinAsk:'¿Entrar a la sesión de comando de este enlace? Tu guerra actual queda guardada e intacta.', nameSide:'Nombre al lado', nameBelow:'Nombre abajo', zoomTip:'Scroll = zoom · arrastra el mapa para mover', zoomSaved:'Zoom guardado en esta escena ✓', zoomCleared:'Zoom de la escena quitado', zoomTipM:'Pellizca = zoom · arrastra = mover · toca = editar',
      menuLink:'🔗 Vincular', menuRemove:'Quitar', menuHp:'Vida / HP', dead:'Muerto', showNames:'Nombres', noteTitle:'Nota', notePh:'Escribe la nota…', buffs:'Buffs', carryTitle:'Carry del árbol (máx 2)', carryAdd:'Carry', carryPick:'Toca un jugador para ser el carry', carryMax:'Máximo 2 carries', carrySet:'Carry definido ✓', enemyTitle:'Enemigo', enemyCount:'Cantidad', enemyLabel:'Nombre / nota (opcional)', nameToggle:'Nombre en el mapa', chicken:'Gallina', editPlayer:'Editar jugador', unlockAction:'Desbloquear posición', lockAction:'Bloquear posición', unlockedHint:'Desbloqueado — arrastra para reposicionar', usLbl:'Nosotros:', westLbl:'Oeste', eastLbl:'Este', sidePick:'Definir nuestro lado', linkPick:'Toca otro ícono para vincular', linkDone:'Vinculado ✓', linkDup:'Esos dos ya están vinculados', tapPlace:'Toca una PT (abajo) y luego el mapa'
    },
    en: {
      menu:'Menu', phases:'Phases', objectives:'Objectives', roster:'Roster', share:'Share', present:'Present', exit:'Exit',
      objUp:'Objectives up', objInScene:'this scene', objAll:'Add all', objFoot:'Mark what is "up" in this phase. On the map, drag each icon to position it (applies to all scenes).', copyPos:'Copy positions',
      dragHint:'Drag a PT from the list onto the map', dragHint2:'Each scene is a "snapshot": positions, drawings and objectives up. Create phases and navigate below.',
      pts:'PTs', editRoster:'Edit roster', playersTab:'Players', scaled:'assigned', reserves:'reserves', absent:'absent', atk:'Attack', def:'Defense', drag:'DRAG', noMembers:'no members', onMap:'On map', dragShort:'Drag', tapShort:'Tap',
      rosterTitle:'Roster', rosterSub:'Paste the Board sign-up and adjust PT / reserves', discordMontage:'Discord sign-up', process:'Process (replace)', merge:'Merge with current', mergeHint:'Keeps who is already set up (PT, tags), adds new players as reserve and drops whoever is not in the new JSON.', mKept:'kept', mAdded:'new', mRemoved:'removed', autoMount:'⚙ Auto-build PTs', clearAll:'Clear all', saveRoster:'Save roster',
      tabTable:'Table', tabBoard:'Board', bdAuto:'⚙ Fill', bdEmpty:'🧹 Empty', groupClass:'🗂 Class', bdLegend:'Drag each player to the PT, to the <b>PT reserves</b> or general reserves. Click a player for role, tag and flags. Target: <b>1 Tank · 1 Healer · 3 DPS</b>.', titulars:'Starters', ptReserves:'PT reserves', genReserves:'General reserves', obsPh:'PT notes…', roleLbl:'Role', ptLbl:'PT', replaceLbl:'Replace', repOf:'Replaces', swapWith:'Swap with', swapHint:'Swap starter ⇄ replace:', repGone:'Replace target left the roster — cleared', copyBoard:'🔗 Copy', boardShareTitle:'BOARD link (players and PTs, no scenes) — share on Discord:', confirmBoard:'This link carries only the BOARD (players, PTs, reserves). Apply over the current plan? Scenes and the map are kept.', boardLoaded:'Board from link applied ✓', confirmSaveBoard:'You changed the board. What should happen to the changes?', allToRes:'Send all available to reserves',
      available:'Available', reservesLbl:'Reserves', dropHere:'drop players here', secTag:'Secondary tag', special:'Special', tagNone:'none',
      colPlayer:'Player', colRole:'Role', colPT:'PT', colRes:'Res.',
      shareTitle:'Plan link — copy and share on Discord:', close:'Close', copy:'Copy', focusClear:'Focus cleared', variation:'Variation', hideMeters:'Hide meters', showMeters:'Show meters', iconsTitle:'Icons', iconsHint:'pick and click on the map', plans:'Plans', plansEmpty:'No saved plans yet. Export the plan and commit the JSON to /estrategia/plans/.', tool_select:'Select', tool_arrow:'Arrow', tool_line:'Line', tool_free:'Free', tool_area:'Area', tool_icon:'Icon', tool_note:'Note', tool_enemy:'Enemy', tool_focus:'Focus', tool_color:'Color', tool_width:'Width', tool_undo:'Undo', tool_redo:'Redo', tool_clear:'Clear', tool_names:'Names', tool_focusZones:'Zones', tool_autoSpot:'Auto-focus', tool_collapse:'Collapse', sideBlue:'Blue', sideRed:'Red', hudToggle:'Title on map', dockTitle:'Phases & scenes', phName:'Phase name', phCond:'condition (optional)', phDesc:'Strategist note for this scene. E.g.: PT1/PT2 go tower; PT3 holds the tree…', dupBtn:'Duplicate', sceneBtn:'Scene', seedLbl:'Standard phases', pastePh:'Paste the raid-helper JSON here OR plain text:\nPT1 — Name (Tank), Name2 (DPS)\nReserves — Name3 (DPS)', pasteHint:'Detects the raid-helper JSON (Ranged/Melee → DPS; Absence → absent; Bench → reserve). Then adjust in the table and distribute into PTs.', btnCancel:'Cancel', btnConfirm:'Confirm', gridEmpty:'No players yet. Paste the sign-up and hit Process.', rosterSaved:'Roster saved ✓', posInherited:'position(s) inherited', tabGuide:'Guide', tabNews:'What\u2019s new', tourIntroT:'First time here?', tourIntroD:'Want a quick tour? I dim the screen and walk you area by area through the Game Plan — takes 1 minute. Leave anytime (Esc) and redo it later from the (?).', tourStart:'🎓 Take the tour', tourNo:'Not now', tourSkip:'Skip', tourNext:'Next →', tourDone:'Finish ✓', tourBtn:'🎓 Tutorial', tourT1:'Scenes & phases', tourD1:'Each scene is a \u201csnapshot\u201d of the map. Navigate here (or with ‹ › below) to tell the strategy phase by phase.', tourT2:'Phase editor', tourD2:'Name, ⏱ game time, condition and the ✎ strategist note. Duplicate seeds the next phase; Variation groups alternatives.', tourT3:'Tools', tourD3:'Arrows, lines, areas, icons, notes, enemies and the Focus spotlight. Auto-focus lights everything up by itself. Shortcuts: V A L D R I N.', tourT4:'PTs & Players', tourD4:'Drag a PT or a player onto the map. Clicking a player opens their menu (HP, dead, chicken, replace ⇄).', tourT5:'Objectives', tourD5:'Tick what is UP in this scene. Blue/Red toggles a whole side; on the map, tap an objective for HP and buffs.', tourT6:'Roster & Board', tourD6:'Paste the raid-helper sign-up (or the event LINK — auto-syncs 🔄). On the Board build the PTs by dragging: replaces ⇄, pins 📌, search 🔎 and 💬 copies to Discord.', tourT7:'Wars', tourD7:'Several plans saved in this browser: switch, create, duplicate and rename without losing anything.', tourT8:'Live', tourD8:'P2P session between commanders: hidden code (👁), pen for the editor, 🔭 everyone follows and the host controls permissions in ⚙.', tourT9:'Share', tourD9:'Plan link by scope: everything, scenes only, board only or scene objectives.', tourT10:'Guide & News', tourD10:'The (?) holds the full guide, the changelog under What\u2019s new — and this tour again via 🎓 Tutorial. Good war!',  clLead:'Everything that changed, by version (newest first). Entries are in Portuguese.', clFail:'Could not load the changelog right now.', linkRemoved:'Link removed', copied:'Copied ✓', pasted:'Pasted ✓', confirmClearDraw:'Clear drawings, notes, icons, enemies and focuses in this scenario? (keeps objectives and PTs)', needOneScene:'At least one scenario is required', noScenes:'No scenarios found in this plan.', invalidJson:'Invalid file: not JSON', noScenesFile:'No scenarios found in this file', confirmImport:'Importing will replace the current plan. Continue?', confirmReset:'Reset everything and start a fresh plan? This erases the current plan (PTs, scenarios, drawings, roster).', planReset:'Plan reset ✓', linkCopied:'Link copied ✓', selectCopy:'Select the link and copy it (Ctrl+C)', linkFail:'Could not generate the link', linkInvalid:'Invalid plan link', confirmShared:'This link opens a shared plan. Opening it replaces the current draft. Continue?', planLoadedLink:'Plan from link loaded ✓', planLoadFail:'Could not load the plan', confirmOpenPlan:'Opening this plan replaces the current draft. Continue?', planLoaded:'Plan loaded ✓', confirmSeed:'Add the standard-phase scenarios to the project?', confirmClearPlayers:'Clear all players?', posTitle:'Positions (includes the tree gate) — copy it all and send to me:', rosterNone:'No players recognized. Check the format.', rosterOk:'players recognized.', rhPh:'raid-helper event link — fetched and merged automatically when the app opens', rhSyncHint:'Saves the link and fetches sign-ups now (merges with the current board)', rhNoLink:'Paste the raid-helper event link (or ID)', rhFail:'Could not fetch the raid-helper event', rhSynced:'Roster synced from raid-helper ✓', tipSceneWrap:'Current scene — pick directly or open the phases', tipSceneSel:'Go to scene', tipFases:'Show / hide the phases (bottom)', tipWars:'Wars — plans saved in this browser', tipLive:'Live command session (P2P)', tipMore:'More options', tipHelp:'Guide — how to use the tool', tipLang:'Language — tap to switch', tipDtMin:'Collapse / expand the bar', tipSelect:'Select / move (V)', tipSeta:'Arrow — movement / rotation (A)', tipLinha:'Line (L)', tipLivre:'Freehand (D)', tipArea:'Area (R)', tipIcone:'Icon / marker (I)', tipNota:'Note / post-it (N)', tipInimigo:'Defending enemy', tipFoco:'Focus — highlights an area and dims the rest (drag; click to clear)', tipCor:'Stroke color', tipTraco:'Stroke width', tipUndo:'Undo (Ctrl+Z)', tipRedo:'Redo (Ctrl+Y)', tipLimpar:'Clear drawings and icons in this scene', tipNames:'Show / hide player names', tipZonas:'Show / hide focus zones', tipAutoFoco:'Dims the map and lights up only the elements (PTs, players, objectives, enemies, drawings)', tipApply:'Apply', tipExpandir:'Expand the map — fills the width cropping top/bottom (drag vertically)', tipZoomSave:'Save/clear this scene\u2019s zoom', tipZoomIn:'Zoom in', tipZoomOut:'Zoom out', tipZoomReset:'Fit / center', tipDockExpand:'Show the phases', tipLado:'Our side — tap to toggle', tipSideMin:'Collapse / expand the PT panel', tipTempo:'Game time of this scene (e.g. 30m, 25m). Shows on the phase rail and the map.', tipNoteTgl:'Strategist note for this scene (shows on top of the map)', tipDup:'Creates a new scene with PTs, drawings and objectives as they are now', tipVar:'Creates a variation of the current scene (same base, small change)', tipAdd:'Creates a blank scene', tipSeed:'Seeds the standard-phase scenes', tipHud:'Show / hide the title, condition and description over the map', tipAutoMont:'Distributes starters into PTs balancing roles', tipBdShare:'Generates a board-only link (players, PTs, reserves, replaces) — no scenes', posCopied:'Positions copied ✓', cmdName:'Commander', gradeTitle:'Games grid', gradePng:'🖼 Image', gradeHint:'Each column is a game. Highlighted cell = changed from the previous game.', gradeOut:'Not in this game', gradeTip:'Grid: every game side by side (and the image for Discord)', gradeCopied:'Image copied ✓ — paste it in Discord', gradeSaved:'Image downloaded ✓', gradeFail:'Could not generate the image', player:'Player', jogoDup:'New game copying the current line-up (Alt+click: empty)', jogoDel:'Remove this game', jogoDelAsk:'Remove the game', jogoName:'Game name:', signupAbsTip:'Marked Absence on raid-helper — rostered anyway', vNewer:'This plan was made in a newer version of Game Plan. Opening it here may discard parts this version does not understand (and overwrite the plan). Continue?', gradeIn:'✓', gradeRes:'res', gradeByPt:'By party', gradeByPlayer:'By player', gradeColPt:'Party / Player', impTitle:'This link carries a whole war', impSub:'Scenes, roster and games. What to do with the war open right now?', impNew:'Open in a new war — keeps the current one', impReplace:'Replace the current war', bdAbsZone:'Marked absence', mJogosOn:'Multiple games in this war…', jogosOnAsk:'Split this war into several games (G1, G2, G3…), each with its own line-up? The current line-up becomes G1. Nothing already there is lost.', jogosOnOk:'Games enabled for this war ✓', jogosJaOn:'This war already uses multiple games', gradeBySheet:'Line-up', gradeColSlot:'#', warDefault:'War', copySuffix:'copy', mExport:'Export JSON', mImport:'Import JSON', mReset:'Reset…', noteBtn:'Note', scAll:'Everything', scScenes:'Scenes only', scBoard:'Board only', scObj:'Scene objectives', scenesAsk:'Apply the SCENES from this link? Your current roster and board are kept.', objAsk:'Apply the OBJECTIVES from this link to the current scene?', scenesLoaded:'Scenes applied (board kept) ✓', objLoaded:'Objectives applied to the scene ✓', resetTitle:'Reset what?', resetAllBtn:'Everything — fresh plan', resetBoardBtn:'Board only (PTs and map players)', resetObjBtn:'Objectives only (all scenes)', resetBoardAsk:'Remove everyone from the PTs and clear map players in ALL scenes?', resetObjAsk:'Untick objectives, HP and buffs in ALL scenes?', boardReset:'Board reset ✓', objReset:'Objectives reset ✓', livePermsT:'Commanders — ✏️ give/take pen · 💾 may save a copy · ⛔ kick:', youLbl:'(you)', codeHidden:'•••••• — code hidden (👁 shows)', tipReveal:'Show / hide the code (hidden by default because of streams)', kickAsk:'Remove from the session:', liveKicked:'The host removed you from the session', liveCanSave:'💾 Save copy', liveNoSavePerm:'The host did not allow saving a copy — your original war is back', livePermOn:'The host allowed it: you can save a copy of the war 💾', livePermOff:'The host revoked the save-copy permission', livePenFreeS:'pen free', tipPenBar:'Pen — take / drop (the holder edits)', tipCfg:'Session options (host): pen, permissions, kick', optPenLock:'🔒 Pen stays with the host', optMulti:'✏️✏️ Multiple pens', optMultiWarn:'With 2+ editing together, on conflict the last edit wins', givePen:'Pen', kickBtn:'Remove from session', exportTitle:'Export what?', copyDisc:'💬 Discord', discResOf:'Reserve', discRotate:'rotates with', fixLbl:'Pin in ⚙ Fill (always lands in this PT)', fixBtn:'Pin to this PT', bdUndone:'↩︎ Board undone', bdSearchPh:'🔎 Search player…', bdSave:'💾 Save', bdSaved:'Board downloaded as JSON ✓', tipBdSave:'Downloads the board (players, PTs, reserves, replaces) as a JSON file', saveLbl:'💾 Save', discardLbl:'Discard', discCopied:'Board copied in Discord format ✓ — paste it in the channel', tipBdDisc:'Copies the setup per PT with Discord mentions (raid-helper players become @mentions)', importTitle:'Import what from this file?', impHint:'The file holds a full plan — pick what to pull from it (the rest of your plan stays as is):', sbNotOnMap:'This player is not on this scene\u2019s map — drag them from the list onto the map first', wars:'Wars', warsMine:'My wars', plansGuild:'Guild plans', warNew:'+ New', warDup:'⧉ Duplicate current', warName:'War name:', warDelAsk:'Delete this war? Its plan is erased from this browser.', warLoaded:'War loaded ✓', scenesLbl:'phases', live:'Live', liveTitle:'Command session (live)', liveHint:'Commanders edit the same plan in real time, browser to browser (P2P). One holds the pen at a time; the others follow and can request it.', liveHostBtn:'📡 Create session (I lead)', liveJoinPh:'6-letter code', liveJoinBtn:'Join', liveShareHint:'Send the link (or just the code) to the other commanders — 🕶 hidden by default for streamers; Copy copies the real link without showing it:', liveLeaveBtn:'Leave session', liveNamePh:'Your name (visible to the other commanders)', livePenHas:'holds the pen', liveFollowTitle:'🔭 Follow: everyone tracks the scene and zoom of the pen holder', liveFollowOn:'🔭 Follow the editor: ON', liveFollowOff:'🔭 Follow the editor: off — free navigation', liveInName:'joined the session', liveOutName:'left the session', livePenBtn:'✋ Take the pen', liveDropBtn:'🖐 Drop the pen', livePenFree:'Pen is free — take it to edit', liveJoinedN:'A commander joined the session', liveLeftN:'A commander left the session', liveConnecting:'⏳ Connecting… this can take a few seconds.', liveHosting:'📡 Broadcasting — code', liveGuestLbl:'📡 In session', liveConnN:'commander(s) connected', liveJoined:'Connected to the session ✓', liveHostGone:'The host ended the session', liveErr:'Live connection error', livePenYou:'You hold the pen', livePenOther:'Another commander holds the pen', livePenGot:'The pen is yours now ✏️', liveKeepCopy:'Save this live war as your own copy?', liveCopySaved:'Copy saved to your wars ✓', liveJoinAsk:'Join the command session from this link? Your current war stays saved and untouched.', nameSide:'Name to the side', nameBelow:'Name below', zoomTip:'Scroll = zoom · drag the map to move', zoomSaved:'Zoom saved in this scene ✓', zoomCleared:'Scene zoom cleared', zoomTipM:'Pinch = zoom · drag = move · tap = edit',
      menuLink:'🔗 Link', menuRemove:'Remove', menuHp:'Health / HP', dead:'Dead', showNames:'Names', noteTitle:'Note', notePh:'Write the note…', buffs:'Buffs', carryTitle:'Tree carry (max 2)', carryAdd:'Carry', carryPick:'Tap a player to be the carry', carryMax:'Max 2 carries', carrySet:'Carry set ✓', enemyTitle:'Enemy', enemyCount:'Count', enemyLabel:'Name / note (optional)', nameToggle:'Name on map', chicken:'Chicken', editPlayer:'Edit player', unlockAction:'Unlock position', lockAction:'Lock position', unlockedHint:'Unlocked — drag to reposition', usLbl:'Us:', westLbl:'West', eastLbl:'East', sidePick:'Set our side', linkPick:'Tap another icon to link', linkDone:'Linked ✓', linkDup:'Those two are already linked', tapPlace:'Tap a PT (below) then the map'
    }
  };
  function t(k) { return (I18N[lang] && I18N[lang][k] != null) ? I18N[lang][k] : (I18N.pt[k] != null ? I18N.pt[k] : k); }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', t(el.getAttribute('data-i18n-title'))); });
    document.documentElement.setAttribute('lang', lang);
  }

  const $ = id => document.getElementById(id);
  const mapPanel = $('mapPanel'), stageWrap = $('stageWrap'), mapHint = $('mapHint'), ptPopover = $('ptPopover'), iconMenu = $('iconMenu');
  const ptList = $('ptList');
  const rail = $('rail'), addScene = $('addScene'), dupScene = $('dupScene'), seedBtn = $('seedBtn');
  const nameInput = $('nameInput'), timeInput = $('timeInput'), condInput = $('condInput'), noteInput = $('noteInput');
  const presentBtn = $('presentBtn'), exitBtn = $('exitBtn'), prevBtn = $('prevBtn'), nextBtn = $('nextBtn');
  const pbTitle = $('pbTitle'), pbTime = $('pbTime'), pbCond = $('pbCond'), pbProg = $('pbProg');
  const pnPhase = $('pnPhase'), pnBadge = $('pnBadge'), pnText = $('pnText');
  const sumEsc = $('sumEsc'), sumRes = $('sumRes'), sumAus = $('sumAus');
  const rosterBtn = $('rosterBtn'), editRosterBtn = $('editRosterBtn'), rosterModal = $('rosterModal'), rosterClose = $('rosterClose');
  const rosterPaste = $('rosterPaste'), parseBtn = $('parseBtn'), mergeBtn = $('mergeBtn'), parseMsg = $('parseMsg'), autoBtn = $('autoBtn');
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

  const PLAN_V = 6;
  // jogos[] / jogoAtual: eixo "partida" dentro da MESMA guerra (G1..G5 de um dia).
  // player.pt continua sendo a verdade viva DO JOGO ATUAL — nada mudou nos ~100 pontos que
  // escrevem nele. jogos[].escalacao é DERIVADA: materializada ao salvar e ao trocar de jogo,
  // nunca editada direto. Plano sem `jogos` se comporta exatamente como antes.
  const state = { scenarios: [], currentId: null, roster: [], ptDesc: {}, ptIcon: {}, objetivoPosGlobal: {}, gates: {}, side: null, rhEvent: '', jogos: [], jogoAtual: null, tool: 'select', drawColor: CFG.drawColors[0], drawWidth: CFG.drawWidths[0], present: false, showNames: true };
  let hintDismissed = false, editingPt = null;
  const objGroupOpen = {};   // grupos do painel de objetivos começam colapsados
  const partyById = new Map(CFG.parties.map(p => [p.id, p]));
  const objById = new Map(CFG.objetivos.map(o => [o.id, o]));
  let popoverPt = null, rosterDraft = [], rosterSideView = 'pts';
  let linkTempFrom = null, linkTempArrow = null;   // vínculo em criação (origem + seta-preview)
  let lastPicked = null, clipboard = null;   // Ctrl+C / Ctrl+V de elementos (nota, ícone, inimigo, foco)
  let carryPickFor = null;                          // objId da árvore aguardando escolha de carry
  let lpTimer = null, lpTimer2 = null, lpAt = 0;    // long-press (segurar) nos tokens de player
  const unlockedObjs = new Set();                   // objetivos destravados p/ mover (sessão)
  const undoStacks = {}, redoStacks = {};

  // ---- PERF: desliga perfectDraw e shadow-para-contorno por padrão (mantém aparência) ----
  // perfectDrawEnabled cria um canvas offscreen por shape; combinado com shadowForStroke,
  // torna o pan/zoom ~780x mais lento quando há muitos tokens. Nada disso muda o visual.
  (function tuneKonva() {
    try {
      const S = Konva.Shape.prototype;
      ['perfectDrawEnabled', 'shadowForStrokeEnabled'].forEach(fn => {
        const orig = S[fn];
        S[fn] = function (v) { if (v === undefined && this.attrs[fn] === undefined) return false; return orig.call(this, v); };
      });
    } catch (e) { /* fallback: sem otimização, mas funciona */ }
  })();

  const stage = new Konva.Stage({ container: 'stage', width: 10, height: 10 });
  const bgLayer = new Konva.Layer({ listening: false });
  const drawLayer = new Konva.Layer({ listening: false });
  const objLayer = new Konva.Layer();
  const markLayer = new Konva.Layer();
  const tokenLayer = new Konva.Layer();
  const noteLayer = new Konva.Layer();
  const focusLayer = new Konva.Layer();   // spotlight de foco (por cima de tudo); só os botões ✕ capturam clique
  // ordem z: fundo < desenhos < tokens (PT/membros/inimigos/vínculos) < OBJETIVOS < carimbos < notas < FOCO
  // objetivos ficam ACIMA de setas e nomes pra não serem tapados.
  // noteLayer fica ACIMA do focusLayer: as notas nunca são escurecidas/cobertas pelo foco
  stage.add(bgLayer, drawLayer, tokenLayer, objLayer, markLayer, focusLayer, noteLayer);
  const bgImage = new Konva.Image({ x: 0, y: 0 });
  bgLayer.add(bgImage);
  let W = 10, H = 10, R = 20;
  let VW = 10, VH = 10;            // viewport do stage (em modo "expandir", menor que W×H)
  let canvasFill = false;          // mapa preenche a largura e corta em cima/embaixo (arrasta pra mover)
  const mapImg = new Image(), iconImgs = {}, iconKeys = Object.keys(CFG.assets.icons);

  // ---- selos de buff desenhados como SVG (emoji não renderiza no canvas) ----
  // Selos de buff — arte oficial do jogo (silhueta branca sobre disco colorido),
  // pré-compostas em /assets/icons/badge_<id>.png. Trocar a arte = trocar o PNG.
  const BUFF_BADGES = ['cityprot', 'ygap', 'hairpull', 'sprint', 'relentless', 'frontline', 'desperate'];
  // re-render agrupado: vários ícones terminam de carregar quase juntos no boot;
  // sem debounce isso dispara 6+ renders completos. Junta tudo num só rAF.
  let _svgRenderQ = 0;
  function svgLoaded() { if (_svgRenderQ) return; _svgRenderQ = 1; requestAnimationFrame(() => { _svgRenderQ = 0; try { renderObjectives(); renderTokens(); } catch (_) {} }); }
  function svgImg(svg) { const im = new Image(); im.onload = svgLoaded; im.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); return im; }
  function pngImg(src) { const im = new Image(); im.onload = svgLoaded; im.src = src; return im; }
  const buffImgs = {};
  BUFF_BADGES.forEach(k => { buffImgs[k] = pngImg('../assets/icons/badge_' + k + '.png'); });
  // ícone de inimigo defendendo: espadas cruzadas
  const enemyImg = svgImg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g stroke="#ffe6e2" stroke-width="3.3" stroke-linecap="round"><path d="M12 28L28 12"/><path d="M28 28L12 12"/></g><g stroke="#ffe6e2" stroke-width="2.6" stroke-linecap="round"><path d="M8.5 24.5l6.5 6.5"/><path d="M31.5 24.5l-6.5 6.5"/></g><circle cx="11" cy="29" r="2.3" fill="#ffe6e2"/><circle cx="29" cy="29" r="2.3" fill="#ffe6e2"/></svg>');
  // ícone de "Galinha" (marca por cena, ex.: quem corre no JG/Boss) — disco laranja + galinha branca
  const chickenImg = svgImg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#e8974a" stroke="#0c0f16" stroke-width="2.4"/><path d="M12 30c-.4-6 3.4-11 8.4-11 4 0 6.6 2.8 6.6 6.4 0 3.4-2.4 5.6-6 5.6h-6c-1.8 0-2.9-.7-3-1z" fill="#fff"/><circle cx="25.6" cy="15.4" r="3.4" fill="#fff"/><path d="M28.7 14.8l3.5.9-3.3 1.5z" fill="#f0c66b"/><path d="M23.8 11.4c.2-1.6 2.2-1.5 2.2.1M26 11.2c.3-1.5 2.2-1.2 2 .3" stroke="#E25B52" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M17.5 31.5v3.2M21.5 31.5v3.2" stroke="#e8974a" stroke-width="1.8" stroke-linecap="round"/></svg>');

  // ---- helpers ----
  function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cur() { return state.scenarios.find(s => s.id === state.currentId) || state.scenarios[0]; }
  function curIndex() { return state.scenarios.findIndex(s => s.id === state.currentId); }
  function newScenario(o) { return Object.assign({ id: uid(), fase: 'Cenário', nome: 'Novo cenário', condicao: null, tempo: '', tokens: [], desenhos: [], marcas: [], objetivos: {}, objetivoPos: {}, destacados: [], links: [], objHp: {}, objBuffs: {}, treeCarry: {}, notas: [], enemies: [], nota: '' }, o || {}); }
  function isPristine(s) { return s && !(s.tokens || []).length && !(s.desenhos || []).length && !(s.marcas || []).length && !(s.nota || '').trim() && !Object.keys(s.objetivos || {}).length && !(s.destacados || []).length && !(s.links || []).length && !Object.keys(s.objHp || {}).length && !(s.notas || []).length && !Object.keys(s.objBuffs || {}).length; }
  function clamp01(n) { n = Number(n); return isNaN(n) ? 0 : Math.max(0, Math.min(1, n)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function roleColor(f) { return CFG.roleColors[f] || CFG.roleColors.DPS; }
  function memTags(m) { return Array.isArray(m.tags) ? m.tags : (m.tag2 ? [m.tag2] : []); }
  function memBadges(m) { let s = ''; memTags(m).forEach(tg => s += '<span class="mb-tag">' + esc(tg) + '</span>'); (m.flags || []).forEach(fid => { const f = (CFG.specialFlags || []).find(x => x.id === fid); if (f) s += '<span class="mb-flag" title="' + esc(f.label) + '">' + f.icon + '</span>'; }); return s; }
  // ---- guia de uso (dinâmico por idioma) ----
  const GUIDE = {
    pt: { title: 'Guia do Game Plan', html: `<p class="guide-lead">Ferramenta pra montar e apresentar a estratégia da GvG em cima do mapa. Tudo salva automaticamente <b>neste navegador</b>. Abaixo, TODAS as funções — com destaque pro que <b>não é óbvio</b>.</p>
<section class="guide-sec"><h3>1 · Fases &amp; Cenários</h3><ul><li>Cada <b>cenário</b> é uma "foto" do mapa (posições, desenhos, objetivos, vida). Monte a sequência de fases e navegue pelo <b>seletor no topo</b> (colado no botão Fases), pela régua embaixo ou pelas setas ‹ ›.</li><li>No editor de fases: <b>nome</b>, <b>⏱ tempo de jogo</b> (ex.: 30m — vira selo na régua e no mapa), <b>condição</b> (vira subtítulo) e <b>descrição</b> — tudo aparece no topo do mapa; o botão <b>Título no mapa</b> oculta.</li><li><b>Duplicar</b> cria a próxima fase já com tudo; <b>Variação</b> agrupa versões alternativas (1 → 1a → 1b).</li></ul></section>
<section class="guide-sec highlight"><h3>2 · Subir o roster <span class="tagimp">pouco óbvio</span></h3><p>Em <b>Roster</b>, cole a inscrição do Discord:</p><ol><li>Abra a <b>mensagem de inscrição do Board</b> no Discord.</li><li>No rodapé, clique em <b>"Web view"</b>.</li><li>Clique em <b>"JSON"</b> no cabeçalho do Board.</li><li><b>Ctrl+A</b> e copie.</li><li>Cole no campo e use <b>Processar</b> (substitui tudo) ou <b>Mesclar</b> (mantém quem já está montado, adiciona novos como reserva, remove quem saiu — e <b>herda as posições no mapa</b>).</li></ol><p>🔄 <b>Sem colar nada:</b> cole o <b>link do evento</b> do raid-helper no campo acima do JSON — o app salva e, toda vez que abrir, busca as inscrições e mescla sozinho.</p></section>
<section class="guide-sec highlight"><h3>3 · Board (montagem das PTs) <span class="tagimp">pouco óbvio</span></h3><ul><li>Com roster salvo, o modal <b>abre direto no Board</b>. Arraste players pras PTs, reservas da PT ou reservas gerais. As colunas rolam separadas.</li><li>Ferramentas na lateral: <b>⚙ Preencher</b> (auto-montar), <b>🧹 Esvaziar</b>, <b>🗂 Classe</b> (agrupa/colapsa por classe), <b>🔗 Copiar</b> (link só do board, sem cenários — quem abre aplica por cima do plano mantendo o mapa).</li><li><b>Replace com alvo:</b> clique num reserva → "⇄ Replace de" lista os titulares da PRÓPRIA PT. O selo aparece nos dois lados (no reserva e, tracejado, no titular).</li><li><b>Troca em 1 clique:</b> no selo ⇄ (aba Players) ou no menu do titular no mapa — o reserva assume a vaga e a POSIÇÃO em todas as cenas; clicar de novo desfaz.</li><li>Fechar com alterações pendentes <b>pergunta se salva</b>.</li></ul></section>
<section class="guide-sec highlight"><h3>4 · Gestos no token do jogador <span class="tagimp">pouco óbvio</span></h3><ul><li><b>1 toque</b> = menu: vida, morto, nome, travar, <b>🐔 Galinha</b> (marca por cena, ex.: JG/Boss), <b>✏️</b> abre o roster do player, <b>⇄ trocar</b> com o replace, vincular, remover.</li><li><b>Segurar ~0,4s</b> = esconde/mostra o nome (vira bolinha com o nº da PT — o toggle global Nomes também faz isso em todos).</li><li><b>Segurar 5s</b> = nome pro lado do ícone. <b>2 toques</b> = remove do mapa.</li></ul></section>
<section class="guide-sec"><h3>5 · Vínculos (setas)</h3><p>Menu do ícone → <b>Vincular</b> → toque no destino (PT, player, objetivo ou <b>inimigo</b>). Fica armado pra encadear vários. Clique na seta pra remover.</p></section>
<section class="guide-sec highlight"><h3>6 · Foco manual <span class="tagimp">pouco óbvio</span></h3><p>Ferramenta <b>Foco</b>: arraste pra destacar uma área (vários focos ok). Na ferramenta Selecionar, encoste na <b>borda</b>: arrastar move, as <b>alças de canto redimensionam</b>, a <b>alça de cima gira</b>, o botão de <b>formato</b> troca retângulo/elipse e o <b>✕</b> exclui. <b>Zonas</b> (👁) oculta tudo; <b>Ctrl+Z</b> desfaz.</p></section>
<section class="guide-sec highlight"><h3>7 · Auto-foco <span class="tagimp">pouco óbvio</span></h3><p>O botão <b>Auto-foco</b> escurece o mapa e ilumina sozinho TODOS os elementos: PTs, players (com nome), objetivos, inimigos (com contador), vínculos, <b>desenhos e ícones</b>. Enquanto ativo, os focos manuais ficam ocultos.</p></section>
<section class="guide-sec"><h3>8 · Objetivos &amp; buffs</h3><ul><li>Painel <b>Objetivos</b>: os botões <b>Azul/Vermelho</b> ligam tudo de um lado (o lado vem da posição no mapa — jungle, boss e outpost contam), e os grupos têm mini-botões <b>O/L</b>.</li><li>Toque num objetivo: mecânica, <b>vida</b>, <b>buffs</b> (Torre: City Protection, You Got a Problem · Ganso: City Protection, Hair Pulling · Árvore: Sprint, Relentless · Boss: Frontline Zeal, Desperate Surge).</li><li>Posições travadas — destrave (🔓) pra arrastar. <b>Árvore:</b> 333m até o portão (⛩ ajustável destravado; a linha só aparece aí); <b>📏</b> oculta os metros; até 2 carries seguem com seta.</li></ul></section>
<section class="guide-sec"><h3>9 · Mapa &amp; visual</h3><ul><li><b>Zoom:</b> scroll/±; <b>📍</b> salva o zoom DAQUELA cena (volta sozinho ao navegar); <b>⛶ Expandir</b> preenche a largura cortando em cima/embaixo (arraste vertical) — também por cena.</li><li><b>Painéis colapsáveis:</b> a barra de ferramentas recolhe pra só ícones e a lateral de PTs recolhe pela alça na borda.</li><li><b>Lado:</b> toggle embaixo (● Azul/Vermelho, cicla ao tocar).</li><li><b>Notas:</b> auto-ajustam ao texto, A−/A＋, botão de <b>cor</b> (usa a cor da barra), sempre ACIMA do foco.</li><li><b>Inimigo:</b> contador, rótulo sempre visível, vincula.</li><li><b>Desenhos são selecionáveis</b> (clique) — <b>Del</b> exclui, <b>Ctrl+C/V</b> copia/cola (também notas, ícones, inimigos e focos). <b>Limpar</b> remove só extras (desenhos/notas/ícones/inimigos/focos) e preserva objetivos e PTs.</li></ul></section>
<section class="guide-sec"><h3>10 · Guerras, salvar e compartilhar</h3><ul><li><b>Guerras</b> (no topo): vários planos salvos neste navegador — troque, crie, duplique, renomeie e exclua. Cada guerra guarda cenas, board e desenhos próprios.</li><li>Salva sozinho no navegador. <b>Exportar/Importar</b> JSON.</li><li><b>Compartilhar</b> tem escopos: tudo, só as cenas (mantém o board de quem abre), só o board ou só os objetivos da cena. <b>?plan=nome</b> abre planos fixos da guild. <b>🔗 Copiar</b> (no Board) = link só da composição.</li></ul></section><section class="guide-sec highlight"><h3>10b · Ao vivo (sessão de comando) <span class="tagimp">pouco óbvio</span></h3><p><b>📡 Ao vivo</b>: comandantes editam o MESMO plano em tempo real, navegador a navegador (P2P, sem servidor). O host cria a sessão e manda o código/link (<b>#c=</b>); quem entra tem a própria guerra congelada e vê tudo ao vivo. Só quem está com a <b>caneta</b> edita — os outros continuam navegando livres (cenas, zoom), pegam a caneta com <b>✋</b> e quem edita pode <b>largá-la</b>. Cada um diz seu <b>nome</b> ao entrar. O host tem o <b>🔭 Seguir</b> (todos acompanham cena, zoom e até o Board aberto do editor) e o painel <b>⚙</b>: travar a caneta (🔒 só ele concede), canetas múltiplas, dar/tirar caneta, permissão de salvar 💾 e remover alguém. Ao sair, <b>salvar como cópia</b> só aparece se o host liberar (💾 em Permissões); senão a sua guerra original volta intacta.</p></section>
<section class="guide-sec"><h3>11 · Atalhos (PC)</h3><p class="guide-keys"><b>V</b> selecionar · <b>A</b> seta · <b>L</b> linha · <b>D</b> livre · <b>R</b> área · <b>I</b> ícone · <b>N</b> nota · <b>scroll</b> zoom · <b>Ctrl+Z/Y</b> desfazer/refazer · <b>Ctrl+C/V</b> copiar/colar · <b>Del</b> excluir.</p></section>
<section class="guide-sec tips"><h3>Dicas</h3><ul><li>Monte a base no cenário 1 e <b>Duplique</b> pra cada fase.</li><li>Salve o <b>zoom por cena</b> (📍) antes de apresentar — a call flui sozinha.</li><li>Use <b>Auto-foco</b> + <b>Apresentar</b> pra guiar a atenção.</li><li>A aba <b>Novidades</b> (acima) mostra tudo que mudou por versão.</li></ul></section>` },
    es: { title: 'Guía del Game Plan', html: `<p class="guide-lead">Herramienta para armar y presentar la estrategia de la GvG sobre el mapa. Todo se guarda automáticamente <b>en este navegador</b>. Abajo, TODAS las funciones — con foco en lo que <b>no es obvio</b>.</p>
<section class="guide-sec"><h3>1 · Fases y Escenarios</h3><ul><li>Cada <b>escenario</b> es una "foto" del mapa. Arma la secuencia de fases y navega con el <b>selector de arriba</b> (junto al botón Fases), la barra de abajo o las flechas ‹ ›.</li><li>En el editor: <b>nombre</b>, <b>⏱ tiempo de juego</b> (sello en la barra y el mapa), <b>condición</b> (subtítulo) y <b>descripción</b> — aparecen sobre el mapa; el botón <b>Título en el mapa</b> los oculta.</li><li><b>Duplicar</b> crea la fase siguiente; <b>Variación</b> agrupa versiones (1 → 1a → 1b).</li></ul></section>
<section class="guide-sec highlight"><h3>2 · Subir el roster <span class="tagimp">poco obvio</span></h3><p>En <b>Roster</b>, pega la inscripción de Discord:</p><ol><li>Abre el <b>mensaje de inscripción del Board</b>.</li><li>En el pie, <b>"Web view"</b>.</li><li><b>"JSON"</b> en el encabezado.</li><li><b>Ctrl+A</b> y copia.</li><li>Pega y usa <b>Procesar</b> (reemplaza) o <b>Combinar</b> (mantiene lo armado, agrega nuevos como reserva, quita a quien salió — y <b>hereda posiciones en el mapa</b>).</li></ol><p>🔄 <b>Sin pegar nada:</b> pega el <b>enlace del evento</b> de raid-helper en el campo sobre el JSON — la app lo guarda y, cada vez que abre, busca las inscripciones y combina sola.</p></section>
<section class="guide-sec highlight"><h3>3 · Board (armado de PTs) <span class="tagimp">poco obvio</span></h3><ul><li>Con roster guardado, el modal <b>abre directo en el Board</b>. Arrastra players a PTs, reservas de PT o generales. Las columnas ruedan por separado.</li><li>Herramientas laterales: <b>⚙ Rellenar</b>, <b>🧹 Vaciar</b>, <b>🗂 Clase</b>, <b>🔗 Copiar</b> (enlace solo del board, sin escenas).</li><li><b>Replace con objetivo:</b> clic en un reserva → "⇄ Replace de" lista los titulares de SU PT. El sello aparece en ambos lados.</li><li><b>Cambio en 1 clic:</b> en el sello ⇄ (pestaña Players) o en el menú del titular en el mapa — el reserva toma el lugar y la POSICIÓN; clic de nuevo lo deshace.</li><li>Cerrar con cambios pendientes <b>pregunta si guardar</b>.</li></ul></section>
<section class="guide-sec highlight"><h3>4 · Gestos en el token <span class="tagimp">poco obvio</span></h3><ul><li><b>1 toque</b> = menú: vida, muerto, nombre, bloquear, <b>🐔 Gallina</b> (por escena), <b>✏️</b> abre el roster, <b>⇄ cambiar</b> con el replace, vincular, quitar.</li><li><b>Mantener ~0,4s</b> = oculta/muestra el nombre (círculo con nº de PT).</li><li><b>Mantener 5s</b> = nombre al lado. <b>2 toques</b> = quitar del mapa.</li></ul></section>
<section class="guide-sec"><h3>5 · Vínculos (flechas)</h3><p>Menú del ícono → <b>Vincular</b> → toca el destino (PT, player, objetivo o <b>enemigo</b>). Queda armado para encadenar. Toca la flecha para quitarla.</p></section>
<section class="guide-sec highlight"><h3>6 · Foco manual <span class="tagimp">poco obvio</span></h3><p>Herramienta <b>Foco</b>: arrastra para destacar un área (varios ok). En Seleccionar, toca el <b>borde</b>: arrastrar mueve, los <b>tiradores de esquina redimensionan</b>, el de arriba <b>rota</b>, el botón de <b>forma</b> alterna rectángulo/elipse y la <b>✕</b> elimina. <b>Zonas</b> (👁) oculta todo; <b>Ctrl+Z</b> deshace.</p></section>
<section class="guide-sec highlight"><h3>7 · Auto-foco <span class="tagimp">poco obvio</span></h3><p><b>Auto-foco</b> oscurece el mapa e ilumina solo TODOS los elementos: PTs, players (con nombre), objetivos, enemigos (con contador), vínculos, <b>dibujos e íconos</b>. Mientras está activo, los focos manuales se ocultan.</p></section>
<section class="guide-sec"><h3>8 · Objetivos y buffs</h3><ul><li>Panel <b>Objetivos</b>: <b>Azul/Rojo</b> encienden todo un lado (el lado viene de la posición — jungle, boss y outpost cuentan), y los grupos tienen mini <b>O/L</b>.</li><li>Toca un objetivo: mecánica, <b>vida</b>, <b>buffs</b> (Torre: City Protection, You Got a Problem · Ganso: City Protection, Hair Pulling · Árbol: Sprint, Relentless · Boss: Frontline Zeal, Desperate Surge).</li><li>Posiciones bloqueadas — 🔓 para arrastrar. <b>Árbol:</b> 333m hasta la puerta (⛩; la línea solo aparece desbloqueado); <b>📏</b> oculta los metros; hasta 2 carries con flecha.</li></ul></section>
<section class="guide-sec"><h3>9 · Mapa y visual</h3><ul><li><b>Zoom:</b> scroll/±; <b>📍</b> guarda el zoom de ESA escena; <b>⛶ Expandir</b> llena el ancho recortando arriba/abajo (arrastre vertical) — también por escena.</li><li><b>Paneles plegables:</b> barra de herramientas a solo íconos y lateral de PTs por la pestaña del borde.</li><li><b>Lado:</b> toggle abajo (● Azul/Rojo, cicla).</li><li><b>Notas:</b> auto-ajuste, A−/A＋, botón de <b>color</b>, siempre SOBRE el foco.</li><li><b>Enemigo:</b> contador, rótulo siempre visible, vincula.</li><li><b>Dibujos seleccionables</b> — <b>Supr</b> elimina, <b>Ctrl+C/V</b> copia/pega (también notas, íconos, enemigos y focos). <b>Limpiar</b> quita solo extras y preserva objetivos y PTs.</li></ul></section>
<section class="guide-sec"><h3>10 · Guerras, guardar y compartir</h3><ul><li><b>Guerras</b> (arriba): varios planes guardados en este navegador — cambia, crea, duplica, renombra y elimina.</li><li>Guarda solo en el navegador. <b>Exportar/Importar</b> JSON.</li><li><b>Compartir</b> tiene alcances: todo, solo escenas (mantiene el board de quien abre), solo board o solo objetivos de la escena. <b>?plan=nombre</b> abre planes fijos. <b>🔗 Copiar</b> (Board) = enlace solo de la composición.</li></ul></section><section class="guide-sec highlight"><h3>10b · En vivo (sesión de comando) <span class="tagimp">poco obvio</span></h3><p><b>📡 En vivo</b>: los comandantes editan el MISMO plan en tiempo real, navegador a navegador (P2P, sin servidor). El host crea la sesión y manda el código/enlace (<b>#c=</b>); quien entra tiene su guerra congelada y ve todo en vivo. Solo quien tiene el <b>lápiz</b> edita — los demás navegan libres (escenas, zoom), lo toman con <b>✋</b> y quien edita puede <b>soltarlo</b>. Cada uno da su <b>nombre</b> al entrar. El host tiene el <b>🔭 Seguir</b> (todos acompañan escena, zoom y hasta el Board abierto del editor) y el panel <b>⚙</b>: bloquear el lápiz (🔒), lápices múltiples, dar/quitar lápiz, permiso de guardar 💾 y quitar a alguien. Al salir, <b>guardar como copia</b> solo aparece si el host lo permite (💾 en Permisos); si no, tu guerra original vuelve intacta.</p></section>
<section class="guide-sec"><h3>11 · Atajos (PC)</h3><p class="guide-keys"><b>V</b> seleccionar · <b>A</b> flecha · <b>L</b> línea · <b>D</b> libre · <b>R</b> área · <b>I</b> ícono · <b>N</b> nota · <b>scroll</b> zoom · <b>Ctrl+Z/Y</b> deshacer/rehacer · <b>Ctrl+C/V</b> copiar/pegar · <b>Supr</b> eliminar.</p></section>
<section class="guide-sec tips"><h3>Consejos</h3><ul><li>Arma la base en la escena 1 y <b>Duplica</b> por fase.</li><li>Guarda el <b>zoom por escena</b> (📍) antes de presentar.</li><li><b>Auto-foco</b> + <b>Presentar</b> guían la atención.</li><li>La pestaña <b>Novedades</b> muestra lo que cambió por versión.</li></ul></section>` },
    en: { title: 'Game Plan Guide', html: `<p class="guide-lead">A tool to build and present the GvG strategy on the map. Everything auto-saves <b>in this browser</b>. Below, ALL the features — highlighting what <b>isn't obvious</b>.</p>
<section class="guide-sec"><h3>1 · Phases &amp; Scenarios</h3><ul><li>Each <b>scenario</b> is a "snapshot" of the map. Build the phase sequence and navigate via the <b>selector on top</b> (next to Phases), the bottom rail or the ‹ › arrows.</li><li>Editor: <b>name</b>, <b>⏱ game time</b> (badge on rail and map), <b>condition</b> (subtitle) and <b>description</b> — shown on top of the map; the <b>Title on map</b> button hides them.</li><li><b>Duplicate</b> seeds the next phase; <b>Variation</b> groups alternates (1 → 1a → 1b).</li></ul></section>
<section class="guide-sec highlight"><h3>2 · Uploading the roster <span class="tagimp">not obvious</span></h3><p>In <b>Roster</b>, paste the Discord sign-up:</p><ol><li>Open the <b>Board sign-up message</b>.</li><li>Footer → <b>"Web view"</b>.</li><li><b>"JSON"</b> in the header.</li><li><b>Ctrl+A</b> and copy.</li><li>Paste and hit <b>Process</b> (replaces) or <b>Merge</b> (keeps who's set up, adds new as reserve, drops who left — and <b>inherits map positions</b>).</li></ol><p>🔄 <b>No pasting needed:</b> paste the raid-helper <b>event link</b> in the field above the JSON — the app saves it and fetches &amp; merges the sign-ups automatically on every open.</p></section>
<section class="guide-sec highlight"><h3>3 · Board (PT setup) <span class="tagimp">not obvious</span></h3><ul><li>With a saved roster the modal <b>opens straight on the Board</b>. Drag players to PTs, PT reserves or general reserves. Columns scroll independently.</li><li>Side tools: <b>⚙ Fill</b>, <b>🧹 Empty</b>, <b>🗂 Class</b>, <b>🔗 Copy</b> (board-only link, no scenes).</li><li><b>Replace with target:</b> click a reserve → "⇄ Replaces" lists starters of THEIR PT. The badge shows on both sides.</li><li><b>1-click swap:</b> via the ⇄ badge (Players tab) or the starter's map menu — the reserve takes the slot and POSITION; click again to revert.</li><li>Closing with pending changes <b>asks to save</b>.</li></ul></section>
<section class="guide-sec highlight"><h3>4 · Token gestures <span class="tagimp">not obvious</span></h3><ul><li><b>1 tap</b> = menu: HP, dead, name, lock, <b>🐔 Chicken</b> (per scene), <b>✏️</b> opens the roster, <b>⇄ swap</b> with the replace, link, remove.</li><li><b>Hold ~0.4s</b> = hide/show name (dot with PT number).</li><li><b>Hold 5s</b> = name to the side. <b>2 taps</b> = remove from map.</li></ul></section>
<section class="guide-sec"><h3>5 · Links (arrows)</h3><p>Icon menu → <b>Link</b> → tap the target (PT, player, objective or <b>enemy</b>). Stays armed to chain several. Tap the arrow to remove.</p></section>
<section class="guide-sec highlight"><h3>6 · Manual focus <span class="tagimp">not obvious</span></h3><p><b>Focus</b> tool: drag to highlight an area (multiple ok). With Select, touch the <b>border</b>: drag moves, <b>corner handles resize</b>, the top handle <b>rotates</b>, the <b>shape</b> button toggles rectangle/ellipse, <b>✕</b> deletes. <b>Zones</b> (👁) hides all; <b>Ctrl+Z</b> undoes.</p></section>
<section class="guide-sec highlight"><h3>7 · Auto-focus <span class="tagimp">not obvious</span></h3><p><b>Auto-focus</b> dims the map and lights up EVERY element automatically: PTs, players (with names), objectives, enemies (with counts), links, <b>drawings and icons</b>. While on, manual focuses are hidden.</p></section>
<section class="guide-sec"><h3>8 · Objectives &amp; buffs</h3><ul><li><b>Objectives</b> panel: <b>Blue/Red</b> toggle a whole side (side comes from map position — jungle, boss and outpost count), plus per-group <b>O/L</b> minis.</li><li>Tap an objective: mechanic, <b>HP</b>, <b>buffs</b> (Tower: City Protection, You Got a Problem · Goose: City Protection, Hair Pulling · Tree: Sprint, Relentless · Boss: Frontline Zeal, Desperate Surge).</li><li>Positions locked — 🔓 to drag. <b>Tree:</b> 333m to the gate (⛩; the path line only shows unlocked); <b>📏</b> hides meters; up to 2 carries with arrow.</li></ul></section>
<section class="guide-sec"><h3>9 · Map &amp; visuals</h3><ul><li><b>Zoom:</b> scroll/±; <b>📍</b> saves THAT scene's zoom; <b>⛶ Expand</b> fills the width cropping top/bottom (vertical drag) — also per scene.</li><li><b>Collapsible panels:</b> toolbar to icons-only and the PT sidebar via the edge handle.</li><li><b>Side:</b> bottom toggle (● Blue/Red, cycles).</li><li><b>Notes:</b> auto-fit, A−/A＋, <b>color</b> button, always ABOVE the focus.</li><li><b>Enemy:</b> count, always-visible label, linkable.</li><li><b>Drawings are selectable</b> — <b>Del</b> deletes, <b>Ctrl+C/V</b> copy/paste (notes, icons, enemies, focuses too). <b>Clear</b> removes extras only, keeping objectives and PTs.</li></ul></section>
<section class="guide-sec"><h3>10 · Wars, save &amp; share</h3><ul><li><b>Wars</b> (top bar): several plans saved in this browser — switch, create, duplicate, rename, delete.</li><li>Auto-saves in the browser. <b>Export/Import</b> JSON.</li><li><b>Share</b> has scopes: everything, scenes only (keeps the opener's board), board only or scene objectives. <b>?plan=name</b> opens fixed plans. <b>🔗 Copy</b> (Board) = composition-only link.</li></ul></section><section class="guide-sec highlight"><h3>10b · Live (command session) <span class="tagimp">not obvious</span></h3><p><b>📡 Live</b>: commanders edit the SAME plan in real time, browser to browser (P2P, serverless). The host creates the session and shares the code/link (<b>#c=</b>); joiners get their own war frozen and watch everything live. Only the <b>pen</b> holder edits — everyone else keeps navigating freely (scenes, zoom), takes the pen with <b>✋</b> and the editor can <b>drop</b> it. Everyone sets a <b>name</b> on join. The host gets <b>🔭 Follow</b> (everyone tracks the editor's scene, zoom and even the open Board) and the <b>⚙</b> panel: lock the pen (🔒), multiple pens, give/take the pen, 💾 save permission and kick. On leave, <b>save as copy</b> only appears if the host allows it (💾 in Permissions); otherwise your original war comes back untouched.</p></section>
<section class="guide-sec"><h3>11 · Shortcuts (PC)</h3><p class="guide-keys"><b>V</b> select · <b>A</b> arrow · <b>L</b> line · <b>D</b> freehand · <b>R</b> area · <b>I</b> icon · <b>N</b> note · <b>scroll</b> zoom · <b>Ctrl+Z/Y</b> undo/redo · <b>Ctrl+C/V</b> copy/paste · <b>Del</b> delete.</p></section>
<section class="guide-sec tips"><h3>Tips</h3><ul><li>Build the base in scene 1 and <b>Duplicate</b> per phase.</li><li>Save the <b>per-scene zoom</b> (📍) before presenting.</li><li><b>Auto-focus</b> + <b>Present</b> guide attention.</li><li>The <b>What's new</b> tab shows every change by version.</li></ul></section>` }
  };
  let guideTab = 'guide', clCache = null;
  function fillGuide() {
    const b = $('helpBody'), tt = $('guideTitle'); const g = GUIDE[lang] || GUIDE.pt;
    if (tt) tt.textContent = guideTab === 'news' ? t('tabNews') : g.title;
    document.querySelectorAll('#guideTabs .gt-tab').forEach(x => x.classList.toggle('active', x.dataset.gt === guideTab));
    if (!b) return;
    if (guideTab === 'news') renderChangelog(b); else b.innerHTML = g.html;
  }
  // aba "Novidades": lê o CHANGELOG.md do próprio repositório e lista por dia
  async function renderChangelog(b) {
    b.innerHTML = '<div class="cl-load">…</div>';
    try {
      if (!clCache) { const r = await fetch('../CHANGELOG.md', { cache: 'no-store' }); if (!r.ok) throw 0; clCache = await r.text(); }
      const rows = [];
      clCache.split('\n').forEach(l => { const m = /^\|\s*(v\d+|—)\s*\|\s*([\d/]+)\s*\|\s*(.+?)\s*\|\s*`/.exec(l); if (m) rows.push({ v: m[1], d: m[2], t: m[3] }); });
      rows.reverse();   // mais novo primeiro
      let h = '<p class="guide-lead">' + t('clLead') + '</p>', day = '';
      rows.forEach(r => { if (r.d !== day) { day = r.d; h += '<div class="cl-day">' + esc(day) + '</div>'; } h += '<div class="cl-item"><span class="cl-v">' + esc(r.v) + '</span><span class="cl-t">' + esc(r.t) + '</span></div>'; });
      b.innerHTML = rows.length ? h : '<div class="cl-load">—</div>';
    } catch (e) { b.innerHTML = '<div class="cl-load">' + esc(t('clFail')) + '</div>'; }
  }
  function centerLabelX(node) { const r = node.getClientRect({ skipTransform: true, skipShadow: true, skipStroke: true }); node.offsetX(r.x + r.width / 2); }
  function hexA(hex, a) { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; const n = parseInt(m[1], 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  // versão bem escura da cor (fundo de post-it colorido, mantendo o texto legível)
  function darkTint(hex, k) { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 'rgba(20,17,7,.97)'; const n = parseInt(m[1], 16), f = k == null ? 0.24 : k; return 'rgba(' + Math.round((n >> 16 & 255) * f) + ',' + Math.round((n >> 8 & 255) * f) + ',' + Math.round((n & 255) * f) + ',.97)'; }

  // ---- boot ----
  let ready = 0; const need = 1 + iconKeys.length;
  function done() { if (++ready === need) init(); }
  mapImg.onload = mapImg.onerror = done; mapImg.src = CFG.assets.map;
  iconKeys.forEach(k => { const im = new Image(); iconImgs[k] = im; im.onload = im.onerror = done; im.src = CFG.assets.icons[k]; });
  const LANG_CYCLE = ['pt', 'es', 'en'];
  const LANG_FLAGS = {
    pt: '<svg viewBox="0 0 20 14" preserveAspectRatio="none"><rect width="20" height="14" fill="#009c3b"/><path d="M10 1.5 18.5 7 10 12.5 1.5 7Z" fill="#ffdf00"/><circle cx="10" cy="7" r="2.8" fill="#002776"/></svg>',
    es: '<svg viewBox="0 0 20 14" preserveAspectRatio="none"><rect width="20" height="14" fill="#aa151b"/><rect y="3.5" width="20" height="7" fill="#f1bf00"/></svg>',
    en: '<svg viewBox="0 0 20 14" preserveAspectRatio="none"><rect width="20" height="14" fill="#012169"/><path d="M0 0 20 14M20 0 0 14" stroke="#fff" stroke-width="2.6"/><path d="M0 0 20 14M20 0 0 14" stroke="#c8102e" stroke-width="1.3"/><path d="M10 0V14M0 7H20" stroke="#fff" stroke-width="3.6"/><path d="M10 0V14M0 7H20" stroke="#c8102e" stroke-width="1.8"/></svg>'
  };
  function updateLangBtn() { const f = $('lbFlag'), c = $('lbCode'); if (f) f.innerHTML = LANG_FLAGS[lang] || LANG_FLAGS.pt; if (c) c.textContent = lang.toUpperCase(); }
  function cycleLang() { const i = LANG_CYCLE.indexOf(lang); setLang(LANG_CYCLE[(i + 1) % LANG_CYCLE.length]); }
  function setLang(l) {
    if (!I18N[l]) l = 'pt';
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    updateLangBtn();
    applyI18n();
    { const hm = $('helpModal'); if (hm && !hm.hidden) fillGuide(); }
    updateLiveUI();
    // re-render dynamic surfaces that hold translated strings
    renderSidebar(); updateSideChip();
    if (rosterModal && !rosterModal.hidden) { renderBoard(); }
  }

  function init() {
    try { const sl = localStorage.getItem(LANG_KEY); if (sl && I18N[sl]) lang = sl; } catch (e) {}
    applyI18n();
    updateLangBtn();
    loadProject(); bgImage.image(mapImg); bgLayer.batchDraw(); buildColorSwatches(); buildMarkPicker();
    dockMini.hidden = false;   // mini-nav sempre visível; painel de Fases começa fechado
    try { if (localStorage.getItem('gp-tools-mini') === '1') drawTools.classList.add('mini'); if (localStorage.getItem('gp-side-min') === '1' && !isMobile()) { document.body.classList.add('side-min'); const sm = $('sideMin'); if (sm) sm.textContent = '«'; } if (localStorage.getItem('gp-hud') === '0') { const sh = $('sceneHud'); if (sh) sh.style.display = 'none'; } } catch (e) {}
    renderSidebar(); renderJogos(); renderRail(); loadScenarioIntoUI(); syncCanvasFill(cur()); fit(); applySceneView(cur()); updateZoomSaveBtn(); wireEvents(); (async () => { await maybeLoadShared(); await maybeLoadScenes(); await maybeLoadObj(); await maybeLoadBoard(); await maybeLoadPlan(); await maybeLoadCommand(); autoSyncRoster(); maybeTour(); })();
    setTimeout(() => { hintDismissed = true; mapHint.classList.add('hide'); }, 5000);   // aviso some em 5s (definitivo)
    setTimeout(() => toast(t(isMobile() ? 'zoomTipM' : 'zoomTip')), 900);
    // canvas não reflui sozinho quando a webfont carrega: re-renderiza os rótulos
    // do mapa quando Oswald/Barlow terminam de baixar (senão ficam na fonte fallback).
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { try { renderObjectives(); renderTokens(); renderMarks(); renderNotes(); } catch (_) {} });
  }

  // ---- layout + zoom ----
  function fit() {
    const availW = mapPanel.clientWidth - 20, availH = mapPanel.clientHeight - 20;
    if (availW <= 0 || availH <= 0) return;
    let w = availW, h = w / AR;
    if (!canvasFill && h > availH) { h = availH; w = h * AR; }   // contain (padrão)
    W = Math.round(w); H = Math.round(h); R = Math.max(8, Math.round(W * 0.0125));
    VW = W; VH = canvasFill ? Math.min(H, Math.round(availH)) : H;
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: canvasFill ? Math.round((VH - H) / 2) : 0 });   // corte centrado
    stage.size({ width: VW, height: VH });
    stageWrap.style.width = VW + 'px'; stageWrap.style.height = VH + 'px';
    bgImage.size({ width: W, height: H }); renderSide();
    hidePopover(); updateStageDrag(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); renderFocus();
  }
  function clampPos(x, y, s) { const minX = Math.min(0, VW - W * s), minY = Math.min(0, VH - H * s); return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) }; }
  function updateStageDrag() { const s = stage.scaleX(); stage.draggable((W * s > VW + 1 || H * s > VH + 1) && state.tool === 'select'); }
  function zoomBy(factor) { const cx = VW / 2, cy = VH / 2, old = stage.scaleX(); let ns = Math.max(1, Math.min(4, old * factor)); const mp = { x: (cx - stage.x()) / old, y: (cy - stage.y()) / old }; stage.scale({ x: ns, y: ns }); stage.position(clampPos(cx - mp.x * ns, cy - mp.y * ns, ns)); stage.batchDraw(); updateStageDrag(); hidePopover(); }
  function zoomReset() { stage.scale({ x: 1, y: 1 }); stage.position(clampPos(0, canvasFill ? (VH - H) / 2 : 0, 1)); stage.batchDraw(); updateStageDrag(); hidePopover(); }
  // "expandir" é POR CENA: cada cenário lembra se o canvas fica liberado nele
  function toggleCanvasFill() { canvasFill = !canvasFill; const s = cur(); if (s) { if (canvasFill) s.fill = true; else delete s.fill; } const b = $('fillTgl'); if (b) b.classList.toggle('on', canvasFill); fit(); applySceneView(cur()); saveProject(); }
  function syncCanvasFill(s) { const want = !!(s && s.fill); const b = $('fillTgl'); if (b) b.classList.toggle('on', want); if (want !== canvasFill) { canvasFill = want; fit(); } }
  // zoom/pan salvo por cenário — guardado em frações (centro do viewport no mapa)
  // pra sobreviver a mudanças de tamanho de janela.
  function applySceneView(s) { if (!s || !s.view) return; const sc = Math.max(1, Math.min(4, s.view.scale || 1)); stage.scale({ x: sc, y: sc }); const x = VW / 2 - (s.view.cxf || 0.5) * W * sc, y = VH / 2 - (s.view.cyf || 0.5) * H * sc; stage.position(clampPos(x, y, sc)); stage.batchDraw(); updateStageDrag(); }
  function toggleSceneView() { const s = cur(); if (!s) return; if (s.view) { delete s.view; toast(t('zoomCleared')); } else { const sc = stage.scaleX() || 1; s.view = { scale: sc, cxf: clamp01((VW / 2 - stage.x()) / sc / W), cyf: clamp01((VH / 2 - stage.y()) / sc / H) }; toast(t('zoomSaved')); } updateZoomSaveBtn(); saveProject(); }
  function updateZoomSaveBtn() { const b = $('zoomSave'); if (b) b.classList.toggle('on', !!(cur() && cur().view)); }
  function frac() { const p = stage.getPointerPosition(); if (!p) return null; const s = stage.scaleX() || 1; return { xf: clamp01((p.x - stage.x()) / s / W), yf: clamp01((p.y - stage.y()) / s / H) }; }

  // ---- undo (cenário inteiro: tokens, desenhos, objetivos, posições, destacados) ----
  function snap() { const s = cur(); return JSON.stringify({ tokens: s.tokens, desenhos: s.desenhos, marcas: s.marcas || [], objetivos: s.objetivos, objetivoPos: s.objetivoPos, destacados: s.destacados, links: s.links || [], objHp: s.objHp || {}, objBuffs: s.objBuffs || {}, treeCarry: s.treeCarry || {}, notas: s.notas || [], enemies: s.enemies || [], focus: Array.isArray(s.focus) ? s.focus : [], nota: s.nota }); }
  function pushUndo() { const id = cur().id; const st = (undoStacks[id] = undoStacks[id] || []); st.push(snap()); if (st.length > 60) st.shift(); redoStacks[id] = []; }
  function applySnap(json) { const s = cur(), d = JSON.parse(json); s.tokens = d.tokens; s.desenhos = d.desenhos; s.marcas = d.marcas || []; s.objetivos = d.objetivos; s.objetivoPos = d.objetivoPos; s.destacados = d.destacados; s.links = d.links || []; s.objHp = d.objHp || {}; s.objBuffs = d.objBuffs || {}; s.treeCarry = d.treeCarry || {}; s.notas = d.notas || []; s.enemies = d.enemies || []; s.focus = Array.isArray(d.focus) ? d.focus : []; s.nota = d.nota; loadScenarioIntoUI(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); renderFocus(); renderNotes(); if (!objPanel.hidden) renderObjPanel(); saveProject(); }
  function doUndo() { const id = cur().id, u = undoStacks[id]; if (!u || !u.length) return; (redoStacks[id] = redoStacks[id] || []).push(snap()); applySnap(u.pop()); }
  function doRedo() { const id = cur().id, r = redoStacks[id]; if (!r || !r.length) return; (undoStacks[id] = undoStacks[id] || []).push(snap()); applySnap(r.pop()); }

  // ---- roster comp / sidebar ----
  function membersOf(pt, reserva) { return state.roster.filter(p => p.pt === pt && !p.ausente && !!p.reserva === reserva); }
  function compCounts(pt) { const c = { Tank: 0, Healer: 0, DPS: 0 }; membersOf(pt, false).forEach(p => { c[p.funcao] = (c[p.funcao] || 0) + 1; }); return c; }
  function renderSidebar() {
    sumAus.textContent = state.roster.filter(p => p.ausente).length;
    sumRes.textContent = state.roster.filter(p => p.reserva && !p.ausente).length;
    sumEsc.textContent = state.roster.filter(p => !p.ausente && !p.reserva && p.pt).length;
    const tabs = $('rosterTabs'); if (tabs) tabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.rtab === rosterSideView));
    ptList.innerHTML = '';
    if (rosterSideView === 'players') { renderPlayerChips(); return; }
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
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
  function renderPlayerChips() {
    const onMap = new Set((cur() ? cur().destacados : []).map(d => d.pt + '|' + d.nome));
    // ordem: quem ainda NÃO está no mapa primeiro; dentro disso, titulares das
    // PTs -> reservas de PT -> reservas gerais -> disponíveis; depois função/nome
    const grpRank = p => (p.pt && !p.reserva) ? 0 : (p.pt && p.reserva) ? 1 : (p.reserva ? 2 : 3);
    const players = state.roster.filter(p => !p.ausente).sort((a, b) => {
      const pa = (a.pt && onMap.has(a.pt + '|' + a.nome)) ? 1 : 0, pb = (b.pt && onMap.has(b.pt + '|' + b.nome)) ? 1 : 0;
      if (pa !== pb) return pa - pb;
      const g = grpRank(a) - grpRank(b); if (g) return g;
      const ro = CFG.roleOrder.indexOf(a.funcao) - CFG.roleOrder.indexOf(b.funcao); if (ro) return ro;
      return a.nome.localeCompare(b.nome);
    });
    if (!players.length) { ptList.innerHTML = '<div class="side-empty">' + t('noMembers') + '</div>'; return; }
    players.forEach(p => {
      const placed = p.pt && onMap.has(p.pt + '|' + p.nome), canDrag = !!p.pt && !state.present;
      const chip = document.createElement('div'); chip.className = 'pl-chip' + (placed ? ' placed' : '') + (canDrag ? '' : ' nodrag'); chip.style.setProperty('--rc', roleColor(p.funcao));
      if (canDrag) chip.setAttribute('draggable', 'true');
      const where = p.pt ? p.pt : (p.reserva ? t('reservesLbl') : '—');
      const repBy2 = !p.replaceOf ? state.roster.find(x => x.replaceOf === p.nome && x.nome !== p.nome) : null;
      const rep = p.replaceOf ? '<span class="pl-rep" data-swap="' + esc(p.nome) + '" title="' + esc(t('swapHint') + ' ' + p.replaceOf) + '">⇄ ' + esc(p.replaceOf) + '</span>'
        : (repBy2 ? '<span class="pl-rep repby" data-swap="' + esc(repBy2.nome) + '" title="' + esc(t('swapHint') + ' ' + repBy2.nome) + '">⇄ ' + esc(repBy2.nome) + '</span>' : '');
      const sabs = p.signupAusente ? '<span class="c-sabs" title="' + esc(t('signupAbsTip') || 'Marcou Absence no raid-helper — escalado mesmo assim') + '">⚠</span>' : '';
      chip.innerHTML = classIcoHTML(p.funcao) + '<span class="pl-nm">' + esc(p.nome) + sabs + rep + '</span><span class="pl-pt">' + esc(where) + '</span><span class="pl-role">' + (placed ? t('onMap') : p.funcao) + '</span>';
      { const rb = chip.querySelector('.pl-rep'); if (rb) rb.addEventListener('click', ev => { ev.stopPropagation(); swapReplace(rb.dataset.swap); }); }
      if (canDrag) chip.addEventListener('dragstart', ev => { if (state.present) { ev.preventDefault(); return; } ev.dataTransfer.setData('text/member', JSON.stringify({ pt: p.pt, nome: p.nome, funcao: p.funcao })); ev.dataTransfer.effectAllowed = 'copy'; });
      chip.addEventListener('click', () => { if (isMobile() && p.pt) { const s = stage.scaleX() || 1; detachMember(p.pt, p.nome, p.funcao, clamp01(((VW / 2) - stage.x()) / s / W), clamp01(((VH / 2) - stage.y()) / s / H)); document.body.classList.remove('mob-roster'); toast(p.nome + ' ✓'); return; } if (state.present) return; const d = (cur() && cur().destacados || []).find(x => x.pt === p.pt && x.nome === p.nome); if (d) openMemberMenu(d, d.xf * W, d.yf * H); else toast(t('sbNotOnMap')); });
      ptList.appendChild(chip);
    });
  }
  function syncPlacedChips() {
    const placed = cur() ? cur().tokens.map(t => t.pt) : [];
    ptList.querySelectorAll('.pt-chip').forEach(chip => { const on = placed.includes(chip.dataset.pt); chip.classList.toggle('placed', on); chip.querySelector('.status').textContent = on ? t('onMap') : t('dragShort'); });
  }

  // ---- tokens de PT + membros destacados + conectores ----
  function makePtToken(t) {
    const p = partyById.get(t.pt);
    const pr = Math.max(7, R * 0.78);   // PTs menores que o raio base
    const g = new Konva.Group({ draggable: !state.present, name: 'pt-' + t.pt });
    g.add(new Konva.Circle({ radius: pr + 2, fill: p.cor, opacity: 0.14 }));
    g.add(new Konva.Circle({ radius: pr, fill: 'rgba(11,14,21,.55)', stroke: p.cor, strokeWidth: Math.max(1.4, pr * 0.1), shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.32, shadowOffsetY: 1 }));
    g.add(new Konva.Text({ text: t.pt, fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: Math.round(pr * 0.72), fill: p.cor, align: 'center', verticalAlign: 'middle', width: pr * 2.4, height: pr * 1.4, offsetX: pr * 1.2, offsetY: pr * 0.7, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.7 }));
    // conta só quem ainda está na formação: membros já destacados no mapa saem da conta
    const placed = new Set((cur().destacados || []).filter(d => d.pt === t.pt).map(d => d.nome));
    const n = membersOf(t.pt, false).filter(m => !placed.has(m.nome)).length;
    if (n) { const b = new Konva.Label({ x: pr * 0.72, y: pr * 0.72 }); b.add(new Konva.Tag({ fill: p.cor, cornerRadius: pr * 0.5 })); b.add(new Konva.Text({ text: String(n), fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: Math.round(pr * 0.55), fill: '#0a0c11', padding: Math.max(1.5, pr * 0.16) })); g.add(b); }
    const pIc = state.ptIcon[t.pt];
    if (pIc && pIc.indexOf('asset:') === 0) { const im = iconImgs[pIc.slice(6)]; if (im && im.width) { const s = pr * 1.1, h = s * (im.height / im.width); g.add(new Konva.Image({ image: im, width: s, height: h, offsetX: s / 2, offsetY: h / 2, y: -pr * 0.95, shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.4 })); } }
    else if (pIc) g.add(new Konva.Text({ text: pIc, fontSize: pr * 0.8, align: 'center', verticalAlign: 'middle', width: pr * 3, height: pr * 1.4, offsetX: pr * 1.5, offsetY: pr * 0.7, y: -pr * 0.82 }));
    g.position({ x: t.xf * W, y: t.yf * H });
    // barra de HP da PT (quando < 100)
    if (t.hp != null && t.hp < 100) hpBar(g, t.hp, pr + 4, pr * 2.1);
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
  function hpBar(g, hp, topY, barW) { const bw = Math.max(barW, R), bh = Math.max(3.5, R * 0.2), by = topY + Math.max(2, R * 0.12); const hc = hp > 60 ? '#4CC9A4' : hp > 30 ? '#f0c66b' : '#E25B52'; g.add(new Konva.Rect({ x: -bw / 2, y: by, width: bw, height: bh, cornerRadius: bh / 2, fill: 'rgba(6,8,12,.92)', stroke: 'rgba(255,255,255,.28)', strokeWidth: 0.8, shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.7, shadowOffsetY: 1 })); g.add(new Konva.Rect({ x: -bw / 2, y: by, width: Math.max(bh, bw * hp / 100), height: bh, cornerRadius: bh / 2, fill: hc, shadowColor: hc, shadowBlur: 4, shadowOpacity: 0.5 })); g.add(new Konva.Text({ text: hp + '%', fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: Math.max(9, R * 0.4), fill: hc, align: 'center', width: bw + R * 2, offsetX: (bw + R * 2) / 2, y: by + bh + 1, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.9 })); }
  function makeMemberToken(d) {
    const p = partyById.get(d.pt), rc = roleColor(d.funcao), rm = Math.max(7, R * 0.48), dead = !!d.dead;
    const g = new Konva.Group({ draggable: !state.present && !d.locked, id: 'mem-' + d.id, opacity: dead ? 0.5 : 1 });
    g.add(new Konva.Circle({ radius: rm, fill: 'rgba(11,14,21,.42)', stroke: dead ? '#7a828f' : rc, strokeWidth: Math.max(1.2, rm * 0.13), shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.4, shadowOffsetY: 1 }));
    const ci = iconImgs[(CFG.classIcons || {})[d.funcao]];
    if (ci && ci.width) { const s = rm * 1.92, h = s * (ci.height / ci.width); g.add(new Konva.Image({ image: ci, width: s, height: h, offsetX: s / 2, offsetY: h / 2, opacity: dead ? 0.7 : 1 })); }
    else g.add(new Konva.Text({ text: d.funcao[0], fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: rm * 1.1, fill: rc, align: 'center', verticalAlign: 'middle', width: rm * 2, height: rm * 2, offsetX: rm, offsetY: rm }));
    if (dead) g.add(new Konva.Text({ text: '✕', fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: rm * 1.7, fill: '#E25B52', align: 'center', verticalAlign: 'middle', width: rm * 2, height: rm * 2, offsetX: rm, offsetY: rm, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.8 }));
    // mini-ícone da classe secundária (tag Tank/Healer/DPS no roster) em cima da bolinha
    if (!dead) {
      const rp = (state.roster || []).find(x => x.pt === d.pt && x.nome === d.nome);
      const sec = rp && (rp.tags || []).find(tg => (CFG.classIcons || {})[tg] && tg !== d.funcao);
      if (sec) {
        const sr = Math.max(4.5, rm * 0.52), sy = -rm - sr * 0.35, sim = iconImgs[CFG.classIcons[sec]];
        g.add(new Konva.Circle({ x: 0, y: sy, radius: sr, fill: 'rgba(11,14,21,.92)', stroke: roleColor(sec), strokeWidth: Math.max(1, sr * 0.18), shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.5 }));
        if (sim && sim.width) { const s2 = sr * 1.7, h2 = s2 * (sim.height / sim.width); g.add(new Konva.Image({ image: sim, width: s2, height: h2, offsetX: s2 / 2, offsetY: h2 / 2, x: 0, y: sy })); }
        else g.add(new Konva.Text({ text: sec[0], fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: sr * 1.2, fill: roleColor(sec), align: 'center', verticalAlign: 'middle', width: sr * 2, height: sr * 2, offsetX: sr, offsetY: sr, x: 0, y: sy })); }
    }
    // é carry de uma árvore que está up?
    const carryTree = carryTreeOf(d.id);
    const carryUp = carryTree ? objById.get(carryTree) : null;
    const carryArr = (carryUp && (cur().objetivos || {})[carryTree]) ? (cur().treeCarry[carryTree] || []) : [];
    const carryIdx = carryArr.indexOf(d.id), isCarry = carryIdx >= 0;
    const hasHp = d.hp != null && d.hp < 100 && !dead;
    const mHpBh = Math.max(2.4, R * 0.15), mHpBy = rm + Math.max(1.5, R * 0.08);   // barrinha de vida compacta
    if (state.showNames && !d.hideName) {
      // chip de nome: sólido, alto contraste, SEMPRE centralizado embaixo (previsível,
      // não colide na horizontal com vizinhos). Borda na cor da função.
      const fs = Math.max(7, R * 0.26);
      const full = d.nome, short = full.length > 7 ? full.slice(0, 6) + '…' : full;
      const side = !!d.nameSide;   // nome ao lado do ícone (segurar 5s) vs embaixo (padrão)
      const ny = hasHp ? (mHpBy + mHpBh + Math.max(2, R * 0.13)) : (rm + rm * 0.32);
      const lbl = side ? new Konva.Label({ x: rm + 4, y: -fs * 0.62 }) : new Konva.Label({ y: ny });
      // leve: respiro escuro translúcido (sem borda) + sombra suave — nada de pill sólido
      lbl.add(new Konva.Tag({ fill: 'rgba(8,10,14,.44)', cornerRadius: 3 }));
      const nmTx = new Konva.Text({ text: short, fontFamily: 'Barlow, sans-serif', fontStyle: '600', fontSize: fs, fill: dead ? '#c9cdd4' : '#F4F2EC', padding: 2.5, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.95 });
      lbl.add(nmTx); g.add(lbl);
      const recenter = () => { if (!side) centerLabelX(lbl); };
      recenter();
      if (full !== short) { // nome longo: mostra completo ao passar o mouse
        g.on('mouseenter.nm', () => { nmTx.text(full); recenter(); tokenLayer.batchDraw(); });
        g.on('mouseleave.nm', () => { nmTx.text(short); recenter(); tokenLayer.batchDraw(); });
      }
    } else {
      // nome não mostrado (toggle global de Nomes desligado OU segurou pra esconder):
      // mostra uma bolinha no canto inferior direito com o nº da PT
      const num = (d.pt || '').replace(/\D/g, '');
      if (num) {
        const br = Math.max(3.2, rm * 0.32), bx = rm * 0.82, by = rm * 0.82;
        g.add(new Konva.Circle({ x: bx, y: by, radius: br, fill: p ? p.cor : '#D9A441', opacity: 0.9, shadowColor: '#000', shadowBlur: 1.2, shadowOpacity: 0.4 }));
        g.add(new Konva.Text({ text: num, fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: Math.max(6.5, br * 1.3), fill: '#10131a', align: 'center', verticalAlign: 'middle', width: br * 2, height: br * 2, offsetX: br, offsetY: br, x: bx, y: by }));
      }
    }
    g.position({ x: d.xf * W, y: d.yf * H });
    // se é carry de uma árvore up, gruda embaixo dela (empilhado, seguindo a árvore)
    let pinned = false;
    if (isCarry) {
      // carries lado a lado, tucados logo abaixo da árvore (nomes embaixo não colidem)
      const tp = objPos(carryUp), os2 = Math.max(13, W * 0.025), treeHalf = os2 * 0.72;
      const off = (carryIdx === 0 ? -1 : 1) * (rm + Math.max(15, R * 1.05));
      g.position({ x: tp.x * W + off, y: tp.y * H + treeHalf + rm });
      g.draggable(false); pinned = true;
      // seta fina ligando o carry à árvore (destino em coords locais do grupo)
      const txl = -off, tyl = -(treeHalf + rm);
      const arr = new Konva.Arrow({ points: [0, -rm * 0.7, txl * 0.82, tyl * 0.72], stroke: 'rgba(240,198,107,.75)', fill: 'rgba(240,198,107,.75)', strokeWidth: Math.max(1.2, R * 0.09), pointerLength: Math.max(4, R * 0.28), pointerWidth: Math.max(4, R * 0.28), dash: [Math.max(3, R * 0.24), Math.max(3, R * 0.22)], lineCap: 'round', listening: false });
      g.add(arr); arr.moveToBottom();
    }
    if (d.locked && !pinned) g.add(new Konva.Circle({ radius: rm + 2.5, stroke: '#8b93a1', strokeWidth: Math.max(1, rm * 0.1), dash: [2, 3], opacity: 0.7, listening: false }));
    // marca de "Galinha" (por cena) — selo no canto superior esquerdo
    if (d.chicken && chickenImg && chickenImg.width) { const cs = Math.max(11, rm * 1.15), cx = -rm * 0.86, cy = -rm * 0.86; g.add(new Konva.Image({ image: chickenImg, width: cs, height: cs, offsetX: cs / 2, offsetY: cs / 2, x: cx, y: cy, shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.5, listening: false })); }
    if (hasHp) { // vida do player: barrinha fina discreta (sem % grande empurrando o nome)
      const hc = d.hp > 60 ? '#4CC9A4' : d.hp > 30 ? '#f0c66b' : '#E25B52', bw = rm * 1.9;
      g.add(new Konva.Rect({ x: -bw / 2, y: mHpBy, width: bw, height: mHpBh, cornerRadius: mHpBh / 2, fill: 'rgba(6,8,12,.6)', shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.45, listening: false }));
      g.add(new Konva.Rect({ x: -bw / 2, y: mHpBy, width: Math.max(mHpBh, bw * d.hp / 100), height: mHpBh, cornerRadius: mHpBh / 2, fill: hc, listening: false }));
    }
    g.on('click tap', e => { e.cancelBubble = true; if (Date.now() - lpAt < 400) return; g.moveToTop(); tokenLayer.batchDraw(); iconClicked('mem:' + d.id, () => openMemberMenu(d, g.x(), g.y())); });
    if (!state.present && !pinned && !d.locked) {
      g.dragBoundFunc(clampToStage);
      // SEGURAR ~0,4s = mostra/oculta o nome; segurar 5s = joga o nome pro lado do ícone
      g.on('mousedown touchstart', () => {
        clearTimeout(lpTimer); clearTimeout(lpTimer2); if (linkTempFrom || carryPickFor) return;
        lpTimer = setTimeout(() => { const dd = cur().destacados.find(x => x.id === d.id); if (dd) { lpAt = Date.now(); pushUndo(); dd.hideName = !dd.hideName; saveProject(); renderTokens(); } }, 420);
        lpTimer2 = setTimeout(() => { const dd = cur().destacados.find(x => x.id === d.id); if (dd) { lpAt = Date.now(); pushUndo(); dd.hideName = false; dd.nameSide = !dd.nameSide; saveProject(); renderTokens(); toast(dd.nameSide ? t('nameSide') : t('nameBelow')); } }, 5000);
      });
      g.on('mouseup touchend mouseleave', () => { clearTimeout(lpTimer); clearTimeout(lpTimer2); });
      g.on('dragstart', () => { clearTimeout(lpTimer); pushUndo(); g.moveToTop(); });
      g.on('dragmove', updateLinks);
      g.on('dragend', () => { const dd = cur().destacados.find(x => x.id === d.id); if (dd) { dd.xf = clamp01(g.x() / W); dd.yf = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => { clearTimeout(lpTimer); pushUndo(); cur().destacados = cur().destacados.filter(x => x.id !== d.id); pruneLinksFor('mem:' + d.id); pruneCarry(d.id); renderTokens(); saveProject(); });
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
    // espadas cruzadas (inimigo defendendo)
    if (enemyImg && enemyImg.width) { const s = er * 1.5; g.add(new Konva.Image({ image: enemyImg, width: s, height: s, offsetX: s / 2, offsetY: s / 2 })); }
    else g.add(new Konva.Text({ text: '⚔', fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: er * 1.1, fill: '#ffd9d5', align: 'center', verticalAlign: 'middle', width: er * 2, height: er * 2, offsetX: er, offsetY: er }));
    // contador (quando informado) — selo no canto inferior direito
    if (e.n > 0) { const b = new Konva.Label({ x: er * 0.62, y: er * 0.62 }); b.add(new Konva.Tag({ fill: '#E25B52', cornerRadius: er * 0.5, stroke: '#2a0c0c', strokeWidth: 1 })); b.add(new Konva.Text({ text: String(e.n), fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: Math.max(9, er * 0.72), fill: '#2a0c0c', padding: Math.max(1.5, er * 0.16) })); g.add(b); }
    g.position({ x: e.x * W, y: e.y * H });
    // rótulo do inimigo: sempre visível no mapa (é uma anotação, não nome de player)
    if (e.label) { const fs = Math.max(8, R * 0.36); const lbl = new Konva.Label({ x: er + 4, y: -fs * 0.72 }); lbl.add(new Konva.Tag({ fill: 'rgba(30,8,8,.86)', cornerRadius: 4 })); lbl.add(new Konva.Text({ text: e.label, fontFamily: 'Barlow, sans-serif', fontStyle: '600', fontSize: fs, fill: '#ffd9d5', padding: 3, shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.6 })); g.add(lbl); }
    g.on('click tap', ev => { ev.cancelBubble = true; if (carryPickFor) return; lastPicked = { kind: 'enemy', id: e.id }; g.moveToTop(); tokenLayer.batchDraw(); iconClicked('enemy:' + e.id, () => openEnemyMenu(e, g.x(), g.y())); });
    if (!state.present) {
      g.dragBoundFunc(clampToStage);
      g.on('dragstart', () => { pushUndo(); g.moveToTop(); });
      g.on('dragend', () => { const ee = (cur().enemies || []).find(x => x.id === e.id); if (ee) { ee.x = clamp01(g.x() / W); ee.y = clamp01(g.y() / H); saveProject(); } });
      g.on('dblclick dbltap', () => { pushUndo(); cur().enemies = (cur().enemies || []).filter(x => x.id !== e.id); pruneLinksFor('enemy:' + e.id); renderTokens(); saveProject(); });
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
    h += '<div class="im-actions"><button class="im-link" data-act="link">' + t('menuLink') + '</button><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.innerHTML = h; iconMenu.hidden = false; placeIconMenu(x, y);
    iconMenu.querySelectorAll('.im-step button').forEach(b => b.addEventListener('click', () => { pushUndo(); e.n = Math.max(0, Math.min(99, (e.n || 0) + (+b.dataset.d))); iconMenu.querySelector('.im-stepv').textContent = e.n; renderTokens(); saveProject(); }));
    iconMenu.querySelector('.im-elabel').addEventListener('input', ev => { e.label = ev.target.value.slice(0, 24); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="link"]').addEventListener('click', () => startLink('enemy:' + e.id));
    iconMenu.querySelector('[data-act="remove"]').addEventListener('click', () => { pushUndo(); cur().enemies = (cur().enemies || []).filter(x => x.id !== e.id); pruneLinksFor('enemy:' + e.id); closeIconMenu(); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="close"]').addEventListener('click', closeIconMenu);
  }
  // ---- nosso lado (Azul/Oeste ou Vermelho/Leste): destaque leve da nossa metade ----
  function renderSide() {
    bgLayer.find('.side-ov').forEach(n => n.destroy());
    if (state.side) {
      const west = state.side === 'blue', col = west ? '106,168,224' : '226,91,82';
      const gw = W * 0.15, bw = Math.max(3, R * 0.22);   // brilho suave só na nossa borda (base)
      if (west) {
        bgLayer.add(new Konva.Rect({ name: 'side-ov', x: 0, y: 0, width: gw, height: H, listening: false, fillLinearGradientStartPoint: { x: 0, y: 0 }, fillLinearGradientEndPoint: { x: gw, y: 0 }, fillLinearGradientColorStops: [0, 'rgba(' + col + ',0.20)', 1, 'rgba(' + col + ',0)'] }));
        bgLayer.add(new Konva.Rect({ name: 'side-ov', x: 0, y: 0, width: bw, height: H, fill: 'rgba(' + col + ',0.5)', listening: false }));
      } else {
        bgLayer.add(new Konva.Rect({ name: 'side-ov', x: W - gw, y: 0, width: gw, height: H, listening: false, fillLinearGradientStartPoint: { x: W - gw, y: 0 }, fillLinearGradientEndPoint: { x: W, y: 0 }, fillLinearGradientColorStops: [0, 'rgba(' + col + ',0)', 1, 'rgba(' + col + ',0.20)'] }));
        bgLayer.add(new Konva.Rect({ name: 'side-ov', x: W - bw, y: 0, width: bw, height: H, fill: 'rgba(' + col + ',0.5)', listening: false }));
      }
    }
    bgLayer.batchDraw();
    updateSideChip();
  }
  function updateSideChip() { const b = $('sideTgl'); if (!b) return; b.classList.toggle('blue', state.side === 'blue'); b.classList.toggle('red', state.side === 'red'); const l = $('sideTglLbl'); if (l) l.textContent = state.side === 'blue' ? t('sideBlue') : (state.side === 'red' ? t('sideRed') : t('usLbl').replace(/:$/, '') + '?'); }
  function setSide(v) { state.side = (state.side === v ? null : v); renderSide(); saveProject(); }
  // toggle do lado: cicla Azul -> Vermelho -> nenhum (dá pra alternar por cena rapidinho)
  function cycleSide() { state.side = state.side === 'blue' ? 'red' : (state.side === 'red' ? null : 'blue'); renderSide(); saveProject(); }
  function clampToStage(pos) { return { x: Math.max(0, Math.min(W, pos.x)), y: Math.max(0, Math.min(H, pos.y)) }; }
  function ptPos(pt) { const t = (cur().tokens || []).find(x => x.pt === pt); return t ? { x: t.xf * W, y: t.yf * H } : null; }
  function renderTokens() {
    tokenLayer.destroyChildren();
    const toks = cur() ? cur().tokens : [];
    renderLinks();                                    // vínculos ficam por baixo dos tokens
    toks.forEach(t => tokenLayer.add(makePtToken(t)));
    (cur() ? cur().destacados : []).forEach(d => tokenLayer.add(makeMemberToken(d)));
    (cur() ? cur().enemies : []).forEach(e => tokenLayer.add(makeEnemyToken(e)));
    if (linkTempFrom) tokenLayer.add(linkTempArrow);  // preview de vínculo por cima
    tokenLayer.batchDraw(); syncPlacedChips();
    mapHint.classList.toggle('hide', hintDismissed || toks.length > 0 || (cur() && cur().desenhos.length) || state.present);
    if (autoSpot) renderFocus();   // o auto-foco acompanha os elementos
  }
  // ---- vínculos genéricos entre ícones (PT / objetivo / membro) ----
  function anchorLivePos(ref) {
    const i = (ref || '').indexOf(':'); if (i < 0) return null; const ty = ref.slice(0, i), id = ref.slice(i + 1);
    if (ty === 'pt') { const n = tokenLayer.findOne('.pt-' + id); if (n) return { x: n.x(), y: n.y() }; return ptPos(id); }
    if (ty === 'mem') { const n = tokenLayer.findOne('#mem-' + id); if (n) return { x: n.x(), y: n.y() }; const d = (cur().destacados || []).find(x => x.id === id); return (d && ptPos(d.pt)) ? { x: d.xf * W, y: d.yf * H } : null; }
    if (ty === 'obj') { const n = objLayer.findOne('.obj-' + id); if (n) return { x: n.x(), y: n.y() }; const o = objById.get(id); if (o && (cur().objetivos || {})[id]) { const p = objPos(o); return { x: p.x * W, y: p.y * H }; } return null; }
    if (ty === 'enemy') { const n = tokenLayer.findOne('#enemy-' + id); if (n) return { x: n.x(), y: n.y() }; const e = (cur().enemies || []).find(x => x.id === id); return e ? { x: e.x * W, y: e.y * H } : null; }
    return null;
  }
  function anchorColor(ref) { const i = (ref || '').indexOf(':'); if (i < 0) return '#D9A441'; const ty = ref.slice(0, i), id = ref.slice(i + 1); if (ty === 'pt') { const p = partyById.get(id); return p ? p.cor : '#D9A441'; } if (ty === 'mem') { const d = (cur().destacados || []).find(x => x.id === id); return d ? roleColor(d.funcao) : '#D9A441'; } if (ty === 'obj') { const o = objById.get(id); return o ? objStyle(o).c : '#D9A441'; } if (ty === 'enemy') return '#E25B52'; return '#D9A441'; }
  // raio aproximado de cada ícone (pra seta parar na borda, não por cima)
  function anchorRadius(ref) { const i = (ref || '').indexOf(':'); const ty = ref.slice(0, i), id = ref.slice(i + 1); const os = Math.max(13, W * 0.025); if (ty === 'pt') return R * 0.78 + 4; if (ty === 'mem') return Math.max(8, R * 0.56) + 3; if (ty === 'obj') { const o = objById.get(id); const sc = o && o.icone && o.icone.indexOf('tower') === 0 ? 0.94 : (o && o.icone === 'boss' ? 1.125 : 1); return os * sc * 0.55; } if (ty === 'enemy') return Math.max(9, R * 0.8) + 3; return R; }
  function linkPts(l) { const a = anchorLivePos(l.a), b = anchorLivePos(l.b); if (!a || !b) return null; const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, ra = anchorRadius(l.a), rb = anchorRadius(l.b); if (len <= ra + rb + 6) return [a.x, a.y, b.x, b.y]; return [a.x + ux * ra, a.y + uy * ra, b.x - ux * rb, b.y - uy * rb]; }
  function isTether(l) { const ta = (l.a || '').split(':')[0], tb = (l.b || '').split(':')[0]; return (ta === 'pt' && tb === 'mem') || (ta === 'mem' && tb === 'pt'); }
  function renderLinks() {
    const dash = [Math.max(7, R * 0.5), Math.max(5, R * 0.34)], w = Math.max(2.8, R * 0.2);
    const tdash = [Math.max(4, R * 0.3), Math.max(4, R * 0.3)], tw = Math.max(1.4, R * 0.1);
    (cur() ? cur().links : []).forEach(l => {
      const pts = linkPts(l); if (!pts) return;
      const col = anchorColor(l.a);
      if (isTether(l)) {
        // amarração PT↔membro: fina e discreta (só indica pertencimento, não é estratégica)
        const arr = new Konva.Arrow({ name: 'link-' + l.id, points: pts, stroke: col, fill: col, strokeWidth: tw, pointerLength: Math.max(4, R * 0.3), pointerWidth: Math.max(4, R * 0.3), opacity: 0.5, dash: tdash, lineCap: 'round', hitStrokeWidth: Math.max(12, R * 0.9), listening: !state.present });
        if (!state.present) { arr.on('click tap', e => { e.cancelBubble = true; if (linkTempFrom) return; removeLink(l.id); }); arr.on('mouseenter', () => stage.container().style.cursor = 'pointer'); arr.on('mouseleave', () => stage.container().style.cursor = toolCursor()); }
        tokenLayer.add(arr); return;
      }
      // sublinha escura (contorno) — faz a seta se destacar em qualquer terreno
      tokenLayer.add(new Konva.Arrow({ name: 'linkbg-' + l.id, points: pts, stroke: '#0a0c11', fill: '#0a0c11', strokeWidth: w + 2.6, pointerLength: Math.max(8, R * 0.56), pointerWidth: Math.max(8, R * 0.56), opacity: 0.8, dash, lineCap: 'round', listening: false }));
      const arr = new Konva.Arrow({ name: 'link-' + l.id, points: pts, stroke: col, fill: col, strokeWidth: w, pointerLength: Math.max(7, R * 0.5), pointerWidth: Math.max(7, R * 0.5), opacity: 1, dash, lineCap: 'round', hitStrokeWidth: Math.max(16, R * 1.1), listening: !state.present });
      if (!state.present) { arr.on('click tap', e => { e.cancelBubble = true; if (linkTempFrom) return; removeLink(l.id); }); arr.on('mouseenter', () => stage.container().style.cursor = 'pointer'); arr.on('mouseleave', () => stage.container().style.cursor = toolCursor()); }
      tokenLayer.add(arr);
    });
  }
  function updateLinks() { (cur() ? cur().links : []).forEach(l => { const pts = linkPts(l); if (!pts) return; const ln = tokenLayer.findOne('.link-' + l.id); if (ln) ln.points(pts); const bg = tokenLayer.findOne('.linkbg-' + l.id); if (bg) bg.points(pts); }); if (linkTempFrom) updateLinkTemp(); tokenLayer.batchDraw(); }
  function updateConnectors() { updateLinks(); }
  function removeLink(id) { pushUndo(); cur().links = (cur().links || []).filter(l => l.id !== id); renderTokens(); saveProject(); toast(t('linkRemoved')); }
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
  // menu de edição arrastável pelo cabeçalho (.im-hd) — delegado no container, sobrevive ao rebuild do conteúdo
  if (iconMenu) {
    let mdrag = null;
    iconMenu.addEventListener('pointerdown', e => {
      const hd = e.target.closest('.im-hd'); if (!hd || e.target.closest('button')) return;
      const r = iconMenu.getBoundingClientRect();
      mdrag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      try { iconMenu.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    iconMenu.addEventListener('pointermove', e => {
      if (!mdrag) return;
      const pr = mapPanel.getBoundingClientRect();
      const nx = Math.max(8, Math.min(e.clientX - pr.left - mdrag.dx, mapPanel.clientWidth - iconMenu.offsetWidth - 8));
      const ny = Math.max(8, Math.min(e.clientY - pr.top - mdrag.dy, mapPanel.clientHeight - iconMenu.offsetHeight - 8));
      iconMenu.style.left = nx + 'px'; iconMenu.style.top = ny + 'px';
    });
    const endMdrag = e => { if (mdrag) { mdrag = null; try { iconMenu.releasePointerCapture(e.pointerId); } catch (_) {} } };
    iconMenu.addEventListener('pointerup', endMdrag);
    iconMenu.addEventListener('pointercancel', endMdrag);
  }
  function openObjMenu(o, x, y) {
    if (!iconMenu || state.present) return;
    hidePopover();
    const st = objStyle(o), hp = (cur().objHp || {})[o.id];
    const cur_hp = hp == null ? 100 : hp;
    let h = '<div class="im-hd"><span class="im-dot" style="background:' + st.c + '"></span><b>' + esc(o.rotulo || o.id) + '</b><button class="im-x" data-act="close">✕</button></div>';
    const info = objInfoFor(o);
    if (info) h += '<div class="im-info">' + esc(info) + '</div>';
    h += '<div class="im-sec">' + t('menuHp') + '</div>';
    h += '<div class="im-hp"><input type="range" class="im-range" min="0" max="100" step="5" value="' + cur_hp + '"><span class="im-hpv">' + cur_hp + '%</span></div>';
    h += '<div class="im-quick">' + [100, 75, 50, 25, 0].map(v => '<button data-hp="' + v + '"' + (cur_hp === v ? ' class="on"' : '') + '>' + v + '</button>').join('') + '</div>';
    const buffs = objBuffsFor(o);
    if (buffs.length) { const act = (cur().objBuffs || {})[o.id] || []; h += '<div class="im-sec">' + t('buffs') + '</div><div class="im-buffs">'; buffs.forEach(bf => { h += '<button class="im-buff' + (act.includes(bf.id) ? ' on' : '') + '" data-buff="' + bf.id + '">' + bf.icon + ' ' + esc(bf.label) + '</button>'; }); h += '</div>'; }
    const isTree = o.icone && o.icone.indexOf('tree') === 0;
    if (isTree) { const carries = (cur().treeCarry || {})[o.id] || []; h += '<div class="im-sec">' + t('carryTitle') + '</div><div class="im-carry">'; carries.forEach(mid => { const d = (cur().destacados || []).find(x => x.id === mid); h += '<span class="im-cchip">' + esc(d ? d.nome : '—') + '<button data-carryrm="' + mid + '">✕</button></span>'; }); if (carries.length < 2) h += '<button class="im-cadd" data-act="carryadd">+ ' + t('carryAdd') + '</button>'; h += '</div>'; const mh = !!((cur().hideMeters || {})[o.id]); h += '<button class="im-namebtn' + (mh ? ' on' : '') + '" data-act="meters">📏 ' + t(mh ? 'showMeters' : 'hideMeters') + '</button>'; }
    const unlk = unlockedObjs.has(o.id);
    h += '<button class="im-lockbtn' + (unlk ? ' on' : '') + '" data-act="lock">' + (unlk ? '🔓 ' + t('lockAction') : '🔒 ' + t('unlockAction')) + '</button>';
    h += '<div class="im-actions"><button class="im-link" data-act="link">' + t('menuLink') + '</button><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.innerHTML = h; iconMenu.hidden = false; placeIconMenu(x, y);
    iconMenu.querySelector('[data-act="lock"]').addEventListener('click', () => { if (unlockedObjs.has(o.id)) { unlockedObjs.delete(o.id); renderObjectives(); openObjMenu(o, x, y); } else { unlockedObjs.add(o.id); closeIconMenu(); renderObjectives(); toast(t('unlockedHint')); } });
    if (isTree) { const ca = iconMenu.querySelector('[data-act="carryadd"]'); if (ca) ca.addEventListener('click', () => { carryPickFor = o.id; closeIconMenu(); document.body.classList.add('linking'); toast(t('carryPick')); }); iconMenu.querySelectorAll('[data-carryrm]').forEach(bt => bt.addEventListener('click', () => { removeTreeCarry(o.id, bt.dataset.carryrm); openObjMenu(o, x, y); })); const mb = iconMenu.querySelector('[data-act="meters"]'); if (mb) mb.addEventListener('click', () => { pushUndo(); cur().hideMeters = cur().hideMeters || {}; if (cur().hideMeters[o.id]) delete cur().hideMeters[o.id]; else cur().hideMeters[o.id] = true; renderObjectives(); saveProject(); openObjMenu(o, x, y); }); }
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
    let h = '<div class="im-hd"><span class="im-dot" style="background:' + roleColor(d.funcao) + '"></span><b>' + esc(d.nome) + '</b><button class="im-edit" data-act="edit" title="' + esc(t('editPlayer')) + '">✏️</button><button class="im-x" data-act="close">✕</button></div>';
    h += '<button class="im-dead' + (d.dead ? ' on' : '') + '" data-act="dead">💀 ' + t('dead') + '</button>';
    h += '<div class="im-sec">' + t('menuHp') + '</div>';
    h += '<div class="im-hp"><input type="range" class="im-range" min="0" max="100" step="5" value="' + chp + '"' + (d.dead ? ' disabled' : '') + '><span class="im-hpv">' + chp + '%</span></div>';
    h += '<div class="im-quick">' + [100, 75, 50, 25, 0].map(v => '<button data-hp="' + v + '"' + (chp === v ? ' class="on"' : '') + '>' + v + '</button>').join('') + '</div>';
    h += '<button class="im-namebtn' + (d.hideName ? '' : ' on') + '" data-act="name">' + (d.hideName ? '🚫 ' : '👁 ') + t('nameToggle') + '</button>';
    h += '<button class="im-namebtn' + (d.locked ? ' on' : '') + '" data-act="lock">' + (d.locked ? '🔒 ' : '🔓 ') + t(d.locked ? 'unlockAction' : 'lockAction') + '</button>';
    h += '<button class="im-namebtn' + (d.chicken ? ' on' : '') + '" data-act="chicken">🐔 ' + t('chicken') + '</button>';
    // se alguém é replace deste titular, oferece a troca direto daqui
    const repRes = state.roster.find(x => x.replaceOf === d.nome && x.nome !== d.nome);
    if (repRes) h += '<button class="im-namebtn im-swap" data-act="swap">⇄ ' + t('swapWith') + ' ' + esc(repRes.nome) + '</button>';
    const meRes = !repRes ? state.roster.find(x => x.nome === d.nome && x.replaceOf) : null;
    if (meRes) h += '<button class="im-namebtn im-swap" data-act="swapme">⇄ ' + t('swapWith') + ' ' + esc(meRes.replaceOf) + '</button>';
    h += '<div class="im-actions"><button class="im-link" data-act="link">' + t('menuLink') + '</button><button class="im-del" data-act="remove">' + t('menuRemove') + '</button></div>';
    iconMenu.innerHTML = h; iconMenu.hidden = false; placeIconMenu(x, y);
    iconMenu.querySelector('[data-act="name"]').addEventListener('click', () => { pushUndo(); d.hideName = !d.hideName; closeIconMenu(); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="lock"]').addEventListener('click', () => { pushUndo(); d.locked = !d.locked; closeIconMenu(); renderTokens(); saveProject(); });
    iconMenu.querySelector('[data-act="chicken"]').addEventListener('click', () => { pushUndo(); if (d.chicken) delete d.chicken; else d.chicken = true; closeIconMenu(); renderTokens(); saveProject(); });
    { const sw = iconMenu.querySelector('[data-act="swap"]'); if (sw && repRes) sw.addEventListener('click', () => { closeIconMenu(); swapReplace(repRes.nome); }); }
    { const sm = iconMenu.querySelector('[data-act="swapme"]'); if (sm && meRes) sm.addEventListener('click', () => { closeIconMenu(); swapReplace(meRes.nome); }); }
    { const eb = iconMenu.querySelector('[data-act="edit"]'); if (eb) eb.addEventListener('click', () => { closeIconMenu(); openRoster(); }); }
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
  function placeTokenCenter(pt) { const s = stage.scaleX() || 1; const xf = clamp01(((VW / 2) - stage.x()) / s / W), yf = clamp01(((VH / 2) - stage.y()) / s / H); placeToken(pt, xf, yf); }
  function removeToken(pt) { pushUndo(); const s = cur(); const memObjs = s.destacados.filter(d => d.pt === pt); const memIds = memObjs.map(d => 'mem:' + d.id); memObjs.forEach(d => pruneCarry(d.id)); s.tokens = s.tokens.filter(t => t.pt !== pt); s.destacados = s.destacados.filter(d => d.pt !== pt); const drop = new Set(['pt:' + pt].concat(memIds)); if (s.links) s.links = s.links.filter(l => !drop.has(l.a) && !drop.has(l.b)); hidePopover(); renderTokens(); saveProject(); }
  // Ao trocar o roster (substituir o Board), quem saiu da PT deixa "órfão" o
  // token que estava no mapa. Aqui cada posição órfã é herdada por um membro
  // NOVO da mesma PT que ainda não está no mapa — mantendo a posição.
  function reconcileMemberSlots() {
    const byPt = {}; state.roster.forEach(p => { if (p.pt && !p.ausente) (byPt[p.pt] = byPt[p.pt] || []).push(p); });
    let moved = 0;
    (state.scenarios || []).forEach(s => {
      const dl = s.destacados || [];
      const placed = new Set(dl.map(d => d.pt + '|' + d.nome));   // quem já ocupa posição nesta cena
      dl.forEach(d => {
        const stillHere = state.roster.some(p => p.pt === d.pt && p.nome === d.nome);
        if (stillHere) return;                                      // o membro do token ainda está nessa PT
        const cand = (byPt[d.pt] || []).find(p => !placed.has(p.pt + '|' + p.nome));
        if (cand) { placed.delete(d.pt + '|' + d.nome); d.nome = cand.nome; d.funcao = cand.funcao; placed.add(cand.pt + '|' + cand.nome); moved++; }
      });
    });
    return moved;
  }
  // Ctrl+C / Ctrl+V de elementos: copia o último elemento tocado (nota, ícone,
  // inimigo, foco) e cola uma cópia deslocada no cenário atual.
  function pickedData(pk) {
    if (!pk) return null; const s = cur(); if (!s) return null;
    if (pk.kind === 'note') { const n = (s.notas || []).find(x => x.id === pk.id); return n ? { kind: 'note', d: n } : null; }
    if (pk.kind === 'marca') { const m = (s.marcas || []).find(x => x.id === pk.id); return m ? { kind: 'marca', d: m } : null; }
    if (pk.kind === 'enemy') { const e = (s.enemies || []).find(x => x.id === pk.id); return e ? { kind: 'enemy', d: e } : null; }
    if (pk.kind === 'focus') { const f = (Array.isArray(s.focus) ? s.focus : [])[pk.idx]; return f ? { kind: 'focus', d: f } : null; }
    if (pk.kind === 'desenho') { const d = (s.desenhos || []).find(x => x.id === pk.id); return d ? { kind: 'desenho', d: d } : null; }
    return null;
  }
  function doCopy() { const pd = pickedData(lastPicked); if (!pd) return; clipboard = { kind: pd.kind, d: JSON.parse(JSON.stringify(pd.d)) }; toast(t('copied')); }
  function doDeleteSelected() {
    const pd = pickedData(lastPicked); if (!pd || state.present) return; const s = cur(); pushUndo();
    if (pd.kind === 'note') { s.notas = (s.notas || []).filter(x => x.id !== pd.d.id); renderNotes(); }
    else if (pd.kind === 'marca') { s.marcas = (s.marcas || []).filter(x => x.id !== pd.d.id); renderMarks(); }
    else if (pd.kind === 'enemy') { s.enemies = (s.enemies || []).filter(x => x.id !== pd.d.id); pruneLinksFor('enemy:' + pd.d.id); renderTokens(); }
    else if (pd.kind === 'desenho') { s.desenhos = (s.desenhos || []).filter(x => x.id !== pd.d.id); renderDrawings(); }
    else if (pd.kind === 'focus') { if (Array.isArray(s.focus)) s.focus.splice(lastPicked.idx, 1); renderFocus(); }
    lastPicked = null; saveProject();
  }
  function doPaste() {
    if (!clipboard || state.present) return; const s = cur(); if (!s) return; const OX = 0.035, OY = 0.035; pushUndo();
    if (clipboard.kind === 'note') { s.notas = s.notas || []; const n = Object.assign({}, clipboard.d, { id: uid(), x: clamp01(clipboard.d.x + OX), y: clamp01(clipboard.d.y + OY) }); s.notas.push(n); lastPicked = { kind: 'note', id: n.id }; renderNotes(); }
    else if (clipboard.kind === 'marca') { s.marcas = s.marcas || []; const m = Object.assign({}, clipboard.d, { id: uid(), x: clamp01(clipboard.d.x + OX), y: clamp01(clipboard.d.y + OY) }); s.marcas.push(m); lastPicked = { kind: 'marca', id: m.id }; renderMarks(); }
    else if (clipboard.kind === 'enemy') { s.enemies = s.enemies || []; const e = Object.assign({}, clipboard.d, { id: uid(), x: clamp01(clipboard.d.x + OX), y: clamp01(clipboard.d.y + OY) }); s.enemies.push(e); lastPicked = { kind: 'enemy', id: e.id }; renderTokens(); }
    else if (clipboard.kind === 'focus') { if (!Array.isArray(s.focus)) s.focus = []; const f = { x: clamp01(clipboard.d.x + OX), y: clamp01(clipboard.d.y + OY), w: clipboard.d.w, h: clipboard.d.h }; s.focus.push(f); lastPicked = { kind: 'focus', idx: s.focus.length - 1 }; renderFocus(); }
    else if (clipboard.kind === 'desenho') { s.desenhos = s.desenhos || []; const nd = Object.assign({}, clipboard.d, { id: uid(), pontos: (clipboard.d.pontos || []).map(pt => [clamp01(pt[0] + OX), clamp01(pt[1] + OY)]) }); s.desenhos.push(nd); lastPicked = { kind: 'desenho', id: nd.id }; renderDrawings(); }
    saveProject(); toast(t('pasted'));
  }
  // limpa replaces cujo alvo sumiu do roster (após trocar/importar o board)
  // replace não é vínculo fixo: só sobrevive enquanto o reserva está no board
  // (reserva de PT ou geral) e o alvo segue TITULAR — saiu pro "Disponíveis",
  // esvaziou o board ou o alvo caiu de titular, o vínculo se desfaz sozinho.
  function cleanupReplaces(list) {
    let n = 0;
    list.forEach(p => {
      if (!p.replaceOf) return;
      const tgt = list.find(x => x.nome === p.replaceOf && x.id !== p.id);
      const meOnBoard = !!(p.pt || p.reserva) && !p.ausente;
      const tgtOk = tgt && tgt.pt && !tgt.reserva && !tgt.ausente && (!p.pt || tgt.pt === p.pt);
      if (!meOnBoard || !tgtOk) { delete p.replaceOf; p.replace = false; n++; }
    });
    return n;
  }
  // troca titular <-> replace (pelo selo ⇄, sem abrir o Board): o reserva assume
  // a vaga e a posição no mapa; o ex-titular vira reserva da PT apontando de
  // volta pro novo titular (clicar de novo desfaz).
  function swapReplace(reserveName) {
    const res = state.roster.find(x => x.nome === reserveName && x.replaceOf);
    if (!res) return;
    const tgt = state.roster.find(x => x.nome === res.replaceOf && x.pt && !x.reserva);
    if (!tgt) { cleanupReplaces(state.roster); saveProject(); renderSidebar(); toast(t('repGone')); return; }
    pushUndo();
    const pt = tgt.pt;
    res.pt = pt; res.reserva = false; delete res.replaceOf; res.replace = false;
    tgt.pt = pt; tgt.reserva = true; tgt.replaceOf = res.nome; tgt.replace = true;
    // tokens no mapa (todas as cenas): o ex-titular sai, o novo entra na MESMA posição
    (state.scenarios || []).forEach(s => (s.destacados || []).forEach(d => { if (d.pt === pt && d.nome === tgt.nome) { d.nome = res.nome; d.funcao = res.funcao; } }));
    saveProject(); renderSidebar(); renderTokens();
    if (rosterModal && !rosterModal.hidden) { rosterDraft = state.roster.map(p => Object.assign({}, p, { flags: (p.flags || []).slice() })); refreshRoster(); }
    toast('⇄ ' + esc(res.nome) + ' ⇆ ' + esc(tgt.nome));
  }
  function detachMember(pt, nome, funcao, xf, yf) { if (state.present) return; const ex = (cur().destacados || []).find(d => d.pt === pt && d.nome === nome); if (ex) { pushUndo(); ex.xf = clamp01(xf); ex.yf = clamp01(yf); hidePopover(); renderTokens(); renderSidebar(); saveProject(); return; } pushUndo(); const id = uid(); cur().destacados.push({ id, pt, nome, funcao, xf: clamp01(xf), yf: clamp01(yf) }); cur().links = cur().links || []; cur().links.push({ id: uid(), a: 'pt:' + pt, b: 'mem:' + id }); hidePopover(); renderTokens(); renderSidebar(); saveProject(); }

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
  function objBuffsFor(o) { if (!o || !o.icone || !CFG.objBuffs) return []; if (o.icone.indexOf('tower') === 0) return CFG.objBuffs.tower || []; if (o.icone.indexOf('goose') === 0) return CFG.objBuffs.goose || []; if (o.icone.indexOf('tree') === 0) return CFG.objBuffs.tree || []; if (o.icone === 'boss') return CFG.objBuffs.boss || []; return []; }
  function objInfoFor(o) { if (!o || !o.icone || !CFG.objInfo) return ''; const ic = o.icone; if (ic.indexOf('tower') === 0) return CFG.objInfo.tower || ''; if (ic.indexOf('goose') === 0) return CFG.objInfo.goose || ''; if (ic.indexOf('tree') === 0) return CFG.objInfo.tree || ''; if (ic === 'jungle') return CFG.objInfo.jungle || ''; return CFG.objInfo[ic] || ''; }
  function gatePos(o) { const g = state.gates && state.gates[o.id]; return g ? { x: g.x, y: g.y } : { x: o.caminho.b[0], y: o.caminho.b[1] }; }
  function treeMeters(o, xf, yf) { const a = o.caminho.a, b = gatePos(o), ax = b.x - a[0], ay = b.y - a[1]; const t = ((xf - a[0]) * ax + (yf - a[1]) * ay) / (ax * ax + ay * ay || 1); return Math.round(Math.max(0, Math.min(1, t)) * CFG.treeMeters); }
  function renderObjectives() {
    objLayer.destroyChildren();
    const up = cur() ? (cur().objetivos || {}) : {}, os = Math.max(13, W * 0.025);
    CFG.objetivos.forEach(o => {
      if (!up[o.id]) return;
      const pos = objPos(o);
      const unlocked = unlockedObjs.has(o.id);
      // Caminho da árvore: a linha tracejada só aparece enquanto o objetivo está
      // destravado (editando o portão) — no uso normal e na apresentação some,
      // ficando só os metros andados e a árvore se movendo. Os metros são
      // calculados pelo vetor do caminho, independem da linha desenhada.
      if (o.caminho && !state.present && state.tool === 'select' && unlocked) { const gp = gatePos(o); objLayer.add(new Konva.Line({ points: [o.caminho.a[0] * W, o.caminho.a[1] * H, gp.x * W, gp.y * H], stroke: hexA(o.icone === 'tree_red' ? '#E25B52' : '#89ABC5', 0.45), strokeWidth: Math.max(1, R * 0.06), dash: [4, 6], listening: false, name: 'treepath-' + o.id })); { const gh = new Konva.Group({ x: gp.x * W, y: gp.y * H, draggable: true, name: 'gate-' + o.id }); gh.add(new Konva.Rect({ width: os * 0.5, height: os * 0.9, offsetX: os * 0.25, offsetY: os * 0.45, cornerRadius: 2, fill: 'rgba(240,198,107,.18)', stroke: '#f0c66b', strokeWidth: Math.max(1.4, os * 0.06), dash: [3, 3] })); gh.add(new Konva.Text({ text: '⛩', fontSize: os * 0.5, offsetX: os * 0.25, offsetY: os * 0.3, opacity: 0.9 })); gh.dragBoundFunc(clampToStage); gh.on('dragstart', () => { pushUndo(); }); gh.on('dragmove', () => { const t2 = objLayer.findOne('.treepath-' + o.id); if (t2) t2.points([o.caminho.a[0] * W, o.caminho.a[1] * H, gh.x(), gh.y()]); const on = objLayer.findOne('.obj-' + o.id); if (on) { const tm = on.findOne('.tm'); if (tm) { state.gates[o.id] = { x: clamp01(gh.x() / W), y: clamp01(gh.y() / H) }; const op = objPos(o); tm.findOne('Text').text(treeMeters(o, op.x, op.y) + 'm'); centerLabelX(tm); } } objLayer.batchDraw(); }); gh.on('dragend', () => { state.gates[o.id] = { x: clamp01(gh.x() / W), y: clamp01(gh.y() / H) }; renderObjectives(); saveProject(); }); gh.on('mouseenter', () => stage.container().style.cursor = 'grab'); gh.on('mouseleave', () => stage.container().style.cursor = toolCursor()); objLayer.add(gh); } }
      const canDrag = !state.present && state.tool === 'select' && unlocked;
      const g = new Konva.Group({ x: pos.x * W, y: pos.y * H, draggable: canDrag, name: 'obj-' + o.id });
      if (unlocked) g.add(new Konva.Circle({ radius: os * 0.7, stroke: '#f0c66b', strokeWidth: Math.max(1, os * 0.05), dash: [3, 3], opacity: 0.85, listening: false }));
      const img = iconImgs[o.icone];
      // escala por tipo de ícone: torres 1.25x, boss 1.5x (o restante 1x)
      const isTower = o.icone && o.icone.indexOf('tower') === 0;
      const osz = os * (isTower ? 0.94 : o.icone === 'boss' ? 1.125 : 1);
      let iconH = osz;
      if (img && img.width) {
        const h = osz * (img.height / img.width); iconH = h;
        // vinheta suave atrás do ícone: separa do mapa e dá tratamento consistente (sem disco duro)
        const rr = Math.max(osz, h) * 0.58;
        g.add(new Konva.Circle({ y: h * 0.05, radius: rr, listening: false, fillRadialGradientStartPoint: { x: 0, y: 0 }, fillRadialGradientEndPoint: { x: 0, y: 0 }, fillRadialGradientStartRadius: rr * 0.15, fillRadialGradientEndRadius: rr, fillRadialGradientColorStops: [0, 'rgba(6,8,12,0.52)', 0.55, 'rgba(6,8,12,0.3)', 1, 'rgba(6,8,12,0)'] }));
        g.add(new Konva.Image({ image: img, width: osz, height: h, offsetX: osz / 2, offsetY: h / 2, scaleX: o.flip ? -1 : 1, shadowColor: '#000', shadowBlur: 5, shadowOpacity: 0.35, shadowOffsetY: 1 }));
      }
      else { const st = objStyle(o); iconH = os * 0.88; g.add(new Konva.Circle({ radius: os * 0.44, fill: 'rgba(12,15,22,.62)', stroke: st.c, strokeWidth: Math.max(2, os * 0.08), shadowColor: '#000', shadowBlur: 4, shadowOpacity: 0.4 })); g.add(new Konva.Text({ text: st.t, fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: os * (st.emoji ? 0.5 : st.t.length > 1 ? 0.3 : 0.42), fill: st.emoji ? undefined : st.c, align: 'center', verticalAlign: 'middle', width: os * 1.6, height: os, offsetX: os * 0.8, offsetY: os / 2 })); }
      if (o.caminho && !((cur().hideMeters || {})[o.id])) { const ml = new Konva.Label({ name: 'tm', y: os * 0.52 }); ml.add(new Konva.Tag({ fill: 'rgba(10,12,17,.82)', cornerRadius: 3, pointerDirection: 'up', pointerWidth: 5, pointerHeight: 4 })); ml.add(new Konva.Text({ text: treeMeters(o, pos.x, pos.y) + 'm', fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: Math.max(9, os * 0.26), fill: '#f0c66b', padding: 3 })); centerLabelX(ml); g.add(ml); }
      // barra de HP (quando < 100%) — árvore mostra em cima pra não bater no medidor de metros
      const hp = (cur().objHp || {})[o.id];
      if (hp != null && hp < 100) {
        // HP discreto: barrinha fina + número pequeno com contorno (sem pill pesado).
        // árvore mostra em cima (metros ficam embaixo); os demais na base do ícone.
        const hc = hp > 60 ? '#4CC9A4' : hp > 30 ? '#f0c66b' : '#E25B52';
        const fs = Math.max(7, osz * 0.22), bw = Math.max(osz * 0.72, 14), bh = Math.max(2.2, fs * 0.32);
        const by = o.caminho ? (-iconH / 2 - fs - bh - 3) : (iconH * 0.4);
        g.add(new Konva.Rect({ x: -bw / 2, y: by, width: bw, height: bh, cornerRadius: bh / 2, fill: 'rgba(6,8,12,.55)', shadowColor: '#000', shadowBlur: 2, shadowOpacity: 0.5, listening: false }));
        g.add(new Konva.Rect({ x: -bw / 2, y: by, width: Math.max(bh, bw * hp / 100), height: bh, cornerRadius: bh / 2, fill: hc, listening: false }));
        const tx = new Konva.Text({ text: hp + '%', fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: fs, fill: hc, y: by + bh + 1.5, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.95, listening: false });
        tx.offsetX(tx.width() / 2); g.add(tx);
      }
      // selos de buff ativos (City Protection / You Got a Problem / Hair Pulling) acima do ícone
      const abuffs = (cur().objBuffs || {})[o.id] || [];
      if (abuffs.length) {
        const defs = objBuffsFor(o), shown = abuffs.map(id => defs.find(d => d.id === id)).filter(Boolean);
        // selos desenhados (SVG) — compactos, colados no topo do ícone
        const bs = Math.max(11, os * 0.52), gap = bs * 0.94, tot = (shown.length - 1) * gap, by = -iconH / 2 - bs * 0.38;
        shown.forEach((def, i) => {
          const bx = -tot / 2 + i * gap, bim = buffImgs[def.id];
          if (bim && bim.width) g.add(new Konva.Image({ image: bim, width: bs, height: bs, x: bx - bs / 2, y: by - bs / 2, shadowColor: '#000', shadowBlur: bs * 0.28, shadowOpacity: 0.55, shadowOffsetY: 1 }));
        });
      }
      g.on('click tap', e => { e.cancelBubble = true; g.moveToTop(); objLayer.batchDraw(); iconClicked('obj:' + o.id, () => openObjMenu(o, g.x(), g.y())); });
      if (canDrag) {
        g.dragBoundFunc(clampToStage);
        g.on('dragstart', () => { closeIconMenu(); g.moveToTop(); if (o.movel) pushUndo(); });
        g.on('dragmove', () => { if (o.caminho) { const t = g.findOne('.tm'); if (t) { t.findOne('Text').text(treeMeters(o, g.x() / W, g.y() / H) + 'm'); centerLabelX(t); } const carr = (cur().treeCarry || {})[o.id] || []; carr.forEach((mid, idx) => { const mn = tokenLayer.findOne('#mem-' + mid); if (mn) { const rm = Math.max(7, R * 0.5); mn.position({ x: g.x() + (idx === 0 ? -1 : 1) * rm * 1.5, y: g.y() + rm * 1.4 }); } }); tokenLayer.batchDraw(); } objLayer.batchDraw(); updateLinks(); });
        g.on('dragend', () => { const p = { x: clamp01(g.x() / W), y: clamp01(g.y() / H) }; if (o.movel) { cur().objetivoPos = cur().objetivoPos || {}; cur().objetivoPos[o.id] = p; } else { state.objetivoPosGlobal[o.id] = p; } saveProject(); });
        g.on('mouseenter', () => stage.container().style.cursor = 'grab');
        g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      } else { g.on('mouseenter', () => { if (!state.present) stage.container().style.cursor = 'pointer'; }); g.on('mouseleave', () => stage.container().style.cursor = toolCursor()); }
      objLayer.add(g);
    });
    objLayer.batchDraw();
    if (autoSpot) renderFocus();   // o auto-foco acompanha os objetivos up
  }
  function setObjUp(id, on) { const c = cur().objetivos; if (on) c[id] = true; else { delete c[id]; if (cur().objetivoPos) delete cur().objetivoPos[id]; } }
  function renderObjPanel() {
    const up = cur() ? (cur().objetivos || {}) : {}; objGroups.innerHTML = '';
    const totalN = CFG.objetivos.length, upAll = CFG.objetivos.filter(o => up[o.id]).length;
    const master = document.createElement('label'); master.className = 'obj-master';
    master.innerHTML = '<input type="checkbox"' + (upAll === totalN ? ' checked' : '') + '><span class="mtxt">' + t('objAll') + '</span><span class="gcount">' + upAll + '/' + totalN + '</span>';
    const mcb = master.querySelector('input'); mcb.indeterminate = upAll > 0 && upAll < totalN;
    mcb.addEventListener('change', () => { pushUndo(); CFG.objetivos.forEach(o => setObjUp(o.id, mcb.checked)); renderObjectives(); renderObjPanel(); saveProject(); });
    objGroups.appendChild(master);
    // toggles rápidos POR LADO: liga/desliga tudo do lado Azul (Oeste) ou
    // Vermelho (Leste). O lado vem da POSIÇÃO no mapa (x < 0.5 = azul) — assim
    // jungle, boss e outpost também contam pro lado em que ficam.
    const sideOf = o => (o.x || 0) < 0.5 ? 'o' : 'l';
    const sideToggle = (side, scope) => { const list = (scope || CFG.objetivos).filter(o => sideOf(o) === side); if (!list.length) return; const all = list.every(o => up[o.id]); pushUndo(); list.forEach(o => setObjUp(o.id, !all)); renderObjectives(); renderObjPanel(); saveProject(); };
    const srow = document.createElement('div'); srow.className = 'obj-siderow';
    const mkSideBtn = (side, label, scope, mini) => { const list = (scope || CFG.objetivos).filter(o => sideOf(o) === side); const n = list.filter(o => up[o.id]).length; const b = document.createElement('button'); b.type = 'button'; b.className = 'obj-side ' + (side === 'o' ? 'blue' : 'red') + (n === list.length && list.length ? ' on' : '') + (mini ? ' mini' : ''); b.innerHTML = '<span class="sc-dot"></span>' + label + (mini ? '' : ' <span class="gcount">' + n + '/' + list.length + '</span>'); b.addEventListener('click', e => { e.stopPropagation(); sideToggle(side, scope); }); return b; };
    srow.appendChild(mkSideBtn('o', t('sideBlue'))); srow.appendChild(mkSideBtn('l', t('sideRed')));
    objGroups.appendChild(srow);
    CFG.objetivosGrupos.forEach(grp => {
      const list = CFG.objetivos.filter(o => o.grupo === grp); if (!list.length) return;
      const nUp = list.filter(o => up[o.id]).length, allUp = nUp === list.length, open = !!objGroupOpen[grp];
      const box = document.createElement('div'); box.className = 'obj-g';
      const gh = document.createElement('div'); gh.className = 'obj-gh' + (nUp ? ' any' : '') + (open ? ' open' : '');
      gh.innerHTML = '<input type="checkbox"' + (allUp ? ' checked' : '') + '><span class="chev">▸</span><span class="gname">' + grp + '</span><span class="gcount">' + nUp + '/' + list.length + '</span>';
      // grupos com os 2 lados ganham mini-botões O/L no cabeçalho
      if (list.some(o => sideOf(o) === 'o') && list.some(o => sideOf(o) === 'l')) { const wrap = document.createElement('span'); wrap.className = 'gh-sides'; wrap.appendChild(mkSideBtn('o', '', list, true)); wrap.appendChild(mkSideBtn('l', '', list, true)); gh.insertBefore(wrap, gh.querySelector('.gcount')); }
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
  function toolCursor() { return (DRAW.includes(state.tool) || state.tool === 'marca' || state.tool === 'nota' || state.tool === 'inimigo' || state.tool === 'foco') ? 'crosshair' : 'default'; }
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
  function setTool(t) { if (linkTempFrom) { cancelLink(); renderTokens(); } state.tool = t; drawTools.querySelectorAll('.dt[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === t)); const noHit = DRAW.includes(t) || t === 'marca' || t === 'inimigo' || t === 'foco'; tokenLayer.listening(!noHit); objLayer.listening(!noHit); noteLayer.listening(t === 'select'); drawLayer.listening(t === 'select'); stage.container().style.cursor = toolCursor(); if (noHit || t === 'nota') { hidePopover(); closeIconMenu(); } if (markPicker) markPicker.hidden = (t !== 'marca'); renderMarks(); renderDrawings(); renderFocus(); updateStageDrag(); }
  function pxPts(pts) { const a = []; pts.forEach(p => { a.push(p[0] * W, p[1] * H); }); return a; }
  function shapeFromDesenho(d) {
    const stroke = d.cor || '#FFC21A', sw = d.largura || 3, hit = Math.max(sw + 10, 16);   // hit largo p/ clicar em traço fino
    if (d.tipo === 'seta') return new Konva.Arrow({ points: pxPts(d.pontos), stroke, fill: stroke, strokeWidth: sw, pointerLength: sw * 2.6 + 3, pointerWidth: sw * 2.4 + 2, lineCap: 'round', lineJoin: 'round', hitStrokeWidth: hit });
    if (d.tipo === 'linha') return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, lineCap: 'round', hitStrokeWidth: hit });
    if (d.tipo === 'livre') return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, lineCap: 'round', lineJoin: 'round', tension: 0.35, hitStrokeWidth: hit });
    if (d.tipo === 'retangulo') { const a = d.pontos[0], b = d.pontos[1]; return new Konva.Rect({ x: Math.min(a[0], b[0]) * W, y: Math.min(a[1], b[1]) * H, width: Math.abs(b[0] - a[0]) * W, height: Math.abs(b[1] - a[1]) * H, stroke, strokeWidth: sw, cornerRadius: 4, fill: hexA(stroke, 0.1) }); }
    return new Konva.Line({ points: pxPts(d.pontos), stroke, strokeWidth: sw, hitStrokeWidth: hit });
  }
  function renderDrawings() {
    drawLayer.destroyChildren();
    const canEdit = !state.present && state.tool === 'select';
    drawLayer.listening(canEdit);
    (cur() ? cur().desenhos : []).forEach(d => {
      if (!d.id) d.id = uid();
      const sh = shapeFromDesenho(d); sh.name('draw-' + d.id);
      if (canEdit) {
        // clicar seleciona (pra Ctrl+C/Del); 2 cliques exclui
        sh.on('click tap', e => { e.cancelBubble = true; lastPicked = { kind: 'desenho', id: d.id }; });
        sh.on('dblclick dbltap', e => { e.cancelBubble = true; pushUndo(); cur().desenhos = (cur().desenhos || []).filter(x => x !== d); renderDrawings(); saveProject(); });
        sh.on('mouseenter', () => stage.container().style.cursor = 'pointer');
        sh.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      }
      drawLayer.add(sh);
    });
    drawLayer.batchDraw();
    if (autoSpot) renderFocus();   // desenhos entram no auto-foco
  }
  let live = null;
  function beginDraw() { if (state.present || !DRAW.includes(state.tool)) return; const f = frac(); if (!f) return; live = { tipo: state.tool, pontos: state.tool === 'livre' ? [[f.xf, f.yf]] : [[f.xf, f.yf], [f.xf, f.yf]], cor: state.drawColor, largura: state.drawWidth, shape: null }; live.shape = shapeFromDesenho(live); drawLayer.add(live.shape); drawLayer.batchDraw(); }
  function moveDraw() { if (!live) return; const f = frac(); if (!f) return; if (live.tipo === 'livre') live.pontos.push([f.xf, f.yf]); else live.pontos[1] = [f.xf, f.yf]; live.shape.destroy(); live.shape = shapeFromDesenho(live); drawLayer.add(live.shape); drawLayer.batchDraw(); }
  function endDraw() { if (!live) return; const d = live; live = null; d.shape && d.shape.destroy(); const tiny = d.tipo === 'livre' ? d.pontos.length < 3 : Math.hypot((d.pontos[1][0] - d.pontos[0][0]) * W, (d.pontos[1][1] - d.pontos[0][1]) * H) < 6; if (tiny) { drawLayer.batchDraw(); return; } pushUndo(); cur().desenhos.push({ id: uid(), tipo: d.tipo, pontos: d.pontos.map(p => [p[0], p[1]]), cor: d.cor, largura: d.largura }); renderDrawings(); renderTokens(); saveProject(); }
  // ---- FOCO / spotlight: destaca uma área e escurece o resto ----
  let focusLive = null, focusHidden = false, autoSpot = false, focusRotDrag = null, focusResizeDrag = null;
  function focusList() { const s = cur(); if (!s) return []; if (s.focus && !Array.isArray(s.focus)) s.focus = [s.focus]; if (!Array.isArray(s.focus)) s.focus = []; return s.focus; }
  function focusCenter(f) { return { cx: (f.x + f.w / 2) * W, cy: (f.y + f.h / 2) * H }; }
  // auto-foco: abre um "furo" de luz cobrindo CADA elemento por inteiro. Usa a
  // caixa real (getClientRect) de cada grupo — assim inclui nome, contadores,
  // selos e ícones-dentro-de-ícones — e um furo em cápsula ao longo de cada
  // linha de conexão. Converte a caixa (coords absolutas) p/ coords de camada.
  function autoSpotHoles() {
    const s = cur(); if (!s) return; const sc = stage.scaleX() || 1, ox = stage.x(), oy = stage.y();
    const nodes = [];
    (s.tokens || []).forEach(tk => { const n = tokenLayer.findOne('.pt-' + tk.pt); if (n) nodes.push(n); });
    (s.destacados || []).forEach(d => { const n = tokenLayer.findOne('#mem-' + d.id); if (n) nodes.push(n); });
    (s.enemies || []).forEach(e => { const n = tokenLayer.findOne('#enemy-' + e.id); if (n) nodes.push(n); });
    const up = s.objetivos || {}; CFG.objetivos.forEach(o => { if (up[o.id]) { const n = objLayer.findOne('.obj-' + o.id); if (n) nodes.push(n); } });
    const pad = Math.max(5, R * 0.3);
    nodes.forEach(n => {
      let r; try { r = n.getClientRect({ skipShadow: true }); } catch (_) { return; }
      if (!r || !(r.width > 0)) return;
      const x = (r.x - ox) / sc - pad, y = (r.y - oy) / sc - pad, w = r.width / sc + pad * 2, h = r.height / sc + pad * 2, rad = Math.min(w, h) * 0.42;
      focusLayer.add(new Konva.Rect({ x: x, y: y, width: w, height: h, cornerRadius: rad, fill: '#000', globalCompositeOperation: 'destination-out', listening: false }));
      focusLayer.add(new Konva.Rect({ x: x, y: y, width: w, height: h, cornerRadius: rad, stroke: 'rgba(240,198,107,0.24)', strokeWidth: 1, listening: false }));
    });
    // ícones carimbados (ferramenta Ícone) também entram na luz
    markLayer.getChildren().forEach(n => {
      let r; try { r = n.getClientRect({ skipShadow: true }); } catch (_) { return; }
      if (!r || !(r.width > 0)) return;
      const x = (r.x - ox) / sc - pad, y = (r.y - oy) / sc - pad, w = r.width / sc + pad * 2, h = r.height / sc + pad * 2;
      focusLayer.add(new Konva.Rect({ x: x, y: y, width: w, height: h, cornerRadius: Math.min(w, h) * 0.42, fill: '#000', globalCompositeOperation: 'destination-out', listening: false }));
    });
    // desenhos manuais (seta/linha/livre/área): cápsula de luz seguindo o traço
    (s.desenhos || []).forEach(d => {
      if (!d || !Array.isArray(d.pontos)) return;
      const sw = Math.max(16, R * 1.1) + (d.largura || 3);
      if (d.tipo === 'retangulo') { const a = d.pontos[0], b = d.pontos[1], pd2 = Math.max(6, R * 0.4); focusLayer.add(new Konva.Rect({ x: Math.min(a[0], b[0]) * W - pd2, y: Math.min(a[1], b[1]) * H - pd2, width: Math.abs(b[0] - a[0]) * W + pd2 * 2, height: Math.abs(b[1] - a[1]) * H + pd2 * 2, cornerRadius: 8, fill: '#000', globalCompositeOperation: 'destination-out', listening: false })); }
      else focusLayer.add(new Konva.Line({ points: pxPts(d.pontos), stroke: '#000', strokeWidth: sw, lineCap: 'round', lineJoin: 'round', tension: d.tipo === 'livre' ? 0.35 : 0, globalCompositeOperation: 'destination-out', listening: false }));
    });
    // linhas de conexão: cápsula de luz seguindo o traço (pontos já em coords de camada)
    (s.links || []).forEach(l => { const pts = linkPts(l); if (!pts) return; focusLayer.add(new Konva.Line({ points: pts, stroke: '#000', strokeWidth: Math.max(12, R * 0.85), lineCap: 'round', lineJoin: 'round', globalCompositeOperation: 'destination-out', listening: false })); });
  }
  function renderFocus(previewRect) {
    focusLayer.destroyChildren();
    const list = cur() ? focusList() : [];
    if (focusHidden && !previewRect) { focusLayer.batchDraw(); return; }
    const auto = autoSpot && !previewRect;
    // auto-foco ligado OCULTA os focos manuais (só um modo de spotlight por vez)
    const manual = previewRect ? list.concat([previewRect]) : (auto ? [] : list);
    const validManual = manual.filter(f => f && f.w > 0.002 && f.h > 0.002);
    if (!validManual.length && !auto) { focusLayer.batchDraw(); return; }
    focusLayer.add(new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: 'rgba(6,8,12,0.66)', listening: false }));
    // auto-foco: furos cobrindo cada elemento por inteiro + as linhas de conexão
    if (auto) autoSpotHoles();
    // furo + contorno de um foco manual (ret ou elipse), centrado na origem do grupo
    const holeInto = (parent, f) => {
      const hw = f.w * W, hh = f.h * H, r = Math.min(hw, hh) * 0.05 + 6, ell = f.shape === 'ellipse';
      const border = { stroke: 'rgba(240,198,107,0.55)', strokeWidth: 1.5, listening: false, shadowColor: '#f0c66b', shadowBlur: 14, shadowOpacity: 0.35 };
      if (ell) { parent.add(new Konva.Ellipse({ radiusX: hw / 2, radiusY: hh / 2, fill: '#000', globalCompositeOperation: 'destination-out', listening: false })); parent.add(new Konva.Ellipse(Object.assign({ radiusX: hw / 2, radiusY: hh / 2 }, border))); }
      else { parent.add(new Konva.Rect({ x: -hw / 2, y: -hh / 2, width: hw, height: hh, cornerRadius: r, fill: '#000', globalCompositeOperation: 'destination-out', listening: false })); parent.add(new Konva.Rect(Object.assign({ x: -hw / 2, y: -hh / 2, width: hw, height: hh, cornerRadius: r }, border))); }
      return { hw, hh, r, ell };
    };
    const editable = !state.present && !previewRect && state.tool === 'select';
    if (!editable) { validManual.forEach(f => { const c = focusCenter(f); const g = new Konva.Group({ x: c.cx, y: c.cy, rotation: f.rot || 0 }); holeInto(g, f); focusLayer.add(g); }); }
    else manual.forEach((f, idx) => {
      if (!(f.w > 0.002 && f.h > 0.002)) return;
      const active = !!((focusRotDrag && focusRotDrag.idx === idx) || (focusResizeDrag && focusResizeDrag.idx === idx) || (lastPicked && lastPicked.kind === 'focus' && lastPicked.idx === idx));
      const c = focusCenter(f), grp = new Konva.Group({ x: c.cx, y: c.cy, rotation: f.rot || 0, draggable: true, name: 'focusg-' + idx });
      const geo = holeInto(grp, f), hit = Math.max(20, R * 1.4), br = Math.max(8, R * 0.62);
      // moldura-alvo: só a BORDA é alvo (interior passa o clique pros tokens)
      const frame = geo.ell ? new Konva.Ellipse({ radiusX: geo.hw / 2, radiusY: geo.hh / 2, stroke: 'rgba(0,0,0,0.001)', strokeWidth: 2, fillEnabled: false, hitStrokeWidth: hit }) : new Konva.Rect({ x: -geo.hw / 2, y: -geo.hh / 2, width: geo.hw, height: geo.hh, cornerRadius: geo.r, stroke: 'rgba(0,0,0,0.001)', strokeWidth: 2, fillEnabled: false, hitStrokeWidth: hit });
      grp.add(frame);
      // badges ✕ (excluir) e formato (ret <-> elipse), no canto superior
      const delB = new Konva.Group({ x: geo.hw / 2, y: -geo.hh / 2, visible: active });
      delB.add(new Konva.Circle({ radius: br, fill: '#E25B52', stroke: '#0c0f16', strokeWidth: 1.2, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.6 }));
      delB.add(new Konva.Text({ text: '✕', fontFamily: 'Barlow, sans-serif', fontStyle: '700', fontSize: br * 1.05, fill: '#fff', align: 'center', verticalAlign: 'middle', width: br * 2, height: br * 2, offsetX: br, offsetY: br }));
      const shpB = new Konva.Group({ x: geo.hw / 2 - br * 2.5, y: -geo.hh / 2, visible: active });
      shpB.add(new Konva.Circle({ radius: br, fill: '#46506a', stroke: '#0c0f16', strokeWidth: 1.2, shadowColor: '#000', shadowBlur: 3, shadowOpacity: 0.6 }));
      shpB.add(geo.ell ? new Konva.Rect({ x: -br * 0.5, y: -br * 0.4, width: br, height: br * 0.8, cornerRadius: 1.5, stroke: '#fff', strokeWidth: 1.6 }) : new Konva.Ellipse({ radiusX: br * 0.55, radiusY: br * 0.42, stroke: '#fff', strokeWidth: 1.6 }));
      grp.add(shpB); grp.add(delB);
      // alças de rotação e de REDIMENSIONAR — nós separados (num overlay que não
      // entra no arraste de mover; assim pegar uma alça não move o foco).
      const gap = Math.max(16, R * 1.2), ang = (f.rot || 0) * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), dist = geo.hh / 2 + gap;
      const rhx = c.cx + sa * dist, rhy = c.cy - ca * dist;
      const rotG = new Konva.Group();
      const rotLine = new Konva.Line({ points: [c.cx, c.cy, rhx, rhy], stroke: 'rgba(240,198,107,0.45)', strokeWidth: 1.2, dash: [3, 3], listening: false, visible: active });
      rotG.add(rotLine);
      const rotHit = new Konva.Circle({ x: rhx, y: rhy, radius: br * 0.95, fill: '#f0c66b', stroke: '#0c0f16', strokeWidth: 1.2, visible: active });
      rotG.add(rotHit);
      // 4 alças de canto: centro + canto local (±hw/2,±hh/2) rotacionado
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (cn) { const lx = cn[0] * geo.hw / 2, ly = cn[1] * geo.hh / 2, hx = c.cx + lx * ca - ly * sa, hy = c.cy + lx * sa + ly * ca; const h = new Konva.Circle({ x: hx, y: hy, radius: br * 0.8, fill: '#0e1118', stroke: '#f0c66b', strokeWidth: 2, visible: active }); rotG.add(h); return h; });
      const uiNodes = [delB, shpB, rotHit, rotLine].concat(corners);
      let hideT = null;
      const showUI = () => { clearTimeout(hideT); uiNodes.forEach(n => n.visible(true)); focusLayer.batchDraw(); };
      const hideUI = () => { clearTimeout(hideT); hideT = setTimeout(() => { if (grp.isDragging() || focusRotDrag || focusResizeDrag) return; uiNodes.forEach(n => n.visible(false)); focusLayer.batchDraw(); }, 280); };
      delB.on('click tap', e => { e.cancelBubble = true; pushUndo(); focusList().splice(idx, 1); renderFocus(); saveProject(); });
      shpB.on('click tap', e => { e.cancelBubble = true; pushUndo(); const ff = focusList()[idx]; if (ff) ff.shape = (ff.shape === 'ellipse' ? 'rect' : 'ellipse'); renderFocus(); saveProject(); });
      [delB, shpB, rotHit].forEach(n => { n.on('mouseenter', () => { stage.container().style.cursor = 'pointer'; }); n.on('mouseleave', () => { stage.container().style.cursor = toolCursor(); }); });
      corners.forEach(h => { h.on('mouseenter', () => { stage.container().style.cursor = 'nwse-resize'; }); h.on('mouseleave', () => { stage.container().style.cursor = toolCursor(); }); h.on('mousedown touchstart', e => { e.cancelBubble = true; focusResizeDrag = { idx: idx }; pushUndo(); }); });
      frame.on('mouseenter', () => { stage.container().style.cursor = 'move'; });
      frame.on('mouseleave', () => { stage.container().style.cursor = toolCursor(); });
      frame.on('mousedown touchstart', () => { lastPicked = { kind: 'focus', idx: idx }; showUI(); });
      rotHit.on('mousedown touchstart', e => { e.cancelBubble = true; focusRotDrag = { idx: idx }; pushUndo(); });
      grp.on('dragstart', () => { pushUndo(); showUI(); grp.moveToTop(); rotG.hide(); });
      grp.on('dragend', () => { const ff = focusList()[idx]; if (ff) { ff.x = clamp01(grp.x() / W - ff.w / 2); ff.y = clamp01(grp.y() / H - ff.h / 2); } renderFocus(); saveProject(); });
      focusLayer.add(grp); focusLayer.add(rotG);
    });
    focusLayer.batchDraw();
  }
  function doFocusRotate() { const f = focusList()[focusRotDrag.idx]; if (!f) { focusRotDrag = null; return; } const p = frac(); if (!p) return; const c = focusCenter(f); let deg = Math.atan2(p.yf * H - c.cy, p.xf * W - c.cx) * 180 / Math.PI + 90; f.rot = Math.round(deg); renderFocus(); }
  // redimensiona simétrico em torno do centro (respeitando a rotação do foco)
  function doFocusResize() { const f = focusList()[focusResizeDrag.idx]; if (!f) { focusResizeDrag = null; return; } const p = frac(); if (!p) return; const cxf = f.x + f.w / 2, cyf = f.y + f.h / 2; const dx = p.xf * W - cxf * W, dy = p.yf * H - cyf * H, a = (f.rot || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a); const lx = dx * ca + dy * sa, ly = -dx * sa + dy * ca; f.w = clamp01(Math.max(0.03, Math.abs(lx) * 2 / W)); f.h = clamp01(Math.max(0.03, Math.abs(ly) * 2 / H)); f.x = clamp01(cxf - f.w / 2); f.y = clamp01(cyf - f.h / 2); renderFocus(); }
  function toggleFocusHidden() { focusHidden = !focusHidden; const b = $('focusTgl'); if (b) b.classList.toggle('on', !focusHidden); renderFocus(); }
  function toggleAutoSpot() { autoSpot = !autoSpot; const b = $('autoSpotTgl'); if (b) b.classList.toggle('on', autoSpot); renderFocus(); }
  function beginFocus() { if (state.present || state.tool !== 'foco') return; const f = frac(); if (!f) return; focusLive = { x0: f.xf, y0: f.yf, x1: f.xf, y1: f.yf }; }
  function moveFocus() { if (!focusLive) return; const f = frac(); if (!f) return; focusLive.x1 = f.xf; focusLive.y1 = f.yf; renderFocus(focusRectFromLive()); }
  function focusRectFromLive() { const a = focusLive; return { x: Math.min(a.x0, a.x1), y: Math.min(a.y0, a.y1), w: Math.abs(a.x1 - a.x0), h: Math.abs(a.y1 - a.y0) }; }
  function endFocus() {
    if (!focusLive) return; const rect = focusRectFromLive(); focusLive = null;
    if (rect.w < 0.02 || rect.h < 0.02) { renderFocus(); return; } // clique curto: nada (excluir é pelo ✕)
    pushUndo(); focusList().push(rect); renderFocus(); saveProject();  // fica na ferramenta pra adicionar mais
  }
  // Limpa só os EXTRAS (desenhos, notas, ícones, inimigos, focos) — mantém
  // objetivos, PTs e players posicionados.
  async function clearDrawings() { const s = cur(); const has = (s.desenhos || []).length || (s.marcas || []).length || (s.notas || []).length || (s.enemies || []).length || (Array.isArray(s.focus) && s.focus.length); if (!has) return; if (!await askConfirm(t('confirmClearDraw'))) return; pushUndo(); const enemyIds = (s.enemies || []).map(e => 'enemy:' + e.id); if (s.links && enemyIds.length) s.links = s.links.filter(l => enemyIds.indexOf(l.a) < 0 && enemyIds.indexOf(l.b) < 0); s.desenhos = []; s.marcas = []; s.notas = []; s.enemies = []; s.focus = []; closeNoteEdit(); renderDrawings(); renderMarks(); renderNotes(); renderFocus(); renderTokens(); saveProject(); }

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
      g.on('click tap', e => { e.cancelBubble = true; lastPicked = { kind: 'marca', id: m.id }; });
      g.on('dblclick dbltap', e => { e.cancelBubble = true; pushUndo(); cur().marcas = (cur().marcas || []).filter(x => x.id !== m.id); renderMarks(); saveProject(); });
      if (canDrag) {
        g.dragBoundFunc(clampToStage);
        g.on('dragstart', () => { lastPicked = { kind: 'marca', id: m.id }; pushUndo(); g.moveToTop(); });
        g.on('dragend', () => { const mm = (cur().marcas || []).find(x => x.id === m.id); if (mm) { mm.x = clamp01(g.x() / W); mm.y = clamp01(g.y() / H); saveProject(); } });
        g.on('mouseenter', () => stage.container().style.cursor = 'grab');
        g.on('mouseleave', () => stage.container().style.cursor = toolCursor());
      }
      markLayer.add(g);
    });
    markLayer.batchDraw();
    if (autoSpot) renderFocus();   // ícones entram no auto-foco
    renderNotes();
  }
  function placeMark() {
    if (state.present) return; const f = frac(); if (!f) return;
    pushUndo(); cur().marcas = cur().marcas || [];
    cur().marcas.push({ id: uid(), x: f.xf, y: f.yf, kind: markSel.kind, val: markSel.val });
    hintDismissed = true; renderMarks(); saveProject();
  }

  // ---- anotações / post-its no mapa ----
  function noteWidth(n, fs) { return Math.min(W * 0.32, Math.max(fs * 6, fs * (String(n.text || '').length > 26 ? 12 : 8))); }
  function noteBaseFs() { return Math.max(8, W * 0.0125); }
  function renderNotes() {
    noteLayer.destroyChildren();
    const list = (cur() ? cur().notas : []) || [], baseFs = noteBaseFs();
    list.forEach(n => {
      if (noteEdit && noteEdit.id === n.id) return; // a nota em edição é a caixa HTML por cima
      const fs = baseFs * (n.size || 1);
      const canDrag = !state.present && state.tool === 'select';
      const g = new Konva.Group({ x: n.x * W, y: n.y * H, draggable: canDrag, name: 'note-' + n.id });
      const label = new Konva.Label();
      const nCol = n.color || '#f0c66b';
      label.add(new Konva.Tag({ fill: darkTint(nCol), stroke: nCol, strokeWidth: 1.4, cornerRadius: 5, shadowColor: '#000', shadowBlur: 8, shadowOpacity: 0.5, shadowOffsetY: 2 }));
      // auto-ajuste: sem largura fixa (a caixa acompanha o texto); só quebra linha
      // quando fica largo demais (acima de ~30% do mapa).
      const maxW = W * 0.3;
      const txt = new Konva.Text({ text: n.text || '…', fontFamily: 'Barlow, sans-serif', fontStyle: '600', fontSize: fs, fill: '#f7e6bf', padding: Math.max(4, fs * 0.45), lineHeight: 1.25 });
      if (txt.width() > maxW) txt.width(maxW);
      label.add(txt);
      g.add(label);
      g.on('click tap', e => { e.cancelBubble = true; if (linkTempFrom) return; lastPicked = { kind: 'note', id: n.id }; g.moveToTop(); noteLayer.batchDraw(); if (!state.present) editNoteInline(n); });
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
    editNoteInline(n);
  }
  // edição INLINE da nota (caixa HTML posicionada em cima dela, sem abrir aba)
  let noteEdit = null, noteEditEl = null;
  function closeNoteEdit() { if (noteEditEl) { noteEditEl.remove(); noteEditEl = null; } noteEdit = null; renderNotes(); }
  function editNoteInline(n) {
    if (state.present || !mapPanel) return;
    if (noteEdit && noteEdit.id === n.id) return;
    closeNoteEdit(); closeIconMenu(); hidePopover();
    noteEdit = n;
    const s = stage.scaleX() || 1, baseFs = noteBaseFs();
    const px = stageWrap.offsetLeft + stage.x() + n.x * W * s, py = stageWrap.offsetTop + stage.y() + n.y * H * s;
    const wrap = document.createElement('div'); wrap.className = 'note-edit'; wrap.style.left = px + 'px'; wrap.style.top = py + 'px';
    const bar = document.createElement('div'); bar.className = 'ne-bar';
    bar.innerHTML = '<button type="button" data-a="dec" title="Menor">A−</button><button type="button" data-a="inc" title="Maior">A＋</button><button type="button" data-a="color" class="ne-col" title="Cor da nota (usa a cor selecionada na barra)"></button><button type="button" data-a="del" class="ne-del" title="Excluir">✕</button>';
    const ta = document.createElement('textarea'); ta.className = 'ne-ta'; ta.value = n.text || ''; ta.placeholder = t('notePh'); ta.rows = 2;
    wrap.appendChild(bar); wrap.appendChild(ta); mapPanel.appendChild(wrap); noteEditEl = wrap;
    const applyColor = () => { const c = n.color || '#f0c66b'; ta.style.borderColor = c; const sw = bar.querySelector('.ne-col'); if (sw) sw.style.background = state.drawColor; };
    const applySize = () => { const fs = baseFs * (n.size || 1) * s; ta.style.fontSize = fs + 'px'; ta.style.width = (Math.min(W * 0.3, Math.max(fs * 7, W * 0.16)) ) + 'px'; ta.style.padding = Math.max(4, baseFs * (n.size || 1) * 0.45) * s + 'px'; };
    applySize(); applyColor();
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 20);
    ta.addEventListener('input', () => { n.text = ta.value; applySize(); saveProject(); });
    ta.addEventListener('keydown', e => { if (e.key === 'Escape') { ta.blur(); } });
    bar.addEventListener('mousedown', e => e.preventDefault());   // não tira o foco do textarea ao clicar nos botões
    bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a;
      if (a === 'del') { pushUndo(); cur().notas = (cur().notas || []).filter(x => x.id !== n.id); closeNoteEdit(); saveProject(); return; }
      if (a === 'color') { pushUndo(); n.color = state.drawColor; applyColor(); saveProject(); return; }
      pushUndo(); n.size = Math.max(0.4, Math.min(2.0, (n.size || 1) * (a === 'inc' ? 1.18 : 0.82))); applySize(); saveProject();
    });
    ta.addEventListener('blur', () => setTimeout(() => { if (noteEditEl && noteEditEl.contains(document.activeElement)) return; closeNoteEdit(); saveProject(); }, 120));
  }

  // ---- cenários ----
  function makeSceneCard(s, num, isVar) {
    const card = document.createElement('div'); card.className = 'scene' + (isVar ? ' scene-var' : '') + (s.id === state.currentId ? ' active' : ''); card.dataset.id = s.id;
    if (!isVar) card.setAttribute('draggable', 'true');
    const meta = s.condicao ? '<span class="sc-cond">▸ ' + esc(s.condicao) + '</span>' : '<span class="sc-meta">' + (isVar ? (t('variation') + (s.varLabel ? ' ' + esc(s.varLabel) : '')) : esc(s.fase || '')) + '</span>';
    const timeBadge = s.tempo ? '<span class="sc-time">⏱ ' + esc(s.tempo) + '</span>' : '';
    card.innerHTML = '<div class="sc-top"><span class="sc-idx' + (isVar ? ' sc-idx-var' : '') + '">' + num + '</span>' + timeBadge + '<span class="sc-name">' + esc(s.nome || 'Cenário') + '</span></div>' + meta + '<button class="sc-del" title="Excluir" aria-label="Excluir">✕</button>';
    card.addEventListener('click', e => { if (e.target.classList.contains('sc-del')) return; selectScenario(s.id); });
    card.querySelector('.sc-del').addEventListener('click', e => { e.stopPropagation(); deleteScenario(s.id); });
    if (!isVar) {
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/scene', s.id); dragRef._id = s.id; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); clearHints(); });
      card.addEventListener('dragover', e => { if (!Array.from(e.dataTransfer.types).includes('text/scene') || dragRef._id === s.id) return; e.preventDefault(); clearHints(); card.classList.add(e.offsetX < card.offsetWidth / 2 ? 'drop-before' : 'drop-after'); });
      card.addEventListener('drop', e => { if (!Array.from(e.dataTransfer.types).includes('text/scene')) return; e.preventDefault(); const id = dragRef._id; if (id && id !== s.id) reorder(id, s.id, e.offsetX < card.offsetWidth / 2); });
    }
    rail.appendChild(card);
  }
  function renderRail() {
    rail.innerHTML = '';
    const byId = new Map(state.scenarios.map(s => [s.id, s]));
    const mains = state.scenarios.filter(s => !(s.varOf && byId.has(s.varOf)));
    let ord = 0;
    mains.forEach(m => {
      ord++; makeSceneCard(m, String(ord), false);
      state.scenarios.filter(x => x.varOf === m.id).forEach((v, vi) => makeSceneCard(v, ord + String.fromCharCode(97 + Math.min(25, vi)), true));
    });
    const a = rail.querySelector('.scene.active'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    buildSceneSel();
  }
  // seletor compacto de cena no cabeçalho (mesma ordem da régua: base + variações)
  function buildSceneSel() {
    const sel = $('sceneSel'); if (!sel) return;
    const byId = new Map(state.scenarios.map(s => [s.id, s]));
    const mains = state.scenarios.filter(s => !(s.varOf && byId.has(s.varOf)));
    let html = '', ord = 0;
    mains.forEach(m => { ord++; const num = String(ord); html += '<option value="' + m.id + '">' + esc(num + '. ' + (m.nome || 'Cena') + (m.tempo ? ' · ' + m.tempo : '')) + '</option>';
      state.scenarios.filter(x => x.varOf === m.id).forEach((v, vi) => { const vn = num + String.fromCharCode(97 + Math.min(25, vi)); html += '<option value="' + v.id + '">' + esc('   ' + vn + '. ' + (v.nome || 'Var') + (v.tempo ? ' · ' + v.tempo : '')) + '</option>'; }); });
    sel.innerHTML = html; sel.value = state.currentId;
  }
  const dragRef = {}; function clearHints() { rail.querySelectorAll('.drop-before,.drop-after').forEach(c => c.classList.remove('drop-before', 'drop-after')); }
  function selectScenario(id) { if (id === state.currentId) return; if (linkTempFrom) cancelLink(); closeIconMenu(); hidePopover(); state.currentId = id; renderRail(); loadScenarioIntoUI(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); renderFocus(); renderSidebar(); updateMini(); if (!objPanel.hidden) renderObjPanel(); if (state.present) updatePresentUI(); syncCanvasFill(cur()); applySceneView(cur()); updateZoomSaveBtn(); saveProject(); if (LIVE.on) liveApplyLock(); }
  function loadScenarioIntoUI() { const s = cur(); if (!s) return; nameInput.value = s.nome || ''; if (timeInput) timeInput.value = s.tempo || ''; condInput.value = s.condicao || ''; noteInput.value = s.nota || ''; { const nw = $('noteWrap'), nt = $('noteTgl'); const has = !!(s.nota && s.nota.trim()); if (nw) nw.hidden = !has; if (nt) nt.classList.toggle('on', has); } updateMini(); }
  function insertAfterCurrent(s) { const i = curIndex(); state.scenarios.splice(i < 0 ? state.scenarios.length : i + 1, 0, s); saveProject(); }
  function addScenarioBlank() { const s = newScenario({ fase: t('sceneBtn'), nome: t('sceneBtn') + ' ' + (state.scenarios.length + 1) }); insertAfterCurrent(s); selectScenario(s.id); }
  function cloneSceneData(s, extra) {
    const memMap = {}; const destacados = s.destacados.map(d => { const nid = uid(); memMap[d.id] = nid; return Object.assign({}, d, { id: nid }); });
    const remap = ref => { if (typeof ref === 'string' && ref.indexOf('mem:') === 0) { const ni = memMap[ref.slice(4)]; return ni ? 'mem:' + ni : null; } return ref; };
    const links = (s.links || []).map(l => { const a = remap(l.a), b = remap(l.b); return (a && b) ? { id: uid(), a, b } : null; }).filter(Boolean);
    return newScenario(Object.assign({ fase: s.fase, nome: s.nome, condicao: s.condicao, tempo: s.tempo || '', fill: s.fill ? true : undefined, tokens: s.tokens.map(t => { const o = { pt: t.pt, xf: t.xf, yf: t.yf }; if (t.hp != null) o.hp = t.hp; return o; }), desenhos: JSON.parse(JSON.stringify(s.desenhos)), marcas: (s.marcas || []).map(m => Object.assign({}, m, { id: uid() })), objetivos: Object.assign({}, s.objetivos), objetivoPos: JSON.parse(JSON.stringify(s.objetivoPos || {})), destacados, links, objHp: Object.assign({}, s.objHp || {}), objBuffs: JSON.parse(JSON.stringify(s.objBuffs || {})), treeCarry: Object.fromEntries(Object.entries(s.treeCarry || {}).map(([k, v]) => [k, v.map(id => memMap[id] || id)])), notas: (s.notas || []).map(n => Object.assign({}, n, { id: uid() })), enemies: (s.enemies || []).map(e => Object.assign({}, e, { id: uid() })), focus: Array.isArray(s.focus) ? s.focus.map(function(f){ return Object.assign({}, f); }) : (s.focus ? [Object.assign({}, s.focus)] : []), nota: s.nota }, extra || {}));
  }
  function duplicateCurrent() { insertAfterCurrent(cloneSceneData(cur())); selectScenario(state.scenarios[curIndex() + 1].id); }
  function createVariation() {
    const s = cur(), parentId = s.varOf || s.id;
    const sibs = state.scenarios.filter(x => x.varOf === parentId);
    const label = String.fromCharCode(65 + Math.min(25, sibs.length)); // A, B, C...
    const v = cloneSceneData(s, { varOf: parentId, varLabel: label });
    const parentIdx = state.scenarios.findIndex(x => x.id === parentId);
    let insertIdx = parentIdx < 0 ? state.scenarios.length - 1 : parentIdx;
    for (let i = insertIdx + 1; i < state.scenarios.length && state.scenarios[i].varOf === parentId; i++) insertIdx = i;
    state.scenarios.splice(insertIdx + 1, 0, v); saveProject(); selectScenario(v.id);
  }
  async function deleteScenario(id) {
    const i = state.scenarios.findIndex(s => s.id === id); if (i < 0) return;
    const target = state.scenarios[i];
    const kids = target.varOf ? [] : state.scenarios.filter(s => s.varOf === id); // apagar um cenário-base leva suas variações junto
    const remove = new Set([id, ...kids.map(k => k.id)]);
    if (state.scenarios.length - remove.size < 1) { toast(t('needOneScene')); return; }
    const msg = kids.length ? 'Excluir "' + (target.nome || '') + '" e suas ' + kids.length + ' variação(ões)?' : 'Excluir o cenário "' + (target.nome || '') + '"?';
    if (!(isPristine(target) && !kids.length) && !await askConfirm(msg)) return;
    state.scenarios = state.scenarios.filter(s => !remove.has(s.id));
    if (remove.has(state.currentId)) state.currentId = state.scenarios[Math.max(0, Math.min(i, state.scenarios.length - 1))].id;
    renderRail(); loadScenarioIntoUI(); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); renderFocus(); renderSidebar(); saveProject();
  }
  function reorder(dragIdV, targetId, before) { const from = state.scenarios.findIndex(s => s.id === dragIdV); if (from < 0) return; const [m] = state.scenarios.splice(from, 1); let to = state.scenarios.findIndex(s => s.id === targetId); if (to < 0) state.scenarios.push(m); else state.scenarios.splice(before ? to : to + 1, 0, m); renderRail(); saveProject(); }
  function seedStandard() { const key = e => (e.nome || '') + '|' + (e.condicao || ''); if (state.scenarios.length === 1 && isPristine(state.scenarios[0])) state.scenarios = []; const have = new Set(state.scenarios.map(key)); CFG.fasesPadrao.forEach(f => { if (!have.has(key(f))) state.scenarios.push(newScenario({ fase: f.fase, nome: f.nome, condicao: f.condicao })); }); state.currentId = state.scenarios[0].id; renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderTokens(); renderSidebar(); saveProject(); }
  function syncCard() { const s = cur(), card = rail.querySelector('.scene.active'); if (!card) return; card.querySelector('.sc-name').textContent = s.nome || 'Cenário'; const top = card.querySelector('.sc-top'); let timeEl = card.querySelector('.sc-time'); if (s.tempo) { if (!timeEl) { timeEl = document.createElement('span'); timeEl.className = 'sc-time'; const nameEl = top.querySelector('.sc-name'); top.insertBefore(timeEl, nameEl); } timeEl.textContent = '⏱ ' + s.tempo; } else if (timeEl) { timeEl.remove(); } const condEl = card.querySelector('.sc-cond'), metaEl = card.querySelector('.sc-meta'); if (s.condicao) { if (condEl) condEl.textContent = '▸ ' + s.condicao; else { const el = document.createElement('span'); el.className = 'sc-cond'; el.textContent = '▸ ' + s.condicao; if (metaEl) metaEl.replaceWith(el); else card.appendChild(el); } } else if (condEl) { const el = document.createElement('span'); el.className = 'sc-meta'; el.textContent = s.fase || ''; condEl.replaceWith(el); } updateMini(); }
  function updateMini() { const s = cur(); if (s) miniName.textContent = (curIndex() + 1) + '. ' + (s.nome || 'Cenário') + (s.tempo ? ' · ⏱ ' + s.tempo : '') + (s.condicao ? ' · ' + s.condicao : ''); const i = curIndex(); const mp = $('miniPrev'), mn = $('miniNext'); if (mp) mp.disabled = i <= 0; if (mn) mn.disabled = i >= state.scenarios.length - 1; updateSceneHud(); }
  // título grande do cenário + timer (antes do título) + condição e descrição como subtítulos
  function updateSceneHud() {
    const s = cur(); const tt = $('shTitle'), tm = $('shTime'), cd = $('shCond'), ds = $('shDesc'); if (!tt || !tm) return;
    if (!s) { tt.textContent = ''; tm.hidden = true; if (cd) cd.hidden = true; if (ds) ds.hidden = true; return; }
    tt.textContent = s.nome || t('sceneBtn');
    if (s.tempo) { tm.hidden = false; tm.textContent = '⏱ ' + s.tempo; } else tm.hidden = true;
    if (cd) { if (s.condicao) { cd.hidden = false; cd.textContent = '▸ ' + s.condicao; } else cd.hidden = true; }
    if (ds) { const n = (s.nota || '').trim(); if (n) { ds.hidden = false; ds.textContent = n; } else ds.hidden = true; }
  }
  function toggleHud() { const sh = $('sceneHud'); if (!sh) return; const off = sh.style.display === 'none'; sh.style.display = off ? '' : 'none'; const b = $('hudTgl'); if (b) b.classList.toggle('on', off); try { localStorage.setItem('gp-hud', off ? '1' : '0'); } catch (e) {} }

  // ---- apresentação ----
  function enterPresent() { if (linkTempFrom) cancelLink(); closeIconMenu(); state.present = true; document.body.classList.add('present'); presentBtn.style.display = 'none'; exitBtn.style.display = ''; hidePopover(); toggleObjPanel(false); setTool('select'); renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); updatePresentUI(); try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) {} setTimeout(fit, 60); }
  function exitPresent() { state.present = false; document.body.classList.remove('present'); presentBtn.style.display = ''; exitBtn.style.display = 'none'; renderDrawings(); renderMarks(); renderObjectives(); renderTokens(); try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {} setTimeout(fit, 60); }
  function updatePresentUI() { const s = cur(); if (!s) return; const i = curIndex(), n = state.scenarios.length; pbTitle.textContent = s.nome || 'Cenário'; if (pbTime) { if (s.tempo) { pbTime.hidden = false; pbTime.textContent = '⏱ ' + s.tempo; } else pbTime.hidden = true; } if (s.condicao) { pbCond.hidden = false; pbCond.textContent = s.condicao; } else pbCond.hidden = true; pbProg.textContent = (i + 1) + ' / ' + n; pnPhase.textContent = s.fase || s.nome || 'Fase'; if (s.condicao) { pnBadge.hidden = false; pnBadge.textContent = s.condicao; } else pnBadge.hidden = true; const nota = (s.nota || '').trim(); pnText.textContent = nota || 'Sem nota neste cenário.'; pnText.classList.toggle('empty', !nota); prevBtn.disabled = i <= 0; nextBtn.disabled = i >= n - 1; }
  function go(delta) { const j = curIndex() + delta; if (j < 0 || j >= state.scenarios.length) return; selectScenario(state.scenarios[j].id); }

  // ---- roster parse + modal ----
  function mapClass(c) { return CFG.classMap[c] || 'DPS'; }
  function normalizeRole(t) { t = (t || '').toLowerCase(); if (/tank|tanque/.test(t)) return 'Tank'; if (/heal|cura/.test(t)) return 'Healer'; return 'DPS'; }
  function parseRoster(text) { text = (text || '').trim(); if (!text) return []; if (text[0] === '{' || text[0] === '[') { try { const d = JSON.parse(text); const arr = Array.isArray(d) ? d : d.signUps; if (Array.isArray(arr)) return parseRaidHelper(arr); } catch (e) {} } return parseLines(text); }
  function parseRaidHelper(signUps) { const out = []; signUps.forEach(s => { const cls = s.className || s.cClassName || ''; let status = 'primary', ausente = false, reserva = false, classe = cls, funcao = 'DPS'; if (/^absence$/i.test(cls)) { status = 'absence'; ausente = true; classe = 'Absence'; } else if (/^bench$/i.test(cls)) { status = 'bench'; reserva = true; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); } else if (/^late$/i.test(cls)) { status = 'late'; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); } else if (/^tentative$/i.test(cls)) { status = 'tentative'; reserva = true; classe = s.specName || s.cSpecName || '—'; funcao = mapClass(classe); } else { classe = cls; funcao = mapClass(cls); } out.push({ id: uid(), nome: s.name || '—', classe, funcao, status, ausente, reserva, pt: null, nota: s.note || '', disc: (s.userId != null && /^\d{5,20}$/.test(String(s.userId))) ? String(s.userId) : undefined }); }); const rank = p => (p.ausente ? 3 : p.reserva ? 2 : 1), fo = f => ({ Tank: 0, Healer: 1, DPS: 2 }[f] ?? 3); out.sort((a, b) => rank(a) - rank(b) || fo(a.funcao) - fo(b.funcao) || a.nome.localeCompare(b.nome)); return out; }
  function parseLines(text) { const out = []; text.split(/\n+/).forEach(line => { const m = line.match(/^\s*(PT\s?\d+|reservas?|bench|banco|sem\s?pt)\s*[—:\-–]\s*(.+)$/i); if (!m) return; const reserva = /reserv|bench|banco/i.test(m[1]), ptm = m[1].match(/PT\s?(\d+)/i), pt = ptm ? 'PT' + ptm[1] : null; m[2].split(/[,;]+/).forEach(part => { part = part.trim(); if (!part) return; const mm = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/); const nome = (mm ? mm[1] : part).trim(); const funcao = normalizeRole(mm ? mm[2] : ''); if (nome) out.push({ id: uid(), nome, classe: funcao, funcao, status: reserva ? 'bench' : 'primary', ausente: false, reserva, pt: pt && PT_IDS.includes(pt) ? pt : null, nota: '' }); }); }); return out; }
  // Mescla o roster colado com o rascunho atual, sem resetar o board:
  //  · quem já está no rascunho E no novo JSON é mantido (PT, tarjas, flags);
  //  · quem está no novo JSON e não no rascunho entra como novo (reserva);
  //  · quem está no rascunho e NÃO está no novo JSON é removido;
  //  · se alguém passou a ser "ausente" no novo JSON, sai da PT.
  // ---- eixo JOGO (G1..G5 da mesma guerra) ----
  // Regra de propriedade, e ela é o contrato inteiro:
  //   · player.pt / player.reserva = verdade VIVA do jogo atual (ninguém mais escreve nisso).
  //   · jogos[].escalacao        = DERIVADA, materializada só em saveProject() e ao trocar
  //                                de jogo. Nunca editada direto por outro código.
  // Assim os ~100 pontos que mexem em p.pt seguem intactos e não há o que dessincronizar.
  function sanitizeJogo(j) {
    const esc = {}, src = (j && j.escalacao && typeof j.escalacao === 'object') ? j.escalacao : {};
    Object.keys(src).forEach(k => { const v = src[k] || {}; esc[String(k)] = { pt: PT_IDS.includes(v.pt) ? v.pt : null, reserva: !!v.reserva }; });
    return { id: (j && j.id) || uid(), nome: String((j && j.nome) || 'G1').slice(0, 24), escalacao: esc };
  }
  function serializeEscalacao() {
    const esc = {};
    state.roster.forEach(p => { if (p.pt || p.reserva) esc[p.id] = { pt: p.pt || null, reserva: !!p.reserva }; });
    return esc;
  }
  function stashJogoAtual() {
    const j = state.jogos.find(x => x.id === state.jogoAtual);
    if (j) j.escalacao = serializeEscalacao();
  }
  function applyEscalacao(j) {
    const esc = (j && j.escalacao) || {};
    state.roster.forEach(p => {
      const e = esc[p.id];
      p.pt = (e && PT_IDS.includes(e.pt)) ? e.pt : null;
      p.reserva = !!(e && e.reserva);
      // Escalado neste jogo => JOGA, mesmo que o signup diga Absence/Late/Bench. Sem isto
      // membersOf() — que filtra !ausente — esconderia da PT justamente quem a staff já
      // confirmou por fora do raid-helper. O selo signupAusente guarda a divergência.
      if (e && e.pt && p.ausente) { p.ausente = false; p.signupAusente = true; }
    });
  }
  // Tira da escalação de TODOS os jogos quem saiu do roster. Roda no único ponto onde o
  // roster commita (applyRosterDraft), senão id removido vira órfão em 10 jogos.
  function pruneJogos() {
    const vivos = new Set(state.roster.map(p => p.id));
    state.jogos.forEach(j => { Object.keys(j.escalacao).forEach(k => { if (!vivos.has(k)) delete j.escalacao[k]; }); });
  }
  // Plano antigo (sem jogos): o primeiro uso adota a escalação que já está no roster como G1.
  function ensureJogos() {
    if (state.jogos.length) return;
    const j = sanitizeJogo({ nome: 'G1', escalacao: serializeEscalacao() });
    state.jogos = [j]; state.jogoAtual = j.id;
  }
  function switchJogo(id) {
    if (!id || id === state.jogoAtual) return;
    const alvo = state.jogos.find(x => x.id === id);
    if (!alvo) return;
    stashJogoAtual();
    state.jogoAtual = id;
    applyEscalacao(alvo);
    saveProject(); renderSidebar(); renderTokens(); renderJogos();
  }
  // dup=true copia a escalação do jogo atual — entre G1 e G2 mudam 1 a 3 pessoas, então
  // duplicar-e-ajustar é o fluxo real; montar do zero 5 vezes não é.
  function addJogo(dup) {
    ensureJogos(); stashJogoAtual();
    const base = state.jogos.find(x => x.id === state.jogoAtual);
    const j = sanitizeJogo({ nome: 'G' + (state.jogos.length + 1), escalacao: (dup && base) ? JSON.parse(JSON.stringify(base.escalacao)) : {} });
    state.jogos.push(j); state.jogoAtual = j.id;
    applyEscalacao(j);
    saveProject(); renderSidebar(); renderTokens(); renderJogos();
  }
  function delJogo(id) {
    const i = state.jogos.findIndex(x => x.id === id);
    if (i < 0 || state.jogos.length <= 1) return;
    state.jogos.splice(i, 1);
    if (state.jogoAtual === id) { state.jogoAtual = state.jogos[Math.max(0, i - 1)].id; applyEscalacao(state.jogos.find(x => x.id === state.jogoAtual)); }
    saveProject(); renderSidebar(); renderTokens(); renderJogos();
  }
  // Listener no CONTÊINER, não nos botões: autoSyncRoster() re-renderiza esta barra alguns
  // segundos depois do load, e um clique que caísse nessa janela morria junto com o botão
  // substituído — dava a impressão de que "o primeiro clique não funciona".
  function wireJogoBar(wrap) {
    if (wrap.dataset.wired) return;
    wrap.dataset.wired = '1';
    wrap.addEventListener('click', e => {
      const b = e.target.closest('.jogo-chip'); if (!b || !wrap.contains(b)) return;
      const a = b.dataset.act;
      if (a === 'add') addJogo(!e.altKey);
      else if (a === 'grade') openGrade();
      else if (a === 'del') { const j = state.jogos.find(x => x.id === state.jogoAtual); if (j && confirm(t('jogoDelAsk') + ' ' + j.nome + '?')) delJogo(state.jogoAtual); }
      else if (a) switchJogo(a);
    });
    wrap.addEventListener('dblclick', e => {
      const b = e.target.closest('.jogo-chip'); if (!b) return;
      const j = state.jogos.find(x => x.id === b.dataset.act); if (!j) return;
      const n = prompt(t('jogoName'), j.nome);
      if (n && n.trim()) { j.nome = n.trim().slice(0, 24); saveProject(); renderJogos(); }
    });
  }
  function renderJogos() {
    const wrap = $('jogoBar');
    if (!wrap) return;
    // Eixo de jogos é OPT-IN: sem jogos no plano, a barra nem existe (o CSS esconde :empty)
    // e a guerra se comporta como sempre. Ativa-se pelo menu "…" → Vários jogos nesta guerra.
    if (!state.jogos.length) { wrap.innerHTML = ''; return; }
    wireJogoBar(wrap);
    const chip = (act, txt, cls, tip) => '<button type="button" class="jogo-chip' + (cls ? ' ' + cls : '') + '" data-act="' + esc(act) + '" title="' + esc(tip || txt) + '">' + esc(txt) + '</button>';
    let h = state.jogos.map(j => chip(j.id, j.nome, j.id === state.jogoAtual ? 'on' : '', j.nome + (j.id === state.jogoAtual ? ' (atual)' : ''))).join('');
    h += chip('add', '+', 'jogo-add', t('jogoDup'));
    if (state.jogos.length > 1) h += chip('grade', '▦', 'jogo-grade', t('gradeTip')) + chip('del', '×', 'jogo-del', t('jogoDel'));
    wrap.innerHTML = h;
  }
  // ---- grade do fim de semana ----
  // Uma linha por jogador, agrupada pela PT do jogo ATUAL; cada coluna é um jogo e diz em que
  // PT ele está lá (ou "—"). A comparação fica estável mesmo quando alguém troca de time entre
  // jogos — que é exatamente o que a planilha da staff esconde, porque lá o nome muda de lugar.
  const FO = f => ({ Tank: 0, Healer: 1, DPS: 2 }[f] != null ? { Tank: 0, Healer: 1, DPS: 2 }[f] : 3);
  let gradeMode = 'sheet'; // 'pt' = quem está em cada PT (visão de quem MONTA) · 'player' = onde cada um joga
  // Ambos os modos devolvem a mesma forma — { jogos, secs:[{ pt, linhas:[{ p, cels }] }] } — para
  // que a tabela HTML e o PNG leiam de um lugar só.
  function gradeData() {
    ensureJogos(); stashJogoAtual();
    const byId = new Map(state.roster.map(p => [p.id, p]));
    const atual = state.jogos.find(x => x.id === state.jogoAtual) || state.jogos[0];
    const usados = new Set();
    state.jogos.forEach(j => Object.keys(j.escalacao).forEach(id => { if (byId.has(id) && j.escalacao[id].pt) usados.add(id); }));
    const ord = (a, b) => FO(byId.get(a).funcao) - FO(byId.get(b).funcao) || byId.get(a).nome.localeCompare(byId.get(b).nome);
    const secs = [];
    if (gradeMode === 'sheet') {
      // Formato da planilha: coluna = jogo, célula = NOME. Cada bloco de PT tem tantas linhas
      // quanto o maior time daquele PT entre os jogos, e cada coluna é lida de cima a baixo
      // como a escalação daquele jogo. As linhas NÃO se alinham entre colunas de propósito —
      // é assim que a staff lê hoje, e alinhar exigiria repetir nome ou deixar buraco.
      // O destaque marca quem não estava naquele PT no jogo anterior (entrou).
      PT_IDS.forEach(pid => {
        const porJogo = state.jogos.map(j => [...usados]
          .filter(id => { const e = j.escalacao[id]; return e && e.pt === pid && !e.reserva; })
          .sort(ord).map(id => byId.get(id)));
        const alt = Math.max.apply(null, porJogo.map(c => c.length).concat([0]));
        if (!alt) return;
        const linhas = [];
        for (let i = 0; i < alt; i++) {
          linhas.push({
            label: String(i + 1), cor: null,
            cels: porJogo.map((col, j) => {
              const p = col[i]; if (!p) return null;
              const antes = j > 0 && porJogo[j - 1].some(x => x.id === p.id);
              return { txt: p.nome, cor: roleColor(p.funcao), novo: j > 0 && !antes };
            })
          });
        }
        secs.push({ pt: pid, linhas });
      });
    } else if (gradeMode === 'pt') {
      // Bloco = PT. Linha = cada jogador que passa por essa PT em ALGUM jogo (união, não só o
      // jogo atual) — assim a linha não escorrega quando alguém entra ou sai, e a célula diz
      // se ele está lá naquele jogo. Quem troca de PT aparece nos dois blocos, o que é o dado.
      const cel = (j, id, pid) => { const e = j.escalacao[id]; return (e && e.pt === pid) ? (e.reserva ? t('gradeRes') : t('gradeIn')) : null; };
      PT_IDS.forEach(pid => {
        const ids = [...usados].filter(id => state.jogos.some(j => { const e = j.escalacao[id]; return e && e.pt === pid; })).sort(ord);
        if (ids.length) secs.push({ pt: pid, linhas: ids.map(id => ({ label: byId.get(id).nome, cor: roleColor(byId.get(id).funcao), cels: state.jogos.map(j => cel(j, id, pid)) })) });
      });
    } else {
      const cel = (j, id) => { const e = j.escalacao[id]; return (e && e.pt) ? (e.reserva ? e.pt + '·r' : e.pt) : null; };
      const linhaDe = id => ({ label: byId.get(id).nome, cor: roleColor(byId.get(id).funcao), cels: state.jogos.map(j => cel(j, id)) });
      PT_IDS.forEach(pid => {
        const ids = [...usados].filter(id => { const e = atual.escalacao[id]; return e && e.pt === pid; }).sort(ord);
        if (ids.length) secs.push({ pt: pid, linhas: ids.map(linhaDe) });
      });
      const fora = [...usados].filter(id => { const e = atual.escalacao[id]; return !e || !e.pt; }).sort(ord);
      if (fora.length) secs.push({ pt: t('gradeOut'), linhas: fora.map(linhaDe) });
    }
    return { jogos: state.jogos.map(j => j.nome), secs };
  }
  function renderGrade() {
    const body = $('gradeBody'); if (!body) return;
    const d = gradeData();
    let h = '<table class="grade-tb"><thead><tr><th>' + esc(gradeMode === 'sheet' ? t('gradeColSlot') : (gradeMode === 'pt' ? t('gradeColPt') : t('player'))) + '</th>';
    d.jogos.forEach(n => { h += '<th>' + esc(n) + '</th>'; });
    h += '</tr></thead><tbody>';
    d.secs.forEach(s => {
      h += '<tr class="g-sec"><td colspan="' + (d.jogos.length + 1) + '">' + esc(s.pt) + '</td></tr>';
      s.linhas.forEach(l => {
        h += '<tr><td class="g-nm' + (l.cor ? '' : ' g-slot') + '" style="--rc:' + (l.cor || 'var(--line-soft)') + '">' + esc(l.label) + '</td>';
        l.cels.forEach((c, i) => {
          // célula é string nos modos de presença; objeto {txt,cor,novo} no modo planilha
          if (c && typeof c === 'object') { h += '<td class="' + (c.novo ? 'g-ch' : '') + '" style="border-left:3px solid ' + c.cor + '">' + esc(c.txt) + '</td>'; return; }
          const mudou = i > 0 && c !== l.cels[i - 1];
          h += '<td class="' + (mudou ? 'g-ch' : (c ? '' : 'g-out')) + '">' + esc(c || '—') + '</td>';
        });
        h += '</tr>';
      });
    });
    return body.innerHTML = h + '</tbody></table>', d;
  }
  // PNG desenhado no canvas 2D de propósito: sem dependência externa e com resultado idêntico
  // em qualquer navegador. foreignObject/SVG quebraria com as fontes embutidas em base64.
  async function gradePNG() {
    const d = gradeData();
    const NW = gradeMode === 'sheet' ? 70 : 200, CW = gradeMode === 'sheet' ? 168 : 96, RH = 24, HH = 32, PAD = 18, dpr = 2;
    let rows = 0; d.secs.forEach(s => { rows += 1 + s.linhas.length; });
    const W = PAD * 2 + NW + CW * d.jogos.length, H = PAD * 2 + HH + RH * rows + 22;
    const cv = document.createElement('canvas'); cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    g.fillStyle = '#0b0e14'; g.fillRect(0, 0, W, H);
    g.textBaseline = 'middle';
    let y = PAD;
    g.fillStyle = '#161a23'; g.fillRect(PAD, y, NW + CW * d.jogos.length, HH);
    g.fillStyle = '#d9a441'; g.font = 'bold 11px system-ui,sans-serif';
    g.fillText((gradeMode === 'sheet' ? t('gradeColSlot') : (gradeMode === 'pt' ? t('gradeColPt') : t('player'))).toUpperCase(), PAD + 10, y + HH / 2);
    d.jogos.forEach((n, i) => g.fillText(String(n).toUpperCase(), PAD + NW + CW * i + 10, y + HH / 2));
    y += HH;
    d.secs.forEach(s => {
      g.fillStyle = '#161a23'; g.fillRect(PAD, y, NW + CW * d.jogos.length, RH);
      g.fillStyle = '#8b93a7'; g.font = 'bold 10px system-ui,sans-serif';
      g.fillText(String(s.pt).toUpperCase(), PAD + 10, y + RH / 2); y += RH;
      s.linhas.forEach(l => {
        if (l.cor) { g.fillStyle = l.cor; g.fillRect(PAD, y, 3, RH); }
        g.fillStyle = l.cor ? '#e8ecf4' : '#5a6274'; g.font = '12px system-ui,sans-serif';
        let nm = String(l.label); while (g.measureText(nm).width > NW - 20 && nm.length > 3) nm = nm.slice(0, -2) + '…';
        g.fillText(nm, PAD + 10, y + RH / 2);
        l.cels.forEach((c, i) => {
          const x0 = PAD + NW + CW * i;
          // modo planilha: célula é {txt,cor,novo} e mostra o nome do jogador
          if (c && typeof c === 'object') {
            if (c.novo) { g.fillStyle = 'rgba(217,164,65,.16)'; g.fillRect(x0, y, CW, RH); }
            g.fillStyle = c.cor; g.fillRect(x0, y, 2, RH);
            g.fillStyle = c.novo ? '#d9a441' : '#e8ecf4';
            g.font = (c.novo ? 'bold ' : '') + '12px system-ui,sans-serif';
            let tx = c.txt; while (g.measureText(tx).width > CW - 16 && tx.length > 3) tx = tx.slice(0, -2) + '…';
            g.fillText(tx, x0 + 8, y + RH / 2);
            return;
          }
          const mudou = i > 0 && c !== l.cels[i - 1];
          if (mudou) { g.fillStyle = 'rgba(217,164,65,.16)'; g.fillRect(x0, y, CW, RH); }
          g.fillStyle = mudou ? '#d9a441' : (c ? '#e8ecf4' : '#5a6274');
          g.font = (mudou ? 'bold ' : '') + '12px system-ui,sans-serif';
          g.fillText(c || '—', x0 + 10, y + RH / 2);
        });
        g.strokeStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(PAD, y + RH + .5); g.lineTo(W - PAD, y + RH + .5); g.stroke();
        y += RH;
      });
    });
    g.fillStyle = '#5a6274'; g.font = '10px system-ui,sans-serif';
    g.fillText('Game Plan · ' + d.jogos.length + ' ' + (d.jogos.length === 1 ? 'jogo' : 'jogos'), PAD, H - PAD + 2);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (!blob) { toast(t('gradeFail') || 'Não consegui gerar a imagem'); return; }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast(t('gradeCopied') || 'Imagem copiada ✓ — cole no Discord');
    } catch (e) {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gameplan-jogos.png';
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast(t('gradeSaved') || 'Imagem baixada ✓');
    }
  }
  function openGrade() { const m = $('gradeModal'); if (!m) return; renderGrade(); m.hidden = false; }
  // Só vale perguntar se há algo a perder. Roster preenchido conta: o app antes só olhava
  // cenário modificado, e um plano cujo trabalho está todo no board passava por "vazio".
  function planoTemConteudo() { return (state.roster && state.roster.length > 0) || state.scenarios.some(s => !isPristine(s)) || state.jogos.length > 1; }
  function askImportMode(sub) {
    return new Promise(resolve => {
      const m = $('impModeModal');
      if (!m) return resolve('replace');
      const st = $('impModeSub'); if (st && sub) st.textContent = sub;
      m.hidden = false;
      const done = v => { m.hidden = true; m.removeEventListener('click', h); resolve(v); };
      const h = e => {
        const b = e.target.closest('[data-imp]');
        if (b) done(b.dataset.imp === 'cancel' ? null : b.dataset.imp);
        else if (e.target === m) done(null);
      };
      m.addEventListener('click', h);
    });
  }
  // Devolve false se o usuário cancelou. Em 'new', a guerra atual é preservada num slot
  // próprio por newWar() antes de o plano importado entrar.
  async function importarComEscolha(d, nomeNovo, sub) {
    if (!planoTemConteudo()) return applyImported(d);
    const modo = await askImportMode(sub);
    if (!modo) return false;
    if (modo === 'new') newWar(nomeNovo || t('warDefault'));
    return applyImported(d);
  }
  // O botão anuncia PRA ONDE vai, não onde está — é o que o usuário procura ao querer trocar.
  function syncGradeSwap() { const b = $('gradeSwap'); if (b) b.textContent = gradeMode === 'sheet' ? t('gradeByPt') : (gradeMode === 'pt' ? t('gradeByPlayer') : t('gradeBySheet')); }
  // Reaproveita id e disc (userId do Discord) de quem já está no rascunho, casando por
  // NOME — que é a identidade real do app (destacados usam pt+'|'+nome, replaceOf é nome).
  // Sem isto, PROCESSAR (SUBSTITUI) troca o roster por players com id novo (uid()) e sem
  // disc: órfã qualquer referência por id e apaga as menções do Discord.
  function preserveIdentity(parsed) {
    const norm = s => (s || '').trim().toLowerCase();
    const byName = new Map(rosterDraft.map(p => [norm(p.nome), p]));
    parsed.forEach(np => {
      const prev = byName.get(norm(np.nome));
      if (!prev) return;
      np.id = prev.id;
      if (!np.disc && prev.disc) np.disc = prev.disc;
    });
    return parsed;
  }
  function mergeRoster(parsed) {
    const norm = s => (s || '').trim().toLowerCase();
    const newByName = new Map(parsed.map(p => [norm(p.nome), p]));
    const curNames = new Set(rosterDraft.map(p => norm(p.nome)));
    let kept = 0, added = 0, removed = 0;
    const result = [];
    rosterDraft.forEach(p => {
      const np = newByName.get(norm(p.nome));
      if (!np) { removed++; return; }
      if (np.disc && !p.disc) p.disc = np.disc;
      // Guerra COM jogos: "Absence" é negociável (a staff conversa e a pessoa acaba jogando),
      // então quem já está numa PT permanece nela e o conflito só vira selo (signupAusente).
      // Guerra SEM jogos: comportamento de sempre — quem marcou ausência sai da PT. Quem já
      // usa a ferramenta assim não tem o fluxo trocado por baixo.
      if (np.ausente && !p.ausente) {
        if (p.pt && state.jogos.length) p.signupAusente = true;
        else { p.ausente = true; p.reserva = false; p.pt = null; p.signupAusente = undefined; }
      }
      else if (!np.ausente) { if (p.ausente) p.ausente = false; p.signupAusente = undefined; }
      result.push(p); kept++;
    });
    parsed.forEach(np => { if (!curNames.has(norm(np.nome))) { result.push(np); added++; } });
    rosterDraft = result;
    return { kept, added, removed };
  }
  // ---- integração raid-helper: o link do evento vira fonte viva do roster ----
  // A API pública (raid-helper.xyz/api/v4/events/<id>) devolve o mesmo signUps
  // do "Web view" e libera CORS, então dá pra buscar direto do navegador.
  function rhEventId(v) { const m = /(\d{15,20})/.exec(v || ''); return m ? m[1] : null; }
  async function fetchRaidHelper(id) {
    const res = await fetch('https://raid-helper.xyz/api/v4/events/' + id, { cache: 'no-store' });
    if (!res.ok) throw 0;
    const d = await res.json();
    const parsed = Array.isArray(d.signUps) ? parseRaidHelper(d.signUps) : [];
    if (!parsed.length) throw 0;
    return parsed;
  }
  // ao abrir o app com link salvo: busca e mescla em silêncio (avisa só se mudou algo)
  async function autoSyncRoster() {
    const id = rhEventId(state.rhEvent); if (!id) return;
    let parsed; try { parsed = await fetchRaidHelper(id); } catch (e) { return; }
    const before = JSON.stringify(state.roster);
    rosterDraft = state.roster.map(p => Object.assign({}, p, { flags: (p.flags || []).slice() }));
    const r = mergeRoster(parsed);
    if (!r.added && !r.removed && JSON.stringify(rosterDraft) === before) return;
    applyRosterDraft();
    toast('🔄 ' + t('rhSynced') + ' — ' + r.kept + ' ' + t('mKept') + ' · ' + r.added + ' ' + t('mAdded') + ' · ' + r.removed + ' ' + t('mRemoved'));
    if (rosterModal && !rosterModal.hidden) { rosterDraft = state.roster.map(p => Object.assign({}, p, { flags: (p.flags || []).slice() })); refreshRoster(); }
  }
  function copyBoardDiscord() {
    // formato da guild (1 menção por linha, sem markdown que "apaga" o texto):
    //   **PT 1 · desc**            reservas com alvo de replace viram
    //   @a                         "@res — rotaciona com Titular"
    const nm = p => p.disc ? '<@' + p.disc + '>' : p.nome;
    const lines = [];
    PT_IDS.forEach(pt => {
      const tit = rosterDraft.filter(p => p.pt === pt && !p.ausente && !p.reserva);
      const res = rosterDraft.filter(p => p.pt === pt && !p.ausente && p.reserva);
      if (!tit.length && !res.length) return;
      lines.push('**' + pt.replace('PT', 'PT ') + (state.ptDesc[pt] ? ' · ' + state.ptDesc[pt] : '') + '**');
      tit.forEach(p => lines.push(nm(p)));
      if (res.length) {
        lines.push('**' + t('discResOf') + ' ' + pt.replace('PT', 'PT ') + '**');
        res.forEach(p => lines.push(nm(p) + (p.replaceOf ? ' — ' + t('discRotate') + ' ' + p.replaceOf : '')));
      }
      lines.push('');
    });
    const gres = rosterDraft.filter(p => !p.pt && p.reserva && !p.ausente);
    if (gres.length) { lines.push('**' + t('reservesLbl') + '**'); gres.forEach(p => lines.push(nm(p) + (p.replaceOf ? ' — ' + t('discRotate') + ' ' + p.replaceOf : ''))); }
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    if (!lines.length) { toast(t('gridEmpty')); return; }
    const txt = lines.join('\n');
    (async () => { let ok = false; try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {} if (!ok) { try { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) {} } toast(ok ? t('discCopied') : t('selectCopy')); })();
  }
  // arrastando um chip perto da borda de uma lista, ela rola sozinha
  function bdAutoScroll(e) {
    ['.bd-grid', '.bd-side'].forEach(sel => {
      const el = rosterBoard.querySelector(sel); if (!el) return;
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right) return;
      const M = 52;
      if (e.clientY < r.top + M) el.scrollTop -= 16; else if (e.clientY > r.bottom - M) el.scrollTop += 16;
    });
  }
  function openRoster() { rosterDraft = state.roster.map(p => Object.assign({}, p, { flags: (p.flags || []).slice() })); rosterPaste.value = ''; { const rl = $('rhLink'); if (rl) rl.value = state.rhEvent || ''; } parseMsg.textContent = ''; parseMsg.className = 'parse-msg'; saveMsg.textContent = ''; renderGrid(); setRosterView(state.roster.length ? 'board' : 'grid'); rosterModal.hidden = false; }
  function rosterDirty() { try { return JSON.stringify(rosterDraft) !== JSON.stringify(state.roster); } catch (e) { return false; } }
  function applyRosterDraft() { state.roster = rosterDraft.map(p => Object.assign({}, p)); cleanupReplaces(state.roster); pruneJogos(); const moved = reconcileMemberSlots(); saveProject(); renderSidebar(); renderTokens(); return moved; }
  // fechar com alterações pendentes pergunta se salva (é fácil perder tudo sem querer)
  async function closeRoster(force) {
    if (force !== true && !rosterModal.hidden && rosterDirty()) { if (await askConfirm(t('confirmSaveBoard'), t('saveLbl'), t('discardLbl'))) applyRosterDraft(); }
    rosterModal.hidden = true;
  }
  function renderGrid() {
    gAus.textContent = rosterDraft.filter(p => p.ausente).length; gRes.textContent = rosterDraft.filter(p => p.reserva && !p.ausente).length; gEsc.textContent = rosterDraft.filter(p => !p.ausente && !p.reserva).length;
    const c = { Tank: 0, Healer: 0, DPS: 0 }; rosterDraft.filter(p => !p.ausente && !p.reserva).forEach(p => { c[p.funcao] = (c[p.funcao] || 0) + 1; }); gComp.innerHTML = CFG.roleOrder.filter(f => c[f]).map(f => '<b style="color:' + roleColor(f) + '">' + c[f] + '</b> ' + f).join(' · ');
    let html = '<div class="rrow head"><span>' + t('colPlayer') + '</span><span>' + t('colRole') + '</span><span>' + t('colPT') + '</span><span>' + t('colRes') + '</span><span></span></div>';
    if (!rosterDraft.length) html += '<div style="padding:22px 6px;color:#9aa2b4;font-size:12.5px">' + t('gridEmpty') + '</div>';
    rosterDraft.forEach((p, i) => { const opts = ['Tank', 'DPS', 'Healer'].map(f => '<option value="' + f + '"' + (p.funcao === f ? ' selected' : '') + '>' + f + '</option>').join(''); const ptopts = '<option value="">—</option>' + PT_IDS.map(id => '<option value="' + id + '"' + (p.pt === id ? ' selected' : '') + '>' + id + '</option>').join(''); html += '<div class="rrow' + (p.ausente ? ' absence' : '') + '" data-i="' + i + '"><div class="rn"><span class="rl" style="background:' + roleColor(p.funcao) + (p.ausente ? ';opacity:.4' : '') + '"></span><span class="nm">' + esc(p.nome) + '</span><span class="cl">' + esc(p.ausente ? 'ausente' : p.classe) + '</span></div><select class="f-fn"' + (p.ausente ? ' disabled' : '') + '>' + opts + '</select><select class="f-pt"' + (p.ausente ? ' disabled' : '') + '>' + ptopts + '</select><div class="res"><input type="checkbox" class="f-res"' + (p.reserva ? ' checked' : '') + (p.ausente ? ' disabled' : '') + '></div><button class="rdel" title="Remover">✕</button></div>'; });
    rosterGrid.innerHTML = html;
  }
  // Auto-preenche as PTs seguindo a composição alvo (1 heal/1 tank/3 dps, com
  // margens) e joga o excedente nas reservas.
  // fixos padrão da guild (CFG.fixosPadrao): nomes casam de forma tolerante
  // (sem acento/espaço, substring ou prefixo comum >=5) — só valem no Preencher
  function normName(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); }
  function nameMatches(a, b) { a = normName(a); b = normName(b); if (!a || !b) return false; if (a === b) return true; if (Math.min(a.length, b.length) >= 4 && (a.indexOf(b) > -1 || b.indexOf(a) > -1)) return true; let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k >= 5; }
  function defaultFixFor(nome) {
    const map = CFG.fixosPadrao || {}; let hit = null;
    for (const pt of Object.keys(map)) { for (const n of map[pt]) { if (nameMatches(nome, n)) { if (hit && hit !== pt) return null; hit = pt; } } }
    return hit && PT_IDS.includes(hit) ? hit : null;
  }
  function autoAssign() {
    pushBdUndo();
    const players = rosterDraft.filter(p => !p.ausente);
    players.forEach(p => { p.pt = null; p.reserva = false; });
    if (!players.length) { refreshRoster(); return; }
    // 📌 fixados entram primeiro, cada um na sua PT; o resto distribui em volta
    players.forEach(p => { p._efix = (p.fix && PT_IDS.includes(p.fix)) ? p.fix : defaultFixFor(p.nome); });
    const fixed = players.filter(p => p._efix);
    fixed.forEach(p => { p.pt = p._efix; });
    const free = players.filter(p => !p.pt);
    const heal = free.filter(p => p.funcao === 'Healer');
    const tank = free.filter(p => p.funcao === 'Tank');
    const dps = free.filter(p => p.funcao === 'DPS');
    const fixMax = fixed.reduce((m, p) => Math.max(m, PT_IDS.indexOf(p._efix) + 1), 0);
    const nPT = Math.max(1, fixMax, Math.min(PT_IDS.length, Math.ceil(players.length / CFG.ptSize)));
    const comp = CFG.ptComp || { Healer: { alvo: 1, max: 2 }, Tank: { alvo: 1, max: 2 }, DPS: { alvo: 3, max: 4 } };
    const pts = PT_IDS.slice(0, nPT).map(id => ({ id: id, Healer: 0, Tank: 0, DPS: 0, n: 0 }));
    pts.forEach(pt => { fixed.filter(fp => fp._efix === pt.id).forEach(fp => { pt[fp.funcao] = (pt[fp.funcao] || 0) + 1; pt.n++; }); });
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
    players.forEach(p => { delete p._efix; });
    refreshRoster();
  }

  // ---- montador visual de PTs (board drag & drop) ----
  let rosterView = 'grid', bdDragId = null, bdPopId = null, bdGroupClass = false;
  let bdUndoStack = [];
  function pushBdUndo() { try { bdUndoStack.push(JSON.stringify(rosterDraft)); if (bdUndoStack.length > 40) bdUndoStack.shift(); } catch (e) {} }
  function bdUndo() { if (!bdUndoStack.length) { toast('↩︎ —'); return; } try { rosterDraft = JSON.parse(bdUndoStack.pop()); } catch (e) { return; } refreshRoster(); toast(t('bdUndone')); }
  const bdClassCollapsed = new Set();
  function bdChipsHTML(zoneId, list) {
    if (!bdGroupClass) return list.length ? list.map(bdChip).join('') : '<span class="bd-empty">' + t('dropHere') + '</span>';
    if (!list.length) return '<span class="bd-empty">' + t('dropHere') + '</span>';
    let h = '';
    CFG.roleOrder.forEach(f => { const grp = list.filter(x => x.funcao === f); if (!grp.length) return; const col = bdClassCollapsed.has(zoneId + ':' + f); h += '<div class="bd-cgrp"><div class="bd-cgh" data-cg="' + zoneId + ':' + f + '"><span class="chev">' + (col ? '▸' : '▾') + '</span>' + classIcoHTML(f, true) + '<b>' + f + '</b><span class="bd-cc">' + grp.length + '</span></div>' + (col ? '' : grp.map(bdChip).join('')) + '</div>'; });
    return h;
  }
  function refreshRoster() { cleanupReplaces(rosterDraft); renderGrid(); if (rosterView === 'board') renderBoard(); liveDraftTx(); }
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
    const short = s => s.length > 8 ? s.slice(0, 7) + '…' : s;
    // reserva mostra quem ele substitui; o TITULAR substituído também ganha o
    // selo (tracejado) apontando o replace dele — sinaliza dos dois lados
    const repBy = (!p.replaceOf && p.pt && !p.reserva) ? rosterDraft.find(x => x.replaceOf === p.nome && x.id !== p.id) : null;
    const pin = p.fix ? '<span class="c-pin" title="📌 ' + esc(t('fixLbl')) + '">📌</span>' : '';
    // Escalado mesmo tendo marcado Absence no raid-helper. Não é erro — é decisão da staff
    // (Absence é negociável). O selo só lembra que essa presença foi combinada por fora.
    const sabs = p.signupAusente ? '<span class="c-sabs" title="' + esc(t('signupAbsTip') || 'Marcou Absence no raid-helper — escalado mesmo assim') + '">⚠</span>' : '';
    const rep = p.replaceOf ? '<span class="c-rep has-of" title="' + esc(t('repOf') + ' ' + p.replaceOf) + '">⇄ ' + esc(short(p.replaceOf)) + '</span>'
      : (repBy ? '<span class="c-rep has-of repby" title="Replace: ' + esc(repBy.nome) + '">⇄ ' + esc(short(repBy.nome)) + '</span>'
      : (p.replace ? '<span class="c-rep" title="Replace">⇄</span>' : ''));
    // nome → tarjas secundárias (discretas, depois do nome) → flags → função (classe) sempre à direita
    return '<div class="bd-chip" draggable="true" data-id="' + p.id + '" style="--rc:' + roleColor(p.funcao) + '">'
      + '<span class="c-grip">⋮⋮</span>' + classIcoHTML(p.funcao)
      + '<span class="c-name">' + esc(p.nome) + '</span>'
      + '<span class="c-tags">' + sabs + pin + tagsHtml + rep + bdFlagsHTML(p) + '</span>'
      + '<span class="c-role">' + p.funcao + '</span></div>';
  }
  function bdZone(zoneId, label, chips, cls, extra) {
    return '<div class="bd-zone ' + (cls || '') + '" data-zone="' + zoneId + '"><div class="bd-zh">' + label + (extra || '') + '</div>'
      + '<div class="bd-chips">' + (chips.length ? chips.map(bdChip).join('') : '<span class="bd-empty">' + t('dropHere') + '</span>') + '</div></div>';
  }
  let bdSearch = '';
  function bdApplyFilter() {
    const q = normName(bdSearch);
    const side = rosterBoard.querySelector('.bd-side'); if (!side) return;
    side.querySelectorAll('.bd-chip').forEach(c => {
      const nm = c.querySelector('.c-name'); const hit = !q || normName(nm ? nm.textContent : '').indexOf(q) > -1;
      c.style.display = hit ? '' : 'none';
    });
  }
  function renderBoard() {
    if (!rosterBoard) return;
    // preserva o scroll das duas colunas (re-render em drag/edição resetava pro topo)
    const pg = rosterBoard.querySelector('.bd-grid'), ps = rosterBoard.querySelector('.bd-side');
    const sGrid = pg ? pg.scrollTop : 0, sSide = ps ? ps.scrollTop : 0;
    const active = rosterDraft.filter(p => !p.ausente);
    const pool = byRole(active.filter(p => !p.pt && !p.reserva));
    const gres = byRole(active.filter(p => !p.pt && p.reserva));
    // coluna esquerda: disponíveis (arrastar) + reservas gerais ; direita: grade 3x2 das 6 PTs
    let side = '<div class="bd-search"><input id="bdSearch" type="search" placeholder="' + esc(t('bdSearchPh')) + '" value="' + esc(bdSearch) + '"></div>';
    side += '<div class="bd-zone bd-pool" data-zone="pool"><div class="bd-zh">' + t('available')
      + (pool.length ? '<button class="bd-allres" title="' + t('allToRes') + '">→ ' + t('reservesLbl') + '</button>' : '')
      + '<span class="bd-c">' + pool.length + '</span></div>'
      + '<div class="bd-chips">' + bdChipsHTML('pool', pool) + '</div></div>';
    side += '<div class="bd-zone bd-res" data-zone="res"><div class="bd-zh">' + t('genReserves') + ' <span class="bd-c">' + gres.length + '</span></div><div class="bd-chips">' + bdChipsHTML('res', gres) + '</div></div>';
    // Quem marcou ausência FICA no board, numa zona própria: some do cálculo de PT mas
    // continua arrastável, para escalar de verdade ou só simular. Antes o board filtrava
    // !ausente antes de montar as zonas e essas pessoas simplesmente não existiam aqui.
    const aus = byRole(rosterDraft.filter(p => p.ausente));
    if (aus.length) side += '<div class="bd-zone bd-abs" data-zone="abs"><div class="bd-zh">' + t('bdAbsZone') + ' <span class="bd-c">' + aus.length + '</span></div><div class="bd-chips">' + bdChipsHTML('abs', aus) + '</div></div>';
    let grid = '<div class="bd-grid">';
    PT_IDS.forEach(pid => {
      const party = partyById.get(pid);
      const tit = byRole(active.filter(x => x.pt === pid && !x.reserva));
      const ptres = byRole(active.filter(x => x.pt === pid && x.reserva));
      const c = { Tank: 0, Healer: 0, DPS: 0 }; tit.forEach(m => c[m.funcao]++);
      const compIco = CFG.roleOrder.map(f => '<span class="bc" style="--rc:' + roleColor(f) + '" title="' + f + '">' + classIcoHTML(f, true) + c[f] + '</span>').join('');
      const head = '<span class="dot" style="background:' + party.cor + '"></span><b>' + (state.ptIcon[pid] ? ptIconHTML(state.ptIcon[pid]) + ' ' : '') + pid + '</b>'
        + '<span class="bd-comp">' + compIco + '</span>'
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
    // ferramentas do board moram no topo da coluna lateral (libera a linha de cima)
    const sideEl = rosterBoard.querySelector('.bd-side');
    if (boardTools && sideEl) { sideEl.insertBefore(boardTools, sideEl.firstChild); boardTools.hidden = rosterView !== 'board'; }
    const ng = rosterBoard.querySelector('.bd-grid'); if (ng) ng.scrollTop = sGrid;
    if (sideEl) sideEl.scrollTop = sSide;
    { const si = $('bdSearch');
      if (si) {
        si.addEventListener('input', () => { bdSearch = si.value; bdApplyFilter(); });
        si.addEventListener('keydown', e => { if (e.key === 'Escape') { si.value = ''; bdSearch = ''; bdApplyFilter(); } e.stopPropagation(); });
        if (bdSearch) bdApplyFilter();
      } }
  }
  function bdMove(id, zone) {
    const p = rosterDraft.find(x => x.id === id); if (!p) return;
    pushBdUndo();
    if (zone === 'abs') { p.pt = null; p.reserva = false; p.ausente = true; }
    else if (zone === 'pool') { p.pt = null; p.reserva = false; }
    else if (zone === 'res') { p.pt = null; p.reserva = true; }
    else if (typeof zone === 'string' && zone.slice(-4) === '-res' && PT_IDS.includes(zone.slice(0, -4))) { p.pt = zone.slice(0, -4); p.reserva = true; }
    else if (PT_IDS.includes(zone)) { p.pt = zone; p.reserva = false; }
    // Tirar alguém da zona de ausentes é a decisão de que ele joga. O status do signup não
    // se perde: vira signupAusente, que mantém o selo ⚠ no chip.
    if (zone !== 'abs' && p.ausente) { p.ausente = false; p.signupAusente = true; }
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
    html += '</div>';
    if (p.pt) { html += '<div class="bp-sec">📌 ' + t('fixLbl') + '</div><div class="bp-row"><button class="bp-fix' + (p.fix ? ' active' : '') + '">' + (p.fix ? '📌 ' + esc(p.fix) + ' ✓' : t('fixBtn')) + '</button></div>'; }
    // Replace COM ALVO: só titulares da PRÓPRIA PT do reserva (reserva geral,
    // sem PT, pode substituir qualquer um)
    const titulares = rosterDraft.filter(x => x.pt && !x.reserva && !x.ausente && x.id !== p.id && (!p.pt || x.pt === p.pt))
      .sort((a, b) => (a.pt || '').localeCompare(b.pt || '') || a.nome.localeCompare(b.nome));
    html += '<div class="bp-sec">⇄ ' + t('repOf') + '</div><div class="bp-row bp-row-ro">';
    html += '<button class="bp-ro' + (!p.replaceOf ? ' active' : '') + '" data-ro="">—</button>';
    titulares.forEach(x => { html += '<button class="bp-ro' + (p.replaceOf === x.nome ? ' active' : '') + '" data-ro="' + esc(x.nome) + '"><small>' + esc(x.pt) + '</small> ' + esc(x.nome) + '</button>'; });
    html += '</div>';
    bdPop.innerHTML = html; bdPop.hidden = false;
    bdPop.style.left = '0px'; bdPop.style.top = '0px';
    const ar = anchor.getBoundingClientRect(), pr = bdPop.getBoundingClientRect();
    // abre ao LADO do chip (nunca em cima dele): direita > esquerda > embaixo
    let left, top = Math.max(10, Math.min(ar.top, window.innerHeight - pr.height - 10));
    if (ar.right + 8 + pr.width <= window.innerWidth - 10) left = ar.right + 8;
    else if (ar.left - 8 - pr.width >= 10) left = ar.left - 8 - pr.width;
    else { left = Math.max(10, Math.min(ar.left, window.innerWidth - pr.width - 10)); top = ar.bottom + 6; if (top + pr.height > window.innerHeight - 10) top = Math.max(10, ar.top - pr.height - 6); }
    bdPop.style.left = left + 'px'; bdPop.style.top = top + 'px';
  }

  // ---- export / import / compartilhar / reset ----
  function projectData() { stashJogoAtual(); return { app: 'zhi-estrategia', v: 6, exportedAt: new Date().toISOString(), currentId: state.currentId, roster: state.roster, ptDesc: state.ptDesc, ptIcon: state.ptIcon, objetivoPosGlobal: state.objetivoPosGlobal, gates: state.gates, side: state.side, showNames: state.showNames, rhEvent: state.rhEvent || undefined, jogos: state.jogos.length ? state.jogos : undefined, jogoAtual: state.jogos.length ? state.jogoAtual : undefined, cenarios: state.scenarios }; }
  function sanitizeDesc(m) { return (m && typeof m === 'object') ? Object.fromEntries(Object.entries(m).filter(([k, v]) => PT_IDS.includes(k) && typeof v === 'string' && v.trim()).map(([k, v]) => [k, String(v)])) : {}; }
  function sanitizePosMap(m) { return (m && typeof m === 'object') ? Object.fromEntries(Object.entries(m).filter(([k, v]) => objById.has(k) && v).map(([k, v]) => [k, { x: clamp01(v.x), y: clamp01(v.y) }])) : {}; }
  function exportDataFor(scope) {
    if (scope === 'board') return { app: 'zhi-board', v: 1, roster: state.roster.map(p => Object.assign({}, p)), ptDesc: state.ptDesc, ptIcon: state.ptIcon };
    if (scope === 'obj') { const s = cur() || {}; return { app: 'zhi-obj', v: 1, objetivos: s.objetivos || {}, objetivoPos: s.objetivoPos || {}, objHp: s.objHp || {}, objBuffs: s.objBuffs || {}, hideMeters: s.hideMeters || {}, objetivoPosGlobal: state.objetivoPosGlobal, gates: state.gates, side: state.side }; }
    const d = projectData(); if (scope === 'scenes') { d.roster = []; d.ptDesc = {}; d.ptIcon = {}; } return d;
  }
  function exportProject(scope) {
    scope = scope || 'all';
    const blob = new Blob([JSON.stringify(exportDataFor(scope), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), d = new Date(), pad = n => String(n).padStart(2, '0');
    const wr = warsReg(); const w = wr.list.find(x => x.id === wr.cur);
    const slug = ((w && w.nome) || 'guerra').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'guerra';
    const a = document.createElement('a'); a.href = url;
    a.download = slug + (scope === 'all' ? '' : '-' + scope) + '-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // PLAN_V: versão do formato do plano. applyImported avisa quando o arquivo/link vem de uma
  // versão MAIS NOVA que este app — sem isso ele descartaria os campos que não conhece e ainda
  // gravaria o plano decepado por cima (saveProject no fim desta função). Foi o que aconteceria
  // com o v6 em app v5, e não havia como evitar porque nada lia `v`. Daqui pra frente, avisa.
  function applyImported(d) { if (typeof d.v === 'number' && d.v > PLAN_V && !confirm(t('vNewer') || 'Este plano foi feito numa versão mais nova do Game Plan. Abrir aqui pode descartar partes que esta versão não entende (e sobrescrever o plano). Continuar?')) return false; const scenarios = Array.isArray(d.cenarios) ? d.cenarios : (Array.isArray(d.scenarios) ? d.scenarios : null); if (!scenarios || !scenarios.length) { alert(t('noScenes')); return false; } state.scenarios = scenarios.map(sanitizeScenario); state.roster = Array.isArray(d.roster) ? d.roster.map(sanitizePlayer) : []; cleanupReplaces(state.roster); state.objetivoPosGlobal = sanitizePosMap(d.objetivoPosGlobal); state.gates = sanitizePosMap(d.gates); state.side = (d.side === 'blue' || d.side === 'red') ? d.side : null; state.ptDesc = sanitizeDesc(d.ptDesc); state.ptIcon = sanitizeDesc(d.ptIcon); if (typeof d.showNames === 'boolean') state.showNames = d.showNames; if (typeof d.rhEvent === 'string' && d.rhEvent) state.rhEvent = d.rhEvent; if (Array.isArray(d.jogos) && d.jogos.length) { state.jogos = d.jogos.map(sanitizeJogo); state.jogoAtual = state.jogos.some(j => j.id === d.jogoAtual) ? d.jogoAtual : state.jogos[0].id; } else { state.jogos = []; state.jogoAtual = null; } state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id; hidePopover(); renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderSidebar(); renderTokens(); renderJogos(); saveProject(); return true; }
  let pendingImport = null;
  function importProjectFile(file) { const reader = new FileReader(); reader.onload = async () => {
    let d; try { d = JSON.parse(reader.result); } catch (e) { toast(t('invalidJson')); return; }
    if (d && d.app === 'zhi-board' && Array.isArray(d.roster)) { if (state.roster.length && !await askConfirm(t('confirmBoard'))) return; applyBoardData(d); toast(t('boardLoaded')); return; }
    if (d && d.app === 'zhi-obj') { if (!await askConfirm(t('objAsk'))) return; applyObjData(d); toast(t('objLoaded')); return; }
    if (!Array.isArray(d.cenarios) && !Array.isArray(d.scenarios)) { toast(t('noScenesFile')); return; }
    // plano completo: deixa escolher O QUE puxar dele (tudo/cenas/board/objetivos)
    pendingImport = d; const im = $('importModal');
    if (im) im.hidden = false;
    else { await importarComEscolha(d); }
  }; reader.readAsText(file); }
  async function importScoped(scope) {
    const d = pendingImport; pendingImport = null; if (!d) return;
    if (scope === 'all') { if (await importarComEscolha(d)) toast(t('planLoaded')); return; }
    if (scope === 'scenes') { const kr = state.roster, kd = state.ptDesc, ki = state.ptIcon, kj = state.jogos, kja = state.jogoAtual; if (applyImported(d)) { state.roster = kr; state.ptDesc = kd; state.ptIcon = ki; state.jogos = kj; state.jogoAtual = kja; cleanupReplaces(state.roster); reconcileMemberSlots(); saveProject(); renderSidebar(); renderTokens(); renderJogos(); toast(t('scenesLoaded')); } return; }
    if (scope === 'board') { if (!Array.isArray(d.roster) || !d.roster.length) { toast(t('rosterNone')); return; } if (state.roster.length && !await askConfirm(t('confirmBoard'))) return; applyBoardData({ roster: d.roster, ptDesc: d.ptDesc, ptIcon: d.ptIcon }); toast(t('boardLoaded')); return; }
    if (scope === 'obj') { const scs = Array.isArray(d.cenarios) ? d.cenarios : d.scenarios; const s = (scs || []).find(x => x.id === d.currentId) || (scs || [])[0]; if (!s) { toast(t('noScenesFile')); return; } applyObjData({ objetivos: s.objetivos, objetivoPos: s.objetivoPos, objHp: s.objHp, objBuffs: s.objBuffs, hideMeters: s.hideMeters, objetivoPosGlobal: d.objetivoPosGlobal, gates: d.gates, side: d.side }); toast(t('objLoaded')); return; }
  }
  async function resetBoard() {
    if (!await askConfirm(t('resetBoardAsk'))) return;
    state.roster.forEach(p => { p.pt = null; delete p.replaceOf; });
    state.scenarios.forEach(s => { s.tokens = []; s.destacados = []; s.links = (s.links || []).filter(l => !/^(pt|mem):/.test(l.a) && !/^(pt|mem):/.test(l.b)); });
    hidePopover(); renderSidebar(); renderTokens(); saveProject(); toast(t('boardReset'));
  }
  async function resetObjectives() {
    if (!await askConfirm(t('resetObjAsk'))) return;
    state.scenarios.forEach(s => { s.objetivos = {}; s.objetivoPos = {}; s.objHp = {}; s.objBuffs = {}; s.hideMeters = {}; s.treeCarry = {}; });
    renderObjectives(); renderTokens(); if (!objPanel.hidden) renderObjPanel(); saveProject(); toast(t('objReset'));
  }
  async function resetAll() { if (!await askConfirm(t('confirmReset'))) return; try { localStorage.removeItem(CFG.projectKey); } catch (e) {} const s = newScenario({ fase: 'Start', nome: 'Start (30m)' }); state.scenarios = [s]; state.currentId = s.id; state.roster = []; state.ptDesc = {}; state.ptIcon = {}; state.objetivoPosGlobal = {}; state.gates = {}; toggleObjPanel(false); hidePopover(); renderRail(); loadScenarioIntoUI(); renderDrawings(); renderObjectives(); renderSidebar(); renderTokens(); saveProject(); toast(t('planReset')); }
  function b64urlFromBytes(bytes) { let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function bytesFromB64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  async function encodeShare(obj) { const bytes = new TextEncoder().encode(JSON.stringify(obj)); if (window.CompressionStream) { const st = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')); return 'g' + b64urlFromBytes(new Uint8Array(await new Response(st).arrayBuffer())); } return 'r' + b64urlFromBytes(bytes); }
  async function decodeShare(str) { const flag = str[0]; let bytes = bytesFromB64url(str.slice(1)); if (flag === 'g' && window.DecompressionStream) { const st = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')); bytes = new Uint8Array(await new Response(st).arrayBuffer()); } return JSON.parse(new TextDecoder().decode(bytes)); }
  // escopos de compartilhamento: tudo (#p), só cenas (#s, preserva o board de quem abre),
  // só board (#b) e só objetivos da cena atual (#o)
  async function buildShareUrl(scope) {
    let hash;
    if (scope === 'board') hash = '#b=' + await encodeShare({ app: 'zhi-board', v: 1, roster: state.roster.map(p => Object.assign({}, p)), ptDesc: state.ptDesc, ptIcon: state.ptIcon });
    else if (scope === 'scenes') { const d = projectData(); d.roster = []; d.ptDesc = {}; d.ptIcon = {}; hash = '#s=' + await encodeShare(d); }
    else if (scope === 'obj') { const s = cur() || {}; hash = '#o=' + await encodeShare({ app: 'zhi-obj', v: 1, objetivos: s.objetivos || {}, objetivoPos: s.objetivoPos || {}, objHp: s.objHp || {}, objBuffs: s.objBuffs || {}, hideMeters: s.hideMeters || {}, objetivoPosGlobal: state.objetivoPosGlobal, gates: state.gates, side: state.side }); }
    else hash = '#p=' + await encodeShare(projectData());
    return location.origin + location.pathname + hash;
  }
  let shareScope = 'all';
  async function shareLink(scope) {
    shareScope = scope || 'all';
    try {
      const url = await buildShareUrl(shareScope);
      { const sc = $('shareScopes'); if (sc) sc.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.scope === shareScope)); }
      { const tp = $('shareTitleP'); if (tp) tp.textContent = t('shareTitle'); }
      shareUrl.value = url; shareModal.hidden = false; shareUrl.focus(); shareUrl.select();
      let copied = false; try { await navigator.clipboard.writeText(url); copied = true; } catch (e) {}
      if (copied) toast(t('linkCopied')); else toast(t('selectCopy'));
    } catch (e) { toast(t('linkFail')); }
  }
  async function maybeLoadScenes() {
    const m = /[#&]s=([^&]+)/.exec(location.hash); if (!m) return;
    let d; try { d = await decodeShare(decodeURIComponent(m[1])); } catch (e) { toast(t('linkInvalid')); return; }
    if (state.scenarios.some(s => !isPristine(s)) && !await askConfirm(t('scenesAsk'))) return;
    const kr = state.roster, kd = state.ptDesc, ki = state.ptIcon;
    if (applyImported(d)) { state.roster = kr; state.ptDesc = kd; state.ptIcon = ki; cleanupReplaces(state.roster); reconcileMemberSlots(); saveProject(); renderSidebar(); renderTokens(); toast(t('scenesLoaded')); }
  }
  async function maybeLoadObj() {
    const m = /[#&]o=([^&]+)/.exec(location.hash); if (!m) return;
    let d; try { d = await decodeShare(decodeURIComponent(m[1])); } catch (e) { toast(t('linkInvalid')); return; }
    if (!d || d.app !== 'zhi-obj') { toast(t('linkInvalid')); return; }
    if (!await askConfirm(t('objAsk'))) return;
    applyObjData(d); toast(t('objLoaded'));
  }
  function applyObjData(d) {
    const s = cur(); if (!s) return;
    const okId = o => Object.fromEntries(Object.keys(o || {}).filter(k => objById.has(k)).map(k => [k, o[k]]));
    s.objetivos = Object.fromEntries(Object.keys(d.objetivos || {}).filter(k => objById.has(k) && d.objetivos[k]).map(k => [k, true]));
    s.objetivoPos = okId(d.objetivoPos); s.objHp = okId(d.objHp); s.objBuffs = okId(d.objBuffs); s.hideMeters = okId(d.hideMeters);
    state.objetivoPosGlobal = sanitizePosMap(d.objetivoPosGlobal); state.gates = sanitizePosMap(d.gates);
    if (d.side === 'blue' || d.side === 'red') state.side = d.side;
    renderObjectives(); renderTokens(); if (!objPanel.hidden) renderObjPanel(); updateSideChip(); saveProject();
  }
  // link só do BOARD (players, PTs, reservas, replaces, obs) — sem cenários.
  // Abrir o link aplica o board por cima do plano atual, mantendo o mapa;
  // posições órfãs são herdadas (reconcileMemberSlots).
  async function shareBoardLink() {
    try {
      const enc = await encodeShare({ app: 'zhi-board', v: 1, roster: rosterDraft.map(p => Object.assign({}, p)), ptDesc: state.ptDesc, ptIcon: state.ptIcon });
      const url = location.origin + location.pathname + '#b=' + enc;
      { const tp = $('shareTitleP'); if (tp) tp.textContent = t('boardShareTitle'); }
      shareUrl.value = url; shareModal.hidden = false; shareUrl.focus(); shareUrl.select();
      let copied = false; try { await navigator.clipboard.writeText(url); copied = true; } catch (e) {}
      toast(copied ? t('linkCopied') : t('selectCopy'));
    } catch (e) { toast(t('linkFail')); }
  }
  async function maybeLoadBoard() {
    const m = /[#&]b=([^&]+)/.exec(location.hash); if (!m) return;
    let d; try { d = await decodeShare(decodeURIComponent(m[1])); } catch (e) { toast(t('linkInvalid')); return; }
    if (!d || d.app !== 'zhi-board' || !Array.isArray(d.roster)) { toast(t('linkInvalid')); return; }
    if (state.roster.length && !await askConfirm(t('confirmBoard'))) return;
    applyBoardData(d);
    toast(t('boardLoaded'));
  }
  function applyBoardData(d) {
    state.roster = d.roster.map(sanitizePlayer);
    state.ptDesc = sanitizeDesc(d.ptDesc); state.ptIcon = sanitizeDesc(d.ptIcon);
    cleanupReplaces(state.roster);
    reconcileMemberSlots();
    saveProject(); renderSidebar(); renderTokens();
    if (rosterModal && !rosterModal.hidden) { rosterDraft = state.roster.map(p => Object.assign({}, p, { flags: (p.flags || []).slice() })); refreshRoster(); }
  }
  // dump curto (só coordenadas) — robusto para colar num chat sem corromper
  function dumpPositions() {
    const r = v => Math.round(v * 1e4) / 1e4;
    const glob = {}; Object.keys(state.objetivoPosGlobal || {}).forEach(k => { const p = state.objetivoPosGlobal[k]; glob[k] = [r(p.x), r(p.y)]; });
    const mov = {}; const cp = cur() && cur().objetivoPos ? cur().objetivoPos : {}; Object.keys(cp).forEach(k => { mov[k] = [r(cp[k].x), r(cp[k].y)]; });
    const gts = {}; Object.keys(state.gates || {}).forEach(k => { const p = state.gates[k]; gts[k] = [r(p.x), r(p.y)]; });
    const s = JSON.stringify({ fixos: glob, moveis: mov, portoes: gts });
    { const tp = $('shareTitleP'); if (tp) tp.textContent = t('posTitle'); }
    shareUrl.value = s; shareModal.hidden = false; shareUrl.focus(); shareUrl.select();
    (async () => { let ok = false; try { await navigator.clipboard.writeText(s); ok = true; } catch (e) {} if (!ok) { try { ok = document.execCommand('copy'); } catch (e) {} } toast(ok ? t('posCopied') : t('selectCopy')); })();
  }
  async function maybeLoadShared() { const m = /[#&]p=([^&]+)/.exec(location.hash); if (!m) return; let d; try { d = await decodeShare(decodeURIComponent(m[1])); } catch (e) { toast(t('linkInvalid')); return; } if (await importarComEscolha(d)) toast(t('planLoadedLink')); }
  // ---- tour de boas-vindas: holofote passo a passo baseado no guia ----
  const TOUR_KEY = 'zhi_gp_tour_v1';
  let tourIdx = -1;
  function tourSteps() {
    return [
      { sel: '.fase-group', k: 1 },
      { sel: 'section.dock', k: 2, open: () => { const d = document.querySelector('section.dock'); if (d && getComputedStyle(d).display === 'none') fasesBtn.click(); }, close: () => { const dc = $('dockCollapse'); if (dc) dc.click(); } },
      { sel: '#drawTools', k: 3 },
      { sel: 'aside.roster', k: 4 },
      { sel: '#objPanel', k: 5, open: () => { if (objPanel.hidden) $('objBtn').click(); }, close: () => { if (!objPanel.hidden) $('objBtn').click(); } },
      { sel: '#rosterModal .modal', k: 6, open: () => { if (rosterModal.hidden) openRoster(); }, close: () => closeRoster(true) },
      { sel: '#warsBtn', k: 7 },
      { sel: '#liveBtn', k: 8 },
      { sel: '#shareBtn', k: 9 },
      { sel: '#helpBtn', k: 10 }
    ];
  }
  function tourEls() { return { ov: $('tourOv'), hole: $('tourHole'), card: $('tourCard') }; }
  function tourStart() { const im = $('tourIntro'); if (im) im.hidden = true; try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {} tourIdx = -1; tourNext(1); }
  function tourEnd() { const s = tourSteps()[tourIdx]; if (s && s.close) { try { s.close(); } catch (e) {} } tourIdx = -1; const { ov, hole, card } = tourEls(); if (ov) ov.hidden = true; if (hole) hole.hidden = true; if (card) card.hidden = true; }
  function tourNext(dir) {
    const steps = tourSteps();
    const cur2 = steps[tourIdx]; if (cur2 && cur2.close) { try { cur2.close(); } catch (e) {} }
    tourIdx += dir;
    if (tourIdx < 0 || tourIdx >= steps.length) { tourEnd(); return; }
    const s = steps[tourIdx];
    if (s.open) { try { s.open(); } catch (e) {} }
    setTimeout(() => tourShow(s), s.open ? 260 : 0);
  }
  function tourShow(s) {
    const el = document.querySelector(s.sel);
    const { ov, hole, card } = tourEls(); if (!hole || !card) return;
    if (ov) ov.hidden = false;
    const steps = tourSteps();
    let r = el && el.offsetParent !== null ? el.getBoundingClientRect() : null;
    if (el && !r) r = el.getBoundingClientRect();
    if (!el || !r || (!r.width && !r.height)) { tourNext(1); return; }
    const pad = 8;
    hole.hidden = false;
    hole.style.left = (r.left - pad) + 'px'; hole.style.top = (r.top - pad) + 'px';
    hole.style.width = (r.width + pad * 2) + 'px'; hole.style.height = (r.height + pad * 2) + 'px';
    card.hidden = false;
    card.innerHTML = '<div class="tc-step">' + (tourIdx + 1) + ' / ' + steps.length + '</div><div class="tc-t">' + t('tourT' + s.k) + '</div><div class="tc-d">' + t('tourD' + s.k) + '</div>'
      + '<div class="tc-btns"><button class="tc-skip">' + t('tourSkip') + '</button><span style="flex:1"></span>'
      + (tourIdx > 0 ? '<button class="tc-prev">←</button>' : '')
      + '<button class="tc-next rbtn gold">' + (tourIdx === steps.length - 1 ? t('tourDone') : t('tourNext')) + '</button></div>';
    card.querySelector('.tc-skip').onclick = tourEnd;
    const pv = card.querySelector('.tc-prev'); if (pv) pv.onclick = () => tourNext(-1);
    card.querySelector('.tc-next').onclick = () => tourNext(1);
    // posiciona o card no lado com mais espaço
    const cw = 312, ch = card.offsetHeight || 190, m = 14, vw = window.innerWidth, vh = window.innerHeight;
    let cx, cy;
    if (r.right + m + cw < vw) { cx = r.right + m; cy = r.top; }
    else if (r.left - m - cw > 0) { cx = r.left - m - cw; cy = r.top; }
    else if (r.bottom + m + ch < vh) { cx = r.left; cy = r.bottom + m; }
    else { cx = (vw - cw) / 2; cy = Math.max(14, r.top - ch - m); }
    card.style.left = Math.max(10, Math.min(vw - cw - 10, cx)) + 'px';
    card.style.top = Math.max(10, Math.min(vh - ch - 10, cy)) + 'px';
  }
  function tourIntroShow() {
    const im = $('tourIntro'); if (!im) return;
    im.hidden = false;
    $('tourGo').onclick = tourStart;
    $('tourNo').onclick = () => { im.hidden = true; try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {} };
  }
  function maybeTour() {
    if (isMobile()) return;
    try { if (localStorage.getItem(TOUR_KEY)) return; } catch (e) { return; }
    if (location.hash || /[?&]plan=/.test(location.search)) return;
    setTimeout(tourIntroShow, 800);
  }

  // ---- guerras: vários planos salvos neste navegador, alternáveis ----
  // A guerra ATIVA mora em CFG.projectKey (caminho quente intocado); as
  // inativas ficam congeladas em zhi_war_<id>. Trocar = congela a atual e
  // descongela a escolhida via applyImported.
  const WARS_KEY = 'zhi_wars_v1';
  function warsReg() { try { const d = JSON.parse(localStorage.getItem(WARS_KEY)); if (d && Array.isArray(d.list) && d.list.length && d.cur && d.list.some(w => w.id === d.cur)) return d; } catch (e) {} const r = { cur: 'w1', list: [{ id: 'w1', nome: 'Guerra 1', ts: Date.now() }] }; warsSave(r); return r; }
  function warsSave(r) { try { localStorage.setItem(WARS_KEY, JSON.stringify(r)); } catch (e) {} }
  function warSlotKey(id) { return 'zhi_war_' + id; }
  function stashCurrentWar() { const r = warsReg(); try { const cur = localStorage.getItem(CFG.projectKey); if (cur) localStorage.setItem(warSlotKey(r.cur), cur); } catch (e) {} const w = r.list.find(x => x.id === r.cur); if (w) { w.ts = Date.now(); w.n = state.scenarios.length; } warsSave(r); return r; }
  function freshPlanData() { return { cenarios: [newScenario({ fase: 'Start', nome: 'Start (30m)' })], roster: [] }; }
  function loadWarSlot(id) { let d = null; try { d = JSON.parse(localStorage.getItem(warSlotKey(id))); } catch (e) {} return (d && (Array.isArray(d.scenarios) ? d.scenarios.length : Array.isArray(d.cenarios) && d.cenarios.length)) ? d : freshPlanData(); }
  function switchWar(id) { const r = warsReg(); if (id === r.cur || !r.list.some(w => w.id === id)) return; stashCurrentWar(); r.cur = id; warsSave(r); applyImported(loadWarSlot(id)); updateWarsBtn(); toast(t('warLoaded')); }
  function newWar(nome) { const r = stashCurrentWar(); const id = 'w' + Date.now().toString(36); r.list.push({ id, nome: nome || (t('warDefault') + ' ' + (r.list.length + 1)), ts: Date.now() }); r.cur = id; warsSave(r); applyImported(freshPlanData()); updateWarsBtn(); }
  function dupWar() { const r = stashCurrentWar(); const curW = r.list.find(w => w.id === r.cur); const id = 'w' + Date.now().toString(36); r.list.push({ id, nome: (curW ? curW.nome : t('warDefault')) + ' (' + t('copySuffix') + ')', ts: Date.now(), n: state.scenarios.length }); r.cur = id; warsSave(r); saveProject(); updateWarsBtn(); toast(t('warLoaded')); }
  async function delWar(id) { const r = warsReg(); if (!await askConfirm(t('warDelAsk'))) return; r.list = r.list.filter(w => w.id !== id); try { localStorage.removeItem(warSlotKey(id)); } catch (e) {} if (!r.list.length) r.list = [{ id: 'w1', nome: 'Guerra 1', ts: Date.now() }]; if (id === r.cur || !r.list.some(w => w.id === r.cur)) { r.cur = r.list[0].id; warsSave(r); applyImported(loadWarSlot(r.cur)); } else warsSave(r); updateWarsBtn(); renderWarsMenu(); }
  function renameWar(id) { const r = warsReg(); const w = r.list.find(x => x.id === id); if (!w) return; const nome = prompt(t('warName'), w.nome); if (nome && nome.trim()) { w.nome = nome.trim().slice(0, 40); warsSave(r); updateWarsBtn(); renderWarsMenu(); } }
  function updateWarsBtn() { const l = $('warsLbl'); if (!l) return; const r = warsReg(); const w = r.list.find(x => x.id === r.cur); l.textContent = w ? (w.nome.length > 16 ? w.nome.slice(0, 15) + '…' : w.nome) : t('wars'); }
  function renderWarsMenu() {
    const menu = $('warsMenu'); if (!menu || menu.hidden) return;
    const r = warsReg();
    let h = '<div class="pm-h">' + t('warsMine') + '</div>';
    r.list.forEach(w => {
      const on = w.id === r.cur;
      h += '<div class="pm-war' + (on ? ' on' : '') + '"><button class="pm-item" data-war="' + esc(w.id) + '"><span class="pm-name">' + (on ? '⚔ ' : '') + esc(w.nome) + '</span><span class="pm-sub">' + (w.n != null ? w.n + ' ' + t('scenesLbl') + ' · ' : '') + new Date(w.ts || Date.now()).toLocaleDateString() + '</span></button><button class="pm-mini" data-ren="' + esc(w.id) + '" title="' + esc(t('warName')).replace(':', '') + '">✏️</button><button class="pm-mini" data-del="' + esc(w.id) + '" title="✕">🗑</button></div>';
    });
    h += '<div class="pm-acts"><button data-act="new">' + t('warNew') + '</button><button data-act="dup">' + t('warDup') + '</button></div>';
    menu.innerHTML = h;
    menu.querySelectorAll('[data-war]').forEach(b => b.addEventListener('click', () => { menu.hidden = true; switchWar(b.dataset.war); }));
    menu.querySelectorAll('[data-ren]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); renameWar(b.dataset.ren); }));
    menu.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); menu.hidden = true; delWar(b.dataset.del); }));
    menu.querySelector('[data-act="new"]').addEventListener('click', () => { menu.hidden = true; newWar(); });
    menu.querySelector('[data-act="dup"]').addEventListener('click', () => { menu.hidden = true; dupWar(); });
  }
  function openWarsMenu() { const menu = $('warsMenu'); if (!menu) return; if (!menu.hidden) { menu.hidden = true; return; } menu.hidden = false; renderWarsMenu(); }

  // ---- sessão de comando ao vivo (PeerJS: P2P, sem servidor próprio) ----
  // Modelo: snapshot completo do plano a cada mudança (debounce), estrela
  // via host. Uma "caneta" por vez: só quem a segura edita e transmite; os
  // outros ficam com overlay de leitura e podem pedir a caneta (transfere
  // na hora). Guest entra numa guerra efêmera — a dele fica congelada.
  const LIVE = { peer: null, conns: [], host: false, code: '', myId: '', pen: null, on: false, applying: false, txT: null, follow: true, people: [], name: '', count: 0, viewT: null, lastView: '', canSave: false, pens: [], penLock: false, multi: false, draftT: null, reveal: false };
  function liveGetName() { const el = $('liveNameIn'); let n = (el && el.value || '').trim().slice(0, 20); if (!n) { try { n = (localStorage.getItem('zhi_live_name') || '').slice(0, 20); } catch (e) {} } if (!n) n = t('cmdName'); try { localStorage.setItem('zhi_live_name', n); } catch (e) {} return n; }
  function livePenNames() { const ns = (LIVE.pens || []).map(id => { const p = (LIVE.people || []).find(x => x.id === id); return p && p.name ? p.name : '—'; }); return ns.length ? (ns[0] + (ns.length > 1 ? ' +' + (ns.length - 1) : '')) : ''; }
  // host: recompila e transmite a lista de presentes (contador + nomes + modo seguir)
  function liveWho() { if (!LIVE.host) return; LIVE.count = LIVE.conns.length + 1; LIVE.people = [{ id: LIVE.myId, name: LIVE.name }].concat(LIVE.conns.map(c => ({ id: c.peer, name: c._name || '—' }))); const msg = { t: 'who', n: LIVE.count, people: LIVE.people, follow: LIVE.follow, penLock: LIVE.penLock, multi: LIVE.multi, holders: LIVE.pens }; LIVE.conns.forEach(c => { if (c.open) c.send(msg); }); updateLiveUI(); }
  function liveCode6() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
  function livePeerId(code) { return 'wgp-war-' + String(code || '').trim().toLowerCase(); }
  function livePeerOpts() { try { const o = JSON.parse(localStorage.getItem('zhi_live_server') || 'null'); if (o && o.host) return o; } catch (e) {} return { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }, { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }] } }; }
  function livePenMine() { return !LIVE.on || LIVE.pens.indexOf(LIVE.myId) > -1; }
  function liveViewTick() {
    if (!LIVE.on || !livePenMine() || !LIVE.follow || LIVE.pens[0] !== LIVE.myId) return;
    const sc = stage.scaleX() || 1;
    const v = { t: 'view', sid: state.currentId, scale: sc, cxf: clamp01((VW / 2 - stage.x()) / sc / W), cyf: clamp01((VH / 2 - stage.y()) / sc / H), bd: (rosterModal && !rosterModal.hidden) ? 1 : 0 };
    const key = v.sid + '|' + sc.toFixed(3) + '|' + v.cxf.toFixed(3) + '|' + v.cyf.toFixed(3) + '|' + v.bd;
    if (key === LIVE.lastView) return;
    LIVE.lastView = key;
    LIVE.conns.forEach(c => { if (c.open) c.send(v); });
  }
  function liveScheduleTx() { clearTimeout(LIVE.txT); LIVE.txT = setTimeout(() => { if (!LIVE.on || !livePenMine()) return; const msg = { t: 'state', data: projectData(), holders: LIVE.pens }; LIVE.conns.forEach(c => { if (c.open) c.send(msg); }); }, 250); }
  function liveRelay(m, from) { LIVE.conns.forEach(c => { if (c !== from && c.open) c.send(m); }); }
  function liveSetPens(arr) { LIVE.pens = (arr || []).filter((x, i, a) => x && a.indexOf(x) === i); const msg = { t: 'pen', holders: LIVE.pens }; LIVE.conns.forEach(c => { if (c.open) c.send(msg); }); updateLiveUI(); fillLiveModal(); }
  function liveGrant(id) { liveSetPens(LIVE.multi ? LIVE.pens.concat([id]) : [id]); }
  function liveReqPen() {
    if (!LIVE.on) return;
    if (livePenMine()) {   // largar
      if (LIVE.host) liveSetPens(LIVE.pens.filter(x => x !== LIVE.myId));
      else { const c = LIVE.conns[0]; if (c && c.open) c.send({ t: 'penDrop', from: LIVE.myId }); }
      return;
    }
    if (LIVE.host) { liveGrant(LIVE.myId); toast(t('livePenGot')); }
    else if (!LIVE.penLock) { const c = LIVE.conns[0]; if (c && c.open) c.send({ t: 'penReq', from: LIVE.myId }); }
  }
  // rascunho do board ao vivo: quem edita com o Roster aberto transmite o draft
  function liveDraftTx() { if (!LIVE.on || !livePenMine() || !rosterModal || rosterModal.hidden) return; clearTimeout(LIVE.draftT); LIVE.draftT = setTimeout(() => { if (!LIVE.on || !livePenMine()) return; const msg = { t: 'draft', roster: rosterDraft }; LIVE.conns.forEach(c => { if (c.open) c.send(msg); }); }, 300); }
  function liveOnData(m, conn) {
    if (!m || !m.t) return;
    if (m.t === 'init' || m.t === 'state') {
      LIVE.gotInit = true;
      if (Array.isArray(m.holders)) LIVE.pens = m.holders;
      if (m.n) LIVE.count = m.n;
      if (typeof m.follow === 'boolean') LIVE.follow = m.follow;
      if (typeof m.penLock === 'boolean') LIVE.penLock = m.penLock;
      if (typeof m.multi === 'boolean') LIVE.multi = m.multi;
      const keepSid = (!LIVE.follow && !livePenMine()) ? state.currentId : null;
      LIVE.applying = true; try { if (m.data) applyImported(m.data); } finally { LIVE.applying = false; }
      if (keepSid && keepSid !== state.currentId && state.scenarios.some(s => s.id === keepSid)) selectScenario(keepSid);
      if (LIVE.host && m.t === 'state') liveRelay(m, conn);
      updateLiveUI();
    } else if (m.t === 'pen') { const was = livePenMine(); LIVE.pens = Array.isArray(m.holders) ? m.holders : []; if (LIVE.host) liveRelay(m, conn); if (!was && livePenMine()) toast(t('livePenGot')); updateLiveUI(); }
    else if (m.t === 'penReq' && LIVE.host) { if (!LIVE.penLock) liveGrant(m.from); }
    else if (m.t === 'penDrop' && LIVE.host) liveSetPens(LIVE.pens.filter(x => x !== m.from));
    else if (m.t === 'draft') { if (LIVE.host) liveRelay(m, conn); if (!livePenMine() && LIVE.follow) { rosterDraft = (m.roster || []).map(sanitizePlayer); if (rosterModal && !rosterModal.hidden) refreshRoster(); } }
    else if (m.t === 'perm') { const was = LIVE.canSave; LIVE.canSave = !!m.save; if (LIVE.canSave !== was) toast(LIVE.canSave ? t('livePermOn') : t('livePermOff')); updateLiveUI(); fillLiveModal(); }
    else if (m.t === 'kick' && !LIVE.host) { toast(t('liveKicked')); liveLeave(true); }
    else if (m.t === 'hello' && LIVE.host) { conn._name = String(m.name || '—').slice(0, 20); toast('👥 ' + conn._name + ' ' + t('liveInName') + ' (' + (LIVE.conns.length + 1) + ')'); liveWho(); fillLiveModal(); }
    else if (m.t === 'who') { const prev = LIVE.count; LIVE.count = m.n; if (Array.isArray(m.people)) LIVE.people = m.people; if (typeof m.follow === 'boolean') LIVE.follow = m.follow; if (typeof m.penLock === 'boolean') LIVE.penLock = m.penLock; if (typeof m.multi === 'boolean') LIVE.multi = m.multi; if (Array.isArray(m.holders)) LIVE.pens = m.holders; if (!LIVE.host) { if (prev && m.n > prev) toast('👥 ' + t('liveJoinedN') + ' (' + m.n + ')'); else if (prev && m.n < prev) toast('👥 ' + t('liveLeftN') + ' (' + m.n + ')'); } updateLiveUI(); fillLiveModal(); }
    else if (m.t === 'view') {
      if (LIVE.host) liveRelay(m, conn);
      if (!livePenMine() && LIVE.follow) {
        if (typeof m.bd === 'number' && rosterModal) { if (m.bd && rosterModal.hidden) openRoster(); else if (!m.bd && !rosterModal.hidden) closeRoster(true); }
        if (m.sid && m.sid !== state.currentId && state.scenarios.some(s => s.id === m.sid)) selectScenario(m.sid);
        const sc = Math.max(1, Math.min(4, m.scale || 1));
        stage.scale({ x: sc, y: sc });
        stage.position(clampPos(VW / 2 - (m.cxf || 0.5) * W * sc, VH / 2 - (m.cyf || 0.5) * H * sc, sc));
        stage.batchDraw(); updateStageDrag();
      }
    }
    else if (m.t === 'hi' && LIVE.host) conn.send({ t: 'init', data: projectData(), holders: LIVE.pens, n: LIVE.conns.length + 1, follow: LIVE.follow, penLock: LIVE.penLock, multi: LIVE.multi });
  }
  function liveHost() {
    if (LIVE.on || LIVE.peer || typeof Peer === 'undefined') return;
    LIVE.name = liveGetName();
    const code = liveCode6();
    const p = new Peer(livePeerId(code), livePeerOpts());
    LIVE.peer = p; LIVE.host = true; LIVE.code = code;
    LIVE.connT = setTimeout(() => { if (!LIVE.on) { toast(t('liveErr') + ' (timeout)'); liveTeardown(); fillLiveModal(); } }, 15000);
    p.on('open', id => { LIVE.on = true; LIVE.myId = id; LIVE.pens = [id]; LIVE.count = 1; LIVE.people = [{ id, name: LIVE.name }]; clearTimeout(LIVE.connT); LIVE.viewT = setInterval(liveViewTick, 400); updateLiveUI(); fillLiveModal(); });
    p.on('connection', c => {
      c.on('open', () => { LIVE.conns.push(c); LIVE.count = LIVE.conns.length + 1; c.send({ t: 'init', data: projectData(), holders: LIVE.pens, n: LIVE.count, follow: LIVE.follow, penLock: LIVE.penLock, multi: LIVE.multi }); updateLiveUI(); fillLiveModal(); });
      c.on('data', m => liveOnData(m, c));
      c.on('close', () => { LIVE.conns = LIVE.conns.filter(x => x !== c); if (LIVE.pens.indexOf(c.peer) > -1) liveSetPens(LIVE.pens.filter(x => x !== c.peer).length ? LIVE.pens.filter(x => x !== c.peer) : [LIVE.myId]); toast('👥 ' + (c._name || '—') + ' ' + t('liveOutName') + ' (' + (LIVE.conns.length + 1) + ')'); liveWho(); fillLiveModal(); });
    });
    p.on('error', e => { if (e && e.type === 'unavailable-id') { liveTeardown(); liveHost(); return; } toast(t('liveErr') + ' (' + (e && e.type || '?') + ')'); liveTeardown(); fillLiveModal(); });
    p.on('disconnected', () => { try { if (LIVE.peer) LIVE.peer.reconnect(); } catch (e) {} });
  }
  function liveJoin(code) {
    code = String(code || '').trim(); if (LIVE.on || LIVE.peer || !code || typeof Peer === 'undefined') return;
    LIVE.name = liveGetName();
    const p = new Peer(livePeerOpts());
    LIVE.peer = p; LIVE.host = false; LIVE.code = code.toUpperCase();
    LIVE.connT = setTimeout(() => { if (!LIVE.on) { toast(t('liveErr') + ' (timeout)'); liveTeardown(); fillLiveModal(); } }, 15000);
    p.on('open', myId => {
      LIVE.myId = myId;
      const c = p.connect(livePeerId(code), { reliable: true });
      LIVE.conns = [c];
      c.on('open', () => {
        // congela a guerra atual e cria a efêmera da sessão ANTES do 1º snapshot
        const r = stashCurrentWar(); const id = 'live' + Date.now().toString(36);
        r.list.push({ id, nome: '⚡ ' + t('live'), ts: Date.now(), live: true }); r.cur = id; warsSave(r);
        LIVE.on = true; LIVE.gotInit = false; clearTimeout(LIVE.connT); LIVE.viewT = setInterval(liveViewTick, 400); c.send({ t: 'hello', name: LIVE.name }); updateWarsBtn(); updateLiveUI(); fillLiveModal(); toast(t('liveJoined'));
        let tries = 0; const ask = () => { if (!LIVE.on || LIVE.gotInit || tries++ > 8) return; if (c.open) c.send({ t: 'hi' }); setTimeout(ask, 700); }; ask();
      });
      c.on('data', m => liveOnData(m, c));
      c.on('close', () => { if (LIVE.on) { toast(t('liveHostGone')); liveLeave(true); } });
    });
    p.on('error', e => { toast(t('liveErr') + ' (' + (e && e.type || '?') + ')'); liveTeardown(); fillLiveModal(); });
  }
  function liveTeardown() { LIVE.on = false; clearTimeout(LIVE.txT); clearTimeout(LIVE.connT); clearInterval(LIVE.viewT); LIVE.count = 0; LIVE.people = []; LIVE.follow = true; LIVE.canSave = false; try { liveLayersOn(); setTool(state.tool); } catch (e) {} LIVE.conns.forEach(c => { try { c.close(); } catch (e) {} }); LIVE.conns = []; try { if (LIVE.peer) LIVE.peer.destroy(); } catch (e) {} LIVE.peer = null; LIVE.host = false; LIVE.pens = []; LIVE.penLock = false; LIVE.multi = false; LIVE.code = ''; LIVE.reveal = false; updateLiveUI(); }
  async function liveLeave(hostGone) {
    const wasGuest = LIVE.on && !LIVE.host;
    const canSave = !!LIVE.canSave;
    liveTeardown(); fillLiveModal();
    if (!wasGuest) return;
    const r = warsReg(); const w = r.list.find(x => x.id === r.cur);
    if (!w || !w.live) return;
    if (!canSave) {
      toast(t('liveNoSavePerm'));
      r.list = r.list.filter(x => x.id !== w.id); try { localStorage.removeItem(warSlotKey(w.id)); } catch (e) {} if (!r.list.length) r.list = [{ id: 'w1', nome: 'Guerra 1', ts: Date.now() }]; r.cur = r.list[0].id; warsSave(r); applyImported(loadWarSlot(r.cur)); updateWarsBtn();
      return;
    }
    if (await askConfirm(t('liveKeepCopy'))) { delete w.live; w.nome = w.nome.replace('⚡', '🗒'); w.ts = Date.now(); w.n = state.scenarios.length; warsSave(r); stashCurrentWar(); toast(t('liveCopySaved')); }
    else { r.list = r.list.filter(x => x.id !== w.id); try { localStorage.removeItem(warSlotKey(w.id)); } catch (e) {} if (!r.list.length) r.list = [{ id: 'w1', nome: 'Guerra 1', ts: Date.now() }]; r.cur = r.list[0].id; warsSave(r); applyImported(loadWarSlot(r.cur)); }
    updateWarsBtn();
  }
  function liveLayersOn() { [tokenLayer, objLayer, noteLayer, drawLayer, markLayer, focusLayer].forEach(l => l.listening(true)); }
  function liveApplyLock() {
    if (!LIVE.on) return;
    if (!livePenMine()) { if (state.tool !== 'select') setTool('select'); [tokenLayer, objLayer, noteLayer, drawLayer, markLayer, focusLayer].forEach(l => l.listening(false)); stage.batchDraw(); }
    else { liveLayersOn(); setTool(state.tool); stage.batchDraw(); }
  }
  function placeDockMini() {
    const dm = $('dockMini'), dt = $('drawTools'); if (!dm || !dt || !dm.offsetParent || !dt.offsetParent) return;
    dm.style.left = '';
    const a = dt.getBoundingClientRect(), b = dm.getBoundingClientRect();
    if (a.bottom > b.top - 6 && a.right > b.left) dm.style.left = Math.round(a.right - dm.offsetParent.getBoundingClientRect().left + 12) + 'px';
    placeLiveBar();
  }
  function placeLiveBar() {
    const bar = $('liveBar'); if (!bar || bar.hidden) return;
    const dm = $('dockMini');
    const zb = [...document.querySelectorAll('.zoom-ctrl button')].filter(b => b.offsetParent);
    const L = (dm && dm.offsetParent ? dm.getBoundingClientRect().right : 0) + 14;
    const R = (zb.length ? Math.min.apply(null, zb.map(b => b.getBoundingClientRect().left)) : window.innerWidth) - 14;
    bar.style.maxWidth = Math.max(230, R - L) + 'px';
    bar.style.left = Math.round((L + R) / 2) + 'px';
  }
  function updateLiveUI() {
    const bar = $('liveBar'), ov = $('liveLockOv'), lb = $('liveBtn'); if (!bar) return;
    if (ov) ov.hidden = true;
    if (lb) lb.classList.toggle('primary', LIVE.on);
    if (!LIVE.on) { bar.hidden = true; ['live-locked', 'live-guest', 'live-nosave', 'live-on'].forEach(c => document.body.classList.remove(c)); return; }
    const mine = livePenMine();
    bar.hidden = false; document.body.classList.toggle('live-locked', !mine);
    document.body.classList.toggle('live-guest', !LIVE.host);
    document.body.classList.toggle('live-nosave', !LIVE.host && !LIVE.canSave);
    const tx = $('liveBarTxt'); if (tx) { let s = (LIVE.host ? (LIVE.reveal ? LIVE.code : '••••••') + ' · ' : '') + '👥 ' + (LIVE.count || 1); if (!mine) s += ' · ' + (LIVE.pens.length ? '✏️ ' + livePenNames() : t('livePenFreeS')); tx.textContent = s; }
    const pb = $('livePenBtn'); if (pb) { pb.hidden = !LIVE.host && LIVE.penLock && !mine; pb.classList.toggle('on', mine); }
    const cg = $('liveCfgBtn'); if (cg) cg.hidden = !LIVE.host;
    document.body.classList.add('live-on');
    const fb = $('liveFollowBtn'); if (fb) { fb.hidden = !LIVE.host; fb.classList.toggle('on', LIVE.follow); fb.title = t('liveFollowTitle'); }
    placeLiveBar();
    liveApplyLock();
  }
  function liveShareLink() { return location.origin + location.pathname + '#c=' + LIVE.code; }
  function fillLiveModal() {
    const home = $('liveHome'), st = $('liveStatus'), cn = $('liveConn'); if (!home || !st) return;
    const connecting = !!LIVE.peer && !LIVE.on;
    home.hidden = LIVE.on || connecting; if (cn) cn.hidden = !connecting; st.hidden = !LIVE.on;
    if (LIVE.on) {
      const cd = LIVE.reveal ? LIVE.code : '••••••';
      const inf = $('liveInfo'); if (inf) inf.textContent = LIVE.host ? (t('liveHosting') + ' ' + cd + ' · ' + LIVE.conns.length + ' ' + t('liveConnN')) : (t('liveGuestLbl') + ' ' + cd + ' · 👥 ' + (LIVE.count || 1) + (LIVE.canSave ? ' · 💾 ✓' : ' · 💾 ✗') + (LIVE.penLock ? ' · 🔒' : ''));
      const su = $('liveShareUrl'); if (su) su.value = LIVE.reveal ? liveShareLink() : t('codeHidden');
      const rv = $('liveRevealBtn'); if (rv) rv.classList.toggle('on', LIVE.reveal);
      const pw = $('livePerms'), pl = $('livePermList');
      if (pw && pl) {
        pw.hidden = !LIVE.host;
        if (LIVE.host) {
          let h = '<div class="lvp lvp-opts"><button class="lvp-t' + (LIVE.penLock ? ' on' : '') + '" data-opt="lock">' + t('optPenLock') + '</button><button class="lvp-t' + (LIVE.multi ? ' on' : '') + '" data-opt="multi">' + t('optMulti') + '</button></div>';
          h += '<div class="lvp"><span class="lvp-n">' + (LIVE.pens.indexOf(LIVE.myId) > -1 ? '✏️ ' : '') + esc(LIVE.name) + ' <small>' + t('youLbl') + '</small></span></div>';
          h += LIVE.conns.map((c, i) => { const hasPen = LIVE.pens.indexOf(c.peer) > -1; return '<div class="lvp"><span class="lvp-n">' + (hasPen ? '✏️ ' : '') + esc(c._name || '—') + '</span><button class="lvp-t' + (hasPen ? ' on' : '') + '" data-pen="' + i + '" title="' + esc(t('givePen')) + '">✏️</button><button class="lvp-t' + (c._canSave ? ' on' : '') + '" data-i="' + i + '" title="' + esc(t('liveCanSave')) + '">💾</button><button class="lvp-t lvp-kick" data-kick="' + i + '" title="' + esc(t('kickBtn')) + '">⛔</button></div>'; }).join('');
          pl.innerHTML = h;
          pl.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => { if (b.dataset.opt === 'lock') LIVE.penLock = !LIVE.penLock; else { LIVE.multi = !LIVE.multi; if (LIVE.multi) toast(t('optMultiWarn')); else if (LIVE.pens.length > 1) liveSetPens([LIVE.pens[0]]); } liveWho(); fillLiveModal(); }));
          pl.querySelectorAll('[data-pen]').forEach(b => b.addEventListener('click', () => { const c = LIVE.conns[+b.dataset.pen]; if (!c) return; const has = LIVE.pens.indexOf(c.peer) > -1; if (has) liveSetPens(LIVE.pens.filter(x => x !== c.peer)); else liveGrant(c.peer); fillLiveModal(); }));
          pl.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { const c = LIVE.conns[+b.dataset.i]; if (!c) return; c._canSave = !c._canSave; if (c.open) c.send({ t: 'perm', save: !!c._canSave }); fillLiveModal(); }));
          pl.querySelectorAll('[data-kick]').forEach(b => b.addEventListener('click', async () => { const c = LIVE.conns[+b.dataset.kick]; if (!c) return; if (!await askConfirm(t('kickAsk') + ' ' + (c._name || '—') + '?')) return; try { if (c.open) c.send({ t: 'kick' }); } catch (e) {} setTimeout(() => { try { c.close(); } catch (e) {} }, 200); }));
        }
      }
    }
  }
  async function maybeLoadCommand() { const m = /[#&]c=([A-Za-z0-9]{4,10})/.exec(location.hash); if (!m) return; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} if (!await askConfirm(t('liveJoinAsk'))) return; liveJoin(m[1]); }

  // ---- planos salvos (arquivos JSON no repo, sem banco de dados) ----
  async function loadPlan(slug) {
    let d;
    try { const res = await fetch('./plans/' + slug + '.json', { cache: 'no-store' }); if (!res.ok) throw 0; d = await res.json(); }
    catch (e) { toast(t('planLoadFail')); return; }
    if (await importarComEscolha(d, slug)) toast(t('planLoaded'));
  }
  async function maybeLoadPlan() { const m = /[?&]plan=([\w-]+)/.exec(location.search); if (m) await loadPlan(m[1]); }
  async function openPlansMenu() {
    const menu = $('plansMenu'); if (!menu) return;
    if (!menu.hidden) { menu.hidden = true; return; }
    const hd = '<div class="pm-h">' + t('plans') + '</div>';
    menu.innerHTML = hd + '<div class="pm-empty">…</div>'; menu.hidden = false;
    let list = [];
    try { const res = await fetch('./plans/index.json', { cache: 'no-store' }); if (res.ok) list = await res.json(); } catch (e) {}
    if (!Array.isArray(list) || !list.length) { menu.innerHTML = hd + '<div class="pm-empty">' + t('plansEmpty') + '</div>'; return; }
    menu.innerHTML = hd + list.map(p => '<button class="pm-item" data-slug="' + esc(p.slug) + '"><span class="pm-name">' + esc(p.nome || p.slug) + '</span>' + (p.sub ? '<span class="pm-sub">' + esc(p.sub) + '</span>' : '') + '</button>').join('');
    menu.querySelectorAll('.pm-item').forEach(b => b.addEventListener('click', () => { menu.hidden = true; loadPlan(b.dataset.slug); }));
  }
  let toastT = null; function toast(msg) { toastEl.innerHTML = msg.replace(/✓/g, '<b>✓</b>'); toastEl.hidden = false; requestAnimationFrame(() => toastEl.classList.add('show')); clearTimeout(toastT); toastT = setTimeout(() => { toastEl.classList.remove('show'); setTimeout(() => toastEl.hidden = true, 220); }, 2600); }
  // confirm próprio (o confirm() nativo é bloqueado no iframe do preview)
  function askConfirm(msg, yesLbl, noLbl) { return new Promise(res => { confirmMsg.textContent = msg; confirmYes.textContent = yesLbl || t('btnConfirm'); confirmNo.textContent = noLbl || t('btnCancel'); confirmModal.hidden = false; const done = v => { confirmModal.hidden = true; confirmYes.onclick = confirmNo.onclick = null; res(v); }; confirmYes.onclick = () => done(true); confirmNo.onclick = () => done(false); confirmModal.onclick = e => { if (e.target === confirmModal) done(false); }; }); }

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
    { const lb = $('langBtn'); if (lb) lb.addEventListener('click', cycleLang); }
    { const jb = $('jogosOnBtn'); if (jb) jb.addEventListener('click', async () => {
        const mm = $('moreMenu'); if (mm) mm.hidden = true;
        if (state.jogos.length) { toast(t('jogosJaOn')); return; }
        if (!await askConfirm(t('jogosOnAsk'), t('btnConfirm'), t('btnCancel'))) return;
        // A escalação que já está no board vira o G1, e o G2 nasce como cópia dela.
        ensureJogos(); addJogo(true);
        toast(t('jogosOnOk'));
      }); }
    { const gm = $('gradeModal'), gc = $('gradeClose'), gp = $('gradePng'), gs = $('gradeSwap');
      if (gc) gc.addEventListener('click', () => { gm.hidden = true; });
      if (gm) gm.addEventListener('click', e => { if (e.target === gm) gm.hidden = true; });
      if (gp) gp.addEventListener('click', gradePNG);
      if (gs) gs.addEventListener('click', () => { gradeMode = gradeMode === 'sheet' ? 'pt' : (gradeMode === 'pt' ? 'player' : 'sheet'); renderGrade(); syncGradeSwap(); });
      syncGradeSwap(); }
    ['dragenter', 'dragover'].forEach(evt => cont.addEventListener(evt, e => { if (state.present) return; const ty = Array.from(e.dataTransfer.types); if (!ty.includes('text/plain') && !ty.includes('text/member')) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; mapPanel.classList.add('dragover'); }));
    ['dragleave', 'dragend'].forEach(evt => cont.addEventListener(evt, () => mapPanel.classList.remove('dragover')));
    cont.addEventListener('drop', e => { e.preventDefault(); mapPanel.classList.remove('dragover'); if (state.present) return; stage.setPointersPositions(e); const f = frac() || { xf: 0.5, yf: 0.5 }; const mem = e.dataTransfer.getData('text/member'); if (mem) { try { const o = JSON.parse(mem); detachMember(o.pt, o.nome, o.funcao, f.xf, f.yf); } catch (x) {} return; } const pt = e.dataTransfer.getData('text/plain'); if (pt) placeToken(pt, f.xf, f.yf); });

    stage.on('wheel', e => { e.evt.preventDefault(); const old = stage.scaleX(), pointer = stage.getPointerPosition(); if (!pointer) return; const mp = { x: (pointer.x - stage.x()) / old, y: (pointer.y - stage.y()) / old }; const dir = e.evt.deltaY > 0 ? 1 / 1.12 : 1.12; let ns = Math.max(1, Math.min(4, old * dir)); stage.scale({ x: ns, y: ns }); stage.position(clampPos(pointer.x - mp.x * ns, pointer.y - mp.y * ns, ns)); stage.batchDraw(); updateStageDrag(); hidePopover(); });
    stage.dragBoundFunc(pos => clampPos(pos.x, pos.y, stage.scaleX()));

    stage.on('mousedown touchstart', e => { if (state.present) return; if (DRAW.includes(state.tool)) { e.evt && e.evt.preventDefault && e.evt.preventDefault(); beginDraw(); } else if (state.tool === 'foco') { e.evt && e.evt.preventDefault && e.evt.preventDefault(); beginFocus(); } });
    stage.on('mousemove touchmove', moveDraw);
    stage.on('mousemove touchmove', moveFocus);
    stage.on('mousemove touchmove', () => { if (focusRotDrag) doFocusRotate(); else if (focusResizeDrag) doFocusResize(); });
    stage.on('mousemove touchmove', () => { if (linkTempFrom) { updateLinkTemp(); tokenLayer.batchDraw(); } });
    stage.on('mouseup touchend', endDraw);
    stage.on('mouseup touchend', endFocus);
    stage.on('mouseup touchend', () => { if (focusRotDrag) { focusRotDrag = null; renderFocus(); saveProject(); } if (focusResizeDrag) { focusResizeDrag = null; renderFocus(); saveProject(); } });
    stage.on('click tap', e => { if (linkTempFrom) { if (e.target === stage || e.target === bgImage) { cancelLink(); renderTokens(); } return; } if (carryPickFor) { if (e.target === stage || e.target === bgImage) { carryPickFor = null; document.body.classList.remove('linking'); } return; } if (state.tool === 'marca' && !state.present) { placeMark(); return; } if (state.tool === 'nota' && !state.present) { placeNote(); return; } if (state.tool === 'inimigo' && !state.present) { placeEnemy(); return; } if (state.tool === 'select' && (e.target === stage || e.target === bgImage)) { hidePopover(); closeIconMenu(); if (lastPicked && lastPicked.kind === 'focus') { lastPicked = null; renderFocus(); } } });

    drawTools.querySelectorAll('.dt[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    // flyouts de cor e espessura (só aparecem ao apertar)
    buildWidthOpts();
    if (dtColorBtn) dtColorBtn.addEventListener('click', e => { e.stopPropagation(); const show = dtColorPop.hidden; dtWidthPop.hidden = true; if (show) { positionDtPop(dtColorPop, dtColorBtn); } dtColorPop.hidden = !show; });
    if (dtWidthBtn) dtWidthBtn.addEventListener('click', e => { e.stopPropagation(); const show = dtWidthPop.hidden; dtColorPop.hidden = true; if (show) { positionDtPop(dtWidthPop, dtWidthBtn); } dtWidthPop.hidden = !show; });
    if (dtHexApply) dtHexApply.addEventListener('click', () => { let v = (dtHex.value || '').trim(); if (v && v[0] !== '#') v = '#' + v; if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) { selectDrawColor(v); dtHex.value = ''; } else { dtHex.style.borderColor = 'var(--crimson)'; setTimeout(() => dtHex.style.borderColor = '', 900); } });
    if (dtHex) dtHex.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); dtHexApply.click(); } });
    document.addEventListener('click', e => { if (!e.target.closest('#dtColorPop') && !e.target.closest('#dtColorBtn')) dtColorPop.hidden = true; if (!e.target.closest('#dtWidthPop') && !e.target.closest('#dtWidthBtn')) dtWidthPop.hidden = true; });
    { const mc = $('markClose'); if (mc) mc.addEventListener('click', () => setTool('select')); const cx = $('dtColorX'); if (cx) cx.addEventListener('click', () => { dtColorPop.hidden = true; }); const wx = $('dtWidthX'); if (wx) wx.addEventListener('click', () => { dtWidthPop.hidden = true; }); }
    undoBtn.addEventListener('click', doUndo); redoBtn.addEventListener('click', doRedo); clearDraw.addEventListener('click', clearDrawings);
    { const nt = $('namesTgl'); if (nt) { nt.classList.toggle('on', state.showNames); nt.addEventListener('click', () => { state.showNames = !state.showNames; nt.classList.toggle('on', state.showNames); renderTokens(); saveProject(); }); } }
    { const ft = $('focusTgl'); if (ft) { ft.classList.toggle('on', !focusHidden); ft.addEventListener('click', toggleFocusHidden); } }
    { const as = $('autoSpotTgl'); if (as) { as.classList.toggle('on', autoSpot); as.addEventListener('click', toggleAutoSpot); } }
    { const ss = $('sceneSel'); if (ss) ss.addEventListener('change', () => { if (ss.value && ss.value !== state.currentId) selectScenario(ss.value); }); }
    { const st2 = $('sideTgl'); if (st2) st2.addEventListener('click', cycleSide); }
    // colapsar barra de ferramentas (só ícones) e painel lateral de PTs
    { const dm = $('dtMin'); if (dm) dm.addEventListener('click', () => { const on = !drawTools.classList.contains('mini'); drawTools.classList.toggle('mini', on); try { localStorage.setItem('gp-tools-mini', on ? '1' : '0'); } catch (e) {} }); }
    { const sm = $('sideMin'); if (sm) sm.addEventListener('click', () => { const on = !document.body.classList.contains('side-min'); document.body.classList.toggle('side-min', on); sm.textContent = on ? '«' : '»'; try { localStorage.setItem('gp-side-min', on ? '1' : '0'); } catch (e) {} fit(); applySceneView(cur()); }); }
    { const rt = $('rosterTabs'); if (rt) rt.addEventListener('click', e => { const b = e.target.closest('button[data-rtab]'); if (b) { rosterSideView = b.dataset.rtab; renderSidebar(); } }); }
    objBtn.addEventListener('click', () => toggleObjPanel()); objClose.addEventListener('click', () => toggleObjPanel(false));

    nameInput.addEventListener('input', () => { cur().nome = nameInput.value; syncCard(); saveProject(); });
    if (timeInput) timeInput.addEventListener('input', () => { cur().tempo = timeInput.value.trim(); syncCard(); saveProject(); });
    condInput.addEventListener('input', () => { cur().condicao = condInput.value.trim() || null; syncCard(); saveProject(); });
    noteInput.addEventListener('input', () => { cur().nota = noteInput.value; updateSceneHud(); saveProject(); });
    addScene.addEventListener('click', addScenarioBlank); dupScene.addEventListener('click', duplicateCurrent); { const vb = $('varScene'); if (vb) vb.addEventListener('click', createVariation); }
    seedBtn.addEventListener('click', async () => { if (state.scenarios.some(s => !isPristine(s)) && !await askConfirm(t('confirmSeed'))) return; seedStandard(); });
    { const em = $('exportModal');
      if (em) {
        exportBtn.addEventListener('click', () => { const mm = $('moreMenu'); if (mm) mm.hidden = true; em.hidden = false; });
        em.addEventListener('click', e => { if (e.target === em) em.hidden = true; const b = e.target.closest('button[data-exp]'); if (b) { em.hidden = true; exportProject(b.dataset.exp); } });
        $('exClose').addEventListener('click', () => { em.hidden = true; });
      } else exportBtn.addEventListener('click', () => exportProject('all')); }
    importBtn.addEventListener('click', () => importFile.click());
    { const im = $('importModal');
      if (im) {
        im.addEventListener('click', e => { if (e.target === im) { im.hidden = true; pendingImport = null; } const b = e.target.closest('button[data-imp]'); if (b) { im.hidden = true; importScoped(b.dataset.imp); } });
        $('imClose').addEventListener('click', () => { im.hidden = true; pendingImport = null; });
      } }
    { const wb = $('warsBtn'); if (wb) wb.addEventListener('click', e => { e.stopPropagation(); openWarsMenu(); }); document.addEventListener('click', e => { const m = $('warsMenu'); if (m && !m.hidden && !e.target.closest('.plans-wrap')) m.hidden = true; }); updateWarsBtn(); }
    { const lb = $('liveBtn'), lm = $('liveModal');
      if (lb && lm) {
        lb.addEventListener('click', () => { const ni = $('liveNameIn'); if (ni && !ni.value) { try { ni.value = localStorage.getItem('zhi_live_name') || ''; } catch (e) {} } fillLiveModal(); lm.hidden = false; });
        $('liveCloseBtn').addEventListener('click', () => { lm.hidden = true; });
        lm.addEventListener('click', e => { if (e.target === lm) lm.hidden = true; });
        $('liveHostBtn').addEventListener('click', () => { stashCurrentWar(); liveHost(); fillLiveModal(); });
        $('liveJoinBtn').addEventListener('click', () => { const v = ($('liveCodeIn').value || '').trim(); if (v) { lm.hidden = true; liveJoin(v); } });
        $('liveCodeIn').addEventListener('keydown', e => { if (e.key === 'Enter') $('liveJoinBtn').click(); });
        $('liveCopyBtn').addEventListener('click', async () => { const v = liveShareLink(); let ok = false; try { await navigator.clipboard.writeText(v); ok = true; } catch (e) {} toast(ok ? t('linkCopied') : t('selectCopy')); });
        $('liveLeaveBtn').addEventListener('click', () => { lm.hidden = true; liveLeave(); });
        { const cb = $('liveCancelBtn'); if (cb) cb.addEventListener('click', () => { liveTeardown(); fillLiveModal(); }); }
        { const rv = $('liveRevealBtn'); if (rv) rv.addEventListener('click', () => { LIVE.reveal = !LIVE.reveal; fillLiveModal(); updateLiveUI(); }); }
        $('livePenBtn').addEventListener('click', liveReqPen);
        { const cg = $('liveCfgBtn'); if (cg) cg.addEventListener('click', () => { fillLiveModal(); lm.hidden = false; }); }
        { const fb = $('liveFollowBtn'); if (fb) fb.addEventListener('click', () => { if (!LIVE.host) return; LIVE.follow = !LIVE.follow; LIVE.lastView = ''; toast(LIVE.follow ? t('liveFollowOn') : t('liveFollowOff')); liveWho(); }); }
        $('liveBarLeave').addEventListener('click', () => liveLeave());
        window.addEventListener('resize', placeDockMini);
        { const dtm = $('dtMin'); if (dtm) dtm.addEventListener('click', () => setTimeout(placeDockMini, 60)); }
        setTimeout(placeDockMini, 400);
      } }
    // soltar em qualquer lugar cancela o timer de 5s (o re-render dos 0,4s órfã o handler do token)
    ['pointerup', 'touchend', 'touchcancel', 'mouseup'].forEach(ev => window.addEventListener(ev, () => { clearTimeout(lpTimer2); }, { passive: true }));
    { const hb = $('helpBtn'), hm = $('helpModal'), hc = $('helpClose'); if (hb && hm) { hb.addEventListener('click', () => { guideTab = 'guide'; fillGuide(); hm.hidden = false; }); if (hc) hc.addEventListener('click', () => { hm.hidden = true; }); hm.addEventListener('click', e => { if (e.target === hm) hm.hidden = true; }); document.addEventListener('keydown', e => { if (e.key === 'Escape' && !hm.hidden) hm.hidden = true; }); const gt2 = $('guideTabs'); if (gt2) gt2.addEventListener('click', e => { if (e.target.closest('#tourBtn')) { hm.hidden = true; tourStart(); return; } const tb = e.target.closest('.gt-tab'); if (tb && tb.dataset.gt) { guideTab = tb.dataset.gt; fillGuide(); } }); } }
    importFile.addEventListener('change', e => { const f = e.target.files[0]; if (f) importProjectFile(f); e.target.value = ''; });
    shareBtn.addEventListener('click', () => shareLink(shareScope));
    { const sc = $('shareScopes'); if (sc) sc.addEventListener('click', e => { const b = e.target.closest('button[data-scope]'); if (b) shareLink(b.dataset.scope); }); }
    { const rm = $('resetModal');
      if (rm) {
        resetBtn.addEventListener('click', () => { const mm = $('moreMenu'); if (mm) mm.hidden = true; rm.hidden = false; });
        rm.addEventListener('click', e => { if (e.target === rm) rm.hidden = true; });
        $('rsClose').addEventListener('click', () => { rm.hidden = true; });
        $('rsAll').addEventListener('click', () => { rm.hidden = true; resetAll(); });
        $('rsBoard').addEventListener('click', () => { rm.hidden = true; resetBoard(); });
        $('rsObj').addEventListener('click', () => { rm.hidden = true; resetObjectives(); });
      } else resetBtn.addEventListener('click', resetAll); }
    { const mb = $('moreBtn'), mm = $('moreMenu');
      if (mb && mm) {
        mb.addEventListener('click', e => { e.stopPropagation(); const w = $('warsMenu'); if (w) w.hidden = true; mm.hidden = !mm.hidden; });
        mm.addEventListener('click', e => { if (e.target.closest('.tbtn')) mm.hidden = true; });
        document.addEventListener('click', e => { if (!mm.hidden && !e.target.closest('.plans-wrap')) mm.hidden = true; });
      } }
    { const nt = $('noteTgl'), nw = $('noteWrap');
      if (nt && nw) nt.addEventListener('click', () => { nw.hidden = !nw.hidden; if (!nw.hidden) noteInput.focus(); }); }
    shareClose.addEventListener('click', () => shareModal.hidden = true);
    shareModal.addEventListener('click', e => { if (e.target === shareModal) shareModal.hidden = true; });
    shareCopy.addEventListener('click', async () => { shareUrl.focus(); shareUrl.select(); let ok = false; try { await navigator.clipboard.writeText(shareUrl.value); ok = true; } catch (e) {} if (!ok) { try { ok = document.execCommand('copy'); } catch (e) {} } toast(ok ? 'Link copiado ✓' : 'Selecione tudo e copie (Ctrl+C)'); });
    { const od = $('objDump'); if (od) od.addEventListener('click', dumpPositions); }
    $('zoomIn').addEventListener('click', () => zoomBy(1.25)); $('zoomOut').addEventListener('click', () => zoomBy(0.8)); $('zoomReset').addEventListener('click', zoomReset);
    { const zs = $('zoomSave'); if (zs) zs.addEventListener('click', toggleSceneView); }
    { const ft2 = $('fillTgl'); if (ft2) ft2.addEventListener('click', toggleCanvasFill); }
    { const ht = $('hudTgl'); if (ht) { let on = true; try { on = localStorage.getItem('gp-hud') !== '0'; } catch (e) {} ht.classList.toggle('on', on); ht.addEventListener('click', toggleHud); } }
    presentBtn.addEventListener('click', enterPresent); exitBtn.addEventListener('click', exitPresent);
    prevBtn.addEventListener('click', () => go(-1)); nextBtn.addEventListener('click', () => go(1));
    miniPrev.addEventListener('click', () => go(-1)); miniNext.addEventListener('click', () => go(1));
    fasesBtn.addEventListener('click', () => setDock(!document.body.classList.contains('fases-open')));
    dockCollapse.addEventListener('click', () => setDock(false));
    dockExpand.addEventListener('click', () => setDock(true));

    document.addEventListener('keydown', e => {
      if (tourIdx >= 0) { if (e.key === 'Escape') tourEnd(); else if (e.key === 'ArrowRight' || e.key === 'Enter') tourNext(1); else if (e.key === 'ArrowLeft') tourNext(-1); e.preventDefault(); return; }
      if (!confirmModal.hidden) { if (e.key === 'Escape') { confirmNo.onclick && confirmNo.onclick(); } return; }
      if (!ptModal.hidden) { if (e.key === 'Escape') closePtEditor(); return; }
      if (!rosterModal.hidden) { if (e.key === 'Escape') closeRoster(); else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName)) { e.preventDefault(); bdUndo(); } return; }
      if (LIVE.on && !livePenMine()) return;   // sem a caneta, teclado de edição fica travado
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
      if (state.present) { if (e.key === 'Escape') exitPresent(); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); } return; }
      if (e.key === 'Escape' && linkTempFrom) { cancelLink(); renderTokens(); return; }
      if (e.key === 'Escape' && carryPickFor) { carryPickFor = null; document.body.classList.remove('linking'); return; }
      if (e.key === 'Escape' && iconMenu && !iconMenu.hidden) { closeIconMenu(); return; }
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') { doCopy(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { e.preventDefault(); doPaste(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && lastPicked) { e.preventDefault(); doDeleteSelected(); return; }
      const map = { v: 'select', a: 'seta', l: 'linha', d: 'livre', r: 'retangulo', i: 'marca', n: 'nota' }; if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && state.present) exitPresent(); });

    rosterBtn.addEventListener('click', () => { if (isMobile()) document.body.classList.toggle('mob-roster'); else openRoster(); }); editRosterBtn.addEventListener('click', openRoster); rosterClose.addEventListener('click', closeRoster);
    { const rmc = $('rosterMClose'); if (rmc) rmc.addEventListener('click', () => document.body.classList.remove('mob-roster')); }
    rosterModal.addEventListener('click', e => { if (e.target === rosterModal) closeRoster(); });
    parseBtn.addEventListener('click', () => { const parsed = parseRoster(rosterPaste.value); if (!parsed.length) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = t('rosterNone'); return; } pushBdUndo(); rosterDraft = preserveIdentity(parsed); parseMsg.className = 'parse-msg ok'; parseMsg.textContent = parsed.length + ' ' + t('rosterOk'); renderGrid(); });
    if (mergeBtn) mergeBtn.addEventListener('click', () => { const parsed = parseRoster(rosterPaste.value); if (!parsed.length) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = t('rosterNone'); return; } pushBdUndo(); const r = mergeRoster(parsed); parseMsg.className = 'parse-msg ok'; parseMsg.textContent = r.kept + ' ' + t('mKept') + ' · ' + r.added + ' ' + t('mAdded') + ' · ' + r.removed + ' ' + t('mRemoved'); renderGrid(); });
    { const rl = $('rhLink'), rs = $('rhSync'); if (rs) rs.addEventListener('click', async () => {
      const v = (rl && rl.value || '').trim(); const id = rhEventId(v);
      if (!id) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = t('rhNoLink'); return; }
      if (v !== state.rhEvent) { state.rhEvent = v; saveProject(); }
      parseMsg.className = 'parse-msg'; parseMsg.textContent = '…';
      let parsed; try { parsed = await fetchRaidHelper(id); } catch (e) { parseMsg.className = 'parse-msg err'; parseMsg.textContent = t('rhFail'); return; }
      if (!rosterDraft.length) { rosterDraft = parsed; parseMsg.className = 'parse-msg ok'; parseMsg.textContent = parsed.length + ' ' + t('rosterOk'); }
      else { const r = mergeRoster(parsed); parseMsg.className = 'parse-msg ok'; parseMsg.textContent = r.kept + ' ' + t('mKept') + ' · ' + r.added + ' ' + t('mAdded') + ' · ' + r.removed + ' ' + t('mRemoved'); }
      refreshRoster();
    }); }
    autoBtn.addEventListener('click', autoAssign);
    bdAuto.addEventListener('click', autoAssign);
    bdClearPt.addEventListener('click', () => { pushBdUndo(); rosterDraft.forEach(p => { p.pt = null; p.reserva = false; }); refreshRoster(); });
    { const bg = $('bdGroup'); if (bg) bg.addEventListener('click', () => { bdGroupClass = !bdGroupClass; bg.classList.toggle('on', bdGroupClass); renderBoard(); }); }
    { const bs = $('bdShare'); if (bs) bs.addEventListener('click', shareBoardLink); }
    { const bd = $('bdDisc'); if (bd) bd.addEventListener('click', copyBoardDiscord); }
    { const bj = $('bdSaveJson'); if (bj) bj.addEventListener('click', () => {
      const data = { app: 'zhi-board', v: 1, roster: rosterDraft.map(p => Object.assign({}, p)), ptDesc: state.ptDesc, ptIcon: state.ptIcon };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob), d = new Date(), pad = n => String(n).padStart(2, '0');
      const a = document.createElement('a'); a.href = url; a.download = 'board-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast(t('bdSaved'));
    }); }
    viewToggle.addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) setRosterView(b.dataset.view); });
    rosterBoard.addEventListener('dragstart', e => { const c = e.target.closest('.bd-chip'); if (c) { bdDragId = c.dataset.id; c.classList.add('dragging'); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.dataset.id); } catch (_) {} if (bdPop) bdPop.hidden = true; } });
    rosterBoard.addEventListener('dragend', () => { rosterBoard.querySelectorAll('.dragging').forEach(x => x.classList.remove('dragging')); rosterBoard.querySelectorAll('.bd-zone.over').forEach(z => z.classList.remove('over')); });
    rosterBoard.addEventListener('dragover', e => { bdAutoScroll(e); const z = e.target.closest('.bd-zone'); if (z) { e.preventDefault(); try { e.dataTransfer.dropEffect = 'move'; } catch (_) {} rosterBoard.querySelectorAll('.bd-zone.over').forEach(x => { if (x !== z) x.classList.remove('over'); }); z.classList.add('over'); } });
    rosterBoard.addEventListener('drop', e => { const z = e.target.closest('.bd-zone'); if (z && bdDragId) { e.preventDefault(); bdMove(bdDragId, z.dataset.zone); } bdDragId = null; });
    rosterBoard.addEventListener('click', e => {
      if (e.target.closest('.bd-allres')) { pushBdUndo(); rosterDraft.forEach(p => { if (!p.pt && !p.reserva && !p.ausente) p.reserva = true; }); refreshRoster(); return; }
      const ob = e.target.closest('.bd-obs-btn') || e.target.closest('.bd-obs-line'); if (ob) { const card = ob.closest('.bd-pt-card'); if (card) { card.classList.toggle('obs-edit'); const inp = card.querySelector('.bd-obs'); if (inp && card.classList.contains('obs-edit')) inp.focus(); } return; }
      const cg = e.target.closest('.bd-cgh'); if (cg) { const k = cg.dataset.cg; if (bdClassCollapsed.has(k)) bdClassCollapsed.delete(k); else bdClassCollapsed.add(k); renderBoard(); return; }
      const c = e.target.closest('.bd-chip'); if (c) openBdPop(c.dataset.id, c);
    });
    bdPop.addEventListener('click', e => {
      const p = rosterDraft.find(x => x.id === bdPopId); if (!p) return;
      const pt = e.target.closest('.bp-p'), r = e.target.closest('.bp-r'), ro = e.target.closest('.bp-ro'), tg = e.target.closest('.bp-t'), f = e.target.closest('.bp-f'), fx = e.target.closest('.bp-fix');
      if (pt || r || ro || tg || f || fx) pushBdUndo();
      if (fx) { if (p.fix) delete p.fix; else if (p.pt) p.fix = p.pt; fx.classList.toggle('active', !!p.fix); refreshRoster(); return; }
      if (pt) { p.pt = pt.dataset.pt || null; if (p.pt) p.reserva = false; bdPop.querySelectorAll('.bp-p').forEach(x => x.classList.toggle('active', (x.dataset.pt || '') === (p.pt || ''))); refreshRoster(); }
      else if (r) { p.funcao = r.dataset.role; bdPop.querySelectorAll('.bp-r').forEach(x => x.classList.toggle('active', x.dataset.role === p.funcao)); refreshRoster(); }
      else if (ro) { const v = ro.dataset.ro || ''; if (v) { p.replaceOf = v; p.replace = true; } else { delete p.replaceOf; p.replace = false; } bdPop.querySelectorAll('.bp-ro').forEach(x => x.classList.toggle('active', (x.dataset.ro || '') === (p.replaceOf || ''))); refreshRoster(); }
      else if (tg) { const val = tg.dataset.tag; p.tags = memTags(p).slice(); delete p.tag2; if (!val) { p.tags = []; } else { const i = p.tags.indexOf(val); if (i >= 0) p.tags.splice(i, 1); else p.tags.push(val); } bdPop.querySelectorAll('.bp-t').forEach(x => x.classList.toggle('active', x.dataset.tag ? p.tags.indexOf(x.dataset.tag) >= 0 : !p.tags.length)); refreshRoster(); }
      else if (f) { const id = f.dataset.flag; p.flags = p.flags || []; const i = p.flags.indexOf(id); if (i >= 0) p.flags.splice(i, 1); else p.flags.push(id); f.classList.toggle('active', p.flags.indexOf(id) >= 0); refreshRoster(); }
    });
    rosterBoard.addEventListener('input', e => { const o = e.target.closest('.bd-obs'); if (o) { const pid = o.dataset.pt, v = o.value.trim(); if (v) state.ptDesc[pid] = v; else delete state.ptDesc[pid]; saveProject(); renderSidebar(); } });
    document.addEventListener('click', e => { if (bdPop && !bdPop.hidden && !e.target.closest('#bdPop') && !e.target.closest('.bd-chip')) bdPop.hidden = true; });
    rosterClear2.addEventListener('click', async () => { if (await askConfirm(t('confirmClearPlayers'))) { pushBdUndo(); rosterDraft = []; renderGrid(); } });
    // editor de PT
    peClose.addEventListener('click', closePtEditor);
    ptModal.addEventListener('click', e => { if (e.target === ptModal) closePtEditor(); });
    peDesc.addEventListener('input', () => { if (editingPt) { state.ptDesc[editingPt] = peDesc.value.trim(); if (!state.ptDesc[editingPt]) delete state.ptDesc[editingPt]; renderSidebar(); saveProject(); } });
    peAddBtn.addEventListener('click', () => { const id = peAddSel.value; if (!id) return; const pl = state.roster.find(x => x.id === id); if (pl) { pl.pt = editingPt; pl.reserva = false; saveProject(); renderSidebar(); renderTokens(); renderPtEditor(); } });
    rosterGrid.addEventListener('change', e => { const row = e.target.closest('.rrow'); if (!row) return; const p = rosterDraft[+row.dataset.i]; if (!p) return; pushBdUndo(); if (e.target.classList.contains('f-fn')) p.funcao = e.target.value; else if (e.target.classList.contains('f-pt')) p.pt = e.target.value || null; else if (e.target.classList.contains('f-res')) p.reserva = e.target.checked; renderGrid(); });
    rosterGrid.addEventListener('click', e => { if (!e.target.classList.contains('rdel')) return; const row = e.target.closest('.rrow'); if (!row) return; pushBdUndo(); rosterDraft.splice(+row.dataset.i, 1); renderGrid(); });
    rosterSave.addEventListener('click', () => { const moved = applyRosterDraft(); saveMsg.className = 'parse-msg ok'; saveMsg.textContent = t('rosterSaved') + (moved ? ' · ' + moved + ' ' + t('posInherited') : ''); setTimeout(() => closeRoster(true), 500); });

    let raf = null; const relayout = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }; new ResizeObserver(relayout).observe(mapPanel); window.addEventListener('resize', relayout);
  }
  function setDock(open) { document.body.classList.toggle('fases-open', open); fasesBtn.classList.toggle('on', open); updateMini(); }

  // ---- persistência ----
  function saveProject() { stashJogoAtual(); try { localStorage.setItem(CFG.projectKey, JSON.stringify({ v: 6, currentId: state.currentId, scenarios: state.scenarios, roster: state.roster, ptDesc: state.ptDesc, ptIcon: state.ptIcon, objetivoPosGlobal: state.objetivoPosGlobal, gates: state.gates, side: state.side, showNames: state.showNames, rhEvent: state.rhEvent || '', jogos: state.jogos, jogoAtual: state.jogoAtual })); } catch (e) {} if (LIVE.on && !LIVE.applying && livePenMine()) liveScheduleTx(); }
  function loadProject() { try { const raw = localStorage.getItem(CFG.projectKey); if (raw) { const d = JSON.parse(raw); if (Array.isArray(d.scenarios) && d.scenarios.length) { state.scenarios = d.scenarios.map(sanitizeScenario); state.currentId = d.currentId && state.scenarios.some(s => s.id === d.currentId) ? d.currentId : state.scenarios[0].id; if (Array.isArray(d.roster)) state.roster = d.roster.map(sanitizePlayer); state.objetivoPosGlobal = sanitizePosMap(d.objetivoPosGlobal); state.gates = sanitizePosMap(d.gates); state.side = (d.side === 'blue' || d.side === 'red') ? d.side : null; state.ptDesc = sanitizeDesc(d.ptDesc); state.ptIcon = sanitizeDesc(d.ptIcon); if (typeof d.showNames === 'boolean') state.showNames = d.showNames; if (typeof d.rhEvent === 'string') state.rhEvent = d.rhEvent; if (Array.isArray(d.jogos)) { state.jogos = d.jogos.map(sanitizeJogo); state.jogoAtual = state.jogos.some(j => j.id === d.jogoAtual) ? d.jogoAtual : (state.jogos[0] ? state.jogos[0].id : null); } return; } } } catch (e) {} const s = newScenario({ fase: 'Start', nome: 'Start (30m)' }); state.scenarios = [s]; state.currentId = s.id; }
  function sanitizeScenario(s) { return { id: s.id || uid(), fase: s.fase || 'Cenário', nome: s.nome || 'Cenário', condicao: s.condicao || null, tempo: (typeof s.tempo === 'string' ? s.tempo.slice(0, 8) : (typeof s.tempo === 'number' ? String(s.tempo) : '')), tokens: Array.isArray(s.tokens) ? s.tokens.filter(t => partyById.has(t.pt)).map(t => { const o = { pt: t.pt, xf: clamp01(t.xf), yf: clamp01(t.yf) }; if (typeof t.hp === 'number' && t.hp >= 0 && t.hp < 100) o.hp = Math.round(t.hp); return o; }) : [], desenhos: Array.isArray(s.desenhos) ? s.desenhos.filter(d => d && Array.isArray(d.pontos)).map(d => ({ id: d.id || uid(), tipo: d.tipo, pontos: d.pontos.map(p => [clamp01(p[0]), clamp01(p[1])]), cor: d.cor || '#FFC21A', largura: d.largura || 3 })) : [], objetivos: (s.objetivos && typeof s.objetivos === 'object') ? Object.fromEntries(Object.keys(s.objetivos).filter(k => objById.has(k) && s.objetivos[k]).map(k => [k, true])) : {}, objetivoPos: (s.objetivoPos && typeof s.objetivoPos === 'object') ? Object.fromEntries(Object.entries(s.objetivoPos).filter(([k, v]) => objById.has(k) && v).map(([k, v]) => [k, { x: clamp01(v.x), y: clamp01(v.y) }])) : {}, destacados: Array.isArray(s.destacados) ? s.destacados.filter(d => partyById.has(d.pt)).map(d => { const o = { id: d.id || uid(), pt: d.pt, nome: String(d.nome || '—'), funcao: ['Tank', 'DPS', 'Healer'].includes(d.funcao) ? d.funcao : 'DPS', xf: clamp01(d.xf), yf: clamp01(d.yf) }; if (typeof d.hp === 'number' && d.hp >= 0 && d.hp < 100) o.hp = Math.round(d.hp); if (d.dead) o.dead = true; if (d.hideName) o.hideName = true; if (d.locked) o.locked = true; if (d.nameSide) o.nameSide = true; if (d.chicken) o.chicken = true; return o; }) : [], links: Array.isArray(s.links) ? s.links.filter(l => l && typeof l.a === 'string' && typeof l.b === 'string' && l.a !== l.b).map(l => ({ id: l.id || uid(), a: l.a, b: l.b })) : [], objHp: (s.objHp && typeof s.objHp === 'object') ? Object.fromEntries(Object.entries(s.objHp).filter(([k, v]) => objById.has(k) && typeof v === 'number' && v >= 0 && v <= 100).map(([k, v]) => [k, Math.round(v)])) : {}, hideMeters: (s.hideMeters && typeof s.hideMeters === 'object') ? Object.fromEntries(Object.entries(s.hideMeters).filter(([k, v]) => objById.has(k) && v).map(([k]) => [k, true])) : {}, objBuffs: (s.objBuffs && typeof s.objBuffs === 'object') ? Object.fromEntries(Object.entries(s.objBuffs).filter(([k, v]) => objById.has(k) && Array.isArray(v)).map(([k, v]) => [k, v.filter(x => typeof x === 'string')])) : {}, treeCarry: (s.treeCarry && typeof s.treeCarry === 'object') ? Object.fromEntries(Object.entries(s.treeCarry).filter(([k, v]) => objById.has(k) && Array.isArray(v)).map(([k, v]) => [k, v.filter(x => typeof x === 'string').slice(0, 2)])) : {}, notas: Array.isArray(s.notas) ? s.notas.filter(n => n && typeof n.text === 'string').map(n => ({ id: n.id || uid(), x: clamp01(n.x), y: clamp01(n.y), text: String(n.text).slice(0, 240), size: (typeof n.size === 'number' && n.size >= 0.4 && n.size <= 2.2) ? n.size : 1, color: (typeof n.color === 'string' && /^#[0-9a-f]{6}$/i.test(n.color)) ? n.color : undefined })) : [], enemies: Array.isArray(s.enemies) ? s.enemies.map(e => ({ id: e.id || uid(), x: clamp01(e.x), y: clamp01(e.y), n: Math.max(0, Math.min(99, parseInt(e.n) || 0)), label: typeof e.label === 'string' ? e.label.slice(0, 24) : '' })) : [], marcas: Array.isArray(s.marcas) ? s.marcas.filter(m => m && (m.kind === 'emoji' || (m.kind === 'asset' && CFG.assets.icons[m.val])) && typeof m.val === 'string').map(m => ({ id: m.id || uid(), x: clamp01(m.x), y: clamp01(m.y), kind: m.kind, val: String(m.val).slice(0, 8) })) : [], focus: (function(f){ var a = Array.isArray(f) ? f : (f && typeof f === 'object' ? [f] : []); return a.filter(function(x){ return x && x.w > 0 && x.h > 0; }).map(function(x){ var o = { x: clamp01(x.x), y: clamp01(x.y), w: clamp01(x.w), h: clamp01(x.h) }; if (typeof x.rot === 'number' && x.rot) o.rot = ((Math.round(x.rot) % 360) + 360) % 360; if (x.shape === 'ellipse') o.shape = 'ellipse'; return o; }); })(s.focus), varOf: typeof s.varOf === 'string' ? s.varOf : null, varLabel: typeof s.varLabel === 'string' ? s.varLabel.slice(0, 4) : null, view: (s.view && typeof s.view === 'object' && typeof s.view.scale === 'number') ? { scale: Math.max(1, Math.min(4, s.view.scale)), cxf: clamp01(s.view.cxf), cyf: clamp01(s.view.cyf) } : undefined, fill: s.fill ? true : undefined, nota: typeof s.nota === 'string' ? s.nota : '' }; }
  function sanitizePlayer(p) { const funcao = ['Tank', 'DPS', 'Healer'].includes(p.funcao) ? p.funcao : 'DPS'; const flagIds = (CFG.specialFlags || []).map(f => f.id); return { id: p.id || uid(), nome: String(p.nome || '—'), classe: String(p.classe || funcao), funcao, status: p.status || 'primary', ausente: !!p.ausente, reserva: !!p.reserva, pt: PT_IDS.includes(p.pt) ? p.pt : null, tags: (Array.isArray(p.tags) ? p.tags : (p.tag2 ? [p.tag2] : [])).filter(tg => (CFG.secondaryTags || []).includes(tg)), flags: Array.isArray(p.flags) ? p.flags.filter(f => flagIds.includes(f)) : [], replace: !!p.replace, replaceOf: (typeof p.replaceOf === 'string' && p.replaceOf.trim()) ? String(p.replaceOf).slice(0, 40) : undefined, disc: (typeof p.disc === 'string' && /^\d{5,20}$/.test(p.disc)) ? p.disc : undefined, fix: PT_IDS.includes(p.fix) ? p.fix : undefined, signupAusente: p.signupAusente ? true : undefined, nota: typeof p.nota === 'string' ? p.nota : '' }; }
})();
