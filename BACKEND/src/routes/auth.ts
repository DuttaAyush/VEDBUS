import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest, generateAccessToken, generateRefreshToken, resolveIdentity, verifyRefreshToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };

interface AdminOtpEntry {
  otp: string;
  expiresAt: number;
  adminType: 'SUPER_ADMIN' | 'ADMIN';
}

// In-memory OTP storage for admin verification (5-minute TTL)
const adminOtpStore = new Map<string, AdminOtpEntry>();

function issueSession(res: Response, account: any, kind: 'admin' | 'user') {
  const accessToken = generateAccessToken(account.id, account.role, account.tokenVersion, kind);
  const refreshToken = generateRefreshToken(account.id, account.role, account.tokenVersion, kind);
  res.cookie('yatra_access', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('yatra_refresh', refreshToken, { ...cookieOptions, maxAge: 7 * 86400000 });
  const { id, name, email, phone, role } = account;
  return { accessToken, user: { id, name, email, phone, role } };
}

// Ensure the single Super Admin configured in .env exists in prisma.admin table
export async function ensureSuperAdminAccount() {
  const superEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@yatrabus.in').trim().toLowerCase();
  const superPass = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecretPassword@2026';
  let admin = await prisma.admin.findUnique({ where: { email: superEmail } });
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: superEmail,
        phone: '+919999988888',
        passwordHash: await bcrypt.hash(superPass, 12),
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });
  } else if (admin.role !== 'SUPER_ADMIN' || !admin.isActive) {
    admin = await prisma.admin.update({
      where: { id: admin.id },
      data: { role: 'SUPER_ADMIN', isActive: true }
    });
  }
  return admin;
}

// ── Request Admin OTP (Logged to Server Console) ──────────────────
router.post('/admin-otp', async (req, res) => {
  const { email, password, adminType } = req.body;
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return sendError(res, 'Email and password are required to request an OTP.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@yatrabus.in').trim().toLowerCase();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecretPassword@2026';

  const type = (adminType === 'SUPER_ADMIN' || normalizedEmail === superAdminEmail) ? 'SUPER_ADMIN' : 'ADMIN';

  if (type === 'SUPER_ADMIN') {
    if (normalizedEmail !== superAdminEmail || password !== superAdminPassword) {
      return sendError(res, 'Invalid Super Admin credentials.', 401);
    }
  } else {
    const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) {
      return sendError(res, 'Invalid administrator credentials.', 401);
    }
    if (!admin.isActive) {
      return sendError(res, 'Administrator account is deactivated.', 403);
    }
  }

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  adminOtpStore.set(normalizedEmail, {
    otp: otpCode,
    expiresAt: Date.now() + 5 * 60 * 1000,
    adminType: type,
  });

  // Log prominently to backend server console
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║               🔑 YATRABUS ADMIN VERIFICATION OTP                 ║');
  console.log('╠═══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Admin Role  : ${type === 'SUPER_ADMIN' ? 'SUPER ADMIN (ROOT)' : 'STAFF ADMIN'}`.padEnd(68) + '║');
  console.log(`║  Email       : ${normalizedEmail}`.padEnd(68) + '║');
  console.log(`║  OTP Code    : >>> ${otpCode} <<<`.padEnd(68) + '║');
  console.log(`║  Valid For   : 5 Minutes`.padEnd(68) + '║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  return sendSuccess(res, { email: normalizedEmail }, 'OTP generated successfully. Check server console for the code.');
});

// ── Customer Registration ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (![name, email, phone, password].every(v => typeof v === 'string' && v.trim())) return sendError(res, 'name, email, phone, and password are required.', 400);
  if (password.length < 8) return sendError(res, 'Password must be at least 8 characters.', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 'Invalid email.', 400);
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({ where: { OR: [{ email: normalizedEmail }, { phone: phone.trim() }] } });
    const admin = await prisma.admin.findFirst({ where: { OR: [{ email: normalizedEmail }, { phone: phone.trim() }] } });
    if (existing || admin) return sendError(res, 'An account with this email or phone already exists.', 409);
    const user = await prisma.user.create({ data: { name: name.trim(), email: normalizedEmail, phone: phone.trim(), passwordHash: await bcrypt.hash(password, 12) } });
    return sendSuccess(res, issueSession(res, user, 'user'), 'Account created successfully.', 201);
  } catch (err: any) { return sendError(res, err.code === 'P2002' ? 'Account already exists.' : 'Unable to register.', err.code === 'P2002' ? 409 : 503); }
});

// ── Authentication Login ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, phone, password, otp, adminType } = req.body;
  const raw = email || phone;
  if (typeof raw !== 'string' || !raw.trim() || typeof password !== 'string' || !password) {
    return sendError(res, 'Email or phone and password are required.', 400);
  }

  const identifier = raw.trim();
  const normalizedEmail = identifier.toLowerCase();
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@yatrabus.in').trim().toLowerCase();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecretPassword@2026';

  const isSuperAdminLogin = adminType === 'SUPER_ADMIN' || normalizedEmail === superAdminEmail;

  // 1. Super Admin Login
  if (isSuperAdminLogin) {
    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return sendError(res, 'OTP verification code is required for Super Admin login.', 400);
    }
    if (normalizedEmail !== superAdminEmail || password !== superAdminPassword) {
      return sendError(res, 'Invalid Super Admin credentials.', 401);
    }
    const stored = adminOtpStore.get(normalizedEmail);
    if (!stored || stored.otp !== otp.trim() || Date.now() > stored.expiresAt) {
      return sendError(res, 'Invalid or expired OTP code. Please request a new OTP.', 400);
    }
    adminOtpStore.delete(normalizedEmail);

    const superAdmin = await ensureSuperAdminAccount();
    return sendSuccess(res, issueSession(res, superAdmin, 'admin'), 'Super Admin login successful.');
  }

  // 2. Staff Admin Login
  if (adminType === 'ADMIN') {
    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      return sendError(res, 'OTP verification code is required for Admin login.', 400);
    }
    const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) {
      return sendError(res, 'Invalid administrator credentials.', 401);
    }
    if (!admin.isActive) {
      return sendError(res, 'Administrator account is deactivated.', 403);
    }
    const stored = adminOtpStore.get(normalizedEmail);
    if (!stored || stored.otp !== otp.trim() || Date.now() > stored.expiresAt) {
      return sendError(res, 'Invalid or expired OTP code. Please request a new OTP.', 400);
    }
    adminOtpStore.delete(normalizedEmail);
    return sendSuccess(res, issueSession(res, admin, 'admin'), 'Administrator login successful.');
  }

  // 3. Fallback / Customer Portal Login
  const where = { OR: [{ email: normalizedEmail }, { phone: identifier }, { phone: `+91${identifier}` }, { phone: `+91 ${identifier}` }] };
  try {
    // If OTP provided for admin
    if (otp && typeof otp === 'string' && adminOtpStore.has(normalizedEmail)) {
      const stored = adminOtpStore.get(normalizedEmail);
      if (stored && stored.otp === otp.trim() && Date.now() <= stored.expiresAt) {
        adminOtpStore.delete(normalizedEmail);
        const admin = await prisma.admin.findFirst({ where: { email: normalizedEmail } });
        if (admin && await bcrypt.compare(password, admin.passwordHash) && admin.isActive) {
          return sendSuccess(res, issueSession(res, admin, 'admin'), 'Login successful.');
        }
      }
    }

    const admin = await prisma.admin.findFirst({ where });
    const account = admin || await prisma.user.findFirst({ where });
    if (!account || !await bcrypt.compare(password, account.passwordHash)) return sendError(res, 'Invalid credentials.', 401);
    if (!account.isActive) return sendError(res, 'Account disabled.', 403);
    return sendSuccess(res, issueSession(res, account, admin ? 'admin' : 'user'), 'Login successful.');
  } catch {
    return sendError(res, 'Authentication service unavailable.', 503);
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res) => {
  const account = await resolveIdentity(req.user!);
  if (!account) return sendError(res, 'Session expired.', 401);
  const { id, name, email, phone, role } = account;
  return sendSuccess(res, { id, name, email, phone, role });
});

router.post('/request-otp', (_req, res) => sendError(res, 'Mobile OTP service is not configured. Use email and password.', 503));

router.patch('/account', authenticateJWT, async (req: AuthRequest, res) => {
  const { name, currentPassword, password } = req.body;
  const account = await resolveIdentity(req.user!);
  if (!account) return sendError(res, 'Session expired.', 401);
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) return sendError(res, 'Password must be at least 8 characters.', 400);
  if (password && (typeof currentPassword !== 'string' || !await bcrypt.compare(currentPassword, account.passwordHash))) return sendError(res, 'Current password is incorrect.', 400);
  const data = { ...(typeof name === 'string' && name.trim() ? { name: name.trim() } : {}), ...(password ? { passwordHash: await bcrypt.hash(password, 12), tokenVersion: { increment: 1 } } : {}) };
  const updated = account.kind === 'admin' ? await prisma.admin.update({ where: { id: account.id }, data }) : await prisma.user.update({ where: { id: account.id }, data });
  return sendSuccess(res, issueSession(res, updated, account.kind), 'Account updated.');
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.yatra_refresh;
    if (!token) return sendError(res, 'Refresh token missing.', 401);
    const account = await resolveIdentity(verifyRefreshToken(token));
    if (!account) return sendError(res, 'Session expired or account disabled.', 401);
    return sendSuccess(res, issueSession(res, account, account.kind), 'Session refreshed.');
  } catch { return sendError(res, 'Unable to refresh session.', 401); }
});

router.post('/logout', async (req, res) => {
  try {
    if (req.cookies?.yatra_refresh) {
      const identity = verifyRefreshToken(req.cookies.yatra_refresh);
      const account = await resolveIdentity(identity);
      if (account?.kind === 'admin') await prisma.admin.update({ where: { id: account.id }, data: { tokenVersion: { increment: 1 } } });
      if (account?.kind === 'user') await prisma.user.update({ where: { id: account.id }, data: { tokenVersion: { increment: 1 } } });
    }
  } catch { /* Always clear the browser cookies, including expired sessions. */ }
  for (const name of ['yatra_access', 'yatra_refresh', 'vedbus_access', 'vedbus_refresh']) res.clearCookie(name, cookieOptions);
  return sendSuccess(res, null, 'Logged out successfully.');
});

router.post('/forgot-password', (_req, res) => sendError(res, 'Email password reset is not configured. Please contact support.', 503));
export default router;
