// Centralized Redis client with proper error handling and connection pooling

let redisClient: any = null;
let redisError = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

export async function getRedisClient() {
  if (redisError && connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    return null;
  }
  
  if (!redisClient) {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('Redis credentials not configured');
        redisError = true;
        return null;
      }
      
      connectionAttempts++;
      const { Redis } = await import('@upstash/redis');
      
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
        retry: {
          retries: 2,
          retryDelayOnFailure: 1000,
        },
      });
      
      // Test connection
      await redisClient.ping();
      console.log('Redis connected successfully');
      
    } catch (error) {
      console.error(`Redis connection failed (attempt ${connectionAttempts}):`, error);
      redisClient = null;
      
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        redisError = true;
        console.error('Redis permanently disabled after max attempts');
      }
      
      return null;
    }
  }
  
  return redisClient;
}

export async function setWithExpiry(key: string, value: string, expirySeconds: number): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;
  
  try {
    await client.setex(key, expirySeconds, value);
    return true;
  } catch (error) {
    console.error('Redis set failed:', error);
    return false;
  }
}

export async function get(key: string): Promise<string | null> {
  const client = await getRedisClient();
  if (!client) return null;
  
  try {
    return await Promise.race([
      client.get(key),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Redis timeout')), 2000)
      )
    ]);
  } catch (error) {
    console.error('Redis get failed:', error);
    return null;
  }
}

export async function del(key: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;
  
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete failed:', error);
    return false;
  }
}