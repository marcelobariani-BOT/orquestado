# Contributing to `aprende`

Thanks for considering a contribution. This project's central failure mode
is **false positives** — learnings that look right but lock in the wrong
rule. Every contribution that helps us catch or prevent false positives
is gold.

Gracias por considerar contribuir. El modo de fallo central de este
proyecto son los **falsos positivos** — aprendizajes que parecen
correctos pero cristalizan la regla equivocada. Toda contribución que
ayude a detectarlos o prevenirlos es oro.

---

## Most valuable contributions / Las contribuciones más valiosas

1. **False-positive reports.** You ran `/aprende`, confirmed an item,
   and later realized the rule was wrong. **Open a "False positive"
   issue** with the conversation context and what should have happened
   instead. (Use the template.)
2. **New signal patterns.** Found a phrasing in your language (or any
   language) that should trigger a correction signal but doesn't? Add
   it to `skills/aprende/references/signal-patterns.md` and open a PR.
3. **Better lesson examples.** Anonymized real lessons from your
   sessions that show the four-section Reflexion format working well —
   they help us write better docs and tighten the format.
4. **Bug reports.** Hooks that block, scripts that crash, paths that
   are wrong on Linux — please file them.

1. **Reportes de falso positivo.** Corriste `/aprende`, confirmaste un
   item, y después te diste cuenta de que la regla estaba mal. **Abre
   un issue "False positive"** con el contexto y qué debió pasar.
2. **Nuevos patrones de señal.** ¿Encontraste una frase en tu idioma
   que debería disparar una señal pero no lo hace? Agrégala a
   `signal-patterns.md` y abre un PR.
3. **Mejores ejemplos de lessons.** Lessons reales anonimizadas que
   muestran el formato Reflexion funcionando.
4. **Bug reports.** Hooks que bloquean, scripts que crashean, paths
   incorrectos en Linux.

---

## Local development / Desarrollo local

```bash
git clone https://github.com/Hainrixz/aprende-skill.git
cd aprende-skill

# Install the skill manually for testing.
cp -r skills/aprende ~/.claude/skills/
cp -r skills/learn ~/.claude/skills/

# (Optional) install the hooks for testing.
mkdir -p ~/.claude/aprende-hooks
cp hooks-handlers/*.sh ~/.claude/aprende-hooks/
chmod +x ~/.claude/aprende-hooks/*.sh
# Then edit ~/.claude/settings.json to wire them up (see the README).
```

To validate changes before opening a PR:

```bash
# JSON validity
python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))"
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))"
python3 -c "import json; json.load(open('hooks/hooks.json'))"

# Bash syntax
bash -n hooks-handlers/capture-signal.sh
bash -n hooks-handlers/stop-suggest.sh

# YAML frontmatter on every skill/command markdown
for f in skills/*/SKILL.md commands/*.md; do
  head -20 "$f" | grep -q "^name:\|^description:" || echo "MISSING frontmatter: $f"
done
```

GitHub Actions runs these on every PR — see `.github/workflows/validate.yml`.

---

## Style / Estilo

- **Bilingual everything.** Every user-facing string in SKILL.md, README,
  reference files, and templates must have an English and a Spanish
  version. Either inline (`EN — ... / ES — ...`) or alternating
  paragraphs. Use natural Spanish, not Google-translated.
- **Confirmation-first.** No PR should weaken the "never write before
  user confirms" guardrail. Mention this explicitly in any PR that
  touches Pass D or E.
- **Prefer false negatives.** When in doubt about a signal pattern, err
  toward missing it rather than triggering on every variation.
- **Reflexion-style lessons.** New `type: lesson` examples must have all
  four mandatory subheads (`What happened`, `Why it happened`,
  `How to avoid`, `Detection signal`).

---

## PR checklist / Checklist de PR

Before requesting review:

- [ ] All JSON files parse (CI checks this).
- [ ] All bash scripts pass `bash -n` (CI checks this).
- [ ] New skill/command files have valid YAML frontmatter with `name` and `description`.
- [ ] Changes to `signal-patterns.md` include examples in at least English and Spanish.
- [ ] Changes to `lesson-format.md` preserve the four mandatory subheads.
- [ ] Confirmation-first guardrails are unchanged unless the PR description explains why.
- [ ] If you touched docs, both English and Spanish copies are updated.
- [ ] CHANGELOG.md entry under `[Unreleased]`.

---

## Code of conduct / Código de conducta

Be kind. Assume good faith. Disagreements about whether something is a
false positive are normal — they're the whole point of this project.

Sé amable. Asume buena fe. Los desacuerdos sobre si algo es falso positivo
son normales — son la razón de existir del proyecto.

---

## License / Licencia

By contributing, you agree your contribution is licensed under MIT (the
project's license). See [LICENSE](LICENSE).
