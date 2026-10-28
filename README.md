# Feel Alive — site

HTML, CSS e JS puros, sem build e sem bibliotecas. Sirva a pasta com `python3 -m http.server` e abra `http://localhost:8000`.

Aberto direto pelo arquivo (`file://`), o navegador bloqueia a foto como textura WebGL. Nesse caso o hero mostra a foto normal, sem a distorção líquida. Todo o resto funciona.

- `assets/js/gl.js`: WebGL feito à mão. Inclui as partículas da abertura, o shader líquido da foto do hero e a "seda dourada" (`<canvas data-silk>`).

## Estrutura
- `index.html`: Home com as 7 seções do plano
- `clinica.html`, `estetica.html`, `nutrologia.html` (com `#neuromap`), `recovery.html`, `clubes-vip.html`, `equipe.html`
- `assets/css/style.css`: identidade (preto `#0a0a0a`, dourado `#e4b531`, branco) e todos os componentes
- `assets/js/main.js`: header, menu, footer e modal são injetados aqui; todas as animações também ficam aqui

## Antes de publicar (plano, seção 21)
- `CONFIG` em `assets/js/main.js`: número do WhatsApp, endereço completo, horários e responsável técnico (CRM/RQE)
- Equipe: nomes, fotos e registros das dermatologistas e da nutricionista (`equipe.html` e Home)
- Foto do Dr. Guilherme (hoje aparece um monograma "G")
- Revisão médica dos textos de tratamentos, NeuroMap, pulseira e Recovery

## Vídeos
Basta colocar os arquivos em `assets/video/` com estes nomes. Eles são carregados automaticamente; se o arquivo não existir, o site mantém o visual animado:
- `abertura.mp4`: filme de 18 s. Os capítulos do hero sincronizam com o tempo do vídeo
- `estetica.mp4`, `saude.mp4`, `recovery.mp4`: loops dos pilares
