/* ==========================================================================
   FEEL ALIVE — efeitos WebGL (sem bibliotecas)
   - particles: partículas douradas que formam o logo na abertura
   - hero: fundo fluido com a foto revelada por cima (sem distorcer a pessoa)
   - silk: "seda dourada" animada para fundos
   - water: superfície de água que ondula ao toque (Recovery)
   ========================================================================== */
(() => {
  const probe = document.createElement('canvas');
  const supported = !!(probe.getContext('webgl') || probe.getContext('experimental-webgl'));
  if (!supported) return;

  const ctx = (canvas, opts = {}) => canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, ...opts });

  function shader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    return p;
  }
  const uniforms = (gl, p, names) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
  function attrib(gl, p, name, data, size) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }
  const fullQuad = (gl, p) => attrib(gl, p, 'aPos', new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), 2);
  function fit(canvas, max) {
    const dpr = Math.min(window.devicePixelRatio || 1, max);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return dpr;
  }
  /* Renderiza só enquanto o canvas está visível */
  function loopWhenVisible(canvas, draw) {
    let visible = false;
    let raf = 0;
    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }

  /* Carrega uma imagem como textura; file:// bloqueia e o erro é ignorado */
  function loadTexture(gl, src, onReady) {
    const img = new Image();
    img.onload = () => {
      try {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        onReady([img.naturalWidth, img.naturalHeight]);
      } catch { /* sem textura: segue o fallback */ }
    };
    img.src = src;
  }

  const QUAD_VS = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }';
  const NOISE = `
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
      return v;
    }`;

  /* ------------------------------------------------------------------------
     Partículas da abertura
     ------------------------------------------------------------------------ */
  const PARTICLE_VS = `
    attribute vec3 aStart;
    attribute vec2 aTarget;
    attribute vec4 aRand;
    uniform float uTime, uConv, uOut, uFade, uDpr;
    uniform vec2 uRes;
    varying float vA;
    varying float vT;
    void main(){
      float p = clamp((uConv - aRand.x) / 0.65, 0.0, 1.0);
      p = 1.0 - pow(1.0 - p, 4.0);
      vec3 s = aStart;
      float ang = (1.0 - p) * (2.5 + aRand.w * 2.5);
      float c = cos(ang), si = sin(ang);
      s.xy = mat2(c, si, -si, c) * s.xy;
      vec3 pos = mix(s, vec3(aTarget, 0.0), p);
      pos.xy += vec2(sin(aRand.z * 40.0 + uTime * 1.3), cos(aRand.w * 40.0 + uTime * 1.1)) * 50.0 * (1.0 - p);
      pos.xy += vec2(sin(uTime * 2.0 + aRand.z * 6.283), cos(uTime * 1.7 + aRand.w * 6.283)) * 0.8 * p;
      vec2 dir = normalize(aTarget + (aRand.zw - 0.5) * 160.0 + 0.001);
      float o = uOut * uOut;
      pos.xy += dir * o * (250.0 + aRand.y * 900.0);
      pos.z -= o * 450.0 * aRand.w;
      float persp = 800.0 / (800.0 + pos.z);
      vec2 clip = pos.xy * persp / (uRes * 0.5);
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      gl_PointSize = (1.1 + aRand.y * 2.2) * uDpr * persp * (1.0 + (1.0 - p) * 1.4);
      vA = (0.25 + 0.75 * p) * mix(1.0, uFade, p) * (1.0 - uOut);
      vT = aRand.y;
    }`;
  const PARTICLE_FS = `
    precision mediump float;
    varying float vA;
    varying float vT;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.05, d);
      vec3 col = mix(vec3(0.894, 0.71, 0.192), vec3(1.0, 0.94, 0.75), vT * 0.7);
      gl_FragColor = vec4(col, a * vA);
    }`;

  function particles(canvas, points, count) {
    const gl = ctx(canvas, { alpha: true });
    if (!gl) return null;
    const p = program(gl, PARTICLE_VS, PARTICLE_FS);
    const u = uniforms(gl, p, ['uTime', 'uConv', 'uOut', 'uFade', 'uDpr', 'uRes']);
    const w = innerWidth, h = innerHeight;
    const R = Math.hypot(w, h) * 0.7;
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 2);
    const rnd = new Float32Array(count * 4);
    const nPts = points.length / 2;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = R * (0.35 + Math.random() * 0.65);
      start.set([Math.cos(a) * r, Math.sin(a) * r * 0.75, -350 + Math.random() * 1750], i * 3);
      const k = (i % nPts) * 2;
      target.set([points[k] + (Math.random() - 0.5) * 1.2, points[k + 1] + (Math.random() - 0.5) * 1.2], i * 2);
      rnd.set([Math.random() * 0.35, Math.random(), Math.random(), Math.random()], i * 4);
    }
    attrib(gl, p, 'aStart', start, 3);
    attrib(gl, p, 'aTarget', target, 2);
    attrib(gl, p, 'aRand', rnd, 4);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const state = { conv: 0, fade: 1, out: 0, running: true };
    const t0 = performance.now();
    const frame = (now) => {
      if (!state.running) return;
      const dpr = fit(canvas, 2);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.uTime, (now - t0) / 1000);
      gl.uniform1f(u.uConv, state.conv);
      gl.uniform1f(u.uOut, state.out);
      gl.uniform1f(u.uFade, state.fade);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform2f(u.uRes, innerWidth, innerHeight);
      gl.drawArrays(gl.POINTS, 0, count);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    state.destroy = () => {
      state.running = false;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    return state;
  }

  /* ------------------------------------------------------------------------
     Hero: fundo fluido + foto nítida (o efeito fica no fundo, nunca no rosto)
     ------------------------------------------------------------------------ */
  const HERO_FS = `
    precision highp float;
    uniform sampler2D uTex;
    uniform vec2 uRes, uImg, uMouse;
    uniform vec4 uRect;
    uniform float uTime, uScroll, uReveal, uHasTex, uFadeL, uDim;
    ${NOISE}
    void main(){
      vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
      vec2 p = frag / uRes.y;
      float t = uTime * 0.05;
      vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
      float n = fbm(p * 1.8 + 2.2 * q + vec2(t * 0.7, -t));
      vec3 gold = vec3(0.894, 0.71, 0.192);
      vec3 col = vec3(0.039) + vec3(0.09, 0.07, 0.025) * smoothstep(0.35, 0.95, n);
      col += gold * pow(smoothstep(0.55, 1.0, n), 3.0) * 0.22;

      vec2 dm = frag - uMouse;
      float dist = length(dm) / uRes.y;
      float infl = smoothstep(0.32, 0.0, dist);
      col += gold * infl * infl * 0.06;

      if (uHasTex > 0.5) {
        vec2 local = (frag - uRect.xy) / uRect.zw;
        float rA = uRect.z / uRect.w, iA = uImg.x / uImg.y;
        vec2 uv = local;
        if (rA > iA) { float fr = iA / rA; uv.y = local.y * fr + (1.0 - fr) * 0.1; }
        else { float fr = rA / iA; uv.x = local.x * fr + (1.0 - fr) * 0.5; }
        uv = (uv - vec2(0.5, 0.2)) * (1.0 - uScroll * 0.1) + vec2(0.5, 0.2);
        vec3 img = texture2D(uTex, uv).rgb;

        float inside = step(0.0, local.x) * step(local.x, 1.0) * step(0.0, local.y) * step(local.y, 1.0);
        float mask = inside * smoothstep(0.0, max(uFadeL, 0.001), local.x) * smoothstep(1.0, 0.62, local.y);
        float edge = uReveal * 1.35 - (1.0 - local.y) - fbm(local * 4.0 + 3.0) * 0.35;
        float rv = smoothstep(0.0, 0.08, edge);
        float rim = smoothstep(0.0, 0.03, edge) - smoothstep(0.03, 0.12, edge);
        col = mix(col, img, mask * rv * uDim);
        col += gold * rim * inside * 0.9 * step(uReveal, 0.999);
        float sw = fract(uTime * 0.07);
        float band = smoothstep(0.06, 0.0, abs(local.x * 0.8 + local.y * 0.6 - sw * 2.6 + 0.3));
        col += vec3(1.0, 0.88, 0.55) * band * mask * rv * 0.08;
      }
      vec2 vv = frag / uRes - 0.5;
      col *= 1.0 - dot(vv, vv) * 0.7;
      col += (hash(frag + fract(uTime) * 100.0) - 0.5) * 0.04;
      gl_FragColor = vec4(col, 1.0);
    }`;

  function hero(canvas, { photo, src, isMobile, onTexture }) {
    const gl = ctx(canvas, { alpha: false });
    if (!gl) return null;
    const p = program(gl, QUAD_VS, HERO_FS);
    fullQuad(gl, p);
    const u = uniforms(gl, p, ['uTex', 'uRes', 'uImg', 'uMouse', 'uRect', 'uTime', 'uScroll', 'uReveal', 'uHasTex', 'uFadeL', 'uDim']);
    let hasTex = 0;
    let imgSize = [1, 1];
    loadTexture(gl, src, (size) => {
      imgSize = size;
      hasTex = 1;
      onTexture?.();
    });

    const mouse = { x: -9999, y: -9999 };
    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    const sm = { x: -9999, y: -9999 };
    const state = { revealStart: null };
    const t0 = performance.now();

    loopWhenVisible(canvas, (now) => {
      const dpr = fit(canvas, 1.5);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const cr = canvas.getBoundingClientRect();
      const pr = photo.getBoundingClientRect();
      if (sm.x < -999) { sm.x = mouse.x; sm.y = mouse.y; }
      sm.x += (mouse.x - sm.x) * 0.12;
      sm.y += (mouse.y - sm.y) * 0.12;
      const rev = state.revealStart === null ? 0 : Math.min(1, (now - state.revealStart) / 2200);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform4f(u.uRect, (pr.left - cr.left) * dpr, (pr.top - cr.top) * dpr, pr.width * dpr, pr.height * dpr);
      gl.uniform2f(u.uImg, imgSize[0], imgSize[1]);
      gl.uniform2f(u.uMouse, (sm.x - cr.left) * dpr, (sm.y - cr.top) * dpr);
      gl.uniform1f(u.uTime, (now - t0) / 1000);
      gl.uniform1f(u.uScroll, Math.min(1, Math.max(0, -cr.top / cr.height)));
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - rev, 3));
      gl.uniform1f(u.uHasTex, hasTex);
      gl.uniform1f(u.uFadeL, isMobile() ? 0 : 0.55);
      gl.uniform1f(u.uDim, isMobile() ? 0.5 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
    return { start() { state.revealStart = performance.now(); } };
  }

  /* ------------------------------------------------------------------------
     Seda dourada
     ------------------------------------------------------------------------ */
  const SILK_FS = `
    precision highp float;
    uniform vec2 uRes, uMouse;
    uniform float uTime, uDim;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      float t = uTime * 0.22;
      vec2 p = uv * 2.4 + (uMouse - 0.5) * 0.35;
      for (int i = 1; i < 7; i++) {
        float fi = float(i);
        p.x += 0.6 / fi * sin(fi * p.y + t + 0.3 * fi) + 0.4;
        p.y += 0.5 / fi * cos(fi * p.x + t * 0.85 + 0.5 * fi) - 0.3;
      }
      float f = 0.5 + 0.5 * sin(p.x + p.y);
      float g = 0.5 + 0.5 * cos(p.x * 0.6 - p.y * 1.2 + t);
      vec3 col = mix(vec3(0.035, 0.03, 0.022), vec3(0.42, 0.3, 0.06), smoothstep(0.15, 0.85, f));
      col = mix(col, vec3(0.894, 0.71, 0.192), smoothstep(0.55, 0.95, f * g + 0.15));
      col += vec3(1.0, 0.93, 0.7) * pow(smoothstep(0.62, 1.0, f * g + 0.05), 5.0) * 0.55;
      col *= 0.55 + 0.45 * g;
      vec2 v = gl_FragCoord.xy / uRes - 0.5;
      col *= 1.0 - dot(v, v) * 1.1;
      col *= uDim;
      col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.03;
      gl_FragColor = vec4(col, 1.0);
    }`;

  function silk(canvas, { dim = 1 } = {}) {
    const gl = ctx(canvas, { alpha: false });
    if (!gl) return;
    const p = program(gl, QUAD_VS, SILK_FS);
    fullQuad(gl, p);
    const u = uniforms(gl, p, ['uRes', 'uMouse', 'uTime', 'uDim']);
    const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    addEventListener('pointermove', (e) => { m.tx = e.clientX / innerWidth; m.ty = 1 - e.clientY / innerHeight; }, { passive: true });
    const t0 = performance.now() - Math.random() * 20000;
    loopWhenVisible(canvas, (now) => {
      fit(canvas, 1);
      gl.viewport(0, 0, canvas.width, canvas.height);
      m.x += (m.tx - m.x) * 0.03;
      m.y += (m.ty - m.y) * 0.03;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform2f(u.uMouse, m.x, m.y);
      gl.uniform1f(u.uTime, (now - t0) / 1000);
      gl.uniform1f(u.uDim, dim);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
    canvas.classList.add('is-gl');
  }

  /* ------------------------------------------------------------------------
     Água: ondas circulares a cada toque, refratando a foto (se houver)
     ou um fundo de água escura com cáusticas douradas
     ------------------------------------------------------------------------ */
  const DROPS = 12;
  const WATER_FS = `
    precision highp float;
    uniform sampler2D uTex;
    uniform vec2 uRes, uImg;
    uniform float uTime, uHasTex;
    uniform vec4 uDrops[${DROPS}];
    ${NOISE}
    float height(vec2 p){
      float h = (fbm(p * 2.6 + vec2(uTime * 0.06, -uTime * 0.05)) - 0.5) * 0.012;
      for (int i = 0; i < ${DROPS}; i++) {
        vec4 d = uDrops[i];
        float age = uTime - d.z;
        if (age < 0.0 || age > 5.0) continue;
        float x = length(p - d.xy) - age * 0.32;
        h += d.w * 0.0045 * sin(x * 70.0) * exp(-x * x * 160.0) * exp(-age * 0.9);
      }
      return h;
    }
    float caustic(vec2 uv, float t){
      vec2 p = uv * 6.2831 - 250.0;
      vec2 i = p;
      float c = 1.0;
      for (int n = 0; n < 4; n++) {
        float tt = t * (1.0 - 3.5 / float(n + 1));
        i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005)));
      }
      c = 1.17 - pow(c / 4.0, 1.4);
      return pow(abs(c), 8.0);
    }
    void main(){
      vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
      vec2 p = frag / uRes.y;
      float e = 1.5 / uRes.y;
      float h = height(p);
      vec2 g = vec2(height(p + vec2(e, 0.0)) - h, height(p + vec2(0.0, e)) - h) / e;
      vec3 n = normalize(vec3(-g, 1.0));
      vec2 off = n.xy * 0.06;
      vec3 col;
      if (uHasTex > 0.5) {
        vec2 local = frag / uRes + off;
        float rA = uRes.x / uRes.y, iA = uImg.x / uImg.y;
        vec2 uv = local;
        if (rA > iA) uv.y = (local.y - 0.5) * iA / rA + 0.5;
        else uv.x = (local.x - 0.5) * rA / iA + 0.5;
        col = texture2D(uTex, uv).rgb;
      } else {
        vec2 q = p + off;
        col = mix(vec3(0.02, 0.045, 0.05), vec3(0.04, 0.1, 0.11), fbm(q * 1.8 + uTime * 0.03));
        col += vec3(0.894, 0.75, 0.4) * caustic(q * 0.9, uTime * 0.35 + 23.0) * 0.32;
      }
      vec3 L = normalize(vec3(-0.45, -0.55, 1.0));
      float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 70.0);
      col += vec3(1.0, 0.9, 0.62) * spec * 0.7;
      col += vec3(0.894, 0.71, 0.192) * clamp(length(g) * 0.8, 0.0, 1.0) * 0.12;
      vec2 v = frag / uRes - 0.5;
      col *= 1.0 - dot(v, v) * 0.6;
      col += (hash(frag + fract(uTime) * 77.0) - 0.5) * 0.03;
      gl_FragColor = vec4(col, 1.0);
    }`;

  function water(canvas, { host = canvas, src } = {}) {
    const gl = ctx(canvas, { alpha: false });
    if (!gl) return;
    const p = program(gl, QUAD_VS, WATER_FS);
    fullQuad(gl, p);
    const u = uniforms(gl, p, ['uTex', 'uRes', 'uImg', 'uTime', 'uHasTex', 'uDrops']);
    let hasTex = 0;
    let imgSize = [1, 1];
    if (src) loadTexture(gl, src, (size) => { imgSize = size; hasTex = 1; });

    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;
    const drops = new Float32Array(DROPS * 4).fill(-99);
    let next = 0;
    let last = { x: -9, y: -9, t: -9 };
    const drop = (x, y, amp) => {
      drops.set([x, y, now(), amp], next * 4);
      next = (next + 1) % DROPS;
      last = { x, y, t: now() };
    };
    const local = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.height, (e.clientY - r.top) / r.height];
    };
    host.addEventListener('pointermove', (e) => {
      const [x, y] = local(e);
      if (Math.hypot(x - last.x, y - last.y) > 0.05 && now() - last.t > 0.06) drop(x, y, 0.7);
    }, { passive: true });
    host.addEventListener('pointerdown', (e) => { const [x, y] = local(e); drop(x, y, 1.6); }, { passive: true });

    loopWhenVisible(canvas, () => {
      fit(canvas, 1.25);
      gl.viewport(0, 0, canvas.width, canvas.height);
      // sem interação, uma gota de vez em quando para a água não ficar parada
      if (now() - last.t > 2.6) drop(Math.random() * canvas.width / canvas.height, 0.2 + Math.random() * 0.6, 0.45);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform2f(u.uImg, imgSize[0], imgSize[1]);
      gl.uniform1f(u.uTime, now());
      gl.uniform1f(u.uHasTex, hasTex);
      gl.uniform4fv(u.uDrops, drops);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
    canvas.classList.add('is-gl');
  }

  window.FAGL = { particles, hero, silk, water };
})();
