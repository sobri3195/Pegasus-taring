import { recordAudit } from "../audit/audit-log.js";
import { evaluateFindings } from "../risk/rules.js";
import { validateTargetSafety } from "../safety/target-validator.js";
import type { JsonSimpusStore } from "../storage/store.js";
import type { Asset, ScanRun } from "../types.js";
import { parseNmapXml } from "./nmap-parser.js";
import { runNmapSafe } from "./nmap-runner.js";

export async function scanAsset(params: {
  store: JsonSimpusStore;
  asset: Asset;
  allowPublicScan: boolean;
  deepCheck?: boolean;
  explicitDeepCheck?: boolean;
}): Promise<ScanRun> {
  const startedAt = new Date().toISOString();
  const validation = validateTargetSafety(params.asset.target, {
    allowPublicScan: params.allowPublicScan,
    deepCheck: params.deepCheck,
    explicitDeepCheck: params.explicitDeepCheck,
    asset: params.asset,
  });
  if (!validation.ok) {
    await recordAudit(params.store, {
      command: "scan",
      target: params.asset.target,
      mode: "light",
      status: "blocked",
      blockedReason: validation.reason,
    });
    const run = blockedRun(params.asset, startedAt, validation.reason);
    await params.store.addScanRun(run);
    return run;
  }
  try {
    const xml = await runNmapSafe({
      target: validation.normalizedTarget,
      deepCheck: params.deepCheck,
    });
    const portFindings = parseNmapXml(xml);
    const riskFindings = evaluateFindings({ asset: params.asset, ports: portFindings, osint: [] });
    const run: ScanRun = {
      id: crypto.randomUUID(),
      assetId: params.asset.id,
      target: validation.normalizedTarget,
      mode: params.deepCheck ? "deep" : "light",
      startedAt,
      completedAt: new Date().toISOString(),
      status: "success",
      portFindings,
      osintFindings: [],
      riskFindings,
    };
    await params.store.addScanRun(run);
    await recordAudit(params.store, {
      command: "scan",
      target: params.asset.target,
      mode: run.mode,
      status: "success",
    });
    return run;
  } catch (err) {
    const run: ScanRun = {
      ...blockedRun(params.asset, startedAt, err instanceof Error ? err.message : String(err)),
      status: "failed",
    };
    await params.store.addScanRun(run);
    await recordAudit(params.store, {
      command: "scan",
      target: params.asset.target,
      mode: "light",
      status: "failed",
    });
    return run;
  }
}

function blockedRun(asset: Asset, startedAt: string, error: string): ScanRun {
  return {
    id: crypto.randomUUID(),
    assetId: asset.id,
    target: asset.target,
    mode: "light",
    startedAt,
    completedAt: new Date().toISOString(),
    status: "blocked",
    portFindings: [],
    osintFindings: [],
    riskFindings: [],
    error,
  };
}
