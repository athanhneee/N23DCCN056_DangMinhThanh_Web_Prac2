const path = require("node:path");
const swaggerJsdoc = require("swagger-jsdoc");
const port = process.env.PORT || "3002";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description:
        "API for creating and managing customer orders. Swagger includes Bearer token support for secured environments.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Paste the access token returned from auth-service login or refresh endpoints.",
        },
      },
      schemas: {
        ValidationError: {
          type: "object",
          properties: {
            field: { type: "string", example: "customerEmail" },
            message: { type: "string", example: "customerEmail must be a valid email." },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Internal server error." },
          },
        },
        ValidationErrorResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiError" },
            {
              type: "object",
              properties: {
                errors: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ValidationError" },
                },
              },
            },
          ],
        },
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
        CreateOrderItemInput: {
          type: "object",
          required: ["productId", "productName", "price", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            productName: { type: "string", example: "iPhone 15 Pro" },
            price: { type: "number", example: 2799 },
            quantity: { type: "integer", example: 2 },
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
              items: { $ref: "#/components/schemas/CreateOrderItemInput" },
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
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer", example: 12 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 2 },
          },
        },
        CreateOrderResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Order" },
          },
        },
        PaginatedOrdersResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Order" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },
        UpdateOrderStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
              example: "confirmed",
            },
          },
        },
        UpdateOrderStatusResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Order" },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Missing or invalid Bearer token.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                message: "Unauthorized.",
              },
            },
          },
        },
        ValidationFailed: {
          description: "Request validation failed.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
            },
          },
        },
        NotFoundError: {
          description: "Requested resource was not found.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                message: "Order not found for the provided id or orderCode.",
              },
            },
          },
        },
        ConflictError: {
          description: "Duplicate value detected.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                message: "Duplicate value detected.",
              },
            },
          },
        },
        InternalServerError: {
          description: "Unexpected server error.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                message: "Internal server error.",
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
