# Pull Request

## What changed / Qué cambió

<!-- One paragraph describing the change. -->

## Why / Por qué

<!-- Link the issue if applicable. State the problem this fixes. -->

## Checklist

- [ ] JSON files parse (`.claude-plugin/plugin.json`, `marketplace.json`, `hooks/hooks.json`).
- [ ] Bash scripts pass `bash -n`.
- [ ] New skill/command files have valid YAML frontmatter with `name` and `description`.
- [ ] If touching `signal-patterns.md`: added examples in English **and** Spanish.
- [ ] If touching `lesson-format.md`: preserved the four mandatory subheads.
- [ ] If touching Pass D or E: confirmation-first guardrails unchanged (or PR description explains why).
- [ ] CHANGELOG.md entry under `[Unreleased]`.
- [ ] Bilingual docs (English + Spanish) updated where relevant.

## Tested with / Probado con

- Claude Code version:
- Or: dry-run via `/aprende --dry-run` on fixture `examples/fixture-conversation-N.md`

## Screenshots / output samples (optional)

<!-- Helpful for UX changes. -->
