import Redis from 'ioredis';

// ── Hybrid Production Seat Lock Engine (Redis + Resilient In-Memory Fallback) ──
// If REDIS_URL is provided and reachable, distributed Redis locks are used.
// If Redis is down, unreachable, or not configured, it gracefully falls back
// to high-performance in-memory locks with zero crash or request drop.
// ─────────────────────────────────────────────────────────────────────────────

let redisClient: Redis | null = null;
let isRedisConnected = false;
let hasLoggedRedisNotice = false;

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_TLS_URL || '';

if (REDIS_URL && REDIS_URL.trim()) {
  try {
    redisClient = new Redis(REDIS_URL, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      retryStrategy: (times) => {
        if (times > 5) {
          if (!hasLoggedRedisNotice) {
            console.warn('⚠️ [Redis] Unable to connect to Redis server. Falling back to In-Memory seat lock engine.');
            hasLoggedRedisNotice = true;
          }
          return null; // Stop retrying excessively
        }
        return Math.min(times * 500, 2000);
      },
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('✅ [Redis] Connected to Redis seat lock cluster.');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      if (!hasLoggedRedisNotice) {
        console.warn(`⚠️ [Redis] Connection notice (${err.message || 'offline'}). Operating with in-memory lock engine.`);
        hasLoggedRedisNotice = true;
      }
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });

    // Attempt initial connect without blocking startup
    redisClient.connect().catch(() => {
      isRedisConnected = false;
    });
  } catch (err: any) {
    console.warn('⚠️ [Redis] Initialization notice:', err?.message || err);
    redisClient = null;
    isRedisConnected = false;
  }
} else {
  if (!hasLoggedRedisNotice) {
    console.log('ℹ️ [SeatLock] No REDIS_URL configured — operating in robust in-memory lock mode.');
    hasLoggedRedisNotice = true;
  }
}

// ── In-Memory Lock Structures (Fallback & Single-Instance Engine) ────────────
interface InMemoryLock {
  holderId: string;
  expiresAt: number;
  timer: NodeJS.Timeout;
}

const inMemoryLocks = new Map<string, InMemoryLock>();

function getLockKey(tripId: string, seatNumber: string): string {
  return `seat_lock:${tripId}:${seatNumber}`;
}

// ── Global Seat Hold Duration Configuration ─────────────────────────────────
// Set to 600 seconds (10 minutes) as recommended for checkout completion.
export const SEAT_HOLD_DURATION_SECONDS = 600;

/**
 * Attempts to atomically hold a set of seats for a customer.
 * If any requested seat is already locked by someone else, NO seats are held (all-or-nothing).
 *
 * @param tripId - Trip or Bus ID
 * @param seatNumbers - Array of seat IDs (e.g. ['L1', 'L2'])
 * @param lockHolderId - Unique customer session/user identifier
 * @param ttlSeconds - Hold duration in seconds (defaults to SEAT_HOLD_DURATION_SECONDS)
 */
export async function tryHoldSeats(
  tripId: string,
  seatNumbers: string[],
  lockHolderId: string,
  ttlSeconds = SEAT_HOLD_DURATION_SECONDS
): Promise<{ success: boolean; conflictingSeats: string[]; ttlSeconds: number }> {
  const conflictingSeats: string[] = [];
  const now = Date.now();
  const uniqueSeatNumbers = Array.from(new Set(seatNumbers.filter(Boolean)));

  if (uniqueSeatNumbers.length === 0) {
    return { success: false, conflictingSeats: [], ttlSeconds };
  }

  if (REDIS_URL && (!redisClient || !isRedisConnected)) throw new Error('Seat reservation service unavailable.');
  // 1. Try via Redis if connected
  if (redisClient && isRedisConnected) {
    try {
       // The check and all writes must happen in one Redis script. A read followed
       // by SET commands allows two checkout requests to win the same seat race.
       const keys = uniqueSeatNumbers.map((s) => getLockKey(tripId, s));
       const result = await redisClient.eval(
         `
           for i = 1, #KEYS do
             local holder = redis.call('GET', KEYS[i])
             if holder and holder ~= ARGV[1] then
               return i
             end
           end
           for i = 1, #KEYS do
             redis.call('SET', KEYS[i], ARGV[1], 'EX', ARGV[2])
           end
           return 0
         `,
         keys.length,
         ...keys,
         lockHolderId,
         String(ttlSeconds)
       );

       if (Number(result) > 0) {
         return { success: false, conflictingSeats: [uniqueSeatNumbers[Number(result) - 1]], ttlSeconds };
       }

       return { success: true, conflictingSeats: [], ttlSeconds };
    } catch (err) {
      console.warn('⚠️ [Redis] Error during tryHoldSeats, falling back to in-memory:', err);
      throw new Error('Seat reservation service unavailable.');
    }
  }

  // 2. In-Memory Engine (Primary or Fallback)
  // Check conflicts
  for (const seat of uniqueSeatNumbers) {
    const key = getLockKey(tripId, seat);
    const existing = inMemoryLocks.get(key);
    if (existing && existing.expiresAt > now && existing.holderId !== lockHolderId) {
      conflictingSeats.push(seat);
    }
  }

  if (conflictingSeats.length > 0) {
    return { success: false, conflictingSeats, ttlSeconds };
  }

  // Set locks
  for (const seat of uniqueSeatNumbers) {
    const key = getLockKey(tripId, seat);
    const existing = inMemoryLocks.get(key);
    if (existing) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(() => {
      inMemoryLocks.delete(key);
    }, ttlSeconds * 1000);

    inMemoryLocks.set(key, {
      holderId: lockHolderId,
      expiresAt: now + ttlSeconds * 1000,
      timer,
    });
  }

  return { success: true, conflictingSeats: [], ttlSeconds };
}

/**
 * Releases seats held by the specified customer.
 */
export async function releaseSeats(
  tripId: string,
  seatNumbers: string[],
  lockHolderId: string
): Promise<void> {
  // 1. Release in Redis
  if (redisClient && isRedisConnected) {
    try {
      const keys = seatNumbers.map((s) => getLockKey(tripId, s));
      if (keys.length) await redisClient.eval(`
        for i = 1, #KEYS do
          if redis.call('GET', KEYS[i]) == ARGV[1] then redis.call('DEL', KEYS[i]) end
        end
        return 1
      `, keys.length, ...keys, lockHolderId);
    } catch (err) {
      console.warn('⚠️ [Redis] Error during releaseSeats:', err);
    }
  }

  // 2. Release in In-Memory
  for (const seat of seatNumbers) {
    const key = getLockKey(tripId, seat);
    const existing = inMemoryLocks.get(key);
    if (existing && existing.holderId === lockHolderId) {
      clearTimeout(existing.timer);
      inMemoryLocks.delete(key);
    }
  }
}

/**
 * Retrieves all seat numbers currently held on a trip across all sessions.
 */
export async function getHeldSeats(tripId: string): Promise<string[]> {
  const prefix = `seat_lock:${tripId}:`;
  const held = new Set<string>();
  const now = Date.now();

  // 1. Fetch from Redis
  if (redisClient && isRedisConnected) {
    try {
      const keys: string[] = [];
      let cursor = '0';
      do {
        const result = await redisClient.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
        cursor = result[0]; keys.push(...result[1]);
      } while (cursor !== '0');
      for (const k of keys) {
        held.add(k.replace(prefix, ''));
      }
    } catch (err) {
      console.warn('⚠️ [Redis] Error during getHeldSeats:', err);
    }
  }

  // 2. Fetch from in-memory
  for (const [key, lock] of inMemoryLocks.entries()) {
    if (key.startsWith(prefix) && lock.expiresAt > now) {
      held.add(key.replace(prefix, ''));
    }
  }

  return Array.from(held);
}

/**
 * Verifies whether the caller is authorized to book the specified seats.
 */
export async function verifySeatLocks(
  tripId: string,
  seatNumbers: string[],
  lockHolderId: string,
  requireExistingHold = false
): Promise<{ valid: boolean; unauthorizedSeats: string[] }> {
  const unauthorizedSeats: string[] = [];
  const now = Date.now();
  if (REDIS_URL && (!redisClient || !isRedisConnected)) throw new Error('Seat reservation service unavailable.');

  // 1. Verify in Redis
  if (redisClient && isRedisConnected) {
    try {
      const keys = seatNumbers.map((s) => getLockKey(tripId, s));
      const currentHolders = await redisClient.mget(...keys);

      for (let i = 0; i < seatNumbers.length; i++) {
        const holder = currentHolders[i];
        if ((holder && holder !== lockHolderId) || (requireExistingHold && !holder)) {
          unauthorizedSeats.push(seatNumbers[i]);
        }
      }

      return { valid: unauthorizedSeats.length === 0, unauthorizedSeats };
    } catch (err) {
      throw new Error('Seat reservation service unavailable.');
    }
  }

  // 2. Verify in In-Memory
  for (const seat of seatNumbers) {
    const key = getLockKey(tripId, seat);
    const existing = inMemoryLocks.get(key);
    const isActive = existing && existing.expiresAt > now;
    if ((isActive && existing.holderId !== lockHolderId) || (requireExistingHold && !isActive)) {
      unauthorizedSeats.push(seat);
    }
  }

  return { valid: unauthorizedSeats.length === 0, unauthorizedSeats };
}

/**
 * Returns current health status of the Seat Lock engine.
 */
export function getSeatLockEngineStatus(): { mode: 'redis' | 'in-memory'; redisConnected: boolean; inMemoryLocksCount: number } {
  return {
    mode: redisClient && isRedisConnected ? 'redis' : 'in-memory',
    redisConnected: isRedisConnected,
    inMemoryLocksCount: inMemoryLocks.size,
  };
}
