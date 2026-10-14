'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');
const process = require('node:process');

const TEST_DATABASE_NAME_PATTERN = /^yatrabus_test(?:[._-][a-z0-9]+)*$/i;

function validateEnvironment(env) {
  const databaseUrl = env.TEST_DATABASE_URL;
  const databaseName = env.TEST_DATABASE_NAME;

  if (!databaseUrl) {
    throw new Error('Integration tests require TEST_DATABASE_URL; DATABASE_URL is never used as a fallback.');
  }
  if (env.TEST_DATABASE_ISOLATED !== 'true') {
    throw new Error('Integration tests require TEST_DATABASE_ISOLATED=true.');
  }
  if (!databaseName || !TEST_DATABASE_NAME_PATTERN.test(databaseName)) {
    throw new Error('TEST_DATABASE_NAME must be a dedicated name matching yatrabus_test[_-suffix].');
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid PostgreSQL URL.');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('TEST_DATABASE_URL must use PostgreSQL.');
  }
  const urlDatabaseName = decodeURIComponent(parsed.pathname.replace(/^\//, '').split('?')[0]);
  if (urlDatabaseName !== databaseName) {
    throw new Error('TEST_DATABASE_URL must target the dedicated TEST_DATABASE_NAME.');
  }
  if ([...parsed.searchParams.keys()].some(key => !['schema', 'sslmode', 'connect_timeout', 'connection_limit'].includes(key))) {
    throw new Error('TEST_DATABASE_URL contains unsupported connection overrides.');
  }
  if (parsed.searchParams.has('schema') && parsed.searchParams.get('schema') !== 'public') {
    throw new Error('Integration tests require the public schema in their dedicated database.');
  }
  return databaseUrl;
}

function configure() {
  const databaseUrl = validateEnvironment(process.env);
  // The application and Prisma use DATABASE_URL. It is derived only from the
  // explicitly marked test URL after all isolation checks have passed.
  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = 'test';
  process.env.DOTENV_CONFIG_PATH = path.join(__dirname, '__disabled__.env');
  process.env.JWT_ACCESS_SECRET = 'integration-only-access-secret-not-for-production';
  process.env.JWT_REFRESH_SECRET = 'integration-only-refresh-secret-not-for-production';
  delete process.env.REDIS_URL;
  delete process.env.REDIS_TLS_URL;
  if (process.env.TEST_REDIS_URL) {
    const redis = new URL(process.env.TEST_REDIS_URL);
    if (!['redis:', 'rediss:'].includes(redis.protocol) ||
        !['localhost', '127.0.0.1', '[::1]'].includes(redis.hostname) ||
        redis.pathname !== '/15' || redis.search || process.env.TEST_REDIS_ISOLATED !== 'true') {
      throw new Error('TEST_REDIS_URL requires a disposable local Redis service, database /15, and TEST_REDIS_ISOLATED=true.');
    }
    process.env.REDIS_URL = process.env.TEST_REDIS_URL;
  }
  return databaseUrl;
}

function disableDotenv() {
  // Prisma CLI calls dotenv directly. Prevent file reads as well as overrides.
  const dotenv = require('dotenv');
  dotenv.config = dotenv.configDotenv = () => ({ parsed: {} });
}

if (require.main === module) {
  try {
    configure();
  } catch (error) {
    console.error(`[test-env] ${error.message}`);
    process.exit(1);
  }

  const migrate = process.argv[2] === '--migrate';
  if (migrate) process.env.YATRABUS_TEST_PRISMA_PRELOAD = 'true';
  const args = migrate
    ? ['--require', __filename, require.resolve('prisma/build/index.js'), 'migrate', 'deploy']
    : [require.resolve('jest/bin/jest.js'), '--selectProjects', 'integration', '--runInBand', '--detectOpenHandles', ...process.argv.slice(2)];
  const result = spawnSync(process.execPath, args, {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    stdio: 'inherit',
  });
  process.exit(result.status === null ? 1 : result.status);
}

if (require.main !== module && process.env.YATRABUS_TEST_PRISMA_PRELOAD === 'true') {
  configure();
  disableDotenv();
}

module.exports = { configure, validateEnvironment, disableDotenv };
