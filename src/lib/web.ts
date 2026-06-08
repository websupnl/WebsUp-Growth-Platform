// Haalt de zichtbare tekst van een website op, zodat de AI iets concreets heeft
// om te analyseren. Faalt het ophalen, dan redeneert de AI op basis van de URL.

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export async function fetchSiteText(
  url: string
): Promise<{ ok: boolean; text: string; title?: string }> {
  try {
    const res = await fetch(normalizeUrl(url), {
      headers: { "User-Agent": "WebsUp-Growth-Bot/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { ok: false, text: "" };
    const html = await res.text();

    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    return { ok: true, text, title };
  } catch {
    return { ok: false, text: "" };
  }
}
