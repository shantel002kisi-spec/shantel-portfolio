const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export function getSiteUrl(): URL | undefined {
  if (!configuredSiteUrl) return undefined;

  try {
    const url = new URL(configuredSiteUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return new URL(url.origin);
  } catch {
    return undefined;
  }
}

export function getSiteLink(path: string): string {
  const siteUrl = getSiteUrl();
  return siteUrl ? new URL(path, siteUrl).toString() : path;
}
