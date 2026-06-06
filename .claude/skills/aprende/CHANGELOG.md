# Changelog

All notable changes to `aprende` will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · SemVer.

## [Unreleased]

### Added
- **Bilingual README split** — `README.md` is now English-only (the
  GitHub default surface) and `README.es.md` carries the Spanish version.
  Each links to the other at the top and footer.
- **`assets/`** — first-party project art: `mascot.png` (the pixel-art
  mascot), `hero.png` (21:9 hero banner), `capture.png` and `review.png`
  (square supporting illustrations embedded next to the relevant
  README sections). Generated with Higgsfield Nano Banana Pro from the
  mascot reference; palette and pixel grid kept consistent.
- `commands/aprende.md` — the main `/aprende` slash command file (without
  it the skill could only be invoked via natural-language triggers).
- `.claude-plugin/marketplace.json` — registers the plugin so
  `/plugin marketplace add Hainrixz/aprende-skill` actually resolves.
- `--dry-run` flag: run all passes except Pass E for safe previewing.
- `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/` (false-positive, bug-report,
  feature-request), `.github/PULL_REQUEST_TEMPLATE.md`, `.github/FUNDING.yml`.
- `.github/workflows/validate.yml` — CI that validates JSON, bash syntax,
  required references, and smoke-tests both hook scripts on every PR.

### Changed
- **Slash command naming**: unified to hyphenated form across all docs
  (`/aprende-enable-hooks` and `/aprende-disable-hooks`, not
  `/aprende enable-hooks`). Matches the actual command filenames.
- `hooks-handlers/capture-signal.sh` hardened: temp file cleanup via trap,
  `flock`-based concurrency safety on the edit-counter file, defensive
  early-exit on unusable project dirs.
- `hooks-handlers/stop-suggest.sh` rewritten to produce single-line JSON
  with explicit escaping (validated by the CI).
- README professional polish — added 30-second pitch with a live example,
  centered hero header, install/usage/FAQ navigation links, footer linking
  to www.tododeia.com.

## [0.1.0] — 2026-05-11
### Added
- Initial release of the `aprende` skill / plugin.
- `/aprende` slash command with 5-pass workflow (scan → generate → dedup → confirm → execute).
- Four learning categories: `memory`, `lesson` (Reflexion-style anti-pattern), `skill` stub, `project-doc`.
- `/aprende --review` aging/pruning mode for lessons.
- `/aprende --portable` mirror to `./.aprende/` for cross-tool (Codex) workflows.
- `/learn` English alias.
- `PostToolUse` + `Stop` hooks (ON by default) for signal capture and end-of-session reminders.
- `/aprende-enable-hooks` and `/aprende-disable-hooks` commands.
- Dual-write to `CLAUDE.md` + `AGENTS.md` for cross-tool compatibility.
- 3 example fixtures with expected outputs.

[Unreleased]: https://github.com/Hainrixz/aprende-skill/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Hainrixz/aprende-skill/releases/tag/v0.1.0
