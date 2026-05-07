export type BrandForDetection = {
  id: string;
  name: string;
  aliases: string[];
};

export type BrandDetection = {
  brandId: string;
  position: number;
  context: string;
  detectedVia: "exact" | "fuzzy" | "llm-extract";
};

type CandidateDetection = BrandDetection & {
  index: number;
};

export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getContext(text: string, index: number, length: number) {
  const start = Math.max(0, index - 140);
  const end = Math.min(text.length, index + length + 140);
  return text.slice(start, end).trim();
}

function levenshteinDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        (current[j - 1] ?? 0) + 1,
        (previous[j] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      );
    }

    for (let j = 0; j < previous.length; j += 1) {
      previous[j] = current[j] ?? 0;
    }
  }

  return previous[b.length] ?? 0;
}

function similarity(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(a, b) / maxLength;
}

function getTerms(brand: BrandForDetection) {
  return [brand.name, ...brand.aliases].map(normalizeText).filter(Boolean);
}

function findExactDetection(text: string, normalizedText: string, brand: BrandForDetection) {
  for (const term of getTerms(brand)) {
    const regex = new RegExp(`(^|[^a-z0-9])(${escapeRegExp(term)})(?=$|[^a-z0-9])`, "i");
    const match = regex.exec(normalizedText);

    if (match?.index !== undefined) {
      const prefixLength = match[1]?.length ?? 0;
      const index = match.index + prefixLength;
      return {
        brandId: brand.id,
        position: 0,
        context: getContext(text, index, term.length),
        detectedVia: "exact" as const,
        index,
      };
    }
  }

  return null;
}

function findFuzzyDetection(text: string, normalizedText: string, brand: BrandForDetection) {
  const tokens = Array.from(normalizedText.matchAll(/[a-z0-9]+/g));

  for (const term of getTerms(brand)) {
    const termTokens = term.split(/\s+/).filter(Boolean);
    const windowSize = Math.max(1, termTokens.length);

    for (let index = 0; index <= tokens.length - windowSize; index += 1) {
      const tokenWindow = tokens.slice(index, index + windowSize);
      const candidate = tokenWindow.map((token) => token[0]).join(" ");

      if (similarity(candidate, term) >= 0.85) {
        const matchIndex = tokenWindow[0]?.index ?? 0;
        return {
          brandId: brand.id,
          position: 0,
          context: getContext(text, matchIndex, candidate.length),
          detectedVia: "fuzzy" as const,
          index: matchIndex,
        };
      }
    }
  }

  return null;
}

export function detectBrands(text: string, brands: BrandForDetection[]) {
  const normalizedText = normalizeText(text);
  const detections: CandidateDetection[] = [];

  for (const brand of brands) {
    const exactDetection = findExactDetection(text, normalizedText, brand);
    const detection = exactDetection ?? findFuzzyDetection(text, normalizedText, brand);

    if (detection) {
      detections.push(detection);
    }
  }

  return detections
    .filter((detection): detection is CandidateDetection => Boolean(detection))
    .sort((a, b) => a.index - b.index)
    .map(({ index: _index, ...detection }, index) => ({
      ...detection,
      position: index + 1,
    }));
}
