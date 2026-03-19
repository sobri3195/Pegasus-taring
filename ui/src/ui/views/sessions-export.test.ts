import { describe, expect, it } from "vitest";
import { buildSessionsCsv } from "./sessions-export.ts";

describe("buildSessionsCsv", () => {
  it("exports the visible session fields as CSV", () => {
    const csv = buildSessionsCsv([
      {
        key: "agent:main:demo",
        label: "Primary",
        displayName: "Demo User",
        kind: "direct",
        modelProvider: "openai",
        model: "gpt-5",
        updatedAt: Date.UTC(2026, 2, 19, 10, 30, 0),
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        thinkingLevel: "medium",
        fastMode: true,
        verboseLevel: "full",
        reasoningLevel: "stream",
      },
    ]);

    expect(csv).toContain("key,label,displayName,kind,modelProvider,model,updatedAt");
    expect(csv).toContain("agent:main:demo,Primary,Demo User,direct,openai,gpt-5");
    expect(csv).toContain(",150,medium,true,full,stream");
  });
});
