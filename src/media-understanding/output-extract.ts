export function extractLastJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const slice = findLastCompleteJsonObject(trimmed);
  if (!slice) {
    return null;
  }
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function findLastCompleteJsonObject(input: string): string | null {
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let objectStart = -1;
  let lastCompleteObject: string | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (!ch) {
      continue;
    }

    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (ch === "\\") {
        escapeNext = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) {
        objectStart = i;
      }
      depth += 1;
      continue;
    }

    if (ch === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0 && objectStart >= 0) {
        lastCompleteObject = input.slice(objectStart, i + 1);
      }
    }
  }

  return lastCompleteObject;
}

export function extractGeminiResponse(raw: string): string | null {
  const payload = extractLastJsonObject(raw);
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const response = (payload as { response?: unknown }).response;
  if (typeof response !== "string") {
    return null;
  }
  const trimmed = response.trim();
  return trimmed || null;
}
