import { isBlockedHostnameOrIp } from "../infra/net/ssrf.js";
import { DEFAULT_MAX_LINKS } from "./defaults.js";

// Remove markdown link syntax so only bare URLs are considered.
const MARKDOWN_LINK_RE = /\[[^\]]*]\((https?:\/\/\S+?)\)/gi;
const BARE_LINK_RE = /https?:\/\/\S+/gi;
const TRAILING_PUNCTUATION_RE = /[.,!?;:]+$/;

function stripMarkdownLinks(message: string): string {
  return message.replace(MARKDOWN_LINK_RE, " ");
}

function resolveMaxLinks(value?: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return DEFAULT_MAX_LINKS;
}

function normalizeBareUrl(raw: string): string {
  let candidate = raw.replace(TRAILING_PUNCTUATION_RE, "");

  while (candidate.endsWith(")")) {
    const opens = [...candidate].filter((char) => char === "(").length;
    const closes = [...candidate].filter((char) => char === ")").length;
    if (closes <= opens) {
      break;
    }
    candidate = candidate.slice(0, -1);
  }

  return candidate;
}

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (isBlockedHostnameOrIp(parsed.hostname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractLinksFromMessage(message: string, opts?: { maxLinks?: number }): string[] {
  const source = message?.trim();
  if (!source) {
    return [];
  }

  const maxLinks = resolveMaxLinks(opts?.maxLinks);
  const sanitized = stripMarkdownLinks(source);
  const seen = new Set<string>();
  const results: string[] = [];

  for (const match of sanitized.matchAll(BARE_LINK_RE)) {
    const raw = match[0]?.trim();
    if (!raw) {
      continue;
    }
    const normalized = normalizeBareUrl(raw);
    if (!normalized) {
      continue;
    }
    if (!isAllowedUrl(normalized)) {
      continue;
    }
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    results.push(normalized);
    if (results.length >= maxLinks) {
      break;
    }
  }

  return results;
}
