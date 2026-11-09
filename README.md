# Feel Alive — site

HTML, CSS e JS puros, sem build e sem bibliotecas. Sirva a pasta com `python3 -m http.server` e abra `http://localhost:8000`.

Aberto direto pelo arquivo (`file://`), o navegador bloqueia a foto como textura WebGL. Nesse caso o hero mostra a foto normal sobre o fundo animado. Todo o resto funciona.

- `assets/js/gl.js`: WebGL feito à mão. Inclui as partículas da abertura, o fundo fluido do hero (a foto da pessoa nunca é distorcida), a "seda dourada" (`<canvas data-silk>`) e a água que ondula ao toque no Recovery (`<canvas data-water>`).

## Fontes
Títulos em Roslindale Display (Regular e Italic) e textos em Manrope. A Roslindale é licenciada pela DJR: com a licença web, coloque `RoslindaleDisplay-Regular.woff2` e `RoslindaleDisplay-Italic.woff2` em `assets/fonts/`. Enquanto os arquivos não existirem, o site usa a Fraunces.

## Estrutura
- `index.html`: Home com as 7 seções do plano
- `clinica.html`, `estetica.html`, `nutrologia.html` (com `#neuromap`), `recovery.html`, `clubes-vip.html`
- Toda página interna termina com "Continue explorando", com links para as outras
- `assets/css/style.css`: identidade (preto `#0a0a0a`, dourado `#e4b531`, branco) e todos os componentes
- `assets/js/main.js`: header, menu, footer e modal são injetados aqui; todas as animações também ficam aqui

## Antes de publicar (plano, seção 21)
- `CONFIG` em `assets/js/main.js`: número do WhatsApp, horários e responsável técnico (CRM/RQE)
- Registros (CRM/RQE) das profissionais
- Revisão médica dos textos de tratamentos, NeuroMap, pulseira e Recovery

## Vídeos
Basta colocar os arquivos em `assets/video/` com estes nomes. Eles são carregados automaticamente; se o arquivo não existir, o site mantém o visual animado:
- `abertura.mp4`: filme de abertura. O hero tem 5 temas (título e texto próprios); sem o vídeo, cada tema fica 7,5 s (`THEME_SECONDS` em `main.js`); com o vídeo, os temas dividem a duração dele
- `estetica.mp4`, `saude.mp4`, `recovery.mp4`: loops dos pilares

## Fotos e vídeos
Uma foto marcada com `data-optional` só aparece se o arquivo existir. Para trocar uma foto, basta substituir o arquivo mantendo o nome. Os originais enviados pela clínica ficam fora do site, em `../feel-alive-midias-originais/`.

| Arquivo | Onde aparece | Original |
|---|---|---|
| `img/fundadores.jpg` | A Clínica, acima das duas colunas | DSC01299 |
| `img/dr-guilherme.jpg` | Card da equipe na Home | DSC00566 |
| `img/dr-guilherme-retrato.jpg` | Nutrologia | DSC05793 |
| `img/equipe-dermatologia.jpg` | Card "Dermatologistas" na Home | DSC05226 |
| `img/equipe-nutricao.jpg` | Card "Nutrição" na Home | IMG_0854 |
| `img/protocolo-natural-face.jpg`, `protocolo-natural-lift.jpg`, `protocolo-neuromap.jpg` | Cards de protocolos da Home | DSC03597, DSC03594, DSC05731 |
| `img/clubes-vip.jpg` | Faixa Clubes VIP da Home | unnamed.webp |
| `img/clubes-vip-hero.jpg` | Topo da página Clubes VIP | DSC07184 |
| `img/clinica-espaco.jpg` | "Venha conhecer" (no lugar do mapa) | WhatsApp Image 2026-10-26 |
| `img/recovery-sauna.jpg` | Card Sauna | DSC01111 |
| `video/recovery-imersao.mp4`, `recovery-led.mp4`, `recovery-pressoterapia.mp4` (+ capa `.jpg` em `img/`) | Cards Imersão fria, Terapia de LED e Massoterapia | C0024, C0045, C0043 (girados, 12 s, sem som) |
| `video/dra-bony.mp4` | Estética, ao lado de "Sua beleza não precisa deixar sua história para trás" | copy_17D7F39E….mov |
| `img/antes-depois/rinomodelacao-{perfil,frente}-{antes,depois}.jpg` | Antes e depois em Estética | Foto 10-08-2026 (colagem recortada) |

Sem uso por enquanto: DSC07599 (foto em grupo do evento) e IMG_0191. As fotos de antes e depois só podem ser publicadas com autorização escrita da paciente.
