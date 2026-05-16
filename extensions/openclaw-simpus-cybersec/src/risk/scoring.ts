import type { RiskLevel } from "../types.js";

const weights: Record<RiskLevel, number> = { Info: 0, Low: 1, Medium: 2, High: 3, Critical: 4 };

export function maxRiskLevel(levels: RiskLevel[]): RiskLevel {
  return levels.reduce(
    (max, level) => (weights[level] > weights[max] ? level : max),
    "Info" as RiskLevel,
  );
}

export function riskWeight(level: RiskLevel): number {
  return weights[level];
}
