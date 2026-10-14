import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();
const ADDON_PRICES: Record<string, number> = {
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
};
const shape = (p: any) => {
  const it = typeof p.itinerary === 'object' && p.itinerary ? p.itinerary : {};
  return { id: p.id, title: p.title, category: p.category, durationDays: p.durationDays, pricePerPerson: Number(p.pricePerPerson), price: `₹${Number(p.pricePerPerson).toLocaleString('en-IN')}`, isActive: p.isActive, ...it };
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const where: any = { isActive: true };
    if (category) where.category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const packages = await prisma.tourPackage.findMany({ where, orderBy: { pricePerPerson: 'asc' } });
    return res.status(200).json(packages.map(shape));
  } catch { return sendError(res, 'Failed to fetch packages.', 503); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const pkg = await prisma.tourPackage.findFirst({ where: { OR: [{ id }, { itinerary: { path: ['id'], equals: id } }] } });
    if (!pkg) return sendError(res, 'Package not found.', 404);
    return res.status(200).json(shape(pkg));
  } catch { return sendError(res, 'Failed to fetch package.', 503); }
});

router.post('/book', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.kind !== 'user') return sendError(res, 'Use a customer account to book.', 403);
    const { packageId, travelersCount, travelDate, totalAmount, travelers, contact, options, requestKey } = req.body;
    if (!packageId || !requestKey || !Number.isInteger(Number(travelersCount)) || Number(travelersCount) < 1 || Number(travelersCount) > 10) return sendError(res, 'packageId, requestKey and a valid travelersCount are required.', 400);
    if (!Array.isArray(travelers) || travelers.length !== Number(travelersCount) || travelers.some((p: any) => !p?.name?.trim() || !Number.isInteger(Number(p.age)) || Number(p.age) < 1 || Number(p.age) > 120)) return sendError(res, 'Valid traveler details are required for every traveler.', 400);
    if (!contact?.email || !contact?.phone) return sendError(res, 'Contact details are required.', 400);
    const [pkg, user] = await Promise.all([
      prisma.tourPackage.findFirst({
        where: {
          isActive: true,
          OR: [
            { id: String(packageId) },
            { itinerary: { path: ['id'], equals: String(packageId) } },
            { title: { contains: String(packageId), mode: 'insensitive' } },
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
    if (Math.abs(Number(totalAmount) - serverAmount) > 0.01) return sendError(res, 'Package price changed. Please restart checkout.', 409);
    const booking = await prisma.packageBooking.create({ data: { id: `PB-${Date.now()}-${Math.floor(Math.random() * 1000)}`, userId: req.user!.id, packageId: pkg.id, travelersCount: Number(travelersCount), travelDate: parsedDate, totalAmount: serverAmount, status: 'Pending', travelers, contact, options: options || {}, requestKey: `${req.user!.id}:${String(requestKey)}` } });
    return sendSuccess(res, { booking }, 'Booking request saved. Awaiting operator confirmation; no payment collected.', 201);
  } catch (err: any) { return sendError(res, err.code === 'P2002' ? 'This checkout request has already been submitted.' : 'Failed to create booking.', err.code === 'P2002' ? 409 : 503); }
});

export default router;
