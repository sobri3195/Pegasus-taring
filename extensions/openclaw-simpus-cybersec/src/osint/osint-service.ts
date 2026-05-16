import { SAFE_EXPOSED_PATHS } from "../config.js";
import { recordAudit } from "../audit/audit-log.js";
import { evaluateFindings } from "../risk/rules.js";
import { validateTargetSafety, extractHostname } from "../safety/target-validator.js";
import type { JsonSimpusStore } from "../storage/store.js";
import type { Asset, OsintFinding, ScanRun } from "../types.js";
import { collectDnsRecords } from "./dns-check.js";
import { checkHttp, checkPresence, ensureUrl } from "./http-check.js";
import { checkSafePaths } from "./path-check.js";
import { collectTlsMetadata } from "./tls-check.js";

export async function collectOsint(
  target: string,
  fetchImpl: typeof fetch = fetch,
): Promise<OsintFinding> {
  const domain = extractHostname(target) ?? target;
  const dnsRecords = await collectDnsRecords(domain);
  const http = await checkHttp(target, fetchImpl).catch(() => ({
    status: undefined,
    redirectChain: [],
    missingSecurityHeaders: [],
    technologyHints: [],
  }));
  const base = ensureUrl(target).replace(/\/$/, "");
  const [tls, exposed, robots, sitemap, security] = await Promise.all([
    collectTlsMetadata(domain),
    checkSafePaths(target, fetchImpl),
    checkPresence(`${base}/robots.txt`, fetchImpl),
    checkPresence(`${base}/sitemap.xml`, fetchImpl),
    checkPresence(`${base}/.well-known/security.txt`, fetchImpl),
  ]);
  const riskScore = Math.min(
    100,
    exposed.length * 12 +
      (http.missingSecurityHeaders?.length ?? 0) * 5 +
      (tls.validUntil && new Date(tls.validUntil) < new Date() ? 25 : 0),
  );
  return {
    domain,
    resolvedIps: [...(dnsRecords.A ?? []), ...(dnsRecords.AAAA ?? [])],
    dnsRecords,
    httpStatus: http.status,
    redirectChain: http.redirectChain,
    tlsIssuer: tls.issuer,
    tlsValidUntil: tls.validUntil,
    missingSecurityHeaders: http.missingSecurityHeaders ?? [],
    suspiciousExposedPaths: exposed.filter((item) =>
      SAFE_EXPOSED_PATHS.includes(item.path as (typeof SAFE_EXPOSED_PATHS)[number]),
    ),
    robotsTxtPresent: robots,
    sitemapXmlPresent: sitemap,
    securityTxtPresent: security,
    technologyHints: http.technologyHints ?? [],
    riskScore,
    timestamp: new Date().toISOString(),
  };
}

export async function osintTarget(params: {
  store: JsonSimpusStore;
  target: string;
  allowPublicScan: boolean;
  authorized?: boolean;
  asset?: Asset;
  fetchImpl?: typeof fetch;
}): Promise<ScanRun> {
  const startedAt = new Date().toISOString();
  const validation = validateTargetSafety(params.target, {
    allowPublicScan: params.allowPublicScan,
    authorized: params.authorized,
    asset: params.asset,
  });
  const assetId = params.asset?.id ?? "ad-hoc";
  if (!validation.ok) {
    await recordAudit(params.store, {
      command: "osint",
      target: params.target,
      mode: "osint",
      status: "blocked",
      blockedReason: validation.reason,
    });
    return makeRun(assetId, params.target, startedAt, "blocked", [], validation.reason);
  }
  try {
    const osint = await collectOsint(validation.normalizedTarget, params.fetchImpl);
    const riskFindings = evaluateFindings({ asset: params.asset, ports: [], osint: [osint] });
    const run = makeRun(assetId, validation.normalizedTarget, startedAt, "success", [osint]);
    run.riskFindings = riskFindings;
    await params.store.addScanRun(run);
    await recordAudit(params.store, {
      command: "osint",
      target: params.target,
      mode: "osint",
      status: "success",
    });
    return run;
  } catch (err) {
    const run = makeRun(
      assetId,
      validation.normalizedTarget,
      startedAt,
      "failed",
      [],
      err instanceof Error ? err.message : String(err),
    );
    await params.store.addScanRun(run);
    await recordAudit(params.store, {
      command: "osint",
      target: params.target,
      mode: "osint",
      status: "failed",
    });
    return run;
  }
}

function makeRun(
  assetId: string,
  target: string,
  startedAt: string,
  status: ScanRun["status"],
  osintFindings: OsintFinding[],
  error?: string,
): ScanRun {
  return {
    id: crypto.randomUUID(),
    assetId,
    target,
    mode: "osint",
    startedAt,
    completedAt: new Date().toISOString(),
    status,
    portFindings: [],
    osintFindings,
    riskFindings: [],
    error,
  };
}
