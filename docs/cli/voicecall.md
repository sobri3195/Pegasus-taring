---
summary: "CLI reference for `pegasus-taring voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `pegasus-taring voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
pegasus-taring voicecall status --call-id <id>
pegasus-taring voicecall call --to "+15555550123" --message "Hello" --mode notify
pegasus-taring voicecall continue --call-id <id> --message "Any questions?"
pegasus-taring voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
pegasus-taring voicecall expose --mode serve
pegasus-taring voicecall expose --mode funnel
pegasus-taring voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
