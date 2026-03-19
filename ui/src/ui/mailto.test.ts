import { describe, expect, it } from "vitest";
import { buildMailtoUrl } from "./mailto.ts";

describe("buildMailtoUrl", () => {
  it("encodes recipient, subject, and body for draft emails", () => {
    expect(
      buildMailtoUrl({
        to: "alerts@example.com",
        subject: "Gateway alert",
        body: "Line 1\nLine 2",
      }),
    ).toBe("mailto:alerts%40example.com?subject=Gateway%20alert&body=Line%201%0ALine%202");
  });
});
