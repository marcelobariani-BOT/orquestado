---

## Librerías relevantes instaladas
- `@paper-design/shaders-react` — liquid metal shader
- `cult-ui` — carrusel 3D, border beam, bg-animate-button, canvas fractal grid
- `three` + `@types/three` — WebGL

---

## Skills disponibles en `.claude/skills/`
Leer y aplicar antes de cualquier tarea de diseño o código:
- `ui-ux-pro-max` — design system, script `search.py`
- `impeccable` — preflight checks de diseño
- `fixing-motion-performance` — performance de animaciones
- `components-build` — arquitectura de componentes
- `grill-me` — stress test de decisiones

---

## Convenciones de código
- TypeScript estricto, sin hardcodear textos (siempre i18n)
- Componentes funcionales con arrow functions
- Props tipadas con interfaces
- PascalCase para componentes, kebab-case para archivos
- Comentarios en español
- Antes de crear un componente nuevo, verificar si ya existe en `components/ui/`

---

## Git & Deploy
- Rama: `main`. Remote: `bot`.
- Push: `git push bot main`
- Vercel deploya `main` automáticamente.
- Commit y push automático después de cada cambio confirmado, sin pedir confirmación.

---

## MCP Chrome
Verificar siempre después de cada cambio visual:
- Animaciones en desktop y mobile
- Responsive en distintos viewports
- Performance (CLS, LCP)

---

## Reglas de debugging — LEER ANTES DE PROPONER CUALQUIER FIX

**Cuando un fix "no funcionó", NO proponer otro sin antes verificar la hipótesis.**

Protocolo obligatorio:
1. Pedir evidencia concreta primero: `console.log` del handler, screenshot del estado roto, o DOM inspeccionado con dimensiones reales
2. Si el handler se dispara pero no pasa nada visualmente → bug es CSS/render, NO lógica
3. Si el handler NO se dispara → bug es eventos/JSX, NO render
4. Separar siempre: "el código no corrió" vs "el código corrió pero no se ve"
5. Si dos fixes consecutivos no funcionan → el diagnóstico está mal, empezar desde cero con evidencia

---

## Gotchas conocidos de este stack

**TextureFrame y componentes con capas absolute:**
- Necesitan que el padre tenga altura definida. Sin ella colapsan a 0 y el contenido es invisible aunque el componente esté montado.

**Overlays modales:**
- Nunca `height: 'auto'` sin `minHeight` cuando el contenido depende de hijos `absolute`.
- La superficie interior (`absolute inset-[1px]`) necesita estar en flow normal si el padre no tiene altura fija.

**Framer Motion + drag:**
- En elementos con `drag` activo, usar `onTap` en el hijo, no `onClick` en el wrapper.
- `layoutId` compartido entre un elemento en contexto `preserve-3d` y un `position: fixed` es frágil — evitar.

**Niveles de confianza — obligatorio en cada afirmación técnica:**
- `[Seguro]` — probado o verificado en el código actual
- `[Probable]` — inferencia fuerte, no verificada
- `[Suposición]` — completando información faltante

Si más del 50% de una respuesta es `[Suposición]`, decirlo al inicio.

## Backlog
- [ ] Prueba social en overlays de servicios — agregar datos reales (pedidos procesados, llamadas atendidas) cuando existan
