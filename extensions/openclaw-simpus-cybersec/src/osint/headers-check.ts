import { SECURITY_HEADERS } from "../config.js";

export function findMissingSecurityHeaders(headers: Headers): string[] {
  return SECURITY_HEADERS.filter((header) => !headers.has(header)).map((header) =>
    canonicalHeader(header),
  );
}

function canonicalHeader(header: string): string {
  return header
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}
