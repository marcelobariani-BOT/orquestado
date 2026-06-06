# Examples / Ejemplos

These are **fixtures** — synthetic conversation transcripts with expected
`/aprende` output. They serve two purposes:

Estas son **fixtures** — transcripciones sintéticas con el output esperado
de `/aprende`. Sirven para dos cosas:

1. **QA after install.** Run `/aprende` against a session that mirrors
   one of these fixtures. The output should match the expected one. If
   it doesn't, the skill needs revising.
2. **Documentation by example.** New contributors and curious users can
   read these to understand what kinds of learnings `aprende` surfaces
   and at what confidence levels.

1. **QA después de instalar.** Corre `/aprende` contra una sesión que
   refleje una de estas fixtures. El output debe coincidir. Si no, el
   skill necesita revisión.
2. **Documentación por ejemplo.** Contributors nuevos y curiosos pueden
   leerlas para entender qué tipos de aprendizajes saca `aprende` y a qué
   niveles de confidence.

---

## The three fixtures

| File | Scenario | Expected categories | Expected confidence |
|------|----------|---------------------|---------------------|
| `fixture-conversation-1.md` | Explicit user correction on repo conventions | 2 × `project-doc` | high, high |
| `fixture-conversation-2.md` | Error → fix with user explaining *why* | 1 × `lesson`, 1 × `project-doc` | high, high |
| `fixture-conversation-3.md` | User walks through a 6-step workflow | 1 × `skill` stub | medium |

---

## How to use these for QA / Cómo usarlas para QA

**EN.** In a fresh Claude Code session in any test project:

1. Open one of the fixtures and copy the "Transcript" section into a
   conversation, message by message (you play "User", the agent plays
   "Assistant").
2. After the final `/aprende` line, the agent should produce something
   matching the fixture's "Expected output" section.
3. **Don't worry about exact phrasing** of titles and rationales —
   wording will vary by model. **Do check:**
   - Correct *number* of candidates per category.
   - Correct *confidence labels*.
   - Correct *destination paths* if you accept the candidates.

**ES.** En una sesión Claude Code limpia en cualquier proyecto de prueba:

1. Abre una fixture y copia la sección "Transcript" a una conversación,
   mensaje por mensaje (tú haces de "User", el agente de "Assistant").
2. Después de la línea final `/aprende`, el agente debe producir algo que
   coincida con la sección "Expected output" de la fixture.
3. **No te preocupes por el wording exacto** de los títulos — varía por
   modelo. **Sí revisa:**
   - *Número* correcto de candidatos por categoría.
   - *Etiquetas de confidence* correctas.
   - *Paths de destino* correctos si aceptas los candidatos.

---

## Contributing new fixtures / Aportar fixtures nuevas

If you find a scenario where `aprende` underperforms (false positive,
false negative, wrong category, wrong confidence), please open a PR with:

1. A new `fixture-conversation-N.md` file in the same shape as the
   existing three.
2. The output you actually got (under a `## Actual output (vN.N.N)`
   section).
3. The output you'd expect (under `## Expected output`).
4. A note about what should change in `SKILL.md` or
   `references/signal-patterns.md` to make the actual match the expected.

These bug-fixtures are the most valuable contribution — false positives
are exactly the failure mode `aprende` is designed to avoid.

Si encuentras un escenario donde `aprende` falla (falso positivo, falso
negativo, categoría equivocada, confidence equivocada), por favor abre un
PR con la fixture, el output que obtuviste, el que esperabas, y qué
debería cambiar.
