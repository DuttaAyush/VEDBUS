import { Response } from 'express';

/**
 * Standard success response envelope.
 * All routes must use this — never call res.json() directly.
 */
export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
) => {
  const payload: Record<string, unknown> = { success: true, message, data };
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (!(key in payload)) {
        payload[key] = value;
      }
    }
  }
  return res.status(statusCode).json(payload);
};

/**
 * Standard error response envelope.
 * All routes must use this — never call res.json({ error }) directly.
 */
export const sendError = (
  res: Response,
  message = 'Something went wrong.',
  statusCode = 500
) => {
  return res.status(statusCode).json({ success: false, message });
};
