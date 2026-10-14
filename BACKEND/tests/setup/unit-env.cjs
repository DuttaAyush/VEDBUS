'use strict';

const path = require('node:path');

process.env.NODE_ENV = 'test';
// This is intentionally unroutable. Unit tests must never obtain a usable DB
// URL from the shell or a developer .env file.
process.env.DATABASE_URL = 'postgresql://unit-only.invalid/yatrabus_unit';
process.env.JWT_ACCESS_SECRET = 'unit-only-access-secret-not-for-production';
process.env.JWT_REFRESH_SECRET = 'unit-only-refresh-secret-not-for-production';
process.env.REDIS_URL = '';
process.env.REDIS_TLS_URL = '';
// src/app imports dotenv/config. Point it at a deliberately absent path so a
// local .env cannot participate in unit test setup.
process.env.DOTENV_CONFIG_PATH = path.join(__dirname, '__disabled__.env');

jest.mock('dotenv/config', () => ({}));
jest.mock('dotenv', () => ({ config: () => ({ parsed: {} }), configDotenv: () => ({ parsed: {} }) }));
jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  PrismaClient: class {
    constructor() { throw new Error('Real PrismaClient is forbidden in unit tests. Mock src/prisma.'); }
  },
}));
jest.mock('ioredis', () => class {
  constructor() { throw new Error('Real Redis is forbidden in unit tests. Use a Redis mock.'); }
});
