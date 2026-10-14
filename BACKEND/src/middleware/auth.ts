import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { sendError } from '../utils/response';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!ACCESS_SECRET || !REFRESH_SECRET) throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required.');

export interface SessionIdentity { id: string; role: string; tokenVersion?: number; kind?: 'admin' | 'user' }
export interface AuthRequest extends Request { user?: SessionIdentity }

export const generateAccessToken = (id: string, role: string, tokenVersion = 0, kind?: 'admin' | 'user') =>
  jwt.sign({ id, role, tokenVersion, kind }, ACCESS_SECRET!, { expiresIn: '15m' });
export const generateRefreshToken = (id: string, role: string, tokenVersion = 0, kind?: 'admin' | 'user') =>
  jwt.sign({ id, role, tokenVersion, kind }, REFRESH_SECRET!, { expiresIn: '7d' });
export const verifyRefreshToken = (token: string) => jwt.verify(token, REFRESH_SECRET!) as SessionIdentity;

export async function resolveIdentity(payload: SessionIdentity) {
  if (!payload || typeof payload.id !== 'string') return null;
  const admin = payload.kind !== 'user' ? await prisma.admin.findUnique({ where: { id: payload.id } }) : null;
  const account = admin || (payload.kind !== 'admin' ? await prisma.user.findUnique({ where: { id: payload.id } }) : null);
  if (!account || !account.isActive || (payload.tokenVersion ?? -1) !== account.tokenVersion) return null;
  return { ...account, kind: (admin ? 'admin' : 'user') as 'admin' | 'user' };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.yatra_access;
  if (!token) { sendError(res, 'Authentication required.', 401); return; }
  let payload: SessionIdentity;
  try { payload = jwt.verify(token, ACCESS_SECRET!) as SessionIdentity; }
  catch { sendError(res, 'Invalid or expired access token.', 401); return; }
  try {
    const account = await resolveIdentity(payload);
    if (!account) { sendError(res, 'Session expired or account disabled.', 401); return; }
    req.user = { id: account.id, role: account.role, kind: account.kind, tokenVersion: account.tokenVersion };
    next();
  } catch { sendError(res, 'Authentication service unavailable.', 503); }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) { sendError(res, 'Access denied. Admins only.', 403); return; }
  next();
};
export const isSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'SUPER_ADMIN') { sendError(res, 'Access denied. Super Admins only.', 403); return; }
  next();
};
