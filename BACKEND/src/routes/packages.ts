import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const PACKAGE_SLUG_MAP: Record<string, string> = {
  // Spiritual aliases
  'varanasi-kashi': 'kashi-ayodhya',
  'varanasi': 'kashi-ayodhya',
  'kashi': 'kashi-ayodhya',
  'kashi-ayodhya': 'kashi-ayodhya',
  'ayodhya-yatra': 'kashi-ayodhya',
  'ayodhya-ram-mandir': 'kashi-ayodhya',
  'ayodhya': 'kashi-ayodhya',
  'tirupati-yatra': 'tirupati-south',
  'tirupati-balaji': 'tirupati-south',
  'tirupati-south': 'tirupati-south',
  'tirupati': 'tirupati-south',
  'haridwar-rishikesh-yatra': 'chardham',
  'haridwar-rishikesh': 'chardham',
  'haridwar': 'chardham',
  'chardham': 'chardham',
  'somnath-yatra': 'somnath-dwarka',
  'somnath-dwarka': 'somnath-dwarka',
  'somnath': 'somnath-dwarka',
  'vaishnodevi-yatra': 'chardham',
  'vaishno-devi-yatra': 'chardham',
  'vaishno-devi': 'chardham',
  'shirdi-express': 'shirdi-express',
  'shirdi': 'shirdi-express',
  'maharashtra-5jyotirlinga': 'maharashtra-5jyotirlinga',
  'jyotirlinga': 'maharashtra-5jyotirlinga',

  // Domestic aliases
  'statue-of-unity': 'goa-coastal',
  'statue': 'goa-coastal',
  'jaipur-heritage': 'corbett-nainital',
  'jaipur-royal': 'corbett-nainital',
  'jaipur': 'corbett-nainital',
  'kashmir-paradise': 'himachal-manali',
  'kashmir-valley': 'himachal-manali',
  'kashmir': 'himachal-manali',
  'munnar-kerala': 'kerala-backwaters',
  'munnar-tea': 'kerala-backwaters',
  'munnar': 'kerala-backwaters',
  'kaziranga-wildlife': 'corbett-nainital',
  'kaziranga-safari': 'corbett-nainital',
  'kaziranga': 'corbett-nainital',
  'ladakh-adventure': 'himachal-manali',
  'ladakh-expedition': 'himachal-manali',
  'ladakh': 'himachal-manali',
  'himachal-manali': 'himachal-manali',
  'kerala-backwaters': 'kerala-backwaters',
  'goa-coastal': 'goa-coastal',
  'corbett-nainital': 'corbett-nainital',

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
};

const ADDON_PRICES: Record<string, number> = {
  // Default and legacy
  heli: 3500, 'vip-pass': 999, 'ganga-aarti': 499, oxygen: 650,
  'private-boat': 1200, 'sugam-darshan': 600, 'ayodhya-guide': 800,
  'laddu-combo': 200, 'teertham-purohit': 950, 'uphill-suv': 2200,
  rudrabhishek: 1500, 'shirdi-vip': 500, 'ellora-caves': 750,
  'burj-prime': 4200, 'abu-dhabi': 2800, 'limo-transfer': 3500,
  'universal-express': 3200, 'night-safari': 1900, 'batu-caves': 1100,
  'floating-breakfast': 1400, 'nusa-penida': 2400, 'uluwatu-kecak': 1200,
  jungfrau: 9500, louvre: 2600, disneyland: 6800,
  catamaran: 1500, 'water-sports': 1200, scooter: 900,
  'houseboat-upgrade': 2500, kathakali: 450, 'spice-tour': 750,
  'rohtang-pass': 1800, paragliding: 2200, 'river-rafting': 1100,
  'extra-safari': 2800, 'nainital-ropeway': 400, 'jungle-bbq': 850,

  // New curated package add-ons
  'private-bajra': 1200, 'subah-banaras': 500, 'vip-darshan': 500, 'kanak-bhawan-pooja': 400,
  'laddu-box': 200, 'kalahasti-tour': 950, 'ganga-aarti-seat': 499, 'cable-car': 350,
  'neelkanth-suv': 750, 'viewing-gallery': 380, 'laser-show': 250, 'valley-flowers': 200,
  'laser-view': 350, 'amer-jeep': 450, 'chokhi-dhani': 900, 'city-palace-guide': 500,
  'shikara-ride': 600, 'gondola-phase1': 1100, 'pahalgam-pony': 850, 'tea-tasting': 350,
  'kathakali-show': 450, 'eravikulam-safari': 550, 'vip-darshan-somnath': 500, 'dwarka-boat': 600,
  'bhalka-teerth': 350, 'battery-car': 350, 'ropeway-bhairon': 100, 'special-aarti': 1100,
  'elephant-safari': 1800, 'jeep-safari-kaziranga': 2200, 'orchid-park': 400, 'camel-ride': 500,
  'monastery-guide': 650, 'rafting-zanskar': 1600,
};

const shape = (p: any) => {
  const it = typeof p.itinerary === 'object' && p.itinerary ? p.itinerary : {};
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    durationDays: p.durationDays,
    pricePerPerson: Number(p.pricePerPerson),
    price: `₹${Number(p.pricePerPerson).toLocaleString('en-IN')}`,
    isActive: p.isActive,
    ...it,
  };
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const where: any = { isActive: true };
    if (category) where.category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const packages = await prisma.tourPackage.findMany({ where, orderBy: { pricePerPerson: 'asc' } });
    return res.status(200).json(packages.map(shape));
  } catch {
    return sendError(res, 'Failed to fetch packages.', 503);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rawId = String(req.params.id);
    const mappedSlug = PACKAGE_SLUG_MAP[rawId] || rawId;

    const pkg = await prisma.tourPackage.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id: mappedSlug },
          { itinerary: { path: ['id'], equals: rawId } },
          { itinerary: { path: ['id'], equals: mappedSlug } },
          { title: { contains: rawId, mode: 'insensitive' } },
        ],
      },
    });

    if (!pkg) return sendError(res, 'Package not found.', 404);
    return res.status(200).json(shape(pkg));
  } catch {
    return sendError(res, 'Failed to fetch package.', 503);
  }
});

router.post('/book', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.kind !== 'user') return sendError(res, 'Use a customer account to book.', 403);
    const { packageId, travelersCount, travelDate, totalAmount, travelers, contact, options, requestKey } = req.body;
    if (!packageId || !requestKey || !Number.isInteger(Number(travelersCount)) || Number(travelersCount) < 1 || Number(travelersCount) > 10) {
      return sendError(res, 'packageId, requestKey and a valid travelersCount are required.', 400);
    }
    if (!Array.isArray(travelers) || travelers.length !== Number(travelersCount) || travelers.some((p: any) => !p?.name?.trim() || !Number.isInteger(Number(p.age)) || Number(p.age) < 1 || Number(p.age) > 120)) {
      return sendError(res, 'Valid traveler details are required for every traveler.', 400);
    }
    if (!contact?.email || !contact?.phone) return sendError(res, 'Contact details are required.', 400);

    const rawPackageId = String(packageId);
    const mappedSlug = PACKAGE_SLUG_MAP[rawPackageId] || rawPackageId;

    const [pkg, user] = await Promise.all([
      prisma.tourPackage.findFirst({
        where: {
          isActive: true,
          OR: [
            { id: rawPackageId },
            { id: mappedSlug },
            { itinerary: { path: ['id'], equals: rawPackageId } },
            { itinerary: { path: ['id'], equals: mappedSlug } },
            { title: { contains: rawPackageId, mode: 'insensitive' } },
          ],
        },
      }),
      prisma.user.findUnique({ where: { id: req.user!.id } }),
    ]);

    if (!pkg) return sendError(res, 'This package is no longer available. Please choose another package.', 409);
    if (!user || !user.isActive) return sendError(res, 'Authenticated user account not found or disabled.', 403);
    const parsedDate = new Date(travelDate);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) return sendError(res, 'A future travel date is required.', 400);

    const optionData = options || {};
    const hotelUpgrade = optionData.hotelUpgrade === '5star' ? 9500 : optionData.hotelUpgrade === '4star' ? 4500 : 0;
    const transportUpgrade = optionData.transportMode === 'private-suv' ? 8000 : optionData.transportMode === 'private-sedan' ? 5000 : 0;
    const addonTotal = Array.isArray(optionData.selectedAddons)
      ? optionData.selectedAddons.reduce((sum: number, addon: any) => sum + (ADDON_PRICES[String(addon?.id)] || 0), 0)
      : 0;

    const perPerson = Number(pkg.pricePerPerson) + hotelUpgrade + addonTotal;
    const subtotal = perPerson * Number(travelersCount) + transportUpgrade + (optionData.includeTravelInsurance ? 299 * Number(travelersCount) : 0) + (optionData.includeAirportTransfer ? 999 : 0);
    const serverAmount = subtotal + Math.round(subtotal * 0.05);

    if (Math.abs(Number(totalAmount) - serverAmount) > 0.01) {
      return sendError(res, 'Package price changed. Please restart checkout.', 409);
    }

    const booking = await prisma.packageBooking.create({
      data: {
        id: `PB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: req.user!.id,
        packageId: pkg.id,
        travelersCount: Number(travelersCount),
        travelDate: parsedDate,
        totalAmount: serverAmount,
        status: 'Pending',
        travelers,
        contact,
        options: options || {},
        requestKey: `${req.user!.id}:${String(requestKey)}`,
      },
    });

    return sendSuccess(res, { booking }, 'Booking request saved. Awaiting operator confirmation; no payment collected.', 201);
  } catch (err: any) {
    return sendError(res, err.code === 'P2002' ? 'This checkout request has already been submitted.' : 'Failed to create booking.', err.code === 'P2002' ? 409 : 503);
  }
});

export default router;
