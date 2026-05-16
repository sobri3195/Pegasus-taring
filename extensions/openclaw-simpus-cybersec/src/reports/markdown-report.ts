import type { Asset, ComparisonResult, RiskFinding, ScanRun } from "../types.js";

export function generateMarkdownReport(params: {
  assets: Asset[];
  runs: ScanRun[];
  comparison?: ComparisonResult;
  aiSummary?: string;
}): string {
  const findings = params.runs.flatMap((run) => run.riskFindings);
  const high = findings.filter((f) => f.riskLevel === "High" || f.riskLevel === "Critical");
  return `# OpenClaw SIMPUS Scanner & OSINT Report

## Executive Summary
Assessment menemukan ${findings.length} temuan risiko pada ${params.assets.length} aset. ${high.length} temuan perlu prioritas tinggi karena berpotensi memengaruhi keamanan data pasien, akses administratif, atau kontinuitas layanan.
${params.aiSummary ? `\n### Local AI Summary\n${params.aiSummary}\n` : ""}
## Assessment Scope
${params.assets.map((a) => `- ${a.name} (${a.type}, ${a.environment}, ${a.authorizationStatus}) - ${a.target}`).join("\n") || "- Tidak ada aset."}

## Methodology
Metode yang digunakan:
- passive/light scanning
- OSINT pasif
- service/version detection
- comparison antar-scan
- tidak melakukan exploit
- tidak melakukan brute force
- tidak mengambil data pasien

## Asset Overview
| Asset | Type | Environment | Authorization | Target |
| --- | --- | --- | --- | --- |
${params.assets.map((a) => `| ${escapeMd(a.name)} | ${a.type} | ${a.environment} | ${a.authorizationStatus} | ${escapeMd(a.target)} |`).join("\n")}

## Open Ports and Services
| Port | Protocol | Service | Product | Version | Risk | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${params.runs.flatMap((run) => run.portFindings.map((p) => `| ${p.port} | ${p.protocol} | ${escapeMd(p.service ?? "")} | ${escapeMd(p.product ?? "")} | ${escapeMd(p.version ?? "")} | ${riskForPort(p.port, findings)} | ${escapeMd(p.extraInfo ?? "")} |`)).join("\n") || "| - | - | - | - | - | - | Tidak ada data port. |"}

## OSINT Findings
| Finding | Evidence | Risk | Recommendation |
| --- | --- | --- | --- |
${findings.map((f) => `| ${escapeMd(f.title)} | ${escapeMd(f.evidence)} | ${f.riskLevel} | ${escapeMd(f.recommendation)} |`).join("\n") || "| - | - | - | Tidak ada temuan OSINT. |"}

## SIMPUS-Specific Risk Analysis
- Database exposure: batasi MySQL/PostgreSQL/MongoDB/Redis/Elasticsearch ke jaringan internal.
- Admin panel exposure: batasi /admin, /dashboard, phpMyAdmin, dan remote access dengan VPN/MFA.
- API documentation exposure: lindungi /swagger, /docs, dan /api dengan autentikasi.
- Weak HTTP security headers: tambahkan HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, dan Permissions-Policy.
- TLS/certificate issue: pantau masa berlaku dan konfigurasi TLS.
- Remote access exposure: batasi SSH/RDP/SMB dengan allowlist dan monitoring.

## Changes Since Last Scan
${formatComparison(params.comparison)}

## High Priority Findings
${high.map(formatFinding).join("\n") || "Tidak ada temuan High/Critical."}

## Recommended Actions
### 24 jam
- Tutup atau batasi port database dan remote access yang terbuka ke publik.
- Lindungi path sensitif seperti /.git/, /phpmyadmin, /server-status, dan panel admin.

### 7 hari
- Tambahkan security headers dan review konfigurasi reverse proxy.
- Terapkan VPN/MFA/allowlist untuk akses administratif.

### 30 hari
- Jadwalkan scan ringan berkala dan comparison antar-scan.
- Dokumentasikan otorisasi, owner aset, dan prosedur response.

## Safety Note
Assessment dilakukan secara defensif, non-destruktif, dan hanya untuk target terotorisasi. Extension ini tidak melakukan exploit, brute force, bypass, DoS, atau pengambilan data pasien.
`;
}

function riskForPort(port: number, findings: RiskFinding[]): string {
  return (
    findings.find(
      (finding) =>
        finding.evidence.includes(`:${port}`) || finding.evidence.includes(`Port ${port}`),
    )?.riskLevel ?? "Info"
  );
}

function formatComparison(comparison?: ComparisonResult): string {
  if (!comparison) return "Belum ada comparison sebelumnya.";
  return (
    [
      ...comparison.newFindings.map((v) => `- New: ${v}`),
      ...comparison.resolvedFindings.map((v) => `- Resolved: ${v}`),
      ...comparison.changedFindings.map((v) => `- Changed: ${v}`),
      ...comparison.unchangedHighRiskFindings.map((v) => `- Unchanged high risk: ${v}`),
    ].join("\n") || "Tidak ada perubahan signifikan."
  );
}

function formatFinding(finding: RiskFinding): string {
  return `- **${finding.riskLevel}: ${escapeMd(finding.title)}** — ${escapeMd(finding.managementSummary)} Rekomendasi: ${escapeMd(finding.recommendation)}`;
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
