import type { LlmCitation } from "./types";

export function dedupeCitations(citations: LlmCitation[]) {
  const seen = new Set<string>();

  return citations.filter((citation) => {
    if (seen.has(citation.url)) {
      return false;
    }

    seen.add(citation.url);
    return true;
  });
}

export function getDomainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}
