import type { SimpusConfig } from "../config.js";
import type { ScanRun } from "../types.js";

const prompt =
  "Ringkas hasil assessment SIMPUS berikut untuk manajemen non-teknis. Jangan menambahkan fakta di luar data. Jelaskan risiko utama, dampak layanan, dan rekomendasi mitigasi prioritas.";

export async function summarizeWithLocalOllama(
  config: SimpusConfig,
  runs: ScanRun[],
  fetchImpl: typeof fetch = fetch,
): Promise<string | undefined> {
  if (!config.ollamaEnabled) return undefined;
  const response = await fetchImpl(config.ollamaEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: config.ollamaModel,
      prompt: `${prompt}\n\n${JSON.stringify(runs, null, 2)}`,
      stream: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Ollama summary failed: HTTP ${response.status}`);
  const data = (await response.json()) as { response?: string };
  return data.response?.trim();
}
