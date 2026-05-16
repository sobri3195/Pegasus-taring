import os from "node:os";
import path from "node:path";

export type SimpusConfig = {
  dataDir: string;
  allowPublicScan: boolean;
  ollamaEnabled: boolean;
  ollamaModel: string;
  ollamaEndpoint: string;
};

export function resolveSimpusConfig(env: NodeJS.ProcessEnv = process.env): SimpusConfig {
  const dataDir =
    env.OPENCLAW_SIMPUS_DATA_DIR?.trim() || path.join(os.homedir(), ".openclaw", "simpus-cybersec");
  return {
    dataDir,
    allowPublicScan: env.ALLOW_PUBLIC_SCAN === "true",
    ollamaEnabled: env.OLLAMA_ENABLED === "true",
    ollamaModel: env.OLLAMA_MODEL?.trim() || "llama3",
    ollamaEndpoint: env.OLLAMA_ENDPOINT?.trim() || "http://127.0.0.1:11434/api/generate",
  };
}

export const SAFE_EXPOSED_PATHS = [
  "/admin",
  "/login",
  "/dashboard",
  "/api",
  "/swagger",
  "/docs",
  "/phpmyadmin",
  "/server-status",
  "/.git/",
] as const;

export const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
] as const;
