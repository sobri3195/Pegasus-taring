import { describe, expect, it } from "vitest";
import {
  estimateReadTimeMinutes,
  extractHashtags,
  extractMentions,
  highlightKeyword,
  normalizeWhitespace,
  sentenceCount,
  slugify,
  toTitleCase,
  truncateWithEllipsis,
  wordCount,
} from "./text-features.js";

describe("text-features", () => {
  it("converts plain text to title case", () => {
    expect(toTitleCase("  halo DUNIA dari OPENCLAW ")).toBe("Halo Dunia Dari Openclaw");
  });

  it("creates URL-friendly slugs", () => {
    expect(slugify("Fitur Baru: Cek Koneksi Cepat!"))
      .toBe("fitur-baru-cek-koneksi-cepat");
  });

  it("counts words in a sentence", () => {
    expect(wordCount("satu dua   tiga\nempat")).toBe(4);
  });

  it("counts sentences based on common punctuation", () => {
    expect(sentenceCount("Apa kabar? Saya baik. Mantap!"))
      .toBe(3);
  });

  it("estimates reading time in minutes", () => {
    expect(estimateReadTimeMinutes("kata ".repeat(201))).toBe(2);
  });

  it("extracts hashtags without hash symbols", () => {
    expect(extractHashtags("#openclaw #fitur-baru ayo jalan"))
      .toEqual(["openclaw", "fitur-baru"]);
  });

  it("extracts mentions without at symbols", () => {
    expect(extractMentions("halo @peter.dev dan @tim_openclaw"))
      .toEqual(["peter.dev", "tim_openclaw"]);
  });

  it("truncates text and appends an ellipsis", () => {
    expect(truncateWithEllipsis("abcdefghij", 6)).toBe("abcde…");
  });

  it("highlights matching keywords safely", () => {
    expect(highlightKeyword("Cari model gpt-4.1 sekarang", "gpt-4.1"))
      .toBe("Cari model **gpt-4.1** sekarang");
  });

  it("normalizes whitespace and trims edges", () => {
    expect(normalizeWhitespace("  satu\n\ndua\t tiga   ")).toBe("satu dua tiga");
  });
});
