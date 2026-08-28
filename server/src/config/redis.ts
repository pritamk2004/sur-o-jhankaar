import Redis from 'ioredis';
import { config } from './env';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Do not spam reconnects if offline in local dev
    lazyConnect: true
  });

  redisClient.connect()
    .then(() => {
      isRedisAvailable = true;
      console.log('[Redis] Connected successfully');
    })
    .catch((err) => {
      isRedisAvailable = false;
      console.log('[Redis] Redis not available, using in-memory job processing fallback');
    });

  redisClient.on('error', () => {
    isRedisAvailable = false;
  });
} catch {
  isRedisAvailable = false;
}

export { redisClient, isRedisAvailable };
