import type { Asset, OsintFinding, PortFinding, RiskFinding, RiskLevel } from "../types.js";
import { recommendations } from "./recommendations.js";

const portRules: Record<number, { level: RiskLevel; title: string; rec: string; summary: string }> =
  {
    445: {
      level: "Critical",
      title: "SMB terbuka",
      rec: recommendations.remote,
      summary: "SMB terbuka meningkatkan risiko akses lateral dan kebocoran file internal.",
    },
    3306: {
      level: "High",
      title: "MySQL terbuka",
      rec: recommendations.database,
      summary: "Database terbuka dapat meningkatkan risiko paparan data pasien.",
    },
    5432: {
      level: "High",
      title: "PostgreSQL terbuka",
      rec: recommendations.database,
      summary: "Database terbuka dapat meningkatkan risiko paparan data pasien.",
    },
    3389: {
      level: "High",
      title: "RDP terbuka",
      rec: recommendations.remote,
      summary: "Remote desktop terbuka meningkatkan risiko akses tidak sah.",
    },
    22: {
      level: "Medium",
      title: "SSH terbuka",
      rec: recommendations.remote,
      summary: "SSH perlu dibatasi dan diawasi terutama jika baru muncul.",
    },
    80: {
      level: "Medium",
      title: "HTTP terbuka",
      rec: recommendations.web,
      summary: "HTTP tanpa HTTPS dapat membuka risiko intersepsi trafik.",
    },
    443: {
      level: "Medium",
      title: "HTTPS terbuka",
      rec: recommendations.web,
      summary: "Layanan web publik perlu hardening header dan pembatasan panel admin.",
    },
    8080: {
      level: "High",
      title: "Web admin port terbuka",
      rec: recommendations.web,
      summary: "Port admin web sering menjadi permukaan serangan berisiko tinggi.",
    },
    8443: {
      level: "High",
      title: "Web admin TLS port terbuka",
      rec: recommendations.web,
      summary: "Port admin web perlu dibatasi dari jaringan publik.",
    },
    9200: {
      level: "High",
      title: "Elasticsearch terbuka",
      rec: recommendations.database,
      summary: "Search datastore terbuka dapat mengekspos data sensitif.",
    },
    6379: {
      level: "High",
      title: "Redis terbuka",
      rec: recommendations.database,
      summary: "Redis terbuka dapat mengekspos cache/session sensitif.",
    },
    27017: {
      level: "High",
      title: "MongoDB terbuka",
      rec: recommendations.database,
      summary: "MongoDB terbuka dapat meningkatkan risiko paparan data pasien.",
    },
  };

export function evaluateFindings(params: {
  asset?: Asset;
  ports: PortFinding[];
  osint: OsintFinding[];
}): RiskFinding[] {
  const affectedAsset = params.asset?.name ?? params.asset?.target ?? "ad-hoc target";
  const findings: RiskFinding[] = [];
  for (const port of params.ports) {
    const rule = portRules[port.port];
    if (!rule) continue;
    findings.push(
      finding(
        rule.title,
        `Port ${port.port}/${port.protocol} dalam state ${port.state}.`,
        `${port.host}:${port.port} ${port.service ?? ""} ${port.product ?? ""} ${port.version ?? ""}`.trim(),
        rule.level,
        affectedAsset,
        rule.rec,
        rule.summary,
      ),
    );
  }
  for (const item of params.osint) {
    if (item.missingSecurityHeaders.length > 0) {
      findings.push(
        finding(
          "Security header belum lengkap",
          "Beberapa HTTP security header tidak ditemukan.",
          item.missingSecurityHeaders.join(", "),
          item.missingSecurityHeaders.length >= 4 ? "High" : "Medium",
          affectedAsset,
          recommendations.headers,
          "Header yang hilang dapat meningkatkan risiko clickjacking, content injection, dan MIME sniffing.",
        ),
      );
    }
    for (const exposed of item.suspiciousExposedPaths) {
      const path = exposed.path;
      const level =
        path === "/.git/" || path === "/phpmyadmin" ? "High" : (exposed.riskHint ?? "Medium");
      const rec =
        path === "/.git/"
          ? recommendations.git
          : path === "/swagger" || path === "/docs" || path === "/api"
            ? recommendations.docs
            : recommendations.web;
      findings.push(
        finding(
          `Path sensitif terekspos: ${path}`,
          "Path administratif/dokumentasi merespons permintaan ringan tanpa bypass.",
          `${path} HTTP ${exposed.status}`,
          level,
          affectedAsset,
          rec,
          "Panel admin atau dokumentasi API yang terekspos dapat memperluas peluang akses tidak sah.",
        ),
      );
    }
    if (
      item.tlsValidUntil &&
      new Date(item.tlsValidUntil).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000
    ) {
      findings.push(
        finding(
          "Sertifikat TLS kedaluwarsa atau mendekati kedaluwarsa",
          "Metadata sertifikat menunjukkan masa berlaku perlu ditinjau.",
          item.tlsValidUntil,
          "Medium",
          affectedAsset,
          recommendations.tls,
          "Masalah sertifikat dapat mengganggu kepercayaan pengguna dan kontinuitas layanan.",
        ),
      );
    }
  }
  return findings;
}

function finding(
  title: string,
  description: string,
  evidence: string,
  riskLevel: RiskLevel,
  affectedAsset: string,
  recommendation: string,
  managementSummary: string,
): RiskFinding {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    evidence,
    riskLevel,
    affectedAsset,
    recommendation,
    managementSummary,
    technicalRecommendation: recommendation,
  };
}

export const __testing = { portRules };
