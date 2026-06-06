---
name: False positive
about: /aprende saved a learning that turned out to be wrong
title: "[FP] <short description>"
labels: false-positive, bug
assignees: ''
---

## Summary / Resumen

<!-- One sentence: what was saved, why it's wrong. -->
<!-- Una frase: qué se guardó, por qué está mal. -->

## The conversation (anonymized) / La conversación (anonimizada)

<!-- Paste the relevant snippet. Redact anything sensitive. -->
<!-- Pega el fragmento relevante. Redacta lo sensible. -->

```
User: ...
Assistant: ...
User: /aprende
```

## What /aprende captured / Qué capturó /aprende

<!-- Paste the candidate list or the saved file content. -->

```
 N. [category] Title — rationale  (confidence)
```

## Why it's a false positive / Por qué es falso positivo

<!-- Be specific. Was the confidence wrong? The category? The wording? Was the underlying signal misread? -->
<!-- Sé específico. ¿La confidence estaba mal? ¿La categoría? ¿El wording? ¿Se interpretó mal la señal? -->

## What should have happened / Qué debió pasar

<!-- The candidate should not have been generated / it should have been (low) confidence / it should have been a different category / it should have been worded as ... -->

## Environment / Entorno

- Tool: Claude Code / Codex / other
- aprende version: 
- OS: macOS / Linux / Windows
- Hooks enabled: yes / no

## Proposed fix (optional) / Fix propuesto

<!-- A change to signal-patterns.md? To the confidence rules in SKILL.md? Adjust a guardrail? -->
