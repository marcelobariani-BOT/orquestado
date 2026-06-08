'use client';

/**
 * PlasmaBall — esfera de plasma WebGL
 * Shader basado en XsjXRm "Plasma Globe" by nimitz (shadertoy.com/view/XsjXRm)
 * Adaptación: colores originales verde/amarillo → cyan/violeta para la paleta de Orquestado
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ── Vertex shader: quad full-screen en NDC ────────────────────── */
const VERT = /* glsl */`
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

/* ── Fragment shader: adaptado de XsjXRm por nimitz ───────────── */
const FRAG = /* glsl */`
uniform float iTime;
uniform vec2  iResolution;

/* Reducimos iteraciones respecto al original para rendimiento
   en el canvas de 160×160 sin pérdida visual perceptible */
#define NUM_RAYS    8.
#define VOL_STEPS   14
#define MAX_ITER    25
#define FAR         6.

/* --- utilidades ------------------------------------------------ */
mat2 mm2(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

float hash(float n){ return fract(sin(n)*43758.5453); }

/* Ruido 3D procedural — reemplaza el muestreo de textura del original */
float noise3D(vec3 p){
  vec3 ip=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  float n=ip.x+ip.y*57.0+113.0*ip.z;
  return mix(
    mix(mix(hash(n),    hash(n+1.0),  f.x), mix(hash(n+57.0), hash(n+58.0), f.x), f.y),
    mix(mix(hash(n+113.),hash(n+114.),f.x), mix(hash(n+170.),hash(n+171.),  f.x), f.y),
    f.z);
}

/* Matriz de rotación de dominio para fbm — idéntica al original */
const mat3 m3 = mat3(
   0.00, 0.80, 0.60,
  -0.80, 0.36,-0.48,
  -0.60,-0.48, 0.64);

/* Plasma en superficie de la esfera (reflexión del entorno) */
float flow(vec3 p, float t){
  float z=2., rz=0.;
  vec3 bp=p;
  for(float i=1.;i<5.;i++){
    p += iTime*0.1;
    rz += (sin(noise3D(p + t*0.8)*6.)*0.5+0.5)/z;
    p  = mix(bp,p,0.6);
    z *= 2.;
    p *= 2.01;
    p *= m3;
  }
  return rz;
}

/* Señal para definir la curvatura de cada rayo */
float sins(float x){
  float rz=0., z=2.;
  for(float i=0.;i<3.;i++){
    rz += abs(fract(x*1.4)-0.5)/z;
    x  *= 1.3;
    z  *= 1.15;
    x  -= iTime*0.65*z;
  }
  return rz;
}

/* Distancia de un punto a un segmento (base de los rayos) */
float segm(vec3 p, vec3 a, vec3 b){
  vec3 pa=p-a, ba=b-a;
  float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
  return length(pa-ba*h)*0.5;
}

/* Dirección del j-ésimo rayo en función del tiempo */
vec3 path(float i, float d){
  vec3 en=vec3(0.,0.,1.);
  float s2=sins(d+i*0.5)*0.22, s=sins(d+i*0.6)*0.21;
  en.xz = mm2((hash(i*10.569)-0.5)*6.2+s2)*en.xz;
  en.xy = mm2((hash(i*4.732) -0.5)*6.2+s )*en.xy;
  return en;
}

/* SDF del volumen de rayos */
vec2 map(vec3 p, float i){
  float lp=length(p);
  vec3 en=path(i,lp);
  float ins  = smoothstep(0.11,0.46,lp);
  float outs = 0.15+smoothstep(0.,0.15,abs(lp-1.));
  p *= ins*outs;
  return vec2(segm(p,vec3(0.),en)-0.011, ins*outs);
}

/* Ray-march para encontrar la entrada al volumen del rayo j */
float march(vec3 ro, vec3 rd, float s, float mx, float j){
  float h=0.5, d=s;
  for(int i=0;i<MAX_ITER;i++){
    if(abs(h)<0.001||d>mx) break;
    d += h*1.2;
    h  = map(ro+rd*d, j).x;
  }
  return d;
}

/* Integración volumétrica del rayo j — genera el color del rayo
   ADAPTACIÓN DE COLOR: cyan vec3(.2,.9,1.) / violeta vec3(.6,.3,1.)
   en lugar de los verdes/amarillos del original */
vec3 vmarch(vec3 ro, vec3 rd, float j, vec3 orig){
  vec3 p=ro, sum=vec3(0.);
  vec2 r;
  for(int i=0;i<VOL_STEPS;i++){
    r = map(p,j);
    p += rd*0.03;
    float lp=length(p);
    float mf=sin(r.y*4.0+j*1.3)*0.5+0.5;
    vec3 col = mix(vec3(0.2,0.9,1.0), vec3(0.6,0.3,1.0), mf)*0.9+0.1;
    col *= smoothstep(0.0, 0.015,-r.x);
    col *= smoothstep(0.04,0.2,  abs(lp-1.1));
    col *= smoothstep(0.1, 0.34, lp);
    sum += abs(col)*5.0*(1.2-noise3D(lp*2.0+j*13.0+iTime*5.0)*1.1)
          /(log(distance(p,orig)-2.0)+0.75);
  }
  return sum;
}

/* Intersección rayo-esfera unitaria centrada en el origen */
vec2 iSphere2(vec3 ro, vec3 rd){
  float b=dot(ro,rd), c=dot(ro,ro)-1., h=b*b-c;
  if(h<0.) return vec2(-1.);
  return vec2(-b-sqrt(h), -b+sqrt(h));
}

/* ── main ──────────────────────────────────────────────────────── */
void main(){
  vec2 p=(gl_FragCoord.xy - iResolution*0.5)/min(iResolution.x,iResolution.y);

  vec3 ro=vec3(0.,0.,5.);
  vec3 rd=normalize(vec3(p*0.7,-1.5));

  /* Rotación de cámara continua (sin mouse en esta versión embedded) */
  mat2 mx=mm2(iTime*0.4), my=mm2(iTime*0.3);
  ro.xz=mx*ro.xz; rd.xz=mx*rd.xz;
  ro.xy=my*ro.xy; rd.xy=my*rd.xy;

  vec3 bro=ro, brd=rd;

  /* Fondo base oscuro con tinte púrpura */
  vec3 col=vec3(0.0125,0.0,0.025);

  /* Trazar cada rayo de plasma */
  for(float j=1.;j<NUM_RAYS+1.;j++){
    ro=bro; rd=brd;
    mat2 mm=mm2((iTime*0.1+(j+1.)*5.1)*j*0.25);
    ro.xy=mm*ro.xy; rd.xy=mm*rd.xy;
    ro.xz=mm*ro.xz; rd.xz=mm*rd.xz;
    float rz=march(ro,rd,2.5,FAR,j);
    if(rz>=FAR) continue;
    col=max(col, vmarch(ro+rz*rd, rd, j, bro));
  }

  /* Esfera de vidrio y reflejo de plasma en su superficie
     ADAPTACIÓN DE COLOR: azul-cyan y violeta */
  ro=bro; rd=brd;
  vec2 sph=iSphere2(ro,rd);
  if(sph.x>0.){
    vec3 rf  = reflect(rd, normalize(ro+rd*sph.x));
    vec3 rf2 = reflect(rd, normalize(ro+rd*sph.y));
    float nz  = -log(abs(flow(rf *1.2, iTime)-0.01));
    float nz2 = -log(abs(flow(rf2*1.2,-iTime)-0.01));
    col += (nz *nz *vec3(0.2,0.9,1.0)*0.10
           +nz2*nz2*vec3(0.6,0.3,1.0)*0.05)*0.8;
  }

  gl_FragColor = vec4(col*1.3, 1.0);
}
`;

/* ══════════════════════════════════════════════════════════════════
   Componente React
══════════════════════════════════════════════════════════════════ */
export default function PlasmaBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Three.js renderer — alpha:true para fondo transparente */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(160, 160, false); // false = no tocar el CSS del canvas
    renderer.setPixelRatio(1);         // fijo 1:1 — suficiente para 160px

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector2(160, 160) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let rafId    = 0;
    let running  = false;
    const startT = performance.now();

    function animate() {
      if (!running) return;
      uniforms.iTime.value = (performance.now() - startT) / 1000;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }

    /* Pausar cuando el canvas no está visible — ahorra GPU off-screen */
    const observer = new IntersectionObserver(
      (entries) => {
        running = entries[0].isIntersecting;
        if (running) animate();
        else cancelAnimationFrame(rafId);
      },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      renderer.dispose();
      material.dispose();
      mesh.geometry.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={160}
      style={{ display: 'block', width: 160, height: 160 }}
    />
  );
}
