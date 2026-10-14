require('../../scripts/test-env.cjs').configure();
jest.mock('dotenv/config', () => ({}));
jest.mock('dotenv', () => ({ config: () => ({ parsed: {} }), configDotenv: () => ({ parsed: {} }) }));

// Keep real Redis behavior, tracking handles only for suite teardown.
global.__integrationRedisClients = [];
jest.mock('ioredis', () => {
  const Redis = jest.requireActual('ioredis');
  return class TrackedRedis extends Redis {
    constructor(...args) {
      super(...args);
      global.__integrationRedisClients.push(this);
    }
  };
});
