import type { ScanRun } from "../types.js";

export function generateCsvReport(runs: ScanRun[]): string {
  const rows = [["assetId", "target", "type", "risk", "title", "evidence", "recommendation"]];
  for (const run of runs) {
    for (const finding of run.riskFindings) {
      rows.push([
        run.assetId,
        run.target,
        run.mode,
        finding.riskLevel,
        finding.title,
        finding.evidence,
        finding.recommendation,
      ]);
    }
  }
  return `${rows.map((row) => row.map(csv).join(",")).join("\n")}\n`;
}

function csv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
