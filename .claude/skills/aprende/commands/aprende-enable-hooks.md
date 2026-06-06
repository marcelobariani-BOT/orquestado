---
name: aprende-enable-hooks
description: |
  Install the aprende PostToolUse + Stop hooks into ~/.claude/settings.json.
  Idempotent: safe to run multiple times. Backs up settings.json before
  editing.
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
---

# `/aprende-enable-hooks`

When invoked, install (or confirm installation of) the aprende hooks into
the user's global `~/.claude/settings.json`. The hooks themselves ship in
the plugin under `${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json`; this command
splices their entries into the user-level settings so they run on every
session.

## Procedure

1. **Backup.** Copy `~/.claude/settings.json` to
   `~/.claude/settings.json.aprende-backup-<YYYY-MM-DD-HHMM>` before any
   write. If the backup already exists for today's minute, skip (idempotent).

2. **Read current settings.** `cat ~/.claude/settings.json` and parse it.
   If the file doesn't exist, create it with `{}`.

3. **Check for existing aprende hooks.** Look for the marker comment
   `"// aprende-hooks-installed": true` inside the JSON (use a top-level
   field, since JSON has no comments).
   - If present, print:
     ```
     aprende hooks are already installed in ~/.claude/settings.json.
     To remove, run /aprende-disable-hooks.
     ```
     and exit.

4. **Splice the hooks.** Add the following entries to the `hooks` key
   (create the key if missing). If `hooks.PostToolUse` or `hooks.Stop`
   arrays already exist with other entries, **append** — do not replace:

   ```json
   {
     "aprende-hooks-installed": true,
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Bash|Edit|Write",
           "hooks": [
             {
               "type": "command",
               "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks-handlers/capture-signal.sh\""
             }
           ]
         }
       ],
       "Stop": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks-handlers/stop-suggest.sh\""
             }
           ]
         }
       ]
     }
   }
   ```

   **Note:** When installed via the plugin marketplace, the hooks are
   loaded automatically from `${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json` and
   this command becomes a no-op (just confirms installation). When
   installed manually by copying `skills/aprende/` to `~/.claude/skills/`,
   this command is the way to wire up the hooks — but the user must also
   copy `hooks-handlers/*.sh` somewhere and adjust the `${CLAUDE_PLUGIN_ROOT}`
   reference to an absolute path. The README documents both paths.

5. **Write back.** Save the merged JSON. Pretty-print (2-space indent).

6. **Confirm.** Print:
   ```
   ✓ aprende hooks installed in ~/.claude/settings.json
   ✓ Backup at ~/.claude/settings.json.aprende-backup-<timestamp>
   PostToolUse + Stop hooks are now active.
   To remove, run /aprende-disable-hooks.
   ```

## Safety

- **Always back up** before editing.
- **Always append** — never replace user's existing hooks.
- **Be idempotent.** Running this twice should not double-install.
- **Refuse to run** if `~/.claude/settings.json` parses as invalid JSON
  (tell the user to fix it manually first).
