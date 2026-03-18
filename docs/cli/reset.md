---
summary: "CLI reference for `pegasus-taring reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `pegasus-taring reset`

Reset local config/state (keeps the CLI installed).

```bash
pegasus-taring backup create
pegasus-taring reset
pegasus-taring reset --dry-run
pegasus-taring reset --scope config+creds+sessions --yes --non-interactive
```

Run `pegasus-taring backup create` first if you want a restorable snapshot before removing local state.
