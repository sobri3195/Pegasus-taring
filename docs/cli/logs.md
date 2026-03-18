---
summary: "CLI reference for `pegasus-taring logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `pegasus-taring logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
pegasus-taring logs
pegasus-taring logs --follow
pegasus-taring logs --json
pegasus-taring logs --limit 500
pegasus-taring logs --local-time
pegasus-taring logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
