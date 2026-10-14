import type Redis from 'ioredis';

const redisStore = new Map<string, string>();
let lastLuaScript = '';

jest.mock('ioredis', () => {
  return class MockRedis {
    private handlers = new Map<string, (...args: any[]) => void>();

    constructor(_url: string) {}

    on(event: string, handler: (...args: any[]) => void) {
      this.handlers.set(event, handler);
      return this;
    }

    async connect() {
      this.handlers.get('connect')?.();
      this.handlers.get('ready')?.();
    }

    async eval(script: string, keyCount: number, ...args: string[]) {
      lastLuaScript = script;
      const keys = args.slice(0, keyCount);
      const holder = args[keyCount];
      for (let index = 0; index < keys.length; index += 1) {
        const existing = redisStore.get(keys[index]);
        if (existing && existing !== holder) return index + 1;
      }
      for (const key of keys) redisStore.set(key, holder);
      return 0;
    }

    async scan(_cursor: string) {
      return ['0', Array.from(redisStore.keys())];
    }

    async mget(...keys: string[]) {
      return keys.map((key) => redisStore.get(key) || null);
    }
  } as unknown as typeof Redis;
});

describe('seat lock ownership regressions', () => {
  afterEach(() => {
    redisStore.clear();
    delete process.env.REDIS_URL;
    jest.resetModules();
  });

  it('allows only one concurrent in-memory owner for the same seat', async () => {
    delete process.env.REDIS_URL;
    const seatLock = await import('../../src/utils/seatLock');

    const results = await Promise.all([
      seatLock.tryHoldSeats('trip-memory', ['L1'], 'holder-a', 30),
      seatLock.tryHoldSeats('trip-memory', ['L1'], 'holder-b', 30),
    ]);

    expect(results.filter((result) => result.success)).toHaveLength(1);
    expect(results.filter((result) => !result.success)[0].conflictingSeats).toEqual(['L1']);
    expect(await seatLock.getHeldSeats('trip-memory')).toEqual(['L1']);
    await seatLock.releaseSeats('trip-memory', ['L1'], 'holder-a');
    await seatLock.releaseSeats('trip-memory', ['L1'], 'holder-b');
  });

  it('uses an atomic Redis Lua operation when Redis is configured', async () => {
    process.env.REDIS_URL = 'redis://unit-redis.invalid:6379';
    const seatLock = await import('../../src/utils/seatLock');

    const first = await seatLock.tryHoldSeats('trip-redis', ['L1'], 'holder-a', 30);
    const second = await seatLock.tryHoldSeats('trip-redis', ['L1'], 'holder-b', 30);

    expect(first.success).toBe(true);
    expect(second).toMatchObject({ success: false, conflictingSeats: ['L1'] });
    expect(lastLuaScript).toContain('for i = 1, #KEYS do');
    expect(lastLuaScript).toContain("redis.call('SET', KEYS[i]");
    await seatLock.releaseSeats('trip-redis', ['L1'], 'holder-a');
  });
});
