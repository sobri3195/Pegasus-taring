import type { GatewaySessionRow } from "../types.ts";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function toCsvRow(values: Array<string | number | boolean | null | undefined>): string {
  return values
    .map((value) => {
      if (value === undefined || value === null) {
        return "";
      }
      return csvEscape(String(value));
    })
    .join(",");
}

export function buildSessionsCsv(rows: GatewaySessionRow[]): string {
  const lines = [
    toCsvRow([
      "key",
      "label",
      "displayName",
      "kind",
      "modelProvider",
      "model",
      "updatedAt",
      "inputTokens",
      "outputTokens",
      "totalTokens",
      "thinkingLevel",
      "fastMode",
      "verboseLevel",
      "reasoningLevel",
    ]),
  ];

  for (const row of rows) {
    lines.push(
      toCsvRow([
        row.key,
        row.label ?? "",
        row.displayName ?? "",
        row.kind ?? "",
        row.modelProvider ?? "",
        row.model ?? "",
        row.updatedAt ? new Date(row.updatedAt).toISOString() : "",
        row.inputTokens ?? "",
        row.outputTokens ?? "",
        row.totalTokens ?? row.inputTokens ?? row.outputTokens ?? "",
        row.thinkingLevel ?? "",
        row.fastMode ?? "",
        row.verboseLevel ?? "",
        row.reasoningLevel ?? "",
      ]),
    );
  }

  return lines.join("\n");
}

export function downloadSessionsCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
