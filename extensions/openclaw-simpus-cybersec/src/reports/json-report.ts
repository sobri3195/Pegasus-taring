import type { Asset, ComparisonResult, ScanRun } from "../types.js";

export function generateJsonReport(params: {
  assets: Asset[];
  runs: ScanRun[];
  comparison?: ComparisonResult;
}): string {
  return `${JSON.stringify({ generatedAt: new Date().toISOString(), ...params }, null, 2)}\n`;
}
