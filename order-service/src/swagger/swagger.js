const path = require("node:path");
const swaggerJsdoc = require("swagger-jsdoc");
const port = process.env.PORT || "3002";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "API for creating and managing customer orders.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development",
      },
    ],
    components: {
      schemas: {
        OrderItem: {
          type: "object",
          required: ["productId", "productName", "price", "quantity", "subtotal"],
          properties: {
            productId: { type: "integer", example: 1 },
            productName: { type: "string", example: "iPhone 15 Pro" },
            price: { type: "number", example: 2799 },
            quantity: { type: "integer", example: 2 },
            subtotal: { type: "number", example: 5598 },
          },
        },
        ShippingAddress: {
          type: "object",
          properties: {
            street: { type: "string", example: "123 Nguyen Trai" },
            city: { type: "string", example: "Ho Chi Minh City" },
            district: { type: "string", example: "District 1" },
          },
        },
        CreateOrderRequest: {
          type: "object",
          required: ["customerId", "customerName", "customerEmail", "items"],
          properties: {
            customerId: { type: "integer", example: 1001 },
            customerName: { type: "string", example: "Nguyen Van A" },
            customerEmail: { type: "string", example: "customer@example.com" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "productName", "price", "quantity"],
                properties: {
                  productId: { type: "integer", example: 1 },
                  productName: { type: "string", example: "iPhone 15 Pro" },
                  price: { type: "number", example: 2799 },
                  quantity: { type: "integer", example: 2 },
                },
              },
            },
            shippingAddress: {
              $ref: "#/components/schemas/ShippingAddress",
            },
            note: { type: "string", example: "Call before delivery." },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "67f7d7360bc4d6b840c4c745" },
            orderCode: { type: "string", example: "ORD-20260411-0001" },
            customerId: { type: "integer", example: 1001 },
            customerName: { type: "string", example: "Nguyen Van A" },
            customerEmail: { type: "string", example: "customer@example.com" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number", example: 5598 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
            },
            shippingAddress: {
              $ref: "#/components/schemas/ShippingAddress",
            },
            note: { type: "string", example: "Call before delivery." },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJsdoc(options);
