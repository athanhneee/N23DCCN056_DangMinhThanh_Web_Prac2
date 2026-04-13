const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : "*";

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    gateway: true,
    services: {
      product: Boolean(process.env.PRODUCT_SERVICE_URL),
      order: Boolean(process.env.ORDER_SERVICE_URL),
      auth: Boolean(process.env.AUTH_SERVICE_URL),
    },
  }),
);

function createMissingTargetHandler(serviceName, envName) {
  return (req, res) => {
    res.status(503).json({
      success: false,
      message: `${serviceName} is not configured.`,
      missingEnv: envName,
    });
  };
}

function registerProxy(route, serviceName, envName, target) {
  if (!target) {
    console.warn(`[gateway] ${envName} is missing. ${route} will return 503.`);
    app.use(route, createMissingTargetHandler(serviceName, envName));
    return;
  }

  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      proxyTimeout: 15000,
      on: {
        error: (err, req, res) => {
          console.error(`[gateway] ${serviceName} proxy error:`, err.message);
          res.status(503).json({
            success: false,
            message: `${serviceName} is unavailable.`,
          });
        },
      },
    }),
  );
}

registerProxy(
  "/api/products",
  "Product Service",
  "PRODUCT_SERVICE_URL",
  process.env.PRODUCT_SERVICE_URL,
);

registerProxy(
  "/api/orders",
  "Order Service",
  "ORDER_SERVICE_URL",
  process.env.ORDER_SERVICE_URL,
);

registerProxy(
  "/api/auth",
  "Auth Service",
  "AUTH_SERVICE_URL",
  process.env.AUTH_SERVICE_URL,
);

app.listen(PORT, () => {
  console.log(`[gateway] API Gateway running on port ${PORT}`);
});
