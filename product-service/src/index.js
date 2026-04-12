require("dotenv").config();

const app = require("./app");
const prisma = require("./lib/prisma");
const { connectRedis, disconnectRedis } = require("./lib/redis");

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
const SERVICE_NAME = process.env.SERVICE_NAME || "product-service";

async function start() {
  await prisma.$connect();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`[${SERVICE_NAME}] listening on port ${PORT}`);
    console.log(`[${SERVICE_NAME}] Swagger docs: http://localhost:${PORT}/api-docs`);
  });
}

start().catch((error) => {
  console.error(`[${SERVICE_NAME}] startup failed`);
  console.error(error);
  process.exit(1);
});

async function shutdown() {
  await Promise.allSettled([prisma.$disconnect(), disconnectRedis()]);
}

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
