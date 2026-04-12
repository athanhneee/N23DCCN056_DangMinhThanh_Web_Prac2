const Redis = require("ioredis");

let redisClient;
let hasLoggedRedisDisabled = false;
let hasLoggedRedisConnectionError = false;

function getRedisUrl() {
  return process.env.REDIS_URL?.trim();
}

function getRedisClient() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    if (!hasLoggedRedisDisabled) {
      console.warn("[product-service] REDIS_URL is not configured. Product cache is disabled.");
      hasLoggedRedisDisabled = true;
    }

    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    redisClient.on("error", (error) => {
      if (error.message?.includes("ECONNREFUSED")) {
        if (hasLoggedRedisConnectionError) {
          return;
        }

        hasLoggedRedisConnectionError = true;
      }

      console.error("[product-service] Redis error:", error.message);
    });
  }

  return redisClient;
}

async function connectRedis() {
  const client = getRedisClient();

  if (!client) {
    return null;
  }

  if (client.status === "wait") {
    try {
      await client.connect();
      hasLoggedRedisConnectionError = false;
      console.log("[product-service] Redis connected.");
    } catch (error) {
      console.warn(`[product-service] Redis unavailable. Continuing without cache. ${error.message}`);
      return null;
    }
  }

  return client;
}

async function disconnectRedis() {
  if (!redisClient) {
    return;
  }

  await redisClient.quit().catch(() => redisClient.disconnect());
}

async function withRedis(operation, fallbackValue = null) {
  const client = await connectRedis();

  if (!client || !["connect", "ready"].includes(client.status)) {
    return fallbackValue;
  }

  try {
    return await operation(client);
  } catch (error) {
    console.warn(`[product-service] Redis operation failed. ${error.message}`);
    return fallbackValue;
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  withRedis,
};
