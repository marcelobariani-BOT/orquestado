---
description: Review the current conversation and save reusable learnings (memory, lesson, skill stub, project-doc) after confirmation. / Revisa la conversación actual y guarda aprendizajes reusables con confirmación.
argument-hint: "[--review | --portable | --dry-run]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
---

# `/aprende` — Learn from this conversation

You are being invoked as the `/aprende` slash command. Follow the **exact** workflow documented in the `aprende` skill:

**Skill location:**
- Plugin install: `${CLAUDE_PLUGIN_ROOT}/skills/aprende/SKILL.md`
- Manual install: `~/.claude/skills/aprende/SKILL.md`

Read that file end-to-end before doing anything. Then execute the 5-pass workflow:

1. **Pass A — Scan** the conversation for correction signals (see `references/signal-patterns.md`).
2. **Pass B — Generate** a candidate list with confidence labels (`high|medium|low`). Cap at 15.
3. **Pass C — Dedup** against existing `MEMORY.md`, installed skills, and `CLAUDE.md`/`AGENTS.md`. Annotate overlaps, never drop silently.
4. **Pass D — Confirm** by printing the exact template in `prompts/confirmation-template.md`. **WAIT** for user reply. Do not call any file-mutating tool yet.
5. **Pass E — Execute** the per-category writes (see `references/memory-format.md` and `references/lesson-format.md` for exact frontmatter). One confirmation line per write.

## Arguments / Argumentos

The slash command accepts these argument forms via `$ARGUMENTS`:

- `$ARGUMENTS` empty → standard run.
- `$ARGUMENTS = --review` → run `/aprende --review` mode: revisit existing lessons, mark retired or refresh. See `references/review-workflow.md`.
- `$ARGUMENTS = --portable` → standard run + mirror lessons to `./.aprende/` for Codex compatibility. See SKILL.md section 7.
- `$ARGUMENTS = --dry-run` → execute Pass A, B, C, D, but **skip Pass E entirely**. Print "(dry-run: no files written)" at the end. Useful for previewing what would be captured without committing.

If `$ARGUMENTS` contains an unrecognized flag, print the allowed flags and exit.

## The one rule that matters

**Never write to disk before the user confirms in Pass D.** No Write, no Edit, no destructive Bash. Read-only is the only permitted state between Pass D's output and the user's reply.

**Nunca escribas a disco antes de la confirmación del Pase D.**

## After completion

End with a one-paragraph bilingual summary of what was captured and a pointer to `/aprende --review` for later pruning.
