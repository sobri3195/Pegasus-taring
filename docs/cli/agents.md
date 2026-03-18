---
summary: "CLI reference for `pegasus-taring agents` (list/add/delete/bindings/bind/unbind/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `pegasus-taring agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
pegasus-taring agents list
pegasus-taring agents add work --workspace ~/.pegasus-taring/workspace-work
pegasus-taring agents bindings
pegasus-taring agents bind --agent work --bind telegram:ops
pegasus-taring agents unbind --agent work --bind telegram:ops
pegasus-taring agents set-identity --workspace ~/.pegasus-taring/workspace --from-identity
pegasus-taring agents set-identity --agent main --avatar avatars/pegasus-taring.png
pegasus-taring agents delete work
```

## Routing bindings

Use routing bindings to pin inbound channel traffic to a specific agent.

List bindings:

```bash
pegasus-taring agents bindings
pegasus-taring agents bindings --agent work
pegasus-taring agents bindings --json
```

Add bindings:

```bash
pegasus-taring agents bind --agent work --bind telegram:ops --bind discord:guild-a
```

If you omit `accountId` (`--bind <channel>`), Pegasustaring resolves it from channel defaults and plugin setup hooks when available.

### Binding scope behavior

- A binding without `accountId` matches the channel default account only.
- `accountId: "*"` is the channel-wide fallback (all accounts) and is less specific than an explicit account binding.
- If the same agent already has a matching channel binding without `accountId`, and you later bind with an explicit or resolved `accountId`, Pegasustaring upgrades that existing binding in place instead of adding a duplicate.

Example:

```bash
# initial channel-only binding
pegasus-taring agents bind --agent work --bind telegram

# later upgrade to account-scoped binding
pegasus-taring agents bind --agent work --bind telegram:ops
```

After the upgrade, routing for that binding is scoped to `telegram:ops`. If you also want default-account routing, add it explicitly (for example `--bind telegram:default`).

Remove bindings:

```bash
pegasus-taring agents unbind --agent work --bind telegram:ops
pegasus-taring agents unbind --agent work --all
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.pegasus-taring/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
pegasus-taring agents set-identity --workspace ~/.pegasus-taring/workspace --from-identity
```

Override fields explicitly:

```bash
pegasus-taring agents set-identity --agent main --name "Pegasustaring" --emoji "🦞" --avatar avatars/pegasus-taring.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Pegasustaring",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/pegasus-taring.png",
        },
      },
    ],
  },
}
```
