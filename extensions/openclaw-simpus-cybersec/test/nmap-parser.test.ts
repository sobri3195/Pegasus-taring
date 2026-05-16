import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseNmapXml } from "../src/scanner/nmap-parser.js";

describe("nmap parser", () => {
  it("extracts only open ports", () => {
    const xml = fs.readFileSync(
      path.join(import.meta.dirname, "..", "fixtures", "sample-nmap.xml"),
      "utf8",
    );
    const findings = parseNmapXml(xml, "2026-01-01T00:00:00.000Z");
    expect(findings).toHaveLength(2);
    expect(findings[1]).toMatchObject({
      host: "192.168.1.50",
      port: 3306,
      service: "mysql",
      product: "MySQL",
    });
  });
});
