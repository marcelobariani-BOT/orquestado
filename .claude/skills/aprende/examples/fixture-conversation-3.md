# Fixture 3 — Multi-step workflow → skill stub / Workflow multi-paso → stub de skill

A synthetic conversation that should produce one medium-confidence `skill`
stub candidate (a 6-step workflow the user walked through explicitly).

Conversación sintética que debe producir un candidato `skill` stub de
confidence medio (un workflow de 6 pasos que el usuario detalló).

---

## Transcript

**User:** OK, let's verify the RLS policies on the `orders` table. The
process is:

1. Connect to the staging DB with `psql` using the service role.
2. Run `SELECT * FROM pg_policies WHERE tablename = 'orders';` and confirm
   there are exactly 4 policies (SELECT, INSERT, UPDATE, DELETE).
3. For each policy, verify the `USING` and `WITH CHECK` expressions both
   reference `auth.uid() = user_id`.
4. Switch to a regular user role and try `SELECT * FROM orders` — should
   only return their own rows.
5. Try `INSERT INTO orders (user_id, ...) VALUES ('other-uid', ...)` —
   should fail with RLS violation.
6. Document the result in `docs/rls-audit-<date>.md`.

**Assistant:** (Bash) `psql ...` runs steps 1-5, confirms all pass.
(Write) creates `docs/rls-audit-2026-05-11.md` with the results.

**User:** Perfect. /aprende

---

## Expected output

```
Found 1 candidate learning from this conversation.
Encontré 1 aprendizaje candidato en esta conversación.

Reply with: numbers (e.g. 1,3,5), ranges (1-4), "all", "none", or
"edit N: <new wording>" / "drop low" / "skip N".

Responde con: números (ej. 1,3,5), rangos (1-4), "all", "none", o
"edit N: <nueva descripción>" / "drop low" / "skip N".

 1. [skill]       /verify-rls — 6-step RLS verification workflow (psql + audit doc)  (medium)

>
```

**Acceptance criteria:**
- One `skill` candidate. Confidence `(medium)` is correct — workflow only
  appeared once, but the user explicitly walked through it step-by-step.
- If the user picks `1`, a **stub** is written at
  `~/.claude/skills/verify-rls/SKILL.md` (or `./.claude/skills/verify-rls/`
  if the conversation was clearly repo-specific — in this case the steps
  reference a specific table `orders`, suggesting project-local).
- The stub contains:
  - `[STUB drafted by /aprende on YYYY-MM-DD]` in the description.
  - All 6 observed steps in the "Workflow" section.
  - `[STUB — fill in: ...]` markers in "When to invoke" and "Examples".
- Confirmation line ends with: *"Run the skill-creator plugin (or edit
  manually) to flesh it out before publishing."*

**Criterios de aceptación:**
- Un candidato `skill` con confidence `(medium)`.
- Si el usuario elige `1`, se escribe un **stub** (no un skill completo).
- El stub contiene los 6 pasos observados y marcadores `[STUB — completar]`
  en las secciones que faltan.
- La línea de confirmación termina con: *"Corre el plugin skill-creator (o
  edita manualmente) para completarlo antes de publicar."*

---

## Why this is `medium`, not `high`

A skill drafted from one observation is high false-positive territory.
Even though the user walked through the steps explicitly, we don't know
yet if this workflow recurs. The stub is meant as a *starting point* for
the user to refine when (and if) the pattern repeats.

Un skill drafteado de una sola observación tiene alto riesgo de falsos
positivos. Aunque el usuario detalló los pasos, no sabemos todavía si el
workflow se repite. El stub es un *punto de partida* para que el usuario
lo refine cuando (y si) el patrón se repite.
