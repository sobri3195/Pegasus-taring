import type { JsonSimpusStore } from "../storage/store.js";
import type { AuditLogEntry } from "../types.js";

export async function recordAudit(
  store: JsonSimpusStore,
  entry: Omit<AuditLogEntry, "id" | "timestamp">,
): Promise<void> {
  await store.addAudit({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...entry });
}
