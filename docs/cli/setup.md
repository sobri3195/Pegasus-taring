---
summary: "CLI reference for `pegasus-taring setup` (initialize config + workspace)"
read_when:
  - You’re doing first-run setup without full CLI onboarding
  - You want to set the default workspace path
title: "setup"
---

# `pegasus-taring setup`

Initialize `~/.pegasus-taring/pegasus-taring.json` and the agent workspace.

Related:

- Getting started: [Getting started](/start/getting-started)
- CLI onboarding: [Onboarding (CLI)](/start/wizard)

## Examples

```bash
pegasus-taring setup
pegasus-taring setup --workspace ~/.pegasus-taring/workspace
```

To run onboarding via setup:

```bash
pegasus-taring setup --wizard
```
