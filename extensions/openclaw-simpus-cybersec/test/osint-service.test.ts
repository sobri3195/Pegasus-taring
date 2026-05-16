import { describe, expect, it, vi } from "vitest";
import { findMissingSecurityHeaders } from "../src/osint/headers-check.js";
import { checkSafePaths } from "../src/osint/path-check.js";

describe("osint service helpers", () => {
  it("detects missing security headers", () => {
    const headers = new Headers({ "x-frame-options": "DENY" });
    expect(findMissingSecurityHeaders(headers)).toContain("Content-Security-Policy");
    expect(findMissingSecurityHeaders(headers)).not.toContain("X-Frame-Options");
  });

  it("checks only the fixed safe path list", async () => {
    const fetchImpl = vi.fn(
      async (url: string) => new Response(null, { status: url.endsWith("/swagger") ? 200 : 404 }),
    ) as unknown as typeof fetch;
    const findings = await checkSafePaths("https://simpus.example.test", fetchImpl);
    expect(findings).toEqual([
      {
        path: "/swagger",
        status: 200,
        riskHint: "Medium",
        note: "Path responded without authentication redirect.",
      },
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(9);
  });
});
