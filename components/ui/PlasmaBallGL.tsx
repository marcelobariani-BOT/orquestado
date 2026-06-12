'use client';

/**
 * PlasmaBallGL — Plasma Globe de nimitz (ShaderToy XsjXRm)
 * Convertido de Metal a WebGL2 GLSL.
 * Reemplaza al PlasmaBall SVG con ray-marching volumétrico real.
 */

import { useEffect, useRef } from 'react';

// ── Vertex shader — quad de pantalla completa ────────────────────
const VERT = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// ── Fragment shader — Plasma Globe by nimitz ─────────────────────
const FRAG = `#version 300 es
precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;

out vec4 fragColor;

#define NUM_RAYS        13
#define VOLUMETRIC_STEPS 19
#define MAX_ITER        35
#define FAR             6.0

mat2 mm2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// ── Noise procedural (reemplaza el iChannel0 de la versión original) ──
float hash(float n) { return fract(sin(n) * 43758.5453); }

float noise1D(float x) {
  float i = floor(x * 0.01);
  float f = fract(x * 0.01);
  f = f*f*(3.0 - 2.0*f);
  return mix(hash(i), hash(i + 1.0), f);
}

float noise3D(vec3 p) {
  vec3 ip = floor(p);
  vec3 f  = fract(p);
  f = f*f*(3.0 - 2.0*f);
  float n = ip.x + ip.y*57.0 + ip.z*113.0;
  return mix(
    mix(mix(hash(n),      hash(n+1.0),   f.x),
        mix(hash(n+57.0), hash(n+58.0),  f.x), f.y),
    mix(mix(hash(n+113.0),hash(n+114.0), f.x),
        mix(hash(n+170.0),hash(n+171.0), f.x), f.y),
    f.z
  );
}

// ── Matrix de rotación fractal ───────────────────────────────────
const mat3 m3 = mat3(
   0.00,  0.80,  0.60,
  -0.80,  0.36, -0.48,
  -0.60, -0.48,  0.64
);

// ── Funciones del shader original ───────────────────────────────
float flow(vec3 p, float t, float time) {
  float z = 2.0, rz = 0.0;
  vec3 bp = p;
  for (int i = 0; i < 4; i++) {
    p += time * 0.1;
    rz += (sin(noise3D(p + t*0.8) * 6.0) * 0.5 + 0.5) / z;
    p  = mix(bp, p, 0.6);
    z  *= 2.0;
    p  *= 2.01;
    p   = m3 * p;
  }
  return rz;
}

float sins(float x, float time) {
  float rz = 0.0, z = 2.0;
  for (int i = 0; i < 3; i++) {
    rz += abs(fract(x*1.4) - 0.5) / z;
    x  *= 1.3;
    z  *= 1.15;
    x  -= time * 0.65 * z;
  }
  return rz;
}

float segm(vec3 p, vec3 a, vec3 b) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba*h) * 0.5;
}

vec3 path(float i, float d, float time) {
  vec3 en = vec3(0.0, 0.0, 1.0);
  float sns2 = sins(d + i*0.5, time) * 0.22;
  float sns  = sins(d + i*0.6, time) * 0.21;
  en.xz = mm2((hash(i*10.569) - 0.5)*6.2 + sns2) * en.xz;
  en.xy = mm2((hash(i*4.732)  - 0.5)*6.2 + sns ) * en.xy;
  return en;
}

vec2 map(vec3 p, float i, float time) {
  float lp   = length(p);
  vec3  en   = path(i, lp, time);
  float ins  = smoothstep(0.11, 0.46, lp);
  float outs = 0.15 + smoothstep(0.0, 0.15, abs(lp - 1.0));
  p *= ins * outs;
  return vec2(segm(p, vec3(0.0), en) - 0.011, ins*outs);
}

float march(vec3 ro, vec3 rd, float startf, float maxd, float j, float time) {
  float precis = 0.001, h = 0.5, d = startf;
  for (int i = 0; i < MAX_ITER; i++) {
    if (abs(h) < precis || d > maxd) break;
    d += h * 1.2;
    h  = map(ro + rd*d, j, time).x;
  }
  return d;
}

vec3 vmarch(vec3 ro, vec3 rd, float j, vec3 orig, float time) {
  vec3  p   = ro;
  vec3  sum = vec3(0.0);
  vec2  r;
  for (int i = 0; i < VOLUMETRIC_STEPS; i++) {
    r    = map(p, j, time);
    p   += rd * 0.03;
    float lp  = length(p);
    vec3  col = sin(vec3(1.05, 2.5, 1.52)*3.94 + r.y)*0.85 + 0.4;
    col *= smoothstep(0.0,  0.015, -r.x);
    col *= smoothstep(0.04, 0.2,   abs(lp - 1.1));
    col *= smoothstep(0.1,  0.34,  lp);
    float denom = log(max(0.01, distance(p, orig) - 2.0)) + 0.75;
    sum += abs(col) * 5.0 * (1.2 - noise1D(lp*2.0 + j*13.0 + time*5.0)*1.1)
           / max(0.001, denom);
  }
  return sum;
}

vec2 iSphere2(vec3 ro, vec3 rd) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b*b - c;
  if (h < 0.0) return vec2(-1.0);
  return vec2(-b - sqrt(h), -b + sqrt(h));
}

// ── Main ─────────────────────────────────────────────────────────
void main() {
  float time = iTime;
  vec2  p    = gl_FragCoord.xy / iResolution.xy - 0.5;
  p.x *= iResolution.x / iResolution.y;
  vec2 um = iMouse / iResolution - 0.5;

  // Cámara
  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = normalize(vec3(p * 0.7, -1.5));
  mat2 mx = mm2(time*0.4 + um.x*6.0);
  mat2 my = mm2(time*0.3 + um.y*6.0);
  ro.xz *= mx; rd.xz *= mx;
  ro.xy *= my; rd.xy *= my;

  vec3 bro = ro, brd = rd;
  vec3 col = vec3(0.0125, 0.0, 0.025);

  // 13 rayos volumétricos
  for (int ji = 0; ji < NUM_RAYS; ji++) {
    float j = float(ji) + 1.0;
    ro = bro; rd = brd;
    mat2 mm = mm2((time*0.1 + ((j+1.0)*5.1)) * j*0.25);
    ro.xy *= mm; rd.xy *= mm;
    ro.xz *= mm; rd.xz *= mm;
    float rz = march(ro, rd, 2.5, FAR, j, time);
    if (rz >= FAR) continue;
    col = max(col, vmarch(ro + rz*rd, rd, j, bro, time));
  }

  // Reflejo en la superficie de la esfera
  ro = bro; rd = brd;
  vec2 sph = iSphere2(ro, rd);
  if (sph.x > 0.0) {
    vec3 pos  = ro + rd*sph.x;
    vec3 pos2 = ro + rd*sph.y;
    float nz  = -log(abs(flow(reflect(rd, pos )*1.2,  time, time) - 0.01));
    float nz2 = -log(abs(flow(reflect(rd, pos2)*1.2, -time, time) - 0.01));
    col += (0.1*nz*nz*vec3(0.12,0.12,0.5) + 0.05*nz2*nz2*vec3(0.55,0.2,0.55)) * 0.8;
  }

  fragColor = vec4(col * 1.3, 1.0);
}`;

// ── Interfaz ─────────────────────────────────────────────────────
interface PlasmaBallGLProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function PlasmaBallGL({ size = 300, className = '', style }: PlasmaBallGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false });
    if (!gl) {
      if (process.env.NODE_ENV === 'development') console.warn('[PlasmaBallGL] WebGL2 no disponible');
      return;
    }

    // Compilar un shader
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        if (process.env.NODE_ENV === 'development') console.error('[PlasmaBallGL] shader error:', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };

    const vert = compile(gl.VERTEX_SHADER, VERT);
    const frag = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV === 'development') console.error('[PlasmaBallGL] link error:', gl.getProgramInfoLog(prog));
      return;
    }

    // Quad de pantalla completa (2 triángulos)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(prog);
    const uRes   = gl.getUniformLocation(prog, 'iResolution');
    const uTime  = gl.getUniformLocation(prog, 'iTime');
    const uMouse = gl.getUniformLocation(prog, 'iMouse');

    const start = performance.now();

    const render = () => {
      const w = canvas.width, h = canvas.height;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes,   w, h);
      gl.uniform1f(uTime,  (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    // Interactividad con el mouse
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = [e.clientX - r.left, e.clientY - r.top];
    };
    canvas.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', onMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', ...style }}
    />
  );
}
