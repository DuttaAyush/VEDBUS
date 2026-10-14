export function normalizePackageRecord(record, requestedId = '') {
  const source = record?.data?.package || record?.data || record?.package || record || {};
  const itinerary = source.itinerary && typeof source.itinerary === 'object' ? source.itinerary : {};
  const allowedAddons = Array.isArray(source.allowedAddons)
    ? source.allowedAddons
    : Array.isArray(source.addons)
      ? source.addons
      : [];

  return {
    ...source,
    id: source.id || '',
    slug: source.slug || itinerary.id || requestedId,
    title: source.title || itinerary.title || '',
    subtitle: source.subtitle || itinerary.subtitle || itinerary.destinations || '',
    destinations: source.destinations || itinerary.destinations || itinerary.subtitle || '',
    duration: source.duration || itinerary.duration || (source.durationDays ? `${source.durationDays} Days` : ''),
    image: source.image || itinerary.image || '',
    category: source.category || '',
    badge: source.badge || itinerary.badge || '',
    badgeColor: source.badgeColor || itinerary.badgeColor || '',
    description: source.description || itinerary.description || '',
    inclusions: source.inclusions || itinerary.inclusions || itinerary.highlights || [],
    basePrice: Number(source.pricePerPerson ?? source.basePrice ?? 0),
    addons: allowedAddons,
    itinerary: source.itinerary,
  };
}

export function packageMatchesRequestedId(pkg, requestedId) {
  return Boolean(pkg?.id && (pkg.id === requestedId || pkg.slug === requestedId));
}
