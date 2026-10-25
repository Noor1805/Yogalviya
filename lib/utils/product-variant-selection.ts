export interface VariantSelectionVariation {
  id: string;
  attributes: Record<string, string>;
  image?: string;
  gallery?: string[];
}

type SelectedAttributeEntries = Array<[string, string]>;

export const isVisualAttribute = (name: string) => {
  const normalized = name.toLowerCase();
  return normalized.includes('color') || normalized.includes('colour') || normalized.includes('coat');
};

export const normalizeSelectedEntries = (
  selectedAttributes?: Record<string, string>
): SelectedAttributeEntries =>
  Object.entries(selectedAttributes ?? {}).filter(([, value]) => Boolean(value));

export const variationHasMedia = (variation: VariantSelectionVariation | null | undefined) =>
  !!variation?.image || (variation?.gallery?.some(Boolean) ?? false);

export const variationMediaScore = (variation: VariantSelectionVariation | null | undefined) =>
  (variation?.image ? 1 : 0) + (variation?.gallery?.filter(Boolean).length ?? 0);

export const variationMatchesEntries = <T extends VariantSelectionVariation>(
  variation: T,
  entries: SelectedAttributeEntries
) =>
  entries.every(([key, value]) => {
    const variationKey = Object.keys(variation.attributes).find(
      (attributeKey) => attributeKey.toLowerCase() === key.toLowerCase()
    );

    return (
      !!variationKey &&
      variation.attributes[variationKey]?.toString().toLowerCase() === value.toLowerCase()
    );
  });

export const findBestMatchingVariation = <T extends VariantSelectionVariation>(
  variations: T[] | undefined,
  selectedAttributes?: Record<string, string>
) => {
  const selectedEntries = normalizeSelectedEntries(selectedAttributes);

  if (!variations?.length || selectedEntries.length === 0) {
    return null;
  }

  return (
    variations
      .filter((variation) => variationMatchesEntries(variation, selectedEntries))
      .sort((a, b) => Object.keys(b.attributes).length - Object.keys(a.attributes).length)[0] || null
  );
};

export const findBestMediaVariation = <T extends VariantSelectionVariation>(
  variations: T[] | undefined,
  selectedAttributes?: Record<string, string>
) => {
  const selectedEntries = normalizeSelectedEntries(selectedAttributes);

  if (!variations?.length || selectedEntries.length === 0) {
    return null;
  }

  const mediaCandidates = variations.filter(variationHasMedia);
  const visualSelections = selectedEntries.filter(([key]) => isVisualAttribute(key));
  const matchedVariation = findBestMatchingVariation(variations, selectedAttributes);

  const findBestMediaMatch = (entries: SelectedAttributeEntries) => {
    if (entries.length === 0) return null;

    return (
      mediaCandidates
        .filter((variation) => variationMatchesEntries(variation, entries))
        .sort((a, b) => {
          const mediaScoreDiff = variationMediaScore(b) - variationMediaScore(a);
          if (mediaScoreDiff !== 0) {
            return mediaScoreDiff;
          }

          const aMatchesSelected = variationMatchesEntries(a, selectedEntries);
          const bMatchesSelected = variationMatchesEntries(b, selectedEntries);
          if (aMatchesSelected !== bMatchesSelected) {
            return bMatchesSelected ? 1 : -1;
          }

          if (matchedVariation?.id) {
            const aIsMatched = a.id === matchedVariation.id;
            const bIsMatched = b.id === matchedVariation.id;
            if (aIsMatched !== bIsMatched) {
              return bIsMatched ? 1 : -1;
            }
          }

          return Object.keys(b.attributes).length - Object.keys(a.attributes).length;
        })[0] || null
    );
  };

  const visualMediaVariation = findBestMediaMatch(visualSelections);
  if (visualMediaVariation) {
    return visualMediaVariation;
  }

  if (variationHasMedia(matchedVariation)) {
    return matchedVariation;
  }

  return findBestMediaMatch(selectedEntries) || null;
};

export const getPrimaryVariantImage = ({
  heroImage,
  mediaVariation,
  fallbackVariation,
}: {
  heroImage: string;
  mediaVariation: VariantSelectionVariation | null;
  fallbackVariation?: VariantSelectionVariation | null;
}) => {
  const imageCandidates = [
    mediaVariation?.image,
    ...(mediaVariation?.gallery || []),
    fallbackVariation?.image,
    ...(fallbackVariation?.gallery || []),
    heroImage,
  ].filter(Boolean) as string[];

  return [...new Set(imageCandidates)][0] || heroImage;
};

export const buildVariantImageSet = ({
  heroImage,
  images,
  mediaVariation,
}: {
  heroImage: string;
  images: string[];
  mediaVariation: VariantSelectionVariation | null;
}) => {
  const baseImages = [...new Set([heroImage, ...images].filter(Boolean))];
  const variationImages = [
    mediaVariation?.image,
    ...(mediaVariation?.gallery || []),
  ].filter(Boolean) as string[];
  const uniqueVariationImages = [...new Set(variationImages)];

  if (uniqueVariationImages.length > 0) {
    return uniqueVariationImages.slice(0, 4);
  }

  if (baseImages.length === 0 && heroImage) {
    baseImages.push(heroImage);
  }

  return baseImages.slice(0, 4);
};
