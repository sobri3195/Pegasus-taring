import { describe, expect, it } from "vitest";

import { extractGeminiResponse, extractLastJsonObject } from "./output-extract.js";

describe("extractLastJsonObject", () => {
  it("extracts nested object payloads from mixed stdout", () => {
    const payload = extractLastJsonObject('progress line\n{"meta":{"ok":true},"response":"done"}');
    expect(payload).toEqual({
      meta: { ok: true },
      response: "done",
    });
  });

  it("ignores braces inside string values", () => {
    const payload = extractLastJsonObject('{"response":"ok {still string}"}');
    expect(payload).toEqual({ response: "ok {still string}" });
  });

  it("returns null when trailing partial JSON is present", () => {
    expect(extractLastJsonObject('{"response":"good"}\n{"response"')).toEqual({ response: "good" });
  });
});

describe("extractGeminiResponse", () => {
  it("returns trimmed response from nested object output", () => {
    expect(extractGeminiResponse('noise\n{"data":{"id":1},"response":"  success  "}')).toBe(
      "success",
    );
  });
});
