<div align="center">

<img src="assets/hero.png" alt="aprende — turn every conversation into durable knowledge" width="100%" />

# 🧠 aprende

### *Turn every conversation into durable knowledge.*

**A community skill for Claude Code and Codex that helps your agent learn from its mistakes — and never repeat them.**

[![CI](https://github.com/Hainrixz/aprende-skill/actions/workflows/validate.yml/badge.svg)](https://github.com/Hainrixz/aprende-skill/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-2.0%2B-blue)](https://claude.com/claude-code)
[![Codex compatible](https://img.shields.io/badge/Codex-compatible-green)](https://github.com/Hainrixz/aprende-skill)
[![Made by tododeia](https://img.shields.io/badge/Made_by-tododeia-ff69b4)](https://www.tododeia.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

🌎 &nbsp;**Read in [Español →](README.es.md)**

[Install](#install) · [Usage](#usage) · [How it works](#the-four-categories) · [FAQ](#faq) · [Contributing](CONTRIBUTING.md) · [tododeia.com](https://www.tododeia.com)

</div>

---

## ⚡ 30-second pitch

You correct your agent. The session ends. Next week, you correct
it again on the exact same thing. `aprende` fixes that. Type `/aprende`
at the end of a session — it scans the conversation, surfaces every
correction worth preserving, asks you which to keep, and writes them
where your agent will find them next time. Reflexion-style anti-patterns,
confirmation-first writes, cross-tool (Claude Code + Codex), bilingual.

```
You:  /aprende

aprende:
  Found 3 candidate learnings from this conversation.

   1. [project-doc] Use pnpm, not npm — user said "this repo uses pnpm"  (high)
   2. [lesson]      localStorage fails in purchase WebView — use IndexedDB  (high)
   3. [memory]      User prefers explicit error messages in tests  (medium)

  >

You:  1,2

aprende:
  ✓ project  → ./CLAUDE.md + ./AGENTS.md  (## Commands)
  ✓ lesson   → ~/.claude/projects/.../lesson_webview-localstorage.md
  Captured 2 learnings. Run /aprende --review next month to prune.
```

---

## Why this exists

<p align="center">
  <img src="assets/capture.png" alt="The aprende mascot notes down a lesson after a correction" width="240" />
</p>

Coding agents repeat the same mistakes across sessions. The
corrections you make in one chat — "no, this repo uses pnpm", "always
add `using` and `with check` to RLS policies" — evaporate when the
session ends. You correct the agent. Next week, you correct it again. And
again. `aprende` fixes that. After each session, you run `/aprende`. It
surfaces what was worth learning. You pick what to keep. It writes it
where the agent will find it next time.

---

## The four categories

| Category | Lives at | When |
|----------|----------|------|
| `memory` | `~/.claude/projects/<slug>/memory/<name>.md` | Durable facts, preferences, project context |
| `lesson` (Reflexion-style anti-pattern) | Same folder, `type: lesson` | A mistake happened. Captures *what / why / how-to-avoid / detection-signal* |
| `skill` (stub) | `~/.claude/skills/<slug>/SKILL.md` | A reusable multi-step workflow appeared |
| `project-doc` | `./CLAUDE.md` + `./AGENTS.md` (dual-write) | Build commands, repo conventions, gotchas for every future agent |

The `lesson` category is the one that compounds. Following the [Reflexion
paper](https://arxiv.org/abs/2303.11366), every lesson must answer four
questions:

```markdown
**What happened:** ...
**Why it happened:** ...
**How to avoid:** ...
**Detection signal:** ...
```

---

## Install

### Option 1 — Plugin (recommended)

From inside Claude Code:
```
/plugin marketplace add Hainrixz/aprende-skill
/plugin install aprende@aprende-skill
```

That's it. The skill and its hooks are wired up automatically. Hooks are
**on by default** (see disclosure below).

### Option 2 — Manual

Clone the repo and copy the skill folder:
```bash
git clone https://github.com/Hainrixz/aprende-skill.git
cp -r aprende-skill/skills/aprende ~/.claude/skills/
cp -r aprende-skill/skills/learn ~/.claude/skills/   # English alias (optional)
```

To enable the hooks (optional):
```bash
# Copy the handlers somewhere stable:
mkdir -p ~/.claude/aprende-hooks
cp aprende-skill/hooks-handlers/*.sh ~/.claude/aprende-hooks/
chmod +x ~/.claude/aprende-hooks/*.sh
```
Then in a Claude Code session, run `/aprende-enable-hooks` — it will
splice the hook entries into `~/.claude/settings.json`. You'll need to
replace `${CLAUDE_PLUGIN_ROOT}` with `~/.claude/aprende-hooks` in those
entries since manual install doesn't set that env var. The README walks
through the exact JSON to paste.

---

## Usage

| Command | Effect |
|---------|--------|
| `/aprende` | Standard run — review conversation, prompt, write after confirmation. |
| `/learn` | English alias for `/aprende`. |
| `/aprende --review` | Revisit existing lessons. Mark retired or refresh. |
| `/aprende --portable` | Standard run + mirror lessons to `./.aprende/` for Codex compatibility. |
| `/aprende-enable-hooks` | Install hooks into `~/.claude/settings.json`. |
| `/aprende-disable-hooks` | Remove them. |

### Example session

```
You:  /aprende

aprende:
  Found 3 candidate learnings from this conversation.

  Reply with: numbers, "all", "none", or "edit N: <text>" / "drop low" / "skip N".

   1. [project-doc] Use pnpm, not npm — user said "this repo uses pnpm"  (high)
   2. [lesson]      localStorage fails in purchase WebView — use IndexedDB  (high)
   3. [memory]      User prefers explicit error messages in tests  (medium)

  >

You:  1,2

aprende:
  ✓ project  → ./CLAUDE.md + ./AGENTS.md  (## Commands)
  ✓ lesson   → ~/.claude/projects/.../lesson_webview-localstorage.md  (+MEMORY.md)

  Captured 2 learnings. Run /aprende --review next month to prune.
```

---

## Hooks (ON by default) — disclosure

When installed via the plugin, two hooks are active from the
moment you install:

- **`PostToolUse`** — after every Bash / Edit / Write tool call, a small
  bash script (`capture-signal.sh`) inspects the result. If it sees a
  non-zero exit code, an error message, or the same file edited 3+ times,
  it appends a one-line record to
  `~/.claude/projects/<slug>/.aprende-signals.md`. **It never writes a
  learning.** It only accumulates signals for `/aprende` to read later.
- **`Stop`** — at session end, if signals were captured and you didn't
  run `/aprende`, a small bash script (`stop-suggest.sh`) emits a
  one-line reminder asking you to run it. **It also never writes a
  learning.**

Both hooks are bilingual in their messages, run in <50ms, and exit cleanly
on any error so they never block your work.

To disable: `/aprende-disable-hooks` (removes the entries from
`~/.claude/settings.json` — keeps a backup).

---

## Cross-tool: Claude Code + Codex

`aprende` is designed to work in both ecosystems:

- **`project-doc` writes always dual-write** to `CLAUDE.md` **and**
  `AGENTS.md`. Same content both files. Claude Code reads the first,
  Codex reads the second.
- **For lessons and memories**, use `/aprende --portable` to also mirror
  to `./.aprende/lessons/` in the project root, with a flat
  `./.aprende/index.md` that Codex can read via a one-line directive
  auto-added to `AGENTS.md`.
- **The skill itself** is plain Markdown + YAML — any agent that
  understands the [agentskills.io](https://agentskills.io) convention can
  invoke it.

---

## Storage map

```
~/.claude/
├── projects/
│   └── -Users-you-path-to-project/
│       └── memory/
│           ├── MEMORY.md                    # index
│           ├── feedback_pnpm-over-npm.md    # type: feedback
│           ├── project_supabase-rls.md      # type: project
│           ├── lesson_webview-storage.md    # type: lesson (Reflexion-style)
│           └── ...
├── skills/
│   ├── aprende/        # the skill (workflow)
│   ├── learn/          # English alias
│   └── ...             # any skills /aprende drafted as stubs
└── settings.json       # hook config (after /aprende-enable-hooks)

<your-project>/
├── CLAUDE.md           # for Claude Code
├── AGENTS.md           # for Codex (dual-written, same content)
└── .aprende/           # only if --portable was used
    ├── index.md
    └── lessons/
        └── ...
```

---

## Design principles

<p align="center">
  <img src="assets/review.png" alt="The aprende mascot reviewing pinned lessons, retiring old ones" width="240" />
</p>

1. **Confirmation-first.** Nothing writes to disk until you say which
   items to keep. The skill repeats this rule three times internally.
2. **Prefer false negatives.** A wrong rule locked into memory is worse
   than repeating a correction three times. Confidence labels are
   mandatory.
3. **Annotate overlaps, don't drop.** When a candidate looks like a
   duplicate, the skill flags it `[overlaps with: ...]` and lets you
   decide.
4. **Retire, don't delete.** Outdated lessons get `status: retired`,
   not `rm`. Audit trail matters.
5. **Reflexion over logging.** Lessons capture *why* a mistake happened,
   not just *what*. That's where the [+20% lift](https://arxiv.org/abs/2303.11366)
   comes from.
6. **Hooks are advisory, not authoritative.** Hooks only accumulate
   signals and remind you. They never write learnings.
7. **Hard cap at 15 candidates per run.** Forces focus.

---

## FAQ

**Q: Won't my memory folder fill with junk?**
A: Three guardrails prevent it: (a) confidence labels make you filter,
(b) dedup annotates overlaps before showing the list, (c) `/aprende
--review` lets you prune monthly.

**Q: Does this work with Codex?**
A: Yes. `project-doc` writes go to both `CLAUDE.md` and `AGENTS.md`. For
lessons, use `/aprende --portable` to mirror them into `./.aprende/`.

**Q: Can the agent learn automatically without me running /aprende?**
A: No. By design. Automatic capture is the failure mode that locks in
false positives. The hooks remind you to run `/aprende` but never write
on their own.

**Q: How is this different from claude-mem / claude-reflect?**
A: `aprende` is intentionally simpler: no SQLite, no embeddings, no MCP
server. Plain Markdown + bilingual workflow + Reflexion-style lesson
format. It plugs into the user's existing memory folder convention
instead of standing up a parallel store. If you need embeddings/vector
search, use [claude-mem](https://github.com/thedotmack/claude-mem) —
it's the most battle-hardened in that space.

---

## Contributing

Issues, PRs, and lesson contributions welcome. Especially:

- **Better signal patterns** in `signal-patterns.md` (any language).
- **Real lessons from your sessions** — anonymized examples that show
  the four-section format working well.
- **Bug reports** — specifically, false positives that slipped past
  confirmation (those are the hardest to catch).

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Credits

Built on patterns from:

- [Reflexion (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366) —
  the "linguistic post-mortem" pattern.
- [Hermes Agent (Nous Research)](https://github.com/NousResearch/hermes-agent) —
  the "synthesize skills from recurring workflows" idea.
- [claude-reflect](https://github.com/BayramAnnakov/claude-reflect) —
  confidence scoring against false positives.
- [claude-mem](https://github.com/thedotmack/claude-mem) —
  hook-driven capture pattern.
- The Claude Code memory system — `aprende` extends the existing
  per-project memory convention rather than replacing it.

Mascot and hero art generated with [Higgsfield](https://higgsfield.ai)
(Nano Banana Pro) from a pixel-art reference designed for this project.

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

### Made with discipline against false positives.

**Built by [tododeia](https://www.tododeia.com) · Maintained by [@Hainrixz](https://github.com/Hainrixz)**

If `aprende` saved you from repeating a mistake, [⭐ star the repo](https://github.com/Hainrixz/aprende-skill) and share it with someone whose agent keeps doing the same thing wrong.

🌎 &nbsp;**[Leer en Español →](README.es.md)**

[**www.tododeia.com**](https://www.tododeia.com)

</div>
