const SITE_URL = "https://apikeychain.dev";

/** Minimal JSON-LD value type — no external schema library required. */
type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

interface JsonLdDocument {
  "@context": "https://schema.org";
  "@graph": Record<string, JsonLdValue>[];
}

/**
 * Site-wide JSON-LD structured data injected once from the root layout.
 *
 * Uses a single `@graph` so the Organization, WebSite and SoftwareApplication
 * nodes are emitted in one script tag. Content here is intentionally distinct
 * from the Next.js `metadata` object (title/description/OG) — this describes the
 * entities for search engines rather than the page's social/preview metadata.
 */
const structuredData: JsonLdDocument = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "API Keychain",
      url: SITE_URL,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "API Keychain",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      // SearchAction intentionally omitted — no /search page exists yet.
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "API Keychain",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description:
        "One API key for every free AI model. API Keychain unifies Gemini, Groq, Cerebras, Mistral, DeepSeek and more behind a single OpenAI-compatible endpoint with automatic failover.",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "USD",
      },
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
