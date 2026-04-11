const { body, validationResult } = require("express-validator");

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

const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required.")
    .isLength({ min: 2, max: 200 })
    .withMessage("name must be between 2 and 200 characters."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("price must be a non-negative number."),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("stock must be a non-negative integer."),
  body("categoryId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("categoryId must be a positive integer."),
  handleValidation,
];

module.exports = {
  productValidation,
};
