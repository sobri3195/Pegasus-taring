import { render } from "lit";
import { describe, expect, it } from "vitest";
import type { SessionsListResult } from "../types.ts";
import { renderSessions, type SessionsProps } from "./sessions.ts";

function buildResult(session: SessionsListResult["sessions"][number]): SessionsListResult {
  return {
    ts: Date.now(),
    path: "(multiple)",
    count: 1,
    defaults: { modelProvider: null, model: null, contextTokens: null },
    sessions: [session],
  };
}

function buildProps(result: SessionsListResult): SessionsProps {
  return {
    loading: false,
    result,
    error: null,
    activeMinutes: "",
    limit: "120",
    includeGlobal: false,
    includeUnknown: false,
    basePath: "",
    searchQuery: "",
    sortColumn: "updated",
    sortDir: "desc",
    page: 0,
    pageSize: 10,
    actionsOpenKey: null,
    onFiltersChange: () => undefined,
    onSearchChange: () => undefined,
    onSortChange: () => undefined,
    onPageChange: () => undefined,
    onPageSizeChange: () => undefined,
    onActionsOpenChange: () => undefined,
    onRefresh: () => undefined,
    onPatch: () => undefined,
    onDelete: () => undefined,
  };
}

describe("sessions view", () => {
  it("renders verbose=full without falling back to inherit", async () => {
    const container = document.createElement("div");
    render(
      renderSessions(
        buildProps(
          buildResult({
            key: "agent:main:main",
            kind: "direct",
            updatedAt: Date.now(),
            verboseLevel: "full",
          }),
        ),
      ),
      container,
    );
    await Promise.resolve();

    const selects = container.querySelectorAll("select");
    const verbose = selects[2] as HTMLSelectElement | undefined;
    expect(verbose?.value).toBe("full");
    expect(Array.from(verbose?.options ?? []).some((option) => option.value === "full")).toBe(true);
  });

  it("keeps unknown stored values selectable instead of forcing inherit", async () => {
    const container = document.createElement("div");
    render(
      renderSessions(
        buildProps(
          buildResult({
            key: "agent:main:main",
            kind: "direct",
            updatedAt: Date.now(),
            reasoningLevel: "custom-mode",
          }),
        ),
      ),
      container,
    );
    await Promise.resolve();

    const selects = container.querySelectorAll("select");
    const reasoning = selects[3] as HTMLSelectElement | undefined;
    expect(reasoning?.value).toBe("custom-mode");
    expect(
      Array.from(reasoning?.options ?? []).some((option) => option.value === "custom-mode"),
    ).toBe(true);
  });

  it("renders explicit fast mode without falling back to inherit", async () => {
    const container = document.createElement("div");
    render(
      renderSessions(
        buildProps(
          buildResult({
            key: "agent:main:main",
            kind: "direct",
            updatedAt: Date.now(),
            fastMode: true,
          }),
        ),
      ),
      container,
    );
    await Promise.resolve();

    const selects = container.querySelectorAll("select");
    const fast = selects[1] as HTMLSelectElement | undefined;
    expect(fast?.value).toBe("on");
  });

  it("filters sessions with query syntax and shows export action", async () => {
    const container = document.createElement("div");
    render(
      renderSessions({
        ...buildProps({
          ts: Date.now(),
          path: "(multiple)",
          count: 2,
          defaults: { modelProvider: null, model: null, contextTokens: null },
          sessions: [
            {
              key: "agent:main:one",
              kind: "direct",
              updatedAt: Date.now(),
              modelProvider: "openai",
              label: "Alpha",
              totalTokens: 42,
            },
            {
              key: "agent:main:two",
              kind: "group",
              updatedAt: Date.now(),
              modelProvider: "anthropic",
            },
          ],
        }),
        searchQuery: "kind:direct provider:openai has:label",
      }),
      container,
    );
    await Promise.resolve();

    expect(container.textContent).toContain("agent:main:one");
    expect(container.textContent).not.toContain("agent:main:two");
    expect(container.textContent).toContain("Export CSV");
  });
});
