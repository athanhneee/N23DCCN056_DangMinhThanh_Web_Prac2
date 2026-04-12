const swaggerJsdoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth Service API",
      version: "1.0.0",
      description: "JWT Authentication Service"
    },
    servers: [
      { url: "http://localhost:3003", description: "Auth Service - Local" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            fullName: { type: "string", example: "Nguyen Van A" },
            email: { type: "string", example: "a@example.com" },
            role: { type: "string", example: "CUSTOMER" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);
