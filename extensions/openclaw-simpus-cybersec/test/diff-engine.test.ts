import { describe, expect, it } from "vitest";
import { compareScanRuns } from "../src/comparison/diff-engine.js";
import type { ScanRun } from "../src/types.js";

const baseRun: ScanRun = {
  id: "1",
  assetId: "a",
  target: "192.168.1.50",
  mode: "light",
  startedAt: "1",
  status: "success",
  portFindings: [],
  osintFindings: [],
  riskFindings: [],
};

describe("diff engine", () => {
  it("detects new ports and service changes", () => {
    const previous: ScanRun = {
      ...baseRun,
      portFindings: [
        {
          host: "h",
          port: 22,
          protocol: "tcp",
          state: "open",
          service: "ssh",
          version: "8",
          timestamp: "1",
        },
      ],
    };
    const current: ScanRun = {
      ...baseRun,
      id: "2",
      portFindings: [
        {
          host: "h",
          port: 22,
          protocol: "tcp",
          state: "open",
          service: "ssh",
          version: "9",
          timestamp: "2",
        },
        { host: "h", port: 3306, protocol: "tcp", state: "open", service: "mysql", timestamp: "2" },
      ],
    };
    const diff = compareScanRuns(previous, current);
    expect(diff.newFindings).toContain("Port baru terbuka: h:3306/tcp");
    expect(diff.changedFindings).toContain("Service/version berubah: h:22/tcp");
  });
});
