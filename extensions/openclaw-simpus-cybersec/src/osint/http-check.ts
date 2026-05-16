import { findMissingSecurityHeaders } from "./headers-check.js";

export type HttpCheckResult = {
  status?: number;
  finalUrl?: string;
  redirectChain: string[];
  missingSecurityHeaders: string[];
  technologyHints: string[];
};

export async function checkHttp(
  target: string,
  fetchImpl: typeof fetch = fetch,
): Promise<HttpCheckResult> {
  const url = ensureUrl(target);
  const redirectChain: string[] = [];
  const response = await fetchImpl(url, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(8_000),
  });
  if (response.redirected) redirectChain.push(response.url);
  const text = await readSmallText(response);
  return {
    status: response.status,
    finalUrl: response.url,
    redirectChain,
    missingSecurityHeaders: findMissingSecurityHeaders(response.headers),
    technologyHints: collectTechnologyHints(response.headers, text),
  };
}

export async function checkPresence(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetchImpl(url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(5_000),
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

export function ensureUrl(target: string): string {
  return /^https?:\/\//i.test(target) ? target : `https://${target}`;
}

async function readSmallText(response: Response): Promise<string> {
  const type = response.headers.get("content-type") ?? "";
  const len = Number(response.headers.get("content-length") ?? 0);
  if (!type.includes("text/html") || len > 250_000) return "";
  return (await response.text()).slice(0, 65_536);
}

function collectTechnologyHints(headers: Headers, html: string): string[] {
  const hints = new Set<string>();
  for (const name of ["server", "x-powered-by", "x-generator"]) {
    const value = headers.get(name);
    if (value) hints.add(`${name}: ${value}`);
  }
  const generator = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
  if (generator) hints.add(`meta generator: ${generator}`);
  return [...hints];
}
