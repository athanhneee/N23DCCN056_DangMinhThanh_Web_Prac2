const { body, param, query, validationResult } = require("express-validator");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
  "cancelled",
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    success: false,
    message: "Invalid request data.",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

const createOrderValidation = [
  body("customerId").isInt({ min: 1 }).withMessage("customerId must be a positive integer."),
  body("customerName").trim().notEmpty().withMessage("customerName is required."),
  body("customerEmail").isEmail().withMessage("customerEmail must be a valid email."),
  body("items").isArray({ min: 1 }).withMessage("items must contain at least one product."),
  body("items.*.productId").isInt({ min: 1 }).withMessage("productId must be a positive integer."),
  body("items.*.productName").trim().notEmpty().withMessage("productName is required."),
  body("items.*.price").isFloat({ min: 0 }).withMessage("price must be a non-negative number."),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("quantity must be at least 1."),
  body("shippingAddress").optional().isObject().withMessage("shippingAddress must be an object."),
  body("shippingAddress.street").optional().isString(),
  body("shippingAddress.city").optional().isString(),
  body("shippingAddress.district").optional().isString(),
  body("note").optional().isString(),
  handleValidation,
];

const getOrdersByCustomerValidation = [
  param("customerId").isInt({ min: 1 }).withMessage("customerId must be a positive integer."),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be at least 1."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100."),
  query("status").optional().isIn(ORDER_STATUSES).withMessage("status is invalid."),
  handleValidation,
];

const updateOrderStatusValidation = [
  param("id").trim().notEmpty().withMessage("id or orderCode is required."),
  body("status")
    .trim()
    .isIn(ORDER_STATUSES)
    .withMessage("status is invalid."),
  handleValidation,
];

module.exports = {
  createOrderValidation,
  getOrdersByCustomerValidation,
  updateOrderStatusValidation,
  ORDER_STATUSES,
};
