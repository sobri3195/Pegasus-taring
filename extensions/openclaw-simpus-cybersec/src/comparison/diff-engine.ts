import type { ComparisonResult, RiskFinding, ScanRun } from "../types.js";

export function compareScanRuns(previous: ScanRun | undefined, current: ScanRun): ComparisonResult {
  if (!previous) {
    return {
      newFindings: current.riskFindings.map(keyRisk),
      resolvedFindings: [],
      changedFindings: [],
      unchangedHighRiskFindings: [],
    };
  }
  const prevPorts = new Map(
    previous.portFindings.map((p) => [`${p.host}:${p.port}/${p.protocol}`, p]),
  );
  const currPorts = new Map(
    current.portFindings.map((p) => [`${p.host}:${p.port}/${p.protocol}`, p]),
  );
  const newFindings: string[] = [];
  const resolvedFindings: string[] = [];
  const changedFindings: string[] = [];
  for (const [key, port] of currPorts) {
    const old = prevPorts.get(key);
    if (!old) newFindings.push(`Port baru terbuka: ${key}`);
    else if (
      old.service !== port.service ||
      old.product !== port.product ||
      old.version !== port.version
    )
      changedFindings.push(`Service/version berubah: ${key}`);
  }
  for (const key of prevPorts.keys())
    if (!currPorts.has(key)) resolvedFindings.push(`Port tertutup: ${key}`);
  compareOsint(previous, current, newFindings, resolvedFindings, changedFindings);
  const prevRisk = new Set(previous.riskFindings.map(keyRisk));
  const currRisk = new Set(current.riskFindings.map(keyRisk));
  for (const risk of current.riskFindings)
    if (!prevRisk.has(keyRisk(risk))) newFindings.push(keyRisk(risk));
  for (const risk of previous.riskFindings)
    if (!currRisk.has(keyRisk(risk))) resolvedFindings.push(keyRisk(risk));
  return {
    newFindings: unique(newFindings),
    resolvedFindings: unique(resolvedFindings),
    changedFindings: unique(changedFindings),
    unchangedHighRiskFindings: current.riskFindings
      .filter((f) => ["High", "Critical"].includes(f.riskLevel) && prevRisk.has(keyRisk(f)))
      .map(keyRisk),
  };
}

function compareOsint(
  previous: ScanRun,
  current: ScanRun,
  added: string[],
  resolved: string[],
  changed: string[],
) {
  const old = previous.osintFindings[0];
  const now = current.osintFindings[0];
  if (!old || !now) return;
  const oldPaths = new Set(old.suspiciousExposedPaths.map((p) => p.path));
  const newPaths = new Set(now.suspiciousExposedPaths.map((p) => p.path));
  for (const path of newPaths) if (!oldPaths.has(path)) added.push(`Exposed path baru: ${path}`);
  for (const path of oldPaths)
    if (!newPaths.has(path)) resolved.push(`Exposed path resolved: ${path}`);
  for (const header of now.missingSecurityHeaders)
    if (!old.missingSecurityHeaders.includes(header))
      added.push(`Security header hilang: ${header}`);
  if (old.resolvedIps.join(",") !== now.resolvedIps.join(",")) changed.push("Resolved IP berubah");
  if (old.tlsValidUntil !== now.tlsValidUntil) changed.push("TLS certificate validity berubah");
}

function keyRisk(finding: RiskFinding): string {
  return `${finding.riskLevel}: ${finding.title} (${finding.evidence})`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
