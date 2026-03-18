const HOMEPAGE_ALIAS_KEYS = [
  "homepage",
  "website",
  "url",
  "site",
  "link",
  "homepageUrl",
  "websiteUrl",
  "documentation",
  "documentationUrl",
  "docs",
  "docsUrl",
  "projectUrl",
  "projectLink",
] as const;

type HomepageAliasMap = Partial<Record<(typeof HOMEPAGE_ALIAS_KEYS)[number], string>>;

function resolveHomepageAliasMatch(value?: HomepageAliasMap | null): {
  present: boolean;
  homepage?: string;
} {
  if (!value) {
    return { present: false };
  }

  for (const key of HOMEPAGE_ALIAS_KEYS) {
    if (key in value) {
      const aliasValue = value[key];
      return {
        present: true,
        homepage: aliasValue?.trim() ? aliasValue.trim() : undefined,
      };
    }
  }

  return { present: false };
}

function resolveHomepageFromAliases(value?: HomepageAliasMap | null): string | undefined {
  return resolveHomepageAliasMatch(value).homepage;
}

export function resolveEmojiAndHomepage(params: {
  metadata?: ({ emoji?: string } & HomepageAliasMap) | null;
  frontmatter?: ({ emoji?: string } & HomepageAliasMap) | null;
}): { emoji?: string; homepage?: string } {
  const emoji = params.metadata?.emoji ?? params.frontmatter?.emoji;
  const metadataHomepage = resolveHomepageAliasMatch(params.metadata);
  const homepage = metadataHomepage.present
    ? metadataHomepage.homepage
    : resolveHomepageFromAliases(params.frontmatter);
  return { ...(emoji ? { emoji } : {}), ...(homepage ? { homepage } : {}) };
}

export { HOMEPAGE_ALIAS_KEYS, resolveHomepageFromAliases };
