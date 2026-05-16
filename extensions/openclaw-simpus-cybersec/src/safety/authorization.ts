import type { Asset } from "../types.js";

export function canScanAsset(asset: Asset): { ok: true } | { ok: false; reason: string } {
  if (asset.authorizationStatus === "blocked")
    return { ok: false, reason: "Asset authorizationStatus=blocked." };
  if (asset.environment === "production" && asset.authorizationStatus !== "authorized") {
    return { ok: false, reason: "Production asset requires authorizationStatus=authorized." };
  }
  return { ok: true };
}
