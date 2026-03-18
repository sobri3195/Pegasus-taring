---
summary: "CLI reference for `pegasus-taring health` (gateway health endpoint via RPC)"
read_when:
  - You want to quickly check the running Gateway’s health
title: "health"
---

# `pegasus-taring health`

Fetch health from the running Gateway.

```bash
pegasus-taring health
pegasus-taring health --json
pegasus-taring health --verbose
```

Notes:

- `--verbose` runs live probes and prints per-account timings when multiple accounts are configured.
- Output includes per-agent session stores when multiple agents are configured.
