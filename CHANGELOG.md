# Changelog — Zhi Guides · Wanted

Cada versão corresponde ao `?v=` dos scripts do Game Plan (cache-buster que força o navegador a baixar o código novo).
Os 10 primeiros commits são anteriores ao versionamento (marcados como —). O detalhe completo de cada mudança está na mensagem do commit (`git show <hash>`).

| Versão | Data | Mudança | Commit |
|---|---|---|---|
| — | 20/07/2026 | Estrategia: etapa 1 do mapa interativo de GvG (casca + mapa + tokens de PT) | `9775483` |
| — | 20/07/2026 | Estrategia: etapas 2-3 (cenarios + nota + modo apresentacao) | `ff5989b` |
| — | 20/07/2026 | Estrategia: etapa 5 (roster + parse do Discord) e otimizacao de layout | `874a6d9` |
| — | 20/07/2026 | Estrategia: etapa 6 (export/import JSON do plano) | `da2e6f8` |
| — | 20/07/2026 | Estrategia: etapa 4 (desenho, objetivos por cenario, destacar membro) + mapa novo + compartilhar por link | `ecc0e9f` |
| — | 20/07/2026 | Estrategia: ajustes de UX (zoom, tamanhos, links, contador da arvore, ocultar fases) | `70beda5` |
| — | 20/07/2026 | Estrategia: lote de ajustes de UX + mapa v2 (grama ate a borda) | `9ee6cd8` |
| — | 20/07/2026 | Estrategia: remapear objetivos + calibracao + zoom + corte + icones de classe | `df49b5a` |
| — | 20/07/2026 | Estrategia: editor de PT, confirm proprio, icones centrados, aviso/tracejado | `4dbd7a3` |
| — | 20/07/2026 | Estrategia: marcadores limpos, Fases em painel no topo, icone/galeria de PT | `369a494` |
| v12 | 21/07/2026 | Estrategia: editar PT no popover, objetivos (marcar todos + colapsar), share copiavel, no-cache | `3db3992` |
| v13 | 21/07/2026 | estrategia: ícones de torre 1.25x e boss 1.5x + botão "Copiar posições" | `dd15887` |
| v14 | 21/07/2026 | estrategia: calibra objetivos no mapa + torres espelhadas + flip azul | `73691fa` |
| v15 | 21/07/2026 | menu+estrategia: renomeia para "Game Plan", reordena ferramentas, flag no outpost | `567a89e` |
| v16 | 21/07/2026 | timer: modelo regressivo + agendamento; jungle usa ícone Fun Coin | `ea12569` |
| v17 | 21/07/2026 | gameplan: ferramenta Ícone — carimbar assets e emojis no mapa | `02df2d9` |
| v17 | 21/07/2026 | mobile: corrige cards de guia (overflow) e compacta topbar do Game Plan | `47ab756` |
| v18 | 21/07/2026 | gameplan: montador visual de PTs (drag-and-drop) + tarjas e flags | `12f7bc5` |
| v19 | 21/07/2026 | Game Plan: adiciona i18n PT/ES/EN (seletor de idioma + tradução do chrome, sidebar, roster, board e modais) | `05b785b` |
| v19 | 21/07/2026 | Game Plan mobile: seletor de idioma acessível no mobile + marca sem truncar + traduz dica de zoom | `3fd4e1c` |
| v20 | 21/07/2026 | Game Plan: vínculos genéricos entre ícones (PT/objetivo/membro) apagáveis + HP por objetivo (torre/ganso/boss…) via menu ao tocar no ícone | `96c3fe8` |
| v21 | 21/07/2026 | Game Plan: mobile editável (não só visualização) — ações essenciais na topbar, ferramentas de desenho, gaveta de PTs com toque-pra-posicionar, objetivos/fases em folha inferior | `daf4c3d` |
| v22 | 21/07/2026 | Game Plan: Board redesenhado (tela grande, ícones de classe, 1 jogador por linha, reservas dentro da PT + gerais, observações por PT, função editável) + reduz tamanho dos ícones carimbáveis | `2cb0ef5` |
| v23 | 21/07/2026 | Game Plan mapa: seta de vínculo para na borda do ícone + sombra; HP com mais contraste; vínculo encadeia (leque) da mesma origem; player mais leve + fundo translúcido; HP/Morto no membro e HP na PT; z-order do último selecionado; toggle mostrar/ocultar nomes; ícones carimbados menores | `4d2e309` |
| v24 | 21/07/2026 | Game Plan Board: layout 3x2 com as 6 PTs visíveis + painel lateral de disponíveis/reservas pra arrastar; seletor de PT e marca 'Replace' no popover do jogador; botão para jogar todos os disponíveis pra reserva | `d71688b` |
| v25 | 21/07/2026 | Game Plan: barra de desenho compacta (cor e espessura abrem só ao apertar, +cores e seletor HEX); ferramenta de anotação/post-it no mapa | `868d749` |
| v26 | 21/07/2026 | Game Plan: ícone de Outpost (asset da guild) no lugar do emoji; buffs ativáveis na torre (City Protection / You Got a Problem) e ganso (City Protection / Hair Pulling) com selo no mapa; ícones de PT com assets do jogo (Tank/DPS/Healer/Boss/Ganso/Árvore/JG/Outpost); tarja secundária discreta à esquerda do nome; 'Tank' como tarja secundária | `55f773e` |
| v27 | 21/07/2026 | Game Plan: buffs da árvore (Sprint/Relentless) + ícones de buff corrigidos (escudo=City Protection, espada=dano); caminho da árvore vai até o portão inimigo com ponto arrastável (333m recalibrável); Carry da árvore (até 2 players que seguem a árvore); Board otimizado — cabe as 6 PTs de uma vez (sem legenda/subtítulo, observações atrás do lápis, reservas da PT compactas) | `25a42e5` |
| v28 | 21/07/2026 | Game Plan: 'Copiar posições' agora inclui os portões da árvore (state.gates) + título claro no modal e fallback de cópia (execCommand + instrução manual) | `0d88ed5` |
| v29 | 21/07/2026 | Game Plan: portão da árvore calibrado (posição da guild); token do mapa mais limpo (ícone preenche o anel, sem círculo escuro grande; nome discreto sem borda torta); Board — tarja secundária depois do nome, múltiplas funções secundárias por player (+Fan/Healer/DPS) | `61cc8aa` |
| v30 | 21/07/2026 | Game Plan: selos de buff agora visíveis (disco com anel dourado + ícone maior) — antes ficavam minúsculos e sumiam no ganso/árvore/torre | `67f6c60` |
| v31 | 22/07/2026 | Game Plan: selos de buff menores, mais colados no ícone e com fundo mais leve; token de PT com fundo translúcido (menos pesado, nome com sombra pra legibilidade) | `a2d42dc` |
| v32 | 22/07/2026 | Game Plan: objetivos por cima de setas/nomes (não são mais tapados); selo 'Nosso lado' (Azul/Oeste ou Vermelho/Leste) com destaque leve da nossa metade; token de inimigo (vermelho, com quantidade e nome) via ferramenta de desenho | `677a931` |
| v33 | 22/07/2026 | Game Plan: segurar (long-press) num player mostra/oculta o nome dele; 1 toque abre o menu (com botão 'Nome no mapa'); 2 toques exclui — nome por token, respeitando o toggle global | `f9ee507` |
| v34 | 22/07/2026 | Game Plan: ícones de PT menores; info de mecânica ao tocar no objetivo (JG=780 fun coins ao matar; torre=200 fun coins/30s; ganso libera após 1 torre cair e perde dano/resistência por torre; árvore libera após o ganso morrer) | `7ac1c97` |
| v35 | 22/07/2026 | Game Plan: objetivos travados por padrão (destravar no menu pra mover, com anel tracejado indicando); indicador de lado mais discreto (glow suave só na nossa borda, sem tint na metade do mapa) | `6559697` |
| v36 | 22/07/2026 | Game Plan: aba Players na sidebar (arrasta player direto pro mapa, toque-pra-posicionar no mobile); Board com 'Por classe' — agrupa Disponíveis/Reservas em grupos de classe colapsáveis | `013e83c` |
| v37 | 22/07/2026 | Game Plan: selos de buff sem o círculo/anel — só o ícone com sombra atrás, menor e colado no topo do objetivo | `88729e9` |
| v38 | 22/07/2026 | GamePlan: buff icons visíveis, menu de edição arrastável, lock por player | `9cbea8d` |
| v39 | 22/07/2026 | GamePlan: selos de buff desenhados (SVG) no lugar de emoji | `86fd4ce` |
| v40 | 22/07/2026 | GamePlan: performance — desliga perfectDraw/shadowForStroke (pan ~780x mais leve) | `850b6f0` |
| v41 | 22/07/2026 | GamePlan: nome do player menor/discreto, torre -25% e HP dentro do ícone | `01f8f3c` |
| v42 | 22/07/2026 | GamePlan: 2 carries da árvore não borram mais os nomes | `dee6bb5` |
| v43 | 22/07/2026 | GamePlan: selo de HP da torre bem mais compacto | `3ac3d7e` |
| v44 | 22/07/2026 | GamePlan: ícone de inimigo, boot mais leve, toolbar mobile compacta | `aa66ab6` |
| v45 | 22/07/2026 | GamePlan: nomes legíveis, boss -25%, carries juntos, links visíveis, controle de lado | `17196dd` |
| v46 | 22/07/2026 | GamePlan: ferramenta de Foco (spotlight) + persistência de foco/lock | `7dc6242` |
| v47 | 22/07/2026 | GamePlan: variações dentro do cenário (agrupadas na régua de fases) | `36596b8` |
| v48 | 22/07/2026 | GamePlan: HP dos objetivos unificado + fontes carregam antes de renderizar | `d7b15b3` |
| v49 | 22/07/2026 | GamePlan: rótulos do mapa em Barlow + vinheta suave atrás dos objetivos | `57feb51` |
| v50 | 22/07/2026 | GamePlan: nome oculto mostra bolinha com o número da PT | `9b412c6` |
| v51 | 22/07/2026 | GamePlan: amarração PT->membro fina e discreta | `72ef6eb` |
| v52 | 22/07/2026 | GamePlan: centralização dos rótulos + contador da PT desconta destacados | `aeadb86` |
| v53 | 22/07/2026 | GamePlan: HP discreto (barrinha + número com contorno) e nome do player mais enxuto | `27d5aeb` |
| v54 | 22/07/2026 | GamePlan: aliviar o visual (sem pill/contorno pesado) + menu de Planos salvos | `1fb35cd` |
| v55 | 22/07/2026 | GamePlan: guia de uso no app (botão "?") | `d8c73b3` |
| v55 | 22/07/2026 | GamePlan: salva plano padrão (Wanted) e remove botão "Planos" do front | `df57fd6` |
| v56 | 22/07/2026 | GamePlan: segurar 5s joga o nome pro lado do ícone + bolinha da PT menor | `fb3d883` |
| v57 | 22/07/2026 | GamePlan: traduções completas (ES/EN) — mensagens de sistema + guia | `dcd5fb0` |
| v58 | 22/07/2026 | GamePlan: PT menor · Timer: leads 30/15/5 padrão + aviso de início | `669ee7e` |
| v59 | 22/07/2026 | Home traduzível + guia sem enquadramento de "novo" | `016c269` |
| v60 | 22/07/2026 | GamePlan: toolbar com texto ao lado do ícone (estilo Playbook), traduzida | `104b213` |
| v61 | 22/07/2026 | GamePlan: buffs menores, HP mais baixo, seta do carry, classe 2ª no player, ocultar metros | `f267ccf` |
| v62 | 22/07/2026 | GamePlan: foco múltiplo com ✕ pra excluir + X pra fechar galerias | `90c6b43` |
| v63 | 22/07/2026 | GamePlan: notas com edição inline + tamanho ajustável | `b264656` |
| v64 | 22/07/2026 | GamePlan: buffs com arte oficial (PNG) + Frontline Zeal e Desperate Surge; plano padrão atualizado | `32d2b2b` |
| v65 | 22/07/2026 | GamePlan: ocultar linha do caminho da árvore + mesclar roster + guia detalhado | `15d8a77` |
| v66 | 22/07/2026 | GamePlan: tempo de jogo por cenário (⏱) na régua, editor e apresentação | `bce4af2` |
| v67 | 22/07/2026 | GamePlan: notas menores, foco arrastável pela borda com ✕, Ctrl+Z do foco, toggle Zonas | `7880e03` |
| v68 | 23/07/2026 | GamePlan: nº da PT com nomes ocultos, notas auto-ajuste, herança de posição, Ctrl+C/V, seletor de cena no topo, vínculo/rótulo de inimigo | `0111dcc` |
| v69 | 23/07/2026 | GamePlan: desenhos selecionáveis, HUD do cenário+timer, notas acima do foco e coloridas, Galinha por cena + lápis | `96cc940` |
| v70 | 23/07/2026 | GamePlan: foco rotacionável + formatos, auto-foco dos elementos, limpar só extras | `36ffe25` |
| v71 | 23/07/2026 | GamePlan: zoom salvo por cena + pílula "nosso lado" discreta no canto | `720f5e9` |
| v72 | 23/07/2026 | GamePlan: redimensionar o foco pelas alças de canto após selecionado | `43b154d` |
| v73 | 23/07/2026 | GamePlan: auto-foco cobre elemento inteiro + linhas de conexão; HP da torre mais baixo | `c67d084` |
| v74 | 23/07/2026 | GamePlan: seletor de idioma vira um botão único de bandeira que cicla PT/ES/EN | `7919e0e` |
| v75 | 23/07/2026 | GamePlan Board: por-classe corrigido, scroll independente, Replace com alvo, link só do board | `8a85c9d` |
| v76 | 23/07/2026 | GamePlan Board: replace só da própria PT, reservas compactas, troca titular⇄replace pelo mapa, limpeza automática | `b691f64` |
| v77 | 23/07/2026 | GamePlan UI: ordem da aba Players, título maior, cena+Fases fundidos, painéis colapsáveis, toggle de lado | `75bc387` |
| v78 | 23/07/2026 | GamePlan Board: replace sinalizado nos 2 lados, popover ao lado, header numa linha, aviso ao fechar sem salvar | `fc572ed` |
| v79 | 23/07/2026 | GamePlan: expandir canvas, HUD com condição/descrição, toggles por lado nos objetivos, polish do dock | `a419a10` |
| v80 | 23/07/2026 | GamePlan Board: ferramentas na lateral, +altura pro board, ícones de classe no header, scroll preservado | `7b5c989` |
| v80 | 23/07/2026 | GamePlan: expandir por cena, minutagem discreta, lados por posição (jungle/boss/outpost) | `1bda982` |
| v82 | 23/07/2026 | GamePlan Board: ferramentas em 1 linha com ícones melhores + abre direto no Board | `f77e7e6` |
| v83 | 23/07/2026 | GamePlan: auto-foco oculta focos manuais e ilumina desenhos/ícones | `6bfd5a1` |

## Resumo por área

- **Game Plan** (`/estrategia/`): cenas com tempo/zoom/expandir por cena, Board com replace-alvo e troca 1-clique, mesclar/copiar board, auto-foco, focos manuais (mover/girar/redimensionar), buffs com arte oficial, objetivos por lado, guia PT/ES/EN.
- **War Timer** (`/timer/`): narração por voz gravada (todas as combinações sujeito+tempo e sujeito+up), fila de falas, voz como padrão com bipe, mobile com popup central e barra do próximo marco.
- **Home**: tradução PT/ES/EN.
