require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    service: process.env.SERVICE_NAME,
    uptime: process.uptime()
  })
);

app.use("/api/auth", authRoutes);

app.use(errorHandler);

module.exports = app;
