# Orquestado — CLAUDE.md

## Qué es este proyecto
Orquestado es la landing principal de una agencia de automatización con IA. Es una página disruptiva, con animaciones pesadas y scroll storytelling, que presenta los servicios de automatización y da protagonismo a Mi Mostrador (producto estrella de la agencia).

El objetivo de la landing es convertir: que el visitante entienda qué hace Orquestado, vea los servicios, y tome contacto o pida una demo.

Web: https://www.orquestado.com.ar

---

## Stack tecnológico
- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Idiomas:** Español e inglés (i18n con next-intl)
- **Deploy:** Vercel

---

## Servicios que ofrece Orquestado
1. **Mi Mostrador** — plataforma de pedidos y delivery para negocios (producto estrella)
2. **Bots para web** — bots incrustados en páginas, atención automatizada
3. **Llamadas por voz automatizadas** — llamadas salientes con IA
4. **Recepción y derivación de llamadas** — atención entrante, derivación a ventas o turnos
5. **Gestión de turnos con IA** — agendamiento automático por voz o chat

---

## Estética y referencias visuales
- Scroll storytelling al estilo NRG Data Center (https://business.nrg.com/campaigns/build-your-data-center/) — cada sección construye algo
- Cards que guían al usuario al estilo Kelly Portfolio (https://kellydev.io/) — navegación intuitiva por cards
- Animaciones con propósito: revelan, guían, no distraen
- Estética: oscura, premium, tech — con momentos de color para los CTAs
- Mobile-first siempre

---

## Estructura de carpetas
```
orquestado/
├── .claude/
│   ├── CLAUDE.md
│   ├── settings.json
│   └── skills/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx        ← landing principal
│   │   └── layout.tsx
│   └── globals.css
├── components/
│   ├── sections/           ← cada sección de la landing
│   ├── ui/                 ← componentes reutilizables
│   └── animations/         ← wrappers de Framer Motion
├── messages/
│   ├── es.json             ← textos en español
│   └── en.json             ← textos en inglés
├── public/
└── tailwind.config.ts
```

---

## Secciones de la landing
1. **Hero** — impacto inmediato, tagline, animación de entrada, CTA principal
2. **Servicios** — cards interactivas, una por servicio, scroll-triggered
3. **Mi Mostrador spotlight** — sección dedicada al producto estrella con demo visual
4. **Cómo funciona** — scroll storytelling que "construye" la automatización paso a paso
5. **Casos de uso** — ejemplos concretos por industria
6. **CTA final** — contacto / demo / WhatsApp

---

## Skills disponibles
Lee y aplica los skills de `.claude/skills/` antes de ejecutar cualquier tarea de diseño o código:
- `.claude/skills/aprende/`
- `.claude/skills/components-build/`
- `.claude/skills/fixing-motion-performance/`
- `.claude/skills/impeccable/`
- `.claude/skills/ui-ux-pro-max/`
- `.claude/skills/fixing-motion-performance.md`

---

## Reglas de desarrollo
- Siempre mobile-first
- Cada componente en su propio archivo
- Las animaciones van en `components/animations/` como wrappers reutilizables
- Nunca hardcodear textos — siempre usar el sistema i18n
- Performance primero: lazy load en imágenes, animaciones con `will-change` solo cuando sea necesario
- Antes de crear un componente nuevo, verificar si ya existe uno similar en `components/ui/`
- Al terminar cada tarea abrir Chrome con el MCP y verificar el resultado en desktop y mobile

---

## MCP Chrome
Tenés acceso al MCP de Chrome DevTools. Usalo para:
- Verificar animaciones después de implementarlas
- Revisar responsive en distintos viewports
- Detectar problemas de performance (CLS, LCP)
- No hacer ningún cambio visual sin verificarlo en el browser

---

## Convenciones de código
- TypeScript estricto
- Componentes funcionales con arrow functions
- Props tipadas con interfaces, no types
- Nombres de componentes en PascalCase
- Nombres de archivos en kebab-case
- Comentarios en español

---

## Git & Deploy Workflow
- La rama default es `main`. Todo el trabajo nuevo va ahí.
- El remote se llama `bot`. Para pushear: git push bot main
- Vercel deployea `main` automáticamente en producción.
- Después de cada cambio confirmado, hacer commit y push a bot main automáticamente sin pedir confirmación.
