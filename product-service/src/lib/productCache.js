const { withRedis } = require("./redis");

const PRODUCTS_CACHE_PREFIX = "products:list:";
const DEFAULT_CACHE_TTL_SECONDS = 300;

function getProductsCacheTtl() {
  const parsedTtl = Number.parseInt(process.env.PRODUCTS_CACHE_TTL_SECONDS || "", 10);

  if (Number.isFinite(parsedTtl) && parsedTtl > 0) {
    return parsedTtl;
  }

  return DEFAULT_CACHE_TTL_SECONDS;
}

function buildProductsCacheKey(query) {
  const normalizedQuery = Object.keys(query || {})
    .sort()
    .reduce((result, key) => {
      result[key] = query[key];
      return result;
    }, {});

  return `${PRODUCTS_CACHE_PREFIX}${JSON.stringify(normalizedQuery)}`;
}

async function getCachedProducts(query) {
  const cacheKey = buildProductsCacheKey(query);
  const cachedValue = await withRedis((redis) => redis.get(cacheKey), null);

  if (!cachedValue) {
    return null;
  }

  try {
    return JSON.parse(cachedValue);
  } catch (error) {
    return null;
  }
}

async function setCachedProducts(query, payload) {
  const cacheKey = buildProductsCacheKey(query);
  const ttl = getProductsCacheTtl();

  await withRedis(
    (redis) => redis.set(cacheKey, JSON.stringify(payload), "EX", ttl),
    null,
  );
}

async function invalidateProductsCache() {
  await withRedis(async (redis) => {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        `${PRODUCTS_CACHE_PREFIX}*`,
        "COUNT",
        100,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  }, null);
}

module.exports = {
  getCachedProducts,
  invalidateProductsCache,
  setCachedProducts,
};
