export type SovMention = {
  brandId: string;
  position: number | null;
};

export function calculateShareOfVoice(mentions: SovMention[], brandId: string) {
  if (mentions.length === 0) {
    return 0;
  }

  const brandMentions = mentions.filter((mention) => mention.brandId === brandId).length;
  return (brandMentions / mentions.length) * 100;
}

export function calculateWeightedShareOfVoice(mentions: SovMention[], brandId: string) {
  const totalWeight = mentions.reduce(
    (sum, mention) => sum + 1 / Math.max(mention.position ?? 1, 1),
    0,
  );

  if (totalWeight === 0) {
    return 0;
  }

  const brandWeight = mentions
    .filter((mention) => mention.brandId === brandId)
    .reduce((sum, mention) => sum + 1 / Math.max(mention.position ?? 1, 1), 0);

  return (brandWeight / totalWeight) * 100;
}
