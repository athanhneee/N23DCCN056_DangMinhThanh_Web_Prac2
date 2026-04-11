require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./app");

const PORT = Number.parseInt(process.env.PORT || "3002", 10);
const SERVICE_NAME = process.env.SERVICE_NAME || "order-service";
const CONNECT_TIMEOUT_MS = Number.parseInt(
  process.env.MONGODB_CONNECT_TIMEOUT_MS || "10000",
  10,
);
const RETRY_INTERVAL_MS = Number.parseInt(
  process.env.MONGODB_RETRY_INTERVAL_MS || "15000",
  10,
);
let server;
let reconnectTimer;
let isShuttingDown = false;

function describeMongoTarget(uri) {
  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.slice(1) : "orders_db";
    return `${parsed.host}/${dbName}`;
  } catch (error) {
    return "MongoDB";
  }
}

function getMongoOptions(uri) {
  const options = {
    serverSelectionTimeoutMS: 5000,
  };

  try {
    const parsed = new URL(uri);

    if (!parsed.pathname || parsed.pathname === "/") {
      options.dbName = "orders_db";
    }
  } catch (error) {
    options.dbName = "orders_db";
  }

  return options;
}

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set.");
  }

  const target = describeMongoTarget(mongoUri);
  let timeoutId;

  try {
    console.log(`[${SERVICE_NAME}] Connecting to ${target}...`);

    await Promise.race([
      mongoose.connect(mongoUri, getMongoOptions(mongoUri)),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`MongoDB connection timed out after ${CONNECT_TIMEOUT_MS}ms.`));
        }, CONNECT_TIMEOUT_MS);
      }),
    ]);

    clearTimeout(timeoutId);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
    console.log(`[${SERVICE_NAME}] MongoDB connected to ${target}.`);
  } catch (error) {
    clearTimeout(timeoutId);
    mongoose.disconnect().catch(() => {});
    console.error(`[${SERVICE_NAME}] MongoDB connection failed: ${error.message}`);
    console.error(
      `[${SERVICE_NAME}] Check MONGODB_URI, Atlas IP access list, and database credentials.`,
    );
    throw error;
  }
}

function scheduleReconnect() {
  if (isShuttingDown || reconnectTimer || mongoose.connection.readyState === 1) {
    return;
  }

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = undefined;

    try {
      await connectToDatabase();
    } catch (error) {
      scheduleReconnect();
    }
  }, RETRY_INTERVAL_MS);

  console.log(
    `[${SERVICE_NAME}] Retrying MongoDB connection in ${RETRY_INTERVAL_MS}ms.`,
  );
}

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await connectToDatabase();
  } catch (error) {
    scheduleReconnect();
  }
}

async function shutdown(signal, exitCode = 0) {
  isShuttingDown = true;
  console.log(`[${SERVICE_NAME}] ${signal} received. Shutting down.`);

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }

  if (server) {
    await new Promise((resolve) => {
      server.close(() => resolve());
    });
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  process.exit(exitCode);
}

mongoose.connection.on("disconnected", () => {
  console.warn(`[${SERVICE_NAME}] MongoDB disconnected.`);
  scheduleReconnect();
});

mongoose.connection.on("error", (error) => {
  console.error(`[${SERVICE_NAME}] MongoDB error: ${error.message}`);
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (error) => {
  console.error(`[${SERVICE_NAME}] Unhandled rejection:`, error);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error(`[${SERVICE_NAME}] Uncaught exception:`, error);
  shutdown("uncaughtException", 1);
});

async function start() {
  server = app.listen(PORT, () => {
    console.log(`[${SERVICE_NAME}] listening on port ${PORT}.`);
    console.log(`[${SERVICE_NAME}] Swagger docs: http://localhost:${PORT}/api-docs`);
  });

  await ensureDatabaseConnection();
}

start().catch((error) => {
  console.error(`[${SERVICE_NAME}] Startup failed.`);
  console.error(error);
  process.exit(1);
});
