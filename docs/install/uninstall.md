---
summary: "Uninstall Pegasustaring completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Pegasustaring from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `pegasus-taring` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
pegasus-taring uninstall
```

Non-interactive (automation / npx):

```bash
pegasus-taring uninstall --all --yes --non-interactive
npx -y pegasus-taring uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
pegasus-taring gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
pegasus-taring gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${OPENCLAW_STATE_DIR:-$HOME/.pegasus-taring}"
```

If you set `OPENCLAW_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.pegasus-taring/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g pegasus-taring
pnpm remove -g pegasus-taring
bun remove -g pegasus-taring
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Pegasustaring.app
```

Notes:

- If you used profiles (`--profile` / `OPENCLAW_PROFILE`), repeat step 3 for each state dir (defaults are `~/.pegasus-taring-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `pegasus-taring` is missing.

### macOS (launchd)

Default label is `ai.pegasus-taring.gateway` (or `ai.pegasus-taring.<profile>`; legacy `com.pegasus-taring.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.pegasus-taring.gateway
rm -f ~/Library/LaunchAgents/ai.pegasus-taring.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.pegasus-taring.<profile>`. Remove any legacy `com.pegasus-taring.*` plists if present.

### Linux (systemd user unit)

Default unit name is `pegasus-taring-gateway.service` (or `pegasus-taring-gateway-<profile>.service`):

```bash
systemctl --user disable --now pegasus-taring-gateway.service
rm -f ~/.config/systemd/user/pegasus-taring-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Pegasustaring Gateway` (or `Pegasustaring Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Pegasustaring Gateway"
Remove-Item -Force "$env:USERPROFILE\.pegasus-taring\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.pegasus-taring-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://pegasus-taring.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g pegasus-taring@latest`.
Remove it with `npm rm -g pegasus-taring` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `pegasus-taring ...` / `bun run pegasus-taring ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
