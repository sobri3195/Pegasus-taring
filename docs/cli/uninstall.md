---
summary: "CLI reference for `pegasus-taring uninstall` (remove gateway service + local data)"
read_when:
  - You want to remove the gateway service and/or local state
  - You want a dry-run first
title: "uninstall"
---

# `pegasus-taring uninstall`

Uninstall the gateway service + local data (CLI remains).

```bash
pegasus-taring backup create
pegasus-taring uninstall
pegasus-taring uninstall --all --yes
pegasus-taring uninstall --dry-run
```

Run `pegasus-taring backup create` first if you want a restorable snapshot before removing state or workspaces.
