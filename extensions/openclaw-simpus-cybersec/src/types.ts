export const assetTypes = [
  "simpus",
  "simrs",
  "api",
  "website",
  "database",
  "dicom",
  "gateway",
  "other",
] as const;
export type AssetType = (typeof assetTypes)[number];

export const environments = ["dummy", "staging", "production"] as const;
export type AssetEnvironment = (typeof environments)[number];

export const authorizationStatuses = ["authorized", "pending", "blocked"] as const;
export type AuthorizationStatus = (typeof authorizationStatuses)[number];

export type RiskLevel = "Info" | "Low" | "Medium" | "High" | "Critical";

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  target: string;
  environment: AssetEnvironment;
  owner?: string;
  location?: string;
  notes?: string;
  authorizationStatus: AuthorizationStatus;
  createdAt: string;
  updatedAt: string;
};

export type PortFinding = {
  host: string;
  port: number;
  protocol: string;
  state: string;
  service?: string;
  product?: string;
  version?: string;
  extraInfo?: string;
  timestamp: string;
};

export type HttpPathFinding = {
  path: string;
  status: number;
  riskHint?: RiskLevel;
  note?: string;
};

export type OsintFinding = {
  domain: string;
  resolvedIps: string[];
  dnsRecords: Record<string, string[]>;
  httpStatus?: number;
  redirectChain: string[];
  tlsIssuer?: string;
  tlsValidUntil?: string;
  missingSecurityHeaders: string[];
  suspiciousExposedPaths: HttpPathFinding[];
  robotsTxtPresent: boolean;
  sitemapXmlPresent: boolean;
  securityTxtPresent: boolean;
  technologyHints: string[];
  riskScore: number;
  timestamp: string;
};

export type RiskFinding = {
  id: string;
  title: string;
  description: string;
  evidence: string;
  riskLevel: RiskLevel;
  affectedAsset: string;
  recommendation: string;
  managementSummary: string;
  technicalRecommendation: string;
};

export type ScanRun = {
  id: string;
  assetId: string;
  target: string;
  mode: "light" | "deep" | "osint";
  startedAt: string;
  completedAt?: string;
  status: "success" | "failed" | "blocked";
  portFindings: PortFinding[];
  osintFindings: OsintFinding[];
  riskFindings: RiskFinding[];
  error?: string;
};

export type ComparisonResult = {
  newFindings: string[];
  resolvedFindings: string[];
  changedFindings: string[];
  unchangedHighRiskFindings: string[];
};

export type AuditLogEntry = {
  id: string;
  actor?: string;
  command: string;
  target?: string;
  timestamp: string;
  mode?: string;
  status: "success" | "failed" | "blocked";
  blockedReason?: string;
};

export type SimpusStoreData = {
  assets: Asset[];
  scanRuns: ScanRun[];
  comparisons: Array<ComparisonResult & { id: string; assetId: string; createdAt: string }>;
  reports: Array<{
    id: string;
    assetId?: string;
    format: string;
    createdAt: string;
    content: string;
  }>;
  auditLogs: AuditLogEntry[];
};
