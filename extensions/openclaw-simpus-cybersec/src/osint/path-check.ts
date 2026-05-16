import { SAFE_EXPOSED_PATHS } from "../config.js";
import type { HttpPathFinding, RiskLevel } from "../types.js";
import { ensureUrl } from "./http-check.js";

export async function checkSafePaths(
  target: string,
  fetchImpl: typeof fetch = fetch,
): Promise<HttpPathFinding[]> {
  const base = ensureUrl(target).replace(/\/$/, "");
  const results: HttpPathFinding[] = [];
  for (const path of SAFE_EXPOSED_PATHS) {
    try {
      const response = await fetchImpl(`${base}${path}`, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(4_000),
      });
      if (response.status >= 200 && response.status < 400) {
        results.push({
          path,
          status: response.status,
          riskHint: riskForPath(path),
          note: "Path responded without authentication redirect.",
        });
      }
    } catch {
      // Passive path checks are best-effort and intentionally quiet.
    }
  }
  return results;
}

function riskForPath(path: string): RiskLevel {
  if (path === "/.git/" || path === "/phpmyadmin" || path === "/server-status") return "High";
  if (path === "/swagger" || path === "/docs" || path === "/api") return "Medium";
  return "Medium";
}
