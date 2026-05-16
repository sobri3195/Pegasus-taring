import dns from "node:dns/promises";

export async function collectDnsRecords(domain: string): Promise<Record<string, string[]>> {
  const records: Record<string, string[]> = {};
  await Promise.all(
    (["A", "AAAA", "CNAME", "MX", "TXT"] as const).map(async (type) => {
      try {
        const value = await dns.resolve(domain, type);
        records[type] = flattenDnsValue(value);
      } catch {
        records[type] = [];
      }
    }),
  );
  return records;
}

function flattenDnsValue(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (Array.isArray(item)) return item.join(" ");
    if (typeof item === "object" && item !== null) return JSON.stringify(item);
    return String(item);
  });
}
