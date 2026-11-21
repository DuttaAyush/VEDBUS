import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import { app } from './app';

const PORT = Number(process.env.PORT) || 5035;

// ── Start Server ──────────────────────────────────────────────────
export const server = app.listen(PORT, () => {
  console.log(
    `[yatrabus-api] Server running → http://localhost:${PORT} | ENV: ${process.env.NODE_ENV || 'development'}`
  );
});

// ── Graceful shutdown (required for Railway/Render/Docker) ────────
let isShuttingDown = false;
const shutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[yatrabus-api] ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('[yatrabus-api] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

export default server;
