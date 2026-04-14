---
summary: "Run a lightweight PHP control panel for remote administration while Pegasus Taring stays on Node"
read_when:
  - You have cheap shared hosting with PHP and want a simple remote admin panel
  - You need basic remote operations (status, logs, restart) without exposing SSH directly
  - You want to keep Pegasus Taring on a VPS but manage it from a PHP-hosted page
title: "PHP remote administration"
---

# PHP remote administration

You **cannot run Pegasus Taring directly on PHP runtime** because the gateway and workers require Node.js.

But you can still use PHP hosting for a small remote administration panel that talks to your VPS over SSH and only exposes a safe allowlist of maintenance commands.

## Architecture

- **VPS (Node host)**: runs Pegasus Taring normally.
- **PHP host**: serves a tiny admin page and backend endpoint.
- **SSH key**: read-only or limited command key from PHP host to VPS.

<Tip>
Keep the gateway private (localhost + reverse proxy auth). Let the PHP panel call only approved maintenance commands.
</Tip>

## 1) Prepare a restricted admin script on the VPS

Create `/usr/local/bin/pegasus-admin-safe`:

```bash
#!/usr/bin/env bash
set -euo pipefail

cmd="${1:-}"

case "$cmd" in
  status)
    exec pegasus-taring gateway status --deep
    ;;
  channels)
    exec pegasus-taring channels status --probe
    ;;
  logs)
    exec pegasus-taring logs --lines 120
    ;;
  restart)
    pkill -9 -f pegasus-taring-gateway || true
    nohup pegasus-taring gateway run --bind loopback --port 18789 --force >/tmp/pegasus-taring-gateway.log 2>&1 &
    echo "gateway restarted"
    ;;
  *)
    echo "unsupported command" >&2
    exit 2
    ;;
esac
```

Then lock permissions:

```bash
sudo install -m 0755 /usr/local/bin/pegasus-admin-safe /usr/local/bin/pegasus-admin-safe
```

## 2) Restrict SSH key on VPS

In `~/.ssh/authorized_keys` for the admin user, prefix the PHP host public key with:

```text
command="/usr/local/bin/pegasus-admin-safe",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA... your-php-panel
```

This forces the key to run the safe wrapper only.

## 3) PHP backend endpoint

Example `admin.php`:

```php
<?php
$allowed = ["status", "channels", "logs", "restart"];
$cmd = $_GET["cmd"] ?? "status";

if (!in_array($cmd, $allowed, true)) {
  http_response_code(400);
  echo "invalid command";
  exit;
}

$host = getenv("PEGASUS_ADMIN_HOST") ?: "admin@your-vps";
$key = getenv("PEGASUS_ADMIN_KEY") ?: "/home/www-data/.ssh/pegasus_admin";

$ssh = sprintf(
  'ssh -i %s -o BatchMode=yes -o StrictHostKeyChecking=yes %s %s 2>&1',
  escapeshellarg($key),
  escapeshellarg($host),
  escapeshellarg($cmd)
);

header("Content-Type: text/plain; charset=utf-8");
passthru($ssh, $exitCode);
if ($exitCode !== 0) {
  http_response_code(500);
}
```

## 4) Minimal UI (optional)

```html
<form method="get" action="/admin.php">
  <button name="cmd" value="status">Gateway status</button>
  <button name="cmd" value="channels">Channel probe</button>
  <button name="cmd" value="logs">Recent logs</button>
  <button name="cmd" value="restart">Restart gateway</button>
</form>
```

## Security checklist

- Protect the PHP route behind authentication (basic auth, session auth, or SSO).
- Keep gateway bound to loopback and expose only through a trusted reverse proxy.
- Use a dedicated SSH key only for this panel.
- Use forced-command key restrictions (step 2) so leaked keys cannot run arbitrary commands.
- Add IP allowlists and rate limits at your web server/proxy.

## Notes

- This pattern gives you remote administration tools while keeping Pegasus Taring on the supported Node stack.
- For full remote control and pairing UX, prefer native gateway remote flows in [Gateway remote access](/gateway/remote).
