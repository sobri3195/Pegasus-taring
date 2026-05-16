import { describe, expect, it } from "vitest";
import { evaluateFindings } from "../src/risk/rules.js";

describe("risk rules", () => {
  it("flags database exposure as high risk", () => {
    const findings = evaluateFindings({
      ports: [
        {
          host: "192.168.1.50",
          port: 3306,
          protocol: "tcp",
          state: "open",
          service: "mysql",
          timestamp: "now",
        },
      ],
      osint: [],
    });
    expect(findings[0]?.riskLevel).toBe("High");
    expect(findings[0]?.managementSummary).toContain("data pasien");
  });

  it("flags exposed git path", () => {
    const findings = evaluateFindings({
      ports: [],
      osint: [
        {
          domain: "example.test",
          resolvedIps: [],
          dnsRecords: {},
          redirectChain: [],
          missingSecurityHeaders: [],
          suspiciousExposedPaths: [{ path: "/.git/", status: 200 }],
          robotsTxtPresent: false,
          sitemapXmlPresent: false,
          securityTxtPresent: false,
          technologyHints: [],
          riskScore: 12,
          timestamp: "now",
        },
      ],
    });
    expect(findings[0]?.riskLevel).toBe("High");
  });
});
