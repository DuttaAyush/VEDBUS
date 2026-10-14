import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma';
import { isSuperAdmin, authenticateJWT, AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
router.use(authenticateJWT, isSuperAdmin);

const select = { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true } as const;

export async function ensureSuperAdminInDb() {
  const superEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@yatrabus.in').trim().toLowerCase();
  const superPass = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecretPassword@2026';
  const existing = await prisma.admin.findUnique({ where: { email: superEmail } });
  if (!existing) {
    await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: superEmail,
        phone: '+919999988888',
        passwordHash: await bcrypt.hash(superPass, 12),
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });
  } else if (existing.role !== 'SUPER_ADMIN' || !existing.isActive) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: { role: 'SUPER_ADMIN', isActive: true }
    });
  }
}

// ── GET /api/admin/admins (Super Admin only) ─────────────────────────
router.get('/', async (_req, res) => {
  try {
    await ensureSuperAdminInDb();
    const admins = await prisma.admin.findMany({ select, orderBy: { createdAt: 'asc' } });
    return sendSuccess(res, admins);
  } catch {
    return sendError(res, 'Failed to fetch admin list.', 503);
  }
});

// ── POST /api/admin/admins (Create Admin - Super Admin only) ─────────
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'ADMIN' } = req.body;
    if (![name, email, password].every(v => typeof v === 'string' && v.trim())) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters.', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = typeof phone === 'string' && phone.trim() ? phone.trim() : null;

    const existing = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ]
      }
    });
    if (existing) {
      return sendError(res, 'An admin account with this email or phone already exists.', 409);
    }

    const assignedRole = role === 'SUPER_ADMIN' ? 'ADMIN' : (role === 'ADMIN' ? 'ADMIN' : 'ADMIN');
    const admin = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash: await bcrypt.hash(password, 12),
        role: assignedRole,
        isActive: true,
      },
      select,
    });
    return sendSuccess(res, admin, 'Admin account created successfully.', 201);
  } catch {
    return sendError(res, 'Failed to create admin.', 503);
  }
});

// ── PATCH /api/admin/admins/:id (Edit Admin / Reset Password) ─────────
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const target = await prisma.admin.findUnique({ where: { id } });
    if (!target) return sendError(res, 'Admin not found.', 404);

    const superEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@yatrabus.in').trim().toLowerCase();
    const isTargetSuper = target.role === 'SUPER_ADMIN' || target.email.toLowerCase() === superEmail;

    const { name, email, phone, password, role } = req.body;
    if (password && password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters.', 400);
    }

    if (isTargetSuper && role && role !== 'SUPER_ADMIN') {
      return sendError(res, 'Super Admin role cannot be demoted.', 403);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(!isTargetSuper && email?.trim() ? { email: email.trim().toLowerCase() } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(!isTargetSuper && role && ['ADMIN', 'SUPER_ADMIN'].includes(role) ? { role } : {}),
        ...(password ? { passwordHash: await bcrypt.hash(password, 12), tokenVersion: { increment: 1 } } : {})
      },
      select,
    });
    return sendSuccess(res, updated, 'Admin updated successfully.');
  } catch (err: any) {
    return sendError(res, err.code === 'P2002' ? 'Email or phone is already in use.' : 'Failed to update admin.', err.code === 'P2002' ? 409 : 503);
  }
});

// ── PATCH /api/admin/admins/:id/toggle (Enable/Disable Admin) ─────────
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = String(req.params.id);
    const target = await prisma.admin.findUnique({ where: { id } });
    if (!target) return sendError(res, 'Admin not found.', 404);
    if (target.role === 'SUPER_ADMIN') return sendError(res, 'Cannot disable a Super Admin account.', 403);

    const updated = await prisma.admin.update({
      where: { id },
      data: { isActive: !target.isActive, tokenVersion: { increment: 1 } },
      select,
    });
    return sendSuccess(res, updated, updated.isActive ? 'Admin account enabled.' : 'Admin account disabled.');
  } catch {
    return sendError(res, 'Failed to toggle admin status.', 503);
  }
});

// ── DELETE /api/admin/admins/:id (Delete Admin) ──────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const target = await prisma.admin.findUnique({ where: { id } });
    if (!target) return sendError(res, 'Admin not found.', 404);
    if (target.role === 'SUPER_ADMIN') return sendError(res, 'Super Admin accounts cannot be deleted.', 403);

    await prisma.admin.delete({ where: { id } });
    return sendSuccess(res, { id }, 'Admin deleted successfully.');
  } catch {
    return sendError(res, 'Failed to delete admin.', 503);
  }
});

export default router;
