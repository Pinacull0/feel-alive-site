# Feel Alive — site

HTML, CSS e JS puros, sem build e sem bibliotecas. Sirva a pasta com `python3 -m http.server` e abra `http://localhost:8000`.

Aberto direto pelo arquivo (`file://`), o navegador bloqueia a foto como textura WebGL. Nesse caso o hero mostra a foto normal sobre o fundo animado. Todo o resto funciona.

- `assets/js/gl.js`: WebGL feito à mão. Inclui as partículas da abertura, o fundo fluido do hero (a foto da pessoa nunca é distorcida), a "seda dourada" (`<canvas data-silk>`) e a água que ondula ao toque no Recovery (`<canvas data-water>`).

## Fontes
Títulos em Roslindale Display (Regular e Italic) e textos em Manrope. A Roslindale é licenciada pela DJR: com a licença web, coloque `RoslindaleDisplay-Regular.woff2` e `RoslindaleDisplay-Italic.woff2` em `assets/fonts/`. Enquanto os arquivos não existirem, o site usa a Fraunces.

## Estrutura
- `index.html`: Home com as 7 seções do plano
- `clinica.html`, `estetica.html`, `nutrologia.html` (com `#neuromap`), `recovery.html`, `clubes-vip.html`
- `equipe.html` saiu do menu (a equipe já aparece na Home e na Clínica); o arquivo ficou sem links
- `assets/css/style.css`: identidade (preto `#0a0a0a`, dourado `#e4b531`, branco) e todos os componentes
- `assets/js/main.js`: header, menu, footer e modal são injetados aqui; todas as animações também ficam aqui

## Antes de publicar (plano, seção 21)
- `CONFIG` em `assets/js/main.js`: número do WhatsApp, horários e responsável técnico (CRM/RQE)
- Registros (CRM/RQE) das profissionais
- Revisão médica dos textos de tratamentos, NeuroMap, pulseira e Recovery

## Vídeos
Basta colocar os arquivos em `assets/video/` com estes nomes. Eles são carregados automaticamente; se o arquivo não existir, o site mantém o visual animado:
- `abertura.mp4`: filme de 18 s. Os capítulos do hero sincronizam com o tempo do vídeo
- `estetica.mp4`, `saude.mp4`, `recovery.mp4`: loops dos pilares

## Fotos
Mesma ideia dos vídeos: salve com o nome abaixo e a foto aparece sozinha. Sem o arquivo, fica o visual atual.
- `assets/img/dr-guilherme.jpg`: Dr. Guilherme (Home, Nutrologia)
- `assets/img/equipe-dermatologia.jpg`, `assets/img/equipe-nutricao.jpg`: cards da equipe na Home
- `assets/img/fundadores.jpg`: Dra. Bony e Dr. Guilherme juntos, acima das duas colunas em A Clínica
- `assets/img/protocolo-natural-face.jpg`, `protocolo-natural-lift.jpg`, `protocolo-neuromap.jpg`: cards de protocolos da Home
- `assets/img/clubes-vip.jpg`: faixa Clubes VIP da Home; `assets/img/clubes-vip-hero.jpg`: topo da página Clubes VIP
- `assets/img/clinica-espaco.jpg`: "Venha conhecer" (fica no lugar do mapa)
- `assets/img/recovery-sauna.jpg`, `recovery-led.jpg`, `recovery-massoterapia.jpg`: cards do circuito; `recovery-imersao.jpg` vira a água que ondula ao toque
- `assets/img/antes-depois/{natural-face,natural-lift,qualidade-pele}-{antes,depois}.jpg`: comparadores de Estética (só com autorização escrita da paciente)
- `assets/video/dra-bony.mp4`: vídeo com som e controles ao lado de "Sua beleza não precisa deixar sua história para trás"
