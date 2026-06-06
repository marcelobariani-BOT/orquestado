---
name: aprende-disable-hooks
description: |
  Remove the aprende PostToolUse + Stop hooks from ~/.claude/settings.json.
  Idempotent: safe to run when hooks aren't installed. Backs up settings.json
  before editing.
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
---

# `/aprende-disable-hooks`

When invoked, remove the aprende hooks from the user's global
`~/.claude/settings.json`. Leaves other hooks (from other plugins or
manually added) untouched.

## Procedure

1. **Backup.** Copy `~/.claude/settings.json` to
   `~/.claude/settings.json.aprende-backup-<YYYY-MM-DD-HHMM>` before any
   write.

2. **Read settings.** Parse `~/.claude/settings.json`. If the file doesn't
   exist or doesn't contain `"aprende-hooks-installed": true`, print:
   ```
   aprende hooks are not installed. Nothing to do.
   ```
   and exit cleanly.

3. **Remove aprende entries.** From `hooks.PostToolUse`, drop any entry
   whose `hooks[].command` contains `aprende` or `capture-signal.sh`. From
   `hooks.Stop`, drop entries containing `stop-suggest.sh`. **Keep all
   other hook entries intact.** If an array becomes empty, remove the
   array.

4. **Remove the marker.** Delete the top-level `"aprende-hooks-installed"`
   field.

5. **Write back.** Save the cleaned JSON. Pretty-print (2-space indent).

6. **Confirm.** Print:
   ```
   ✓ aprende hooks removed from ~/.claude/settings.json
   ✓ Backup at ~/.claude/settings.json.aprende-backup-<timestamp>
   ✓ Other hooks (if any) preserved.
   To reinstall, run /aprende-enable-hooks.
   ```

## Safety

- **Always back up** before editing.
- **Surgical removal only** — touch only entries that match aprende's hook
  scripts (`capture-signal.sh`, `stop-suggest.sh`) or the
  `aprende-hooks-installed` marker.
- **Be idempotent.** Running this when nothing is installed is a no-op.
- **Refuse to run** if `~/.claude/settings.json` parses as invalid JSON.
- **Never delete the file.** Always leave at least `{}`.

## Note on manual cleanup

If the user installed the plugin via marketplace, hook entries also live
in the plugin's own `hooks/hooks.json` (loaded automatically). To fully
disable hooks in that case, the user uninstalls the plugin
(`/plugin uninstall aprende`). This command only removes entries from
the user's global settings.

Si el usuario instaló el plugin vía marketplace, las entradas de hooks
también viven en el propio `hooks/hooks.json` del plugin. Para
deshabilitar completamente, desinstala el plugin (`/plugin uninstall
aprende`). Este comando solo quita entradas del settings.json global.
