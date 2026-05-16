import net from "node:net";
import type { Asset } from "../types.js";

export type ValidationContext = {
  allowPublicScan: boolean;
  deepCheck?: boolean;
  explicitDeepCheck?: boolean;
  authorized?: boolean;
  asset?: Asset;
};

export type ValidationResult =
  | { ok: true; warnings: string[]; normalizedTarget: string }
  | { ok: false; reason: string };

const DOMAIN_RE = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;
const HOST_RE = /^(localhost|[a-z0-9.-]+|\[[0-9a-f:]+\])(?::\d{1,5})?$/i;

export function normalizeTarget(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || /[\s;&|`$<>\\]/.test(trimmed)) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!url.hostname || !isAllowedHost(url.hostname)) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    if (isAllowedHost(trimmed)) return trimmed;
    return null;
  }
}

export function isPrivateOrLocalTarget(target: string): boolean {
  const host = extractHostname(target);
  if (!host) return false;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (net.isIP(host) === 4) {
    const [a, b] = host.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254)
    );
  }
  if (net.isIP(host) === 6) {
    return (
      host === "::1" ||
      host.toLowerCase().startsWith("fc") ||
      host.toLowerCase().startsWith("fd") ||
      host.toLowerCase().startsWith("fe80")
    );
  }
  return false;
}

export function extractHostname(target: string): string | null {
  try {
    return new URL(target).hostname.toLowerCase();
  } catch {
    return target.replace(/^\[/, "").replace(/\]$/, "").split(":")[0]?.toLowerCase() || null;
  }
}

export function validateTargetSafety(target: string, context: ValidationContext): ValidationResult {
  const normalizedTarget = normalizeTarget(target);
  if (!normalizedTarget) {
    return {
      ok: false,
      reason: "Target kosong, tidak valid, atau mengandung karakter shell berisiko.",
    };
  }
  if (context.deepCheck && !context.explicitDeepCheck) {
    return { ok: false, reason: "deepCheck ditolak tanpa flag eksplisit dan otorisasi tertulis." };
  }
  const asset = context.asset;
  if (asset?.environment === "production" && asset.authorizationStatus !== "authorized") {
    return {
      ok: false,
      reason: "Target production harus memiliki authorizationStatus=authorized.",
    };
  }
  if (asset?.authorizationStatus === "blocked") {
    return { ok: false, reason: "Target ditandai blocked dan tidak boleh dipindai." };
  }
  const authorized = context.authorized || asset?.authorizationStatus === "authorized";
  const privateOrLocal = isPrivateOrLocalTarget(normalizedTarget);
  const dummyOrStaging = asset?.environment === "dummy" || asset?.environment === "staging";
  if (!privateOrLocal && !dummyOrStaging && !authorized && !context.allowPublicScan) {
    return {
      ok: false,
      reason: "Public target ditolak. Set ALLOW_PUBLIC_SCAN=true dan tandai target authorized.",
    };
  }
  const warnings =
    asset?.environment === "production"
      ? ["Production target: jalankan hanya dalam window terotorisasi dan low-speed."]
      : [];
  return { ok: true, warnings, normalizedTarget };
}

function isAllowedHost(value: string): boolean {
  const host = value.replace(/^\[/, "").replace(/\]$/, "");
  return (
    host === "localhost" || net.isIP(host) !== 0 || DOMAIN_RE.test(host) || HOST_RE.test(value)
  );
}
