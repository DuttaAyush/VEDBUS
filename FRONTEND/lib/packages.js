import { allPackagesData } from '@/lib/data/packagesData';
import { apiFetch } from '@/lib/api';

export const PACKAGE_ALIAS_MAP = {
  // Spiritual aliases
  'varanasi-kashi': 'varanasi-kashi',
  'varanasi': 'varanasi-kashi',
  'kashi': 'varanasi-kashi',
  'kashi-ayodhya': 'kashi-ayodhya',
  'ayodhya-yatra': 'ayodhya-yatra',
  'ayodhya-ram-mandir': 'ayodhya-yatra',
  'ayodhya': 'ayodhya-yatra',
  'tirupati-yatra': 'tirupati-yatra',
  'tirupati-balaji': 'tirupati-yatra',
  'tirupati-south': 'tirupati-south',
  'tirupati': 'tirupati-yatra',
  'haridwar-rishikesh-yatra': 'haridwar-rishikesh-yatra',
  'haridwar-rishikesh': 'haridwar-rishikesh-yatra',
  'haridwar': 'haridwar-rishikesh-yatra',
  'rishikesh': 'haridwar-rishikesh-yatra',
  'chardham': 'chardham',
  'somnath-yatra': 'somnath-yatra',
  'somnath-dwarka': 'somnath-dwarka',
  'somnath': 'somnath-yatra',
  'vaishnodevi-yatra': 'vaishnodevi-yatra',
  'vaishno-devi-yatra': 'vaishnodevi-yatra',
  'vaishno-devi': 'vaishnodevi-yatra',
  'vaishnodevi': 'vaishnodevi-yatra',
  'shirdi-express': 'shirdi-express',
  'shirdi': 'shirdi-express',
  'maharashtra-5jyotirlinga': 'maharashtra-5jyotirlinga',
  'jyotirlinga': 'maharashtra-5jyotirlinga',

  // Domestic aliases
  'statue-of-unity': 'statue-of-unity',
  'statue': 'statue-of-unity',
  'jaipur-heritage': 'jaipur-heritage',
  'jaipur-royal': 'jaipur-heritage',
  'jaipur': 'jaipur-heritage',
  'kashmir-paradise': 'kashmir-paradise',
  'kashmir-valley': 'kashmir-paradise',
  'kashmir': 'kashmir-paradise',
  'munnar-kerala': 'munnar-kerala',
  'munnar-tea': 'munnar-kerala',
  'munnar': 'munnar-kerala',
  'kaziranga-wildlife': 'kaziranga-wildlife',
  'kaziranga-safari': 'kaziranga-wildlife',
  'kaziranga': 'kaziranga-wildlife',
  'ladakh-adventure': 'ladakh-adventure',
  'ladakh-expedition': 'ladakh-adventure',
  'ladakh': 'ladakh-adventure',
  'himachal-manali': 'himachal-manali',
  'himachal': 'himachal-manali',
  'kerala-backwaters': 'kerala-backwaters',
  'kerala': 'kerala-backwaters',
  'goa-coastal': 'goa-coastal',
  'goa': 'goa-coastal',
  'corbett-nainital': 'corbett-nainital',
  'corbett': 'corbett-nainital',

  // International aliases
  'dubai-combo': 'dubai-combo',
  'dubai-dunes': 'dubai-dunes',
  'dubai': 'dubai-dunes',
  'singapore-malaysia': 'singapore-malaysia',
  'singapore': 'singapore-malaysia',
  'thailand-holiday': 'thailand-holiday',
  'thailand': 'thailand-holiday',
  'bali-escape': 'bali-escape',
  'bali': 'bali-escape',
  'europe-wonders': 'europe-wonders',
  'europe': 'europe-wonders',
  'santorini': 'europe-wonders',

  // Fallbacks
  'default': 'varanasi-kashi',
};

// Maps website package ID to corresponding DB slug
export const WEBSITE_TO_DB_SLUG_MAP = {
  'varanasi-kashi': 'kashi-ayodhya',
  'ayodhya-yatra': 'kashi-ayodhya',
  'tirupati-yatra': 'tirupati-south',
  'haridwar-rishikesh-yatra': 'chardham',
  'somnath-yatra': 'somnath-dwarka',
  'vaishnodevi-yatra': 'chardham',
  'statue-of-unity': 'goa-coastal',
  'jaipur-heritage': 'corbett-nainital',
  'kashmir-paradise': 'himachal-manali',
  'munnar-kerala': 'kerala-backwaters',
  'kaziranga-wildlife': 'corbett-nainital',
  'ladakh-adventure': 'himachal-manali',
};

export function canonicalPackageId(rawId = '') {
  if (!rawId) return 'varanasi-kashi';
  const clean = String(rawId).trim().toLowerCase();
  return PACKAGE_ALIAS_MAP[clean] || clean;
}

export function getLocalPackage(requestedId = '') {
  const targetId = canonicalPackageId(requestedId);
  const found = allPackagesData[targetId] || allPackagesData['varanasi-kashi'] || Object.values(allPackagesData)[0];
  if (!found) return null;
  return normalizePackageRecord(found, targetId);
}

export function normalizePackageRecord(record, requestedId = '') {
  const source = record?.data?.package || record?.data || record?.package || record || {};
  const itinerary = source.itinerary && typeof source.itinerary === 'object' ? source.itinerary : {};
  const allowedAddons = Array.isArray(source.allowedAddons)
    ? source.allowedAddons
    : Array.isArray(source.addons)
      ? source.addons
      : [];

  const rawId = source.id || itinerary.id || requestedId || '';
  const price = Number(source.pricePerPerson ?? source.basePrice ?? 0);

  return {
    ...source,
    id: rawId,
    slug: source.slug || itinerary.id || requestedId || rawId,
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
    basePrice: price,
    addons: allowedAddons,
    itinerary: source.itinerary,
  };
}

export async function resolvePackage(requestedId = '') {
  const localPkg = getLocalPackage(requestedId);
  const targetId = canonicalPackageId(requestedId);
  const dbSlug = WEBSITE_TO_DB_SLUG_MAP[targetId] || targetId;

  // Try live API first if available, with dbSlug or targetId
  const tryIds = [targetId];
  if (dbSlug && dbSlug !== targetId) tryIds.push(dbSlug);

  for (const idToTry of tryIds) {
    try {
      const response = await apiFetch(`/api/packages/${encodeURIComponent(idToTry)}`);
      if (response && response.ok) {
        const data = await response.json();
        const live = normalizePackageRecord(data, targetId);
        if (live && live.title && live.basePrice > 0) {
          // If local data exists, merge local rich details (inclusions, addons) with live price
          if (localPkg) {
            return {
              ...localPkg,
              basePrice: live.basePrice || localPkg.basePrice,
              id: targetId,
              dbId: live.id,
              dbSlug: idToTry,
              addons: (live.addons && live.addons.length > 0) ? live.addons : localPkg.addons,
            };
          }
          return live;
        }
      }
    } catch {
      // Backend not running or endpoint not reached - ignore and try next or use fallback
    }
  }

  // Fallback to local package data
  return localPkg;
}

export function packageMatchesRequestedId(pkg, requestedId) {
  if (!pkg) return false;
  const canonical = canonicalPackageId(requestedId);
  return Boolean(pkg.id === requestedId || pkg.id === canonical || pkg.slug === requestedId || pkg.slug === canonical);
}
