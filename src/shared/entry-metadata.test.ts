import { describe, expect, it } from "vitest";
import { HOMEPAGE_ALIAS_KEYS, resolveEmojiAndHomepage } from "./entry-metadata.js";

describe("shared/entry-metadata", () => {
  it("prefers metadata emoji and homepage when present", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { emoji: "🦀", homepage: " https://openclaw.ai " },
        frontmatter: { emoji: "🙂", homepage: "https://example.com" },
      }),
    ).toEqual({
      emoji: "🦀",
      homepage: "https://openclaw.ai",
    });
  });

  it("keeps metadata precedence even when metadata values are blank", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { emoji: "", homepage: "   " },
        frontmatter: { emoji: "🙂", homepage: "https://example.com" },
      }),
    ).toEqual({});
  });

  it("falls back through frontmatter homepage aliases and drops blanks", () => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: { emoji: "🙂", website: " https://docs.openclaw.ai " },
      }),
    ).toEqual({
      emoji: "🙂",
      homepage: "https://docs.openclaw.ai",
    });
    expect(
      resolveEmojiAndHomepage({
        metadata: { homepage: "   " },
        frontmatter: { url: "   " },
      }),
    ).toEqual({});
    expect(
      resolveEmojiAndHomepage({
        frontmatter: { url: " https://openclaw.ai/install " },
      }),
    ).toEqual({
      homepage: "https://openclaw.ai/install",
    });
  });

  it.each(
    HOMEPAGE_ALIAS_KEYS.filter((key) => !["homepage", "website", "url"].includes(key)).map(
      (key) => [key],
    ),
  )("supports the %s alias in frontmatter", (key) => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: {
          [key]: " https://docs.openclaw.ai/skills ",
        },
      }),
    ).toEqual({
      homepage: "https://docs.openclaw.ai/skills",
    });
  });

  it("supports alias fallback in metadata before frontmatter", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { documentationUrl: " https://docs.openclaw.ai/hooks " },
        frontmatter: { homepage: "https://example.com/ignored" },
      }),
    ).toEqual({
      homepage: "https://docs.openclaw.ai/hooks",
    });
  });

  it("does not fall back once frontmatter homepage aliases are present but blank", () => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: {
          homepage: " ",
          website: "https://docs.openclaw.ai",
          url: "https://openclaw.ai/install",
          docsUrl: "https://docs.openclaw.ai/ignored",
        },
      }),
    ).toEqual({});
  });
});
