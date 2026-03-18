---
summary: "CLI reference for `pegasus-taring devices` (device pairing + token rotation/revocation)"
read_when:
  - You are approving device pairing requests
  - You need to rotate or revoke device tokens
title: "devices"
---

# `pegasus-taring devices`

Manage device pairing requests and device-scoped tokens.

## Commands

### `pegasus-taring devices list`

List pending pairing requests and paired devices.

```
pegasus-taring devices list
pegasus-taring devices list --json
```

### `pegasus-taring devices remove <deviceId>`

Remove one paired device entry.

```
pegasus-taring devices remove <deviceId>
pegasus-taring devices remove <deviceId> --json
```

### `pegasus-taring devices clear --yes [--pending]`

Clear paired devices in bulk.

```
pegasus-taring devices clear --yes
pegasus-taring devices clear --yes --pending
pegasus-taring devices clear --yes --pending --json
```

### `pegasus-taring devices approve [requestId] [--latest]`

Approve a pending device pairing request. If `requestId` is omitted, Pegasustaring
automatically approves the most recent pending request.

```
pegasus-taring devices approve
pegasus-taring devices approve <requestId>
pegasus-taring devices approve --latest
```

### `pegasus-taring devices reject <requestId>`

Reject a pending device pairing request.

```
pegasus-taring devices reject <requestId>
```

### `pegasus-taring devices rotate --device <id> --role <role> [--scope <scope...>]`

Rotate a device token for a specific role (optionally updating scopes).

```
pegasus-taring devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write
```

### `pegasus-taring devices revoke --device <id> --role <role>`

Revoke a device token for a specific role.

```
pegasus-taring devices revoke --device <deviceId> --role node
```

## Common options

- `--url <url>`: Gateway WebSocket URL (defaults to `gateway.remote.url` when configured).
- `--token <token>`: Gateway token (if required).
- `--password <password>`: Gateway password (password auth).
- `--timeout <ms>`: RPC timeout.
- `--json`: JSON output (recommended for scripting).

Note: when you set `--url`, the CLI does not fall back to config or environment credentials.
Pass `--token` or `--password` explicitly. Missing explicit credentials is an error.

## Notes

- Token rotation returns a new token (sensitive). Treat it like a secret.
- These commands require `operator.pairing` (or `operator.admin`) scope.
- `devices clear` is intentionally gated by `--yes`.
- If pairing scope is unavailable on local loopback (and no explicit `--url` is passed), list/approve can use a local pairing fallback.

## Token drift recovery checklist

Use this when Control UI or other clients keep failing with `AUTH_TOKEN_MISMATCH` or `AUTH_DEVICE_TOKEN_MISMATCH`.

1. Confirm current gateway token source:

```bash
pegasus-taring config get gateway.auth.token
```

2. List paired devices and identify the affected device id:

```bash
pegasus-taring devices list
```

3. Rotate operator token for the affected device:

```bash
pegasus-taring devices rotate --device <deviceId> --role operator
```

4. If rotation is not enough, remove stale pairing and approve again:

```bash
pegasus-taring devices remove <deviceId>
pegasus-taring devices list
pegasus-taring devices approve <requestId>
```

5. Retry client connection with the current shared token/password.

Related:

- [Dashboard auth troubleshooting](/web/dashboard#if-you-see-unauthorized-1008)
- [Gateway troubleshooting](/gateway/troubleshooting#dashboard-control-ui-connectivity)
