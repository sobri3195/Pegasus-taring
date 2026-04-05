const DEFAULT_WORDS_PER_MINUTE = 200;

export function toTitleCase(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function wordCount(input: string): number {
  const words = input.trim().match(/\S+/g);
  return words?.length ?? 0;
}

export function sentenceCount(input: string): number {
  const sentences = input
    .trim()
    .split(/[.!?]+/)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0);

  return sentences.length;
}

export function estimateReadTimeMinutes(input: string, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE): number {
  const words = wordCount(input);
  if (words === 0 || wordsPerMinute <= 0) {
    return 0;
  }

  return Math.ceil(words / wordsPerMinute);
}

export function extractHashtags(input: string): string[] {
  const matches = input.match(/#([\p{L}\p{N}_-]+)/gu) ?? [];
  return matches.map((match) => match.slice(1));
}

export function extractMentions(input: string): string[] {
  const matches = input.match(/@([\p{L}\p{N}_.-]+)/gu) ?? [];
  return matches.map((match) => match.slice(1));
}

export function truncateWithEllipsis(input: string, maxLength: number): string {
  if (maxLength <= 0) {
    return "";
  }

  if (input.length <= maxLength) {
    return input;
  }

  if (maxLength === 1) {
    return "…";
  }

  return `${input.slice(0, maxLength - 1)}…`;
}

export function highlightKeyword(input: string, keyword: string): string {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    return input;
  }

  // Escape regex metacharacters so user input can be highlighted safely.
  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escapedKeyword})`, "gi");
  return input.replace(pattern, "**$1**");
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
