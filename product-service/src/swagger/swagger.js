const path = require("node:path");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.PORT || "3001";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Service API",
      version: "1.0.0",
      description: "API for managing products in the microservices shop.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local development",
      },
    ],
    components: {
      schemas: {
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Phones" },
            slug: { type: "string", example: "phones" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "iPhone 15 Pro" },
            slug: { type: "string", example: "iphone-15-pro" },
            description: { type: "string", example: "Flagship phone" },
            price: { type: "number", example: 2799 },
            stock: { type: "integer", example: 25 },
            imageUrl: { type: "string", example: "https://example.com/product.jpg" },
            isActive: { type: "boolean", example: true },
            categoryId: { type: "integer", example: 1 },
            category: { $ref: "#/components/schemas/Category" },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string", example: "iPhone 15 Pro" },
            slug: { type: "string", example: "iphone-15-pro" },
            description: { type: "string", example: "Flagship phone" },
            price: { type: "number", example: 2799 },
            stock: { type: "integer", example: 25 },
            imageUrl: { type: "string", example: "https://example.com/product.jpg" },
            isActive: { type: "boolean", example: true },
            categoryId: { type: "integer", example: 1 },
          },
        },
        PaginatedProducts: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Product" },
            },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer", example: 20 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                totalPages: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJsdoc(options);
