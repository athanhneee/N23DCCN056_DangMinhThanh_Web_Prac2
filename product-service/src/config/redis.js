const Redis = require("ioredis");

let redis = null;

if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false
    });

    redis.on("error", (error) => {
        console.error("Redis error:", error.message);
    });
}

const getCache = async (key) => {
    try {
        if (!redis) return null;
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error("Redis GET error:", error.message);
        return null;
    }
};

const setCache = async (key, data, ttl = 300) => {
    try {
        if (!redis) return;
        await redis.set(key, JSON.stringify(data), "EX", ttl);
    } catch (error) {
        console.error("Redis SET error:", error.message);
    }
};

const clearByPattern = async (pattern) => {
    try {
        if (!redis) return;

        let cursor = "0";
        do {
            const [nextCursor, keys] = await redis.scan(
                cursor,
                "MATCH",
                pattern,
                "COUNT",
                100
            );

            cursor = nextCursor;

            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== "0");
    } catch (error) {
        console.error("Redis DEL error:", error.message);
    }
};

module.exports = {
    redis,
    getCache,
    setCache,
    clearByPattern
};
