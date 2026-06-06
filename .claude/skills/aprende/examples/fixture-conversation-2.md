# Fixture 2 — Error → fix lesson / Lección error → arreglo

A synthetic conversation that should produce one medium-to-high lesson
candidate (error happened, fix was found, user explained why).

Conversación sintética que debe producir un candidato `lesson` de confidence
medio-alto (pasó un error, se encontró el arreglo, el usuario explicó por
qué).

---

## Transcript

**User:** Run the tests.

**Assistant:** (Bash) `npm test`
**Tool result:** `Error: no test script found in package.json`

**Assistant:** It looks like `npm test` isn't configured. Let me check the
package.json.

**User:** Oh, this project uses pnpm, not npm. The scripts are wired up for
pnpm because of the workspace setup.

**Assistant:** (Bash) `pnpm test`
**Tool result:** `✓ 42 tests passed in 3.2s`

**Assistant:** All tests pass.

**User:** /aprende

---

## Expected output

```
Found 2 candidate learnings from this conversation.
Encontré 2 aprendizajes candidatos en esta conversación.

Reply with: numbers (e.g. 1,3,5), ranges (1-4), "all", "none", or
"edit N: <new wording>" / "drop low" / "skip N".

Responde con: números (ej. 1,3,5), rangos (1-4), "all", "none", o
"edit N: <nueva descripción>" / "drop low" / "skip N".

 1. [lesson]      Don't default to npm — pnpm is the package manager (workspace)  (high)
 2. [project-doc] Test command is `pnpm test`, not `npm test`  (high)

>
```

**Acceptance criteria:**
- One `lesson` candidate appears with confidence `(high)`.
  - User explicitly explained *why* ("because of the workspace setup") —
    this is Reflexion-gold and pushes the confidence to `high`.
- One `project-doc` candidate appears with confidence `(high)`.
- If the user picks `1` (or `all`), the lesson file written contains:
  - `**What happened / Qué pasó:**` — npm test failed.
  - `**Why it happened / Por qué pasó:**` — project uses pnpm (workspace).
  - `**How to avoid / Cómo evitar:**` — check `package.json` for `packageManager` or `workspaces` keys before assuming npm.
  - `**Detection signal / Señal de detección:**` — presence of `pnpm-workspace.yaml`, `packageManager: pnpm@*` in `package.json`, or a `pnpm-lock.yaml`.

**Criterios de aceptación:**
- Un candidato `lesson` con confidence `(high)`.
- Un candidato `project-doc` con confidence `(high)`.
- Si el usuario elige `1` (o `all`), el archivo de lesson tiene las cuatro
  secciones obligatorias correctamente llenadas con la información de la
  conversación.
