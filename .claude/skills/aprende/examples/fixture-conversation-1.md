# Fixture 1 — Explicit correction / Corrección explícita

A synthetic conversation transcript that should produce one high-confidence
project-doc candidate. Used to QA-check `/aprende` after install.

Transcripción sintética que debe producir un candidato project-doc de alta
confidence. Para QA-checkear `/aprende` después de instalar.

---

## Transcript

**User:** Add a button to the homepage that opens a modal.

**Assistant:** I'll add a button. (writes JSX with tab indentation)

**User:** No, stop. This repo uses 2 spaces, not tabs. Look at any other file.

**Assistant:** You're right, I apologize. (rewrites with 2 spaces) Here's the
corrected version using 2-space indentation.

**User:** Better. Also we always use named exports here, never default. Same
thing — look at the rest of the codebase.

**Assistant:** Understood. (changes export). Done.

**User:** /aprende

---

## Expected output

`/aprende` should print something like:

```
Found 2 candidate learnings from this conversation.
Encontré 2 aprendizajes candidatos en esta conversación.

Reply with: numbers (e.g. 1,3,5), ranges (1-4), "all", "none", or
"edit N: <new wording>" / "drop low" / "skip N".

Responde con: números (ej. 1,3,5), rangos (1-4), "all", "none", o
"edit N: <nueva descripción>" / "drop low" / "skip N".

 1. [project-doc] Indent with 2 spaces, not tabs — user said it explicitly and pointed at other files  (high)
 2. [project-doc] Always use named exports, never default — user said it's the repo convention  (high)

>
```

**Acceptance criteria:**
- Two `project-doc` candidates appear.
- Both are `(high)` confidence (explicit user correction).
- No `memory` candidate ("user prefers X") — these are repo conventions, not user preferences.
- No `lesson` candidate — no actual error happened that caused a bug; the agent just used the wrong default.
- No `skill` candidate — not a multi-step workflow.

**Criterios de aceptación:**
- Aparecen dos candidatos `project-doc`.
- Ambos son `(high)` confidence.
- Sin candidato `memory` — son convenciones del repo, no preferencias del usuario.
- Sin candidato `lesson` — no hubo un error real que causara un bug.
- Sin candidato `skill`.

If the user replies `all`, the agent should write/append to `./CLAUDE.md`
AND `./AGENTS.md` under a `## Conventions` section.

Si el usuario responde `all`, el agente debe escribir/appendear a
`./CLAUDE.md` Y `./AGENTS.md` bajo una sección `## Conventions`.
