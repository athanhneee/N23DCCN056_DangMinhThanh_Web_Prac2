const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const orderRoutes = require("./routes/orderRoutes");
const swaggerSpec = require("./swagger/swagger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

function getDatabaseStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
}

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Order Service API Docs",
  }),
);

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME || "order-service",
    database: getDatabaseStatus(),
    uptime: process.uptime(),
  });
});

app.use("/api/orders", orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
