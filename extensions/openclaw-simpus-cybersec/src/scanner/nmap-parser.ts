import type { PortFinding } from "../types.js";

function attr(source: string, name: string): string | undefined {
  const match = source.match(new RegExp(`${name}="([^"]*)"`));
  return match?.[1];
}

export function parseNmapXml(xml: string, timestamp = new Date().toISOString()): PortFinding[] {
  const findings: PortFinding[] = [];
  const hostBlocks = xml.match(/<host[\s\S]*?<\/host>/g) ?? [];
  for (const hostBlock of hostBlocks) {
    const addressTag = hostBlock.match(/<address\b[^>]*>/)?.[0] ?? "";
    const host = attr(addressTag, "addr") ?? "unknown";
    const portBlocks = hostBlock.match(/<port\b[\s\S]*?<\/port>/g) ?? [];
    for (const portBlock of portBlocks) {
      const openState = portBlock.match(/<state\b[^>]*state="open"[^>]*>/);
      if (!openState) continue;
      const portTag = portBlock.match(/<port\b[^>]*>/)?.[0] ?? "";
      const serviceTag = portBlock.match(/<service\b[^>]*>/)?.[0] ?? "";
      findings.push({
        host,
        port: Number(attr(portTag, "portid") ?? 0),
        protocol: attr(portTag, "protocol") ?? "tcp",
        state: "open",
        service: attr(serviceTag, "name"),
        product: attr(serviceTag, "product"),
        version: attr(serviceTag, "version"),
        extraInfo: attr(serviceTag, "extrainfo"),
        timestamp,
      });
    }
  }
  return findings;
}
