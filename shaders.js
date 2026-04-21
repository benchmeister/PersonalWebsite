/* ═══════════════════════════════════════════════════════════════
   shaders.js  —  Glacial Drift aurora background (WebGL)
   Reacts to mouse movement and clicks.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const canvas = document.getElementById('aurora-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    /* ── Shaders ──────────────────────────────────────────────── */
    const VERT = `
        attribute vec2 a_pos;
        void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const FRAG = `
        precision highp float;
        uniform vec2  u_res;
        uniform float u_t;
        uniform vec2  u_mouse;
        uniform vec4  u_click;

        float _h(vec2 p) {
            p = fract(p * vec2(234.34, 435.345));
            p += dot(p, p + 34.23);
            return fract(p.x * p.y);
        }
        float _n(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(_h(i), _h(i + vec2(1.0, 0.0)), f.x),
                mix(_h(i + vec2(0.0, 1.0)), _h(i + vec2(1.0, 1.0)), f.x),
                f.y);
        }
        float fbm(vec2 p) {
            float v = 0.0, a = 0.5;
            for (int i = 0; i < 6; i++) { v += a * _n(p); p *= 2.0; a *= 0.5; }
            return v;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_res;
            float ar = u_res.x / u_res.y;
            vec2 p   = vec2(uv.x * ar, uv.y);
            float t  = u_t * 0.07;

            /* mouse creates a gentle flowing current */
            vec2  mpos = u_mouse * vec2(ar, 1.0);
            float md   = length(p - mpos);
            vec2  flow = normalize(p - mpos + 0.001) * exp(-md * 2.2) * 0.35;

            float d1 = fbm((p + flow) * 0.55 + vec2(t * 0.22, 0.0));
            float d2 = fbm(p * 0.85          + vec2(0.0, t * 0.18) + 5.3);
            vec2  wp = p + vec2(d1 - 0.5, d2 - 0.5) * 0.85;

            /* three soft aurora bands */
            float by = wp.y - 0.5;
            float b1 = exp(-pow(by / 0.130 + sin(wp.x * 1.7 + t) * 0.38, 2.0));
            float b2 = exp(-pow((by + 0.16) / 0.075 + sin(wp.x * 2.4 - t * 0.65 + 1.2) * 0.32, 2.0));
            float b3 = exp(-pow((by - 0.19) / 0.110 + sin(wp.x * 1.1 + t * 0.42 + 3.1) * 0.28, 2.0));

            /* ice palette */
            vec3 c1 = vec3(0.75, 0.92, 1.00);   /* near-white ice   */
            vec3 c2 = vec3(0.38, 0.82, 0.96);   /* pale cyan        */
            vec3 c3 = vec3(0.22, 0.56, 0.88);   /* deep arctic blue */

            float ni  = fbm(p * 3.2 + t * 0.12) * 0.22 + 0.78;
            vec3  aur = (c1 * b1 * 0.70 + c2 * b2 * 0.55 + c3 * b3 * 0.45) * ni;

            /* subtle mouse glow */
            aur += c1 * exp(-md * 4.5) * 0.07;

            /* click: hexagonal ice-crystal burst + ripple */
            if (u_click.w > 0.5) {
                vec2  cp  = u_click.xy * vec2(ar, 1.0);
                float ca  = u_t - u_click.z;
                float cd  = length(p - cp);
                float hex = (abs(sin(atan(p.y - cp.y, p.x - cp.x) * 3.0)) * 0.5 + 0.5);
                aur += c1 * hex * exp(-cd * 9.0) * exp(-ca * 3.5) * 0.65;
                float rip = sin(cd * 22.0 - ca * 8.0) * exp(-ca * 2.0) * exp(-cd * 5.0) * 0.30;
                aur += c2 * max(rip, 0.0);
            }

            /* two layers of stars — glacial arctic sky */
            float sv1 = _h(floor(uv * 520.0));
            float st1 = step(0.9920, sv1) * (0.55 + 0.45 * sin(u_t * (1.1 + sv1 * 4.5)));
            float sv2 = _h(floor(uv * 160.0) + 0.5);
            float st2 = step(0.9720, sv2) * (0.18 + 0.12 * sin(u_t * (0.6 + sv2 * 2.2)));

            vec3 bg = mix(vec3(0.010, 0.020, 0.060), vec3(0.025, 0.055, 0.120), uv.y);
            gl_FragColor = vec4(bg + aur + st1 * 0.80 + st2 * 0.30, 1.0);
        }
    `;

    /* ── Compile & link ───────────────────────────────────────── */
    function compile(src, type) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn('[aurora]', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    const vs   = compile(VERT, gl.VERTEX_SHADER);
    const fs   = compile(FRAG, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn('[aurora] link error:', gl.getProgramInfoLog(prog));
        return;
    }

    /* ── Full-screen quad ─────────────────────────────────────── */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1,-1,  1,-1, -1, 1,
        -1, 1,  1,-1,  1, 1
    ]), gl.STATIC_DRAW);

    /* ── State ────────────────────────────────────────────────── */
    let mouse     = [0.5, 0.5];
    let clickPos  = [0.5, 0.5];
    let clickTime = -999;
    let hasClick  = 0;
    const t0      = performance.now();

    /* ── Resize ───────────────────────────────────────────────── */
    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Input ────────────────────────────────────────────────── */
    window.addEventListener('mousemove', e => {
        mouse[0] = e.clientX / window.innerWidth;
        mouse[1] = 1.0 - e.clientY / window.innerHeight;
    });

    window.addEventListener('click', e => {
        if (e.target.closest('.panel, header')) return;
        clickPos[0] = e.clientX / window.innerWidth;
        clickPos[1] = 1.0 - e.clientY / window.innerHeight;
        clickTime   = (performance.now() - t0) / 1000;
        hasClick    = 1;
        clearTimeout(window._aFade);
        window._aFade = setTimeout(() => { hasClick = 0; }, 5000);
    });

    /* ── Render loop ──────────────────────────────────────────── */
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uT     = gl.getUniformLocation(prog, 'u_t');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uClick = gl.getUniformLocation(prog, 'u_click');

    function render() {
        const t = (performance.now() - t0) / 1000;
        gl.uniform2f(uRes,   canvas.width, canvas.height);
        gl.uniform1f(uT,     t);
        gl.uniform2f(uMouse, mouse[0], mouse[1]);
        gl.uniform4f(uClick, clickPos[0], clickPos[1], clickTime, hasClick);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    render();
})();
